"use client";

import React, { useMemo, useState } from "react";
import { COLORS, VizShell } from "../visualizationPrimitives";

const COLS = 16;
const ROWS = 12;
const N = COLS * ROWS;
const T = 20; // number of diffusion steps

// --- Noise schedule (linear beta), precomputed cumulative bar-alpha_t ---
const ABAR: number[] = (() => {
  const out: number[] = [];
  let prod = 1;
  for (let t = 0; t < T; t++) {
    const beta = 1e-4 + (0.18 - 1e-4) * (t / (T - 1)); // exaggerated for visibility
    prod *= 1 - beta;
    out.push(prod);
  }
  return out;
})();

// Deterministic clean image x0 in [0,1]: an elliptical bright object on dark bg.
function x0At(r: number, c: number) {
  const dx = (c - 7.5) / 5;
  const dy = (r - 5.5) / 4;
  const d = dx * dx + dy * dy;
  if (d <= 0.55) return 0.9; // object body
  if (d <= 1) return 0.6; // halo
  return 0.12; // background
}

// Deterministic, fixed "noise field" in roughly [-1,1] — no Math.random so the
// scene is identical every render (required by the audit).
function noiseAt(r: number, c: number) {
  const h = Math.sin((r * 12.9898 + c * 78.233) * 1.17) * 43758.5453;
  return 2 * (h - Math.floor(h)) - 1;
}

const X0: number[] = [];
const NOISE: number[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    X0.push(x0At(r, c));
    NOISE.push(noiseAt(r, c));
  }
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function gray(v: number) {
  const x = Math.round(clamp01(v) * 255);
  return `rgb(${x}, ${x}, ${x})`;
}

export default function DiffusionViz() {
  // step index 0 = clean, T-1 = pure noise
  const [step, setStep] = useState(8);

  const abar = ABAR[step];
  const sigSqrt = Math.sqrt(abar);
  const noiseSqrt = Math.sqrt(1 - abar);

  // x_t = sqrt(abar) x0 + sqrt(1-abar) eps  (the closed-form forward sample)
  const xt = useMemo(
    () => X0.map((x0, i) => clamp01(sigSqrt * x0 + noiseSqrt * NOISE[i])),
    [sigSqrt, noiseSqrt],
  );

  // The model's single-step denoised estimate x_hat0. A perfect model recovers
  // x0 at every step; a real one is more confident at low noise. We blend the
  // true x0 toward the gray mean (0.5) as signal drops, so the estimate sharpens
  // as the slider moves toward the data — illustrating "denoising is easier near
  // the data, harder near pure noise."
  const conf = sigSqrt; // in [0,1]
  const x0hat = useMemo(
    () => X0.map((x0) => clamp01(conf * x0 + (1 - conf) * 0.5)),
    [conf],
  );

  const snr = noiseSqrt === 0 ? Infinity : (sigSqrt * sigSqrt) / (noiseSqrt * noiseSqrt);
  const snrLabel = Number.isFinite(snr) ? snr.toFixed(2) : "∞";

  const renderGrid = (label: string, data: number[]) => (
    <div className="flex flex-col gap-1">
      <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </div>
      <div
        className="grid gap-0 border border-outline"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {data.map((v, i) => (
          <div
            key={`${label}-${i}`}
            className="aspect-square"
            style={{ background: gray(v) }}
          />
        ))}
      </div>
    </div>
  );

  const canvas = (
    <div
      role="img"
      aria-label="Diffusion Forward Noising and Reverse Denoising"
      className="flex flex-col gap-4 p-4 font-sans"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {renderGrid(`Noisy image x_t  (step ${step} / ${T - 1})`, xt)}
        {renderGrid("Model's denoised estimate  x̂₀", x0hat)}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Signal kept √ᾱ" value={sigSqrt.toFixed(2)} />
        <Stat label="Noise √(1−ᾱ)" value={noiseSqrt.toFixed(2)} />
        <Stat label="ᾱ_t" value={abar.toFixed(3)} />
        <Stat label="SNR" value={snrLabel} />
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-1 flex-col gap-3 border border-outline bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Diffusion step t
        </div>
        <p className="font-sans text-[12px] text-on-surface-variant">
          Slide right to run the <strong>forward</strong> process (add noise);
          slide left to imagine the <strong>reverse</strong> process (denoise).
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={T - 1}
          step={1}
          value={step}
          aria-label="Diffusion step"
          onChange={(e) => setStep(Number(e.target.value))}
          className="w-44"
        />
        <span className="w-10 text-right font-mono text-[13px] font-bold text-on-surface">
          {step}
        </span>
      </div>
    </div>
  );

  const caption =
    step <= 2
      ? `Near t = 0 almost all signal survives (√ᾱ = ${sigSqrt.toFixed(2)}), so x_t is essentially the clean image and the model recovers x̂₀ easily.`
      : step >= T - 3
        ? `Near t = ${T - 1} the signal is gone (√ᾱ = ${sigSqrt.toFixed(2)}) — x_t is almost pure noise, exactly what sampling starts from, and a single-step estimate is necessarily vague.`
        : `At step ${step}, x_t mixes ${(sigSqrt * 100).toFixed(0)}% signal with ${(noiseSqrt * 100).toFixed(0)}% noise (SNR ${snrLabel}). Generation reverses this: start from noise on the right and walk left, removing a little noise each step.`;

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        The <strong>forward process</strong> gradually buries a clean image under
        Gaussian noise. Its closed form, <code>x_t = √ᾱ·x₀ + √(1−ᾱ)·ε</code>, lets
        you jump to any noise level in one step — the signal coefficient{" "}
        <code>√ᾱ</code> shrinks and the noise coefficient grows as you slide right.
      </p>
      <p>
        A neural network is trained to look at <code>x_t</code> and predict the{" "}
        <strong>noise that was added</strong>. From that it can reconstruct an
        estimate of the clean image, <code>x̂₀</code> (right panel). Notice the
        estimate is crisp when little noise was added and vague when the input is
        mostly noise — denoising is easy near the data and hard far from it.
      </p>
      <p>
        To <strong>generate</strong>, start from pure noise (the far right) and
        repeatedly take small reverse steps leftward. No real photo is hidden
        inside — the image is hallucinated from noise, guided only by what the
        network learned about how images dissolve.
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
