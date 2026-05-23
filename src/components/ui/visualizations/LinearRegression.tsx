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

export default function LinearRegressionVisualization() {
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([
    { x: 1.5, y: 2.2 },
    { x: 3.2, y: 3.6 },
    { x: 4.8, y: 5.1 },
    { x: 6.1, y: 5.8 },
    { x: 8.5, y: 7.9 },
  ]);
  const [m, setM] = useState(0.65);
  const [c, setC] = useState(1.8);
  const [autoFit, setAutoFit] = useState(false);

  const solvedParameters = useMemo(() => {
    const n = points.length;
    if (n === 0) return { m: 0, c: 0 };
    const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;
    const num = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
    const den = points.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
    const slope = den === 0 ? 0 : num / den;
    const intercept = meanY - slope * meanX;
    return { m: slope, c: intercept };
  }, [points]);

  const activeM = autoFit ? solvedParameters.m : m;
  const activeC = autoFit ? solvedParameters.c : c;

  const totalSquaredError = useMemo(() => {
    return points.reduce((sum, p) => {
      const pred = activeM * p.x + activeC;
      return sum + (p.y - pred) ** 2;
    }, 0);
  }, [points, activeM, activeC]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const y0 = activeM * 0 + activeC;
    const y10 = activeM * 10 + activeC;
    drawHelper.line(ctx, toXPixel(0), toYPixel(y0), toXPixel(10), toYPixel(y10), COLORS.pink, 3);

    points.forEach((point) => {
      const predY = activeM * point.x + activeC;
      const px = toXPixel(point.x);
      const py = toYPixel(point.y);
      const ppredY = toYPixel(predY);
      const residualPx = ppredY - py;

      drawHelper.line(ctx, px, py, px, ppredY, COLORS.yellow, 1.5, [3, 3]);

      ctx.save();
      ctx.fillStyle = "rgba(141, 81, 73, 0.14)";
      ctx.strokeStyle = "rgba(141, 81, 73, 0.4)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.rect(px, py, residualPx, residualPx);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      drawHelper.point(ctx, px, py, COLORS.cyan, "reticle", 5.5);
    });
  }, [points, activeM, activeC]);

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0.5 && dataX <= 9.5 && dataY >= 0.5 && dataY <= 9.5) {
      setPoints((curr) => [...curr, { x: dataX, y: dataY }]);
      setAutoFit(false);
    }
  };

  const handleReset = () => {
    setPoints([
      { x: 1.5, y: 2.2 },
      { x: 3.2, y: 3.6 },
      { x: 4.8, y: 5.1 },
      { x: 6.1, y: 5.8 },
      { x: 8.5, y: 7.9 },
    ]);
    setM(0.65);
    setC(1.8);
    setAutoFit(false);
  };

  return (
    <VisualizationShell
      title="Method of Least Squares Regression"
      subtitle="Manually adjust slope and intercept parameters. Residual squares visualize error variance directly. Minimise total square areas to solve optimal parameters."
      insight="Every vertical line represents a residual. Drawing a literal square attached to it highlights how squaring error heavily penalises outlier nodes."
      legend={[
        { label: "Residual Error", color: COLORS.yellow },
        { label: "Residual Square", color: COLORS.pink },
        { label: "Observation", color: COLORS.cyan },
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
            [Click plot space to add data points]
          </div>
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            y = {activeM.toFixed(2)}x + {activeC.toFixed(2)}
            <div className="mt-1 text-on-surface-variant normal-case font-bold">
              Total Squared Loss: <span className="text-pink">{totalSquaredError.toFixed(2)}</span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setAutoFit((val) => !val)}
              className={`flex-1 border px-3 py-2.5 font-mono text-[10px] font-bold uppercase rounded active:scale-[0.98] transition-all cursor-pointer ${
                autoFit
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container text-on-surface border-outline hover:bg-primary/10"
              }`}
            >
              {autoFit ? "Auto Fit: ON" : "Auto Fit: OFF"}
            </button>
            <button
              onClick={handleReset}
              className="border border-outline rounded bg-surface-container text-on-surface border-outline px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 hover:text-primary hover:border-primary/50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded border border-outline bg-surface p-4 font-mono text-xs text-on-surface">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Slope (m)</span>
                <span className={autoFit ? "text-on-surface-variant/40" : "text-primary"}>
                  {activeM.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-1"
                max="2"
                step="0.05"
                value={m}
                disabled={autoFit}
                onChange={(e) => {
                  setM(parseFloat(e.target.value));
                  setAutoFit(false);
                }}
                className="w-full accent-primary my-1 disabled:opacity-40"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Intercept (c)</span>
                <span className={autoFit ? "text-on-surface-variant/40" : "text-primary"}>
                  {activeC.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-3"
                max="8"
                step="0.1"
                value={c}
                disabled={autoFit}
                onChange={(e) => {
                  setC(parseFloat(e.target.value));
                  setAutoFit(false);
                }}
                className="w-full accent-primary my-1 disabled:opacity-40"
              />
            </div>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
