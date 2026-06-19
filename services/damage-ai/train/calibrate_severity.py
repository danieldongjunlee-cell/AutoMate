#!/usr/bin/env python3
"""Calibrate area→severity weights from real repair data.

The pricing pipeline is:
    severity_score = clamp(area_ratio × severity_weights[type], 0, 1)
    bucket         = severity_buckets(severity_score)        # minor/moderate/severe
    price          = pricing.parts[part][type][bucket]       # your rate card

The price table is your body-shop rate card (you set it). What's worth fitting
to data is **how aggressively damaged-area maps to severity per damage type** —
`severity_weights` in config/pricing.yaml. This script grid-searches each type's
weight to minimize the error between the predicted bucket's price (midpoint) and
the ACTUAL price you were quoted, then prints a report and (optionally) writes
the fitted weights back.

CSV columns (header row required):
    part, type, actual_price, and one of:
      area_ratio   — the model's measured damaged-area fraction (preferred), OR
      image        — path to the photo (requires --weights to run the model)

Usage:
    # dry-run report from precomputed area_ratio:
    python train/calibrate_severity.py --csv train/calibration_sample.csv
    # compute area_ratio from photos with your weights, then write the fit:
    python train/calibrate_severity.py --csv data/quotes.csv --weights models/damage-seg.pt --apply

Reminder: after --apply, bump `pricing_version` in config/pricing.yaml so stored
estimates record the calibrated table.
"""
from __future__ import annotations

import argparse
import csv
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))  # make `app` importable when run as a script

from app.pricing import (  # noqa: E402
    CONFIG_PATH,
    normalize_damage_type,
    price_range,
    severity_bucket,
    severity_weight,
)


def predicted_midpoint(area_ratio: float, dtype: str, part: str, weight: float) -> float:
    """Predicted price (bucket midpoint) for a given area × candidate weight."""
    score = max(0.0, min(1.0, area_ratio * weight))
    low, high = price_range(part, dtype, severity_bucket(score))
    return (low + high) / 2.0


def _mae(rows: List[dict], weight: float) -> float:
    errs = [abs(predicted_midpoint(r["area_ratio"], r["type"], r["part"], weight) - r["actual_price"]) for r in rows]
    return sum(errs) / len(errs) if errs else 0.0


def weight_grid(lo: float, hi: float, step: float) -> List[float]:
    n = int(round((hi - lo) / step))
    return [round(lo + i * step, 3) for i in range(n + 1)]


def fit_weights(rows: List[dict], grid: List[float]) -> Dict[str, dict]:
    """Per damage type, pick the weight minimizing price MAE. Returns, per type:
    {weight, mae, baseline_weight, baseline_mae, n}."""
    by_type: Dict[str, List[dict]] = {}
    for r in rows:
        by_type.setdefault(r["type"], []).append(r)

    out: Dict[str, dict] = {}
    for dtype, trows in by_type.items():
        baseline_w = severity_weight(dtype)
        baseline_mae = _mae(trows, baseline_w)
        best_w, best_mae = baseline_w, baseline_mae
        for w in grid:
            m = _mae(trows, w)
            if m < best_mae:
                best_w, best_mae = w, m
        out[dtype] = {
            "weight": best_w,
            "mae": round(best_mae, 2),
            "baseline_weight": baseline_w,
            "baseline_mae": round(baseline_mae, 2),
            "n": len(trows),
        }
    return out


def update_yaml_weights(text: str, fitted: Dict[str, float]) -> str:
    """Rewrite only the numeric values under `severity_weights:` in pricing.yaml,
    preserving comments/formatting and every other section."""
    lines = text.splitlines(keepends=True)
    out: List[str] = []
    in_block = False
    entry = re.compile(r"^(\s+)([^\s#][^:]*):\s*([\d.]+)\s*(#.*)?$")
    for line in lines:
        if not in_block:
            out.append(line)
            if re.match(r"^severity_weights:\s*$", line):
                in_block = True
            continue
        # End of block when a non-indented, non-blank line appears.
        if line.strip() and not line.startswith((" ", "\t")):
            in_block = False
            out.append(line)
            continue
        m = entry.match(line)
        if m and m.group(2) in fitted:
            indent, key, comment = m.group(1), m.group(2), m.group(4) or ""
            tail = f"  {comment}" if comment else ""
            out.append(f"{indent}{key}: {fitted[key]}{tail}\n")
        else:
            out.append(line)
    return "".join(out)


def _area_from_image(model, image_path: str) -> float:
    """Largest mask-area ratio in a photo (any class) — the damage extent."""
    from PIL import Image

    img = Image.open(image_path).convert("RGB")
    best = 0.0
    for r in model.predict(img, verbose=False):
        if r.masks is None:
            continue
        mh, mw = r.masks.data.shape[1], r.masks.data.shape[2]
        px = float(mh * mw) or 1.0
        for a in r.masks.data.sum(dim=(1, 2)).tolist():
            best = max(best, min(1.0, float(a) / px))
    return best


def load_rows(csv_path: Path, model=None) -> List[dict]:
    rows: List[dict] = []
    with open(csv_path, newline="", encoding="utf-8") as fh:
        for raw in csv.DictReader(fh):
            part = (raw.get("part") or "").strip()
            dtype = normalize_damage_type(raw.get("type") or "")
            try:
                price = float(raw.get("actual_price") or "")
            except ValueError:
                continue
            if raw.get("area_ratio"):
                area = float(raw["area_ratio"])
            elif raw.get("image") and model is not None:
                area = _area_from_image(model, raw["image"])
            else:
                continue  # no area and no model → skip
            rows.append({"part": part, "type": dtype, "area_ratio": area, "actual_price": price})
    return rows


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--csv", required=True, help="calibration data (see header docs)")
    p.add_argument("--weights", help="YOLO-seg weights to compute area_ratio from `image` rows")
    p.add_argument("--weight-min", type=float, default=1.0)
    p.add_argument("--weight-max", type=float, default=12.0)
    p.add_argument("--step", type=float, default=0.5)
    p.add_argument("--apply", action="store_true", help="write fitted weights into config/pricing.yaml")
    args = p.parse_args()

    model = None
    if args.weights:
        from ultralytics import YOLO

        model = YOLO(args.weights)

    rows = load_rows(Path(args.csv), model)
    if not rows:
        print("No usable rows (need area_ratio, or image + --weights).", file=sys.stderr)
        return 1

    fitted = fit_weights(rows, weight_grid(args.weight_min, args.weight_max, args.step))

    print(f"Calibrated on {len(rows)} rows from {args.csv}\n")
    print(f"{'type':<14}{'n':>4}{'cur_w':>8}{'cur_MAE':>10}{'fit_w':>8}{'fit_MAE':>10}{'Δ%':>8}")
    for dtype, f in sorted(fitted.items()):
        impr = (1 - f["mae"] / f["baseline_mae"]) * 100 if f["baseline_mae"] else 0.0
        print(f"{dtype:<14}{f['n']:>4}{f['baseline_weight']:>8.2f}{f['baseline_mae']:>10.2f}"
              f"{f['weight']:>8.2f}{f['mae']:>10.2f}{impr:>7.1f}%")

    if args.apply:
        new_weights = {t: f["weight"] for t, f in fitted.items()}
        text = CONFIG_PATH.read_text(encoding="utf-8")
        CONFIG_PATH.write_text(update_yaml_weights(text, new_weights), encoding="utf-8")
        print(f"\nWrote fitted severity_weights → {CONFIG_PATH}")
        print("⚠ Bump `pricing_version` in config/pricing.yaml to record this calibration.")
    else:
        print("\n(dry-run) re-run with --apply to write these into config/pricing.yaml")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
