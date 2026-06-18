"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 340;
const plot = { left: 60, top: 36, right: 660, bottom: 280 };
const RATE_MAX = 0.8;

const scaleX = (rate: number) => plot.left + (rate / RATE_MAX) * (plot.right - plot.left);
const scaleY = (norm: number) => plot.bottom - norm * (plot.bottom - plot.top);

const TRUE_A = 0.3; // hidden true conversion rates
const G = 200; // grid for P(B>A)

// log of the unnormalised Beta(1+conv, 1+n-conv) density at t — in log space so
// large counts (big exponents) don't underflow to zero.
function logBeta(conv: number, n: number, t: number) {
  const ea = conv; // a - 1
  const eb = n - conv; // b - 1
  const lt = ea === 0 ? 0 : t <= 0 ? -Infinity : ea * Math.log(t);
  const l1 = eb === 0 ? 0 : 1 - t <= 0 ? -Infinity : eb * Math.log(1 - t);
  return lt + l1;
}

// Posterior curve, normalised to unit height for display.
function curvePath(conv: number, n: number) {
  const logs: number[] = [];
  const xs: number[] = [];
  let maxLog = -Infinity;
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * RATE_MAX;
    const lg = logBeta(conv, n, t);
    logs.push(lg);
    xs.push(t);
    if (lg > maxLog) maxLog = lg;
  }
  return (
    "M " +
    xs
      .map((t, i) => `${scaleX(t).toFixed(1)} ${scaleY(Math.exp(logs[i] - maxLog)).toFixed(1)}`)
      .join(" L ")
  );
}

// P(B > A) by integrating the two posteriors on a grid (log-space normalised).
function probBbeatsA(convA: number, nA: number, convB: number, nB: number) {
  const pmf = (conv: number, n: number) => {
    const logs: number[] = [];
    let maxLog = -Infinity;
    for (let i = 0; i < G; i++) {
      const t = (i + 0.5) / G;
      const lg = logBeta(conv, n, t);
      logs.push(lg);
      if (lg > maxLog) maxLog = lg;
    }
    const arr = logs.map((lg) => Math.exp(lg - maxLog));
    const sum = arr.reduce((s, v) => s + v, 0);
    return arr.map((v) => v / sum);
  };
  const pa = pmf(convA, nA);
  const pb = pmf(convB, nB);
  let cumA = 0;
  let p = 0;
  for (let i = 0; i < G; i++) {
    p += pb[i] * cumA; // B at i, A strictly below
    cumA += pa[i];
  }
  return p;
}

export default function BayesianInferenceViz() {
  const [trueB, setTrueB] = useState(0.38); // adjustable: how much better B really is
  const [aConv, setAConv] = useState(0);
  const [aN, setAN] = useState(0);
  const [bConv, setBConv] = useState(0);
  const [bN, setBN] = useState(0);

  const collect = (visitors: number) => {
    const half = visitors / 2;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < half; i++) {
      if (Math.random() < TRUE_A) na++;
      if (Math.random() < trueB) nb++;
    }
    setAConv((c) => c + na);
    setAN((n) => n + half);
    setBConv((c) => c + nb);
    setBN((n) => n + half);
  };

  const reset = () => {
    setAConv(0);
    setAN(0);
    setBConv(0);
    setBN(0);
  };

  const totalN = aN + bN;
  const rateA = aN > 0 ? aConv / aN : 0;
  const rateB = bN > 0 ? bConv / bN : 0;
  const pB = probBbeatsA(aConv, aN, bConv, bN);

  const verdict =
    pB > 0.95 ? "ship B — 95%+ confident" : pB < 0.05 ? "keep A — B is worse" : "keep testing — too close";

  const caption =
    totalN === 0
      ? "Two variants, A and B — which converts better? With no data yet, both belief curves are flat: you genuinely have no idea. Send visitors and watch belief take shape."
      : pB > 0.95 || pB < 0.05
        ? `The belief curves have separated and sharpened. P(B beats A) = ${(pB * 100).toFixed(0)}% after ${totalN} visitors — confident enough to decide.`
        : `Early data is noisy, so the two belief curves still overlap — P(B beats A) = ${(pB * 100).toFixed(0)}%. Collect more visitors and watch them sharpen and pull apart.`;

  const ticks = [0, 0.2, 0.4, 0.6, 0.8];

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bayesian A/B Test Belief Update">
      <title>Bayesian A/B Test Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {ticks.map((t) => (
        <g key={t}>
          <line x1={scaleX(t)} y1={plot.top} x2={scaleX(t)} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
          <text x={scaleX(t)} y={plot.bottom + 16} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={700}>{(t * 100).toFixed(0)}%</text>
        </g>
      ))}
      <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <text x={(plot.left + plot.right) / 2} y={plot.bottom + 34} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={700}>belief about each variant&apos;s true conversion rate</text>

      {/* Belief curves */}
      <motion.path d={curvePath(aConv, aN)} fill="none" stroke={COLORS.cyan} strokeWidth={3} />
      <motion.path d={curvePath(bConv, bN)} fill="none" stroke={COLORS.pink} strokeWidth={3} filter={pB > 0.95 ? "url(#glow)" : undefined} />

      {/* observed-rate markers once data exists */}
      {aN > 0 && <line x1={scaleX(rateA)} y1={plot.top} x2={scaleX(rateA)} y2={plot.bottom} stroke={COLORS.cyan} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />}
      {bN > 0 && <line x1={scaleX(rateB)} y1={plot.top} x2={scaleX(rateB)} y2={plot.bottom} stroke={COLORS.pink} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />}

      {/* legend */}
      <g transform={`translate(${plot.left + 8}, ${plot.top + 6})`}>
        <rect width={12} height={12} fill={COLORS.cyan} />
        <text x={18} y={11} fill={COLORS.cyan} fontSize={12} fontWeight={800}>Variant A</text>
        <rect y={18} width={12} height={12} fill={COLORS.pink} />
        <text x={18} y={29} fill={COLORS.pink} fontSize={12} fontWeight={800}>Variant B</text>
      </g>
    </svg>
  );

  const meterPct = Math.round(pB * 100);
  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => collect(50)} aria-label="Collect 50 visitors" className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface hover:bg-surface-container hover:text-primary">
            Collect 50
          </button>
          <button onClick={() => collect(200)} aria-label="Collect 200 visitors" className="flex h-9 items-center justify-center border border-outline bg-cyan px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-white hover:bg-cyan/90">
            Collect 200
          </button>
          <button onClick={reset} aria-label="Reset the experiment" className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant hover:bg-surface-container">
            Reset
          </button>
        </div>
        <label htmlFor="bayes-b" className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          How much better B really is (true rate {(trueB * 100).toFixed(0)}% vs A&apos;s {(TRUE_A * 100).toFixed(0)}%)
        </label>
        <input id="bayes-b" aria-label="Variant B true rate" type="range" min={0.2} max={0.55} step={0.01} value={trueB} onChange={(e) => { reset(); setTrueB(Number(e.target.value)); }} className="w-full cursor-pointer accent-primary" />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        <div className="flex justify-between gap-4"><span className="text-cyan font-bold">Variant A</span><span>{aConv}/{aN} {aN > 0 ? `(${(rateA * 100).toFixed(0)}%)` : ""}</span></div>
        <div className="flex justify-between gap-4"><span className="text-pink font-bold">Variant B</span><span>{bConv}/{bN} {bN > 0 ? `(${(rateB * 100).toFixed(0)}%)` : ""}</span></div>
        <div className="mt-1 text-[11px] font-bold uppercase text-on-surface-variant">P(B beats A)</div>
        <div className="flex items-center gap-2">
          <div className="h-3 flex-1 bg-surface-container">
            <div className="h-full" style={{ width: `${meterPct}%`, backgroundColor: pB > 0.95 ? COLORS.cyan : pB < 0.05 ? COLORS.pink : COLORS.yellow }} />
          </div>
          <span className="w-10 text-right font-bold">{meterPct}%</span>
        </div>
        <div className="text-[12px] font-bold" style={{ color: pB > 0.95 ? COLORS.cyan : pB < 0.05 ? COLORS.pink : COLORS.muted }}>{verdict}</div>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      Bayesian inference is a belief update. Start with a flat{" "}
      <strong>prior</strong> (&quot;no idea which variant is better&quot;), and
      each visitor&apos;s outcome is <strong>evidence</strong> that reshapes the
      belief curve over that variant&apos;s true rate. With little data the
      curves are wide and overlap — you can&apos;t tell them apart; with more they
      sharpen and separate. Integrating them gives <strong>P(B beats A)</strong>,
      a calibrated confidence you can act on — the basis of A/B testing, bandits,
      and any model that reports uncertainty instead of a bare guess.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
