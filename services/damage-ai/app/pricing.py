"""Pricing layer: part × damage_type × severity bucket → $ range.

The table lives in config/pricing.yaml (Northern Virginia market) and is
editable WITHOUT code changes. `pricing_version` is recorded on every estimate
so a stored quote always knows which table produced it.

The server's TS mock fallback (server/src/damageAi.ts) mirrors these constants —
keep the two in sync when editing.
"""
from __future__ import annotations

import functools
from pathlib import Path
from typing import Iterable, List, Tuple

import yaml

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "pricing.yaml"

# CarDD's 6 classes + our extra `paint`. Keep order/spelling aligned with
# config/pricing.yaml `damage_types` and the training dataset.yaml names.
DAMAGE_TYPES = (
    "dent",
    "scratch",
    "crack",
    "glass shatter",
    "lamp broken",
    "tire flat",
    "paint",
)
DEFAULT_DAMAGE_TYPE = "dent"


@functools.lru_cache(maxsize=1)
def load_pricing() -> dict:
    with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def pricing_version() -> str:
    return str(load_pricing().get("pricing_version", "unknown"))


def normalize_damage_type(damage_type: str) -> str:
    dt = (damage_type or "").strip().lower()
    # Tolerate a few aliases the app/model may emit.
    aliases = {
        "glass_shatter": "glass shatter",
        "glass-shatter": "glass shatter",
        "shatter": "glass shatter",
        "lamp_broken": "lamp broken",
        "lamp-broken": "lamp broken",
        "broken lamp": "lamp broken",
        "tire_flat": "tire flat",
        "tire-flat": "tire flat",
        "flat tire": "tire flat",
        "flat": "tire flat",
    }
    dt = aliases.get(dt, dt)
    return dt if dt in DAMAGE_TYPES else DEFAULT_DAMAGE_TYPE


def severity_weight(damage_type: str) -> float:
    weights = load_pricing().get("severity_weights", {})
    return float(weights.get(normalize_damage_type(damage_type), 4.0))


def severity_from_area(area_ratio: float, damage_type: str) -> float:
    """damaged_area_ratio (0..1) → severity score (0..1), weighted by type."""
    score = max(0.0, min(1.0, float(area_ratio) * severity_weight(damage_type)))
    return round(score, 2)


def severity_bucket(score: float) -> str:
    """Map a 0..1 severity score onto a bucket label (minor/moderate/severe)."""
    buckets = load_pricing()["severity_buckets"]
    for label, (low, high) in buckets.items():
        if low <= score < high:
            return label
    return list(buckets.keys())[-1]  # score == 1.0 (or table edge)


def match_part(part: str) -> str:
    """Fuzzy part lookup: longest table key contained in the request name."""
    name = (part or "").strip().lower()
    keys = sorted(load_pricing()["parts"].keys(), key=len, reverse=True)
    for key in keys:
        if key in name:
            return key
    return "default"


def default_part_for(damage_type: str) -> str:
    """Part to assume when none was supplied/inferable (per damage class)."""
    return load_pricing().get("class_part", {}).get(normalize_damage_type(damage_type), "default")


def price_range(part: str, damage_type: str, bucket: str) -> Tuple[int, int]:
    """Return (price_low, price_high) for a part × damage_type × bucket.

    Resolution order for a missing (part, type) cell:
      part[type] → default[type] → default[dent].
    """
    table = load_pricing()
    dt = normalize_damage_type(damage_type)
    part_key = match_part(part)
    rows = table["parts"].get(part_key, {})
    by_type = rows.get(dt) or table["default"].get(dt) or table["default"][DEFAULT_DAMAGE_TYPE]
    low, high = by_type[bucket]
    return int(low), int(high)


def aggregate(ranges: Iterable[Tuple[int, int]]) -> Tuple[int, int]:
    """Sum per-damage ranges into one overall low–high (independent damages)."""
    lows: List[int] = []
    highs: List[int] = []
    for low, high in ranges:
        lows.append(int(low))
        highs.append(int(high))
    return (sum(lows), sum(highs)) if lows else (0, 0)
