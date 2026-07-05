"""AutoMate damage-AI service (FastAPI).

Endpoints
  GET  /health          — liveness + model/pricing versions + loaded flag
  POST /estimate        — images[] (+ optional part, vehicle) -> repair estimate
  POST /receipt         — receipt image/PDF -> extracted fields
  POST /insurance-card  — insurance card image -> policy fields

Modes (env, see app/config.py)
  MODEL_MODE   mock (default) | live   — damage estimator (YOLO-seg in live)
  RECEIPT_MODE mock (default) | ocr    — receipt / card extractor (PaddleOCR)

In `mock` mode the whole app runs end-to-end with no model or GPU. Flipping to
`live` is a drop-in once fine-tuned weights exist at WEIGHTS_PATH — no app
changes. Every heavy import is guarded; a missing dep/weights logs a warning
and degrades to the deterministic mock so the service never crashes.

Run:  uvicorn app.main:app --port 8100
"""
from __future__ import annotations

import io
import json
import logging
from typing import List, Optional

from fastapi import FastAPI, File, Form, UploadFile
from PIL import Image

from . import config
from .inference import get_estimator
from .mock_engine import mock_insurance_card, mock_receipt
from .pricing import load_pricing, pricing_version
from .schemas import EstimateResponse, HealthResponse

logger = logging.getLogger("damage-ai")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="AutoMate damage-AI", version="0.2.0")


# ── /estimate ─────────────────────────────────────────────────────────────


@app.post("/estimate", response_model=EstimateResponse)
async def estimate(
    images: List[UploadFile] = File(default=[]),
    part: Optional[str] = Form(default=None),
    make: Optional[str] = Form(default=None),
    model: Optional[str] = Form(default=None),
    year: Optional[str] = Form(default=None),
    # The user's selected damages: a JSON array like
    # [{"part":"rear bumper","type":"dent"}]. Live mode anchors part/type to
    # this; mock mode echoes it.
    parts: Optional[str] = Form(default=None),
    # Optional per-photo part labels, aligned with `images` order, so live mode
    # measures each part's severity from its own photos. Repeat the field once
    # per image (e.g. image_parts=rear bumper&image_parts=door).
    image_parts: List[str] = Form(default=[]),
):
    blobs: List[bytes] = []
    pil_images: List[Image.Image] = []
    for up in images:
        blob = await up.read()
        if not blob:
            continue
        blobs.append(blob)
        try:
            pil_images.append(Image.open(io.BytesIO(blob)).convert("RGB"))
        except Exception:
            logger.warning("Skipping undecodable image %r", up.filename)

    parts_hint = None
    if parts:
        try:
            parsed = json.loads(parts)
            if isinstance(parsed, list):
                parts_hint = [p for p in parsed if isinstance(p, dict)]
        except json.JSONDecodeError:
            logger.warning("Ignoring unparseable parts hint")

    vehicle = {"make": make, "model": model, "year": year} if (make or model or year) else None
    estimator = get_estimator()
    return estimator.estimate(
        pil_images, blobs, part, vehicle, parts_hint, image_parts or None
    )


# ── /health ───────────────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse)
def health():
    estimator = get_estimator()
    return {
        "ok": True,
        "service": "damage-ai",
        "model_mode": estimator.mode,
        "model_loaded": estimator.loaded,
        "model_version": config.MODEL_VERSION,
        "pricing_version": pricing_version(),
        "pricing_market": load_pricing().get("market"),
        "receipt_mode": config.RECEIPT_MODE,
    }


# ── /receipt + /insurance-card (OCR; mock by default) ──────────────────────

_ocr_engine = None
_ocr_failed = False


def _get_ocr():
    global _ocr_engine, _ocr_failed
    if _ocr_engine is not None or _ocr_failed:
        return _ocr_engine
    try:
        from paddleocr import PaddleOCR  # guarded heavy import
    except ImportError:
        logger.warning("RECEIPT_MODE=ocr but paddleocr is not installed — falling back to mock")
        _ocr_failed = True
        return None
    _ocr_engine = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    return _ocr_engine


def _ocr_receipt(blob: bytes) -> Optional[dict]:
    import re

    engine = _get_ocr()
    if engine is None:
        return None
    result = engine.ocr(blob, cls=True)
    lines = [w[1][0] for page in (result or []) for w in (page or [])]
    if not lines:
        return None
    text = "\n".join(lines)
    money = re.compile(r"\$?\s*(\d{1,4}(?:[.,]\d{2}))\b")
    amounts = [float(m.group(1).replace(",", ".")) for m in money.finditer(text)]
    date_m = re.search(
        r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|[A-Z][a-z]{2,8}\.? \d{1,2},? \d{4})\b", text
    )
    service_keywords = ("oil", "tire", "brake", "filter", "rotation", "inspection", "alignment")
    service_line = next((ln for ln in lines if any(k in ln.lower() for k in service_keywords)), "")
    mileage_m = re.search(r"\b\d{1,3},?\d{3}\s*mi\b", text)
    return {
        "vendor": lines[0].strip(),
        "date": date_m.group(0) if date_m else "",
        "service_type": service_line.strip(),
        "line_items": [
            {"desc": ln.strip(), "amount": float(m.group(1).replace(",", "."))}
            for ln in lines
            if (m := money.search(ln))
        ],
        "total": max(amounts) if amounts else 0.0,
        "mileage": mileage_m.group(0) if mileage_m else "",
        "model_mode": "ocr",
    }


_KNOWN_CARRIERS = (
    "State Farm", "Geico", "Progressive", "Allstate", "USAA",
    "Liberty Mutual", "Nationwide", "Farmers", "Travelers", "Erie",
)


def _ocr_insurance_card(blob: bytes) -> Optional[dict]:
    import re

    engine = _get_ocr()
    if engine is None:
        return None
    result = engine.ocr(blob, cls=True)
    lines = [w[1][0] for page in (result or []) for w in (page or [])]
    if not lines:
        return None
    text = "\n".join(lines)
    carrier = next((c for c in _KNOWN_CARRIERS if c.lower() in text.lower()), lines[0].strip())
    policy_m = re.search(r"\b[A-Z]{1,4}-?\d{5,12}\b", text)
    ded_m = re.search(r"deductible\D{0,12}\$?\s*([\d,]+)", text, re.IGNORECASE)
    prem_m = re.search(r"premium\D{0,12}\$?\s*([\d,]+)", text, re.IGNORECASE)
    date_m = re.search(
        r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|[A-Z][a-z]{2,8}\.? \d{1,2},? \d{4})\b", text
    )
    coverage = "Comprehensive + Collision" if "comprehensive" in text.lower() else "Liability"
    return {
        "provider": carrier,
        "policy_number": policy_m.group(0) if policy_m else "",
        "deductible": int(ded_m.group(1).replace(",", "")) if ded_m else 500,
        "premium_per_year": int(prem_m.group(1).replace(",", "")) if prem_m else 0,
        "coverage_type": coverage,
        "renewal_date": date_m.group(0) if date_m else "",
        "model_mode": "ocr",
    }


@app.post("/receipt")
async def receipt(file: UploadFile = File(...)):
    blob = await file.read()
    if config.RECEIPT_MODE == "ocr" and not (file.content_type or "").endswith("pdf"):
        try:
            result = _ocr_receipt(blob)
            if result is not None:
                return result
        except Exception:
            logger.exception("OCR pipeline failed — falling back to mock")
    return mock_receipt(blob)


@app.post("/insurance-card")
async def insurance_card(file: UploadFile = File(...)):
    blob = await file.read()
    if config.RECEIPT_MODE == "ocr" and not (file.content_type or "").endswith("pdf"):
        try:
            result = _ocr_insurance_card(blob)
            if result is not None:
                return result
        except Exception:
            logger.exception("Card OCR failed — falling back to mock")
    return mock_insurance_card(blob)
