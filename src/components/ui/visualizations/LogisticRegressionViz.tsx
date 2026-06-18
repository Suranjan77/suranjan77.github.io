"use client";

import React, { useState } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 680;
const H = 360;
const plot = { left: 64, right: 612, top: 46, bottom: 300 };

const scaleX = (v: number) => plot.left + (v / 10) * (plot.right - plot.left);
const scaleY = (p: number) => plot.bottom - p * (plot.bottom - plot.top);
const invertY = (py: number) => (plot.bottom - py) / (plot.bottom - plot.top);

// fitted model: P(pass) = sigmoid(k (hours - x0))
const X0 = 5;
const K = 1.3;
const sigmoid = (x: number) => 1 / (1 + Math.exp(-K * (x - X0)));

// students: hours studied + whether they actually passed (1) or failed (0).
// Two honest outliers (a hard worker who failed, a slacker who passed) make the
// threshold trade-off real.
const STUDENTS = [
  { x: 1.5, label: 0 },
  { x: 2.6, label: 0 },
  { x: 3.4, label: 0 },
  { x: 4.2, label: 0 },
  { x: 5.6, label: 0 }, // studied a lot, still failed
  { x: 4.4, label: 1 }, // barely studied, passed
  { x: 5.8, label: 1 },
  { x: 6.6, label: 1 },
  { x: 7.4, label: 1 },
  { x: 8.5, label: 1 },
];

export default function LogisticRegressionViz() {
  const [threshold, setThreshold] = useState(0.5);
  const [dragging, setDragging] = useState(false);

  // decision boundary: the hours value where P(pass) == threshold
  const boundaryX = X0 + Math.log(threshold / (1 - threshold)) / K;

  const correct = STUDENTS.filter((s) => (sigmoid(s.x) >= threshold ? 1 : 0) === s.label).length;
  const accuracy = correct / STUDENTS.length;
  // who the threshold mislabels
  const missedPass = STUDENTS.filter((s) => s.label === 1 && sigmoid(s.x) < threshold).length;
  const falsePass = STUDENTS.filter((s) => s.label === 0 && sigmoid(s.x) >= threshold).length;

  const setFromPointer = (e: React.PointerEvent<SVGElement>) => {
    const svg = e.currentTarget.ownerSVGElement ?? (e.currentTarget as unknown as SVGSVGElement);
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const c = pt.matrixTransform(ctm.inverse());
    setThreshold(Math.max(0.05, Math.min(0.95, invertY(c.y))));
  };
  const onDown = (e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setFromPointer(e);
  };
  const onMove = (e: React.PointerEvent<SVGElement>) => {
    if (dragging) setFromPointer(e);
  };
  const onUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const sigmoidPath =
    "M " +
    Array.from({ length: 121 }, (_, i) => {
      const x = (i / 120) * 10;
      return `${scaleX(x).toFixed(1)} ${scaleY(sigmoid(x)).toFixed(1)}`;
    }).join(" L ");

  const xticks = [0, 2, 4, 6, 8, 10];
  const pticks = [0, 0.25, 0.5, 0.75, 1];

  const caption =
    `The S-curve turns "hours studied" into a probability of passing — gentle at the extremes, steep in the middle where the model is unsure. Predict "pass" when P(pass) ≥ ${(threshold * 100).toFixed(0)}%. Right now that misses ${missedPass} real pass${missedPass === 1 ? "" : "es"} and wrongly passes ${falsePass} fail${falsePass === 1 ? "" : "s"} — drag the threshold and you trade one mistake for the other; no cutoff is perfect.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Logistic Regression Probability Curve" onPointerMove={onMove} onPointerUp={onUp}>
      <title>Logistic Regression Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* predict-pass shaded region (right of the boundary) */}
      <rect x={scaleX(boundaryX)} y={plot.top} width={Math.max(0, scaleX(10) - scaleX(boundaryX))} height={plot.bottom - plot.top} fill={COLORS.cyan} fillOpacity={0.07} />

      {/* grid + axes */}
      {xticks.map((t) => (
        <g key={`x${t}`}>
          <line x1={scaleX(t)} y1={plot.top} x2={scaleX(t)} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
          <text x={scaleX(t)} y={plot.bottom + 16} textAnchor="middle" fill={COLORS.muted} fontSize={10}>{t}</text>
        </g>
      ))}
      {pticks.map((t) => (
        <g key={`p${t}`}>
          <line x1={plot.left} y1={scaleY(t)} x2={plot.right} y2={scaleY(t)} stroke={COLORS.grid} strokeWidth={1} />
          <text x={plot.left - 8} y={scaleY(t) + 3} textAnchor="end" fill={COLORS.muted} fontSize={10}>{t.toFixed(2)}</text>
        </g>
      ))}
      <text x={plot.right} y={plot.bottom + 30} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>hours studied →</text>
      <text x={plot.left - 8} y={plot.top - 10} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>P(pass)</text>

      {/* sigmoid */}
      <path d={sigmoidPath} fill="none" stroke={COLORS.yellow} strokeWidth={3.5} />

      {/* decision boundary (where P = threshold) */}
      <line x1={scaleX(boundaryX)} y1={plot.top} x2={scaleX(boundaryX)} y2={plot.bottom} stroke={COLORS.cyan} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={scaleX(boundaryX) + 6} y={plot.top + 12} fill={COLORS.cyan} fontSize={10} fontWeight={700}>predict pass →</text>

      {/* students at their true outcome (top = passed, bottom = failed) */}
      {STUDENTS.map((s, i) => {
        const p = sigmoid(s.x);
        const predPass = p >= threshold;
        const wrong = (predPass ? 1 : 0) !== s.label;
        const color = s.label === 1 ? COLORS.cyan : COLORS.pink;
        const cy = scaleY(s.label === 1 ? 0.97 : 0.03);
        return (
          <g key={i}>
            {/* drop line from the student up/down to the sigmoid (its predicted prob) */}
            <line x1={scaleX(s.x)} y1={cy} x2={scaleX(s.x)} y2={scaleY(p)} stroke={color} strokeWidth={1} strokeDasharray="2 2" opacity={0.4} />
            <circle cx={scaleX(s.x)} cy={scaleY(p)} r={3} fill={color} opacity={0.7} />
            <circle cx={scaleX(s.x)} cy={cy} r={wrong ? 7 : 6} fill={color} stroke={wrong ? COLORS.yellow : COLORS.bg} strokeWidth={wrong ? 3 : 1.5} />
            {wrong && <text x={scaleX(s.x)} y={cy + 4} textAnchor="middle" fill={COLORS.bg} fontSize={10} fontWeight={900}>!</text>}
          </g>
        );
      })}

      {/* draggable threshold */}
      <g onPointerDown={onDown} className="cursor-ns-resize">
        <line x1={plot.left} y1={scaleY(threshold)} x2={plot.right} y2={scaleY(threshold)} stroke={COLORS.pink} strokeWidth={2.5} strokeDasharray="6 4" />
        <circle cx={plot.left + 16} cy={scaleY(threshold)} r={7} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={2} />
        <text x={plot.right - 4} y={scaleY(threshold) - 6} textAnchor="end" fill={COLORS.pink} fontSize={10} fontWeight={800}>threshold {(threshold * 100).toFixed(0)}%</text>
      </g>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <label htmlFor="lr-thresh" className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Decision threshold</label>
        <input id="lr-thresh" type="range" min={0.05} max={0.95} step={0.01} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} aria-label="Decision threshold" className="w-full cursor-pointer accent-primary" />
        <span className="font-sans text-[12px] text-on-surface-variant">Predict “pass” when P(pass) ≥ {(threshold * 100).toFixed(0)}%. Or drag the pink line.</span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        <div className="flex items-baseline justify-between gap-3"><span className="text-[11px] font-bold uppercase text-on-surface-variant">Accuracy</span><span data-testid="logistic-accuracy" className="text-lg font-bold" style={{ color: accuracy > 0.8 ? COLORS.cyan : COLORS.pink }}>{(accuracy * 100).toFixed(0)}% ({correct}/{STUDENTS.length})</span></div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">missed passes (too strict)</span><span className="font-bold" style={{ color: COLORS.cyan }}>{missedPass}</span></div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">wrongly passed (too lax)</span><span className="font-bold" style={{ color: COLORS.pink }}>{falsePass}</span></div>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      Logistic regression is the workhorse classifier. It computes a linear score
      from the features, then squashes it through the <strong>sigmoid</strong>{" "}
      into a <strong>probability</strong> between 0 and 1 — so it says &quot;73%
      likely to pass,&quot; not just yes/no. You then choose a{" "}
      <strong>threshold</strong> to turn that probability into a decision, and
      moving it trades false alarms against misses. Most real classifiers — spam
      filters, fraud detection, medical screens — are exactly this: a probability
      plus a threshold you tune for the cost of each mistake.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
