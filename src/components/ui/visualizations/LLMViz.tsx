"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 400;
const plot = { left: 150, right: 600, top: 96, rowH: 46 };

const initialTokens = ["Machine", "learning", "models", "generate"];

// Raw model confidences (logits) for the next token after "...generate".
const candidates = [
  { word: "text", logit: 4.0 },
  { word: "code", logit: 2.8 },
  { word: "data", logit: 2.2 },
  { word: "music", logit: 1.5 },
  { word: "chaos", logit: 0.6 },
];
const sliceColor = [COLORS.cyan, COLORS.pink, COLORS.yellow, COLORS.green, COLORS.muted];

export default function LLMViz() {
  const [context, setContext] = useState<string[]>(initialTokens);
  const [temperature, setTemperature] = useState(0.8);
  const [greedy, setGreedy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // softmax(logits / T)
  const scaled = candidates.map((c) => c.logit / temperature);
  const mx = Math.max(...scaled);
  const exp = scaled.map((l) => Math.exp(l - mx));
  const sum = exp.reduce((a, b) => a + b, 0);
  const probs = exp.map((e) => e / sum);
  const topProb = Math.max(...probs);
  const topWord = candidates[probs.indexOf(topProb)].word;

  // Shannon entropy as a "how spread out" readout (bits, max log2(5)=2.32)
  const entropy = -probs.reduce((a, p) => a + (p > 0 ? p * Math.log2(p) : 0), 0);
  const shape = topProb > 0.7 ? "peaked" : topProb > 0.45 ? "leaning" : "flat";

  const sampleNext = () => {
    let idx = 0;
    if (greedy) {
      idx = probs.indexOf(topProb);
    } else {
      const r = Math.random();
      let acc = 0;
      for (let i = 0; i < probs.length; i++) {
        acc += probs[i];
        if (r <= acc) {
          idx = i;
          break;
        }
      }
    }
    const word = candidates[idx].word;
    setSelected(word);
    setContext((prev) => {
      const next = [...prev, word];
      return next.length > 9 ? next.slice(next.length - 9) : next;
    });
  };

  const reset = () => {
    setContext(initialTokens);
    setSelected(null);
  };

  const caption =
    temperature <= 0.4
      ? `At low temperature (T = ${temperature.toFixed(2)}) the distribution is razor-sharp: "${topWord}" takes ${(topProb * 100).toFixed(0)}% and almost always wins. The model is predictable and repetitive — great for facts, dull for ideas.`
      : temperature >= 1.6
        ? `At high temperature (T = ${temperature.toFixed(2)}) the bars flatten out — even "${candidates[4].word}" gets a real chance. Sampling here is creative and surprising, but risks going off the rails.`
        : `Temperature T = ${temperature.toFixed(2)} gives a ${shape} distribution. Dividing every logit by T before softmax is the one knob that trades predictability for creativity.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="LLM Temperature Sampling">
      <title>LLM Temperature Sampling</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* growing sentence (context window) */}
      <text x={30} y={36} fill={COLORS.muted} fontSize={11} fontWeight={800} letterSpacing="0.08em">
        THE MODEL&apos;S SENTENCE SO FAR
      </text>
      <foreignObject x={30} y={44} width={W - 60} height={36}>
        <div className="font-sans text-[16px] font-semibold leading-tight text-on-surface">
          {context.join(" ")} <span style={{ color: COLORS.muted }}>▍</span>
        </div>
      </foreignObject>

      <text x={30} y={H - 14} fill={COLORS.muted} fontSize={11} fontWeight={700}>
        next-token probability after dividing each logit by T = {temperature.toFixed(2)}
      </text>

      {/* candidate distribution bars */}
      {candidates.map((c, i) => {
        const y = plot.top + i * plot.rowH;
        const w = probs[i] * (plot.right - plot.left);
        const isSel = selected === c.word;
        return (
          <g key={c.word}>
            <text x={plot.left - 14} y={y + 17} textAnchor="end" fill={isSel ? COLORS.pink : COLORS.muted} fontSize={14} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
              {c.word}
            </text>
            <text x={plot.left - 14} y={y + 32} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={600}>
              logit {c.logit.toFixed(1)}
            </text>
            {/* track */}
            <rect x={plot.left} y={y} width={plot.right - plot.left} height={26} fill={COLORS.grid} fillOpacity={0.4} />
            <motion.rect
              x={plot.left}
              y={y}
              height={26}
              fill={sliceColor[i]}
              fillOpacity={isSel ? 0.95 : 0.6}
              stroke={isSel ? COLORS.pink : "none"}
              strokeWidth={isSel ? 2 : 0}
              initial={false}
              animate={{ width: Math.max(1, w) }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
            />
            <text x={plot.left + Math.max(1, w) + 8} y={y + 18} fill={COLORS.muted} fontSize={12} fontWeight={700}>
              {(probs[i] * 100).toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3">
        <label htmlFor="llm-temp" className="flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>Temperature</span>
          <span className="text-on-surface">T = {temperature.toFixed(2)}</span>
        </label>
        <input
          id="llm-temp"
          aria-label="Temperature"
          type="range"
          min={0.2}
          max={2.2}
          step={0.05}
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-primary"
        />
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
          <span>0.2 · sharp / predictable</span>
          <span>2.2 · flat / creative</span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-outline pt-2 font-mono text-[11px] text-on-surface-variant">
          <span>shape <span className="font-bold text-on-surface">{shape}</span></span>
          <span>spread <span className="font-bold text-on-surface">{entropy.toFixed(2)} bits</span></span>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Pick by</span>
          <div className="flex gap-1 border border-outline bg-surface-container-low p-1">
            <button
              aria-label="Random sample"
              aria-pressed={!greedy}
              onClick={() => setGreedy(false)}
              className={`px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${!greedy ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-outline-variant"}`}
            >
              Sample
            </button>
            <button
              aria-label="Greedy argmax"
              aria-pressed={greedy}
              onClick={() => setGreedy(true)}
              className={`px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${greedy ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-outline-variant"}`}
            >
              Greedy
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            aria-label="Sample next word"
            onClick={sampleNext}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container hover:text-primary"
          >
            Add next word
          </button>
          <button
            aria-label="Reset sentence"
            onClick={reset}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container"
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
        A language model does not output words — it outputs a <strong>logit</strong> (raw
        confidence) for every token in its vocabulary. <strong>Softmax</strong> turns those into a
        probability distribution, and the next word is drawn from it.
      </p>
      <p>
        <strong>Temperature</strong> divides every logit before the softmax. Low T exaggerates the
        gaps so the top token dominates — deterministic, repetitive, good for facts. High T shrinks
        the gaps so the distribution flattens — diverse, surprising, good for brainstorming and
        prone to nonsense. <strong>Greedy</strong> ignores the dice entirely and always takes the
        peak.
      </p>
      <p>It is the single most important knob you turn when calling an LLM API.</p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
