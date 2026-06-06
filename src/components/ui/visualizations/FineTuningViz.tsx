"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

export default function FineTuningViz() {
  const [rank, setRank] = useState<number>(8);
  const [dIn] = useState<number>(4096);
  const [dOut] = useState<number>(4096);

  const stats = useMemo(() => {
    const fullParams = dIn * dOut;
    const loraParams = (dIn * rank) + (rank * dOut);
    const ratio = loraParams / fullParams;
    const savingPercent = (1.0 - ratio) * 100.0;

    return {
      fullParams,
      loraParams,
      savingPercent
    };
  }, [rank, dIn, dOut]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox="0 0 640 420"
            className="w-full h-auto select-none"
            role="img"
            aria-label="LoRA vs Full Fine-Tuning Parameter Update Diagram"
          >
            <title>Full Fine-Tuning vs LoRA Updates</title>
            <defs>
              <pattern id="ft-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="640" height="420" fill="url(#ft-grid)" />

            {/* Left Box: Full Fine-Tuning */}
            <g transform="translate(40, 60)">
              <text x={70} y={-15} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.muted}>
                FULL FINE-TUNING
              </text>
              {/* Large weight matrix (trainable, pink/red) */}
              <rect width="140" height="140" fill={COLORS.pink} opacity={0.3} stroke={COLORS.pink} strokeWidth={2} />
              {/* Crossed lines to show everything updates */}
              <line x1={0} y1={0} x2={140} y2={140} stroke={COLORS.pink} strokeWidth={1} opacity={0.6} />
              <line x1={0} y1={140} x2={140} y2={0} stroke={COLORS.pink} strokeWidth={1} opacity={0.6} />
              <text x={70} y={75} textAnchor="middle" fontSize={10} fontWeight={800} fill={COLORS.pink}>
                TRAINABLE W
              </text>
              <text x={70} y={95} textAnchor="middle" fontSize={9} fontWeight={700} fill={COLORS.muted}>
                {(dIn * dOut / 1000000).toFixed(1)}M weights
              </text>
            </g>

            {/* Right Box: LoRA (Parameter Efficient) */}
            <g transform="translate(290, 60)">
              <text x={145} y={-15} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.muted}>
                LOW-RANK ADAPTATION (LoRA)
              </text>
              
              {/* Base weight matrix (frozen, gray) */}
              <rect width="140" height="140" fill={COLORS.grid} opacity={0.6} stroke={COLORS.border} strokeWidth={2} />
              <text x={70} y={70} textAnchor="middle" fontSize={10} fontWeight={800} fill={COLORS.muted}>
                FROZEN W0
              </text>
              <text x={70} y={90} textAnchor="middle" fontSize={9} fontWeight={700} fill={COLORS.muted}>
                (Locked)
              </text>

              {/* Plus sign */}
              <text x={165} y={75} fontSize={20} fontWeight={800} fill={COLORS.muted} textAnchor="middle">+</text>

              {/* LoRA A matrix (rank x d_in) - horizontal rect */}
              {/* Width depends on rank visually (e.g. rank 8 = width 16, rank 32 = width 32) */}
              <g transform="translate(195, 30)">
                <rect
                  width={Math.max(10, rank * 2)}
                  height="80"
                  fill={COLORS.cyan}
                  opacity={0.3}
                  stroke={COLORS.cyan}
                  strokeWidth={1.5}
                />
                <text x={Math.max(10, rank * 2) / 2} y={105} textAnchor="middle" fontSize={9} fontWeight={800} fill={COLORS.cyan}>
                  Matrix A
                </text>
                <text x={Math.max(10, rank * 2) / 2} y={118} textAnchor="middle" fontSize={8} fontWeight={700} fill={COLORS.muted}>
                  r={rank}
                </text>
              </g>

              {/* LoRA B matrix (d_out x rank) - vertical rect */}
              <g transform="translate(250, 60)">
                <rect
                  width="70"
                  height={Math.max(10, rank * 2)}
                  fill={COLORS.cyan}
                  opacity={0.3}
                  stroke={COLORS.cyan}
                  strokeWidth={1.5}
                />
                <text x={35} y={-15} textAnchor="middle" fontSize={9} fontWeight={800} fill={COLORS.cyan}>
                  Matrix B
                </text>
                <text x={35} y={-5} textAnchor="middle" fontSize={8} fontWeight={700} fill={COLORS.muted}>
                  r={rank}
                </text>
              </g>
            </g>

            {/* General Description */}
            <text x={320} y={380} fill={COLORS.muted} fontSize={10} fontWeight={600} textAnchor="middle">
              LoRA freezes the primary weights and trains only two low-rank matrices, saving substantial memory.
            </text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        {/* Sliders and controls */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>LoRA Settings</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[11px]" htmlFor="lora-rank-slider">
              LoRA Rank (r = {rank})
            </label>
            <input
              id="lora-rank-slider"
              type="range"
              min={2}
              max={32}
              step={2}
              value={rank}
              onChange={e => setRank(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="LoRA adaptation rank range slider from 2 to 32"
            />
          </div>
        </div>

        {/* Dynamic comparison stats */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[11px]">Parameter Efficiency</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Full Tuning:</div>
            <div className="font-bold text-right text-pink">
              {(stats.fullParams / 1000000).toFixed(2)}M parameters
            </div>
            
            <div>LoRA (r={rank}):</div>
            <div className="font-bold text-right text-cyan">
              {(stats.loraParams / 1000).toFixed(1)}K parameters
            </div>

            <div className="border-t border-outline pt-2 font-bold">Reduction:</div>
            <div className="border-t border-outline pt-2 font-bold text-right text-cyan">
              {stats.savingPercent.toFixed(3)}% less
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
