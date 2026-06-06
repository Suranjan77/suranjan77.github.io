"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
  NarrativeControls,
} from "../visualizationPrimitives";
import { useSimulation } from "./useAnimationEngine";

const W = 640;
const H = 420;
const plot = { left: 64, top: 34, right: 406, bottom: 234, width: 342, height: 200 };

const scaleX = (val: number) => plot.left + (val / 10) * plot.width;
const scaleY = (val: number) => plot.bottom - val * 240;

// Bimodal target density distribution
const targetDensity = (xVal: number) => {
  const term1 = 0.45 * Math.exp(-0.5 * Math.pow((xVal - 3.2) / 0.95, 2));
  const term2 = 0.55 * Math.exp(-0.5 * Math.pow((xVal - 6.8) / 1.25, 2));
  return term1 + term2;
};

// Generate density curve path
const densityPoints: string[] = [];
for (let i = 0.2; i <= 9.85; i += 0.1) {
  densityPoints.push(`${scaleX(i)} ${scaleY(targetDensity(i))}`);
}
const densityCurvePath = "M " + densityPoints.join(" L ");

export default function MCMCViz() {
  const [currentX, setCurrentX] = useState(1.5);
  const [proposalX, setProposalX] = useState<number | null>(null);
  const [proposalStatus, setProposalStatus] = useState<"pending" | "accepted" | "rejected" | null>(null);
  const [alpha, setAlpha] = useState<number | null>(null);

  // Samples collected for histogram
  const [samples, setSamples] = useState<number[]>([]);
  const [showTrace, setShowTrace] = useState(true);
  const [stepSpeed, setStepSpeed] = useState<"slow" | "fast">("slow");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const autoStepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const visualTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestStepRef = useRef<((instant?: boolean) => void) | null>(null);

  // Box-Muller transform for normal distribution proposal noise
  const randomNormal = (mean = 0, std = 1.1) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * std;
  };

  // Perform one MCMC Step (Metropolis-Hastings)
  const executeMcmcStep = (instant = false) => {
    // 1. Propose candidate
    const noise = randomNormal(0, 1.25);
    const rawProp = currentX + noise;
    const prop = Math.max(0.5, Math.min(9.5, rawProp));

    // 2. Compute acceptance ratio
    const pCurrent = targetDensity(currentX);
    const pProposal = targetDensity(prop);
    const ratio = Math.min(1.0, pProposal / pCurrent);

    if (instant) {
      // Fast mode: immediately decide and accumulate
      const accept = Math.random() < ratio;
      const nextX = accept ? prop : currentX;
      setCurrentX(nextX);
      setSamples((prev) => [...prev, nextX]);
      setProposalX(null);
      setProposalStatus(null);
      setAlpha(null);
    } else {
      // Visual mode: stage proposal
      setProposalX(prop);
      setProposalStatus("pending");
      setAlpha(ratio);

      if (visualTimerRef.current) clearTimeout(visualTimerRef.current);
      // Resolve step after short delay
      const resolveTimer = setTimeout(() => {
        const accept = Math.random() < ratio;
        if (accept) {
          setProposalStatus("accepted");
          setCurrentX(prop);
          setSamples((prev) => [...prev, prop]);
        } else {
          setProposalStatus("rejected");
          setSamples((prev) => [...prev, currentX]);
        }

        // Reset visual state after resolution display
        const clearTimer = setTimeout(() => {
          setProposalX(null);
          setProposalStatus(null);
          setAlpha(null);
        }, 350);
        visualTimerRef.current = clearTimer;
      }, 550);
      visualTimerRef.current = resolveTimer;
    }
  };

  useEffect(() => {
    latestStepRef.current = executeMcmcStep;
  });

  // Auto-play timer effect
  useEffect(() => {
    if (autoStepTimerRef.current) clearTimeout(autoStepTimerRef.current);

    if (isAutoPlaying) {
      const interval = stepSpeed === "slow" ? 1100 : 40;
      const loop = () => {
        if (latestStepRef.current) latestStepRef.current(stepSpeed === "fast");
        autoStepTimerRef.current = setTimeout(loop, interval);
      };
      autoStepTimerRef.current = setTimeout(loop, interval);
    }

    return () => {
      if (autoStepTimerRef.current) clearTimeout(autoStepTimerRef.current);
    };
  }, [isAutoPlaying, stepSpeed]);

  const handleReset = () => {
    setIsAutoPlaying(false);
    if (autoStepTimerRef.current) clearTimeout(autoStepTimerRef.current);
    if (visualTimerRef.current) clearTimeout(visualTimerRef.current);
    setCurrentX(1.5);
    setProposalX(null);
    setProposalStatus(null);
    setAlpha(null);
    setSamples([]);
  };

  // Compile empirical histogram bins (25 bins from 0 to 10)
  const binCount = 25;
  const bins = Array(binCount).fill(0);
  samples.forEach((s) => {
    const binIdx = Math.max(0, Math.min(binCount - 1, Math.floor(s * (binCount / 10))));
    bins[binIdx]++;
  });

  const maxBinCount = Math.max(1, ...bins);
  const totalSamples = samples.length;

  // History path coordinates (trace overlay)
  // Show last 30 samples to prevent SVG clogging
  const traceHistory = samples.slice(-30);
  const tracePath =
    traceHistory.length > 1
      ? "M " + traceHistory.map((s, idx) => `${scaleX(s)} ${scaleY(0.04 + idx * 0.008)}`).join(" L ")
      : "";

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="MCMC Metropolis-Hastings Walker">
            <title>M C M C Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Grid Axes */}
            <g>
              {ticks.map((tick) => (
                <g key={tick}>
                  <line x1={scaleX(tick)} x2={scaleX(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
                </g>
              ))}
              <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={plot.right + 12} y={plot.bottom + 4} fill={COLORS.muted} fontSize={11} fontWeight={700}>x</text>
            </g>

            {/* Target Density Mountain (shaded area) */}
            <path d={`${densityCurvePath} L ${scaleX(9.85)} ${plot.bottom} L ${scaleX(0.2)} ${plot.bottom} Z`} fill={COLORS.pink} fillOpacity={0.12} stroke={COLORS.pink} strokeWidth={2} />

            {/* Empirical Histogram Bins at the bottom of the plot */}
            {totalSamples > 0 && (
              <g>
                {bins.map((count, idx) => {
                  if (count === 0) return null;
                  const binW = plot.width / binCount;
                  const bx = plot.left + idx * binW;
                  const ratio = count / maxBinCount;
                  // Max height of histogram is 60px
                  const bh = ratio * 60;

                  return (
                    <motion.rect
                      key={`bin-${idx}-${totalSamples}`}
                      x={bx + 1}
                      y={plot.bottom - bh}
                      width={binW - 2}
                      height={bh}
                      fill={COLORS.cyan}
                      fillOpacity={0.65}
                      stroke={COLORS.cyan}
                      strokeWidth={0.5}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      style={{ transformOrigin: "bottom" }}
                    />
                  );
                })}
              </g>
            )}

            {/* Random Walk Trace Overlay */}
            {showTrace && tracePath && (
              <path
                d={tracePath}
                fill="none"
                stroke={COLORS.yellow}
                strokeWidth={2}
                strokeDasharray="4 3"
                opacity={0.8}
              />
            )}

            {/* Visual Proposal state */}
            {proposalX !== null && (
              <g>
                {/* Dashed proposal scope circle */}
                <circle
                  cx={scaleX(currentX)}
                  cy={scaleY(0.08)}
                  r={1.25 * (plot.width / 10)}
                  fill="none"
                  stroke={COLORS.muted}
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  opacity={0.4}
                />
                
                {/* Connecting arrow line from walker to proposal */}
                <line
                  x1={scaleX(currentX)}
                  y1={scaleY(0.08)}
                  x2={scaleX(proposalX)}
                  y2={scaleY(0.08)}
                  stroke={COLORS.yellow}
                  strokeWidth={2}
                  strokeDasharray="2 2"
                />

                {/* Proposal Dot */}
                <circle
                  cx={scaleX(proposalX)}
                  cy={scaleY(0.08)}
                  r={7}
                  fill={
                    proposalStatus === "accepted"
                      ? COLORS.cyan
                      : proposalStatus === "rejected"
                      ? COLORS.pink
                      : COLORS.yellow
                  }
                  stroke={COLORS.bg}
                  strokeWidth={1.5}
                />
                <text
                  x={scaleX(proposalX)}
                  y={scaleY(0.08) - 12}
                  textAnchor="middle"
                  fill={COLORS.muted}
                  fontSize={8}
                  fontWeight={800}
                >
                  {proposalStatus === "accepted" ? "ACCEPT" : proposalStatus === "rejected" ? "REJECT" : "PROPOSAL"}
                </text>
              </g>
            )}

            {/* Pulse rings around walker */}
            {proposalStatus === "accepted" && (
              <PulseRing px={scaleX(currentX)} py={scaleY(0.08)} color={COLORS.cyan} maxRadius={35} />
            )}

            {/* Walker Dot (yellow) */}
            <circle
              cx={scaleX(currentX)}
              cy={scaleY(0.08)}
              r={9.5}
              fill={COLORS.yellow}
              stroke={COLORS.bg}
              strokeWidth={2}
            />
            <text x={scaleX(currentX) + 12} y={scaleY(0.08) + 3} fill={COLORS.muted} fontSize={9} fontWeight={800}>
              Walker
            </text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Interactions</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button aria-label="MCMC STEP"
              onClick={() => {
                setIsAutoPlaying(false);
                executeMcmcStep(false);
              }}
              disabled={proposalX !== null}
              className="flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold cursor-pointer disabled:opacity-50 text-center"
            >
              MCMC STEP
            </button>
            <button aria-label="PAUSE SAMPLER AUTO RUN"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex h-9 items-center justify-center border border-outline font-bold cursor-pointer active:scale-[0.98] transition-all text-center ${
                isAutoPlaying
                  ? "bg-warning/20 border-warning text-warning"
                  : "bg-surface hover:bg-surface-container hover:text-primary"
              }`}
            >
              {isAutoPlaying ? "PAUSE SAMPLER" : "AUTO RUN"}
            </button>
          </div>

          <div className="mb-3">
            <label className="block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              SAMPLING SPEED:
            </label>
            <div className="grid grid-cols-2 gap-1 border border-outline p-1 bg-surface-container-low">
              {(["slow", "fast"] as const).map((spd) => (
                <button
                  aria-label={spd === "slow" ? "Slow (Visual)" : "Fast (Math)"}
                  key={spd}
                  onClick={() => setStepSpeed(spd)}
                  className={`py-1 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    stepSpeed === spd
                      ? "bg-primary text-on-primary"
                      : "hover:bg-outline-variant text-on-surface-variant"
                  }`}
                >
                  {spd === "slow" ? "Slow (Visual)" : "Fast (Math)"}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">
              Show Trace Overlay:
            </span>
            <button
              aria-label={showTrace ? "ON" : "OFF"}
              onClick={() => setShowTrace(!showTrace)}
              className={`px-3 py-1 border text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                showTrace ? "bg-cyan/20 border-cyan text-cyan" : "bg-surface"
              }`}
            >
              {showTrace ? "ON" : "OFF"}
            </button>
          </div>

          <button aria-label="RESET SAMPLER & SAMPLES"
            onClick={handleReset}
            disabled={totalSamples === 0}
            className="w-full flex h-8 items-center justify-center border border-outline bg-surface hover:bg-surface-container text-on-surface-variant text-[10px] active:scale-[0.98] transition-all tracking-wider cursor-pointer disabled:opacity-50"
          >
            RESET SAMPLER & SAMPLES
          </button>
        </div>

        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-2 block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">
            MCMC RUN STATUS
          </div>
          <div className="bg-surface-container p-3 border border-outline space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Total Samples Collected:</span>
              <span className="font-bold text-primary">{totalSamples}</span>
            </div>
            {alpha !== null && (
              <div className="flex justify-between">
                <span>Acceptance Ratio (α):</span>
                <span className="font-bold text-yellow-600">{alpha.toFixed(3)}</span>
              </div>
            )}
            {proposalStatus && (
              <div className="flex justify-between">
                <span>Last Proposal Decision:</span>
                <span
                  className={
                    proposalStatus === "accepted"
                      ? "text-cyan font-bold"
                      : proposalStatus === "rejected"
                      ? "text-pink font-bold"
                      : "text-muted"
                  }
                >
                  {proposalStatus.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
