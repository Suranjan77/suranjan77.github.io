"use client";

import React, { useState } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  Vector,
  MiniStat,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Subplot boundaries
const leftPlot = { left: 46, top: 44, right: 296, width: 250, bottom: 240, height: 196 };
const rightPlot = { left: 356, top: 44, right: 576, width: 220, bottom: 240, height: 196 };

const scaleLeftX = (val: number) => leftPlot.left + (val / 10) * leftPlot.width;
const scaleLeftY = (val: number) => leftPlot.bottom - val * 24;

const scaleRightX = (fpr: number) => rightPlot.left + fpr * rightPlot.width;
const scaleRightY = (tpr: number) => rightPlot.bottom - tpr * rightPlot.height;

// Normal distribution CDF approximation (logistic sigmoid approximation)
const cdf = (x: number, mu: number, sigma: number) => {
  return 1 / (1 + Math.exp(-1.6 * (x - mu) / sigma));
};

const pdf = (x: number, mu: number, sigma: number) => {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
};

export default function EvaluationMetricsViz() {
  const [threshold, setThreshold] = useState(5.0); // draggable threshold from 1.0 to 9.0
  const [isDragging, setIsDragging] = useState(false);

  const muNeg = 3.6;
  const muPos = 6.4;
  const sigma = 1.35;

  // Drag handlers
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
    if (!svgCoords) return;

    const unitsX = Math.max(1.0, Math.min(9.0, ((svgCoords.x - leftPlot.left) / leftPlot.width) * 10));
    setThreshold(unitsX);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // Math metrics for 100 positive / 100 negative examples
  // False Positive Rate = P(score >= T | negative class) = 1 - cdf(T)
  const fpr = 1 - cdf(threshold, muNeg, sigma);
  // True Positive Rate (Recall) = P(score >= T | positive class) = 1 - cdf(T)
  const tpr = 1 - cdf(threshold, muPos, sigma);

  const tp = Math.round(100 * tpr);
  const fp = Math.round(100 * fpr);
  const fn = 100 - tp;
  const tn = 100 - fp;

  const precision = tp / Math.max(1, tp + fp);
  const f1 = (2 * precision * tpr) / Math.max(0.01, precision + tpr);

  // Generate paths for pdf curves
  const getPdfPath = (mu: number, sig: number) => {
    const pts: string[] = [];
    for (let x = 0.2; x <= 9.85; x += 0.15) {
      pts.push(`${scaleLeftX(x)} ${scaleLeftY(pdf(x, mu, sig) * 7.5)}`);
    }
    return "M " + pts.join(" L ");
  };

  const negPdfPath = getPdfPath(muNeg, sigma);
  const posPdfPath = getPdfPath(muPos, sigma);

  // Generate ROC curve path
  const getRocPath = () => {
    const pts: string[] = [];
    for (let t = 0.0; t <= 10.05; t += 0.2) {
      const f = 1 - cdf(t, muNeg, sigma);
      const y = 1 - cdf(t, muPos, sigma);
      pts.push(`${scaleRightX(f)} ${scaleRightY(y)}`);
    }
    return "M " + pts.join(" L ");
  };

  const rocPath = getRocPath();

  // Shaded area paths for confusion matrix categories
  const getShadedPath = (mu: number, sig: number, from: number, to: number) => {
    const pts: string[] = [];
    pts.push(`${scaleLeftX(from)} ${scaleLeftY(0)}`);
    for (let x = from; x <= to; x += 0.15) {
      pts.push(`${scaleLeftX(x)} ${scaleLeftY(pdf(x, mu, sig) * 7.5)}`);
    }
    pts.push(`${scaleLeftX(to)} ${scaleLeftY(0)}`);
    return "M " + pts.join(" L ") + " Z";
  };

  const tnShaded = getShadedPath(muNeg, sigma, 0.2, threshold);
  const fpShaded = getShadedPath(muNeg, sigma, threshold, 9.8);
  const fnShaded = getShadedPath(muPos, sigma, 0.2, threshold);
  const tpShaded = getShadedPath(muPos, sigma, threshold, 9.8);

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evaluation Metrics Overlapping Distributions">
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* LEFT PLOT: overlapping class distributions */}
            <g>
              <text x={leftPlot.left + leftPlot.width / 2} y={leftPlot.top - 14} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>CLASSIFIER SCORE DISTRIBUTIONS</text>
              
              {/* Shaded classification regions */}
              <path d={tnShaded} fill={COLORS.pink} fillOpacity={0.1} />
              <path d={fpShaded} fill={COLORS.pink} fillOpacity={0.3} stroke={COLORS.pink} strokeWidth={1} strokeDasharray="2 2" />
              <path d={fnShaded} fill={COLORS.cyan} fillOpacity={0.3} stroke={COLORS.cyan} strokeWidth={1} strokeDasharray="2 2" />
              <path d={tpShaded} fill={COLORS.cyan} fillOpacity={0.1} />

              {/* PDF outlines */}
              <path d={negPdfPath} fill="none" stroke={COLORS.pink} strokeWidth={2.5} />
              <path d={posPdfPath} fill="none" stroke={COLORS.cyan} strokeWidth={2.5} />

              {/* Grid axes */}
              <line x1={leftPlot.left} x2={leftPlot.left} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={leftPlot.left} x2={leftPlot.right} y1={leftPlot.bottom} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              
              <text x={leftPlot.left + 50} y={scaleLeftY(2.2)} fill={COLORS.pink} fontSize={9} fontWeight={900}>NEGATIVES (0)</text>
              <text x={leftPlot.left + 160} y={scaleLeftY(2.2)} fill={COLORS.cyan} fontSize={9} fontWeight={900}>POSITIVES (1)</text>

              <text x={leftPlot.right + 10} y={leftPlot.bottom + 4} fill={COLORS.muted} fontSize={9} fontWeight={700}>Score</text>
              <text x={leftPlot.left - 8} y={leftPlot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={700}>Density</text>

              {/* Draggable Threshold Line */}
              <g
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-ew-resize"
              >
                <line
                  x1={scaleLeftX(threshold)}
                  y1={leftPlot.top}
                  x2={scaleLeftX(threshold)}
                  y2={leftPlot.bottom}
                  stroke={COLORS.yellow}
                  strokeWidth={4.5}
                />
                <circle cx={scaleLeftX(threshold)} cy={leftPlot.top + leftPlot.height / 2} r={7} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2} />
                <text x={scaleLeftX(threshold)} y={leftPlot.top - 6} textAnchor="middle" fill={COLORS.yellow} fontSize={9} fontWeight={900} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">T = {threshold.toFixed(2)}</text>
              </g>
            </g>

            {/* RIGHT PLOT: ROC Curve */}
            <g>
              <text x={rightPlot.left + rightPlot.width / 2} y={rightPlot.top - 14} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>ROC CURVE</text>
              
              {/* Diagonal baseline */}
              <line x1={scaleRightX(0)} y1={scaleRightY(0)} x2={scaleRightX(1)} y2={scaleRightY(1)} stroke={COLORS.grid} strokeWidth={1} strokeDasharray="3 3" />
              
              <line x1={rightPlot.left} x2={rightPlot.left} y1={rightPlot.top} y2={rightPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={rightPlot.left} x2={rightPlot.right} y1={rightPlot.bottom} y2={rightPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              
              <text x={rightPlot.right + 10} y={rightPlot.bottom + 4} fill={COLORS.muted} fontSize={9} fontWeight={700}>FPR</text>
              <text x={rightPlot.left - 8} y={rightPlot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={700}>TPR</text>

              {/* ROC Curve path */}
              <path d={rocPath} fill="none" stroke={COLORS.cyan} strokeWidth={2.5} />

              {/* Active ROC coordinate point */}
              <circle cx={scaleRightX(fpr)} cy={scaleRightY(tpr)} r={6.5} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1.5} />
              <text x={scaleRightX(fpr) + 12} y={scaleRightY(tpr) - 6} fill={COLORS.yellow} fontSize={8} fontWeight={900} stroke={COLORS.bg} strokeWidth={2} paintOrder="stroke">
                ({fpr.toFixed(2)}, {tpr.toFixed(2)})
              </text>
            </g>

            {/* Bottom Panel: Confusion Matrix (Left) & Metrics (Right) */}
            <g transform="translate(46, 276)">
              {/* Confusion Matrix */}
              <g>
                <rect width={250} height={100} fill="none" stroke={COLORS.border} strokeDasharray="3 3" />
                <text x={12} y={16} fill={COLORS.muted} fontSize={9} fontWeight={800}>CONFUSION MATRIX (N=200)</text>

                {/* TP */}
                <rect x={12} y={26} width={50} height={30} fill="rgba(85,107,74,0.1)" stroke={COLORS.grid} />
                <text x={37} y={38} textAnchor="middle" fill={COLORS.muted} fontSize={7} fontWeight={700}>TP (True +)</text>
                <text data-testid="metrics-tp" x={37} y={52} textAnchor="middle" fill={COLORS.cyan} fontSize={11} fontWeight={900}>{tp}</text>

                {/* FP */}
                <rect x={68} y={26} width={50} height={30} fill="rgba(141,81,73,0.3)" stroke={COLORS.grid} />
                <text x={93} y={38} textAnchor="middle" fill={COLORS.muted} fontSize={7} fontWeight={700}>FP (False +)</text>
                <text data-testid="metrics-fp" x={93} y={52} textAnchor="middle" fill={COLORS.pink} fontSize={11} fontWeight={900}>{fp}</text>

                {/* FN */}
                <rect x={12} y={62} width={50} height={30} fill="rgba(85,107,74,0.3)" stroke={COLORS.grid} />
                <text x={37} y={74} textAnchor="middle" fill={COLORS.muted} fontSize={7} fontWeight={700}>FN (False -)</text>
                <text data-testid="metrics-fn" x={37} y={88} textAnchor="middle" fill={COLORS.cyan} fontSize={11} fontWeight={900}>{fn}</text>

                {/* TN */}
                <rect x={68} y={62} width={50} height={30} fill="rgba(141,81,73,0.1)" stroke={COLORS.grid} />
                <text x={93} y={74} textAnchor="middle" fill={COLORS.muted} fontSize={7} fontWeight={700}>TN (True -)</text>
                <text data-testid="metrics-tn" x={93} y={88} textAnchor="middle" fill={COLORS.pink} fontSize={11} fontWeight={900}>{tn}</text>
              </g>

              {/* Metrics Stats Readouts */}
              <g transform="translate(310, 0)">
                <rect width={220} height={100} fill="rgba(250,248,242,0.85)" stroke={COLORS.border} rx={2} />
                
                <text x={12} y={22} fill={COLORS.muted} fontSize={8} fontWeight={800}>PRECISION:</text>
                <text data-testid="metrics-precision" x={12} y={42} fill={COLORS.pink} fontSize={14} fontWeight={900}>{(precision * 100).toFixed(1)}%</text>

                <text x={110} y={22} fill={COLORS.muted} fontSize={8} fontWeight={800}>RECALL (TPR):</text>
                <text data-testid="metrics-recall" x={110} y={42} fill={COLORS.cyan} fontSize={14} fontWeight={900}>{(tpr * 100).toFixed(1)}%</text>

                <text x={12} y={70} fill={COLORS.muted} fontSize={8} fontWeight={800}>F1 SCORE:</text>
                <text data-testid="metrics-f1" x={12} y={90} fill={COLORS.yellow} fontSize={14} fontWeight={900}>{(f1 * 100).toFixed(1)}%</text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Decision Boundary</span>
          </div>

          <div className="mb-4">
            <span className="block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              SLIDE THRESHOLD:
            </span>
            <input
              type="range"
              min="1.0"
              max="9.0"
              step="0.1"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] text-on-surface-variant font-bold mt-1">
              <span>T = 1.0 (Recall focus)</span>
              <span className="text-primary font-bold">T = {threshold.toFixed(1)}</span>
              <span>T = 9.0 (Precision focus)</span>
            </div>
          </div>

          <div className="mt-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline font-sans">
            <p className="font-bold mb-1 text-primary">Interactivity tradeoff:</p>
            - Slide threshold **left**: Recall increases (more True Positives found), but Precision drops (more False Positives slip through). <br />
            - Slide threshold **right**: Precision increases, but Recall drops.
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Classification performance is defined by the **threshold** that divides predicted positives from negatives. Moving the threshold updates the **Confusion Matrix** (TP, FP, TN, FN) and traces the trade-offs on the **Receiver Operating Characteristic (ROC)** curve.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
