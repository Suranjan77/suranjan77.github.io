"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  Vector,
  MiniStat,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

const plot = { left: 54, top: 44, right: 294, width: 240, bottom: 320, height: 276 };

const scaleX = (val: number) => plot.left + (val / 10) * plot.width;
const scaleY = (val: number) => plot.bottom - (val / 10) * plot.height;
const invertX = (px: number) => ((px - plot.left) / plot.width) * 10;
const invertY = (py: number) => ((plot.bottom - py) / plot.height) * 10;

export default function GenerativeViz() {
  const [zPoint, setZPoint] = useState({ x: 5.0, y: 5.0 });
  const [zStart, setZStart] = useState({ x: 3.0, y: 3.0 });
  const [zEnd, setZEnd] = useState({ x: 7.0, y: 7.0 });

  const [mode, setMode] = useState<"single" | "interpolate">("single");
  const [isInterpolating, setIsInterpolating] = useState(false);
  const [interpProgress, setInterpProgress] = useState(0); // 0 to 1

  const animationRef = useRef<number | null>(null);

  const handlePlotClick = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (
      px >= plot.left &&
      px <= plot.right &&
      py >= plot.top &&
      py <= plot.bottom
    ) {
      const zX = Math.max(0.2, Math.min(9.8, invertX(px)));
      const zY = Math.max(0.2, Math.min(9.8, invertY(py)));

      if (mode === "single") {
        setZPoint({ x: zX, y: zY });
      } else {
        // Toggle setting start vs end point
        if (Math.hypot(zX - zStart.x, zY - zStart.y) <= Math.hypot(zX - zEnd.x, zY - zEnd.y)) {
          setZStart({ x: zX, y: zY });
        } else {
          setZEnd({ x: zX, y: zY });
        }
      }
    }
  };

  const handleInterpolate = () => {
    if (isInterpolating) return;
    setIsInterpolating(true);
    setInterpProgress(0);
  };

  // Interpolation step loop
  useEffect(() => {
    if (isInterpolating) {
      let lastTime = Date.now();
      const step = () => {
        const now = Date.now();
        const delta = now - lastTime;
        lastTime = now;

        setInterpProgress((prev) => {
          const next = prev + 0.015 * (delta / 16);
          if (next >= 1.0) {
            setIsInterpolating(false);
            setZPoint(zEnd);
            return 1.0;
          }
          // Update active zPoint to interpolated coordinates
          setZPoint({
            x: zStart.x + next * (zEnd.x - zStart.x),
            y: zStart.y + next * (zEnd.y - zStart.y),
          });
          return next;
        });

        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isInterpolating, zStart, zEnd]);

  // Math: derive generated shape based on zPoint
  const densityCenter = { x: 5.0, y: 5.0 };
  const distFromCenter = Math.hypot(zPoint.x - densityCenter.x, zPoint.y - densityCenter.y);
  
  // If dist > 3, it becomes blurry/noisy (out of manifold)
  const isOutOfManifold = distFromCenter > 3.0;
  const blurVal = isOutOfManifold ? (distFromCenter - 3.0) * 2.8 : 0;
  const opacityVal = Math.max(0.2, 1.0 - distFromCenter / 7.0);

  // Math for Rose Curve shape: r = cos(k * theta)
  // Number of petals depends on zPoint.x
  const kPetals = Math.max(2, Math.round(zPoint.x));
  // Scale of shape depends on zPoint.y
  const scale = 20 + zPoint.y * 7;

  // Generate shape path coordinates centered at right plot center (470, 180)
  const centerX = 470;
  const centerY = 180;
  const points: string[] = [];
  for (let theta = 0; theta <= Math.PI * 2 + 0.05; theta += 0.05) {
    const r = Math.sin(kPetals * theta) * scale;
    const x = centerX + r * Math.cos(theta);
    const y = centerY + r * Math.sin(theta);
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  const shapePath = "M " + points.join(" L ");

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Generative Models Latent Space Walk"
            onPointerDown={handlePlotClick}
          >
            <defs>
              <filter id="generative-blur">
                <feGaussianBlur stdDeviation={blurVal} />
              </filter>
            </defs>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* LEFT PLOT: Latent Space Map */}
            <g>
              <text x={plot.left + plot.width / 2} y={plot.top - 14} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>2D LATENT SPACE (z)</text>
              
              {/* Grid ticks */}
              {ticks.map((tick) => (
                <g key={tick}>
                  <line x1={scaleX(tick)} x2={scaleX(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
                  <line x1={plot.left} x2={plot.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke={COLORS.grid} strokeWidth={1} />
                </g>
              ))}

              {/* Density Manifold Contours (concentric circles around center) */}
              <circle cx={scaleX(5.0)} cy={scaleY(5.0)} r={scaleX(8.0) - scaleX(5.0)} fill="none" stroke={COLORS.cyan} strokeWidth={1.0} strokeDasharray="3 3" opacity={0.3} />
              <circle cx={scaleX(5.0)} cy={scaleY(5.0)} r={scaleX(6.5) - scaleX(5.0)} fill="none" stroke={COLORS.cyan} strokeWidth={1.5} opacity={0.5} />
              <circle cx={scaleX(5.0)} cy={scaleY(5.0)} r={scaleX(5.0) - scaleX(5.0)} fill={COLORS.cyan} fillOpacity={0.06} stroke={COLORS.cyan} strokeWidth={2} />
              <text x={scaleX(5.0)} y={scaleY(5.0) + 4} textAnchor="middle" fill={COLORS.cyan} fontSize={8} fontWeight={900} opacity={0.7}>MANIFOLD REGION</text>

              {/* Axes */}
              <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={plot.right + 8} y={plot.bottom + 4} fill={COLORS.muted} fontSize={9} fontWeight={700}>z1</text>
              <text x={plot.left - 8} y={plot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={9} fontWeight={700}>z2</text>

              {/* Single Point Mode representation */}
              {mode === "single" && (
                <g>
                  <circle cx={scaleX(zPoint.x)} cy={scaleY(zPoint.y)} r={8} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1.5} />
                  <circle cx={scaleX(zPoint.x)} cy={scaleY(zPoint.y)} r={2} fill={COLORS.bg} />
                </g>
              )}

              {/* Interpolation Mode representation */}
              {mode === "interpolate" && (
                <g>
                  {/* Interpolation dashed path */}
                  <line
                    x1={scaleX(zStart.x)}
                    y1={scaleY(zStart.y)}
                    x2={scaleX(zEnd.x)}
                    y2={scaleY(zEnd.y)}
                    stroke={COLORS.yellow}
                    strokeWidth={2.5}
                    strokeDasharray="4 3"
                    opacity={0.75}
                  />

                  {/* Start Point */}
                  <circle cx={scaleX(zStart.x)} cy={scaleY(zStart.y)} r={7} fill={COLORS.cyan} stroke={COLORS.bg} strokeWidth={1.5} />
                  <text x={scaleX(zStart.x)} y={scaleY(zStart.y) - 10} textAnchor="middle" fill={COLORS.cyan} fontSize={8} fontWeight={800}>z_start</text>

                  {/* End Point */}
                  <circle cx={scaleX(zEnd.x)} cy={scaleY(zEnd.y)} r={7} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={1.5} />
                  <text x={scaleX(zEnd.x)} y={scaleY(zEnd.y) - 10} textAnchor="middle" fill={COLORS.pink} fontSize={8} fontWeight={800}>z_end</text>

                  {/* Interp walking progress dot */}
                  <circle cx={scaleX(zPoint.x)} cy={scaleY(zPoint.y)} r={9} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2} />
                  <circle cx={scaleX(zPoint.x)} cy={scaleY(zPoint.y)} r={2.5} fill={COLORS.bg} />
                </g>
              )}
            </g>

            {/* RIGHT PLOT: Generated Output Frame */}
            <g>
              <rect x={340} y={plot.top} width={250} height={plot.height} fill="none" stroke={COLORS.border} strokeDasharray="3 3" />
              <text x={350} y={plot.top + 16} fill={COLORS.muted} fontSize={9} fontWeight={800}>GENERATED MANIFOLD SHAPE</text>

              {/* Shaded Shape with Gaussian Blur Filter applied */}
              <g filter="url(#generative-blur)">
                <path
                  d={shapePath}
                  fill={isOutOfManifold ? COLORS.pink : COLORS.cyan}
                  fillOpacity={opacityVal * 0.4}
                  stroke={isOutOfManifold ? COLORS.pink : COLORS.cyan}
                  strokeWidth={2.5}
                  opacity={opacityVal}
                />
              </g>

              {/* Status Indicator text overlays */}
              {isOutOfManifold ? (
                <g>
                  <text x={470} y={300} textAnchor="middle" fill={COLORS.pink} fontSize={10} fontWeight={900} className="animate-pulse">
                    ⚠️ OUT OF MANIFOLD (BLURRY NOISE)
                  </text>
                </g>
              ) : (
                <text x={470} y={300} textAnchor="middle" fill={COLORS.cyan} fontSize={10} fontWeight={800}>
                  ✓ HIGH DENSITY MANIFOLD (CRISP)
                </text>
              )}
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Latent Sandbox</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {(["single", "interpolate"] as const).map((mKey) => (
              <button
                key={mKey}
                onClick={() => {
                  setMode(mKey);
                  setIsInterpolating(false);
                }}
                className={`py-2 text-[9px] font-bold uppercase tracking-wider cursor-pointer border ${
                  mode === mKey
                    ? "bg-primary border-primary text-on-primary"
                    : "bg-surface hover:bg-surface-container border-outline text-on-surface-variant"
                }`}
              >
                {mKey === "single" ? "Single Walk" : "Interpolation"}
              </button>
            ))}
          </div>

          {mode === "interpolate" ? (
            <button
              onClick={handleInterpolate}
              disabled={isInterpolating}
              className="w-full flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer mb-2 text-[10px]"
            >
              RUN INTERPOLATION WALKER
            </button>
          ) : (
            <div className="bg-surface-container p-2.5 border border-outline space-y-1.5 text-xs mb-3">
              <div className="flex justify-between">
                <span>Latent Coordinate z:</span>
                <span className="font-bold text-primary">({zPoint.x.toFixed(2)}, {zPoint.y.toFixed(2)})</span>
              </div>
              <div className="flex justify-between">
                <span>Petal Parameter (z1):</span>
                <span className="font-bold">{kPetals} petals</span>
              </div>
              <div className="flex justify-between">
                <span>Scale Parameter (z2):</span>
                <span className="font-bold">{scale.toFixed(1)}px</span>
              </div>
            </div>
          )}

          <div className="mt-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline font-sans">
            <p className="font-bold mb-1 text-primary">Interactivity pedagogy:</p>
            1. Click inside the left box to change latent variables. <br />
            2. Walking **outside** the central manifold area reduces data density, triggering Gaussian blur in outputs.
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Generative models (like GANs and VAEs) map high-dimensional complex datasets onto continuous, lower-dimensional **Latent Spaces**. Points outside the learned training distribution boundary (outside the manifold) produce blurred and noisy outputs.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
