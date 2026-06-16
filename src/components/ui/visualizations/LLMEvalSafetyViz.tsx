"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

interface ModelMetrics {
  name: string;
  quality: number; // 0-10 scale
  safety: number;  // 0-10 scale
  cost: number;    // 0-10 scale (where 10 is cheapest/best)
  latency: number; // 0-10 scale (where 10 is fastest/best)
  description: string;
}

export default function LLMEvalSafetyViz() {
  const [qualityWeight, setQualityWeight] = useState<number>(8);
  const [safetyWeight, setSafetyWeight] = useState<number>(9);
  const [costWeight, setCostWeight] = useState<number>(4);
  const [latencyWeight, setLatencyWeight] = useState<number>(5);

  const models: ModelMetrics[] = useMemo(() => [
    {
      name: "Frontier Model (Proprietary)",
      quality: 9.5,
      safety: 9.0,
      cost: 2.0, // expensive
      latency: 4.0, // slow
      description: "State-of-the-art capability, heavy safety filters, high API costs and latency."
    },
    {
      name: "Open Weights (Llama-3-70B)",
      quality: 8.5,
      safety: 7.5,
      cost: 6.0, // medium host cost
      latency: 7.0, // medium speed
      description: "Strong generalist, customizable safety alignment, moderate self-hosting costs."
    },
    {
      name: "Small Edge Model (Llama-3-8B)",
      quality: 6.5,
      safety: 6.0,
      cost: 9.5, // extremely cheap
      latency: 9.5, // ultra-fast
      description: "Lower complexity, limited safety guardrails, fits on small consumer hardware."
    }
  ], []);

  // Compute final scores based on weights
  const scoredModels = useMemo(() => {
    const totalWeight = qualityWeight + safetyWeight + costWeight + latencyWeight || 1.0;
    
    return models.map(m => {
      const score = (
        (m.quality * qualityWeight) +
        (m.safety * safetyWeight) +
        (m.cost * costWeight) +
        (m.latency * latencyWeight)
      ) / totalWeight;

      return {
        ...m,
        score
      };
    }).sort((a, b) => b.score - a.score);
  }, [models, qualityWeight, safetyWeight, costWeight, latencyWeight]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded p-4">
          <div className="mb-4 font-mono text-[12px] font-bold uppercase tracking-wider text-primary">
            Weighted Score Comparison
          </div>

          <svg
            viewBox="0 0 600 240"
            className="w-full h-auto select-none mb-4"
            role="img"
            aria-label="LLM Model Scores Bar Chart"
          >
            <title>Model Comparison Matrix</title>
            
            {scoredModels.map((m, idx) => {
              const y = 30 + idx * 70;
              const barWidth = m.score * 35; // scale score (max 10) to pixels (max 350)
              const isWinner = idx === 0;

              return (
                <g key={`model-bar-${m.name}`}>
                  {/* Model Name Label */}
                  <text x={10} y={y + 15} fontSize={11} fontWeight={800} fill={COLORS.muted}>
                    {m.name}
                  </text>
                  
                  {/* Score Bar background */}
                  <rect x={180} y={y} width={350} height={20} fill={COLORS.grid} rx={3} />
                  
                  {/* Score Bar value */}
                  <rect
                    x={180}
                    y={y}
                    width={barWidth}
                    height={20}
                    fill={isWinner ? COLORS.cyan : COLORS.pink}
                    rx={3}
                  />
                  
                  {/* Score Number */}
                  <text x={180 + barWidth + 10} y={y + 15} fontSize={11} fontWeight={800} fill={COLORS.muted}>
                    {m.score.toFixed(2)} / 10
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Model breakdown table */}
          <div className="border-t border-outline pt-4 font-mono text-xs">
            <div className="font-bold text-muted mb-2 uppercase text-[12px]">Model Capability Matrix</div>
            <div className="grid grid-cols-5 gap-2 border-b border-outline pb-2 font-bold text-primary">
              <div>Model</div>
              <div className="text-center">Quality</div>
              <div className="text-center">Safety</div>
              <div className="text-center">Cost</div>
              <div className="text-center">Latency</div>
            </div>
            {models.map(m => (
              <div key={`table-row-${m.name}`} className="grid grid-cols-5 gap-2 py-2 border-b border-outline last:border-0 items-center">
                <div className="font-sans font-medium text-on-surface text-[12px] leading-tight">{m.name}</div>
                <div className="text-center text-cyan font-bold">{m.quality.toFixed(1)}</div>
                <div className="text-center text-cyan font-bold">{m.safety.toFixed(1)}</div>
                <div className="text-center text-pink font-bold">{m.cost.toFixed(1)}</div>
                <div className="text-center text-pink font-bold">{m.latency.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        {/* Weight controls */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Dimension Weights</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="quality-weight-slider">
              Quality Importance ({qualityWeight})
            </label>
            <input
              id="quality-weight-slider"
              type="range"
              min={0}
              max={10}
              step={1}
              value={qualityWeight}
              onChange={e => setQualityWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Quality importance weight range slider"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="safety-weight-slider">
              Safety Importance ({safetyWeight})
            </label>
            <input
              id="safety-weight-slider"
              type="range"
              min={0}
              max={10}
              step={1}
              value={safetyWeight}
              onChange={e => setSafetyWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Safety importance weight range slider"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="cost-weight-slider">
              Low Cost Importance ({costWeight})
            </label>
            <input
              id="cost-weight-slider"
              type="range"
              min={0}
              max={10}
              step={1}
              value={costWeight}
              onChange={e => setCostWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Low cost importance weight range slider"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="latency-weight-slider">
              Low Latency Importance ({latencyWeight})
            </label>
            <input
              id="latency-weight-slider"
              type="range"
              min={0}
              max={10}
              step={1}
              value={latencyWeight}
              onChange={e => setLatencyWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Low latency importance weight range slider"
            />
          </div>
        </div>

        {/* Selected Best Fit */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Recommended Fit</div>
          <div className="font-bold text-cyan text-sm mb-1">{scoredModels[0].name}</div>
          <p className="text-[12px] font-sans text-on-surface-variant leading-relaxed">
            {scoredModels[0].description}
          </p>
        </div>
      </div>
    </div>
  );
}
