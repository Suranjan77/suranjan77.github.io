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

export default function DimensionalityReductionVisualization() {
  const [angle, setAngle] = useState(45);
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([
    { x: 2.2, y: 2.5 },
    { x: 3.5, y: 4.2 },
    { x: 4.8, y: 4.5 },
    { x: 5.5, y: 5.8 },
    { x: 6.8, y: 6.2 },
    { x: 7.2, y: 8.5 },
    { x: 8.5, y: 8.2 },
  ]);

  // Compute means dynamically based on points
  const meanVals = useMemo(() => {
    if (points.length === 0) return { meanX: 5.0, meanY: 5.0 };
    const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { meanX, meanY };
  }, [points]);

  const rad = (angle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const projectedPoints = useMemo(() => {
    return points.map((p) => {
      const rx = p.x - meanVals.meanX;
      const ry = p.y - meanVals.meanY;
      const d = rx * cosA + ry * sinA;
      const px = meanVals.meanX + d * cosA;
      const py = meanVals.meanY + d * sinA;
      return { ox: p.x, oy: p.y, px, py, d };
    });
  }, [points, cosA, sinA, meanVals]);

  const projVariance = useMemo(() => {
    if (points.length === 0) return 0;
    const sumSq = projectedPoints.reduce((sum, p) => sum + p.d ** 2, 0);
    return sumSq / points.length;
  }, [projectedPoints, points.length]);

  const totalVariance = useMemo(() => {
    if (points.length === 0) return 1;
    const sumSq = points.reduce((sum, p) => sum + (p.x - meanVals.meanX) ** 2 + (p.y - meanVals.meanY) ** 2, 0);
    return sumSq / points.length;
  }, [points, meanVals]);

  const varPercentage = (projVariance / totalVariance) * 100;

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const lineLen = 6.0;
    const lx1 = toXPixel(meanVals.meanX - lineLen * cosA);
    const ly1 = toYPixel(meanVals.meanY - lineLen * sinA);
    const lx2 = toXPixel(meanVals.meanX + lineLen * cosA);
    const ly2 = toYPixel(meanVals.meanY + lineLen * sinA);
    drawHelper.line(ctx, lx1, ly1, lx2, ly2, COLORS.muted, 2.0);

    projectedPoints.forEach((p) => {
      const oxPx = toXPixel(p.ox);
      const oyPx = toYPixel(p.oy);
      const pxPx = toXPixel(p.px);
      const pyPx = toYPixel(p.py);

      drawHelper.line(ctx, oxPx, oyPx, pxPx, pyPx, COLORS.yellow, 1.0, [2, 2]);
      drawHelper.point(ctx, oxPx, oyPx, COLORS.cyan, "circle", 4.5);
      drawHelper.point(ctx, pxPx, pyPx, COLORS.pink, "reticle", 3.0);
    });
  }, [cosA, sinA, meanVals, projectedPoints]);

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0.5 && dataX <= 9.5 && dataY >= 0.5 && dataY <= 9.5) {
      setPoints((curr) => [...curr, { x: dataX, y: dataY }]);
    }
  };

  const handleReset = () => {
    setPoints([
      { x: 2.2, y: 2.5 },
      { x: 3.5, y: 4.2 },
      { x: 4.8, y: 4.5 },
      { x: 5.5, y: 5.8 },
      { x: 6.8, y: 6.2 },
      { x: 7.2, y: 8.5 },
      { x: 8.5, y: 8.2 },
    ]);
    setAngle(45);
  };

  return (
    <VisualizationShell
      title="Principal Component Projections"
      subtitle="Rotate the principal projection axis (slider). Click anywhere on the plot space to add custom coordinates and watch them project onto the axis."
      insight="PCA solves for direction vectors that maximize the spread (variance) of projected points. Maximizing this spread minimizes information loss."
      legend={[
        { label: "Original Nodes", color: COLORS.cyan },
        { label: "Projected Nodes", color: COLORS.pink },
        { label: "Projection Axis", color: COLORS.muted },
        { label: "Information Loss", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} onClick={handlePlotClick} className="h-full w-full cursor-crosshair" />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click plot space to add custom points]
          </div>
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            Axis Angle: <span className="font-bold text-pink">{angle}°</span>
            <div className="mt-1 text-on-surface-variant font-bold normal-case">
              Variance Explained: <span className="font-bold text-cyan">{varPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Projection Angle</span>
            <div className="flex justify-between font-bold">
              <span>Theta (θ)</span>
              <span className="text-warning font-bold">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full accent-primary my-1"
            />
          </div>
          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset Space
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
