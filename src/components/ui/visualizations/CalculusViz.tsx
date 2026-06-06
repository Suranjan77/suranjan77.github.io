"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { animate, motion, type AnimationPlaybackControls } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 338 };

// Coordinate helpers
const scaleX = (val: number) => +(plot.left + (val / 10) * (plot.right - plot.left)).toFixed(3);
const scaleY = (val: number) => +(plot.bottom - (val / 10) * (plot.bottom - plot.top)).toFixed(3);
const invertX = (px: number) => ((px - plot.left) / (plot.right - plot.left)) * 10;

// Function and derivative definitions
const f = (x: number) => 5 + 2.4 * Math.sin(x * 0.82 - 1.1);
const df = (x: number) => 2.4 * 0.82 * Math.cos(x * 0.82 - 1.1);

// Generate curve coordinates
const curvePoints: { x: number; y: number }[] = [];
for (let i = 0; i <= 10.05; i += 0.1) {
  curvePoints.push({ x: scaleX(i), y: scaleY(f(i)) });
}
const curvePath = "M " + curvePoints.map((p) => `${p.x} ${p.y}`).join(" L ");

export default function CalculusViz() {
  const [focusX, setFocusX] = useState(5.5);
  const [h, setH] = useState(4.0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  // Compute points
  const sec = focusX + h;
  const fy = f(focusX);
  const sy = f(sec);

  // Compute slopes
  const exactSlope = df(focusX);
  const secantSlope = (sy - fy) / h;

  const startLimitAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    setIsAnimating(true);
    // Animate h from current h to 0.001
    animationRef.current = animate(h, 0.001, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1], // Slow down dramatically at the end
      onUpdate: (latest) => setH(latest),
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
      // Constrain focus point so secant point h stays inside [0, 10]
      const clampedX = Math.max(0.5, Math.min(6.0, rawX));
      setFocusX(clampedX);
      setH(4.0); // Reset h to see the secant line
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
    // Auto-trigger limit animation
    setTimeout(() => {
      startLimitAnimation();
    }, 150);
  };

  // Magnification lens center
  const lensCx = scaleX(focusX);
  const lensCy = scaleY(fy);
  const lensRadius = 42;

  // Tangent line endpoints
  const tanX1 = scaleX(focusX - 2.2);
  const tanY1 = scaleY(fy - exactSlope * 2.2);
  const tanX2 = scaleX(focusX + 2.2);
  const tanY2 = scaleY(fy + exactSlope * 2.2);

  // Secant line endpoints
  const secX1 = scaleX(focusX - 2.2);
  const secY1 = scaleY(fy - secantSlope * 2.2);
  const secX2 = scaleX(sec + 1.2);
  const secY2 = scaleY(sy + secantSlope * (sec + 1.2 - sec));

  // Ticks for Grid
  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Derivative Limit Visualizer">
            <title>Derivative Limit Visualizer</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Grid Axes */}
            <g>
              {ticks.map((tick) => (
                <g key={tick}>
                  <line x1={scaleX(tick)} x2={scaleX(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
                  <line x1={plot.left} x2={plot.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke={COLORS.grid} strokeWidth={1} />
                </g>
              ))}
              <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
              <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
              <text x={plot.right + 16} y={plot.bottom + 4} fill={COLORS.muted} fontSize={13} fontWeight={700}>x</text>
              <text x={plot.left - 20} y={plot.top - 8} fill={COLORS.muted} fontSize={13} fontWeight={700}>f(x)</text>
            </g>

            {/* Main Plot elements */}
            <g>
              {/* Curve */}
              <path d={curvePath} fill="none" stroke={COLORS.cyan} strokeWidth={3} />

              {/* Tangent line (pink) */}
              <line x1={tanX1} y1={tanY1} x2={tanX2} y2={tanY2} stroke={COLORS.pink} strokeWidth={2.5} filter={h < 0.05 ? "url(#glow)" : undefined} />

              {/* Secant line (yellow) */}
              {h > 0.01 && (
                <line x1={secX1} y1={secY1} x2={secX2} y2={secY2} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="5 4" opacity={h < 0.1 ? h * 10 : 1} />
              )}

              {/* Helper secant height indicators */}
              {h > 0.3 && (
                <g opacity={Math.min(1, (h - 0.3) * 2)}>
                  {/* dx label line */}
                  <line x1={scaleX(focusX)} y1={scaleY(fy)} x2={scaleX(sec)} y2={scaleY(fy)} stroke={COLORS.muted} strokeWidth={1} strokeDasharray="3 3" />
                  <text x={scaleX(focusX + h / 2)} y={scaleY(fy) + 14} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={700}>h</text>

                  {/* dy label line */}
                  <line x1={scaleX(sec)} y1={scaleY(fy)} x2={scaleX(sec)} y2={scaleY(sy)} stroke={COLORS.muted} strokeWidth={1} strokeDasharray="3 3" />
                  <text x={scaleX(sec) + 8} y={scaleY(fy + (sy - fy) / 2)} textAnchor="start" fill={COLORS.muted} fontSize={10} fontWeight={700}>f(x+h)-f(x)</text>
                </g>
              )}

              {/* Secant point (yellow) */}
              {h > 0.005 && (
                <circle cx={scaleX(sec)} cy={scaleY(sy)} r={5} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1.5} />
              )}

              {/* Pulse effect on limit convergence */}
              {pulse && <PulseRing px={scaleX(focusX)} py={scaleY(fy)} color={COLORS.pink} maxRadius={35} />}

              {/* Draggable focus point (pink) */}
              <g
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-grab active:cursor-grabbing"
              >
                <circle cx={scaleX(focusX)} cy={scaleY(fy)} r={16} fill="transparent" />
                <AnimatedPointMark px={scaleX(focusX)} py={scaleY(fy)} color={COLORS.pink} r={7} label="focus x" />
              </g>
            </g>

            {/* Magnification Lens */}
            <g>
              <defs>
                <clipPath id="lens-clip">
                  <circle cx={lensCx} cy={lensCy} r={lensRadius} />
                </clipPath>
              </defs>

              {/* Zoomed Content (only visible inside clip path) */}
              <g clipPath="url(#lens-clip)">
                {/* Background grid representation */}
                <rect x={lensCx - lensRadius} y={lensCy - lensRadius} width={lensRadius * 2} height={lensRadius * 2} fill={COLORS.bg} />
                <g transform={`translate(${lensCx}, ${lensCy}) scale(3.5) translate(${-lensCx}, ${-lensCy})`}>
                  {/* Re-render the curve and lines at 3.5x scale */}
                  <path d={curvePath} fill="none" stroke={COLORS.cyan} strokeWidth={1} />
                  <line x1={tanX1} y1={tanY1} x2={tanX2} y2={tanY2} stroke={COLORS.pink} strokeWidth={1.5} />
                  {h > 0.002 && (
                    <line x1={secX1} y1={secY1} x2={secX2} y2={secY2} stroke={COLORS.yellow} strokeWidth={1} strokeDasharray="2 1" />
                  )}
                  <circle cx={scaleX(focusX)} cy={scaleY(fy)} r={2} fill={COLORS.pink} />
                  {h > 0.002 && <circle cx={scaleX(sec)} cy={scaleY(sy)} r={1.5} fill={COLORS.yellow} />}
                </g>
              </g>

              {/* Lens physical border */}
              <circle cx={lensCx} cy={lensCy} r={lensRadius} fill="none" stroke={COLORS.border} strokeWidth={2} />
              <circle cx={lensCx} cy={lensCy} r={lensRadius + 1} fill="none" stroke="#000" strokeOpacity={0.08} strokeWidth={1} />
              <text x={lensCx} y={lensCy - lensRadius - 6} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={800} letterSpacing="0.05em">LOCAL LINEARITY</text>
            </g>

            {/* SVG In-Plot Stats */}
            <g>
              {/* Secant Slope Readout */}
              <g transform="translate(440, 44)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={10} fontWeight={700}>SECANT SLOPE (Δy/Δx)</text>
                <text x={12} y={36} fill={COLORS.yellow} fontSize={15} fontWeight={800}>{h > 0.002 ? secantSlope.toFixed(3) : "—"}</text>
              </g>

              {/* Tangent Slope Readout */}
              <g transform="translate(440, 102)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={10} fontWeight={700}>TANGENT SLOPE (f&apos;(x))</text>
                <text x={12} y={36} fill={COLORS.pink} fontSize={15} fontWeight={800}>{exactSlope.toFixed(3)}</text>
              </g>

              {/* Visual Slope Error Bar */}
              <g transform="translate(440, 168)">
                <rect x={0} y={0} width={166} height={170} fill="rgba(250,248,242,0.6)" stroke={COLORS.border} rx={2} />

                {/* Error Bar Container */}
                <rect x={20} y={30} width={24} height={110} fill={COLORS.grid} rx={2} />

                {/* Filled Error Bar */}
                {(() => {
                  const errorVal = h > 0.002 ? Math.abs(secantSlope - exactSlope) : 0;
                  const maxErr = 1.5;
                  const ratio = Math.min(1, errorVal / maxErr);
                  const barHeight = ratio * 110;
                  return (
                    <motion.rect
                      x={20}
                      y={30 + (110 - barHeight)}
                      width={24}
                      height={barHeight}
                      fill={COLORS.pink}
                      rx={2}
                      animate={{ height: barHeight, y: 30 + (110 - barHeight) }}
                      transition={{ duration: 0.1 }}
                    />
                  );
                })()}

                <text x={56} y={44} fill={COLORS.muted} fontSize={10} fontWeight={700}>SLOPE ERROR</text>
                <text x={56} y={64} fill={COLORS.pink} fontSize={16} fontWeight={800}>
                  {h > 0.002 ? Math.abs(secantSlope - exactSlope).toFixed(4) : "0.0000"}
                </text>
                <foreignObject x={52} y={72} width={105} height={70}>
                  <div className="font-sans text-[9px] font-medium leading-snug opacity-80" style={{ color: COLORS.muted }}>
                    As h → 0, secant slope converges to tangent slope.
                  </div>
                </foreignObject>

                <text x={20} y={154} fill={COLORS.muted} fontSize={8} fontWeight={700}>MAX ERROR: 1.50</text>
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

          <button aria-label="LIMIT IN PROGRESS... TAKE THE LIMIT (h → 0)"
            onClick={startLimitAnimation}
            disabled={isAnimating}
            className="w-full flex h-9 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-2"
          >
            {isAnimating ? "LIMIT IN PROGRESS..." : "TAKE THE LIMIT (h → 0)"}
          </button>

          <button aria-label="RESET LIMIT DISTANCE"
            onClick={() => setH(4.0)}
            disabled={h === 4.0 && !isAnimating}
            className="w-full flex h-8 items-center justify-center border border-outline bg-surface hover:bg-surface-container text-on-surface-variant text-[10px] active:scale-[0.98] transition-all tracking-wider cursor-pointer disabled:opacity-50"
          >
            RESET LIMIT DISTANCE
          </button>

          <div className="mt-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline">
            <p className="font-bold mb-1 text-primary">Direct Manipulation:</p>
            Drag the pink <span className="text-pink font-bold">focus x</span> dot along the curve to change where the derivative is evaluated.
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Magnifying a differentiable curve reveals a straight line (local linearity). The secant line represents average change, which converges to the instantaneous derivative as the interval length $h$ shrinks to zero.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
