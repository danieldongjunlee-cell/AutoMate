"""Unit tests for the severity calibration helpers (no model needed)."""
from __future__ import annotations

import importlib.util
from pathlib import Path

_PATH = Path(__file__).resolve().parent.parent / "train" / "calibrate_severity.py"
_spec = importlib.util.spec_from_file_location("calibrate_severity", _PATH)
cal = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(cal)


def test_fit_weights_reduces_error():
    # Two scratch rows whose actual prices imply a higher area→severity weight
    # than the default; the fit should not do worse than the baseline.
    rows = [
        {"part": "door", "type": "scratch", "area_ratio": 0.05, "actual_price": 150},
        {"part": "door", "type": "scratch", "area_ratio": 0.22, "actual_price": 520},
    ]
    fitted = cal.fit_weights(rows, cal.weight_grid(1.0, 12.0, 0.5))
    assert "scratch" in fitted
    f = fitted["scratch"]
    assert f["n"] == 2
    assert f["mae"] <= f["baseline_mae"]  # fit never worse than current
    assert 1.0 <= f["weight"] <= 12.0


def test_update_yaml_weights_preserves_comments():
    text = (
        "severity_weights:\n"
        "  dent: 4.0\n"
        "  scratch: 3.0   # tune me\n"
        "\n"
        "severity_buckets:\n"
        "  minor: [0.0, 0.33]\n"
    )
    out = cal.update_yaml_weights(text, {"scratch": 6.0})
    out_lines = out.splitlines()
    scratch_line = next(line for line in out_lines if line.lstrip().startswith("scratch:"))
    assert "6.0" in scratch_line and "# tune me" in scratch_line  # value changed, comment kept
    assert "  dent: 4.0" in out                  # untouched
    assert "  minor: [0.0, 0.33]" in out         # other sections untouched (not a weight)
