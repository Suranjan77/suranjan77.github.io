"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

const COLS = 7;
const ROWS = 5;
const N = COLS * ROWS;
const TAU = 0.16; // attention temperature over the content feature

type Mode = "vit" | "cnn";

// Deterministic scene: an elliptical "object" with a softer edge ring over
// background. The content feature drives content-based attention.
function featureAt(r: number, c: number) {
  const dx = (c - 3) / 2.4;
  const dy = (r - 2) / 1.7;
  const d = dx * dx + dy * dy;
  if (d <= 0.6) return 1; // object interior
  if (d <= 1.05) return 0.55; // object edge
  return 0.08; // background
}

const FEATURES: number[] = (() => {
  const out: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) out.push(featureAt(r, c));
  }
  return out;
})();

const idx = (r: number, c: number) => r * COLS + c;

export default function VisionTransformersViz() {
  const [query, setQuery] = useState(idx(2, 3)); // start on the object center
  const [mode, setMode] = useState<Mode>("vit");

  const qr = Math.floor(query / COLS);
  const qc = query % COLS;

  const { weights, attended, objectMass } = useMemo(() => {
    const qf = FEATURES[query];
    const raw = new Array<number>(N).fill(0);

    // Which keys is this patch allowed to attend to?
    const allowed = (r: number, c: number) =>
      mode === "vit"
        ? true // global: every patch
        : Math.abs(r - qr) <= 1 && Math.abs(c - qc) <= 1; // local 3x3 window

    let sum = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(r, c);
        if (!allowed(r, c)) {
          raw[i] = 0;
          continue;
        }
        // Content-based score: patches with similar features attend to each other.
        const diff = FEATURES[i] - qf;
        const score = Math.exp(-(diff * diff) / TAU);
        raw[i] = score;
        sum += score;
      }
    }

    const w = raw.map((v) => (sum === 0 ? 0 : v / sum));
    const attendedCount = w.filter((v) => v >= 0.5 / N).length;
    let mass = 0;
    for (let i = 0; i < N; i++) if (FEATURES[i] >= 0.5) mass += w[i];

    return { weights: w, attended: attendedCount, objectMass: mass };
  }, [query, mode, qr, qc]);

  const maxW = Math.max(...weights, 1e-9);
  const fieldSize = mode === "vit" ? N : Math.min(9, attended || 9);

  const patchColor = (i: number) => {
    const t = weights[i] / maxW; // 0..1 normalized attention
    // Mix from grid (no attention) toward cyan (strong attention).
    const a = 0.12 + 0.88 * t;
    return `rgba(85, 107, 74, ${t === 0 ? 0 : a.toFixed(3)})`;
  };

  const grid = (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
    >
      {FEATURES.map((f, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        const isQuery = i === query;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Use patch at row ${r + 1}, column ${c + 1} as the attention query`}
            onClick={() => setQuery(i)}
            className="relative aspect-square border"
            style={{
              borderColor: isQuery ? COLORS.pink : COLORS.border,
              borderWidth: isQuery ? 3 : 1,
              // faint object outline underneath, attention overlay on top
              background: `linear-gradient(0deg, rgba(190,182,165,${(f * 0.35).toFixed(3)}), rgba(190,182,165,${(f * 0.35).toFixed(3)})), ${COLORS.bg}`,
            }}
          >
            <span
              className="absolute inset-0"
              style={{ background: patchColor(i) }}
            />
            {isQuery && (
              <span
                className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold"
                style={{ color: COLORS.pink }}
              >
                Q
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const canvas = (
    <div
      role="img"
      aria-label="Vision Transformer Patch Attention Map"
      className="flex flex-col gap-4 p-4 font-sans"
    >
      <div className="flex flex-col gap-1">
        <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          Attention from the query patch (Q) over the {ROWS}×{COLS} patch grid
        </div>
        {grid}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 border"
            style={{ borderColor: COLORS.pink, borderWidth: 2 }}
          />{" "}
          query patch
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3"
            style={{ background: COLORS.cyan }}
          />{" "}
          strong attention
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3"
            style={{ background: "rgba(190,182,165,0.35)" }}
          />{" "}
          object outline
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Mode" value={mode === "vit" ? "ViT (global)" : "CNN (3×3)"} />
        <Stat label="Patches in view" value={`${fieldSize} / ${N}`} />
        <Stat
          label="Attention on object"
          value={`${(objectMass * 100).toFixed(0)}%`}
        />
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Receptive field
        </div>
        <p className="font-sans text-[12px] text-on-surface-variant">
          Click any patch to make it the query. Toggle how far it is allowed to
          attend.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Use Vision Transformer global attention"
          onClick={() => setMode("vit")}
          className="border px-3 py-1.5 font-mono text-[12px] font-bold"
          style={{
            borderColor: COLORS.border,
            background: mode === "vit" ? COLORS.cyan : "transparent",
            color: mode === "vit" ? COLORS.bg : COLORS.muted,
          }}
        >
          ViT · global
        </button>
        <button
          type="button"
          aria-label="Use CNN local 3 by 3 receptive field"
          onClick={() => setMode("cnn")}
          className="border px-3 py-1.5 font-mono text-[12px] font-bold"
          style={{
            borderColor: COLORS.border,
            background: mode === "cnn" ? COLORS.pink : "transparent",
            color: mode === "cnn" ? COLORS.bg : COLORS.muted,
          }}
        >
          CNN · 3×3
        </button>
      </div>
    </div>
  );

  const caption =
    mode === "vit"
      ? `In ViT, the query attends across the whole image (${N}/${N} patches) and concentrates ${(objectMass * 100).toFixed(0)}% of its attention on patches with similar content — global, content-based reasoning in a single layer.`
      : `A convolution can only mix the query with its ${fieldSize} immediate neighbors. Distant patches of the same object are invisible until many layers stack up — the locality bias ViT discards.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A ViT cuts the image into <strong>patches</strong> and treats each as a
        token, like words in a sentence. Every patch can <em>attend</em> to every
        other patch, so the colored overlay shows how much the query patch (Q)
        pulls information from each of the others.
      </p>
      <p>
        Attention here is <strong>content-based</strong>: patches with similar
        appearance light up for each other regardless of distance. Notice an
        object patch attends to far-away object patches — something a small
        convolution kernel simply cannot do in one layer.
      </p>
      <p>
        Flip to <strong>CNN · 3×3</strong> to see the contrast: a convolution is
        restricted to a local neighborhood. That built-in locality is a helpful
        prior when data is scarce, but it is also the very assumption a Vision
        Transformer throws away in exchange for a global receptive field.
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-outline bg-surface px-3 py-2">
      <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </div>
      <div className="font-mono text-lg font-bold text-primary">{value}</div>
    </div>
  );
}
