"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

type GradientMode = "vanishing" | "stable" | "exploding";

export default function SequenceModelsViz() {
  const [mode, setMode] = useState<GradientMode>("vanishing");
  const [sequenceLength] = useState<number>(4);

  // Simple unrolled simulation parameters based on the mode
  const simulationData = useMemo(() => {
    // Mode parameters
    // weight parameter determines the rate of gradient decay/growth: grad_t = weight * grad_{t+1}
    let weight = 0.3;
    if (mode === "stable") weight = 1.0;
    if (mode === "exploding") weight = 2.2;

    const data = [];
    const baseGradient = 1.0; // gradient at the final step

    // Calculate forward values (hidden state h_t) and backward values (gradient g_t)
    // For simplicity, let inputs x_t = [0.5, 0.8, -0.4, 0.6]
    const inputs = [0.5, 0.8, -0.4, 0.6];
    let currentH = 0.0;

    for (let t = 0; t < sequenceLength; t++) {
      const x = inputs[t];
      // h_t = tanh(weight * h_{t-1} + x)
      currentH = Math.tanh(weight * currentH + x);
      data.push({
        timestep: t + 1,
        x,
        h: currentH,
        // gradient at timestep t propagates backwards from the end step
        // grad_t = baseGradient * (weight ^ (T - 1 - t))
        grad: baseGradient * Math.pow(weight, sequenceLength - 1 - t)
      });
    }

    return data;
  }, [mode, sequenceLength]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox="0 0 640 420"
            className="w-full h-auto select-none"
            role="img"
            aria-label="Sequence Models RNN Unrolled Graph Visualizer"
          >
            <title>RNN Unrolled Through Time</title>
            <defs>
              <pattern id="seq-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="640" height="420" fill="url(#seq-grid)" />

            {/* Connecting temporal edges (h_{t-1} -> h_t) */}
            <path d="M 170 210 L 230 210" stroke={COLORS.muted} strokeWidth={2.5} markerEnd="url(#arrow)" />
            <path d="M 310 210 L 370 210" stroke={COLORS.muted} strokeWidth={2.5} />
            <path d="M 450 210 L 510 210" stroke={COLORS.muted} strokeWidth={2.5} />

            {/* Arrow marker for backward gradients */}
            <defs>
              <marker id="arrow-back" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 10 0 L 0 5 L 10 10 z" fill={COLORS.pink} />
              </marker>
            </defs>
            
            {/* Backward gradient arrows */}
            <path d="M 210 240 L 190 240" stroke={COLORS.pink} strokeWidth={2.5} markerEnd="url(#arrow-back)" strokeDasharray="3 3" />
            <path d="M 350 240 L 330 240" stroke={COLORS.pink} strokeWidth={2.5} markerEnd="url(#arrow-back)" strokeDasharray="3 3" />
            <path d="M 490 240 L 470 240" stroke={COLORS.pink} strokeWidth={2.5} markerEnd="url(#arrow-back)" strokeDasharray="3 3" />

            {/* Render Timestep Blocks */}
            {simulationData.map((step, idx) => {
              // X positions for unrolled timesteps: step 1=130, 2=270, 3=410, 4=550
              const cx = 130 + idx * 140;
              const cy = 210;

              // Size representing gradient magnitude (capped for visualization safety)
              const gradRadius = Math.min(45, Math.max(5, Math.sqrt(step.grad) * 20));

              return (
                <g key={`step-${step.timestep}`}>
                  {/* Vertical line from input x_t to hidden h_t */}
                  <line x1={cx} y1={90} x2={cx} y2={cy - 40} stroke={COLORS.muted} strokeWidth={2} />
                  
                  {/* Input circle */}
                  <circle cx={cx} cy={80} r={20} fill={COLORS.bg} stroke={COLORS.border} strokeWidth={2} />
                  <text x={cx} y={75} textAnchor="middle" fontSize={9} fontWeight={700} fill={COLORS.muted}>x{step.timestep}</text>
                  <text x={cx} y={87} textAnchor="middle" fontSize={9} fontWeight={800} fill={COLORS.cyan}>{step.x.toFixed(1)}</text>

                  {/* Gradient representation (dashed outer circle) */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={gradRadius}
                    fill="none"
                    stroke={COLORS.pink}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    opacity={0.8}
                  />

                  {/* Hidden state node */}
                  <circle cx={cx} cy={cy} r={35} fill={COLORS.bg} stroke={COLORS.border} strokeWidth={2} />
                  <text x={cx} y={cy - 5} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.muted}>h{step.timestep}</text>
                  <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.cyan}>{step.h.toFixed(3)}</text>

                  {/* Gradient magnitude label */}
                  <text x={cx} y={cy + 55} textAnchor="middle" fontSize={10} fontWeight={800} fill={COLORS.pink}>
                    g: {step.grad.toFixed(3)}
                  </text>
                </g>
              );
            })}

            {/* Labels */}
            <text x={320} y={30} fill={COLORS.muted} fontSize={12} fontWeight={700} textAnchor="middle">
              RECURRENT NETWORK UNROLLED OVER 4 TIME STEPS
            </text>
            <text x={320} y={385} fill={COLORS.muted} fontSize={9} fontWeight={600} textAnchor="middle">
              Gradients flow in reverse (right to left). Note how the gradient values (g) shrink or grow across steps.
            </text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Gradient Modes</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="seq-mode-select">
              Select RNN Scenario
            </label>
            <select
              id="seq-mode-select"
              value={mode}
              onChange={e => setMode(e.target.value as GradientMode)}
              className="w-full border border-outline bg-surface p-2 text-xs sm:text-sm rounded"
              aria-label="Select gradient flow scenario"
            >
              <option value="vanishing">Vanishing Gradient (Small Weight)</option>
              <option value="stable">Stable Gradient (LSTM / Identity Update)</option>
              <option value="exploding">Exploding Gradient (Large Weight)</option>
            </select>
          </div>
        </div>

        {/* Diagnostics */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Analysis</div>
          <p className="text-xs leading-relaxed text-on-surface-variant">
            {mode === "vanishing" && (
              "Under Vanishing gradients, weights are small. As the error signal flows backward through timesteps, it gets multiplied by the weight repeatedly and decays to near zero at timestep 1. The model cannot learn long-term relationships."
            )}
            {mode === "stable" && (
              "Under Stable gradients, the weights allow gradients to flow backwards with minimal loss in magnitude. This is how LSTMs maintain historical information using additive constant error carousels."
            )}
            {mode === "exploding" && (
              "Under Exploding gradients, the weights are large. The feedback loop multiplies gradients repeatedly, causing the signal at timestep 1 to blow up to very large values, leading to unstable training."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
