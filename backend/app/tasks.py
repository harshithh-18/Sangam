"""Async pipeline tasks (Celery).

These are reproducible, idempotent job bodies. The index / change / health
math is REAL (app.geo). Raster I/O and model inference are stubbed with clear
TODO markers where your data + trained models plug in (see next-phase checklist
in backend/README.md). Each task updates its AnalysisRun row so the UI job queue
reflects live status.
"""
from __future__ import annotations

import time
from datetime import datetime, timezone

from .celery_app import celery_app
from .db import SessionLocal
from .geo import health as health_mod
from .geo import indices as idx
from .models import AnalysisRun, DerivedLayer


def _update_run(run_id: str, **fields) -> None:
    db = SessionLocal()
    try:
        run = db.get(AnalysisRun, run_id)
        if run is None:
            return
        for k, v in fields.items():
            setattr(run, k, v)
        db.commit()
    finally:
        db.close()


@celery_app.task(bind=True, name="analysis.compute_index")
def compute_index(self, run_id: str, watershed_id: str, index: str, epoch: str, sensor: str):
    """Compute a spectral index raster for a watershed/epoch.

    REAL math via app.geo.indices. TODO(next-phase): replace the synthetic band
    arrays with rasterio reads of the clipped, cloud-masked scene for `epoch`.
    """
    _update_run(run_id, status="running", progress=10,
                started_at=datetime.now(timezone.utc))
    time.sleep(0.2)

    import numpy as np  # local import keeps worker-only dep out of API path

    # --- STUB INPUT: replace with rasterio.open(scene).read(bands) ---
    rng = np.random.default_rng(abs(hash((watershed_id, epoch))) % (2**32))
    shape = (64, 64)
    red = rng.uniform(0.05, 0.25, shape)
    nir = rng.uniform(0.20, 0.55, shape)
    green = rng.uniform(0.05, 0.30, shape)
    swir = rng.uniform(0.10, 0.40, shape)
    blue = rng.uniform(0.02, 0.20, shape)

    if index == "ndvi":
        arr = idx.ndvi(nir, red)
    elif index == "ndwi":
        arr = idx.ndwi(green, nir)
    elif index == "ndbi":
        arr = idx.ndbi(swir, nir)
    elif index == "mndwi":
        arr = idx.mndwi(green, swir)
    elif index == "savi":
        arr = idx.savi(nir, red)
    elif index == "bsi":
        arr = idx.bsi(swir, red, nir, blue)
    else:
        _update_run(run_id, status="failed", error=f"unknown index {index}")
        return {"status": "failed"}

    _update_run(run_id, progress=70)
    stats = {
        "index": index, "epoch": epoch, "sensor": sensor,
        "mean": float(np.nanmean(arr)), "min": float(np.nanmin(arr)),
        "max": float(np.nanmax(arr)), "valid_px": int(np.sum(~np.isnan(arr))),
    }

    db = SessionLocal()
    try:
        db.add(DerivedLayer(
            id=f"layer_{run_id}", run_id=run_id, layer_type=index,
            date_end=epoch, crs="EPSG:4326", style_version="v1",
            statistics_json=stats,
        ))
        db.commit()
    finally:
        db.close()

    _update_run(run_id, status="completed", progress=100,
                completed_at=datetime.now(timezone.utc))
    return {"status": "completed", "statistics": stats}


@celery_app.task(bind=True, name="analysis.change_detection")
def change_detection(self, run_id: str, watershed_id: str, index: str,
                     epoch_before: str, epoch_after: str, threshold: float, sensor: str):
    """Index-difference change detection (REAL math). TODO(next-phase): read the
    two co-registered, cloud-masked scenes instead of synthetic arrays."""
    _update_run(run_id, status="running", progress=15,
                started_at=datetime.now(timezone.utc))
    time.sleep(0.2)

    import numpy as np
    rng = np.random.default_rng(abs(hash((watershed_id, index))) % (2**32))
    shape = (64, 64)
    before = np.clip(rng.normal(0.35, 0.12, shape), -0.1, 0.9)
    after = np.clip(before + rng.normal(0.05, 0.1, shape), -0.1, 0.9)

    delta, cls = idx.difference(after, before, threshold=threshold)
    gain = int(np.sum(cls == 1)); loss = int(np.sum(cls == -1)); stable = int(np.sum(cls == 0))
    total = gain + loss + stable
    stats = {
        "index": index, "epoch_before": epoch_before, "epoch_after": epoch_after,
        "threshold": threshold, "gain_px": gain, "loss_px": loss, "stable_px": stable,
        "gain_pct": round(100 * gain / total, 1), "loss_pct": round(100 * loss / total, 1),
        "mean_delta": float(np.nanmean(delta)),
    }
    _update_run(run_id, progress=80)

    db = SessionLocal()
    try:
        db.add(DerivedLayer(
            id=f"layer_{run_id}", run_id=run_id, layer_type="change",
            date_start=epoch_before, date_end=epoch_after, crs="EPSG:4326",
            style_version="v1", statistics_json=stats,
        ))
        db.commit()
    finally:
        db.close()

    _update_run(run_id, status="completed", progress=100,
                completed_at=datetime.now(timezone.utc))
    return {"status": "completed", "statistics": stats}


@celery_app.task(bind=True, name="analysis.zonal_stats")
def zonal_stats(self, run_id: str, watershed_id: str):
    """Per micro-watershed zonal statistics + composite health (REAL health math).
    TODO(next-phase): use rasterstats over the derived index rasters + boundaries."""
    _update_run(run_id, status="running", progress=20,
                started_at=datetime.now(timezone.utc))
    time.sleep(0.2)
    from .demo import MICRO_WATERSHEDS, PILOT

    results = []
    for m in MICRO_WATERSHEDS:
        hr = health_mod.composite_health(
            ndvi_mean=m["ndvi"], ndwi_mean=0.2, interventions=m["interventions"],
            area_ha=PILOT["area_ha"] / len(MICRO_WATERSHEDS), barren_fraction=0.2,
        )
        results.append({"id": m["id"], "health": hr.score, "band": hr.band})

    _update_run(run_id, status="completed", progress=100,
                completed_at=datetime.now(timezone.utc))
    return {"status": "completed", "results": results}
