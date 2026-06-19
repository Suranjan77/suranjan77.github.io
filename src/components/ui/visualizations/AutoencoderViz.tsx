"use client";

import React, { useMemo, useRef, useState } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 400;
const N = 14; // grid size
const cell = 9;

// A recognizable smiley so degradation is meaningful (not an abstract checker).
const SMILEY = [
  "..............",
  "..............",
  "...##....##...",
  "...##....##...",
  "..............",
  "..............",
  ".#..........#.",
  ".#..........#.",
  "..#........#..",
  "...#......#...",
  "....######....",
  "..............",
  "..............",
  "..............",
];
const clean: number[][] = SMILEY.map((row) => row.split("").map((c) => (c === "#" ? 1 : 0)));

// deterministic per-pixel pseudo-random in [0,1)
const hash = (r: number, c: number) => {
  const s = Math.sin(r * 127.1 + c * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const left = { x: 40, y: 120 };
const right = { x: W - 40 - N * cell, y: 120 };
const mx = W / 2;

export default function AutoencoderViz() {
  const [noise, setNoise] = useState(0.18); // 0..0.4
  const [bottleneck, setBottleneck] = useState(3); // 1..6 latent numbers
  const dragRef = useRef(false);

  // noisy input = clean with each pixel flipped if hash < noise
  const noisy = useMemo(
    () => clean.map((row, r) => row.map((v, c) => (hash(r, c) < noise ? 1 - v : v))),
    [noise],
  );

  // The bottleneck acts as a low-pass filter: a tight code forces abstraction
  // (more smoothing → drops noise but risks losing fine features); a wide code
  // has the capacity to pass the noise straight through.
  const smoothing = bottleneck <= 2 ? 2 : bottleneck <= 4 ? 1 : 0;
  const recon = useMemo(() => {
    if (smoothing === 0) return noisy;
    const out: number[][] = [];
    for (let r = 0; r < N; r++) {
      out[r] = [];
      for (let c = 0; c < N; c++) {
        let on = 0;
        let total = 0;
        for (let dr = -smoothing; dr <= smoothing; dr++) {
          for (let dc = -smoothing; dc <= smoothing; dc++) {
            const rr = r + dr;
            const cc = c + dc;
            if (rr >= 0 && rr < N && cc >= 0 && cc < N) {
              total++;
              on += noisy[rr][cc];
            }
          }
        }
        out[r][c] = on / total >= 0.5 ? 1 : 0;
      }
    }
    return out;
  }, [noisy, smoothing]);

  const reconError = useMemo(() => {
    let wrong = 0;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (recon[r][c] !== clean[r][c]) wrong++;
    return Math.round((wrong / (N * N)) * 100);
  }, [recon]);
  const noisyError = Math.round(
    (noisy.flat().reduce((a, v, i) => a + (v !== clean[Math.floor(i / N)][i % N] ? 1 : 0), 0) / (N * N)) * 100,
  );

  const setFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const svg = e.currentTarget;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    const half = Math.abs(p.x - mx);
    const b = Math.round(1 + (Math.min(60, Math.max(8, half)) - 8) / ((60 - 8) / 5)); // 1..6
    setBottleneck(Math.max(1, Math.min(6, b)));
  };

  const renderGrid = (g: number[][], ox: number, oy: number, color: string) =>
    g.map((row, r) =>
      row.map((v, c) =>
        v ? (
          <rect key={`${ox}-${r}-${c}`} x={ox + c * cell} y={oy + r * cell} width={cell - 1} height={cell - 1} fill={color} />
        ) : null,
      ),
    );

  const half = 8 + ((bottleneck - 1) / 5) * 52; // bottleneck visual half-width

  const caption =
    smoothing === 0
      ? `The bottleneck is wide (${bottleneck} numbers) — it has enough capacity to pass the speckle straight through, so the reconstruction is just as noisy as the input (${reconError}% wrong). A roomy code does not denoise.`
      : smoothing === 1
        ? `At ${bottleneck} latent numbers the code is too small to store the random speckle, so the decoder rebuilds only the real smiley: the output is clean (${reconError}% wrong) even though the input is ${noisyError}% corrupted. That is the whole trick.`
        : `Squeezed to just ${bottleneck} number${bottleneck > 1 ? "s" : ""}, the code is so tight it abstracts away real detail too — the eyes blur into the face and error climbs back to ${reconError}%. Over-compression loses signal, not just noise.`;

  const canvas = (
    <svg
      className="block h-auto w-full touch-none"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Autoencoder Bottleneck Compression"
      onPointerDown={(e) => {
        dragRef.current = true;
        try {
          (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
        } catch {
          /* not all environments support pointer capture */
        }
        setFromPointer(e);
      }}
      onPointerMove={setFromPointer}
      onPointerUp={(e) => {
        dragRef.current = false;
        try {
          (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }}
    >
      <title>Autoencoder Bottleneck Compression</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* hourglass encoder/decoder */}
      <path d={`M ${left.x + N * cell} ${60} L ${mx - half} 170 L ${mx - half} 230 L ${left.x + N * cell} ${340} Z`} fill={COLORS.cyan} fillOpacity={0.06} stroke={COLORS.border} />
      <path d={`M ${right.x} ${60} L ${mx + half} 170 L ${mx + half} 230 L ${right.x} ${340} Z`} fill={COLORS.pink} fillOpacity={0.06} stroke={COLORS.border} />
      <text x={(left.x + N * cell + mx) / 2} y={206} textAnchor="middle" fill={COLORS.cyan} fontSize={11} fontWeight={800}>encode</text>
      <text x={(right.x + mx) / 2} y={206} textAnchor="middle" fill={COLORS.pink} fontSize={11} fontWeight={800}>decode</text>

      {/* bottleneck latent units */}
      <line x1={mx - half} y1={150} x2={mx - half} y2={250} stroke={COLORS.yellow} strokeWidth={4} />
      <line x1={mx + half} y1={150} x2={mx + half} y2={250} stroke={COLORS.yellow} strokeWidth={4} />
      {Array.from({ length: bottleneck }).map((_, i) => {
        const y = 200 + (i - (bottleneck - 1) / 2) * 16;
        return <circle key={i} cx={mx} cy={y} r={4.5} fill={COLORS.yellow} />;
      })}
      <text x={mx} y={138} textAnchor="middle" fill={COLORS.yellow} fontSize={11} fontWeight={900}>z ({bottleneck})</text>
      <text x={mx} y={272} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700}>drag to resize</text>

      {/* input (noisy) */}
      <text x={left.x + (N * cell) / 2} y={left.y - 12} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={800}>INPUT (noisy)</text>
      <rect x={left.x - 2} y={left.y - 2} width={N * cell + 4} height={N * cell + 4} fill="none" stroke={COLORS.border} />
      {renderGrid(noisy, left.x, left.y, COLORS.cyan)}

      {/* reconstruction */}
      <text x={right.x + (N * cell) / 2} y={right.y - 12} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={800}>RECONSTRUCTION</text>
      <rect x={right.x - 2} y={right.y - 2} width={N * cell + 4} height={N * cell + 4} fill="none" stroke={COLORS.border} />
      {renderGrid(recon, right.x, right.y, COLORS.pink)}
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <label htmlFor="ae-noise" className="flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>Input noise</span>
          <span className="text-on-surface">{Math.round(noise * 100)}%</span>
        </label>
        <input id="ae-noise" aria-label="Input noise" type="range" min={0} max={0.4} step={0.02} value={noise} onChange={(e) => setNoise(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
        <label htmlFor="ae-bottleneck" className="mt-1 flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>Bottleneck (latent numbers)</span>
          <span className="text-on-surface">{bottleneck}</span>
        </label>
        <input id="ae-bottleneck" aria-label="Bottleneck size" type="range" min={1} max={6} step={1} value={bottleneck} onChange={(e) => setBottleneck(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
      </div>

      <div className="flex min-w-[200px] flex-col justify-center gap-2 border border-outline bg-surface p-3 font-mono text-[12px]">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wide text-on-surface-variant">Input error</span>
          <span className="font-bold" style={{ color: COLORS.cyan }}>{noisyError}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wide text-on-surface-variant">Reconstruction error</span>
          <span data-testid="ae-recon-error" className="text-base font-bold" style={{ color: reconError <= noisyError ? COLORS.green : COLORS.pink }}>
            {reconError}%
          </span>
        </div>
        <p className="border-t border-outline pt-2 font-sans text-[11px] leading-snug text-on-surface-variant">
          {reconError < noisyError
            ? "Output is cleaner than the input — the bottleneck denoised it."
            : "Output is no cleaner than the input."}
        </p>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        An <strong>autoencoder</strong> squeezes its input down to a handful of latent numbers (the{" "}
        <strong>code</strong> z) through an <strong>encoder</strong>, then a <strong>decoder</strong>{" "}
        rebuilds the input from just that code. Training pushes the reconstruction to match the
        original.
      </p>
      <p>
        Because the code is tiny, the network cannot afford to memorize everything — it must keep
        only the input&apos;s essential structure. Feed it a <strong>noisy</strong> image and the
        bottleneck has no room for the random speckle, so the decoder hands back the clean signal.
        That is a <strong>denoising autoencoder</strong>.
      </p>
      <p>
        The same squeeze is why autoencoders power compression, representation learning, and anomaly
        detection — but over-tighten it and you lose real detail along with the noise.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
