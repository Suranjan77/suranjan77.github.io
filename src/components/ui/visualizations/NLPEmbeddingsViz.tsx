"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  VisualizationInstruction,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

const plot = { left: 60, top: 40, right: 380, bottom: 340, width: 320, height: 300 };

const scaleX = (val: number) => plot.left + (val / 10) * plot.width;
const scaleY = (val: number) => plot.bottom - (val / 10) * plot.height;
const invertX = (px: number) => ((px - plot.left) / plot.width) * 10;
const invertY = (py: number) => ((plot.bottom - py) / plot.height) * 10;

interface WordToken {
  id: string;
  word: string;
  x: number;
  y: number;
}

export default function NLPEmbeddingsViz() {
  // Draggable tokens
  const [tokens, setTokens] = useState<WordToken[]>([
    { id: "king", word: "king", x: 2.5, y: 7.5 },
    { id: "queen", word: "queen", x: 7.0, y: 7.5 },
    { id: "man", word: "man", x: 2.5, y: 3.5 },
    { id: "woman", word: "woman", x: 7.0, y: 3.5 },
    { id: "royal", word: "royal", x: 4.8, y: 8.5 },
    { id: "city", word: "city", x: 8.2, y: 1.5 },
  ]);

  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);
  const [dragTokenId, setDragTokenId] = useState<string | null>(null);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [analogyStep, setAnalogyStep] = useState(0); // 0: Idle, 1: King, 2: Subtract Man, 3: Add Woman (Final result)

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent<SVGElement>, id: string) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setDragTokenId(id);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!dragTokenId) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgCoords = point.matrixTransform(svg.getScreenCTM()?.inverse());
    if (!svgCoords) return;

    const unitsX = Math.max(0.5, Math.min(9.5, invertX(svgCoords.x)));
    const unitsY = Math.max(0.5, Math.min(9.5, invertY(svgCoords.y)));

    setTokens((prev) =>
      prev.map((t) => (t.id === dragTokenId ? { ...t, x: unitsX, y: unitsY } : t))
    );
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    if (dragTokenId) {
      (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
      setDragTokenId(null);
    }
  };

  // Find nearest neighbors of the hovered token
  const getNeighbors = (id: string, count = 2) => {
    const source = tokens.find((t) => t.id === id);
    if (!source) return [];

    return tokens
      .filter((t) => t.id !== id)
      .map((t) => ({
        ...t,
        dist: Math.hypot(t.x - source.x, t.y - source.y),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, count);
  };

  const hoveredToken = tokens.find((t) => t.id === hoveredTokenId);
  const neighbors = hoveredTokenId ? getNeighbors(hoveredTokenId) : [];

  // Analogy math: King - Man + Woman = target
  const king = tokens.find((t) => t.id === "king")!;
  const man = tokens.find((t) => t.id === "man")!;
  const woman = tokens.find((t) => t.id === "woman")!;

  // Target coordinates:
  const targetX = king.x - man.x + woman.x;
  const targetY = king.y - man.y + woman.y;

  // Closest word token to the target analogy point (excluding King, Man, Woman)
  const getAnalogyResult = () => {
    const list = tokens.filter((t) => !["king", "man", "woman"].includes(t.id));
    let closest = list[0];
    let minDist = 999;
    list.forEach((t) => {
      const d = Math.hypot(t.x - targetX, t.y - targetY);
      if (d < minDist) {
        minDist = d;
        closest = t;
      }
    });
    return closest;
  };

  const analogyResultToken = getAnalogyResult();

  const handleNextAnalogy = () => {
    setShowAnalogy(true);
    setAnalogyStep((prev) => (prev < 3 ? prev + 1 : 0));
  };

  const handleResetAnalogy = () => {
    setShowAnalogy(false);
    setAnalogyStep(0);
  };

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="NLP Embeddings Analogy Grid">
            <title>N L P Embeddings Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Grid Axes */}
            <g>
              {ticks.map((tick) => (
                <g key={tick}>
                  <line x1={scaleX(tick)} x2={scaleX(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
                  <line x1={plot.left} x2={plot.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke={COLORS.grid} strokeWidth={1} />
                </g>
              ))}
              <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={plot.right + 10} y={plot.bottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={700}>Dimension X</text>
              <text x={plot.left - 8} y={plot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={12} fontWeight={700}>Dim Y</text>
            </g>

            {/* Nearest Neighbors Lines */}
            {hoveredToken && neighbors.map((n) => (
              <line
                key={`n-line-${n.id}`}
                x1={scaleX(hoveredToken.x)}
                y1={scaleY(hoveredToken.y)}
                x2={scaleX(n.x)}
                y2={scaleY(n.y)}
                stroke={COLORS.yellow}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            ))}

            {/* Word Tokens */}
            {tokens.map((t) => {
              const isHovered = hoveredTokenId === t.id;
              const isDrag = dragTokenId === t.id;
              const isAnalogyFocus =
                analogyStep === 3 &&
                showAnalogy &&
                (t.id === "queen" || t.id === analogyResultToken?.id);

              return (
                <g
                  key={t.id}
                  onPointerDown={(e) => handlePointerDown(e, t.id)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerOver={() => setHoveredTokenId(t.id)}
                  onPointerOut={() => setHoveredTokenId(null)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <circle
                    cx={scaleX(t.x)}
                    cy={scaleY(t.y)}
                    r={isHovered || isAnalogyFocus ? 9 : 6.5}
                    fill={isAnalogyFocus ? COLORS.pink : isHovered ? COLORS.yellow : COLORS.cyan}
                    stroke={COLORS.bg}
                    strokeWidth={1.5}
                    className="transition-all duration-150"
                  />
                  {isAnalogyFocus && (
                    <circle
                      cx={scaleX(t.x)}
                      cy={scaleY(t.y)}
                      r={18}
                      fill="none"
                      stroke={COLORS.pink}
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                    />
                  )}
                  <text
                    x={scaleX(t.x) + 12}
                    y={scaleY(t.y) + 4}
                    fill={isAnalogyFocus ? COLORS.pink : COLORS.muted}
                    fontSize={11}
                    fontWeight={isAnalogyFocus || isHovered ? 900 : 700}
                    stroke={COLORS.bg}
                    strokeWidth={2.5}
                    paintOrder="stroke"
                  >
                    {t.word}
                  </text>
                </g>
              );
            })}

            {/* Vector analogy drawing */}
            {showAnalogy && analogyStep >= 1 && (
              <g>
                {/* 1. Vector: Origin (0,0) to King */}
                <motion.line
                  x1={scaleX(0)}
                  y1={scaleY(0)}
                  x2={scaleX(king.x)}
                  y2={scaleY(king.y)}
                  stroke={COLORS.yellow}
                  strokeWidth={2.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />

                {/* 2. Vector: Subtract Man (points down-left) */}
                {analogyStep >= 2 && (
                  <motion.line
                    x1={scaleX(king.x)}
                    y1={scaleY(king.y)}
                    x2={scaleX(king.x - man.x)}
                    y2={scaleY(king.y - man.y)}
                    stroke={COLORS.pink}
                    strokeWidth={2.5}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                )}

                {/* 3. Vector: Add Woman */}
                {analogyStep >= 3 && (
                  <g>
                    <motion.line
                      x1={scaleX(king.x - man.x)}
                      y1={scaleY(king.y - man.y)}
                      x2={scaleX(targetX)}
                      y2={scaleY(targetY)}
                      stroke={COLORS.cyan}
                      strokeWidth={3}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                    {/* Analogy intersection target marker */}
                    <circle
                      cx={scaleX(targetX)}
                      cy={scaleY(targetY)}
                      r={7}
                      fill="none"
                      stroke={COLORS.pink}
                      strokeWidth={2.5}
                    />
                    <circle cx={scaleX(targetX)} cy={scaleY(targetY)} r={2} fill={COLORS.pink} />
                    <text
                      x={scaleX(targetX)}
                      y={scaleY(targetY) - 12}
                      textAnchor="middle"
                      fill={COLORS.pink}
                      fontSize={9}
                      fontWeight={900}
                    >
                      Analogy Destination
                    </text>
                  </g>
                )}
              </g>
            )}
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Semantic Analogies</span>
          </div>

          <button aria-label="RUN ANALOGY STEP SUBTRACT MAN ADD WOMAN RESET ANALOGY"
            onClick={handleNextAnalogy}
            className="w-full flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer mb-2"
          >
            {analogyStep === 0 && "RUN ANALOGY STEP"}
            {analogyStep === 1 && "SUBTRACT MAN"}
            {analogyStep === 2 && "ADD WOMAN"}
            {analogyStep === 3 && "RESET ANALOGY"}
          </button>

          {showAnalogy && (
            <div className="bg-surface-container p-3 border border-outline space-y-1.5 text-xs mb-3">
              <div className="flex justify-between">
                <span>Current Vector Math:</span>
                <span className="font-bold text-primary">
                  {analogyStep === 1 && "Vector(king)"}
                  {analogyStep === 2 && "Vector(king) - Vector(man)"}
                  {analogyStep === 3 && "Vector(king) - Vector(man) + Vector(woman)"}
                </span>
              </div>
              {analogyStep === 3 && (
                <div className="flex justify-between border-t border-outline pt-2 mt-2 font-bold text-sm">
                  <span>NEAREST WORD:</span>
                  <span className="text-pink uppercase font-extrabold">&quot;{analogyResultToken?.word}&quot;</span>
                </div>
              )}
            </div>
          )}

          <button aria-label="CLEAR ARROWS"
            onClick={handleResetAnalogy}
            disabled={!showAnalogy}
            className="w-full flex h-8 items-center justify-center border border-outline bg-surface hover:bg-surface-container text-on-surface-variant text-[12px] active:scale-[0.98] transition-all tracking-wider cursor-pointer disabled:opacity-50"
          >
            CLEAR ARROWS
          </button>

          <VisualizationInstruction
            title="Direct Manipulation:"
            content={`1. Drag words to shift their coordinates.
2. Hover words to display nearest neighbors.`}
            className="uppercase"
          />
        </div>

        {hoveredTokenId && (
          <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
            <div className="mb-2 block text-[12px] font-bold uppercase tracking-wide text-on-surface-variant">
              NEAREST NEIGHBORS (SIMILARITY)
            </div>
            <div className="bg-surface-container p-3 border border-outline space-y-2 text-xs">
              <div className="font-bold mb-1 text-primary">Token: &quot;{hoveredTokenId}&quot;</div>
              {neighbors.map((n) => {
                const cosineSim = Math.max(0, 1 - n.dist / 10);
                return (
                  <div key={n.id} className="flex justify-between items-center">
                    <span className="font-bold">&quot;{n.word}&quot;</span>
                    <span className="text-cyan-700 font-bold">{(cosineSim * 100).toFixed(1)}% match</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
