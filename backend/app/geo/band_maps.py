"""Sensor-specific band mappings — versioned config, NOT magic constants.

Index computation reads bands by role ('red','nir',...) via these maps so the
same code works across sensors. Add a sensor only after verifying its band order.
Values are 0-based array indices into the stacked multi-band raster.
"""
from __future__ import annotations

BAND_MAPS: dict[str, dict[str, int]] = {
    # Sentinel-2 L2A subset commonly exported at 10/20 m
    # order assumed after stacking: B2,B3,B4,B8,B11
    "sentinel2_l2a_10m": {"blue": 0, "green": 1, "red": 2, "nir": 3, "swir": 4},
    # Landsat 8/9 OLI surface reflectance subset: B2..B7
    "landsat89_sr": {"blue": 0, "green": 1, "red": 2, "nir": 3, "swir": 4},
    # LISS-IV (3 bands: Green, Red, NIR) — no SWIR available
    "liss4": {"green": 0, "red": 1, "nir": 2},
}

BAND_MAP_VERSION = "v1"


def get_band_map(sensor: str) -> dict[str, int]:
    if sensor not in BAND_MAPS:
        raise KeyError(
            f"Unknown sensor '{sensor}'. Known: {sorted(BAND_MAPS)}. "
            "Add a verified band map before use."
        )
    return BAND_MAPS[sensor]


def supports(sensor: str, *roles: str) -> bool:
    """True if the sensor exposes all requested band roles (e.g. 'swir')."""
    bm = get_band_map(sensor)
    return all(r in bm for r in roles)
