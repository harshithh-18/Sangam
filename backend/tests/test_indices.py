"""Unit tests for spectral index formulas (pure NumPy — no GDAL needed)."""
import numpy as np
import pytest

from app.geo import indices as idx


def test_ndvi_known_values():
    # nir=0.5, red=0.1 -> (0.4)/(0.6) = 0.6667
    assert idx.ndvi(0.5, 0.1) == pytest.approx(0.66667, abs=1e-4)
    # equal bands -> 0
    assert idx.ndvi(0.3, 0.3) == pytest.approx(0.0)


def test_safe_ratio_no_divide_by_zero():
    num = np.array([1.0, -2.0, 0.0])
    den = np.array([0.0, 0.0, 5.0])
    out = idx.safe_ratio(num, den)
    assert np.isfinite(out).all()
    assert out[0] == 0.0 and out[1] == 0.0
    assert out[2] == pytest.approx(0.0)


def test_ndvi_zero_denominator():
    # nir=0, red=0 -> denom 0 -> 0.0, not nan/inf
    r = idx.ndvi(np.array([0.0]), np.array([0.0]))
    assert np.isfinite(r).all()
    assert r[0] == 0.0


def test_index_ranges_clipped():
    # extreme inputs stay within theoretical bounds
    big = np.array([1e6]); small = np.array([-1e6])
    assert -1.0 <= idx.ndvi(big, small)[0] <= 1.0
    assert idx.savi(big, small)[0] <= 1.5


def test_savi_L_factor():
    # L=0 makes SAVI collapse toward NDVI
    nir, red = 0.5, 0.1
    assert idx.savi(nir, red, L=0.0) == pytest.approx(idx.ndvi(nir, red), abs=1e-6)


def test_mask_propagation():
    nir = np.array([0.5, 0.5]); red = np.array([0.1, 0.1])
    mask = np.array([False, True])
    out = idx.ndvi(nir, red, mask=mask)
    assert not np.isnan(out[0])
    assert np.isnan(out[1])


def test_difference_classes():
    before = np.array([0.2, 0.5, 0.4])
    after = np.array([0.5, 0.2, 0.42])
    delta, cls = idx.difference(after, before, threshold=0.05)
    assert list(cls) == [1, -1, 0]
    assert delta[0] == pytest.approx(0.3)


def test_difference_nan_safe():
    before = np.array([np.nan]); after = np.array([0.5])
    delta, cls = idx.difference(after, before, threshold=0.05)
    assert cls[0] == 0
    assert np.isnan(delta[0])


def test_mndwi_vs_ndwi_distinct():
    green, nir, swir = 0.3, 0.2, 0.1
    assert idx.ndwi(green, nir) != idx.mndwi(green, swir)
