#!/usr/bin/env python3
"""Convert Supervisely-format annotations (img/ + ann/ folders, one JSON per
image) into our YOLO-seg layout. This is the format the Humans in the Loop
"Car Parts and Car Damages" dataset ships in.

Each ann/<image>.json looks like:
    {"size": {"height": H, "width": W},
     "objects": [{"classTitle": "Dent", "geometryType": "polygon",
                  "points": {"exterior": [[x, y], ...], "interior": [...]}}]}

Both geometry types Supervisely uses are supported:
  - polygon: points taken directly
  - bitmap: base64+zlib PNG mask decoded and traced to polygons
            (requires: pip install opencv-python-headless numpy)

The summary always prints every classTitle and geometryType encountered, so
if zero images come out labeled you can see exactly why.

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
import base64
import json
import shutil
import zlib
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


def bitmap_to_polys(obj: dict, w: int, h: int) -> list[list[float]]:
    """Decode a Supervisely bitmap mask and trace it into polygon(s) in image px."""
    try:
        import cv2
        import numpy as np
    except ImportError:
        raise SystemExit("bitmap annotations found — install decoders first:\n"
                         "  pip install opencv-python-headless numpy")
    bm = obj.get("bitmap") or {}
    data = bm.get("data")
    if not data:
        return []
    raw = base64.b64decode(data)
    try:
        raw = zlib.decompress(raw)
    except zlib.error:
        pass  # some exports store plain PNG without zlib
    arr = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_UNCHANGED)
    if arr is None:
        return []
    mask = (arr[..., -1] if arr.ndim == 3 else arr) > 0
    ox, oy = (bm.get("origin") or [0, 0])[:2]
    contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL,
                                   cv2.CHAIN_APPROX_SIMPLE)
    polys: list[list[float]] = []
    for c in contours:
        if cv2.contourArea(c) < 20:  # ignore speck contours
            continue
        eps = 0.004 * cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, eps, True).reshape(-1, 2)
        if len(approx) < 3:
            continue
        flat: list[float] = []
        for x, y in approx:
            flat += [float(x) + ox, float(y) + oy]
        polys.append(flat)
    return polys


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
    seen_titles: Counter = Counter()
    seen_geoms: Counter = Counter()
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
            geom = obj.get("geometryType") or "?"
            seen_titles[obj.get("classTitle") or "?"] += 1
            seen_geoms[geom] += 1
            if title in PART_CLASSES:
                parts_ignored += 1
                continue
            tgt = mapping.get(title)
            if tgt is None:
                dropped[obj.get("classTitle") or "?"] += 1
                continue
            if not w or not h:
                skipped_geom += 1
                continue
            if geom == "polygon":
                ext = (obj.get("points") or {}).get("exterior") or []
                polys = [[float(v) for xy in ext for v in xy]] if len(ext) >= 3 else []
            elif geom == "bitmap":
                polys = bitmap_to_polys(obj, w, h)
            else:
                skipped_geom += 1
                continue
            for flat in polys:
                norm: list[str] = []
                for i, v in enumerate(flat):
                    norm.append(f"{min(1.0, max(0.0, v / (w if i % 2 == 0 else h))):.6f}")
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
    print("geometry types seen: " + (", ".join(f"{k}={v}" for k, v in seen_geoms.most_common()) or "none"))
    print("all classTitles seen: " + (", ".join(f"{k}={v}" for k, v in seen_titles.most_common()) or "none"))
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
