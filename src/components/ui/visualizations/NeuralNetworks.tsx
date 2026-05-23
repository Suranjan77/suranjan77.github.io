"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  COLORS,
  ControlPanel,
  PlotFrame,
  VisualizationShell,
  NativeCanvasPlot,
  drawHelper,
} from "../visualizationPrimitives";

export default function NeuralNetworksVisualization() {
  const [x1, setX1] = useState(0.5);
  const [x2, setX2] = useState(-0.2);

  // User-tunable weights for interaction
  const [w11, setW11] = useState(0.8);
  const [w21, setW21] = useState(-0.4);
  const [wOut1, setWOut1] = useState(0.9);

  const w1 = useMemo(() => [
    [w11, -0.5, 0.3],
    [w21, 0.9, -0.7]
  ], [w11, w21]);
  
  const b1 = useMemo(() => [-0.2, 0.1, -0.4], []);

  const w2 = useMemo(() => [wOut1, -0.8, 0.6], [wOut1]);
  const b2 = 0.2;

  // Forward Pass
  const hiddenZ = useMemo(() => {
    return [
      x1 * w1[0][0] + x2 * w1[1][0] + b1[0],
      x1 * w1[0][1] + x2 * w1[1][1] + b1[1],
      x1 * w1[0][2] + x2 * w1[1][2] + b1[2],
    ];
  }, [x1, x2, w1, b1]);

  const hiddenA = useMemo(() => {
    return hiddenZ.map((z) => Math.tanh(z));
  }, [hiddenZ]);

  const outputZ = useMemo(() => {
    return hiddenA[0] * w2[0] + hiddenA[1] * w2[1] + hiddenA[2] * w2[2] + b2;
  }, [hiddenA, w2, b2]);

  const outputA = useMemo(() => {
    return 1 / (1 + Math.exp(-outputZ));
  }, [outputZ]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    const nodes = {
      inputs: [
        { x: 70, y: 70, val: x1 },
        { x: 70, y: 150, val: x2 }
      ],
      hidden: [
        { x: 160, y: 50, val: hiddenA[0] },
        { x: 160, y: 110, val: hiddenA[1] },
        { x: 160, y: 170, val: hiddenA[2] }
      ],
      output: [
        { x: 250, y: 110, val: outputA }
      ]
    };

    nodes.inputs.forEach((inputNode, iIdx) => {
      nodes.hidden.forEach((hidNode, hIdx) => {
        const weight = w1[iIdx][hIdx];
        const strokeW = Math.max(0.5, Math.abs(weight) * 3.5);
        const color = weight >= 0 ? COLORS.cyan : COLORS.pink;
        drawHelper.line(ctx, inputNode.x, inputNode.y, hidNode.x, hidNode.y, color, strokeW);
      });
    });

    nodes.hidden.forEach((hidNode, hIdx) => {
      const weight = w2[hIdx];
      const strokeW = Math.max(0.5, Math.abs(weight) * 3.5);
      const color = weight >= 0 ? COLORS.cyan : COLORS.pink;
      drawHelper.line(ctx, hidNode.x, hidNode.y, nodes.output[0].x, nodes.output[0].y, color, strokeW);
    });

    nodes.inputs.forEach((node) => {
      drawHelper.point(ctx, node.x, node.y, COLORS.muted, "circle", 6.5);
      const intensity = Math.abs(node.val);
      ctx.save();
      ctx.strokeStyle = node.val >= 0 ? COLORS.cyan : COLORS.pink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6.5 + intensity * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    nodes.hidden.forEach((node) => {
      drawHelper.point(ctx, node.x, node.y, COLORS.muted, "circle", 6.5);
      const intensity = Math.abs(node.val);
      ctx.save();
      ctx.strokeStyle = node.val >= 0 ? COLORS.cyan : COLORS.pink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6.5 + intensity * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    nodes.output.forEach((node) => {
      drawHelper.point(ctx, node.x, node.y, COLORS.yellow, "circle", 7.5);
      const intensity = node.val;
      ctx.save();
      ctx.strokeStyle = COLORS.yellow;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 7.5 + intensity * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    ctx.fillStyle = COLORS.muted;
    ctx.font = "bold 8px var(--font-mono)";
    ctx.textAlign = "center";
    ctx.fillText("x1", 70, 56);
    ctx.fillText("x2", 70, 136);
    ctx.fillText("hidden", 160, 36);
    ctx.fillText("output y", 250, 96);

  }, [x1, x2, hiddenA, outputA, w1, w2]);

  const handleReset = () => {
    setX1(0.5);
    setX2(-0.2);
    setW11(0.8);
    setW21(-0.4);
    setWOut1(0.9);
  };

  return (
    <VisualizationShell
      title="Multi-Layer Perceptron Activations"
      subtitle="Slide inputs x1 and x2, or adjust parameters directly. Observe synapse connections (thickness represents weights) and activation flows."
      insight="Neural networks use cascaded matrices of weights and biases to transform input vectors. Non-linear activation functions (like tanh/sigmoid) allow boundaries to bend."
      legend={[
        { label: "Positive Weights", color: COLORS.cyan },
        { label: "Negative Weights", color: COLORS.pink },
        { label: "Output Activation", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            Output prediction: <span className="font-bold text-yellow">{outputA.toFixed(4)}</span>
            <div className="mt-1 text-on-surface-variant normal-case">
              z_out = w^T · h + b = {outputZ.toFixed(3)}
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Input x1</span>
                <span className="text-primary font-bold">{x1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.1"
                value={x1}
                onChange={(e) => setX1(parseFloat(e.target.value))}
                className="w-full accent-primary my-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Input x2</span>
                <span className="text-primary font-bold">{x2.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.1"
                value={x2}
                onChange={(e) => setX2(parseFloat(e.target.value))}
                className="w-full accent-primary my-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded border border-outline bg-surface p-4 font-mono text-[10px] text-on-surface">
            <span className="font-bold uppercase text-primary">Tuning weights (synapses)</span>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>w11 (Input1 → Hidden1)</span>
                <span className="font-bold">{w11.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.1"
                value={w11}
                onChange={(e) => setW11(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>w21 (Input2 → Hidden1)</span>
                <span className="font-bold">{w21.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.1"
                value={w21}
                onChange={(e) => setW21(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>wOut1 (Hidden1 → Output)</span>
                <span className="font-bold">{wOut1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.1"
                value={wOut1}
                onChange={(e) => setWOut1(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center animate-all"
          >
            Reset parameters
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
