"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

// Ill-conditioned quadratic: gentle in x (a), steep in y (b). Minimum at origin.
const A = 0.3;
const B = 3.0;
const START: [number, number] = [-2.6, 1.05];

type Opt = "sgd" | "momentum" | "adam";

function lossAt(x: number, y: number) {
  return 0.5 * (A * x * x + B * y * y);
}
function gradAt(x: number, y: number): [number, number] {
  return [A * x, B * y];
}

function clampPt(x: number, y: number): [number, number] {
  const c = (v: number) => (Number.isFinite(v) ? Math.max(-3.2, Math.min(3.2, v)) : 3.2);
  return [c(x), c(y)];
}

// Deterministic trajectory for the chosen optimizer.
function trajectory(opt: Opt, steps: number, lr: number) {
  const pts: [number, number][] = [START];
  let [x, y] = START;
  let vx = 0;
  let vy = 0; // momentum velocity
  let mx = 0;
  let my = 0;
  let sx = 0;
  let sy = 0; // adam moments
  const beta = 0.9;
  const b1 = 0.9;
  const b2 = 0.999;
  const eps = 1e-8;
  for (let t = 1; t <= steps; t++) {
    const [gx, gy] = gradAt(x, y);
    if (opt === "sgd") {
      x -= lr * gx;
      y -= lr * gy;
    } else if (opt === "momentum") {
      vx = beta * vx + gx;
      vy = beta * vy + gy;
      x -= lr * vx;
      y -= lr * vy;
    } else {
      mx = b1 * mx + (1 - b1) * gx;
      my = b1 * my + (1 - b1) * gy;
      sx = b2 * sx + (1 - b2) * gx * gx;
      sy = b2 * sy + (1 - b2) * gy * gy;
      const mhx = mx / (1 - Math.pow(b1, t));
      const mhy = my / (1 - Math.pow(b1, t));
      const shx = sx / (1 - Math.pow(b2, t));
      const shy = sy / (1 - Math.pow(b2, t));
      x -= (lr * mhx) / (Math.sqrt(shx) + eps);
      y -= (lr * mhy) / (Math.sqrt(shy) + eps);
    }
    [x, y] = clampPt(x, y);
    pts.push([x, y]);
  }
  return pts;
}

const OPT_LABEL: Record<Opt, string> = {
  sgd: "SGD",
  momentum: "Momentum",
  adam: "Adam",
};

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

export default function OptimizationOptimizersViz() {
  const [opt, setOpt] = useState<Opt>("sgd");
  const [steps, setSteps] = useState(20);
  const [lr, setLr] = useState(0.3);

  const path = useMemo(() => trajectory(opt, steps, lr), [opt, steps, lr]);
  const last = path[path.length - 1];
  const finalLoss = lossAt(last[0], last[1]);

  // --- SVG geometry: x in [-3.2,3.2], y in [-1.7,1.7] ---
  const W = 360;
  const H = 220;
  const pad = 14;
  const XR = 3.2;
  const YR = 1.7;
  const sx = (x: number) => pad + ((x + XR) / (2 * XR)) * (W - 2 * pad);
  const sy = (y: number) => pad + ((YR - y) / (2 * YR)) * (H - 2 * pad);

  // Contour ellipses of constant loss (a*x^2 + b*y^2 = const).
  const contours = [0.4, 1.2, 2.4, 4.0].map((c) => {
    const rx = Math.sqrt((2 * c) / A);
    const ry = Math.sqrt((2 * c) / B);
    return {
      cx: sx(0),
      cy: sy(0),
      rx: (rx / (2 * XR)) * (W - 2 * pad),
      ry: (ry / (2 * YR)) * (H - 2 * pad),
    };
  });

  const pathStr = path
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join(" ");

  const canvas = (
    <div
      role="img"
      aria-label="Optimizer Descent Trajectory on a Loss Surface"
      className="flex flex-col gap-3 p-4 font-sans"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true">
        <rect x={0} y={0} width={W} height={H} fill={COLORS.bg} />
        {contours.map((c, i) => (
          <ellipse
            key={i}
            cx={c.cx}
            cy={c.cy}
            rx={c.rx}
            ry={c.ry}
            fill="none"
            stroke={COLORS.grid}
            strokeWidth={1.5}
          />
        ))}
        {/* minimum */}
        <circle cx={sx(0)} cy={sy(0)} r={3.5} fill={COLORS.muted} />
        {/* trajectory */}
        <path d={pathStr} fill="none" stroke={COLORS.cyan} strokeWidth={2} />
        {path.map(([x, y], i) => (
          <circle
            key={i}
            cx={sx(x)}
            cy={sy(y)}
            r={i === 0 ? 4 : i === path.length - 1 ? 4 : 2}
            fill={i === path.length - 1 ? COLORS.pink : COLORS.cyan}
          />
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-on-surface-variant">
        <span>Ravine: steep in y, flat in x — minimum at the center dot.</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Optimizer" value={OPT_LABEL[opt]} />
        <Stat label="Steps" value={String(steps)} />
        <Stat label="Final loss" value={finalLoss.toFixed(3)} />
      </div>
    </div>
  );

  const optButton = (o: Opt) => (
    <button
      type="button"
      aria-label={`Use ${OPT_LABEL[o]} optimizer`}
      onClick={() => setOpt(o)}
      className="border px-3 py-1.5 font-mono text-[12px] font-bold"
      style={{
        borderColor: COLORS.border,
        background: opt === o ? COLORS.cyan : "transparent",
        color: opt === o ? COLORS.bg : COLORS.muted,
      }}
    >
      {OPT_LABEL[o]}
    </button>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Optimizer
        </span>
        {optButton("sgd")}
        {optButton("momentum")}
        {optButton("adam")}
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Steps
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={steps}
            aria-label="Number of optimization steps"
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-44"
          />
          <span className="w-8 text-right font-mono text-[13px] font-bold text-on-surface">
            {steps}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Learning rate η
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.05}
            max={0.65}
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
    opt === "sgd"
      ? `Plain SGD is throttled by the steep y-direction: it must keep η small enough not to oscillate there, so it crawls along the flat x-direction and is still far from the minimum after ${steps} steps (loss ${finalLoss.toFixed(3)}). Push η up and it starts zig-zagging.`
      : opt === "momentum"
        ? `Momentum accumulates velocity along the consistent flat x-direction while the y-oscillations cancel, so it sweeps toward the minimum far faster than SGD (loss ${finalLoss.toFixed(3)} in ${steps} steps).`
        : `Adam rescales each coordinate by its recent gradient magnitude, so it takes large strides in the flat x-direction and careful ones in the steep y — reaching a low loss (${finalLoss.toFixed(3)}) with little tuning.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        The ellipses are <strong>contours of equal loss</strong> — a long, narrow
        valley that is steep across (y) and gently sloped along (x). The optimizer
        starts at the outer dot and tries to reach the minimum at the center.
      </p>
      <p>
        <strong>SGD</strong> steps straight downhill by a fixed fraction of the
        gradient. The steep y-walls force a small learning rate, so it barely
        moves along the flat valley floor. <strong>Momentum</strong> gives the
        ball inertia: it builds speed down the valley while side-to-side bounces
        cancel out.
      </p>
      <p>
        <strong>Adam</strong> goes further, giving each direction its own step size
        from the recent gradient magnitude — big strides where it is flat, small
        where it is steep. Switch optimizers and nudge the learning rate to feel
        why the optimizer choice, not just backprop, decides whether a model
        trains.
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
