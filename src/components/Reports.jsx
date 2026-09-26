import React from "react";
import { Card, SectionTitle, Badge } from "./ui";
import { PILOT, KPIS, EPOCHS, healthModel, provenance, lulcBreakdown, LULC_LEGEND } from "../data/demoData";

const EXPORTS = [
  { fmt: "PDF", label: "Institutional report (T0–T5)", icon: "▤", tone: "red", desc: "Location & thematic maps, change results, photo gallery, statistics, provenance." },
  { fmt: "GeoTIFF", label: "NDVI / NDWI / change rasters (COG)", icon: "▦", tone: "green", desc: "Cloud-optimized, CRS-stamped, band-mapped derived layers." },
  { fmt: "GeoJSON", label: "Interventions + boundaries", icon: "◈", tone: "blue", desc: "Points with class, confidence, provenance & sub-basin." },
  { fmt: "CSV", label: "Zonal statistics table", icon: "▤", tone: "violet", desc: "Per micro-watershed NDVI/NDWI/water-area/intervention density." },
];

export default function Reports() {
  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Export options */}
      <div className="space-y-6">
        <Card>
          <SectionTitle title="Generate & Export" sub="Reproducible, provenance-stamped" />
          <div className="space-y-3">
            {EXPORTS.map((e) => (
              <div key={e.fmt} className="rounded-xl border border-white/[0.06] bg-ink-950/50 p-3 flex gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center text-lg shrink-0 bg-white/[0.04]">{e.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-100">{e.label}</span>
                    <Badge tone={e.tone}>{e.fmt}</Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{e.desc}</p>
                  <button className="mt-2 text-[11px] font-semibold text-brand-300 hover:text-brand-200">Download →</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Provenance Manifest" />
          <dl className="space-y-2 text-[11px]">
            {[
              ["Imagery", provenance.imagery],
              ["DEM", provenance.dem],
              ["Boundary", provenance.boundary],
              ["Field photos", provenance.photos],
              ["Cloud threshold", provenance.cloudThreshold],
              ["CRS (metric)", PILOT.crs_metric],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-white/[0.04] pb-1.5">
                <dt className="text-slate-500 shrink-0">{k}</dt>
                <dd className="text-slate-300 text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {/* Report preview (A4-ish) */}
      <Card className="xl:col-span-2" pad={false}>
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <SectionTitle title="Report Preview" sub="Watershed status report — auto-generated" />
          <div className="flex gap-2">
            <Badge tone="green">v2025.02</Badge>
            <button className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-[12px] font-semibold">Export PDF</button>
          </div>
        </div>
        <div className="p-6">
          <div className="mx-auto max-w-[640px] bg-white text-slate-800 rounded-lg shadow-panel overflow-hidden">
            {/* letterhead */}
            <div className="bg-gradient-to-r from-brand-700 to-aqua-600 text-white px-7 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-widest opacity-80">INTEGRATED WATERSHED MANAGEMENT PROGRAMME</div>
                  <div className="text-xl font-bold">Watershed Status Report</div>
                </div>
                <div className="text-right text-[11px] opacity-90">
                  <div className="font-mono">{PILOT.code}</div>
                  <div>{EPOCHS[0].label} – {EPOCHS[5].label}</div>
                </div>
              </div>
            </div>

            <div className="px-7 py-5 space-y-5">
              <div>
                <div className="text-[13px] font-bold text-slate-900">{PILOT.name}</div>
                <div className="text-[11px] text-slate-500">{PILOT.block} block, {PILOT.district} district, {PILOT.state} · {PILOT.areaHa.toLocaleString()} ha · {PILOT.microWatersheds} micro-watersheds</div>
              </div>

              {/* KPI strip */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["Health", `${healthModel.score}/100`, "#0a7d55"],
                  ["Water gain", `+${KPIS.waterGainHa} ha`, "#0284c7"],
                  ["Green gain", `+${KPIS.greenGainHa} ha`, "#0a7d55"],
                  ["Photos", KPIS.photos, "#7c3aed"],
                ].map(([k, v, c]) => (
                  <div key={k} className="rounded-lg border border-slate-200 p-2 text-center">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wide">{k}</div>
                    <div className="text-[15px] font-bold" style={{ color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* mock thematic map strip */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-1.5">Thematic maps</div>
                <div className="grid grid-cols-3 gap-2">
                  {[["NDVI", ["#78502a", "#10522d"]], ["NDWI", ["#b4966e", "#0d47a1"]], ["Change", ["#c1121f", "#0f9d6a"]]].map(([t, cols]) => (
                    <div key={t} className="rounded-md overflow-hidden border border-slate-200">
                      <div className="h-16" style={{ background: `linear-gradient(135deg, ${cols[0]}, ${cols[1]})` }} />
                      <div className="text-[9px] text-center text-slate-600 py-1 font-medium">{t} map</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LULC table */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-1.5">Land cover change (ha)</div>
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="text-left py-1">Class</th><th className="text-right">T0</th><th className="text-right">T5</th><th className="text-right">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LULC_LEGEND.map((l) => {
                      const t0 = lulcBreakdown.T0.find((x) => x.key === l.key).ha;
                      const t5 = lulcBreakdown.T5.find((x) => x.key === l.key).ha;
                      const d = t5 - t0;
                      return (
                        <tr key={l.key} className="border-b border-slate-100">
                          <td className="py-1 flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: l.color }} />{l.name}</td>
                          <td className="text-right">{t0}</td>
                          <td className="text-right">{t5}</td>
                          <td className={`text-right font-semibold ${d >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{d >= 0 ? "+" : ""}{d}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[9px] text-amber-800 leading-relaxed">
                <b>Caveat:</b> {provenance.note}
              </div>

              <div className="flex justify-between text-[9px] text-slate-400 border-t border-slate-200 pt-2">
                <span>Generated {EPOCHS[5].date} · JalDrishti Phase-1</span>
                <span>Page 1 of 6</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
