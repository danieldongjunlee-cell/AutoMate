"""AutoMate damage-AI service (FastAPI).

Endpoints
  GET  /health    — liveness + active model modes
  POST /estimate  — multipart images[] + part + damage_type -> repair estimate
  POST /receipt   — receipt image/PDF -> extracted fields

Modes (env)
  MODEL_MODE   mock (default) | yolo  — damage estimator
  RECEIPT_MODE mock (default) | ocr   — receipt extractor

"yolo" loads ultralytics YOLOv8 weights from models/damage.pt; "ocr" uses
PaddleOCR. Both imports are guarded: missing deps or weights log a warning
and fall back to the deterministic mock so the service never crashes.

Run:  uvicorn app.main:app --port 8100
"""
from __future__ import annotations

import io
import logging
import os
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, Form, UploadFile
from PIL import Image

from .mock_engine import mock_estimate, mock_receipt
from .pricing import load_pricing, normalize_damage_type, price_range, severity_bucket

logger = logging.getLogger("damage-ai")
logging.basicConfig(level=logging.INFO)

MODEL_MODE = os.environ.get("MODEL_MODE", "mock").strip().lower()
RECEIPT_MODE = os.environ.get("RECEIPT_MODE", "mock").strip().lower()
WEIGHTS_PATH = Path(__file__).resolve().parent.parent / "models" / "damage.pt"

app = FastAPI(title="AutoMate damage-AI", version="0.1.0")


# ── YOLO damage estimator (optional) ────────────────────────────────────

_yolo_model = None
_yolo_failed = False


def _get_yolo():
    """Lazy-load YOLOv8 weights; returns None (mock fallback) on any failure."""
    global _yolo_model, _yolo_failed
    if _yolo_model is not None or _yolo_failed:
        return _yolo_model
    try:
        from ultralytics import YOLO  # guarded heavy import
    except ImportError:
        logger.warning("MODEL_MODE=yolo but ultralytics is not installed — falling back to mock")
        _yolo_failed = True
        return None
    if not WEIGHTS_PATH.exists():
        logger.warning("MODEL_MODE=yolo but %s is missing — falling back to mock", WEIGHTS_PATH)
        _yolo_failed = True
        return None
    _yolo_model = YOLO(str(WEIGHTS_PATH))
    logger.info("Loaded YOLOv8 weights from %s", WEIGHTS_PATH)
    return _yolo_model


def _yolo_estimate(part: str, damage_type: str, images: list[Image.Image]) -> Optional[dict]:
    model = _get_yolo()
    if model is None or not images:
        return None
    # Severity: strongest detection's (box area ratio x confidence), averaged
    # over the photo set. Crude but monotonic; refine after fine-tuning.
    best_conf, severity_acc = 0.0, 0.0
    for img in images:
        results = model.predict(img, verbose=False)
        for r in results:
            if r.boxes is None or len(r.boxes) == 0:
                continue
            areas = (r.boxes.xywhn[:, 2] * r.boxes.xywhn[:, 3]).tolist()
            confs = r.boxes.conf.tolist()
            idx = max(range(len(confs)), key=lambda i: confs[i])
            best_conf = max(best_conf, confs[idx])
            severity_acc += min(1.0, areas[idx] * 4) * confs[idx]
    if best_conf == 0.0:
        return None  # nothing detected — let the mock answer
    severity = round(min(1.0, severity_acc / len(images)), 2)
    bucket = severity_bucket(severity)
    low, high = price_range(part, damage_type, bucket)
    return {
        "part": part,
        "damage_type": normalize_damage_type(damage_type),
        "severity": severity,
        "severity_label": bucket,
        "price_low": low,
        "price_high": high,
        "confidence_pct": int(round(best_conf * 100)),
        "model_mode": "yolo",
    }


# ── PaddleOCR receipt extractor (optional) ──────────────────────────────

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
    """Heuristic field extraction over OCR lines. Donut is the upgrade path
    for end-to-end extraction (see train/README.md)."""
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
    service_line = next(
        (ln for ln in lines if any(k in ln.lower() for k in service_keywords)), ""
    )
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


# ── Routes ───────────────────────────────────────────────────────────────


@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "damage-ai",
        "model_mode": MODEL_MODE,
        "receipt_mode": RECEIPT_MODE,
        "pricing_market": load_pricing().get("market"),
    }


@app.post("/estimate")
async def estimate(
    part: str = Form(...),
    damage_type: str = Form(...),
    images: List[UploadFile] = File(default=[]),
):
    blobs: list[bytes] = []
    pil_images: list[Image.Image] = []
    for up in images:
        blob = await up.read()
        if not blob:
            continue
        blobs.append(blob)
        try:
            pil_images.append(Image.open(io.BytesIO(blob)).convert("RGB"))
        except Exception:
            logger.warning("Skipping undecodable image %r", up.filename)

    if MODEL_MODE == "yolo":
        result = _yolo_estimate(part, damage_type, pil_images)
        if result is not None:
            return result
    return mock_estimate(part, damage_type, blobs)


@app.post("/receipt")
async def receipt(file: UploadFile = File(...)):
    blob = await file.read()
    if RECEIPT_MODE == "ocr" and not (file.content_type or "").endswith("pdf"):
        try:
            result = _ocr_receipt(blob)
            if result is not None:
                return result
        except Exception:
            logger.exception("OCR pipeline failed — falling back to mock")
    return mock_receipt(blob)
