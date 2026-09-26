import React from "react";

export function Card({ children, className = "", pad = true }) {
  return (
    <div
      className={`rounded-2xl bg-ink-900/80 border border-white/[0.06] shadow-card backdrop-blur ${
        pad ? "p-5" : ""
      } ${className}`}
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
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-500/15 text-slate-300 border-slate-400/20",
    green: "bg-brand-500/15 text-brand-300 border-brand-400/25",
    blue: "bg-aqua-500/15 text-aqua-400 border-aqua-500/25",
    amber: "bg-amber-500/15 text-amber-300 border-amber-400/25",
    red: "bg-rose-500/15 text-rose-300 border-rose-400/25",
    violet: "bg-violet-500/15 text-violet-300 border-violet-400/25",
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
    green: "from-brand-500/20 to-brand-500/5 text-brand-300",
    blue: "from-aqua-500/20 to-aqua-500/5 text-aqua-400",
    violet: "from-violet-500/20 to-violet-500/5 text-violet-300",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300",
  };
  const up = typeof delta === "number" ? delta >= 0 : null;
  return (
    <div className="rounded-2xl bg-ink-900/80 border border-white/[0.06] shadow-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span
          className={`grid place-items-center h-8 w-8 rounded-xl bg-gradient-to-br ${toneMap[tone]}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-50 tracking-tight">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className={`mt-1 text-[11px] font-medium ${up ? "text-brand-300" : "text-rose-300"}`}>
          {up ? "▲" : "▼"} {Math.abs(delta)}
          {typeof delta === "number" && String(delta).includes(".") ? "" : ""} vs T0
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
      {title && <div className="text-[11px] font-semibold text-slate-400 mb-1.5">{title}</div>}
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-[11px] text-slate-300">
            <span
              className="h-3 w-3 rounded-[3px] shrink-0"
              style={{ background: it.color }}
            />
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
      <div className="text-[11px] font-semibold text-slate-400 mb-1.5">{label}</div>
      <div
        className="h-2.5 rounded-full"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
