"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";
import { createSeededRNG } from "@/lib/prng";

const W = 640;
const H = 420;

export default function GMMEMViz() {
  const [iteration, setIteration] = useState<number>(0);
  const [emStep, setEmStep] = useState<"E" | "M">("E");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 1D dataset of 20 points forming two distinct clusters (Mode 1 around 3.5, Mode 2 around 6.5)
  const dataPoints = useMemo(() => [
    1.8, 2.2, 2.8, 3.2, 3.4, 3.5, 3.6, 3.8, 4.2, 4.5,
    5.5, 5.8, 6.2, 6.4, 6.5, 6.6, 6.8, 7.2, 7.8, 8.2
  ], []);

  // EM calculations for each step
  const trajectory = useMemo(() => {
    const steps: Array<{
      means: number[];
      variances: number[];
      weights: number[];
      responsibilities: number[][]; // [n][k]
    }> = [];

    // Initial parameters (intentional offset to show fitting steps)
    let weights = [0.5, 0.5];
    let means = [2.5, 7.5];
    let variances = [0.8, 0.8];

    const gaussianPDF = (x: number, mean: number, variance: number) => {
      const stdDev = Math.sqrt(variance);
      return (1 / (Math.sqrt(2 * Math.PI) * stdDev)) * Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
    };

    const numPoints = dataPoints.length;
    const numComponents = 2;

    for (let iter = 0; iter < 10; iter++) {
      // E-step
      const responsibilities: number[][] = Array.from({ length: numPoints }, () => new Array(numComponents).fill(0));
      for (let i = 0; i < numPoints; i++) {
        let denom = 0;
        const densities: number[] = [];
        for (let k = 0; k < numComponents; k++) {
          const density = weights[k] * gaussianPDF(dataPoints[i], means[k], variances[k]);
          densities.push(density);
          denom += density;
        }
        for (let k = 0; k < numComponents; k++) {
          responsibilities[i][k] = denom > 0 ? densities[k] / denom : 0.5;
        }
      }

      steps.push({
        means: [...means],
        variances: [...variances],
        weights: [...weights],
        responsibilities: responsibilities.map(r => [...r])
      });

      // M-step (parameters for next iteration)
      const nextWeights = [...weights];
      const nextMeans = [...means];
      const nextVariances = [...variances];

      for (let k = 0; k < numComponents; k++) {
        let sumW = 0;
        let sumX = 0;
        for (let i = 0; i < numPoints; i++) {
          sumW += responsibilities[i][k];
          sumX += responsibilities[i][k] * dataPoints[i];
        }
        const nK = sumW || 1e-6;
        nextWeights[k] = nK / numPoints;
        nextMeans[k] = sumX / nK;

        let sumVar = 0;
        for (let i = 0; i < numPoints; i++) {
          sumVar += responsibilities[i][k] * Math.pow(dataPoints[i] - nextMeans[k], 2);
        }
        nextVariances[k] = Math.max(0.1, sumVar / nK); // regularized floor
      }

      weights = nextWeights;
      means = nextMeans;
      variances = nextVariances;
    }

    return steps;
  }, [dataPoints]);

  const activeState = useMemo(() => {
    const stepIdx = Math.min(trajectory.length - 1, iteration);
    return trajectory[stepIdx];
  }, [trajectory, iteration]);

  // Handle iteration increment loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setEmStep(prev => {
        if (prev === "E") {
          return "M";
        } else {
          setIteration(iter => (iter < 8 ? iter + 1 : 0));
          return "E";
        }
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const resetEM = () => {
    setIsPlaying(false);
    setIteration(0);
    setEmStep("E");
  };

  const pad = { left: 50, right: 30, top: 40, bottom: 40 };
  const scaleX = (val: number) => pad.left + ((val - 1) / 8) * (W - pad.left - pad.right);
  const scaleY = (val: number) => H - pad.bottom - val * 80;

  // Build Gaussian curves path
  const getGaussianPath = (mean: number, variance: number, weight: number) => {
    const stdDev = Math.sqrt(variance);
    let d = "";
    const numSteps = 100;
    for (let i = 0; i <= numSteps; i++) {
      const val = 1 + (i / numSteps) * 8;
      const density = weight * (1 / (Math.sqrt(2 * Math.PI) * stdDev)) * Math.exp(-Math.pow(val - mean, 2) / (2 * variance));
      const px = scaleX(val);
      const py = scaleY(density);

      if (i === 0) {
        d += `M ${px} ${py}`;
      } else {
        d += ` L ${px} ${py}`;
      }
    }
    return d;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label="GMM EM Fit Visualizer"
          >
            <title>GMM EM Fit Visualizer</title>
            <defs>
              <pattern id="gmm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#gmm-grid)" />

            {/* Gaussian curves */}
            <path
              d={getGaussianPath(activeState.means[0], activeState.variances[0], activeState.weights[0])}
              fill="none"
              stroke={COLORS.cyan}
              strokeWidth={3}
            />
            <path
              d={getGaussianPath(activeState.means[1], activeState.variances[1], activeState.weights[1])}
              fill="none"
              stroke={COLORS.pink}
              strokeWidth={3}
            />

            {/* Means indicator markers */}
            <line x1={scaleX(activeState.means[0])} y1={scaleY(0)} x2={scaleX(activeState.means[0])} y2={scaleY(0.4)} stroke={COLORS.cyan} strokeWidth={1} strokeDasharray="2 2" />
            <line x1={scaleX(activeState.means[1])} y1={scaleY(0)} x2={scaleX(activeState.means[1])} y2={scaleY(0.4)} stroke={COLORS.pink} strokeWidth={1} strokeDasharray="2 2" />
            <circle cx={scaleX(activeState.means[0])} cy={scaleY(0)} r={4} fill={COLORS.cyan} />
            <circle cx={scaleX(activeState.means[1])} cy={scaleY(0)} r={4} fill={COLORS.pink} />

            {/* 1D Data Axis */}
            <line x1={scaleX(1)} y1={H - pad.bottom} x2={scaleX(9)} y2={H - pad.bottom} stroke={COLORS.border} strokeWidth={2} />
            
            {/* Axis ticks */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => (
              <g key={`t3-${t}`} transform={`translate(${scaleX(t)}, ${H - pad.bottom})`}>
                <line y2={6} stroke={COLORS.border} strokeWidth={1.5} />
                <text y={18} textAnchor="middle" fontSize={10} fill={COLORS.muted} fontWeight={600}>{t}</text>
              </g>
            ))}

            {/* Data points colored by responsibility (soft assignment) */}
            {dataPoints.map((val, idx) => {
              const respA = activeState.responsibilities[idx]?.[0] ?? 0.5;
              const respB = activeState.responsibilities[idx]?.[1] ?? 0.5;

              // Compute color interpolation: mix cyan and pink
              // Simple hex blending representing soft assignment
              const r = Math.round(0x55 + respB * (0x8d - 0x55));
              const g = Math.round(0x6b + respB * (0x51 - 0x6b));
              const b = Math.round(0x4a + respB * (0x49 - 0x4a));
              const color = `rgb(${r}, ${g}, ${b})`;

              return (
                <g key={`pt-${idx}`}>
                  {emStep === "E" && (
                    // Draw mini probability bars above points in E step
                    <rect
                      x={scaleX(val) - 2}
                      y={H - pad.bottom - 25}
                      width={4}
                      height={20}
                      fill={COLORS.pink}
                      rx={1}
                    />
                  )}
                  {emStep === "E" && (
                    <rect
                      x={scaleX(val) - 2}
                      y={H - pad.bottom - 25}
                      width={4}
                      height={20 * respA}
                      fill={COLORS.cyan}
                      rx={1}
                    />
                  )}
                  <circle
                    cx={scaleX(val)}
                    cy={H - pad.bottom}
                    r={5}
                    fill={color}
                    stroke={COLORS.border}
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {/* Iteration header text */}
            <text x={pad.left} y={30} fill={COLORS.muted} fontSize={12} fontWeight={700}>
              ITERATION: {iteration + 1} | STEP: {emStep === "E" ? "EXPECTATION (E-STEP)" : "MAXIMIZATION (M-STEP)"}
            </text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>EM Steps</span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (emStep === "E") {
                  setEmStep("M");
                } else {
                  setIteration(prev => Math.min(9, prev + 1));
                  setEmStep("E");
                }
              }}
              disabled={isPlaying}
              className="w-full flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer disabled:opacity-50 text-[12px]"
              aria-label="Perform one step of the EM algorithm iteration"
            >
              RUN NEXT {emStep === "E" ? "M-STEP" : "E-STEP"}
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-full flex h-9 items-center justify-center border border-outline font-bold tracking-wider cursor-pointer active:scale-[0.98] transition-all text-[12px] ${
                isPlaying
                  ? "bg-warning/20 border-warning hover:bg-warning/30 text-warning"
                  : "bg-cyan text-white hover:bg-cyan/90"
              }`}
              aria-label={isPlaying ? "Pause EM optimization loop" : "Animate EM optimization loop"}
            >
              {isPlaying ? "PAUSE OPTIMIZATION" : "RUN EM OPTIMIZATION"}
            </button>

            <button
              onClick={resetEM}
              className="w-full flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer text-[12px]"
              aria-label="Reset GMM parameters to initial state"
            >
              RESET SOLVER
            </button>
          </div>
        </div>

        {/* Model parameters output */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">GMM Parameters</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="font-bold" style={{ color: COLORS.cyan }}>Component A (Cyan)</div>
            <div className="font-bold" style={{ color: COLORS.pink }}>Component B (Pink)</div>
            
            <div>Mean: {activeState.means[0].toFixed(2)}</div>
            <div>Mean: {activeState.means[1].toFixed(2)}</div>
            
            <div>Var: {activeState.variances[0].toFixed(2)}</div>
            <div>Var: {activeState.variances[1].toFixed(2)}</div>
            
            <div>Weight: {(activeState.weights[0] * 100).toFixed(0)}%</div>
            <div>Weight: {(activeState.weights[1] * 100).toFixed(0)}%</div>
          </div>
          <p className="mt-3 text-[12px] leading-snug text-on-surface-variant font-sans">
            *E-step estimates soft responsibilities (assignment probabilities). M-step updates weights, means, and variances based on those weights.
          </p>
        </div>
      </div>
    </div>
  );
}
