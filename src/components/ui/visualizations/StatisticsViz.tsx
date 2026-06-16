"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";
import { createSeededRNG } from "@/lib/prng";
import { motion } from "framer-motion";

const W = 640;
const H = 420;

export default function StatisticsViz() {
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [numBootstrapSamples, setNumBootstrapSamples] = useState<number>(1000);
  const [statisticType, setStatisticType] = useState<"mean" | "median">("mean");
  const [seed, setSeed] = useState<number>(42);
  const [bootstrapResults, setBootstrapResults] = useState<number[]>([]);
  const [originalSample, setOriginalSample] = useState<number[]>([]);
  const [animatingStep, setAnimatingStep] = useState<boolean>(false);
  const [animationBootstrapSample, setAnimationBootstrapSample] = useState<number[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Generate original data sample using seeded RNG
  useEffect(() => {
    const rng = createSeededRNG(seed);
    const data: number[] = [];
    // Generate a distribution that is slightly bimodal or skewed to be interesting
    for (let i = 0; i < sampleSize; i++) {
      if (rng.next() > 0.4) {
        // Mode 1: Normal around 4.5
        data.push(4.5 + rng.nextGaussian() * 1.0);
      } else {
        // Mode 2: Normal around 7.0
        data.push(7.0 + rng.nextGaussian() * 0.8);
      }
    }
    // Clip data to [1, 9] for plotting limits
    const clippedData = data.map(val => Math.max(1, Math.min(9, val)));
    setOriginalSample(clippedData);
    setBootstrapResults([]);
    setAnimationBootstrapSample([]);
  }, [sampleSize, seed]);

  // Compute stats of original sample
  const originalStatValue = useMemo(() => {
    if (originalSample.length === 0) return 0;
    if (statisticType === "mean") {
      return originalSample.reduce((sum, v) => sum + v, 0) / originalSample.length;
    } else {
      const sorted = [...originalSample].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
  }, [originalSample, statisticType]);

  // Run full bootstrap simulation
  const runFullBootstrap = () => {
    if (originalSample.length === 0) return;
    const rng = createSeededRNG(seed + 12345); // use a derived seed
    const results: number[] = [];

    for (let b = 0; b < numBootstrapSamples; b++) {
      const resample: number[] = [];
      for (let i = 0; i < sampleSize; i++) {
        const randIdx = rng.nextInt(0, originalSample.length - 1);
        resample.push(originalSample[randIdx]);
      }

      let statVal = 0;
      if (statisticType === "mean") {
        statVal = resample.reduce((sum, v) => sum + v, 0) / sampleSize;
      } else {
        resample.sort((a, b) => a - b);
        const mid = Math.floor(sampleSize / 2);
        statVal = sampleSize % 2 !== 0 ? resample[mid] : (resample[mid - 1] + resample[mid]) / 2;
      }
      results.push(statVal);
    }
    results.sort((a, b) => a - b);
    setBootstrapResults(results);
  };

  // Run a single animated step of bootstrap resampling
  const runBootstrapStep = () => {
    if (originalSample.length === 0) return;
    setAnimatingStep(true);
    const rng = createSeededRNG(Math.random() * 100000); // fresh seed
    const resample: number[] = [];
    let stepCount = 0;

    const interval = setInterval(() => {
      if (stepCount < sampleSize) {
        const randIdx = rng.nextInt(0, originalSample.length - 1);
        setHighlightedIndex(randIdx);
        const val = originalSample[randIdx];
        resample.push(val);
        setAnimationBootstrapSample([...resample]);
        stepCount++;
      } else {
        clearInterval(interval);
        setHighlightedIndex(null);
        setAnimatingStep(false);
        // Add this sample's statistic to our results
        let statVal = 0;
        if (statisticType === "mean") {
          statVal = resample.reduce((sum, v) => sum + v, 0) / sampleSize;
        } else {
          resample.sort((a, b) => a - b);
          const mid = Math.floor(sampleSize / 2);
          statVal = sampleSize % 2 !== 0 ? resample[mid] : (resample[mid - 1] + resample[mid]) / 2;
        }
        setBootstrapResults(prev => [...prev, statVal].sort((a, b) => a - b));
      }
    }, 50);
  };

  // Compute CI limits (2.5th and 97.5th percentiles)
  const confidenceInterval = useMemo(() => {
    if (bootstrapResults.length === 0) return null;
    const lowIdx = Math.floor(bootstrapResults.length * 0.025);
    const highIdx = Math.min(bootstrapResults.length - 1, Math.floor(bootstrapResults.length * 0.975));
    return {
      lower: bootstrapResults[lowIdx],
      upper: bootstrapResults[highIdx]
    };
  }, [bootstrapResults]);

  // Standard Error of bootstrap distribution
  const bootstrapSE = useMemo(() => {
    if (bootstrapResults.length === 0) return 0;
    const mean = bootstrapResults.reduce((s, x) => s + x, 0) / bootstrapResults.length;
    const variance = bootstrapResults.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / (bootstrapResults.length - 1);
    return Math.sqrt(variance);
  }, [bootstrapResults]);

  // Map values to pixels
  const pad = { left: 50, right: 30, top: 40, bottom: 40 };
  const scaleX = (val: number) => pad.left + ((val - 1) / 8) * (W - pad.left - pad.right);
  const scaleY = (val: number, maxFreq: number) => H - pad.bottom - (val / (maxFreq || 1)) * 120;

  // Build histogram bins for bootstrap statistics
  const bins = useMemo(() => {
    if (bootstrapResults.length === 0) return [];
    const numBins = 30;
    const binCounts = new Array(numBins).fill(0);
    const minVal = 1;
    const maxVal = 9;
    const step = (maxVal - minVal) / numBins;

    bootstrapResults.forEach(v => {
      const idx = Math.min(numBins - 1, Math.floor((v - minVal) / step));
      if (idx >= 0 && idx < numBins) {
        binCounts[idx]++;
      }
    });

    return binCounts.map((count, idx) => ({
      x0: minVal + idx * step,
      x1: minVal + (idx + 1) * step,
      count
    }));
  }, [bootstrapResults]);

  const maxBinCount = useMemo(() => {
    if (bins.length === 0) return 1;
    return Math.max(...bins.map(b => b.count));
  }, [bins]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label="Seeded Bootstrap Simulator"
          >
            <title>Seeded Bootstrap Simulator</title>
            <defs>
              <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#grid-pattern)" />

            {/* Original sample axis & dots */}
            <g transform="translate(0, 10)">
              <text x={pad.left} y={24} fill={COLORS.muted} fontSize={12} fontWeight={700}>
                ORIGINAL SAMPLE (N = {originalSample.length})
              </text>
              <line x1={scaleX(1)} y1={50} x2={scaleX(9)} y2={50} stroke={COLORS.border} strokeWidth={2} />
              {/* X Axis ticks */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => (
                <g key={`t1-${t}`} transform={`translate(${scaleX(t)}, 50)`}>
                  <line y2={6} stroke={COLORS.border} strokeWidth={1.5} />
                  <text y={18} textAnchor="middle" fontSize={10} fill={COLORS.muted} fontWeight={600}>{t}</text>
                </g>
              ))}

              {originalSample.map((val, idx) => {
                const highlighted = highlightedIndex === idx;
                return (
                  <circle
                    key={`orig-${idx}`}
                    cx={scaleX(val)}
                    cy={50}
                    r={highlighted ? 7 : 4.5}
                    fill={highlighted ? COLORS.pink : COLORS.cyan}
                    stroke={highlighted ? "#fff" : COLORS.muted}
                    strokeWidth={highlighted ? 2 : 1}
                    opacity={highlighted ? 1 : 0.8}
                  />
                );
              })}

              <text x={scaleX(originalStatValue)} y={38} textAnchor="middle" fontSize={10} fill={COLORS.muted} fontWeight={700}>
                ▼ Sample {statisticType === "mean" ? "Mean" : "Median"}: {originalStatValue.toFixed(2)}
              </text>
            </g>

            {/* Bootstrap resample visualization */}
            <g transform="translate(0, 110)">
              <text x={pad.left} y={20} fill={COLORS.muted} fontSize={12} fontWeight={700}>
                CURRENT RESAMPLE STEP ({animationBootstrapSample.length} / {sampleSize})
              </text>
              <line x1={scaleX(1)} y1={45} x2={scaleX(9)} y2={45} stroke={COLORS.border} strokeWidth={2} />
              {animationBootstrapSample.map((val, idx) => (
                <circle
                  key={`resample-${idx}`}
                  cx={scaleX(val)}
                  cy={45 + (idx % 3) * 6 - 6} // jitter to prevent complete overlaps
                  r={4}
                  fill={COLORS.pink}
                  opacity={0.9}
                />
              ))}
            </g>

            {/* Bootstrap Distribution (Histogram) */}
            <g transform="translate(0, 200)">
              <text x={pad.left} y={24} fill={COLORS.muted} fontSize={12} fontWeight={700}>
                BOOTSTRAP SAMPLING DISTRIBUTION ({bootstrapResults.length} SAMPLES)
              </text>
              <line x1={scaleX(1)} y1={H - 200 - pad.bottom} x2={scaleX(9)} y2={H - 200 - pad.bottom} stroke={COLORS.border} strokeWidth={2} />
              
              {/* X Axis ticks */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => (
                <g key={`t2-${t}`} transform={`translate(${scaleX(t)}, ${H - 200 - pad.bottom})`}>
                  <line y2={6} stroke={COLORS.border} strokeWidth={1.5} />
                  <text y={18} textAnchor="middle" fontSize={10} fill={COLORS.muted} fontWeight={600}>{t}</text>
                </g>
              ))}

              {/* Shaded Confidence Interval area */}
              {confidenceInterval && (
                <rect
                  x={scaleX(confidenceInterval.lower)}
                  y={40}
                  width={scaleX(confidenceInterval.upper) - scaleX(confidenceInterval.lower)}
                  height={H - 200 - pad.bottom - 40}
                  fill={COLORS.yellow}
                  opacity={0.15}
                />
              )}

              {/* Render Histogram bars */}
              {bins.map((bin, idx) => {
                const x = scaleX(bin.x0);
                const w = scaleX(bin.x1) - x;
                const h = H - 200 - pad.bottom - scaleY(bin.count, maxBinCount);
                const y = scaleY(bin.count, maxBinCount);

                return (
                  <rect
                    key={`bin-${idx}`}
                    x={x}
                    y={y}
                    width={Math.max(1, w - 1)}
                    height={h}
                    fill={COLORS.yellow}
                    opacity={0.85}
                  />
                );
              })}

              {/* CI Marker Lines */}
              {confidenceInterval && (
                <>
                  <line
                    x1={scaleX(confidenceInterval.lower)}
                    y1={30}
                    x2={scaleX(confidenceInterval.lower)}
                    y2={H - 200 - pad.bottom}
                    stroke={COLORS.yellow}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                  <line
                    x1={scaleX(confidenceInterval.upper)}
                    y1={30}
                    x2={scaleX(confidenceInterval.upper)}
                    y2={H - 200 - pad.bottom}
                    stroke={COLORS.yellow}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                  <text
                    x={scaleX(confidenceInterval.lower) - 5}
                    y={26}
                    textAnchor="end"
                    fontSize={10}
                    fill={COLORS.yellow}
                    fontWeight={800}
                  >
                    2.5%: {confidenceInterval.lower.toFixed(2)}
                  </text>
                  <text
                    x={scaleX(confidenceInterval.upper) + 5}
                    y={26}
                    textAnchor="start"
                    fontSize={10}
                    fill={COLORS.yellow}
                    fontWeight={800}
                  >
                    97.5%: {confidenceInterval.upper.toFixed(2)}
                  </text>
                </>
              )}
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Controls</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="sample-size-slider">
              Sample Size (N: {sampleSize})
            </label>
            <input
              id="sample-size-slider"
              type="range"
              min={10}
              max={100}
              step={1}
              value={sampleSize}
              onChange={e => setSampleSize(Number(e.target.value))}
              disabled={animatingStep}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Sample size range slider from 10 to 100"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="bootstrap-samples-slider">
              Bootstrap Resamples ({numBootstrapSamples})
            </label>
            <input
              id="bootstrap-samples-slider"
              type="range"
              min={100}
              max={5000}
              step={100}
              value={numBootstrapSamples}
              onChange={e => setNumBootstrapSamples(Number(e.target.value))}
              disabled={animatingStep}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-yellow"
              aria-label="Number of bootstrap resamples from 100 to 5000"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="statistic-select">
              Statistic of Interest
            </label>
            <select
              id="statistic-select"
              value={statisticType}
              onChange={e => setStatisticType(e.target.value as "mean" | "median")}
              disabled={animatingStep}
              className="w-full border border-outline bg-surface p-2 text-xs sm:text-sm rounded accent-cyan"
              aria-label="Select statistic of interest: mean or median"
            >
              <option value="mean">Sample Mean</option>
              <option value="median">Sample Median</option>
            </select>
          </div>

          <div className="mb-4">
            <button
              onClick={() => setSeed(prev => prev + 1)}
              disabled={animatingStep}
              className="w-full flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer disabled:opacity-50 text-[12px]"
              aria-label="Generate new sample data using random seed"
            >
              REGENERATE DATA (NEW SEED)
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={runBootstrapStep}
              disabled={animatingStep}
              className="w-full flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer disabled:opacity-50 text-[12px]"
              aria-label="Perform one step of bootstrap resampling with animation"
            >
              {animatingStep ? "SAMPLING..." : "SAMPLE 1 STEP (ANIMATE)"}
            </button>

            <button
              onClick={runFullBootstrap}
              disabled={animatingStep}
              className="w-full flex h-9 items-center justify-center border border-outline bg-cyan text-white hover:bg-cyan/90 active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer disabled:opacity-50 text-[12px]"
              aria-label="Run full bootstrap simulation instantly"
            >
              RUN FULL BOOTSTRAP INSTANTLY
            </button>
          </div>
        </div>

        {/* Confidence Interval outputs */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Estimation Outputs</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Sample {statisticType}:</div>
            <div className="font-bold text-right text-cyan">{originalStatValue.toFixed(3)}</div>
            <div>Bootstrap SE:</div>
            <div className="font-bold text-right text-yellow">{bootstrapSE > 0 ? bootstrapSE.toFixed(3) : "—"}</div>
            <div>95% CI Lower:</div>
            <div className="font-bold text-right text-pink">{confidenceInterval ? confidenceInterval.lower.toFixed(3) : "—"}</div>
            <div>95% CI Upper:</div>
            <div className="font-bold text-right text-pink">{confidenceInterval ? confidenceInterval.upper.toFixed(3) : "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
