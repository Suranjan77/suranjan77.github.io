"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

// --- Deterministic labeled scores: two overlapping score distributions ---
// Positives cluster at high scores, negatives at low, with overlap. No
// randomness: a fixed hash + Box-Muller gives a stable, reproducible scene.
const N = 220;

function hash(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x); // in [0,1)
}

type Sample = { score: number; label: 0 | 1 };

const SAMPLES: Sample[] = (() => {
  const out: Sample[] = [];
  for (let i = 0; i < N; i++) {
    const label: 0 | 1 = hash(i, 1) < 0.42 ? 1 : 0; // ~42% positive
    const u1 = Math.min(0.9999, Math.max(0.0001, hash(i, 2)));
    const u2 = hash(i, 3);
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); // ~N(0,1)
    const center = label === 1 ? 0.64 : 0.38;
    const score = Math.min(0.999, Math.max(0.001, center + 0.16 * z));
    out.push({ score, label });
  }
  return out;
})();

const P = SAMPLES.filter((s) => s.label === 1).length;
const Ncount = SAMPLES.length - P;

function confusionAt(tau: number) {
  let tp = 0;
  let fp = 0;
  for (const s of SAMPLES) {
    const pred = s.score >= tau;
    if (pred && s.label === 1) tp++;
    else if (pred && s.label === 0) fp++;
  }
  const fn = P - tp;
  const tn = Ncount - fp;
  return { tp, fp, fn, tn };
}

// Precompute the ROC polyline + AUC by sweeping thresholds.
const ROC = (() => {
  const pts: { fpr: number; tpr: number }[] = [];
  for (let k = 0; k <= 50; k++) {
    const tau = 1 - k / 50; // sweep high->low so curve goes left->right
    const { tp, fp, fn, tn } = confusionAt(tau);
    const tpr = tp + fn === 0 ? 0 : tp / (tp + fn);
    const fpr = fp + tn === 0 ? 0 : fp / (fp + tn);
    pts.push({ fpr, tpr });
  }
  let auc = 0;
  for (let i = 1; i < pts.length; i++) {
    auc += ((pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr)) / 2;
  }
  return { pts, auc };
})();

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

export default function ModelEvaluationViz() {
  const [tau, setTau] = useState(0.5);

  const { tp, fp, fn, tn } = useMemo(() => confusionAt(tau), [tau]);
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 =
    precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  const tpr = recall;
  const fpr = fp + tn === 0 ? 0 : fp / (fp + tn);

  // --- ROC SVG geometry ---
  const W = 260;
  const H = 260;
  const pad = 34;
  const sx = (v: number) => pad + v * (W - 2 * pad);
  const sy = (v: number) => H - pad - v * (H - 2 * pad);
  const rocPath = ROC.pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.fpr).toFixed(1)},${sy(p.tpr).toFixed(1)}`)
    .join(" ");

  const cell = (
    label: string,
    value: number,
    color: string,
    sub: string,
  ) => (
    <div
      className="flex flex-col items-center justify-center border p-2 text-center"
      style={{ borderColor: COLORS.border, background: color }}
    >
      <div className="font-mono text-[9px] font-bold uppercase tracking-wide" style={{ color: COLORS.bg }}>
        {label}
      </div>
      <div className="font-mono text-xl font-bold" style={{ color: COLORS.bg }}>
        {value}
      </div>
      <div className="font-mono text-[9px]" style={{ color: COLORS.bg }}>
        {sub}
      </div>
    </div>
  );

  const canvas = (
    <div
      role="img"
      aria-label="ROC Curve and Confusion Matrix Threshold Sweep"
      className="flex flex-col gap-4 p-4 font-sans md:flex-row md:items-start"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full max-w-[300px]"
        aria-hidden="true"
      >
        <rect x={0} y={0} width={W} height={H} fill={COLORS.bg} />
        {/* axes */}
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={COLORS.border} />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={COLORS.border} />
        {/* chance diagonal */}
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(1)}
          y2={sy(1)}
          stroke={COLORS.muted}
          strokeDasharray="4 3"
        />
        {/* ROC curve */}
        <path d={rocPath} fill="none" stroke={COLORS.cyan} strokeWidth={2.5} />
        {/* current operating point */}
        <circle cx={sx(fpr)} cy={sy(tpr)} r={5.5} fill={COLORS.pink} />
        <text x={pad} y={H - 8} fontSize={10} fill={COLORS.muted} fontFamily="monospace">
          FPR →
        </text>
        <text
          x={10}
          y={pad + 4}
          fontSize={10}
          fill={COLORS.muted}
          fontFamily="monospace"
          transform={`rotate(-90 10 ${pad + 4})`}
        >
          TPR →
        </text>
        <text x={W - pad - 64} y={pad + 12} fontSize={11} fill={COLORS.cyan} fontFamily="monospace">
          AUC {ROC.auc.toFixed(2)}
        </text>
      </svg>

      <div className="flex w-full flex-col gap-3">
        <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          Confusion matrix at threshold {tau.toFixed(2)}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {cell("True Pos", tp, COLORS.cyan, "caught")}
          {cell("False Neg", fn, "rgba(141,81,73,0.7)", "missed")}
          {cell("False Pos", fp, COLORS.yellow, "false alarm")}
          {cell("True Neg", tn, COLORS.grid, "correct reject")}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Precision" value={precision.toFixed(2)} />
          <Stat label="Recall" value={recall.toFixed(2)} />
          <Stat label="F1" value={f1.toFixed(2)} />
        </div>
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Decision threshold τ
        </div>
        <p className="font-sans text-[12px] text-on-surface-variant">
          Label a case &quot;positive&quot; when its score clears τ. The pink dot
          is where you sit on the ROC curve.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0.05}
          max={0.95}
          step={0.05}
          value={tau}
          aria-label="Decision threshold"
          onChange={(e) => setTau(Number(e.target.value))}
          className="w-44"
        />
        <span className="w-10 text-right font-mono text-[13px] font-bold text-on-surface">
          {tau.toFixed(2)}
        </span>
      </div>
    </div>
  );

  const caption =
    tau <= 0.3
      ? `A low threshold calls almost everything positive: recall is high (${recall.toFixed(2)}) but precision suffers (${precision.toFixed(2)}) — lots of false alarms. The dot sits up and to the right on the ROC.`
      : tau >= 0.7
        ? `A high threshold only commits to confident cases: precision climbs (${precision.toFixed(2)}) but recall drops (${recall.toFixed(2)}) as misses pile up. The dot moves down-left.`
        : `Near the middle, precision ${precision.toFixed(2)} and recall ${recall.toFixed(2)} balance out (F1 ${f1.toFixed(2)}). The whole ROC curve — and its AUC of ${ROC.auc.toFixed(2)} — is threshold-independent; the dot just slides along it.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A classifier outputs a <em>score</em>; the <strong>threshold</strong> τ
        turns that score into a yes/no label. Move τ and you trade the two ways to
        be wrong: lower it to catch more positives (higher <strong>recall</strong>)
        at the cost of more false alarms (lower <strong>precision</strong>).
      </p>
      <p>
        The <strong>confusion matrix</strong> counts all four outcomes, and
        precision, recall, and F1 are just ratios of its cells. Because they all
        depend on τ, no single one of them describes the model on its own.
      </p>
      <p>
        Sweeping τ across every value traces the <strong>ROC curve</strong>, and
        the area under it (<strong>AUC</strong>) summarizes the model
        independently of any one threshold — it is the probability a random
        positive outscores a random negative. Pick your operating point (the dot)
        from the real cost of misses versus false alarms.
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
