"use client";

import React, { useState, useMemo } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 440;
const N = 16; // image is N x N

// --- Separable cosine (DCT-II) basis: the "ingredients" of the picture. ---
// Keeping the top-k highest-energy components is exactly low-rank / PCA-style
// reconstruction (JPEG uses the same idea), and it is cheap and exact to
// compute, so the visual stays honest.

const alpha = (k: number) => (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N));

// Precomputed cosine table: COS[i][f] = cos((2i+1) f pi / 2N)
const COS: number[][] = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (_, f) =>
    Math.cos(((2 * i + 1) * f * Math.PI) / (2 * N)),
  ),
);

// Target image: a bold heart (recognizable even when blurry).
function targetPixel(r: number, c: number) {
  const x = (c - (N - 1) / 2) / (N * 0.42);
  const y = -(r - (N - 1) / 2) / (N * 0.42) + 0.35;
  const a = x * x + y * y - 1;
  const inside = a * a * a - x * x * y * y * y < 0;
  return inside ? 0.95 : 0.08;
}

const TARGET: number[][] = Array.from({ length: N }, (_, r) =>
  Array.from({ length: N }, (_, c) => targetPixel(r, c)),
);

// Forward DCT -> components sorted by energy (largest first).
interface Comp {
  u: number;
  v: number;
  coef: number;
  energy: number;
}
const COMPONENTS: Comp[] = (() => {
  const comps: Comp[] = [];
  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          sum += TARGET[r][c] * COS[r][u] * COS[c][v];
        }
      }
      const coef = alpha(u) * alpha(v) * sum;
      comps.push({ u, v, coef, energy: coef * coef });
    }
  }
  return comps.sort((a, b) => b.energy - a.energy);
})();

const TOTAL_ENERGY = COMPONENTS.reduce((s, c) => s + c.energy, 0);
const PREFIX_ENERGY: number[] = (() => {
  const out = [0];
  for (let i = 0; i < COMPONENTS.length; i++) {
    out.push(out[i] + COMPONENTS[i].energy);
  }
  return out;
})();

const MAX_K = 40; // beyond this the picture is essentially exact

/** Percent of the image's total variance captured by the top-k components. */
export function pcaVarianceCapturedPercent(k: number) {
  const kk = Math.max(0, Math.min(COMPONENTS.length, Math.round(k)));
  return TOTAL_ENERGY > 0 ? (PREFIX_ENERGY[kk] / TOTAL_ENERGY) * 100 : 0;
}

function reconstruct(k: number): number[][] {
  const out = Array.from({ length: N }, () => new Array<number>(N).fill(0));
  for (let i = 0; i < k && i < COMPONENTS.length; i++) {
    const { u, v, coef } = COMPONENTS[i];
    const w = coef * alpha(u) * alpha(v);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        out[r][c] += w * COS[r][u] * COS[c][v];
      }
    }
  }
  return out;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Image grid renderer
function ImageGrid({
  values,
  ox,
  oy,
  cell,
}: {
  values: number[][];
  ox: number;
  oy: number;
  cell: number;
}) {
  return (
    <g>
      {values.map((row, r) =>
        row.map((val, c) => (
          <rect
            key={`${r}-${c}`}
            x={ox + c * cell}
            y={oy + r * cell}
            width={cell}
            height={cell}
            fill={COLORS.pink}
            fillOpacity={clamp01(val)}
          />
        )),
      )}
      <rect
        x={ox}
        y={oy}
        width={cell * N}
        height={cell * N}
        fill="none"
        stroke={COLORS.border}
        strokeWidth={1.5}
      />
    </g>
  );
}

export default function PCAViz() {
  const [k, setK] = useState(3);

  const recon = useMemo(() => reconstruct(k), [k]);
  const varPercent = pcaVarianceCapturedPercent(k);

  const cell = 17;
  const reconOx = 96;
  const origOx = 400;
  const gridOy = 70;

  const caption =
    k <= 2
      ? `Only ${k} of ${COMPONENTS.length} ingredients: you mostly see the average tone — the shape is barely there yet, even though it already keeps ${varPercent.toFixed(0)}% of the variance.`
      : k <= 12
        ? `With ${k} ingredients the heart's shape has snapped into focus, keeping ${varPercent.toFixed(0)}% of the picture's variance from a small fraction of the components.`
        : `Just ${k} of ${COMPONENTS.length} components already reconstruct ${varPercent.toFixed(0)}% of the picture — everything after this is fine detail. That is the compression win of dimensionality reduction.`;

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Low-Rank Image Reconstruction"
    >
      <title>Dimensionality Reduction Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* Reconstruction */}
      <text x={reconOx} y={gridOy - 14} fill={COLORS.muted} fontSize={13} fontWeight={800}>
        REBUILT FROM {k} COMPONENT{k === 1 ? "" : "S"}
      </text>
      <ImageGrid values={recon} ox={reconOx} oy={gridOy} cell={cell} />

      {/* Variance-kept bar under the reconstruction */}
      <g>
        <rect x={reconOx} y={gridOy + cell * N + 18} width={cell * N} height={12} fill={COLORS.grid} />
        <rect x={reconOx} y={gridOy + cell * N + 18} width={(varPercent / 100) * cell * N} height={12} fill={COLORS.yellow} />
        <text x={reconOx} y={gridOy + cell * N + 48} fill={COLORS.muted} fontSize={12} fontWeight={700}>
          {varPercent.toFixed(1)}% of variance kept
        </text>
      </g>

      {/* Original reference */}
      <text x={origOx} y={gridOy - 14} fill={COLORS.muted} fontSize={13} fontWeight={800}>
        ORIGINAL ({COMPONENTS.length} COMPONENTS)
      </text>
      <ImageGrid values={TARGET} ox={origOx} oy={gridOy} cell={cell} />
      <text x={origOx} y={gridOy + cell * N + 30} fill={COLORS.muted} fontSize={12} fontWeight={700}>
        the full picture
      </text>
    </svg>
  );

  const controls = (
    <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3">
      <label
        htmlFor="pca-k"
        className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary"
      >
        Ingredients kept (components k) — {k}
      </label>
      <input
        id="pca-k"
        aria-label="Number of components k"
        type="range"
        min={1}
        max={MAX_K}
        step={1}
        value={k}
        onChange={(e) => setK(Number(e.target.value))}
        className="w-full cursor-pointer accent-primary"
      />
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-on-surface-variant">
        <span>1 (most compressed)</span>
        <span>{MAX_K} (near-exact)</span>
      </div>
    </div>
  );

  const mentalModel = (
    <p>
      Any image can be written as a sum of fixed pattern &quot;ingredients&quot;
      (here, cosine waves; in PCA, the principal components). A few of them carry
      most of the variance, so keeping only the top-k still looks like the
      picture while storing far less. Dimensionality reduction is exactly this
      trade: drop the low-variance ingredients and accept a little reconstruction
      error in exchange for a much smaller representation. JPEG compresses photos
      the same way.
    </p>
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
