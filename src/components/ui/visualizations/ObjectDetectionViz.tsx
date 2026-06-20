"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

type Box = { x: number; y: number; w: number; h: number; score: number };

// Deterministic scene: two ground-truth objects, each with a cluster of
// redundant predicted boxes, plus one low-confidence background false positive.
const GT: Box[] = [
  { x: 40, y: 110, w: 120, h: 78, score: 1 }, // "car"
  { x: 232, y: 60, w: 56, h: 124, score: 1 }, // "person"
];

const PRED: Box[] = [
  { x: 40, y: 110, w: 120, h: 78, score: 0.92 },
  { x: 33, y: 116, w: 124, h: 74, score: 0.81 },
  { x: 50, y: 104, w: 112, h: 80, score: 0.7 },
  { x: 24, y: 120, w: 132, h: 70, score: 0.56 },
  { x: 232, y: 60, w: 56, h: 124, score: 0.88 },
  { x: 226, y: 66, w: 60, h: 120, score: 0.69 },
  { x: 238, y: 54, w: 52, h: 128, score: 0.52 },
  { x: 176, y: 150, w: 52, h: 40, score: 0.41 }, // background false positive
];

function iou(a: Box, b: Box) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union <= 0 ? 0 : inter / union;
}

function runNms(boxes: Box[], nmsIoU: number) {
  const sorted = [...boxes].sort((p, q) => q.score - p.score);
  const kept: Box[] = [];
  const suppressed: Box[] = [];
  for (const b of sorted) {
    if (kept.some((k) => iou(k, b) >= nmsIoU)) suppressed.push(b);
    else kept.push(b);
  }
  return { kept, suppressed };
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

export default function ObjectDetectionViz() {
  const [conf, setConf] = useState(0.5);
  const [nmsIoU, setNmsIoU] = useState(0.5);

  const passConf = useMemo(() => PRED.filter((b) => b.score >= conf), [conf]);
  const { kept, suppressed } = useMemo(
    () => runNms(passConf, nmsIoU),
    [passConf, nmsIoU],
  );

  const W = 340;
  const H = 220;

  const rect = (
    b: Box,
    stroke: string,
    opts: { dash?: boolean; opacity?: number; label?: string } = {},
  ) => (
    <g key={`${b.x}-${b.y}-${b.score}`} opacity={opts.opacity ?? 1}>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={opts.dash ? "5 3" : undefined}
      />
      {opts.label && (
        <text x={b.x + 2} y={b.y - 3} fontSize={10} fontFamily="monospace" fill={stroke}>
          {opts.label}
        </text>
      )}
    </g>
  );

  const canvas = (
    <div
      role="img"
      aria-label="Object Detection Anchor Boxes and Non-Maximum Suppression"
      className="flex flex-col gap-3 p-4 font-sans"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true">
        <rect x={0} y={0} width={W} height={H} fill={COLORS.bg} />
        {/* ground truth */}
        {GT.map((b) => rect(b, COLORS.muted, { dash: true }))}
        {/* suppressed predictions (faint) */}
        {suppressed.map((b) => rect(b, COLORS.grid, { opacity: 0.9 }))}
        {/* kept predictions (solid, scored) */}
        {kept.map((b) => rect(b, COLORS.cyan, { label: b.score.toFixed(2) }))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 border-2 border-dashed" style={{ borderColor: COLORS.muted }} /> ground truth
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 border-2" style={{ borderColor: COLORS.cyan }} /> kept detection
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 border-2" style={{ borderColor: COLORS.grid }} /> suppressed
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Raw boxes" value={String(PRED.length)} />
        <Stat label="Pass confidence" value={String(passConf.length)} />
        <Stat label="After NMS" value={String(kept.length)} />
      </div>
    </div>
  );

  const slider = (
    label: string,
    aria: string,
    value: number,
    set: (n: number) => void,
    min: number,
    max: number,
  ) => (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={0.05}
          value={value}
          aria-label={aria}
          onChange={(e) => set(Number(e.target.value))}
          className="w-40"
        />
        <span className="w-10 text-right font-mono text-[13px] font-bold text-on-surface">
          {value.toFixed(2)}
        </span>
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3">
      {slider("Confidence τ", "Confidence threshold", conf, setConf, 0.3, 0.95)}
      {slider("NMS IoU", "Non-maximum suppression IoU threshold", nmsIoU, setNmsIoU, 0.1, 0.9)}
    </div>
  );

  const caption =
    kept.length > GT.length
      ? `${kept.length} boxes survive — more than the ${GT.length} real objects. A high NMS IoU (${nmsIoU.toFixed(2)}) lets near-duplicate boxes through; lower it to merge each cluster into one detection.`
      : kept.length < GT.length
        ? `Only ${kept.length} detection(s) remain: the confidence threshold ${conf.toFixed(2)} is high enough to drop a real object. Lower it to recover the miss.`
        : `Clean result: ${kept.length} detections for ${GT.length} objects. Confidence ${conf.toFixed(2)} drops the weak background box and NMS at IoU ${nmsIoU.toFixed(2)} collapses each redundant cluster to one box.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A detector tiles the image with anchor boxes and scores each one, so every
        real object (dashed) ends up wrapped in a <em>cluster</em> of overlapping,
        redundant predictions — the raw output is far messier than the truth.
      </p>
      <p>
        Two knobs clean it up. The <strong>confidence threshold</strong> drops
        low-scoring boxes (including spurious background detections). Then{" "}
        <strong>non-maximum suppression</strong> walks the survivors from highest
        score down, keeping each box and deleting any later box that overlaps it
        by more than the NMS IoU — so each cluster collapses to its single best
        box.
      </p>
      <p>
        The trade-off is real: too high a confidence threshold misses objects; too
        high an NMS IoU leaves duplicates; too low an NMS IoU can merge two genuine
        nearby objects into one. Set-prediction detectors (DETR) avoid these knobs
        by training to emit a duplicate-free set directly.
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
