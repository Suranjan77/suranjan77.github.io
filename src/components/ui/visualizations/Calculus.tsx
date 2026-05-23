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

export default function CalculusVisualization() {
  const [xVal, setXVal] = useState(70);
  const [lr, setLr] = useState(0.5);
  const [steps, setSteps] = useState<number[]>([70]);

  const f = (x: number) => {
    const normX = (x - 160) / 100;
    return 110 + 60 * normX * normX + 18 * Math.cos(normX * 9);
  };

  const df = (x: number) => {
    const normX = (x - 160) / 100;
    return 1.2 * normX - 1.62 * Math.sin(normX * 9);
  };

  const handleStep = () => {
    const grad = df(xVal);
    const stepSize = lr * grad * 35;
    const nextX = Math.max(30, Math.min(290, xVal - stepSize));
    setXVal(nextX);
    setSteps((current) => [...current, nextX]);
  };

  const handleReset = () => {
    setXVal(70);
    setSteps([70]);
  };

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    const curvePoints: Array<{ x: number; y: number }> = [];
    for (let x = 30; x <= 290; x += 2) {
      curvePoints.push({ x, y: f(x) });
    }
    drawHelper.path(ctx, curvePoints, COLORS.muted, 2.5);

    const currentY = f(xVal);
    const slope = df(xVal);
    const tx1 = xVal - 30;
    const ty1 = currentY - 30 * slope;
    const tx2 = xVal + 30;
    const ty2 = currentY + 30 * slope;
    drawHelper.line(ctx, tx1, ty1, tx2, ty2, COLORS.pink, 1.2, [4, 4]);

    const grad = df(xVal);
    const stepSize = lr * grad * 35;
    const arrowEndX = xVal - stepSize;
    const arrowEndY = f(arrowEndX);
    drawHelper.line(ctx, xVal, currentY, arrowEndX, arrowEndY, COLORS.yellow, 2.5);
    
    for (let i = 1; i < steps.length; i++) {
      const px = steps[i - 1];
      const py = f(px);
      const cx = steps[i];
      const cy = f(cx);
      drawHelper.line(ctx, px, py, cx, cy, COLORS.cyan, 1.2, [3, 2]);
    }

    steps.forEach((s) => {
      drawHelper.point(ctx, s, f(s), COLORS.cyan, "circle", 3.5);
    });

    drawHelper.point(ctx, xVal, currentY, COLORS.pink, "reticle", 6.5);
  }, [xVal, lr, steps]);

  const currentGradient = df(xVal);

  return (
    <VisualizationShell
      title="Gradient Descent Optimization Landscape"
      subtitle="Interact with the rolling parameter ball. Drag or click Step to compute numerical gradients. Visualise step direction, step size, and rate convergence."
      insight="The learning rate acts as a step scale: if set too low, the ball moves slowly; if set too high, it will overshoot and oscillate."
      legend={[
        { label: "Loss Curve", color: COLORS.muted },
        { label: "Gradient Step", color: COLORS.yellow },
        { label: "Current Point", color: COLORS.pink },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot
            onDraw={onDraw}
            onClick={(x) => setXVal(Math.max(30, Math.min(290, x)))}
            className="h-full w-full cursor-pointer"
          />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click plot curve to place ball]
          </div>
          <div className="absolute left-6 top-6 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            w_next = w - η · (dL/dw)
            <div className="mt-1 text-on-surface-variant normal-case font-bold">
              Gradient: <span className="text-pink">{currentGradient.toFixed(3)}</span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Learning Rate (η)</span>
            <div className="flex justify-between font-bold">
              <span>Step Scale</span>
              <span className="text-warning font-mono font-bold">{lr.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={lr}
              onChange={(e) => setLr(parseFloat(e.target.value))}
              className="w-full accent-primary my-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleStep}
              className="border border-outline rounded bg-primary text-on-primary border-primary px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Take Step
            </button>
            <button
              onClick={handleReset}
              className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2.5 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 hover:text-primary hover:border-primary/50 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Reset Ball
            </button>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
