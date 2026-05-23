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

export default function BayesianInferenceVisualization() {
  const [trueP, setTrueP] = useState(0.6);
  const [alpha, setAlpha] = useState(2);
  const [betaVal, setBetaVal] = useState(2);
  const [flips, setFlips] = useState<string[]>([]);

  const handleFlip = () => {
    const outcome = Math.random() < trueP ? "H" : "T";
    setFlips((prev) => [...prev, outcome]);
  };

  const handleReset = () => {
    setFlips([]);
  };

  const headsCount = flips.filter((f) => f === "H").length;
  const tailsCount = flips.length - headsCount;

  const postAlpha = alpha + headsCount;
  const postBeta = betaVal + tailsCount;

  const betaKernel = (x: number, a: number, b: number) => {
    if (x <= 0 || x >= 1) return 0;
    return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1);
  };

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.line(ctx, 40, 24, 40, 190, COLORS.border, 1.2);
    drawHelper.line(ctx, 40, 190, 296, 190, COLORS.border, 1.2);
    drawHelper.text(ctx, "0.0", 40, 200, "#6F6658", "9px var(--font-mono)", "center");
    drawHelper.text(ctx, "0.5", 168, 200, "#6F6658", "9px var(--font-mono)", "center");
    drawHelper.text(ctx, "1.0", 296, 200, "#6F6658", "9px var(--font-mono)", "center");
    drawHelper.text(ctx, "θ", 296, 180, COLORS.muted, "bold 11px var(--font-mono)", "center");

    drawHelper.line(ctx, 104, 24, 104, 190, COLORS.grid, 0.5, [2, 2]);
    drawHelper.line(ctx, 168, 24, 168, 190, COLORS.grid, 0.5, [2, 2]);
    drawHelper.line(ctx, 232, 24, 232, 190, COLORS.grid, 0.5, [2, 2]);

    const getMaxKernel = (a: number, b: number) => {
      if (a <= 1 && b <= 1) return 1.0;
      const mode = (a - 1) / (a + b - 2 || 1);
      return Math.max(1e-9, betaKernel(mode, a, b));
    };

    const maxPrior = getMaxKernel(alpha, betaVal);
    const maxPost = getMaxKernel(postAlpha, postBeta);

    const priorPoints: Array<{ x: number; y: number }> = [];
    const postPoints: Array<{ x: number; y: number }> = [];
    const likelihoodPoints: Array<{ x: number; y: number }> = [];

    const maxLike = flips.length > 0 
      ? Math.pow(headsCount / flips.length, headsCount) * Math.pow(tailsCount / flips.length, tailsCount)
      : 1.0;

    for (let px = 40; px <= 296; px++) {
      const theta = (px - 40) / 256;
      const priorVal = betaKernel(theta, alpha, betaVal) / maxPrior;
      priorPoints.push({ x: px, y: 190 - priorVal * 100 });

      const postVal = betaKernel(theta, postAlpha, postBeta) / maxPost;
      postPoints.push({ x: px, y: 190 - postVal * 130 });

      if (flips.length > 0) {
        const likeVal = (Math.pow(theta, headsCount) * Math.pow(1 - theta, tailsCount)) / (maxLike || 1.0);
        likelihoodPoints.push({ x: px, y: 190 - likeVal * 70 });
      }
    }

    drawHelper.path(ctx, priorPoints, COLORS.cyan, 1.8, "none", [4, 2]);
    if (flips.length > 0) {
      drawHelper.path(ctx, likelihoodPoints, COLORS.yellow, 1.5, "none", [2, 2]);
    }
    drawHelper.path(ctx, postPoints, COLORS.pink, 2.5);

    const truePx = 40 + trueP * 256;
    drawHelper.line(ctx, truePx, 24, truePx, 190, COLORS.green, 1.2, [5, 5]);
  }, [alpha, betaVal, flips, trueP, postAlpha, postBeta, headsCount, tailsCount]);

  const priorMean = alpha / (alpha + betaVal);
  const postMean = postAlpha / (postAlpha + postBeta);

  return (
    <VisualizationShell
      title="Bayesian Beta-Binomial Inference"
      subtitle="Simulate coin flips with a biased coin. Observe how the posterior distribution (pink) shifts from the prior (cyan dashed) towards the likelihood (yellow dashed)."
      insight="Bayesian updating combines prior belief with observed evidence. As you flip more coins, the posterior distribution gets narrower and converges on the true value."
      legend={[
        { label: "Prior Beta(α,β)", color: COLORS.cyan },
        { label: "Likelihood", color: COLORS.yellow },
        { label: "Posterior", color: COLORS.pink },
        { label: "True Probability", color: COLORS.green },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            Prior Mean: <span className="font-bold text-cyan">{priorMean.toFixed(2)}</span>
            <div className="mt-1 text-on-surface-variant font-bold normal-case">
              Posterior Mean: <span className="font-bold text-pink">{postMean.toFixed(2)}</span>
            </div>
            <div className="mt-1 text-on-surface-variant/75 normal-case font-bold">
              Flips: {flips.length} ({headsCount}H, {tailsCount}T)
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Biased Coin Probability (θ)</span>
            <div className="flex justify-between font-bold">
              <span>True Bias</span>
              <span className="text-warning font-bold">{trueP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={trueP}
              onChange={(e) => setTrueP(parseFloat(e.target.value))}
              className="w-full accent-primary my-1"
            />
          </div>

          <div className="flex flex-col gap-2.5 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Prior Parameters</span>
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col">
                <span className="text-[9px]">Alpha (α)</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={alpha}
                  onChange={(e) => setAlpha(Math.max(1, parseInt(e.target.value) || 1))}
                  className="border border-outline p-1 text-center bg-surface-container rounded font-bold"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[9px]">Beta (β)</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={betaVal}
                  onChange={(e) => setBetaVal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="border border-outline p-1 text-center bg-surface-container rounded font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleFlip}
              className="flex-1 border border-outline rounded bg-primary text-on-primary border-primary px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Flip Coin
            </button>
            <button
              onClick={handleReset}
              className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 hover:text-primary hover:border-primary/50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
