"""EXIF extraction for field photos (PROJECT_CONTEXT.md §5).

Original EXIF is evidence, but not inherently trustworthy: it is extracted
independently and then validated (validate.py). Uses Pillow.
"""
from __future__ import annotations

from typing import Any


def _to_deg(value, ref) -> float | None:
    try:
        d, m, s = [float(x) for x in value]
        dec = d + m / 60.0 + s / 3600.0
        if ref in ("S", "W"):
            dec = -dec
        return round(dec, 7)
    except (TypeError, ValueError):
        return None


def extract_exif(path: str) -> dict[str, Any]:
    """Return a normalized dict: {lat, lng, captured_at, make, model, raw_present}.

    Missing/absent values are None; never raises on a photo without EXIF.
    """
    result: dict[str, Any] = {
        "lat": None, "lng": None, "captured_at": None,
        "make": None, "model": None, "raw_present": False,
    }
    try:
        from PIL import Image, ExifTags  # imported lazily
    except ImportError:
        return result

    try:
        img = Image.open(path)
        exif = img.getexif()
    except Exception:
        return result

    if not exif:
        return result
    result["raw_present"] = True

    tag_by_name = {ExifTags.TAGS.get(k, k): v for k, v in exif.items()}
    result["make"] = tag_by_name.get("Make")
    result["model"] = tag_by_name.get("Model")
    result["captured_at"] = tag_by_name.get("DateTimeOriginal") or tag_by_name.get("DateTime")

    gps_ifd = exif.get_ifd(ExifTags.IFD.GPSInfo) if hasattr(ExifTags, "IFD") else {}
    if gps_ifd:
        g = {ExifTags.GPSTAGS.get(k, k): v for k, v in gps_ifd.items()}
        lat = _to_deg(g.get("GPSLatitude"), g.get("GPSLatitudeRef"))
        lng = _to_deg(g.get("GPSLongitude"), g.get("GPSLongitudeRef"))
        result["lat"], result["lng"] = lat, lng
    return result
