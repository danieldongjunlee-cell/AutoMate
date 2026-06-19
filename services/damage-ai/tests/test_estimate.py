"""Integration tests for the damage-AI /estimate + /health endpoints.

Mock tests run anywhere (no model/GPU) and gate every CI push. The live test is
opt-in (RUN_LIVE_TESTS=1) and asserts the service actually loaded YOLO-seg
weights — run it in a CI job that has MODEL_MODE=live + models/damage-seg.pt, so
a broken/missing-weights deploy (which silently degrades to mock) FAILS CI.

    pip install -r requirements.txt -r requirements-dev.txt
    pytest                                  # mock only
    RUN_LIVE_TESTS=1 MODEL_MODE=live pytest # live (needs weights)
"""
from __future__ import annotations

import io
import json
import os

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def _png_bytes(color=(180, 180, 180)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (640, 480), color).save(buf, format="PNG")
    return buf.getvalue()


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["service"] == "damage-ai"
    assert body["model_loaded"] is True
    assert body["pricing_version"]  # non-empty


def test_estimate_mock_matches_wireframe():
    """Canonical rear-bumper dent → the wireframe demo numbers, deterministically."""
    if os.environ.get("MODEL_MODE", "mock").lower() == "live":
        pytest.skip("mock-specific assertions; service is in live mode")
    r = client.post(
        "/estimate",
        data={"parts": json.dumps([{"part": "rear bumper", "type": "dent"}])},
        files={"images": ("p.png", _png_bytes(), "image/png")},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["model_mode"] == "mock"
    assert body["price_low"] == 285 and body["price_high"] == 480
    assert body["confidence_pct"] == 87
    assert body["damages"][0]["part"] == "rear bumper"
    assert body["damages"][0]["type"] == "dent"
    assert body["damages"][0]["severity"] == "moderate"
    for key in ("estimate_id", "model_version", "pricing_version"):
        assert body[key]


def test_estimate_mock_aggregates_multiple_parts():
    if os.environ.get("MODEL_MODE", "mock").lower() == "live":
        pytest.skip("mock-specific assertions; service is in live mode")
    parts = [{"part": "rear bumper", "type": "dent"}, {"part": "door", "type": "scratch"}]
    r = client.post("/estimate", data={"parts": json.dumps(parts)})
    assert r.status_code == 200
    body = r.json()
    assert len(body["damages"]) == 2
    # Aggregated range = sum of each part's moderate cell (rear bumper dent
    # 285–480 + door scratch 180–350).
    assert body["price_low"] == 285 + 180
    assert body["price_high"] == 480 + 350


@pytest.mark.skipif(
    os.environ.get("RUN_LIVE_TESTS") != "1",
    reason="live test — set RUN_LIVE_TESTS=1 with MODEL_MODE=live + weights",
)
def test_estimate_live_loads_real_model():
    """Asserts the service is genuinely live (not the silent mock fallback)."""
    h = client.get("/health").json()
    assert h["model_mode"] == "live", "service fell back to mock — weights/deps missing?"
    assert h["model_loaded"] is True

    r = client.post("/estimate", files={"images": ("p.png", _png_bytes(), "image/png")})
    assert r.status_code == 200
    body = r.json()
    assert body["model_mode"] == "live"
    # A blank image may detect nothing; we only assert the live wiring + contract.
    assert "damages" in body and "confidence_pct" in body
    assert body["pricing_version"]
