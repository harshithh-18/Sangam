import React from "react";
import { useReveal } from "./Reveal";

export function Card({ children, className = "", pad = true, hover = true, reveal = true }) {
  const [ref, shown] = useReveal();
  return (
    <div
      ref={reveal ? ref : undefined}
      className={`rounded-2xl glass shadow-card ${hover ? "glass-hover" : ""} ${
        reveal ? `reveal ${shown ? "is-visible" : ""}` : ""
      } ${pad ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub, right }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-[15px] font-semibold text-slate-100">{title}</h3>
        {sub && <p className="text-xs text-slate-300/70 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-400/15 text-slate-200 border-slate-300/20",
    green: "bg-brand-500/20 text-brand-200 border-brand-400/30",
    blue: "bg-aqua-500/20 text-aqua-300 border-aqua-400/30",
    teal: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    amber: "bg-orange-500/20 text-orange-300 border-orange-400/30",
    red: "bg-rose-500/15 text-rose-300 border-rose-400/20",
    violet: "bg-violet-500/15 text-violet-300 border-violet-400/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatTile({ label, value, unit, delta, icon, tone = "green" }) {
  const toneMap = {
    green: "from-brand-500/30 to-brand-500/5 text-brand-200",
    blue: "from-aqua-500/30 to-aqua-500/5 text-aqua-300",
    teal: "from-teal-500/30 to-teal-500/5 text-teal-300",
    violet: "from-violet-500/25 to-violet-500/5 text-violet-200",
    amber: "from-orange-500/30 to-orange-500/5 text-orange-300",
  };
  const up = typeof delta === "number" ? delta >= 0 : null;
  const [ref, shown] = useReveal();
  return (
    <div ref={ref} className={`rounded-2xl glass glass-hover shadow-card p-4 reveal ${shown ? "is-visible" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300/80">{label}</span>
        <span
          className={`grid place-items-center h-8 w-8 rounded-xl bg-gradient-to-br ${toneMap[tone]}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-xs text-slate-300/70 font-medium">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className={`mt-1 text-[11px] font-medium ${up ? "text-brand-300" : "text-rose-300"}`}>
          {up ? "▲" : "▼"} {Math.abs(delta)} vs T0
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    verified: ["green", "Verified"],
    review: ["amber", "In review"],
    flagged: ["red", "Flagged"],
    completed: ["green", "Completed"],
    running: ["blue", "Running"],
    queued: ["slate", "Queued"],
  };
  const [tone, label] = map[status] || ["slate", status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function Legend({ items, title }) {
  return (
    <div>
      {title && <div className="text-[11px] font-semibold text-slate-300/80 mb-1.5">{title}</div>}
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-[11px] text-slate-200">
            <span className="h-3 w-3 rounded-[3px] shrink-0" style={{ background: it.color }} />
            {it.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Ramp({ label, from, to, min, max }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-300/80 mb-1.5">{label}</div>
      <div className="h-2.5 rounded-full" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
      <div className="flex justify-between text-[10px] text-slate-300/70 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
