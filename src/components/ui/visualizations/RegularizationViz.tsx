"use client";

import React, { useState } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  VisualizationInstruction,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

const plot = { left: 60, top: 40, right: 380, bottom: 340, width: 320, height: 300 };

// Center coordinate is at (0,0) mapped to (220, 190) in SVG pixels
const scaleX = (val: number) => 220 + val * 26;
const scaleY = (val: number) => 190 - val * 26;
const invertX = (px: number) => (px - 220) / 26;
const invertY = (py: number) => (190 - py) / 26;

export default function RegularizationViz() {
  const [regType, setRegType] = useState<"L1" | "L2">("L1");
  const [ols, setOls] = useState({ x: 4.5, y: 3.5 }); // OLS center coordinates (draggable)
  const [isDragging, setIsDragging] = useState(false);

  const constraintRadius = 3.0; // Budget radius C

  // Drag handlers
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

    const unitsX = Math.max(-6.5, Math.min(6.5, invertX(svgCoords.x)));
    const unitsY = Math.max(-6.5, Math.min(6.5, invertY(svgCoords.y)));

    setOls({ x: unitsX, y: unitsY });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGElement>) => {
    (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // Math projections onto constraints L1 / L2
  const getRegularizedSolution = () => {
    const R = constraintRadius;
    const { x, y } = ols;

    if (regType === "L2") {
      // Ridge projection: project onto circle of radius R
      const norm = Math.hypot(x, y);
      if (norm <= R) {
        return { x, y }; // inside circle
      }
      return {
        x: R * (x / norm),
        y: R * (y / norm),
      };
    } else {
      // Lasso projection: project onto L1 diamond |x| + |y| <= R
      const absX = Math.abs(x);
      const absY = Math.abs(y);
      if (absX + absY <= R) {
        return { x, y }; // inside diamond
      }
      // Mathematical L1 ball projection
      const u = (absX + absY - R) / 2;
      const projAbsX = Math.max(0, absX - u);
      const projAbsY = Math.max(0, absY - u);

      return {
        x: Math.sign(x) * projAbsX,
        y: Math.sign(y) * projAbsY,
      };
    }
  };

  const regSol = getRegularizedSolution();

  // Grid ticks
  const ticks = [-5, -2.5, 0, 2.5, 5];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Regularization Loss Contours">
            <title>Regularization Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Grid Axes */}
            <g>
              {ticks.map((tick) => (
                <g key={tick}>
                  <line x1={scaleX(tick)} x2={scaleX(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
                  <line x1={plot.left} x2={plot.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke={COLORS.grid} strokeWidth={1} />
                </g>
              ))}
              <line x1={scaleX(0)} x2={scaleX(0)} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={plot.left} x2={plot.right} y1={scaleY(0)} y2={scaleY(0)} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={plot.right - 18} y={scaleY(0) + 14} fill={COLORS.muted} fontSize={10} fontWeight={800}>w1</text>
              <text x={scaleX(0) + 8} y={plot.top + 8} fill={COLORS.muted} fontSize={10} fontWeight={800}>w2</text>
            </g>

            {/* Constraint Boundary region */}
            {regType === "L2" ? (
              // L2 Ridge Circle
              <circle
                cx={scaleX(0)}
                cy={scaleY(0)}
                r={constraintRadius * 26}
                fill={COLORS.cyan}
                fillOpacity={0.08}
                stroke={COLORS.cyan}
                strokeWidth={2.5}
              />
            ) : (
              // L1 Lasso Diamond
              <polygon
                points={`
                  ${scaleX(0)},${scaleY(constraintRadius)}
                  ${scaleX(constraintRadius)},${scaleY(0)}
                  ${scaleX(0)},${scaleY(-constraintRadius)}
                  ${scaleX(-constraintRadius)},${scaleY(0)}
                `}
                fill={COLORS.cyan}
                fillOpacity={0.08}
                stroke={COLORS.cyan}
                strokeWidth={2.5}
              />
            )}

            {/* Loss Ellipses around OLS optimum */}
            <g opacity={0.3}>
              <ellipse cx={scaleX(ols.x)} cy={scaleY(ols.y)} rx={24} ry={16} fill="none" stroke={COLORS.pink} strokeWidth={1.5} transform={`rotate(-15 ${scaleX(ols.x)} ${scaleY(ols.y)})`} />
              <ellipse cx={scaleX(ols.x)} cy={scaleY(ols.y)} rx={48} ry={32} fill="none" stroke={COLORS.pink} strokeWidth={1.5} transform={`rotate(-15 ${scaleX(ols.x)} ${scaleY(ols.y)})`} />
              <ellipse cx={scaleX(ols.x)} cy={scaleY(ols.y)} rx={72} ry={48} fill="none" stroke={COLORS.pink} strokeWidth={1.5} transform={`rotate(-15 ${scaleX(ols.x)} ${scaleY(ols.y)})`} />
            </g>

            {/* Draggable OLS Optimum (w_hat) */}
            <g
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="cursor-grab active:cursor-grabbing"
            >
              <circle cx={scaleX(ols.x)} cy={scaleY(ols.y)} r={8} fill={COLORS.pink} stroke={COLORS.bg} strokeWidth={1.5} />
              <circle cx={scaleX(ols.x)} cy={scaleY(ols.y)} r={2} fill={COLORS.bg} />
              <text x={scaleX(ols.x) + 12} y={scaleY(ols.y) - 6} fill={COLORS.pink} fontSize={9} fontWeight={900} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">OLS w_hat</text>
            </g>

            {/* Regularized Solution point (w*) */}
            <g>
              <circle cx={scaleX(regSol.x)} cy={scaleY(regSol.y)} r={7.5} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1.5} />
              {/* snap indicator */}
              {(regSol.x === 0 || regSol.y === 0) && regType === "L1" && (
                <circle cx={scaleX(regSol.x)} cy={scaleY(regSol.y)} r={15} fill="none" stroke={COLORS.yellow} strokeWidth={1.5} strokeDasharray="3 2" className="animate-pulse" />
              )}
              <text x={scaleX(regSol.x) - 34} y={scaleY(regSol.y) - 10} fill={COLORS.yellow} fontSize={9} fontWeight={900} stroke={COLORS.bg} strokeWidth={2.5} paintOrder="stroke">Regularized w*</text>
            </g>

            {/* Connector dashed line OLS -> Regularized */}
            <line
              x1={scaleX(ols.x)}
              y1={scaleY(ols.y)}
              x2={scaleX(regSol.x)}
              y2={scaleY(regSol.y)}
              stroke={COLORS.muted}
              strokeWidth={1.5}
              strokeDasharray="2 3"
              opacity={0.7}
            />

            {/* Side Weights Bar indicators (Right panel) */}
            <g transform="translate(420, 80)">
              <rect width={170} height={200} fill="rgba(250,248,242,0.85)" stroke={COLORS.border} rx={2} />
              <text x={85} y={24} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>REGULARIZED WEIGHTS</text>

              {/* w1 Bar */}
              <g transform="translate(20, 50)">
                <text x={0} y={15} fill={COLORS.muted} fontSize={11} fontWeight={800}>w1*:</text>
                <rect x={36} y={0} width={Math.abs(regSol.x) * 20} height={20} fill={regSol.x === 0 ? COLORS.pink : COLORS.cyan} fillOpacity={0.85} />
                <text x={42 + Math.abs(regSol.x) * 20} y={15} fill={COLORS.muted} fontSize={11} fontWeight={800}>
                  {regSol.x.toFixed(2)}
                </text>
                {regSol.x === 0 && (
                  <text x={42} y={15} fill={COLORS.pink} fontSize={9} fontWeight={900}>SPARSE (0)</text>
                )}
              </g>

              {/* w2 Bar */}
              <g transform="translate(20, 110)">
                <text x={0} y={15} fill={COLORS.muted} fontSize={11} fontWeight={800}>w2*:</text>
                <rect x={36} y={0} width={Math.abs(regSol.y) * 20} height={20} fill={regSol.y === 0 ? COLORS.pink : COLORS.cyan} fillOpacity={0.85} />
                <text x={42 + Math.abs(regSol.y) * 20} y={15} fill={COLORS.muted} fontSize={11} fontWeight={800}>
                  {regSol.y.toFixed(2)}
                </text>
                {regSol.y === 0 && (
                  <text x={42} y={15} fill={COLORS.pink} fontSize={9} fontWeight={900}>SPARSE (0)</text>
                )}
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Constraint Type</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {(["L1", "L2"] as const).map((type) => (
              <button
                aria-label={type === "L1" ? "L1 Lasso (Diamond)" : "L2 Ridge (Circle)"}
                key={type}
                onClick={() => setRegType(type)}
                className={`py-2 text-[9px] font-bold uppercase tracking-wider cursor-pointer border ${
                  regType === type
                    ? "bg-primary border-primary text-on-primary"
                    : "bg-surface hover:bg-surface-container border-outline text-on-surface-variant"
                }`}
              >
                {type === "L1" ? "L1 Lasso (Diamond)" : "L2 Ridge (Circle)"}
              </button>
            ))}
          </div>

          <VisualizationInstruction
            title="Direct Optimum Drag:"
            content="Drag the red **OLS w_hat** dot. Notice how in L1 mode, the solution **snaps** exactly to the horizontal or vertical axis (inducing sparse weights). In L2 mode, the solution slides smoothly along the circle."
            className="uppercase"
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Regularization restricts model weights to prevent overfitting. **L1 regularization** ($L_1$ norm diamond) forces coefficients to land on corners where one coordinate is exactly zero, promoting sparsity. **L2 regularization** ($L_2$ norm circle) shrinks all weights smoothly but rarely forces them to zero.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
