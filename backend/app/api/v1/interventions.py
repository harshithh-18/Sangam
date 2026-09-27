"""Field-intervention endpoints (photo + inference + satellite evidence)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from geoalchemy2.shape import to_shape
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...db import get_db
from ...models import FieldPhoto, InterventionAssessment, PhotoInference
from ...schemas import InterventionOut

router = APIRouter(prefix="/interventions", tags=["interventions"])


def _row_to_out(db: Session, p: FieldPhoto) -> InterventionOut:
    inf = db.execute(
        select(PhotoInference).where(PhotoInference.photo_id == p.id)
    ).scalars().first()
    assess = db.execute(
        select(InterventionAssessment).where(InterventionAssessment.photo_id == p.id)
    ).scalars().first()
    pt = to_shape(p.geom)
    tags = p.user_tags_json or {}
    sat = (assess.satellite_evidence_json if assess else {}) or {}
    return InterventionOut(
        id=p.id,
        type=inf.label if inf else "other",
        type_label=tags.get("type_label", inf.label if inf else "Other"),
        lat=round(pt.y, 5), lng=round(pt.x, 5),
        confidence=inf.confidence if inf else 0.0,
        user_tag=tags.get("user_tag"),
        agreement=tags.get("agreement"),
        status=p.review_status,
        captured_at=p.captured_at.date().isoformat() if p.captured_at else None,
        epoch=p.epoch,
        model_version=inf.model_version if inf else None,
        mws=p.micro_watershed_id,
        mws_name=tags.get("mws_name"),
        water_gain=sat.get("water_gain"),
        ndvi_gain=sat.get("ndvi_gain"),
        buffer_m=assess.spatial_buffer_m if assess else None,
        window_days=assess.time_window_days if assess else None,
    )


@router.get("", response_model=list[InterventionOut])
def list_interventions(
    db: Session = Depends(get_db),
    watershed_id: str | None = None,
    type: str | None = None,
    status: str | None = None,
    limit: int = Query(200, le=1000),
):
    stmt = select(FieldPhoto)
    if watershed_id:
        stmt = stmt.where(FieldPhoto.watershed_id == watershed_id)
    if status:
        stmt = stmt.where(FieldPhoto.review_status == status)
    rows = db.execute(stmt.limit(limit)).scalars().all()
    out = [_row_to_out(db, p) for p in rows]
    if type:
        out = [o for o in out if o.type == type]
    return out


@router.get("/{intervention_id}", response_model=InterventionOut)
def get_intervention(intervention_id: str, db: Session = Depends(get_db)):
    p = db.get(FieldPhoto, intervention_id)
    if not p:
        raise HTTPException(404, "intervention not found")
    return _row_to_out(db, p)
