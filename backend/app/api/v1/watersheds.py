"""Watershed + micro-watershed + timeseries + LULC endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2.shape import to_shape
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...db import get_db
from ...demo import LULC, time_series
from ...models import MicroWatershed, Watershed
from ...schemas import MicroWatershedOut, WatershedOut

router = APIRouter(prefix="/watersheds", tags=["watersheds"])


def _serialize(db: Session, w: Watershed) -> WatershedOut:
    poly = to_shape(w.boundary_geom)
    c = poly.centroid
    micros = db.execute(
        select(MicroWatershed).where(MicroWatershed.watershed_id == w.id)
    ).scalars().all()
    return WatershedOut(
        id=w.id, name=w.name, project_code=w.project_code, district=w.district,
        block=w.block, state=w.state, area_ha=w.area_ha, crs=w.crs,
        center=[round(c.y, 5), round(c.x, 5)],
        micro_watersheds=[
            MicroWatershedOut(
                id=m.id, name=m.name, health=m.health_score, trend=m.trend,
                ndvi=m.mean_ndvi, water=m.water_ha, interventions=m.intervention_count,
                centroid=[to_shape(m.centroid_geom).y, to_shape(m.centroid_geom).x],
            ) for m in micros
        ],
    )


@router.get("", response_model=list[WatershedOut])
def list_watersheds(db: Session = Depends(get_db)):
    rows = db.execute(select(Watershed)).scalars().all()
    return [_serialize(db, w) for w in rows]


@router.get("/{watershed_id}", response_model=WatershedOut)
def get_watershed(watershed_id: str, db: Session = Depends(get_db)):
    w = db.get(Watershed, watershed_id)
    if not w:
        raise HTTPException(404, "watershed not found")
    return _serialize(db, w)


@router.get("/{watershed_id}/boundary")
def get_boundary(watershed_id: str, db: Session = Depends(get_db)):
    """GeoJSON boundary Feature (map layer)."""
    w = db.get(Watershed, watershed_id)
    if not w:
        raise HTTPException(404, "watershed not found")
    from shapely.geometry import mapping
    return {
        "type": "Feature",
        "properties": {"name": w.name, "code": w.project_code},
        "geometry": mapping(to_shape(w.boundary_geom)),
    }


@router.get("/{watershed_id}/timeseries")
def get_timeseries(watershed_id: str, db: Session = Depends(get_db)):
    if not db.get(Watershed, watershed_id):
        raise HTTPException(404, "watershed not found")
    return {"watershed_id": watershed_id, "series": time_series(),
            "provenance": {"source": "Sentinel-2 L2A (demo)", "method": "mean index per epoch"}}


@router.get("/{watershed_id}/lulc")
def get_lulc(watershed_id: str, db: Session = Depends(get_db)):
    if not db.get(Watershed, watershed_id):
        raise HTTPException(404, "watershed not found")
    return {"watershed_id": watershed_id, "T0": LULC["T0"], "T5": LULC["T5"],
            "method": "Random Forest (demo classification)"}
