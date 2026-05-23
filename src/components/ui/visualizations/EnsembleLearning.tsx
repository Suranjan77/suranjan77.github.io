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

export default function EnsembleLearningVisualization() {
  const [stumpCount, setStumpCount] = useState(3);
  const [points, setPoints] = useState<Array<{ x: number; y: number; label: 0 | 1 }>>([
    { x: 1.8, y: 7.2, label: 0 },
    { x: 2.8, y: 8.5, label: 0 },
    { x: 3.2, y: 5.5, label: 0 },
    { x: 4.5, y: 6.8, label: 0 },
    { x: 5.2, y: 3.8, label: 1 },
    { x: 6.5, y: 2.8, label: 1 },
    { x: 7.2, y: 4.8, label: 1 },
    { x: 8.5, y: 3.2, label: 1 },
  ]);
  const [activeLabel, setActiveLabel] = useState<0 | 1>(0);

  const stumps = useMemo(() => [
    { thresh: 4.8, dim: "x" as const, dir: 1, alpha: 1.2 },
    { thresh: 5.2, dim: "y" as const, dir: -1, alpha: 0.9 },
    { thresh: 3.8, dim: "x" as const, dir: 1, alpha: 0.7 },
    { thresh: 6.0, dim: "y" as const, dir: -1, alpha: 0.5 },
    { thresh: 7.2, dim: "x" as const, dir: -1, alpha: 0.4 },
  ], []);

  const predictStump = (x: number, y: number, stump: typeof stumps[0]) => {
    const val = stump.dim === "x" ? x : y;
    if (stump.dir === 1) {
      return val > stump.thresh ? 1 : 0;
    } else {
      return val < stump.thresh ? 1 : 0;
    }
  };

  const predictEnsemble = useCallback((x: number, y: number, limit: number) => {
    let score = 0;
    for (let i = 0; i < limit; i++) {
      const stump = stumps[i];
      const pred = predictStump(x, y, stump);
      const sign = pred === 1 ? 1 : -1;
      score += stump.alpha * sign;
    }
    return score >= 0 ? 1 : 0;
  }, [stumps]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const step = 8;
    for (let px = plotConfig.left; px < plotConfig.right; px += step) {
      for (let py = plotConfig.top; py < plotConfig.bottom; py += step) {
        const dx = fromXPixel(px + step / 2);
        const dy = fromYPixel(py + step / 2);
        const pred = predictEnsemble(dx, dy, stumpCount);

        ctx.fillStyle = pred === 1 ? "rgba(141, 81, 73, 0.07)" : "rgba(85, 107, 74, 0.07)";
        ctx.fillRect(px, py, step, step);
      }
    }

    for (let i = 0; i < stumpCount; i++) {
      const stump = stumps[i];
      if (stump.dim === "x") {
        const sx = toXPixel(stump.thresh);
        drawHelper.line(ctx, sx, plotConfig.top, sx, plotConfig.bottom, COLORS.yellow, 1.2, [4, 4]);
      } else {
        const sy = toYPixel(stump.thresh);
        drawHelper.line(ctx, plotConfig.left, sy, plotConfig.right, sy, COLORS.yellow, 1.2, [4, 4]);
      }
    }

    points.forEach((p) => {
      const px = toXPixel(p.x);
      const py = toYPixel(p.y);
      drawHelper.point(ctx, px, py, p.label === 0 ? COLORS.cyan : COLORS.pink, "reticle", 5.5);
    });
  }, [points, stumpCount, stumps, predictEnsemble]);

  const ensembleAccuracy = useMemo(() => {
    if (points.length === 0) return 0;
    let correct = 0;
    points.forEach((p) => {
      const pred = predictEnsemble(p.x, p.y, stumpCount);
      if (pred === p.label) correct++;
    });
    return (correct / points.length) * 100;
  }, [points, stumpCount, predictEnsemble]);

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0.5 && dataX <= 9.5 && dataY >= 0.5 && dataY <= 9.5) {
      setPoints((curr) => [...curr, { x: dataX, y: dataY, label: activeLabel }]);
    }
  };

  const handleReset = () => {
    setPoints([
      { x: 1.8, y: 7.2, label: 0 },
      { x: 2.8, y: 8.5, label: 0 },
      { x: 3.2, y: 5.5, label: 0 },
      { x: 4.5, y: 6.8, label: 0 },
      { x: 5.2, y: 3.8, label: 1 },
      { x: 6.5, y: 2.8, label: 1 },
      { x: 7.2, y: 4.8, label: 1 },
      { x: 8.5, y: 3.2, label: 1 },
    ]);
    setStumpCount(3);
  };

  return (
    <VisualizationShell
      title="Adaptive Ensemble Stumps"
      subtitle="Increase weak learners (stumps) count. Choose Class label, then click the grid workspace to place custom points and watch decision margins warp."
      insight="Ensemble methods combine high-bias 'weak' learners (e.g., decision stumps) into a low-bias 'strong' learner by taking weighted votes of their predictions."
      legend={[
        { label: "Class A (Cyan)", color: COLORS.cyan },
        { label: "Class B (Pink)", color: COLORS.pink },
        { label: "Stump Boundary", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} onClick={handlePlotClick} className="h-full w-full cursor-crosshair" />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click plot space to place custom observations]
          </div>
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            Stumps in use: <span className="font-bold text-pink">{stumpCount}</span>
            <div className="mt-1 text-on-surface-variant font-bold normal-case">
              Ensemble Accuracy: <span className="font-bold text-cyan">{ensembleAccuracy.toFixed(0)}%</span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Class to Add</span>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setActiveLabel(0)}
                className={`flex-1 border px-3 py-2 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  activeLabel === 0 ? "bg-cyan text-on-primary border-cyan" : "bg-surface hover:bg-cyan/10"
                }`}
              >
                Class A (Cyan)
              </button>
              <button
                onClick={() => setActiveLabel(1)}
                className={`flex-1 border px-3 py-2 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  activeLabel === 1 ? "bg-pink text-on-primary border-pink" : "bg-surface hover:bg-pink/10"
                }`}
              >
                Class B (Pink)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Number of Weak Learners</span>
            <div className="flex justify-between font-bold">
              <span>Stumps Limit</span>
              <span className="text-warning font-bold">{stumpCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={stumpCount}
              onChange={(e) => setStumpCount(parseInt(e.target.value))}
              className="w-full accent-primary my-1"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Reset Space
            </button>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
