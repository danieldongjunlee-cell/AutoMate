#!/usr/bin/env python3
"""Export the fine-tuned YOLO-seg checkpoint for fast serving.

ONNX runs anywhere (CPU/GPU) via onnxruntime; TensorRT is fastest on NVIDIA
GPUs. The service loads .pt directly today; point WEIGHTS_PATH at the exported
file once you wire an ONNX/TensorRT runner.

Usage:
  python train/export_model.py --format onnx      # models/damage-seg.onnx
  python train/export_model.py --format engine    # TensorRT (.engine, GPU only)
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--weights", default=str(ROOT / "models" / "damage-seg.pt"))
    p.add_argument("--format", default="onnx", choices=["onnx", "engine", "torchscript"])
    p.add_argument("--imgsz", type=int, default=640)
    p.add_argument("--half", action="store_true", help="FP16 (smaller/faster on GPU)")
    args = p.parse_args()

    try:
        from ultralytics import YOLO
    except ImportError:
        print("ultralytics not installed. Run: pip install ultralytics", file=sys.stderr)
        return 1
    if not Path(args.weights).exists():
        print(f"Weights not found: {args.weights} (train first).", file=sys.stderr)
        return 1

    model = YOLO(args.weights)
    out = model.export(format=args.format, imgsz=args.imgsz, half=args.half)
    print(f"Exported -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
