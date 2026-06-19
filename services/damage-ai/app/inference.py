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


class YoloSegEstimator(DamageEstimator):
    """Live YOLO-seg inference. Masks → damaged-area ratio → severity → price."""

    mode = "live"

    def __init__(self):
        from ultralytics import YOLO  # heavy import, only in live mode

        if not config.WEIGHTS_PATH.exists():
            raise FileNotFoundError(f"weights not found: {config.WEIGHTS_PATH}")
        self._model = YOLO(str(config.WEIGHTS_PATH))
        self.loaded = True
        logger.info("Loaded YOLO-seg weights from %s", config.WEIGHTS_PATH)

    def estimate(self, images, image_blobs, part, vehicle, parts_hint):
        # Collect detections across all photos, then merge by (part, type) keeping
        # the strongest instance so the same damage shot from N angles isn't
        # priced N times.
        merged: dict = {}
        for img in images:
            results = self._model.predict(img, conf=config.CONF_THRESHOLD, verbose=False)
            for r in results:
                if r.masks is None or r.boxes is None or len(r.boxes) == 0:
                    continue
                img_area = float(r.orig_shape[0] * r.orig_shape[1]) or 1.0
                confs = r.boxes.conf.tolist()
                clss = [int(c) for c in r.boxes.cls.tolist()]
                # mask.data: (N, H, W) — pixel count per instance / image area.
                mask_areas = r.masks.data.sum(dim=(1, 2)).tolist()
                mh, mw = r.masks.data.shape[1], r.masks.data.shape[2]
                mask_px = float(mh * mw) or img_area
                for i, cls_idx in enumerate(clss):
                    dtype = CARDD_CLASSES.get(cls_idx, "dent")
                    area_ratio = max(0.0, min(1.0, float(mask_areas[i]) / mask_px))
                    dpart = part or default_part_for(dtype)
                    key = (dpart, dtype)
                    cand = {"type": dtype, "part": dpart, "area_ratio": area_ratio, "confidence": confs[i]}
                    if key not in merged or area_ratio > merged[key]["area_ratio"]:
                        merged[key] = cand
        raw = list(merged.values())
        if not raw:
            # Nothing detected — return an honest empty/low-confidence estimate
            # rather than inventing damage.
            return assemble_estimate([], self.mode)
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
