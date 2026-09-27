"""Deterministic demo-data generator (mirrors frontend src/data/demoData.js).

Synthetic, for demonstration only — NOT official DRISHTI/SRISHTI data.
Used by the seeder to populate PostGIS so the frontend runs against a live API.
"""
from __future__ import annotations

PILOT = {
    "id": "MH-BEED-4C2-KLG",
    "name": "Kolgaon Micro-Watershed Cluster",
    "project_code": "MH-BEED-4C2-KLG",
    "district": "Beed",
    "block": "Georai",
    "state": "Maharashtra",
    "area_ha": 4218.0,
    "center": [19.045, 75.758],
    "crs": "EPSG:4326",
}

EPOCHS = [
    {"id": "T0", "label": "Nov 2021", "date": "2021-11-14", "season": "Post-monsoon", "cloud": 3},
    {"id": "T1", "label": "Mar 2022", "date": "2022-03-09", "season": "Winter/rabi", "cloud": 1},
    {"id": "T2", "label": "Nov 2022", "date": "2022-11-21", "season": "Post-monsoon", "cloud": 6},
    {"id": "T3", "label": "Mar 2023", "date": "2023-03-17", "season": "Winter/rabi", "cloud": 2},
    {"id": "T4", "label": "Nov 2023", "date": "2023-11-08", "season": "Post-monsoon", "cloud": 4},
    {"id": "T5", "label": "Feb 2025", "date": "2025-02-19", "season": "Winter/rabi", "cloud": 2},
]

BOUNDARY = [
    [75.712, 19.078], [75.742, 19.086], [75.771, 19.079], [75.796, 19.086],
    [75.812, 19.068], [75.808, 19.045], [75.818, 19.024], [75.802, 19.006],
    [75.776, 19.001], [75.752, 18.994], [75.728, 19.003], [75.709, 19.02],
    [75.699, 19.041], [75.704, 19.062], [75.712, 19.078],
]

MICRO_WATERSHEDS = [
    {"id": "MWS-01", "name": "Upper Kolgaon", "c": [75.735, 19.062], "health": 72, "trend": 6, "ndvi": 0.48, "water": 14.2, "interventions": 9},
    {"id": "MWS-02", "name": "Rui Nala", "c": [75.772, 19.058], "health": 64, "trend": 3, "ndvi": 0.41, "water": 21.6, "interventions": 12},
    {"id": "MWS-03", "name": "Georai East", "c": [75.796, 19.036], "health": 81, "trend": 11, "ndvi": 0.57, "water": 9.4, "interventions": 7},
    {"id": "MWS-04", "name": "Lower Kolgaon", "c": [75.758, 19.022], "health": 58, "trend": -2, "ndvi": 0.36, "water": 6.1, "interventions": 5},
    {"id": "MWS-05", "name": "Sindphana Bank", "c": [75.73, 19.03], "health": 69, "trend": 5, "ndvi": 0.45, "water": 28.3, "interventions": 11},
    {"id": "MWS-06", "name": "Pimpalgaon Ridge", "c": [75.79, 19.066], "health": 76, "trend": 8, "ndvi": 0.52, "water": 4.7, "interventions": 6},
]

IV_TYPES = {
    "check_dam": "Check Dam", "farm_pond": "Farm Pond", "afforestation": "Afforestation",
    "contour_bund": "Contour Bunding", "percolation_tank": "Percolation Tank",
    "nala_revetment": "Nala Revetment", "loose_boulder": "Loose Boulder Structure",
}

LULC = {
    "T0": {"agri": 1980, "forest": 402, "scrub": 690, "water": 96, "builtup": 210, "barren": 840},
    "T5": {"agri": 2074, "forest": 561, "scrub": 604, "water": 158, "builtup": 236, "barren": 585},
}


def _mulberry32(seed: int):
    """Faithful port of the frontend mulberry32 (uses 32-bit Math.imul semantics)."""
    state = seed & 0xFFFFFFFF

    def _imul(a: int, b: int) -> int:
        return ((a & 0xFFFFFFFF) * (b & 0xFFFFFFFF)) & 0xFFFFFFFF

    def rnd():
        nonlocal state
        state = (state + 0x6D2B79F5) & 0xFFFFFFFF
        t = state
        t = _imul(t ^ (t >> 15), 1 | t)
        t = ((t + _imul(t ^ (t >> 7), 61 | t)) & 0xFFFFFFFF) ^ t
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return rnd


def _in_boundary(lng: float, lat: float) -> bool:
    inside = False
    ring = BOUNDARY
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > lat) != (yj > lat) and lng < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def _owner(lng: float, lat: float):
    best, bd = None, float("inf")
    for m in MICRO_WATERSHEDS:
        d = (m["c"][0] - lng) ** 2 + (m["c"][1] - lat) ** 2
        if d < bd:
            bd, best = d, m
    return best


BBOX = {"minLng": 75.699, "maxLng": 75.818, "minLat": 18.994, "maxLat": 19.086}


def make_interventions(n: int = 50) -> list[dict]:
    rnd = _mulberry32(7788)
    types = list(IV_TYPES.keys())
    out: list[dict] = []
    guard = 0
    while len(out) < n and guard < 6000:
        guard += 1
        lng = BBOX["minLng"] + rnd() * (BBOX["maxLng"] - BBOX["minLng"])
        lat = BBOX["minLat"] + rnd() * (BBOX["maxLat"] - BBOX["minLat"])
        if not _in_boundary(lng, lat):
            continue
        t = types[int(rnd() * len(types))]
        conf = 0.62 + rnd() * 0.37
        owner = _owner(lng, lat)
        status = "review" if rnd() > 0.82 else ("verified" if rnd() > 0.08 else "flagged")
        ep = EPOCHS[2 + int(rnd() * 4)]
        water_gain = round(0.4 + rnd() * 2.6, 2) if t in ("check_dam", "farm_pond", "percolation_tank") else round(rnd() * 0.5, 2)
        ndvi_gain = round(0.08 + rnd() * 0.22, 3) if t in ("afforestation", "contour_bund") else round(rnd() * 0.09, 3)
        out.append({
            "id": f"IV-{len(out) + 1:03d}", "type": t, "type_label": IV_TYPES[t],
            "lat": round(lat, 5), "lng": round(lng, 5), "confidence": round(conf, 2),
            "user_tag": IV_TYPES[t] if rnd() > 0.25 else "—", "agreement": rnd() > 0.2,
            "status": status, "captured_at": ep["date"], "epoch": ep["id"],
            "model_version": "photo-cls-r50 v0.4.1", "mws": owner["id"], "mws_name": owner["name"],
            "water_gain": water_gain, "ndvi_gain": ndvi_gain, "buffer_m": 150, "window_days": 120,
        })
    return out


def time_series() -> list[dict]:
    out = []
    for i, e in enumerate(EPOCHS):
        out.append({
            "epoch": e["id"], "label": e["label"],
            "ndvi": round(0.34 + i * 0.032 + (-0.02 if i % 2 else 0.01), 3),
            "ndwi": round(-0.08 + i * 0.018, 3),
            "water_ha": round(96 + i * 12 + (4 if i % 2 else -3)),
            "green_ha": round(402 + i * 30),
        })
    return out
