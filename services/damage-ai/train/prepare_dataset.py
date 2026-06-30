#!/usr/bin/env python3
"""Prepare YOUR OWN labeled damage images into the YOLO-seg layout the trainer
expects. Use this instead of prepare_cardd.py when you've annotated your own
photos (Label Studio / CVAT / Roboflow — all export "YOLOv8 segmentation").

Input: a folder with images and a matching `<name>.txt` per image, each row:
    cls x1 y1 x2 y2 ... xn yn        # class id + normalized polygon (0..1)
where cls ∈ {0:dent, 1:scratch, 2:crack, 3:paint}  (must match dataset.yaml).

Output (under services/damage-ai/data/cardd/, which dataset.yaml points at):
    images/{train,val}/*.jpg
    labels/{train,val}/*.txt

Usage:
    python train/prepare_dataset.py --src /path/to/labeled --val-frac 0.15
    python train/prepare_dataset.py --src /path/to/labeled --classes 4 --seed 7

It validates that every label's class id is in range and that polygons are
normalized, splits deterministically (seeded hash — stable across re-runs so
val never leaks into train), and prints a per-class instance count so you can
spot class imbalance before training.
"""
from __future__ import annotations

import argparse
import hashlib
import shutil
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "cardd"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--src", required=True, help="folder of images + matching .txt YOLO-seg labels")
    p.add_argument("--classes", type=int, default=4, help="number of classes (default 4)")
    p.add_argument("--val-frac", type=float, default=0.15, help="fraction held out for val")
    p.add_argument("--seed", type=int, default=42, help="split seed (stable val set)")
    p.add_argument("--copy", action="store_true", help="copy files (default) instead of symlink")
    return p.parse_args()


def is_val(stem: str, val_frac: float, seed: int) -> bool:
    # Deterministic per-image hash → stable train/val membership across runs.
    h = hashlib.sha256(f"{seed}:{stem}".encode()).digest()
    return (int.from_bytes(h[:4], "big") % 10_000) / 10_000 < val_frac


def validate_label(txt: Path, n_classes: int) -> list[int]:
    """Return the list of class ids in this label file; raise on malformed rows."""
    ids: list[int] = []
    for ln, raw in enumerate(txt.read_text().splitlines(), 1):
        row = raw.split()
        if not row:
            continue
        if len(row) < 7 or len(row) % 2 == 0:
            raise ValueError(f"{txt}:{ln}: need `cls` + ≥3 (x,y) pairs, got {len(row)} values")
        cls = int(float(row[0]))
        if not 0 <= cls < n_classes:
            raise ValueError(f"{txt}:{ln}: class id {cls} out of range 0..{n_classes - 1}")
        coords = [float(v) for v in row[1:]]
        if any(c < 0 or c > 1 for c in coords):
            raise ValueError(f"{txt}:{ln}: polygon not normalized (coords must be 0..1)")
        ids.append(cls)
    return ids


def main() -> int:
    args = parse_args()
    src = Path(args.src).expanduser().resolve()
    if not src.is_dir():
        print(f"--src not a folder: {src}", file=sys.stderr)
        return 1

    images = [p for p in src.rglob("*") if p.suffix.lower() in IMAGE_EXTS]
    if not images:
        print(f"No images found under {src}", file=sys.stderr)
        return 1

    for sub in ("images/train", "images/val", "labels/train", "labels/val"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)

    counts: Counter[int] = Counter()
    split_counts = {"train": 0, "val": 0}
    skipped = 0
    for img in images:
        label = img.with_suffix(".txt")
        if not label.exists():
            skipped += 1
            continue
        try:
            ids = validate_label(label, args.classes)
        except ValueError as e:
            print(f"✖ {e}", file=sys.stderr)
            return 1
        counts.update(ids)
        split = "val" if is_val(img.stem, args.val_frac, args.seed) else "train"
        split_counts[split] += 1
        for dst_dir, srcfile in ((OUT / "images" / split, img), (OUT / "labels" / split, label)):
            dst = dst_dir / srcfile.name
            if dst.exists() or dst.is_symlink():
                dst.unlink()
            if args.copy:
                shutil.copy2(srcfile, dst)
            else:
                dst.symlink_to(srcfile)

    names = {0: "dent", 1: "scratch", 2: "crack", 3: "paint"}
    print(f"Prepared {split_counts['train']} train / {split_counts['val']} val images → {OUT}")
    if skipped:
        print(f"  (skipped {skipped} image(s) with no matching .txt label)")
    print("Per-class instances:")
    for cid in range(args.classes):
        print(f"  {cid} {names.get(cid, '?'):<8} {counts.get(cid, 0)}")
    imbalance = max(counts.values(), default=0) / max(min(counts.values(), default=1), 1)
    if imbalance > 4:
        print(f"⚠ class imbalance ~{imbalance:.0f}× — oversample/copy-paste-augment the rare classes.")
    print("\nNext: python train/train_yolov8_seg.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
