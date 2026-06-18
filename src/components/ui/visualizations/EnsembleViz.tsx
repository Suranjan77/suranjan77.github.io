"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 660;
const H = 380;
const plot = { left: 60, top: 40, right: 488, bottom: 332 };

const scaleX = (v: number) => plot.left + (v / 10) * (plot.right - plot.left);
const scaleY = (v: number) => plot.bottom - (v / 10) * (plot.bottom - plot.top);
const invX = (px: number) => ((px - plot.left) / (plot.right - plot.left)) * 10;
const invY = (py: number) => ((plot.bottom - py) / (plot.bottom - plot.top)) * 10;

// transactions: FRAUD when amount (x) exceeds the account's typical amount (y),
// i.e. points below the diagonal. LEGIT above it. The boundary is diagonal, so
// no single axis-aligned rule can separate the classes well.
// label 1 = legit (above), label 0 = fraud (below) — kept internal; displayed by name.
const TX = [
  // fraud (below diagonal)
  { x: 3, y: 1, l: 0 }, { x: 4, y: 2, l: 0 }, { x: 5, y: 3, l: 0 }, { x: 6, y: 4, l: 0 },
  { x: 7, y: 5, l: 0 }, { x: 8, y: 6, l: 0 }, { x: 5.5, y: 4.2, l: 0 }, { x: 6.5, y: 5.2, l: 0 },
  // legit (above diagonal)
  { x: 1, y: 3, l: 1 }, { x: 2, y: 4, l: 1 }, { x: 3, y: 5, l: 1 }, { x: 4, y: 6, l: 1 },
  { x: 5, y: 7, l: 1 }, { x: 6, y: 8, l: 1 }, { x: 4.2, y: 5.5, l: 1 }, { x: 5.2, y: 6.5, l: 1 },
];

// five weak rules. Each votes +1 (legit) when its condition holds, else -1.
// Individually each is only 56–75% accurate; their committee reaches 100%.
type Stump = { dim: "x" | "y"; v: number; dir: 1 | -1; label: string };
const STUMPS: Stump[] = [
  { dim: "x", v: 5.5, dir: -1, label: "amount < 5.5" },
  { dim: "y", v: 6.5, dir: 1, label: "typical > 6.5" },
  { dim: "y", v: 2.5, dir: 1, label: "typical > 2.5" },
  { dim: "x", v: 1.5, dir: -1, label: "amount < 1.5" },
  { dim: "y", v: 3.5, dir: 1, label: "typical > 3.5" },
];

const vote = (s: Stump, x: number, y: number) => {
  const f = s.dim === "x" ? x : y;
  return (s.dir === 1 ? f > s.v : f < s.v) ? 1 : -1;
};
const committeeLabel = (stumps: Stump[], x: number, y: number) =>
  stumps.reduce((sum, s) => sum + vote(s, x, y), 0) >= 0 ? 1 : 0;
const indivAcc = (s: Stump) =>
  TX.filter((p) => (vote(s, p.x, p.y) === 1 ? 1 : 0) === p.l).length / TX.length;
const committeeAcc = (stumps: Stump[]) =>
  TX.filter((p) => committeeLabel(stumps, p.x, p.y) === p.l).length / TX.length;

const BEST_SINGLE = Math.max(...STUMPS.map(indivAcc));

export default function EnsembleViz() {
  const [n, setN] = useState(1);
  const active = STUMPS.slice(0, n);
  const acc = committeeAcc(active);

  const caption =
    n === 1
      ? `One weak rule is just a single straight cut — barely better than a coin flip (${(indivAcc(STUMPS[0]) * 100).toFixed(0)}% right). It can't follow the diagonal fraud boundary, so it misclassifies everything stranded on the wrong side.`
      : `${n} weak rules now vote. Each one alone is mediocre (56–75% right), but their majority vote carves a staircase that hugs the true boundary — ${(acc * 100).toFixed(0)}% right. No single straight rule could draw this shape.`;

  // committee-vote heatmap
  const cells: React.ReactNode[] = [];
  const step = 13;
  for (let px = plot.left; px < plot.right; px += step) {
    for (let py = plot.top; py < plot.bottom; py += step) {
      const gx = invX(px + step / 2);
      const gy = invY(py + step / 2);
      const margin = active.reduce((s, st) => s + vote(st, gx, gy), 0) / n;
      const lab = margin >= 0 ? 1 : 0;
      cells.push(
        <rect key={`${px}-${py}`} x={px} y={py} width={step} height={step} fill={lab === 1 ? COLORS.cyan : COLORS.pink} fillOpacity={0.05 + Math.abs(margin) * 0.16} />,
      );
    }
  }

  const ticks = [0, 2.5, 5, 7.5, 10];

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ensemble Weak Learners Committee Vote">
      <title>Ensemble Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {cells}

      {ticks.map((t) => (
        <g key={t}>
          <line x1={scaleX(t)} y1={plot.top} x2={scaleX(t)} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
          <line x1={plot.left} y1={scaleY(t)} x2={plot.right} y2={scaleY(t)} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
        </g>
      ))}
      <line x1={plot.left} y1={plot.top} x2={plot.left} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
      <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
      <text x={plot.right} y={plot.bottom + 28} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>transaction amount →</text>
      <text x={plot.left - 8} y={plot.top - 14} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>typical amount</text>

      {/* active weak-rule cuts */}
      {active.map((s, idx) => {
        const newest = idx === n - 1;
        const stroke = newest ? COLORS.yellow : COLORS.muted;
        if (s.dim === "x") {
          const cx = scaleX(s.v);
          return <motion.line key={`s${idx}`} x1={cx} y1={plot.top} x2={cx} y2={plot.bottom} stroke={stroke} strokeWidth={newest ? 3 : 1.5} strokeDasharray={newest ? undefined : "3 3"} initial={newest ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />;
        }
        const cy = scaleY(s.v);
        return <motion.line key={`s${idx}`} x1={plot.left} y1={cy} x2={plot.right} y2={cy} stroke={stroke} strokeWidth={newest ? 3 : 1.5} strokeDasharray={newest ? undefined : "3 3"} initial={newest ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />;
      })}

      {/* transactions, colored by their true class */}
      {TX.map((p, idx) => {
        const correct = committeeLabel(active, p.x, p.y) === p.l;
        return (
          <g key={idx}>
            <circle cx={scaleX(p.x)} cy={scaleY(p.y)} r={correct ? 5.5 : 7} fill={p.l === 1 ? COLORS.cyan : COLORS.pink} stroke={correct ? COLORS.bg : COLORS.yellow} strokeWidth={correct ? 1.5 : 2.5} />
            {!correct && <text x={scaleX(p.x)} y={scaleY(p.y) + 3.5} textAnchor="middle" fill={COLORS.bg} fontSize={9} fontWeight={900}>!</text>}
          </g>
        );
      })}
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Weak rules in committee</span>
        <div className="flex items-center gap-2">
          <button aria-label="Remove a weak rule" onClick={() => setN((p) => Math.max(1, p - 1))} disabled={n <= 1} className="h-8 w-8 border border-outline bg-surface font-bold hover:bg-surface-container disabled:opacity-30">−</button>
          <span data-testid="ensemble-count" className="w-28 text-center font-mono text-sm font-bold text-primary">{n} of {STUMPS.length} rules</span>
          <button aria-label="Add a weak rule" onClick={() => setN((p) => Math.min(STUMPS.length, p + 1))} disabled={n >= STUMPS.length} className="h-8 w-8 border border-outline bg-surface font-bold hover:bg-surface-container disabled:opacity-30">+</button>
        </div>
        <span className="font-sans text-[12px] text-on-surface-variant">Each rule is one threshold (a “decision stump”). Add them and watch the committee vote.</span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-bold uppercase text-on-surface-variant">Committee accuracy</span>
          <span data-testid="ensemble-committee-acc" className="text-lg font-bold" style={{ color: acc === 1 ? COLORS.cyan : COLORS.pink }}>{(acc * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">best single rule alone</span><span className="font-bold text-on-surface">{(BEST_SINGLE * 100).toFixed(0)}%</span></div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">newest rule</span><span className="font-bold text-on-surface">{STUMPS[n - 1].label} ({(indivAcc(STUMPS[n - 1]) * 100).toFixed(0)}%)</span></div>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      An ensemble combines many <strong>weak learners</strong> — models barely
      better than chance — into one strong one. Each weak rule makes its own
      mistakes; because those mistakes are <strong>uncorrelated</strong>, a
      majority vote cancels them out and the committee&apos;s errors shrink toward
      zero. <strong>Bagging</strong> (random forests) trains the learners on
      different random samples and averages them; <strong>boosting</strong>
      (AdaBoost, gradient boosting, XGBoost) trains each new learner to fix the
      previous ones&apos; mistakes. It&apos;s why a forest of shallow trees beats a
      single deep one, and why boosted trees still win on tabular data.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
