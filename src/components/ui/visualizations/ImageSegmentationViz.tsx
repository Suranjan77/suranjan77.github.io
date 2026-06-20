"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

const COLS = 16;
const ROWS = 11;

type Cell = { r: number; c: number; gt: boolean; prob: number };

// Deterministic scene: an elliptical "object" blob over background.
function isObject(r: number, c: number) {
  const dx = (c - 7.5) / 4.6;
  const dy = (r - 5) / 3.4;
  return dx * dx + dy * dy <= 1;
}

// Deterministic per-pixel model "probability" — no randomness, so the
// visualization renders identically every run (important for the audit test).
function probAt(r: number, c: number) {
  const base = isObject(r, c) ? 0.78 : 0.18;
  const ripple = (((r * 7 + c * 13) % 11) / 11 - 0.5) * 0.5;
  return Math.max(0.02, Math.min(0.98, base + ripple));
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

export default function ImageSegmentationViz() {
  const [threshold, setThreshold] = useState(0.5);

  const cells = useMemo(() => {
    const out: Cell[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        out.push({ r, c, gt: isObject(r, c), prob: probAt(r, c) });
      }
    }
    return out;
  }, []);

  let tp = 0;
  let fp = 0;
  let fn = 0;
  for (const cell of cells) {
    const pred = cell.prob >= threshold;
    if (cell.gt && pred) tp++;
    else if (!cell.gt && pred) fp++;
    else if (cell.gt && !pred) fn++;
  }
  const diceDen = 2 * tp + fp + fn;
  const iouDen = tp + fp + fn;
  const dice = diceDen === 0 ? 0 : (2 * tp) / diceDen;
  const iou = iouDen === 0 ? 0 : tp / iouDen;

  const MISS = "rgba(141,81,73,0.45)";
  const predColor = (cell: Cell) => {
    const pred = cell.prob >= threshold;
    if (cell.gt && pred) return COLORS.cyan; // true positive
    if (!cell.gt && pred) return COLORS.yellow; // false positive
    if (cell.gt && !pred) return MISS; // false negative
    return COLORS.grid; // true negative
  };

  const renderGrid = (label: string, colorFn: (cell: Cell) => string) => (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </div>
      <div
        className="grid gap-[1px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {cells.map((cell) => (
          <div
            key={`${label}-${cell.r}-${cell.c}`}
            className="aspect-square"
            style={{ background: colorFn(cell) }}
          />
        ))}
      </div>
    </div>
  );

  const canvas = (
    <div
      role="img"
      aria-label="Semantic Segmentation Mask and Dice Score"
      className="flex flex-col gap-4 p-4 font-sans"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {renderGrid("Ground-truth mask", (cell) =>
          cell.gt ? COLORS.cyan : COLORS.grid,
        )}
        {renderGrid(
          `Prediction (threshold ${threshold.toFixed(2)})`,
          predColor,
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3" style={{ background: COLORS.cyan }} /> hit (TP)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3" style={{ background: COLORS.yellow }} /> false alarm (FP)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3" style={{ background: MISS }} /> miss (FN)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3" style={{ background: COLORS.grid }} /> background (TN)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Dice" value={dice.toFixed(2)} />
        <Stat label="IoU" value={iou.toFixed(2)} />
        <Stat label="Recovered (TP)" value={String(tp)} />
        <Stat label="Errors (FP+FN)" value={String(fp + fn)} />
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Decision threshold
        </div>
        <p className="font-sans text-[12px] text-on-surface-variant">
          A pixel is labeled &quot;object&quot; when its predicted probability clears the threshold.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0.05}
          max={0.95}
          step={0.05}
          value={threshold}
          aria-label="Decision threshold"
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-40"
        />
        <span className="w-10 text-right font-mono text-[13px] font-bold text-on-surface">
          {threshold.toFixed(2)}
        </span>
      </div>
    </div>
  );

  const caption =
    threshold <= 0.35
      ? `A low threshold labels almost everything "object": recall is high but false alarms (yellow) bleed into the background, so Dice = ${dice.toFixed(2)}.`
      : threshold >= 0.7
        ? `A high threshold only commits to the most confident pixels, so misses (pink) eat into the object and Dice drops to ${dice.toFixed(2)}.`
        : `Near the middle the predicted mask best matches the ground truth — Dice = ${dice.toFixed(2)}, IoU = ${iou.toFixed(2)}. Segmentation is per-pixel classification scored by mask overlap.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Classification gives one label per <em>image</em>; detection draws a box per
        <em> object</em>. Segmentation goes all the way down: it predicts a class for
        every single <strong>pixel</strong>, so the output is a mask the same size as
        the input.
      </p>
      <p>
        Because the prediction is per-pixel, you grade it by how well the predicted mask
        <em> overlaps</em> the ground-truth mask. The <strong>Dice coefficient</strong>{" "}
        <code>2·TP / (2·TP + FP + FN)</code> and the closely related{" "}
        <strong>IoU</strong> <code>TP / (TP + FP + FN)</code> both reward overlap and
        punish the two ways to be wrong: false alarms and misses.
      </p>
      <p>
        The threshold here turns soft probabilities into a hard mask — exactly the knob
        that trades recall (catch every object pixel) against precision (don&apos;t paint
        the background).
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
