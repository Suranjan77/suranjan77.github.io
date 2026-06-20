"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

const COLS = 14;
const ROWS = 10;
const N = COLS * ROWS;

// Deterministic clean image x0 in [0,1]: a bright object on a dark background.
function x0At(r: number, c: number) {
  const dx = (c - 6.5) / 4.6;
  const dy = (r - 4.5) / 3.4;
  const d = dx * dx + dy * dy;
  if (d <= 0.55) return 0.88;
  if (d <= 1) return 0.58;
  return 0.14;
}

// Deterministic mask priority per patch: patches with the smallest priority are
// masked first as the ratio grows. No randomness -> stable scene.
function priority(i: number) {
  const h = Math.sin((i + 1) * 41.7) * 9973.1;
  return h - Math.floor(h); // [0,1)
}

const X0: number[] = [];
const PRIO: number[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    X0.push(x0At(r, c));
    PRIO.push(priority(r * COLS + c));
  }
}

const idx = (r: number, c: number) => r * COLS + c;

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function gray(v: number) {
  const x = Math.round(clamp01(v) * 255);
  return `rgb(${x}, ${x}, ${x})`;
}

export default function SelfSupervisedVisionViz() {
  const [maskRatio, setMaskRatio] = useState(0.75);

  // Mask the lowest-priority `maskRatio` fraction of patches.
  const masked = useMemo(() => {
    const order = [...PRIO.keys()].sort((a, b) => PRIO[a] - PRIO[b]);
    const nMask = Math.round(maskRatio * N);
    const set = new Set(order.slice(0, nMask));
    return set;
  }, [maskRatio]);

  // Reconstruct each masked patch from the average of its VISIBLE neighbors.
  // With more masking there are fewer visible neighbors, so the estimate falls
  // back toward the global mean -> blurrier, illustrating the difficulty.
  const { recon, mse } = useMemo(() => {
    const globalMean = X0.reduce((a, b) => a + b, 0) / N;
    const out = new Array<number>(N);
    let errSum = 0;
    let errCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(r, c);
        if (!masked.has(i)) {
          out[i] = X0[i];
          continue;
        }
        let sum = 0;
        let cnt = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
            const ni = idx(nr, nc);
            if (!masked.has(ni)) {
              sum += X0[ni];
              cnt++;
            }
          }
        }
        const est = cnt === 0 ? globalMean : sum / cnt;
        out[i] = est;
        errSum += (est - X0[i]) ** 2;
        errCount++;
      }
    }
    return { recon: out, mse: errCount === 0 ? 0 : errSum / errCount };
  }, [masked]);

  const renderGrid = (
    label: string,
    cellFn: (i: number) => { bg: string; masked?: boolean },
  ) => (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </div>
      <div
        className="grid gap-[1px] border border-outline"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {Array.from({ length: N }, (_, i) => {
          const { bg, masked: m } = cellFn(i);
          return (
            <div
              key={`${label}-${i}`}
              className="aspect-square"
              style={{
                background: bg,
                outline: m ? `1px solid ${COLORS.pink}` : undefined,
                outlineOffset: "-1px",
              }}
            />
          );
        })}
      </div>
    </div>
  );

  const pct = Math.round(maskRatio * 100);

  const canvas = (
    <div
      role="img"
      aria-label="Masked Image Modeling Reconstruction"
      className="flex flex-col gap-4 p-4 font-sans"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {renderGrid("Original", (i) => ({ bg: gray(X0[i]) }))}
        {renderGrid(`Masked input (${pct}% hidden)`, (i) =>
          masked.has(i)
            ? { bg: COLORS.grid, masked: true }
            : { bg: gray(X0[i]) },
        )}
        {renderGrid("Reconstruction", (i) => ({ bg: gray(recon[i]) }))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Masked" value={`${pct}%`} />
        <Stat label="Visible patches" value={String(N - masked.size)} />
        <Stat label="Recon error (MSE)" value={mse.toFixed(3)} />
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Mask ratio
        </div>
        <p className="font-sans text-[12px] text-on-surface-variant">
          Fraction of patches hidden from the encoder. The network must rebuild
          them from what is left.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0.1}
          max={0.9}
          step={0.05}
          value={maskRatio}
          aria-label="Mask ratio"
          onChange={(e) => setMaskRatio(Number(e.target.value))}
          className="w-44"
        />
        <span className="w-10 text-right font-mono text-[13px] font-bold text-on-surface">
          {maskRatio.toFixed(2)}
        </span>
      </div>
    </div>
  );

  const caption =
    maskRatio <= 0.3
      ? `Hiding only ${pct}% is too easy: each masked patch is surrounded by visible neighbors, so reconstruction is near-perfect (MSE ${mse.toFixed(3)}) and the encoder learns little.`
      : maskRatio >= 0.75
        ? `At ${pct}% masking the task is genuinely hard — few visible neighbors remain, so filling the gaps demands real understanding of the object. MAE's sweet spot, and the encoder only processes the visible ${N - masked.size} patches, so pretraining is cheap.`
        : `Masking ${pct}% removes enough context that reconstruction (MSE ${mse.toFixed(3)}) requires modeling shape, not just copying neighbors.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Masked image modeling hides a large fraction of patches and asks the
        network to <strong>reconstruct the missing content</strong> from what
        remains — the vision version of fill-in-the-blank language modeling. No
        labels are involved; the hidden pixels <em>are</em> the supervision.
      </p>
      <p>
        With only a little masking the task is trivial (just copy a neighbor), so
        the model learns nothing. Crank the ratio up and the only way to fill the
        gaps is to understand the object&apos;s shape, parts, and context — which
        is exactly the transferable representation we are after.
      </p>
      <p>
        Because the encoder processes only the <strong>visible</strong> patches,
        heavy masking also makes pretraining several times cheaper. The
        reconstruction itself is thrown away — what we keep is the encoder, later
        evaluated by a linear probe or fine-tuning.
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
