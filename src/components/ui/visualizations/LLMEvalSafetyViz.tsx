"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 300;

type Axis = "quality" | "safety" | "cost" | "latency";
const AXES: { key: Axis; label: string }[] = [
  { key: "quality", label: "Quality" },
  { key: "safety", label: "Safety" },
  { key: "cost", label: "Cheapness" },
  { key: "latency", label: "Speed" },
];

const MODELS = [
  { name: "Frontier (proprietary)", quality: 9.5, safety: 9.0, cost: 2.0, latency: 4.0 },
  { name: "Open-weights 70B", quality: 8.5, safety: 7.5, cost: 6.0, latency: 7.0 },
  { name: "Small edge 8B", quality: 6.5, safety: 6.0, cost: 9.5, latency: 9.5 },
];

const PRESETS: { name: string; w: Record<Axis, number> }[] = [
  { name: "Healthcare", w: { quality: 8, safety: 10, cost: 1, latency: 1 } },
  { name: "High-volume chatbot", w: { quality: 3, safety: 2, cost: 10, latency: 10 } },
  { name: "Research / quality", w: { quality: 10, safety: 5, cost: 2, latency: 2 } },
];

export default function LLMEvalSafetyViz() {
  const [w, setW] = useState<Record<Axis, number>>({ quality: 8, safety: 9, cost: 4, latency: 5 });

  const total = w.quality + w.safety + w.cost + w.latency || 1;
  const scored = MODELS.map((m) => ({
    ...m,
    score: (m.quality * w.quality + m.safety * w.safety + m.cost * w.cost + m.latency * w.latency) / total,
  })).sort((a, b) => b.score - a.score);
  const winner = scored[0];

  const rowH = 78;
  const barX = 250;
  const barMax = W - barX - 70;

  const caption = `No model wins on every axis — the frontier model is best on quality and safety, the small one on cost and speed. Your priorities pick the winner: right now the weighting favours "${winner.name}". Try a preset and watch the ranking flip.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="LLM Model Scores Bar Chart">
      <title>LLM Model Scores Bar Chart</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {scored.map((m, idx) => {
        const y = 24 + idx * rowH;
        const isWin = idx === 0;
        return (
          <g key={m.name}>
            <text x={20} y={y + 16} fill={isWin ? COLORS.cyan : COLORS.muted} fontSize={13} fontWeight={isWin ? 900 : 700}>
              {m.name}
            </text>
            {isWin && <text x={20} y={y + 32} fill={COLORS.cyan} fontSize={10} fontWeight={800}>★ BEST FIT</text>}

            {/* per-axis mini bars */}
            {AXES.map((a, ai) => {
              const v = (m as unknown as Record<Axis, number>)[a.key];
              return (
                <g key={a.key} transform={`translate(${20 + ai * 54}, ${y + 40})`}>
                  <rect x={0} y={0} width={46} height={6} fill={COLORS.grid} />
                  <rect x={0} y={0} width={(v / 10) * 46} height={6} fill={COLORS.muted} fillOpacity={0.7} />
                  <text x={0} y={20} fill={COLORS.muted} fontSize={8} fontWeight={700}>{a.label}</text>
                </g>
              );
            })}

            {/* weighted score bar */}
            <rect x={barX} y={y} width={barMax} height={26} fill={COLORS.grid} />
            <motion.rect
              x={barX}
              y={y}
              height={26}
              fill={isWin ? COLORS.cyan : COLORS.pink}
              fillOpacity={isWin ? 0.85 : 0.5}
              initial={false}
              animate={{ width: (m.score / 10) * barMax }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
            />
            <text x={barX + barMax + 8} y={y + 18} fill={COLORS.muted} fontSize={13} fontWeight={800}>
              {m.score.toFixed(2)}
            </text>
          </g>
        );
      })}
      <text x={barX} y={H - 8} fill={COLORS.muted} fontSize={10} fontWeight={700}>weighted score (out of 10)</text>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Priority preset</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              aria-label={`Priority preset ${p.name}`}
              onClick={() => setW(p.w)}
              className="border border-outline bg-surface px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="border-t border-outline pt-2 font-mono text-[12px]">
          <span className="uppercase tracking-wide text-on-surface-variant">Winner: </span>
          <span data-testid="eval-winner" className="font-bold" style={{ color: COLORS.cyan }}>{winner.name}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Dimension Weights</span>
        {AXES.map((a) => (
          <div key={a.key} className="flex items-center gap-2">
            <label htmlFor={`evw-${a.key}`} className="w-20 font-mono text-[11px] font-bold uppercase text-primary">{a.label}</label>
            <input
              id={`evw-${a.key}`}
              aria-label={`${a.label} weight`}
              type="range"
              min={0}
              max={10}
              step={1}
              value={w[a.key]}
              onChange={(e) => setW((prev) => ({ ...prev, [a.key]: Number(e.target.value) }))}
              className="flex-1 cursor-pointer accent-primary"
            />
            <span className="w-5 text-right font-mono text-[11px] font-bold text-on-surface">{w[a.key]}</span>
          </div>
        ))}
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Picking a model is never a single leaderboard number. A useful evaluation scores several
        axes at once — <strong>capability</strong>, <strong>safety</strong>, <strong>cost</strong>,
        and <strong>latency</strong> — and they trade off against each other.
      </p>
      <p>
        The biggest model is best on quality and safety but slow and expensive; the small one is the
        reverse. There is <strong>no single winner</strong>: the right choice depends on how much
        each axis matters for <em>your</em> use case. A medical assistant weights safety above all; a
        high-volume chatbot weights cost and speed.
      </p>
      <p>
        That is why model selection is a <strong>multi-objective, constraint-driven</strong>{" "}
        decision, and why safety is a first-class axis, not an afterthought.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
