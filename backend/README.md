# Sangam Backend — SIH PS15

FastAPI + PostGIS + Celery/Redis service for the Watershed Geo-Coded Image
Analysis system. Implements the target architecture in `../PROJECT_CONTEXT.md`
(§4–§7): async job pipeline, spatial persistence, REST API, and **real** spectral
-index / change-detection / health / EXIF / validation logic.

> ⚠️ Demo data is **synthetic** (deterministic, `app/demo.py`). It is not official
> DRISHTI/SRISHTI data and makes no causal claim. Model inference and raster I/O
> are stubbed with clear `TODO(next-phase)` markers where your data/models plug in.

## What's real vs. stubbed

| Real & tested now | Stubbed (next phase — needs your data/models) |
| --- | --- |
| Spectral indices NDVI/NDWI/NDBI/MNDWI/SAVI/BSI (safe divide, mask, clip) | Reading actual Sentinel-2/LISS-IV rasters (`rasterio`) into the index functions |
| Change detection (index differencing + classes) | Cloud masking, co-registration of real scenes |
| Composite health score (documented weighting) | Calibrated weights validated against ground truth |
| EXIF extraction + point-in-polygon / bounds / time / dup validation | — |
| Async Celery jobs (queued→running→completed) writing `analysis_runs` | Random-Forest LULC + trained photo classifier (ResNet/EfficientNet/YOLO) |
| PostGIS schema + spatial indexes + seeded demo watershed | GeoServer OGC tile serving; PDF report rendering (ReportLab/WeasyPrint) |
| REST API v1 (16 paths) + OpenAPI docs | RBAC / auth |

## Run — full stack (recommended)

From the **repo root** (needs Docker Desktop running):

```bash
docker compose up --build            # db (PostGIS) + redis + api + worker
docker compose run --rm api python -m scripts.seed   # load demo data (once)
```

- API:      http://localhost:8000  ·  Swagger UI: http://localhost:8000/docs
- Postgres: localhost:5432 (jaldrishti/jaldrishti)
- Redis:    localhost:6379

Then point the frontend at it: in the repo root create `.env` with
`VITE_API_URL=http://localhost:8000` and restart `npm run dev`.

## Run — API only, local Python (no Docker for the app)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# needs a reachable PostGIS + Redis (e.g. `docker compose up -d db redis` from root)
export POSTGRES_HOST=localhost REDIS_URL=redis://localhost:6379/0
python -m scripts.seed
uvicorn app.main:app --reload --port 8000
# worker (separate shell). On macOS add: --pool=solo
celery -A app.celery_app.celery_app worker --loglevel=info
```

## Tests

```bash
cd backend && pip install pytest numpy && pytest        # 23 passing
```
Covers band formulas, zero-denominator/mask/clip safety, change classes,
CRS-independent validation, and the health model.

## Migrations (Alembic)

```bash
cd backend && alembic upgrade head     # enables PostGIS + creates schema
```
(`scripts/seed.py` also creates the schema for convenience.)

## Key endpoints (v1)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness |
| GET | `/api/v1/provenance` | Data sources + caveats |
| GET | `/api/v1/watersheds` / `/{id}` | Watershed + micro-watersheds |
| GET | `/api/v1/watersheds/{id}/boundary` | GeoJSON boundary |
| GET | `/api/v1/watersheds/{id}/timeseries` | NDVI/NDWI/water per epoch |
| GET | `/api/v1/watersheds/{id}/lulc` | LULC T0 vs T5 |
| GET | `/api/v1/interventions` | Filterable field interventions |
| GET | `/api/v1/interventions/{id}` | One intervention + satellite evidence |
| POST | `/api/v1/photos/ingest` | Upload photo → EXIF → validate → classify(stub) |
| POST | `/api/v1/analysis/index` | Dispatch index job |
| POST | `/api/v1/analysis/change` | Dispatch change-detection job |
| POST | `/api/v1/analysis/zonal` | Dispatch zonal-stats job |
| POST | `/api/v1/analysis/health-score` | Composite health (sync) |
| GET | `/api/v1/jobs` / `/{id}` | Async job status |

## Layout

```
backend/
  app/
    main.py            FastAPI app + CORS + system routes
    config.py          env settings (12-factor)
    db.py models.py    SQLAlchemy + GeoAlchemy2 (PROJECT_CONTEXT §5 data model)
    schemas.py         Pydantic contracts
    celery_app.py tasks.py   async pipeline (real index/change/health math)
    demo.py            deterministic synthetic data (mirrors frontend)
    geo/
      indices.py       spectral indices (pure NumPy, tested)
      band_maps.py     versioned sensor band mappings
      validate.py      coordinate/photo validation (pure Python, tested)
      health.py        composite health model (tested)
      exif.py          Pillow EXIF extraction
    api/v1/            routers: watersheds, interventions, analysis, photos
  alembic/             migrations
  scripts/seed.py      load demo data into PostGIS
  tests/               pytest (indices, validate, health)
```
