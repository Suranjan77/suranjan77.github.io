"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  NarrativeControls,
  VizShell,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Input grid size: 6x6
const inputGrid = [
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
];

// Kernel options
const kernels = {
  vertical: {
    name: "Vertical Edge Detector",
    weights: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ],
  },
  horizontal: {
    name: "Horizontal Edge Detector",
    weights: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ],
  },
};

export default function CNNViz() {
  const [selectedKernel, setSelectedKernel] = useState<"vertical" | "horizontal">("vertical");
  const [scanIndex, setScanIndex] = useState(0); // 0 to 15 (for 4x4 convolutions)
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const kernel = kernels[selectedKernel].weights;

  // Convert scanIndex (0-15) to row/col offsets
  const rOffset = Math.floor(scanIndex / 4);
  const cOffset = scanIndex % 4;

  // Perform element-wise multiplication and summation
  const getCalculation = () => {
    let sum = 0;
    const details: { val: number; w: number; row: number; col: number }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const val = inputGrid[rOffset + r][cOffset + c];
        const w = kernel[r][c];
        sum += val * w;
        details.push({ val, w, row: r, col: c });
      }
    }
    return { sum, details };
  };

  const { sum: currentSum, details: mathDetails } = getCalculation();

  // precompute all 16 feature map values
  const featureMap: number[] = [];
  for (let idx = 0; idx < 16; idx++) {
    const ro = Math.floor(idx / 4);
    const co = idx % 4;
    let s = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        s += inputGrid[ro + r][co + c] * kernel[r][c];
      }
    }
    featureMap.push(s);
  }

  const handleStepForward = () => {
    setScanIndex((prev) => (prev + 1) % 16);
  };

  const handleStepBackward = () => {
    setScanIndex((prev) => (prev > 0 ? prev - 1 : 15));
  };

  const handleReset = () => {
    setScanIndex(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        handleStepForward();
      }, 1500);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying]);

  // Coordinate math for grids
  const inputStart = { x: 50, y: 100 };
  const cellSize = 26;
  const outputStart = { x: 390, y: 120 };
  const outCellSize = 34;

  // Computed coordinates for visual guides
  const scanX = inputStart.x + cOffset * cellSize;
  const scanY = inputStart.y + rOffset * cellSize;

  const outX = outputStart.x + cOffset * outCellSize;
  const outY = outputStart.y + rOffset * outCellSize;

  const canvas = (
    <svg
      className="block h-auto w-full"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Convolutional Neural Network Scanner"
    >
            <title>C N N Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* Input Grid (6x6) */}
            <g>
              <text x={inputStart.x + 3 * cellSize} y={inputStart.y - 14} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>INPUT IMAGE (6x6)</text>
              {inputGrid.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  const isOverlapping =
                    rIdx >= rOffset && rIdx < rOffset + 3 && cIdx >= cOffset && cIdx < cOffset + 3;
                  return (
                    <rect
                      key={`in-${rIdx}-${cIdx}`}
                      x={inputStart.x + cIdx * cellSize}
                      y={inputStart.y + rIdx * cellSize}
                      width={cellSize - 2}
                      height={cellSize - 2}
                      fill={val ? COLORS.cyan : COLORS.bg}
                      fillOpacity={val ? 0.6 : 1}
                      stroke={isOverlapping ? COLORS.yellow : COLORS.grid}
                      strokeWidth={isOverlapping ? 2.5 : 1}
                      className="transition-all duration-300"
                    />
                  );
                })
              )}
            </g>

            {/* Kernel Selector Overlay (Bounding Box sliding) */}
            <motion.rect
              x={scanX}
              y={scanY}
              width={cellSize * 3 - 2}
              height={cellSize * 3 - 2}
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth={3}
              animate={{ x: scanX, y: scanY }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />

            {/* Mathematical calculations bridging lines */}
            <g>
              {/* Connecting lines from kernel overlap center to output cell */}
              <motion.line
                x1={scanX + (cellSize * 3) / 2}
                y1={scanY + (cellSize * 3) / 2}
                x2={outX + outCellSize / 2}
                y2={outY + outCellSize / 2}
                stroke={COLORS.yellow}
                strokeWidth={2}
                strokeDasharray="4 3"
                opacity={0.65}
                animate={{
                  x1: scanX + (cellSize * 3) / 2,
                  y1: scanY + (cellSize * 3) / 2,
                  x2: outX + outCellSize / 2,
                  y2: outY + outCellSize / 2,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
              <motion.circle
                key={`dot-anim-${scanIndex}`}
                cx={scanX + (cellSize * 3) / 2}
                cy={scanY + (cellSize * 3) / 2}
                r={5}
                fill={COLORS.yellow}
                animate={{ cx: outX + outCellSize / 2, cy: outY + outCellSize / 2 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </g>

            {/* Output Feature Map Grid (4x4) */}
            <g>
              <text x={outputStart.x + 2 * outCellSize} y={outputStart.y - 14} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>FEATURE MAP (4x4)</text>
              {featureMap.map((val, idx) => {
                const r = Math.floor(idx / 4);
                const c = idx % 4;
                const isCurrent = idx === scanIndex;
                const isDiscovered = idx <= scanIndex;
                const outValColor = val > 0 ? COLORS.cyan : val < 0 ? COLORS.pink : COLORS.border;
                return (
                  <g key={`out-${idx}`}>
                    <rect
                      x={outputStart.x + c * outCellSize}
                      y={outputStart.y + r * outCellSize}
                      width={outCellSize - 3}
                      height={outCellSize - 3}
                      fill={isDiscovered ? outValColor : COLORS.bg}
                      fillOpacity={isDiscovered ? 0.35 : 1}
                      stroke={isCurrent ? COLORS.yellow : COLORS.grid}
                      strokeWidth={isCurrent ? 2.5 : 1}
                      className="transition-all duration-300"
                    />
                    {isDiscovered && (
                      <text
                        x={outputStart.x + c * outCellSize + outCellSize / 2}
                        y={outputStart.y + r * outCellSize + outCellSize / 2 + 4}
                        textAnchor="middle"
                        fill={COLORS.muted}
                        fontSize={10}
                        fontWeight={900}
                      >
                        {val}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Mathematical Formula Details */}
            <g transform="translate(50, 310)">
              <rect width={540} height={70} fill="none" stroke={COLORS.border} strokeDasharray="3 3" />
              <text x={18} y={26} fill={COLORS.muted} fontSize={11} fontWeight={800}>CONVOLUTION DETAILED SUM FOR SCAN POSITION #{scanIndex + 1}:</text>
              <text x={18} y={48} fill={COLORS.yellow} fontSize={14} fontWeight={950}>
                <tspan data-testid="cnn-current-sum">
                Σ (Pixel × Weight) = {mathDetails.map((d) => `(${d.val}×${d.w})`).join(" + ")} = {currentSum}
                </tspan>
              </text>
            </g>
          </svg>
  );

  const controls = (
    <>
      <div className="flex flex-1 flex-wrap items-center gap-4 border border-outline bg-surface p-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-on-surface-variant">
            Filter Select
          </span>
          <div className="flex gap-2">
            {(["vertical", "horizontal"] as const).map((kKey) => (
              <button
                aria-label={kKey === "vertical" ? "Vertical Edge" : "Horizontal Edge"}
                key={kKey}
                onClick={() => {
                  setSelectedKernel(kKey);
                  handleReset();
                }}
                className={`px-3 py-2 text-[12px] font-bold uppercase tracking-wider cursor-pointer border ${
                  selectedKernel === kKey
                    ? "bg-primary border-primary text-on-primary"
                    : "bg-surface hover:bg-surface-container border-outline text-on-surface-variant"
                }`}
              >
                {kKey === "vertical" ? "Vertical Edge" : "Horizontal Edge"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[12px] font-bold uppercase tracking-wide text-primary">
            Active Kernel Weights
          </span>
          <div className="grid w-28 grid-cols-3 gap-1 text-center text-[12px] font-bold">
            {kernel.map((row, rIdx) =>
              row.map((w, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="border border-outline bg-surface p-1 text-on-surface"
                >
                  {w > 0 ? `+${w}` : w}
                </div>
              )),
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center sm:min-w-[320px]">
        <NarrativeControls
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying(!isPlaying)}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onReset={handleReset}
          currentStep={scanIndex}
          totalSteps={16}
        />
      </div>
    </>
  );

  const mentalModel = (
    <div className="flex flex-col gap-3">
      <p>
        The kernel slides over the image; at each stop it multiplies the 3×3
        patch by the filter weights and sums them into one feature-map cell. The
        same small filter is reused at every position — that weight sharing is
        what lets a CNN detect the same feature wherever it appears.
      </p>
      <pre className="overflow-x-auto rounded border border-outline bg-surface-container p-2.5 font-mono text-[12px] leading-tight text-primary">
{`# 2D Conv loop element
for r in range(out_h):
    for c in range(out_w):
        patch = img[r:r+3, c:c+3]
        out[r, c] = np.sum(patch * kernel)`}
      </pre>
    </div>
  );

  return (
    <VizShell
      canvas={canvas}
      controls={controls}
      caption="A kernel window scans the image. At each stop, the overlapping pixels are multiplied by the filter weights and summed into a single feature-map cell."
      mentalModel={mentalModel}
    />
  );
}
