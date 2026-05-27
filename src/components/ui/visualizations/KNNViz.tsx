"use client";

import React, { useState } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 338 };

// Coordinate scales
const scaleX = (val: number) => plot.left + (val / 10) * (plot.right - plot.left);
const scaleY = (val: number) => plot.bottom - (val / 10) * (plot.bottom - plot.top);
const invertX = (px: number) => ((px - plot.left) / (plot.right - plot.left)) * 10;
const invertY = (py: number) => ((plot.bottom - py) / (plot.bottom - plot.top)) * 10;

const basePoints = [
  { id: 0, x: 1.2, y: 2.1, label: 0 },
  { id: 1, x: 2.1, y: 3.4, label: 0 },
  { id: 2, x: 3.5, y: 5.3, label: 0 },
  { id: 3, x: 4.3, y: 4.5, label: 0 },
  { id: 4, x: 5.8, y: 6.2, label: 1 },
  { id: 5, x: 6.6, y: 5.7, label: 1 },
  { id: 7, x: 7.7, y: 7.2, label: 1 },
  { id: 8, x: 8.8, y: 8.1, label: 1 },
  { id: 9, x: 4.9, y: 7.6, label: 0 },
  { id: 10, x: 5.4, y: 2.8, label: 1 },
];

export default function KNNViz() {
  const [query, setQuery] = useState({ x: 5.0, y: 5.0 });
  const [k, setK] = useState(3);
  const [showBoundary, setShowBoundary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Compute nearest neighbors to query
  const distances = basePoints.map((p) => {
    const dist = Math.hypot(p.x - query.x, p.y - query.y);
    return { ...p, dist };
  });
  distances.sort((a, b) => a.dist - b.dist);
  const nearest = distances.slice(0, k);

  // Compute predicted class
  const class1Count = nearest.filter((p) => p.label === 1).length;
  const predictedLabel = class1Count > k / 2 ? 1 : 0;
  const predText = predictedLabel === 1 ? "Class 1 (Pink)" : "Class 0 (Cyan)";

  // Compute radar ripple radius (distance to k-th neighbor in pixels)
  const kNeighbor = nearest[nearest.length - 1];
  const radiusPx = kNeighbor
    ? Math.hypot(scaleX(kNeighbor.x) - scaleX(query.x), scaleY(kNeighbor.y) - scaleY(query.y))
    : 40;

  const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateQueryPos(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!isDragging) return;
    updateQueryPos(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  const updateQueryPos = (e: React.PointerEvent<SVGElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgCoords = point.matrixTransform(svg.getScreenCTM()?.inverse());
    if (svgCoords) {
      const rx = invertX(svgCoords.x);
      const ry = invertY(svgCoords.y);
      setQuery({
        x: Math.max(0.5, Math.min(9.5, rx)),
        y: Math.max(0.5, Math.min(9.5, ry)),
      });
    }
  };

  // Voronoi Heatmap resolution
  const stepSize = 14;
  const boundaryGrid: React.ReactNode[] = [];

  if (showBoundary) {
    for (let px = plot.left; px < plot.right; px += stepSize) {
      for (let py = plot.top; py < plot.bottom; py += stepSize) {
        const gx = invertX(px + stepSize / 2);
        const gy = invertY(py + stepSize / 2);

        // Find nearest k
        const gridDistances = basePoints.map((p) => Math.hypot(p.x - gx, p.y - gy));
        // Sort indices
        const indices = Array.from(Array(basePoints.length).keys());
        indices.sort((a, b) => gridDistances[a] - gridDistances[b]);

        let vote1 = 0;
        for (let i = 0; i < k; i++) {
          if (basePoints[indices[i]].label === 1) vote1++;
        }

        const cellLabel = vote1 > k / 2 ? 1 : 0;
        boundaryGrid.push(
          <rect
            key={`${px}-${py}`}
            x={px}
            y={py}
            width={stepSize}
            height={stepSize}
            fill={cellLabel === 1 ? COLORS.pink : COLORS.cyan}
            fillOpacity={0.06}
          />
        );
      }
    }
  }

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="K-Nearest Neighbors Neighborhood"
          >
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Decision Boundary Background (Heatmap) */}
            {showBoundary && <g>{boundaryGrid}</g>}

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
              <text x={plot.right + 12} y={plot.bottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={700}>Feature x1</text>
              <text x={plot.left - 20} y={plot.top - 8} fill={COLORS.muted} fontSize={12} fontWeight={700}>Feature x2</text>
            </g>

            {/* Radar ripple neighborhood circle */}
            <motion.circle
              key={`${query.x}-${query.y}-${k}`}
              cx={scaleX(query.x)}
              cy={scaleY(query.y)}
              r={0}
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              initial={{ r: 0, opacity: 0.8 }}
              animate={{ r: radiusPx, opacity: 0.16 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Connecting lines from query to nearest neighbors */}
            <g>
              {nearest.map((p, idx) => (
                <motion.line
                  key={`line-${idx}-${query.x}-${query.y}`}
                  x1={scaleX(query.x)}
                  y1={scaleY(query.y)}
                  x2={scaleX(p.x)}
                  y2={scaleY(p.y)}
                  stroke={COLORS.yellow}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                />
              ))}
            </g>

            {/* All Data Points */}
            <g>
              {basePoints.map((p) => {
                const isNear = nearest.some((n) => n.id === p.id);
                return (
                  <g key={p.id}>
                    {/* Ring highlight if neighbor */}
                    {isNear && (
                      <circle
                        cx={scaleX(p.x)}
                        cy={scaleY(p.y)}
                        r={11}
                        fill="none"
                        stroke={COLORS.yellow}
                        strokeWidth={2}
                        opacity={0.8}
                      />
                    )}
                    <AnimatedPointMark px={scaleX(p.x)} py={scaleY(p.y)} color={p.label ? COLORS.pink : COLORS.cyan} r={5} />
                  </g>
                );
              })}
            </g>

            {/* Click/Drag Area to move Query */}
            <rect
              x={plot.left}
              y={plot.top}
              width={plot.right - plot.left}
              height={plot.bottom - plot.top}
              fill="transparent"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="cursor-crosshair"
            />

            {/* Draggable Query Point (yellow) */}
            <g transform={`translate(${scaleX(query.x)}, ${scaleY(query.y)})`}>
              <circle r={10} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2.5} />
              {/* Predicted Label indicator */}
              <circle r={5} fill={predictedLabel === 1 ? COLORS.pink : COLORS.cyan} />
              <text x={14} y={4} fill={COLORS.yellow} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">
                Query [k={k}]
              </text>
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
              Neighbor Count (k):
            </span>
            <div className="flex items-center gap-2 bg-surface-container p-2 border border-outline">
              <button
                onClick={() => setK((prev) => Math.max(1, prev - 2))}
                disabled={k <= 1}
                className="h-7 w-7 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer disabled:opacity-30"
              >
                -
              </button>
              <span className="font-bold text-primary text-center w-8">k = {k}</span>
              <button
                onClick={() => setK((prev) => Math.min(7, prev + 2))}
                disabled={k >= 7}
                className="h-7 w-7 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowBoundary(!showBoundary)}
            className={`w-full flex h-9 items-center justify-center border border-outline font-bold tracking-wider cursor-pointer mb-2 active:scale-[0.98] transition-all ${
              showBoundary
                ? "bg-cyan/20 border-cyan text-cyan"
                : "bg-surface hover:bg-surface-container hover:text-primary"
            }`}
          >
            {showBoundary ? "HIDE DECISION BOUNDARY" : "SHOW DECISION BOUNDARY"}
          </button>

          <div className="mt-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline">
            <p className="font-bold mb-1 text-primary">Direct Manipulation:</p>
            <MarkdownRenderer content={`Click or drag anywhere inside the plot to move the query point. Watch neighbor arcs connect and the vote balance update.`} />
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-2 block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">
            VOTING READOUT
          </div>
          <div className="bg-surface-container p-3 border border-outline space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Neighbors for Class 1 (Pink):</span>
              <span className="font-bold text-pink">{class1Count}</span>
            </div>
            <div className="flex justify-between">
              <span>Neighbors for Class 0 (Cyan):</span>
              <span className="font-bold text-cyan">{k - class1Count}</span>
            </div>
            <div className="border-t border-outline my-2 pt-2 flex justify-between text-sm font-bold">
              <span>PREDICTED CLASS:</span>
              <span style={{ color: predictedLabel === 1 ? COLORS.pink : COLORS.cyan }}>
                {predText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
