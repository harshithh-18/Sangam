"""Composite watershed health score (PROJECT_CONTEXT.md §2, §6E).

Documented, configurable weighting. Pure Python + unit-testable.
Score = 100 * Σ(weightᵢ · normalizedᵢ). Weights are versioned config, not magic.
This is an analytical index, NOT a causal impact claim.
"""
from __future__ import annotations

from dataclasses import dataclass

HEALTH_WEIGHTS = {
    "vegetation": 0.35,   # normalized NDVI
    "water": 0.25,        # normalized NDWI
    "intervention": 0.20, # normalized intervention density
    "soil": 0.20,         # 1 - normalized barren fraction
}
HEALTH_MODEL_VERSION = "health-v1"


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def normalize_ndvi(ndvi_mean: float) -> float:
    # NDVI in practice ~[-0.1, 0.8] for this landscape -> map to 0..1
    return _clamp01((ndvi_mean + 0.1) / 0.9)


def normalize_ndwi(ndwi_mean: float) -> float:
    # NDWI ~[-0.6, 0.6]
    return _clamp01((ndwi_mean + 0.6) / 1.2)


def normalize_density(interventions: int, area_ha: float, cap_per_1000ha: float = 20.0) -> float:
    if area_ha <= 0:
        return 0.0
    per_1000 = interventions / (area_ha / 1000.0)
    return _clamp01(per_1000 / cap_per_1000ha)


def normalize_soil(barren_fraction: float) -> float:
    # less barren -> healthier
    return _clamp01(1.0 - barren_fraction)


@dataclass
class HealthResult:
    score: int
    band: str
    components: dict
    model_version: str = HEALTH_MODEL_VERSION


def band_for(score: int) -> str:
    if score >= 75:
        return "Healthy"
    if score >= 60:
        return "Improving"
    if score >= 45:
        return "Stressed"
    return "Degraded"


def composite_health(
    ndvi_mean: float,
    ndwi_mean: float,
    interventions: int,
    area_ha: float,
    barren_fraction: float,
    weights: dict | None = None,
) -> HealthResult:
    w = weights or HEALTH_WEIGHTS
    comp = {
        "vegetation": normalize_ndvi(ndvi_mean),
        "water": normalize_ndwi(ndwi_mean),
        "intervention": normalize_density(interventions, area_ha),
        "soil": normalize_soil(barren_fraction),
    }
    raw = sum(w[k] * comp[k] for k in comp)
    score = round(100 * raw)
    return HealthResult(
        score=score,
        band=band_for(score),
        components={k: {"weight": w[k], "value": round(comp[k], 3),
                        "contribution": round(100 * w[k] * comp[k], 1)} for k in comp},
    )
