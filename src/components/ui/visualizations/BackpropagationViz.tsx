"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

export default function BackpropagationViz() {
  const [x, setX] = useState<number>(-2);
  const [y, setY] = useState<number>(5);
  const [z, setZ] = useState<number>(-4);

  // Compute forward and backward passes
  const results = useMemo(() => {
    // Forward pass
    const q = x + y;
    const f = q * z;

    // Backward pass
    const df_df = 1.0;
    const df_dq = z;
    const df_dz = q;
    const df_dx = df_dq * 1.0;
    const df_dy = df_dq * 1.0;

    return {
      q,
      f,
      df_df,
      df_dq,
      df_dz,
      df_dx,
      df_dy
    };
  }, [x, y, z]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox="0 0 640 420"
            className="w-full h-auto select-none"
            role="img"
            aria-label="Backpropagation Computational Graph Visualizer"
          >
            <title>Computational Graph: f = (x + y) * z</title>
            
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="640" height="420" fill="url(#bp-grid)" />

            {/* Connecting Edges */}
            {/* x -> + */}
            <path d="M 120 100 L 260 170" stroke={COLORS.muted} strokeWidth={3} fill="none" />
            {/* y -> + */}
            <path d="M 120 240 L 260 190" stroke={COLORS.muted} strokeWidth={3} fill="none" />
            {/* + -> * */}
            <path d="M 320 180 L 460 210" stroke={COLORS.muted} strokeWidth={3} fill="none" />
            {/* z -> * */}
            <path d="M 120 340 L 460 230" stroke={COLORS.muted} strokeWidth={3} fill="none" />
            {/* * -> output */}
            <path d="M 520 220 L 590 220" stroke={COLORS.muted} strokeWidth={3} fill="none" />

            {/* Node x (Input) */}
            <g transform="translate(100, 100)">
              <circle r={35} fill={COLORS.bg} stroke={COLORS.border} strokeWidth={2} />
              <text y={-5} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.muted}>x</text>
              <text y={15} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.cyan}>val: {x}</text>
              <text y={-45} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.pink}>grad: {results.df_dx.toFixed(1)}</text>
            </g>

            {/* Node y (Input) */}
            <g transform="translate(100, 240)">
              <circle r={35} fill={COLORS.bg} stroke={COLORS.border} strokeWidth={2} />
              <text y={-5} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.muted}>y</text>
              <text y={15} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.cyan}>val: {y}</text>
              <text y={-45} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.pink}>grad: {results.df_dy.toFixed(1)}</text>
            </g>

            {/* Node z (Input) */}
            <g transform="translate(100, 340)">
              <circle r={35} fill={COLORS.bg} stroke={COLORS.border} strokeWidth={2} />
              <text y={-5} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.muted}>z</text>
              <text y={15} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.cyan}>val: {z}</text>
              <text y={-45} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.pink}>grad: {results.df_dz.toFixed(1)}</text>
            </g>

            {/* Node q (+) */}
            <g transform="translate(290, 180)">
              <circle r={35} fill={COLORS.bg} stroke={COLORS.border} strokeWidth={2} />
              <text y={-5} textAnchor="middle" fontSize={18} fontWeight={800} fill={COLORS.muted}>+</text>
              <text y={15} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.cyan}>val: {results.q}</text>
              <text y={-45} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.pink}>grad: {results.df_dq.toFixed(1)}</text>
            </g>

            {/* Node f (*) */}
            <g transform="translate(490, 220)">
              <circle r={35} fill={COLORS.bg} stroke={COLORS.border} strokeWidth={2} />
              <text y={-5} textAnchor="middle" fontSize={18} fontWeight={800} fill={COLORS.muted}>*</text>
              <text y={15} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.cyan}>val: {results.f}</text>
              <text y={-45} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.pink}>grad: {results.df_df.toFixed(1)}</text>
            </g>

            {/* Text details inside the plot */}
            <text x={300} y={40} fill={COLORS.muted} fontSize={12} fontWeight={700} textAnchor="middle">
              FUNCTION: f(x, y, z) = (x + y) * z
            </text>
            <text x={300} y={380} fill={COLORS.muted} fontSize={10} fontWeight={600} textAnchor="middle">
              Forward passes are evaluated in green/cyan. Backward gradients are in red/pink.
            </text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Inputs</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="bp-slider-x">
              Input x ({x})
            </label>
            <input
              id="bp-slider-x"
              type="range"
              min={-5}
              max={5}
              step={1}
              value={x}
              onChange={e => setX(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Input variable x range slider"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="bp-slider-y">
              Input y ({y})
            </label>
            <input
              id="bp-slider-y"
              type="range"
              min={-5}
              max={5}
              step={1}
              value={y}
              onChange={e => setY(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Input variable y range slider"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="bp-slider-z">
              Input z ({z})
            </label>
            <input
              id="bp-slider-z"
              type="range"
              min={-5}
              max={5}
              step={1}
              value={z}
              onChange={e => setZ(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Input variable z range slider"
            />
          </div>
        </div>

        {/* Analytical Derivatives */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Calculated Gradients</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>df/dx = z:</div>
            <div className="font-bold text-right text-pink">{results.df_dx}</div>
            <div>df/dy = z:</div>
            <div className="font-bold text-right text-pink">{results.df_dy}</div>
            <div>df/dz = x + y:</div>
            <div className="font-bold text-right text-pink">{results.df_dz}</div>
            <div>df/dq = z:</div>
            <div className="font-bold text-right text-pink">{results.df_dq}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
