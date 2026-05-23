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

export default function KnnVisualization() {
  const [points, setPoints] = useState<Array<{ x: number; y: number; label: "A" | "B" }>>([
    { x: 1.8, y: 6.8, label: "A" },
    { x: 2.2, y: 7.8, label: "A" },
    { x: 3.5, y: 6.2, label: "A" },
    { x: 4.1, y: 7.2, label: "A" },
    { x: 5.8, y: 3.8, label: "B" },
    { x: 6.5, y: 2.8, label: "B" },
    { x: 7.2, y: 4.8, label: "B" },
    { x: 8.2, y: 3.2, label: "B" },
  ]);
  const [query, setQuery] = useState({ x: 5.0, y: 5.0 });
  const [k, setK] = useState(3);
  const [interactMode, setInteractMode] = useState<"query" | "addA" | "addB">("query");

  const nearest = useMemo(() => {
    const items = points.map((p) => {
      const dist = Math.sqrt((p.x - query.x) ** 2 + (p.y - query.y) ** 2);
      return { ...p, dist };
    });
    return items.sort((a, b) => a.dist - b.dist);
  }, [points, query]);

  const activeNeighbors = useMemo(() => nearest.slice(0, Math.min(k, nearest.length)), [nearest, k]);
  const countA = activeNeighbors.filter((n) => n.label === "A").length;
  const countB = activeNeighbors.length - countA;
  const winner = countA > countB ? "A" : (countB > countA ? "B" : "Tie");

  const neighborhoodRadius = activeNeighbors.length > 0 ? activeNeighbors[activeNeighbors.length - 1].dist : 0;

  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);

    const qx = toXPixel(query.x);
    const qy = toYPixel(query.y);

    const rPx = neighborhoodRadius * (plotConfig.width / 10);
    ctx.save();
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(qx, qy, rPx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    activeNeighbors.forEach((n) => {
      drawHelper.line(ctx, qx, qy, toXPixel(n.x), toYPixel(n.y), COLORS.yellow, 1.2);
    });

    points.forEach((p) => {
      const px = toXPixel(p.x);
      const py = toYPixel(p.y);
      drawHelper.point(ctx, px, py, p.label === "A" ? COLORS.cyan : COLORS.pink, "reticle", 5.5);
    });

    const queryColor = winner === "A" ? COLORS.cyan : (winner === "B" ? COLORS.pink : COLORS.muted);
    drawHelper.point(ctx, qx, qy, queryColor, "triangle", 6.5);
  }, [points, query, activeNeighbors, neighborhoodRadius, winner]);

  const handlePlotClick = (x: number, y: number) => {
    const dataX = fromXPixel(x);
    const dataY = fromYPixel(y);
    if (dataX >= 0.5 && dataX <= 9.5 && dataY >= 0.5 && dataY <= 9.5) {
      if (interactMode === "query") {
        setQuery({ x: dataX, y: dataY });
      } else if (interactMode === "addA") {
        setPoints((curr) => [...curr, { x: dataX, y: dataY, label: "A" }]);
      } else if (interactMode === "addB") {
        setPoints((curr) => [...curr, { x: dataX, y: dataY, label: "B" }]);
      }
    }
  };

  const handleReset = () => {
    setPoints([
      { x: 1.8, y: 6.8, label: "A" },
      { x: 2.2, y: 7.8, label: "A" },
      { x: 3.5, y: 6.2, label: "A" },
      { x: 4.1, y: 7.2, label: "A" },
      { x: 5.8, y: 3.8, label: "B" },
      { x: 6.5, y: 2.8, label: "B" },
      { x: 7.2, y: 4.8, label: "B" },
      { x: 8.2, y: 3.2, label: "B" },
    ]);
    setQuery({ x: 5.0, y: 5.0 });
    setK(3);
    setInteractMode("query");
  };

  return (
    <VisualizationShell
      title="Local Voting Neighborhoods (KNN)"
      subtitle="Configure K and click Mode buttons. Interact by clicking the grid: translate the query node (triangle) or add observation points."
      insight="KNN classifies data locally. It does not fit equations; it simply searches for coordinates closest to the query node and tallies their labels."
      legend={[
        { label: "Class A", color: COLORS.cyan },
        { label: "Class B", color: COLORS.pink },
        { label: "Neighborhood Bounds", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot
            onDraw={onDraw}
            onClick={handlePlotClick}
            className="h-full w-full cursor-crosshair"
          />
          <div className="absolute left-14 top-8 border border-outline bg-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide text-primary shadow-sm rounded-sm">
            K = {k} Nearest Votes
            <div className="mt-1 text-on-surface-variant font-bold normal-case">
              Winner: Class <span className={winner === "A" ? "text-primary font-bold" : (winner === "B" ? "text-pink font-bold" : "text-muted")}>{winner}</span> ({countA} A vs {countB} B)
            </div>
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Interactivity Mode</span>
            <div className="flex flex-col gap-1.5 mt-1">
              <button
                onClick={() => setInteractMode("query")}
                className={`border border-outline px-3 py-2 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  interactMode === "query" ? "bg-primary text-on-primary border-primary" : "bg-surface hover:bg-primary/10"
                }`}
              >
                Move Query Node
              </button>
              <button
                onClick={() => setInteractMode("addA")}
                className={`border border-outline px-3 py-2 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  interactMode === "addA" ? "bg-cyan text-on-primary border-cyan" : "bg-surface hover:bg-cyan/10"
                }`}
              >
                Add Class A Point (Cyan)
              </button>
              <button
                onClick={() => setInteractMode("addB")}
                className={`border border-outline px-3 py-2 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  interactMode === "addB" ? "bg-pink text-on-primary border-pink" : "bg-surface hover:bg-pink/10"
                }`}
              >
                Add Class B Point (Pink)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <span className="font-bold uppercase tracking-wide text-primary">Neighbors count (K)</span>
            <div className="flex gap-1.5 mt-1">
              {[1, 3, 5, 7].map((val) => (
                <button
                  key={val}
                  onClick={() => setK(val)}
                  className={`flex-1 border border-outline py-1.5 font-mono text-[9px] font-bold rounded transition-all cursor-pointer ${
                    k === val ? "bg-primary text-on-primary border-primary" : "bg-surface hover:bg-primary/10"
                  }`}
                >
                  K = {val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface border border-outline px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset Space
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
