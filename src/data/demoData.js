// ─────────────────────────────────────────────────────────────────────────
// JalDrishti — DEMO DATA (Phase 1)
// All figures below are synthetic, generated for UI demonstration only.
// They are NOT derived from official DRISHTI/SRISHTI data. See PROJECT_CONTEXT.md.
// Deterministic pseudo-random generation keeps the visuals stable across renders.
// ─────────────────────────────────────────────────────────────────────────

// Seeded PRNG (mulberry32) — stable, no dependencies.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Pilot area: Kolgaon micro-watershed cluster, Beed district, Maharashtra ──
export const PILOT = {
  name: "Kolgaon Micro-Watershed Cluster",
  code: "MH-BEED-4C2-KLG",
  district: "Beed",
  block: "Georai",
  state: "Maharashtra",
  crs_display: "EPSG:4326 (WGS 84)",
  crs_metric: "EPSG:32643 (UTM 43N)",
  center: [19.045, 75.758],
  areaHa: 4218,
  microWatersheds: 6,
  dateRange: "Nov 2021 – Feb 2025",
};

// Comparison epochs (T0..T5) used across the app.
export const EPOCHS = [
  { id: "T0", label: "Nov 2021", date: "2021-11-14", season: "Post-monsoon", cloud: 3 },
  { id: "T1", label: "Mar 2022", date: "2022-03-09", season: "Winter/rabi", cloud: 1 },
  { id: "T2", label: "Nov 2022", date: "2022-11-21", season: "Post-monsoon", cloud: 6 },
  { id: "T3", label: "Mar 2023", date: "2023-03-17", season: "Winter/rabi", cloud: 2 },
  { id: "T4", label: "Nov 2023", date: "2023-11-08", season: "Post-monsoon", cloud: 4 },
  { id: "T5", label: "Feb 2025", date: "2025-02-19", season: "Winter/rabi", cloud: 2 },
];

// ── Watershed boundary (irregular polygon) ──
export const boundary = {
  type: "Feature",
  properties: { name: PILOT.name, code: PILOT.code },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [75.712, 19.078], [75.742, 19.086], [75.771, 19.079], [75.796, 19.086],
      [75.812, 19.068], [75.808, 19.045], [75.818, 19.024], [75.802, 19.006],
      [75.776, 19.001], [75.752, 18.994], [75.728, 19.003], [75.709, 19.02],
      [75.699, 19.041], [75.704, 19.062], [75.712, 19.078],
    ]],
  },
};

// Point-in-polygon (ray casting) on the boundary ring.
const ring = boundary.geometry.coordinates[0];
function inBoundary(lng, lat) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const BBOX = { minLng: 75.699, maxLng: 75.818, minLat: 18.994, maxLat: 19.086 };

// ── Micro-watershed sub-basins (6) with health scores ──
export const microWatersheds = [
  { id: "MWS-01", name: "Upper Kolgaon", c: [75.735, 19.062], health: 72, trend: +6, ndvi: 0.48, water: 14.2, interventions: 9 },
  { id: "MWS-02", name: "Rui Nala", c: [75.772, 19.058], health: 64, trend: +3, ndvi: 0.41, water: 21.6, interventions: 12 },
  { id: "MWS-03", name: "Georai East", c: [75.796, 19.036], health: 81, trend: +11, ndvi: 0.57, water: 9.4, interventions: 7 },
  { id: "MWS-04", name: "Lower Kolgaon", c: [75.758, 19.022], health: 58, trend: -2, ndvi: 0.36, water: 6.1, interventions: 5 },
  { id: "MWS-05", name: "Sindphana Bank", c: [75.73, 19.03], health: 69, trend: +5, ndvi: 0.45, water: 28.3, interventions: 11 },
  { id: "MWS-06", name: "Pimpalgaon Ridge", c: [75.79, 19.066], health: 76, trend: +8, ndvi: 0.52, water: 4.7, interventions: 6 },
];

function voronoiOwner(lng, lat) {
  let best = null, bd = Infinity;
  for (const m of microWatersheds) {
    const d = (m.c[0] - lng) ** 2 + (m.c[1] - lat) ** 2;
    if (d < bd) { bd = d; best = m; }
  }
  return best;
}

// ── Raster-like analysis grid (colored GeoJSON cells simulate COG overlays) ──
// Each cell carries NDVI / NDWI / LULC / change so map layers can share geometry.
const LULC_CLASSES = [
  { key: "agri", name: "Agriculture", color: "#e9c46a" },
  { key: "forest", name: "Forest / Plantation", color: "#2d6a4f" },
  { key: "scrub", name: "Scrubland", color: "#a68a64" },
  { key: "water", name: "Water Body", color: "#1d7fb8" },
  { key: "builtup", name: "Built-up", color: "#c1121f" },
  { key: "barren", name: "Barren / Wasteland", color: "#b8b8a1" },
];
export const LULC_LEGEND = LULC_CLASSES;

function buildGrid() {
  const cols = 34, rows = 26;
  const rnd = mulberry32(20260926);
  const dLng = (BBOX.maxLng - BBOX.minLng) / cols;
  const dLat = (BBOX.maxLat - BBOX.minLat) / rows;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lng = BBOX.minLng + (c + 0.5) * dLng;
      const lat = BBOX.minLat + (r + 0.5) * dLat;
      if (!inBoundary(lng, lat)) continue;

      // Spatially smooth-ish fields using low-freq sinusoids + noise.
      const nx = (lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng);
      const ny = (lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat);
      const base =
        0.42 +
        0.22 * Math.sin(nx * 6.1 + 0.6) * Math.cos(ny * 4.7 + 1.1) +
        0.12 * Math.sin(ny * 9.3) +
        (rnd() - 0.5) * 0.12;
      let ndvi = Math.max(-0.1, Math.min(0.82, base));

      const owner = voronoiOwner(lng, lat);
      ndvi += (owner.health - 68) * 0.0028; // nudge by sub-basin health

      // NDWI: high near valley bottoms (low ny) + a couple of water pockets
      let ndwi =
        -0.28 +
        0.35 * Math.exp(-((ny - 0.32) ** 2) / 0.03) +
        0.4 * Math.exp(-(((nx - 0.28) ** 2 + (ny - 0.34) ** 2)) / 0.004) +
        0.3 * Math.exp(-(((nx - 0.62) ** 2 + (ny - 0.6) ** 2)) / 0.003) +
        (rnd() - 0.5) * 0.08;
      ndwi = Math.max(-0.6, Math.min(0.6, ndwi));

      // LULC decision
      let lulc;
      if (ndwi > 0.12) lulc = "water";
      else if (ndvi > 0.58) lulc = "forest";
      else if (ndvi > 0.36) lulc = "agri";
      else if (ndvi > 0.22) lulc = "scrub";
      else if (rnd() > 0.9) lulc = "builtup";
      else lulc = "barren";

      // Change (T0 -> T5): greening near interventions, some stress pockets
      let change =
        0.06 +
        0.16 * Math.exp(-(((nx - 0.6) ** 2 + (ny - 0.5) ** 2)) / 0.05) +
        0.12 * Math.exp(-(((nx - 0.3) ** 2 + (ny - 0.35) ** 2)) / 0.04) -
        0.14 * Math.exp(-(((nx - 0.8) ** 2 + (ny - 0.2) ** 2)) / 0.02) +
        (rnd() - 0.5) * 0.1;
      change = Math.max(-0.35, Math.min(0.4, change));

      cells.push({
        id: `${r}-${c}`,
        bounds: [
          [lat - dLat / 2, lng - dLng / 2],
          [lat + dLat / 2, lng + dLng / 2],
        ],
        ndvi: +ndvi.toFixed(3),
        ndwi: +ndwi.toFixed(3),
        lulc,
        change: +change.toFixed(3),
        mws: owner.id,
      });
    }
  }
  return cells;
}

export const gridCells = buildGrid();

// Color ramps for raster-like layers
export function ndviColor(v) {
  // brown -> yellow -> green
  const stops = [
    [-0.1, [120, 80, 40]], [0.15, [166, 138, 100]], [0.3, [233, 196, 106]],
    [0.45, [138, 177, 88]], [0.6, [45, 130, 79]], [0.82, [16, 82, 45]],
  ];
  return rampColor(v, stops, 0.62);
}
export function ndwiColor(v) {
  const stops = [
    [-0.6, [180, 150, 110]], [-0.2, [214, 200, 170]], [0.05, [140, 190, 214]],
    [0.25, [45, 140, 200]], [0.6, [13, 71, 161]],
  ];
  return rampColor(v, stops, 0.7);
}
export function changeColor(v) {
  // red (loss) -> grey -> green (gain)
  const stops = [
    [-0.35, [193, 18, 31]], [-0.12, [230, 120, 90]], [0, [120, 130, 145]],
    [0.12, [120, 190, 120]], [0.4, [15, 157, 106]],
  ];
  return rampColor(v, stops, 0.72);
}
function rampColor(v, stops, alpha) {
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (v >= stops[i][0] && v <= stops[i + 1][0]) { lo = stops[i]; hi = stops[i + 1]; break; }
  }
  const t = (v - lo[0]) / (hi[0] - lo[0] || 1);
  const c = lo[1].map((ch, i) => Math.round(ch + (hi[1][i] - ch) * Math.max(0, Math.min(1, t))));
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
}
export function lulcColor(key) {
  return (LULC_CLASSES.find((l) => l.key === key) || {}).color || "#888";
}

// ── Drainage network (Strahler-ordered polylines) ──
export const drainage = [
  { order: 3, path: [[75.79, 19.07], [75.775, 19.055], [75.762, 19.04], [75.748, 19.028], [75.735, 19.014], [75.725, 19.0]] },
  { order: 2, path: [[75.735, 19.066], [75.745, 19.05], [75.752, 19.036], [75.748, 19.028]] },
  { order: 2, path: [[75.80, 19.05], [75.784, 19.044], [75.77, 19.038], [75.762, 19.04]] },
  { order: 1, path: [[75.72, 19.06], [75.73, 19.05], [75.738, 19.04]] },
  { order: 1, path: [[75.808, 19.03], [75.796, 19.032], [75.784, 19.036]] },
  { order: 1, path: [[75.716, 19.03], [75.724, 19.02], [75.73, 19.012]] },
  { order: 2, path: [[75.758, 19.076], [75.756, 19.06], [75.752, 19.046]] },
];

// ── Field-photo interventions (DRISHTI-style points) ──
const IV_TYPES = {
  check_dam: { label: "Check Dam", color: "#2563eb", icon: "🌊" },
  farm_pond: { label: "Farm Pond", color: "#0ea5e9", icon: "💧" },
  afforestation: { label: "Afforestation", color: "#16a34a", icon: "🌳" },
  contour_bund: { label: "Contour Bunding", color: "#a16207", icon: "⛰" },
  percolation_tank: { label: "Percolation Tank", color: "#7c3aed", icon: "🛢" },
  nala_revetment: { label: "Nala Revetment", color: "#0891b2", icon: "🧱" },
  loose_boulder: { label: "Loose Boulder Structure", color: "#b45309", icon: "🪨" },
};
export const IV_TYPE_META = IV_TYPES;

function makeInterventions() {
  const rnd = mulberry32(7788);
  const types = Object.keys(IV_TYPES);
  const list = [];
  let n = 0;
  while (list.length < 50 && n < 4000) {
    n++;
    const lng = BBOX.minLng + rnd() * (BBOX.maxLng - BBOX.minLng);
    const lat = BBOX.minLat + rnd() * (BBOX.maxLat - BBOX.minLat);
    if (!inBoundary(lng, lat)) continue;
    const type = types[Math.floor(rnd() * types.length)];
    const conf = 0.62 + rnd() * 0.37;
    const owner = voronoiOwner(lng, lat);
    const status = rnd() > 0.82 ? "review" : rnd() > 0.08 ? "verified" : "flagged";
    const ep = EPOCHS[2 + Math.floor(rnd() * 4)];
    const waterGain = type === "check_dam" || type === "farm_pond" || type === "percolation_tank"
      ? +(0.4 + rnd() * 2.6).toFixed(2) : +(rnd() * 0.5).toFixed(2);
    const ndviGain = type === "afforestation" || type === "contour_bund"
      ? +(0.08 + rnd() * 0.22).toFixed(3) : +(rnd() * 0.09).toFixed(3);
    list.push({
      id: `IV-${String(list.length + 1).padStart(3, "0")}`,
      type,
      typeLabel: IV_TYPES[type].label,
      lat: +lat.toFixed(5),
      lng: +lng.toFixed(5),
      confidence: +conf.toFixed(2),
      userTag: rnd() > 0.25 ? IV_TYPES[type].label : "—",
      agreement: rnd() > 0.2,
      status,
      capturedAt: ep.date,
      epoch: ep.id,
      modelVersion: "photo-cls-r50 v0.4.1",
      mws: owner.id,
      mwsName: owner.name,
      waterGain,
      ndviGain,
      bufferM: 150,
      windowDays: 120,
    });
  }
  return list;
}
export const interventions = makeInterventions();

export function interventionCountsByType() {
  const map = {};
  for (const t of Object.keys(IV_TYPES)) map[t] = 0;
  interventions.forEach((i) => (map[i.type]++));
  return Object.entries(map).map(([k, v]) => ({
    key: k, name: IV_TYPES[k].label, value: v, color: IV_TYPES[k].color,
  }));
}

// ── LULC area breakdown (ha) per epoch (T0 and T5 for change) ──
export const lulcBreakdown = {
  T0: [
    { key: "agri", ha: 1980 }, { key: "forest", ha: 402 }, { key: "scrub", ha: 690 },
    { key: "water", ha: 96 }, { key: "builtup", ha: 210 }, { key: "barren", ha: 840 },
  ],
  T5: [
    { key: "agri", ha: 2074 }, { key: "forest", ha: 561 }, { key: "scrub", ha: 604 },
    { key: "water", ha: 158 }, { key: "builtup", ha: 236 }, { key: "barren", ha: 585 },
  ],
};

// ── Time series: NDVI, NDWI, water area, per epoch ──
export const timeSeries = EPOCHS.map((e, i) => ({
  epoch: e.id,
  label: e.label,
  ndvi: +(0.34 + i * 0.032 + (i % 2 ? -0.02 : 0.01)).toFixed(3),
  ndwi: +(-0.08 + i * 0.018).toFixed(3),
  waterHa: +(96 + i * 12 + (i % 2 ? 4 : -3)).toFixed(0),
  greenHa: +(402 + i * 30).toFixed(0),
}));

// ── Composite watershed health score (documented weighting) ──
export const healthModel = {
  score: 71,
  band: "Improving",
  delta: +6,
  weights: [
    { factor: "Vegetation (NDVI)", weight: 0.35, value: 0.51, contribution: 26 },
    { factor: "Water availability (NDWI)", weight: 0.25, value: 0.44, contribution: 18 },
    { factor: "Intervention density", weight: 0.2, value: 0.62, contribution: 15 },
    { factor: "Soil / barren reduction", weight: 0.2, value: 0.58, contribution: 12 },
  ],
};

// ── Async job queue (Celery-style) for the "reproducible pipeline" story ──
export const jobs = [
  { id: "run_9f2a", type: "Change detection (NDVI T4→T5)", status: "completed", pct: 100, dur: "3m 12s", ts: "2025-02-20 09:14" },
  { id: "run_9f2b", type: "Photo classification batch (18 imgs)", status: "completed", pct: 100, dur: "1m 48s", ts: "2025-02-20 09:20" },
  { id: "run_9f2c", type: "Zonal statistics — 6 micro-watersheds", status: "running", pct: 64, dur: "—", ts: "2025-02-20 09:41" },
  { id: "run_9f2d", type: "MNDWI water-extent map (T5)", status: "queued", pct: 0, dur: "—", ts: "2025-02-20 09:42" },
];

// ── Recent uploads feed ──
export const recentUploads = interventions.slice(0, 6).map((i, k) => ({
  id: i.id,
  type: i.typeLabel,
  color: IV_TYPES[i.type].color,
  icon: IV_TYPES[i.type].icon,
  mws: i.mwsName,
  when: ["4 min ago", "22 min ago", "1 hr ago", "3 hr ago", "5 hr ago", "Yesterday"][k],
  confidence: i.confidence,
  status: i.status,
}));

// ── Data provenance / caveats shown across the UI ──
export const provenance = {
  imagery: "Sentinel-2 L2A (demo surrogate) · 10 m · bands B2/B3/B4/B8/B11",
  dem: "Copernicus GLO-30 DEM (30 m)",
  boundary: "IWMP micro-watershed delineation (demo)",
  photos: "Consented demo field photos (DRISHTI-style schema)",
  cloudThreshold: "≤ 10% scene cloud",
  note:
    "Phase-1 demonstration data. Figures are synthetic and illustrate the workflow; they are not official DRISHTI/SRISHTI results and are not a causal impact claim.",
};

export const KPIS = {
  area: PILOT.areaHa,
  photos: interventions.length,
  verified: interventions.filter((i) => i.status === "verified").length,
  waterGainHa: +(timeSeries[5].waterHa - timeSeries[0].waterHa).toFixed(0),
  greenGainHa: +(lulcBreakdown.T5.find((x) => x.key === "forest").ha - lulcBreakdown.T0.find((x) => x.key === "forest").ha).toFixed(0),
  ndviDelta: +(timeSeries[5].ndvi - timeSeries[0].ndvi).toFixed(3),
};
