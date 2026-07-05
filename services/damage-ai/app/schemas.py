"""Public response models for the damage-AI service (the /estimate contract).

The app (src/lib/damageEstimator.ts) and the server client
(server/src/damageAi.ts) depend on this shape — change deliberately.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class Damage(BaseModel):
    """One detected damage instance (one segmentation mask)."""

    type: str = Field(..., description="dent | scratch | crack | glass shatter | lamp broken | tire flat | paint")
    part: str = Field(..., description="affected panel, e.g. 'rear bumper'")
    severity: str = Field(..., description="minor | moderate | severe")
    confidence: float = Field(..., ge=0, le=1, description="detection confidence 0..1")
    area_ratio: float = Field(..., ge=0, le=1, description="damaged-area fraction of the image")


class EstimateResponse(BaseModel):
    estimate_id: str
    damages: List[Damage]
    price_low: int
    price_high: int
    confidence_pct: int = Field(..., ge=0, le=100)
    model_version: str
    pricing_version: str
    # Not in the minimal spec shape, but handy for debugging/telemetry.
    model_mode: str


class HealthResponse(BaseModel):
    ok: bool
    service: str = "damage-ai"
    model_mode: str
    model_loaded: bool
    model_version: str
    pricing_version: str
    pricing_market: Optional[str] = None
    receipt_mode: Optional[str] = None
