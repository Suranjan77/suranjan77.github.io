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

const plotConfig = {
  left: 40,
  right: 296,
  top: 24,
  bottom: 190,
  width: 256,
  height: 166,
};

export default function CnnVisualization() {
  const [stride, setStride] = useState(1);
  const [stepIdx, setStepIdx] = useState(0);

  const inputMap = useMemo(() => [
    [1, 1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1]
  ], []);

  const kernel = useMemo(() => [
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1]
  ], []);

  const outSize = stride === 1 ? 4 : 2;
  const maxSteps = outSize * outSize;

  const currentX = stepIdx % outSize;
  const currentY = Math.floor(stepIdx / outSize);

  const mathTrace = useMemo(() => {
    let sum = 0;
    const details: string[] = [];
    const startX = currentX * stride;
    const startY = currentY * stride;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const val = inputMap[startY + r][startX + c];
        const w = kernel[r][c];
        sum += val * w;
        details.push(`(${val}·${w >= 0 ? w : `(${w})`})`);
      }
    }
    return { sum, equation: details.join(" + ") };
  }, [currentX, currentY, stride, inputMap, kernel]);

  const handleNext = () => {
    setStepIdx((curr) => (curr + 1) % maxSteps);
  };

  const handlePrev = () => {
    setStepIdx((curr) => (curr - 1 + maxSteps) % maxSteps);
  };

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    const inGridSize = 6;
    const cellW = 16;
    const inStartX = 40;
    const inStartY = 60;

    for (let r = 0; r < inGridSize; r++) {
      for (let c = 0; c < inGridSize; c++) {
        const val = inputMap[r][c];
        const cx = inStartX + c * cellW;
        const cy = inStartY + r * cellW;

        ctx.fillStyle = val === 1 ? "#BEB6A5" : "#FAF8F2";
        ctx.strokeStyle = "rgba(30, 27, 22, 0.15)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.rect(cx, cy, cellW, cellW);
        ctx.fill();
        ctx.stroke();
      }
    }

    const activeInX = inStartX + currentX * stride * cellW;
    const activeInY = inStartY + currentY * stride * cellW;
    ctx.save();
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(activeInX, activeInY, cellW * 3, cellW * 3);
    ctx.stroke();
    ctx.restore();

    const outGridSize = outSize;
    const outCellW = 18;
    const outStartX = 200;
    const outStartY = 75;

    for (let r = 0; r < outGridSize; r++) {
      for (let c = 0; c < outGridSize; c++) {
        const cx = outStartX + c * outCellW;
        const cy = outStartY + r * outCellW;
        const isActive = c === currentX && r === currentY;

        ctx.fillStyle = isActive ? "rgba(141, 81, 73, 0.2)" : "#FAF8F2";
        ctx.strokeStyle = isActive ? COLORS.pink : "rgba(30, 27, 22, 0.15)";
        ctx.lineWidth = isActive ? 1.2 : 0.5;
        ctx.beginPath();
        ctx.rect(cx, cy, outCellW, outCellW);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = COLORS.muted;
        ctx.font = "7px var(--font-mono)";
        ctx.textAlign = "center";
        
        let sum = 0;
        for (let kr = 0; kr < 3; kr++) {
          for (let kc = 0; kc < 3; kc++) {
            sum += inputMap[r * stride + kr][c * stride + kc] * kernel[kr][kc];
          }
        }
        ctx.fillText(String(sum), cx + outCellW/2, cy + outCellW/2);
      }
    }

    const outActiveX = outStartX + currentX * outCellW + outCellW/2;
    const outActiveY = outStartY + currentY * outCellW + outCellW/2;

    drawHelper.line(ctx, activeInX, activeInY, outActiveX, outActiveY, "rgba(146, 122, 75, 0.35)", 0.8, [2, 2]);
    drawHelper.line(ctx, activeInX + cellW*3, activeInY, outActiveX, outActiveY, "rgba(146, 122, 75, 0.35)", 0.8, [2, 2]);
    drawHelper.line(ctx, activeInX, activeInY + cellW*3, outActiveX, outActiveY, "rgba(146, 122, 75, 0.35)", 0.8, [2, 2]);
    drawHelper.line(ctx, activeInX + cellW*3, activeInY + cellW*3, outActiveX, outActiveY, "rgba(146, 122, 75, 0.35)", 0.8, [2, 2]);

    ctx.fillStyle = COLORS.muted;
    ctx.font = "bold 8px var(--font-mono)";
    ctx.textAlign = "center";
    ctx.fillText("Input grid (6x6)", inStartX + (cellW*6)/2, inStartY - 10);
    ctx.fillText("Feature Map", outStartX + (outCellW*outSize)/2, outStartY - 10);

  }, [stride, stepIdx, currentX, currentY, outSize, inputMap, kernel]);

  return (
    <VisualizationShell
      title="Spatial Filter Convolutions"
      subtitle="Click Step controls to move the kernel sliding window (yellow). Observe the mathematical sum mapping to the output feature map (pink)."
      insight="Convolutional layers slide parameterized kernels over grids to scan for localized features. This retains spatial structure while summarizing activation densities."
      legend={[
        { label: "Input Window", color: COLORS.yellow },
        { label: "Output Cell", color: COLORS.pink },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />
          <div className="absolute left-12 top-6 border border-outline bg-surface/90 px-3 py-1 font-mono text-[8px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs max-w-[200px]">
            {mathTrace.equation} = <span className="font-bold text-pink">{mathTrace.sum}</span>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Stride Step size</span>
            <div className="flex gap-2 mt-1">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStride(s);
                    setStepIdx(0);
                  }}
                  className={`flex-1 border border-outline px-3 py-1.5 font-mono text-[10px] font-semibold rounded transition-all cursor-pointer ${
                    stride === s ? "bg-primary text-on-primary border-primary" : "bg-surface-container text-on-surface border border-outline hover:bg-primary/10"
                  }`}
                >
                  Stride = {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="flex-1 border border-outline rounded bg-surface-container text-on-surface border border-outline px-2 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 hover:border-primary/50 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              className="flex-1 border border-outline rounded bg-primary text-on-primary border-primary px-2 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Next Step
            </button>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
