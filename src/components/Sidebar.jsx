import React from "react";
import { PILOT } from "../data/demoData";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "map", label: "Map Explorer", icon: "◎" },
  { id: "change", label: "Change Detection", icon: "⇄" },
  { id: "interventions", label: "Interventions", icon: "◈" },
  { id: "reports", label: "Reports & Export", icon: "▤" },
];

export default function Sidebar({ view, setView, onHome }) {
  return (
    <aside className="w-[240px] shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <button
        onClick={onHome}
        title="Back to home"
        className="px-5 py-5 border-b border-slate-200 flex items-center gap-3 hover:bg-slate-50 transition text-left"
      >
        <img src="/brand/logo-mark.png" alt="Sangam" className="h-10 w-10 object-contain" />
        <div>
          <div className="text-[19px] font-extrabold text-slate-900 leading-none tracking-tight">
            Sangam
          </div>
          <div className="text-[9px] text-teal-600 tracking-[0.16em] mt-1">
            WATERSHED GEO-INTELLIGENCE
          </div>
        </div>
      </button>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition ${
                active
                  ? "bg-teal-50 text-teal-700 border-teal-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent"
              }`}
            >
              <span className={`text-base ${active ? "text-teal-600" : "text-slate-400"}`}>
                {n.icon}
              </span>
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-200">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-[10px] font-semibold text-teal-600 tracking-wide mb-1">
            ACTIVE PILOT
          </div>
          <div className="text-[13px] font-semibold text-slate-800 leading-snug">{PILOT.name}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {PILOT.block}, {PILOT.district} · {PILOT.state}
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-mono">{PILOT.code}</div>
        </div>
        <div className="text-[10px] text-slate-400 mt-3 px-1">
          SIH · PS15 Watershed Analysis · Phase-1
        </div>
      </div>
    </aside>
  );
}
