"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { animate, motion, type AnimationPlaybackControls } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  PulseRing,
  VisualizationInstruction,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;
const origin = { x: 220, y: 210 };
const scaleFactor = 25; // 1 unit = 25 pixels
const plot = { left: 64, top: 44, right: 406, bottom: 338 };

// Coord transformations
const scaleX = (val: number) => origin.x + val * scaleFactor;
const scaleY = (val: number) => origin.y - val * scaleFactor;

const invertX = (px: number) => (px - origin.x) / scaleFactor;
const invertY = (py: number) => (origin.y - py) / scaleFactor;

export default function LinearAlgebraViz() {
  const [a, setA] = useState({ x: 3.0, y: 4.5 });
  const [b, setB] = useState({ x: 5.5, y: 1.5 });
  const [morph, setMorph] = useState(0); // 0 = standard grid, 1 = {a,b} grid
  const [isMorphed, setIsMorphed] = useState(false);
  const [activeDrag, setActiveDrag] = useState<"a" | "b" | null>(null);

  // Animation reference
  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  // Projection math
  const dotProd = a.x * b.x + a.y * b.y;
  const bMagSq = b.x * b.x + b.y * b.y;
  const projScalar = bMagSq > 0.001 ? dotProd / bMagSq : 0;
  const projVec = { x: projScalar * b.x, y: projScalar * b.y };

  // Orthogonal error vector
  const errVec = { x: a.x - projVec.x, y: a.y - projVec.y };
  const errMag = Math.sqrt(errVec.x * errVec.x + errVec.y * errVec.y);

  // Determinant (Parallelogram Area)
  const det = a.x * b.y - a.y * b.x;
  const area = Math.abs(det);
  const isCollinear = area < 0.15;

  // Detect 90 degrees (orthogonality)
  const isOrthogonal = Math.abs(dotProd) < 0.15;

  // Custom morphing basis vectors
  // e1 = (1, 0) -> morphs to a
  // e2 = (0, 1) -> morphs to b
  const u = {
    x: (1 - morph) * 1 + morph * a.x,
    y: (1 - morph) * 0 + morph * a.y,
  };
  const v = {
    x: (1 - morph) * 0 + morph * b.x,
    y: (1 - morph) * 1 + morph * b.y,
  };

  const handlePointerDown = (e: React.PointerEvent<SVGElement>, vector: "a" | "b") => {
    e.preventDefault();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    setActiveDrag(vector);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!activeDrag) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return;

    const svgCoords = point.matrixTransform(screenCTM.inverse());
    if (svgCoords) {
      const rawX = invertX(svgCoords.x);
      const rawY = invertY(svgCoords.y);
      const clamped = {
        x: Math.max(-7.0, Math.min(7.0, rawX)),
        y: Math.max(-7.0, Math.min(7.0, rawY)),
      };

      if (activeDrag === "a") {
        setA(clamped);
      } else {
        setB(clamped);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setActiveDrag(null);
  };

  const toggleBasis = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    const target = isMorphed ? 0 : 1;
    setIsMorphed(!isMorphed);
    animationRef.current = animate(morph, target, {
      duration: 1.2,
      ease: "easeInOut",
      onUpdate: (latest) => setMorph(latest),
    });
  };

  // Parallelogram path points
  const p0 = `${scaleX(0)} ${scaleY(0)}`;
  const p1 = `${scaleX(a.x)} ${scaleY(a.y)}`;
  const p2 = `${scaleX(a.x + b.x)} ${scaleY(a.y + b.y)}`;
  const p3 = `${scaleX(b.x)} ${scaleY(b.y)}`;
  const parallelogramPath = `M ${p0} L ${p1} L ${p2} L ${p3} Z`;

  // Draw morphing grid lines
  const gridCoords = [-6, -4, -2, 0, 2, 4, 6];
  const gridRange = [-8, 8];

  // Right-angle symbol points at the projection foot
  let rightAnglePath = "";
  if (errMag > 0.1 && bMagSq > 0.001) {
    const s = 0.4; // symbol size in units
    // Direction of b (along projection)
    const bLen = Math.sqrt(bMagSq);
    const ux = b.x / bLen;
    const uy = b.y / bLen;
    // Direction of error (toward a)
    const ex = errVec.x / errMag;
    const ey = errVec.y / errMag;

    // We want the symbol to follow the projection direction correctly
    const sign = projScalar >= 0 ? 1 : -1;
    const r1 = { x: projVec.x + s * ux * -sign, y: projVec.y + s * uy * -sign };
    const r2 = { x: projVec.x + s * ux * -sign + s * ex, y: projVec.y + s * uy * -sign + s * ey };
    const r3 = { x: projVec.x + s * ex, y: projVec.y + s * ey };

    rightAnglePath = `M ${scaleX(r1.x)} ${scaleY(r1.y)} L ${scaleX(r2.x)} ${scaleY(r2.y)} L ${scaleX(r3.x)} ${scaleY(r3.y)}`;
  }

  // Highlight data point for mapping coordinates demonstration
  const demoPoint = { x: 4.0, y: 3.0 };
  // Find coordinates c1, c2 in morphing grid {u, v}
  // demoPoint = c1 * u + c2 * v
  // Solve:
  // c1 * u.x + c2 * v.x = P.x
  // c1 * u.y + c2 * v.y = P.y
  const morphDet = u.x * v.y - u.y * v.x;
  let c1 = 0;
  let c2 = 0;
  if (Math.abs(morphDet) > 0.001) {
    c1 = (demoPoint.x * v.y - demoPoint.y * v.x) / morphDet;
    c2 = (-demoPoint.x * u.y + demoPoint.y * u.x) / morphDet;
  }

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Linear Algebra Projection & Basis"
          >
            <title>Linear Algebra Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Shaded Parallelogram (Determinant area) */}
            <motion.path
              d={parallelogramPath}
              fill={COLORS.yellow}
              fillOpacity={isCollinear ? 0.05 : 0.12}
              stroke={COLORS.yellow}
              strokeWidth={1.5}
              strokeDasharray={isCollinear ? "3 3" : undefined}
              animate={{ fillOpacity: isCollinear ? 0.05 : 0.15 }}
              className="transition-all"
            />

            {/* Morphed Grid System */}
            <g>
              {/* Lines of constant u (parallel to v) */}
              {gridCoords.map((c) => {
                const x1 = c * u.x + gridRange[0] * v.x;
                const y1 = c * u.y + gridRange[0] * v.y;
                const x2 = c * u.x + gridRange[1] * v.x;
                const y2 = c * u.y + gridRange[1] * v.y;
                return (
                  <line
                    key={`u-${c}`}
                    x1={scaleX(x1)}
                    y1={scaleY(y1)}
                    x2={scaleX(x2)}
                    y2={scaleY(y2)}
                    stroke={c === 0 ? COLORS.border : COLORS.grid}
                    strokeWidth={c === 0 ? 1.5 : 1}
                    strokeOpacity={c === 0 ? 0.7 : 0.4}
                  />
                );
              })}
              {/* Lines of constant v (parallel to u) */}
              {gridCoords.map((c) => {
                const x1 = gridRange[0] * u.x + c * v.x;
                const y1 = gridRange[0] * u.y + c * v.y;
                const x2 = gridRange[1] * u.x + c * v.x;
                const y2 = gridRange[1] * u.y + c * v.y;
                return (
                  <line
                    key={`v-${c}`}
                    x1={scaleX(x1)}
                    y1={scaleY(y1)}
                    x2={scaleX(x2)}
                    y2={scaleY(y2)}
                    stroke={c === 0 ? COLORS.border : COLORS.grid}
                    strokeWidth={c === 0 ? 1.5 : 1}
                    strokeOpacity={c === 0 ? 0.7 : 0.4}
                  />
                );
              })}
            </g>

            {/* Plot Border */}
            <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} fill="none" stroke={COLORS.border} strokeWidth={1} />

            {/* Projection vector components */}
            <g>
              {/* Projection vector (yellow) */}
              {bMagSq > 0.01 && (
                <g>
                  {/* Dashed drop line from a to projection point */}
                  <line
                    x1={scaleX(a.x)}
                    y1={scaleY(a.y)}
                    x2={scaleX(projVec.x)}
                    y2={scaleY(projVec.y)}
                    stroke={COLORS.yellow}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  {/* Right angle symbol at foot */}
                  {rightAnglePath && (
                    <motion.path
                      d={rightAnglePath}
                      fill="none"
                      stroke={isOrthogonal ? COLORS.pink : COLORS.yellow}
                      strokeWidth={2}
                      animate={isOrthogonal ? { scale: [1, 1.25, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                  {/* Projection arrow */}
                  <line
                    x1={scaleX(0)}
                    y1={scaleY(0)}
                    x2={scaleX(projVec.x)}
                    y2={scaleY(projVec.y)}
                    stroke={COLORS.yellow}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Basis vector b (cyan) */}
              <g>
                <line
                  x1={scaleX(0)}
                  y1={scaleY(0)}
                  x2={scaleX(b.x)}
                  y2={scaleY(b.y)}
                  stroke={COLORS.cyan}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <circle cx={scaleX(b.x)} cy={scaleY(b.y)} r={4} fill={COLORS.cyan} />
              </g>

              {/* Target vector a (pink) */}
              <g>
                <line
                  x1={scaleX(0)}
                  y1={scaleY(0)}
                  x2={scaleX(a.x)}
                  y2={scaleY(a.y)}
                  stroke={COLORS.pink}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                />
                <circle cx={scaleX(a.x)} cy={scaleY(a.y)} r={4} fill={COLORS.pink} />
              </g>

              {/* Parallelogram area warning pulse when collinear */}
              {isCollinear && (
                <PulseRing px={scaleX(a.x)} py={scaleY(a.y)} color={COLORS.yellow} maxRadius={30} />
              )}

              {/* Draggable handles on tips */}
              {/* Handle A */}
              <g
                onPointerDown={(e) => handlePointerDown(e, "a")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-grab active:cursor-grabbing"
              >
                <circle cx={scaleX(a.x)} cy={scaleY(a.y)} r={16} fill="transparent" />
                <AnimatedPointMark px={scaleX(a.x)} py={scaleY(a.y)} color={COLORS.pink} r={7} label="vector a" />
              </g>

              {/* Handle B */}
              <g
                onPointerDown={(e) => handlePointerDown(e, "b")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-grab active:cursor-grabbing"
              >
                <circle cx={scaleX(b.x)} cy={scaleY(b.y)} r={16} fill="transparent" />
                <AnimatedPointMark px={scaleX(b.x)} py={scaleY(b.y)} color={COLORS.cyan} r={7} label="basis b" />
              </g>
            </g>

            {/* Static coordinate demo point */}
            <g>
              <circle cx={scaleX(demoPoint.x)} cy={scaleY(demoPoint.y)} r={4} fill={COLORS.muted} />
              <text x={scaleX(demoPoint.x) + 8} y={scaleY(demoPoint.y) - 6} fill={COLORS.muted} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">
                P(4, 3)
              </text>
            </g>

            {/* SVG In-Plot Stats */}
            <g>
              {/* Dot Product */}
              <g transform="translate(440, 44)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={10} fontWeight={700}>DOT PRODUCT (a · b)</text>
                <text x={12} y={36} fill={isOrthogonal ? COLORS.pink : COLORS.muted} fontSize={15} fontWeight={800}>
                  {dotProd.toFixed(2)} {isOrthogonal && " (ORTHO!)"}
                </text>
              </g>

              {/* Projection Scalar */}
              <g transform="translate(440, 102)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={10} fontWeight={700}>PROJECTION SCALAR (p)</text>
                <text x={12} y={36} fill={COLORS.yellow} fontSize={15} fontWeight={800}>{projScalar.toFixed(2)}</text>
              </g>

              {/* Determinant Area */}
              <g transform="translate(440, 160)">
                <rect width={166} height={46} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={10} fontWeight={700}>DETERMINANT AREA</text>
                <text x={12} y={36} fill={isCollinear ? COLORS.yellow : COLORS.muted} fontSize={15} fontWeight={800}>
                  {area.toFixed(2)} {isCollinear && " (COLLINEAR)"}
                </text>
              </g>

              {/* Coordinate basis tracker */}
              <g transform="translate(440, 218)">
                <rect width={166} height={120} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} rx={2} />
                <text x={12} y={18} fill={COLORS.muted} fontSize={10} fontWeight={700}>COORDINATES OF P(4,3)</text>

                <text x={12} y={40} fill={COLORS.muted} fontSize={9} fontWeight={600}>CURRENT GRID BASIS:</text>
                <text x={12} y={55} fill={COLORS.pink} fontSize={11} fontWeight={800}>
                  u = ({u.x.toFixed(1)}, {u.y.toFixed(1)})
                </text>
                <text x={12} y={70} fill={COLORS.cyan} fontSize={11} fontWeight={800}>
                  v = ({v.x.toFixed(1)}, {v.y.toFixed(1)})
                </text>

                <text x={12} y={92} fill={COLORS.muted} fontSize={9} fontWeight={600}>COORDINATE VALUE [c1, c2]:</text>
                <text x={12} y={108} fill={COLORS.pink} fontSize={13} fontWeight={800}>
                  [{c1.toFixed(2)}, {c2.toFixed(2)}]
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Interactions</span>
          </div>

          <button aria-label="WARP BACK TO STANDARD GRID MORPH GRID TO BASIS {a, b}"
            onClick={toggleBasis}
            className="w-full flex h-9 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer mb-2"
          >
            {isMorphed ? "WARP BACK TO STANDARD GRID" : "MORPH GRID TO BASIS {a, b}"}
          </button>

          <VisualizationInstruction
            title="Direct Manipulation:"
            content="Drag the tips of **vector a** and **basis b** to recalculate projection, dot product, and parallelogram area (determinant) live."
            className="uppercase"
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Vectors represent direction and magnitude. The dot product $a \cdot b$ measures directional alignment, while projections represent decomposition onto new bases. Shifting grid lines visually demonstrates how coordinates coordinates warp under a basis transformation.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
