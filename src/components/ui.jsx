import React from "react";

export function Card({ children, className = "", pad = true, hover = true }) {
  return (
    <div className={`card ${hover ? "card-hover" : ""} ${pad ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub, right }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-[15px] font-semibold text-slate-800">{title}</h3>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    green: "bg-brand-50 text-brand-700 border-brand-200",
    blue: "bg-aqua-50 text-aqua-700 border-aqua-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-rose-50 text-rose-600 border-rose-200",
    violet: "bg-violet-50 text-violet-600 border-violet-200",
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
    green: "bg-brand-50 text-brand-600",
    blue: "bg-aqua-50 text-aqua-600",
    teal: "bg-teal-50 text-teal-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-orange-50 text-orange-500",
  };
  const up = typeof delta === "number" ? delta >= 0 : null;
  return (
    <div className="card card-hover p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`grid place-items-center h-8 w-8 rounded-xl ${toneMap[tone]}`}>{icon}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className={`mt-1 text-[11px] font-medium ${up ? "text-brand-600" : "text-rose-500"}`}>
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
      {title && <div className="text-[11px] font-semibold text-slate-500 mb-1.5">{title}</div>}
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-[11px] text-slate-600">
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
      <div className="text-[11px] font-semibold text-slate-500 mb-1.5">{label}</div>
      <div className="h-2.5 rounded-full" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
