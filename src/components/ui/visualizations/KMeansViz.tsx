"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
  StepIndicator,
  NarrativeControls,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 338 };

const scaleX = (val: number) => plot.left + (val / 10) * (plot.right - plot.left);
const scaleY = (val: number) => plot.bottom - (val / 10) * (plot.bottom - plot.top);

const points = [
  { x: 1.8, y: 2.8 },
  { x: 2.2, y: 4.1 },
  { x: 3.0, y: 2.2 },
  { x: 3.5, y: 4.5 },
  { x: 6.8, y: 7.2 },
  { x: 7.2, y: 5.8 },
  { x: 8.1, y: 8.5 },
  { x: 8.5, y: 6.6 },
  { x: 4.5, y: 5.0 }, // middle point
  { x: 5.2, y: 3.2 }, // middle point 2
];

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
}

export default function KMeansViz() {
  const [c1, setC1] = useState({ x: 2.5, y: 8.0 });
  const [c2, setC2] = useState({ x: 7.5, y: 2.0 });
  const [phase, setPhase] = useState<"unassigned" | "assign" | "move">("unassigned");
  const [iteration, setIteration] = useState(0);
  const [assignments, setAssignments] = useState<number[]>(Array(points.length).fill(-1));
  const [trail1, setTrail1] = useState<{ x: number; y: number }[]>([{ x: 2.5, y: 8.0 }]);
  const [trail2, setTrail2] = useState<{ x: number; y: number }[]>([{ x: 7.5, y: 2.0 }]);
  const [converged, setConverged] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = ["1. Assign territory", "2. Move Centroids", "3. Converge"];
  const currentStep = phase === "unassigned" ? 0 : phase === "assign" ? 0 : phase === "move" ? 1 : 2;

  // Run assignment step
  const runAssign = () => {
    const nextAssignments = points.map((p) => {
      const d1 = Math.hypot(p.x - c1.x, p.y - c1.y);
      const d2 = Math.hypot(p.x - c2.x, p.y - c2.y);
      return d1 <= d2 ? 0 : 1;
    });

    setAssignments(nextAssignments);
    setPhase("assign");
  };

  // Run move step
  const runMove = () => {
    const pts1 = points.filter((_, idx) => assignments[idx] === 0);
    const pts2 = points.filter((_, idx) => assignments[idx] === 1);

    let nextC1 = { ...c1 };
    let nextC2 = { ...c2 };

    if (pts1.length > 0) {
      nextC1 = {
        x: pts1.reduce((sum, p) => sum + p.x, 0) / pts1.length,
        y: pts1.reduce((sum, p) => sum + p.y, 0) / pts1.length,
      };
    }
    if (pts2.length > 0) {
      nextC2 = {
        x: pts2.reduce((sum, p) => sum + p.x, 0) / pts2.length,
        y: pts2.reduce((sum, p) => sum + p.y, 0) / pts2.length,
      };
    }

    // Check convergence: did centroids move?
    const d1 = Math.hypot(nextC1.x - c1.x, nextC1.y - c1.y);
    const d2 = Math.hypot(nextC2.x - c2.x, nextC2.y - c2.y);

    if (d1 < 0.02 && d2 < 0.02 && phase !== "unassigned") {
      setConverged(true);
      setIsPlaying(false);
      spawnConfetti();
    } else {
      setC1(nextC1);
      setC2(nextC2);
      setTrail1((prev) => [...prev, nextC1]);
      setTrail2((prev) => [...prev, nextC2]);
      setIteration((prev) => prev + 1);
    }

    setPhase("move");
  };

  const handleStep = () => {
    if (converged) return;
    if (phase === "unassigned" || phase === "move") {
      runAssign();
    } else {
      runMove();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    
    // Reset to random centroid starting points
    setC1({ x: 2.0, y: 7.5 });
    setC2({ x: 8.0, y: 3.5 });
    setAssignments(Array(points.length).fill(-1));
    setTrail1([{ x: 2.0, y: 7.5 }]);
    setTrail2([{ x: 8.0, y: 3.5 }]);
    setPhase("unassigned");
    setIteration(0);
    setConverged(false);
  };

  // Play loop
  useEffect(() => {
    if (playTimerRef.current) clearInterval(playTimerRef.current);

    if (isPlaying && !converged) {
      playTimerRef.current = setInterval(() => {
        handleStep();
      }, 1200);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, phase, c1, c2, assignments, converged]);

  const spawnConfetti = () => {
    const newParticles: Particle[] = [];
    const colors = [COLORS.cyan, COLORS.pink, COLORS.yellow];
    // Explode from both centroids
    [c1, c2].forEach((c, idx) => {
      const cx = scaleX(c.x);
      const cy = scaleY(c.y);
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 80 + 30;
        newParticles.push({
          id: idx * 100 + i + Date.now(),
          x: cx,
          y: cy,
          tx: cx + Math.cos(angle) * speed,
          ty: cy + Math.sin(angle) * speed,
          color: colors[idx],
        });
      }
    });

    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 900);
  };

  // Voronoi claim grid
  const stepSize = 14;
  const voronoiGrid: React.ReactNode[] = [];
  if (phase === "assign" || phase === "move") {
    for (let px = plot.left; px < plot.right; px += stepSize) {
      for (let py = plot.top; py < plot.bottom; py += stepSize) {
        const gx = ((px + stepSize / 2 - plot.left) / (plot.right - plot.left)) * 10;
        const gy = ((plot.bottom - (py + stepSize / 2)) / (plot.bottom - plot.top)) * 10;

        const d1 = Math.hypot(gx - c1.x, gy - c1.y);
        const d2 = Math.hypot(gx - c2.x, gy - c2.y);

        const cluster = d1 <= d2 ? 0 : 1;
        voronoiGrid.push(
          <rect
            key={`v-${px}-${py}`}
            x={px}
            y={py}
            width={stepSize}
            height={stepSize}
            fill={cluster === 0 ? COLORS.cyan : COLORS.pink}
            fillOpacity={0.045}
          />
        );
      }
    }
  }

  const ticks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="K-Means Clustering Iterations">
            <title>K Means Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Claimed Voronoi background territories */}
            {voronoiGrid}

            {/* Grid Axes */}
            <g>
              {ticks.map((tick) => (
                <g key={tick}>
                  <line x1={scaleX(tick)} x2={scaleX(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
                  <line x1={plot.left} x2={plot.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke={COLORS.grid} strokeWidth={1} />
                </g>
              ))}
              <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
              <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
            </g>

            {/* Centroid trails */}
            {trail1.length > 1 && (
              <path
                d={"M " + trail1.map((p) => `${scaleX(p.x)} ${scaleY(p.y)}`).join(" L ")}
                fill="none"
                stroke={COLORS.cyan}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            )}
            {trail2.length > 1 && (
              <path
                d={"M " + trail2.map((p) => `${scaleX(p.x)} ${scaleY(p.y)}`).join(" L ")}
                fill="none"
                stroke={COLORS.pink}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            )}

            {/* Assignment spokes */}
            {assignments.length > 0 && phase !== "unassigned" && (
              <g>
                {points.map((p, idx) => {
                  const cIdx = assignments[idx];
                  if (cIdx === -1) return null;
                  const targetCentroid = cIdx === 0 ? c1 : c2;
                  return (
                    <motion.line
                      key={`spoke-${idx}-${iteration}-${phase}`}
                      x1={scaleX(p.x)}
                      y1={scaleY(p.y)}
                      x2={scaleX(targetCentroid.x)}
                      y2={scaleY(targetCentroid.y)}
                      stroke={COLORS.yellow}
                      strokeWidth={1.5}
                      strokeOpacity={0.65}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  );
                })}
              </g>
            )}

            {/* Data Points */}
            <g>
              {points.map((p, idx) => {
                const cIdx = assignments[idx];
                const color = cIdx === 0 ? COLORS.cyan : cIdx === 1 ? COLORS.pink : COLORS.border;
                return (
                  <AnimatedPointMark
                    key={`pt-${idx}`}
                    px={scaleX(p.x)}
                    py={scaleY(p.y)}
                    color={color}
                    r={5.5}
                  />
                );
              })}
            </g>

            {/* Centroids (Larger, styled markers) */}
            <g>
              <AnimatedPointMark px={scaleX(c1.x)} py={scaleY(c1.y)} color={COLORS.cyan} r={10} label="C1" />
              <AnimatedPointMark px={scaleX(c2.x)} py={scaleY(c2.y)} color={COLORS.pink} r={10} label="C2" />
            </g>

            {/* Confetti Explosion particles */}
            {particles.map((p) => (
              <motion.circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={3}
                fill={p.color}
                initial={{ cx: p.x, cy: p.y, opacity: 0.9 }}
                animate={{ cx: p.tx, cy: p.ty, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ))}

            {/* Convergence ring visual */}
            {converged && (
              <g>
                <PulseRing px={scaleX(c1.x)} py={scaleY(c1.y)} color={COLORS.cyan} maxRadius={35} />
                <PulseRing px={scaleX(c2.x)} py={scaleY(c2.y)} color={COLORS.pink} maxRadius={35} />
              </g>
            )}

            {/* SVG In-Plot Stats */}
            <g>
              {/* Iteration Counter */}
              <g transform="translate(440, 44)">
                <rect width={166} height={54} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={21} fill={COLORS.muted} fontSize={12} fontWeight={700}>OPTIMIZATION STEP</text>
                <text x={12} y={41} fill={COLORS.pink} fontSize={16} fontWeight={800}>
                  #{iteration} ({phase.toUpperCase()})
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Iterations</span>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <div className="my-3 min-h-[52px] text-[12px] text-on-surface-variant leading-relaxed bg-surface-container-low p-2 border border-outline font-sans">
            {converged ? (
              <span className="text-cyan font-bold block">CONVERGED: Centroids have stabilized.</span>
            ) : phase === "unassigned" ? (
              "Ready to begin. Click STEP or PLAY to assign territory."
            ) : phase === "assign" ? (
              "Territory claimed. Next step: Glide centroids to the mean of their respective colored cluster."
            ) : (
              "Centroids updated. Next step: Re-assign points based on proximity to new centroid locations."
            )}
          </div>

          <NarrativeControls
            isPlaying={isPlaying}
            onPlayToggle={() => {
              if (converged) return;
              setIsPlaying(!isPlaying);
            }}
            onStepForward={handleStep}
            onReset={handleReset}
            currentStep={phase === "unassigned" ? 0 : phase === "assign" ? 1 : 2}
            totalSteps={3}
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`K-Means Alternates: 1) Assignment (each point selects the closest centroid, carving space into Voronoi cells) and 2) Adjustment (each centroid glides to the center of mass of its claimed points).`} />
          </div>
        </div>
      </div>
    </div>
  );
}
