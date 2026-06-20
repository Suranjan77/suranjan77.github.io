"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

// Deterministic toy scene: 4 images and 4 text prompts. Each image's "true"
// caption is the one on the diagonal. Similarities are precomputed (no random).
const IMAGES = ["🐱 cat photo", "🐶 dog photo", "🚗 car photo", "✈️ plane photo"];
const PROMPTS = [
  "a photo of a cat",
  "a photo of a dog",
  "a photo of a car",
  "a photo of an airplane",
];

// sim[i][j] = cosine similarity between image i and prompt j, in [0,1].
// High on the diagonal; cat/dog and car/plane are mildly confusable off-diagonal.
const SIM: number[][] = [
  [0.92, 0.61, 0.18, 0.22],
  [0.63, 0.9, 0.2, 0.17],
  [0.19, 0.21, 0.91, 0.58],
  [0.23, 0.16, 0.6, 0.93],
];

function softmaxRow(row: number[], temp: number) {
  const scaled = row.map((v) => v / temp);
  const m = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => (sum === 0 ? 0 : e / sum));
}

// Cyan with similarity-driven opacity.
function cellBg(v: number) {
  const a = (0.1 + 0.9 * v).toFixed(3);
  return `rgba(85, 107, 74, ${a})`;
}

export default function VisionLanguageModelsViz() {
  const [query, setQuery] = useState(0); // which image is the zero-shot query
  const temp = 0.1;

  const probs = useMemo(() => softmaxRow(SIM[query], temp), [query]);
  const pred = useMemo(() => probs.indexOf(Math.max(...probs)), [probs]);
  const correct = pred === query;

  const canvas = (
    <div
      role="img"
      aria-label="CLIP Image-Text Similarity Matrix and Zero-Shot Match"
      className="flex flex-col gap-4 p-4 font-sans"
    >
      <div className="overflow-x-auto">
        <table className="border-collapse font-mono text-[11px]">
          <thead>
            <tr>
              <th className="p-1" />
              {PROMPTS.map((p, j) => (
                <th
                  key={j}
                  className="max-w-[88px] p-1 text-left align-bottom font-bold text-on-surface-variant"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {IMAGES.map((img, i) => (
              <tr
                key={i}
                style={{
                  outline: i === query ? `2px solid ${COLORS.pink}` : undefined,
                }}
              >
                <th className="whitespace-nowrap p-1 text-left font-bold text-on-surface">
                  {img}
                </th>
                {PROMPTS.map((_, j) => {
                  const isMatch = i === query && j === pred;
                  return (
                    <td
                      key={j}
                      className="h-12 w-[88px] text-center align-middle"
                      style={{
                        background: cellBg(SIM[i][j]),
                        outline: isMatch ? `3px solid ${COLORS.yellow}` : undefined,
                        outlineOffset: "-3px",
                        color: COLORS.bg,
                        fontWeight: 700,
                      }}
                    >
                      {SIM[i][j].toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-outline bg-surface p-3 font-mono text-[12px]">
        <span className="text-on-surface-variant">Zero-shot prediction for </span>
        <span className="font-bold text-on-surface">{IMAGES[query]}</span>
        <span className="text-on-surface-variant"> → </span>
        <span className="font-bold" style={{ color: correct ? COLORS.cyan : COLORS.pink }}>
          &quot;{PROMPTS[pred]}&quot; ({(probs[pred] * 100).toFixed(0)}%)
        </span>
        <span className="text-on-surface-variant">{correct ? "  ✓ correct" : "  ✗ wrong"}</span>
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-2 border border-outline bg-surface p-3">
      <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
        Zero-shot query image
      </span>
      <div className="flex flex-wrap gap-2">
        {IMAGES.map((img, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Classify ${img} against the text prompts`}
            onClick={() => setQuery(i)}
            className="border px-3 py-1.5 font-mono text-[12px] font-bold"
            style={{
              borderColor: COLORS.border,
              background: query === i ? COLORS.cyan : "transparent",
              color: query === i ? COLORS.bg : COLORS.muted,
            }}
          >
            {img}
          </button>
        ))}
      </div>
    </div>
  );

  const caption = correct
    ? `The cat/dog and car/plane pairs are mildly confusable, but the highest similarity in the highlighted row is still the true caption — so picking the nearest text prompt classifies ${IMAGES[query]} correctly with no labels, only words.`
    : `Here the nearest prompt is not the true one — a reminder that zero-shot matching can fail on confusable categories.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        CLIP puts images and text in one <strong>shared embedding space</strong>,
        so the similarity between an image and a sentence is just a dot product.
        The grid shows those similarities — bright cells mean &quot;this image and
        this caption belong together.&quot;
      </p>
      <p>
        Training only ever pushes the <em>diagonal</em> (true image–caption pairs)
        up and the off-diagonal down — no class labels, just which caption came
        with which image. That is the entire contrastive objective.
      </p>
      <p>
        To classify an image <strong>zero-shot</strong>, write the candidate
        classes as prompts, embed them, and pick the row&apos;s brightest cell
        (outlined). The class set is whatever text you supply at inference — open
        vocabulary — which is why the same model can also do retrieval and steer
        text-to-image generation.
      </p>
    </div>
  );

  return (
    <VizShell
      canvas={canvas}
      controls={controls}
      caption={caption}
      mentalModel={mentalModel}
    />
  );
}
