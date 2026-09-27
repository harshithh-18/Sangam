"""Spectral index computation (PROJECT_CONTEXT.md §6A).

Pure NumPy so the formulas are unit-testable without GDAL/rasterio.
Every index:
  * handles zero denominators safely (no divide-by-zero warnings / inf),
  * propagates a nodata mask,
  * clips outputs to their valid theoretical range.

Band mapping is sensor-specific and MUST be supplied by a tested config
(see band_maps.py) — never assume generic band numbers.
"""
from __future__ import annotations

import numpy as np

# Valid theoretical ranges for clipping / QC.
INDEX_RANGES = {
    "ndvi": (-1.0, 1.0),
    "ndwi": (-1.0, 1.0),
    "ndbi": (-1.0, 1.0),
    "mndwi": (-1.0, 1.0),
    "savi": (-1.0, 1.5),
    "bsi": (-1.0, 1.0),
}


def safe_ratio(numerator: np.ndarray, denominator: np.ndarray) -> np.ndarray:
    """(num / den) with den==0 -> 0.0, computed without runtime warnings."""
    num = np.asarray(numerator, dtype="float64")
    den = np.asarray(denominator, dtype="float64")
    out = np.zeros(np.broadcast(num, den).shape, dtype="float64")
    np.divide(num, den, out=out, where=den != 0)
    return out


def _finalize(arr: np.ndarray, key: str, mask: np.ndarray | None) -> np.ndarray:
    lo, hi = INDEX_RANGES[key]
    arr = np.clip(arr, lo, hi)
    if mask is not None:
        arr = np.where(mask, np.nan, arr)
    return arr


def ndvi(nir, red, mask=None):
    """Vegetation health/density. (NIR - Red) / (NIR + Red)."""
    nir = np.asarray(nir, "float64"); red = np.asarray(red, "float64")
    return _finalize(safe_ratio(nir - red, nir + red), "ndvi", mask)


def ndwi(green, nir, mask=None):
    """Open water (McFeeters). (Green - NIR) / (Green + NIR)."""
    green = np.asarray(green, "float64"); nir = np.asarray(nir, "float64")
    return _finalize(safe_ratio(green - nir, green + nir), "ndwi", mask)


def ndbi(swir, nir, mask=None):
    """Built-up / barren. (SWIR - NIR) / (SWIR + NIR)."""
    swir = np.asarray(swir, "float64"); nir = np.asarray(nir, "float64")
    return _finalize(safe_ratio(swir - nir, swir + nir), "ndbi", mask)


def mndwi(green, swir, mask=None):
    """Water vs built-up (Xu). (Green - SWIR) / (Green + SWIR)."""
    green = np.asarray(green, "float64"); swir = np.asarray(swir, "float64")
    return _finalize(safe_ratio(green - swir, green + swir), "mndwi", mask)


def savi(nir, red, L: float = 0.5, mask=None):
    """Soil-adjusted vegetation index. ((NIR-Red)/(NIR+Red+L)) * (1+L)."""
    nir = np.asarray(nir, "float64"); red = np.asarray(red, "float64")
    val = safe_ratio(nir - red, nir + red + L) * (1.0 + L)
    return _finalize(val, "savi", mask)


def bsi(swir, red, nir, blue, mask=None):
    """Bare Soil Index. ((SWIR+Red)-(NIR+Blue)) / ((SWIR+Red)+(NIR+Blue))."""
    swir = np.asarray(swir, "float64"); red = np.asarray(red, "float64")
    nir = np.asarray(nir, "float64"); blue = np.asarray(blue, "float64")
    num = (swir + red) - (nir + blue)
    den = (swir + red) + (nir + blue)
    return _finalize(safe_ratio(num, den), "bsi", mask)


def difference(after: np.ndarray, before: np.ndarray, threshold: float = 0.0):
    """Index differencing for change detection (PROJECT_CONTEXT §6C).

    Returns (delta, change_class) where change_class is:
      +1 gain (delta >  threshold), -1 loss (delta < -threshold), 0 stable.
    NaN in either input propagates to NaN delta and class 0.
    """
    after = np.asarray(after, "float64"); before = np.asarray(before, "float64")
    delta = after - before
    valid = ~(np.isnan(after) | np.isnan(before))
    cls = np.zeros(delta.shape, dtype="int8")
    cls[valid & (delta > threshold)] = 1
    cls[valid & (delta < -threshold)] = -1
    return delta, cls
