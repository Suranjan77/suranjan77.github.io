"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 660;
const H = 420;
const plot = { left: 60, top: 40, right: 624, bottom: 344 };

// internal 0..10 space -> screen
const scaleX = (v: number) => plot.left + (v / 10) * (plot.right - plot.left);
const scaleY = (v: number) => plot.bottom - (v / 10) * (plot.bottom - plot.top);
const invertX = (px: number) => ((px - plot.left) / (plot.right - plot.left)) * 10;
const invertY = (py: number) => ((plot.bottom - py) / (plot.bottom - plot.top)) * 10;

// display units
const tempo = (x: number) => Math.round(60 + x * 12); // BPM
const energy = (y: number) => Math.round(y * 10); // %

// known, already-tagged songs on a tempo (x) x energy (y) map.
// label 0 = "Lo-fi" (low energy), label 1 = "EDM" (high energy).
// One crossover track — a fast but mellow song tagged EDM — sits down in the
// lo-fi neighbourhood. That lone outlier is where k earns its keep.
type Song = { id: number; x: number; y: number; label: 0 | 1 };
const SONGS: Song[] = [
  { id: 0, x: 1.5, y: 2.2, label: 0 },
  { id: 1, x: 2.4, y: 3.0, label: 0 },
  { id: 2, x: 3.2, y: 2.4, label: 0 },
  { id: 3, x: 2.0, y: 3.6, label: 0 },
  { id: 4, x: 3.6, y: 3.4, label: 0 },
  { id: 5, x: 6.4, y: 7.2, label: 1 },
  { id: 6, x: 7.2, y: 8.0, label: 1 },
  { id: 7, x: 8.0, y: 6.8, label: 1 },
  { id: 8, x: 7.6, y: 8.4, label: 1 },
  { id: 9, x: 6.8, y: 7.6, label: 1 },
  { id: 10, x: 5.4, y: 2.8, label: 1 }, // crossover: fast but mellow, tagged EDM
];

const GENRES = [
  { name: "Lo-fi", color: COLORS.cyan },
  { name: "EDM", color: COLORS.pink },
] as const;

export default function KNNViz() {
  const [query, setQuery] = useState({ x: 5.2, y: 3.4 });
  const [k, setK] = useState(3);
  const [showMap, setShowMap] = useState(false);
  const [dragging, setDragging] = useState(false);

  const ranked = SONGS.map((s) => ({ ...s, dist: Math.hypot(s.x - query.x, s.y - query.y) })).sort(
    (a, b) => a.dist - b.dist,
  );
  const nearest = ranked.slice(0, k);
  const edmVotes = nearest.filter((s) => s.label === 1).length;
  const lofiVotes = k - edmVotes;
  const predicted = edmVotes > lofiVotes ? 1 : 0;
  const predGenre = GENRES[predicted];

  // neighbourhood radius = distance to the k-th neighbour (screen px)
  const kth = nearest[nearest.length - 1];
  const radiusPx = kth
    ? Math.hypot(scaleX(kth.x) - scaleX(query.x), scaleY(kth.y) - scaleY(query.y)) + 12
    : 40;

  const setFromPointer = (e: React.PointerEvent<SVGElement>) => {
    const svg = e.currentTarget.ownerSVGElement ?? (e.currentTarget as unknown as SVGSVGElement);
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const c = pt.matrixTransform(ctm.inverse());
    setQuery({
      x: Math.max(0.4, Math.min(9.6, invertX(c.x))),
      y: Math.max(0.4, Math.min(9.6, invertY(c.y))),
    });
  };
  const onDown = (e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setFromPointer(e);
  };
  const onMove = (e: React.PointerEvent<SVGElement>) => {
    if (dragging) setFromPointer(e);
  };
  const onUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  // genre map: classify a coarse grid of cells by the same k-vote
  const cells: React.ReactNode[] = [];
  if (showMap) {
    const step = 16;
    for (let px = plot.left; px < plot.right; px += step) {
      for (let py = plot.top; py < plot.bottom; py += step) {
        const gx = invertX(px + step / 2);
        const gy = invertY(py + step / 2);
        const d = SONGS.map((s) => ({ label: s.label, dist: Math.hypot(s.x - gx, s.y - gy) })).sort(
          (a, b) => a.dist - b.dist,
        );
        const v1 = d.slice(0, k).filter((s) => s.label === 1).length;
        cells.push(
          <rect
            key={`${px}-${py}`}
            x={px}
            y={py}
            width={step}
            height={step}
            fill={v1 > k / 2 ? COLORS.pink : COLORS.cyan}
            fillOpacity={0.07}
          />,
        );
      }
    }
  }

  const xticks = [0, 2.5, 5, 7.5, 10];
  const yticks = [0, 2.5, 5, 7.5, 10];

  const caption =
    `KNN never trains a model — it just remembers every tagged song. To label this new track it measures distance to all of them and lets the ${k} closest vote: ` +
    `${edmVotes} say EDM, ${lofiVotes} say Lo-fi → tagged ${predGenre.name}. ` +
    `Drag the track near the lone fast-but-mellow song: at k=1 its nearest neighbour alone decides, but a larger k lets the surrounding crowd outvote that one oddball.`;

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="K-Nearest Neighbors Genre Vote"
      onPointerMove={onMove}
      onPointerUp={onUp}
    >
      <title>K Nearest Neighbors Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {showMap && <g>{cells}</g>}

      {/* grid + axes */}
      {xticks.map((t) => (
        <g key={`x${t}`}>
          <line x1={scaleX(t)} y1={plot.top} x2={scaleX(t)} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
          <text x={scaleX(t)} y={plot.bottom + 16} textAnchor="middle" fill={COLORS.muted} fontSize={10}>{tempo(t)}</text>
        </g>
      ))}
      {yticks.map((t) => (
        <g key={`y${t}`}>
          <line x1={plot.left} y1={scaleY(t)} x2={plot.right} y2={scaleY(t)} stroke={COLORS.grid} strokeWidth={1} />
          <text x={plot.left - 8} y={scaleY(t) + 3} textAnchor="end" fill={COLORS.muted} fontSize={10}>{energy(t)}</text>
        </g>
      ))}
      <text x={plot.right} y={plot.bottom + 32} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>tempo (BPM) →</text>
      <text x={plot.left - 8} y={plot.top - 12} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>energy (%)</text>

      {/* neighbourhood ring */}
      <motion.circle
        key={`${query.x.toFixed(2)}-${query.y.toFixed(2)}-${k}`}
        cx={scaleX(query.x)}
        cy={scaleY(query.y)}
        fill={COLORS.yellow}
        fillOpacity={0.05}
        stroke={COLORS.yellow}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        initial={{ r: 0, opacity: 0.7 }}
        animate={{ r: radiusPx, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* vote arcs to the k nearest */}
      {nearest.map((s) => (
        <line
          key={`arc-${s.id}`}
          x1={scaleX(query.x)}
          y1={scaleY(query.y)}
          x2={scaleX(s.x)}
          y2={scaleY(s.y)}
          stroke={GENRES[s.label].color}
          strokeWidth={2}
          strokeDasharray="4 2"
          opacity={0.8}
        />
      ))}

      {/* known songs */}
      {SONGS.map((s) => {
        const isNear = nearest.some((n) => n.id === s.id);
        return (
          <g key={s.id}>
            {isNear && (
              <circle cx={scaleX(s.x)} cy={scaleY(s.y)} r={11} fill="none" stroke={COLORS.yellow} strokeWidth={2} />
            )}
            <circle cx={scaleX(s.x)} cy={scaleY(s.y)} r={5.5} fill={GENRES[s.label].color} stroke={COLORS.bg} strokeWidth={1.5} />
          </g>
        );
      })}

      {/* invisible hit area so the whole plot is draggable */}
      <rect
        x={plot.left}
        y={plot.top}
        width={plot.right - plot.left}
        height={plot.bottom - plot.top}
        fill="transparent"
        onPointerDown={onDown}
        className="cursor-crosshair"
      />

      {/* the new, untagged track */}
      <g transform={`translate(${scaleX(query.x)}, ${scaleY(query.y)})`} pointerEvents="none">
        <circle r={10} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={2.5} />
        <circle r={5} fill={predGenre.color} />
        <text x={14} y={4} fill={COLORS.yellow} fontSize={11} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">new track</text>
      </g>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">Neighbor Count</span>
        <div className="flex items-center gap-2">
          <button
            aria-label="-"
            onClick={() => setK((p) => Math.max(1, p - 2))}
            disabled={k <= 1}
            className="h-8 w-8 border border-outline bg-surface font-bold hover:bg-surface-container disabled:opacity-30"
          >
            −
          </button>
          <span className="w-12 text-center font-mono text-sm font-bold text-primary">k = {k}</span>
          <button
            aria-label="+"
            onClick={() => setK((p) => Math.min(7, p + 2))}
            disabled={k >= 7}
            className="h-8 w-8 border border-outline bg-surface font-bold hover:bg-surface-container disabled:opacity-30"
          >
            +
          </button>
        </div>
        <button
          aria-label={showMap ? "Hide the genre map" : "Show the genre map"}
          onClick={() => setShowMap((s) => !s)}
          className={`mt-1 flex h-8 items-center justify-center border px-3 font-mono text-[11px] font-bold uppercase tracking-wide ${showMap ? "border-cyan bg-cyan/15 text-cyan" : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"}`}
        >
          {showMap ? "Hide genre map" : "Show genre map"}
        </button>
        <span className="font-sans text-[12px] text-on-surface-variant">Click or drag inside the plot to move the new track.</span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1.5 border border-outline bg-surface p-3 font-mono text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-bold uppercase text-on-surface-variant">Tagged as</span>
          <span data-testid="knn-prediction" className="text-lg font-bold" style={{ color: predGenre.color }}>{predGenre.name}</span>
        </div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">votes for EDM</span><span className="font-bold" style={{ color: COLORS.pink }}>{edmVotes}</span></div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">votes for Lo-fi</span><span className="font-bold" style={{ color: COLORS.cyan }}>{lofiVotes}</span></div>
        <div className="flex justify-between gap-3"><span className="text-on-surface-variant">nearest is</span><span className="font-bold text-on-surface">{(ranked[0].dist).toFixed(2)} away</span></div>
      </div>
    </>
  );

  const mentalModel = (
    <p>
      K-nearest-neighbours is the <strong>lazy</strong> classifier: there is no
      training step and no fitted equation — it simply <strong>stores every
      labelled example</strong>. To classify something new it measures distance to
      all of them and lets the <strong>k closest</strong> cast a majority vote.
      Small k follows the data tightly and can be fooled by a single noisy
      neighbour; larger k averages over more of the crowd, giving a smoother, more
      robust boundary but blurring fine detail. The same &quot;find the most
      similar known items&quot; idea powers recommendation and image search.
    </p>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
