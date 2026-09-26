# SIH PS15 — Watershed Geo-Coded Image Analysis

> **Purpose:** This is the persistent project handoff for every person or agent working in this repository. Read it before changing code, data, infrastructure, or scope. Update the **Current state** and **Decision log** when work changes the project.

## Current state

| Item | Status |
| --- | --- |
| Repository | Newly initialized/empty; no application code, datasets, environment, or deployment files exist yet. |
| Source reviewed | Pages **1–20** of the supplied 22-page design PDF were reviewed on 2026-09-26. Pages 21–22 were intentionally not used. |
| Phase | Planning / foundation not started. |
| Validated access | None. Access to DRISHTI, SRISHTI/Bhuvan, GEE, and any official datasets is **not yet verified**. |
| Models | None trained or selected in code. All model names below are proposals. |
| Immediate next milestone | Prove one end-to-end demo path: a watershed boundary + sample field photo(s) + two satellite dates → indices/change result → map/dashboard. |

### Update protocol

- Keep this file factual. Mark planned work as **proposed**, not done.
- For each meaningful change, update the table above, the relevant checklist, and the decision log.
- Never put credentials, API keys, personal data, or raw field-photo URLs here.
- Preserve data provenance: source, license/permission, acquisition date, CRS, spatial resolution, temporal coverage, processing level, and checksum/version.

---

## 1. Product intent

### Problem

India’s IWMP (Integrated Watershed Management Programme) has accumulated geo-tagged field photographs through the DRISHTI Android app. They are primarily documentation points. SRISHTI/Bhuvan provides satellite imagery for watershed areas. The proposed product joins the field and satellite evidence to create actionable watershed monitoring rather than a photo map alone.

### Core value

At the same place and across time, combine:

1. **Field evidence:** a DRISHTI-style geo-coded photograph, timestamp, user tags, and AI interpretation of the intervention.
2. **Spectral evidence:** multi-date satellite imagery, indices, LULC, and detected land/vegetation/water change.

The desired outcome is an explainable, map- and report-ready insight such as: “A check dam is evidenced by a field photo at this location, and nearby satellite analysis reports a measured increase in water extent.” This is an analytical association, **not automatic proof of causality**; confidence, area/time window, and provenance must always be shown.

### Users

- Watershed planners / decision-makers: maps, health summaries, comparisons, reports.
- Analysts: ingest data, run/review processing, inspect uncertainty and exports.
- Field workers: primarily consume the responsive web view; photo capture is handled by the existing DRISHTI workflow in the proposal.
- Admins (later): manage access, projects, jobs, and data sources.

### Domain terms

| Term | Meaning in this project |
| --- | --- |
| IWMP | Integrated Watershed Management Programme: work such as soil conservation, water harvesting, drainage treatment, afforestation, and livelihood support. |
| DRISHTI | Proposed/known Android capture workflow for geo-tagged watershed field photos. Inputs may contain GPS, timestamp, device data, activity tag, project code, and watershed ID. |
| SRISHTI | Proposed/known Bhuvan/NRSC web-GIS satellite-imagery source for watershed monitoring. The PDF mentions time periods T0–T5 and around 30,000 images. |
| Geo-coded image | A field photograph associated with latitude/longitude and usually EXIF time/direction/altitude plus user metadata. |
| Watershed / micro-watershed | The analysis boundary / smaller hydrological units used for statistics and health scoring. |
| LULC | Land Use / Land Cover classification. |
| COG | Cloud-Optimized GeoTIFF: preferred processed raster artifact for efficient map access. |

---

## 2. Scope and outcomes

### Required capability set from the supplied design

1. Ingest and validate geo-coded field photos and metadata.
2. Ingest, clip, quality-control, and time-align satellite imagery.
3. Produce vegetation, water, land-use, and spatial-change analysis.
4. Classify watershed intervention photos; optionally locate structures in photos.
5. Delineate watersheds/drainage from DEM data where required.
6. Merge field and satellite results spatially into an intervention assessment.
7. Serve interactive thematic maps, dashboard metrics, and exports/reports.

### Specific map products

| Product | Primary method / contents |
| --- | --- |
| LULC map | Random Forest or segmentation output; standard NRSC-style colors are proposed. |
| Drainage map | DEM hillshade, extracted stream/nala network, Strahler order. |
| Vegetation health map | NDVI palette: stressed red, moderate yellow, healthy green. |
| Water-body map | NDWI/MNDWI-derived extent plus area measurements. |
| Intervention map | Photo points with category, thumbnail, model result, date, confidence, and provenance. Proposed icons: check dam blue, farm pond green, afforestation brown. |
| Change map | Before/after vegetation, water, or LULC change with dates, masks/matrix, method, and thresholds. |
| Composite health map | A documented weighted score per micro-watershed using NDVI, NDWI, soil moisture, and intervention density. Weights and validation are **open decisions**. |

### Non-goals for the hackathon prototype

- Kubernetes, Kafka/Flink/Kinesis, Terraform, multiple database engines, graph DB, Elasticsearch, server-side 3D/WebGPU, and a separate native mobile app.
- Real-time streaming: data is expected to be batch/periodic; asynchronous jobs suffice.
- Making a causal impact claim solely from a photo and a raster change.
- Treating external-source availability, licenses, resolutions, or official API support as confirmed before verification.

---

## 3. Source fidelity and open questions

This context faithfully captures the **proposal** in pages 1–20, but that PDF is not itself the official problem statement or API documentation. The following statements must be validated before implementation decisions depend on them:

| Claim in the design | Handling rule |
| --- | --- |
| SRISHTI has Cartosat-1/2 at 2.5 m, LISS-IV at 5.8 m, and the PS mentions 30 m data. | Record the actual product, bands, dates, license, and access method for the pilot. Do not conflate sensor resolutions. |
| ~17 lakh DRISHTI geo-tag points and ~30,000 SRISHTI images exist. | Treat as background figures only; no scale/load assumption until a usable dataset is received. |
| Bhuvan exposes usable DRISHTI/SRISHTI access. | First verify official API/export terms. Do not build brittle scraping without permission. |
| GEE/Sentinel Hub can supplement source imagery. | Allowed only after credentials, terms, and attribution requirements are agreed. |
| Photo activity tags are good labels. | Audit label completeness/noise and class imbalance before training. |
| 85–92% photo-classifier accuracy with 500–1000 samples/class. | Aspirational estimate, not an acceptance criterion. Define held-out metrics and class-wise targets. |
| Soil moisture is a key parameter. | Define a feasible source/method and uncertainty; it is not implied by simple optical indices. |

### Decisions that block reliable implementation

1. What exact official PS wording, judging criteria, demo area, and deadline apply?
2. Which one or two pilot watershed(s) and CRS will be used?
3. Which data can the team legally access, redistribute, and demo?
4. Are official DRISHTI exports/API credentials available? If not, use a clearly labelled consented/demo upload dataset.
5. Which satellite product and processing level will be canonical for the MVP? It must supply the bands required by intended indices.
6. What are the two comparison dates and an acceptable cloud threshold?
7. Does the team have labelled photos and segmentation/reference LULC labels? If not, prioritize rule-based indices and a small classifier proof rather than promising deep models.
8. What health-score formula, baseline, uncertainty, and approval process will be used?

---

## 4. Target architecture

```text
Layer 1 — ingestion
  DRISHTI-style photos/metadata | SRISHTI or validated equivalent imagery | DEM/boundaries/soil/rainfall
                                    ↓
Layer 2 — processing & analysis (asynchronous, reproducible jobs)
  A satellite indices + LULC + change  |  B photo classification/detection  |  C integrated spatial analysis
                                    ↓
Layer 3 — persistence and serving
  PostgreSQL + PostGIS | object/file storage | GeoServer OGC layers | FastAPI REST + inference
                                    ↓
Layer 4 — decision support
  React + Leaflet map | time/swipe comparison | metrics | AOI tools | report/export
```

### Data flow

1. Field worker captures a photo, which is uploaded through DRISHTI/Bhuvan or a consented demo uploader.
2. Ingest metadata and original file; extract EXIF independently and validate it.
3. Validate point location against the selected watershed boundary; flag/reject invalid/outlier records rather than silently correcting them.
4. Classify the photo and retain predicted class, probability/confidence, model version, and reviewer status.
5. Select compatible satellite scenes for a spatial buffer/AOI before and after the intervention. Clip, correct/mask, co-register, and version the result.
6. Calculate indices, LULC and/or change products.
7. Join the spatial-temporal evidence using a declared buffer and time-window rule. Create a traceable intervention assessment.
8. Publish derived layers/metrics only after job completion; dashboard, export, and report reference their artifact versions.

### Core technology proposal

| Layer | Proposed choices |
| --- | --- |
| API / jobs | Python 3.11+, FastAPI, Celery + Redis. |
| Database / storage | PostgreSQL 16 + PostGIS 3.4; MinIO/S3 or organized local storage for originals, GeoTIFFs, maps, reports. |
| Map serving | GeoServer with WMS/WFS/WMTS; FastAPI for application APIs/inference. |
| Geospatial | GDAL, Rasterio, GeoPandas, Shapely, Fiona, PyProj, Rasterstats, WhiteboxTools or PySheds. |
| ML | PyTorch/torchvision, scikit-learn, segmentation_models_pytorch, Ultralytics YOLOv8, OpenCV, MLflow, ONNX Runtime. |
| UI | React, Leaflet, Leaflet.TimeDimension, Chart.js/Recharts, Tailwind CSS. |
| Science / prototyping | NumPy, Pandas, Matplotlib + Cartopy, Folium, JupyterLab; GEE Python API only if approved. |
| Delivery | Docker, Docker Compose, GitHub Actions, Nginx. |

Do not install every listed library preemptively. Add a dependency only when its corresponding MVP capability begins.

---

## 5. Inputs, processing contracts, and storage

### Input inventory

| Input | Expected form | Purpose |
| --- | --- | --- |
| Field photo | JPEG/PNG; original retained | Intervention evidence / computer vision. |
| Field metadata | EXIF and/or CSV/JSON | GPS, timestamp, direction/altitude/device if present; activity/project/watershed tags. |
| Satellite scene | Multi-band GeoTIFF / provider-native export | Spectral indices, LULC, change detection. Required bands depend on analysis: RGB, NIR; SWIR for NDBI/MNDWI/BSI. |
| DEM | GeoTIFF, e.g. SRTM 30 m / CartoDEM | Flow, drainage, delineation, slope. |
| Watershed boundary | Shapefile/GeoJSON/PostGIS geometry | Clip/mask, validation, aggregation. |
| Soil map | Vector/raster | Erosion/soil context. |
| Rainfall | CSV/NetCDF, e.g. IMD/CHIRPS | Contextual correlation, not unsupported attribution. |
| Administrative boundary | Vector | District/block reporting aggregation. |

### Minimum metadata contract

Every input and derived artifact must retain: `id`, `source`, `source_asset_id`, `acquired_at`, `ingested_at`, `license_or_permission`, `crs`, `geometry_or_bbox`, `processing_level`, `resolution`, `nodata/cloud_quality`, `checksum`, `storage_uri`, and `pipeline_run_id` where applicable.

For a field photo additionally retain: `captured_at`, `geometry` (WGS84 input preserved), EXIF extraction result, user tags, validation status/reason, watershed/project IDs, and PII review status. Do not expose device/user metadata publicly by default.

### Suggested logical data model (not yet implemented)

```text
watersheds(id, name, project_code, boundary_geom, crs, source, version)
micro_watersheds(id, watershed_id, boundary_geom, version)
field_photos(id, watershed_id, project_code, captured_at, geom, original_uri,
             exif_json, user_tags_json, gps_status, review_status, provenance_id)
photo_inferences(id, photo_id, task, label, confidence, boxes_json, model_version,
                 reviewed_label, run_id)
satellite_scenes(id, provider, product, acquired_at, bands, resolution_m,
                 processing_level, cloud_pct, footprint_geom, source_uri, provenance_id)
analysis_runs(id, watershed_id, run_type, parameters_json, input_versions_json,
              status, started_at, completed_at, code_version, error)
derived_layers(id, run_id, layer_type, date_start, date_end, uri, crs, bbox,
               style_version, statistics_json)
intervention_assessments(id, photo_id, run_id, spatial_buffer_m, time_window_days,
                         field_evidence_json, satellite_evidence_json, confidence, caveats)
reports(id, watershed_id, run_id, uri, generated_at, template_version)
```

Use PostGIS geometry columns and spatial indexes for geometry/footprint/boundaries. Keep large rasters and photo binaries in object/file storage, with metadata and URLs in Postgres. Make source data immutable; derived artifacts are versioned, never overwritten in place.

### Ingestion rules

- Extract EXIF with Pillow or exifread; original EXIF is evidence, but not inherently trustworthy.
- Check coordinate bounds, valid timestamp, duplicate/hash, coordinate order, and whether the point lies within/near the declared watershed; retain a reviewable rejection reason.
- Normalize a **derived copy** to 224×224 or 256×256 for the photo classifier; never replace the original.
- Clip satellite data to the watershed/AOI; use Level-2/pre-corrected imagery where possible, otherwise document atmospheric correction (proposed Py6S).
- Cloud-mask via a source QA band or Sentinel-compatible `s2cloudless` approach, then co-register multi-date inputs before differencing.
- Store processed rasters as COGs and index them with CRS, band mapping, dates, nodata, pixel size, and mask coverage.

---

## 6. Analysis modules

### A. Spectral indices

All index division must handle zero denominators and propagate nodata/masks. Compute with Rasterio + NumPy and store single-band GeoTIFF/COG outputs.

| Index | Formula | Use |
| --- | --- | --- |
| NDVI | `(NIR - Red) / (NIR + Red)` | Vegetation health/density, afforestation/crop/greening trend. |
| NDWI | `(Green - NIR) / (Green + NIR)` | Open water, pond/check-dam reservoir water-spread change. |
| NDBI | `(SWIR - NIR) / (SWIR + NIR)` | Built-up/barren and possible encroachment/degraded land. |
| SAVI | `((NIR - Red) / (NIR + Red + L)) × (1 + L)`, proposed `L=0.5` | Sparse/semi-arid vegetation. |
| MNDWI | `(Green - SWIR) / (Green + SWIR)` | Water vs built-up distinction; often better water mapping than NDWI. |
| BSI | `((SWIR + Red) - (NIR + Blue)) / ((SWIR + Red) + (NIR + Blue))` | Exposed soil and erosion/degradation-prone areas. |

Band mapping is sensor-specific and must be a tested configuration, never hard-coded as generic band numbers.

### B. LULC

Target classes: agriculture (kharif/rabi/fallow), forest, scrubland, water bodies, built-up, barren/wasteland, plantation.

- **MVP:** pixel-level Random Forest using bands + indices; reference points/labels must be documented. It is fast and interpretable.
- **Advanced:** U-Net with ResNet-34 backbone on 256×256 multi-band patches via `segmentation_models_pytorch`; use only with enough labelled masks and GPU capacity.
- Evaluate on spatially separated hold-outs and report per-class precision/recall/F1, IoU (segmentation), confusion matrix, sample counts, date/area transfer limitations, and an uncertainty/no-data class.

### C. Change detection

1. **Index differencing:** calculate date-2 minus date-1 for NDVI/NDWI and apply documented, calibrated thresholds.
2. **Post-classification comparison:** classify each date separately, then create a class-transition/change matrix (for example, agriculture → water).
3. **Optional advanced:** Siamese/attention/FC-EF-style model producing a binary change mask only after labelled pairs are available.

All methods require compatible sensor/band configuration, co-registration, cloud/shadow masking, seasonal context, and temporal metadata. Change should include significance/quality flags; seasonal variation is not automatically intervention impact.

### D. Field-photo intelligence

Photo classification classes proposed by the PDF:

`check dam`, `farm pond`, `afforestation`, `drainage treatment / nala revetment`, `loose boulder structure`, `contour bunding`, `percolation tank`, `horticulture`, `livelihood activity`, `other`.

- Candidate model: transfer-learned ResNet-50 or EfficientNet-B3; augment with rotation, flip, color jitter, random crop; initially freeze early layers and tune final 2–3 blocks/head.
- Object detection, if demonstrated: YOLOv8 for localizing check dams/farm ponds in photos; annotations in Roboflow or LabelImg format.
- Training must split by project/site/time where possible to avoid duplicate-scene leakage. Show class-wise outcomes, confidence calibration, a low-confidence/manual-review route, data consent, and model version.
- Candidate serving: FastAPI-wrapped PyTorch model; ONNX export for portable/fast inference. MLflow is the proposed experiment tracker.

### E. DEM and spatial statistics

From DEM using WhiteboxTools/PySheds (QGIS/GRASS can verify manually): D8 flow direction → flow accumulation → thresholded stream network → pour-point catchment boundary → micro-watershed segmentation. Produce drainage with Strahler order.

Planned statistics: zonal mean NDVI/water area by micro-watershed, intervention density/hotspots, Moran’s I clustering, and NDVI/NDWI trends over time. Use Rasterstats, PySAL, Pandas/SciPy as appropriate. Clearly state sampling, zones, time periods, and limitations.

---

## 7. Interface and API expectations

### UI

- Central Leaflet map: OpenStreetMap/base satellite layer; toggles for LULC, NDVI, NDWI, drainage, watershed boundaries, interventions, and changes.
- Clicking a photo marker opens field photo, observed/user tag, AI class + confidence + model version, captured time, data-quality status, and the matching satellite evidence—not just a claim.
- Time slider for T0–T5/available dates and swipe comparison for before/after imagery.
- Dashboard: health scorecard, LULC area breakdown, intervention counts/trends, latest uploads thumbnail feed.
- Analysis tools: AOI draw → zonal stats; selected watershed → map generation; two-date comparison; PNG/PDF/GeoTIFF export.
- Report: location/thematic maps, change results, photo gallery, statistics, provenance/caveats; PDF via ReportLab or WeasyPrint; T0–T5-style institutional format is proposed.
- Responsive web layout is required; a separate mobile app is out of scope.

### API principles

- Version APIs (e.g. `/api/v1`), return machine-readable job IDs for long work, and expose status/progress/error.
- Keep synchronous endpoints lightweight; Celery executes ingestion, inference, raster analysis, map generation, and report jobs.
- Enforce object/project access; later roles are admin, analyst, field worker.
- Validate CRS, AOI size, dates, source asset IDs, and export parameters at the boundary.
- API results must identify source/version/run and link to quality/caveat metadata.

---

## 8. Delivery plan

### Full proposed roadmap

| Phase | Weeks | Outcome |
| --- | ---: | --- |
| 1. Foundation | 1–2 | PostGIS schema; sample ingestion; EXIF extraction; FastAPI/React skeleton; GeoServer connected to PostGIS; spatial query works. |
| 2. Geospatial core | 3–4 | Indices, Random Forest LULC, DEM/drainage, index/post-classification change, thematic maps. |
| 3. AI/ML | 5–6 | Labelled-photo classifier; optional U-Net/YOLOv8 as data permits; inference APIs. |
| 4. Visualization | 7–8 | Leaflet viewer, temporal comparison, dashboard, AOI tools, report. |
| 5. Integration/polish | 9–10 | End-to-end flows, RBAC, caching, Docker Compose, testing/docs/demo video. |

### 36-hour hackathon MVP order

1. Pick one pilot watershed and two cloud-acceptable dates; store boundary, DEM, and satellite provenance.
2. Ingest a small consented field-photo CSV + originals; plot markers and show metadata.
3. Generate NDVI and NDWI/MNDWI maps; calculate a simple documented water/vegetation summary.
4. Implement simple before/after index differencing and a quality/caveat display.
5. Build a Leaflet comparison view + panel linking one photo to nearby satellite result.
6. Generate a short reproducible PDF/export and rehearse a data-to-insight demo.
7. Add a small transfer-learned photo classifier only after the above works; make U-Net, YOLOv8, health score, roles, and advanced analytics stretch goals.

### Definition of done for the MVP

- A fresh environment can run the documented stack with one command or a short verified setup sequence.
- A known demo dataset is ingested reproducibly, with sources/permissions and no sensitive data exposed.
- One watershed map renders photo points plus at least vegetation, water, and change layers.
- Each derived visual identifies dates, AOI, source, method/version, and quality caveat.
- A selected photo can be connected to a declared spatial/temporal satellite analysis window.
- Report/export reproduces the displayed metrics and includes provenance.

---

## 9. Quality, security, and risks

### Non-negotiable checks

- **CRS:** Store input coordinate reference and make transformations explicit with PyProj. Never calculate area/distance in geographic degrees; use an appropriate projected CRS.
- **Time:** Preserve capture/acquisition timezone and UTC; compare like seasons where possible.
- **Spatial linkage:** Declare buffer/radius and time window. A point marker does not validate a landscape-sized pixel by itself.
- **Raster quality:** Record cloud/shadow/nodata coverage, resolution, co-registration, atmospheric/product level, and threshold versions.
- **Model quality:** Version data/models; prevent leakage; report class-wise results and manual review path.
- **Privacy and permissions:** Field images, people, device/user details, project locations, and credentials need access controls, consent, minimization, and secure storage. Strip/redact public metadata where needed.
- **Reproducibility:** Version code, configs, inputs, models, runs, generated layers, and reports; keep raw assets immutable.

### Main risks and mitigations

| Risk | Mitigation |
| --- | --- |
| No official data/API access | Begin with legally obtained Sentinel/Landsat-equivalent imagery and consented demo photos; label it honestly and keep source adapters interchangeable. |
| Cloud cover / seasonal differences mimic change | Use QA/cloud masks, matched seasons, quality score, multi-date validation, and caveat text. |
| Sparse/noisy labels | Audit tags, define `other`/review queue, use small transfer learning only after data audit. |
| 30 m pixels cannot resolve small interventions | Use photos/high-resolution imagery where permitted; report scale limitation and do not infer structure dimensions from unsuitable data. |
| Overly broad stack consumes hackathon time | Ship the MVP vertical slice before services, deep learning, object detection, RBAC, and performance work. |
| Incorrect causal interpretation | Phrase outputs as co-located evidence/correlation; show baseline, window, uncertainty, and alternative explanations. |

---

## 10. Working conventions for agents

1. Start by reading this file and inspecting the repository; do not claim a component exists unless files/tests prove it.
2. Before adding a data source, record its authorization/provenance and sample characteristics.
3. Prefer a modular pipeline: `ingest → validate → process → persist → serve → visualize`; each run is idempotent and versioned.
4. Build vertically. A thin end-to-end demo is more valuable than isolated models or a dashboard backed by mock claims.
5. Separate raw, intermediate, derived, and presentation artifacts. Never use production/demo photos in a public repository unless explicitly permitted.
6. Add unit tests for band formulas, coordinate/CRS conversion, date selection, area calculations, and API validation; add a small integration test with fixture data.
7. Store styling, thresholds, class maps, and band mappings as versioned configuration, not magic constants.
8. When a task ends, update **Current state**, mark the relevant checklist, and append a decision entry.

### First implementation checklist

- [ ] Confirm official problem statement/judging criteria and team deadline.
- [ ] Select pilot watershed, projected CRS, two comparison dates, and demo story.
- [ ] Secure and document permissible sample photo, boundary, DEM, and imagery datasets.
- [ ] Create repository structure, `.gitignore`, environment/dependency management, and local Docker Compose plan.
- [ ] Define PostGIS schema/migrations and object-storage layout.
- [ ] Implement photo/metadata ingestion with validation + fixture tests.
- [ ] Implement satellite metadata registry, clipping/cloud-mask pipeline, and a tested sensor band map.
- [ ] Produce NDVI/NDWI and one map artifact reproducibly.
- [ ] Build minimum API and map view using the actual generated artifact.
- [ ] Implement a transparent before/after summary and report/export.

## 11. Decision log

| Date | Decision | Rationale / impact |
| --- | --- | --- |
| 2026-09-26 | Created this context from pages 1–20 of `SIH PS4 — Watershed Geo-Coded Image Analysis Complete System Plan.pdf`. | Establishes scope and explicitly distinguishes the design proposal from validated requirements. |
| 2026-09-26 | No technology, data source, model, or external integration has been implemented or verified. | Prevents subsequent workers from assuming the document describes existing system state. |

## 12. Source boundary

Primary reference reviewed: `SIH PS4 — Watershed Geo-Coded Image Analysis Complete System Plan.pdf`, pages 1–20 only (provided by the project owner; local source was `/Users/harshith2007/Downloads/SIH PS4 — Watershed Geo-Coded Image Analysis Complete System Plan.pdf`).

The PDF’s page 20 begins a “36-hour SIH Hackathon Sprint” section; content after that page was deliberately excluded. Any requirements from pages 21–22 must be reviewed and incorporated in a separate update, not assumed here.
