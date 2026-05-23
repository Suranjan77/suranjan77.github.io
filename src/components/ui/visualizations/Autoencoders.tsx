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

const toXPixel = (x: number) => plotConfig.left + (x / 10) * plotConfig.width;
const toYPixel = (y: number) => plotConfig.bottom - (y / 10) * plotConfig.height;
const fromXPixel = (x: number) => ((x - plotConfig.left) / plotConfig.width) * 10;
const fromYPixel = (y: number) => ((plotConfig.bottom - y) / plotConfig.height) * 10;

export default function AutoencodersVisualization() {
  const [inpX, setInpX] = useState(6.0);
  const [inpY, setInpY] = useState(7.0);

  const manifoldY = (x: number) => {
    return 3.0 + 0.18 * (x - 5.0) ** 2;
  };

  const projection = useMemo(() => {
    let minD = Infinity;
    let bestX = 5.0;
    for (let x = 1.0; x <= 9.0; x += 0.05) {
      const y = manifoldY(x);
      const d = (x - inpX) ** 2 + (y - inpY) ** 2;
      if (d < minD) {
        minD = d;
        bestX = x;
      }
    }
    return { x: bestX, y: manifoldY(bestX), distance: Math.sqrt(minD) };
  }, [inpX, inpY]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const curvePoints: Array<{ x: number; y: number }> = [];
    for (let px = plotConfig.left; px <= plotConfig.right; px++) {
      const dataX = fromXPixel(px);
      const dataY = manifoldY(dataX);
      curvePoints.push({ x: px, y: toYPixel(dataY) });
    }
    drawHelper.path(ctx, curvePoints, COLORS.muted, 2.0);

    const inPx = toXPixel(inpX);
    const inPy = toYPixel(inpY);
    const projPx = toXPixel(projection.x);
    const projPy = toYPixel(projection.y);

    drawHelper.line(ctx, inPx, inPy, projPx, projPy, COLORS.yellow, 1.2, [3, 3]);

    drawHelper.point(ctx, inPx, inPy, COLORS.cyan, "reticle", 5.5);
    drawHelper.point(ctx, projPx, projPy, COLORS.pink, "circle", 4.5);

    ctx.fillStyle = COLORS.muted;
    ctx.font = "8px var(--font-mono)";
    ctx.fillText("Data Manifold", toXPixel(7.0), toYPixel(manifoldY(7.0)) - 10);

  }, [inpX, inpY, projection]);

  const handlePlotClick = (x: number, y: number) => {
    setInpX(fromXPixel(x));
    setInpY(fromYPixel(y));
  };

  const handleReset = () => {
    setInpX(6.0);
    setInpY(7.0);
  };

  return (
    <VisualizationShell
      title="Manifold Compression Autoencoders"
      subtitle="Click anywhere on the coordinate plot to position the Input data (cyan). Observe how it compresses onto the training manifold bottleneck (pink)."
      insight="Autoencoders bottleneck information by mapping inputs to a low-dimensional space. The decoder reconstructs outputs, confining prediction spaces onto the target manifold."
      legend={[
        { label: "Input coordinate", color: COLORS.cyan },
        { label: "Decoded reconstruction", color: COLORS.pink },
        { label: "Bottleneck Manifold", color: COLORS.muted },
        { label: "Reconstruction Loss", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot 
            onDraw={onDraw} 
            onClick={handlePlotClick}
            className="h-full w-full cursor-crosshair" 
          />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click plot space to compress coordinates]
          </div>
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
            Bottleneck scalar (z): <span className="font-bold text-pink">{(projection.x - 5.0).toFixed(3)}</span>
            <div className="mt-1 text-on-surface-variant font-bold normal-case">
              Reconstruction Loss: <span className="font-bold text-yellow">{projection.distance.toFixed(3)}</span>
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset Node
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
