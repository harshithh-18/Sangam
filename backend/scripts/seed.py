"""Seed PostGIS with the deterministic demo dataset.

Run: python -m scripts.seed  (from backend/, with DB reachable)
Idempotent: drops+recreates the demo rows. Enables PostGIS, creates tables,
then inserts the watershed, micro-watersheds, field photos, inferences,
satellite scenes, intervention assessments and a couple of analysis runs so the
frontend runs end-to-end against a live API.
"""
from __future__ import annotations

import sys
from datetime import datetime, timezone

from geoalchemy2.shape import from_shape
from shapely.geometry import Point, Polygon
from sqlalchemy import text

# Allow running as `python -m scripts.seed` or `python scripts/seed.py`
sys.path.insert(0, ".")

from app.db import Base, SessionLocal, engine  # noqa: E402
from app.demo import (  # noqa: E402
    BOUNDARY, EPOCHS, MICRO_WATERSHEDS, PILOT, make_interventions,
)
from app.models import (  # noqa: E402
    AnalysisRun, DerivedLayer, FieldPhoto, InterventionAssessment,
    MicroWatershed, PhotoInference, SatelliteScene, Watershed,
)


def _pt(lng, lat):
    return from_shape(Point(lng, lat), srid=4326)


def init_db():
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()
    Base.metadata.create_all(engine)


def seed():
    init_db()
    db = SessionLocal()
    try:
        # wipe demo rows (respect FK order)
        for model in (DerivedLayer, AnalysisRun, InterventionAssessment,
                      PhotoInference, FieldPhoto, SatelliteScene,
                      MicroWatershed, Watershed):
            db.query(model).delete()
        db.commit()

        # ── watershed ──
        poly = Polygon(BOUNDARY)
        w = Watershed(
            id=PILOT["id"], name=PILOT["name"], project_code=PILOT["project_code"],
            district=PILOT["district"], block=PILOT["block"], state=PILOT["state"],
            area_ha=PILOT["area_ha"], crs=PILOT["crs"],
            boundary_geom=from_shape(poly, srid=4326),
            source="IWMP delineation (demo)", version="v1",
        )
        db.add(w)
        db.flush()  # ensure parent watershed row exists before FK children

        # ── micro-watersheds ──
        for m in MICRO_WATERSHEDS:
            db.add(MicroWatershed(
                id=m["id"], watershed_id=PILOT["id"], name=m["name"],
                health_score=m["health"], trend=m["trend"], mean_ndvi=m["ndvi"],
                water_ha=m["water"], intervention_count=m["interventions"],
                centroid_geom=_pt(m["c"][0], m["c"][1]), version="v1",
            ))

        # ── satellite scenes (T0..T5) ──
        for e in EPOCHS:
            db.add(SatelliteScene(
                id=f"S2_{e['id']}", provider="ESA/Copernicus (demo)",
                product="Sentinel-2 L2A", acquired_at=datetime.fromisoformat(e["date"] + "T05:30:00+00:00"),
                bands={"blue": "B2", "green": "B3", "red": "B4", "nir": "B8", "swir": "B11"},
                resolution_m=10.0, processing_level="L2A", cloud_pct=float(e["cloud"]),
                footprint_geom=from_shape(poly, srid=4326),
                source_uri="demo://scenes/" + e["id"], epoch=e["id"],
            ))

        # ── field photos + inferences + assessments ──
        for iv in make_interventions(50):
            db.add(FieldPhoto(
                id=iv["id"], watershed_id=PILOT["id"], micro_watershed_id=iv["mws"],
                project_code=PILOT["project_code"],
                captured_at=datetime.fromisoformat(iv["captured_at"] + "T00:00:00+00:00"),
                geom=_pt(iv["lng"], iv["lat"]), original_uri=f"demo://photos/{iv['id']}.jpg",
                exif_json={"raw_present": True},
                user_tags_json={"user_tag": iv["user_tag"], "type_label": iv["type_label"],
                                "agreement": iv["agreement"], "mws_name": iv["mws_name"]},
                gps_status="ok", review_status=iv["status"], epoch=iv["epoch"],
                checksum="demo",
            ))
            db.add(PhotoInference(
                photo_id=iv["id"], task="classification", label=iv["type"],
                confidence=iv["confidence"], model_version=iv["model_version"],
            ))
            db.add(InterventionAssessment(
                id=f"AS-{iv['id']}", photo_id=iv["id"],
                spatial_buffer_m=iv["buffer_m"], time_window_days=iv["window_days"],
                field_evidence_json={"class": iv["type_label"], "confidence": iv["confidence"]},
                satellite_evidence_json={"water_gain": iv["water_gain"], "ndvi_gain": iv["ndvi_gain"]},
                confidence=iv["confidence"],
                caveats="Co-located evidence within declared buffer/window; not proof of causality.",
            ))
        db.flush()  # photos/inferences/assessments persisted before runs

        # ── a couple of finished + running analysis runs ──
        now = datetime.now(timezone.utc)
        db.add(AnalysisRun(
            id="run_seed01", watershed_id=PILOT["id"],
            run_type="Change detection (NDVI T4->T5)", status="completed", progress=100,
            parameters_json={"index": "ndvi", "epoch_before": "T4", "epoch_after": "T5"},
            started_at=now, completed_at=now, code_version="api-0.1.0",
        ))
        db.add(AnalysisRun(
            id="run_seed02", watershed_id=PILOT["id"],
            run_type="Zonal statistics (6 micro-watersheds)", status="running", progress=64,
            parameters_json={"watershed_id": PILOT["id"]}, started_at=now, code_version="api-0.1.0",
        ))

        db.commit()
        counts = {
            "watersheds": db.query(Watershed).count(),
            "micro_watersheds": db.query(MicroWatershed).count(),
            "field_photos": db.query(FieldPhoto).count(),
            "scenes": db.query(SatelliteScene).count(),
        }
        print("✓ Seed complete:", counts)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
