"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SVGFilters, VizShell } from "../visualizationPrimitives";

const W = 640;
const H = 300;

type GridType = number[][];

export default function ComputerVisionViz() {
  const initialGrid = [
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
  ];

  const [grid, setGrid] = useState<GridType>(initialGrid);
  const [kernel, setKernel] = useState<number[]>([-1, 0, 1, -2, 0, 2, -1, 0, 1]);
  const [edgeThreshold, setEdgeThreshold] = useState(1.5);
  const [showEdgeOnly, setShowEdgeOnly] = useState(false);

  const cycleWeight = (idx: number) => {
    const cycle = [-2, -1, 0, 1, 2];
    const next = [...kernel];
    next[idx] = cycle[(cycle.indexOf(kernel[idx]) + 1) % cycle.length];
    setKernel(next);
  };

  const togglePixel = (r: number, c: number) => {
    setGrid(grid.map((row, rIdx) => row.map((val, cIdx) => (rIdx === r && cIdx === c ? (val === 1 ? 0 : 1) : val))));
  };

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

  const computeOutput = () => {
    const out: number[][] = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let kr = 0; kr < 3; kr++) {
          for (let kc = 0; kc < 3; kc++) {
            sum += grid[r + kr][c + kc] * kernel[kr * 3 + kc];
          }
        }
        out[r][c] = sum;
      }
    }
    return out;
  };
  const outputGrid = computeOutput();

  const cellW = 24;
  const spacing = 4;
  const canvasStart = { x: 36, y: 70 };
  const kernelStart = { x: 250, y: 92 };
  const kernelCellW = 28;
  const outStart = { x: 400, y: 70 };
  const outCellW = 34;

  const maxAbs = Math.max(1, ...outputGrid.flat().map((v) => Math.abs(v)));
  const edgeCount = outputGrid.flat().filter((v) => Math.abs(v) >= edgeThreshold).length;

  const caption = `An image is just a grid of numbers (paint cells on the left). A small 3×3 kernel slides over it and, at each spot, multiplies-and-sums the overlap — that is convolution. This Sobel kernel has negative weights on the left and positive on the right, so it fires (bright cells) exactly where the image jumps from dark to light: a vertical edge. ${edgeCount} cell${edgeCount === 1 ? "" : "s"} cross the edge threshold. Edit the kernel weights and the feature it detects changes.`;

  const canvas = (
    <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Computer Vision Sandbox">
      <title>Computer Vision Sandbox</title>
      <SVGFilters />
      <defs>
        <marker id="cv-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.border} />
        </marker>
      </defs>
      <rect width={W} height={H} fill={COLORS.bg} />

      {/* PAINT CANVAS (6x6) */}
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
        )),
      )}

      {/* KERNEL (3x3, editable) */}
      <text x={kernelStart.x + 1.5 * (kernelCellW + spacing) - spacing} y={kernelStart.y - 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>KERNEL</text>
      {kernel.map((wt, idx) => {
        const kr = Math.floor(idx / 3);
        const kc = idx % 3;
        return (
          <g key={`w-${idx}`}>
            <rect
              x={kernelStart.x + kc * (kernelCellW + spacing)}
              y={kernelStart.y + kr * (kernelCellW + spacing)}
              width={kernelCellW}
              height={kernelCellW}
              fill={wt > 0 ? COLORS.cyan : wt < 0 ? COLORS.pink : COLORS.bg}
              fillOpacity={wt !== 0 ? 0.15 : 0.8}
              stroke={COLORS.yellow}
              strokeWidth={1.5}
              className="cursor-pointer transition-colors duration-150 hover:stroke-amber-500"
              onPointerDown={() => cycleWeight(idx)}
            />
            <text x={kernelStart.x + kc * (kernelCellW + spacing) + kernelCellW / 2} y={kernelStart.y + kr * (kernelCellW + spacing) + kernelCellW / 2 + 4} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={900} className="pointer-events-none select-none">
              {wt > 0 ? `+${wt}` : wt}
            </text>
          </g>
        );
      })}

      {/* OUTPUT (4x4) */}
      <text x={outStart.x + 2 * (outCellW + spacing) - spacing} y={outStart.y - 16} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>EDGE MAP</text>
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
                fillOpacity={showCell && val !== 0 ? 0.15 + 0.5 * (Math.abs(val) / maxAbs) : 0.8}
                stroke={isEdge ? glowColor : COLORS.grid}
                strokeWidth={isEdge ? 2.5 : 1}
                filter={isEdge ? "url(#glow)" : undefined}
              />
              <text data-testid={`cv-output-${rIdx}-${cIdx}`} x={outStart.x + cIdx * (outCellW + spacing) + outCellW / 2} y={outStart.y + rIdx * (outCellW + spacing) + outCellW / 2 + 4} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={950}>
                {val}
              </text>
            </g>
          );
        }),
      )}

      {/* arrows */}
      <path d={`M 210,${canvasStart.y + 50} L 244,${canvasStart.y + 50}`} fill="none" stroke={COLORS.border} strokeWidth={2} markerEnd="url(#cv-arrow)" />
      <path d={`M 348,${canvasStart.y + 50} L 392,${canvasStart.y + 50}`} fill="none" stroke={COLORS.border} strokeWidth={2} markerEnd="url(#cv-arrow)" />
    </svg>
  );

  const controls = (
    <>
      <div className="flex flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Paint a shape</span>
        <div className="flex gap-1.5">
          {(["vertical", "box", "clear"] as const).map((p) => (
            <button
              key={p}
              aria-label={p === "vertical" ? "BAR" : p === "box" ? "BOX" : "CLEAR"}
              onClick={() => setPreset(p)}
              className="flex-1 border border-outline bg-surface px-2 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
            >
              {p === "vertical" ? "Bar" : p === "box" ? "Box" : "Clear"}
            </button>
          ))}
        </div>
        <p className="font-sans text-[12px] leading-snug text-on-surface-variant">
          Click canvas cells to paint, and click kernel cells to cycle their weight (−2…+2).
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 border border-outline bg-surface p-3">
        <label htmlFor="cv-threshold" className="flex items-center justify-between font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
          <span>Edge threshold</span>
          <span className="text-on-surface">{edgeThreshold.toFixed(1)}</span>
        </label>
        <input id="cv-threshold" aria-label="Edge threshold" type="range" min={0.5} max={4} step={0.5} value={edgeThreshold} onChange={(e) => setEdgeThreshold(parseFloat(e.target.value))} className="w-full cursor-pointer accent-primary" />
        <button
          aria-label="Toggle edge isolation"
          aria-pressed={showEdgeOnly}
          onClick={() => setShowEdgeOnly((s) => !s)}
          className={`w-max border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${showEdgeOnly ? "border-primary bg-primary text-on-primary" : "border-outline bg-surface text-on-surface-variant hover:bg-surface-container"}`}
        >
          {showEdgeOnly ? "Showing edges only" : "Show edges only"}
        </button>
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-2">
      <p>
        To a computer an image is a grid of brightness numbers. The fundamental operation of
        computer vision is <strong>convolution</strong>: slide a small <strong>kernel</strong> (a
        few weights) across the image and, at each position, multiply the overlapping pixels by the
        weights and add them up.
      </p>
      <p>
        A kernel is a <strong>feature detector</strong>. This one (negative on the left, positive on
        the right) produces a big response only where brightness changes left-to-right — a{" "}
        <strong>vertical edge</strong>. Rotate the weights and it detects horizontal edges; other
        patterns detect corners, blobs, or textures.
      </p>
      <p>
        A <strong>CNN</strong> stacks many such kernels and — crucially — <em>learns</em> their
        weights instead of hand-setting them, building up from edges to shapes to objects across
        layers.
      </p>
    </div>
  );

  return <VizShell canvas={canvas} controls={controls} caption={caption} mentalModel={mentalModel} />;
}
