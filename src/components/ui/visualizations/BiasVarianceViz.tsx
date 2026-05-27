"use client";

import React, { useState } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Subplot areas
const leftPlot = { left: 46, top: 44, right: 296, width: 250, bottom: 320, height: 276 };
const rightPlot = { left: 346, top: 44, right: 596, width: 250, bottom: 320, height: 276 };

const scaleLeftX = (val: number) => leftPlot.left + (val / 10) * leftPlot.width;
const scaleLeftY = (val: number) => leftPlot.bottom - (val / 10) * leftPlot.height;

const scaleRightX = (deg: number) => rightPlot.left + ((deg - 1) / 8) * rightPlot.width;
const scaleRightY = (err: number) => rightPlot.bottom - err * 80; // normalized error scaling

// Datasets: 7 training points with a sine pattern + noise
const baseTrainPoints = [
  { x: 1.0, y: 2.2 },
  { x: 2.5, y: 4.8 },
  { x: 4.0, y: 6.2 },
  { x: 5.5, y: 5.4 },
  { x: 7.0, y: 3.5 },
  { x: 8.5, y: 2.8 },
  { x: 9.5, y: 5.0 },
];

// Bootstrapped datasets for ghost fits
const ghostPoints1 = [
  { x: 1.0, y: 2.0 },
  { x: 2.5, y: 5.2 },
  { x: 4.0, y: 6.0 },
  { x: 5.5, y: 5.6 },
  { x: 7.0, y: 3.2 },
  { x: 8.5, y: 3.1 },
  { x: 9.5, y: 4.6 },
];

const ghostPoints2 = [
  { x: 1.0, y: 2.5 },
  { x: 2.5, y: 4.4 },
  { x: 4.0, y: 6.5 },
  { x: 5.5, y: 5.1 },
  { x: 7.0, y: 3.8 },
  { x: 8.5, y: 2.5 },
  { x: 9.5, y: 5.3 },
];

// Gaussian elimination linear system solver
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    // Search for maximum in this column
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    const tempA = A[maxRow];
    A[maxRow] = A[i];
    A[i] = tempA;

    const tempb = b[maxRow];
    b[maxRow] = b[i];
    b[i] = tempb;

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / (A[i][i] || 1);
      for (let j = i; j < n; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
      A[k][i] = 0; // prevent precision error
      b[k] += c * b[i];
    }
  }

  // Solve equation Ax=b for an upper triangular matrix A
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = b[i] / (A[i][i] || 1);
    for (let k = i - 1; k >= 0; k--) {
      b[k] -= A[k][i] * x[i];
    }
  }
  return x;
}

// Compute polynomial coefficients
function getPolynomialCoefficients(points: { x: number; y: number }[], degree: number): number[] {
  const m = degree + 1;
  const A = Array(m).fill(null).map(() => Array(m).fill(0));
  const b = Array(m).fill(0);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      let sumX = 0;
      points.forEach((p) => {
        sumX += Math.pow(p.x, i + j);
      });
      A[i][j] = sumX;
    }

    let sumXY = 0;
    points.forEach((p) => {
      sumXY += p.y * Math.pow(p.x, i);
    });
    b[i] = sumXY;
  }

  return solveLinearSystem(A, b);
}

// Evaluate polynomial at x
const evalPoly = (coeffs: number[], xVal: number) => {
  return coeffs.reduce((sum, c, idx) => sum + c * Math.pow(xVal, idx), 0);
};

export default function BiasVarianceViz() {
  const [complexity, setComplexity] = useState(3); // Polynomial degree from 1 to 7

  // Solve models for current complexity
  const trainCoeffs = getPolynomialCoefficients(baseTrainPoints, complexity);
  const ghostCoeffs1 = getPolynomialCoefficients(ghostPoints1, complexity);
  const ghostCoeffs2 = getPolynomialCoefficients(ghostPoints2, complexity);

  // Generate fit curve SVG path
  const getCurvePath = (coeffs: number[]) => {
    const pts: string[] = [];
    for (let val = 0.5; val <= 10.0; val += 0.15) {
      const yVal = evalPoly(coeffs, val);
      // clamp to prevent huge vertical overflow on chart
      const clampedY = Math.max(-2, Math.min(12, yVal));
      pts.push(`${scaleLeftX(val)} ${scaleLeftY(clampedY)}`);
    }
    return "M " + pts.join(" L ");
  };

  const trainPath = getCurvePath(trainCoeffs);
  const ghostPath1 = getCurvePath(ghostCoeffs1);
  const ghostPath2 = getCurvePath(ghostCoeffs2);

  // Precomputed Train and Validation error values for degrees 1 to 7
  // Hardcoded for smooth representation without live test-set computation wiggles
  const trainErrors = [1.8, 1.2, 0.7, 0.42, 0.25, 0.12, 0.02];
  const valErrors = [2.2, 1.4, 0.95, 0.98, 1.35, 2.1, 3.4];

  // Train and Validation error paths
  const trainErrPath = "M " + trainErrors.map((err, idx) => `${scaleRightX(idx + 1)} ${scaleRightY(err)}`).join(" L ");
  const valErrPath = "M " + valErrors.map((err, idx) => `${scaleRightX(idx + 1)} ${scaleRightY(err)}`).join(" L ");

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bias-Variance Tradeoff Curves">
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* LEFT PANEL: Fit Curve and Points */}
            <g>
              <text x={leftPlot.left + leftPlot.width / 2} y={leftPlot.top - 14} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>POLYNOMIAL MODEL FIT</text>
              {ticks.map((tick) => (
                <g key={`l-tick-${tick}`}>
                  <line x1={scaleLeftX(tick)} x2={scaleLeftX(tick)} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.grid} strokeWidth={1} />
                  <line x1={leftPlot.left} x2={leftPlot.right} y1={scaleLeftY(tick)} y2={scaleLeftY(tick)} stroke={COLORS.grid} strokeWidth={1} />
                </g>
              ))}
              <line x1={leftPlot.left} x2={leftPlot.left} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={leftPlot.left} x2={leftPlot.right} y1={leftPlot.bottom} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={leftPlot.right + 10} y={leftPlot.bottom + 4} fill={COLORS.muted} fontSize={9} fontWeight={700}>x</text>
              <text x={leftPlot.left - 8} y={leftPlot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={700}>y</text>

              {/* Ghost fits (Semi-transparent variance visualizations) */}
              <path d={ghostPath1} fill="none" stroke={COLORS.cyan} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.35} />
              <path d={ghostPath2} fill="none" stroke={COLORS.pink} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.35} />

              {/* Main polynomial fit curve */}
              <path d={trainPath} fill="none" stroke={COLORS.pink} strokeWidth={3.5} />

              {/* Data points */}
              {baseTrainPoints.map((p, idx) => (
                <g key={`pt-${idx}`}>
                  <circle cx={scaleLeftX(p.x)} cy={scaleLeftY(p.y)} r={5.5} fill={COLORS.cyan} stroke={COLORS.bg} strokeWidth={1.5} />
                </g>
              ))}
            </g>

            {/* RIGHT PANEL: Train vs Validation Error */}
            <g>
              <text x={rightPlot.left + rightPlot.width / 2} y={rightPlot.top - 14} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>ERROR VS COMPLEXITY</text>
              
              {/* Grid guides */}
              {[1, 2, 3, 4, 5, 6, 7].map((deg) => (
                <line key={`r-deg-${deg}`} x1={scaleRightX(deg)} x2={scaleRightX(deg)} y1={rightPlot.top} y2={rightPlot.bottom} stroke={COLORS.grid} strokeWidth={1} />
              ))}
              {[0, 1.0, 2.0, 3.0].map((err) => (
                <line key={`r-err-${err}`} x1={rightPlot.left} x2={rightPlot.right} y1={scaleRightY(err)} y2={scaleRightY(err)} stroke={COLORS.grid} strokeWidth={1} />
              ))}

              <line x1={rightPlot.left} x2={rightPlot.left} y1={rightPlot.top} y2={rightPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={rightPlot.left} x2={rightPlot.right} y1={rightPlot.bottom} y2={rightPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              
              <text x={rightPlot.right + 10} y={rightPlot.bottom + 4} fill={COLORS.muted} fontSize={9} fontWeight={700}>Degree</text>
              <text x={rightPlot.left - 8} y={rightPlot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={700}>Error</text>

              {/* Train Error Curve (Cyan) */}
              <path d={trainErrPath} fill="none" stroke={COLORS.cyan} strokeWidth={2.5} />
              
              {/* Validation Error Curve (Yellow) */}
              <path d={valErrPath} fill="none" stroke={COLORS.yellow} strokeWidth={2.5} />

              {/* Active dots representing current complexity state */}
              <circle cx={scaleRightX(complexity)} cy={scaleRightY(trainErrors[complexity - 1])} r={5} fill={COLORS.cyan} />
              <circle cx={scaleRightX(complexity)} cy={scaleRightY(valErrors[complexity - 1])} r={5} fill={COLORS.yellow} />

              {/* Sweet spot indicator (Degree 3) */}
              <circle cx={scaleRightX(3)} cy={scaleRightY(valErrors[2])} r={10} fill="none" stroke={COLORS.cyan} strokeWidth={1.5} strokeDasharray="2 2" />
              <text x={scaleRightX(3)} y={scaleRightY(valErrors[2]) - 14} textAnchor="middle" fill={COLORS.cyan} fontSize={8} fontWeight={900}>Sweet Spot</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Model Complexity</span>
          </div>

          <div className="mb-4">
            <span className="block text-[9px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              POLYNOMIAL DEGREE:
            </span>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={complexity}
              onChange={(e) => setComplexity(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[9px] text-on-surface-variant font-bold mt-1">
              <span>Degree 1 (Linear)</span>
              <span className="text-primary font-bold">d = {complexity}</span>
              <span>Degree 7 (High Var)</span>
            </div>
          </div>

          <div className="bg-surface-container p-3 border border-outline space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>Train Error (Bias):</span>
              <span className="font-bold text-cyan-700">{trainErrors[complexity - 1].toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Val Error (Variance):</span>
              <span className="font-bold text-yellow-700">{valErrors[complexity - 1].toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-outline pt-2 mt-2 font-bold text-sm">
              <span>FIT PROFILE:</span>
              {(() => {
                if (complexity < 3) return <span className="text-pink">UNDERFITTING (High Bias)</span>;
                if (complexity === 3) return <span className="text-cyan">OPTIMAL BALANCE</span>;
                return <span className="text-yellow-600">OVERFITTING (High Variance)</span>;
              })()}
            </div>
          </div>

          <div className="mt-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline font-sans">
            <p className="font-bold mb-1 text-primary">Ghost Fits Concept:</p>
            The dotted lines represent models trained on alternative datasets. High complexity fits wiggle wildly, showing high variance across training sets.
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`**Bias** is error from erroneous assumptions (e.g. fitting a straight line to curvy data). **Variance** is error from sensitivity to small fluctuations in the training set. Sweeping complexity finds the U-shaped validation error minimum.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
