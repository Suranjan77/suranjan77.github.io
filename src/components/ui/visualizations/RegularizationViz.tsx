"use client";

import React, { useState } from "react";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 720;
const H = 440;

const CX = 320;
const CY = 220;
const UNIT = 28;
const R = 3.0; // weight "budget" radius

const scaleX = (val: number) => CX + val * UNIT;
const scaleY = (val: number) => CY - val * UNIT;
const invertX = (px: number) => (px - CX) / UNIT;
const invertY = (py: number) => (CY - py) / UNIT;

// Correct Euclidean projection of the best-fit point onto the weight budget.
function project(regType: "L1" | "L2", x: number, y: number) {
  if (regType === "L2") {
    const norm = Math.hypot(x, y);
    if (norm <= R) return { x, y };
    return { x: R * (x / norm), y: R * (y / norm) };
  }
  // L1 ball projection onto |x| + |y| <= R
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  if (absX + absY <= R) return { x, y };
  const tau = (absX + absY - R) / 2;
  if (Math.min(absX, absY) >= tau) {
    return { x: Math.sign(x) * (absX - tau), y: Math.sign(y) * (absY - tau) };
  }
  // The smaller weight is forced to exactly zero (a corner of the diamond).
  return absX >= absY
    ? { x: Math.sign(x) * R, y: 0 }
    : { x: 0, y: Math.sign(y) * R };
}

const ticks = [-5, -2.5, 0, 2.5, 5];
const isZero = (v: number) => Math.abs(v) < 1e-6;

function WeightBar({ label, value }: { label: string; value: number }) {
  const zero = isZero(value);
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 font-mono text-[12px] font-bold text-on-surface-variant">{label}</span>
      <div className="relative h-4 flex-1 bg-surface-container">
        <div
          className="h-full"
          style={{
            width: `${Math.min(100, (Math.abs(value) / R) * 100)}%`,
            backgroundColor: zero ? COLORS.pink : COLORS.cyan,
          }}
        />
      </div>
      <span
        className={`w-24 font-mono text-[12px] font-bold ${zero ? "" : "text-on-surface"}`}
        style={zero ? { color: COLORS.pink } : undefined}
      >
        {zero ? "0 — dropped" : value.toFixed(2)}
      </span>
    </div>
  );
}

export default function RegularizationViz() {
  const [regType, setRegType] = useState<"L1" | "L2">("L1");
  const [ols, setOls] = useState({ x: 4.6, y: 1.4 }); // best-fit optimum (draggable)
  const [isDragging, setIsDragging] = useState(false);

  const regSol = project(regType, ols.x, ols.y);
  const sparse = regType === "L1" && (isZero(regSol.x) || isZero(regSol.y));

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
    setOls({
      x: Math.max(-6, Math.min(6, invertX(svgCoords.x))),
      y: Math.max(-6, Math.min(6, invertY(svgCoords.y))),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  const caption =
    regType === "L2"
      ? "The budget is a circle — it has no corners, so the solution just slides around its edge to the nearest point. Both weights shrink, but neither is forced to exactly zero. L2 shrinks; it does not select."
      : sparse
        ? `The diamond's sharp corner pokes out along an axis, so the nearest allowed point is that corner — one weight is pushed to exactly 0 (${isZero(regSol.x) ? "w1" : "w2"} is dropped). That is L1's sparsity: it performs feature selection for free.`
        : "Right now the solution rests on a flat edge of the diamond, keeping both weights. Drag the best-fit point around — it will soon catch a corner and snap a weight to exactly zero.";

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Regularization Loss Contours"
    >
      <title>Regularization Diagram</title>
      <SVGFilters />
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* Axes */}
      <g>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={scaleX(tick)} x2={scaleX(tick)} y1={scaleY(6.4)} y2={scaleY(-6.4)} stroke={COLORS.grid} strokeWidth={1} />
            <line x1={scaleX(-6.4)} x2={scaleX(6.4)} y1={scaleY(tick)} y2={scaleY(tick)} stroke={COLORS.grid} strokeWidth={1} />
          </g>
        ))}
        <line x1={scaleX(0)} x2={scaleX(0)} y1={scaleY(6.4)} y2={scaleY(-6.4)} stroke={COLORS.border} strokeWidth={1.5} />
        <line x1={scaleX(-6.4)} x2={scaleX(6.4)} y1={scaleY(0)} y2={scaleY(0)} stroke={COLORS.border} strokeWidth={1.5} />
        <text x={scaleX(6.4) + 6} y={scaleY(0) + 4} fill={COLORS.muted} fontSize={12} fontWeight={800}>w1</text>
        <text x={scaleX(0) + 8} y={scaleY(6.4) - 4} fill={COLORS.muted} fontSize={12} fontWeight={800}>w2</text>
      </g>

      {/* Weight budget (constraint region) */}
      {regType === "L2" ? (
        <circle cx={scaleX(0)} cy={scaleY(0)} r={R * UNIT} fill={COLORS.cyan} fillOpacity={0.1} stroke={COLORS.cyan} strokeWidth={2.5} />
      ) : (
        <polygon
          points={`${scaleX(0)},${scaleY(R)} ${scaleX(R)},${scaleY(0)} ${scaleX(0)},${scaleY(-R)} ${scaleX(-R)},${scaleY(0)}`}
          fill={COLORS.cyan}
          fillOpacity={0.1}
          stroke={COLORS.cyan}
          strokeWidth={2.5}
        />
      )}

      {/* Loss contours around the best-fit optimum */}
      <g opacity={0.32}>
        {[1, 2, 3].map((m) => (
          <ellipse
            key={m}
            cx={scaleX(ols.x)}
            cy={scaleY(ols.y)}
            rx={24 * m}
            ry={16 * m}
            fill="none"
            stroke={COLORS.pink}
            strokeWidth={1.5}
            transform={`rotate(-15 ${scaleX(ols.x)} ${scaleY(ols.y)})`}
          />
        ))}
      </g>

      {/* Connector best-fit -> regularized */}
      <line x1={scaleX(ols.x)} y1={scaleY(ols.y)} x2={scaleX(regSol.x)} y2={scaleY(regSol.y)} stroke={COLORS.muted} strokeWidth={1.5} strokeDasharray="2 3" opacity={0.7} />

      {/* Regularized solution */}
      <g>
        {sparse && (
          <circle cx={scaleX(regSol.x)} cy={scaleY(regSol.y)} r={16} fill="none" stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="3 2" className="animate-pulse" />
        )}
        <circle cx={scaleX(regSol.x)} cy={scaleY(regSol.y)} r={7.5} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1.5} />
      </g>

      {/* Draggable best-fit optimum */}
      <g
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="cursor-grab active:cursor-grabbing"
      >
        <circle cx={scaleX(ols.x)} cy={scaleY(ols.y)} r={18} fill="transparent" />
        <circle cx={scaleX(ols.x)} cy={scaleY(ols.y)} r={8} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={1.5} />
        <text x={scaleX(ols.x) + 12} y={scaleY(ols.y) - 8} fill={COLORS.pink} fontSize={12} fontWeight={800} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">drag me</text>
      </g>
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Weight budget shape
        </span>
        <div className="flex gap-2">
          {(["L1", "L2"] as const).map((type) => (
            <button
              aria-label={type === "L1" ? "L1 Lasso (Diamond)" : "L2 Ridge (Circle)"}
              key={type}
              onClick={() => setRegType(type)}
              className={`px-3 py-2 text-[12px] font-bold uppercase tracking-wider cursor-pointer border ${
                regType === type
                  ? "bg-primary border-primary text-on-primary"
                  : "bg-surface hover:bg-surface-container border-outline text-on-surface-variant"
              }`}
            >
              {type === "L1" ? "L1 Lasso (Diamond)" : "L2 Ridge (Circle)"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          Regularized weights
        </span>
        <WeightBar label="w1*" value={regSol.x} />
        <WeightBar label="w2*" value={regSol.y} />
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        Plain least squares wants the red best-fit point. Regularization adds a{" "}
        <strong>budget</strong> on how big the weights can get (the shaded
        region), so the model settles for the closest point still inside it — the
        yellow solution.
      </p>
      <p>
        <strong>L1 (Lasso)</strong> uses a diamond. Its sharp corners sit on the
        axes, so for most best-fit positions the nearest allowed point is a
        corner where one weight is exactly <strong>0</strong> — the feature is
        dropped. That built-in feature selection is L1&apos;s superpower.
      </p>
      <p>
        <strong>L2 (Ridge)</strong> uses a circle. With no corners the solution
        slides smoothly around the edge, shrinking every weight but almost never
        zeroing one out.
      </p>
    </div>
  );

  return (
    <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />
  );
}
