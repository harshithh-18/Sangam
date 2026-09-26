import React from "react";
import { PILOT } from "../data/demoData";

const TITLES = {
  dashboard: ["Watershed Health Dashboard", "Composite health, indices and field evidence at a glance"],
  map: ["Map Explorer", "Thematic layers, drainage and geo-coded field interventions"],
  change: ["Change Detection", "Before / after spectral change with quality caveats"],
  interventions: ["Field Interventions", "DRISHTI-style geo-coded photos linked to satellite evidence"],
  reports: ["Reports & Export", "Reproducible, provenance-stamped outputs"],
};

export default function TopBar({ view }) {
  const [title, sub] = TITLES[view] || ["", ""];
  return (
    <header className="h-16 shrink-0 px-6 flex items-center justify-between border-b border-white/[0.06] bg-ink-950/60 backdrop-blur">
      <div>
        <h1 className="text-[17px] font-bold text-slate-50 leading-tight">{title}</h1>
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-900/80 border border-white/[0.06]">
          <span className="h-2 w-2 rounded-full bg-brand-400 live-dot" />
          <span className="text-[11px] text-slate-300 font-medium">Pipeline live</span>
        </div>
        <div className="hidden lg:block text-right">
          <div className="text-[11px] text-slate-400">CRS</div>
          <div className="text-[11px] font-mono text-slate-300">{PILOT.crs_metric}</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-aqua-500 to-brand-500 grid place-items-center text-white text-sm font-semibold">
          AN
        </div>
      </div>
    </header>
  );
}
