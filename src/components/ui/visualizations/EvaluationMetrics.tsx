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

// Analytical Normal Cumulative Distribution Function (CDF)
function normalCDF(x: number, mean: number, std: number) {
  const z = (x - mean) / std;
  const t = 1.0 / (1.0 + 0.5 * Math.abs(z));
  const ans =
    1.0 -
    t *
      Math.exp(
        -z * z / 2.0 -
          1.26551223 +
          t *
            (1.00002368 +
              t *
                (0.37409196 +
                  t *
                    (0.09678418 +
                      t *
                        (-0.18628802 +
                          t *
                            (0.27886807 +
                              t *
                                (-1.13520398 +
                                  t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))
      );
  return z >= 0 ? 0.5 + 0.5 * ans : 0.5 - 0.5 * ans;
}

// Probability Density Function (PDF)
function normalPDF(x: number, mean: number, std: number) {
  const exponent = Math.exp(-Math.pow(x - mean, 2) / (2 * std * std));
  return (1 / (std * Math.sqrt(2 * Math.PI))) * exponent;
}

export default function EvaluationMetricsVisualization() {
  const [threshold, setThreshold] = useState<number>(5.0);

  const muNeg = 3.8;
  const muPos = 6.2;
  const std = 1.15;

  // Calculate Confusion Matrix values analytically (N = 100 per population)
  const metrics = useMemo(() => {
    const TN = normalCDF(threshold, muNeg, std) * 100;
    const FP = 100 - TN;
    const FN = normalCDF(threshold, muPos, std) * 100;
    const TP = 100 - FN;

    const precision = TP + FP > 0 ? TP / (TP + FP) : 0;
    const recall = TP + FN > 0 ? TP / (TP + FN) : 0; // True Positive Rate (TPR)
    const fpr = FP + TN > 0 ? FP / (FP + TN) : 0; // False Positive Rate (FPR)
    const accuracy = (TP + TN) / 200;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const auc = normalCDF((muPos - muNeg) / (Math.sqrt(2) * std), 0, 1);

    return {
      TP,
      FP,
      TN,
      FN,
      precision,
      recall,
      fpr,
      accuracy,
      f1,
      auc,
    };
  }, [threshold]);

  // Pre-calculate ROC curve line points
  const rocPoints = useMemo(() => {
    const pts = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 10;
      const tn = normalCDF(t, muNeg, std) * 100;
      const fp = 100 - tn;
      const fn = normalCDF(t, muPos, std) * 100;
      const tp = 100 - fn;

      const fpr = fp / 100;
      const tpr = tp / 100;
      pts.push({ fpr, tpr });
    }
    return pts;
  }, []);

  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // 1. Draw Population Distributions (Left curve chart)
      const popX = 40;
      const popY = 175;
      const popW = 180;
      const popH = 100;

      ctx.save();
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(popX, popY);
      ctx.lineTo(popX + popW, popY);
      ctx.moveTo(popX, popY);
      ctx.lineTo(popX, popY - popH);
      ctx.stroke();
      ctx.restore();

      const curveSteps = 80;
      const maxPdfVal = normalPDF(muNeg, muNeg, std);

      const toPopX = (x: number) => popX + (x / 10) * popW;
      const toPopY = (pdf: number) => popY - (pdf / maxPdfVal) * (popH - 10);

      // Negative Distribution Fill & Line
      ctx.save();
      ctx.fillStyle = "rgba(141, 81, 73, 0.08)";
      ctx.strokeStyle = COLORS.pink;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(toPopX(0), toPopY(0));
      for (let i = 0; i <= curveSteps; i++) {
        const x = (i / curveSteps) * 10;
        ctx.lineTo(toPopX(x), toPopY(normalPDF(x, muNeg, std)));
      }
      ctx.lineTo(toPopX(10), toPopY(0));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Positive Distribution Fill & Line
      ctx.save();
      ctx.fillStyle = "rgba(85, 107, 74, 0.08)";
      ctx.strokeStyle = COLORS.green;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(toPopX(0), toPopY(0));
      for (let i = 0; i <= curveSteps; i++) {
        const x = (i / curveSteps) * 10;
        ctx.lineTo(toPopX(x), toPopY(normalPDF(x, muPos, std)));
      }
      ctx.lineTo(toPopX(10), toPopY(0));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Draw threshold slider line
      const tx = toPopX(threshold);
      ctx.save();
      ctx.strokeStyle = COLORS.yellow;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(tx, popY);
      ctx.lineTo(tx, popY - popH);
      ctx.stroke();
      ctx.restore();

      drawHelper.text(ctx, "Negatives", toPopX(muNeg), popY + 8, COLORS.pink, "bold 7px var(--font-mono)", "center");
      drawHelper.text(ctx, "Positives", toPopX(muPos), popY + 8, COLORS.green, "bold 7px var(--font-mono)", "center");
      drawHelper.text(ctx, `t = ${threshold.toFixed(1)}`, tx, popY - popH - 4, COLORS.yellow, "bold 6px var(--font-mono)", "center");

      // 2. Draw ROC Curve (Right square chart)
      const rocX = 280;
      const rocY = 175;
      const rocSide = 100;

      ctx.save();
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(rocX, rocY - rocSide, rocSide, rocSide);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(111, 102, 88, 0.25)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(rocX, rocY);
      ctx.lineTo(rocX + rocSide, rocY - rocSide);
      ctx.stroke();
      ctx.restore();

      const toRocX = (fpr: number) => rocX + fpr * rocSide;
      const toRocY = (tpr: number) => rocY - tpr * rocSide;

      ctx.save();
      ctx.strokeStyle = COLORS.cyan;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(toRocX(rocPoints[0].fpr), toRocY(rocPoints[0].tpr));
      for (let i = 1; i < rocPoints.length; i++) {
        ctx.lineTo(toRocX(rocPoints[i].fpr), toRocY(rocPoints[i].tpr));
      }
      ctx.stroke();
      ctx.restore();

      const activeRocX = toRocX(metrics.fpr);
      const activeRocY = toRocY(metrics.recall);
      drawHelper.point(ctx, activeRocX, activeRocY, COLORS.yellow, "reticle", 4.5);

      drawHelper.text(ctx, "ROC Curve", rocX + rocSide / 2, rocY - rocSide - 6, COLORS.cyan, "bold 7px var(--font-mono)", "center");
      drawHelper.text(ctx, "FPR", rocX + rocSide / 2, rocY + 8, COLORS.muted, "5px var(--font-mono)", "center");

      ctx.save();
      ctx.translate(rocX - 8, rocY - rocSide / 2);
      ctx.rotate(-Math.PI / 2);
      drawHelper.text(ctx, "TPR (Recall)", 0, 0, COLORS.muted, "5px var(--font-mono)", "center");
      ctx.restore();

      drawHelper.cropMarks(ctx, 420, 220);
    },
    [threshold, metrics, rocPoints]
  );

  const handleReset = () => {
    setThreshold(5.0);
  };

  return (
    <VisualizationShell
      title="Confusion Matrix & ROC curve (Evaluation Diagnostics)"
      subtitle="Slide Decision Threshold (t) to change classification sensitivity. Notice how TP, FP, TN, and FN shift balances."
      insight="Overlapping population scores cause a trade-off: sliding threshold left catches all Positives (Recall = 100%) but triggers massive False Alarms (Precision drops). Sliding right boosts precision but misses targets."
      legend={[
        { label: "Negative Distribution", color: COLORS.pink },
        { label: "Positive Distribution", color: COLORS.green },
        { label: "ROC Curve", color: COLORS.cyan },
        { label: "Operating Point", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot
            viewBoxWidth={420} // Wider canvas coordinates
            onDraw={onDraw}
            className="h-full w-full"
          />
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Decision Threshold (t)</span>
              <span className="text-pink font-bold">{threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="9.5"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="border border-outline bg-surface rounded p-3 font-mono text-[9px] text-on-surface">
            <span className="block font-bold uppercase tracking-wide text-primary mb-2 text-center">Confusion Matrix (N=200)</span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="border border-outline bg-surface-container p-2 flex flex-col justify-center">
                <span className="text-on-surface-variant font-medium text-[8px] uppercase">True Pos (TP)</span>
                <span className="font-bold text-green text-[13px] mt-0.5">{metrics.TP.toFixed(0)}</span>
              </div>
              <div className="border border-outline bg-surface-container p-2 flex flex-col justify-center">
                <span className="text-on-surface-variant font-medium text-[8px] uppercase">False Pos (FP)</span>
                <span className="font-bold text-pink text-[13px] mt-0.5">{metrics.FP.toFixed(0)}</span>
              </div>
              <div className="border border-outline bg-surface-container p-2 flex flex-col justify-center">
                <span className="text-on-surface-variant font-medium text-[8px] uppercase">False Neg (FN)</span>
                <span className="font-bold text-pink text-[13px] mt-0.5">{metrics.FN.toFixed(0)}</span>
              </div>
              <div className="border border-outline bg-surface-container p-2 flex flex-col justify-center">
                <span className="text-on-surface-variant font-medium text-[8px] uppercase">True Neg (TN)</span>
                <span className="font-bold text-green text-[13px] mt-0.5">{metrics.TN.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="border border-outline rounded bg-surface-container-lowest/60 px-4 py-3 font-mono text-[10px] leading-relaxed text-on-surface-variant">
            <span className="font-bold uppercase text-primary">Performance Diagnostics:</span>
            <div className="mt-1 flex justify-between">
              <span>Accuracy:</span>
              <span className="font-bold text-on-surface">{(metrics.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-0.5 flex justify-between">
              <span>Precision:</span>
              <span className="font-bold text-cyan">{(metrics.precision * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-0.5 flex justify-between">
              <span>Recall (TPR):</span>
              <span className="font-bold text-green">{(metrics.recall * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-0.5 flex justify-between">
              <span>F1-Score:</span>
              <span className="font-bold text-pink">{(metrics.f1 * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-1 border-t border-outline/30 pt-1 flex justify-between">
              <span>ROC Area (AUC):</span>
              <span className="font-bold text-yellow">{metrics.auc.toFixed(3)}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset threshold
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
