"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  COLORS,
  ControlPanel,
  PlotFrame,
  VisualizationShell,
  NativeCanvasPlot,
} from "../visualizationPrimitives";

export default function LlmsVisualization() {
  const [temperature, setTemperature] = useState(0.7);
  const [promptIdx, setPromptIdx] = useState(0);

  const candidates = useMemo(() => {
    if (promptIdx === 0) {
      return [
        { word: "automating", logit: 4.5 },
        { word: "creating", logit: 4.0 },
        { word: "disrupting", logit: 3.8 },
        { word: "assisting", logit: 3.2 },
        { word: "connecting", logit: 2.5 }
      ];
    } else {
      return [
        { word: "data", logit: 5.0 },
        { word: "images", logit: 4.2 },
        { word: "features", logit: 3.9 },
        { word: "patterns", logit: 3.5 },
        { word: "text", logit: 2.8 }
      ];
    }
  }, [promptIdx]);

  const probabilities = useMemo(() => {
    const scaledLogits = candidates.map((c) => Math.exp(c.logit / temperature));
    const sum = scaledLogits.reduce((s, v) => s + v, 0);
    return candidates.map((c, idx) => ({
      word: c.word,
      prob: scaledLogits[idx] / sum
    }));
  }, [candidates, temperature]);

  const entropy = useMemo(() => {
    return probabilities.reduce((sum, p) => {
      if (p.prob <= 0) return sum;
      return sum - p.prob * Math.log(p.prob);
    }, 0);
  }, [probabilities]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    const startX = 100;
    const maxBarW = 180;
    const startY = 45;
    const barSpacing = 30;

    probabilities.forEach((item, idx) => {
      const by = startY + idx * barSpacing;
      const barW = item.prob * maxBarW;

      ctx.fillStyle = COLORS.muted;
      ctx.font = "bold 9px var(--font-mono)";
      ctx.textAlign = "right";
      ctx.fillText(item.word, startX - 10, by + 8);

      const color = idx === 0 ? COLORS.pink : COLORS.cyan;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(startX, by, barW, 16, 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = COLORS.muted;
      ctx.font = "8px var(--font-mono)";
      ctx.textAlign = "left";
      ctx.fillText(`${(item.prob * 100).toFixed(1)}%`, startX + barW + 5, by + 8);
    });

  }, [probabilities]);

  const handleReset = () => {
    setTemperature(0.7);
    setPromptIdx(0);
  };

  return (
    <VisualizationShell
      title="Autoregressive Decoding Probability"
      subtitle="Adjust the sampling Temperature slider. Watch candidate distributions flatten (high temperature = random outputs) or sharpen (low temperature = deterministic)."
      insight="LLMs output a vector of raw logit scores for the next vocabulary word. Applying Softmax with temperature controls the randomness of token selections."
      legend={[
        { label: "Top candidate", color: COLORS.pink },
        { label: "Alternative tokens", color: COLORS.cyan },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs max-w-[200px]">
            Shannon Entropy: <span className="font-bold text-pink">{entropy.toFixed(3)}</span>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Context Prompt</span>
            <select
              value={promptIdx}
              onChange={(e) => setPromptIdx(parseInt(e.target.value))}
              className="border border-outline p-1.5 w-full bg-surface-container text-[9px] font-bold rounded cursor-pointer"
            >
              <option value={0}>...changing the world by</option>
              <option value={1}>...learn representations of</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex justify-between font-bold">
              <span>Temperature (T)</span>
              <span className="text-warning font-bold">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-primary my-1"
            />
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset decoding
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
