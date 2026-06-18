"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 440;

const DMIN = -2.6;
const DMAX = 2.6;
const SPAN = DMAX - DMIN;

// isometric projection of the height field
const N = 24;
const OX = 360;
const OY = 150;
const ISO_W = 168;
const ISO_H = 66;
const ZLIFT = 150;

// A long valley descending to a deep global basin at (2,0), with a SHALLOW
// pothole partway (around (-0.7,0)). SGD rolls in and stalls; a heavy/adaptive
// optimizer coasts through to the bottom.
const lossVal = (x: number, y: number) =>
  0.12 * (x - 2) * (x - 2) + 0.25 * y * y - 0.55 * Math.exp(-(((x + 0.7) ** 2 + y * y) / 0.3));
const lossGrad = (x: number, y: number) => {
  const e = Math.exp(-(((x + 0.7) ** 2 + y * y) / 0.3));
  return {
    dx: 0.24 * (x - 2) + 0.55 * e * ((2 * (x + 0.7)) / 0.3),
    dy: 0.5 * y + 0.55 * e * ((2 * y) / 0.3),
  };
};

const START = { x: -2.2, y: 0.9 };
const GLOBAL = { x: 2, y: 0 };

interface Pt { x: number; y: number }
interface Runner {
  key: "sgd" | "momentum" | "adam";
  label: string;
  color: string;
  pos: Pt;
  vel: Pt;
  m: Pt;
  v: Pt;
  t: number;
  path: Pt[];
  done: boolean;
}

const makeRunners = (): Runner[] => [
  { key: "sgd", label: "SGD", color: COLORS.cyan, pos: { ...START }, vel: { x: 0, y: 0 }, m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0, path: [{ ...START }], done: false },
  { key: "momentum", label: "Momentum", color: COLORS.yellow, pos: { ...START }, vel: { x: 0, y: 0 }, m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0, path: [{ ...START }], done: false },
  { key: "adam", label: "Adam", color: COLORS.pink, pos: { ...START }, vel: { x: 0, y: 0 }, m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0, path: [{ ...START }], done: false },
];

// pure step: returns an updated runner (kept out of render so no ref reads).
function step(r: Runner, lr: number): Runner {
  if (r.done) return r;
  const { dx, dy } = lossGrad(r.pos.x, r.pos.y);
  const clip = 8;
  const gX = Math.max(-clip, Math.min(clip, dx));
  const gY = Math.max(-clip, Math.min(clip, dy));
  let nx = r.pos.x;
  let ny = r.pos.y;
  let vel = r.vel;
  let m = r.m;
  let v = r.v;
  let t = r.t;
  if (r.key === "sgd") {
    nx -= lr * gX;
    ny -= lr * gY;
  } else if (r.key === "momentum") {
    vel = { x: 0.92 * r.vel.x + lr * gX, y: 0.92 * r.vel.y + lr * gY };
    nx -= vel.x;
    ny -= vel.y;
  } else {
    const b1 = 0.9;
    const b2 = 0.999;
    t = r.t + 1;
    m = { x: b1 * r.m.x + (1 - b1) * gX, y: b1 * r.m.y + (1 - b1) * gY };
    v = { x: b2 * r.v.x + (1 - b2) * gX * gX, y: b2 * r.v.y + (1 - b2) * gY * gY };
    const mhx = m.x / (1 - Math.pow(b1, t));
    const mhy = m.y / (1 - Math.pow(b1, t));
    const vhx = v.x / (1 - Math.pow(b2, t));
    const vhy = v.y / (1 - Math.pow(b2, t));
    nx -= (lr * 6 * mhx) / (Math.sqrt(vhx) + 1e-8);
    ny -= (lr * 6 * mhy) / (Math.sqrt(vhy) + 1e-8);
  }
  nx = Math.max(DMIN, Math.min(DMAX, nx));
  ny = Math.max(DMIN, Math.min(DMAX, ny));
  const moved = Math.hypot(nx - r.pos.x, ny - r.pos.y);
  const pos = { x: nx, y: ny };
  const done = (r.path.length > 5 && moved < 0.0025) || r.path.length > 320;
  return { ...r, pos, vel, m, v, t, path: [...r.path, pos], done };
}

const LOW = [78, 116, 70];
const HIGH = [165, 138, 96];
const baseColor = (t: number) => LOW.map((v, i) => v + (HIGH[i] - v) * t);
const LIGHT = (() => {
  const v = [-0.45, -0.4, 0.8];
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
})();

export default function GradientDescentViz() {
  const [lr, setLr] = useState(0.04);
  const [isRunning, setIsRunning] = useState(false);
  const [runners, setRunners] = useState<Runner[]>(makeRunners);

  // static terrain mesh
  const surface = useMemo(() => {
    const heights: number[][] = [];
    let fmin = Infinity;
    let fmax = -Infinity;
    for (let i = 0; i <= N; i++) {
      heights[i] = [];
      for (let j = 0; j <= N; j++) {
        const f = lossVal(DMIN + (i / N) * SPAN, DMIN + (j / N) * SPAN);
        heights[i][j] = f;
        if (f < fmin) fmin = f;
        if (f > fmax) fmax = f;
      }
    }
    const norm = (f: number) => (fmax > fmin ? (f - fmin) / (fmax - fmin) : 0);
    const proj = (i: number, j: number) => {
      const gx = i / N;
      const gy = j / N;
      const h = norm(heights[i][j]);
      return { sx: OX + (gx - gy) * ISO_W, sy: OY + (gx + gy) * ISO_H - h * ZLIFT };
    };
    const ZW = 1.5;
    const wp = (i: number, j: number) => [i / N, j / N, norm(heights[i][j]) * ZW];
    const cells: { pts: string; fill: string; order: number }[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const a = proj(i, j);
        const b = proj(i + 1, j);
        const c = proj(i + 1, j + 1);
        const d = proj(i, j + 1);
        const avg = norm((heights[i][j] + heights[i + 1][j] + heights[i + 1][j + 1] + heights[i][j + 1]) / 4);
        const p0 = wp(i, j);
        const e1 = wp(i + 1, j);
        const e2 = wp(i, j + 1);
        const v1 = [e1[0] - p0[0], e1[1] - p0[1], e1[2] - p0[2]];
        const v2 = [e2[0] - p0[0], e2[1] - p0[1], e2[2] - p0[2]];
        let nx = v1[1] * v2[2] - v1[2] * v2[1];
        let ny = v1[2] * v2[0] - v1[0] * v2[2];
        let nz = v1[0] * v2[1] - v1[1] * v2[0];
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl; ny /= nl; nz /= nl;
        if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const diff = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
        const shade = 0.6 + 0.55 * diff;
        const base = baseColor(avg);
        const fill = `rgb(${Math.round(Math.min(255, base[0] * shade))},${Math.round(Math.min(255, base[1] * shade))},${Math.round(Math.min(255, base[2] * shade))})`;
        cells.push({ pts: `${a.sx.toFixed(1)},${a.sy.toFixed(1)} ${b.sx.toFixed(1)},${b.sy.toFixed(1)} ${c.sx.toFixed(1)},${c.sy.toFixed(1)} ${d.sx.toFixed(1)},${d.sy.toFixed(1)}`, fill, order: i + j });
      }
    }
    cells.sort((p, q) => p.order - q.order);
    return { norm, cells };
  }, []);

  const projectPoint = (x: number, y: number) => {
    const gx = (x - DMIN) / SPAN;
    const gy = (y - DMIN) / SPAN;
    const h = Math.max(0, Math.min(1, surface.norm(lossVal(x, y))));
    return { sx: OX + (gx - gy) * ISO_W, sy: OY + (gx + gy) * ISO_H - h * ZLIFT };
  };

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setRunners((prev) => prev.map((r) => step(r, lr)));
    }, 45);
    return () => clearInterval(id);
  }, [isRunning, lr]);

  useEffect(() => {
    if (isRunning && runners.every((r) => r.done)) setIsRunning(false);
  }, [runners, isRunning]);

  const reset = () => {
    setIsRunning(false);
    setRunners(makeRunners());
  };
  const status = (r: Runner) => {
    const loss = lossVal(r.pos.x, r.pos.y);
    const reached = Math.hypot(r.pos.x - GLOBAL.x, r.pos.y - GLOBAL.y) < 0.4;
    return { loss, reached, state: !r.done ? "running" : reached ? "reached global ✓" : "stuck in local pit" };
  };
  const stats = runners.map((r) => ({ r, ...status(r) }));
  const sgdStuck = stats.find((s) => s.r.key === "sgd" && s.r.done && !s.reached);
  const othersEscaped = stats.some((s) => s.r.key !== "sgd" && s.reached);
  const started = runners.some((r) => r.path.length > 1);

  const caption = !started
    ? "Three optimizers start at the same spot on a long slope. Press Run: SGD only follows the local slope, momentum builds speed like a heavy ball, and Adam adapts its step per direction."
    : runners.every((r) => r.done)
      ? sgdStuck && othersEscaped
        ? "There it is: plain SGD stalled in the shallow pit on the way down, while momentum's speed and Adam's adaptive steps carried them over it to the deep valley. That is why optimizer choice matters."
        : "All runners settled. Try a different learning rate or reset — with the right momentum a heavy ball coasts through the pit that traps plain SGD."
      : "Racing downhill — watch SGD slow as it nears the shallow pit while momentum and Adam keep their speed toward the deep valley.";

  const minP = projectPoint(GLOBAL.x, GLOBAL.y);

  const canvas = (
    <svg className="block h-auto w-full select-none" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gradient Descent Optimizer Race">
      <title>Gradient Descent Optimizer Race</title>
      <rect width={W} height={H} fill={COLORS.bg} />

      {surface.cells.map((c, i) => (
        <polygon key={i} points={c.pts} fill={c.fill} stroke={c.fill} strokeWidth={0.8} />
      ))}

      <g transform={`translate(${minP.sx}, ${minP.sy})`}>
        <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill={COLORS.bg} stroke={COLORS.pink} strokeWidth={1.5} />
      </g>

      {runners.map((r) =>
        r.path.length > 1 ? (
          <polyline key={`p-${r.key}`} points={r.path.map((p) => { const s = projectPoint(p.x, p.y); return `${s.sx.toFixed(1)},${s.sy.toFixed(1)}`; }).join(" ")} fill="none" stroke={r.color} strokeWidth={2.5} strokeLinejoin="round" opacity={0.9} />
        ) : null,
      )}
      {runners.map((r) => {
        const s = projectPoint(r.pos.x, r.pos.y);
        return <circle key={`b-${r.key}`} cx={s.sx} cy={s.sy} r={6} fill={r.color} stroke={COLORS.bg} strokeWidth={1.5} />;
      })}

      <text x={20} y={H - 16} fill={COLORS.muted} fontSize={11}>green valley = low loss · ◆ = deepest (global) valley · shallow pit traps plain SGD</text>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3 font-mono text-xs">
        <label className="text-[11px] font-bold uppercase text-on-surface-variant" htmlFor="gd-lr">Learning rate (step size): {lr.toFixed(3)}</label>
        <input id="gd-lr" type="range" min={0.01} max={0.08} step={0.005} value={lr} onChange={(e) => { setLr(Number(e.target.value)); reset(); }} aria-label="Learning rate" className="w-full cursor-pointer accent-cyan" />
        <div className="flex gap-2">
          <button onClick={() => setIsRunning((r) => !r)} aria-label={isRunning ? "Pause the optimizer race" : "Run the optimizer race"} className={`flex h-9 flex-1 items-center justify-center border border-outline px-3 font-bold uppercase tracking-wide ${isRunning ? "bg-warning/20 border-warning text-warning" : "bg-cyan text-white hover:bg-cyan/90"}`}>
            {isRunning ? "Pause" : "Run race"}
          </button>
          <button onClick={reset} aria-label="Reset the race" className="flex h-9 flex-1 items-center justify-center border border-outline bg-surface px-3 font-bold uppercase tracking-wide text-on-surface hover:bg-surface-container">Reset</button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        {stats.map(({ r, loss, state }) => (
          <div key={r.key} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3" style={{ backgroundColor: r.color }} />
            <span className="w-20 font-bold" style={{ color: r.color }}>{r.label}</span>
            <span className="flex-1 text-on-surface-variant">{state}</span>
            <span className="w-14 text-right">loss {loss.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </>
  );

  const mentalModel = (
    <p>
      Training minimizes a loss over a vast, bumpy landscape, and an optimizer
      only feels the slope under its feet. Plain <strong>SGD</strong> steps
      straight downhill, so it stalls in the first dip it finds.{" "}
      <strong>Momentum</strong> accumulates velocity like a heavy ball, coasting
      through shallow pits and small bumps. <strong>Adam</strong> also adapts the
      step size per direction, powering through flat spots and narrow valleys.
      That is why the optimizer (and the learning rate) decides whether training
      reaches a good solution or gets stuck.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
