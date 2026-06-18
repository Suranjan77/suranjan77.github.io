"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 470;
const H = 380;
const plot = { left: 64, top: 36, right: 406, bottom: 300 };

const binCenterX = (i: number) => 90 + i * 54;
const binWidth = 36;
const theoreticalProbs = [0.1, 0.19, 0.26, 0.21, 0.15, 0.09];
const binColors = [COLORS.pink, COLORS.yellow, COLORS.cyan, COLORS.green, COLORS.muted, "#8F6FA8"];

interface FallingDot {
  id: number;
  binIndex: number;
  startX: number;
  startY: number;
  targetY: number;
  color: string;
}

export default function ProbabilityViz() {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [dots, setDots] = useState<FallingDot[]>([]);
  const [autoPlayMode, setAutoPlayMode] = useState<"off" | "slow" | "fast" | "ultra">("off");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const n = counts.reduce((sum, c) => sum + c, 0);
  const empProbs = theoreticalProbs.map((_, i) => (n > 0 ? counts[i] / n : 0));
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
    const currentEmpProb = n > 0 ? counts[binIndex] / n : 0;
    const targetY = plot.bottom - currentEmpProb * 800 - 4;
    setDots((prev) => [
      ...prev,
      {
        id: Math.random() + Date.now(),
        binIndex,
        startX: binCenterX(binIndex) + (Math.random() - 0.5) * 8,
        startY: plot.top - 24,
        targetY,
        color: binColors[binIndex],
      },
    ]);
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
      for (let i = 0; i < amount; i++) next[selectRandomBin()] += 1;
      return next;
    });
    const newDots: FallingDot[] = [];
    for (let i = 0; i < Math.min(12, amount); i++) {
      const binIndex = selectRandomBin();
      newDots.push({
        id: Math.random() + i + Date.now(),
        binIndex,
        startX: binCenterX(binIndex) + (Math.random() - 0.5) * 16,
        startY: plot.top - 24 + Math.random() * 20,
        targetY: plot.bottom - 4,
        color: binColors[binIndex],
      });
    }
    setDots((prev) => [...prev, ...newDots]);
  };

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoPlayMode === "slow") timerRef.current = setInterval(spawnSingleSample, 150);
    else if (autoPlayMode === "fast") timerRef.current = setInterval(() => addBulkSamples(5), 100);
    else if (autoPlayMode === "ultra") timerRef.current = setInterval(() => addBulkSamples(25), 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlayMode, counts]);

  const handleReset = () => {
    setAutoPlayMode("off");
    if (timerRef.current) clearInterval(timerRef.current);
    setCounts([0, 0, 0, 0, 0, 0]);
    setDots([]);
  };

  const converged = tvd < 0.04 && n > 200;
  const caption =
    n === 0
      ? "Each bar is a possible outcome; the dashed outline is its true probability. Drop samples and watch the solid bars climb toward those outlines."
      : n < 60
        ? `Only ${n} trials so far — the empirical bars are jumpy and uneven. Small samples are noisy and can look nothing like the true probabilities.`
        : converged
          ? `After ${n} trials the empirical bars have locked onto the dashed true probabilities (gap ${tvd.toFixed(3)}). That settling is the Law of Large Numbers.`
          : `${n} trials in: the bars are settling toward the dashed theoretical outline (gap to theory ${tvd.toFixed(3)} and shrinking).`;

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Probability Sampling Convergence"
    >
      <title>Probability Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* Axes */}
      <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
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
      <text x={plot.left - 8} y={plot.top - 10} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>probability</text>

      {/* Bars: dashed = true probability, solid = empirical so far */}
      {theoreticalProbs.map((pTheory, i) => {
        const cx = binCenterX(i);
        const theoryH = pTheory * 800;
        const empH = empProbs[i] * 800;
        return (
          <g key={`bin-${i}`}>
            <rect x={cx - binWidth / 2} y={plot.bottom - theoryH} width={binWidth} height={theoryH} fill="none" stroke={binColors[i]} strokeWidth={1.5} strokeDasharray="4 3" strokeOpacity={0.6} />
            <motion.rect
              x={cx - binWidth / 2}
              y={plot.bottom - empH}
              width={binWidth}
              height={empH}
              fill={binColors[i]}
              fillOpacity={0.8}
              animate={{ height: empH, y: plot.bottom - empH }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
            />
            <text x={cx} y={plot.bottom + 18} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={700}>x{i}</text>
            <text x={cx} y={plot.bottom + 32} textAnchor="middle" fill={binColors[i]} fontSize={10} fontWeight={800}>{counts[i]}</text>
          </g>
        );
      })}

      {/* Falling samples */}
      {dots.map((dot) => (
        <motion.circle
          key={dot.id}
          cx={dot.startX}
          r={4.5}
          fill={dot.color}
          initial={{ cy: dot.startY }}
          animate={{ cy: dot.targetY }}
          transition={{ duration: 0.38, ease: "easeIn" }}
          onAnimationComplete={() => absorbDot(dot.id, dot.binIndex)}
        />
      ))}
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-1 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Trials n</span>
        <span data-testid="probability-total-trials" className="font-mono text-2xl font-bold text-pink-700" style={{ color: COLORS.pink }}>
          {n}
        </span>
        <span className="font-sans text-[12px] text-on-surface-variant">
          gap to theory {n > 0 ? tvd.toFixed(3) : "—"}
          {converged ? " · converged" : ""}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <div className="flex flex-wrap gap-2">
          <button aria-label="DROP 1 SAMPLE" onClick={spawnSingleSample} className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container hover:text-primary">
            Drop 1 sample
          </button>
          <button aria-label="DROP 100 SAMPLES" onClick={() => addBulkSamples(100)} className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container hover:text-primary">
            Drop 100
          </button>
          <button aria-label="RESET SIMULATION" onClick={handleReset} disabled={n === 0} className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50">
            Reset
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Auto-rain</span>
          <div className="flex gap-1 border border-outline bg-surface-container-low p-1">
            {(["off", "slow", "fast", "ultra"] as const).map((mode) => (
              <button
                key={mode}
                aria-label={`Auto sampler ${mode}`}
                onClick={() => setAutoPlayMode(mode)}
                className={`px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  autoPlayMode === mode ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-outline-variant"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      A single random trial is unpredictable. But run <strong>many</strong>{" "}
      independent trials and the share of outcomes in each bin closes in on its
      true probability — the dashed outline. That reliable convergence of
      empirical frequency to theoretical probability is the{" "}
      <strong>Law of Large Numbers</strong>, and it is why averages over big
      samples are trustworthy even though any one draw is not.
    </p>
  );

  return (
    <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />
  );
}
