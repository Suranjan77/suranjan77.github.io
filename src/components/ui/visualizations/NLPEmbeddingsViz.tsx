"use client";

import React, { useState } from "react";
import { COLORS, SVGFilters, Vector, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 430;
const plot = { left: 70, right: 560, top: 48, bottom: 384 };
const DX = 8;
const DY = 8;
const sx = (v: number) => plot.left + (v / DX) * (plot.right - plot.left);
const sy = (v: number) => plot.bottom - (v / DY) * (plot.bottom - plot.top);

type Word = { w: string; x: number; y: number };
type Preset = {
  name: string;
  words: Word[];
  base: string;
  minus: string;
  plus: string;
  answer: string;
  note: string;
};

const PRESETS: Record<string, Preset> = {
  royalty: {
    name: "Royalty",
    words: [
      { w: "man", x: 1.6, y: 2.2 },
      { w: "woman", x: 5.6, y: 2.2 },
      { w: "king", x: 1.6, y: 6.0 },
      { w: "queen", x: 5.6, y: 6.0 },
      { w: "prince", x: 3.1, y: 5.1 },
      { w: "throne", x: 6.9, y: 7.0 },
    ],
    base: "king",
    minus: "man",
    plus: "woman",
    answer: "queen",
    note: "man → woman is the same arrow as king → queen: a consistent “gender” direction in the space.",
  },
  capitals: {
    name: "Capitals",
    words: [
      { w: "France", x: 1.6, y: 2.2 },
      { w: "Italy", x: 5.6, y: 2.2 },
      { w: "Paris", x: 1.6, y: 6.0 },
      { w: "Rome", x: 5.6, y: 6.0 },
      { w: "Berlin", x: 7.0, y: 6.7 },
      { w: "Spain", x: 6.9, y: 1.5 },
    ],
    base: "Paris",
    minus: "France",
    plus: "Italy",
    answer: "Rome",
    note: "France → Italy is the same arrow as Paris → Rome: a consistent “swap the country” direction.",
  },
};

export default function NLPEmbeddingsViz() {
  const [presetId, setPresetId] = useState("royalty");
  const [solved, setSolved] = useState(false);
  const preset = PRESETS[presetId];

  const find = (w: string) => preset.words.find((t) => t.w === w) as Word;

  const base = find(preset.base);
  const minus = find(preset.minus);
  const plus = find(preset.plus);
  const result = { x: base.x - minus.x + plus.x, y: base.y - minus.y + plus.y };
  const nearest = preset.words
    .filter((t) => ![preset.base, preset.minus, preset.plus].includes(t.w))
    .map((t) => ({ ...t, d: Math.hypot(t.x - result.x, t.y - result.y) }))
    .sort((a, b) => a.d - b.d)[0];

  const switchPreset = (id: string) => {
    setPresetId(id);
    setSolved(false);
  };

  const caption = !solved
    ? `Each word is a point; what carries meaning is the directions between them. ${preset.note} Solve the analogy to add that arrow to “${preset.base}”.`
    : `${preset.base} − ${preset.minus} + ${preset.plus} lands right on “${nearest.w}”. Adding the ${preset.minus}→${preset.plus} arrow to ${preset.base} is the same move, so the nearest word is the analogy’s answer — meaning is arithmetic on directions.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="NLP Embeddings Analogy Grid">
      <title>NLP Embeddings Analogy Grid</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* grid */}
      {[0, 2, 4, 6, 8].map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
          <line x1={plot.left} x2={plot.right} y1={sy(t)} y2={sy(t)} stroke={COLORS.grid} strokeWidth={1} />
        </g>
      ))}
      <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
      <text x={plot.right} y={plot.bottom + 22} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>embedding dimension →</text>

      {/* reference relationship arrow: minus -> plus */}
      <Vector x1={sx(minus.x)} y1={sy(minus.y)} x2={sx(plus.x)} y2={sy(plus.y)} color={COLORS.yellow} />
      <text x={(sx(minus.x) + sx(plus.x)) / 2} y={sy(minus.y) - 10} textAnchor="middle" fill={COLORS.yellow} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
        {preset.minus} → {preset.plus}
      </text>

      {/* applied arrow: base -> result (same direction) */}
      {solved && (
        <>
          <Vector x1={sx(base.x)} y1={sy(base.y)} x2={sx(result.x)} y2={sy(result.y)} color={COLORS.pink} />
          <circle cx={sx(result.x)} cy={sy(result.y)} r={16} fill="none" stroke={COLORS.pink} strokeWidth={2} strokeDasharray="3 2" />
        </>
      )}

      {/* words */}
      {preset.words.map((t) => {
        const isAnswer = solved && t.w === nearest.w;
        const role = t.w === preset.base || t.w === preset.minus || t.w === preset.plus;
        return (
          <g key={t.w}>
            <circle cx={sx(t.x)} cy={sy(t.y)} r={isAnswer ? 8 : 6} fill={isAnswer ? COLORS.pink : role ? COLORS.cyan : COLORS.muted} stroke={COLORS.bg} strokeWidth={1.5} />
            <text x={sx(t.x) + 11} y={sy(t.y) + 4} fill={isAnswer ? COLORS.pink : COLORS.muted} fontSize={12} fontWeight={isAnswer ? 900 : 700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
              {t.w}
            </text>
          </g>
        );
      })}

      {solved && (
        <text x={sx(result.x)} y={sy(result.y) + 30} textAnchor="middle" fill={COLORS.pink} fontSize={11} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
          {preset.base} − {preset.minus} + {preset.plus}
        </text>
      )}
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Semantic Analogies</span>
        <div className="flex gap-2">
          {Object.entries(PRESETS).map(([id, p]) => (
            <button
              key={id}
              aria-label={`Analogy preset ${p.name}`}
              aria-pressed={id === presetId}
              onClick={() => switchPreset(id)}
              className={`flex h-9 items-center justify-center border px-3 font-mono text-[12px] font-bold uppercase tracking-wide transition-colors ${
                id === presetId ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <div className="font-mono text-[14px] font-bold text-on-surface">
          {preset.base} − {preset.minus} + {preset.plus} ={" "}
          {solved ? (
            <span data-testid="nlp-result" style={{ color: COLORS.pink }}>&ldquo;{nearest.w}&rdquo;</span>
          ) : (
            <span className="text-on-surface-variant">?</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            aria-label="Solve the analogy"
            onClick={() => setSolved(true)}
            disabled={solved}
            className="flex h-9 items-center justify-center border border-primary bg-primary px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-primary transition-colors hover:opacity-90 disabled:opacity-50"
          >
            Solve analogy
          </button>
          <button
            aria-label="Clear arrows"
            onClick={() => setSolved(false)}
            disabled={!solved}
            className="flex h-9 items-center justify-center border border-outline bg-surface px-3 font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            Clear arrows
          </button>
        </div>
        <p className="font-sans text-[12px] leading-snug text-on-surface-variant">
          The <span style={{ color: COLORS.yellow }}>yellow</span> arrow (the relationship) and the{" "}
          <span style={{ color: COLORS.pink }}>pink</span> arrow (applied to {preset.base}) are the
          same vector — that is why the analogy works.
        </p>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        An <strong>embedding</strong> turns every word into a point in a high-dimensional space,
        learned so that words used in similar contexts land near each other. The surprise is that{" "}
        <strong>directions</strong> become meaningful too: there is a consistent &quot;gender&quot;
        offset, a &quot;capital-of&quot; offset, a &quot;past-tense&quot; offset.
      </p>
      <p>
        Because relationships are consistent directions, analogies become plain vector arithmetic:{" "}
        <strong>king − man + woman</strong> lands almost exactly on <strong>queen</strong>. The
        model never learned that rule; it falls out of the geometry. The same trick — nearest point
        in embedding space — powers semantic search, recommendations, and the retrieval step in RAG.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
