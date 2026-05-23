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

export default function KMeansVisualization() {
  const [points, setPoints] = useState<Array<[number, number]>>([
    [1.5, 7.5], [2.2, 8.2], [2.8, 6.8], [3.2, 7.8],
    [4.8, 3.5], [5.5, 2.8], [6.2, 4.2], [6.8, 2.5],
    [7.5, 7.8], [8.2, 8.5], [8.8, 6.5], [9.2, 7.2]
  ]);

  const defaultCentroids = [
    [3.0, 6.0] as [number, number],
    [5.0, 4.0] as [number, number],
    [8.0, 6.0] as [number, number]
  ];

  const [centroids, setCentroids] = useState(defaultCentroids);
  const [step, setStep] = useState<"assign" | "update">("assign");

  const colors = [COLORS.cyan, COLORS.pink, COLORS.yellow];

  const getAssignment = (px: number, py: number, currentCentroids = centroids) => {
    let minD = Infinity;
    let assignedIdx = 0;
    currentCentroids.forEach((c, cIdx) => {
      const d = (px - c[0]) ** 2 + (py - c[1]) ** 2;
      if (d < minD) {
        minD = d;
        assignedIdx = cIdx;
      }
    });
    return assignedIdx;
  };

  const handleIterate = () => {
    if (step === "assign") {
      setStep("update");
    } else {
      const nextCentroids = centroids.map((c, cIdx) => {
        const assigned = points.filter(([px, py]) => getAssignment(px, py) === cIdx);
        if (assigned.length === 0) return c;
        const sumX = assigned.reduce((sum, p) => sum + p[0], 0);
        const sumY = assigned.reduce((sum, p) => sum + p[1], 0);
        return [sumX / assigned.length, sumY / assigned.length] as [number, number];
      });
      setCentroids(nextCentroids);
      setStep("assign");
    }
  };

  const handleReset = () => {
    setCentroids(defaultCentroids);
    setPoints([
      [1.5, 7.5], [2.2, 8.2], [2.8, 6.8], [3.2, 7.8],
      [4.8, 3.5], [5.5, 2.8], [6.2, 4.2], [6.8, 2.5],
      [7.5, 7.8], [8.2, 8.5], [8.8, 6.5], [9.2, 7.2]
    ]);
    setStep("assign");
  };

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    points.forEach(([px, py]) => {
      const assignedIdx = getAssignment(px, py);
      const c = centroids[assignedIdx];
      const pixX = toXPixel(px);
      const pixY = toYPixel(py);
      const cX = toXPixel(c[0]);
      const cY = toYPixel(c[1]);

      drawHelper.line(ctx, pixX, pixY, cX, cY, colors[assignedIdx], 0.8, [2, 2]);
      drawHelper.point(ctx, pixX, pixY, colors[assignedIdx], "circle", 4.5);
    });

    centroids.forEach((c, cIdx) => {
      const cX = toXPixel(c[0]);
      const cY = toYPixel(c[1]);
      drawHelper.point(ctx, cX, cY, colors[cIdx], "star", 7.5);
    });
  }, [points, centroids]);

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0.5 && dataX <= 9.5 && dataY >= 0.5 && dataY <= 9.5) {
      setPoints((curr) => [...curr, [dataX, dataY]]);
    }
  };

  return (
    <VisualizationShell
      title="Lloyd's Clustering Optimization"
      subtitle="Click Iterate step-by-step. Centroids move to mean coordinates of assigned clusters, updating Voronoi borders. Click canvas to add custom points."
      insight="Step 1: Assign (points snap to closest centroid). Step 2: Update (centroids slide to mean position). Convergence is reached when updates are zero."
      legend={[
        { label: "Centroid 1", color: COLORS.cyan },
        { label: "Centroid 2", color: COLORS.pink },
        { label: "Centroid 3", color: COLORS.yellow },
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
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <button
            onClick={handleIterate}
            className="border border-outline rounded bg-primary text-on-primary border-primary px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Iterate: {step === "assign" ? "Snap Points" : "Update Centroids"}
          </button>
          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 hover:text-primary hover:border-primary/50 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
