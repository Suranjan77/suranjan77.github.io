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

// Shift and scale mapping bounds so center (0,0) and target (6,5) fit comfortably
const toXPixel = (w1: number) => 40 + ((w1 + 4) / 13) * 256;
const toYPixel = (w2: number) => 190 - ((w2 + 3) / 12) * 166;

// Loss function L0(w1, w2) = (w1 - 6)^2 + 2.5 * (w2 - 5)^2
const unregularizedOpt = { w1: 6, w2: 5 };
function getLoss(w1: number, w2: number) {
  return Math.pow(w1 - unregularizedOpt.w1, 2) + 2.5 * Math.pow(w2 - unregularizedOpt.w2, 2);
}

export default function RegularizationVisualization() {
  const [regType, setRegType] = useState<"L1" | "L2">("L1");
  const [C, setC] = useState<number>(3.5); // Constraint radius

  // Find optimal weights numerically by sweeping the boundary of the constraint
  // w1, w2 must satisfy: L1: |w1| + |w2| <= C, L2: w1^2 + w2^2 <= C^2
  const solvedOpt = useMemo(() => {
    const inside =
      regType === "L1"
        ? Math.abs(unregularizedOpt.w1) + Math.abs(unregularizedOpt.w2) <= C
        : Math.pow(unregularizedOpt.w1, 2) + Math.pow(unregularizedOpt.w2, 2) <= C * C;

    if (inside) {
      return { w1: unregularizedOpt.w1, w2: unregularizedOpt.w2, loss: 0 };
    }

    let bestW1 = 0;
    let bestW2 = 0;
    let minLoss = Infinity;

    if (regType === "L2") {
      const steps = 360;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const w1 = C * Math.cos(angle);
        const w2 = C * Math.sin(angle);
        const loss = getLoss(w1, w2);
        if (loss < minLoss) {
          minLoss = loss;
          bestW1 = w1;
          bestW2 = w2;
        }
      }
    } else {
      const steps = 100;
      const checkPoint = (w1: number, w2: number) => {
        const loss = getLoss(w1, w2);
        if (loss < minLoss) {
          minLoss = loss;
          bestW1 = w1;
          bestW2 = w2;
        }
      };

      for (let i = 0; i <= steps; i++) {
        const w1 = (i / steps) * C;
        checkPoint(w1, C - w1);
        checkPoint(w1, w1 - C);
        checkPoint(-w1, w1 - C);
        checkPoint(-w1, C - w1);
      }
    }

    return { w1: bestW1, w2: bestW2, loss: minLoss };
  }, [regType, C]);

  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Draw parameter axes (centered at 0, 0)
      ctx.save();
      ctx.strokeStyle = "rgba(190, 182, 165, 0.6)";
      ctx.lineWidth = 1;
      // W1-axis
      ctx.beginPath();
      ctx.moveTo(toXPixel(-4), toYPixel(0));
      ctx.lineTo(toXPixel(9), toYPixel(0));
      ctx.stroke();
      // W2-axis
      ctx.beginPath();
      ctx.moveTo(toXPixel(0), toYPixel(-3));
      ctx.lineTo(toXPixel(0), toYPixel(9));
      ctx.stroke();
      ctx.restore();

      // Axis labels
      drawHelper.text(ctx, "w1", toXPixel(8.5), toYPixel(-0.5), COLORS.muted, "bold 7px var(--font-mono)", "right");
      drawHelper.text(ctx, "w2", toXPixel(0.3), toYPixel(8.5), COLORS.muted, "bold 7px var(--font-mono)", "left");

      // Draw constraint region (green fill)
      ctx.save();
      ctx.fillStyle = "rgba(85, 107, 74, 0.12)";
      ctx.strokeStyle = COLORS.green;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      if (regType === "L2") {
        for (let angle = 0; angle <= Math.PI * 2 + 0.05; angle += 0.05) {
          const w1 = C * Math.cos(angle);
          const w2 = C * Math.sin(angle);
          const px = toXPixel(w1);
          const py = toYPixel(w2);
          if (angle === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      } else {
        ctx.moveTo(toXPixel(0), toYPixel(C));
        ctx.lineTo(toXPixel(C), toYPixel(0));
        ctx.lineTo(toXPixel(0), toYPixel(-C));
        ctx.lineTo(toXPixel(-C), toYPixel(0));
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Draw unregularized optimum point w*
      const wStarX = toXPixel(unregularizedOpt.w1);
      const wStarY = toYPixel(unregularizedOpt.w2);
      drawHelper.point(ctx, wStarX, wStarY, COLORS.cyan, "reticle", 5.5);
      drawHelper.text(ctx, "w* (Optimal)", wStarX + 8, wStarY - 2, COLORS.cyan, "bold 7px var(--font-mono)");

      // Draw concentric loss ellipses centered at w* (smaller radii to avoid clipping)
      ctx.save();
      ctx.strokeStyle = "rgba(141, 81, 73, 0.22)";
      ctx.lineWidth = 1.0;
      const numLossContours = 5;
      for (let i = 1; i <= numLossContours; i++) {
        const radius = i * 0.9;
        ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2 + 0.05; angle += 0.05) {
          const ex = unregularizedOpt.w1 + radius * Math.cos(angle);
          const ey = unregularizedOpt.w2 + (radius / Math.sqrt(2.5)) * Math.sin(angle);
          const px = toXPixel(ex);
          const py = toYPixel(ey);
          if (angle === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Draw optimal intersected loss ellipse
      if (solvedOpt) {
        ctx.save();
        ctx.strokeStyle = COLORS.pink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const touchLoss = getLoss(solvedOpt.w1, solvedOpt.w2);
        const radius = Math.sqrt(touchLoss);
        for (let angle = 0; angle <= Math.PI * 2 + 0.05; angle += 0.05) {
          const ex = unregularizedOpt.w1 + radius * Math.cos(angle);
          const ey = unregularizedOpt.w2 + (radius / Math.sqrt(2.5)) * Math.sin(angle);
          const px = toXPixel(ex);
          const py = toYPixel(ey);
          if (angle === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw solved optimal regularized point
      if (solvedOpt) {
        const rx = toXPixel(solvedOpt.w1);
        const ry = toYPixel(solvedOpt.w2);
        drawHelper.point(ctx, rx, ry, COLORS.yellow, "reticle", 6);
        drawHelper.text(ctx, "w_reg", rx + 8, ry + 6, COLORS.yellow, "bold 7px var(--font-mono)");
      }
    },
    [regType, C, solvedOpt]
  );

  const handleReset = () => {
    setRegType("L1");
    setC(3.5);
  };

  return (
    <VisualizationShell
      title="L1 vs L2 Parameter Constraints"
      subtitle="Toggle L1 Lasso vs L2 Ridge, and slide C to shrink the parameters budget. Observe how contours intersect the boundaries."
      insight="L1 regularization (diamond constraint) has sharp corners on the axes, so the optimum often lands with one coefficient exactly zero. L2 (circle constraint) shrinks parameters smoothly without that sparsity pressure."
      legend={[
        { label: "Unregularized w*", color: COLORS.cyan },
        { label: "Optimal Regularized w_reg", color: COLORS.yellow },
        { label: "Constraint Bound (C)", color: COLORS.green },
        { label: "Intersecting Contour", color: COLORS.pink },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-xs text-on-surface sm:text-[11px]">
            <span className="font-bold uppercase tracking-wide text-primary">Penalty Geometry</span>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setRegType("L1")}
                className={`flex-1 border px-3 py-2.5 rounded text-xs font-bold uppercase transition-all cursor-pointer sm:py-2 sm:text-[9px] ${
                  regType === "L1" ? "bg-primary text-on-primary border-primary" : "bg-surface hover:bg-primary/10"
                }`}
              >
                L1 (Lasso Diamond)
              </button>
              <button
                onClick={() => setRegType("L2")}
                className={`flex-1 border px-3 py-2.5 rounded text-xs font-bold uppercase transition-all cursor-pointer sm:py-2 sm:text-[9px] ${
                  regType === "L2" ? "bg-primary text-on-primary border-primary" : "bg-surface hover:bg-primary/10"
                }`}
              >
                L2 (Ridge Circle)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-xs text-on-surface sm:text-[11px]">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Constraint Radius (C)</span>
              <span className="text-pink font-bold">{C.toFixed(1)}</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-normal sm:text-[9px]">
              Smaller C enforces tighter regularization, shrinking parameters. Larger C expands the budget.
            </p>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.1"
              value={C}
              onChange={(e) => setC(parseFloat(e.target.value))}
              className="mt-1 w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="border border-outline rounded bg-surface-container-lowest/60 px-4 py-3 font-mono text-xs leading-relaxed text-on-surface-variant sm:text-[10px]">
            <span className="font-bold uppercase text-primary">Fitted Parameters:</span>
            <div className="mt-1">
              Weight 1 (w₁): <span className="font-bold text-cyan">{solvedOpt.w1.toFixed(3)}</span>
            </div>
            <div className="mt-0.5">
              Weight 2 (w₂): <span className="font-bold text-pink">{solvedOpt.w2.toFixed(3)}</span>
            </div>
            <div className="mt-1 border-t border-outline/30 pt-1 text-[11px] uppercase tracking-wide sm:text-[8px]">
              {Math.abs(solvedOpt.w1) < 1e-4 || Math.abs(solvedOpt.w2) < 1e-4 ? (
                <span className="font-bold text-green">Sparsity achieved</span>
              ) : (
                <span className="text-on-surface-variant">Both weights active</span>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface px-3 py-2.5 font-mono text-xs font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center sm:py-2 sm:text-[10px]"
          >
            Reset Space
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
