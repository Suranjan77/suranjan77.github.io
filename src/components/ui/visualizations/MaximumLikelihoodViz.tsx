"use client";

import React, { useState, useRef } from "react";
import { animate, motion, type AnimationPlaybackControls } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
  VizShell,
} from "../visualizationPrimitives";

const W = 720;
const H = 440;

// Subplot boundaries
const plotX = { left: 70, right: 650, width: 580 };
const topPlotY = { top: 40, bottom: 224, height: 184 };
const botPlotY = { top: 268, bottom: 388, height: 120 };

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

  const getLogL = (muVal: number) =>
    dataPoints.reduce((sum, xVal) => {
      const density = gaussianPdf(xVal, muVal);
      return sum + Math.log(Math.max(0.0001, density));
    }, 0);

  // Lower plot (log-likelihood hill) coordinates
  const lowerPlotPoints: { mu: number; logL: number }[] = [];
  let minL = 999;
  let maxL = -999;
  for (let mVal = 0.5; mVal <= 9.5; mVal += 0.25) {
    const lVal = getLogL(mVal);
    if (lVal < minL) minL = lVal;
    if (lVal > maxL) maxL = lVal;
    lowerPlotPoints.push({ mu: mVal, logL: lVal });
  }

  // Upper Gaussian curve path
  const gaussianPoints: string[] = [];
  for (let xVal = 0.5; xVal <= 9.5; xVal += 0.15) {
    gaussianPoints.push(`${scaleX(xVal)} ${scaleTopY(gaussianPdf(xVal, mu))}`);
  }
  const gaussianPath = "M " + gaussianPoints.join(" L ");

  const lowerCurvePath =
    "M " +
    lowerPlotPoints
      .map((p) => `${scaleX(p.mu)} ${scaleBotY(p.logL, minL, maxL)}`)
      .join(" L ");

  const stopAnimation = () => {
    if (animationRef.current) animationRef.current.stop();
    setIsAnimating(false);
  };

  // Snap the bell to the maximum-likelihood mean by climbing the hill.
  const snapToMle = () => {
    stopAnimation();
    setIsAnimating(true);
    animationRef.current = animate(mu, mleMean, {
      duration: 1.4,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (latest) => setMu(latest),
      onComplete: () => {
        setIsAnimating(false);
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
      },
    });
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
      // Leave mu where it is so the bell visibly falls off the new peak.
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setDragIndex(null);
  };

  const offset = Math.abs(mu - mleMean);
  const atPeak = offset < 0.08;

  const caption = atPeak
    ? "The bell is centred on the data's mean — every stem is as tall as it can be at once. That peak is the maximum-likelihood estimate."
    : offset < 1.2
      ? "Closer: as the bell slides over the data the stems climb and the total likelihood rises up its hill."
      : "The bell sits off to the side, so most observations land in its low tails — the stems are short and the total likelihood is small.";

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Maximum Likelihood Optimization"
    >
      <title>Maximum Likelihood Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* UPPER PLOT: Gaussian over the observations */}
      <g>
        <line x1={plotX.left} x2={plotX.right} y1={topPlotY.bottom} y2={topPlotY.bottom} stroke={COLORS.border} strokeWidth={1.5} />
        <line x1={plotX.left} x2={plotX.left} y1={topPlotY.top} y2={topPlotY.bottom} stroke={COLORS.border} strokeWidth={1.5} />
        <text x={plotX.left - 8} y={topPlotY.top} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={800}>density</text>
        <text x={plotX.right + 12} y={topPlotY.bottom + 4} fill={COLORS.muted} fontSize={11} fontWeight={700}>x</text>

        {/* Likelihood stems from observations up to the curve */}
        {dataPoints.map((xVal, idx) => {
          const yVal = gaussianPdf(xVal, mu);
          return (
            <g key={`stem-${idx}`}>
              <line x1={scaleX(xVal)} y1={topPlotY.bottom} x2={scaleX(xVal)} y2={scaleTopY(yVal)} stroke={COLORS.yellow} strokeWidth={2.5} />
              <circle cx={scaleX(xVal)} cy={scaleTopY(yVal)} r={3.5} fill={COLORS.yellow} />
            </g>
          );
        })}

        {/* Gaussian curve */}
        <motion.path d={gaussianPath} fill="none" stroke={COLORS.pink} strokeWidth={3} filter={atPeak ? "url(#glow)" : undefined} />

        {/* Mean marker inside the bell */}
        <line x1={scaleX(mu)} y1={topPlotY.bottom} x2={scaleX(mu)} y2={scaleTopY(gaussianPdf(mu, mu))} stroke={COLORS.pink} strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={scaleX(mu)} y={scaleTopY(gaussianPdf(mu, mu)) - 8} textAnchor="middle" fill={COLORS.pink} fontSize={12} fontWeight={800}>μ</text>

        {pulse && <PulseRing px={scaleX(mu)} py={scaleTopY(0.1)} color={COLORS.pink} maxRadius={44} />}

        {/* Draggable observations */}
        {dataPoints.map((xVal, idx) => (
          <g
            key={`obs-${idx}`}
            onPointerDown={(e) => handlePointerDown(e, idx)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="cursor-grab active:cursor-grabbing"
          >
            <circle cx={scaleX(xVal)} cy={topPlotY.bottom} r={14} fill="transparent" />
            <AnimatedPointMark px={scaleX(xVal)} py={topPlotY.bottom} color={COLORS.cyan} r={6} label={idx === 2 ? "data" : undefined} />
          </g>
        ))}
      </g>

      {/* LOWER PLOT: total log-likelihood as a hill */}
      <g>
        <line x1={plotX.left} x2={plotX.right} y1={botPlotY.bottom} y2={botPlotY.bottom} stroke={COLORS.border} strokeWidth={1.5} />
        <line x1={plotX.left} x2={plotX.left} y1={botPlotY.top} y2={botPlotY.bottom} stroke={COLORS.border} strokeWidth={1.5} />
        <text x={plotX.left - 8} y={botPlotY.top} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={800}>ln L(μ)</text>
        <text x={plotX.right + 12} y={botPlotY.bottom + 4} fill={COLORS.muted} fontSize={11} fontWeight={700}>μ</text>

        <path d={lowerCurvePath} fill="none" stroke={COLORS.cyan} strokeWidth={2.5} />

        {/* Peak guide */}
        <line x1={scaleX(mleMean)} y1={botPlotY.top - 10} x2={scaleX(mleMean)} y2={botPlotY.bottom} stroke={COLORS.cyan} strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />
        <text x={scaleX(mleMean) + 5} y={botPlotY.top + 4} fill={COLORS.cyan} fontSize={10} fontWeight={800}>peak (x̄)</text>

        {/* Current mu climbing the hill */}
        <circle cx={scaleX(mu)} cy={scaleBotY(getLogL(mu), minL, maxL)} r={6} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1.5} />
      </g>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3">
        <label
          htmlFor="mle-mu"
          className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary"
        >
          Slide the bell (model mean μ)
        </label>
        <input
          id="mle-mu"
          aria-label="Model mean mu"
          type="range"
          min={0.5}
          max={9.5}
          step={0.05}
          value={mu}
          onChange={(e) => {
            stopAnimation();
            setMu(Number(e.target.value));
          }}
          className="w-full cursor-pointer accent-primary"
        />
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
          <span>low likelihood</span>
          <span>low likelihood</span>
        </div>
      </div>

      <div className="flex items-center">
        <button
          aria-label={isAnimating ? "Climbing to MLE" : "Snap the bell to the MLE"}
          onClick={snapToMle}
          disabled={isAnimating}
          className="flex h-full items-center justify-center border border-outline bg-surface-container px-4 font-mono text-[12px] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-outline-variant hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnimating ? "Climbing…" : "Snap to the MLE"}
        </button>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      Observations are fixed facts. <strong>Likelihood</strong> asks how well a
      candidate distribution explains them — the height of each stem is how
      probable that point is under the current bell. Maximum-likelihood
      estimation slides the parameters until those heights peak together; for a
      Gaussian&apos;s mean, that peak lands exactly on the average of the data.
      Drag the observations and the peak moves with them.
    </p>
  );

  return (
    <VizShell
      canvas={canvas}
      controls={controls}
      caption={caption}
      mentalModel={mentalModel}
    />
  );
}
