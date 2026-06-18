"use client";

import React, { useState } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 420;
const CX = 300;
const CY = 230;
const UNIT = 42;

const scaleX = (v: number) => CX + v * UNIT;
const scaleY = (v: number) => CY - v * UNIT;
const invertX = (px: number) => (px - CX) / UNIT;
const invertY = (py: number) => (CY - py) / UNIT;

// A tiny 2-D "embedding space". Similar things point the same way.
const ITEMS = [
  { id: "dog", label: "dog", x: 3.4, y: 1.9 },
  { id: "puppy", label: "puppy", x: 2.9, y: 2.6 },
  { id: "cat", label: "cat", x: 1.8, y: 3.1 },
  { id: "car", label: "car", x: -2.4, y: 2.4 },
  { id: "boat", label: "boat", x: -3.0, y: -1.4 },
];

const cosine = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dot = a.x * b.x + a.y * b.y;
  const mag = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y);
  return mag > 1e-6 ? dot / mag : 0;
};

export default function LinearAlgebraViz() {
  const [query, setQuery] = useState({ x: 3.2, y: 1.3 });
  const [dragging, setDragging] = useState(false);

  const scored = ITEMS.map((it) => ({ ...it, sim: cosine(query, it) })).sort((a, b) => b.sim - a.sim);
  const best = scored[0];

  const applyFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const c = pt.matrixTransform(ctm.inverse());
    const nx = Math.max(-4.5, Math.min(4.5, invertX(c.x)));
    const ny = Math.max(-3.5, Math.min(3.5, invertY(c.y)));
    if (Math.hypot(nx, ny) > 0.4) setQuery({ x: nx, y: ny });
  };
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    applyFromEvent(e);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    applyFromEvent(e);
  };
  const onUp = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const arrow = (to: { x: number; y: number }, color: string, width: number) => {
    const x2 = scaleX(to.x);
    const y2 = scaleY(to.y);
    const ang = Math.atan2(scaleY(to.y) - CY, scaleX(to.x) - CX);
    const head = 11;
    return (
      <g>
        <line x1={CX} y1={CY} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
        <path d={`M${x2},${y2} L${x2 - head * Math.cos(ang - 0.4)},${y2 - head * Math.sin(ang - 0.4)} L${x2 - head * Math.cos(ang + 0.4)},${y2 - head * Math.sin(ang + 0.4)} Z`} fill={color} />
      </g>
    );
  };

  const caption = `Your query points most the same way as “${best.label}” (cosine similarity ${best.sim.toFixed(2)}), so that's the top match. Drag the query around: items pointing the same way score near 1, perpendicular ones near 0, opposite ones go negative. This direction-matching is how embeddings power semantic search, recommendations, and attention.`;

  const canvas = (
    <svg className="block h-auto w-full cursor-grab active:cursor-grabbing" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Embedding Similarity Search" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
      <title>Embedding Similarity Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* faint axes */}
      <line x1={scaleX(-5)} y1={CY} x2={scaleX(5)} y2={CY} stroke={COLORS.grid} strokeWidth={1} />
      <line x1={CX} y1={scaleY(-4)} x2={CX} y2={scaleY(4)} stroke={COLORS.grid} strokeWidth={1} />
      <text x={W - 16} y={CY - 8} textAnchor="end" fill={COLORS.muted} fontSize={11}>embedding space (2-D)</text>

      {/* item vectors */}
      {scored.map((it) => {
        const isBest = it.id === best.id;
        return (
          <g key={it.id}>
            {arrow(it, isBest ? COLORS.pink : COLORS.cyan, isBest ? 3.5 : 2)}
            <text x={scaleX(it.x) + (it.x >= 0 ? 8 : -8)} y={scaleY(it.y) + (it.y >= 0 ? -6 : 14)} textAnchor={it.x >= 0 ? "start" : "end"} fill={isBest ? COLORS.pink : COLORS.muted} fontSize={13} fontWeight={isBest ? 800 : 600} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">
              {it.label}
            </text>
          </g>
        );
      })}

      {/* highlight the wedge between query and best match */}
      <path
        d={`M ${CX} ${CY} L ${scaleX(query.x)} ${scaleY(query.y)} L ${scaleX(best.x)} ${scaleY(best.y)} Z`}
        fill={COLORS.yellow}
        fillOpacity={0.12}
      />

      {/* query vector (drag anywhere on the canvas to move it) */}
      {arrow(query, COLORS.yellow, 4)}
      <circle cx={scaleX(query.x)} cy={scaleY(query.y)} r={7} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2} />
      <text x={scaleX(query.x) + 10} y={scaleY(query.y) - 8} fill={COLORS.yellow} fontSize={12} fontWeight={800} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">query · drag</text>
    </svg>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
      <div className="text-[12px] font-bold uppercase text-primary">Ranked by cosine similarity</div>
      {scored.map((it) => (
        <div key={it.id} className="flex items-center gap-2">
          <span className={`w-12 ${it.id === best.id ? "font-bold" : "text-on-surface"}`} style={it.id === best.id ? { color: COLORS.pink } : undefined}>{it.label}</span>
          <div className="relative h-3 flex-1 bg-surface-container">
            {/* centre line for sim = 0 */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-outline" />
            <div
              className="absolute inset-y-0"
              style={{
                backgroundColor: it.id === best.id ? COLORS.pink : COLORS.cyan,
                left: it.sim >= 0 ? "50%" : `${50 + it.sim * 50}%`,
                width: `${Math.abs(it.sim) * 50}%`,
              }}
            />
          </div>
          <span className="w-10 text-right font-bold" style={{ color: it.sim >= 0 ? COLORS.cyan : COLORS.pink }}>{it.sim.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );

  const mentalModel = (
    <p>
      An embedding turns each item into a vector whose <strong>direction</strong>{" "}
      carries its meaning. To find what is similar to a query, you compare
      directions with a <strong>dot product</strong> (here normalised to{" "}
      <strong>cosine similarity</strong>): same direction ≈ 1, perpendicular ≈ 0,
      opposite ≈ −1. Ranking items by this score is exactly how semantic search,
      recommender systems, and the attention mechanism in transformers decide
      what is &quot;close&quot; — the dot product is the similarity engine of
      modern ML.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
