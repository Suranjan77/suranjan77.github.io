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

const layoutConfig = {
  queryY: 60,
  keyY: 160,
  startX: 45,
  spacingX: 33,
};

export default function TransformersVisualization() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [clickedIdx, setClickedIdx] = useState<number | null>(8); // Locked to "it" initially

  const activeIdx = hoveredIdx !== null ? hoveredIdx : clickedIdx;

  const tokens = useMemo(() => [
    "The", "animal", "did", "not", "cross", "the", "street", "because", "it", "was", "tired"
  ], []);

  const attentionMatrix = useMemo(() => {
    const matrix = Array.from({ length: tokens.length }, () => 
      new Array(tokens.length).fill(0.02)
    );

    matrix[8][1] = 0.48;
    matrix[8][10] = 0.28;
    matrix[8][6] = 0.08;
    
    matrix[10][1] = 0.55;

    matrix[4][1] = 0.35;
    matrix[4][6] = 0.40;

    for (let r = 0; r < tokens.length; r++) {
      const sum = matrix[r].reduce((s, val) => s + val, 0);
      matrix[r] = matrix[r].map((val) => val / sum);
    }
    return matrix;
  }, [tokens.length]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { queryY, keyY, startX, spacingX } = layoutConfig;

    if (activeIdx !== null) {
      const qx = startX + activeIdx * spacingX;
      
      tokens.forEach((_, kIdx) => {
        const kx = startX + kIdx * spacingX;
        const weight = attentionMatrix[activeIdx][kIdx];
        
        ctx.save();
        ctx.strokeStyle = weight > 0.1 ? COLORS.yellow : "rgba(30, 27, 22, 0.05)";
        ctx.lineWidth = Math.max(0.5, weight * 8);
        ctx.globalAlpha = Math.max(0.1, weight);
        drawHelper.line(ctx, qx, queryY + 6, kx, keyY - 6, ctx.strokeStyle, ctx.lineWidth);
        ctx.restore();
      });
    }

    tokens.forEach((token, idx) => {
      const tx = startX + idx * spacingX;
      const isActive = activeIdx === idx;

      ctx.save();
      ctx.fillStyle = isActive ? COLORS.pink : COLORS.muted;
      ctx.font = isActive ? "bold 9px var(--font-mono)" : "8px var(--font-mono)";
      ctx.textAlign = "center";
      ctx.fillText(token, tx, queryY);
      
      drawHelper.point(ctx, tx, queryY + 8, isActive ? COLORS.pink : COLORS.border, "circle", 1.8);
      ctx.restore();
    });

    tokens.forEach((token, idx) => {
      const tx = startX + idx * spacingX;
      const attWeight = activeIdx !== null ? attentionMatrix[activeIdx][idx] : 0.0;
      const hasStrongAtt = attWeight > 0.1;

      ctx.save();
      ctx.fillStyle = hasStrongAtt ? COLORS.cyan : COLORS.muted;
      ctx.font = hasStrongAtt ? "bold 9px var(--font-mono)" : "8px var(--font-mono)";
      ctx.textAlign = "center";
      ctx.fillText(token, tx, keyY);

      drawHelper.point(ctx, tx, keyY - 8, hasStrongAtt ? COLORS.cyan : COLORS.border, "circle", 1.8);
      ctx.restore();
    });

    ctx.fillStyle = COLORS.muted;
    ctx.font = "bold 8px var(--font-mono)";
    ctx.textAlign = "left";
    ctx.fillText("Query Tokens (input)", 15, queryY - 20);
    ctx.fillText("Key Tokens (context)", 15, keyY + 22);

  }, [tokens, activeIdx, attentionMatrix]);

  const activeAttentions = useMemo(() => {
    if (activeIdx === null) return [];
    return tokens.map((t, idx) => ({
      token: t,
      weight: attentionMatrix[activeIdx][idx]
    })).filter(item => item.weight > 0.05)
      .sort((a,b) => b.weight - a.weight);
  }, [activeIdx, tokens, attentionMatrix]);

  const getClosestTokenIndex = useCallback((x: number, y: number) => {
    const { queryY, startX, spacingX } = layoutConfig;
    if (y < queryY - 25 || y > queryY + 25) return null;

    let closestIdx: number | null = null;
    let minDistance = 18;

    tokens.forEach((_, idx) => {
      const tx = startX + idx * spacingX;
      const d = Math.abs(x - tx);
      if (d < minDistance) {
        minDistance = d;
        closestIdx = idx;
      }
    });
    return closestIdx;
  }, [tokens]);

  const handlePlotClick = useCallback((x: number, y: number) => {
    const idx = getClosestTokenIndex(x, y);
    if (idx !== null) {
      setClickedIdx(idx);
    }
  }, [getClosestTokenIndex]);

  const handlePlotMouseMove = useCallback((x: number, y: number) => {
    const idx = getClosestTokenIndex(x, y);
    setHoveredIdx(idx);
  }, [getClosestTokenIndex]);

  const handlePlotMouseLeave = useCallback(() => {
    setHoveredIdx(null);
  }, []);

  return (
    <VisualizationShell
      title="Transformers Attention Maps"
      subtitle="Hover or click over query tokens on the top row to lock visual pathways (yellow). Observe attention mappings resolving dependencies."
      insight="Self-attention mechanisms allow tokens to build contextual representations by computing vector similarity with all other tokens, regardless of distance."
      legend={[
        { label: "Selected Query", color: COLORS.pink },
        { label: "Resolved Keys", color: COLORS.cyan },
        { label: "Attention Weights", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot
            viewBoxWidth={420}
            onDraw={onDraw}
            onClick={handlePlotClick}
            onMouseMove={handlePlotMouseMove}
            onMouseLeave={handlePlotMouseLeave}
            className={`h-full w-full ${hoveredIdx !== null ? "cursor-pointer" : "cursor-default"}`}
          />
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Vocabulary Sentence</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tokens.map((token, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setClickedIdx(idx)}
                  className={`border border-outline px-1.5 py-1 font-mono text-[8px] rounded transition-all cursor-pointer ${
                    activeIdx === idx ? "bg-primary text-on-primary border-primary" : "bg-surface-container text-on-surface border border-outline hover:bg-primary/10"
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-outline rounded bg-surface-container-lowest/60 px-4 py-3 font-mono text-[10px] leading-relaxed text-on-surface-variant">
            <span className="font-bold uppercase text-primary">Attention details:</span>
            {activeIdx !== null && (
              <span className="block mt-1 font-bold text-pink">Locked Query: "{tokens[activeIdx]}"</span>
            )}
            {activeAttentions.map((item, idx) => (
              <div key={idx} className="flex justify-between mt-1 text-[9px] lowercase font-normal">
                <span>{tokens[activeIdx ?? 0]} → {item.token}</span>
                <span className="font-bold text-yellow">{(item.weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
