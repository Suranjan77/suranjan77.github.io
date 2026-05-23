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

export default function MaximumLikelihoodVisualization() {
  const [mu, setMu] = useState(5.0);
  const [sigma, setSigma] = useState(1.2);
  const [points, setPoints] = useState<number[]>([2.5, 3.8, 4.2, 5.1, 5.8, 7.5, 8.2]);

  const f = (x: number, m: number, s: number) => {
    return Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  };

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const curvePoints: Array<{ x: number; y: number }> = [];
    for (let px = plotConfig.left; px <= plotConfig.right; px++) {
      const dataX = fromXPixel(px);
      const val = f(dataX, mu, sigma);
      const py = plotConfig.bottom - val * 166;
      curvePoints.push({ x: px, y: py });
    }
    drawHelper.path(ctx, curvePoints, COLORS.pink, 2.5);

    points.forEach((pt) => {
      const px = toXPixel(pt);
      const py = plotConfig.bottom - f(pt, mu, sigma) * 166;
      const pyBottom = plotConfig.bottom;

      drawHelper.line(ctx, px, pyBottom, px, py, COLORS.yellow, 1.2, [3, 3]);
      drawHelper.point(ctx, px, pyBottom, COLORS.cyan, "reticle", 5.5);
      drawHelper.point(ctx, px, py, COLORS.pink, "circle", 3.0);
    });
  }, [mu, sigma, points]);

  const logLikelihood = useMemo(() => {
    return points.reduce((sum, pt) => {
      const val = f(pt, mu, sigma);
      return sum + Math.log(Math.max(1e-6, val));
    }, 0);
  }, [mu, sigma, points]);

  // Compute actual MLE optimal parameters for the dataset
  const optimalMle = useMemo(() => {
    if (points.length === 0) return { muOpt: 5.0, sigmaOpt: 1.0 };
    const muOpt = points.reduce((sum, p) => sum + p, 0) / points.length;
    const varOpt = points.reduce((sum, p) => sum + (p - muOpt) ** 2, 0) / points.length;
    const sigmaOpt = Math.sqrt(Math.max(0.1, varOpt));
    return { muOpt, sigmaOpt };
  }, [points]);

  const handlePlotClick = (x: number) => {
    const dataX = fromXPixel(x);
    if (dataX >= 0.5 && dataX <= 9.5) {
      setPoints((curr) => [...curr, dataX]);
    }
  };

  const handleReset = () => {
    setPoints([2.5, 3.8, 4.2, 5.1, 5.8, 7.5, 8.2]);
    setMu(5.0);
    setSigma(1.2);
  };

  return (
    <VisualizationShell
      title="Maximum Likelihood Estimation"
      subtitle="Adjust the Gaussian model mean (μ) and standard deviation (σ). Click anywhere on the plot horizontal space to place observation points."
      insight="MLE searches for parameter values that maximize the joint probability density of the observed data. Graphically, this pulls the curve to cover the points."
      legend={[
        { label: "Observed Data", color: COLORS.cyan },
        { label: "Gaussian Model", color: COLORS.pink },
        { label: "Point Likelihood", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} onClick={handlePlotClick} className="h-full w-full cursor-crosshair" />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click plot space to place observations]
          </div>
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            ln L(μ, σ) = <span className="font-bold text-pink">{logLikelihood.toFixed(2)}</span>
            <div className="mt-1 text-on-surface-variant normal-case font-bold">
              Optimal solve: μ = {optimalMle.muOpt.toFixed(2)}, σ = {optimalMle.sigmaOpt.toFixed(2)}
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3 flex-1">
          <div className="flex flex-col gap-3 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Model Mean (μ)</span>
                <span className="text-primary font-bold">{mu.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.1"
                value={mu}
                onChange={(e) => setMu(parseFloat(e.target.value))}
                className="w-full accent-primary my-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Model Std Dev (σ)</span>
                <span className="text-primary font-bold">{sigma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={sigma}
                onChange={(e) => setSigma(parseFloat(e.target.value))}
                className="w-full accent-primary my-1"
              />
            </div>
          </div>
          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset Space
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
