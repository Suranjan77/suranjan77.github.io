"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

type Precision = "fp16" | "int8" | "int4";

const W = 720;
const H = 220;
const barX = 60;
const barW = 600;
const barY = 70;
const barH = 52;

const GPUS = [
  { name: "RTX 4090", vram: 24 },
  { name: "A100", vram: 80 },
  { name: "8× A100", vram: 640 },
];

export default function AIInferenceViz() {
  const [params, setParams] = useState(8); // billions
  const [precision, setPrecision] = useState<Precision>("fp16");
  const [seq, setSeq] = useState(2048);
  const [batch, setBatch] = useState(8);
  const [gpuIdx, setGpuIdx] = useState(1);

  const bytes = precision === "fp16" ? 2 : precision === "int8" ? 1 : 0.5;
  const weightsGB = params * bytes;

  // KV cache scales with layers, hidden dim, precision, batch, sequence length
  const layers = params < 3 ? 24 : params > 30 ? 80 : 32;
  const hidden = params < 3 ? 2048 : params > 30 ? 8192 : 4096;
  const kvGB = (2 * layers * hidden * bytes * batch * seq) / 1024 ** 3;
  const totalGB = weightsGB + kvGB;

  const gpu = GPUS[gpuIdx];
  const fits = totalGB <= gpu.vram;

  const baseSpeed = 160;
  const throughput = baseSpeed * (1 / Math.pow(params, 0.7)) * (2 / bytes) * Math.sqrt(batch);

  const xmax = Math.max(gpu.vram * 1.2, totalGB * 1.05);
  const px = (gb: number) => (gb / xmax) * barW;
  const capX = barX + px(gpu.vram);

  const caption = fits
    ? `This setup needs ${totalGB.toFixed(0)} GB and fits inside the ${gpu.name}'s ${gpu.vram} GB. Notice the KV cache (${kvGB.toFixed(0)} GB) — it grows with every extra token of context and every request in the batch, so a long-context, high-batch server can be dominated by cache, not weights.`
    : `${totalGB.toFixed(0)} GB needed but only ${gpu.vram} GB available — OUT OF MEMORY. Inference is memory-bound: either shrink the weights (quantize to INT8/INT4), cut context or batch, or move to a bigger GPU. Try dropping precision and watch it fit.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="AI inference memory and throughput calculator">
      <title>AI inference memory and throughput calculator</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      <text x={barX} y={44} fill={COLORS.muted} fontSize={12} fontWeight={800}>GPU MEMORY (VRAM)</text>
      <text x={barX + barW} y={44} textAnchor="end" fill={fits ? COLORS.green : COLORS.pink} fontSize={13} fontWeight={900}>
        {totalGB.toFixed(0)} GB needed / {gpu.vram} GB {gpu.name}
      </text>

      {/* track */}
      <rect x={barX} y={barY} width={barW} height={barH} fill={COLORS.grid} fillOpacity={0.5} stroke={COLORS.border} />

      {/* weights segment */}
      <motion.rect x={barX} y={barY} height={barH} fill={COLORS.cyan} fillOpacity={0.85} initial={false} animate={{ width: px(weightsGB) }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
      {/* kv cache segment */}
      <motion.rect y={barY} height={barH} fill={COLORS.pink} fillOpacity={0.8} initial={false} animate={{ x: barX + px(weightsGB), width: px(kvGB) }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />

      {/* capacity line */}
      <line x1={capX} y1={barY - 12} x2={capX} y2={barY + barH + 12} stroke={fits ? COLORS.green : COLORS.pink} strokeWidth={2.5} strokeDasharray="5 4" />
      <text x={capX} y={barY - 16} textAnchor="middle" fill={fits ? COLORS.green : COLORS.pink} fontSize={10} fontWeight={800}>{gpu.vram} GB limit</text>

      {/* OOM overlay */}
      {!fits && (
        <text x={barX + barW / 2} y={barY + barH / 2 + 5} textAnchor="middle" fill={COLORS.pink} fontSize={18} fontWeight={900} stroke={COLORS.bg} strokeWidth={4} paintOrder="stroke">
          OUT OF MEMORY
        </text>
      )}

      {/* legend */}
      <g transform={`translate(${barX}, ${barY + barH + 30})`}>
        <rect x={0} y={-9} width={12} height={12} fill={COLORS.cyan} />
        <text x={18} y={1} fill={COLORS.muted} fontSize={11} fontWeight={700}>weights {weightsGB.toFixed(0)} GB ({precision})</text>
        <rect x={220} y={-9} width={12} height={12} fill={COLORS.pink} />
        <text x={238} y={1} fill={COLORS.muted} fontSize={11} fontWeight={700}>KV cache {kvGB.toFixed(0)} GB (context × batch)</text>
      </g>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="inf-params" className="w-24 font-mono text-[11px] font-bold uppercase text-primary">Params</label>
          <input id="inf-params" aria-label="Model parameters in billions" type="range" min={1} max={70} step={1} value={params} onChange={(e) => setParams(Number(e.target.value))} className="flex-1 cursor-pointer accent-primary" />
          <span className="w-10 text-right font-mono text-[11px] font-bold text-on-surface">{params}B</span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="inf-seq" className="w-24 font-mono text-[11px] font-bold uppercase text-primary">Context</label>
          <input id="inf-seq" aria-label="Context length" type="range" min={512} max={8192} step={512} value={seq} onChange={(e) => setSeq(Number(e.target.value))} className="flex-1 cursor-pointer accent-primary" />
          <span className="w-10 text-right font-mono text-[11px] font-bold text-on-surface">{seq}</span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="inf-batch" className="w-24 font-mono text-[11px] font-bold uppercase text-primary">Batch</label>
          <input id="inf-batch" aria-label="Batch size" type="range" min={1} max={64} step={1} value={batch} onChange={(e) => setBatch(Number(e.target.value))} className="flex-1 cursor-pointer accent-primary" />
          <span className="w-10 text-right font-mono text-[11px] font-bold text-on-surface">{batch}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase text-on-surface-variant">Precision</span>
          {(["fp16", "int8", "int4"] as const).map((p) => (
            <button key={p} aria-label={`Precision ${p}`} aria-pressed={precision === p} onClick={() => setPrecision(p)} className={`border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${precision === p ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-[200px] flex-col justify-center gap-2 border border-outline bg-surface p-3 font-mono text-[12px]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold uppercase tracking-wide text-on-surface-variant">GPU</span>
          {GPUS.map((g, i) => (
            <button key={g.name} aria-label={`GPU ${g.name}`} aria-pressed={i === gpuIdx} onClick={() => setGpuIdx(i)} className={`border px-1.5 py-1 text-[10px] font-bold uppercase transition-colors ${i === gpuIdx ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"}`}>
              {g.vram}G
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-outline pt-2">
          <span className="uppercase tracking-wide text-on-surface-variant">memory</span>
          <span data-testid="inf-status" className="font-bold" style={{ color: fits ? COLORS.green : COLORS.pink }}>{fits ? "FITS" : "OUT OF MEMORY"}</span>
        </div>
        <div className="font-bold uppercase tracking-wide text-on-surface-variant">Serving Throughput</div>
        <div className="text-xl font-bold" style={{ color: COLORS.cyan }}>{throughput.toFixed(0)} <span className="text-[11px] text-on-surface-variant">tok/s</span></div>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Running a trained model (inference) is mostly a <strong>memory</strong> problem. Two things
        must fit in GPU VRAM: the <strong>weights</strong> (parameters × bytes-per-number) and the{" "}
        <strong>KV cache</strong> — the per-token attention state the model keeps for the whole
        conversation.
      </p>
      <p>
        Weights are fixed, but the KV cache grows <em>linearly</em> with context length and batch
        size, so long prompts and many concurrent users can make the cache larger than the model
        itself. Exceed the card&apos;s VRAM and inference simply <strong>won&apos;t run</strong>.
      </p>
      <p>
        The main lever is <strong>quantization</strong>: storing weights in INT8 or INT4 halves or
        quarters their footprint (and speeds things up), which is how big models are squeezed onto
        smaller GPUs. Batching trades latency for throughput.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
