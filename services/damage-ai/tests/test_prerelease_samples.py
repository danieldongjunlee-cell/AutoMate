"""Phase 5 pre-release sample-image tests against a RUNNING damage-ai service.

Unlike the unit tests (which use TestClient), this exercises the live HTTP
service the way the app does, over the images in test-assets/damage-samples/.

Run:  DAMAGE_AI_URL=http://127.0.0.1:8100 .venv/bin/python -m pytest \
        tests/test_prerelease_samples.py -q

Skipped automatically when the service isn't reachable.
"""
from __future__ import annotations

import csv
import io
import os
from pathlib import Path

import httpx
import pytest

BASE = os.environ.get("DAMAGE_AI_URL", "http://127.0.0.1:8100")
SAMPLES = Path(__file__).resolve().parents[3] / "test-assets" / "damage-samples"

try:
    _health = httpx.get(f"{BASE}/health", timeout=3).json()
    SERVICE_UP = bool(_health.get("ok"))
    MODEL_MODE = _health.get("model_mode", "mock")
except Exception:  # pragma: no cover
    SERVICE_UP = False
    MODEL_MODE = "mock"

pytestmark = pytest.mark.skipif(not SERVICE_UP, reason="damage-ai service not running")

SEVERITY_LABELS = {"minor", "moderate", "severe"}


def manifest_rows() -> list[dict]:
    path = SAMPLES / "manifest.csv"
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return [r for r in csv.DictReader(f) if (SAMPLES / r["filename"]).exists()]


def estimate(image_bytes: bytes, filename: str, part: str = "Front bumper", types: str = "Dent"):
    files = [("images", (filename, image_bytes, "image/jpeg"))]
    data = {"part": part, "parts": f'[{{"part": "{part}", "type": "{types}"}}]'}
    return httpx.post(f"{BASE}/estimate", files=files, data=data, timeout=60)


def test_manifest_images_estimate_ok():
    """Every damage-labelled sample returns a sane, renderable estimate."""
    rows = [r for r in manifest_rows() if r["expected"] == "damage"]
    assert rows, "no damage samples present"
    for row in rows:
        blob = (SAMPLES / row["filename"]).read_bytes()
        res = estimate(blob, row["filename"], row["part"] or "Front bumper", row["types"] or "Dent")
        assert res.status_code == 200, f"{row['filename']}: {res.status_code}"
        body = res.json()
        assert body["price_low"] > 0
        assert body["price_high"] > body["price_low"]
        assert 0 < body["confidence_pct"] <= 100
        assert body["damages"], "expected at least one damage entry"
        assert all(d["severity"] in SEVERITY_LABELS for d in body["damages"])


def test_same_image_is_deterministic():
    blob = next(SAMPLES.glob("*.jpg")).read_bytes()
    a = estimate(blob, "sample.jpg").json()
    b = estimate(blob, "sample.jpg").json()
    for k in ("price_low", "price_high", "confidence_pct", "estimate_id"):
        assert a[k] == b[k], f"{k} differs across identical calls"


def test_price_range_tracks_pricing_table():
    """The returned bucket price must match config/pricing.yaml for the part+type."""
    import yaml

    cfg = yaml.safe_load(open(Path(__file__).resolve().parents[1] / "config" / "pricing.yaml"))
    blob = (SAMPLES / "front-bumper-scratch-dent.jpg").read_bytes()
    body = estimate(blob, "front-bumper-scratch-dent.jpg", "Front bumper", "Dent").json()
    assert len(body["damages"]) == 1
    label = body["damages"][0]["severity"]
    table = cfg["parts"]["front bumper"]["dent"][label]
    assert [body["price_low"], body["price_high"]] == list(table)


def test_zero_byte_image_handled():
    res = estimate(b"", "empty.jpg")
    assert res.status_code < 500, f"0-byte image caused a {res.status_code}"


def test_non_image_file_handled():
    res = estimate(b"this is not an image at all", "notes.txt")
    assert res.status_code < 500, f"non-image caused a {res.status_code}"


def test_oversized_image_handled():
    big = b"\xff\xd8\xff\xe0" + os.urandom(20 * 1024 * 1024)
    res = estimate(big, "huge.jpg")
    assert res.status_code < 500, f"20MB upload caused a {res.status_code}"


def test_no_images_still_answers_from_parts_hint():
    """The app can call /estimate with parts but no uploads (mock/demo path)."""
    res = httpx.post(
        f"{BASE}/estimate",
        data={"parts": '[{"part": "Rear bumper", "type": "Dent"}]'},
        timeout=30,
    )
    assert res.status_code == 200
    assert res.json()["price_low"] > 0
