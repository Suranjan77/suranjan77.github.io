"use client";

import React, { useState, useEffect, useRef } from "react";
import { animate, motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  NarrativeControls,
  StepIndicator,
  AnimatedPointMark,
} from "../visualizationPrimitives";
import { useNarrativeStepper } from "./useAnimationEngine";

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 320 };

// Coordinate mapping
const scaleX = (theta: number) => plot.left + theta * (plot.right - plot.left);
const scaleY = (val: number) => plot.bottom - val * (plot.bottom - plot.top);

// Beta PDF math functions
const betaPdf = (theta: number, a: number, b: number) => {
  if (theta <= 0) return 0;
  if (theta >= 1) return 0;
  // Compute log beta function for normalization, or just normalize numerically
  return Math.pow(theta, a - 1) * Math.pow(1 - theta, b - 1);
};

const getMode = (a: number, b: number) => {
  if (a > 1 && b > 1) return (a - 1) / (a + b - 2);
  return 0.5;
};

// Numerical Normalization Helper for Beta PDF
const getNormalizedCurve = (a: number, b: number) => {
  const points: { theta: number; val: number }[] = [];
  let maxVal = -1;
  
  for (let i = 0; i <= 100; i++) {
    const theta = i / 100;
    const val = betaPdf(theta, a, b);
    if (val > maxVal) maxVal = val;
    points.push({ theta, val });
  }

  // Map to normalized y height (max = 1.0)
  const normMax = maxVal > 0 ? maxVal : 1;
  return points.map((p) => ({
    x: scaleX(p.theta),
    y: scaleY(p.val / normMax),
  }));
};

// Likelihood Curve: L(theta) = theta^k * (1-theta)^(n-k)
const getNormalizedLikelihoodCurve = (k: number, n: number) => {
  const points: { theta: number; val: number }[] = [];
  let maxVal = -1;

  for (let i = 0; i <= 100; i++) {
    const theta = i / 100;
    const val = Math.pow(theta, k) * Math.pow(1 - theta, n - k);
    if (val > maxVal) maxVal = val;
    points.push({ theta, val });
  }

  const normMax = maxVal > 0 ? maxVal : 1;
  return points.map((p) => ({
    x: scaleX(p.theta),
    y: scaleY(p.val / normMax),
  }));
};

export default function BayesianInferenceViz() {
  // Prior Hyperparameters
  const [alpha, setAlpha] = useState(3.0);
  const [beta, setBeta] = useState(3.0);

  // Current Batch Data
  const [k, setK] = useState(6);
  const [n, setN] = useState(12);

  // Iteration count
  const [iteration, setIteration] = useState(1);

  // Stepper hook (5 steps)
  const steps = ["1. Prior", "2. Data", "3. Likelihood", "4. Multiply", "5. Update"];
  const {
    currentStep,
    setCurrentStep,
    isPlaying,
    stepForward,
    stepBackward,
    reset,
    play,
    pause,
  } = useNarrativeStepper(5, 2000);

  // Generate data marker dots
  const [dataMarkers, setDataMarkers] = useState<{ id: number; success: boolean; delay: number }[]>([]);

  useEffect(() => {
    // Regenerate data markers when k or n change
    const markers: { id: number; success: boolean; delay: number }[] = [];
    for (let i = 0; i < n; i++) {
      markers.push({
        id: i,
        success: i < k,
        delay: i * 0.05, // Staggered drop
      });
    }
    // Shuffle markers for a realistic random appearance
    markers.sort(() => Math.random() - 0.5);
    setDataMarkers(markers);
  }, [k, n]);

  // Compute beta distributions
  const postAlpha = alpha + k;
  const postBeta = beta + n - k;

  const priorPoints = getNormalizedCurve(alpha, beta);
  const likelihoodPoints = getNormalizedLikelihoodCurve(k, n);
  const posteriorPoints = getNormalizedCurve(postAlpha, postBeta);

  const makePath = (pts: { x: number; y: number }[]) => {
    return "M " + pts.map((p) => `${p.x} ${p.y}`).join(" L ");
  };

  const priorPath = makePath(priorPoints);
  const likelihoodPath = makePath(likelihoodPoints);
  const posteriorPath = makePath(posteriorPoints);

  // MAP (Mode) of Posterior
  const mapEstimate = getMode(postAlpha, postBeta);

  // Narrative step descriptions
  const stepTexts = [
    "Prior: This curve represents our belief about the probability parameter θ before seeing the current batch of data. With α=3, β=3, we believe θ is likely near 0.5, but we are open-minded.",
    `New Data: We run ${n} trials and observe ${k} successes (green dots) and ${n - k} failures (red dots). These observations will be used to update our beliefs.`,
    `Likelihood: This curve shows how likely our observed data (${k}/${n} successes) is for each candidate value of θ. It peaks exactly at the empirical rate of ${(k / n).toFixed(2)}.`,
    "Multiply: We multiply the Prior probability by the Likelihood of the data at every point. This represents the mathematical blend of past beliefs and new evidence.",
    `Posterior: The updated belief (Posterior) Beta(α=${postAlpha}, β=${postBeta}) emerges. Notice it is narrower and taller, indicating we are now more certain. The peak (MAP) is at θ = ${mapEstimate.toFixed(2)}.`,
  ];

  // Perform a full Bayesian update iteration (Posterior becomes the new Prior)
  const handleNextIteration = () => {
    setAlpha(postAlpha);
    setBeta(postBeta);
    setIteration((prev) => prev + 1);

    // Set new trial size, keep success rate around 70% or let the user adjust
    setN(10);
    setK(7);

    // Reset stepper to show the prior step first
    setCurrentStep(0);
  };

  const handleResetEntirely = () => {
    setAlpha(3.0);
    setBeta(3.0);
    setK(6);
    setN(12);
    setIteration(1);
    reset();
  };

  // SVG dimensions & grid
  const ticks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Bayesian updating stepper"
          >
            <title>Bayesian Inference Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Grid Axes */}
            <g>
              {ticks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={scaleX(tick)}
                    x2={scaleX(tick)}
                    y1={plot.top}
                    y2={plot.bottom}
                    stroke={COLORS.grid}
                    strokeWidth={1}
                  />
                  <text
                    x={scaleX(tick)}
                    y={plot.bottom + 16}
                    textAnchor="middle"
                    fill={COLORS.muted}
                    fontSize={11}
                    fontWeight={700}
                  >
                    {tick.toFixed(2)}
                  </text>
                </g>
              ))}
              <line
                x1={plot.left}
                x2={plot.right}
                y1={plot.bottom}
                y2={plot.bottom}
                stroke={COLORS.border}
                strokeWidth={2}
              />
              <text
                x={plot.right + 12}
                y={plot.bottom + 4}
                fill={COLORS.muted}
                fontSize={11}
                fontWeight={700}
              >
                θ
              </text>
              <text
                x={plot.left - 10}
                y={plot.top - 12}
                fill={COLORS.muted}
                fontSize={11}
                fontWeight={700}
              >
                Belief Density
              </text>
            </g>

            {/* Step 1: Prior Curve (Cyan) */}
            {currentStep >= 0 && (
              <motion.path
                d={priorPath}
                fill="none"
                stroke={COLORS.cyan}
                strokeWidth={currentStep === 0 ? 3.5 : 2}
                opacity={currentStep === 0 ? 1 : currentStep === 1 || currentStep === 2 ? 0.6 : 0.2}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: currentStep === 0 ? 1 : currentStep === 1 || currentStep === 2 ? 0.6 : 0.2,
                }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Step 2: Observations dropping */}
            {currentStep >= 1 && (
              <g>
                {dataMarkers.map((marker) => {
                  const xPos = plot.left + 20 + (marker.id * (plot.right - plot.left - 40)) / n;
                  return (
                    <motion.circle
                      key={marker.id}
                      cx={xPos}
                      cy={plot.bottom}
                      r={6}
                      fill={marker.success ? COLORS.cyan : COLORS.pink}
                      stroke={COLORS.bg}
                      strokeWidth={1.5}
                      initial={{ cy: -10, opacity: 0 }}
                      animate={{ cy: plot.bottom, opacity: currentStep === 1 ? 1.0 : 0.25 }}
                      transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 10,
                        delay: marker.delay,
                      }}
                    />
                  );
                })}
              </g>
            )}

            {/* Step 3: Likelihood Curve (Yellow) */}
            {currentStep >= 2 && (
              <motion.path
                d={likelihoodPath}
                fill="none"
                stroke={COLORS.yellow}
                strokeWidth={currentStep === 2 ? 3.5 : 2}
                opacity={currentStep === 2 ? 1.0 : 0.3}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: currentStep === 2 ? 1.0 : 0.3 }}
                transition={{ duration: 0.8 }}
              />
            )}

            {/* Step 4 & 5: Posterior Curve (Pink) */}
            {currentStep >= 3 && (
              <motion.path
                d={posteriorPath}
                fill="none"
                stroke={COLORS.pink}
                strokeWidth={currentStep === 4 ? 4.5 : 3}
                filter={currentStep === 4 ? "url(#glow)" : undefined}
                opacity={1.0}
                initial={{ pathLength: 0, scaleY: 0 }}
                animate={{ pathLength: 1, scaleY: 1 }}
                style={{ transformOrigin: "bottom" }}
                transition={{ duration: 0.8 }}
              />
            )}

            {/* Step 5: MAP Estimate line */}
            {currentStep === 4 && (
              <g>
                <line
                  x1={scaleX(mapEstimate)}
                  y1={plot.bottom}
                  x2={scaleX(mapEstimate)}
                  y2={scaleY(1.0)}
                  stroke={COLORS.pink}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <circle cx={scaleX(mapEstimate)} cy={scaleY(1.0)} r={5} fill={COLORS.pink} />
                <text
                  x={scaleX(mapEstimate)}
                  y={scaleY(1.0) - 12}
                  textAnchor="middle"
                  fill={COLORS.pink}
                  fontSize={11}
                  fontWeight={800}
                  stroke={COLORS.bg}
                  strokeWidth={2.5}
                  paintOrder="stroke"
                >
                  MAP: {mapEstimate.toFixed(2)}
                </text>
              </g>
            )}

            {/* SVG In-Plot Stats */}
            <g>
              {/* Prior Parameters */}
              <g transform="translate(440, 44)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={700}>PRIOR (Beta)</text>
                <text x={12} y={36} fill={COLORS.cyan} fontSize={14} fontWeight={800}>
                  α={alpha.toFixed(1)}, β={beta.toFixed(1)}
                </text>
              </g>

              {/* Observed Success rate */}
              <g transform="translate(440, 102)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={700}>BATCH DATA (k/n)</text>
                <text x={12} y={36} fill={COLORS.yellow} fontSize={14} fontWeight={800}>
                  {k} / {n} successes ({((k / n) * 100).toFixed(0)}%)
                </text>
              </g>

              {/* Posterior Parameters */}
              <g transform="translate(440, 160)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={700}>POSTERIOR (Beta)</text>
                <text x={12} y={36} fill={COLORS.pink} fontSize={14} fontWeight={800}>
                  α={postAlpha.toFixed(1)}, β={postBeta.toFixed(1)}
                </text>
              </g>

              {/* Iteration count and controls */}
              <g transform="translate(440, 218)">
                <rect width={166} height={102} fill="rgba(250,248,242,0.6)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={800}>BAYESIAN ITERATION</text>
                <text x={12} y={38} fill={COLORS.pink} fontSize={20} fontWeight={800}>
                  #{iteration}
                </text>
                <foreignObject x={8} y={44} width={150} height={50}>
                  <div className="font-sans text-[12px] font-medium leading-snug" style={{ color: COLORS.muted }}>
                    Each iteration feeds the previous posterior as the new prior.
                  </div>
                </foreignObject>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Narrative Steps</span>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />
          
          <div className="my-3 min-h-[50px] text-[12px] text-on-surface-variant leading-relaxed bg-surface-container-low p-2.5 border border-outline font-sans">
            {stepTexts[currentStep]}
          </div>

          <NarrativeControls
            isPlaying={isPlaying}
            onPlayToggle={isPlaying ? pause : play}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onReset={reset}
            currentStep={currentStep}
            totalSteps={5}
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-2 block text-[12px] font-bold uppercase tracking-wide text-on-surface-variant">
            Adjust Current Batch (k/n):
          </div>
          <div className="flex items-center justify-between gap-2 bg-surface-container p-2 border border-outline mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface">Successes k:</span>
              <button aria-label="-"
                onClick={() => setK((prev) => Math.max(0, prev - 1))}
                disabled={k === 0 || isPlaying}
                className="h-6 w-6 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="font-bold text-primary w-4 text-center">{k}</span>
              <button aria-label="+"
                onClick={() => setK((prev) => Math.min(n, prev + 1))}
                disabled={k === n || isPlaying}
                className="h-6 w-6 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface">Trials n:</span>
              <button aria-label="-"
                onClick={() => {
                  setN((prev) => {
                    const next = Math.max(1, prev - 1);
                    if (k > next) setK(next);
                    return next;
                  });
                }}
                disabled={n <= 1 || isPlaying}
                className="h-6 w-6 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="font-bold text-primary w-4 text-center">{n}</span>
              <button aria-label="+"
                onClick={() => setN((prev) => Math.min(25, prev + 1))}
                disabled={n >= 25 || isPlaying}
                className="h-6 w-6 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button aria-label="Feed to Prior →"
              onClick={handleNextIteration}
              disabled={currentStep !== 4 || isPlaying}
              className="flex h-9 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface hover:text-primary active:scale-[0.98] transition-all font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center uppercase"
            >
              Feed to Prior →
            </button>
            <button aria-label="Reset All"
              onClick={handleResetEntirely}
              className="flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container text-on-surface-variant active:scale-[0.98] transition-all cursor-pointer text-center uppercase"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
