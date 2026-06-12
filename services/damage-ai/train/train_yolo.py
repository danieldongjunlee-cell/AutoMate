#!/usr/bin/env python3
"""Fine-tune YOLOv8 on car-damage photos (dent / scratch / crack / paint).

Requires the optional extra:  pip install ultralytics

Dataset layout (see train/README.md for sourcing — e.g. CarDD, research-only):
  data/damage/{dent,scratch,crack,paint}/   raw images sorted by class
  train/dataset.yaml                        YOLO dataset config (template here)

Usage:
  python train/train_yolo.py --data train/dataset.yaml --epochs 50 --imgsz 640
  python train/train_yolo.py --weights yolov8s.pt --batch 8

The best checkpoint is copied to models/damage.pt, which app/main.py picks up
when MODEL_MODE=yolo.
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--data", default=str(ROOT / "train" / "dataset.yaml"), help="dataset yaml")
    p.add_argument("--weights", default="yolov8n.pt", help="base weights to fine-tune from")
    p.add_argument("--epochs", type=int, default=50)
    p.add_argument("--imgsz", type=int, default=640)
    p.add_argument("--batch", type=int, default=16)
    p.add_argument("--device", default=None, help="cuda device id, 'cpu', or None for auto")
    p.add_argument("--out", default=str(ROOT / "models" / "damage.pt"), help="where to copy best.pt")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    try:
        from ultralytics import YOLO
    except ImportError:
        print("ultralytics is not installed. Run: pip install ultralytics", file=sys.stderr)
        return 1
    if not Path(args.data).exists():
        print(f"Dataset config not found: {args.data}\n"
              "Copy train/dataset.yaml, point it at your labelled data "
              "(see train/README.md), then re-run.", file=sys.stderr)
        return 1

    model = YOLO(args.weights)
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        project=str(ROOT / "train" / "runs"),
        name="damage",
        exist_ok=True,
    )
    best = Path(results.save_dir) / "weights" / "best.pt"
    if best.exists():
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(best, args.out)
        print(f"Copied best checkpoint -> {args.out}")
        print("Serve it with: MODEL_MODE=yolo uvicorn app.main:app --port 8100")
    else:
        print(f"Training finished but {best} was not found.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
