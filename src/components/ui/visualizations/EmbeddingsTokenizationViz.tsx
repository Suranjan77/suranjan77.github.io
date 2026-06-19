"use client";

import React, { useState } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 360;

// A small illustrative subword vocabulary. Common whole words tokenize to one
// piece; rarer/longer words get split greedily into known subword pieces, the
// way a real BPE/WordPiece tokenizer does.
const VOCAB = [
  "the", "cat", "sat", "on", "mat", "i", "love", "machine", "learning", "model", "models",
  "is", "are", "and", "a", "to", "of", "new", "york", "please", "help", "me", "write", "code",
  "you", "pay", "for", "every", "see", "as", "it",
  "token", "ization", "sub", "words", "word", "shatter", "s", "ing", "ed", "un", "happy",
  "ness", "anti", "dis", "establish", "ment", "arian", "ism", "over", "fit", "ting", "pre",
  "train", "trans", "former", "ers", "er", "ly", "able", "re", "present", "ation", "neighbour",
];
const VOCAB_SET = new Map(VOCAB.map((w, i) => [w, 1000 + i]));

type Tok = { text: string; id: number; cont: boolean; kind: "word" | "sub" | "punct" };

function tokenizeWord(word: string): Tok[] {
  const lower = word.toLowerCase();
  const out: Tok[] = [];
  let i = 0;
  let first = true;
  while (i < lower.length) {
    let matched = "";
    for (let j = lower.length; j > i; j--) {
      const slice = lower.slice(i, j);
      if (VOCAB_SET.has(slice)) {
        matched = slice;
        break;
      }
    }
    if (!matched) {
      matched = lower.slice(i, i + 3); // fall back to a 3-char chunk
    }
    out.push({
      text: word.slice(i, i + matched.length),
      id: VOCAB_SET.get(matched) ?? 200 + (matched.charCodeAt(0) % 800),
      cont: !first,
      kind: first ? "word" : "sub",
    });
    i += matched.length;
    first = false;
  }
  return out;
}

function tokenize(text: string): Tok[] {
  const chunks = text.match(/[A-Za-z0-9]+|[^\sA-Za-z0-9]/g) ?? [];
  const out: Tok[] = [];
  for (const ch of chunks) {
    if (/[A-Za-z0-9]/.test(ch)) out.push(...tokenizeWord(ch));
    else out.push({ text: ch, id: 30 + (ch.charCodeAt(0) % 60), cont: false, kind: "punct" });
  }
  return out;
}

const PRESETS = [
  "I love machine learning models",
  "Tokenization shatters into subwords",
  "antidisestablishmentarianism",
  "The cat sat on the mat!",
];

export default function EmbeddingsTokenizationViz() {
  const [text, setText] = useState(PRESETS[1]);
  const [showIds, setShowIds] = useState(true);

  const tokens = tokenize(text);
  const wordCount = (text.trim().match(/[A-Za-z0-9]+/g) ?? []).length;
  const tokenCount = tokens.length;

  // layout chips with wrapping
  const charW = 8.4;
  const padX = 12;
  const chipH = 34;
  const gap = 7;
  const rowGap = 14;
  const startX = 24;
  const startY = 52;
  const maxX = W - 24;
  let x = startX;
  let y = startY;
  const placed = tokens.map((t) => {
    const label = (t.cont ? "##" : "") + t.text;
    const wpx = Math.max(26, label.length * charW + padX);
    if (x + wpx > maxX && x > startX) {
      x = startX;
      y += chipH + rowGap;
    }
    const pos = { ...t, label, x, y, w: wpx };
    x += wpx + gap + (t.cont ? 0 : 4);
    return pos;
  });
  const usedRows = (y - startY) / (chipH + rowGap) + 1;

  const caption = (() => {
    const splitWords = tokens.filter((t) => t.cont).length;
    if (splitWords === 0)
      return `These ${wordCount} common words each map to a single token. When text is plain, token count ≈ word count.`;
    return `${wordCount} word${wordCount > 1 ? "s" : ""} became ${tokenCount} tokens: rare or long words shatter into subword pieces (shown with ##), while common words stay whole. The model never sees the word — only these pieces and their IDs.`;
  })();

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${Math.max(H, startY + usedRows * (chipH + rowGap) + 80)}`} role="img" aria-label="Subword Tokenization">
      <title>Subword Tokenization</title>
      <SVGFilters />
      <rect width={W} height={Math.max(H, startY + usedRows * (chipH + rowGap) + 80)} fill={COLORS.bg} />

      <text x={startX} y={32} fill={COLORS.muted} fontSize={11} fontWeight={800} letterSpacing="0.06em">
        THE TEXT, AS THE MODEL SEES IT
      </text>

      {placed.map((t, i) => {
        const color = t.kind === "punct" ? COLORS.muted : t.cont ? COLORS.yellow : COLORS.cyan;
        return (
          <g key={i}>
            <rect x={t.x} y={t.y} width={t.w} height={chipH} rx={4} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.5} />
            <text x={t.x + t.w / 2} y={t.y + (showIds ? 15 : 22)} textAnchor="middle" fill={t.cont ? COLORS.yellow : COLORS.muted} fontSize={13} fontWeight={700}>
              {t.label}
            </text>
            {showIds && (
              <text x={t.x + t.w / 2} y={t.y + 28} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700} fontFamily="monospace">
                {t.id}
              </text>
            )}
          </g>
        );
      })}

      <text x={startX} y={startY + usedRows * (chipH + rowGap) + 28} fill={COLORS.muted} fontSize={13} fontWeight={700}>
        <tspan fill={COLORS.cyan} fontWeight={900}>{wordCount}</tspan> words →{" "}
        <tspan fill={COLORS.pink} fontWeight={900}>{tokenCount}</tspan> tokens
      </text>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <label htmlFor="tok-input" className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          Type text to tokenize
        </label>
        <input
          id="tok-input"
          aria-label="Text to tokenize"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-outline bg-surface p-2 font-sans text-[14px] text-on-surface"
          placeholder="Type anything…"
        />
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              aria-label={`Example: ${p}`}
              onClick={() => setText(p)}
              className="border border-outline bg-surface px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
            >
              {p.length > 22 ? p.slice(0, 20) + "…" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-[190px] flex-col justify-center gap-2 border border-outline bg-surface p-3 font-mono text-[12px]">
        <div className="flex items-center justify-between"><span className="uppercase tracking-wide text-on-surface-variant">words</span><span data-testid="tok-words" className="text-base font-bold" style={{ color: COLORS.cyan }}>{wordCount}</span></div>
        <div className="flex items-center justify-between"><span className="uppercase tracking-wide text-on-surface-variant">tokens</span><span data-testid="tok-count" className="text-base font-bold" style={{ color: COLORS.pink }}>{tokenCount}</span></div>
        <button
          aria-label="Toggle token IDs"
          aria-pressed={showIds}
          onClick={() => setShowIds((s) => !s)}
          className={`mt-1 border px-2 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${showIds ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"}`}
        >
          {showIds ? "Hide IDs" : "Show IDs"}
        </button>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A language model can&apos;t read characters or words directly — first a{" "}
        <strong>tokenizer</strong> chops the text into a fixed vocabulary of{" "}
        <strong>subword tokens</strong>, each mapped to an integer ID. Those IDs are the model&apos;s
        actual input.
      </p>
      <p>
        The vocabulary is learned (BPE/WordPiece) so that <em>common</em> words are a single token
        while <em>rare or long</em> words break into reusable pieces (here marked{" "}
        <strong>##</strong>). That is why &quot;tokenization&quot; is two tokens and an obscure long
        word can be seven.
      </p>
      <p>
        It matters in practice: API cost and the context window are measured in <strong>tokens, not
        words</strong>; a token is also the unit an embedding lookup turns into a vector, and the
        unit an LLM predicts one at a time.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
