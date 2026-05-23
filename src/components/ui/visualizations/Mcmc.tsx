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
const fromXPixel = (x: number) => ((x - plotConfig.left) / plotConfig.width) * 10;

export default function McmcVisualization() {
  const [proposalStd, setProposalStd] = useState(1.0);
  const [currentX, setCurrentX] = useState(5.0);
  const [samples, setSamples] = useState<number[]>([5.0]);
  const [lastStep, setLastStep] = useState<{ from: number; to: number; accepted: boolean } | null>(null);

  const targetPdf = (x: number) => {
    const term1 = Math.exp(-0.5 * ((x - 3.2) / 0.8) ** 2) / (0.8 * Math.sqrt(2 * Math.PI));
    const term2 = Math.exp(-0.5 * ((x - 6.8) / 0.8) ** 2) / (0.8 * Math.sqrt(2 * Math.PI));
    return 0.5 * term1 + 0.5 * term2;
  };

  const takeStep = useCallback(() => {
    const u1 = Math.random() || 1e-9;
    const u2 = Math.random();
    const randNorm = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const proposalX = currentX + randNorm * proposalStd;

    if (proposalX < 0.5 || proposalX > 9.5) {
      setLastStep({ from: currentX, to: proposalX, accepted: false });
      setSamples((curr) => [...curr, currentX]);
      return;
    }

    const pCurrent = targetPdf(currentX);
    const pProposal = targetPdf(proposalX);
    const acceptanceRatio = Math.min(1, pProposal / pCurrent);

    const accepted = Math.random() < acceptanceRatio;
    if (accepted) {
      setCurrentX(proposalX);
      setSamples((curr) => [...curr, proposalX]);
      setLastStep({ from: currentX, to: proposalX, accepted: true });
    } else {
      setSamples((curr) => [...curr, currentX]);
      setLastStep({ from: currentX, to: proposalX, accepted: false });
    }
  }, [currentX, proposalStd]);

  const handleRun50 = () => {
    let cx = currentX;
    const newSamples = [...samples];
    let acceptedCount = 0;
    
    for (let i = 0; i < 50; i++) {
      const u1 = Math.random() || 1e-9;
      const u2 = Math.random();
      const randNorm = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const propX = cx + randNorm * proposalStd;

      if (propX < 0.5 || propX > 9.5) {
        newSamples.push(cx);
        continue;
      }
      
      const pCurrent = targetPdf(cx);
      const pProposal = targetPdf(propX);
      const ratio = Math.min(1, pProposal / pCurrent);
      
      if (Math.random() < ratio) {
        cx = propX;
        acceptedCount++;
      }
      newSamples.push(cx);
    }
    
    setCurrentX(cx);
    setSamples(newSamples);
    if (newSamples.length > 1) {
      setLastStep({ 
        from: newSamples[newSamples.length - 2], 
        to: cx, 
        accepted: acceptedCount > 0 
      });
    }
  };

  const handleReset = () => {
    setCurrentX(5.0);
    setSamples([5.0]);
    setLastStep(null);
  };

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const targetPoints: Array<{ x: number; y: number }> = [];
    for (let px = plotConfig.left; px <= plotConfig.right; px++) {
      const dataX = fromXPixel(px);
      const val = targetPdf(dataX);
      targetPoints.push({ x: px, y: plotConfig.bottom - val * 240 });
    }
    drawHelper.path(ctx, targetPoints, COLORS.muted, 2.0);

    const binCount = 20;
    const binWidth = (plotConfig.width) / binCount;
    const bins = new Array(binCount).fill(0);
    
    samples.forEach((s) => {
      const binIdx = Math.floor(((s - 0) / 10) * binCount);
      if (binIdx >= 0 && binIdx < binCount) {
        bins[binIdx]++;
      }
    });

    const maxBinVal = Math.max(1, ...bins);
    bins.forEach((cnt, idx) => {
      if (cnt === 0) return;
      const bx = plotConfig.left + idx * binWidth;
      const bHeight = (cnt / maxBinVal) * 55;
      const by = plotConfig.bottom - bHeight;

      ctx.save();
      ctx.fillStyle = "rgba(85, 107, 74, 0.28)";
      ctx.strokeStyle = "rgba(85, 107, 74, 0.4)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.rect(bx, by, binWidth - 1, bHeight);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    if (lastStep) {
      const fromPx = toXPixel(lastStep.from);
      const toPx = toXPixel(lastStep.to);
      const lineY = plotConfig.bottom - 80;

      drawHelper.line(
        ctx, 
        fromPx, 
        lineY, 
        toPx, 
        lineY, 
        lastStep.accepted ? COLORS.green : COLORS.pink, 
        1.5, 
        [3, 3]
      );
      
      drawHelper.point(
        ctx, 
        toPx, 
        lineY, 
        lastStep.accepted ? COLORS.green : COLORS.pink, 
        "circle", 
        3.5
      );
    }

    const currPx = toXPixel(currentX);
    const currPy = plotConfig.bottom - targetPdf(currentX) * 240;
    drawHelper.point(ctx, currPx, currPy, COLORS.pink, "reticle", 6.5);
  }, [currentX, samples, lastStep]);

  return (
    <VisualizationShell
      title="Metropolis-Hastings MCMC Sampling"
      subtitle="Click Step or Run 50 to generate proposed random steps. Accepted proposals move the sampler; rejected ones stay."
      insight="MCMC proposal jumps are accepted proportionally to the target density ratio. Over time, the histogram of visited coordinates mirrors the target shape."
      legend={[
        { label: "Target Distribution", color: COLORS.muted },
        { label: "Active Sampler", color: COLORS.pink },
        { label: "Samples Histogram", color: "rgba(85, 107, 74, 0.3)" },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            Samples Count: <span className="font-bold text-pink">{samples.length}</span>
            <div className="mt-1 text-on-surface-variant font-bold normal-case">
              Current Position: <span className="font-bold text-cyan">{currentX.toFixed(3)}</span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Proposal Step Size (σ)</span>
            <div className="flex justify-between font-bold">
              <span>Standard Dev</span>
              <span className="text-warning font-bold">{proposalStd.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={proposalStd}
              onChange={(e) => setProposalStd(parseFloat(e.target.value))}
              className="w-full accent-primary my-1"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={takeStep}
              className="border border-outline rounded bg-primary text-on-primary border-primary px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Take MCMC Step
            </button>
            <button
              onClick={handleRun50}
              className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 hover:text-primary hover:border-primary/50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Run 50 Steps
            </button>
            <button
              onClick={handleReset}
              className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-1.5 font-mono text-[9px] font-bold uppercase hover:bg-primary/10 hover:text-primary transition-all cursor-pointer text-center"
            >
              Reset Sampler
            </button>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
