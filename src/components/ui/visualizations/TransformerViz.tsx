"use client";

import React, { useState } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  VisualizationInstruction,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

const tokens = ["The", "model", "attends", "to", "context"];

// Attention weights for Head 1 (Semantic focus)
const head1Weights: Record<string, number[]> = {
  The: [0.6, 0.2, 0.1, 0.05, 0.05],
  model: [0.1, 0.5, 0.3, 0.05, 0.05],
  attends: [0.05, 0.25, 0.5, 0.1, 0.1],
  to: [0.05, 0.05, 0.2, 0.6, 0.1],
  context: [0.05, 0.1, 0.35, 0.1, 0.4],
};

// Attention weights for Head 2 (Positional/adjacent focus)
const head2Weights: Record<string, number[]> = {
  The: [0.4, 0.5, 0.05, 0.03, 0.02],
  model: [0.35, 0.3, 0.3, 0.03, 0.02],
  attends: [0.03, 0.3, 0.34, 0.3, 0.03],
  to: [0.02, 0.03, 0.3, 0.3, 0.35],
  context: [0.02, 0.03, 0.05, 0.4, 0.5],
};

export default function TransformerViz() {
  const [hoveredIdx, setHoveredIdx] = useState<number>(1); // default to "model"
  const [multiHead, setMultiHead] = useState(false);

  const queryToken = tokens[hoveredIdx];
  const h1 = head1Weights[queryToken];
  const h2 = head2Weights[queryToken];

  // Token positions horizontally
  const tokenWidth = 96;
  const tokenStartX = 80;
  const tokenY = 90;

  const getTokenX = (idx: number) => tokenStartX + idx * tokenWidth + 24;

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Transformer Self-Attention Layer">
            <title>Transformer Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Attention arcs (Quadratic Bezier curves Q) */}
            <g>
              {tokens.map((_, targetIdx) => {
                const startX = getTokenX(hoveredIdx);
                const targetX = getTokenX(targetIdx);
                const midX = (startX + targetX) / 2;
                
                // Height of arc proportional to distance
                const dist = Math.abs(hoveredIdx - targetIdx);
                const arcHeight = dist * 25;
                const controlY = tokenY - 15 - arcHeight;

                const pathD = `M ${startX} ${tokenY - 14} Q ${midX} ${controlY} ${targetX} ${tokenY - 14}`;

                // Head 1 (Cyan)
                const w1 = h1[targetIdx];
                const activeStrokeWidth1 = 1 + w1 * 7;
                const activeOpacity1 = 0.15 + w1 * 0.75;

                // Head 2 (Pink)
                const w2 = h2[targetIdx];
                const activeStrokeWidth2 = 1 + w2 * 7;
                const activeOpacity2 = 0.15 + w2 * 0.75;

                return (
                  <g key={`arc-${targetIdx}`}>
                    {/* Head 1 Arc */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={COLORS.cyan}
                      strokeWidth={activeStrokeWidth1}
                      strokeOpacity={activeOpacity1}
                      className="transition-all duration-300"
                    />

                    {/* Head 2 Arc (if multi-head enabled) */}
                    {multiHead && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={COLORS.pink}
                        strokeWidth={activeStrokeWidth2}
                        strokeOpacity={activeOpacity2}
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Text overlays showing weights */}
                    {dist > 0 && (
                      <text
                        x={midX}
                        y={controlY + 12}
                        textAnchor="middle"
                        fill={multiHead ? COLORS.yellow : COLORS.cyan}
                        fontSize={8}
                        fontWeight={800}
                        stroke={COLORS.bg}
                        strokeWidth={2}
                        paintOrder="stroke"
                      >
                        {multiHead ? `H1:${w1.toFixed(2)} H2:${w2.toFixed(2)}` : w1.toFixed(2)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Token Labels */}
            <g>
              {tokens.map((tok, idx) => {
                const isHovered = idx === hoveredIdx;
                const scaleVal = isHovered ? 1.15 : 1.0;
                const tokenX = getTokenX(idx);

                return (
                  <g
                    key={`tok-${idx}`}
                    onPointerOver={() => setHoveredIdx(idx)}
                    className="cursor-pointer"
                  >
                    <motion.rect
                      x={tokenX - 32}
                      y={tokenY - 26}
                      width={64}
                      height={32}
                      fill={isHovered ? COLORS.yellow : COLORS.bg}
                      fillOpacity={isHovered ? 0.2 : 0.8}
                      stroke={isHovered ? COLORS.yellow : COLORS.border}
                      strokeWidth={isHovered ? 2.5 : 1}
                      animate={{ scale: scaleVal }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    />
                    <motion.text
                      x={tokenX}
                      y={tokenY - 6}
                      textAnchor="middle"
                      fill={isHovered ? COLORS.yellow : COLORS.muted}
                      fontSize={13}
                      fontWeight={isHovered ? 900 : 700}
                      animate={{ scale: scaleVal }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      {tok}
                    </motion.text>
                  </g>
                );
              })}
            </g>

            {/* Attention Heatmap Matrix (Left bottom) */}
            <g transform="translate(68, 166)">
              <text x={2.5 * 32} y={-10} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>ATTENTION HEATMAP</text>
              {tokens.map((_, r) =>
                tokens.map((__, c) => {
                  const isQueryRow = r === hoveredIdx;
                  // attention value depends on active query row and multi-head config
                  const cellW1 = head1Weights[tokens[r]][c];
                  const cellW2 = head2Weights[tokens[r]][c];
                  const avgW = multiHead ? (cellW1 + cellW2) / 2 : cellW1;

                  return (
                    <rect
                      key={`cell-${r}-${c}`}
                      x={c * 32}
                      y={r * 32}
                      width={30}
                      height={30}
                      fill={isQueryRow ? COLORS.pink : COLORS.cyan}
                      fillOpacity={0.08 + avgW * 0.8}
                      stroke={isQueryRow && c === hoveredIdx ? COLORS.yellow : COLORS.grid}
                      strokeWidth={isQueryRow && c === hoveredIdx ? 2 : 0.5}
                    />
                  );
                })
              )}
              {/* Labels on matrix */}
              <text x={-10} y={2.5 * 32 + 4} textAnchor="end" fill={COLORS.muted} fontSize={12} fontWeight={800} transform={`rotate(-90 -10 ${2.5 * 32})`}>QUERIES (Q)</text>
              <text x={2.5 * 32} y={5 * 32 + 12} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>KEYS (K)</text>
            </g>

            {/* Softmax Distribution chart (Right bottom) */}
            <g transform="translate(390, 166)">
              <rect width={194} height={166} fill="none" stroke={COLORS.border} strokeDasharray="3 3" />
              <text x={97} y={18} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>SOFTMAX ATTENTION PROFILE</text>
              
              {tokens.map((tok, idx) => {
                const w1 = h1[idx];
                const w2 = h2[idx];
                const isQuery = idx === hoveredIdx;

                return (
                  <g key={`bar-${idx}`}>
                    <text x={16} y={42 + idx * 26} fill={isQuery ? COLORS.pink : COLORS.muted} fontSize={10} fontWeight={800}>{tok}</text>
                    
                    {/* Head 1 Bar */}
                    <rect
                      x={64}
                      y={32 + idx * 26}
                      width={w1 * 90}
                      height={multiHead ? 8 : 14}
                      fill={COLORS.cyan}
                      fillOpacity={0.8}
                    />

                    {/* Head 2 Bar */}
                    {multiHead && (
                      <rect
                        x={64}
                        y={42 + idx * 26}
                        width={w2 * 90}
                        height={8}
                        fill={COLORS.pink}
                        fillOpacity={0.8}
                      />
                    )}

                    <text x={164} y={multiHead ? 43 + idx * 26 : 42 + idx * 26} fill={COLORS.muted} fontSize={9} fontWeight={700}>
                      {multiHead ? `H1:${(w1*100).toFixed(0)}%` : `${(w1*100).toFixed(0)}%`}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Attention Heads</span>
          </div>

          <button aria-label="MULTI-HEAD ATTENTION (2 heads) SINGLE-HEAD ATTENTION"
            onClick={() => setMultiHead(!multiHead)}
            className={`w-full flex h-9 items-center justify-center border font-bold tracking-wider cursor-pointer active:scale-[0.98] transition-all text-[12px] uppercase ${
              multiHead
                ? "bg-cyan/20 border-cyan text-cyan"
                : "bg-surface hover:bg-surface-container border-outline text-on-surface-variant"
            }`}
          >
            {multiHead ? "MULTI-HEAD ATTENTION (2 heads)" : "SINGLE-HEAD ATTENTION"}
          </button>

          <VisualizationInstruction
            title="Interactivity:"
            content="Hover over any word in the top sentence. Attention weights scale node links and project softmax values instantly."
            className="uppercase"
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Self-attention calculates a query-key dot product score $Q \times K^T$, runs it through Softmax to produce weights, and computes a weighted average of Values ($V$). Multi-head attention allows the model to simultaneously focus on different features (like semantic vs. syntactic relations).`} />
          </div>
        </div>
      </div>
    </div>
  );
}
