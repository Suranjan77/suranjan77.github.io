"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  Vector,
  MiniStat,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

const initialTokens = ["Machine", "learning", "models", "generate"];

const candidates = [
  { word: "text", logit: 4.0 },
  { word: "code", logit: 2.8 },
  { word: "data", logit: 2.2 },
  { word: "insights", logit: 1.5 },
  { word: "bugs", logit: 0.8 },
];

export default function LLMViz() {
  const [context, setContext] = useState<string[]>(initialTokens);
  const [temperature, setTemperature] = useState(0.8); // ranges from 0.2 to 2.2
  const [samplingMode, setSamplingMode] = useState<"greedy" | "sample">("sample");
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Math calculations
  const scaledLogits = candidates.map((c) => c.logit / temperature);
  const expLogits = scaledLogits.map((l) => Math.exp(l));
  const sumExp = expLogits.reduce((a, b) => a + b, 0);
  const probs = expLogits.map((e) => e / sumExp);

  // Generate cumulative probabilities for the spinner wheel segments
  let cumProbs = 0;
  const wheelSlices = candidates.map((c, i) => {
    const start = cumProbs;
    cumProbs += probs[i];
    return {
      word: c.word,
      prob: probs[i],
      startAngle: start * 360,
      endAngle: cumProbs * 360,
    };
  });

  const handleSample = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedWord(null);

    // Determine target index
    let chosenIdx = 0;
    if (samplingMode === "greedy") {
      // Find index of max probability
      let maxP = -1;
      probs.forEach((p, idx) => {
        if (p > maxP) {
          maxP = p;
          chosenIdx = idx;
        }
      });
    } else {
      // Weighted random sampling
      const rand = Math.random();
      let acc = 0;
      for (let i = 0; i < probs.length; i++) {
        acc += probs[i];
        if (rand <= acc) {
          chosenIdx = i;
          break;
        }
      }
    }

    const chosenSlice = wheelSlices[chosenIdx];
    // Find a random target angle within the chosen slice range
    const targetMidAngle = (chosenSlice.startAngle + chosenSlice.endAngle) / 2;
    // We spin at least 3 full rotations (1080 deg) + land exactly on target (relative to pointer at 0 deg top)
    // Pointer is at 0 degrees (top). To align the slice with pointer, we rotate the wheel by: 360 - targetMidAngle
    const spinTo = 1080 + (360 - targetMidAngle);

    setWheelRotation(spinTo);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedWord(chosenSlice.word);
      setContext((prev) => {
        // limit size of context list to fit on SVG
        const next = [...prev, chosenSlice.word];
        if (next.length > 7) {
          return next.slice(next.length - 7);
        }
        return next;
      });
      // reset rotation after landing
      setWheelRotation((360 - targetMidAngle));
    }, 1800);
  };

  const handleReset = () => {
    setContext(initialTokens);
    setSelectedWord(null);
    setWheelRotation(0);
    setIsSpinning(false);
  };

  // Helper to construct SVG pie path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const polarToCartesian = (centerX: number, centerY: number, rad: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + rad * Math.cos(angleInRadians),
        y: centerY + rad * Math.sin(angleInRadians),
      };
    };

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "Z"
    ].join(" ");
  };

  const wheelCenter = { x: 490, y: 220 };
  const wheelRadius = 80;

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="LLM Temperature Logits Scaling">
            <title>L L M Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Context Window (Upper half) */}
            <g transform="translate(46, 50)">
              <rect width={548} height={46} fill="rgba(85,107,74,0.06)" stroke={COLORS.border} rx={2} />
              <text x={12} y={16} fill={COLORS.muted} fontSize={8} fontWeight={800}>CONTEXT WINDOW</text>
              <text x={12} y={34} fill={COLORS.cyan} fontSize={14} fontWeight={900}>
                {context.join(" ")}
                {isSpinning && <span className="animate-pulse"> ...</span>}
              </text>
            </g>

            {/* Candidates Probability Bar Chart */}
            <g transform="translate(46, 126)">
              <text x={0} y={-10} fill={COLORS.muted} fontSize={12} fontWeight={800} letterSpacing="0.05em">RAW LOGITS</text>
              <text x={140} y={-10} fill={COLORS.muted} fontSize={10} fontWeight={800} letterSpacing="0.05em">SOFTMAX PROBABILITIES (Temp={temperature.toFixed(1)})</text>

              {candidates.map((cand, idx) => {
                const prob = probs[idx];
                const isSelected = selectedWord === cand.word;
                const barWidth = prob * 180;
                
                return (
                  <g key={cand.word} transform={`translate(0, ${idx * 40})`}>
                    {/* Word Label */}
                    <text x={0} y={20} fill={isSelected ? COLORS.pink : COLORS.muted} fontSize={12} fontWeight={800} stroke={COLORS.bg} strokeWidth={2} paintOrder="stroke">
                      {cand.word}
                    </text>
                    {/* Logit value */}
                    <text x={92} y={20} fill={COLORS.cyan} fontSize={11} fontWeight={700}>
                      {cand.logit.toFixed(1)}
                    </text>

                    {/* Arrow Vector */}
                    <Vector x1={112} y1={16} x2={142} y2={16} color={COLORS.yellow} />
                    
                    {/* Probability Bar */}
                    <rect
                      x={150}
                      y={4}
                      width={Math.max(1, barWidth)}
                      height={20}
                      fill={isSelected ? COLORS.pink : COLORS.cyan}
                      fillOpacity={isSelected ? 0.8 : 0.45}
                      stroke={isSelected ? COLORS.pink : COLORS.border}
                      strokeWidth={isSelected ? 1.5 : 0.5}
                    />
                    <text x={150 + barWidth + 8} y={18} fill={COLORS.muted} fontSize={11} fontWeight={700}>
                      {(prob * 100).toFixed(1)}%
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Probability Wheel Spinner (Right bottom) */}
            <g>
              {/* Spinner Wheel outer border */}
              <circle cx={wheelCenter.x} cy={wheelCenter.y} r={wheelRadius + 4} fill="none" stroke={COLORS.border} strokeWidth={1} />
              
              {/* Wheel Slices */}
              <g>
                <motion.g
                  initial={{ x: wheelCenter.x, y: wheelCenter.y }}
                  animate={{ x: wheelCenter.x, y: wheelCenter.y, rotate: wheelRotation }}
                  transition={isSpinning ? { duration: 1.8, ease: "easeOut" } : { duration: 0 }}
                >
                  {wheelSlices.map((slice, idx) => {
                    const sliceColor = [COLORS.cyan, COLORS.pink, COLORS.yellow, COLORS.green, COLORS.muted][idx % 5];
                    // Compute text position inside slice relative to center 0,0
                    const textAngle = ((slice.startAngle + slice.endAngle) / 2 - 90) * (Math.PI / 180);
                    const tx = (wheelRadius * 0.6) * Math.cos(textAngle);
                    const ty = (wheelRadius * 0.6) * Math.sin(textAngle);

                    return (
                      <g key={slice.word}>
                        <path
                          d={describeArc(0, 0, wheelRadius, slice.startAngle, slice.endAngle)}
                          fill={sliceColor}
                          fillOpacity={0.3}
                          stroke={COLORS.bg}
                          strokeWidth={1.5}
                        />
                        {slice.prob > 0.05 && (
                          <text
                            x={tx}
                            y={ty + 3}
                            textAnchor="middle"
                            fill={COLORS.muted}
                            fontSize={8}
                            fontWeight={800}
                          >
                            {slice.word}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </motion.g>
              </g>

              {/* Spinner Needle (top center pointing down) */}
              <polygon
                points={`${wheelCenter.x - 8},${wheelCenter.y - wheelRadius - 10} ${wheelCenter.x + 8},${wheelCenter.y - wheelRadius - 10} ${wheelCenter.x},${wheelCenter.y - wheelRadius + 2}`}
                fill={COLORS.pink}
              />
              <circle cx={wheelCenter.x} cy={wheelCenter.y - wheelRadius - 10} r={3} fill={COLORS.pink} />
              <text x={wheelCenter.x} y={wheelCenter.y + wheelRadius + 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>PROBABILITY WHEEL</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>LLM Controls</span>
          </div>

          <div className="mb-4">
            <span className="block text-[12px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              TEMPERATURE (SCALING):
            </span>
            <input aria-label="LLM input"
              type="range"
              min="0.2"
              max="2.2"
              step="0.15"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[12px] text-on-surface-variant font-bold mt-1">
              <span>0.2 (greedy/sharp)</span>
              <span className="text-primary">T = {temperature.toFixed(2)}</span>
              <span>2.2 (creative/flat)</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="block text-[12px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              SAMPLING PARADIGM:
            </span>
            <div className="grid grid-cols-2 gap-1 border border-outline p-1 bg-surface-container-low">
              {(["greedy", "sample"] as const).map((mode) => (
                <button
                  aria-label={mode === "greedy" ? "Greedy (Max)" : "Random Sample"}
                  key={mode}
                  onClick={() => setSamplingMode(mode)}
                  className={`py-1 text-[12px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    samplingMode === mode
                      ? "bg-primary text-on-primary"
                      : "hover:bg-outline-variant text-on-surface-variant"
                  }`}
                >
                  {mode === "greedy" ? "Greedy (Max)" : "Random Sample"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button aria-label="SAMPLE NEXT WORD"
              onClick={handleSample}
              disabled={isSpinning}
              className="flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold cursor-pointer disabled:opacity-50 text-center text-[12px]"
            >
              SAMPLE NEXT WORD
            </button>
            <button aria-label="RESET SENTENCE"
              onClick={handleReset}
              className="flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container active:scale-[0.98] transition-all font-bold cursor-pointer text-center text-[12px]"
            >
              RESET SENTENCE
            </button>
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`LLMs output logits representing raw confidence for each token. Dividing logits by **Temperature** ($T$) and applying Softmax morphs the probability distribution. High $T$ creates flat probabilities (creative/diverse), while low $T$ sharpens peaks (predictable/greedy).`} />
          </div>
        </div>
      </div>
    </div>
  );
}
