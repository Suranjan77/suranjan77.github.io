"use client";

import React, { useState, useCallback } from "react";
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

export default function LogisticRegressionVisualization() {
  const [points, setPoints] = useState<Array<{ x: number; y: number; label: 0 | 1 }>>([
    { x: 1.5, y: 2.2, label: 0 },
    { x: 2.8, y: 3.5, label: 0 },
    { x: 3.5, y: 1.8, label: 0 },
    { x: 4.8, y: 4.2, label: 0 },
    { x: 5.5, y: 7.2, label: 1 },
    { x: 6.8, y: 5.5, label: 1 },
    { x: 7.9, y: 8.1, label: 1 },
    { x: 8.9, y: 6.9, label: 1 },
  ]);
  const [activeLabel, setActiveLabel] = useState<0 | 1>(0);
  const [w, setW] = useState(1.2);
  const [b, setB] = useState(-6.0);
  const [hoveredX, setHoveredX] = useState<number | null>(null);

  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
  const decisionBoundaryX = -b / w;

  const onDrawLeft = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    for (let px = plotConfig.left; px <= plotConfig.right; px++) {
      const dataX = fromXPixel(px);
      const prob = sigmoid(w * dataX + b);
      ctx.strokeStyle = `rgba(${Math.round(141 * prob + 85 * (1 - prob))}, ${Math.round(81 * prob + 107 * (1 - prob))}, ${Math.round(73 * prob + 74 * (1 - prob))}, 0.12)`;
      drawHelper.line(ctx, px, plotConfig.top, px, plotConfig.bottom, ctx.strokeStyle, 1);
    }

    const dbPx = toXPixel(decisionBoundaryX);
    if (dbPx >= plotConfig.left && dbPx <= plotConfig.right) {
      drawHelper.line(ctx, dbPx, plotConfig.top, dbPx, plotConfig.bottom, COLORS.yellow, 2, [5, 4]);
    }

    points.forEach((p) => {
      const px = toXPixel(p.x);
      const py = toYPixel(p.y);
      drawHelper.point(ctx, px, py, p.label === 1 ? COLORS.pink : COLORS.cyan, "reticle", 5.5);
    });

    if (hoveredX !== null) {
      const hoverPx = toXPixel(hoveredX);
      drawHelper.line(ctx, hoverPx, plotConfig.top, hoverPx, plotConfig.bottom, "rgba(30, 27, 22, 0.15)", 0.8);
    }
  }, [points, w, b, decisionBoundaryX, hoveredX]);

  const onDrawRight = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    drawHelper.line(ctx, 30, 24, 30, 190, COLORS.border, 1.2);
    drawHelper.line(ctx, 30, 190, 190, 190, COLORS.border, 1.2);

    drawHelper.line(ctx, 30, 107, 190, 107, COLORS.grid, 0.8, [3, 3]);
    drawHelper.line(ctx, 30, 24, 190, 24, COLORS.grid, 0.8, [3, 3]);
    drawHelper.text(ctx, "p=1.0", 15, 24, "#6F6658", "9px var(--font-mono)");
    drawHelper.text(ctx, "p=0.5", 15, 107, "#6F6658", "9px var(--font-mono)");
    drawHelper.text(ctx, "p=0.0", 15, 190, "#6F6658", "9px var(--font-mono)");

    const sigmoidPoints: Array<{ x: number; y: number }> = [];
    for (let px = 30; px <= 190; px++) {
      const dataX = ((px - 30) / 160) * 10;
      const prob = sigmoid(w * dataX + b);
      const py = 190 - prob * 166;
      sigmoidPoints.push({ x: px, y: py });
    }
    drawHelper.path(ctx, sigmoidPoints, COLORS.yellow, 2.5);

    if (hoveredX !== null) {
      const prob = sigmoid(w * hoveredX + b);
      const px = 30 + (hoveredX / 10) * 160;
      const py = 190 - prob * 166;
      drawHelper.point(ctx, px, py, COLORS.pink, "reticle", 5.5);
    }
  }, [w, b, hoveredX]);

  const handleLeftClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0.5 && dataX <= 9.5 && dataY >= 0.5 && dataY <= 9.5) {
      setPoints((curr) => [...curr, { x: dataX, y: dataY, label: activeLabel }]);
      setHoveredX(dataX);
    }
  };

  const handleReset = () => {
    setPoints([
      { x: 1.5, y: 2.2, label: 0 },
      { x: 2.8, y: 3.5, label: 0 },
      { x: 3.5, y: 1.8, label: 0 },
      { x: 4.8, y: 4.2, label: 0 },
      { x: 5.5, y: 7.2, label: 1 },
      { x: 6.8, y: 5.5, label: 1 },
      { x: 7.9, y: 8.1, label: 1 },
      { x: 8.9, y: 6.9, label: 1 },
    ]);
    setW(1.2);
    setB(-6.0);
    setHoveredX(null);
  };

  return (
    <VisualizationShell
      title="Linear Boundaries & Sigmoid squashing"
      subtitle="Interact with the sliders to change weights and bias. Hover or click over the left boundary workspace to trace how X coordinates project onto the Sigmoid curve."
      insight="Logistic regression maps a linear equation z = wx + b into a calibrated probability profile using the Sigmoid activation: p = 1 / (1 + e^-z)."
      legend={[
        { label: "Class 0 (Green)", color: COLORS.cyan },
        { label: "Class 1 (Pink)", color: COLORS.pink },
        { label: "Decision Threshold", color: COLORS.yellow },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 rounded">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <PlotFrame className="min-h-[320px] relative">
              <NativeCanvasPlot
                onDraw={onDrawLeft}
                onClick={handleLeftClick}
                className="h-full w-full cursor-crosshair"
              />
              <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
                [Click to add nodes of active class]
              </div>
              <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
                z = {w.toFixed(1)}x + ({b.toFixed(1)})
                <div className="mt-1 text-on-surface-variant normal-case font-bold">
                  Threshold (P=0.5): <span className="text-pink">{decisionBoundaryX.toFixed(2)}</span>
                </div>
              </div>
            </PlotFrame>

            <PlotFrame className="min-h-[320px] relative">
              <NativeCanvasPlot
                viewBoxWidth={220}
                viewBoxHeight={220}
                onDraw={onDrawRight}
                className="h-full w-full"
              />
              {hoveredX !== null && (
                <div className="absolute right-6 top-8 border border-outline bg-surface/90 px-3 py-1 font-mono text-[9px] text-on-surface shadow-sm rounded-sm">
                  X: {hoveredX.toFixed(2)} → P: {sigmoid(w * hoveredX + b).toFixed(3)}
                </div>
              )}
            </PlotFrame>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 font-mono text-[10px] items-center">
            <span className="font-bold uppercase tracking-wider text-primary">Class to Add:</span>
            <button
              onClick={() => setActiveLabel(0)}
              className={`border border-outline px-3 py-2 rounded font-bold uppercase transition-all cursor-pointer ${
                activeLabel === 0 ? "bg-cyan text-on-primary border-cyan" : "bg-surface text-on-surface hover:bg-cyan/10"
              }`}
            >
              Class 0 (Cyan)
            </button>
            <button
              onClick={() => setActiveLabel(1)}
              className={`border border-outline px-3 py-2 rounded font-bold uppercase transition-all cursor-pointer ${
                activeLabel === 1 ? "bg-pink text-on-primary border-pink" : "bg-surface text-on-surface hover:bg-pink/10"
              }`}
            >
              Class 1 (Pink)
            </button>
            <button
              onClick={handleReset}
              className="border border-outline rounded bg-surface-container text-on-surface px-3 py-2 font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer ml-4"
            >
              Reset Space
            </button>
          </div>

          <ControlPanel className="flex flex-wrap gap-6 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface flex-1">
            <div className="flex flex-col gap-1 min-w-[140px] flex-1">
              <div className="flex justify-between font-bold">
                <span>Steepness / Weight (w)</span>
                <span className="text-primary">{w.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.1"
                value={w}
                onChange={(e) => setW(parseFloat(e.target.value))}
                className="w-full accent-primary my-2"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-[140px] flex-1">
              <div className="flex justify-between font-bold">
                <span>Shift / Bias (b)</span>
                <span className="text-primary">{b.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-18"
                max="-1"
                step="0.5"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full accent-primary my-2"
              />
            </div>
          </ControlPanel>
        </div>
      </div>
    </VisualizationShell>
  );
}
