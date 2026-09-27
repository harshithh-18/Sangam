// ─────────────────────────────────────────────────────────────────────────
// Sangam API client (Phase 1).
//
// The UI ships with bundled synthetic data (demoData.js) so it always renders
// for screenshots/offline demos. To run against the live FastAPI backend,
// create a `.env` (see .env.example) with:
//     VITE_API_URL=http://localhost:8000
// Then import from here instead of demoData.js, or use `withApi(fetcher, fallback)`.
//
// Every function falls back to the bundled demo data if the API is unset or
// unreachable, so wiring a view to the API can never break the demo build.
// ─────────────────────────────────────────────────────────────────────────
import * as demo from "./demoData";

const BASE = import.meta.env.VITE_API_URL || "";
export const API_ENABLED = Boolean(BASE);

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}
async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

/** Run `fetcher()` when the API is enabled; otherwise (or on error) return `fallback`. */
export async function withApi(fetcher, fallback) {
  if (!API_ENABLED) return fallback;
  try {
    return await fetcher();
  } catch (e) {
    console.warn("[Sangam] API unavailable, using bundled demo data:", e.message);
    return fallback;
  }
}

const WID = demo.PILOT.code;

export const api = {
  health: () => get("/health"),
  provenance: () => get("/api/v1/provenance"),
  watersheds: () => get("/api/v1/watersheds"),
  watershed: (id = WID) => get(`/api/v1/watersheds/${id}`),
  boundary: (id = WID) => get(`/api/v1/watersheds/${id}/boundary`),
  timeseries: (id = WID) => get(`/api/v1/watersheds/${id}/timeseries`),
  lulc: (id = WID) => get(`/api/v1/watersheds/${id}/lulc`),
  interventions: (params = {}) => {
    const q = new URLSearchParams({ watershed_id: WID, ...params }).toString();
    return get(`/api/v1/interventions?${q}`);
  },
  intervention: (id) => get(`/api/v1/interventions/${id}`),
  jobs: (limit = 20) => get(`/api/v1/jobs?limit=${limit}`),
  runChange: (body) => post("/api/v1/analysis/change", { watershed_id: WID, ...body }),
  runIndex: (body) => post("/api/v1/analysis/index", { watershed_id: WID, ...body }),
  healthScore: (body) => post("/api/v1/analysis/health-score", body),
};
