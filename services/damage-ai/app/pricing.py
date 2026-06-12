"""Pricing table loader: part x damage_type x severity bucket -> $ range.

The table lives in config/pricing.yaml (Fairfax, VA market numbers). The
server's TS mock fallback (server/src/damageAi.ts) mirrors these constants —
keep the two in sync when editing.
"""
from __future__ import annotations

import functools
from pathlib import Path
from typing import Tuple

import yaml

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "pricing.yaml"

DAMAGE_TYPES = ("dent", "scratch", "crack", "paint")
DEFAULT_DAMAGE_TYPE = "dent"


@functools.lru_cache(maxsize=1)
def load_pricing() -> dict:
    with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def severity_bucket(score: float) -> str:
    """Map a 0..1 severity score onto a bucket label (minor/moderate/severe)."""
    buckets = load_pricing()["severity_buckets"]
    for label, (low, high) in buckets.items():
        if low <= score < high:
            return label
    return list(buckets.keys())[-1]  # score == 1.0 (or table edge)


def normalize_damage_type(damage_type: str) -> str:
    dt = damage_type.strip().lower()
    return dt if dt in DAMAGE_TYPES else DEFAULT_DAMAGE_TYPE


def match_part(part: str) -> str:
    """Fuzzy part lookup: longest table key contained in the request name.

    "L. Rear Fender" -> "fender", "Rear bumper" -> "rear bumper",
    unknown -> "default".
    """
    name = part.strip().lower()
    keys = sorted(load_pricing()["parts"].keys(), key=len, reverse=True)
    for key in keys:
        if key in name:
            return key
    return "default"


def price_range(part: str, damage_type: str, bucket: str) -> Tuple[int, int]:
    """Return (price_low, price_high) for a part x damage_type x bucket."""
    table = load_pricing()
    part_key = match_part(part)
    rows = table["parts"].get(part_key, table["default"])
    by_type = rows.get(normalize_damage_type(damage_type)) or table["default"][DEFAULT_DAMAGE_TYPE]
    low, high = by_type[bucket]
    return int(low), int(high)
