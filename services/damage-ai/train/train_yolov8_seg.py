#!/usr/bin/env python3
"""Fine-tune a YOLO-seg model on CarDD (instance segmentation, 6 classes).

Requires the training extra:  pip install ultralytics pycocotools

Default base is yolo11n-seg.pt (current stable, recommended). The same script
trains any ultralytics seg checkpoint — pass --weights yolov8s-seg.pt or a
newer yolo26-seg.pt to change architecture without touching service code.

Prereqs:
  1. Download CarDD manually (research-only license) — see train/README.md.
  2. python train/prepare_cardd.py --cardd-root /path/to/CarDD_release
  3. python train/train_yolov8_seg.py            # ~20 min on a Colab T4 (nano)

Tuned defaults (good starting point on CarDD):
  epochs 100 · imgsz 640 · batch 16 · base yolo11n-seg · cos_lr · mosaic on
Bump to yolo11s/m-seg + imgsz 1024 for higher mAP if you have the GPU budget.

The best checkpoint is copied to models/damage-seg.pt, which the service loads
when MODEL_MODE=live.
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--data", default=str(ROOT / "train" / "dataset.yaml"))
    p.add_argument("--weights", default="yolo11n-seg.pt", help="base seg weights to fine-tune")
    p.add_argument("--epochs", type=int, default=100)
    p.add_argument("--imgsz", type=int, default=640)
    p.add_argument("--batch", type=int, default=16)
    p.add_argument("--device", default=None, help="cuda id, 'cpu', or None for auto")
    p.add_argument("--out", default=str(ROOT / "models" / "damage-seg.pt"))
    return p.parse_args()


def main() -> int:
    args = parse_args()
    try:
        from ultralytics import YOLO
    except ImportError:
        print("ultralytics not installed. Run: pip install ultralytics", file=sys.stderr)
        return 1
    if not Path(args.data).exists():
        print(f"Dataset config not found: {args.data}", file=sys.stderr)
        return 1
    data_root = ROOT / "data" / "cardd" / "images" / "train"
    if not data_root.exists():
        print(
            "data/cardd/ is empty. Run prepare_cardd.py first "
            "(CarDD is a manual, research-only download — see train/README.md).",
            file=sys.stderr,
        )
        return 1

    model = YOLO(args.weights)  # task inferred as 'segment' from the -seg weights
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        cos_lr=True,
        patience=20,
        project=str(ROOT / "train" / "runs"),
        name="damage-seg",
        exist_ok=True,
    )
    best = Path(results.save_dir) / "weights" / "best.pt"
    if not best.exists():
        print(f"Training finished but {best} not found.", file=sys.stderr)
        return 1
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(best, args.out)
    print(f"Copied best checkpoint -> {args.out}")
    print("Evaluate: yolo segment val model=%s data=%s" % (args.out, args.data))
    print("Serve   : MODEL_MODE=live uvicorn app.main:app --port 8100")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
