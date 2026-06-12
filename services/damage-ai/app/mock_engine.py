"""Deterministic mock engines (MODEL_MODE=mock / RECEIPT_MODE=mock).

Results are derived from a SHA-256 hash of the inputs plus the pricing table,
so the same photo set + part + damage type always produces the same estimate
— stable enough to demo and to write tests against, no model weights needed.

The server's graceful-degrade fallback (server/src/damageAi.ts) implements the
same scheme over the same pricing constants.
"""
from __future__ import annotations

import hashlib
from typing import Iterable

from .pricing import normalize_damage_type, price_range, severity_bucket

# Confidence is presented as CONFIDENCE_BASE..CONFIDENCE_BASE+CONFIDENCE_SPREAD-1.
CONFIDENCE_BASE = 80
CONFIDENCE_SPREAD = 16


def stable_hash(part: str, damage_type: str, image_blobs: Iterable[bytes]) -> int:
    """Order-independent digest of part + damage type + photo bytes."""
    h = hashlib.sha256()
    h.update(part.strip().lower().encode("utf-8"))
    h.update(b"|")
    h.update(normalize_damage_type(damage_type).encode("utf-8"))
    # Sort per-image digests so photo upload order doesn't change the result.
    for digest in sorted(hashlib.sha256(blob).digest() for blob in image_blobs):
        h.update(digest)
    return int.from_bytes(h.digest()[:8], "big")


def mock_estimate(part: str, damage_type: str, image_blobs: list[bytes]) -> dict:
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
