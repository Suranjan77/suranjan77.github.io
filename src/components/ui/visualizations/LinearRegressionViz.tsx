"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { animate, motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
} from "../visualizationPrimitives";
import { useSimulation } from "./useAnimationEngine";

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 338 };

const scaleX = (val: number) => plot.left + (val / 10) * (plot.right - plot.left);
const scaleY = (val: number) => plot.bottom - (val / 10) * (plot.bottom - plot.top);
const invertX = (px: number) => ((px - plot.left) / (plot.right - plot.left)) * 10;
const invertY = (py: number) => ((plot.bottom - py) / (plot.bottom - plot.top)) * 10;

const basePoints = [
  { x: 1.2, y: 2.1 },
  { x: 2.1, y: 3.4 },
  { x: 3.5, y: 5.3 },
  { x: 4.3, y: 4.5 },
  { x: 5.8, y: 6.2 },
  { x: 6.6, y: 5.7 },
  { x: 7.7, y: 7.2 },
  { x: 8.8, y: 8.1 },
];

// OLS analytical solutions
const OLS_SLOPE = 0.70;
const OLS_INTERCEPT = 1.81;

export default function LinearRegressionViz() {
  const [yLeft, setYLeft] = useState(5.3); // height at x=1.5
  const [yRight, setYRight] = useState(5.3); // height at x=8.5
  const [dragSide, setDragSide] = useState<"left" | "right" | "mid" | null>(null);
  const [dragStart, setDragStart] = useState({ y: 0, yL: 0, yR: 0 });
  const [pulse, setPulse] = useState(false);
  const stopSimulationRef = useRef<(() => void) | null>(null);

  // Compute m, c
  const m = (yRight - yLeft) / (8.5 - 1.5);
  const c = yLeft - m * 1.5;

  // Compute SSE
  let sse = 0;
  basePoints.forEach((p) => {
    const predY = m * p.x + c;
    sse += Math.pow(p.y - predY, 2);
  });

  // Target OLS coordinates
  const targetYL = OLS_SLOPE * 1.5 + OLS_INTERCEPT;
  const targetYR = OLS_SLOPE * 8.5 + OLS_INTERCEPT;

  const handlePointerDown = (e: React.PointerEvent<SVGElement>, side: "left" | "right" | "mid") => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setDragSide(side);
    setDragStart({
      y: e.clientY,
      yL: yLeft,
      yR: yRight,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!dragSide) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgCoords = point.matrixTransform(svg.getScreenCTM()?.inverse());
    if (!svgCoords) return;

    const currentYVal = invertY(svgCoords.y);

    if (dragSide === "left") {
      setYLeft(Math.max(0.5, Math.min(9.5, currentYVal)));
    } else if (dragSide === "right") {
      setYRight(Math.max(0.5, Math.min(9.5, currentYVal)));
    } else if (dragSide === "mid") {
      // Translate the entire line
      const dy = invertY(svgCoords.y) - invertY(svg.createSVGPoint().matrixTransform(svg.getScreenCTM()?.inverse())?.y || 0); // fallback simple diff
      const screenDeltaY = e.clientY - dragStart.y;
      const unitsDeltaY = -(screenDeltaY / (plot.bottom - plot.top)) * 10;
      
      const nextYL = Math.max(0.5, Math.min(9.5, dragStart.yL + unitsDeltaY));
      const nextYR = Math.max(0.5, Math.min(9.5, dragStart.yR + unitsDeltaY));
      setYLeft(nextYL);
      setYRight(nextYR);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setDragSide(null);
  };

  const snapToOls = () => {
    stopSimulationRef.current?.();
    animate(yLeft, targetYL, {
      type: "spring",
      stiffness: 120,
      damping: 15,
      onUpdate: (latest) => setYLeft(latest),
    });
    animate(yRight, targetYR, {
      type: "spring",
      stiffness: 120,
      damping: 15,
      onUpdate: (latest) => setYRight(latest),
      onComplete: () => {
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
      },
    });
  };

  // Gradient descent simulation tick
  const runGradientDescentStep = () => {
    // Learning rates
    const lrM = 0.012;
    const lrC = 0.08;

    let gradM = 0;
    let gradC = 0;

    basePoints.forEach((p) => {
      const pred = m * p.x + c;
      const diff = pred - p.y;
      gradM += diff * p.x;
      gradC += diff;
    });

    // Clip gradients to prevent explosion (max step size)
    const maxGrad = 30;
    gradM = Math.max(-maxGrad, Math.min(maxGrad, gradM));
    gradC = Math.max(-maxGrad, Math.min(maxGrad, gradC));

    const nextM = m - lrM * gradM;
    const nextC = c - lrC * gradC;

    // Convert back to yLeft, yRight
    let nextYL = nextM * 1.5 + nextC;
    let nextYR = nextM * 8.5 + nextC;

    // Safety clamp to prevent NaN or extreme divergence blowing up SVG
    if (isNaN(nextYL) || !isFinite(nextYL) || Math.abs(nextYL) > 50) nextYL = 5.3;
    if (isNaN(nextYR) || !isFinite(nextYR) || Math.abs(nextYR) > 50) nextYR = 5.3;

    setYLeft(nextYL);
    setYRight(nextYR);

    // Stop if close enough
    if (Math.abs(nextYL - targetYL) < 0.005 && Math.abs(nextYR - targetYR) < 0.005) {
      stopSimulationRef.current?.();
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }
  };

  const { isRunning, start, stop } = useSimulation(runGradientDescentStep, 30);

  useEffect(() => {
    stopSimulationRef.current = stop;
  }, [stop]);

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Linear Regression Residuals">
            <title>Linear Regression Residuals</title>
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
              <text x={plot.right + 12} y={plot.bottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={700}>x (Feature)</text>
              <text x={plot.left - 20} y={plot.top - 8} fill={COLORS.muted} fontSize={12} fontWeight={700}>y (Target)</text>
            </g>

            {/* Residual Squares and lines */}
            <g>
              {basePoints.map((p, idx) => {
                const predY = m * p.x + c;
                const res = p.y - predY;
                const px = scaleX(p.x);
                const py = scaleY(p.y);
                const pPredY = scaleY(predY);
                if (isNaN(pPredY)) return null;
                const size = Math.abs(py - pPredY);

                // Draw residual square adjacent to the line/point
                return (
                  <g key={`res-${idx}`}>
                    {size > 1 && (
                      <rect
                        x={res > 0 ? px - size : px}
                        y={res > 0 ? py : pPredY}
                        width={size}
                        height={size}
                        fill={COLORS.yellow}
                        fillOpacity={0.16}
                        stroke={COLORS.yellow}
                        strokeWidth={1}
                        strokeOpacity={0.3}
                      />
                    )}
                    {/* Vertical residual line */}
                    <line x1={px} y1={py} x2={px} y2={pPredY} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="3 2" />
                  </g>
                );
              })}
            </g>

            {/* Faint target OLS reference line */}
            <line
              x1={scaleX(0)}
              y1={scaleY(OLS_INTERCEPT)}
              x2={scaleX(10)}
              y2={scaleY(OLS_SLOPE * 10 + OLS_INTERCEPT)}
              stroke={COLORS.pink}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.35}
            />

            {/* User regression fit line (pink) */}
            <line
              x1={scaleX(0)}
              y1={scaleY(c)}
              x2={scaleX(10)}
              y2={scaleY(m * 10 + c)}
              stroke={COLORS.pink}
              strokeWidth={4}
              filter={pulse ? "url(#glow)" : undefined}
            />

            {/* Convergence pulse */}
            {pulse && <PulseRing px={scaleX(5)} py={scaleY(5 * m + c)} color={COLORS.pink} maxRadius={60} />}

            {/* Data Points */}
            <g>
              {basePoints.map((p, idx) => (
                <AnimatedPointMark key={`pt-${idx}`} px={scaleX(p.x)} py={scaleY(p.y)} color={COLORS.cyan} r={5} />
              ))}
            </g>

            {/* Draggable line handles */}
            <g>
              {/* Left Handle */}
              <g
                onPointerDown={(e) => handlePointerDown(e, "left")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-ns-resize"
              >
                <circle cx={scaleX(1.5)} cy={scaleY(yLeft)} r={16} fill="transparent" />
                <circle cx={scaleX(1.5)} cy={scaleY(yLeft)} r={8} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={2} />
              </g>

              {/* Right Handle */}
              <g
                onPointerDown={(e) => handlePointerDown(e, "right")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-ns-resize"
              >
                <circle cx={scaleX(8.5)} cy={scaleY(yRight)} r={16} fill="transparent" />
                <circle cx={scaleX(8.5)} cy={scaleY(yRight)} r={8} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={2} />
              </g>
            </g>

            {/* SVG In-Plot Stats */}
            <g>
              {/* Sum of Squared Errors (SSE) */}
              <g transform="translate(440, 44)">
                <rect width={166} height={54} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={21} fill={COLORS.muted} fontSize={9} fontWeight={700}>SUM OF SQUARES (SSE)</text>
                <text data-testid="linear-regression-sse" x={12} y={41} fill={COLORS.pink} fontSize={16} fontWeight={800}>{sse.toFixed(3)}</text>
              </g>

              {/* Slope and Intercept */}
              <g transform="translate(440, 110)">
                <rect width={166} height={68} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={9} fontWeight={700}>FITTED LINE FORMULA</text>
                <text data-testid="linear-regression-formula" x={12} y={38} fill={COLORS.muted} fontSize={11} fontWeight={800}>
                  y = <tspan fill={COLORS.pink}>{m.toFixed(2)}</tspan> · x + <tspan fill={COLORS.pink}>{c.toFixed(2)}</tspan>
                </text>
                <foreignObject x={8} y={44} width={150} height={30}>
                  <div className="font-sans text-[9px] font-medium leading-snug" style={{ color: COLORS.muted }}>
                    OLS ideal: y = 0.70 · x + 1.81
                  </div>
                </foreignObject>
              </g>

              {/* Optimization SSE bar gauge */}
              <g transform="translate(440, 190)">
                <rect width={166} height={142} fill="rgba(250,248,242,0.6)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={9} fontWeight={800}>SSE METER</text>

                {/* Gauge */}
                <rect x={20} y={30} width={20} height={90} fill={COLORS.grid} rx={2} />
                {(() => {
                  const maxSse = 75;
                  const ratio = Math.min(1, sse / maxSse);
                  const barH = ratio * 90;
                  return (
                    <motion.rect
                      x={20}
                      y={30 + (90 - barH)}
                      width={20}
                      height={barH}
                      fill={sse < 13.5 ? COLORS.cyan : COLORS.yellow}
                      rx={2}
                      animate={{ height: barH, y: 30 + (90 - barH) }}
                      transition={{ duration: 0.1 }}
                    />
                  );
                })()}

                <text x={50} y={44} fill={COLORS.muted} fontSize={9} fontWeight={600}>FIT DISTANCE:</text>
                <text x={50} y={60} fill={COLORS.muted} fontSize={13} fontWeight={800}>
                  {sse.toFixed(1)} / 13.1
                </text>
                <foreignObject x={45} y={66} width={115} height={70}>
                  <div className="font-sans text-[9px] font-medium leading-snug" style={{ color: COLORS.muted }}>
                    Residual squares show each point&apos;s squared error contribution.
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
            <span>Interactions</span>
          </div>

          <button aria-label="SNAP TO OLS FIT (ANALYTICAL)"
            onClick={snapToOls}
            disabled={isRunning}
            className="w-full flex h-9 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer mb-2 disabled:opacity-50"
          >
            SNAP TO OLS FIT (ANALYTICAL)
          </button>

          <button aria-label="PAUSE GRADIENT DESCENT RUN GRADIENT DESCENT (OPTIMIZE)"
            onClick={isRunning ? stop : start}
            className={`w-full flex h-9 items-center justify-center border border-outline font-bold tracking-wider cursor-pointer mb-2 active:scale-[0.98] transition-all ${
              isRunning
                ? "bg-warning/20 border-warning hover:bg-warning/30 text-warning"
                : "bg-surface hover:bg-surface-container hover:text-primary"
            }`}
          >
            {isRunning ? "PAUSE GRADIENT DESCENT" : "RUN GRADIENT DESCENT (OPTIMIZE)"}
          </button>

          <div className="mt-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline">
            <p className="font-bold mb-1 text-primary">Direct Manipulation:</p>
            <MarkdownRenderer content={`Drag the two pink handles along the line to rotate or translate the regression fit. Watch the squares grow or shrink in response to your fit!`} />
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`OLS (Ordinary Least Squares) regression fits a line by physically minimizing the total area of the residual squares (SSE). Gradient descent iteratively wiggles the line's parameters to slide down the SSE error hill.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
