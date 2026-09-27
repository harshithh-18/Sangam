import React from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { Card, SectionTitle, Badge, StatTile, StatusPill } from "./ui";
import {
  KPIS, timeSeries, lulcBreakdown, LULC_LEGEND, lulcColor, interventionCountsByType,
  healthModel, recentUploads, jobs, microWatersheds, provenance,
} from "../data/demoData";

const axis = { stroke: "#5b6b82", fontSize: 11 };
const grid = "#1c2b45";

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-ink-950 border border-white/10 px-3 py-2 shadow-panel">
      <div className="text-[11px] text-slate-400 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="text-[12px] text-slate-100 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const lulcData = LULC_LEGEND.map((l) => ({
    name: l.name,
    T0: lulcBreakdown.T0.find((x) => x.key === l.key).ha,
    T5: lulcBreakdown.T5.find((x) => x.key === l.key).ha,
    color: l.color,
  }));
  const ivCounts = interventionCountsByType().sort((a, b) => b.value - a.value);
  const health = healthModel.score;

  return (
    <div className="p-6 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatTile label="Area monitored" value={KPIS.area.toLocaleString()} unit="ha" icon="▣" tone="green" />
        <StatTile label="Field photos" value={KPIS.photos} unit="geo-coded" icon="◈" tone="blue" />
        <StatTile label="AI-verified" value={KPIS.verified} unit="interventions" icon="✓" tone="violet" />
        <StatTile label="Water gain" value={`+${KPIS.waterGainHa}`} unit="ha (T0→T5)" delta={KPIS.waterGainHa} icon="💧" tone="blue" />
        <StatTile label="Green gain" value={`+${KPIS.greenGainHa}`} unit="ha forest" delta={KPIS.greenGainHa} icon="🌳" tone="green" />
        <StatTile label="NDVI Δ" value={`+${KPIS.ndviDelta}`} unit="mean" delta={KPIS.ndviDelta} icon="▲" tone="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Health scorecard */}
        <Card>
          <SectionTitle title="Composite Watershed Health" sub="Documented weighted score" right={<Badge tone="green">{healthModel.band}</Badge>} />
          <div className="flex items-center gap-4">
            <div className="relative h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ v: health, fill: "#37a854" }]} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: "#0f2846" }} dataKey="v" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-50">{health}</div>
                  <div className="text-[10px] text-brand-300 font-medium">▲ +{healthModel.delta} vs T0</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {healthModel.weights.map((w) => (
                <div key={w.factor}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-300">{w.factor}</span>
                    <span className="text-slate-400 font-mono">×{w.weight}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-aqua-500" style={{ width: `${w.contribution * 3.2}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
            Score = Σ(weightᵢ × normalized indexᵢ). Weights are configurable & versioned; not a causal impact claim.
          </p>
        </Card>

        {/* NDVI/NDWI trend */}
        <Card className="xl:col-span-2">
          <SectionTitle title="Vegetation & Water Trend" sub="Mean NDVI / NDWI across epochs T0–T5" right={<Badge tone="blue">Sentinel-2 L2A</Badge>} />
          <div className="h-[190px]">
            <ResponsiveContainer>
              <AreaChart data={timeSeries} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#37a854" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#37a854" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4a9bd8" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4a9bd8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis dataKey="label" {...axis} tickLine={false} axisLine={false} />
                <YAxis {...axis} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="ndvi" name="NDVI" stroke="#37a854" strokeWidth={2.5} fill="url(#gv)" />
                <Area type="monotone" dataKey="ndwi" name="NDWI" stroke="#4a9bd8" strokeWidth={2.5} fill="url(#gw)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LULC change */}
        <Card className="xl:col-span-2">
          <SectionTitle title="Land Use / Land Cover — T0 vs T5" sub="Area (ha) by class · Random-Forest classification" />
          <div className="h-[220px]">
            <ResponsiveContainer>
              <BarChart data={lulcData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis dataKey="name" {...axis} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis {...axis} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="T0" name="T0 (2021)" fill="#27547f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="T5" name="T5 (2025)" fill="#37a854" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Intervention mix */}
        <Card>
          <SectionTitle title="Intervention Mix" sub="Classified field photos by type" />
          <div className="flex items-center gap-3">
            <div className="h-[170px] w-[150px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={ivCounts} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2} stroke="none">
                    {ivCounts.map((e) => <Cell key={e.key} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {ivCounts.slice(0, 6).map((e) => (
                <div key={e.key} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: e.color }} />
                    {e.name}
                  </span>
                  <span className="font-semibold text-slate-200">{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Micro-watershed table */}
        <Card className="xl:col-span-2">
          <SectionTitle title="Micro-Watershed Scorecard" sub="Zonal statistics per sub-basin" />
          <div className="overflow-hidden rounded-xl border border-white/[0.06]">
            <table className="w-full text-[12px]">
              <thead className="bg-ink-850/60 text-slate-400">
                <tr>
                  {["Sub-basin", "Health", "Trend", "Mean NDVI", "Water (ha)", "Interventions"].map((h) => (
                    <th key={h} className="text-left font-semibold px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {microWatersheds.map((m, i) => (
                  <tr key={m.id} className={`${i % 2 ? "bg-ink-900/40" : ""} border-t border-white/[0.04]`}>
                    <td className="px-3 py-2">
                      <div className="text-slate-100 font-medium">{m.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{m.id}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 rounded-full bg-ink-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-500 to-aqua-500" style={{ width: `${m.health}%` }} />
                        </div>
                        <span className="text-slate-200 font-semibold">{m.health}</span>
                      </div>
                    </td>
                    <td className={`px-3 py-2 font-medium ${m.trend >= 0 ? "text-brand-300" : "text-rose-300"}`}>
                      {m.trend >= 0 ? "▲" : "▼"} {Math.abs(m.trend)}
                    </td>
                    <td className="px-3 py-2 text-slate-300">{m.ndvi.toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-300">{m.water}</td>
                    <td className="px-3 py-2 text-slate-300">{m.interventions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Uploads + jobs */}
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Recent Field Uploads" sub="Latest DRISHTI-style captures" />
            <div className="space-y-2.5">
              {recentUploads.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg grid place-items-center text-sm" style={{ background: `${u.color}22`, border: `1px solid ${u.color}55` }}>
                    {u.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-slate-100 font-medium truncate">{u.type}</div>
                    <div className="text-[10px] text-slate-500">{u.mws} · {u.when}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold text-slate-200">{Math.round(u.confidence * 100)}%</div>
                    <StatusPill status={u.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Processing Jobs" sub="Async pipeline (Celery)" />
            <div className="space-y-3">
              {jobs.map((j) => (
                <div key={j.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-300 truncate pr-2">{j.type}</span>
                    <StatusPill status={j.status} />
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                    <div className={`h-full rounded-full ${j.status === "completed" ? "bg-brand-500" : j.status === "running" ? "bg-aqua-500" : "bg-slate-600"}`} style={{ width: `${j.pct}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{j.id} · {j.ts}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 leading-relaxed border-t border-white/[0.06] pt-4">
        <span className="font-semibold text-slate-400">Provenance:</span> {provenance.imagery} · {provenance.dem} · cloud {provenance.cloudThreshold}. {provenance.note}
      </p>
    </div>
  );
}
