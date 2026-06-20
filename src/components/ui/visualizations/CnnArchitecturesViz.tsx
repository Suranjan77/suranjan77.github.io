"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

// Deterministic per-layer Jacobian factor (no randomness).
function plainFactor(i: number) {
  // Typically below 1 -> the product shrinks with depth (vanishing gradient).
  const wobble = (Math.sin(i * 2.3) * 0.5 + 0.5) * 0.12; // 0..0.12
  return 0.74 + wobble; // ~0.74..0.86
}
function residualFactor(i: number) {
  // 1 + small dF/dx -> product stays near 1 (gradient highway).
  const wobble = Math.sin(i * 1.7) * 0.05; // -0.05..0.05
  return 1 + wobble;
}

export default function CnnArchitecturesViz() {
  const [depth, setDepth] = useState(24);
  const [residual, setResidual] = useState(false);

  // Gradient magnitude reaching each layer, backprop from output (=1) to input.
  const grads = useMemo(() => {
    const f = residual ? residualFactor : plainFactor;
    const out: number[] = new Array(depth);
    let g = 1; // gradient at the output layer
    for (let layer = depth - 1; layer >= 0; layer--) {
      out[layer] = g;
      g *= f(layer);
    }
    return out; // out[0] = gradient reaching the input (first) layer
  }, [depth, residual]);

  const gradAtInput = grads[0];

  // --- SVG bar chart: x = layer (input..output), y = gradient magnitude ---
  const W = 360;
  const H = 200;
  const pad = 26;
  const barW = (W - 2 * pad) / depth;
  const maxG = Math.max(1, ...grads);
  const by = (g: number) => H - pad - (g / maxG) * (H - 2 * pad);

  const canvas = (
    <div
      role="img"
      aria-label="Gradient Flow Through Network Depth: Plain vs Residual"
      className="flex flex-col gap-3 p-4 font-sans"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true">
        <rect x={0} y={0} width={W} height={H} fill={COLORS.bg} />
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={COLORS.border} />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={COLORS.border} />
        {/* reference: full gradient = 1 */}
        <line
          x1={pad}
          y1={by(1)}
          x2={W - pad}
          y2={by(1)}
          stroke={COLORS.muted}
          strokeDasharray="4 3"
        />
        {grads.map((g, i) => {
          const x = pad + i * barW;
          const y = by(g);
          return (
            <rect
              key={i}
              x={x + 0.5}
              y={y}
              width={Math.max(1, barW - 1)}
              height={H - pad - y}
              fill={residual ? COLORS.cyan : COLORS.pink}
            />
          );
        })}
        <text x={pad} y={H - 8} fontSize={10} fill={COLORS.muted} fontFamily="monospace">
          input layer
        </text>
        <text
          x={W - pad - 64}
          y={H - 8}
          fontSize={10}
          fill={COLORS.muted}
          fontFamily="monospace"
        >
          output layer
        </text>
        <text x={pad + 4} y={by(1) - 4} fontSize={10} fill={COLORS.muted} fontFamily="monospace">
          full signal = 1
        </text>
      </svg>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Mode" value={residual ? "Residual" : "Plain"} />
        <Stat label="Depth" value={String(depth)} />
        <Stat
          label="Gradient at input"
          value={gradAtInput < 0.001 ? gradAtInput.toExponential(1) : gradAtInput.toFixed(3)}
        />
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Architecture
        </span>
        <button
          type="button"
          aria-label="Use a plain stacked network"
          onClick={() => setResidual(false)}
          className="border px-3 py-1.5 font-mono text-[12px] font-bold"
          style={{
            borderColor: COLORS.border,
            background: !residual ? COLORS.pink : "transparent",
            color: !residual ? COLORS.bg : COLORS.muted,
          }}
        >
          Plain
        </button>
        <button
          type="button"
          aria-label="Use a residual network with skip connections"
          onClick={() => setResidual(true)}
          className="border px-3 py-1.5 font-mono text-[12px] font-bold"
          style={{
            borderColor: COLORS.border,
            background: residual ? COLORS.cyan : "transparent",
            color: residual ? COLORS.bg : COLORS.muted,
          }}
        >
          Residual
        </button>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Network depth
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={4}
            max={60}
            step={1}
            value={depth}
            aria-label="Network depth in layers"
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-44"
          />
          <span className="w-8 text-right font-mono text-[13px] font-bold text-on-surface">
            {depth}
          </span>
        </div>
      </div>
    </div>
  );

  const caption = residual
    ? `With skip connections, every block's gradient keeps a +1 identity term, so the signal reaches the input layer almost undiminished (${gradAtInput.toFixed(2)}) even at depth ${depth}. This is why ResNets train at 150+ layers.`
    : gradAtInput < 0.05
      ? `In a plain ${depth}-layer stack the gradient is a product of sub-1 factors, so it has decayed to ${gradAtInput < 0.001 ? gradAtInput.toExponential(1) : gradAtInput.toFixed(3)} by the input layer — the early layers barely learn. This is the vanishing gradient behind the degradation problem.`
      : `At depth ${depth} the plain network's gradient has already shrunk to ${gradAtInput.toFixed(3)} at the input. Push depth higher and watch it collapse toward zero.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Each bar is the <strong>gradient magnitude</strong> reaching a layer when
        you backpropagate from the output (right) toward the input (left). The
        dashed line is the full, undiminished signal.
      </p>
      <p>
        In a <strong>plain</strong> stack the gradient is a <em>product</em> of
        per-layer factors that are typically below 1, so it shrinks geometrically
        with depth — by the early layers it has all but vanished, and they stop
        learning. That is the degradation problem.
      </p>
      <p>
        A <strong>residual</strong> network adds an identity skip to every block,
        contributing a <code>+1</code> that turns that fragile product into a
        robust sum. The gradient now reaches the very first layer essentially
        intact, so hundreds of layers train — the breakthrough behind ResNet and,
        later, the Transformer.
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
