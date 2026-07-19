#!/usr/bin/env python3
"""Convert Supervisely-format annotations (img/ + ann/ folders, one JSON per
image) into our YOLO-seg layout. This is the format the Humans in the Loop
"Car Parts and Car Damages" dataset ships in.

Each ann/<image>.json looks like:
    {"size": {"height": H, "width": W},
     "objects": [{"classTitle": "Dent", "geometryType": "polygon",
                  "points": {"exterior": [[x, y], ...], "interior": [...]}}]}

Class handling:
    Dent → 0 · Scratch → 1 · Cracked → 2 · Flaking / Paint chip → 3
    car-part classes (Hood, Fender, …) → ignored (parts, not damage)
    Broken part / Missing part / Corrosion → dropped (override with
        --extra-map "corrosion:3,broken part:-1" if you want them kept)

Output: --out/labeled/ (image + .txt for prepare_dataset.py)
        --out/negatives/ (images whose objects were all parts/dropped)

Usage:
    python convert_supervisely.py --src /path/to/Data --out ./data/raw/hitl
    # explicit folders:
    python convert_supervisely.py --img /path/Data/img --ann /path/Data/ann --out ./data/raw/hitl
"""
from __future__ import annotations

import argparse
import json
import shutil
from collections import Counter
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

DAMAGE_MAP = {
    "dent": 0,
    "scratch": 1,
    "cracked": 2, "crack": 2,
    "flaking": 3, "paint chip": 3, "paint-chip": 3, "paint_chip": 3,
}
PART_CLASSES = {
    "windshield", "back-windshield", "front-window", "back-window", "front-door",
    "back-door", "front-wheel", "back-wheel", "front-bumper", "back-bumper",
    "headlight", "tail-light", "hood", "trunk", "license-plate", "mirror",
    "roof", "grille", "rocker-panel", "quarter-panel", "fender",
}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--src", help="root containing img/ and ann/")
    ap.add_argument("--img", help="images folder (overrides --src/img)")
    ap.add_argument("--ann", help="annotations folder (overrides --src/ann)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--extra-map", default="", help="'classtitle:target,...' ; -1 drops")
    args = ap.parse_args()

    src = Path(args.src).expanduser() if args.src else None
    img_dir = Path(args.img).expanduser() if args.img else (src / "img" if src else None)
    ann_dir = Path(args.ann).expanduser() if args.ann else (src / "ann" if src else None)
    if not img_dir or not ann_dir or not ann_dir.exists():
        raise SystemExit("need --src with img/ and ann/ inside, or explicit --img/--ann")

    mapping = dict(DAMAGE_MAP)
    if args.extra_map:
        for pair in args.extra_map.split(","):
            k, v = pair.rsplit(":", 1)
            t = int(v)
            if t >= 0:
                mapping[k.strip().lower()] = t
            else:
                mapping.pop(k.strip().lower(), None)

    # index images (ann files are named "<image name>.json", image name keeps its ext)
    img_index: dict[str, Path] = {}
    for p in img_dir.rglob("*"):
        if p.suffix.lower() in IMAGE_EXTS:
            img_index[p.name] = p

    out = Path(args.out).expanduser()
    lab_dir, neg_dir = out / "labeled", out / "negatives"
    lab_dir.mkdir(parents=True, exist_ok=True)
    neg_dir.mkdir(parents=True, exist_ok=True)

    kept = Counter()
    dropped: Counter = Counter()
    parts_ignored = 0
    skipped_geom = 0
    n_lab = n_neg = n_missing = n_badjson = 0

    ann_files = sorted(ann_dir.rglob("*.json"))
    print(f"annotation files: {len(ann_files)} · images indexed: {len(img_index)}")
    for ann_path in ann_files:
        img_name = ann_path.name[:-5]  # strip ".json"
        src_img = img_index.get(img_name)
        if src_img is None:
            # some exports drop the image extension in the ann name
            cands = [n for n in img_index if Path(n).stem == Path(img_name).stem]
            src_img = img_index.get(cands[0]) if cands else None
            img_name = cands[0] if cands else img_name
        if src_img is None:
            n_missing += 1
            continue
        try:
            data = json.loads(ann_path.read_text())
        except Exception:  # noqa: BLE001
            n_badjson += 1
            continue
        h = (data.get("size") or {}).get("height") or 0
        w = (data.get("size") or {}).get("width") or 0
        rows: list[str] = []
        for obj in data.get("objects", []):
            title = (obj.get("classTitle") or "").strip().lower()
            if title in PART_CLASSES:
                parts_ignored += 1
                continue
            tgt = mapping.get(title)
            if tgt is None:
                dropped[obj.get("classTitle") or "?"] += 1
                continue
            if obj.get("geometryType") != "polygon" or not w or not h:
                skipped_geom += 1
                continue
            ext = (obj.get("points") or {}).get("exterior") or []
            if len(ext) < 3:
                continue
            norm: list[str] = []
            for x, y in ext:
                norm.append(f"{min(1.0, max(0.0, x / w)):.6f}")
                norm.append(f"{min(1.0, max(0.0, y / h)):.6f}")
            rows.append(f"{tgt} " + " ".join(norm))
            kept[tgt] += 1
        if rows:
            shutil.copy2(src_img, lab_dir / img_name)
            (lab_dir / (Path(img_name).stem + ".txt")).write_text("\n".join(rows) + "\n")
            n_lab += 1
        else:
            shutil.copy2(src_img, neg_dir / img_name)
            n_neg += 1

    names = {0: "dent", 1: "scratch", 2: "crack", 3: "paint"}
    print("\n── summary ─────────────────────────────")
    print(f"labeled images: {n_lab}   negatives: {n_neg}   "
          f"missing images: {n_missing}   unreadable json: {n_badjson}")
    print("instances kept: " + (", ".join(f"{names[k]}={v}" for k, v in sorted(kept.items())) or "none"))
    print(f"car-part annotations ignored: {parts_ignored}")
    if skipped_geom:
        print(f"non-polygon geometries skipped: {skipped_geom}")
    if dropped:
        print("dropped damage classes (use --extra-map to keep any):")
        for name, n in dropped.most_common():
            print(f"  {name}: {n}")
    print(f"\nnext: python ../train/prepare_dataset.py --src {lab_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
