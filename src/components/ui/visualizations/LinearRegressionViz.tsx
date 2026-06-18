"use client";

import React, { useState, useRef } from "react";
import { animate, motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 420;

// Predict house price (£k) from four features at once.
const FEATURES = ["size", "bedrooms", "age", "dist to city"];
const W_TRUE = [120, 28, -22, -38]; // £k per (normalised) unit of each feature
const BIAS_TRUE = 150;
// 7 houses, feature values normalised to [0,1]
const HOUSES = [
  [0.9, 0.8, 0.2, 0.3],
  [0.4, 0.5, 0.7, 0.6],
  [0.7, 0.6, 0.4, 0.2],
  [0.2, 0.3, 0.9, 0.8],
  [0.95, 0.9, 0.1, 0.5],
  [0.55, 0.4, 0.5, 0.9],
  [0.3, 0.7, 0.6, 0.45],
];
const NOISE = [5, -7, 4, -3, 6, -5, 3];
const ACTUALS = HOUSES.map((h, i) => BIAS_TRUE + h.reduce((s, x, j) => s + W_TRUE[j] * x, 0) + NOISE[i]);
const MEAN = ACTUALS.reduce((s, v) => s + v, 0) / ACTUALS.length;
const SST = ACTUALS.reduce((s, v) => s + (v - MEAN) ** 2, 0);

// price <-> pixel for the predicted-vs-actual square
const PMIN = 100;
const PMAX = 340;
const plot = { left: 70, right: 350, top: 56, bottom: 336 };
const sx = (p: number) => plot.left + ((p - PMIN) / (PMAX - PMIN)) * (plot.right - plot.left);
const sy = (p: number) => plot.bottom - ((p - PMIN) / (PMAX - PMIN)) * (plot.bottom - plot.top);

export default function LinearRegressionViz() {
  const [p, setP] = useState(0); // training progress 0..1
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  // weights and bias at this training progress (recovering the true relationship)
  const w = W_TRUE.map((wt) => wt * p);
  const bias = MEAN + (BIAS_TRUE - MEAN) * p;
  const predict = (h: number[]) => bias + h.reduce((s, x, j) => s + w[j] * x, 0);
  const preds = HOUSES.map(predict);
  const sse = preds.reduce((s, pr, i) => s + (pr - ACTUALS[i]) ** 2, 0);
  const r2 = Math.max(0, 1 - sse / SST);

  const animateTo = (target: number) => {
    animRef.current?.stop();
    animRef.current = animate(p, target, {
      duration: 1.3,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: setP,
    });
  };

  const caption =
    p < 0.05
      ? "Untrained: every weight is zero, so the model guesses the same average price for every house — all dots sit in a vertical line, far off the diagonal."
      : p < 0.92
        ? "Training nudges all four weights together; each prediction slides toward the diagonal, where predicted price = actual price."
        : "Trained: predictions land on the diagonal. The weight bars now show how much each feature moves the price — size and bedrooms push it up, age and distance pull it down.";

  // weight-bar panel geometry
  const barX0 = 530; // zero line
  const barScale = 1.05; // px per £k
  const barTop = 80;
  const barGap = 56;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Multivariable Linear Regression Fit">
      <title>Multivariable Linear Regression</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* predicted vs actual */}
      <text x={plot.left} y={plot.top - 22} fill={COLORS.muted} fontSize={12} fontWeight={800}>PREDICTED vs ACTUAL PRICE</text>
      <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} fill="none" stroke={COLORS.border} />
      {/* perfect-prediction diagonal */}
      <line x1={sx(PMIN)} y1={sy(PMIN)} x2={sx(PMAX)} y2={sy(PMAX)} stroke={COLORS.cyan} strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={sx(PMAX) - 4} y={sy(PMAX) + 16} textAnchor="end" fill={COLORS.cyan} fontSize={10} fontWeight={700}>predicted = actual</text>
      <text x={(plot.left + plot.right) / 2} y={plot.bottom + 26} textAnchor="middle" fill={COLORS.muted} fontSize={11}>predicted →</text>
      <text x={plot.left - 16} y={(plot.top + plot.bottom) / 2} textAnchor="middle" fill={COLORS.muted} fontSize={11} transform={`rotate(-90 ${plot.left - 16} ${(plot.top + plot.bottom) / 2})`}>actual →</text>

      {HOUSES.map((h, i) => {
        const pr = preds[i];
        return (
          <g key={i}>
            {/* residual: vertical gap to the diagonal */}
            <line x1={sx(pr)} y1={sy(ACTUALS[i])} x2={sx(pr)} y2={sy(pr)} stroke={COLORS.yellow} strokeWidth={1.5} strokeDasharray="2 2" />
            <motion.circle cx={sx(pr)} cy={sy(ACTUALS[i])} r={6} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={1.5} animate={{ cx: sx(pr), cy: sy(ACTUALS[i]) }} transition={{ duration: 0.2 }} />
          </g>
        );
      })}

      {/* weight bars (the learned model) */}
      <text x={420} y={plot.top - 22} fill={COLORS.muted} fontSize={12} fontWeight={800}>LEARNED WEIGHT PER FEATURE (£k)</text>
      <line x1={barX0} y1={barTop - 14} x2={barX0} y2={barTop + 4 * barGap - 30} stroke={COLORS.border} strokeWidth={1} />
      {FEATURES.map((name, j) => {
        const y = barTop + j * barGap;
        const val = w[j];
        const wpx = val * barScale;
        return (
          <g key={name}>
            <text x={420} y={y - 6} fill={COLORS.muted} fontSize={12} fontWeight={700}>{name}</text>
            <motion.rect
              x={wpx >= 0 ? barX0 : barX0 + wpx}
              y={y}
              width={Math.abs(wpx)}
              height={16}
              fill={val >= 0 ? COLORS.cyan : COLORS.pink}
              animate={{ x: wpx >= 0 ? barX0 : barX0 + wpx, width: Math.abs(wpx) }}
              transition={{ duration: 0.2 }}
            />
            <text x={barX0 + wpx + (val >= 0 ? 6 : -6)} y={y + 13} textAnchor={val >= 0 ? "start" : "end"} fill={COLORS.muted} fontSize={11} fontWeight={700}>
              {val >= 0 ? "+" : ""}{val.toFixed(0)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <label htmlFor="lr-train" className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Training progress</label>
        <input id="lr-train" type="range" min={0} max={1} step={0.01} value={p} onChange={(e) => { animRef.current?.stop(); setP(Number(e.target.value)); }} aria-label="Training progress" className="w-full cursor-pointer accent-primary" />
        <div className="flex gap-2">
          <button onClick={() => animateTo(1)} aria-label="Fit the weights with gradient descent" className="flex h-9 flex-1 items-center justify-center border border-outline bg-cyan px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-white hover:bg-cyan/90">Fit weights</button>
          <button onClick={() => animateTo(0)} aria-label="Reset the weights" className="flex h-9 flex-1 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant hover:bg-surface-container">Reset</button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        <div className="flex items-baseline justify-between gap-3"><span className="text-[11px] font-bold uppercase text-on-surface-variant">Sum of squared error</span><span data-testid="linear-regression-sse" className="text-lg font-bold" style={{ color: COLORS.pink }}>{sse.toFixed(0)}</span></div>
        <div className="flex items-baseline justify-between gap-3"><span className="text-[11px] font-bold uppercase text-on-surface-variant">R² (variance explained)</span><span data-testid="linear-regression-r2" className="text-lg font-bold" style={{ color: COLORS.cyan }}>{r2.toFixed(2)}</span></div>
        <span className="text-[11px] text-on-surface-variant">price = bias + Σ wᵢ · featureᵢ</span>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      Real models predict from <strong>many features at once</strong>: price = bias
      + w₁·size + w₂·bedrooms + … Each weight says how much that feature moves the
      prediction, and its sign says which way. <strong>Training</strong> tunes all
      the weights together to minimise the total squared error — pulling every
      predicted price onto the diagonal where it equals the actual price. The same
      idea scales from these four features to the millions of weights inside a deep
      network.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
