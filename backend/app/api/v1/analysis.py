"""Analysis job endpoints — dispatch async tasks, expose status (§7)."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ... import tasks
from ...config import settings
from ...db import get_db
from ...geo import health as health_mod
from ...models import AnalysisRun
from ...schemas import ChangeRequest, HealthRequest, IndexRequest, JobOut

router = APIRouter(tags=["analysis"])


def _dispatch(task, run_id: str, args: list):
    """Try async (Celery worker); fall back to inline eager run if no broker.
    Either way the AnalysisRun row reflects final status for the UI."""
    try:
        task.delay(run_id, *args)
        return "queued"
    except Exception:
        # Broker unavailable (e.g. Redis down) — run synchronously so the demo
        # still produces a result. apply() executes locally.
        task.apply(args=[run_id, *args])
        return "eager"


def _new_run(db: Session, run_type: str, params: dict) -> AnalysisRun:
    run = AnalysisRun(
        id=f"run_{uuid.uuid4().hex[:8]}", run_type=run_type, parameters_json=params,
        status="queued", progress=0, code_version="api-0.1.0",
        started_at=datetime.now(timezone.utc), watershed_id=params.get("watershed_id"),
    )
    db.add(run)
    db.commit()
    return run


@router.post("/analysis/index", response_model=JobOut)
def run_index(req: IndexRequest, db: Session = Depends(get_db)):
    if req.index not in ("ndvi", "ndwi", "ndbi", "mndwi", "savi", "bsi"):
        raise HTTPException(400, f"unsupported index {req.index}")
    run = _new_run(db, f"Spectral index ({req.index.upper()} {req.epoch})", req.model_dump())
    _dispatch(tasks.compute_index, run.id, [req.watershed_id, req.index, req.epoch, req.sensor])
    db.refresh(run)
    return JobOut(id=run.id, run_type=run.run_type, status=run.status,
                  progress=run.progress, parameters=run.parameters_json, error=run.error)


@router.post("/analysis/change", response_model=JobOut)
def run_change(req: ChangeRequest, db: Session = Depends(get_db)):
    run = _new_run(db, f"Change detection ({req.index.upper()} {req.epoch_before}->{req.epoch_after})", req.model_dump())
    _dispatch(tasks.change_detection, run.id,
              [req.watershed_id, req.index, req.epoch_before, req.epoch_after, req.threshold, req.sensor])
    db.refresh(run)
    return JobOut(id=run.id, run_type=run.run_type, status=run.status,
                  progress=run.progress, parameters=run.parameters_json, error=run.error)


@router.post("/analysis/zonal", response_model=JobOut)
def run_zonal(watershed_id: str, db: Session = Depends(get_db)):
    run = _new_run(db, "Zonal statistics (6 micro-watersheds)", {"watershed_id": watershed_id})
    _dispatch(tasks.zonal_stats, run.id, [watershed_id])
    db.refresh(run)
    return JobOut(id=run.id, run_type=run.run_type, status=run.status,
                  progress=run.progress, parameters=run.parameters_json, error=run.error)


@router.get("/jobs", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db), limit: int = 20):
    rows = db.execute(
        select(AnalysisRun).order_by(AnalysisRun.started_at.desc()).limit(limit)
    ).scalars().all()
    return [JobOut(id=r.id, run_type=r.run_type, status=r.status, progress=r.progress,
                   parameters=r.parameters_json, error=r.error) for r in rows]


@router.get("/jobs/{run_id}", response_model=JobOut)
def get_job(run_id: str, db: Session = Depends(get_db)):
    r = db.get(AnalysisRun, run_id)
    if not r:
        raise HTTPException(404, "run not found")
    return JobOut(id=r.id, run_type=r.run_type, status=r.status, progress=r.progress,
                  parameters=r.parameters_json, error=r.error)


@router.post("/analysis/health-score")
def health_score(req: HealthRequest):
    """Composite watershed health — synchronous, lightweight (REAL math)."""
    hr = health_mod.composite_health(
        ndvi_mean=req.ndvi_mean, ndwi_mean=req.ndwi_mean, interventions=req.interventions,
        area_ha=req.area_ha, barren_fraction=req.barren_fraction, weights=req.weights,
    )
    return {"score": hr.score, "band": hr.band, "components": hr.components,
            "model_version": hr.model_version,
            "caveat": "Analytical index, not a causal impact claim."}
