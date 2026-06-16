"use client";

import React, { useState } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  VisualizationInstruction,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Input canvas size: 6x6
type GridType = number[][];

export default function ComputerVisionViz() {
  // Preset canvas shapes
  const initialGrid = [
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
  ];

  const [grid, setGrid] = useState<GridType>(initialGrid);
  
  // Custom interactive kernel (Sobel vertical edge as default)
  const [kernel, setKernel] = useState<number[]>([
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ]);

  const [edgeThreshold, setEdgeThreshold] = useState(1.5);
  const [showEdgeOnly, setShowEdgeOnly] = useState(false);

  // Cycle weight values on click
  const cycleWeight = (idx: number) => {
    const cycle = [-2, -1, 0, 1, 2];
    const currentVal = kernel[idx];
    const nextValIdx = (cycle.indexOf(currentVal) + 1) % cycle.length;
    const nextKernel = [...kernel];
    nextKernel[idx] = cycle[nextValIdx];
    setKernel(nextKernel);
  };

  // Toggle canvas pixel on click
  const togglePixel = (r: number, c: number) => {
    const nextGrid = grid.map((row, rIdx) =>
      row.map((val, cIdx) => (rIdx === r && cIdx === c ? (val === 1 ? 0 : 1) : val))
    );
    setGrid(nextGrid);
  };

  // Preset operations
  const setPreset = (preset: "vertical" | "box" | "clear") => {
    if (preset === "vertical") {
      setGrid([
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
      ]);
    } else if (preset === "box") {
      setGrid([
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0],
      ]);
    } else {
      setGrid(Array(6).fill(null).map(() => Array(6).fill(0)));
    }
  };

  // Compute 4x4 output grid based on grid and kernel
  const computeOutput = () => {
    const outGrid: number[][] = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let kr = 0; kr < 3; kr++) {
          for (let kc = 0; kc < 3; kc++) {
            const pixelVal = grid[r + kr][c + kc];
            const weightVal = kernel[kr * 3 + kc];
            sum += pixelVal * weightVal;
          }
        }
        outGrid[r][c] = sum;
      }
    }
    return outGrid;
  };

  const outputGrid = computeOutput();

  // Layout params
  const cellW = 24;
  const spacing = 4;
  const canvasStart = { x: 40, y: 100 };
  
  const kernelStart = { x: 236, y: 120 };
  const kernelCellW = 28;

  const outStart = { x: 385, y: 100 };
  const outCellW = 34;

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Computer Vision Sandbox">
            <title>Computer Vision Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* PAINT CANVAS (6x6) */}
            <g>
              <text x={canvasStart.x + 3 * (cellW + spacing) - spacing} y={canvasStart.y - 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>PAINT CANVAS</text>
              {grid.map((row, rIdx) =>
                row.map((val, cIdx) => (
                  <rect
                    key={`pixel-${rIdx}-${cIdx}`}
                    x={canvasStart.x + cIdx * (cellW + spacing)}
                    y={canvasStart.y + rIdx * (cellW + spacing)}
                    width={cellW}
                    height={cellW}
                    fill={val ? COLORS.cyan : COLORS.bg}
                    fillOpacity={val ? 0.65 : 1}
                    stroke={COLORS.border}
                    strokeWidth={1}
                    className="cursor-pointer transition-colors duration-150 hover:stroke-yellow-600"
                    onPointerDown={() => togglePixel(rIdx, cIdx)}
                  />
                ))
              )}
            </g>

            {/* KERNEL MATRIX EDITOR (3x3) */}
            <g>
              <text x={kernelStart.x + 1.5 * (kernelCellW + spacing) - spacing} y={kernelStart.y - 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>KERNEL (Sobel)</text>
              {kernel.map((w, idx) => {
                const kr = Math.floor(idx / 3);
                const kc = idx % 3;
                return (
                  <g key={`w-${idx}`}>
                    <rect
                      x={kernelStart.x + kc * (kernelCellW + spacing)}
                      y={kernelStart.y + kr * (kernelCellW + spacing)}
                      width={kernelCellW}
                      height={kernelCellW}
                      fill={w > 0 ? COLORS.cyan : w < 0 ? COLORS.pink : COLORS.bg}
                      fillOpacity={w !== 0 ? 0.15 : 0.8}
                      stroke={COLORS.yellow}
                      strokeWidth={1.5}
                      className="cursor-pointer transition-colors duration-150 hover:stroke-amber-500"
                      onPointerDown={() => cycleWeight(idx)}
                    />
                    <text
                      x={kernelStart.x + kc * (kernelCellW + spacing) + kernelCellW / 2}
                      y={kernelStart.y + kr * (kernelCellW + spacing) + kernelCellW / 2 + 4}
                      textAnchor="middle"
                      fill={COLORS.muted}
                      fontSize={11}
                      fontWeight={900}
                      className="pointer-events-none select-none"
                    >
                      {w > 0 ? `+${w}` : w}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* FILTER OUTPUT (4x4) */}
            <g>
              <text x={outStart.x + 2 * (outCellW + spacing) - spacing} y={outStart.y - 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>CONVOLVED OUTPUT</text>
              {outputGrid.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const isEdge = Math.abs(val) >= edgeThreshold;
                  const glowColor = val >= 0 ? COLORS.cyan : COLORS.pink;
                  const showCell = !showEdgeOnly || isEdge;
                  
                  return (
                    <g key={`out-${rIdx}-${cIdx}`}>
                      <motion.rect
                        x={outStart.x + cIdx * (outCellW + spacing)}
                        y={outStart.y + rIdx * (outCellW + spacing)}
                        width={outCellW}
                        height={outCellW}
                        fill={showCell ? (val > 0 ? COLORS.cyan : val < 0 ? COLORS.pink : COLORS.bg) : COLORS.bg}
                        fillOpacity={showCell && val !== 0 ? 0.35 : 0.8}
                        stroke={isEdge ? glowColor : COLORS.grid}
                        strokeWidth={isEdge ? 2.5 : 1}
                        filter={isEdge ? "url(#glow)" : undefined}
                      />
                      <text
                        data-testid={`cv-output-${rIdx}-${cIdx}`}
                        x={outStart.x + cIdx * (outCellW + spacing) + outCellW / 2}
                        y={outStart.y + rIdx * (outCellW + spacing) + outCellW / 2 + 4}
                        textAnchor="middle"
                        fill={COLORS.muted}
                        fontSize={10}
                        fontWeight={950}
                      >
                        {val}
                      </text>
                    </g>
                  );
                })
              )}
            </g>

            {/* Connecting arrows */}
            <g>
              <path d="M 194,152 L 222,152" fill="none" stroke={COLORS.border} strokeWidth={2} markerEnd="url(#arrow)" />
              <path d="M 334,152 L 370,152" fill="none" stroke={COLORS.border} strokeWidth={2} markerEnd="url(#arrow)" />
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Painting Presets</span>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-4">
            <button aria-label="BAR"
              onClick={() => setPreset("vertical")}
              className="py-1 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
            >
              BAR
            </button>
            <button aria-label="BOX"
              onClick={() => setPreset("box")}
              className="py-1 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
            >
              BOX
            </button>
            <button aria-label="CLEAR"
              onClick={() => setPreset("clear")}
              className="py-1 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
            >
              CLEAR
            </button>
          </div>

          <div className="mb-3">
            <label className="block text-[12px] font-bold uppercase tracking-wide text-on-surface-variant mb-1">
              EDGE GLOW THRESHOLD:
            </label>
            <input aria-label="ComputerVision input"
              type="range"
              min="0.5"
              max="4.0"
              step="0.5"
              value={edgeThreshold}
              onChange={(e) => setEdgeThreshold(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[12px] text-on-surface-variant font-bold mt-1">
              <span>0.5 (low)</span>
              <span>Active: {edgeThreshold.toFixed(1)}</span>
              <span>4.0 (high)</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-on-surface-variant">
              Edge Filter Isolation:
            </span>
            <button aria-label="ISOLATE ALL CELLS"
              onClick={() => setShowEdgeOnly(!showEdgeOnly)}
              className={`px-3 py-1 border text-[12px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                showEdgeOnly ? "bg-cyan/20 border-cyan text-cyan" : "bg-surface"
              }`}
            >
              {showEdgeOnly ? "ISOLATE" : "ALL CELLS"}
            </button>
          </div>

          <VisualizationInstruction
            title="Interactivity Sandbox:"
            content={`1. Paint on the left grid.
2. Click weight cells in the kernel matrix to edit weights in real-time.`}
            className="uppercase"
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Filters are local 2D weight kernels. Edges are detected when neighborhood pixel patterns produce high absolute correlation outputs. Glow highlighting triggers when convolved cell scores exceed threshold.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
