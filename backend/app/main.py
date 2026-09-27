"""JalDrishti FastAPI application (SIH PS15)."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .api.v1.router import api_router
from .config import settings

app = FastAPI(
    title=settings.app_name,
    version=__version__,
    description=(
        "Watershed Geo-Coded Image Analysis API. Phase-1: real spectral-index, "
        "change-detection, health, EXIF & validation logic; async job pipeline; "
        "PostGIS persistence. Demo data is synthetic — not official DRISHTI/SRISHTI."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "service": settings.app_name, "version": __version__}


@app.get("/api/v1/provenance", tags=["system"])
def provenance():
    return {
        "imagery": "Sentinel-2 L2A (demo surrogate) · 10 m · B2/B3/B4/B8/B11",
        "dem": "Copernicus GLO-30 DEM (30 m)",
        "boundary": "IWMP micro-watershed delineation (demo)",
        "photos": "Consented demo field photos (DRISHTI-style schema)",
        "cloud_threshold": f"<= {settings.cloud_threshold_pct}% scene cloud",
        "metric_crs": settings.metric_crs,
        "note": (
            "Phase-1 demonstration data. Figures are synthetic and illustrate the "
            "workflow; they are not official DRISHTI/SRISHTI results and are not a "
            "causal impact claim."
        ),
    }
