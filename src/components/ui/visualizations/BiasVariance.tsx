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

const toXPixel = (x: number) => plotConfig.left + (x / 10) * plotConfig.width;
const toYPixel = (y: number) => plotConfig.bottom - (y / 10) * plotConfig.height;
const fromXPixel = (x: number) => ((x - plotConfig.left) / plotConfig.width) * 10;
const fromYPixel = (y: number) => ((plotConfig.bottom - y) / plotConfig.height) * 10;

function solveGaussian(A: number[][], b: number[]) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(M[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > maxEl) {
        maxEl = Math.abs(M[k][i]);
        maxRow = k;
      }
    }

    const temp = M[maxRow];
    M[maxRow] = M[i];
    M[i] = temp;

    if (Math.abs(M[i][i]) < 1e-12) {
      return new Array(n).fill(0);
    }

    for (let k = i + 1; k < n; k++) {
      const c = -M[k][i] / M[i][i];
      for (let j = i; j < n + 1; j++) {
        if (i === j) {
          M[k][j] = 0;
        } else {
          M[k][j] += c * M[i][j];
        }
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n] / M[i][i];
    for (let k = i - 1; k >= 0; k--) {
      M[k][n] -= M[k][i] * x[i];
    }
  }
  return x;
}

function solvePolynomialRegression(
  pts: Array<{ x: number; y: number }>,
  degree: number
) {
  const N = pts.length;
  const D = degree + 1;

  if (N === 0) return null;

  const X_poly = pts.map((p) => {
    const row = [];
    for (let d = 0; d < D; d++) {
      row.push(Math.pow(p.x, d));
    }
    return row;
  });

  const y = pts.map((p) => p.y);

  const A = Array.from({ length: D }, () => new Array(D).fill(0));
  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += X_poly[k][i] * X_poly[k][j];
      }
      A[i][j] = sum;
    }
  }

  for (let i = 0; i < D; i++) {
    A[i][i] += 1e-5;
  }

  const b = new Array(D).fill(0);
  for (let i = 0; i < D; i++) {
    let sum = 0;
    for (let k = 0; k < N; k++) {
      sum += X_poly[k][i] * y[k];
    }
    b[i] = sum;
  }

  return solveGaussian(A, b);
}

function evaluatePoly(w: number[], x: number) {
  let y = 0;
  for (let d = 0; d < w.length; d++) {
    y += w[d] * Math.pow(x, d);
  }
  return y;
}

export default function BiasVarianceVisualization() {
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([
    { x: 1.5, y: 3.2 },
    { x: 2.8, y: 5.1 },
    { x: 3.8, y: 4.8 },
    { x: 4.8, y: 6.9 },
    { x: 6.2, y: 5.8 },
    { x: 7.8, y: 8.2 },
    { x: 8.9, y: 7.5 },
  ]);
  const [degree, setDegree] = useState<number>(3);

  const polyWeights = useMemo(() => {
    return solvePolynomialRegression(points, degree);
  }, [points, degree]);

  const errors = useMemo(() => {
    const N = points.length;
    if (N === 0) return { trainErr: 0, valErr: 0 };

    let trainSumSq = 0;
    if (polyWeights) {
      points.forEach((p) => {
        const yHat = evaluatePoly(polyWeights, p.x);
        trainSumSq += Math.pow(p.y - yHat, 2);
      });
    }
    const trainErr = trainSumSq / N;

    let valSumSq = 0;
    let validFolds = 0;
    for (let i = 0; i < N; i++) {
      const trainSet = points.filter((_, idx) => idx !== i);
      const subWeights = solvePolynomialRegression(trainSet, degree);
      if (subWeights) {
        const leftOutPoint = points[i];
        const yHat = evaluatePoly(subWeights, leftOutPoint.x);
        valSumSq += Math.pow(leftOutPoint.y - yHat, 2);
        validFolds++;
      }
    }
    const valErr = validFolds > 0 ? valSumSq / validFolds : 0;

    return { trainErr, valErr };
  }, [points, degree, polyWeights]);

  const errorCurves = useMemo(() => {
    const N = points.length;
    if (N < 3) return null;

    const curveData = [];
    for (let d = 1; d <= 7; d++) {
      let tSum = 0;
      let vSum = 0;
      let vCount = 0;

      const mainW = solvePolynomialRegression(points, d);
      if (mainW) {
        points.forEach((p) => {
          tSum += Math.pow(p.y - evaluatePoly(mainW, p.x), 2);
        });
      }

      for (let i = 0; i < N; i++) {
        const subSet = points.filter((_, idx) => idx !== i);
        const subW = solvePolynomialRegression(subSet, d);
        if (subW) {
          vSum += Math.pow(points[i].y - evaluatePoly(subW, points[i].x), 2);
          vCount++;
        }
      }

      curveData.push({
        d,
        train: tSum / N,
        val: vCount > 0 ? vSum / vCount : 0,
      });
    }
    return curveData;
  }, [points]);

  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawHelper.axes(ctx, 320, 220);

      // Draw fitted regression line
      if (polyWeights && points.length > 0) {
        const curvePoints = [];
        const stepsCount = 100;
        for (let i = 0; i <= stepsCount; i++) {
          const xVal = (i / stepsCount) * 10;
          const yVal = evaluatePoly(polyWeights, xVal);
          if (yVal >= 0 && yVal <= 10) {
            curvePoints.push({ x: toXPixel(xVal), y: toYPixel(yVal) });
          }
        }
        ctx.save();
        ctx.strokeStyle = COLORS.pink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        if (curvePoints.length > 1) {
          ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
          for (let i = 1; i < curvePoints.length; i++) {
            ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw coordinates
      points.forEach((p) => {
        const px = toXPixel(p.x);
        const py = toYPixel(p.y);
        drawHelper.point(ctx, px, py, COLORS.cyan, "circle", 5.5);
      });

      drawHelper.cropMarks(ctx, 320, 220);
    },
    [points, polyWeights]
  );

  // Draws training vs validation error in the side panel
  const onDrawMiniChart = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawHelper.cropMarks(ctx, 180, 90);

      if (!errorCurves || errorCurves.length === 0) {
        ctx.fillStyle = COLORS.muted;
        ctx.font = "8px var(--font-mono)";
        ctx.textAlign = "center";
        ctx.fillText("[Place 3+ points to view curve]", 90, 45);
        return;
      }

      const chartX = 15;
      const chartY = 10;
      const chartW = 150;
      const chartH = 65;

      let maxErr = 1.0;
      errorCurves.forEach((c) => {
        if (c.train < 25 && c.train > maxErr) maxErr = c.train;
        if (c.val < 25 && c.val > maxErr) maxErr = c.val;
      });

      const toChartX = (d: number) => chartX + ((d - 1) / 6) * chartW;
      const toChartY = (err: number) => chartY + chartH - (Math.min(maxErr, err) / maxErr) * chartH;

      // Draw horizontal axis line
      ctx.save();
      ctx.strokeStyle = "rgba(190, 182, 165, 0.4)";
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + chartH);
      ctx.lineTo(chartX + chartW, chartY + chartH);
      ctx.stroke();
      ctx.restore();

      // Train line (Cyan)
      ctx.save();
      ctx.strokeStyle = COLORS.cyan;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(toChartX(errorCurves[0].d), toChartY(errorCurves[0].train));
      for (let i = 1; i < errorCurves.length; i++) {
        ctx.lineTo(toChartX(errorCurves[i].d), toChartY(errorCurves[i].train));
      }
      ctx.stroke();
      ctx.restore();

      // Validation line (Pink)
      ctx.save();
      ctx.strokeStyle = COLORS.pink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(toChartX(errorCurves[0].d), toChartY(errorCurves[0].val));
      for (let i = 1; i < errorCurves.length; i++) {
        ctx.lineTo(toChartX(errorCurves[i].d), toChartY(errorCurves[i].val));
      }
      ctx.stroke();
      ctx.restore();

      // Highlight active degree
      const activeX = toChartX(degree);
      if (activeX >= chartX && activeX <= chartX + chartW && degree <= 7) {
        ctx.save();
        ctx.strokeStyle = COLORS.yellow;
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(activeX, chartY);
        ctx.lineTo(activeX, chartY + chartH);
        ctx.stroke();
        ctx.restore();
      }

      // Small monospaced labels
      drawHelper.text(ctx, "train err", chartX + 4, chartY + 6, COLORS.cyan, "5px var(--font-mono)");
      drawHelper.text(ctx, "val err", chartX + 4, chartY + 13, COLORS.pink, "5px var(--font-mono)");
      drawHelper.text(ctx, "d=1", chartX, chartY + chartH + 7, COLORS.muted, "5px var(--font-mono)");
      drawHelper.text(ctx, "d=7", chartX + chartW, chartY + chartH + 7, COLORS.muted, "5px var(--font-mono)", "right");
    },
    [errorCurves, degree]
  );

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0.2 && dataX <= 9.8 && dataY >= 0.2 && dataY <= 9.8) {
      setPoints((curr) => [...curr, { x: dataX, y: dataY }]);
    }
  };

  const handleReset = () => {
    setPoints([
      { x: 1.5, y: 3.2 },
      { x: 2.8, y: 5.1 },
      { x: 3.8, y: 4.8 },
      { x: 4.8, y: 6.9 },
      { x: 6.2, y: 5.8 },
      { x: 7.8, y: 8.2 },
      { x: 8.9, y: 7.5 },
    ]);
    setDegree(3);
  };

  const handleClear = () => {
    setPoints([]);
  };

  return (
    <VisualizationShell
      title="Bias-Variance Tradeoff (Polynomial Fitting)"
      subtitle="Click plot space to add coordinate points. Slide model degree to modify polynomial capacity. Analyze fitting properties and the loss chart."
      insight="Low degrees suffer from high bias (underfitting). High degrees fit points perfectly but suffer from high variance (overfitting). The cross-validation curve isolates the ideal tradeoff capacity."
      legend={[
        { label: "Polynomial Fit", color: COLORS.pink },
        { label: "Training Nodes", color: COLORS.cyan },
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
              Training MSE:{" "}
              <span className="font-bold text-cyan">{errors.trainErr.toFixed(4)}</span>
            </div>
            <div>
              Cross-Val LOOCV:{" "}
              <span className="font-bold text-pink">
                {errors.valErr > 0 ? errors.valErr.toFixed(4) : "Add more points"}
              </span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Polynomial Degree (d)</span>
              <span className="text-pink font-bold">{degree}</span>
            </div>
            <p className="text-[9px] text-on-surface-variant leading-relaxed font-normal">
              Degree 1 is linear. Degrees 2-3 are quadratic/cubic. Higher degrees curve exponentially to capture outlier training coordinates.
            </p>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={degree}
              onChange={(e) => setDegree(parseInt(e.target.value))}
              className="mt-1 w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Generalization Curves</span>
            <div className="relative border border-outline/30 bg-surface-container-lowest/80 h-[100px] w-full mt-1 flex items-center justify-center">
              <NativeCanvasPlot
                viewBoxWidth={180}
                viewBoxHeight={90}
                onDraw={onDrawMiniChart}
                className="h-full w-full"
              />
            </div>
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
