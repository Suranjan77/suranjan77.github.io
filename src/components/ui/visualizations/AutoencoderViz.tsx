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

interface FlowParticle {
  id: number;
  progress: number; // 0 to 1
  pathIdx: number;
}

export default function AutoencoderViz() {
  const [bottleneckWidth, setBottleneckWidth] = useState(38); // ranges from 16 to 80
  const [isDragging, setIsDragging] = useState(false);
  const [particles, setParticles] = useState<FlowParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Drag handlers for the bottleneck width
  const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!isDragging) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgCoords = point.matrixTransform(svg.getScreenCTM()?.inverse());
    if (!svgCoords) return;

    // Center of bottleneck is x = 320. Width is 2 * |x - 320|
    const dist = Math.abs(svgCoords.x - 320);
    setBottleneckWidth(Math.max(16, Math.min(80, dist * 2)));
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // Derive parameters
  const compressionRatio = ((80 - bottleneckWidth) / 64) * 100; // higher compression is narrower bottleneck
  const blurVal = Math.max(0, (80 - bottleneckWidth) / 12); // stdDeviation for feGaussianBlur
  const noiseRate = Math.max(0, (80 - bottleneckWidth) / 80);

  // Particles animation loop
  useEffect(() => {
    let lastTime = Date.now();
    const particleSpeed = 0.005 + (bottleneckWidth / 80) * 0.015; // particles slow down when squeezed!

    const updateParticles = () => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      setParticles((prev) => {
        // Move existing particles
        let next = prev
          .map((p) => ({
            ...p,
            progress: p.progress + particleSpeed * (delta / 16),
          }))
          .filter((p) => p.progress < 1.0);

        // Spawn new particle with some probability
        const spawnChance = 0.04 * (bottleneckWidth / 40); // spawn less when narrow
        if (Math.random() < spawnChance && next.length < 15) {
          next.push({
            id: Date.now() + Math.random(),
            progress: 0,
            pathIdx: Math.floor(Math.random() * 3),
          });
        }

        return next;
      });

      animationFrameRef.current = requestAnimationFrame(updateParticles);
    };

    animationFrameRef.current = requestAnimationFrame(updateParticles);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [bottleneckWidth]);

  // SVG coordinates mapping for hourglass boundary
  // Left layer is at x = 110, Right is at x = 530, Middle is x = 320
  const topY = 90;
  const botY = 310;
  
  const lx = 140;
  const rx = 500;
  const mx = 320;

  // Path generators for particles
  const getParticleCoords = (p: FlowParticle) => {
    // 3 pathways through the hidden units
    const pathOffsets = [-36, 0, 36];
    const offset = pathOffsets[p.pathIdx];
    
    // interpolation path
    let px = lx + p.progress * (rx - lx);
    let py = 200;
    
    if (p.progress < 0.5) {
      // Input to bottleneck
      const t = p.progress / 0.5;
      py = 200 + offset * Math.sin(t * Math.PI / 2);
    } else {
      // Bottleneck to output
      const t = (p.progress - 0.5) / 0.5;
      py = 200 + offset * Math.cos(t * Math.PI / 2);
    }
    return { x: px, y: py };
  };

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Autoencoder Bottleneck Compression">
            <defs>
              <filter id="autoencoder-blur">
                <feGaussianBlur stdDeviation={blurVal} />
              </filter>
            </defs>
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Hourglass network background shape */}
            <path
              d={`M ${lx} ${topY} L ${mx - bottleneckWidth/2} 150 L ${mx - bottleneckWidth/2} 250 L ${lx} ${botY} Z`}
              fill="rgba(85,107,74,0.05)"
              stroke={COLORS.border}
              strokeWidth={1}
            />
            <path
              d={`M ${rx} ${topY} L ${mx + bottleneckWidth/2} 150 L ${mx + bottleneckWidth/2} 250 L ${rx} ${botY} Z`}
              fill="rgba(141,81,73,0.05)"
              stroke={COLORS.border}
              strokeWidth={1}
            />

            {/* Encoder and Decoder arrows */}
            <Vector x1={lx + 10} y1={200} x2={mx - bottleneckWidth/2 - 10} y2={200} color={COLORS.cyan} label="Encoder" />
            <Vector x1={mx + bottleneckWidth/2 + 10} y1={200} x2={rx - 10} y2={200} color={COLORS.pink} label="Decoder" />

            {/* Draggable Bottleneck boundaries */}
            <g
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="cursor-ew-resize"
            >
              {/* Left boundary line */}
              <line
                x1={mx - bottleneckWidth / 2}
                y1={140}
                x2={mx - bottleneckWidth / 2}
                y2={260}
                stroke={COLORS.yellow}
                strokeWidth={5}
              />
              {/* Right boundary line */}
              <line
                x1={mx + bottleneckWidth / 2}
                y1={140}
                x2={mx + bottleneckWidth / 2}
                y2={260}
                stroke={COLORS.yellow}
                strokeWidth={5}
              />
              {/* Central handle indicator */}
              <circle cx={mx} cy={200} r={bottleneckWidth / 2} fill={COLORS.yellow} fillOpacity={0.15} stroke={COLORS.yellow} strokeWidth={1} />
            </g>

            {/* Latent space units */}
            <g>
              <circle cx={mx} cy={164} r={6} fill={COLORS.yellow} />
              <circle cx={mx} cy={200} r={6} fill={COLORS.yellow} />
              <circle cx={mx} cy={236} r={6} fill={COLORS.yellow} />
              <text x={mx} y={134} textAnchor="middle" fill={COLORS.yellow} fontSize={9} fontWeight={900}>LATENT (z)</text>
            </g>

            {/* Input Grid (Perfect 4x4 Grid) */}
            <g transform="translate(48, 168)">
              <text x={28} y={-12} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={800}>INPUT (High Res)</text>
              {[0, 1, 2, 3].map((r) =>
                [0, 1, 2, 3].map((c) => (
                  <rect
                    key={`in-${r}-${c}`}
                    x={c * 15}
                    y={r * 15}
                    width={13}
                    height={13}
                    fill={(r + c) % 2 === 0 ? COLORS.cyan : COLORS.bg}
                    stroke={COLORS.border}
                    strokeWidth={0.5}
                  />
                ))
              )}
            </g>

            {/* Reconstruction Grid (Applying SVG Gaussian blur + noise) */}
            <g transform="translate(516, 168)">
              <text x={28} y={-12} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={800}>RECONSTRUCTION</text>
              <g filter="url(#autoencoder-blur)">
                {[0, 1, 2, 3].map((r) =>
                  [0, 1, 2, 3].map((c) => {
                    const isCheckered = (r + c) % 2 === 0;
                    // Introduce binary noise to emulate pixel error rates
                    const noise = Math.sin(r * 12.3 + c * 4.7 + bottleneckWidth) * 0.5 + 0.5 < noiseRate;
                    const fillVal = isCheckered !== noise ? COLORS.pink : COLORS.bg;
                    return (
                      <rect
                        key={`out-${r}-${c}`}
                        x={c * 15}
                        y={r * 15}
                        width={13}
                        height={13}
                        fill={fillVal}
                        stroke={COLORS.border}
                        strokeWidth={0.5}
                      />
                    );
                  })
                )}
              </g>
            </g>

            {/* Data flow particles */}
            <g>
              {particles.map((p) => {
                const coord = getParticleCoords(p);
                return (
                  <circle
                    key={p.id}
                    cx={coord.x}
                    cy={coord.y}
                    r={3.5}
                    fill={COLORS.yellow}
                    opacity={0.8}
                  />
                );
              })}
            </g>

            {/* Information mini stat boxes on SVG */}
            <g>
              <rect x={180} y={340} width={130} height={42} fill="rgba(250,248,242,0.85)" stroke={COLORS.border} rx={2} />
              <text x={192} y={354} fill={COLORS.muted} fontSize={8} fontWeight={700}>COMPRESSION RATIO</text>
              <text x={192} y={374} fill={COLORS.cyan} fontSize={14} fontWeight={900}>{compressionRatio.toFixed(0)}%</text>

              <rect x={330} y={340} width={130} height={42} fill="rgba(250,248,242,0.85)" stroke={COLORS.border} rx={2} />
              <text x={342} y={354} fill={COLORS.muted} fontSize={8} fontWeight={700}>RECONSTRUCTION ERROR</text>
              <text x={342} y={374} fill={COLORS.pink} fontSize={14} fontWeight={900}>{(noiseRate * 100).toFixed(0)}%</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Latent Squeeze</span>
          </div>

          <div className="mb-3 text-xs uppercase tracking-wide text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline font-sans">
            <p className="font-bold mb-1 text-primary">Direct Manipulation:</p>
            Drag the yellow <span className="text-yellow font-bold">bottleneck lines</span> in the center inward or outward. <br /><br />
            - A **tighter bottleneck** squeezes the latent space, increasing compression but degrading the reconstructed output.<br />
            - A **wider bottleneck** improves quality but reduces the compression ratio.
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Autoencoders consist of an **Encoder** that compresses high-dimensional inputs to a low-dimensional bottleneck (Latent Code $z$) and a **Decoder** that attempts to reconstruct the input. The bottleneck forces the model to learn the most essential underlying features.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
