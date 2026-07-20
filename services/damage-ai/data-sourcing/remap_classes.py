#!/usr/bin/env python3
"""Remap class ids in YOLO-seg label files from a downloaded dataset's schema
to ours (0:dent 1:scratch 2:crack 3:paint), dropping classes we don't train.

Each Tier-1 dataset in SOURCES.md ships its own class order — check its
`data.yaml` and write a mapping like "0:0,1:1,2:2,3:3,4:-1" (source:target,
-1 drops the instance). Images whose labels end up empty are moved to
`negatives/` (still useful!) rather than deleted.

Usage:
    python remap_classes.py --src ./downloads/car-damages-kaggle \
        --map "0:-1,1:-1,2:2,3:0,4:-1,5:-1,6:3,7:1" --out ../data/raw/rf-aiproyect
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def parse_map(spec: str) -> dict[int, int]:
    out = {}
    for pair in spec.split(","):
        k, v = pair.split(":")
        out[int(k)] = int(v)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--src", required=True, help="folder with images + YOLO-seg .txt labels (searched recursively)")
    ap.add_argument("--map", required=True, help="source:target pairs, -1 drops (e.g. '0:1,1:0,2:-1')")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    mapping = parse_map(args.map)
    src, out = Path(args.src), Path(args.out)
    keep_dir = out / "labeled"
    neg_dir = out / "negatives"
    keep_dir.mkdir(parents=True, exist_ok=True)
    neg_dir.mkdir(parents=True, exist_ok=True)

    images = [p for p in src.rglob("*") if p.suffix.lower() in IMAGE_EXTS]
    n_keep = n_neg = n_inst = 0
    for img in images:
        lbl = img.with_suffix(".txt")
        if not lbl.exists():
            # Roboflow exports keep labels in a sibling labels/ dir
            alt = img.parent.parent / "labels" / (img.stem + ".txt")
            lbl = alt if alt.exists() else None
        rows_out = []
        if lbl:
            for raw in lbl.read_text().splitlines():
                parts = raw.split()
                if len(parts) < 7:
                    continue
                tgt = mapping.get(int(parts[0]), -1)
                if tgt >= 0:
                    rows_out.append(" ".join([str(tgt)] + parts[1:]))
                    n_inst += 1
        if rows_out:
            shutil.copy2(img, keep_dir / img.name)
            (keep_dir / (img.stem + ".txt")).write_text("\n".join(rows_out) + "\n")
            n_keep += 1
        else:
            shutil.copy2(img, neg_dir / img.name)
            n_neg += 1

    print(f"labeled: {n_keep} imgs / {n_inst} instances · negatives: {n_neg}")
    print(f"next: python ../train/prepare_dataset.py --src {keep_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
