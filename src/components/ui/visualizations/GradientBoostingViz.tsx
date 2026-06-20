"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

// Deterministic 1D regression data: y = target(x) + fixed wiggle. No randomness.
const N_PTS = 28;

function hash(i: number) {
  const x = Math.sin((i + 1) * 91.7) * 43758.5453;
  return x - Math.floor(x); // [0,1)
}

const DATA: { x: number; y: number }[] = (() => {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < N_PTS; i++) {
    const x = i / (N_PTS - 1);
    const signal = Math.sin(6.0 * x) * 0.6 + 0.3 * x;
    const wiggle = (hash(i) - 0.5) * 0.18; // deterministic "noise"
    out.push({ x, y: signal + wiggle });
  }
  return out;
})();

// Fit a depth-1 regression stump to (x, residual) by minimizing SSE.
function fitStump(resid: number[]) {
  const xs = DATA.map((d) => d.x);
  let best = { split: 0.5, left: 0, right: 0, sse: Infinity };
  for (let s = 1; s < N_PTS; s++) {
    const split = (xs[s - 1] + xs[s]) / 2;
    let lSum = 0;
    let lN = 0;
    let rSum = 0;
    let rN = 0;
    for (let i = 0; i < N_PTS; i++) {
      if (xs[i] < split) {
        lSum += resid[i];
        lN++;
      } else {
        rSum += resid[i];
        rN++;
      }
    }
    const left = lN === 0 ? 0 : lSum / lN;
    const right = rN === 0 ? 0 : rSum / rN;
    let sse = 0;
    for (let i = 0; i < N_PTS; i++) {
      const pred = xs[i] < split ? left : right;
      sse += (resid[i] - pred) ** 2;
    }
    if (sse < best.sse) best = { split, left, right, sse };
  }
  return best;
}

type Stump = { split: number; left: number; right: number };

function boost(nTrees: number, lr: number) {
  const ys = DATA.map((d) => d.y);
  const base = ys.reduce((a, b) => a + b, 0) / N_PTS;
  const F = new Array(N_PTS).fill(base);
  const stumps: Stump[] = [];
  for (let m = 0; m < nTrees; m++) {
    const resid = ys.map((y, i) => y - F[i]);
    const s = fitStump(resid);
    stumps.push({ split: s.split, left: s.left, right: s.right });
    for (let i = 0; i < N_PTS; i++) {
      F[i] += lr * (DATA[i].x < s.split ? s.left : s.right);
    }
  }
  const predictAt = (x: number) => {
    let v = base;
    for (const s of stumps) v += lr * (x < s.split ? s.left : s.right);
    return v;
  };
  const mse = ys.reduce((acc, y, i) => acc + (y - F[i]) ** 2, 0) / N_PTS;
  return { predictAt, mse, base };
}

export default function GradientBoostingViz() {
  const [nTrees, setNTrees] = useState(5);
  const [lr, setLr] = useState(0.3);

  const { predictAt, mse } = useMemo(() => boost(nTrees, lr), [nTrees, lr]);

  // --- SVG geometry ---
  const W = 360;
  const H = 230;
  const pad = 26;
  const allY = [...DATA.map((d) => d.y), 1.1, -0.9];
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  const sx = (x: number) => pad + x * (W - 2 * pad);
  const sy = (y: number) => {
    const den = yMax - yMin;
    const t = den === 0 ? 0.5 : (y - yMin) / den;
    return H - pad - t * (H - 2 * pad);
  };

  const STEPS = 120;
  const curve = Array.from({ length: STEPS + 1 }, (_, k) => {
    const x = k / STEPS;
    return `${k === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(predictAt(x)).toFixed(1)}`;
  }).join(" ");

  const canvas = (
    <div
      role="img"
      aria-label="Gradient Boosting Stage-wise Residual Fitting"
      className="flex flex-col gap-3 p-4 font-sans"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true">
        <rect x={0} y={0} width={W} height={H} fill={COLORS.bg} />
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={COLORS.border} />
        {/* residual sticks: data point to current prediction */}
        {DATA.map((d, i) => (
          <line
            key={`r-${i}`}
            x1={sx(d.x)}
            y1={sy(d.y)}
            x2={sx(d.x)}
            y2={sy(predictAt(d.x))}
            stroke={COLORS.yellow}
            strokeWidth={1.2}
          />
        ))}
        {/* ensemble prediction */}
        <path d={curve} fill="none" stroke={COLORS.cyan} strokeWidth={2.5} />
        {/* data points */}
        {DATA.map((d, i) => (
          <circle key={`p-${i}`} cx={sx(d.x)} cy={sy(d.y)} r={3} fill={COLORS.pink} />
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: COLORS.pink }} /> data
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3" style={{ background: COLORS.cyan }} /> ensemble F(x)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3" style={{ background: COLORS.yellow }} /> residual (what&apos;s left)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Trees" value={String(nTrees)} />
        <Stat label="Learning rate" value={lr.toFixed(2)} />
        <Stat label="Train MSE" value={mse.toFixed(3)} />
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Number of trees
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={nTrees}
            aria-label="Number of trees"
            onChange={(e) => setNTrees(Number(e.target.value))}
            className="w-44"
          />
          <span className="w-8 text-right font-mono text-[13px] font-bold text-on-surface">
            {nTrees}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Learning rate ν
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={lr}
            aria-label="Learning rate"
            onChange={(e) => setLr(Number(e.target.value))}
            className="w-44"
          />
          <span className="w-10 text-right font-mono text-[13px] font-bold text-on-surface">
            {lr.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  const caption =
    nTrees === 0
      ? `With zero trees the ensemble is just the mean of y — a flat line, and every yellow residual is large. Add trees to start correcting the errors.`
      : nTrees <= 3
        ? `After ${nTrees} shallow ${nTrees === 1 ? "tree" : "trees"}, the prediction is a coarse step function and big residuals remain. Each tree only fixes the largest current errors.`
        : `${nTrees} trees at ν = ${lr.toFixed(2)} have driven train MSE to ${mse.toFixed(3)}. A smaller learning rate needs more trees but tracks the data more smoothly; crank both and you will start fitting the wiggle (noise).`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Boosting starts dumb: the prediction is just the average of all the
        targets. The yellow sticks are the <strong>residuals</strong> — how far
        each point still is from the prediction.
      </p>
      <p>
        Each new tree is a shallow step function fit to <em>those residuals</em>,
        and only a fraction <code>ν</code> of it (the <strong>learning rate</strong>)
        is added. So every tree nudges the green curve a little closer to the data
        — gradient descent taken one tree-shaped step at a time.
      </p>
      <p>
        Watch the trade-off: more trees and a larger learning rate shrink the
        training error, but push them too far and the curve starts chasing the
        random wiggle. That is why real boosting uses a small <code>ν</code>, many
        trees, and <strong>early stopping</strong> on a validation set.
      </p>
    </div>
  );

  return (
    <VizShell
      canvas={canvas}
      controls={controls}
      caption={caption}
      mentalModel={mentalModel}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-outline bg-surface px-3 py-2">
      <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </div>
      <div className="font-mono text-lg font-bold text-primary">{value}</div>
    </div>
  );
}
