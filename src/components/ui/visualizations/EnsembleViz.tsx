"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Subplot boundaries
const leftPlot = { left: 40, top: 44, right: 280, width: 240, bottom: 320, height: 276 };
const rightPlot = { left: 340, top: 44, right: 580, width: 240, bottom: 320, height: 276 };

// Coordinate scales
const scaleLeftX = (val: number) => leftPlot.left + (val / 10) * leftPlot.width;
const scaleLeftY = (val: number) => leftPlot.bottom - (val / 10) * leftPlot.height;
const invertLeftX = (px: number) => ((px - leftPlot.left) / leftPlot.width) * 10;
const invertLeftY = (py: number) => ((leftPlot.bottom - py) / leftPlot.height) * 10;

const scaleRightX = (idx: number) => rightPlot.left + 24 + idx * 42;
const scaleRightY = (errorVal: number) => rightPlot.bottom - errorVal * 200;

const basePoints = [
  { x: 1.2, y: 2.1, label: 0 },
  { x: 2.1, y: 3.4, label: 0 },
  { x: 3.5, y: 5.3, label: 0 },
  { x: 4.3, y: 4.5, label: 0 },
  { x: 5.8, y: 6.2, label: 1 },
  { x: 6.6, y: 5.7, label: 1 },
  { x: 7.7, y: 7.2, label: 1 },
  { x: 8.8, y: 8.1, label: 1 },
];

const stumps = [
  { dim: "x", value: 3.2, dir: 1, label: "x1 > 3.2" }, // x > 3.2 -> Class 1
  { dim: "y", value: 5.4, dir: -1, label: "x2 < 5.4" }, // y < 5.4 -> Class 1
  { dim: "x", value: 6.8, dir: 1, label: "x1 > 6.8" }, // x > 6.8 -> Class 1
  { dim: "y", value: 7.2, dir: -1, label: "x2 < 7.2" }, // y < 7.2 -> Class 1
  { dim: "x", value: 4.9, dir: -1, label: "x1 < 4.9" }, // x < 4.9 -> Class 1
] as const;

export default function EnsembleViz() {
  const [learnerCount, setLearnerCount] = useState(1);
  const [pulse, setPulse] = useState(false);

  // Trigger pulse highlight when count changes
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(t);
  }, [learnerCount]);

  // Compute ensemble prediction error at each stage (1 to 5)
  const getErrors = () => {
    const errs: number[] = [];
    for (let c = 1; c <= 5; c++) {
      let misclassified = 0;
      basePoints.forEach((p) => {
        const vote = stumps.slice(0, c).reduce((sum, stump) => {
          const feature = stump.dim === "x" ? p.x : p.y;
          const pred = stump.dir === 1 ? feature > stump.value : feature < stump.value;
          return sum + (pred ? 1 : -1);
        }, 0);
        const predLabel = vote >= 0 ? 1 : 0;
        if (predLabel !== p.label) misclassified++;
      });
      errs.push(misclassified / basePoints.length);
    }
    return errs;
  };

  const errors = getErrors();
  const currentError = errors[learnerCount - 1];

  // Render heatmap cells
  const stepSize = 14;
  const heatmap: React.ReactNode[] = [];
  for (let px = leftPlot.left; px < leftPlot.right; px += stepSize) {
    for (let py = leftPlot.top; py < leftPlot.bottom; py += stepSize) {
      const gx = invertLeftX(px + stepSize / 2);
      const gy = invertLeftY(py + stepSize / 2);

      // Ensemble voting
      const vote = stumps.slice(0, learnerCount).reduce((sum, stump) => {
        const feature = stump.dim === "x" ? gx : gy;
        const pred = stump.dir === 1 ? feature > stump.value : feature < stump.value;
        return sum + (pred ? 1 : -1);
      }, 0);

      const cellColor = vote >= 0 ? COLORS.pink : COLORS.cyan;
      const opacity = 0.04 + Math.abs(vote) * 0.038;

      heatmap.push(
        <rect
          key={`${px}-${py}`}
          x={px}
          y={py}
          width={stepSize}
          height={stepSize}
          fill={cellColor}
          fillOpacity={opacity}
        />
      );
    }
  }

  const leftTicks = [0, 2.5, 5, 7.5, 10];
  const rightTicksErr = [0, 0.2, 0.4, 0.6];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Ensemble Voting Boosting Surface"
          >
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* LEFT PANEL: Feature Space & Heatmap */}
            <g>
              {/* Heatmap background */}
              {heatmap}

              {/* Grid ticks */}
              {leftTicks.map((tick) => (
                <g key={`l-tick-${tick}`}>
                  <line x1={scaleLeftX(tick)} x2={scaleLeftX(tick)} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
                  <line x1={leftPlot.left} x2={leftPlot.right} y1={scaleLeftY(tick)} y2={scaleLeftY(tick)} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
                </g>
              ))}

              {/* Axes */}
              <line x1={leftPlot.left} x2={leftPlot.left} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={leftPlot.left} x2={leftPlot.right} y1={leftPlot.bottom} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />

              <text x={leftPlot.right + 8} y={leftPlot.bottom + 4} fill={COLORS.muted} fontSize={10} fontWeight={700}>x1</text>
              <text x={leftPlot.left - 8} y={leftPlot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={10} fontWeight={700}>x2</text>
              <text x={leftPlot.left + 5} y={leftPlot.top - 8} fill={COLORS.muted} fontSize={9} fontWeight={800}>VOTING HEATMAP</text>

              {/* Render Weak Stumps */}
              {stumps.slice(0, learnerCount).map((stump, idx) => {
                const isNewest = idx === learnerCount - 1;

                if (stump.dim === "y") {
                  // Horizontal cut
                  const settledY = scaleLeftY(stump.value);
                  return (
                    <motion.line
                      key={`stump-${idx}`}
                      x1={leftPlot.left}
                      x2={leftPlot.right}
                      y1={settledY}
                      y2={settledY}
                      stroke={COLORS.yellow}
                      strokeWidth={isNewest ? 3.5 : 1.5}
                      strokeDasharray={isNewest ? undefined : "3 3"}
                      initial={isNewest ? { y: -50 } : false}
                      animate={isNewest ? { y: 0 } : {}}
                      transition={{ type: "spring", stiffness: 100 }}
                    />
                  );
                } else {
                  // Vertical cut
                  const settledX = scaleLeftX(stump.value);
                  return (
                    <motion.line
                      key={`stump-${idx}`}
                      x1={settledX}
                      x2={settledX}
                      y1={leftPlot.top}
                      y2={leftPlot.bottom}
                      stroke={COLORS.yellow}
                      strokeWidth={isNewest ? 3.5 : 1.5}
                      strokeDasharray={isNewest ? undefined : "3 3"}
                      initial={isNewest ? { scaleY: 0 } : false}
                      animate={isNewest ? { scaleY: 1 } : {}}
                      style={{ transformOrigin: "top" }}
                      transition={{ duration: 0.5 }}
                    />
                  );
                }
              })}

              {/* Data points */}
              {basePoints.map((p, idx) => (
                <AnimatedPointMark key={`pt-${idx}`} px={scaleLeftX(p.x)} py={scaleLeftY(p.y)} color={p.label ? COLORS.pink : COLORS.cyan} r={5} />
              ))}
            </g>

            {/* RIGHT PANEL: Training Error Bar Chart */}
            <g>
              {/* Plot boundary */}
              <rect x={rightPlot.left} y={rightPlot.top} width={rightPlot.width} height={rightPlot.height} fill="none" stroke={COLORS.border} strokeDasharray="3 3" />
              <text x={rightPlot.left + 8} y={rightPlot.top - 8} fill={COLORS.muted} fontSize={9} fontWeight={800}>TRAINING ERROR PROFILE</text>

              {/* Error ticks */}
              {rightTicksErr.map((tick) => {
                const yPos = scaleRightY(tick);
                return (
                  <g key={`r-err-tick-${tick}`}>
                    <line x1={rightPlot.left} x2={rightPlot.right} y1={yPos} y2={yPos} stroke={COLORS.grid} strokeWidth={1} />
                    <text x={rightPlot.left - 8} y={yPos + 3} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={700}>
                      {(tick * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Error Bars for each learner stage */}
              {errors.map((err, idx) => {
                const isCurrent = idx === learnerCount - 1;
                const bx = scaleRightX(idx);
                const bh = err * 200; // 0% is at bottom, bh grows upwards
                const barWidth = 24;

                return (
                  <g key={`bar-${idx}`}>
                    <motion.rect
                      x={bx - barWidth / 2}
                      y={rightPlot.bottom - bh}
                      width={barWidth}
                      height={bh}
                      fill={isCurrent ? COLORS.pink : COLORS.muted}
                      fillOpacity={isCurrent ? 0.85 : 0.4}
                      stroke={isCurrent ? COLORS.pink : COLORS.border}
                      strokeWidth={1}
                      animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                    <text x={bx} y={rightPlot.bottom + 14} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700}>
                      M{idx + 1}
                    </text>
                    <text x={bx} y={rightPlot.bottom - bh - 6} textAnchor="middle" fill={isCurrent ? COLORS.pink : COLORS.muted} fontSize={8} fontWeight={800}>
                      {(err * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Ensemble Size</span>
          </div>

          <div className="mb-3">
            <span className="block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              Weak Learners (Stumps):
            </span>
            <div className="flex items-center gap-2 bg-surface-container p-2 border border-outline">
              <button
                onClick={() => setLearnerCount((prev) => Math.max(1, prev - 1))}
                disabled={learnerCount <= 1}
                className="h-7 w-7 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer disabled:opacity-30"
              >
                -
              </button>
              <span className="font-bold text-primary text-center w-24">
                {learnerCount} Stumps
              </span>
              <button
                onClick={() => setLearnerCount((prev) => Math.min(5, prev + 1))}
                disabled={learnerCount >= 5}
                className="h-7 w-7 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline">
            <p className="font-bold mb-1 text-primary">Visual Concept:</p>
            Add stumps using <span className="text-primary font-bold">+</span>. Watch each vertical or horizontal decision split drop from above and settle, as the error bar graph shrinks toward zero!
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-2 block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">
            CURRENT ENSEMBLE SUMMARY
          </div>
          <div className="bg-surface-container p-3 border border-outline space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>Weak Learners:</span>
              <span className="font-bold text-primary">{learnerCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Formula:</span>
              <span className="font-bold text-yellow-600">
                sign(Σ Stump_i)
              </span>
            </div>
            <div className="flex justify-between border-t border-outline pt-2 mt-2 font-bold text-sm">
              <span>TRAINING ERROR:</span>
              <span className={currentError === 0 ? "text-cyan" : "text-pink"}>
                {(currentError * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
