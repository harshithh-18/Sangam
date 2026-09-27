"""SQLAlchemy + GeoAlchemy2 ORM models.

Mirrors the logical data model in PROJECT_CONTEXT.md §5. Source data is
immutable; derived artifacts are versioned. Geometry columns use PostGIS
with spatial indexes (see migration 0001).
"""
from __future__ import annotations

from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import (
    JSON, DateTime, Float, ForeignKey, Integer, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Watershed(Base):
    __tablename__ = "watersheds"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    project_code: Mapped[str | None] = mapped_column(String)
    district: Mapped[str | None] = mapped_column(String)
    block: Mapped[str | None] = mapped_column(String)
    state: Mapped[str | None] = mapped_column(String)
    area_ha: Mapped[float | None] = mapped_column(Float)
    crs: Mapped[str] = mapped_column(String, default="EPSG:4326")
    boundary_geom: Mapped[object] = mapped_column(Geometry("POLYGON", srid=4326))
    source: Mapped[str | None] = mapped_column(String)
    version: Mapped[str] = mapped_column(String, default="v1")

    micro_watersheds: Mapped[list["MicroWatershed"]] = relationship(back_populates="watershed")


class MicroWatershed(Base):
    __tablename__ = "micro_watersheds"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    watershed_id: Mapped[str] = mapped_column(ForeignKey("watersheds.id"))
    name: Mapped[str] = mapped_column(String)
    health_score: Mapped[int | None] = mapped_column(Integer)
    trend: Mapped[int | None] = mapped_column(Integer)
    mean_ndvi: Mapped[float | None] = mapped_column(Float)
    water_ha: Mapped[float | None] = mapped_column(Float)
    intervention_count: Mapped[int | None] = mapped_column(Integer)
    centroid_geom: Mapped[object] = mapped_column(Geometry("POINT", srid=4326))
    version: Mapped[str] = mapped_column(String, default="v1")

    watershed: Mapped[Watershed] = relationship(back_populates="micro_watersheds")


class FieldPhoto(Base):
    __tablename__ = "field_photos"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    watershed_id: Mapped[str | None] = mapped_column(ForeignKey("watersheds.id"))
    micro_watershed_id: Mapped[str | None] = mapped_column(String)
    project_code: Mapped[str | None] = mapped_column(String)
    captured_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    geom: Mapped[object] = mapped_column(Geometry("POINT", srid=4326))
    original_uri: Mapped[str | None] = mapped_column(String)
    exif_json: Mapped[dict | None] = mapped_column(JSON)
    user_tags_json: Mapped[dict | None] = mapped_column(JSON)
    gps_status: Mapped[str | None] = mapped_column(String)
    review_status: Mapped[str] = mapped_column(String, default="review")  # valid|flagged|rejected|verified
    review_reasons: Mapped[dict | None] = mapped_column(JSON)
    checksum: Mapped[str | None] = mapped_column(String)
    epoch: Mapped[str | None] = mapped_column(String)

    inferences: Mapped[list["PhotoInference"]] = relationship(back_populates="photo")


class PhotoInference(Base):
    __tablename__ = "photo_inferences"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    photo_id: Mapped[str] = mapped_column(ForeignKey("field_photos.id"))
    task: Mapped[str] = mapped_column(String, default="classification")
    label: Mapped[str] = mapped_column(String)
    confidence: Mapped[float] = mapped_column(Float)
    boxes_json: Mapped[dict | None] = mapped_column(JSON)
    reviewed_label: Mapped[str | None] = mapped_column(String)
    model_version: Mapped[str] = mapped_column(String)
    run_id: Mapped[str | None] = mapped_column(String)

    photo: Mapped[FieldPhoto] = relationship(back_populates="inferences")


class SatelliteScene(Base):
    __tablename__ = "satellite_scenes"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    provider: Mapped[str] = mapped_column(String)
    product: Mapped[str] = mapped_column(String)
    acquired_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    bands: Mapped[dict | None] = mapped_column(JSON)
    resolution_m: Mapped[float | None] = mapped_column(Float)
    processing_level: Mapped[str | None] = mapped_column(String)
    cloud_pct: Mapped[float | None] = mapped_column(Float)
    footprint_geom: Mapped[object] = mapped_column(Geometry("POLYGON", srid=4326))
    source_uri: Mapped[str | None] = mapped_column(String)
    epoch: Mapped[str | None] = mapped_column(String)


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    watershed_id: Mapped[str | None] = mapped_column(ForeignKey("watersheds.id"))
    run_type: Mapped[str] = mapped_column(String)
    parameters_json: Mapped[dict | None] = mapped_column(JSON)
    input_versions_json: Mapped[dict | None] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String, default="queued")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    code_version: Mapped[str | None] = mapped_column(String)
    error: Mapped[str | None] = mapped_column(Text)


class DerivedLayer(Base):
    __tablename__ = "derived_layers"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    run_id: Mapped[str | None] = mapped_column(ForeignKey("analysis_runs.id"))
    layer_type: Mapped[str] = mapped_column(String)  # ndvi|ndwi|lulc|change|drainage
    date_start: Mapped[str | None] = mapped_column(String)
    date_end: Mapped[str | None] = mapped_column(String)
    uri: Mapped[str | None] = mapped_column(String)
    crs: Mapped[str | None] = mapped_column(String)
    style_version: Mapped[str | None] = mapped_column(String)
    statistics_json: Mapped[dict | None] = mapped_column(JSON)


class InterventionAssessment(Base):
    __tablename__ = "intervention_assessments"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    photo_id: Mapped[str | None] = mapped_column(ForeignKey("field_photos.id"))
    run_id: Mapped[str | None] = mapped_column(String)
    spatial_buffer_m: Mapped[int | None] = mapped_column(Integer)
    time_window_days: Mapped[int | None] = mapped_column(Integer)
    field_evidence_json: Mapped[dict | None] = mapped_column(JSON)
    satellite_evidence_json: Mapped[dict | None] = mapped_column(JSON)
    confidence: Mapped[float | None] = mapped_column(Float)
    caveats: Mapped[str | None] = mapped_column(Text)


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    watershed_id: Mapped[str | None] = mapped_column(ForeignKey("watersheds.id"))
    run_id: Mapped[str | None] = mapped_column(String)
    uri: Mapped[str | None] = mapped_column(String)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    template_version: Mapped[str | None] = mapped_column(String)
