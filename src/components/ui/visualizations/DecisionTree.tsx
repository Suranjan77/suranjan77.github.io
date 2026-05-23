"use client";

import React, { useState, useCallback } from "react";
import {
  COLORS,
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

const toXPixel = (x: number) => plotConfig.left + (x / 10) * plotConfig.width;
const toYPixel = (y: number) => plotConfig.bottom - (y / 10) * plotConfig.height;

export default function DecisionTreeVisualization() {
  const [points] = useState<Array<{ x: number; y: number; label: "A" | "B" }>>([
    { x: 1.5, y: 7.2, label: "A" },
    { x: 3.2, y: 8.5, label: "A" },
    { x: 2.8, y: 5.5, label: "A" },
    { x: 4.8, y: 3.2, label: "B" },
    { x: 6.5, y: 2.8, label: "B" },
    { x: 7.2, y: 4.8, label: "B" },
    { x: 8.5, y: 7.9, label: "A" },
    { x: 9.2, y: 8.8, label: "A" },
  ]);
  const [splitX, setSplitX] = useState(5.0);
  const [splitY, setSplitY] = useState(6.2);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const sxPx = toXPixel(splitX);
    const syPx = toYPixel(splitY);

    ctx.save();
    ctx.fillStyle = "rgba(141, 81, 73, 0.06)";
    ctx.fillRect(sxPx, plotConfig.top, plotConfig.right - sxPx, plotConfig.height);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(85, 107, 74, 0.06)";
    ctx.fillRect(plotConfig.left, plotConfig.top, sxPx - plotConfig.left, syPx - plotConfig.top);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(141, 81, 73, 0.06)";
    ctx.fillRect(plotConfig.left, syPx, sxPx - plotConfig.left, plotConfig.bottom - syPx);
    ctx.restore();

    drawHelper.line(ctx, sxPx, plotConfig.top, sxPx, plotConfig.bottom, COLORS.cyan, 2.5);
    drawHelper.line(ctx, plotConfig.left, syPx, sxPx, syPx, COLORS.yellow, 1.5, [4, 4]);

    points.forEach((p) => {
      const px = toXPixel(p.x);
      const py = toYPixel(p.y);
      drawHelper.point(ctx, px, py, p.label === "A" ? COLORS.cyan : COLORS.pink, "reticle", 5.5);
    });
  }, [points, splitX, splitY]);

  return (
    <VisualizationShell
      title="Recursive Feature Space Partitioning"
      subtitle="Adjust split thresholds with the sliders. Inspect how boundaries carve the 2D plane and sync with the logic tree structure flowchart."
      insight="Decision trees recursively split features along orthogonal axes, building a flowchart tree of linear rules. It is highly interpretable but prone to variance."
      legend={[
        { label: "Class A Region", color: "rgba(85, 107, 74, 0.1)" },
        { label: "Class B Region", color: "rgba(141, 81, 73, 0.1)" },
        { label: "Split X Threshold", color: COLORS.cyan },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot
            onDraw={onDraw}
            className="h-full w-full"
          />
        </PlotFrame>

        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded border border-outline bg-surface p-4 flex flex-col items-center justify-center gap-4 font-mono text-[10px] text-on-surface">
            <div className="border border-cyan bg-surface px-4 py-2 font-bold text-center rounded shadow-xs">
              Is X &lt; {splitX.toFixed(1)}?
            </div>

            <div className="flex w-full justify-between gap-4">
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="h-4 w-px bg-outline" />
                <div className="border border-warning bg-surface px-3 py-1.5 font-bold text-center rounded shadow-xs">
                  Is Y &gt; {splitY.toFixed(1)}?
                </div>
                <div className="flex justify-between w-full gap-2 mt-2">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-on-surface-variant mb-1 font-bold">Yes</span>
                    <div className="w-8 py-2 bg-cyan text-on-primary text-center font-bold rounded">A</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-on-surface-variant mb-1 font-bold">No</span>
                    <div className="w-8 py-2 bg-error text-on-primary text-center font-bold rounded">B</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="h-4 w-px bg-outline" />
                <div className="border border-outline bg-surface-container-high px-3 py-1.5 font-bold text-center rounded opacity-40">
                  Default Leaf
                </div>
                <div className="flex flex-col items-center mt-2">
                  <span className="text-on-surface-variant mb-1 font-bold">No</span>
                  <div className="w-8 py-2 bg-error text-on-primary text-center font-bold rounded">B</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded border border-outline bg-surface p-4 font-mono text-xs text-on-surface">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Split Threshold X</span>
                <span className="text-primary font-bold">{splitX.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.1"
                value={splitX}
                onChange={(e) => setSplitX(parseFloat(e.target.value))}
                className="w-full accent-primary my-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>Split Threshold Y</span>
                <span className="text-warning font-bold">{splitY.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="8.0"
                step="0.1"
                value={splitY}
                onChange={(e) => setSplitY(parseFloat(e.target.value))}
                className="w-full accent-primary my-1"
              />
            </div>
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}
