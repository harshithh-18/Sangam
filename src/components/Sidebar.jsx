import React from "react";
import { PILOT } from "../data/demoData";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "map", label: "Map Explorer", icon: "◎" },
  { id: "change", label: "Change Detection", icon: "⇄" },
  { id: "interventions", label: "Interventions", icon: "◈" },
  { id: "reports", label: "Reports & Export", icon: "▤" },
];

export default function Sidebar({ view, setView }) {
  return (
    <aside className="w-[236px] shrink-0 bg-ink-950/90 border-r border-white/[0.06] flex flex-col">
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-aqua-500 grid place-items-center text-white font-bold text-lg shadow-lg">
            J
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-50 leading-tight">JalDrishti</div>
            <div className="text-[10px] text-slate-400 tracking-wide">WATERSHED INTELLIGENCE</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? "bg-brand-500/15 text-brand-200 border border-brand-400/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span className={`text-base ${active ? "text-brand-300" : "text-slate-500"}`}>
                {n.icon}
              </span>
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="rounded-xl bg-ink-900/80 border border-white/[0.06] p-3">
          <div className="text-[10px] font-semibold text-slate-500 tracking-wide mb-1">
            ACTIVE PILOT
          </div>
          <div className="text-[13px] font-semibold text-slate-100 leading-snug">{PILOT.name}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {PILOT.block}, {PILOT.district} · {PILOT.state}
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5 font-mono">{PILOT.code}</div>
        </div>
        <div className="text-[10px] text-slate-600 mt-3 px-1">
          SIH · PS15 Watershed Analysis · Phase-1 demo
        </div>
      </div>
    </aside>
  );
}
