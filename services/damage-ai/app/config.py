"""Environment-driven service configuration.

All knobs are env vars so the same image runs in mock or live mode unchanged.
"""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Damage estimator mode:
#   mock  — deterministic fake response, no model/GPU (default; app works today)
#   live  — load fine-tuned YOLO-seg weights and run real inference
MODEL_MODE = os.environ.get("MODEL_MODE", "mock").strip().lower()

# Receipt/insurance-card OCR mode (orthogonal to MODEL_MODE):
#   mock — canonical demo fields   |   ocr — PaddleOCR + heuristics
RECEIPT_MODE = os.environ.get("RECEIPT_MODE", "mock").strip().lower()

# Fine-tuned weights for live mode. Swap the file (or YOLO_BASE for a fresh
# train) to move between YOLOv8-seg / YOLO11-seg / YOLO26-seg — the loader uses
# the same ultralytics `YOLO` class, so app code never changes.
WEIGHTS_PATH = Path(os.environ.get("WEIGHTS_PATH", str(ROOT / "models" / "damage-seg.pt")))

# Base architecture used by the training scaffold (kept here for /health + docs).
YOLO_BASE = os.environ.get("YOLO_BASE", "yolo11n-seg.pt")

# Reported on /health and stored with every estimate. Bump when weights change.
MODEL_VERSION = os.environ.get(
    "MODEL_VERSION",
    "mock-1" if MODEL_MODE == "mock" else f"{Path(YOLO_BASE).stem}-cardd-v1",
)

# Detections below this confidence are ignored in live mode.
CONF_THRESHOLD = float(os.environ.get("CONF_THRESHOLD", "0.25"))
