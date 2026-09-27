# Sangam — Watershed Intelligence Platform (SIH PS15)

**Phase-1 demonstration UI** for the Watershed Geo-Coded Image Analysis system.
Built to match the target stack (React + Leaflet + Tailwind + Recharts) so it can be
screenshotted as the real product for the SIH pitch deck.

> ⚠️ **All data is synthetic**, generated deterministically for UI demonstration only.
> It is **not** derived from official DRISHTI/SRISHTI sources and makes no causal claim.
> See `PROJECT_CONTEXT.md` for the full plan, provenance rules, and next phases.

## Run

```bash
npm install      # first time only
npm run dev      # → http://localhost:5180
```

Build a static bundle: `npm run build` (output in `dist/`), preview with `npm run preview`.

## Views (each is a clean screenshot for the deck)

| View | What it shows |
| --- | --- |
| **Dashboard** | Composite health gauge, KPI tiles, NDVI/NDWI trend, LULC T0→T5 bars, intervention mix, micro-watershed scorecard, live upload feed & async job queue. |
| **Map Explorer** | Leaflet map with satellite/dark basemaps, switchable NDVI / NDWI / LULC / change rasters, watershed boundary, Strahler drainage, geo-coded intervention markers with rich popups (AI class + confidence + satellite evidence), temporal T0–T5 slider. |
| **Change Detection** | Draggable before/after NDVI swipe, greening/loss summary, LULC transition matrix, quality caveats. |
| **Interventions** | Searchable/filterable field-photo gallery with AI classification, agreement check, and satellite-evidence linkage. |
| **Reports & Export** | Institutional PDF report preview + PDF/GeoTIFF/GeoJSON/CSV export options and provenance manifest. |

## Screenshot tips for the PPT

- Use a maximized browser window (≥1440px wide) for the intended desktop layout.
- On **Map Explorer**, let tiles finish loading, pick the *Satellite* basemap + *NDVI* raster,
  and click a marker so a popup is visible — that single frame tells the whole story.
- On **Change Detection**, drag the swipe handle to ~50% before capturing.

## What is real vs. next phase

Real now: full front-end, all views, interactions, charts, map, mocked reproducible
pipeline/job UI. Next phases (need your data/models/API access): FastAPI + PostGIS backend,
real Sentinel-2 ingestion, Random-Forest LULC, trained photo classifier, live change jobs.
