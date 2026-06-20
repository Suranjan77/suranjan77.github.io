"use client";

import React, { useState } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 400;
const plot = { left: 64, right: 680, top: 40, bottom: 320 };
const yTop = 2.6; // display cap for the magnitude axis

export default function SequenceModelsViz() {
  const [w, setW] = useState(0.7);
  const [length, setLength] = useState(16);

  const sx = (t: number) => plot.left + ((t - 1) / (length - 1)) * (plot.right - plot.left);
  const sy = (m: number) => plot.bottom - (Math.min(m, yTop) / yTop) * (plot.bottom - plot.top);

  // influence of the first step's signal after t-1 recurrent multiplications
  const influence = (t: number) => Math.pow(w, t - 1);
  const pts = Array.from({ length }, (_, i) => i + 1).map((t) => ({ t, m: influence(t) }));
  const final = influence(length);

  const regime = w < 0.95 ? "vanishing" : w <= 1.05 ? "stable" : "exploding";
  const regimeColor = regime === "stable" ? COLORS.green : regime === "vanishing" ? COLORS.pink : COLORS.yellow;

  const curve =
    "M " +
    pts
      .map((p) => `${sx(p.t).toFixed(1)} ${sy(p.m).toFixed(1)}`)
      .join(" L ");

  const explodedStep = pts.find((p) => p.m > yTop);

  const caption =
    regime === "vanishing"
      ? `With a recurrent factor of ${w.toFixed(2)}, the first step's signal is multiplied by ${w.toFixed(2)} again and again. By step ${length} only ${(final * 100).toFixed(final < 0.01 ? 2 : 0)}% survives — the network has effectively forgotten how the sequence began. That is the vanishing-gradient problem.`
      : regime === "stable"
        ? `At a factor near 1 (${w.toFixed(2)}) the signal neither fades nor blows up: step 1 still has ${(final * 100).toFixed(0)}% influence at step ${length}. This is what LSTMs and residual paths engineer on purpose so the model can remember across long sequences.`
        : `With a factor of ${w.toFixed(2)} above 1, each step amplifies the signal. It blows past the top of the chart by step ${explodedStep?.t ?? length} and races toward infinity — exploding gradients that make training diverge.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sequence Models Gradient Flow Through Time">
      <title>Sequence Models Gradient Flow Through Time</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* y gridlines */}
      {[0, 0.5, 1, 1.5, 2, 2.5].map((m) => (
        <g key={m}>
          <line x1={plot.left} x2={plot.right} y1={sy(m)} y2={sy(m)} stroke={COLORS.grid} strokeWidth={1} />
          <text x={plot.left - 8} y={sy(m) + 4} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>
            {m.toFixed(1)}×
          </text>
        </g>
      ))}

      {/* perfect-memory reference at 1.0 */}
      <line x1={plot.left} x2={plot.right} y1={sy(1)} y2={sy(1)} stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={plot.right} y={sy(1) - 6} textAnchor="end" fill={COLORS.green} fontSize={10} fontWeight={800}>perfect memory (×1)</text>

      {/* axes */}
      <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <text x={plot.left - 8} y={plot.top - 14} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>influence of step 1</text>
      <text x={plot.right} y={plot.bottom + 24} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>time step →</text>

      {/* the decay/growth curve */}
      <path d={curve} fill="none" stroke={regimeColor} strokeWidth={3} />

      {/* step markers */}
      {pts.map((p) => (
        <circle key={p.t} cx={sx(p.t)} cy={sy(p.m)} r={3} fill={p.m > yTop ? COLORS.yellow : regimeColor} />
      ))}

      {/* explosion marker */}
      {explodedStep && (
        <text x={sx(explodedStep.t)} y={plot.top + 4} textAnchor="middle" fill={COLORS.yellow} fontSize={11} fontWeight={900}>↑ off the chart</text>
      )}

      {/* final influence callout */}
      <g>
        <circle cx={sx(length)} cy={sy(final)} r={6} fill={regimeColor} stroke={COLORS.bg} strokeWidth={2} />
        <text x={sx(length) - 6} y={sy(Math.min(final, yTop)) - 12} textAnchor="end" fill={regimeColor} fontSize={12} fontWeight={900} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
          {final > yTop ? "≫1" : `${(final * 100).toFixed(final < 0.01 ? 2 : 0)}%`}
        </text>
      </g>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <label htmlFor="seq-w" className="flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>Recurrent factor per step</span>
          <span className="text-on-surface">{w.toFixed(2)}×</span>
        </label>
        <input id="seq-w" aria-label="Recurrent factor" type="range" min={0.5} max={1.5} step={0.05} value={w} onChange={(e) => setW(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
          <span>0.5 · forgets</span>
          <span>1.0 · remembers</span>
          <span>1.5 · explodes</span>
        </div>
        <label htmlFor="seq-len" className="mt-1 flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>Sequence length</span>
          <span className="text-on-surface">{length} steps</span>
        </label>
        <input id="seq-len" aria-label="Sequence length" type="range" min={4} max={24} step={1} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
      </div>

      <div className="flex min-w-[210px] flex-col justify-center gap-1 border border-outline bg-surface p-3 font-mono text-[12px]">
        <span className="font-bold uppercase tracking-wide text-on-surface-variant">Gradient Modes</span>
        <span data-testid="seq-regime" className="text-lg font-bold uppercase" style={{ color: regimeColor }}>{regime}</span>
        <div className="mt-1 flex items-center justify-between border-t border-outline pt-2">
          <span className="text-on-surface-variant">step-1 memory at step {length}</span>
        </div>
        <span className="text-base font-bold" style={{ color: regimeColor }}>
          {final > yTop ? "≫ 100% (diverging)" : final < 0.01 ? "≈ 0% (forgotten)" : `${(final * 100).toFixed(0)}%`}
        </span>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A recurrent network reads a sequence one step at a time, carrying a hidden &quot;memory&quot;
        forward. To learn long-range patterns, the influence of an early input must survive all the
        way to the end — and during training, the gradient must survive all the way back.
      </p>
      <p>
        But each step multiplies that signal by roughly the same factor. Repeated multiplication is
        exponential: a factor below 1 decays to <strong>nothing</strong> (the model forgets the start
        — <em>vanishing gradients</em>), a factor above 1 blows up to <strong>infinity</strong>{" "}
        (<em>exploding gradients</em>), and only a factor pinned near 1 preserves memory.
      </p>
      <p>
        That knife-edge is exactly why plain RNNs struggle past a few dozen steps, and why{" "}
        <strong>LSTMs</strong> (a protected memory cell), gradient clipping, and ultimately{" "}
        <strong>attention</strong> (which connects distant steps directly, skipping the chain) were
        invented.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
