"use client";

import React, { useState } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 360;
const D = 4096; // weight matrix is D x D

export default function FineTuningViz() {
  const [rank, setRank] = useState(8);

  const fullParams = D * D;
  const loraParams = 2 * D * rank;
  const pct = (loraParams / fullParams) * 100;
  const factor = Math.round(fullParams / loraParams);

  const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : `${n}`);

  // matrix squares
  const sq = 150;
  const leftX = 70;
  const rightX = 430;
  const topY = 70;
  const strip = Math.max(4, (rank / 64) * 26); // visual thickness of the adapter

  const caption = `Fine-tuning normally retrains the whole ${fmt(fullParams)}-parameter weight matrix. LoRA freezes it and trains only two thin rank-${rank} matrices — ${fmt(
    loraParams,
  )} parameters, just ${pct.toFixed(2)}% of the model, about ${factor}× fewer. Drag the rank: even large ranks stay a sliver of the whole.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="LoRA vs Full Fine-Tuning Parameter Update Diagram">
      <title>LoRA vs Full Fine-Tuning Parameter Update Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* Full fine-tuning: the whole matrix is trainable */}
      <text x={leftX + sq / 2} y={topY - 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>FULL FINE-TUNING</text>
      <rect x={leftX} y={topY} width={sq} height={sq} fill={COLORS.pink} fillOpacity={0.28} stroke={COLORS.pink} strokeWidth={2} />
      <text x={leftX + sq / 2} y={topY + sq / 2 - 4} textAnchor="middle" fill={COLORS.pink} fontSize={12} fontWeight={900}>train all</text>
      <text x={leftX + sq / 2} y={topY + sq / 2 + 14} textAnchor="middle" fill={COLORS.pink} fontSize={12} fontWeight={900}>{fmt(fullParams)}</text>
      <text x={leftX + sq / 2} y={topY + sq + 22} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={700}>every weight updates</text>

      {/* LoRA: frozen W + two small trainable strips */}
      <text x={rightX + sq / 2} y={topY - 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>LOW-RANK ADAPTATION (LoRA)</text>
      <rect x={rightX} y={topY} width={sq} height={sq} fill={COLORS.muted} fillOpacity={0.18} stroke={COLORS.border} strokeWidth={2} />
      <text x={rightX + sq / 2} y={topY + sq / 2 - 2} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={900}>frozen W₀</text>
      <text x={rightX + sq / 2} y={topY + sq / 2 + 14} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={700}>🔒 not trained</text>

      {/* adapter A (left strip) and B (top strip) — the only trainable bits */}
      <rect x={rightX - strip - 8} y={topY} width={strip} height={sq} fill={COLORS.cyan} fillOpacity={0.85} stroke={COLORS.cyan} strokeWidth={1} />
      <rect x={rightX} y={topY - strip - 8} width={sq} height={strip} fill={COLORS.cyan} fillOpacity={0.85} stroke={COLORS.cyan} strokeWidth={1} />
      <text x={rightX + sq / 2} y={topY + sq + 22} textAnchor="middle" fill={COLORS.cyan} fontSize={11} fontWeight={800}>train only A and B (rank {rank})</text>

      {/* headline comparison */}
      <text x={W / 2} y={H - 22} textAnchor="middle" fill={COLORS.muted} fontSize={13} fontWeight={700}>
        LoRA trains{" "}
        <tspan fill={COLORS.cyan} fontWeight={900}>{fmt(loraParams)}</tspan>{" "}
        params —{" "}
        <tspan fill={COLORS.pink} fontWeight={900}>{pct.toFixed(2)}%</tspan>{" "}
        of the layer (~{factor}× fewer)
      </text>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <label htmlFor="lora-rank" className="flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>LoRA rank r</span>
          <span className="text-on-surface">{rank}</span>
        </label>
        <input id="lora-rank" aria-label="LoRA rank" type="range" min={2} max={64} step={2} value={rank} onChange={(e) => setRank(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
          <span>2 · tiny</span>
          <span>64 · richer adapter</span>
        </div>
      </div>

      <div className="flex min-w-[210px] flex-col justify-center gap-1 border border-outline bg-surface p-3 font-mono text-[12px]">
        <div className="flex items-center justify-between"><span className="uppercase tracking-wide text-on-surface-variant">full tuning</span><span className="font-bold" style={{ color: COLORS.pink }}>{fmt(fullParams)}</span></div>
        <div className="flex items-center justify-between"><span className="uppercase tracking-wide text-on-surface-variant">LoRA (r={rank})</span><span className="font-bold" style={{ color: COLORS.cyan }}>{fmt(loraParams)}</span></div>
        <div className="mt-1 flex items-center justify-between border-t border-outline pt-2"><span className="uppercase tracking-wide text-on-surface-variant">trainable</span><span data-testid="ft-percent" className="text-base font-bold text-on-surface">{pct.toFixed(2)}%</span></div>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Adapting a pretrained model to a new task by <strong>full fine-tuning</strong> means updating
        — and storing a fresh copy of — every weight. For a large model that is billions of
        parameters per task: expensive to train and to serve.
      </p>
      <p>
        <strong>LoRA</strong> freezes the original weights and learns a small update in factored
        form: instead of a full D×D change, it trains two thin matrices A (D×r) and B (r×D) whose
        product approximates the update. Because the <strong>rank r</strong> is tiny (often 8), the
        trainable count drops by hundreds of times with little loss in quality.
      </p>
      <p>
        That is why parameter-efficient fine-tuning is everywhere: many small swappable adapters can
        specialize one frozen base model, and each costs a fraction of the memory.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
