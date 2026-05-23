"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  COLORS,
  ControlPanel,
  PlotFrame,
  VisualizationShell,
  NativeCanvasPlot,
  drawHelper,
} from "../visualizationPrimitives";

export default function ComputerVisionVisualization() {
  const [filterType, setFilterType] = useState<"sobelX" | "sobelY">("sobelX");
  const [threshold, setThreshold] = useState(40);
  const [rawImage, setRawImage] = useState<number[][]>([
    [0, 0, 0, 0, 9, 9, 9, 9],
    [0, 0, 0, 9, 9, 9, 9, 0],
    [0, 0, 9, 9, 9, 9, 0, 0],
    [0, 9, 9, 9, 9, 0, 0, 0],
    [9, 9, 9, 9, 0, 0, 0, 0],
    [9, 9, 9, 0, 0, 0, 0, 0],
    [9, 9, 0, 0, 0, 0, 0, 0],
    [9, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const sobelValues = useMemo(() => {
    const outputs = Array.from({ length: 6 }, () => Array(6).fill(0));
    const directions = Array.from({ length: 6 }, () => Array(6).fill(0));

    const kx = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    const ky = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    for (let r = 1; r < 7; r++) {
      for (let c = 1; c < 7; c++) {
        let sxVal = 0;
        let syVal = 0;
        
        for (let kr = 0; kr < 3; kr++) {
          for (let kc = 0; kc < 3; kc++) {
            const val = rawImage[r - 1 + kr][c - 1 + kc];
            sxVal += val * kx[kr][kc];
            syVal += val * ky[kr][kc];
          }
        }
        
        outputs[r - 1][c - 1] = filterType === "sobelX" ? sxVal : syVal;
        directions[r - 1][c - 1] = Math.atan2(syVal, sxVal);
      }
    }
    return { outputs, directions };
  }, [filterType, rawImage]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    const cellW = 14;
    const inStartX = 40;
    const inStartY = 60;
    const outStartX = 190;
    const outStartY = 60;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const val = rawImage[r][c];
        const cx = inStartX + c * cellW;
        const cy = inStartY + r * cellW;

        ctx.fillStyle = val > 0 ? "rgba(30, 27, 22, 0.85)" : "#FAF8F2";
        ctx.strokeStyle = "rgba(30, 27, 22, 0.1)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.rect(cx, cy, cellW, cellW);
        ctx.fill();
        ctx.stroke();
      }
    }

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const val = Math.abs(sobelValues.outputs[r][c]);
        const isEdge = val > threshold * 0.25;
        const cx = outStartX + (c+1) * cellW;
        const cy = outStartY + (r+1) * cellW;

        ctx.fillStyle = isEdge ? COLORS.pink : "#FAF8F2";
        ctx.strokeStyle = "rgba(30, 27, 22, 0.1)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.rect(cx, cy, cellW, cellW);
        ctx.fill();
        ctx.stroke();

        if (isEdge) {
          const arrowDir = sobelValues.directions[r][c];
          const acx = cx + cellW/2;
          const acy = cy + cellW/2;
          const arrowLen = 5;

          ctx.save();
          ctx.strokeStyle = COLORS.yellow;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(acx - Math.cos(arrowDir) * arrowLen, acy - Math.sin(arrowDir) * arrowLen);
          ctx.lineTo(acx + Math.cos(arrowDir) * arrowLen, acy + Math.sin(arrowDir) * arrowLen);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    ctx.fillStyle = COLORS.muted;
    ctx.font = "bold 8px var(--font-mono)";
    ctx.textAlign = "center";
    ctx.fillText("Raw Feature (8x8)", inStartX + (cellW*8)/2, inStartY - 10);
    ctx.fillText("Sobel Edge gradients", outStartX + (cellW*8)/2, outStartY - 10);

  }, [rawImage, sobelValues, threshold]);

  const handlePlotClick = (x: number, y: number) => {
    const inStartX = 40;
    const inStartY = 60;
    const cellW = 14;
    const colIdx = Math.floor((x - inStartX) / cellW);
    const rowIdx = Math.floor((y - inStartY) / cellW);

    if (colIdx >= 0 && colIdx < 8 && rowIdx >= 0 && rowIdx < 8) {
      setRawImage((curr) => {
        const nextImg = curr.map((row) => [...row]);
        nextImg[rowIdx][colIdx] = nextImg[rowIdx][colIdx] === 9 ? 0 : 9;
        return nextImg;
      });
    }
  };

  const handleReset = () => {
    setRawImage([
      [0, 0, 0, 0, 9, 9, 9, 9],
      [0, 0, 0, 9, 9, 9, 9, 0],
      [0, 0, 9, 9, 9, 9, 0, 0],
      [0, 9, 9, 9, 9, 0, 0, 0],
      [9, 9, 9, 9, 0, 0, 0, 0],
      [9, 9, 9, 0, 0, 0, 0, 0],
      [9, 9, 0, 0, 0, 0, 0, 0],
      [9, 0, 0, 0, 0, 0, 0, 0],
    ]);
  };

  return (
    <VisualizationShell
      title="Gradient Edge Detectors"
      subtitle="Click grid cells on the left to draw/erase edges. Toggle horizontal vs vertical filters to view output directionality."
      insight="Computer vision models use directional convolutional filters (like Sobel operators) to compute image intensity derivatives, exposing geometric boundary edges."
      legend={[
        { label: "Edge Intensity", color: COLORS.pink },
        { label: "Gradient Direction", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} onClick={handlePlotClick} className="h-full w-full cursor-pointer" />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click left grid to toggle edge pixels]
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Filter Direction</span>
            <div className="flex gap-2 mt-1">
              {["sobelX", "sobelY"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`flex-1 border px-2 py-1.5 font-mono text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    filterType === type ? "bg-primary text-on-primary border-primary" : "bg-surface hover:bg-primary/10"
                  }`}
                >
                  {type === "sobelX" ? "Horizontal (X)" : "Vertical (Y)"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex justify-between font-bold">
              <span>Threshold Cutoff</span>
              <span className="text-warning font-bold">{threshold}</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full accent-primary my-1"
            />
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset Image
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
