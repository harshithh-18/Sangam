"""Field-photo / coordinate validation (PROJECT_CONTEXT.md §5 ingestion rules).

Pure Python (no shapely) so it is unit-testable anywhere and mirrors the
frontend point-in-polygon logic. Returns reviewable reasons, never silently
'corrects' a record.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class ValidationResult:
    status: str  # "valid" | "flagged" | "rejected"
    reasons: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return self.status == "valid"


def point_in_ring(lng: float, lat: float, ring: list[list[float]]) -> bool:
    """Ray-casting point-in-polygon. `ring` is [[lng,lat], ...]."""
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > lat) != (yj > lat):
            x_cross = (xj - xi) * (lat - yi) / (yj - yi) + xi
            if lng < x_cross:
                inside = not inside
        j = i
    return inside


def coords_in_bounds(lng: float, lat: float) -> bool:
    return -180.0 <= lng <= 180.0 and -90.0 <= lat <= 90.0


def looks_swapped(lng: float, lat: float) -> bool:
    """Heuristic: lat/lng order swapped (common ingestion error) for India AOI."""
    india_lng = 68.0 <= lat <= 98.0   # if 'lat' actually holds a longitude
    india_lat = 6.0 <= lng <= 38.0    # if 'lng' actually holds a latitude
    return india_lng and india_lat


def validate_photo_point(
    lng: float,
    lat: float,
    boundary_ring: list[list[float]] | None = None,
    captured_at: str | None = None,
    seen_hashes: set[str] | None = None,
    file_hash: str | None = None,
) -> ValidationResult:
    reasons: list[str] = []
    status = "valid"

    if not coords_in_bounds(lng, lat):
        return ValidationResult("rejected", ["coordinates_out_of_global_bounds"])

    if looks_swapped(lng, lat):
        reasons.append("possible_lat_lng_swap")
        status = "flagged"

    if captured_at is not None:
        try:
            dt = datetime.fromisoformat(captured_at.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt > datetime.now(timezone.utc):
                reasons.append("timestamp_in_future")
                status = "flagged"
        except (ValueError, TypeError):
            reasons.append("invalid_timestamp")
            status = "flagged"

    if file_hash and seen_hashes is not None and file_hash in seen_hashes:
        reasons.append("duplicate_hash")
        status = "flagged"

    if boundary_ring is not None:
        if not point_in_ring(lng, lat, boundary_ring):
            reasons.append("outside_declared_watershed")
            # outside boundary is a hard reject unless already only flagged-swap
            status = "rejected"

    return ValidationResult(status, reasons)
