"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  COLORS,
  ControlPanel,
  PlotFrame,
  VisualizationShell,
  NativeCanvasPlot,
  drawHelper,
} from "../visualizationPrimitives";

const plotConfig = {
  left: 40,
  right: 296,
  top: 24,
  bottom: 190,
  width: 256,
  height: 166,
};

// Map coordinates to 0..10 domain
const toXPixel = (x: number) => plotConfig.left + (x / 10) * plotConfig.width;
const toYPixel = (y: number) => plotConfig.bottom - (y / 10) * plotConfig.height;
const fromXPixel = (x: number) => ((x - plotConfig.left) / plotConfig.width) * 10;
const fromYPixel = (y: number) => ((plotConfig.bottom - y) / plotConfig.height) * 10;

// Dynamic SMO Solver for Linear SVM
function solveLinearSVM(
  points: Array<{ x: number; y: number; label: "A" | "B" }>,
  C: number
) {
  const N = points.length;
  const hasA = points.some((p) => p.label === "A");
  const hasB = points.some((p) => p.label === "B");

  if (N < 2 || !hasA || !hasB) return null;

  const X = points.map((p) => [p.x, p.y]);
  const Y = points.map((p) => (p.label === "A" ? 1 : -1));

  const alpha = new Array(N).fill(0);
  let b = 0;
  const tol = 1e-3;
  const maxPasses = 10;
  let passes = 0;
  let iter = 0;
  const maxIter = 150;

  const dot = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1];

  while (passes < maxPasses && iter < maxIter) {
    iter++;
    let numChangedAlphas = 0;

    for (let i = 0; i < N; i++) {
      // f(x_i) = sum_j alpha_j * y_j * (x_j . x_i) + b
      let f_i = b;
      for (let j = 0; j < N; j++) {
        f_i += alpha[j] * Y[j] * dot(X[j], X[i]);
      }
      const E_i = f_i - Y[i];

      if ((Y[i] * E_i < -tol && alpha[i] < C) || (Y[i] * E_i > tol && alpha[i] > 0)) {
        // Choose random j != i
        let j = Math.floor(Math.random() * (N - 1));
        if (j >= i) j++;

        let f_j = b;
        for (let k = 0; k < N; k++) {
          f_j += alpha[k] * Y[k] * dot(X[k], X[j]);
        }
        const E_j = f_j - Y[j];

        const alphaI_old = alpha[i];
        const alphaJ_old = alpha[j];

        let L = 0;
        let H = C;
        if (Y[i] !== Y[j]) {
          L = Math.max(0, alpha[j] - alpha[i]);
          H = Math.min(C, C + alpha[j] - alpha[i]);
        } else {
          L = Math.max(0, alpha[i] + alpha[j] - C);
          H = Math.min(C, alpha[i] + alpha[j]);
        }

        if (Math.abs(L - H) < 1e-4) continue;

        const eta = 2 * dot(X[i], X[j]) - dot(X[i], X[i]) - dot(X[j], X[j]);
        if (eta >= 0) continue;

        let alphaJ_new = alpha[j] - (Y[j] * (E_i - E_j)) / eta;
        if (alphaJ_new > H) alphaJ_new = H;
        else if (alphaJ_new < L) alphaJ_new = L;

        if (Math.abs(alphaJ_new - alphaJ_old) < 1e-5) continue;

        alpha[j] = alphaJ_new;
        const alphaI_new = alpha[i] + Y[i] * Y[j] * (alphaJ_old - alphaJ_new);
        alpha[i] = alphaI_new;

        const b1 =
          b - E_i - Y[i] * (alpha[i] - alphaI_old) * dot(X[i], X[i]) - Y[j] * (alpha[j] - alphaJ_old) * dot(X[i], X[j]);
        const b2 =
          b - E_j - Y[i] * (alpha[i] - alphaI_old) * dot(X[i], X[j]) - Y[j] * (alpha[j] - alphaJ_old) * dot(X[j], X[j]);

        if (alpha[i] > 1e-4 && alpha[i] < C - 1e-4) b = b1;
        else if (alpha[j] > 1e-4 && alpha[j] < C - 1e-4) b = b2;
        else b = (b1 + b2) / 2;

        numChangedAlphas++;
      }
    }

    if (numChangedAlphas === 0) passes++;
    else passes = 0;
  }

  // Compute final weights
  let w1 = 0;
  let w2 = 0;
  for (let i = 0; i < N; i++) {
    w1 += alpha[i] * Y[i] * X[i][0];
    w2 += alpha[i] * Y[i] * X[i][1];
  }

  return { w: [w1, w2], b, alpha };
}

// Find intersections of line: w1*x + w2*y + b = 0 with boundaries of the [0,10] box
function getLineIntersectionPoints(
  w: number[],
  b: number,
  minX = 0,
  maxX = 10,
  minY = 0,
  maxY = 10
) {
  const pts: Array<{ x: number; y: number }> = [];
  const w1 = w[0];
  const w2 = w[1];

  if (Math.abs(w1) < 1e-9 && Math.abs(w2) < 1e-9) return null;

  // x = minX
  if (Math.abs(w2) > 1e-9) {
    const y = -(w1 * minX + b) / w2;
    if (y >= minY && y <= maxY) pts.push({ x: minX, y });
  }
  // x = maxX
  if (Math.abs(w2) > 1e-9) {
    const y = -(w1 * maxX + b) / w2;
    if (y >= minY && y <= maxY) pts.push({ x: maxX, y });
  }
  // y = minY
  if (Math.abs(w1) > 1e-9) {
    const x = -(w2 * minY + b) / w1;
    if (x >= minX && x <= maxX) pts.push({ x, y: minY });
  }
  // y = maxY
  if (Math.abs(w1) > 1e-9) {
    const x = -(w2 * maxY + b) / w1;
    if (x >= minX && x <= maxX) pts.push({ x, y: maxY });
  }

  // Deduplicate points
  const uniquePts: Array<{ x: number; y: number }> = [];
  pts.forEach((p) => {
    if (!uniquePts.some((u) => Math.abs(u.x - p.x) < 1e-5 && Math.abs(u.y - p.y) < 1e-5)) {
      uniquePts.push(p);
    }
  });

  if (uniquePts.length >= 2) {
    return [uniquePts[0], uniquePts[1]];
  }
  return null;
}

// Helper to sort polygon points clockwise to prevent visual self-intersections
function sortClockwise(pts: Array<{ x: number; y: number }>) {
  if (pts.length < 3) return pts;
  let cx = 0, cy = 0;
  pts.forEach((p) => {
    cx += p.x;
    cy += p.y;
  });
  cx /= pts.length;
  cy /= pts.length;

  return [...pts].sort((a, b) => {
    return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);
  });
}

export default function SvmVisualization() {
  const [points, setPoints] = useState<Array<{ x: number; y: number; label: "A" | "B" }>>([
    { x: 2.2, y: 7.2, label: "A" },
    { x: 3.5, y: 8.5, label: "A" },
    { x: 2.8, y: 5.8, label: "A" },
    { x: 4.2, y: 6.8, label: "A" },
    { x: 5.8, y: 3.2, label: "B" },
    { x: 7.2, y: 4.2, label: "B" },
    { x: 6.5, y: 1.8, label: "B" },
    { x: 7.9, y: 2.8, label: "B" },
  ]);
  const [activeLabel, setActiveLabel] = useState<"A" | "B">("A");
  const [C, setC] = useState<number>(10);

  // Solve SVM
  const svmSolveResult = useMemo(() => {
    return solveLinearSVM(points, C);
  }, [points, C]);

  // Calculate actual margin size 1 / ||w||
  const marginSize = useMemo(() => {
    if (!svmSolveResult) return 0;
    const { w } = svmSolveResult;
    const normSq = w[0] * w[0] + w[1] * w[1];
    if (normSq < 1e-8) return 0;
    return 1 / Math.sqrt(normSq);
  }, [svmSolveResult]);

  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawHelper.axes(ctx, 320, 220);

      if (svmSolveResult) {
        const { w, b } = svmSolveResult;

        // Find boundary points of lines: w^T x + b = 0, w^T x + b = 1, w^T x + b = -1
        const centerPts = getLineIntersectionPoints(w, b);
        const upperPts = getLineIntersectionPoints(w, b - 1);
        const lowerPts = getLineIntersectionPoints(w, b + 1);

        // Draw Gutter shading
        if (upperPts && lowerPts) {
          const gutterPts = sortClockwise([...upperPts, ...lowerPts]);
          ctx.save();
          ctx.fillStyle = "rgba(141, 81, 73, 0.08)";
          ctx.beginPath();
          ctx.moveTo(toXPixel(gutterPts[0].x), toYPixel(gutterPts[0].y));
          for (let i = 1; i < gutterPts.length; i++) {
            ctx.lineTo(toXPixel(gutterPts[i].x), toYPixel(gutterPts[i].y));
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Draw optimal hyperplane decision boundary
        if (centerPts) {
          drawHelper.line(
            ctx,
            toXPixel(centerPts[0].x),
            toYPixel(centerPts[0].y),
            toXPixel(centerPts[1].x),
            toYPixel(centerPts[1].y),
            COLORS.muted,
            2.5
          );
        }

        // Draw upper and lower margin bounds
        if (upperPts) {
          drawHelper.line(
            ctx,
            toXPixel(upperPts[0].x),
            toYPixel(upperPts[0].y),
            toXPixel(upperPts[1].x),
            toYPixel(upperPts[1].y),
            COLORS.muted,
            1.2,
            [5, 4]
          );
        }
        if (lowerPts) {
          drawHelper.line(
            ctx,
            toXPixel(lowerPts[0].x),
            toYPixel(lowerPts[0].y),
            toXPixel(lowerPts[1].x),
            toYPixel(lowerPts[1].y),
            COLORS.muted,
            1.2,
            [5, 4]
          );
        }
      }

      // Draw observation points
      points.forEach((p, idx) => {
        const px = toXPixel(p.x);
        const py = toYPixel(p.y);

        // Circle support vectors: alpha[idx] > 1e-4
        const isSupportVector = svmSolveResult && svmSolveResult.alpha[idx] > 1e-4;

        if (isSupportVector) {
          ctx.save();
          ctx.strokeStyle = COLORS.yellow;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, 9.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        drawHelper.point(ctx, px, py, p.label === "A" ? COLORS.cyan : COLORS.pink, "reticle", 5.5);
      });
    },
    [points, svmSolveResult]
  );

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    // Boundary lock check
    if (dataX >= 0.5 && dataX <= 9.5 && dataY >= 0.5 && dataY <= 9.5) {
      setPoints((curr) => [...curr, { x: dataX, y: dataY, label: activeLabel }]);
    }
  };

  const handleReset = () => {
    setPoints([
      { x: 2.2, y: 7.2, label: "A" },
      { x: 3.5, y: 8.5, label: "A" },
      { x: 2.8, y: 5.8, label: "A" },
      { x: 4.2, y: 6.8, label: "A" },
      { x: 5.8, y: 3.2, label: "B" },
      { x: 7.2, y: 4.2, label: "B" },
      { x: 6.5, y: 1.8, label: "B" },
      { x: 7.9, y: 2.8, label: "B" },
    ]);
    setActiveLabel("A");
    setC(10);
  };

  const handleClear = () => {
    setPoints([]);
  };

  return (
    <VisualizationShell
      title="Hyperplane Margins & Support Vectors (SVM)"
      subtitle="Click Mode to choose Class A or B, then click the grid workspace to place custom nodes. Adjust C to allow margin slack vs strict separation."
      insight="Only observations lying on the margin boundaries (support vectors) determine the separating boundary. Moving other points has zero effect."
      legend={[
        { label: "Hyperplane", color: COLORS.muted },
        { label: "Margin Gutter", color: "rgba(141, 81, 73, 0.15)" },
        { label: "Support Vector Target", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot
            onDraw={onDraw}
            onClick={handlePlotClick}
            className="h-full w-full cursor-crosshair"
          />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click plot space to place observations]
          </div>

          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs flex flex-col gap-0.5">
            <div>
              Optimal Gutter Width (d):{" "}
              <span className="font-bold text-pink">
                {marginSize > 0 ? marginSize.toFixed(3) : "No boundary"}
              </span>
            </div>
            {!svmSolveResult && (
              <div className="text-[8px] text-error font-bold tracking-tight lowercase">
                * Place both classes to solve boundary
              </div>
            )}
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Class Placement</span>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setActiveLabel("A")}
                className={`flex-1 border px-3 py-2 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  activeLabel === "A" ? "bg-cyan text-on-primary border-cyan" : "bg-surface hover:bg-cyan/10"
                }`}
              >
                Class A (Cyan)
              </button>
              <button
                onClick={() => setActiveLabel("B")}
                className={`flex-1 border px-3 py-2 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  activeLabel === "B" ? "bg-pink text-on-primary border-pink" : "bg-surface hover:bg-pink/10"
                }`}
              >
                Class B (Pink)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Penalty Cost (C)</span>
              <span className="text-pink font-bold">{C}</span>
            </div>
            <p className="text-[9px] text-on-surface-variant leading-relaxed font-normal">
              Lower C increases margin width (tolerating classification errors). Higher C enforces strict separation boundaries.
            </p>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={C}
              onChange={(e) => setC(parseFloat(e.target.value))}
              className="mt-1 w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 border border-outline rounded bg-surface-container text-on-surface px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Reset Default
            </button>
            <button
              onClick={handleClear}
              className="flex-1 border border-outline rounded bg-surface-container text-on-surface px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-error/10 hover:text-error hover:border-error/40 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Clear Space
            </button>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
