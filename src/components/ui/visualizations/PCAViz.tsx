"use client";

import React, { useState, useRef, useEffect } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { animate, motion } from "framer-motion";
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
const topPlot = { left: 54, top: 24, right: 294, width: 240, bottom: 200, height: 176 };
const botPlot = { left: 54, top: 250, right: 294, width: 240, bottom: 270 };

// Center coordinate (origin) of top plot
const origin = { x: 174, y: 112 };
const scaleFactor = 16; // 1 unit = 16 pixels

const scaleX = (val: number) => origin.x + val * scaleFactor;
const scaleY = (val: number) => origin.y - val * scaleFactor;

const scaleBotX = (projVal: number) => origin.x + projVal * scaleFactor;

// Center-subtracted points (mean is (0, 0))
const points = [
  { id: 0, x: -3.8, y: -3.2, label: 0 },
  { id: 1, x: -2.9, y: -1.9, label: 0 },
  { id: 2, x: -1.5, y: -0.1, label: 0 },
  { id: 3, x: -0.7, y: -0.8, label: 0 },
  { id: 4, x: 0.8, y: 0.9, label: 1 },
  { id: 5, x: 1.6, y: 0.4, label: 1 },
  { id: 6, x: 2.7, y: 1.9, label: 1 },
  { id: 7, x: 3.8, y: 2.8, label: 1 },
];

// Analytical PCA angle of maximum variance: ~37.5 degrees (0.654 radians)
const PC1_ANGLE = 0.654;

export function pcaVariancePercentForAngle(angle: number) {
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const totalVar = points.reduce((sum, p) => sum + p.x * p.x + p.y * p.y, 0) / points.length;
  const projVar = points.reduce((sum, p) => {
    const proj = p.x * ux + p.y * uy;
    return sum + proj * proj;
  }, 0) / points.length;

  return totalVar > 0 ? (projVar / totalVar) * 100 : 0;
}

export function isPcaAxisAlignedWithPc1(angle: number) {
  const normalizedAxisAngle = ((angle % Math.PI) + Math.PI) % Math.PI;
  return Math.abs(normalizedAxisAngle - PC1_ANGLE) < 0.08;
}

export default function PCAViz() {
  const [angle, setAngle] = useState(0.2); // angle in radians
  const [progress, setProgress] = useState(0); // 0 = 2D, 1 = projected on axis
  const [isProjected, setIsProjected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pulse, setPulse] = useState(false);

  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  // Direction vector of projection axis
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);

  // Percent variance captured
  const varPercent = pcaVariancePercentForAngle(angle);

  // Is aligned with PC1
  const isAligned = isPcaAxisAlignedWithPc1(angle);

  // Trigger pulse when aligning with PC1
  useEffect(() => {
    if (!isAligned) return;

    const start = setTimeout(() => setPulse(true), 0);
    const end = setTimeout(() => setPulse(false), 600);

    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [isAligned]);

  const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!isDragging) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgCoords = point.matrixTransform(svg.getScreenCTM()?.inverse());
    if (svgCoords) {
      const dx = svgCoords.x - origin.x;
      const dy = origin.y - svgCoords.y; // Invert SVG Y
      const nextAngle = Math.atan2(dy, dx);
      setAngle(nextAngle);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  const toggleProjection = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    const target = isProjected ? 0 : 1;
    setIsProjected(!isProjected);
    animationRef.current = animate(progress, target, {
      duration: 0.8,
      ease: "easeInOut",
      onUpdate: (latest) => setProgress(latest),
    });
  };

  // Endpoints of the projection axis line
  const r = 7.0; // axis length in units
  const axisX1 = scaleX(-r * ux);
  const axisY1 = scaleY(-r * uy);
  const axisX2 = scaleX(r * ux);
  const axisY2 = scaleY(r * uy);

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Principal Component Analysis Projection"
          >
            <title>P C A Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* UPPER PLOT: 2D Space & Projection Axis */}
            <g>
              <rect x={topPlot.left} y={topPlot.top} width={topPlot.width} height={topPlot.height} fill="none" stroke={COLORS.border} strokeWidth={1} />
              
              {/* Axes lines passing through origin */}
              <line x1={topPlot.left} x2={topPlot.right} y1={origin.y} y2={origin.y} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
              <line x1={origin.x} x2={origin.x} y1={topPlot.top} y2={topPlot.bottom} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
              
              <text x={topPlot.left + 8} y={topPlot.top + 14} fill={COLORS.muted} fontSize={12} fontWeight={800}>2D FEATURE SPACE</text>

              {/* Perpendicular drop lines (dashed yellow) */}
              <g>
                {points.map((p) => {
                  const projScalar = p.x * ux + p.y * uy;
                  const onAxis2DX = scaleX(projScalar * ux);
                  const onAxis2DY = scaleY(projScalar * uy);
                  const px = scaleX(p.x);
                  const py = scaleY(p.y);

                  return (
                    <line
                      key={`drop-${p.id}`}
                      x1={px}
                      y1={py}
                      x2={onAxis2DX}
                      y2={onAxis2DY}
                      stroke={COLORS.yellow}
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                      opacity={1.0 - progress} // shrinks to zero opacity when fully projected
                    />
                  );
                })}
              </g>

              {/* Projection Axis (pink) */}
              <line
                x1={axisX1}
                y1={axisY1}
                x2={axisX2}
                y2={axisY2}
                stroke={COLORS.pink}
                strokeWidth={isAligned ? 4.5 : 3.0}
                filter={isAligned ? "url(#glow)" : undefined}
                className="transition-all"
              />

              {/* Glow pulse on alignment */}
              {pulse && <PulseRing px={origin.x} py={origin.y} color={COLORS.pink} maxRadius={70} />}

              {/* Draggable axis handles (on both tips) */}
              <g
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-pointer"
              >
                {/* Tip 2 */}
                <circle cx={axisX2} cy={axisY2} r={16} fill="transparent" />
                <circle cx={axisX2} cy={axisY2} r={6} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={1.5} />
              </g>

              {/* Data points (morphing position dynamically from 2D coordinates to Axis coordinates) */}
              <g>
                {points.map((p) => {
                  const projScalar = p.x * ux + p.y * uy;
                  const onAxis2DX = scaleX(projScalar * ux);
                  const onAxis2DY = scaleY(projScalar * uy);

                  // Interpolated position based on progress
                  const currX = p.x * (1 - progress) + projScalar * ux * progress;
                  const currY = p.y * (1 - progress) + projScalar * uy * progress;

                  return (
                    <AnimatedPointMark
                      key={`pt-${p.id}`}
                      px={scaleX(currX)}
                      py={scaleY(currY)}
                      color={p.label ? COLORS.pink : COLORS.cyan}
                      r={5}
                    />
                  );
                })}
              </g>
            </g>

            {/* LOWER PLOT: 1D Number Line Projection */}
            <g>
              {/* Boundary box */}
              <rect x={botPlot.left} y={botPlot.top} width={botPlot.width} height={botPlot.bottom - botPlot.top + 30} fill="none" stroke={COLORS.border} strokeDasharray="3 3" />
              <text x={botPlot.left + 8} y={botPlot.top + 16} fill={COLORS.muted} fontSize={12} fontWeight={800}>PROJECTED 1D SPACE</text>

              {/* 1D Number Line Axis */}
              <line
                x1={scaleBotX(-r)}
                y1={botPlot.bottom}
                x2={scaleBotX(r)}
                y2={botPlot.bottom}
                stroke={COLORS.border}
                strokeWidth={2}
              />
              <text x={scaleBotX(r) + 8} y={botPlot.bottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={800}>u1</text>
              <text x={scaleBotX(-r) - 12} y={botPlot.bottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={800}>-u1</text>

              {/* Ticks on 1D line */}
              {[-5, 0, 5].map((tVal) => (
                <g key={`1d-tick-${tVal}`}>
                  <line x1={scaleBotX(tVal)} x2={scaleBotX(tVal)} y1={botPlot.bottom - 4} y2={botPlot.bottom + 4} stroke={COLORS.border} strokeWidth={1} />
                  <text x={scaleBotX(tVal)} y={botPlot.bottom + 16} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700}>
                    {tVal}
                  </text>
                </g>
              ))}

              {/* 1D projected points (sliding left/right on number line in real-time) */}
              <g>
                {points.map((p) => {
                  const score = p.x * ux + p.y * uy;
                  return (
                    <circle
                      key={`pt1d-${p.id}`}
                      cx={scaleBotX(score)}
                      cy={botPlot.bottom}
                      r={4.5}
                      fill={p.label ? COLORS.pink : COLORS.cyan}
                      stroke={COLORS.bg}
                      strokeWidth={1}
                      opacity={0.85}
                    />
                  );
                })}
              </g>
            </g>

            {/* SVG In-Plot Stats */}
            <g>
              {/* Variance Captured percentage */}
              <g transform="translate(440, 44)">
                <rect width={166} height={54} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={21} fill={COLORS.muted} fontSize={12} fontWeight={700}>VARIANCE CAPTURED</text>
                <text x={12} y={41} fill={isAligned ? COLORS.pink : COLORS.cyan} fontSize={17} fontWeight={800}>
                  {varPercent.toFixed(1)}% {isAligned && " (PC1!)"}
                </text>
              </g>

              {/* Eigenvalue index info */}
              <g transform="translate(440, 110)">
                <rect width={166} height={102} fill="rgba(250,248,242,0.6)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={12} fontWeight={800}>EIGENVALUE REPORT</text>

                {/* Bar representation of variance percentage */}
                <rect x={20} y={30} width={126} height={14} fill={COLORS.grid} rx={2} />
                <motion.rect
                  x={20}
                  y={30}
                  width={(varPercent / 100) * 126}
                  height={14}
                  fill={isAligned ? COLORS.pink : COLORS.cyan}
                  rx={2}
                  animate={{ width: (varPercent / 100) * 126 }}
                  transition={{ duration: 0.1 }}
                />

                <foreignObject x={16} y={54} width={130} height={50}>
                  <div className="font-sans text-[12px] font-medium leading-snug" style={{ color: COLORS.muted }}>
                    First PC accounts for the maximum variance (spread) in data.
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

          <button aria-label="RESTORE 2D COORDINATES COLLAPSE POINTS ONTO AXIS"
            onClick={toggleProjection}
            className="w-full flex h-9 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer mb-2"
          >
            {isProjected ? "RESTORE 2D COORDINATES" : "COLLAPSE POINTS ONTO AXIS"}
          </button>

          <VisualizationInstruction
            title="Direct Manipulation:"
            content="Drag the pink handle at the tip of the projection axis to rotate it in 2D space. Watch the variance indicator tick and the 1D points slide along the axis line in real-time."
            className="uppercase"
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`PCA projects high-dimensional data onto orthogonal axes that maximize the spread (variance) of the points. Dropping perpendicular lines shows the distance (reconstruction error) lost during projection.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
