"use client";

import React, { useState, useRef } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
  VizShell,
} from "../visualizationPrimitives";

const W = 720;
const H = 440;
const plot = { left: 70, top: 48, right: 650, bottom: 372 };

const scaleX = (val: number) =>
  +(plot.left + (val / 10) * (plot.right - plot.left)).toFixed(3);
const scaleY = (val: number) =>
  +(plot.bottom - (val / 10) * (plot.bottom - plot.top)).toFixed(3);
const invertX = (px: number) => ((px - plot.left) / (plot.right - plot.left)) * 10;

// A smooth hump: slope is clearly positive on the left, flat at the peak,
// negative on the right — so the tangent direction is visually obvious.
const f = (x: number) => 1 + 7 * Math.exp(-(((x - 5) / 2.6) ** 2));
const df = (x: number) =>
  7 * Math.exp(-(((x - 5) / 2.6) ** 2)) * (-(x - 5) / 3.38);

const curvePoints: string[] = [];
for (let i = 0; i <= 10.01; i += 0.1) {
  curvePoints.push(`${scaleX(i)} ${scaleY(f(i))}`);
}
const curvePath = "M " + curvePoints.join(" L ");

const H_WIDE = 4.0;

export default function CalculusViz() {
  const [focusX, setFocusX] = useState(3.2);
  const [h, setH] = useState(H_WIDE);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  const sec = focusX + h;
  const fy = f(focusX);
  const exactSlope = df(focusX);
  const isTangent = h < 0.12;

  const startLimitAnimation = () => {
    if (animationRef.current) animationRef.current.stop();
    setIsAnimating(true);
    animationRef.current = animate(h, 0.002, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setH(latest),
      onComplete: () => {
        setIsAnimating(false);
        setPulse(true);
        setTimeout(() => setPulse(false), 850);
      },
    });
  };

  const stopAnimation = () => {
    if (animationRef.current) animationRef.current.stop();
    setIsAnimating(false);
  };

  const resetWide = () => {
    stopAnimation();
    setH(H_WIDE);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    stopAnimation();
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!isDragging) return;
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
      setFocusX(Math.max(0.6, Math.min(9.4, rawX)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // Keep the second point and triangle inside the plotting window.
  const dir = sec <= 9.4 ? 1 : -1;
  const qx = focusX + dir * h;
  const qy = f(qx);
  const triSlope = (qy - fy) / (qx - focusX);
  const lineYatDir = (x: number) => fy + triSlope * (x - focusX);

  const ticks = [0, 2.5, 5, 7.5, 10];

  // Interpret the slope as the steepness of the hill under your feet.
  const displayedSlope = isTangent ? exactSlope : triSlope;
  const direction =
    displayedSlope > 0.15
      ? { word: "climbing uphill", arrow: "↑" }
      : displayedSlope < -0.15
        ? { word: "heading downhill", arrow: "↓" }
        : { word: "flat — at the summit", arrow: "→" };

  const meaningClause = isTangent
    ? exactSlope > 0.15
      ? "a positive slope means the hill is climbing here"
      : exactSlope < -0.15
        ? "a negative slope means the hill is descending here"
        : "a slope of zero means you are on the flat summit"
    : "";

  const caption = isTangent
    ? `The two points have merged, so the chord has become the tangent — the line that just grazes the hill at one spot. Its slope ${exactSlope.toFixed(2)} is the steepness of the ground right here: ${meaningClause}. Drag the point along the hill and watch this number fall as you climb toward the summit, hit 0 at the flat top, then go negative on the way down.`
    : h > 2
      ? `The yellow line is a chord joining two far-apart points on the hill. Its slope, rise ÷ run = ${triSlope.toFixed(2)}, is the average rate of change over that whole stretch — it averages the steep and the shallow parts together, so it is not the steepness at any single point. Slide the points together to fix that.`
      : `As the two points slide together the chord pivots toward the slope right at the point — its value ${triSlope.toFixed(2)} (${direction.word}) is closing in on the true steepness. Keep going until they merge into the tangent.`;

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Derivative Limit Visualizer"
    >
      <title>Derivative Limit Visualizer</title>
      <SVGFilters />
      <defs>
        <clipPath id="calc-plot">
          <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} />
        </clipPath>
      </defs>
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* Axes */}
      <g>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={scaleX(tick)} x2={scaleX(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
            <line x1={plot.left} x2={plot.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke={COLORS.grid} strokeWidth={1} />
          </g>
        ))}
        <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
        <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
        <text x={plot.right + 4} y={plot.bottom + 22} fill={COLORS.muted} fontSize={12} fontWeight={700} textAnchor="end">distance x →</text>
        <text x={plot.left - 22} y={plot.top - 8} fill={COLORS.muted} fontSize={12} fontWeight={700}>height f(x)</text>
      </g>

      <g clipPath="url(#calc-plot)">
        {/* Curve — read it as the profile of a hill */}
        <path d={curvePath} fill="none" stroke={COLORS.cyan} strokeWidth={3.5} />

        {/* Rise / run triangle between the two points */}
        {!isTangent && (
          <g opacity={Math.min(1, h * 1.5)}>
            <polygon
              points={`${scaleX(focusX)},${scaleY(fy)} ${scaleX(qx)},${scaleY(fy)} ${scaleX(qx)},${scaleY(qy)}`}
              fill={COLORS.yellow}
              fillOpacity={0.12}
            />
            {/* run (Δx) */}
            <line x1={scaleX(focusX)} y1={scaleY(fy)} x2={scaleX(qx)} y2={scaleY(fy)} stroke={COLORS.muted} strokeWidth={1.5} />
            <text x={scaleX((focusX + qx) / 2)} y={scaleY(fy) + (qy > fy ? 18 : -8)} textAnchor="middle" fill={COLORS.muted} fontSize={13} fontWeight={700}>
              run
            </text>
            {/* rise (Δy) */}
            <line x1={scaleX(qx)} y1={scaleY(fy)} x2={scaleX(qx)} y2={scaleY(qy)} stroke={COLORS.muted} strokeWidth={1.5} />
            <text x={scaleX(qx) + (dir > 0 ? 8 : -8)} y={scaleY((fy + qy) / 2)} textAnchor={dir > 0 ? "start" : "end"} fill={COLORS.muted} fontSize={13} fontWeight={700}>
              rise
            </text>
          </g>
        )}

        {/* The pivoting chord -> tangent line, full width */}
        <line
          x1={scaleX(0)}
          y1={scaleY(lineYatDir(0))}
          x2={scaleX(10)}
          y2={scaleY(lineYatDir(10))}
          stroke={isTangent ? COLORS.pink : COLORS.yellow}
          strokeWidth={isTangent ? 3.5 : 2.5}
          strokeDasharray={isTangent ? undefined : "6 5"}
          filter={isTangent ? "url(#glow)" : undefined}
        />

        {pulse && <PulseRing px={scaleX(focusX)} py={scaleY(fy)} color={COLORS.pink} maxRadius={42} />}

        {/* Second point Q (slides toward P) */}
        {!isTangent && (
          <circle cx={scaleX(qx)} cy={scaleY(qy)} r={6} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2} />
        )}

        {/* Focus point P (draggable) */}
        <g
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="cursor-grab active:cursor-grabbing"
        >
          <circle cx={scaleX(focusX)} cy={scaleY(fy)} r={18} fill="transparent" />
          <AnimatedPointMark px={scaleX(focusX)} py={scaleY(fy)} color={COLORS.pink} r={7.5} label="drag me" />
        </g>
      </g>

    </svg>
  );

  const controls = (
    <>
      <div className="flex min-w-[200px] flex-col justify-center gap-1 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          {isTangent ? "Steepness here" : "Average steepness"}
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-2xl font-bold"
            style={{ color: isTangent ? COLORS.pink : COLORS.yellow }}
          >
            {displayedSlope.toFixed(2)}
          </span>
          <span className="font-sans text-[12px] text-on-surface-variant">
            {direction.arrow} {direction.word}
          </span>
        </div>
        <span className="font-sans text-[11px] text-on-surface-variant">
          height gained per step across (rise ÷ run)
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3">
        <label htmlFor="calc-h" className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Slide the points together (the run)
        </label>
        <input
          id="calc-h"
          aria-label="Gap distance h"
          type="range"
          min={0.02}
          max={H_WIDE}
          step={0.02}
          value={h}
          onChange={(e) => {
            stopAnimation();
            setH(Number(e.target.value));
          }}
          className="w-full cursor-pointer accent-primary"
        />
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
          <span>together (tangent)</span>
          <span>far apart (average)</span>
        </div>
      </div>

      <div className="flex items-stretch gap-2">
        <button
          aria-label={isAnimating ? "LIMIT IN PROGRESS" : "TAKE THE LIMIT (h → 0)"}
          onClick={startLimitAnimation}
          disabled={isAnimating}
          className="flex items-center justify-center border border-outline bg-surface-container px-4 font-mono text-[12px] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-outline-variant hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnimating ? "Limit in progress…" : "Take the limit (h → 0)"}
        </button>
        <button
          aria-label="Reset gap"
          onClick={resetWide}
          disabled={h === H_WIDE && !isAnimating}
          className="flex items-center justify-center border border-outline bg-surface px-4 font-mono text-[12px] font-bold uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Read the curve as the profile of a <strong>hill</strong>: the height
        f(x) at each distance x. The <strong>derivative</strong> is just the
        steepness of the ground under your feet at one spot.
      </p>
      <p>
        To measure it, take two points and compute the chord&apos;s{" "}
        <strong>rise ÷ run</strong> — the average steepness between them. Slide
        the points together and the chord pivots until it grazes the hill at a
        single point: the <strong>tangent</strong>, whose slope is the
        instantaneous derivative f&apos;(x).
      </p>
      <p>
        Drag the point along the hill and watch the number: <strong>positive</strong>{" "}
        while climbing the left side, exactly <strong>zero</strong> at the flat
        summit, and <strong>negative</strong> going down the right side.
      </p>
    </div>
  );

  return (
    <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />
  );
}
