"""DamageEstimator abstraction — the swappable model boundary.

`MockEstimator` and `YoloSegEstimator` both produce the same list of raw
damages `[{type, part, area_ratio, confidence}, ...]`; `assemble_estimate`
turns that into the public /estimate response (severity buckets, per-damage
pricing, aggregate range, mean-confidence %). Swapping the model never touches
the pricing/response code or the app.

Live mode loads a fine-tuned YOLO-seg checkpoint via ultralytics. The same
`YOLO(...)` class loads YOLOv8-seg / YOLO11-seg / YOLO26-seg, so upgrading the
architecture is a weights swap (set WEIGHTS_PATH / YOLO_BASE) — no code change.
"""
from __future__ import annotations

import hashlib
import logging
from typing import List, Optional

from PIL import Image

from . import config
from .mock_engine import mock_damages
from .pricing import (
    aggregate,
    default_part_for,
    normalize_damage_type,
    price_range,
    pricing_version,
    severity_bucket,
    severity_from_area,
)

logger = logging.getLogger("damage-ai")

# CarDD class index → our damage_type (must match train/dataset.yaml order).
CARDD_CLASSES = {
    0: "dent",
    1: "scratch",
    2: "crack",
    3: "glass shatter",
    4: "lamp broken",
    5: "tire flat",
}


def _estimate_id(damages: List[dict]) -> str:
    h = hashlib.sha256()
    for d in damages:
        h.update(f"{d['part']}|{d['type']}|{round(d['area_ratio'], 3)}".encode("utf-8"))
    return "est_" + h.hexdigest()[:16]


def assemble_estimate(raw_damages: List[dict], model_mode: str) -> dict:
    """Raw damages → the public EstimateResponse dict (the /estimate contract)."""
    damages = []
    ranges = []
    confidences = []
    for d in raw_damages:
        dtype = normalize_damage_type(d["type"])
        part = d.get("part") or default_part_for(dtype)
        area = max(0.0, min(1.0, float(d.get("area_ratio", 0.0))))
        conf = max(0.0, min(1.0, float(d.get("confidence", 0.0))))
        score = severity_from_area(area, dtype)
        bucket = severity_bucket(score)
        ranges.append(price_range(part, dtype, bucket))
        confidences.append(conf)
        damages.append(
            {
                "type": dtype,
                "part": part,
                "severity": bucket,
                "confidence": round(conf, 2),
                "area_ratio": round(area, 3),
            }
        )

    price_low, price_high = aggregate(ranges)
    confidence_pct = int(round(100 * sum(confidences) / len(confidences))) if confidences else 0
    return {
        "estimate_id": _estimate_id(damages),
        "damages": damages,
        "price_low": price_low,
        "price_high": price_high,
        "confidence_pct": confidence_pct,
        "model_version": config.MODEL_VERSION,
        "pricing_version": pricing_version(),
        "model_mode": model_mode,
    }


class DamageEstimator:
    """Base interface. `estimate` returns the public response dict."""

    mode = "base"
    loaded = False

    def estimate(
        self,
        images: List[Image.Image],
        image_blobs: List[bytes],
        part: Optional[str],
        vehicle: Optional[dict],
        parts_hint: Optional[List[dict]],
    ) -> dict:  # pragma: no cover - interface
        raise NotImplementedError


class MockEstimator(DamageEstimator):
    mode = "mock"
    loaded = True

    def estimate(self, images, image_blobs, part, vehicle, parts_hint):
        raw = mock_damages(image_blobs, part, parts_hint)
        return assemble_estimate(raw, self.mode)


def merge_detections(detections: List[dict], part: Optional[str]) -> List[dict]:
    """No declared parts: group raw detections by (part, type), keeping the
    strongest (largest area) so one damage shot from N angles isn't priced N
    times. Part comes from the request hint, else the per-class default."""
    merged: dict = {}
    for d in detections:
        dtype = d["type"]
        dpart = part or default_part_for(dtype)
        key = (dpart, dtype)
        if key not in merged or d["area_ratio"] > merged[key]["area_ratio"]:
            merged[key] = {"type": dtype, "part": dpart, "area_ratio": d["area_ratio"], "confidence": d["confidence"]}
    return list(merged.values())


def anchor_to_declared(detections: List[dict], parts_hint: List[dict]) -> List[dict]:
    """Trust the human's part + type (from the app's car-diagram selection) and
    use the model only to MEASURE severity (mask area) + confidence. More
    accurate than model classification and needs no part-segmentation model.

    Per declared damage: severity = largest matching-class mask area (fall back
    to the largest mask of any class), confidence = mean of the pooled
    detections. If the model saw nothing, keep the human's damage at minor
    severity with a flagged lower confidence rather than dropping it.
    """
    raw = []
    for p in parts_hint:
        dtype = normalize_damage_type(p.get("type") or "dent")
        dpart = p.get("part") or default_part_for(dtype)
        matching = [d for d in detections if d["type"] == dtype]
        pool = matching or detections
        area = max((d["area_ratio"] for d in pool), default=0.0)
        conf = (sum(d["confidence"] for d in pool) / len(pool)) if pool else config.DECLARED_NO_DETECTION_CONFIDENCE
        raw.append({"type": dtype, "part": dpart, "area_ratio": area, "confidence": round(conf, 2)})
    return raw


class YoloSegEstimator(DamageEstimator):
    """Live YOLO-seg inference. Masks → damaged-area ratio → severity → price.

    `WEIGHTS_PATH` may be a .pt, .onnx, or .engine (TensorRT) file — ultralytics
    loads all three through the same class, so export for speed without code
    changes (see train/export_model.py).
    """

    mode = "live"

    def __init__(self):
        from ultralytics import YOLO  # heavy import, only in live mode

        if not config.WEIGHTS_PATH.exists():
            raise FileNotFoundError(f"weights not found: {config.WEIGHTS_PATH}")
        self._model = YOLO(str(config.WEIGHTS_PATH))
        self.loaded = True
        logger.info("Loaded YOLO-seg weights from %s", config.WEIGHTS_PATH)

    def _detect(self, images) -> List[dict]:
        """Run the model over every photo → flat list of {type, area_ratio, confidence}."""
        detections: List[dict] = []
        for img in images:
            results = self._model.predict(
                img, conf=config.CONF_THRESHOLD, imgsz=config.IMG_SIZE, half=config.HALF, verbose=False
            )
            for r in results:
                if r.masks is None or r.boxes is None or len(r.boxes) == 0:
                    continue
                confs = r.boxes.conf.tolist()
                clss = [int(c) for c in r.boxes.cls.tolist()]
                mask_areas = r.masks.data.sum(dim=(1, 2)).tolist()
                mh, mw = r.masks.data.shape[1], r.masks.data.shape[2]
                mask_px = float(mh * mw) or 1.0
                for i, cls_idx in enumerate(clss):
                    detections.append(
                        {
                            "type": CARDD_CLASSES.get(cls_idx, "dent"),
                            "area_ratio": max(0.0, min(1.0, float(mask_areas[i]) / mask_px)),
                            "confidence": confs[i],
                        }
                    )
        return detections

    def estimate(self, images, image_blobs, part, vehicle, parts_hint):
        detections = self._detect(images)
        if parts_hint:
            # Most accurate path: anchor part/type to the user's selection.
            raw = anchor_to_declared(detections, parts_hint)
        else:
            # No human labels (e.g. server per-part call): pure detection.
            raw = merge_detections(detections, part)
        return assemble_estimate(raw, self.mode)


_estimator: Optional[DamageEstimator] = None


def get_estimator() -> DamageEstimator:
    """Build (once) the estimator for the active MODEL_MODE, with mock fallback."""
    global _estimator
    if _estimator is not None:
        return _estimator
    if config.MODEL_MODE == "live":
        try:
            _estimator = YoloSegEstimator()
        except Exception as err:  # ImportError, missing weights, etc.
            logger.warning("MODEL_MODE=live failed (%s) — falling back to mock", err)
            _estimator = MockEstimator()
    else:
        _estimator = MockEstimator()
    return _estimator
