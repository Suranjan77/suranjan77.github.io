"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell, FlowingEdge } from "../visualizationPrimitives";

const W = 720;
const H = 380;

// fixed feature values for one training example, and its target
const x1 = 1.0;
const x2 = 0.5;
const target = 1.0;
const lr = 0.4;

const node = (x: number, y: number) => ({ x, y });
const P = {
  x1: node(80, 80),
  w1: node(80, 150),
  mul1: node(250, 115),
  x2: node(80, 250),
  w2: node(80, 320),
  mul2: node(250, 285),
  sum: node(420, 200),
  loss: node(600, 200),
};

export default function BackpropagationViz() {
  const [w1, setW1] = useState(0.2);
  const [w2, setW2] = useState(0.2);
  const [showBackward, setShowBackward] = useState(true);
  const [stepCount, setStepCount] = useState(0);

  const a1 = w1 * x1;
  const a2 = w2 * x2;
  const p = a1 + a2;
  const err = p - target; // dL/dp for L = 1/2 (p - target)^2
  const loss = 0.5 * err * err;
  const dW1 = err * x1;
  const dW2 = err * x2;

  const gradStep = () => {
    setW1((v) => +(v - lr * (v * x1 + w2 * x2 - target) * x1).toFixed(3));
    setW2((v) => +(v - lr * (w1 * x1 + v * x2 - target) * x2).toFixed(3));
    setShowBackward(true);
    setStepCount((s) => s + 1);
  };

  const reset = () => {
    setW1(0.2);
    setW2(0.2);
    setStepCount(0);
  };

  const edge = (a: { x: number; y: number }, b: { x: number; y: number }) => `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

  const caption =
    loss < 0.01
      ? `Loss is essentially zero — the neuron now predicts ${p.toFixed(2)} for a target of ${target}. Each gradient step nudged every weight at once, in the direction backprop said would lower the error.`
      : `The neuron predicts ${p.toFixed(2)} but the target is ${target}, so the error is ${err.toFixed(2)}. Backprop pushes that error backward: each weight's blame is the error times its own input, so dL/dw₁ = ${dW1.toFixed(2)} and dL/dw₂ = ${dW2.toFixed(2)}. Take a gradient step and watch the loss fall.`;

  const grad = (n: { x: number; y: number }, value: string, color: string) => (
    <text x={n.x} y={n.y + 30} textAnchor="middle" fill={color} fontSize={11} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
      {value}
    </text>
  );

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Backpropagation Credit Assignment">
      <title>Backpropagation Credit Assignment</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* forward edges */}
      {[
        [P.x1, P.mul1],
        [P.w1, P.mul1],
        [P.x2, P.mul2],
        [P.w2, P.mul2],
        [P.mul1, P.sum],
        [P.mul2, P.sum],
        [P.sum, P.loss],
      ].map(([a, b], i) => (
        <path key={i} d={edge(a, b)} stroke={COLORS.border} strokeWidth={2.5} fill="none" />
      ))}

      {/* backward blame flow onto the weights (the trainable parameters) */}
      {showBackward && loss > 0.005 && (
        <>
          <FlowingEdge d={edge(P.loss, P.sum)} color={COLORS.pink} speed={1.1} strokeWidth={2.5} />
          <FlowingEdge d={edge(P.mul1, P.w1)} color={COLORS.pink} speed={1.1} strokeWidth={2.5} />
          <FlowingEdge d={edge(P.mul2, P.w2)} color={COLORS.pink} speed={1.1} strokeWidth={2.5} />
        </>
      )}

      {/* nodes */}
      {[
        { n: P.x1, label: "x₁", val: x1.toFixed(1), kind: "in" },
        { n: P.w1, label: "w₁", val: w1.toFixed(2), kind: "weight" },
        { n: P.x2, label: "x₂", val: x2.toFixed(1), kind: "in" },
        { n: P.w2, label: "w₂", val: w2.toFixed(2), kind: "weight" },
        { n: P.mul1, label: "×", val: a1.toFixed(2), kind: "op" },
        { n: P.mul2, label: "×", val: a2.toFixed(2), kind: "op" },
        { n: P.sum, label: "+", val: p.toFixed(2), kind: "op" },
      ].map((d, i) => (
        <g key={i}>
          <circle cx={d.n.x} cy={d.n.y} r={26} fill={d.kind === "weight" ? COLORS.yellow : COLORS.bg} fillOpacity={d.kind === "weight" ? 0.18 : 1} stroke={d.kind === "weight" ? COLORS.yellow : COLORS.border} strokeWidth={d.kind === "weight" ? 2.5 : 1.5} />
          <text x={d.n.x} y={d.n.y - 3} textAnchor="middle" fill={COLORS.muted} fontSize={14} fontWeight={800}>{d.label}</text>
          <text x={d.n.x} y={d.n.y + 13} textAnchor="middle" fill={COLORS.cyan} fontSize={11} fontWeight={700}>{d.val}</text>
        </g>
      ))}

      {/* loss node */}
      <rect x={P.loss.x - 34} y={P.loss.y - 28} width={68} height={56} fill={COLORS.pink} fillOpacity={0.12} stroke={COLORS.pink} strokeWidth={2} />
      <text x={P.loss.x} y={P.loss.y - 8} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={800}>LOSS</text>
      <text x={P.loss.x} y={P.loss.y + 12} textAnchor="middle" fill={COLORS.pink} fontSize={15} fontWeight={900}>{loss.toFixed(3)}</text>
      <text x={P.loss.x} y={P.loss.y + 44} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={700}>target {target}</text>

      {/* gradients on the trainable weights */}
      {grad(P.w1, `grad ${dW1.toFixed(2)}`, COLORS.pink)}
      {grad(P.w2, `grad ${dW2.toFixed(2)}`, COLORS.pink)}

      <text x={28} y={30} fill={COLORS.muted} fontSize={11} fontWeight={800} letterSpacing="0.06em">
        FORWARD → prediction · ← BACKWARD blame onto each weight
      </text>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <label htmlFor="bp-w1" className="flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>weight w₁</span>
          <span className="text-on-surface">{w1.toFixed(2)}</span>
        </label>
        <input id="bp-w1" aria-label="Weight w1" type="range" min={-1} max={1.5} step={0.05} value={w1} onChange={(e) => setW1(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
        <label htmlFor="bp-w2" className="flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>weight w₂</span>
          <span className="text-on-surface">{w2.toFixed(2)}</span>
        </label>
        <input id="bp-w2" aria-label="Weight w2" type="range" min={-1} max={1.5} step={0.05} value={w2} onChange={(e) => setW2(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
      </div>

      <div className="flex min-w-[210px] flex-col justify-center gap-2 border border-outline bg-surface p-3 font-mono text-[12px]">
        <div className="font-bold uppercase tracking-wide text-on-surface-variant">Calculated Gradients</div>
        <div className="flex items-center justify-between"><span>dL/dw₁ = err·x₁</span><span data-testid="bp-grad1" className="font-bold" style={{ color: COLORS.pink }}>{dW1.toFixed(2)}</span></div>
        <div className="flex items-center justify-between"><span>dL/dw₂ = err·x₂</span><span className="font-bold" style={{ color: COLORS.pink }}>{dW2.toFixed(2)}</span></div>
        <div className="flex items-center justify-between border-t border-outline pt-1"><span>loss</span><span data-testid="bp-loss" className="font-bold text-on-surface">{loss.toFixed(3)}</span></div>
        <div className="mt-1 flex flex-wrap gap-2">
          <button
            aria-label="Take a gradient step"
            onClick={gradStep}
            className="flex h-9 items-center justify-center border border-primary bg-primary px-3 font-mono text-[11px] font-bold uppercase tracking-wide text-on-primary transition-colors hover:opacity-90"
          >
            Gradient step ({stepCount})
          </button>
          <button
            aria-label="Reset weights"
            onClick={reset}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Training a network means answering one question millions of times: <strong>which way
        should I nudge each weight to reduce the error?</strong> That answer is the{" "}
        <strong>gradient</strong> dL/dw for every weight.
      </p>
      <p>
        <strong>Backpropagation</strong> computes them all in a single backward sweep. It starts
        from the loss and applies the chain rule, passing &quot;blame&quot; backward through each
        operation: at a multiply gate, each input&apos;s share of the blame is the upstream gradient
        times the <em>other</em> input. Here that makes each weight&apos;s gradient simply{" "}
        <em>error × its own input</em> — so the weight attached to the bigger feature gets the bigger
        correction.
      </p>
      <p>
        The naive alternative — wiggle one weight, re-run the whole network, measure the change,
        repeat for every weight — would cost one forward pass <em>per weight</em>. Backprop&apos;s
        single reverse pass is what makes training billion-parameter models feasible. Each gradient
        step then walks every weight a little way downhill.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
