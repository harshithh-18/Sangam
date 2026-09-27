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
    <aside className="w-[240px] shrink-0 glass-strong border-r border-white/[0.08] flex flex-col">
      <div className="px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <img
            src="/brand/logo-mark.png"
            alt="Sangam"
            className="h-11 w-11 object-contain drop-shadow-[0_4px_12px_rgba(26,146,164,0.5)] animate-float"
          />
          <div>
            <div className="text-[20px] font-extrabold text-white leading-none tracking-tight">
              Sangam
            </div>
            <div className="text-[9px] text-teal-300/90 tracking-[0.18em] mt-1">
              WATERSHED GEO-INTELLIGENCE
            </div>
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
              className={`nav-link ${active ? "active" : ""} w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium border ${
                active
                  ? "bg-white/[0.07] text-white border-white/[0.1]"
                  : "text-slate-300/80 hover:text-white hover:bg-white/[0.04] border-transparent"
              }`}
            >
              <span className={`text-base ${active ? "text-teal-300" : "text-slate-400"}`}>
                {n.icon}
              </span>
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/[0.08]">
        <div className="rounded-xl glass p-3">
          <div className="text-[10px] font-semibold text-teal-300/80 tracking-wide mb-1">
            ACTIVE PILOT
          </div>
          <div className="text-[13px] font-semibold text-white leading-snug">{PILOT.name}</div>
          <div className="text-[11px] text-slate-300/70 mt-0.5">
            {PILOT.block}, {PILOT.district} · {PILOT.state}
          </div>
          <div className="text-[10px] text-slate-400/70 mt-1.5 font-mono">{PILOT.code}</div>
        </div>
        <div className="text-[10px] text-slate-400/60 mt-3 px-1">
          SIH · PS15 Watershed Analysis · Phase-1
        </div>
      </div>
    </aside>
  );
}
