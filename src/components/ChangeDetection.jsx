import React, { useMemo, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, SectionTitle, Badge, Ramp } from "./ui";
import { gridCells, ndviColor, changeColor, boundary, drainage, EPOCHS, provenance } from "../data/demoData";

const BBOX = { minLng: 75.699, maxLng: 75.818, minLat: 18.994, maxLat: 19.086 };
const W = 640, H = 500;
const pad = 12;
function proj(lng, lat) {
  const x = pad + ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * (W - 2 * pad);
  const y = pad + (1 - (lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * (H - 2 * pad);
  return [x, y];
}

function GridSvg({ mode, clipId }) {
  return (
    <g clipPath={clipId ? `url(#${clipId})` : undefined}>
      {gridCells.map((c) => {
        const [[la1, lo1], [la2, lo2]] = c.bounds;
        const [x1, y1] = proj(Math.min(lo1, lo2), Math.max(la1, la2));
        const [x2, y2] = proj(Math.max(lo1, lo2), Math.min(la1, la2));
        const before = Math.max(-0.1, c.ndvi - c.change);
        const fill =
          mode === "before" ? ndviColor(before)
          : mode === "after" ? ndviColor(c.ndvi)
          : changeColor(c.change);
        return <rect key={c.id} x={x1} y={y1} width={x2 - x1 + 0.6} height={y2 - y1 + 0.6} fill={fill} />;
      })}
    </g>
  );
}

function Overlays() {
  const ring = boundary.geometry.coordinates[0].map(([lng, lat]) => proj(lng, lat).join(",")).join(" ");
  return (
    <g>
      <polygon points={ring} fill="none" stroke="#eafaf3" strokeWidth="2" strokeDasharray="6 4" />
      {drainage.map((d, i) => (
        <polyline key={i} points={d.path.map(([lng, lat]) => proj(lng, lat).join(",")).join(" ")}
          fill="none" stroke="#38bdf8" strokeWidth={d.order + 0.5} opacity="0.8" />
      ))}
    </g>
  );
}

export default function ChangeDetection() {
  const [split, setSplit] = useState(0.5);
  const wrapRef = useRef(null);

  const onDrag = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    setSplit(Math.max(0.05, Math.min(0.95, x / rect.width)));
  };
  const startDrag = () => {
    const move = (e) => onDrag(e);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
  };

  const stats = useMemo(() => {
    let gain = 0, loss = 0, stable = 0;
    const cellHa = 4218 / gridCells.length;
    gridCells.forEach((c) => {
      if (c.change > 0.08) gain++;
      else if (c.change < -0.08) loss++;
      else stable++;
    });
    return {
      gainHa: Math.round(gain * cellHa),
      lossHa: Math.round(loss * cellHa),
      stableHa: Math.round(stable * cellHa),
    };
  }, []);

  const matrix = [
    { from: "Barren", to: "Agriculture", ha: 118, dir: "gain" },
    { from: "Scrub", to: "Forest/Plantation", ha: 96, dir: "gain" },
    { from: "Agriculture", to: "Water", ha: 41, dir: "gain" },
    { from: "Barren", to: "Scrub", ha: 74, dir: "gain" },
    { from: "Agriculture", to: "Built-up", ha: 26, dir: "loss" },
    { from: "Forest", to: "Scrub", ha: 19, dir: "loss" },
  ];

  const changeBars = [
    { name: "Veg. gain", ha: stats.gainHa, color: "#0f9d6a" },
    { name: "No change", ha: stats.stableHa, color: "#3a5170" },
    { name: "Veg. loss", ha: stats.lossHa, color: "#c1121f" },
  ];

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Swipe map */}
      <Card className="xl:col-span-2" pad={false}>
        <div className="p-5 pb-3">
          <SectionTitle
            title="Before / After — NDVI"
            sub="Drag the handle to compare epochs · post-monsoon matched seasons"
            right={
              <div className="flex gap-2">
                <Badge tone="slate">T0 · Nov 2021</Badge>
                <Badge tone="green">T5 · Feb 2025</Badge>
              </div>
            }
          />
        </div>
        <div
          ref={wrapRef}
          className="relative select-none mx-5 mb-4 rounded-xl overflow-hidden border border-white/[0.08]"
          style={{ aspectRatio: `${W}/${H}`, background: "#0b1526" }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
            <defs>
              <clipPath id="rightClip">
                <rect x={split * W} y="0" width={W - split * W} height={H} />
              </clipPath>
            </defs>
            {/* base = before (full) */}
            <GridSvg mode="before" />
            {/* after clipped to right of handle */}
            <GridSvg mode="after" clipId="rightClip" />
            <Overlays />
            <line x1={split * W} y1="0" x2={split * W} y2={H} stroke="#eafaf3" strokeWidth="2" />
          </svg>

          {/* Labels */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-ink-950/80 text-[11px] font-semibold text-slate-200">T0 · 2021</div>
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-brand-500/25 text-[11px] font-semibold text-brand-200">T5 · 2025</div>

          {/* Handle */}
          <div
            className="absolute top-0 bottom-0 -ml-4 w-8 cursor-ew-resize flex items-center justify-center"
            style={{ left: `${split * 100}%` }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          >
            <div className="h-9 w-9 rounded-full bg-white grid place-items-center text-ink-900 shadow-panel text-sm font-bold">
              ⇄
            </div>
          </div>
        </div>
        <div className="px-5 pb-4">
          <Ramp label="NDVI value" from="#78502a" to="#10522d" min="-0.1 (barren)" max="0.8 (dense veg.)" />
        </div>
      </Card>

      {/* Change stats */}
      <div className="space-y-6">
        <Card>
          <SectionTitle title="Change Summary" sub="Index differencing · thr ±0.08" right={<Badge tone="green">QA ✓</Badge>} />
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-brand-500/10 border border-brand-400/20 p-2.5 text-center">
              <div className="text-lg font-bold text-brand-300">+{stats.gainHa}</div>
              <div className="text-[10px] text-slate-400">ha greening</div>
            </div>
            <div className="rounded-xl bg-slate-500/10 border border-slate-400/20 p-2.5 text-center">
              <div className="text-lg font-bold text-slate-300">{stats.stableHa}</div>
              <div className="text-[10px] text-slate-400">ha stable</div>
            </div>
            <div className="rounded-xl bg-rose-500/10 border border-rose-400/20 p-2.5 text-center">
              <div className="text-lg font-bold text-rose-300">−{stats.lossHa}</div>
              <div className="text-[10px] text-slate-400">ha loss</div>
            </div>
          </div>
          <div className="h-[130px]">
            <ResponsiveContainer>
              <BarChart data={changeBars} layout="vertical" margin={{ left: 8, right: 12, top: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1c2b45" horizontal={false} />
                <XAxis type="number" stroke="#5b6b82" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#5b6b82" fontSize={11} width={70} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={{ background: "#0a1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="ha" radius={[0, 4, 4, 0]}>
                  {changeBars.map((b) => <Cell key={b.name} fill={b.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="LULC Transition Matrix" sub="Post-classification comparison" />
          <div className="space-y-2">
            {matrix.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-slate-400 w-[78px] truncate">{m.from}</span>
                <span className={m.dir === "gain" ? "text-brand-400" : "text-rose-400"}>→</span>
                <span className="text-slate-200 flex-1 truncate">{m.to}</span>
                <span className={`font-semibold ${m.dir === "gain" ? "text-brand-300" : "text-rose-300"}`}>
                  {m.dir === "gain" ? "+" : "−"}{m.ha} ha
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Quality & Caveats" />
          <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
            <li>✓ Seasons matched (post-monsoon → rabi both low-cloud)</li>
            <li>✓ Cloud/shadow masked, scenes co-registered (RMSE 0.4 px)</li>
            <li>✓ Threshold ±0.08 calibrated on stable reference plots</li>
            <li className="text-amber-300/90">⚠ Seasonal variation is not automatically intervention impact</li>
          </ul>
          <p className="text-[10px] text-slate-500 mt-3 border-t border-white/[0.06] pt-2">{provenance.imagery}</p>
        </Card>
      </div>
    </div>
  );
}
