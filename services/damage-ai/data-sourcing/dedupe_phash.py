#!/usr/bin/env python3
"""Perceptual-hash dedupe across merged image folders.

Public car-damage datasets recycle each other's images; duplicates that land
on both sides of a train/val split silently inflate mAP. Run this on the
merged labeled folder BEFORE train/prepare_dataset.py.

Requires:  pip install imagehash Pillow

Usage:
    python dedupe_phash.py --src ./merged --threshold 6
      # duplicates (and their .txt labels) move to ./merged-duplicates/
      # when a dupe pair has one labeled + one unlabeled copy, the labeled one is kept
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--src", required=True)
    ap.add_argument("--threshold", type=int, default=6,
                    help="max hamming distance to call two images duplicates (default 6)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    try:
        import imagehash
        from PIL import Image
    except ImportError:
        raise SystemExit("pip install imagehash Pillow")

    src = Path(args.src)
    dup_dir = src.parent / (src.name + "-duplicates")
    images = sorted(p for p in src.rglob("*") if p.suffix.lower() in IMAGE_EXTS)
    print(f"hashing {len(images)} images…")

    hashes: list[tuple[Path, object]] = []
    for p in images:
        try:
            hashes.append((p, imagehash.phash(Image.open(p))))
        except Exception as e:  # noqa: BLE001 — unreadable file, skip it
            print(f"  ! {p.name}: {e}")

    def has_label(p: Path) -> bool:
        return p.with_suffix(".txt").exists()

    to_move: set[Path] = set()
    kept: list[tuple[Path, object]] = []
    for p, h in hashes:
        dupe_of = None
        for kp, kh in kept:
            if h - kh <= args.threshold:
                dupe_of = kp
                break
        if dupe_of is None:
            kept.append((p, h))
        elif has_label(p) and not has_label(dupe_of):
            # incoming copy is labeled, kept copy isn't — swap them
            kept[[k for k, _ in kept].index(dupe_of)] = (p, h)
            to_move.add(dupe_of)
        else:
            to_move.add(p)

    print(f"duplicates: {len(to_move)} / {len(hashes)}")
    if args.dry_run:
        for p in sorted(to_move):
            print(f"  would move {p.name}")
        return 0
    if to_move:
        dup_dir.mkdir(exist_ok=True)
        for p in to_move:
            shutil.move(str(p), dup_dir / p.name)
            lbl = p.with_suffix(".txt")
            if lbl.exists():
                shutil.move(str(lbl), dup_dir / lbl.name)
        print(f"moved to {dup_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
