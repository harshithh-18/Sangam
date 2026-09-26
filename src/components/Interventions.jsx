import React, { useMemo, useState } from "react";
import { Card, SectionTitle, Badge, StatusPill } from "./ui";
import { interventions, IV_TYPE_META } from "../data/demoData";

export default function Interventions() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () =>
      interventions.filter(
        (i) =>
          (type === "all" || i.type === type) &&
          (status === "all" || i.status === status) &&
          (q === "" || i.id.toLowerCase().includes(q.toLowerCase()) || i.mwsName.toLowerCase().includes(q.toLowerCase()))
      ),
    [q, type, status]
  );

  const active = selected || filtered[0];

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">
        {/* Filters */}
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by ID or sub-basin…"
              className="flex-1 min-w-[180px] bg-ink-950/70 border border-white/[0.08] rounded-xl px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-brand-400/40"
            />
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="bg-ink-950/70 border border-white/[0.08] rounded-xl px-3 py-2 text-[13px] text-slate-300 outline-none">
              <option value="all">All types</option>
              {Object.entries(IV_TYPE_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="bg-ink-950/70 border border-white/[0.08] rounded-xl px-3 py-2 text-[13px] text-slate-300 outline-none">
              <option value="all">All status</option>
              <option value="verified">Verified</option>
              <option value="review">In review</option>
              <option value="flagged">Flagged</option>
            </select>
            <Badge tone="blue">{filtered.length} results</Badge>
          </div>
        </Card>

        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.slice(0, 18).map((iv) => {
            const m = IV_TYPE_META[iv.type];
            const isActive = active?.id === iv.id;
            return (
              <button
                key={iv.id}
                onClick={() => setSelected(iv)}
                className={`text-left rounded-2xl overflow-hidden border transition ${
                  isActive ? "border-brand-400/50 ring-1 ring-brand-400/30" : "border-white/[0.06] hover:border-white/[0.15]"
                } bg-ink-900/80`}
              >
                <div className="h-24 grid place-items-center text-4xl relative"
                  style={{ background: `linear-gradient(135deg, ${m.color}44, ${m.color}11)` }}>
                  {m.icon}
                  <span className="absolute top-2 right-2"><StatusPill status={iv.status} /></span>
                </div>
                <div className="p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-slate-100 truncate">{m.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{iv.id}</div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{iv.mwsName}</span>
                    <span className="text-[11px] font-semibold text-brand-300">{Math.round(iv.confidence * 100)}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div>
        {active && <Detail iv={active} />}
      </div>
    </div>
  );
}

function Detail({ iv }) {
  const m = IV_TYPE_META[iv.type];
  return (
    <Card pad={false} className="sticky top-6 overflow-hidden">
      <div className="h-40 grid place-items-center text-6xl relative" style={{ background: `linear-gradient(135deg, ${m.color}55, ${m.color}15)` }}>
        {m.icon}
        <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded-md bg-ink-950/70 text-[10px] font-mono text-slate-300">
          {iv.lat}, {iv.lng}
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-slate-50">{m.label}</div>
            <div className="text-[11px] text-slate-500 font-mono">{iv.id} · {iv.capturedAt}</div>
          </div>
          <StatusPill status={iv.status} />
        </div>

        <div className="rounded-xl bg-ink-950/60 border border-white/[0.06] p-3">
          <div className="text-[10px] font-semibold text-slate-400 mb-2">AI CLASSIFICATION</div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] text-slate-100 font-medium">{m.label}</span>
            <span className="text-[13px] font-bold text-brand-300">{Math.round(iv.confidence * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-aqua-500" style={{ width: `${iv.confidence * 100}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">User tag: <span className="text-slate-300">{iv.userTag}</span></span>
            <span className={iv.agreement ? "text-brand-300" : "text-amber-300"}>{iv.agreement ? "✓ agrees" : "⚠ differs"}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">{iv.modelVersion}</div>
        </div>

        <div className="rounded-xl bg-aqua-500/10 border border-aqua-500/20 p-3">
          <div className="text-[10px] font-semibold text-aqua-400 mb-1">SATELLITE EVIDENCE</div>
          <div className="text-[12px] text-slate-200 mb-1">
            Within ±{iv.bufferM} m buffer, {iv.windowDays}-day window:
          </div>
          <div className="text-[13px] font-semibold text-slate-100">
            {iv.waterGain > 0.4 ? `💧 Water extent +${iv.waterGain} ha` : `🌿 NDVI +${iv.ndviGain}`}
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
            Co-located evidence, not proof of causality. Confidence, window & provenance shown.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <Meta k="Sub-basin" v={iv.mwsName} />
          <Meta k="Epoch" v={iv.epoch} />
          <Meta k="Buffer" v={`${iv.bufferM} m`} />
          <Meta k="Time window" v={`${iv.windowDays} d`} />
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl bg-brand-500/15 text-brand-200 border border-brand-400/25 text-[12px] font-semibold">✓ Approve</button>
          <button className="flex-1 py-2 rounded-xl bg-ink-900 text-slate-300 border border-white/[0.08] text-[12px] font-semibold">Flag for review</button>
        </div>
      </div>
    </Card>
  );
}

function Meta({ k, v }) {
  return (
    <div className="rounded-lg bg-ink-950/50 border border-white/[0.05] px-2.5 py-1.5">
      <div className="text-[10px] text-slate-500">{k}</div>
      <div className="text-slate-200 font-medium">{v}</div>
    </div>
  );
}
