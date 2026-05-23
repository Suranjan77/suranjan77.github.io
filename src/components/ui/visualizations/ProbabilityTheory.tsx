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

const fromXPixel = (x: number) => ((x - plotConfig.left) / plotConfig.width) * 10;
const toYPixel = (y: number) => plotConfig.bottom - (y / 10) * plotConfig.height;

export default function ProbabilityTheoryVisualization() {
  const [mean, setMean] = useState(5.0);
  const [stdDev, setStdDev] = useState(1.2);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);
    const points: Array<{ x: number; y: number }> = [];
    
    for (let px = plotConfig.left; px <= plotConfig.right; px++) {
      const dataX = fromXPixel(px);
      // Map Y to density scale
      const y = 8 * Math.exp(-0.5 * ((dataX - mean) / stdDev) ** 2) / (stdDev * Math.sqrt(2 * Math.PI));
      points.push({ x: px, y: toYPixel(y) });
    }
    drawHelper.path(ctx, points, COLORS.pink, 2.5);
  }, [mean, stdDev]);

  const handleReset = () => {
    setMean(5.0);
    setStdDev(1.2);
  };

  return (
    <VisualizationShell
      title="Gaussian Normal Distribution"
      subtitle="Visualise probabilities as density curves under a Normal distribution. Adjust the Mean (μ) and Standard Deviation (σ)."
      insight="The area under the probability density function (PDF) curve sum to exactly 1.0."
      legend={[{ label: "Normal Distribution Curve", color: COLORS.pink }]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Distribution Mean (μ)</span>
                <span className="text-primary font-bold">{mean.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.1"
                value={mean}
                onChange={(e) => setMean(parseFloat(e.target.value))}
                className="w-full accent-primary my-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Standard Dev (σ)</span>
                <span className="text-primary font-bold">{stdDev.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={stdDev}
                onChange={(e) => setStdDev(parseFloat(e.target.value))}
                className="w-full accent-primary my-1"
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset curve
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
