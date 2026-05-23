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

const plotConfig = {
  left: 40,
  right: 296,
  top: 24,
  bottom: 190,
  width: 256,
  height: 166,
};

const toXPixel = (x: number) => plotConfig.left + (x / 10) * plotConfig.width;
const toYPixel = (y: number) => plotConfig.bottom - (y / 10) * plotConfig.height;
const fromXPixel = (x: number) => ((x - plotConfig.left) / plotConfig.width) * 10;
const fromYPixel = (y: number) => ((plotConfig.bottom - y) / plotConfig.height) * 10;

export default function NlpVisualization() {
  const [selectedWord, setSelectedWord] = useState<string | null>("king");
  const [wordVectors, setWordVectors] = useState<Array<{ name: string; x: number; y: number }>>([
    { name: "king", x: 2.2, y: 7.5 },
    { name: "man", x: 2.2, y: 4.2 },
    { name: "woman", x: 6.8, y: 4.2 },
    { name: "queen", x: 6.8, y: 7.5 },
    { name: "apple", x: 8.2, y: 2.2 },
    { name: "orange", x: 9.0, y: 3.0 },
    { name: "banana", x: 8.5, y: 1.2 },
  ]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const isAnalogPair = ["king", "queen", "man", "woman"].includes(selectedWord || "");
    if (isAnalogPair) {
      const manPxX = toXPixel(2.2);
      const manPxY = toYPixel(4.2);
      const kingPxX = toXPixel(2.2);
      const kingPxY = toYPixel(7.5);
      drawHelper.line(ctx, manPxX, manPxY, kingPxX, kingPxY, COLORS.yellow, 1.8);

      const womanPxX = toXPixel(6.8);
      const womanPxY = toYPixel(4.2);
      const queenPxX = toXPixel(6.8);
      const queenPxY = toYPixel(7.5);
      drawHelper.line(ctx, womanPxX, womanPxY, queenPxX, queenPxY, COLORS.yellow, 1.8);
    }

    wordVectors.forEach((word) => {
      const px = toXPixel(word.x);
      const py = toYPixel(word.y);
      const isSelected = selectedWord === word.name;

      drawHelper.point(ctx, px, py, isSelected ? COLORS.pink : COLORS.cyan, "reticle", 5.5);
      drawHelper.text(
        ctx, 
        word.name, 
        px + 8, 
        py, 
        isSelected ? COLORS.pink : COLORS.muted, 
        "bold 9px var(--font-mono)"
      );
    });
  }, [selectedWord, wordVectors]);

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0.5 && dataX <= 9.5 && dataY >= 0.5 && dataY <= 9.5) {
      const wordName = prompt("Enter a custom label for this word vector:")?.trim();
      if (wordName) {
        setWordVectors((curr) => [...curr, { name: wordName.toLowerCase(), x: dataX, y: dataY }]);
        setSelectedWord(wordName.toLowerCase());
      }
    }
  };

  const handleReset = () => {
    setWordVectors([
      { name: "king", x: 2.2, y: 7.5 },
      { name: "man", x: 2.2, y: 4.2 },
      { name: "woman", x: 6.8, y: 4.2 },
      { name: "queen", x: 6.8, y: 7.5 },
      { name: "apple", x: 8.2, y: 2.2 },
      { name: "orange", x: 9.0, y: 3.0 },
      { name: "banana", x: 8.5, y: 1.2 },
    ]);
    setSelectedWord("king");
  };

  const cosineSim = useMemo(() => {
    if (!selectedWord) return 0.0;
    if (selectedWord === "king" || selectedWord === "queen" || selectedWord === "man" || selectedWord === "woman") {
      return 0.85;
    }
    if (selectedWord === "apple" || selectedWord === "orange" || selectedWord === "banana") {
      return 0.91;
    }
    return 0.42;
  }, [selectedWord]);

  return (
    <VisualizationShell
      title="Semantic Embedding Vector Spaces"
      subtitle="Click different vocabulary buttons, or click anywhere inside the plot to add a custom word vector and watch semantic analogies compute."
      insight="Word embedding models represent language tokens in a continuous spatial coordinate geometry, where vector differences map algebraic linguistic analogies."
      legend={[
        { label: "Active Embedding", color: COLORS.pink },
        { label: "Neighbor Embeddings", color: COLORS.cyan },
        { label: "Analogy Vector Shift", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} onClick={handlePlotClick} className="h-full w-full cursor-crosshair" />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click plot space to add custom word embeddings]
          </div>
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            Selected Word: <span className="font-bold text-pink">{selectedWord ?? "none"}</span>
            <div className="mt-1 text-on-surface-variant font-bold normal-case">
              Cosine similarity target: <span className="font-bold text-yellow">{cosineSim.toFixed(2)}</span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Word Vocabulary</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {wordVectors.map((word) => (
                <button
                  key={word.name}
                  onClick={() => setSelectedWord(word.name)}
                  className={`border border-outline px-2 py-1.5 font-mono text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    selectedWord === word.name ? "bg-primary text-on-primary border-primary" : "bg-surface-container text-on-surface border border-outline hover:bg-primary/10"
                  }`}
                >
                  {word.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset Vocabulary
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
