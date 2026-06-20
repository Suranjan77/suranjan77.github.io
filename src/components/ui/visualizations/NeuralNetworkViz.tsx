"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  COLORS,
  SVGFilters,
  VizShell,
  NarrativeControls,
  StepIndicator,
} from "../visualizationPrimitives";

const W = 720;
const H = 440;
const px = { l: 96, r: 636, t: 36, b: 396 };
const cx = (px.l + px.r) / 2;
const cy = (px.t + px.b) / 2;
const DR = 2.4; // data half-range
const sx = (v: number) => cx + (v / DR) * ((px.r - px.l) / 2);
const sy = (v: number) => cy - (v / DR) * ((px.b - px.t) / 2);

// XOR-style data: class flips across the diagonal, so the same-sign corners are
// one class and the opposite-sign corners the other — no single line can split
// them. label 0 = class A (same sign), label 1 = class B (opposite sign).
const C = 1.55;
const J = [
  [0.28, 0.18],
  [-0.22, 0.3],
  [0.12, -0.26],
  [-0.3, -0.16],
  [0.0, 0.0],
];
const DATA: { x1: number; x2: number; label: number }[] = [];
([
  [C, C, 0],
  [-C, -C, 0],
  [C, -C, 1],
  [-C, C, 1],
] as const).forEach(([bx, by, label]) => {
  J.forEach(([dx, dy]) => DATA.push({ x1: bx + dx, x2: by + dy, label }));
});

const relu = (z: number) => Math.max(0, z);

// Three capacity levels. Each is a real forward pass; more hidden ReLU units add
// more "folds", letting the boundary bend until it fits.
function score(level: number, x1: number, x2: number): number {
  if (level === 0) return x1; // one neuron = one straight line
  if (level === 1) return relu(x1 - x2) - 0.8; // one fold (half-plane)
  return relu(x1 - x2) + relu(x2 - x1) - 0.8; // two folds = a diagonal band
}
const predict = (level: number, x1: number, x2: number) => (score(level, x1, x2) > 0 ? 1 : 0);

const GRID = 30;
const STEP_NAMES = ["One line", "Add a neuron", "Add another"];

export default function NeuralNetworkViz() {
  const [level, setLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cells = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; pred: number }[] = [];
    const span = 2 * DR;
    const cw = (px.r - px.l) / GRID;
    const ch = (px.b - px.t) / GRID;
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x1 = -DR + ((i + 0.5) / GRID) * span;
        const x2 = DR - ((j + 0.5) / GRID) * span;
        out.push({ x: px.l + i * cw, y: px.t + j * ch, w: cw + 0.5, h: ch + 0.5, pred: predict(level, x1, x2) });
      }
    }
    return out;
  }, [level]);

  const correct = useMemo(
    () => DATA.filter((d) => predict(level, d.x1, d.x2) === d.label).length,
    [level],
  );
  const acc = Math.round((correct / DATA.length) * 100);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setLevel((prev) => {
          if (prev >= 2) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1700);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const caption =
    level === 0
      ? `A single neuron can only draw one straight line. However you angle it, two of the four clusters land on the wrong side — just ${acc}% correct. This data is not linearly separable.`
      : level === 1
        ? `Adding one hidden neuron lets the boundary bend once (a single fold). It rescues a cluster — up to ${acc}% — but one corner is still stranded on the wrong side.`
        : `A second hidden neuron adds a second fold, and the boundary closes into a diagonal band that wraps each class perfectly: ${acc}%. That bend is exactly what a hidden layer buys you.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Neural Network Decision Boundary">
      <title>Neural Network Decision Boundary</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* decision regions */}
      <g opacity={0.9}>
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            fill={c.pred === 1 ? COLORS.pink : COLORS.cyan}
            fillOpacity={0.13}
          />
        ))}
      </g>

      {/* plot frame */}
      <rect x={px.l} y={px.t} width={px.r - px.l} height={px.b - px.t} fill="none" stroke={COLORS.border} strokeWidth={1.5} />

      {/* data points: class A = cyan circles, class B = pink squares (shape + colour) */}
      {DATA.map((d, i) => {
        const X = sx(d.x1);
        const Y = sy(d.x2);
        const wrong = predict(level, d.x1, d.x2) !== d.label;
        return (
          <g key={i}>
            {wrong && <circle cx={X} cy={Y} r={11} fill="none" stroke={COLORS.yellow} strokeWidth={2.5} strokeDasharray="3 2" />}
            {d.label === 0 ? (
              <circle cx={X} cy={Y} r={6.5} fill={COLORS.cyan} stroke={COLORS.bg} strokeWidth={2} />
            ) : (
              <rect x={X - 6} y={Y - 6} width={12} height={12} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={2} />
            )}
          </g>
        );
      })}

      {/* feature axes labels */}
      <text x={px.r} y={cy - 6} textAnchor="end" fill={COLORS.muted} fontSize={12} fontWeight={700}>feature 1 →</text>
      <text x={cx + 6} y={px.t + 14} fill={COLORS.muted} fontSize={12} fontWeight={700}>feature 2 ↑</text>
      <line x1={px.l} y1={cy} x2={px.r} y2={cy} stroke={COLORS.border} strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
      <line x1={cx} y1={px.t} x2={cx} y2={px.b} stroke={COLORS.border} strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
    </svg>
  );

  const controls = (
    <>
      <div className="flex min-w-[190px] flex-col justify-center gap-1 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Accuracy</span>
        <div className="flex items-baseline gap-2">
          <span data-testid="nn-accuracy" className="font-mono text-2xl font-bold" style={{ color: acc === 100 ? COLORS.green : COLORS.pink }}>
            {acc}%
          </span>
          <span className="font-sans text-[12px] text-on-surface-variant">{correct} / {DATA.length} points</span>
        </div>
        <span className="font-sans text-[11px] text-on-surface-variant">
          {level === 0 ? "0 hidden neurons (just a line)" : `${level} hidden neuron${level > 1 ? "s" : ""} → ${level} fold${level > 1 ? "s" : ""}`}
        </span>
        {/* tiny architecture glyph: inputs -> hidden(level) -> output */}
        <svg viewBox="0 0 150 54" className="mt-1 h-10 w-full" role="presentation">
          {[18, 36].map((iy) => (
            <line key={iy} x1={20} y1={iy} x2={75} y2={27} stroke={COLORS.border} strokeWidth={1} />
          ))}
          {level > 0 &&
            Array.from({ length: level }).map((_, k) => {
              const hy = level === 1 ? 27 : 18 + k * 18;
              return (
                <g key={k}>
                  <line x1={75} y1={hy} x2={130} y2={27} stroke={COLORS.border} strokeWidth={1} />
                  <circle cx={75} cy={hy} r={5} fill={COLORS.yellow} />
                </g>
              );
            })}
          {level === 0 && <line x1={20} y1={27} x2={130} y2={27} stroke={COLORS.border} strokeWidth={1} />}
          {[18, 36].map((iy) => (
            <circle key={iy} cx={20} cy={iy} r={5} fill={COLORS.cyan} />
          ))}
          <circle cx={130} cy={27} r={6} fill={COLORS.pink} />
        </svg>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 border border-outline bg-surface p-3">
        <StepIndicator steps={STEP_NAMES} currentStep={level} />
        <NarrativeControls
          isPlaying={isPlaying}
          onPlayToggle={() => {
            if (level >= 2 && !isPlaying) setLevel(0);
            setIsPlaying((p) => !p);
          }}
          onStepForward={() => setLevel((p) => Math.min(2, p + 1))}
          onStepBackward={() => setLevel((p) => Math.max(0, p - 1))}
          onReset={() => {
            setIsPlaying(false);
            setLevel(0);
          }}
          currentStep={level}
          totalSteps={3}
        />
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A single neuron computes a weighted sum and fires — geometrically, it can only place one{" "}
        <strong>straight</strong> dividing line. Most interesting data (like this XOR checkerboard)
        cannot be split by any line.
      </p>
      <p>
        Each neuron in a <strong>hidden layer</strong> adds one bend (one ReLU &quot;fold&quot;) to
        the boundary. Stack enough of them and the network can carve out{" "}
        <strong>any</strong> shape — this is the universal-approximation idea, and it is the whole
        reason deep networks beat linear models on real data.
      </p>
      <p>
        Here two folds are enough to wrap each class. Training is just the search for the fold angles
        (the weights) that make the boundary fit — covered in the backpropagation lesson.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
