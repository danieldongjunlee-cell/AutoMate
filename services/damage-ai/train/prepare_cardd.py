#!/usr/bin/env python3
"""Prepare the CarDD dataset for YOLO-seg training.

CarDD ships COCO-style instance masks. This converts them to the YOLO-seg
polygon format under data/cardd/ that train_yolov8_seg.py expects.

IMPORTANT — CarDD is NOT auto-downloaded here. It is gated behind a license
form (non-commercial research/education; agree to Flickr/Shutterstock terms) at
https://cardd-ustc.github.io. Download it manually, unzip it, then point this
script at the COCO annotation JSONs + image folders.

Expected CarDD layout after manual download (names vary by release):
  <CARDD_ROOT>/
    CarDD_COCO/
      annotations/instances_train2017.json
      annotations/instances_val2017.json
      train2017/  val2017/   (images)

Usage:
  python train/prepare_cardd.py --cardd-root /path/to/CarDD_release

Output (YOLO-seg):
  data/cardd/images/{train,val}/*.jpg
  data/cardd/labels/{train,val}/*.txt
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "cardd"

# CarDD category name (lowercased) → our class index (matches dataset.yaml).
CARDD_NAME_TO_IDX = {
    "dent": 0,
    "scratch": 1,
    "crack": 2,
    "glass shatter": 3,
    "lamp broken": 4,
    "tire flat": 5,
}


def _seg_to_yolo(seg, w: float, h: float) -> str | None:
    """COCO polygon segmentation → normalized 'x1 y1 ... xn yn' (first polygon)."""
    if not seg or not isinstance(seg, list):
        return None  # RLE masks unsupported here; CarDD uses polygons
    poly = seg[0] if isinstance(seg[0], list) else seg
    if len(poly) < 6:
        return None
    coords = []
    for i in range(0, len(poly) - 1, 2):
        coords.append(f"{max(0.0, min(1.0, poly[i] / w)):.6f}")
        coords.append(f"{max(0.0, min(1.0, poly[i + 1] / h)):.6f}")
    return " ".join(coords)


def convert_split(ann_path: Path, img_dir: Path, split: str) -> int:
    with open(ann_path, "r", encoding="utf-8") as fh:
        coco = json.load(fh)

    cat_idx = {}
    for c in coco["categories"]:
        idx = CARDD_NAME_TO_IDX.get(c["name"].strip().lower())
        if idx is not None:
            cat_idx[c["id"]] = idx

    images = {im["id"]: im for im in coco["images"]}
    anns_by_img: dict[int, list] = {}
    for a in coco["annotations"]:
        anns_by_img.setdefault(a["image_id"], []).append(a)

    (OUT / "images" / split).mkdir(parents=True, exist_ok=True)
    (OUT / "labels" / split).mkdir(parents=True, exist_ok=True)

    written = 0
    for img_id, im in images.items():
        rows = []
        for a in anns_by_img.get(img_id, []):
            cls = cat_idx.get(a["category_id"])
            if cls is None:
                continue
            poly = _seg_to_yolo(a.get("segmentation"), im["width"], im["height"])
            if poly:
                rows.append(f"{cls} {poly}")
        if not rows:
            continue
        src_img = img_dir / im["file_name"]
        if not src_img.exists():
            continue
        shutil.copy2(src_img, OUT / "images" / split / im["file_name"])
        label = (OUT / "labels" / split / im["file_name"]).with_suffix(".txt")
        label.write_text("\n".join(rows), encoding="utf-8")
        written += 1
    return written


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--cardd-root", required=True, help="path to the unzipped CarDD release")
    p.add_argument("--coco-subdir", default="CarDD_COCO", help="COCO subfolder name")
    args = p.parse_args()

    root = Path(args.cardd_root) / args.coco_subdir
    ann = root / "annotations"
    pairs = [
        (ann / "instances_train2017.json", root / "train2017", "train"),
        (ann / "instances_val2017.json", root / "val2017", "val"),
    ]
    total = 0
    for ann_path, img_dir, split in pairs:
        if not ann_path.exists():
            print(f"!! missing {ann_path} — check --cardd-root / release layout", file=sys.stderr)
            continue
        n = convert_split(ann_path, img_dir, split)
        print(f"{split}: wrote {n} labelled images")
        total += n
    if total == 0:
        print("Nothing converted. Verify the CarDD download path.", file=sys.stderr)
        return 1
    print(f"Done → {OUT}. Train with: python train/train_yolov8_seg.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
