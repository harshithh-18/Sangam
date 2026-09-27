"""Pydantic schemas — API request/response contracts.

Every result identifies source/version/run and links to quality/caveat metadata
(PROJECT_CONTEXT.md §7 API principles).
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class Provenance(BaseModel):
    source: str | None = None
    method: str | None = None
    version: str | None = None
    run_id: str | None = None
    caveat: str | None = None


class MicroWatershedOut(BaseModel):
    id: str
    name: str
    health: int | None = None
    trend: int | None = None
    ndvi: float | None = None
    water: float | None = None
    interventions: int | None = None
    centroid: list[float] | None = None


class WatershedOut(BaseModel):
    id: str
    name: str
    project_code: str | None = None
    district: str | None = None
    block: str | None = None
    state: str | None = None
    area_ha: float | None = None
    crs: str
    center: list[float] | None = None
    micro_watersheds: list[MicroWatershedOut] = []


class InterventionOut(BaseModel):
    id: str
    type: str
    type_label: str
    lat: float
    lng: float
    confidence: float
    user_tag: str | None = None
    agreement: bool | None = None
    status: str
    captured_at: str | None = None
    epoch: str | None = None
    model_version: str | None = None
    mws: str | None = None
    mws_name: str | None = None
    water_gain: float | None = None
    ndvi_gain: float | None = None
    buffer_m: int | None = None
    window_days: int | None = None


class IndexRequest(BaseModel):
    watershed_id: str
    index: str  # ndvi|ndwi|ndbi|mndwi|savi|bsi
    epoch: str = "T5"
    sensor: str = "sentinel2_l2a_10m"


class ChangeRequest(BaseModel):
    watershed_id: str
    index: str = "ndvi"
    epoch_before: str = "T0"
    epoch_after: str = "T5"
    threshold: float = 0.08
    sensor: str = "sentinel2_l2a_10m"


class HealthRequest(BaseModel):
    ndvi_mean: float
    ndwi_mean: float
    interventions: int
    area_ha: float
    barren_fraction: float
    weights: dict[str, float] | None = None


class JobOut(BaseModel):
    id: str
    run_type: str
    status: str
    progress: int
    parameters: dict[str, Any] | None = None
    error: str | None = None


class PhotoIngestOut(BaseModel):
    id: str
    review_status: str
    review_reasons: list[str] = []
    exif: dict[str, Any] | None = None
    inference: dict[str, Any] | None = None
