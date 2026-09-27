"""Unit tests for coordinate / photo validation (pure Python)."""
from app.geo import validate as v

# A simple square around a point in Beed, MH (matches demo BBOX-ish).
RING = [[75.70, 19.00], [75.82, 19.00], [75.82, 19.09], [75.70, 19.09], [75.70, 19.00]]


def test_point_in_ring_inside():
    assert v.point_in_ring(75.76, 19.045, RING) is True


def test_point_in_ring_outside():
    assert v.point_in_ring(76.5, 19.045, RING) is False


def test_valid_point():
    r = v.validate_photo_point(75.76, 19.045, boundary_ring=RING, captured_at="2024-03-01T10:00:00")
    assert r.ok
    assert r.reasons == []


def test_outside_boundary_rejected():
    r = v.validate_photo_point(80.0, 19.045, boundary_ring=RING)
    assert r.status == "rejected"
    assert "outside_declared_watershed" in r.reasons


def test_out_of_global_bounds_rejected():
    r = v.validate_photo_point(200.0, 19.0)
    assert r.status == "rejected"


def test_future_timestamp_flagged():
    r = v.validate_photo_point(75.76, 19.045, boundary_ring=RING, captured_at="2099-01-01T00:00:00")
    assert r.status == "flagged"
    assert "timestamp_in_future" in r.reasons


def test_invalid_timestamp_flagged():
    r = v.validate_photo_point(75.76, 19.045, boundary_ring=RING, captured_at="not-a-date")
    assert "invalid_timestamp" in r.reasons


def test_duplicate_hash_flagged():
    seen = {"abc123"}
    r = v.validate_photo_point(75.76, 19.045, boundary_ring=RING, file_hash="abc123", seen_hashes=seen)
    assert "duplicate_hash" in r.reasons
