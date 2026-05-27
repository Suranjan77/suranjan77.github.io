"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
} from "../visualizationPrimitives";
import MarkdownRenderer from "../MarkdownRenderer";

const W = 640;
const H = 420;

// Subplot areas
const leftPlot = { left: 54, top: 44, right: 294, width: 240, bottom: 320, height: 276 };
const rightPlot = { left: 354, top: 44, right: 594, width: 240, bottom: 320, height: 276 };

// Coordinate scales
const scaleLeftX = (val: number) => leftPlot.left + (val / 10) * leftPlot.width;
const scaleLeftY = (val: number) => leftPlot.bottom - (val / 10) * leftPlot.height;
const invertLeftX = (px: number) => ((px - leftPlot.left) / leftPlot.width) * 10;

const scaleRightX = (zVal: number) => rightPlot.left + ((zVal + 5) / 10) * rightPlot.width;
const scaleRightY = (pVal: number) => rightPlot.bottom - pVal * rightPlot.height;
const invertRightX = (px: number) => (((px - rightPlot.left) / rightPlot.width) * 10) - 5;

const basePoints = [
  { id: 0, x: 1.2, y: 2.1, label: 0 },
  { id: 1, x: 2.1, y: 3.4, label: 0 },
  { id: 2, x: 3.5, y: 5.3, label: 0 },
  { id: 3, x: 4.3, y: 4.5, label: 0 },
  { id: 4, x: 5.8, y: 6.2, label: 1 },
  { id: 5, x: 6.6, y: 5.7, label: 1 },
  { id: 6, x: 7.7, y: 7.2, label: 1 },
  { id: 7, x: 8.8, y: 8.1, label: 1 },
];

export default function LogisticRegressionViz() {
  const [boundaryX, setBoundaryX] = useState(5.0);
  const [dragMode, setDragMode] = useState<"boundary" | "threshold" | null>(null);
  const [wiggling, setWiggling] = useState<Record<number, boolean>>({});

  const prevCorrectRef = useRef<boolean[]>([]);

  // Track classification status changes to trigger wiggles
  useEffect(() => {
    const currentCorrect = basePoints.map((p) => {
      const pred = p.x >= boundaryX ? 1 : 0;
      return pred === p.label;
    });

    if (prevCorrectRef.current.length > 0) {
      const nextWiggling = { ...wiggling };
      let changed = false;

      currentCorrect.forEach((isCorrect, idx) => {
        const wasCorrect = prevCorrectRef.current[idx];
        // If a point became misclassified, shake it!
        if (wasCorrect && !isCorrect) {
          nextWiggling[idx] = true;
          changed = true;
          setTimeout(() => {
            setWiggling((prev) => ({ ...prev, [idx]: false }));
          }, 350);
        }
      });

      if (changed) {
        setWiggling(nextWiggling);
      }
    }

    prevCorrectRef.current = currentCorrect;
  }, [boundaryX]);

  const handlePointerDown = (e: React.PointerEvent<SVGElement>, mode: "boundary" | "threshold") => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setDragMode(mode);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!dragMode) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgCoords = point.matrixTransform(svg.getScreenCTM()?.inverse());
    if (!svgCoords) return;

    if (dragMode === "boundary") {
      const unitsX = invertLeftX(svgCoords.x);
      setBoundaryX(Math.max(1.0, Math.min(9.0, unitsX)));
    } else if (dragMode === "threshold") {
      // Mapping z = 0 score back to boundaryX
      // Dragging the vertical threshold on the sigmoid curve
      const zValue = invertRightX(svgCoords.x); // z ranges from -5 to 5
      // Let's map z to boundary shift: boundaryX = 5.0 - zValue
      // So if z is shifted to positive (e.g. 2.0), the decision split moves left to 3.0
      const nextBoundary = 5.0 + zValue;
      setBoundaryX(Math.max(1.0, Math.min(9.0, nextBoundary)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setDragMode(null);
  };

  // Sigmoid formula: p = 1 / (1 + e^-z)
  // For each point, score z_i = 1.5 * (x_i - boundaryX)
  const getSigmoidData = () => {
    const pts: { x: number; y: number }[] = [];
    for (let z = -5; z <= 5.05; z += 0.25) {
      const p = 1 / (1 + Math.exp(-z));
      pts.push({ x: scaleRightX(z), y: scaleRightY(p) });
    }
    return pts;
  };
  const sigmoidPath = "M " + getSigmoidData().map((p) => `${p.x} ${p.y}`).join(" L ");

  // Count correct/incorrect classifications
  let correctCount = 0;
  basePoints.forEach((p) => {
    const pred = p.x >= boundaryX ? 1 : 0;
    if (pred === p.label) correctCount++;
  });
  const accuracy = correctCount / basePoints.length;

  const leftTicks = [0, 2.5, 5, 7.5, 10];
  const rightTicksZ = [-4, -2, 0, 2, 4];
  const rightTicksP = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Logistic Regression thresholding">
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* LEFT PLOT: Feature Space */}
            <g>
              {/* Background classifier tints */}
              <rect
                x={leftPlot.left}
                y={leftPlot.top}
                width={scaleLeftX(boundaryX) - leftPlot.left}
                height={leftPlot.height}
                fill={COLORS.cyan}
                fillOpacity={0.06}
              />
              <rect
                x={scaleLeftX(boundaryX)}
                y={leftPlot.top}
                width={leftPlot.right - scaleLeftX(boundaryX)}
                height={leftPlot.height}
                fill={COLORS.pink}
                fillOpacity={0.06}
              />

              {/* Grid ticks */}
              {leftTicks.map((tick) => (
                <g key={`l-tick-${tick}`}>
                  <line x1={scaleLeftX(tick)} x2={scaleLeftX(tick)} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.grid} strokeWidth={1} />
                  <line x1={leftPlot.left} x2={leftPlot.right} y1={scaleLeftY(tick)} y2={scaleLeftY(tick)} stroke={COLORS.grid} strokeWidth={1} />
                </g>
              ))}

              {/* Axes */}
              <line x1={leftPlot.left} x2={leftPlot.left} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={leftPlot.left} x2={leftPlot.right} y1={leftPlot.bottom} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />

              <text x={leftPlot.right + 8} y={leftPlot.bottom + 4} fill={COLORS.muted} fontSize={10} fontWeight={700}>x1</text>
              <text x={leftPlot.left - 8} y={leftPlot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>x2</text>
              <text x={leftPlot.left + 5} y={leftPlot.top - 8} fill={COLORS.muted} fontSize={9} fontWeight={800}>FEATURE SPACE</text>

              {/* Draggable Decision Boundary Line */}
              <g
                onPointerDown={(e) => handlePointerDown(e, "boundary")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-ew-resize"
              >
                <line
                  x1={scaleLeftX(boundaryX)}
                  y1={leftPlot.top}
                  x2={scaleLeftX(boundaryX)}
                  y2={leftPlot.bottom}
                  stroke={COLORS.yellow}
                  strokeWidth={4.5}
                />
                <circle cx={scaleLeftX(boundaryX)} cy={leftPlot.top + leftPlot.height / 2} r={7} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2} />
              </g>
            </g>

            {/* RIGHT PLOT: Sigmoid Curve */}
            <g>
              {/* Grid ticks */}
              {rightTicksZ.map((tick) => (
                <line key={`r-tick-z-${tick}`} x1={scaleRightX(tick)} x2={scaleRightX(tick)} y1={rightPlot.top} y2={rightPlot.bottom} stroke={COLORS.grid} strokeWidth={1} />
              ))}
              {rightTicksP.map((tick) => (
                <g key={`r-tick-p-${tick}`}>
                  <line x1={rightPlot.left} x2={rightPlot.right} y1={scaleRightY(tick)} y2={scaleRightY(tick)} stroke={COLORS.grid} strokeWidth={1} />
                  <text x={rightPlot.left - 8} y={scaleRightY(tick) + 3} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={700}>
                    {tick.toFixed(2)}
                  </text>
                </g>
              ))}

              {/* Axes */}
              <line x1={rightPlot.left} x2={rightPlot.left} y1={rightPlot.top} y2={rightPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={rightPlot.left} x2={rightPlot.right} y1={rightPlot.bottom} y2={rightPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />

              <text x={rightPlot.right + 8} y={rightPlot.bottom + 4} fill={COLORS.muted} fontSize={10} fontWeight={700}>Score z</text>
              <text x={rightPlot.left - 8} y={rightPlot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>Prob p</text>
              <text x={rightPlot.left + 5} y={rightPlot.top - 8} fill={COLORS.muted} fontSize={9} fontWeight={800}>SIGMOID LINK</text>

              {/* Sigmoid curve (yellow) */}
              <path d={sigmoidPath} fill="none" stroke={COLORS.yellow} strokeWidth={3} />

              {/* Draggable Decision Threshold (p=0.5 split, score z=0 equivalent) */}
              {(() => {
                // Score offset is z = 0, which sits at scaleRightX(0 - thresholdOffset)
                // score z = x - boundaryX
                // When x = boundaryX, z = 0
                const thresholdZ = boundaryX - 5.0; // center is at 5.0
                return (
                  <g
                    onPointerDown={(e) => handlePointerDown(e, "threshold")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="cursor-ew-resize"
                  >
                    {/* Vertical threshold guide line */}
                    <line
                      x1={scaleRightX(thresholdZ)}
                      y1={rightPlot.top}
                      x2={scaleRightX(thresholdZ)}
                      y2={rightPlot.bottom}
                      stroke={COLORS.pink}
                      strokeWidth={3}
                      strokeDasharray="4 3"
                    />
                    <circle cx={scaleRightX(thresholdZ)} cy={scaleRightY(0.5)} r={7} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={2} />
                    <text x={scaleRightX(thresholdZ) + 10} y={scaleRightY(0.5) - 6} fill={COLORS.pink} fontSize={9} fontWeight={800} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">
                      p = 0.5
                    </text>
                  </g>
                );
              })()}
            </g>

            {/* Data Points (rendered in Left space, mapped as stars in Right space) */}
            <g>
              {basePoints.map((p, idx) => {
                // Feature coordinates
                const lX = scaleLeftX(p.x);
                const lY = scaleLeftY(p.y);

                // Probability math
                const scoreZ = 1.6 * (p.x - boundaryX); // scale factor for visual span
                const prob = 1 / (1 + Math.exp(-scoreZ));

                // Uncertainty weight: 1 - 2*|prob - 0.5|
                const uncertainty = 1.0 - Math.abs(2.0 * prob - 1.0);
                const isMisclassified = (p.x >= boundaryX ? 1 : 0) !== p.label;

                // Shake horizontal offset if wiggling
                const shakeX = wiggling[idx] ? Math.sin(Date.now() * 0.05) * 3.5 : 0;

                return (
                  <g key={`pt-${idx}`}>
                    {/* LEFT PANEL representation */}
                    <g transform={`translate(${shakeX}, 0)`}>
                      {/* Uncertainty halo */}
                      {uncertainty > 0.05 && (
                        <circle
                          cx={lX}
                          cy={lY}
                          r={7 + uncertainty * 9}
                          fill="none"
                          stroke={p.label ? COLORS.pink : COLORS.cyan}
                          strokeWidth={2 + uncertainty * 6}
                          strokeOpacity={uncertainty * 0.5}
                        />
                      )}
                      <AnimatedPointMark
                        px={lX}
                        py={lY}
                        color={p.label ? COLORS.pink : COLORS.cyan}
                        r={isMisclassified ? 4.5 : 6}
                        label={isMisclassified ? "!" : undefined}
                      />
                    </g>

                    {/* RIGHT PANEL representation (projected score -> probability) */}
                    {scoreZ >= -5.0 && scoreZ <= 5.0 && (
                      <g>
                        {/* Projection line connecting score dot to curve */}
                        <line
                          x1={scaleRightX(scoreZ)}
                          y1={scaleRightY(prob)}
                          x2={scaleRightX(scoreZ)}
                          y2={rightPlot.bottom}
                          stroke={p.label ? COLORS.pink : COLORS.cyan}
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          opacity={0.5}
                        />
                        <circle
                          cx={scaleRightX(scoreZ)}
                          cy={scaleRightY(prob)}
                          r={5.5}
                          fill={p.label ? COLORS.pink : COLORS.cyan}
                          stroke={COLORS.bg}
                          strokeWidth={1.5}
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* SVG In-Plot Stats */}
            <g>
              {/* Classification accuracy */}
              <g transform="translate(440, 344)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={9} fontWeight={700}>CLASSIFICATION ACCURACY</text>
                <text data-testid="logistic-accuracy" x={12} y={36} fill={accuracy > 0.8 ? COLORS.cyan : COLORS.muted} fontSize={15} fontWeight={800}>
                  {(accuracy * 100).toFixed(0)}% ({correctCount}/{basePoints.length})
                </text>
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

          <div className="text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline mb-2">
            <p className="font-bold mb-1 text-primary">Direct Boundary Drag:</p>
            Drag the yellow <span className="text-yellow font-bold">decision boundary</span> in the left panel to classify feature space.
          </div>

          <div className="text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline">
            <p className="font-bold mb-1 text-primary">Sigmoid Threshold Drag:</p>
            Drag the dashed pink <span className="text-pink font-bold">threshold line</span> in the right panel to shift the sigmoid score cutoff.
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-2 text-xs">
            <MarkdownRenderer content={"Logistic regression takes a linear feature score and feeds it through the sigmoid function $1/(1+e^{-z})$ to map it to a probability $p \\in [0, 1]$. Points near the decision boundary represent high classification uncertainty."} />
          </div>
        </div>
      </div>
    </div>
  );
}
