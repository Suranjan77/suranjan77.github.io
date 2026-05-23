"use client";

import React, { useState, useMemo, useCallback } from "react";
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
const fromXPixel = (x: number) => ((x - plotConfig.left) / plotConfig.width) * 10;
const fromYPixel = (y: number) => ((plotConfig.bottom - y) / plotConfig.height) * 10;

export default function LinearAlgebraVisualization() {
  const [vecA, setVecA] = useState({ x: 4.5, y: 7.5 });
  const vecB = useMemo(() => ({ x: 7.5, y: 2.5 }), []);

  // Compute projection vector of A onto B
  const projection = useMemo(() => {
    const dotProduct = vecA.x * vecB.x + vecA.y * vecB.y;
    const magBSq = vecB.x ** 2 + vecB.y ** 2;
    const scale = dotProduct / (magBSq || 1);
    return {
      x: scale * vecB.x,
      y: scale * vecB.y,
      scale,
      dotProduct
    };
  }, [vecA, vecB]);

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const x0 = toXPixel(0);
    const y0 = toYPixel(0);
    const xa = toXPixel(vecA.x);
    const ya = toYPixel(vecA.y);
    const xb = toXPixel(vecB.x);
    const yb = toYPixel(vecB.y);
    const xproj = toXPixel(projection.x);
    const yproj = toYPixel(projection.y);

    // Vector A (Pink)
    drawHelper.line(ctx, x0, y0, xa, ya, COLORS.pink, 3.0);
    // Vector B (Cyan)
    drawHelper.line(ctx, x0, y0, xb, yb, COLORS.cyan, 3.0);

    // Projection dashed drop line (Yellow)
    drawHelper.line(ctx, xa, ya, xproj, yproj, COLORS.yellow, 1.2, [3, 3]);

    // Vector labels
    drawHelper.text(ctx, "A", xa + 8, ya, COLORS.pink, "bold 9px var(--font-mono)");
    drawHelper.text(ctx, "B", xb + 8, yb, COLORS.cyan, "bold 9px var(--font-mono)");
    drawHelper.text(ctx, "Proj_B(A)", xproj + 8, yproj + 8, COLORS.yellow, "bold 8px var(--font-mono)");
  }, [vecA, vecB, projection]);

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0 && dataX <= 10 && dataY >= 0 && dataY <= 10) {
      setVecA({ x: dataX, y: dataY });
    }
  };

  return (
    <VisualizationShell
      title="Vector Projections & Transformations"
      subtitle="Click anywhere on the grid workspace to reposition Vector A (pink). Observe its orthogonal projection vector (Proj_B) onto Vector B (cyan)."
      insight="A dot product represents the projection of Vector A onto Vector B, scaled by Vector B's magnitude."
      legend={[
        { label: "Vector A", color: COLORS.pink },
        { label: "Vector B", color: COLORS.cyan },
        { label: "Projection", color: COLORS.yellow },
      ]}
    >
      <PlotFrame className="min-h-[360px] relative">
        <NativeCanvasPlot onDraw={onDraw} onClick={handlePlotClick} className="h-full w-full cursor-crosshair" />
        <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
          [Click plot space to change Vector A]
        </div>
        <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary shadow-sm rounded-sm backdrop-blur-xs">
          Dot Product (A·B): <span className="font-bold text-pink">{projection.dotProduct.toFixed(2)}</span>
          <div className="mt-1 text-on-surface-variant font-bold normal-case">
            Proj Scale factor: <span className="text-yellow font-bold">{projection.scale.toFixed(2)}x</span>
          </div>
        </div>
      </PlotFrame>
    </VisualizationShell>
  );
}
