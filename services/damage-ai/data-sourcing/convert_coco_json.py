#!/usr/bin/env python3
"""Convert COCO-style JSON polygon annotations into our YOLO-seg layout.

Handles the common case for downloaded datasets (e.g. Humans in the Loop
"Car Parts and Car Damages", Kaggle COCO exports): one or more *.json files
with {"images", "annotations", "categories"}, images stored anywhere under
the same root. Class mapping is done by CATEGORY NAME with keyword rules, so
you don't need to derive per-dataset id maps:

    dent → 0 · scratch → 1 · crack → 2 · paint/chip/flak/peel → 3
    anything else → dropped (reported at the end so you can extend rules)

Output: --out/labeled/  (image + matching .txt, ready for prepare_dataset.py)
        --out/negatives/ (referenced images whose annotations all got dropped)

Usage:
    python convert_coco_json.py --src /path/to/Data --out ./data/raw/bootstrap
    # extend mapping: --extra-map "glass shatter:-1,corrosion:3"
"""
from __future__ import annotations

import argparse
import json
import shutil
from collections import Counter, defaultdict
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
KEYWORD_RULES: list[tuple[tuple[str, ...], int]] = [
    (("dent",), 0),
    (("scratch", "scrach"), 1),          # common typo in public sets
    (("crack", "shatter"), 2),
    (("paint", "chip", "flak", "peel"), 3),
]


def map_name(name: str, extra: dict[str, int]) -> int | None:
    n = name.strip().lower()
    if n in extra:
        return extra[n] if extra[n] >= 0 else None
    for keys, tgt in KEYWORD_RULES:
        if any(k in n for k in keys):
            return tgt
    return None


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--src", required=True, help="root folder with *.json + images (searched recursively)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--extra-map", default="", help="'name:target,...' overrides; target -1 drops")
    args = ap.parse_args()

    src, out = Path(args.src).expanduser(), Path(args.out).expanduser()
    extra = {}
    if args.extra_map:
        for pair in args.extra_map.split(","):
            k, v = pair.rsplit(":", 1)
            extra[k.strip().lower()] = int(v)

    # index every image file under src by basename
    img_index: dict[str, Path] = {}
    for p in src.rglob("*"):
        if p.suffix.lower() in IMAGE_EXTS:
            img_index.setdefault(p.name, p)
    jsons = sorted(src.rglob("*.json"))
    if not jsons:
        raise SystemExit(f"no .json files found under {src}")
    print(f"found {len(jsons)} json file(s), {len(img_index)} image file(s)")

    rows_by_image: dict[str, list[str]] = defaultdict(list)
    referenced: set[str] = set()
    kept = Counter()
    dropped: Counter = Counter()
    missing_imgs: set[str] = set()
    skipped_rle = 0

    for jp in jsons:
        try:
            data = json.loads(jp.read_text())
        except Exception as e:  # noqa: BLE001
            print(f"  ! {jp.name}: unreadable json ({e})")
            continue
        if not (isinstance(data, dict) and "annotations" in data and "images" in data):
            print(f"  ! {jp.name}: not COCO-style (top-level keys: {list(data)[:6] if isinstance(data, dict) else type(data).__name__}) — skipped")
            continue
        imgs = {im["id"]: im for im in data.get("images", [])}
        cats = {c["id"]: c.get("name", str(c["id"])) for c in data.get("categories", [])}
        print(f"  {jp.relative_to(src)}: {len(imgs)} images, {len(data['annotations'])} annotations, "
              f"classes={sorted(set(cats.values()))}")
        for ann in data["annotations"]:
            im = imgs.get(ann.get("image_id"))
            if im is None:
                continue
            fname = Path(im.get("file_name", "")).name
            referenced.add(fname)
            name = cats.get(ann.get("category_id"), "?")
            tgt = map_name(name, extra)
            if tgt is None:
                dropped[name] += 1
                continue
            seg = ann.get("segmentation")
            if isinstance(seg, dict):
                skipped_rle += 1
                continue
            if not seg:
                continue
            w, h = im.get("width") or 0, im.get("height") or 0
            if not w or not h:
                continue
            for poly in seg:
                if len(poly) < 6:
                    continue
                norm = []
                for i, v in enumerate(poly):
                    norm.append(min(1.0, max(0.0, v / (w if i % 2 == 0 else h))))
                rows_by_image[fname].append(str(tgt) + " " + " ".join(f"{v:.6f}" for v in norm))
                kept[tgt] += 1

    lab_dir, neg_dir = out / "labeled", out / "negatives"
    lab_dir.mkdir(parents=True, exist_ok=True)
    neg_dir.mkdir(parents=True, exist_ok=True)
    n_lab = n_neg = 0
    for fname in sorted(referenced):
        src_img = img_index.get(fname)
        if src_img is None:
            missing_imgs.add(fname)
            continue
        rows = rows_by_image.get(fname)
        if rows:
            shutil.copy2(src_img, lab_dir / fname)
            (lab_dir / (Path(fname).stem + ".txt")).write_text("\n".join(rows) + "\n")
            n_lab += 1
        else:
            shutil.copy2(src_img, neg_dir / fname)
            n_neg += 1

    names = {0: "dent", 1: "scratch", 2: "crack", 3: "paint"}
    print("\n── summary ─────────────────────────────")
    print(f"labeled images: {n_lab}   negatives: {n_neg}   missing image files: {len(missing_imgs)}")
    print("instances kept: " + ", ".join(f"{names[k]}={v}" for k, v in sorted(kept.items())))
    if skipped_rle:
        print(f"RLE masks skipped (unsupported): {skipped_rle}")
    if dropped:
        print("dropped categories (extend --extra-map if any should be kept):")
        for name, n in dropped.most_common():
            print(f"  {name}: {n}")
    print(f"\nnext: python ../train/prepare_dataset.py --src {lab_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
