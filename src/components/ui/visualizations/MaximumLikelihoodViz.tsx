"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { animate, motion, type AnimationPlaybackControls } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
  VisualizationInstruction,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Subplot boundaries
const plotX = { left: 64, right: 406, width: 342 };
const topPlotY = { top: 24, bottom: 180, height: 156 };
const botPlotY = { top: 226, bottom: 332, height: 106 };

// Coordinate mappings
const scaleX = (val: number) => plotX.left + (val / 10) * plotX.width;
const invertX = (px: number) => ((px - plotX.left) / plotX.width) * 10;

const scaleTopY = (val: number) => topPlotY.bottom - (val / 0.35) * topPlotY.height;
const scaleBotY = (val: number, minL: number, maxL: number) => {
  const diff = maxL - minL;
  const clampedDiff = diff > 0.01 ? diff : 1;
  return botPlotY.bottom - ((val - minL) / clampedDiff) * botPlotY.height;
};

// Gaussian PDF helper
const gaussianPdf = (xVal: number, muVal: number, sigma = 1.2) => {
  const exponent = -0.5 * Math.pow((xVal - muVal) / sigma, 2);
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
};

export default function MaximumLikelihoodViz() {
  const [dataPoints, setDataPoints] = useState<number[]>([2.2, 3.8, 5.0, 6.2, 7.8]);
  const [mu, setMu] = useState<number>(3.0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  // Exact MLE mean
  const mleMean = dataPoints.reduce((sum, p) => sum + p, 0) / dataPoints.length;

  // Compute log-likelihood curve bounds
  const getLogL = (muVal: number) => {
    return dataPoints.reduce((sum, xVal) => {
      const density = gaussianPdf(xVal, muVal);
      return sum + Math.log(Math.max(0.0001, density));
    }, 0);
  };

  // Generate lower plot coordinates dynamically
  const lowerPlotPoints: { mu: number; logL: number }[] = [];
  let minL = 999;
  let maxL = -999;
  for (let mVal = 0.5; mVal <= 9.5; mVal += 0.25) {
    const lVal = getLogL(mVal);
    if (lVal < minL) minL = lVal;
    if (lVal > maxL) maxL = lVal;
    lowerPlotPoints.push({ mu: mVal, logL: lVal });
  }

  // Generate upper Gaussian curve path
  const gaussianPoints: string[] = [];
  for (let xVal = 0.5; xVal <= 9.5; xVal += 0.15) {
    const yVal = gaussianPdf(xVal, mu);
    gaussianPoints.push(`${scaleX(xVal)} ${scaleTopY(yVal)}`);
  }
  const gaussianPath = "M " + gaussianPoints.join(" L ");

  // Generate lower log-likelihood curve path
  const lowerCurvePath =
    "M " +
    lowerPlotPoints
      .map((p) => `${scaleX(p.mu)} ${scaleBotY(p.logL, minL, maxL)}`)
      .join(" L ");

  // Start Gradient Ascent climb
  const runGradientAscent = () => {
    stopAnimation();
    setIsAnimating(true);
    // Spawn at a random position away from the mean
    const currentMle = mleMean;
    const spawnPos = currentMle > 5.0 ? 1.5 : 8.5;
    setMu(spawnPos);

    animationRef.current = animate(spawnPos, currentMle, {
      duration: 2.0,
      ease: [0.25, 1, 0.5, 1], // Starts quick, slows down as it approaches peak
      onUpdate: (latest) => setMu(latest),
      onComplete: () => {
        setIsAnimating(false);
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
      },
    });
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    setIsAnimating(false);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGElement>, index: number) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setDragIndex(index);
    stopAnimation();
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (dragIndex === null) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return;

    const svgCoords = point.matrixTransform(screenCTM.inverse());
    if (svgCoords) {
      const rawX = invertX(svgCoords.x);
      const clampedX = Math.max(0.8, Math.min(9.2, rawX));
      
      const nextPoints = [...dataPoints];
      nextPoints[dragIndex] = clampedX;
      setDataPoints(nextPoints);

      // In real-time dragging, update mu directly with the new mean
      setMu(nextPoints.reduce((s, p) => s + p, 0) / 5);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setDragIndex(null);
  };

  const currentLogL = getLogL(mu);
  const peakLogL = getLogL(mleMean);

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Maximum Likelihood Optimization"
          >
            <title>Maximum Likelihood Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* UPPER PLOT: Gaussian Likelihood Density */}
            <g>
              {/* Axes */}
              <line x1={plotX.left} x2={plotX.right} y1={topPlotY.bottom} y2={topPlotY.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={plotX.left} x2={plotX.left} y1={topPlotY.top} y2={topPlotY.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={plotX.left - 8} y={topPlotY.top} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={800}>
                density
              </text>
              <text x={plotX.right + 12} y={topPlotY.bottom + 4} fill={COLORS.muted} fontSize={10} fontWeight={700}>
                x
              </text>

              {/* Likelihood stems from observations to Gaussian curve */}
              {dataPoints.map((xVal, idx) => {
                const yVal = gaussianPdf(xVal, mu);
                return (
                  <g key={`stem-${idx}`}>
                    {/* Stem line */}
                    <line
                      x1={scaleX(xVal)}
                      y1={topPlotY.bottom}
                      x2={scaleX(xVal)}
                      y2={scaleTopY(yVal)}
                      stroke={COLORS.yellow}
                      strokeWidth={2}
                      strokeDasharray="3 2"
                    />
                    {/* Intersection dot */}
                    <circle cx={scaleX(xVal)} cy={scaleTopY(yVal)} r={3.5} fill={COLORS.yellow} />
                  </g>
                );
              })}

              {/* Shaded Gaussian area */}
              <motion.path
                d={gaussianPath}
                fill="none"
                stroke={COLORS.pink}
                strokeWidth={3}
                filter={Math.abs(mu - mleMean) < 0.05 ? "url(#glow)" : undefined}
              />

              {/* Mean marker line inside Gaussian */}
              <line
                x1={scaleX(mu)}
                y1={topPlotY.bottom}
                x2={scaleX(mu)}
                y2={scaleTopY(gaussianPdf(mu, mu))}
                stroke={COLORS.pink}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />

              {/* Convergence pulse */}
              {pulse && <PulseRing px={scaleX(mu)} py={scaleTopY(0.1)} color={COLORS.pink} maxRadius={40} />}

              {/* Draggable Observations (data points on x-axis) */}
              {dataPoints.map((xVal, idx) => (
                <g
                  key={`obs-${idx}`}
                  onPointerDown={(e) => handlePointerDown(e, idx)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <circle cx={scaleX(xVal)} cy={topPlotY.bottom} r={14} fill="transparent" />
                  <AnimatedPointMark px={scaleX(xVal)} py={topPlotY.bottom} color={COLORS.cyan} r={6} label={idx === 2 ? "x_i" : undefined} />
                </g>
              ))}
            </g>

            {/* LOWER PLOT: Log-Likelihood Surface */}
            <g>
              {/* Axes */}
              <line x1={plotX.left} x2={plotX.right} y1={botPlotY.bottom} y2={botPlotY.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={plotX.left} x2={plotX.left} y1={botPlotY.top} y2={botPlotY.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={plotX.left - 8} y={botPlotY.top} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={800}>
                ln L(μ)
              </text>
              <text x={plotX.right + 12} y={botPlotY.bottom + 4} fill={COLORS.muted} fontSize={10} fontWeight={700}>
                μ
              </text>

              {/* Log Likelihood curve (cyan) */}
              <path d={lowerCurvePath} fill="none" stroke={COLORS.cyan} strokeWidth={2.5} />

              {/* Peak MLE line vertical guide */}
              <line
                x1={scaleX(mleMean)}
                y1={botPlotY.top - 10}
                x2={scaleX(mleMean)}
                y2={botPlotY.bottom}
                stroke={COLORS.cyan}
                strokeWidth={1}
                strokeDasharray="2 3"
                opacity={0.6}
              />
              <text x={scaleX(mleMean) + 4} y={botPlotY.top + 6} fill={COLORS.cyan} fontSize={8} fontWeight={800}>
                MLE Peak
              </text>

              {/* Current mu dot climbing the surface */}
              <circle
                cx={scaleX(mu)}
                cy={scaleBotY(currentLogL, minL, maxL)}
                r={5.5}
                fill={COLORS.yellow}
                stroke={COLORS.bg}
                strokeWidth={1.5}
              />
            </g>

            {/* SVG In-Plot Stats Panel */}
            <g>
              {/* Current Mean mu */}
              <g transform="translate(440, 24)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={700}>MODEL PARAMETER (μ)</text>
                <text x={12} y={36} fill={COLORS.pink} fontSize={15} fontWeight={800}>{mu.toFixed(3)}</text>
              </g>

              {/* Optimal Mean MLE */}
              <g transform="translate(440, 82)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={700}>OPTIMAL MEAN (x̄)</text>
                <text x={12} y={36} fill={COLORS.cyan} fontSize={15} fontWeight={800}>{mleMean.toFixed(3)}</text>
              </g>

              {/* Log Likelihood value */}
              <g transform="translate(440, 140)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={700}>LOG-LIKELIHOOD SCORE</text>
                <text x={12} y={36} fill={COLORS.yellow} fontSize={15} fontWeight={800}>{currentLogL.toFixed(3)}</text>
              </g>

              {/* Gradient ascent diagnostic panel */}
              <g transform="translate(440, 198)">
                <rect width={166} height={134} fill="rgba(250,248,242,0.6)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={800}>OPTIMIZATION STATUS</text>
                
                {/* Visual meter */}
                <rect x={20} y={30} width={20} height={80} fill={COLORS.grid} rx={2} />
                {(() => {
                  const error = Math.abs(mu - mleMean);
                  const maxError = 4.0;
                  const ratio = Math.max(0, 1 - error / maxError);
                  const barH = ratio * 80;
                  return (
                    <motion.rect
                      x={20}
                      y={30 + (80 - barH)}
                      width={20}
                      height={barH}
                      fill={ratio > 0.98 ? COLORS.cyan : COLORS.yellow}
                      rx={2}
                      animate={{ height: barH, y: 30 + (80 - barH) }}
                      transition={{ duration: 0.1 }}
                    />
                  );
                })()}

                <text x={50} y={44} fill={COLORS.muted} fontSize={12} fontWeight={600}>CONVERGENCE:</text>
                <text x={50} y={60} fill={Math.abs(mu - mleMean) < 0.05 ? COLORS.cyan : COLORS.muted} fontSize={14} fontWeight={800}>
                  {(Math.max(0, 1 - Math.abs(mu - mleMean) / 4) * 100).toFixed(0)}%
                </text>

                <foreignObject x={46} y={70} width={115} height={60}>
                  <div className="font-sans text-[12px] font-medium leading-snug" style={{ color: COLORS.muted }}>
                    Gradient pulls μ toward the peak of log-likelihood.
                  </div>
                </foreignObject>

                {Math.abs(mu - mleMean) < 0.05 && (
                  <text x={50} y={114} fill={COLORS.cyan} fontSize={12} fontWeight={800}>CONVERGED</text>
                )}
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Interactions</span>
          </div>

          <button aria-label="OPTIMIZING... FIND MLE VIA GRADIENT ASCENT"
            onClick={runGradientAscent}
            disabled={isAnimating}
            className="w-full flex h-9 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer mb-2 disabled:opacity-50"
          >
            {isAnimating ? "OPTIMIZING..." : "FIND MLE VIA GRADIENT ASCENT"}
          </button>

          <VisualizationInstruction
            title="Direct Manipulation:"
            content="Drag the cyan **observations x_i** left or right. The Gaussian and log-likelihood curves recalculate, and the MLE mean automatically chases the data."
            className="uppercase"
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Observations are facts. Likelihood measures how well different candidate distributions explain those facts. Maximum likelihood estimation is an optimization that slides the parameters until the combined height of the likelihood stems peaks.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
