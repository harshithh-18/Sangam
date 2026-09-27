import React, { useMemo, useState } from "react";
import {
  MapContainer, TileLayer, GeoJSON, Rectangle, Polyline, Marker, Popup,
} from "react-leaflet";
import L from "leaflet";
import {
  boundary, gridCells, drainage, interventions, IV_TYPE_META, EPOCHS,
  ndviColor, ndwiColor, changeColor, lulcColor, LULC_LEGEND, PILOT,
} from "../data/demoData";
import { Legend, Ramp, Badge } from "./ui";

// Optional CARTO API key (put it in a .env file — see .env.example).
const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY || "";
const cartoQuery = CARTO_KEY ? `?api_key=${CARTO_KEY}` : "";

const BASES = {
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
  },
  light: {
    label: "Light",
    url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${cartoQuery}`,
    attribution: "© OpenStreetMap contributors © CARTO",
  },
};

const RASTERS = [
  { id: "none", label: "None" },
  { id: "ndvi", label: "NDVI (vegetation)" },
  { id: "ndwi", label: "NDWI (water)" },
  { id: "lulc", label: "LULC" },
  { id: "change", label: "NDVI change T0→T5" },
];

function ivIcon(type) {
  const meta = IV_TYPE_META[type];
  return L.divIcon({
    className: "",
    html: `<div class="iv-marker" style="width:26px;height:26px;background:${meta.color};">${meta.icon}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function Toggle({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition border ${
        on
          ? "bg-brand-50 text-brand-700 border-brand-200"
          : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700"
      }`}
    >
      {children}
      <span className={`h-3.5 w-3.5 rounded grid place-items-center text-[9px] ${on ? "bg-brand-500 text-white" : "bg-slate-300"}`}>
        {on ? "✓" : ""}
      </span>
    </button>
  );
}

export default function MapExplorer() {
  const [base, setBase] = useState("satellite");
  const [raster, setRaster] = useState("ndvi");
  const [showBoundary, setShowBoundary] = useState(true);
  const [showDrainage, setShowDrainage] = useState(true);
  const [showInterventions, setShowInterventions] = useState(true);
  const [epochIdx, setEpochIdx] = useState(5);
  const [typeFilter, setTypeFilter] = useState(null);

  const shownIvs = useMemo(
    () => interventions.filter((i) => (!typeFilter || i.type === typeFilter)),
    [typeFilter]
  );

  const cellColor = (c) =>
    raster === "ndvi" ? ndviColor(c.ndvi)
    : raster === "ndwi" ? ndwiColor(c.ndwi)
    : raster === "change" ? changeColor(c.change)
    : raster === "lulc" ? lulcColor(c.lulc)
    : "transparent";

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <MapContainer center={PILOT.center} zoom={13} className="h-full w-full" zoomControl={false} attributionControl>
        <TileLayer key={base} url={BASES[base].url} attribution={BASES[base].attribution} />

        {raster !== "none" &&
          gridCells.map((c) => (
            <Rectangle
              key={c.id}
              bounds={c.bounds}
              pathOptions={{ color: cellColor(c), weight: 0, fillColor: cellColor(c), fillOpacity: 1 }}
            />
          ))}

        {showBoundary && (
          <GeoJSON
            data={boundary}
            style={{ color: "#147687", weight: 3, fill: false, dashArray: "6 4" }}
          />
        )}

        {showDrainage &&
          drainage.map((d, i) => (
            <Polyline
              key={i}
              positions={d.path.map(([lng, lat]) => [lat, lng])}
              pathOptions={{ color: "#4a9bd8", weight: d.order + 0.5, opacity: 0.85 }}
            />
          ))}

        {showInterventions &&
          shownIvs.map((iv) => (
            <Marker key={iv.id} position={[iv.lat, iv.lng]} icon={ivIcon(iv.type)}>
              <Popup>
                <IvPopup iv={iv} />
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* ── Left control panel ── */}
      <div className="absolute top-4 left-4 z-[1000] w-[240px] space-y-3">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-panel p-3">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">BASEMAP</div>
          <div className="flex gap-1.5 mb-3">
            {Object.entries(BASES).map(([k, b]) => (
              <button
                key={k}
                onClick={() => setBase(k)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border ${
                  base === k ? "bg-aqua-50 text-aqua-600 border-aqua-200" : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-semibold text-slate-400 mb-2">THEMATIC RASTER</div>
          <div className="space-y-1 mb-3">
            {RASTERS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRaster(r.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium border ${
                  raster === r.id ? "bg-brand-50 text-brand-700 border-brand-200" : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-semibold text-slate-400 mb-2">OVERLAYS</div>
          <div className="space-y-1.5">
            <Toggle on={showBoundary} onClick={() => setShowBoundary((v) => !v)}>Watershed boundary</Toggle>
            <Toggle on={showDrainage} onClick={() => setShowDrainage((v) => !v)}>Drainage network</Toggle>
            <Toggle on={showInterventions} onClick={() => setShowInterventions((v) => !v)}>Interventions</Toggle>
          </div>
        </div>
      </div>

      {/* ── Right legend panel ── */}
      <div className="absolute top-4 right-4 z-[1000] w-[210px]">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-panel p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600">LEGEND</span>
            <Badge tone="blue">{EPOCHS[epochIdx].id} · {EPOCHS[epochIdx].label}</Badge>
          </div>

          {raster === "ndvi" && <Ramp label="NDVI" from="#78502a" to="#10522d" min="-0.1" max="0.8" />}
          {raster === "ndwi" && <Ramp label="NDWI" from="#b4966e" to="#0d47a1" min="-0.6" max="0.6" />}
          {raster === "change" && <Ramp label="NDVI change" from="#c1121f" to="#0f9d6a" min="loss" max="gain" />}
          {raster === "lulc" && (
            <Legend title="Land cover" items={LULC_LEGEND.map((l) => ({ label: l.name, color: l.color }))} />
          )}

          <div className="border-t border-slate-200 pt-2.5">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Interventions</div>
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => setTypeFilter(null)}
                className={`text-left text-[11px] px-1.5 py-0.5 rounded ${!typeFilter ? "text-brand-600 font-semibold" : "text-slate-400"}`}
              >
                ● All types
              </button>
              {Object.entries(IV_TYPE_META).map(([k, m]) => (
                <button
                  key={k}
                  onClick={() => setTypeFilter(typeFilter === k ? null : k)}
                  className={`flex items-center gap-1.5 text-[11px] px-1.5 py-0.5 rounded ${typeFilter === k ? "bg-slate-100 text-slate-800" : "text-slate-600"}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom time slider ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] w-[560px] max-w-[calc(100%-32px)]">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-panel px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">TEMPORAL SLIDER · T0–T5</span>
            <span className="text-[11px] text-slate-600">
              {EPOCHS[epochIdx].season} · cloud {EPOCHS[epochIdx].cloud}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={EPOCHS.length - 1}
            value={epochIdx}
            onChange={(e) => setEpochIdx(+e.target.value)}
            className="range-slider w-full"
          />
          <div className="flex justify-between mt-1.5">
            {EPOCHS.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setEpochIdx(i)}
                className={`text-[10px] font-medium ${i === epochIdx ? "text-brand-600" : "text-slate-500"}`}
              >
                {e.id}
                <div className="text-[9px]">{e.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IvPopup({ iv }) {
  const meta = IV_TYPE_META[iv.type];
  return (
    <div className="p-0 font-sans">
      <div className="h-24 grid place-items-center text-4xl" style={{ background: `linear-gradient(135deg, ${meta.color}55, ${meta.color}15)` }}>
        {meta.icon}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-slate-900">{meta.label}</span>
          <span className="text-[10px] font-mono text-slate-400">{iv.id}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <Field k="AI class" v={`${meta.label}`} />
          <Field k="Confidence" v={`${Math.round(iv.confidence * 100)}%`} accent />
          <Field k="User tag" v={iv.userTag} />
          <Field k="Agreement" v={iv.agreement ? "✓ match" : "⚠ differs"} />
          <Field k="Captured" v={iv.capturedAt} />
          <Field k="Sub-basin" v={iv.mwsName} />
        </div>
        <div className="rounded-lg bg-aqua-50 border border-aqua-200 p-2">
          <div className="text-[10px] font-semibold text-aqua-600 mb-0.5">SATELLITE EVIDENCE (±{iv.bufferM} m · {iv.windowDays} d)</div>
          <div className="text-[11px] text-slate-700">
            {iv.waterGain > 0.4 ? `Water extent +${iv.waterGain} ha` : `NDVI +${iv.ndviGain}`} near this point
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>{iv.modelVersion}</span>
          <span className={`font-medium ${iv.status === "verified" ? "text-brand-600" : iv.status === "flagged" ? "text-rose-500" : "text-orange-600"}`}>
            {iv.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({ k, v, accent }) {
  return (
    <div>
      <div className="text-slate-500 text-[10px]">{k}</div>
      <div className={`font-medium ${accent ? "text-brand-600" : "text-slate-700"}`}>{v}</div>
    </div>
  );
}
