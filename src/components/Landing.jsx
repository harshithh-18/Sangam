import React from "react";
import { PILOT, KPIS, healthModel } from "../data/demoData";
import ThemeToggle from "./ThemeToggle";

const MODULES = [
  {
    id: "dashboard",
    icon: "▦",
    tone: "teal",
    title: "Health Dashboard",
    desc: "Composite watershed health, vegetation & water trends, LULC change and live field uploads at a glance.",
  },
  {
    id: "map",
    icon: "◎",
    tone: "blue",
    title: "Map Explorer",
    desc: "Interactive thematic layers — NDVI, NDWI, LULC, drainage — with geo-coded interventions and a T0–T5 time slider.",
  },
  {
    id: "change",
    icon: "⇄",
    tone: "green",
    title: "Change Detection",
    desc: "Before / after spectral comparison with a swipe view, transition matrix and honest quality caveats.",
  },
  {
    id: "interventions",
    icon: "◈",
    tone: "orange",
    title: "Field Interventions",
    desc: "DRISHTI-style field photos, AI classification and confidence, each linked to nearby satellite evidence.",
  },
  {
    id: "reports",
    icon: "▤",
    tone: "blue",
    title: "Reports & Export",
    desc: "Reproducible, provenance-stamped reports and PDF / GeoTIFF / GeoJSON / CSV exports.",
  },
];

const STEPS = [
  ["Ingest", "Field photos + satellite scenes + boundaries, validated on the way in.", "brand"],
  ["Analyze", "Spectral indices, LULC and change detection as reproducible jobs.", "teal"],
  ["Integrate", "Join field & satellite evidence within a declared buffer and time window.", "blue"],
  ["Decide", "Maps, health scores and reports that show sources, dates and caveats.", "orange"],
];

const toneBg = {
  teal: "bg-teal-50 text-teal-600",
  blue: "bg-aqua-50 text-aqua-600",
  green: "bg-brand-50 text-brand-600",
  orange: "bg-orange-50 text-orange-500",
  brand: "bg-brand-50 text-brand-600",
};

export default function Landing({ onEnter }) {
  return (
    <div className="h-screen overflow-y-auto page-bg">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-black/60 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <img src="/brand/logo-horizontal.png" alt="Sangam" className="h-8 object-contain dark:brightness-0 dark:invert" />
          <nav className="hidden md:flex items-center gap-1">
            {MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => onEnter(m.id)}
                className="px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
              >
                {m.title.replace(" Dashboard", "").replace("Field ", "")}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => onEnter("dashboard")}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-semibold transition shadow-sm"
            >
              Open Platform
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-bg">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-2xl animate-fade-up">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-none sangam-gradient">
              SANGAM
            </h1>
            <h2 className="mt-4 text-2xl md:text-4xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Watershed intelligence <br className="hidden md:block" />
              where <span className="text-teal-600">field</span> meets{" "}
              <span className="text-brand-600">satellite</span>.
            </h2>
            <p className="mt-5 text-[15px] md:text-base text-slate-700 leading-relaxed max-w-xl">
              <span className="font-semibold">Sangam</span> joins geo-coded DRISHTI field photographs
              with multi-date satellite analysis to turn scattered documentation into explainable,
              map-ready watershed monitoring for the IWMP.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onEnter("dashboard")}
                className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md transition"
              >
                Open Dashboard →
              </button>
              <button
                onClick={() => onEnter("map")}
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold border border-slate-200 shadow-sm transition"
              >
                Explore the Map
              </button>
            </div>

            {/* quick stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              {[
                [KPIS.area.toLocaleString(), "hectares monitored"],
                [`${healthModel.score}/100`, "watershed health"],
                [KPIS.photos, "field interventions"],
              ].map(([v, l]) => (
                <div key={l} className="bg-white/85 dark:bg-white/5 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="text-xl font-bold text-slate-900">{v}</div>
                  <div className="text-[11px] text-slate-500">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Explore the platform</h2>
            <p className="text-sm text-slate-500 mt-1">Five modules, one continuous field-to-decision workflow.</p>
          </div>
          <span className="hidden sm:inline text-[12px] font-medium text-slate-400">
            Pilot · {PILOT.name}, {PILOT.district}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => onEnter(m.id)}
              className="card card-hover text-left p-6 group"
            >
              <div className={`h-12 w-12 rounded-xl grid place-items-center text-xl ${toneBg[m.tone]}`}>
                {m.icon}
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-slate-900">{m.title}</h3>
              <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">{m.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-teal-600 group-hover:gap-2 transition-all">
                Open <span>→</span>
              </span>
            </button>
          ))}
          <div className="rounded-2xl shadow-card p-6 bg-gradient-to-br from-teal-600 to-brand-600 text-white flex flex-col justify-center">
            <div className="text-lg font-bold">Ready to dive in?</div>
            <p className="text-[13px] text-white/85 mt-1">Jump straight into the live health dashboard.</p>
            <button
              onClick={() => onEnter("dashboard")}
              className="mt-4 self-start px-4 py-2 rounded-lg bg-white text-teal-700 text-[13px] font-semibold hover:bg-teal-50 transition"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center">How Sangam works</h2>
          <p className="text-sm text-slate-500 text-center mt-1">A modular, reproducible pipeline — ingest → analyze → integrate → decide.</p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-5">
            {STEPS.map(([title, desc, tone], i) => (
              <div key={title} className="relative">
                <div className={`h-10 w-10 rounded-full grid place-items-center font-bold ${toneBg[tone]}`}>
                  {i + 1}
                </div>
                <h3 className="mt-3 text-[15px] font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-[13px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-mark.png" alt="Sangam" className="h-8 w-8 object-contain" />
            <div>
              <div className="text-sm font-bold text-slate-800">Sangam</div>
              <div className="text-[11px] text-slate-400">Watershed Geo-Intelligence · SIH PS15</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center md:text-right max-w-md">
            Phase-1 demonstration. Figures shown are synthetic and illustrate the workflow; they are
            not official DRISHTI/SRISHTI results and are not a causal impact claim.
          </p>
        </div>
      </footer>
    </div>
  );
}
