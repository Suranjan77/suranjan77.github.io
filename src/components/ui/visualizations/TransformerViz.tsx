"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 340;
const tokenY = 232;

// The canonical coreference example: "it" is ambiguous, and only context
// resolves it. Flipping the final adjective flips what "it" refers to.
const baseTokens = ["The", "animal", "crossed", "the", "road", "because", "it", "was", "too"];
const IT = 6;
const ANIMAL = 1;
const ROAD = 4;

type Ending = "tired" | "wide";

function attention(version: Ending, qi: number, n: number): number[] {
  const referent = version === "tired" ? ANIMAL : ROAD;
  const raw = new Array(n).fill(0).map((_, j) => {
    if (qi === IT) {
      // the pronoun resolves to its referent, with a little self-reference
      if (j === referent) return 3.0;
      if (j === IT) return 1.0;
      return 0.2;
    }
    let a = 0.2;
    if (j === qi) a += 1.6; // self
    if (Math.abs(j - qi) === 1) a += 0.9; // neighbours
    if (j === ANIMAL) a += 0.3; // subject gets some attention
    return a;
  });
  const sum = raw.reduce((p, c) => p + c, 0);
  return raw.map((v) => v / sum);
}

export default function TransformerViz() {
  const [ending, setEnding] = useState<Ending>("tired");
  const [query, setQuery] = useState(IT);

  const tokens = [...baseTokens, ending];
  const n = tokens.length;
  const weights = attention(ending, query, n);

  const slotW = (W - 70) / n;
  const tokenX = (i: number) => 35 + i * slotW + slotW / 2;

  // strongest attended token that isn't pure self (for the readout)
  let referentIdx = 0;
  let best = -1;
  weights.forEach((w, i) => {
    if (query === IT && i === IT) return;
    if (w > best) {
      best = w;
      referentIdx = i;
    }
  });

  const caption =
    query === IT
      ? `"it" is ambiguous — a pronoun with no meaning on its own. Self-attention lets it look across the whole sentence and bind to the word that makes sense: with "...too ${ending}", the strongest attention runs to "${tokens[referentIdx]}" (${(best * 100).toFixed(0)}%). Flip the ending and the referent flips with it. That contextual binding is what attention buys you.`
      : `"${tokens[query]}" attends across the sentence; thicker arcs mean stronger attention. Click "it" to see attention resolve an ambiguous pronoun.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Transformer Self-Attention">
      <title>Transformer Self-Attention</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* attention arcs from the query token to each key token */}
      {tokens.map((_, j) => {
        if (j === query) return null;
        const w = weights[j];
        if (w < 0.08) return null;
        const x1 = tokenX(query);
        const x2 = tokenX(j);
        const mid = (x1 + x2) / 2;
        const peak = tokenY - 28 - Math.abs(query - j) * 22;
        const isTop = j === referentIdx && (query === IT || w === best);
        return (
          <motion.path
            key={j}
            d={`M ${x1} ${tokenY - 18} Q ${mid} ${peak} ${x2} ${tokenY - 18}`}
            fill="none"
            stroke={isTop ? COLORS.yellow : COLORS.cyan}
            strokeWidth={1 + w * 12}
            strokeOpacity={isTop ? 0.95 : 0.2 + w * 0.6}
            initial={false}
            animate={{ d: `M ${x1} ${tokenY - 18} Q ${mid} ${peak} ${x2} ${tokenY - 18}` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        );
      })}

      {/* tokens */}
      {tokens.map((tok, i) => {
        const x = tokenX(i);
        const isQuery = i === query;
        const isReferent = i === referentIdx && query === IT;
        return (
          <g key={i} onClick={() => setQuery(i)} className="cursor-pointer">
            <rect
              x={x - slotW / 2 + 4}
              y={tokenY - 16}
              width={slotW - 8}
              height={34}
              fill={isQuery ? COLORS.pink : isReferent ? COLORS.yellow : COLORS.bg}
              fillOpacity={isQuery ? 0.9 : isReferent ? 0.22 : 0.0}
              stroke={isQuery ? COLORS.pink : isReferent ? COLORS.yellow : COLORS.border}
              strokeWidth={isQuery || isReferent ? 2 : 1}
            />
            <text
              x={x}
              y={tokenY + 6}
              textAnchor="middle"
              fill={isQuery ? COLORS.bg : COLORS.muted}
              fontSize={13}
              fontWeight={isQuery ? 900 : 700}
            >
              {tok}
            </text>
            {/* per-token attention bar from the query */}
            {!isQuery && weights[i] > 0.04 && (
              <rect
                x={x - (slotW - 8) / 2 + 4}
                y={tokenY + 24}
                width={(slotW - 16) * weights[i]}
                height={5}
                fill={i === referentIdx && query === IT ? COLORS.yellow : COLORS.cyan}
                fillOpacity={0.8}
              />
            )}
          </g>
        );
      })}

      <text x={35} y={40} fill={COLORS.muted} fontSize={11} fontWeight={800} letterSpacing="0.08em">
        CLICK A WORD — ARCS SHOW WHAT IT ATTENDS TO
      </text>
      {query === IT && (
        <text x={tokenX(IT)} y={tokenY - 150} textAnchor="middle" fill={COLORS.yellow} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
          it → {tokens[referentIdx]}
        </text>
      )}
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          Finish the sentence
        </span>
        <div className="flex gap-2">
          {(["tired", "wide"] as const).map((e) => (
            <button
              key={e}
              aria-label={`Ending too ${e}`}
              aria-pressed={ending === e}
              onClick={() => setEnding(e)}
              className={`flex h-9 items-center justify-center border px-3 font-mono text-[12px] font-bold uppercase tracking-wide transition-colors ${
                ending === e ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              …too {e}
            </button>
          ))}
        </div>
        <p className="font-sans text-[12px] leading-snug text-on-surface-variant">
          &quot;tired&quot; describes the <strong>animal</strong>; &quot;wide&quot; describes the{" "}
          <strong>road</strong>. Same pronoun, different referent.
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          Query word
        </span>
        <span className="font-mono text-lg font-bold text-primary">&quot;{tokens[query]}&quot;</span>
        <span className="font-sans text-[12px] text-on-surface-variant">
          attends most to{" "}
          <span data-testid="transformer-referent" className="font-bold" style={{ color: COLORS.pink }}>
            {tokens[referentIdx]}
          </span>{" "}
          ({(best * 100).toFixed(0)}%)
        </span>
        <button
          aria-label="Select the pronoun it"
          onClick={() => setQuery(IT)}
          className="mt-1 w-max border border-outline bg-surface px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
        >
          Jump to &quot;it&quot;
        </button>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Self-attention lets every word build its meaning by looking at every other word. For each{" "}
        <strong>query</strong> word it scores how relevant each <strong>key</strong> word is (a
        dot product), softmaxes the scores into weights, and mixes the words together by those
        weights.
      </p>
      <p>
        The pronoun <strong>&quot;it&quot;</strong> is the classic case: alone it means nothing, but
        attention binds it to <em>animal</em> or <em>road</em> depending on the rest of the
        sentence. This is how a transformer carries context — and stacking many attention layers is
        what makes LLMs understand long, tangled text.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
