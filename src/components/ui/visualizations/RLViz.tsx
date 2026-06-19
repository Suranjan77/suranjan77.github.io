"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 420;
const GRID = 5;
const cellSize = 60;
const ox = 70;
const oy = 70;

// 0=Up 1=Right 2=Down 3=Left
const dr = [-1, 0, 1, 0];
const dc = [0, 1, 0, -1];

const START = { r: 4, c: 0 };
const GOAL = { r: 0, c: 4 };
const TRAP = { r: 2, c: 2 };

const alpha = 0.6;
const gamma = 0.9;
const epsilon = 0.25;

const zeroQ = () =>
  Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => [0, 0, 0, 0]));

function lerpColor(t: number) {
  // pale background -> warm green as value rises
  const a = [250, 248, 242];
  const b = [85, 107, 74];
  const m = a.map((av, i) => Math.round(av + (b[i] - av) * t));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}

export default function RLViz() {
  const [agent, setAgent] = useState(START);
  const [q, setQ] = useState<number[][][]>(zeroQ);
  const [episodes, setEpisodes] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const qRef = useRef(q);
  const agentRef = useRef(agent);
  useEffect(() => {
    qRef.current = q;
    agentRef.current = agent;
  });

  const reward = (r: number, c: number) => (r === GOAL.r && c === GOAL.c ? 10 : r === TRAP.r && c === TRAP.c ? -10 : -0.1);
  const clamp = (v: number) => Math.max(0, Math.min(GRID - 1, v));

  // Run n Q-learning steps, threading agent + Q-table locally so a whole batch
  // chains correctly, then commit once. Refs are touched only here (a callback),
  // never during render.
  const advance = (n: number) => {
    const ql = qRef.current.map((row) => row.map((cell) => [...cell]));
    let a = { ...agentRef.current };
    let addedEpisodes = 0;
    for (let i = 0; i < n; i++) {
      const qs = ql[a.r][a.c];
      let act: number;
      if (Math.random() < epsilon) {
        act = Math.floor(Math.random() * 4);
      } else {
        const mx = Math.max(...qs);
        const best = qs.map((v, idx) => (v === mx ? idx : -1)).filter((idx) => idx >= 0);
        act = best[Math.floor(Math.random() * best.length)];
      }
      const nr = clamp(a.r + dr[act]);
      const nc = clamp(a.c + dc[act]);
      const rwd = reward(nr, nc);
      const maxNext = Math.max(...ql[nr][nc]);
      ql[a.r][a.c][act] = qs[act] + alpha * (rwd + gamma * maxNext - qs[act]);
      const terminal = (nr === GOAL.r && nc === GOAL.c) || (nr === TRAP.r && nc === TRAP.c);
      if (terminal) {
        a = { ...START };
        addedEpisodes++;
      } else {
        a = { r: nr, c: nc };
      }
    }
    qRef.current = ql;
    agentRef.current = a;
    setQ(ql);
    setAgent(a);
    if (addedEpisodes) setEpisodes((e) => e + addedEpisodes);
  };

  const step = () => advance(1);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (playing) {
      timer.current = setInterval(() => advance(6), 110);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // advance reads/writes refs and is stable enough for the interval
  }, [playing]);

  const reset = () => {
    setPlaying(false);
    setQ(zeroQ());
    setAgent(START);
    setEpisodes(0);
  };

  // value V(s) = max_a Q and best action per cell
  const { V, bestAct, vmax, learned } = useMemo(() => {
    const V: number[][] = [];
    const bestAct: (number | null)[][] = [];
    let vmax = 0.001;
    let learned = 0;
    for (let r = 0; r < GRID; r++) {
      V[r] = [];
      bestAct[r] = [];
      for (let c = 0; c < GRID; c++) {
        const qs = q[r][c];
        const m = Math.max(...qs);
        V[r][c] = m;
        if (m > vmax) vmax = m;
        const isTerminal = (r === GOAL.r && c === GOAL.c) || (r === TRAP.r && c === TRAP.c);
        if (!isTerminal && qs.some((v) => v !== 0)) {
          bestAct[r][c] = qs.indexOf(m);
          learned++;
        } else {
          bestAct[r][c] = null;
        }
      }
    }
    return { V, bestAct, vmax, learned };
  }, [q]);

  const solved = bestAct[START.r][START.c] !== null && learned >= 10;
  const status = episodes === 0 ? "exploring blindly" : solved ? "policy found — agent routes to the goal" : "value spreading back from the goal…";

  const caption =
    episodes === 0
      ? "Every cell starts equally worthless — the agent has no idea where reward is and wanders. Press Auto-explore and watch what happens once it stumbles onto the goal."
      : solved
        ? `After ${episodes} episodes the value has flooded back from the goal across the grid, and the arrows form a clear route that steps around the trap. The agent learned long-horizon behavior from a single delayed reward.`
        : `${episodes} episodes in: reward discovered at the goal is backing up one step at a time (greener = more valuable to stand here). The policy arrows are still forming.`;

  const cx = (c: number) => ox + c * cellSize + cellSize / 2;
  const cy = (r: number) => oy + r * cellSize + cellSize / 2;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Q-Learning Reinforcement Learning Gridworld">
      <title>Q-Learning Reinforcement Learning Gridworld</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {Array.from({ length: GRID }).map((_, r) =>
        Array.from({ length: GRID }).map((__, c) => {
          const isGoal = r === GOAL.r && c === GOAL.c;
          const isTrap = r === TRAP.r && c === TRAP.c;
          const t = Math.max(0, Math.min(1, V[r][c] / vmax));
          const fill = isGoal ? COLORS.green : isTrap ? COLORS.pink : lerpColor(t);
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={ox + c * cellSize}
                y={oy + r * cellSize}
                width={cellSize - 2}
                height={cellSize - 2}
                fill={fill}
                fillOpacity={isGoal || isTrap ? 0.85 : 1}
                stroke={COLORS.border}
                strokeWidth={1}
                className="cursor-pointer"
                onPointerDown={() => {
                  setAgent({ r, c });
                }}
              />
              {bestAct[r][c] !== null && (
                <g transform={`translate(${cx(c)}, ${cy(r)}) rotate(${(bestAct[r][c] as number) * 90})`} className="pointer-events-none">
                  <line x1={0} y1={11} x2={0} y2={-9} stroke={COLORS.yellow} strokeWidth={2.5} />
                  <polygon points="-5,-5 5,-5 0,-13" fill={COLORS.yellow} />
                </g>
              )}
              {isGoal && <text x={cx(c)} y={cy(r) + 4} textAnchor="middle" fill={COLORS.bg} fontSize={11} fontWeight={900} className="pointer-events-none">GOAL</text>}
              {isTrap && <text x={cx(c)} y={cy(r) + 4} textAnchor="middle" fill={COLORS.bg} fontSize={11} fontWeight={900} className="pointer-events-none">TRAP</text>}
            </g>
          );
        }),
      )}

      {/* agent */}
      <motion.circle
        r={13}
        fill={COLORS.cyan}
        stroke={COLORS.bg}
        strokeWidth={2.5}
        initial={false}
        animate={{ cx: cx(agent.c), cy: cy(agent.r) }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      />

      {/* value colour key */}
      <text x={ox + GRID * cellSize + 16} y={oy + 6} fill={COLORS.muted} fontSize={11} fontWeight={800}>VALUE</text>
      {[1, 0.66, 0.33, 0].map((t, i) => (
        <g key={i}>
          <rect x={ox + GRID * cellSize + 16} y={oy + 16 + i * 26} width={18} height={18} fill={lerpColor(t)} stroke={COLORS.border} />
          <text x={ox + GRID * cellSize + 40} y={oy + 30 + i * 26} fill={COLORS.muted} fontSize={10} fontWeight={700}>
            {t === 1 ? "high" : t === 0 ? "low" : ""}
          </text>
        </g>
      ))}
      <text x={ox + GRID * cellSize + 16} y={oy + 16 + 4 * 26 + 18} fill={COLORS.yellow} fontSize={10} fontWeight={800}>↑ policy</text>
    </svg>
  );

  const controls = (
    <>
      <div className="flex min-w-[200px] flex-col justify-center gap-1 border border-outline bg-surface p-3 font-mono text-[12px]">
        <span className="font-bold uppercase tracking-wide text-on-surface-variant">Simulation status</span>
        <span data-testid="rl-status" className="font-sans text-[13px] font-semibold text-primary">{status}</span>
        <div className="mt-1 flex items-center justify-between border-t border-outline pt-2">
          <span className="text-on-surface-variant">episodes</span>
          <span className="font-bold text-on-surface">{episodes}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-on-surface-variant">cells with a policy</span>
          <span className="font-bold text-on-surface">{learned} / {GRID * GRID - 2}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <div className="flex flex-wrap gap-2">
          <button
            aria-label={playing ? "Pause auto run" : "Auto explore"}
            onClick={() => setPlaying((p) => !p)}
            className={`flex h-9 items-center justify-center border px-4 font-mono text-[12px] font-bold uppercase tracking-wide transition-colors ${
              playing ? "border-warning bg-warning/20 text-warning" : "border-primary bg-primary text-on-primary"
            }`}
          >
            {playing ? "Pause" : "Auto-explore"}
          </button>
          <button
            aria-label="Take one step"
            onClick={step}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-4 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container hover:text-primary"
          >
            Step
          </button>
          <button
            aria-label="Reset Q-table"
            onClick={reset}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-4 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Reset
          </button>
        </div>
        <p className="font-sans text-[12px] leading-snug text-on-surface-variant">
          The cyan agent moves mostly toward its best-known action but sometimes explores at random.
          Each move backs up a little value from where it landed. Click any cell to drop the agent
          there.
        </p>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        In reinforcement learning an agent gets no labelled answers — only a <strong>reward</strong>{" "}
        signal, and usually only at the end (reaching the goal). The hard part is{" "}
        <strong>credit assignment</strong> over a long horizon: which of the many earlier moves
        deserve credit for the eventual reward?
      </p>
      <p>
        <strong>Q-learning</strong> solves it by backing value up one step at a time:
        {" "}
        <em>Q(s,a) ← Q(s,a) + α[r + γ·maxₐ′ Q(s′,a′) − Q(s,a)]</em>. A cell becomes valuable when it
        leads to a valuable cell, so the goal&apos;s reward ripples outward across episodes until
        every cell knows which way to go — the greedy arrows trace the learned route around the
        trap.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
