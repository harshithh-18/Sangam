"""Unit tests for composite watershed health scoring (pure Python)."""
from app.geo import health as h


def test_score_range():
    r = h.composite_health(ndvi_mean=0.5, ndwi_mean=0.2, interventions=10,
                           area_ha=4218, barren_fraction=0.2)
    assert 0 <= r.score <= 100


def test_weights_sum_to_one():
    assert abs(sum(h.HEALTH_WEIGHTS.values()) - 1.0) < 1e-9


def test_healthier_inputs_score_higher():
    low = h.composite_health(0.1, -0.4, 1, 4218, 0.6)
    high = h.composite_health(0.7, 0.5, 20, 4218, 0.05)
    assert high.score > low.score


def test_band_thresholds():
    assert h.band_for(80) == "Healthy"
    assert h.band_for(65) == "Improving"
    assert h.band_for(50) == "Stressed"
    assert h.band_for(30) == "Degraded"


def test_components_contribution_adds_up():
    r = h.composite_health(0.5, 0.2, 10, 4218, 0.2)
    total = sum(c["contribution"] for c in r.components.values())
    assert abs(total - r.score) <= 1.0  # rounding tolerance


def test_custom_weights():
    w = {"vegetation": 1.0, "water": 0.0, "intervention": 0.0, "soil": 0.0}
    r = h.composite_health(0.8, 0.0, 0, 4218, 1.0, weights=w)
    # only vegetation matters -> normalize_ndvi(0.8)=1.0 -> score 100
    assert r.score == 100
