import React from "react";
import { PILOT } from "../data/demoData";

const TITLES = {
  dashboard: ["Watershed Health Dashboard", "Composite health, indices and field evidence at a glance"],
  map: ["Map Explorer", "Thematic layers, drainage and geo-coded field interventions"],
  change: ["Change Detection", "Before / after spectral change with quality caveats"],
  interventions: ["Field Interventions", "DRISHTI-style geo-coded photos linked to satellite evidence"],
  reports: ["Reports & Export", "Reproducible, provenance-stamped outputs"],
};

export default function TopBar({ view, onHome }) {
  const [title, sub] = TITLES[view] || ["", ""];
  return (
    <header className="h-16 shrink-0 px-6 flex items-center justify-between border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        <button
          onClick={onHome}
          className="hidden sm:flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-teal-600 transition"
          title="Home"
        >
          ⌂ Home
        </button>
        <span className="hidden sm:block h-5 w-px bg-slate-200" />
        <div>
          <h1 className="text-[17px] font-bold text-slate-900 leading-tight">{title}</h1>
          <p className="text-[11px] text-slate-500">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200">
          <span className="h-2 w-2 rounded-full bg-brand-500 live-dot" />
          <span className="text-[11px] text-brand-700 font-medium">Pipeline live</span>
        </div>
        <div className="hidden lg:block text-right">
          <div className="text-[11px] text-slate-400">CRS</div>
          <div className="text-[11px] font-mono text-slate-600">{PILOT.crs_metric}</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-aqua-500 via-teal-500 to-brand-500 grid place-items-center text-white text-sm font-semibold">
          AN
        </div>
      </div>
    </header>
  );
}
