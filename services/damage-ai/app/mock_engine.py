"""Deterministic mock engines (MODEL_MODE=mock / RECEIPT_MODE=mock).

Results are derived deterministically from the inputs + pricing table, so the
same photos + parts always produce the same estimate — stable enough to demo
and to test against, no model weights or GPU needed. The whole app runs
end-to-end on these.

The server's graceful-degrade fallback (server/src/damageAi.ts) mirrors the
single-part scheme over the same pricing constants.
"""
from __future__ import annotations

import hashlib
from typing import Iterable, List, Optional

from .pricing import normalize_damage_type, price_range, severity_bucket

# Single-part confidence band (legacy /estimate + server fallback).
CONFIDENCE_BASE = 80
CONFIDENCE_SPREAD = 16

# The wireframe demo damage ("AI confidence 87% · rear bumper dent · $285–$480").
WIREFRAME_PART = "rear bumper"
WIREFRAME_TYPE = "dent"
WIREFRAME_CONFIDENCE = 0.87
WIREFRAME_AREA_RATIO = 0.12  # × dent weight 4.0 ≈ 0.48 → "moderate"


def stable_hash(part: str, damage_type: str, image_blobs: Iterable[bytes]) -> int:
    """Order-independent digest of part + damage type + photo bytes."""
    h = hashlib.sha256()
    h.update((part or "").strip().lower().encode("utf-8"))
    h.update(b"|")
    h.update(normalize_damage_type(damage_type).encode("utf-8"))
    for digest in sorted(hashlib.sha256(blob).digest() for blob in image_blobs):
        h.update(digest)
    return int.from_bytes(h.digest()[:8], "big")


def mock_estimate(part: str, damage_type: str, image_blobs: List[bytes]) -> dict:
    """Legacy single-part estimate (kept for tests / direct callers)."""
    h = stable_hash(part, damage_type, image_blobs)
    severity = round((h % 1000) / 1000, 2)
    bucket = severity_bucket(severity)
    low, high = price_range(part, damage_type, bucket)
    confidence_pct = CONFIDENCE_BASE + (h >> 16) % CONFIDENCE_SPREAD
    return {
        "part": part,
        "damage_type": normalize_damage_type(damage_type),
        "severity": severity,
        "severity_label": bucket,
        "price_low": low,
        "price_high": high,
        "confidence_pct": confidence_pct,
        "model_mode": "mock",
    }


def mock_damages(
    image_blobs: List[bytes],
    part: Optional[str],
    parts_hint: Optional[List[dict]],
) -> List[dict]:
    """Build the raw damage list for the new /estimate (deterministic).

    Source of truth for what gets returned:
      1. parts_hint (the app's selected parts: [{part, type}, ...]) if present,
      2. else a single damage for the supplied `part` (type=dent),
      3. else the canonical wireframe rear-bumper dent.

    Each damage is anchored to the wireframe's confidence/severity so the demo
    shows "AI confidence 87%"; prices vary by the part × type table.
    """
    pairs: List[tuple] = []
    if parts_hint:
        for p in parts_hint:
            pairs.append((p.get("part") or WIREFRAME_PART, p.get("type") or WIREFRAME_TYPE))
    elif part:
        pairs.append((part, WIREFRAME_TYPE))
    else:
        pairs.append((WIREFRAME_PART, WIREFRAME_TYPE))

    damages: List[dict] = []
    for raw_part, raw_type in pairs:
        damages.append(
            {
                "type": normalize_damage_type(raw_type),
                "part": raw_part,
                "area_ratio": WIREFRAME_AREA_RATIO,
                "confidence": WIREFRAME_CONFIDENCE,
            }
        )
    return damages


# Canonical demo receipt — matches the app's SCANNED_RECEIPT mock
# (src/services/mock/data.ts) so scan-review copy stays identical to the
# wireframe regardless of which layer answered.
MOCK_RECEIPT = {
    "vendor": "AutoFix Pro",
    "date": "Mar 12, 2025",
    "service_type": "Oil change — synthetic",
    "line_items": [
        {"desc": "Full synthetic oil change (0W-20)", "amount": 39.00},
        {"desc": "Oil filter + disposal fee", "amount": 10.00},
    ],
    "total": 49.00,
    "mileage": "44,500 mi",
}


def mock_receipt(_blob: bytes) -> dict:
    return {**MOCK_RECEIPT, "model_mode": "mock"}


# Canonical demo insurance card — matches the seeded State Farm policy
# (server/prisma/seed.ts) and the server's TS fallback.
MOCK_INSURANCE_CARD = {
    "provider": "State Farm",
    "policy_number": "SF-8847234",
    "deductible": 500,
    "premium_per_year": 1200,
    "coverage_type": "Comprehensive + Collision",
    "renewal_date": "Aug 15, 2027",
}


def mock_insurance_card(_blob: bytes) -> dict:
    return {**MOCK_INSURANCE_CARD, "model_mode": "mock"}
