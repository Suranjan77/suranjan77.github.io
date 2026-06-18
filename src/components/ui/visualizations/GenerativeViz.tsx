"use client";

import React, { useState, useEffect, useRef } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 440;

// Left: latent space. Right: the decoded face.
const plot = { left: 70, top: 70, width: 250, height: 300 };
const plotRight = plot.left + plot.width;
const plotBottom = plot.top + plot.height;

const scaleX = (val: number) => plot.left + (val / 10) * plot.width;
const scaleY = (val: number) => plotBottom - (val / 10) * plot.height;
const invertX = (px: number) => ((px - plot.left) / plot.width) * 10;
const invertY = (py: number) => ((plotBottom - py) / plot.height) * 10;

// A face decoded from a 2-D latent code: z1 controls the smile (frown <-> grin),
// z2 controls how wide the eyes are open (sleepy <-> surprised).
function Face({
  z1,
  z2,
  cx,
  cy,
  r,
}: {
  z1: number;
  z2: number;
  cx: number;
  cy: number;
  r: number;
}) {
  const smile = (z1 - 5) / 5; // -1 (frown) .. +1 (grin)
  const open = 0.35 + (z2 / 10) * 0.75; // eye openness
  const eyeY = cy - 0.22 * r;
  const eyeDX = 0.42 * r;
  const eyeRx = 0.13 * r;
  const eyeRy = 0.13 * r * open;
  const mouthY = cy + 0.34 * r;
  const mouthW = 0.46 * r;
  const ctrlY = mouthY + smile * 0.42 * r; // control point below = smile
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={COLORS.yellow} fillOpacity={0.28} stroke={COLORS.yellow} strokeWidth={2.5} />
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={cx + s * eyeDX} cy={eyeY} rx={eyeRx} ry={eyeRy} fill={COLORS.bg} stroke={COLORS.pink} strokeWidth={2} />
          <circle cx={cx + s * eyeDX} cy={eyeY} r={Math.max(1.5, eyeRy * 0.5)} fill={COLORS.pink} />
        </g>
      ))}
      <path
        d={`M ${cx - mouthW} ${mouthY} Q ${cx} ${ctrlY} ${cx + mouthW} ${mouthY}`}
        fill="none"
        stroke={COLORS.pink}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

function expressionWords(z1: number, z2: number) {
  const mouth = z1 > 6 ? "smiling" : z1 < 4 ? "frowning" : "neutral";
  const eyes = z2 > 6.5 ? "wide-eyed" : z2 < 3.5 ? "sleepy" : "calm";
  return `${eyes}, ${mouth}`;
}

const Z_START = { x: 2.0, y: 8.0 };
const Z_END = { x: 8.5, y: 2.5 };
const ticks = [0, 2.5, 5, 7.5, 10];

export default function GenerativeViz() {
  const [zPoint, setZPoint] = useState({ x: 5.0, y: 5.0 });
  const [mode, setMode] = useState<"single" | "interpolate">("single");
  const [isInterpolating, setIsInterpolating] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  // Map a pointer event to viewBox coordinates via the SVG CTM (works even
  // though the SVG scales to the full content width).
  const applyPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const c = pt.matrixTransform(ctm.inverse());
    if (c.x >= plot.left && c.x <= plotRight && c.y >= plot.top && c.y <= plotBottom) {
      setZPoint({
        x: Math.max(0.2, Math.min(9.8, invertX(c.x))),
        y: Math.max(0.2, Math.min(9.8, invertY(c.y))),
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (mode !== "single") return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not all environments support pointer capture */
    }
    draggingRef.current = true;
    applyPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    applyPointer(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handleInterpolate = () => {
    if (isInterpolating) return;
    setIsInterpolating(true);
    setProgress(0);
    setZPoint(Z_START);
  };

  useEffect(() => {
    if (!isInterpolating) return;
    let last = Date.now();
    const stepFn = () => {
      const now = Date.now();
      const delta = now - last;
      last = now;
      setProgress((prev) => {
        const next = prev + 0.012 * (delta / 16);
        if (next >= 1) {
          setIsInterpolating(false);
          setZPoint(Z_END);
          return 1;
        }
        setZPoint({
          x: Z_START.x + next * (Z_END.x - Z_START.x),
          y: Z_START.y + next * (Z_END.y - Z_START.y),
        });
        return next;
      });
      animationRef.current = requestAnimationFrame(stepFn);
    };
    animationRef.current = requestAnimationFrame(stepFn);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isInterpolating]);

  const faceCx = 520;
  const faceCy = 210;

  const caption =
    mode === "single"
      ? `The latent point (${zPoint.x.toFixed(1)}, ${zPoint.y.toFixed(1)}) decodes into this ${expressionWords(zPoint.x, zPoint.y)} face. Drag anywhere in the latent space — right for more smile, up for wider eyes — and every single point decodes to a plausible face.`
      : isInterpolating || progress > 0
        ? `Walking the straight line from one face to the other: the decoded face morphs smoothly through valid in-between faces. The latent space is continuous and meaningful — not a lookup table of memorised images.`
        : `Two latent codes decode to two different faces (the cyan and pink dots). Press “walk the latent line” and watch one face morph into the other.`;

  const canvas = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Generative Models Latent Space Walk"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`block h-auto w-full ${mode === "single" ? "cursor-pointer" : ""}`}
    >
      <title>Generative Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* LEFT: latent space */}
      <text x={plot.left} y={plot.top - 16} fill={COLORS.muted} fontSize={12} fontWeight={800}>
        LATENT SPACE (z)
      </text>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={scaleX(t)} x2={scaleX(t)} y1={plot.top} y2={plotBottom} stroke={COLORS.grid} strokeWidth={1} />
          <line x1={plot.left} x2={plotRight} y1={scaleY(t)} y2={scaleY(t)} stroke={COLORS.grid} strokeWidth={1} />
        </g>
      ))}
      <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plotBottom} stroke={COLORS.border} strokeWidth={1.5} />
      <line x1={plot.left} x2={plotRight} y1={plotBottom} y2={plotBottom} stroke={COLORS.border} strokeWidth={1.5} />
      <text x={plotRight + 6} y={plotBottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={700}>z1</text>
      <text x={plot.left - 6} y={plot.top - 4} textAnchor="end" fill={COLORS.muted} fontSize={12} fontWeight={700}>z2</text>

      {mode === "interpolate" && (
        <>
          <line x1={scaleX(Z_START.x)} y1={scaleY(Z_START.y)} x2={scaleX(Z_END.x)} y2={scaleY(Z_END.y)} stroke={COLORS.yellow} strokeWidth={2.5} strokeDasharray="4 3" opacity={0.8} />
          <circle cx={scaleX(Z_START.x)} cy={scaleY(Z_START.y)} r={6} fill={COLORS.cyan} stroke={COLORS.bg} strokeWidth={1.5} />
          <circle cx={scaleX(Z_END.x)} cy={scaleY(Z_END.y)} r={6} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={1.5} />
        </>
      )}

      {/* Current latent point */}
      <circle cx={scaleX(zPoint.x)} cy={scaleY(zPoint.y)} r={9} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2} />
      <circle cx={scaleX(zPoint.x)} cy={scaleY(zPoint.y)} r={2.5} fill={COLORS.bg} />

      {/* RIGHT: decoded sample */}
      <text x={faceCx} y={plot.top - 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>
        DECODED SAMPLE
      </text>
      <Face z1={zPoint.x} z2={zPoint.y} cx={faceCx} cy={faceCy} r={120} />
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Mode</span>
        <div className="flex gap-2">
          {(["single", "interpolate"] as const).map((m) => (
            <button
              aria-label={m === "single" ? "Single Walk" : "Interpolation"}
              key={m}
              onClick={() => {
                setMode(m);
                setIsInterpolating(false);
                setProgress(0);
              }}
              className={`px-3 py-2 text-[12px] font-bold uppercase tracking-wider cursor-pointer border ${
                mode === m
                  ? "bg-primary border-primary text-on-primary"
                  : "bg-surface hover:bg-surface-container border-outline text-on-surface-variant"
              }`}
            >
              {m === "single" ? "Single Walk" : "Interpolation"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        {mode === "single" ? (
          <>
            <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
              Latent code z
            </span>
            <span className="font-mono text-xl font-bold text-on-surface">
              ({zPoint.x.toFixed(2)}, {zPoint.y.toFixed(2)})
            </span>
            <span className="font-sans text-[12px] text-on-surface-variant">
              decodes to a {expressionWords(zPoint.x, zPoint.y)} face — click the latent space to move it
            </span>
          </>
        ) : (
          <>
            <button
              aria-label="RUN INTERPOLATION WALKER"
              onClick={handleInterpolate}
              disabled={isInterpolating}
              className="flex h-9 items-center justify-center border border-outline bg-surface-container px-4 font-mono text-[12px] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-outline-variant hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInterpolating ? "Walking…" : "Walk the latent line"}
            </button>
            <div className="h-2 w-full bg-surface-container">
              <div className="h-full" style={{ width: `${progress * 100}%`, backgroundColor: COLORS.yellow }} />
            </div>
          </>
        )}
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        A generative model learns to turn a small <strong>latent code</strong>{" "}
        into a full sample. Here a 2-D code decodes into a face: one axis bends
        the smile, the other opens the eyes.
      </p>
      <p>
        The magic is <strong>continuity</strong>: walk a straight line between
        two codes and the decoded face morphs smoothly through plausible
        in-between faces. The model has organised faces into a continuous space
        rather than memorising a fixed gallery — which is exactly why you can
        sample brand-new ones it never saw in training.
      </p>
    </div>
  );

  return (
    <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />
  );
}
