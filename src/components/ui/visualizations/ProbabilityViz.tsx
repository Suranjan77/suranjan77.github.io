"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  PulseRing,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 338 };

const binCenterX = (i: number) => 90 + i * 54;
const binWidth = 36;
const theoreticalProbs = [0.1, 0.19, 0.26, 0.21, 0.15, 0.09];
const binColors = [
  COLORS.pink,
  COLORS.yellow,
  COLORS.cyan,
  COLORS.green,
  COLORS.muted,
  "#8F6FA8", // Purple
];

interface FallingDot {
  id: number;
  binIndex: number;
  startX: number;
  startY: number;
  targetY: number;
  color: string;
}

interface ScatterDot {
  id: number;
  startX: number;
  startY: number;
  tx: number;
  ty: number;
  color: string;
}

export default function ProbabilityViz() {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [dots, setDots] = useState<FallingDot[]>([]);
  const [scatterDots, setScatterDots] = useState<ScatterDot[]>([]);
  const [autoPlayMode, setAutoPlayMode] = useState<"off" | "slow" | "fast" | "ultra">("off");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const n = counts.reduce((sum, c) => sum + c, 0);

  // Compute empirical probabilities
  const empProbs = theoreticalProbs.map((_, i) => (n > 0 ? counts[i] / n : 0));

  // Total Variation Distance: 0.5 * sum(|p_empirical - p_theoretical|)
  const tvd = 0.5 * theoreticalProbs.reduce((sum, p, i) => sum + Math.abs(empProbs[i] - p), 0);

  const selectRandomBin = () => {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < theoreticalProbs.length; i++) {
      cumulative += theoreticalProbs[i];
      if (r < cumulative) return i;
    }
    return 5;
  };

  const spawnSingleSample = () => {
    const binIndex = selectRandomBin();
    const id = Math.random() + Date.now();
    const startX = binCenterX(binIndex) + (Math.random() - 0.5) * 8;
    const startY = 10;
    // Animate to just above the empirical bar height
    const currentEmpProb = n > 0 ? counts[binIndex] / n : 0;
    const currentBarH = currentEmpProb * 220;
    const targetY = plot.bottom - currentBarH - 4;

    const newDot: FallingDot = {
      id,
      binIndex,
      startX,
      startY,
      targetY,
      color: binColors[binIndex],
    };

    setDots((prev) => [...prev, newDot]);
  };

  const absorbDot = (id: number, binIndex: number) => {
    setCounts((prev) => {
      const next = [...prev];
      next[binIndex] += 1;
      return next;
    });
    setDots((prev) => prev.filter((d) => d.id !== id));
  };

  const addBulkSamples = (amount: number) => {
    setCounts((prev) => {
      const next = [...prev];
      for (let i = 0; i < amount; i++) {
        next[selectRandomBin()] += 1;
      }
      return next;
    });

    // Spawn 8 visual dots representing the burst of rain
    const newDots: FallingDot[] = [];
    const representativeCount = Math.min(12, amount);
    for (let i = 0; i < representativeCount; i++) {
      const binIndex = selectRandomBin();
      newDots.push({
        id: Math.random() + i + Date.now(),
        binIndex,
        startX: binCenterX(binIndex) + (Math.random() - 0.5) * 16,
        startY: 10 + Math.random() * 20,
        targetY: plot.bottom - 4, // go to bottom roughly
        color: binColors[binIndex],
      });
    }
    setDots((prev) => [...prev, ...newDots]);
  };

  // Simulation timer effect
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (autoPlayMode === "slow") {
      timerRef.current = setInterval(() => {
        spawnSingleSample();
      }, 150);
    } else if (autoPlayMode === "fast") {
      timerRef.current = setInterval(() => {
        addBulkSamples(5);
      }, 100);
    } else if (autoPlayMode === "ultra") {
      timerRef.current = setInterval(() => {
        addBulkSamples(25);
      }, 50);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlayMode, counts]);

  const handleReset = () => {
    setAutoPlayMode("off");
    if (timerRef.current) clearInterval(timerRef.current);

    // Generate scatter dots from current bars
    const newScatterDots: ScatterDot[] = [];
    counts.forEach((count, binIndex) => {
      if (count === 0) return;
      const numDotsToScatter = Math.min(8, Math.ceil(count / 2));
      const cx = binCenterX(binIndex);
      const barH = empProbs[binIndex] * 220;
      const bottomY = plot.bottom;

      for (let k = 0; k < numDotsToScatter; k++) {
        const startY = bottomY - Math.random() * barH;
        const angle = (Math.random() - 0.5) * Math.PI; // Upward-outward fan
        const speed = Math.random() * 120 + 60;
        const tx = cx + Math.sin(angle) * speed;
        const ty = startY - Math.cos(angle) * speed - 30;

        newScatterDots.push({
          id: Math.random() + k + Date.now(),
          startX: cx,
          startY,
          tx,
          ty,
          color: binColors[binIndex],
        });
      }
    });

    setScatterDots(newScatterDots);
    setCounts([0, 0, 0, 0, 0, 0]);
    setDots([]);

    setTimeout(() => {
      setScatterDots([]);
    }, 900);
  };

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Probability Sampling Convergence"
          >
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Grid Axes */}
            <g>
              <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
              <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />

              {/* Grid Y tick lines */}
              {[0, 0.1, 0.2, 0.3].map((tick) => {
                const yPos = plot.bottom - tick * 800;
                return (
                  <g key={tick}>
                    <line x1={plot.left} x2={plot.right} y1={yPos} y2={yPos} stroke={COLORS.grid} strokeWidth={1} />
                    <text x={plot.left - 8} y={yPos + 4} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>
                      {(tick * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              <text x={plot.right + 12} y={plot.bottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={700}>Bin</text>
              <text x={plot.left - 8} y={plot.top - 12} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>Probability</text>
            </g>

            {/* Render Bars */}
            {theoreticalProbs.map((pTheory, i) => {
              const cx = binCenterX(i);
              const theoryH = pTheory * 800; // 208px max
              const empH = empProbs[i] * 800;

              return (
                <g key={`bin-${i}`}>
                  {/* Faint theoretical outline */}
                  <rect
                    x={cx - binWidth / 2}
                    y={plot.bottom - theoryH}
                    width={binWidth}
                    height={theoryH}
                    fill="none"
                    stroke={binColors[i]}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    strokeOpacity={0.5}
                  />

                  {/* Empirical solid bar */}
                  <motion.rect
                    x={cx - binWidth / 2}
                    y={plot.bottom - empH}
                    width={binWidth}
                    height={empH}
                    fill={binColors[i]}
                    fillOpacity={0.8}
                    stroke={binColors[i]}
                    strokeWidth={1}
                    animate={{ height: empH, y: plot.bottom - empH }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                  />

                  {/* Bin labels */}
                  <text x={cx} y={plot.bottom + 18} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={700}>
                    x_{i}
                  </text>

                  {/* Individual Bin stats */}
                  <text x={cx} y={plot.bottom + 32} textAnchor="middle" fill={binColors[i]} fontSize={9} fontWeight={800}>
                    {counts[i]}
                  </text>
                </g>
              );
            })}

            {/* Falling rain dots */}
            {dots.map((dot) => (
              <motion.circle
                key={dot.id}
                cx={dot.startX}
                cy={dot.startY}
                r={4.5}
                fill={dot.color}
                initial={{ cy: dot.startY }}
                animate={{ cy: dot.targetY }}
                transition={{ duration: 0.38, ease: "easeIn" }}
                onAnimationComplete={() => absorbDot(dot.id, dot.binIndex)}
              />
            ))}

            {/* Scatter burst dots on reset */}
            {scatterDots.map((sDot) => (
              <motion.circle
                key={sDot.id}
                cx={sDot.startX}
                cy={sDot.startY}
                r={4}
                fill={sDot.color}
                initial={{ cx: sDot.startX, cy: sDot.startY, opacity: 0.9 }}
                animate={{ cx: sDot.tx, cy: sDot.ty, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}

            {/* In-Plot Info Stats Panel */}
            <g>
              {/* Total Samples */}
              <g transform="translate(440, 44)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={10} fontWeight={700}>TOTAL TRIALS (n)</text>
                <text x={12} y={36} fill={COLORS.pink} fontSize={16} fontWeight={800}>{n}</text>
              </g>

              {/* Total Variation Distance */}
              <g transform="translate(440, 102)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={10} fontWeight={700}>TOTAL VARIATION DISTANCE</text>
                <text x={12} y={36} fill={COLORS.cyan} fontSize={15} fontWeight={800}>{n > 0 ? tvd.toFixed(4) : "1.0000"}</text>
              </g>

              {/* TVD Gauge */}
              <g transform="translate(440, 160)">
                <rect width={166} height={178} fill="rgba(250,248,242,0.6)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={9} fontWeight={800}>CONVERGENCE METER (TVD)</text>

                {/* Vertical Gauge */}
                <rect x={20} y={30} width={20} height={120} fill={COLORS.grid} rx={2} />
                {(() => {
                  const tvdRatio = n > 0 ? Math.min(1, tvd) : 1;
                  const barH = tvdRatio * 120;
                  return (
                    <motion.rect
                      x={20}
                      y={30 + (120 - barH)}
                      width={20}
                      height={barH}
                      fill={tvdRatio < 0.15 ? COLORS.cyan : COLORS.yellow}
                      rx={2}
                      animate={{ height: barH, y: 30 + (120 - barH) }}
                      transition={{ duration: 0.15 }}
                    />
                  );
                })()}

                <text x={48} y={44} fill={COLORS.muted} fontSize={9} fontWeight={600}>TVD = Σ|p_emp - p_th|/2</text>
                <foreignObject x={44} y={54} width={115} height={50}>
                  <div className="font-sans text-[9px] font-medium leading-snug" style={{ color: COLORS.muted }}>
                    Each spin represents one sampled trial event.
                  </div>
                </foreignObject>

                {tvd < 0.05 && n > 200 && (
                  <g>
                    <text x={48} y={114} fill={COLORS.cyan} fontSize={9} fontWeight={800}>✓ CONVERGED!</text>
                    <text x={48} y={126} fill={COLORS.muted} fontSize={7}>Law of Large Numbers</text>
                  </g>
                )}
                
                <text x={20} y={162} fill={COLORS.muted} fontSize={8} fontWeight={700}>MAX TVD: 1.0</text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Control Panel</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={spawnSingleSample}
              className="flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold cursor-pointer"
            >
              DROP 1 SAMPLE
            </button>
            <button
              onClick={() => addBulkSamples(100)}
              className="flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold cursor-pointer"
            >
              DROP 100 SAMPLES
            </button>
          </div>

          <div className="mb-3">
            <label className="block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              AUTO-SAMPLER SPEED:
            </label>
            <div className="grid grid-cols-4 gap-1 border border-outline p-1 bg-surface-container-low">
              {(["off", "slow", "fast", "ultra"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAutoPlayMode(mode)}
                  className={`py-1 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    autoPlayMode === mode
                      ? "bg-primary text-on-primary"
                      : "hover:bg-outline-variant text-on-surface-variant"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={n === 0}
            className="w-full flex h-8 items-center justify-center border border-outline bg-surface hover:bg-surface-container text-on-surface-variant text-[10px] active:scale-[0.98] transition-all tracking-wider cursor-pointer disabled:opacity-50"
          >
            RESET SIMULATION & SCATTER
          </button>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Individual random events are unpredictable. However, as the number of independent trials $n$ grows large, the aggregate empirical frequency converges tightly to the theoretical probability density.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
