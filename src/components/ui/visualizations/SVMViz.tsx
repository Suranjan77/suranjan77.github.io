"use client";

import React, { useState } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 338 };

const scaleX = (val: number) => plot.left + (val / 10) * (plot.right - plot.left);
const scaleY = (val: number) => plot.bottom - (val / 10) * (plot.bottom - plot.top);
const invertX = (px: number) => ((px - plot.left) / (plot.right - plot.left)) * 10;
const invertY = (py: number) => ((plot.bottom - py) / (plot.bottom - plot.top)) * 10;

const initialPoints = [
  { id: 0, x: 2.0, y: 7.2, label: 0 },
  { id: 1, x: 2.8, y: 5.4, label: 0 },
  { id: 2, x: 4.1, y: 6.8, label: 0 },
  { id: 3, x: 3.5, y: 8.5, label: 0 },
  { id: 4, x: 6.2, y: 4.2, label: 1 },
  { id: 5, x: 7.6, y: 3.1, label: 1 },
  { id: 6, x: 8.2, y: 5.6, label: 1 },
  { id: 7, x: 6.9, y: 2.0, label: 1 },
];

export default function SVMViz() {
  const [points, setPoints] = useState(initialPoints);
  const [cFactor, setCFactor] = useState(0.8); // corresponds to C penalty slider (soft to strict)
  const [dragId, setDragId] = useState<number | null>(null);

  // SVM Solver Heuristic: Find closest pair between Class 0 and Class 1
  const class0 = points.filter((p) => p.label === 0);
  const class1 = points.filter((p) => p.label === 1);

  let sv0 = class0[0];
  let sv1 = class1[0];
  let minDist = 999;

  class0.forEach((p0) => {
    class1.forEach((p1) => {
      const d = Math.hypot(p0.x - p1.x, p0.y - p1.y);
      if (d < minDist) {
        minDist = d;
        sv0 = p0;
        sv1 = p1;
      }
    });
  });

  // Midpoint of SV segment
  const midX = (sv0.x + sv1.x) / 2;
  const midY = (sv0.y + sv1.y) / 2;

  // SV Segment direction vector
  const dx = sv1.x - sv0.x;
  const dy = sv1.y - sv0.y;
  const dLen = Math.sqrt(dx * dx + dy * dy);

  const ux = dLen > 0.01 ? dx / dLen : 1;
  const uy = dLen > 0.01 ? dy / dLen : 0;

  // Boundary normal vector (perpendicular)
  const px = -uy;
  const py = ux;

  // Soft-margin factor: scale margin size by C slider
  // In SVM, soft margin allows violations and has a larger margin width. Strict margin is narrow.
  const marginSize = (minDist / 2) * (1.3 - cFactor * 0.7);

  // Function to get boundary line coordinate at x = 0 and x = 10
  const getLinePoints = (offsetX: number, offsetY: number) => {
    const cx = midX + offsetX;
    const cy = midY + offsetY;

    // Line: cx + lambda * px, cy + lambda * py
    // Intersect x = 0: lambda = -cx / px
    const l0 = px !== 0 ? -cx / px : 0;
    const y0 = cy + l0 * py;

    // Intersect x = 10: lambda = (10 - cx) / px
    const l10 = px !== 0 ? (10 - cx) / px : 0;
    const y10 = cy + l10 * py;

    return {
      x1: scaleX(0),
      y1: scaleY(y0),
      x2: scaleX(10),
      y2: scaleY(y10),
    };
  };

  // Boundary line coordinates
  const boundary = getLinePoints(0, 0);

  // Positive/Negative Margin line coordinates
  const shiftX = ux * marginSize;
  const shiftY = uy * marginSize;
  const marginPos = getLinePoints(shiftX, shiftY);
  const marginNeg = getLinePoints(-shiftX, -shiftY);

  const handlePointerDown = (e: React.PointerEvent<SVGElement>, id: number) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setDragId(id);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (dragId === null) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgCoords = point.matrixTransform(svg.getScreenCTM()?.inverse());
    if (svgCoords) {
      const rx = invertX(svgCoords.x);
      const ry = invertY(svgCoords.y);
      setPoints((prev) =>
        prev.map((p) =>
          p.id === dragId
            ? { ...p, x: Math.max(0.5, Math.min(9.5, rx)), y: Math.max(0.5, Math.min(9.5, ry)) }
            : p
        )
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setDragId(null);
  };

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="SVM Maximum Margin Hyperplane"
          >
            <title>S V M Diagram</title>
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
              <text x={plot.right + 12} y={plot.bottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={700}>x1</text>
              <text x={plot.left - 20} y={plot.top - 8} fill={COLORS.muted} fontSize={12} fontWeight={700}>x2</text>
            </g>

            <defs>
              <clipPath id="plot-area">
                <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} />
              </clipPath>
            </defs>

            <g clipPath="url(#plot-area)">
              {/* Shaded Margin Band (Polygon between positive and negative margin lines) */}
            <path
              d={`M ${marginPos.x1} ${marginPos.y1} L ${marginPos.x2} ${marginPos.y2} L ${marginNeg.x2} ${marginNeg.y2} L ${marginNeg.x1} ${marginNeg.y1} Z`}
              fill={COLORS.yellow}
              fillOpacity={0.09}
              stroke="none"
            />

            {/* Positive Margin boundary (Dashed) */}
            <line
              x1={marginPos.x1}
              y1={marginPos.y1}
              x2={marginPos.x2}
              y2={marginPos.y2}
              stroke={COLORS.yellow}
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />

            {/* Negative Margin boundary (Dashed) */}
            <line
              x1={marginNeg.x1}
              y1={marginNeg.y1}
              x2={marginNeg.x2}
              y2={marginNeg.y2}
              stroke={COLORS.yellow}
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />

            {/* SVM Optimal Decision Boundary (Solid Pink) */}
            <line
              x1={boundary.x1}
              y1={boundary.y1}
              x2={boundary.x2}
              y2={boundary.y2}
              stroke={COLORS.pink}
              strokeWidth={4}
              filter="url(#glow)"
            />
            </g>

            {/* Pulse rings around support vectors */}
            <g>
              <PulseRing px={scaleX(sv0.x)} py={scaleY(sv0.y)} color={COLORS.cyan} maxRadius={24} duration={1.8} />
              <PulseRing px={scaleX(sv1.x)} py={scaleY(sv1.y)} color={COLORS.pink} maxRadius={24} duration={1.8} />
            </g>

            {/* Data Points */}
            <g>
              {points.map((p) => {
                const isSupport = p.id === sv0.id || p.id === sv1.id;
                // Highlight support vectors with extra ring
                return (
                  <g
                    key={p.id}
                    onPointerDown={(e) => handlePointerDown(e, p.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <circle cx={scaleX(p.x)} cy={scaleY(p.y)} r={16} fill="transparent" />
                    {isSupport && (
                      <circle
                        cx={scaleX(p.x)}
                        cy={scaleY(p.y)}
                        r={12}
                        fill="none"
                        stroke={COLORS.yellow}
                        strokeWidth={2.5}
                      />
                    )}
                    <AnimatedPointMark
                      px={scaleX(p.x)}
                      py={scaleY(p.y)}
                      color={p.label ? COLORS.pink : COLORS.cyan}
                      r={isSupport ? 7.5 : 5.5}
                      label={isSupport ? "SV" : undefined}
                    />
                  </g>
                );
              })}
            </g>

            {/* SVG In-Plot Stats */}
            <g>
              {/* Margin width */}
              <g transform="translate(440, 44)">
                <rect width={166} height={54} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={21} fill={COLORS.muted} fontSize={9} fontWeight={700}>MARGIN WIDTH (2/||w||)</text>
                <text x={12} y={41} fill={COLORS.yellow} fontSize={16} fontWeight={800}>{(marginSize * 2).toFixed(3)}</text>
              </g>

              {/* Support Vectors count */}
              <g transform="translate(440, 110)">
                <rect width={166} height={54} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={21} fill={COLORS.muted} fontSize={9} fontWeight={700}>SUPPORT VECTORS</text>
                <text x={12} y={41} fill={COLORS.pink} fontSize={15} fontWeight={800}>2 (Active)</text>
              </g>

              {/* SVM soft penalty status */}
              <g transform="translate(440, 178)">
                <rect width={166} height={154} fill="rgba(250,248,242,0.6)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={9} fontWeight={800}>SOFT PENALTY (C)</text>

                {/* Vertical slider representation */}
                <rect x={20} y={30} width={20} height={100} fill={COLORS.grid} rx={2} />
                <motion.rect
                  x={20}
                  y={30 + (100 - cFactor * 100)}
                  width={20}
                  height={cFactor * 100}
                  fill={cFactor > 0.6 ? COLORS.cyan : COLORS.yellow}
                  rx={2}
                  animate={{ height: cFactor * 100, y: 30 + (100 - cFactor * 100) }}
                  transition={{ duration: 0.1 }}
                />

                <text x={50} y={44} fill={COLORS.muted} fontSize={9} fontWeight={600}>C VALUE:</text>
                <text x={50} y={60} fill={COLORS.muted} fontSize={14} fontWeight={800}>
                  {cFactor.toFixed(2)}
                </text>
                <foreignObject x={45} y={68} width={115} height={70}>
                  <div className="font-sans text-[9px] font-medium leading-snug opacity-80" style={{ color: COLORS.muted }}>
                    Low C makes margin wider. High C forces strict separation.
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

          <div className="mb-3">
            <span className="block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              Soft-Margin Penalty (C):
            </span>
            <input aria-label="SVM input"
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={cFactor}
              onChange={(e) => setCFactor(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="mt-1.5 flex justify-between text-[8px] uppercase tracking-wide text-on-surface-variant">
              <span>Soft (Wide Margin)</span>
              <span>Strict (Hard Margin)</span>
            </div>
          </div>

          <div className="mt-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline">
            <p className="font-bold mb-1 text-primary">Direct Manipulation:</p>
            <MarkdownRenderer content={`Drag any of the data points around. When you push the points, the boundary and margin band dynamically reorient and snap using spring physics!`} />
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`SVM (Support Vector Machine) finds the separating boundary that maximizes the margin (corridor width) between classes. The points touching this margin corridor are the Support Vectors — moving other points does not affect the model.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
