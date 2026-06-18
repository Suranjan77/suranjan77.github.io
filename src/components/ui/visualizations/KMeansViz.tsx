"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
  StepIndicator,
  NarrativeControls,
  VizShell,
} from "../visualizationPrimitives";

const W = 660;
const H = 380;
const plot = { left: 60, top: 40, right: 624, bottom: 332 };

const scaleX = (v: number) => plot.left + (v / 10) * (plot.right - plot.left);
const scaleY = (v: number) => plot.bottom - (v / 10) * (plot.bottom - plot.top);

// display units
const spend = (y: number) => Math.round(y * 20); // £/month
const visits = (x: number) => Math.round(x * 1.2); // /month

// unlabelled customers: behaviour only, no segment given.
// Three natural groups: occasional, loyal regulars, VIP big-spenders.
const CUSTOMERS = [
  { x: 1.5, y: 2.0 },
  { x: 2.2, y: 1.4 },
  { x: 1.0, y: 3.0 },
  { x: 2.8, y: 2.2 },
  { x: 7.5, y: 3.5 },
  { x: 8.2, y: 4.6 },
  { x: 7.0, y: 5.0 },
  { x: 8.6, y: 3.2 },
  { x: 4.5, y: 8.0 },
  { x: 5.5, y: 7.2 },
  { x: 4.0, y: 8.8 },
  { x: 5.8, y: 8.4 },
];

const INIT = [
  { x: 3, y: 3 },
  { x: 7, y: 5 },
  { x: 5, y: 7 },
];
const CLUSTER_COLORS = [COLORS.cyan, COLORS.pink, COLORS.yellow];

const segmentName = (c: { x: number; y: number }) =>
  c.y >= 6 ? "VIP big-spenders" : c.x >= 6 ? "Loyal regulars" : "Occasional shoppers";

type Phase = "raw" | "assigned" | "converged";

export default function KMeansViz() {
  const [centroids, setCentroids] = useState(INIT.map((c) => ({ ...c })));
  const [assignments, setAssignments] = useState<number[]>(Array(CUSTOMERS.length).fill(-1));
  const [trails, setTrails] = useState<{ x: number; y: number }[][]>(INIT.map((c) => [{ ...c }]));
  const [phase, setPhase] = useState<Phase>("raw");
  const [isPlaying, setIsPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = phase === "raw" ? 0 : phase === "assigned" ? 1 : 2;
  const converged = phase === "converged";

  const assignTo = (cs: { x: number; y: number }[]) =>
    CUSTOMERS.map((p) => {
      let best = 0;
      let bestD = Infinity;
      cs.forEach((c, i) => {
        const d = Math.hypot(p.x - c.x, p.y - c.y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    });

  const runAssign = () => {
    setAssignments(assignTo(centroids));
    setPhase("assigned");
  };

  const runMove = () => {
    const next = centroids.map((c, i) => {
      const owned = CUSTOMERS.filter((_, idx) => assignments[idx] === i);
      if (owned.length === 0) return c;
      return {
        x: owned.reduce((s, p) => s + p.x, 0) / owned.length,
        y: owned.reduce((s, p) => s + p.y, 0) / owned.length,
      };
    });
    setCentroids(next);
    setTrails((prev) => prev.map((t, i) => [...t, next[i]]));
    // with separable groups, one assign+move pass already stabilises the segments
    setPhase("converged");
    setIsPlaying(false);
  };

  const handleStep = () => {
    if (phase === "raw") runAssign();
    else if (phase === "assigned") runMove();
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCentroids(INIT.map((c) => ({ ...c })));
    setAssignments(Array(CUSTOMERS.length).fill(-1));
    setTrails(INIT.map((c) => [{ ...c }]));
    setPhase("raw");
  };

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (isPlaying && !converged) {
      timer.current = setInterval(handleStep, 1100);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [isPlaying, phase]);

  // discovered segments (only meaningful once converged)
  const segments = centroids.map((c, i) => ({
    name: segmentName(c),
    color: CLUSTER_COLORS[i],
    count: assignments.filter((a) => a === i).length,
  }));

  const caption =
    phase === "raw"
      ? "Twelve customers plotted by how often they visit and how much they spend — but with no labels. We don't know who the segments are yet. Each centroid (the big markers) is a guessed segment centre. Step to begin."
      : phase === "assigned"
        ? "ASSIGN: every customer joins its nearest centroid, tinting the map into territories. The grouping is still rough because the centres were only guesses."
        : `MOVE & CONVERGE: each centroid slid to the mean of its customers, and the groups stopped changing. The algorithm discovered ${segments.length} segments with no labels at all — and we can read off what they are: ${segments.map((s) => s.name).join(", ")}.`;

  const ticks = [0, 2.5, 5, 7.5, 10];

  // Voronoi tint
  const cells: React.ReactNode[] = [];
  if (phase !== "raw") {
    const step = 16;
    for (let px = plot.left; px < plot.right; px += step) {
      for (let py = plot.top; py < plot.bottom; py += step) {
        const gx = ((px + step / 2 - plot.left) / (plot.right - plot.left)) * 10;
        const gy = ((plot.bottom - (py + step / 2)) / (plot.bottom - plot.top)) * 10;
        let best = 0;
        let bestD = Infinity;
        centroids.forEach((c, i) => {
          const d = Math.hypot(gx - c.x, gy - c.y);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        cells.push(<rect key={`${px}-${py}`} x={px} y={py} width={step} height={step} fill={CLUSTER_COLORS[best]} fillOpacity={0.05} />);
      }
    }
  }

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="K-Means Customer Segmentation">
      <title>K Means Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {cells}

      {ticks.map((t) => (
        <g key={t}>
          <line x1={scaleX(t)} y1={plot.top} x2={scaleX(t)} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
          <line x1={plot.left} y1={scaleY(t)} x2={plot.right} y2={scaleY(t)} stroke={COLORS.grid} strokeWidth={1} />
          <text x={plot.left - 8} y={scaleY(t) + 3} textAnchor="end" fill={COLORS.muted} fontSize={10}>£{spend(t)}</text>
          <text x={scaleX(t)} y={plot.bottom + 15} textAnchor="middle" fill={COLORS.muted} fontSize={10}>{visits(t)}</text>
        </g>
      ))}
      <line x1={plot.left} y1={plot.top} x2={plot.left} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
      <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
      <text x={plot.right} y={plot.bottom + 30} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>visits / month →</text>
      <text x={plot.left - 8} y={plot.top - 12} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>spend / month</text>

      {/* centroid trails */}
      {trails.map((t, i) =>
        t.length > 1 ? (
          <path key={`tr${i}`} d={"M " + t.map((p) => `${scaleX(p.x)} ${scaleY(p.y)}`).join(" L ")} fill="none" stroke={CLUSTER_COLORS[i]} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
        ) : null,
      )}

      {/* assignment spokes */}
      {phase !== "raw" &&
        CUSTOMERS.map((p, idx) => {
          const c = centroids[assignments[idx]];
          if (!c) return null;
          return (
            <motion.line
              key={`spk-${idx}-${phase}`}
              x1={scaleX(p.x)}
              y1={scaleY(p.y)}
              x2={scaleX(c.x)}
              y2={scaleY(c.y)}
              stroke={CLUSTER_COLORS[assignments[idx]]}
              strokeWidth={1.2}
              strokeOpacity={0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4 }}
            />
          );
        })}

      {/* customers */}
      {CUSTOMERS.map((p, idx) => {
        const a = assignments[idx];
        return <AnimatedPointMark key={`c${idx}`} px={scaleX(p.x)} py={scaleY(p.y)} color={a === -1 ? COLORS.border : CLUSTER_COLORS[a]} r={5.5} />;
      })}

      {/* centroids */}
      {centroids.map((c, i) => (
        <AnimatedPointMark key={`cen${i}`} px={scaleX(c.x)} py={scaleY(c.y)} color={CLUSTER_COLORS[i]} r={10} />
      ))}

      {converged && centroids.map((c, i) => <PulseRing key={`pr${i}`} px={scaleX(c.x)} py={scaleY(c.y)} color={CLUSTER_COLORS[i]} maxRadius={32} />)}
    </svg>
  );

  const controls = (
    <div className="flex flex-1 flex-col justify-between gap-3">
      <StepIndicator steps={["Raw data", "Assign", "Converge"]} currentStep={currentStep} />

      <div className="border border-outline bg-surface p-3 font-mono text-xs">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-bold uppercase text-on-surface-variant">Status</span>
          <span data-testid="kmeans-status" className="font-bold" style={{ color: converged ? COLORS.cyan : COLORS.muted }}>
            {phase === "raw" ? "raw data — no labels yet" : phase === "assigned" ? "grouping…" : `converged · ${segments.length} segments`}
          </span>
        </div>
        {converged ? (
          segments.map((s) => (
            <div key={s.name} className="flex justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
              <span className="font-bold text-on-surface">{s.count} customers</span>
            </div>
          ))
        ) : (
          <span className="text-[12px] text-on-surface-variant">No segment labels exist — k-means will discover them from behaviour alone.</span>
        )}
      </div>

      <NarrativeControls
        isPlaying={isPlaying}
        onPlayToggle={() => {
          if (converged) return;
          setIsPlaying((p) => !p);
        }}
        onStepForward={handleStep}
        onReset={handleReset}
        currentStep={currentStep}
        totalSteps={3}
      />
    </div>
  );

  const mentalModel = (
    <p>
      Clustering is <strong>unsupervised</strong>: there are no labels, so the
      algorithm has to <em>discover</em> structure on its own. K-means does it by
      alternating two cheap moves — <strong>assign</strong> every point to the
      nearest centre, then <strong>move</strong> each centre to the mean of the
      points that chose it — repeating until nothing changes. It&apos;s how raw
      logs become customer segments, images become colour palettes, and documents
      become topics. The catch: <strong>you pick k</strong>, and a poor k (or
      oddly-shaped groups) gives clusters that don&apos;t match reality.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
