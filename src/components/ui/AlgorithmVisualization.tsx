"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  COLORS,
  ControlPanel,
  PlotFrame,
  ScatterAxes,
  VisualizationShell,
} from "./visualizationPrimitives";

interface Props {
  algorithmId: string;
}

// ─────────────────────────────────────────────────────────────
// 1. LINEAR REGRESSION
// ─────────────────────────────────────────────────────────────
function LinearRegressionVisualization() {
  type RegressionMode = "linear" | "logistic";
  type Point = { x: number; y: number; label?: 0 | 1 };

  const [mode, setMode] = useState<RegressionMode>("linear");
  const [showOutlier, setShowOutlier] = useState(false);
  const [threshold, setThreshold] = useState(0.5);

  const linearBase: Point[] = [
    { x: 1.1, y: 2.2 },
    { x: 2.1, y: 2.8 },
    { x: 3.0, y: 4.1 },
    { x: 4.0, y: 4.6 },
    { x: 5.2, y: 5.9 },
    { x: 6.1, y: 6.7 },
    { x: 7.0, y: 7.6 },
    { x: 8.4, y: 8.7 },
  ];

  const linearOutlier = useMemo<Point>(() => ({ x: 8.7, y: 2.0 }), []);

  const logisticBase: Point[] = [
    { x: 1.2, y: 2.0, label: 0 },
    { x: 2.0, y: 3.2, label: 0 },
    { x: 2.8, y: 2.4, label: 0 },
    { x: 3.6, y: 4.0, label: 0 },
    { x: 5.2, y: 5.1, label: 1 },
    { x: 6.4, y: 5.8, label: 1 },
    { x: 7.1, y: 7.4, label: 1 },
    { x: 8.2, y: 6.8, label: 1 },
    { x: 8.8, y: 8.5, label: 1 },
  ];

  const [linearPoints, setLinearPoints] = useState<Point[]>(linearBase);
  const [logisticPoints, setLogisticPoints] = useState<Point[]>(logisticBase);

  const currentLinearPoints = useMemo(
    () => (showOutlier ? [...linearPoints, linearOutlier] : linearPoints),
    [linearOutlier, linearPoints, showOutlier],
  );

  const plot = {
    left: 42,
    right: 298,
    top: 24,
    bottom: 190,
    width: 256,
    height: 166,
  };

  const toSvgX = (x: number) => plot.left + (x / 10) * plot.width;
  const toSvgY = (y: number) => plot.bottom - (y / 10) * plot.height;
  const fromSvgX = (x: number) => ((x - plot.left) / plot.width) * 10;
  const fromSvgY = (y: number) => ((plot.bottom - y) / plot.height) * 10;
  const sigmoidLocal = (value: number) => 1 / (1 + Math.exp(-value));

  const linearFit = useMemo(() => {
    const n = currentLinearPoints.length;
    const meanX = currentLinearPoints.reduce((sum, p) => sum + p.x, 0) / n;
    const meanY = currentLinearPoints.reduce((sum, p) => sum + p.y, 0) / n;
    const numerator = currentLinearPoints.reduce(
      (sum, p) => sum + (p.x - meanX) * (p.y - meanY),
      0,
    );
    const denominator = currentLinearPoints.reduce(
      (sum, p) => sum + Math.pow(p.x - meanX, 2),
      0,
    );
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;
    const sse = currentLinearPoints.reduce(
      (sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2),
      0,
    );
    const sst = currentLinearPoints.reduce(
      (sum, p) => sum + Math.pow(p.y - meanY, 2),
      0,
    );

    return {
      slope,
      intercept,
      mse: sse / n,
      r2: sst === 0 ? 1 : 1 - sse / sst,
    };
  }, [currentLinearPoints]);

  const logisticFit = useMemo(() => {
    let wx = 0;
    let wy = 0;
    let b = -0.4;
    const rate = 0.22;

    for (let epoch = 0; epoch < 700; epoch += 1) {
      let gradX = 0;
      let gradY = 0;
      let gradB = 0;

      for (const point of logisticPoints) {
        const x = (point.x - 5) / 2.5;
        const y = (point.y - 5) / 2.5;
        const target = point.label ?? 0;
        const prediction = sigmoidLocal(wx * x + wy * y + b);
        const error = prediction - target;
        gradX += error * x;
        gradY += error * y;
        gradB += error;
      }

      const n = logisticPoints.length;
      wx -= (rate * gradX) / n;
      wy -= (rate * gradY) / n;
      b -= (rate * gradB) / n;
    }

    let loss = 0;
    let correct = 0;

    for (const point of logisticPoints) {
      const x = (point.x - 5) / 2.5;
      const y = (point.y - 5) / 2.5;
      const target = point.label ?? 0;
      const p = sigmoidLocal(wx * x + wy * y + b);
      const clipped = Math.min(1 - 1e-7, Math.max(1e-7, p));
      loss += -(target * Math.log(clipped) + (1 - target) * Math.log(1 - clipped));
      if ((p >= threshold ? 1 : 0) === target) {
        correct += 1;
      }
    }

    return {
      wx,
      wy,
      b,
      loss: loss / logisticPoints.length,
      accuracy: correct / logisticPoints.length,
    };
  }, [logisticPoints, threshold]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    const y = ((e.clientY - rect.top) / rect.height) * 220;
    if (x < plot.left || x > plot.right || y < plot.top || y > plot.bottom) {
      return;
    }

    const nextPoint = {
      x: Number(fromSvgX(x).toFixed(2)),
      y: Number(fromSvgY(y).toFixed(2)),
    };

    if (mode === "linear") {
      setLinearPoints((points) => [...points, nextPoint]);
    } else {
      setLogisticPoints((points) => [
        ...points,
        { ...nextPoint, label: nextPoint.x + nextPoint.y > 10 ? 1 : 0 },
      ]);
    }
  };

  const reset = () => {
    setLinearPoints(linearBase);
    setLogisticPoints(logisticBase);
    setShowOutlier(false);
    setThreshold(0.5);
  };

  const linearLine = {
    y0: linearFit.intercept,
    y10: linearFit.slope * 10 + linearFit.intercept,
  };

  const logisticBoundaryPoints = [0, 10]
    .map((xValue) => {
      const normalizedX = (xValue - 5) / 2.5;
      const logit = Math.log(threshold / (1 - threshold));
      const normalizedY =
        logisticFit.wy === 0
          ? 0
          : (logit - logisticFit.wx * normalizedX - logisticFit.b) /
            logisticFit.wy;
      return { x: xValue, y: normalizedY * 2.5 + 5 };
    })
    .filter((point) => Number.isFinite(point.y));

  const equation =
    mode === "linear"
      ? `y_hat = ${linearFit.slope.toFixed(2)}x + ${linearFit.intercept.toFixed(2)}`
      : `p = sigma(${logisticFit.wx.toFixed(2)}x1 + ${logisticFit.wy.toFixed(2)}x2 + ${logisticFit.b.toFixed(2)})`;

  return (
    <VisualizationShell
      title="Regression as an optimization problem"
      subtitle="Switch between continuous prediction and binary classification. Click the plot to add data and watch the fitted parameters, residuals, probabilities, and metrics update."
      insight="Linear regression minimizes squared residuals. Logistic regression minimizes cross-entropy after converting a linear score into a probability with the sigmoid function."
      legend={[
        { label: mode === "linear" ? "Observation" : "Class 0", color: COLORS.cyan },
        { label: mode === "linear" ? "Model fit" : "Class 1", color: COLORS.pink },
        { label: mode === "linear" ? "Residual" : "Decision boundary", color: COLORS.yellow },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px]">
          <svg
            viewBox="0 0 320 220"
            className="h-full min-h-[330px] w-full cursor-crosshair overflow-visible"
            onClick={handleSvgClick}
          >
            <ScatterAxes />
            {[2, 4, 6, 8].map((tick) => (
              <g key={tick} opacity="0.35">
                <line x1={toSvgX(tick)} y1={plot.top} x2={toSvgX(tick)} y2={plot.bottom} stroke={COLORS.grid} />
                <line x1={plot.left} y1={toSvgY(tick)} x2={plot.right} y2={toSvgY(tick)} stroke={COLORS.grid} />
              </g>
            ))}

            {mode === "linear" ? (
              <>
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(linearLine.y0)}
                  x2={toSvgX(10)}
                  y2={toSvgY(linearLine.y10)}
                  stroke={COLORS.pink}
                  strokeWidth="4"
                />
                {currentLinearPoints.map((point, index) => {
                  const predicted = linearFit.slope * point.x + linearFit.intercept;
                  return (
                    <g key={`${point.x}-${point.y}-${index}`}>
                      <line
                        x1={toSvgX(point.x)}
                        y1={toSvgY(point.y)}
                        x2={toSvgX(point.x)}
                        y2={toSvgY(predicted)}
                        stroke={COLORS.yellow}
                        strokeDasharray="4 4"
                        strokeWidth="2"
                      />
                      <circle
                        cx={toSvgX(point.x)}
                        cy={toSvgY(point.y)}
                        r={point === linearOutlier ? 5.5 : 4.5}
                        fill={point === linearOutlier ? COLORS.yellow : COLORS.cyan}
                        stroke="var(--color-outline-dark)"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}
              </>
            ) : (
              <>
                <defs>
                  <linearGradient id="logistic_probability" x1="0" x2="1">
                    <stop offset="0%" stopColor={COLORS.cyan} stopOpacity="0.12" />
                    <stop offset="100%" stopColor={COLORS.pink} stopOpacity="0.18" />
                  </linearGradient>
                </defs>
                <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} fill="url(#logistic_probability)" />
                {logisticBoundaryPoints.length === 2 && (
                  <line
                    x1={toSvgX(logisticBoundaryPoints[0].x)}
                    y1={toSvgY(logisticBoundaryPoints[0].y)}
                    x2={toSvgX(logisticBoundaryPoints[1].x)}
                    y2={toSvgY(logisticBoundaryPoints[1].y)}
                    stroke={COLORS.yellow}
                    strokeWidth="4"
                    strokeDasharray="7 5"
                  />
                )}
                {logisticPoints.map((point, index) => {
                  const normalizedX = (point.x - 5) / 2.5;
                  const normalizedY = (point.y - 5) / 2.5;
                  const probability = sigmoidLocal(
                    logisticFit.wx * normalizedX +
                      logisticFit.wy * normalizedY +
                      logisticFit.b,
                  );
                  return (
                    <g key={`${point.x}-${point.y}-${index}`}>
                      <circle
                        cx={toSvgX(point.x)}
                        cy={toSvgY(point.y)}
                        r={5 + probability * 2}
                        fill={point.label === 1 ? COLORS.pink : COLORS.cyan}
                        stroke={probability >= threshold ? COLORS.border : "var(--color-outline-dark)"}
                        strokeWidth="2"
                      />
                      <text
                        x={toSvgX(point.x)}
                        y={toSvgY(point.y) - 9}
                        fill="var(--color-on-surface)"
                        fontSize="7"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {probability.toFixed(2)}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            <rect x="54" y="32" width="194" height="32" fill={COLORS.bg} stroke={COLORS.border} strokeWidth="2" />
            <text x="64" y="52" fill={mode === "linear" ? COLORS.pink : COLORS.yellow} fontSize="10" fontFamily="monospace" fontWeight="bold">
              {equation}
            </text>
          </svg>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {(["linear", "logistic"] as const).map((nextMode) => (
              <button
                key={nextMode}
                onClick={() => setMode(nextMode)}
                className={`border border-outline px-3 py-2 font-mono text-[10px] font-semibold uppercase  transition-all ${
                  mode === nextMode
                    ? "rounded bg-secondary text-outline-dark"
                    : "rounded bg-surface-container-high text-on-surface hover:"
                }`}
              >
                {nextMode}
              </button>
            ))}
          </div>

          <div className="border border-outline rounded bg-surface-container-lowest p-3 font-mono text-xs leading-relaxed">
            <div className="mb-2 text-[10px] font-semibold tracking-wide text-secondary">
              Live Objective
            </div>
            {mode === "linear" ? (
              <div className="space-y-1.5">
                <p>Minimize sum of squared vertical residuals.</p>
                <p className="text-on-surface-variant">MSE: <span className="text-warning">{linearFit.mse.toFixed(3)}</span></p>
                <p className="text-on-surface-variant">R²: <span className="text-warning">{linearFit.r2.toFixed(3)}</span></p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p>Minimize binary cross-entropy over class labels.</p>
                <p className="text-on-surface-variant">Loss: <span className="text-warning">{logisticFit.loss.toFixed(3)}</span></p>
                <p className="text-on-surface-variant">Accuracy: <span className="text-warning">{(logisticFit.accuracy * 100).toFixed(0)}%</span></p>
              </div>
            )}
          </div>

          {mode === "linear" ? (
            <button
              onClick={() => setShowOutlier((value) => !value)}
              className={`border border-outline px-3 py-2 font-mono text-[10px] font-semibold uppercase  transition-all ${
                showOutlier ? "bg-warning text-on-primary" : "rounded bg-surface-container-high text-on-surface"
              }`}
            >
              {showOutlier ? "Remove outlier" : "Add outlier"}
            </button>
          ) : (
            <div className="flex flex-col gap-2 font-mono text-[10px] font-bold uppercase">
              <div className="flex justify-between">
                <span>Classification threshold</span>
                <span className="text-warning">{threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none border border-outline bg-[#2A2A2A] accent-yellow"
              />
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-2">
            <button
              onClick={reset}
              className="border border-outline rounded bg-surface-container-high px-3 py-2 font-mono text-[10px] font-semibold uppercase text-on-surface  transition-all hover:"
            >
              Reset lab
            </button>
            <div className="flex-1 border border-outline rounded bg-surface-container-lowest/60 px-3 py-2 font-mono text-[10px] font-bold uppercase leading-relaxed text-on-surface-variant">
              Click the plot to add {mode === "linear" ? "a measured point" : "an auto-labeled class point"}.
            </div>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. LOGISTIC REGRESSION
// ─────────────────────────────────────────────────────────────
function LogisticRegressionVisualization() {
  const groupA = [[74, 154], [92, 138], [110, 150], [126, 126], [142, 136]];
  const groupB = [[184, 92], [206, 88], [220, 72], [240, 82], [254, 60]];

  const [xBoundary, setXBoundary] = useState(160); // Visual x position of boundary [40, 296]
  const [slope, setSlope] = useState(0.06); // Steepness of sigmoid transition [0.01, 0.2]

  // Sigmoid formula path calculation for the right-hand panel
  const sigmoidPathD = Array.from({ length: 167 }, (_, i) => {
    const xCoord = 28 + i;
    // Map to a center standard mapping
    const p = 1 / (1 + Math.exp(slope * (xCoord - xBoundary)));
    // Y visual: from 184 (p=0) to 28 (p=1) -> range 156
    const yCoord = 184 - p * 156;
    return `${i === 0 ? "M" : "L"} ${xCoord} ${yCoord}`;
  }).join(" ");

  return (
    <VisualizationShell
      title="Map a linear score to a calibrated probability"
      subtitle="Logistic regression computes a linear score, passes it through a sigmoid curve, and classifies by comparing the probability with a threshold."
      insight="The 0.5 point is the default decision boundary: scores on one side predict class 0, scores on the other side predict class 1."
      legend={[
        { label: "Class 0", color: COLORS.pink },
        { label: "Class 1", color: COLORS.cyan },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* Double SVG Grid Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 rounded">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <svg viewBox="0 0 320 220" className="h-full w-full relative">
              {/* Background probability gradient split */}
              <rect x="0" y="0" width={xBoundary} height="220" fill="rgba(255,51,102,0.15)" />
              <rect x={xBoundary} y="0" width={320 - xBoundary} height="220" fill="rgba(85,107,74,0.14)" />
              <line x1={xBoundary} y1="0" x2={xBoundary} y2="220" stroke={COLORS.muted} strokeWidth="4" strokeDasharray="8 8" />
              <ScatterAxes />
              {groupA.map(([x, y], i) => (
                <rect key={`a-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.pink} />
              ))}
              {groupB.map(([x, y], i) => (
                <rect key={`b-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.cyan} />
              ))}
            </svg>

            <svg viewBox="0 0 220 220" className="h-full w-full">
              <line x1="28" y1="184" x2="194" y2="184" stroke={COLORS.border} strokeWidth="2" />
              <line x1="28" y1="28" x2="28" y2="184" stroke={COLORS.border} strokeWidth="2" />
              <path
                d={sigmoidPathD}
                fill="none" stroke={COLORS.yellow} strokeWidth="4"
              />
              <line x1="28" y1="106" x2="194" y2="106" stroke={COLORS.muted} strokeWidth="2" strokeDasharray="4 4" />
              <text x="146" y="98" fill="var(--color-on-surface)" fontSize="12" fontFamily="monospace" fontWeight="bold">p=0.5</text>
              <text x="10" y="36" fill={COLORS.border} fontSize="12" fontFamily="monospace" fontWeight="bold">P</text>
            </svg>
          </div>
        </div>

        {/* Sliders UI */}
        <div className="flex flex-wrap gap-6 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">THRESHOLD (X): {xBoundary.toFixed(0)}</span>
            <input
              type="range"
              min="50"
              max="270"
              value={xBoundary}
              onChange={(e) => setXBoundary(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">SLOPE (STEEPNESS): {slope.toFixed(3)}</span>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={slope}
              onChange={(e) => setSlope(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. K-NEAREST NEIGHBORS (KNN)
// ─────────────────────────────────────────────────────────────
function KnnVisualization() {
  const blue = [[84, 134], [100, 148], [116, 126], [132, 144]];
  const purple = [[186, 84], [204, 102], [222, 76], [238, 96]];

  const [query, setQuery] = useState({ x: 168, y: 118 });
  const [k, setK] = useState(3);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    const y = ((e.clientY - rect.top) / rect.height) * 220;
    if (x >= 40 && x <= 296 && y >= 24 && y <= 190) {
      setQuery({ x, y });
    }
  };

  // Find nearest neighbors
  const allPoints = [
    ...blue.map(([x, y]) => ({ x, y, label: "A", color: COLORS.cyan })),
    ...purple.map(([x, y]) => ({ x, y, label: "B", color: COLORS.pink }))
  ];

  const sortedPoints = [...allPoints].sort((p1, p2) => {
    const d1 = Math.pow(p1.x - query.x, 2) + Math.pow(p1.y - query.y, 2);
    const d2 = Math.pow(p2.x - query.x, 2) + Math.pow(p2.y - query.y, 2);
    return d1 - d2;
  });

  const activeNeighbors = sortedPoints.slice(0, k);
  const countA = activeNeighbors.filter(n => n.label === "A").length;
  const winnerColor = countA > k / 2 ? COLORS.cyan : COLORS.pink;

  // Maximum neighbor distance for drawing the neighborhood boundary
  const maxNeighborDist = Math.sqrt(
    Math.pow(activeNeighbors[k - 1].x - query.x, 2) +
    Math.pow(activeNeighbors[k - 1].y - query.y, 2)
  );

  return (
    <VisualizationShell
      title="Classify by checking the local neighborhood"
      subtitle="KNN skips training entirely. Click anywhere inside the grid to move the yellow Query node, or cycle K. The query node automatically classifies based on nearest votes."
      insight="The algorithm assumes the world is smooth: if you are surrounded by Class A, you are likely Class A."
      legend={[
        { label: "Class A", color: COLORS.cyan },
        { label: "Class B", color: COLORS.pink },
        { label: "Query Result", color: winnerColor },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full cursor-crosshair overflow-visible" onClick={handleSvgClick}>
            <ScatterAxes />
            {/* Radius circle around query node */}
            <circle
              cx={query.x}
              cy={query.y}
              r={maxNeighborDist}
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="transition-all duration-150"
            />
            {/* Connections to neighbors */}
            {activeNeighbors.map((n, i) => (
              <line
                key={`conn-${i}`}
                x1={query.x}
                y1={query.y}
                x2={n.x}
                y2={n.y}
                stroke={COLORS.yellow}
                strokeWidth="2"
              />
            ))}

            {blue.map(([x, y], i) => (
              <rect key={`blue-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.cyan} stroke="var(--color-outline-dark)" strokeWidth="2" />
            ))}
            {purple.map(([x, y], i) => (
              <rect key={`purple-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.pink} stroke="var(--color-outline-dark)" strokeWidth="2" />
            ))}

            {/* Query Node */}
            <g transform={`translate(${query.x}, ${query.y})`}>
              <polygon
                points="0,-8 7,5 -7,5"
                fill={winnerColor}
                stroke={COLORS.yellow}
                strokeWidth="2.5"
              />
            </g>
            <text x="180" y="32" fill="var(--color-on-surface)" fontSize="11" fontFamily="monospace" fontWeight="bold">
              K={k} (VOTE: {countA} vs {k - countA})
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <span className="font-mono text-xs font-semibold uppercase text-on-surface">NEIGHBORS (K):</span>
          <div className="flex gap-2">
            {[1, 3, 5].map((val) => (
              <button
                key={val}
                onClick={() => setK(val)}
                className={`px-3 py-1.5 text-xs font-semibold border border-outline uppercase transition-all cursor-pointer  ${
                  k === val ? "rounded bg-secondary text-outline-dark" : "rounded bg-surface-container-high hover:"
                }`}
              >
                K = {val}
              </button>
            ))}
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. SUPPORT VECTOR MACHINES (SVM)
// ─────────────────────────────────────────────────────────────
function SvmVisualization() {
  const left = [[84, 148], [98, 126], [116, 142], [136, 116]];
  const right = [[192, 88], [212, 68], [228, 92], [246, 72]];

  const [margin, setMargin] = useState(24);

  // Offset shift calculations to draw separating boundaries dynamically
  const dx = 24 * (margin / 24);
  const dy = 12 * (margin / 24);

  // Hyperplane Equation parameters: A*x + B*y + C = 0
  // Line passes through (136, 190) and (252, 56)
  // Slope = -1.155. Transformed to equation: 1.155*x + y - 347 = 0
  const isSupportVector = (x: number, y: number) => {
    const dist = Math.abs(1.155 * x + y - 347.1) / 1.528;
    // Highlight if point is close to the margin width
    return Math.abs(dist - margin) < 9;
  };

  return (
    <VisualizationShell
      title="Draw a boundary with the widest possible safety margin"
      subtitle="SVM finds the single dividing line that sits as far away as possible from the closest points of both classes. Adjust the margin slider to see support vector selection."
      insight="Only the absolute edge cases (the support vectors) define the model. All other data points behind the lines are effectively ignored."
      legend={[
        { label: "Margin Boundary", color: COLORS.muted },
        { label: "Hyperplane", color: COLORS.muted },
        { label: "Support Vector", color: COLORS.yellow },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            <ScatterAxes />
            {/* Upper Margin line */}
            <line x1={136 - dx} y1={190 - dy} x2={252 - dx} y2={56 - dy} stroke={COLORS.muted} strokeWidth="2.5" strokeDasharray="6 6" />
            {/* Main separating Hyperplane */}
            <line x1="136" y1="190" x2="252" y2="56" stroke={COLORS.muted} strokeWidth="4" />
            {/* Lower Margin line */}
            <line x1={136 + dx} y1={190 + dy} x2={252 + dx} y2={56 + dy} stroke={COLORS.muted} strokeWidth="2.5" strokeDasharray="6 6" />

            {left.map(([x, y], i) => {
              const isSV = isSupportVector(x, y);
              return (
                <g key={`l-${i}`}>
                  {isSV && <rect x={x - 9} y={y - 9} width="18" height="18" fill="none" stroke={COLORS.yellow} strokeWidth="2.5" />}
                  <rect x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.cyan} />
                </g>
              );
            })}
            {right.map(([x, y], i) => {
              const isSV = isSupportVector(x, y);
              return (
                <g key={`r-${i}`}>
                  {isSV && <rect x={x - 9} y={y - 9} width="18" height="18" fill="none" stroke={COLORS.yellow} strokeWidth="2.5" />}
                  <rect x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.pink} />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <span className="font-mono text-[10px] text-on-surface font-bold">MARGIN WIDTH (D): {margin.toFixed(0)} pixels</span>
          <input
            type="range"
            min="10"
            max="45"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. DECISION TREES
// ─────────────────────────────────────────────────────────────
function DecisionTreeVisualization() {
  const [splitX, setSplitX] = useState(160); // Visual X split threshold [60, 260]
  const [splitY, setSplitY] = useState(104); // Visual Y split threshold [40, 180]

  // Map visual split thresholds to normalized values (0 to 10 scale)
  const normX = ((splitX - 40) / 25.6).toFixed(1);
  const normY = ((190 - splitY) / 16.6).toFixed(1);

  return (
    <VisualizationShell
      title="Segment data via rigid rules"
      subtitle="Decision trees build an architectural flowchart. At each node, they slice the data using a strict mathematical rule until a final verdict is reached. Adjust split boundaries."
      insight="This creates rectangular, blocky decision boundaries. It is highly interpretable, but prone to creating overly specific, jagged rules."
      legend={[
        { label: "Logic Gate", color: COLORS.cyan },
        { label: "Terminal Leaf", color: COLORS.pink },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* Double SVG Grid Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 rounded">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Decision boundary grid representation */}
            <svg viewBox="0 0 320 220" className="h-full w-full relative">
              <rect x="40" y="24" width={splitX - 40} height="166" fill="rgba(0, 255, 255, 0.05)" />
              <rect x={splitX} y="24" width={296 - splitX} height="166" fill="rgba(255, 51, 102, 0.05)" />
              <ScatterAxes />
              {/* Split X line */}
              <line x1={splitX} y1="24" x2={splitX} y2="190" stroke={COLORS.cyan} strokeWidth="3" />
              {/* Split Y line (cuts only the left quadrant for demo visualization) */}
              <line x1="40" y1={splitY} x2={splitX} y2={splitY} stroke={COLORS.yellow} strokeWidth="2" strokeDasharray="4 4" />

              {/* Fake scatter points */}
              {[[60, 150], [90, 120]].map(([x, y], i) => (
                <rect key={`pt-a-${i}`} x={x - 4} y={y - 4} width="8" height="8" fill={y > splitY ? COLORS.pink : COLORS.cyan} />
              ))}
              {[[220, 80], [250, 140], [180, 110]].map(([x, y], i) => (
                <rect key={`pt-b-${i}`} x={x - 4} y={y - 4} width="8" height="8" fill={x > splitX ? COLORS.pink : COLORS.cyan} />
              ))}
            </svg>

            {/* Flowchart Diagram */}
            <svg viewBox="0 0 220 220" className="h-full w-full">
              <line x1="110" y1="46" x2="62" y2="104" stroke={COLORS.border} strokeWidth="2" />
              <line x1="110" y1="46" x2="158" y2="104" stroke={COLORS.border} strokeWidth="2" />
              <line x1="62" y1="104" x2="40" y2="166" stroke={COLORS.border} strokeWidth="2" />
              <line x1="62" y1="104" x2="84" y2="166" stroke={COLORS.border} strokeWidth="2" />

              {/* Node 1: Split X */}
              <g>
                <rect x="70" y="26" width="80" height="28" fill="var(--color-surface-container-high)" stroke={COLORS.cyan} strokeWidth="2" />
                <text x="110" y="43" textAnchor="middle" fill="var(--color-on-surface)" fontSize="9" fontFamily="monospace" fontWeight="bold">{`X > ${normX}?`}</text>
              </g>

              {/* Node 2: Split Y */}
              <g>
                <rect x="22" y="90" width="80" height="28" fill="var(--color-surface-container-high)" stroke={COLORS.yellow} strokeWidth="2" />
                <text x="62" y="107" textAnchor="middle" fill="var(--color-on-surface)" fontSize="9" fontFamily="monospace" fontWeight="bold">{`Y < ${normY}?`}</text>
              </g>

              {/* Node 3: True Leaf */}
              <g>
                <rect x="138" y="90" width="40" height="28" fill={COLORS.pink} />
                <text x="158" y="108" textAnchor="middle" fill="var(--color-on-surface)" fontSize="12" fontFamily="monospace" fontWeight="bold">B</text>
              </g>

              {/* Leaves bottom */}
              <g>
                <rect x="20" y="152" width="40" height="28" fill={COLORS.pink} />
                <text x="40" y="170" textAnchor="middle" fill="var(--color-on-surface)" fontSize="12" fontFamily="monospace" fontWeight="bold">B</text>
              </g>
              <g>
                <rect x="64" y="152" width="40" height="28" fill={COLORS.cyan} />
                <text x="84" y="170" textAnchor="middle" fill="var(--color-on-surface)" fontSize="12" fontFamily="monospace" fontWeight="bold">A</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Sliders */}
        <div className="flex flex-wrap gap-6 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">SPLIT THRESHOLD X: {normX}</span>
            <input
              type="range"
              min="80"
              max="240"
              value={splitX}
              onChange={(e) => setSplitX(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">SPLIT THRESHOLD Y: {normY}</span>
            <input
              type="range"
              min="60"
              max="160"
              value={splitY}
              onChange={(e) => setSplitY(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. RANDOM FOREST
// ─────────────────────────────────────────────────────────────
function RandomForestVisualization() {
  const [activeTree, setActiveTree] = useState<number | "average">("average");

  return (
    <VisualizationShell
      title="Average many imperfect trees"
      subtitle="Random forests train many restricted decision trees. Click different trees to inspect individual pathways, or view the collective average."
      insight="A single tree memorizes the noise; a forest of trees averages the noise out into a robust signal."
      legend={[
        { label: "Weak Tree Pathway", color: COLORS.muted },
        { label: "Winning Vote", color: COLORS.green },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {[60, 160, 260].map((x, index) => {
              const isThisTreeActive = activeTree === "average" || activeTree === index;
              const pathColor = isThisTreeActive ? COLORS.cyan : "#222";
              return (
                <g key={x} className="transition-opacity duration-200">
                  <rect x={x - 18} y="38" width="36" height="20" fill="var(--color-surface-container-high)" stroke={isThisTreeActive ? COLORS.cyan : COLORS.muted} strokeWidth="2.5" />
                  <text x={x} y="52" textAnchor="middle" fill={isThisTreeActive ? COLORS.cyan : COLORS.muted} fontSize="10" fontFamily="monospace" fontWeight="bold">T-{index + 1}</text>

                  <line x1={x} y1="58" x2={x - 20} y2="92" stroke={pathColor} strokeWidth="2" />
                  <line x1={x} y1="58" x2={x + 20} y2="92" stroke={pathColor} strokeWidth="2" />

                  <rect x={x - 30} y="92" width="20" height="15" fill={index === 1 ? COLORS.green : COLORS.muted} fillOpacity={isThisTreeActive ? 1 : 0.2} />
                  <rect x={x + 10} y="92" width="20" height="15" fill={index === 0 ? COLORS.muted : COLORS.green} fillOpacity={isThisTreeActive ? 1 : 0.2} />
                </g>
              );
            })}

            <line x1="40" y1="150" x2="280" y2="150" stroke={COLORS.muted} strokeWidth="4" />
            <polygon points="150,150 170,150 160,170" fill={COLORS.muted} />

            {/* Output vote display */}
            <rect
              x="90"
              y="180"
              width="140"
              height="30"
              fill={activeTree === "average" ? COLORS.green : COLORS.cyan}
              stroke="var(--color-outline-dark)"
              strokeWidth="3"
            />
            <text x="160" y="200" textAnchor="middle" fill="var(--color-on-surface)" fontSize="11" fontFamily="monospace" fontWeight="bold">
              {activeTree === "average" ? "AVERAGE VOTE" : `TREE ${Number(activeTree) + 1} VOTE`}
            </text>
          </svg>
        </div>

        {/* Tree Selector Controls */}
        <div className="flex flex-wrap items-center gap-3 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <span className="font-mono text-xs font-semibold uppercase text-on-surface font-bold">Models:</span>
          <div className="flex gap-2">
            {([
              { id: 0, label: "Tree 1" },
              { id: 1, label: "Tree 2" },
              { id: 2, label: "Tree 3" },
              { id: "average", label: "Ensemble Avg" }
            ] satisfies Array<{ id: number | "average"; label: string }>).map((btn) => (
              <button
                key={btn.label}
                onClick={() => setActiveTree(btn.id)}
                className={`px-3 py-1.5 text-xs font-semibold border border-outline uppercase transition-all cursor-pointer  ${
                  activeTree === btn.id ? "rounded bg-secondary text-outline-dark" : "rounded bg-surface-container-high hover:"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. K-MEANS CLUSTERING
// ─────────────────────────────────────────────────────────────
function KMeansVisualization() {
  const points = [
    [62, 144], [76, 116], [94, 138], [108, 114], // group 1
    [152, 102], [168, 70], [186, 98], [198, 78], // group 2
    [226, 152], [238, 124], [258, 154], [272, 132] // group 3
  ];

  const defaultCentroids = [
    [110, 110] as [number, number],
    [180, 80] as [number, number],
    [250, 140] as [number, number]
  ];

  const [centroids, setCentroids] = useState(defaultCentroids);
  const [step, setStep] = useState<"assign" | "update">("assign");

  // Assign points to nearest centroid
  const getAssignment = (px: number, py: number, currentCentroids = centroids) => {
    let minD = Infinity;
    let assignedIdx = 0;
    currentCentroids.forEach((c, cIdx) => {
      const d = Math.pow(px - c[0], 2) + Math.pow(py - c[1], 2);
      if (d < minD) {
        minD = d;
        assignedIdx = cIdx;
      }
    });
    return assignedIdx;
  };

  const handleIterate = () => {
    if (step === "assign") {
      setStep("update");
    } else {
      // Update step: move centroids to mean of assigned points
      const nextCentroids = centroids.map((c, cIdx) => {
        const assigned = points.filter(([px, py]) => getAssignment(px, py) === cIdx);
        if (assigned.length === 0) return c;
        const sumX = assigned.reduce((sum, p) => sum + p[0], 0);
        const sumY = assigned.reduce((sum, p) => sum + p[1], 0);
        return [sumX / assigned.length, sumY / assigned.length] as [number, number];
      });
      setCentroids(nextCentroids);
      setStep("assign");
    }
  };

  const handleReset = () => {
    setCentroids(defaultCentroids);
    setStep("assign");
  };

  const colors = [COLORS.cyan, COLORS.pink, COLORS.yellow];

  return (
    <VisualizationShell
      title="Assign points to moving centroids"
      subtitle="K-means runs iteratively. 1) Assign: points snap to the closest centroid. 2) Update: centroids move to the center of their points. Click Iterate to run step-by-step."
      insight="Over iterations, the centroids naturally shift to capture the spatial density of localized clusters, locking the final boundaries."
      legend={[
        { label: "Centroid 1", color: COLORS.cyan },
        { label: "Centroid 2", color: COLORS.pink },
        { label: "Centroid 3", color: COLORS.yellow },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            <ScatterAxes />
            {/* Dynamic partition boundaries (approximate Voronoi regions) */}
            {points.map(([px, py], idx) => {
              const assignedIdx = getAssignment(px, py);
              const centroid = centroids[assignedIdx];
              return (
                <g key={`pt-${idx}`}>
                  {/* Draw line from point to its assigned centroid */}
                  <line
                    x1={px}
                    y1={py}
                    x2={centroid[0]}
                    y2={centroid[1]}
                    stroke={colors[assignedIdx]}
                    strokeWidth="1.5"
                    strokeOpacity="0.3"
                    strokeDasharray="2 2"
                  />
                  <rect x={px - 4} y={py - 4} width="8" height="8" fill={colors[assignedIdx]} />
                </g>
              );
            })}

            {/* Centroids */}
            {centroids.map((c, i) => (
              <polygon
                key={`c-${i}`}
                points={`${c[0]},${c[1] - 9} ${c[0] + 9},${c[1]} ${c[0]},${c[1] + 9} ${c[0] - 9},${c[1]}`}
                fill={colors[i]}
                stroke="var(--color-background)"
                strokeWidth="2.5"
              />
            ))}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex gap-3 rounded bg-surface p-4 border border-outline">
          <button
            onClick={handleIterate}
            className="border border-outline rounded bg-secondary text-outline-dark px-3 py-1.5 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all cursor-pointer"
          >
            Iterate: {step === "assign" ? "Snap Points" : "Update Centroids"}
          </button>
          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container-high text-on-surface px-3 py-1.5 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. NEURAL NETWORKS
// ─────────────────────────────────────────────────────────────
function NeuralNetworkVisualization() {
  const [activeInputs, setActiveInputs] = useState([true, false, true, false]);

  // Simple forward propagation mock to compute layer opacities
  const h1 = [
    (activeInputs[0] ? 0.8 : 0) + (activeInputs[2] ? 0.3 : 0),
    (activeInputs[1] ? 0.8 : 0) + (activeInputs[3] ? 0.4 : 0),
    (activeInputs[0] ? 0.5 : 0) + (activeInputs[1] ? 0.5 : 0),
    (activeInputs[2] ? 0.9 : 0)
  ].map(v => Math.min(1, v));

  const h2 = [
    h1[0] * 0.6 + h1[1] * 0.5,
    h1[2] * 0.7 + h1[3] * 0.4,
    h1[0] * 0.3 + h1[2] * 0.8
  ].map(v => Math.min(1, v));

  const out = [
    h2[0] * 0.7 + h2[1] * 0.5,
    h2[2] * 0.9
  ].map(v => Math.min(1, v));

  const layers = [
    { x: 52, nodes: [52, 98, 144, 190], color: COLORS.cyan, activations: activeInputs.map(v => v ? 1 : 0.1) },
    { x: 126, nodes: [64, 98, 132, 166], color: COLORS.muted, activations: h1.map(v => Math.max(0.1, v)) },
    { x: 198, nodes: [78, 116, 154], color: COLORS.muted, activations: h2.map(v => Math.max(0.1, v)) },
    { x: 270, nodes: [100, 140], color: COLORS.pink, activations: out.map(v => Math.max(0.1, v)) },
  ];

  const handleToggleNode = (idx: number) => {
    const next = [...activeInputs];
    next[idx] = !next[idx];
    setActiveInputs(next);
  };

  return (
    <VisualizationShell
      title="Propagate activations through learned layers"
      subtitle="Neural Networks stack layers of matrix multiplications and activations. Click the cyan input nodes to toggle them on/off and watch the values propagate forward."
      insight="The activations flow along connections, lighting up hidden dimensions. Output nodes glow corresponding to final scores."
      legend={[
        { label: "Input Node (Clickable)", color: COLORS.cyan },
        { label: "Hidden Layer", color: COLORS.muted },
        { label: "Active Pathway", color: COLORS.yellow },
      ]}
    >
      <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
        <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
          {/* Draw connection lines */}
          {layers.map((layer, i) =>
            layer.nodes.map((y, nodeIdx) =>
              i < layers.length - 1
                ? layers[i + 1].nodes.map((nextY, ni) => {
                    const weightVal = layer.activations[nodeIdx] * layers[i + 1].activations[ni];
                    const color = weightVal > 0.35 ? COLORS.yellow : "#333";
                    const opacity = Math.max(0.15, weightVal);
                    return (
                      <line
                        key={`${i}-${y}-${ni}`}
                        x1={layer.x}
                        y1={y}
                        x2={layers[i + 1].x}
                        y2={nextY}
                        stroke={color}
                        strokeWidth={weightVal > 0.4 ? "2" : "1.2"}
                        strokeOpacity={opacity}
                      />
                    );
                  })
                : null
            )
          )}

          {/* Nodes */}
          {layers.map((layer, layerIdx) => (
            <g key={layer.x}>
              {layer.nodes.map((y, nodeIdx) => {
                const active = layer.activations[nodeIdx];
                const isInput = layerIdx === 0;
                return (
                  <rect
                    key={nodeIdx}
                    x={layer.x - 8}
                    y={y - 8}
                    width="16"
                    height="16"
                    fill={layer.color}
                    fillOpacity={active}
                    stroke={isInput ? COLORS.yellow : "#000"}
                    strokeWidth={isInput ? "2.5" : "2"}
                    className={isInput ? "cursor-pointer hover:stroke-white" : ""}
                    onClick={isInput ? () => handleToggleNode(nodeIdx) : undefined}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. MAXIMUM LIKELIHOOD ESTIMATION (MLE)
// ─────────────────────────────────────────────────────────────
function MaximumLikelihoodVisualization() {
  const pts = [170, 190, 200, 215, 230];
  const [mean, setMean] = useState(120); // Center of fitted Gaussian model [60, 260]
  const width = 45; // Gaussian width

  // Log-Likelihood score estimation
  let sumLogLikelihood = 0;
  pts.forEach((pt) => {
    sumLogLikelihood += -Math.pow(pt - mean, 2) / (2 * Math.pow(width, 2)) - Math.log(width * Math.sqrt(2 * Math.PI));
  });

  // Calculate smooth math curve points
  const bestFitCurvePath = Array.from({ length: 281 }, (_, i) => {
    const x = 20 + i;
    const y = 180 - 135 * Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(width, 2)));
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <VisualizationShell
      title="Fit distribution parameters by likelihood"
      subtitle="Maximum Likelihood Estimation slides a probability distribution until the observed data points sit at the highest possible density. Adjust the mean slider."
      insight="As the curve moves over the yellow coordinates, the vertical likelihood lines shrink, maximizing the calculated total log-likelihood score."
      legend={[
        { label: "Fixed Data", color: COLORS.yellow },
        { label: "Likelihood density", color: COLORS.cyan },
        { label: "Fitted Gaussian Model", color: COLORS.pink },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            <line x1="20" y1="180" x2="300" y2="180" stroke={COLORS.border} strokeWidth="4" />

            {/* Fitted curve path */}
            <path d={bestFitCurvePath} fill="rgba(255,51,102,0.1)" stroke={COLORS.pink} strokeWidth="4" />

            {/* Data points & Likelihood projection lines */}
            {pts.map((pt, i) => {
              // density Y value on the curve
              const yCurve = 180 - 135 * Math.exp(-Math.pow(pt - mean, 2) / (2 * Math.pow(width, 2)));
              return (
                <g key={i}>
                  <line x1={pt} y1="180" x2={pt} y2={yCurve} stroke={COLORS.cyan} strokeWidth="2.5" />
                  <rect x={pt - 5} y="175" width="10" height="10" fill={COLORS.yellow} stroke="var(--color-outline-dark)" strokeWidth="1.5" />
                </g>
              );
            })}

            <text x="160" y="32" fill={COLORS.pink} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {`Log-Likelihood: ${sumLogLikelihood.toFixed(2)}`}
            </text>
          </svg>
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-2 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <span className="font-mono text-[10px] text-on-surface font-bold">MODEL MEAN (μ): {mean.toFixed(0)}</span>
          <input
            type="range"
            min="100"
            max="260"
            value={mean}
            onChange={(e) => setMean(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. BAYESIAN INFERENCE
// ─────────────────────────────────────────────────────────────
function BayesianVisualization() {
  const [priorMean, setPriorMean] = useState(120); // Prior belief position [80, 200]
  const [evidenceMean, setEvidenceMean] = useState(220); // Observed data position [100, 280]

  // Compromise calculation: weighted by variance (prior std=40, evidence std=30)
  const pVar = 1600;
  const eVar = 900;
  const postMean = (priorMean / pVar + evidenceMean / eVar) / (1 / pVar + 1 / eVar);
  const postVar = 1 / (1 / pVar + 1 / eVar);
  const postWidth = Math.sqrt(postVar); // Narrower posterior distribution width (~24)

  const priorPath = Array.from({ length: 281 }, (_, i) => {
    const x = 20 + i;
    const y = 180 - 75 * Math.exp(-Math.pow(x - priorMean, 2) / (2 * Math.pow(40, 2)));
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const evidencePath = Array.from({ length: 281 }, (_, i) => {
    const x = 20 + i;
    const y = 180 - 130 * Math.exp(-Math.pow(x - evidenceMean, 2) / (2 * Math.pow(30, 2)));
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const posteriorPath = Array.from({ length: 281 }, (_, i) => {
    const x = 20 + i;
    const y = 180 - 130 * Math.exp(-Math.pow(x - postMean, 2) / (2 * Math.pow(postWidth, 2)));
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <VisualizationShell
      title="Update your beliefs with hard evidence"
      subtitle="Bayesian logic refuses to look at data in a vacuum. It combines prior belief with new evidence to compute a Posterior compromise. Adjust the sliders below."
      insight="Notice that the Posterior (pink) is narrower and taller than both curves. Combining information sources reduces uncertainty and increases model confidence."
      legend={[
        { label: "Prior (Belief)", color: COLORS.yellow },
        { label: "Likelihood (Data)", color: COLORS.cyan },
        { label: "Posterior (Truth)", color: COLORS.pink },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            <line x1="20" y1="180" x2="300" y2="180" stroke={COLORS.border} strokeWidth="4" />

            {/* Prior Curve */}
            <path d={priorPath} fill="none" stroke={COLORS.yellow} strokeWidth="2.5" strokeDasharray="5 5" />
            <text x={priorMean} y="90" fill={COLORS.yellow} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PRIOR</text>

            {/* Likelihood / Data Curve */}
            <path d={evidencePath} fill="none" stroke={COLORS.cyan} strokeWidth="2.5" strokeDasharray="5 5" />
            <text x={evidenceMean} y="35" fill={COLORS.cyan} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DATA</text>

            {/* Posterior Curve */}
            <path d={posteriorPath} fill="rgba(255,51,102,0.15)" stroke={COLORS.pink} strokeWidth="4" />
            <rect x={postMean - 30} y="130" width="60" height="20" fill={COLORS.pink} stroke="var(--color-outline-dark)" strokeWidth="2" />
            <text x={postMean} y="144" fill="var(--color-on-surface)" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">POSTERIOR</text>
          </svg>
        </div>

        {/* Sliders */}
        <div className="flex flex-wrap gap-6 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">PRIOR MEAN: {priorMean.toFixed(0)}</span>
            <input
              type="range"
              min="60"
              max="200"
              value={priorMean}
              onChange={(e) => setPriorMean(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">EVIDENCE POSITION: {evidenceMean.toFixed(0)}</span>
            <input
              type="range"
              min="120"
              max="260"
              value={evidenceMean}
              onChange={(e) => setEvidenceMean(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 11. DEFAULT VISUALIZATION (Brutalist Fallback)
// ─────────────────────────────────────────────────────────────
function DefaultVisualization() {
  return (
    <VisualizationShell
      title="Inspect the algorithm's geometry"
      subtitle="Most algorithms impose a geometric structure on data, such as distances, rules, projections, or decision boundaries."
      insight="The geometry tells you what the model can represent and where its assumptions are likely to fail."
    >
      <div className="grid h-full gap-4 md:grid-cols-3">
        {[
          { title: "REPRESENT", text: "Transform raw inputs into vectors, matrices, or probability distributions.", color: "bg-primary" },
          { title: "SEPARATE", text: "Use boundaries, distances, or rules to organize the represented data.", color: "bg-error" },
          { title: "GENERALIZE", text: "Apply the learned structure to unseen examples under the same assumptions.", color: "bg-warning" },
        ].map((card) => (
          <div key={card.title} className="rounded border border-outline bg-surface-container p-5">
            <div className={`mb-4 inline-block px-3 py-1 text-sm font-semibold text-on-primary rounded border border-outline ${card.color}`}>
              {card.title}
            </div>
            <p className="text-sm font-medium leading-relaxed text-on-surface">{card.text}</p>
          </div>
        ))}
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// FOUNDATION: CALCULUS
// ─────────────────────────────────────────────────────────────
function CalculusVisualization() {
  const [lr, setLr] = useState(0.12); // Learning rate slider
  const [ballX, setBallX] = useState(60); // Current position along X
  const [steps, setSteps] = useState<number[]>([60]); // Step history

  const handleStep = () => {
    // f(x) = 0.01 * (x - 160)^2 + 40
    // f'(x) = 0.02 * (x - 160)
    const derivative = 0.02 * (ballX - 160);
    // Multiply by a visual scaling factor of 750 to map step size cleanly to canvas width
    const stepSize = derivative * lr * 750;
    const nextX = Math.min(280, Math.max(40, ballX - stepSize));
    setBallX(nextX);
    setSteps([...steps, nextX]);
  };

  const handleReset = () => {
    setBallX(60);
    setSteps([60]);
  };

  // Compute parabolic points
  const parabolaD = Array.from({ length: 241 }, (_, i) => {
    const x = 40 + i;
    const y = 0.012 * Math.pow(x - 160, 2) + 40;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const ballY = 0.012 * Math.pow(ballX - 160, 2) + 40;

  // Tangent line calculations
  const slopeM = 0.024 * (ballX - 160);
  const tx1 = ballX - 35;
  const ty1 = ballY - 35 * slopeM;
  const tx2 = ballX + 35;
  const ty2 = ballY + 35 * slopeM;

  return (
    <VisualizationShell
      title="Navigate the error landscape by following the slope"
      subtitle="Calculus computes the local steepness (gradient) of the loss curve. Step down the curve to optimize the parameters. Adjust the learning rate slider."
      insight="If your learning rate is too large, the step will overshoot the minimum and diverge (climb up the opposite side). If too small, it converges very slowly."
      legend={[
        { label: "Loss Curve", color: COLORS.pink },
        { label: "Step Path", color: COLORS.cyan },
        { label: "Local Tangent", color: COLORS.pink },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {/* Axes */}
            <line x1="30" y1="20" x2="30" y2="190" stroke={COLORS.border} strokeWidth="2" />
            <line x1="30" y1="190" x2="300" y2="190" stroke={COLORS.border} strokeWidth="2" />
            <text x="16" y="24" fill={COLORS.border} fontSize="12" fontFamily="monospace" fontWeight="bold">L</text>
            <text x="296" y="204" fill={COLORS.border} fontSize="12" fontFamily="monospace" fontWeight="bold">W</text>

            {/* Loss Curve */}
            <path d={parabolaD} fill="none" stroke={COLORS.muted} strokeWidth="4" />

            {/* Tangent line */}
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={COLORS.pink} strokeWidth="2.5" strokeDasharray="3 3" />

            {/* Step History lines */}
            {steps.map((xVal, idx) => {
              if (idx === 0) return null;
              const prevX = steps[idx - 1];
              const prevY = 0.012 * Math.pow(prevX - 160, 2) + 40;
              const currentY = 0.012 * Math.pow(xVal - 160, 2) + 40;
              return (
                <path
                  key={idx}
                  d={`M ${prevX} ${prevY} Q ${(prevX + xVal) / 2} ${Math.min(prevY, currentY) - 15} ${xVal} ${currentY}`}
                  fill="none"
                  stroke={COLORS.cyan}
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrow_calc)"
                />
              );
            })}

            {/* Current parameter node */}
            <circle cx={ballX} cy={ballY} r="7" fill={COLORS.cyan} stroke="var(--color-outline-dark)" strokeWidth="2" />

            <defs>
              <marker id="arrow_calc" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                <polygon points="0,0 10,5 0,10" fill={COLORS.cyan} />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-6 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">LEARNING RATE (η): {lr.toFixed(2)}</span>
            <input
              type="range"
              min="0.02"
              max="0.4"
              step="0.02"
              value={lr}
              onChange={(e) => setLr(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 self-end">
            <button
              onClick={handleStep}
              className="border border-outline rounded bg-secondary text-outline-dark px-3 py-1.5 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all cursor-pointer"
            >
              Take Step
            </button>
            <button
              onClick={handleReset}
              className="border border-outline rounded bg-surface-container-high text-on-surface px-3 py-1.5 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// FOUNDATION: LINEAR ALGEBRA
// ─────────────────────────────────────────────────────────────
function LinearAlgebraVisualization() {
  const [shear, setShear] = useState(0.4); // Shear displacement [-1, 1]

  // Skewed coordinate calculations
  const iHat_x = 160 + 90;
  const iHat_y = 110 - 20 + shear * 40;
  const jHat_x = 160 - 40 + shear * 65;
  const jHat_y = 110 - 60;

  return (
    <VisualizationShell
      title="Morph and rotate the fabric of data"
      subtitle="Matrices skew, rotate, or stretch coordinates. Adjust the shear slider to watch the coordinate system bend and transform."
      insight="A neural network layer is a sequence of these coordinate shears and folds, untangling data to make it linearly solvable."
      legend={[
        { label: "Original Grid", color: COLORS.muted },
        { label: "Warped Grid", color: COLORS.cyan },
        { label: "Basis Vector i-hat", color: COLORS.pink },
        { label: "Basis Vector j-hat", color: COLORS.yellow },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {/* Original Grid */}
            <g stroke={COLORS.muted} strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.4">
              <line x1="160" y1="20" x2="160" y2="200" />
              <line x1="160" y1="110" x2="300" y2="110" />
              <line x1="20" y1="110" x2="160" y2="110" />
            </g>

            {/* Skewed grid lines (Warped Space) */}
            <g stroke={COLORS.cyan} strokeWidth="2" strokeOpacity="0.8">
              {/* Sheared Vertical Lines */}
              {[-80, -40, 0, 40, 80].map((offset) => (
                <line
                  key={`v-${offset}`}
                  x1={160 + offset + shear * 45}
                  y1="20"
                  x2={160 + offset - shear * 45}
                  y2="200"
                />
              ))}
              {/* Sheared Horizontal Lines */}
              {[-60, -30, 0, 30, 60].map((offset) => (
                <line
                  key={`h-${offset}`}
                  x1="20"
                  y1={110 + offset - shear * 30}
                  x2="300"
                  y2={110 + offset + shear * 30}
                />
              ))}
            </g>

            {/* Sheared Basis Vectors */}
            <line x1="160" y1="110" x2={jHat_x} y2={jHat_y} stroke={COLORS.yellow} strokeWidth="4.5" markerEnd="url(#arrow_yellow)" />
            <line x1="160" y1="110" x2={iHat_x} y2={iHat_y} stroke={COLORS.pink} strokeWidth="4.5" markerEnd="url(#arrow_pink)" />

            <rect x={iHat_x + 10} y={iHat_y - 12} width="40" height="18" fill={COLORS.pink} stroke="var(--color-outline-dark)" strokeWidth="1.5" />
            <text x={iHat_x + 30} y={iHat_y + 1} fill="var(--color-on-surface)" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">i-hat</text>

            <rect x={jHat_x - 45} y={jHat_y - 12} width="40" height="18" fill={COLORS.yellow} stroke="var(--color-outline-dark)" strokeWidth="1.5" />
            <text x={jHat_x - 25} y={jHat_y + 1} fill="var(--color-on-surface)" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">j-hat</text>

            <defs>
              <marker id="arrow_pink" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                <polygon points="0,0 10,5 0,10" fill={COLORS.pink} />
              </marker>
              <marker id="arrow_yellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                <polygon points="0,0 10,5 0,10" fill={COLORS.yellow} />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <span className="font-mono text-[10px] text-on-surface font-bold">SHEAR COEFFICIENT (S): {shear.toFixed(2)}</span>
          <input
            type="range"
            min="-1.2"
            max="1.2"
            step="0.1"
            value={shear}
            onChange={(e) => setShear(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// FOUNDATION: PROBABILITY THEORY
// ─────────────────────────────────────────────────────────────
function ProbabilityTheoryVisualization() {
  const [mean, setMean] = useState(160); // Gaussian center [80, 240]
  const [std, setStd] = useState(30); // Gaussian width [15, 60]

  const gaussianPath = Array.from({ length: 281 }, (_, i) => {
    const x = 20 + i;
    // Gaussian formula scaled visually
    const amp = 150 * (30 / std);
    const y = 190 - amp * Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(std, 2)));
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <VisualizationShell
      title="Quantify uncertainty and bound the noise"
      subtitle="Probability models assume data fits mathematical distributions. Adjust the mean and standard deviation sliders below."
      insight="Notice how increasing standard deviation flattens and spreads the curve out, raising the variance and boundary of uncertainty."
      legend={[
        { label: "Variance Bounds (1σ)", color: COLORS.cyan },
        { label: "Target Distribution", color: COLORS.pink },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            <line x1="30" y1="190" x2="300" y2="190" stroke={COLORS.border} strokeWidth="4" />

            {/* Variance bounding area representing standard deviations */}
            <rect
              x={mean - std}
              y="30"
              width={std * 2}
              height="160"
              fill="rgba(85,107,74,0.10)"
              stroke={COLORS.cyan}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Gaussian Path */}
            <path d={gaussianPath} fill="none" stroke={COLORS.pink} strokeWidth="4" />

            {/* Center Mean line */}
            <line x1={mean} y1="30" x2={mean} y2="190" stroke={COLORS.muted} strokeWidth="2.5" />
            <rect x={mean - 10} y="15" width="20" height="18" fill={COLORS.bg} stroke="var(--color-outline-dark)" strokeWidth="1.5" />
            <text x={mean} y="28" fill="var(--color-on-surface)" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">μ</text>

            {/* Standard Deviation markers */}
            <line x1={mean - std} y1="140" x2={mean} y2="140" stroke={COLORS.cyan} strokeWidth="2" markerStart="url(#arrow_prob_rev)" markerEnd="url(#arrow_prob)" />
            <text x={mean - std / 2} y="132" fill={COLORS.cyan} fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">-1σ</text>

            <line x1={mean} y1="140" x2={mean + std} y2="140" stroke={COLORS.cyan} strokeWidth="2" markerStart="url(#arrow_prob_rev)" markerEnd="url(#arrow_prob)" />
            <text x={mean + std / 2} y="132" fill={COLORS.cyan} fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">+1σ</text>

            <defs>
              <marker id="arrow_prob" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                <polygon points="0,0 10,5 0,10" fill={COLORS.cyan} />
              </marker>
              <marker id="arrow_prob_rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                <polygon points="0,0 10,5 0,10" fill={COLORS.cyan} />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Sliders */}
        <div className="flex flex-wrap gap-6 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">MEAN (μ): {mean.toFixed(0)}</span>
            <input
              type="range"
              min="80"
              max="240"
              value={mean}
              onChange={(e) => setMean(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[140px] flex-1">
            <span className="font-mono text-[10px] text-on-surface font-bold">WIDTH (STD DEV σ): {std.toFixed(0)}</span>
            <input
              type="range"
              min="15"
              max="60"
              value={std}
              onChange={(e) => setStd(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// MODEL: PRINCIPAL COMPONENT ANALYSIS (PCA)
// ─────────────────────────────────────────────────────────────
function PcaVisualization() {
  const [angle, setAngle] = useState(30); // Rotation angle of component in degrees

  const rad = (angle * Math.PI) / 180;
  const dx = 120 * Math.cos(rad);
  const dy = -120 * Math.sin(rad);

  const pc1_x1 = 168 - dx;
  const pc1_y1 = 110 - dy;
  const pc1_x2 = 168 + dx;
  const pc1_y2 = 110 + dy;

  // Orthogonal component
  const pc2_dx = 50 * Math.sin(rad);
  const pc2_dy = 50 * Math.cos(rad);
  const pc2_x1 = 168 - pc2_dx;
  const pc2_y1 = 110 - pc2_dy;
  const pc2_x2 = 168 + pc2_dx;
  const pc2_y2 = 110 + pc2_dy;

  const points = [[96, 142], [112, 130], [126, 124], [142, 112], [160, 106], [176, 98], [194, 86], [216, 78], [234, 70]];

  // Project points onto the rotated line vector and measure variance
  // Projection logic: scalar projection value = (point . line_vector)
  let sumSquaredDist = 0;
  points.forEach(([x, y]) => {
    // Vector relative to center (168, 110)
    const rx = x - 168;
    const ry = y - 110;
    // Dot product with normal vector of the line
    // Normal vector is [-sin(rad), cos(rad)]
    const distToLine = Math.abs(rx * (-Math.sin(rad)) + ry * Math.cos(rad));
    sumSquaredDist += distToLine * distToLine;
  });

  const variance = Math.max(1, 100 - sumSquaredDist / 200);

  return (
    <VisualizationShell
      title="Rotate coordinates to find the strongest variance"
      subtitle="PCA rotates coordinates to align with directions of maximum variance. Adjust the rotation angle slider."
      insight="Notice that when the rotation line (PC1) slices directly through the center of the point spread, the projected variance score reaches its maximum peak."
      legend={[
        { label: "Data points", color: COLORS.cyan },
        { label: "PC1 Projection Axis", color: COLORS.pink },
        { label: "PC2 Orthogonal Axis", color: COLORS.yellow },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            <ScatterAxes />

            {/* Projected variance display bar */}
            <rect x="236" y="24" width="70" height="24" fill={COLORS.bg} stroke={COLORS.border} strokeWidth="2" />
            <text x="271" y="40" fill={COLORS.pink} fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {`VAR: ${variance.toFixed(1)}`}
            </text>

            {/* PC1 Axis */}
            <line x1={pc1_x1} y1={pc1_y1} x2={pc1_x2} y2={pc1_y2} stroke={COLORS.pink} strokeWidth="4" />
            {/* PC2 Axis */}
            <line x1={pc2_x1} y1={pc2_y1} x2={pc2_x2} y2={pc2_y2} stroke={COLORS.yellow} strokeWidth="2.5" strokeDasharray="4 4" />

            {/* Data Points */}
            {points.map(([x, y], idx) => {
              // Find projection point coordinate on line:
              // Point v = (x-168, y-110). Line unit vector u = (cos, -sin).
              // Projection length p = dot(v, u). Projected point = center + p * u.
              const rx = x - 168;
              const ry = y - 110;
              const pLength = rx * Math.cos(rad) + ry * (-Math.sin(rad));
              const projX = 168 + pLength * Math.cos(rad);
              const projY = 110 - pLength * Math.sin(rad);

              return (
                <g key={idx}>
                  {/* Dashed line to projection point */}
                  <line x1={x} y1={y} x2={projX} y2={projY} stroke={COLORS.muted} strokeWidth="1" strokeDasharray="2 2" />
                  <rect x={x - 4} y={y - 4} width="8" height="8" fill={COLORS.cyan} stroke="var(--color-outline-dark)" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <span className="font-mono text-[10px] text-on-surface font-bold">COMPONENT ANGLE: {angle}°</span>
          <input
            type="range"
            min="0"
            max="180"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 12. MARKOV CHAIN MONTE CARLO (MCMC)
// ─────────────────────────────────────────────────────────────
function McmcVisualization() {
  const [chain, setChain] = useState<[number, number][]>([[80, 140]]);
  const [rejected, setRejected] = useState<[number, number] | null>([250, 50]);
  const [status, setStatus] = useState("Walk initialized. Click Step to run sampling.");

  const handleStep = () => {
    const last = chain[chain.length - 1];
    // Generate a random step proposal
    const stepX = (Math.random() * 2 - 1) * 45;
    const stepY = (Math.random() * 2 - 1) * 45;
    const proposedX = Math.min(270, Math.max(50, last[0] + stepX));
    const proposedY = Math.min(180, Math.max(30, last[1] + stepY));

    // High probability density target centered around (190, 105)
    const distLast = Math.pow(last[0] - 190, 2) + Math.pow(last[1] - 105, 2);
    const distProposed = Math.pow(proposedX - 190, 2) + Math.pow(proposedY - 105, 2);

    // Accept probability based on density comparison (Metropolis-Hastings ratio)
    const ratio = Math.exp(-(distProposed - distLast) / 2500);
    const accept = Math.random() < ratio;

    if (accept) {
      setChain([...chain, [proposedX, proposedY]]);
      setRejected(null);
      setStatus("Step accepted. Moved closer to high-probability density.");
    } else {
      setRejected([proposedX, proposedY]);
      setStatus("Step rejected (proposed coordinate had probability too low).");
    }
  };

  const handleReset = () => {
    setChain([[80, 140]]);
    setRejected(null);
    setStatus("Simulation reset.");
  };

  return (
    <VisualizationShell
      title="Sample a distribution with a Markov chain"
      subtitle="MCMC takes stochastic steps. Accepted steps map the distribution; rejected steps (too far outside density bounds) are discarded. Click Step."
      insight="Notice how accepted walker nodes group tightly within the high probability core, mapping the shape without direct calculus integration."
      legend={[
        { label: "Target Distribution Core", color: COLORS.cyan },
        { label: "Accepted Chain Path", color: COLORS.yellow },
        { label: "Rejected Step", color: COLORS.pink },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            <ScatterAxes />

            {/* Contour boundaries */}
            <path d="M 100 100 L 140 30 L 260 60 L 280 150 L 200 190 Z" fill="none" stroke={COLORS.muted} strokeWidth="2.5" strokeDasharray="6 6" />
            <path d="M 150 100 L 180 70 L 230 90 L 220 140 L 170 130 Z" fill="rgba(85,107,74,0.10)" stroke={COLORS.cyan} strokeWidth="3" />
            <text x="195" y="108" fill={COLORS.cyan} fontSize="14" fontFamily="monospace" fontWeight="bold" textAnchor="middle">P(X)</text>

            {/* Accepted chain line */}
            {chain.length > 1 && (
              <polyline
                points={chain.map(p => p.join(',')).join(' ')}
                fill="none"
                stroke={COLORS.yellow}
                strokeWidth="3.5"
              />
            )}

            {/* Chain nodes */}
            {chain.map(([x, y], idx) => {
              const isLast = idx === chain.length - 1;
              return (
                <rect
                  key={idx}
                  x={x - 5}
                  y={y - 5}
                  width="10"
                  height="10"
                  fill={isLast ? "var(--color-on-surface)" : COLORS.yellow}
                  stroke={COLORS.yellow}
                  strokeWidth="2"
                />
              );
            })}

            {/* Rejected node link */}
            {rejected && (
              <g>
                <line
                  x1={chain[chain.length - 1][0]}
                  y1={chain[chain.length - 1][1]}
                  x2={rejected[0]}
                  y2={rejected[1]}
                  stroke={COLORS.pink}
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <rect x={rejected[0] - 6} y={rejected[1] - 6} width="12" height="12" fill="none" stroke={COLORS.pink} strokeWidth="2.5" />
                <line x1={rejected[0] - 6} y1={rejected[1] - 6} x2={rejected[0] + 6} y2={rejected[1] + 6} stroke={COLORS.pink} strokeWidth="2.5" />
                <line x1={rejected[0] - 6} y1={rejected[1] + 6} x2={rejected[0] + 6} y2={rejected[1] - 6} stroke={COLORS.pink} strokeWidth="2.5" />
              </g>
            )}

            <text x="160" y="202" fill={COLORS.border} fontSize="9" fontFamily="monospace" textAnchor="middle" className="truncate">
              {status}
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex gap-3 rounded bg-surface p-4 border border-outline">
          <button
            onClick={handleStep}
            className="border border-outline rounded bg-secondary text-outline-dark px-3 py-1.5 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all cursor-pointer"
          >
            Take Random Step
          </button>
          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container-high text-on-surface px-3 py-1.5 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 13. CONVOLUTIONAL NEURAL NETWORKS (CNN)
// ─────────────────────────────────────────────────────────────
function CnnVisualization() {
  const [kx, setKx] = useState(0);
  const [ky, setKy] = useState(0);

  const inputGrid = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
    [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
    [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
    [0, 4], [1, 4], [2, 4], [3, 4], [4, 4]
  ];

  const inputValues = [
    [1, 0, 1, 0, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [1, 0, 0, 1, 1]
  ];

  const kernel = [
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1]
  ];

  const outputGrid = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2]
  ];

  const getConvValue = (ox: number, oy: number) => {
    let sum = 0;
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        sum += inputValues[oy + dy][ox + dx] * kernel[dy][dx];
      }
    }
    return sum;
  };

  const handleInputClick = (ix: number, iy: number) => {
    // Center the filter on the clicked cell as much as possible
    setKx(Math.min(2, Math.max(0, ix - 1)));
    setKy(Math.min(2, Math.max(0, iy - 1)));
  };

  const activeOutVal = getConvValue(kx, ky);

  // Generate step-by-step mathematical multiplication text
  const getMathString = () => {
    const parts: string[] = [];
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        const iVal = inputValues[ky + dy][kx + dx];
        const kVal = kernel[dy][dx];
        if (kVal !== 0) {
          parts.push(`(${iVal} * ${kVal})`);
        }
      }
    }
    return parts.join(" + ") + ` = ${activeOutVal}`;
  };

  return (
    <VisualizationShell
      title="Sliding mathematical filters over pixels"
      subtitle="A CNN uses small kernels (filters) that slide across the image, doing element-wise multiplication to compile spatial patterns into feature maps."
      insight="By sharing the filter weights across all pixel areas, the model is highly efficient and learns translation-invariant features."
      legend={[
        { label: "Input Image", color: COLORS.cyan },
        { label: "Sliding Filter (Kernel)", color: COLORS.yellow },
        { label: "Feature Map", color: COLORS.pink },
      ]}
    >
      <div className="flex h-full flex-col gap-4">
        {/* SVG Container */}
        <div className="relative w-full border border-outline bg-surface-container-lowest p-4 rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {/* Input grid (Left) */}
            {inputGrid.map(([x, y]) => {
              const val = inputValues[y][x];
              const isCovered = x >= kx && x < kx + 3 && y >= ky && y < ky + 3;
              return (
                <g 
                  key={`in-${x}-${y}`} 
                  className="cursor-pointer select-none"
                  onClick={() => handleInputClick(x, y)}
                >
                  <rect
                    x={30 + x * 26}
                    y={40 + y * 26}
                    width="22"
                    height="22"
                    fill={isCovered ? "rgba(255, 234, 0, 0.05)" : "none"}
                    stroke={isCovered ? COLORS.yellow : COLORS.cyan}
                    strokeWidth={isCovered ? "2" : "1.5"}
                    strokeOpacity={isCovered ? "0.9" : "0.4"}
                  />
                  <text
                    x={30 + x * 26 + 11}
                    y={40 + y * 26 + 15}
                    fill={isCovered ? COLORS.yellow : COLORS.cyan}
                    fillOpacity={isCovered ? "1" : "0.7"}
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Sliding Filter outline (3x3 on top-left of input grid) */}
            <rect
              x={28 + kx * 26}
              y={38 + ky * 26}
              width="78"
              height="78"
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth="2.5"
              pointerEvents="none"
            />

            {/* Feature Map (Right) */}
            {outputGrid.map(([x, y]) => {
              const isActive = x === kx && y === ky;
              const val = getConvValue(x, y);
              return (
                <g 
                  key={`out-${x}-${y}`} 
                  className="cursor-pointer select-none"
                  onClick={() => { setKx(x); setKy(y); }}
                >
                  <rect
                    x={200 + x * 26}
                    y={66 + y * 26}
                    width="22"
                    height="22"
                    fill={isActive ? COLORS.pink : "rgba(255,51,102,0.05)"}
                    stroke={COLORS.pink}
                    strokeWidth="2"
                  />
                  <text
                    x={200 + x * 26 + 11}
                    y={66 + y * 26 + 15}
                    fill={isActive ? "#000" : COLORS.pink}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Connection line from filter center to matching output pixel */}
            <line 
              x1={28 + kx * 26 + 39} 
              y1={38 + ky * 26 + 39} 
              x2={200 + kx * 26 + 11} 
              y2={66 + ky * 26 + 11} 
              stroke={COLORS.pink} 
              strokeWidth="1.5" 
              strokeDasharray="3 3" 
              pointerEvents="none"
            />

            <text x="82" y="24" fill={COLORS.cyan} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">INPUT (5x5)</text>
            <text x="226" y="52" fill={COLORS.pink} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">FEATURE MAP (3x3)</text>
          </svg>
        </div>

        {/* Info & Control panel */}
        <div className="rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between gap-2 border-b-2 border-outline-variant pb-2">
            <span className="text-secondary font-semibold tracking-wide uppercase">KERNEL: Sobel Edge filter [ [1, 0, -1], [1, 0, -1], [1, 0, -1] ]</span>
            <span className="text-primary font-semibold uppercase">Active Cell: ({kx}, {ky}), value = {activeOutVal}</span>
          </div>
          
          <div className="text-on-surface-variant leading-relaxed rounded bg-surface-container-lowest p-2 border border-outline-variant select-all">
            <span className="text-on-surface-variant mr-1.5 font-bold">CONV MATH:</span>
            {getMathString()}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <button
              onClick={() => setKx(prev => Math.max(0, prev - 1))}
              disabled={kx === 0}
              className="border border-outline rounded bg-secondary text-outline-dark px-3 py-1 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Left
            </button>
            <button
              onClick={() => setKx(prev => Math.min(2, prev + 1))}
              disabled={kx === 2}
              className="border border-outline rounded bg-secondary text-outline-dark px-3 py-1 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Right
            </button>
            <button
              onClick={() => setKy(prev => Math.max(0, prev - 1))}
              disabled={ky === 0}
              className="border border-outline rounded bg-secondary text-outline-dark px-3 py-1 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Up
            </button>
            <button
              onClick={() => setKy(prev => Math.min(2, prev + 1))}
              disabled={ky === 2}
              className="border border-outline rounded bg-secondary text-outline-dark px-3 py-1 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Down
            </button>
            <span className="hidden self-center text-[10px] font-bold tracking-wide text-on-surface-variant sm:inline">Click any cell to shift kernel</span>
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 14. COMPUTER VISION (CV)
// ─────────────────────────────────────────────────────────────
function ComputerVisionVisualization() {
  const [predX, setPredX] = useState(58);
  const [predY, setPredY] = useState(70);
  const [predW, setPredW] = useState(134);
  const [predH, setPredH] = useState(92);

  // Ground Truth fixed box
  const gtX = 62;
  const gtY = 76;
  const gtW = 126;
  const gtH = 86;

  // Calculate Intersection
  const ix1 = Math.max(gtX, predX);
  const iy1 = Math.max(gtY, predY);
  const ix2 = Math.min(gtX + gtW, predX + predW);
  const iy2 = Math.min(gtY + gtH, predY + predH);

  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const intersectionArea = iw * ih;

  // Calculate Union
  const gtArea = gtW * gtH;
  const predArea = predW * predH;
  const unionArea = gtArea + predArea - intersectionArea;

  const iou = unionArea > 0 ? intersectionArea / unionArea : 0;
  const loss = 1 - iou;

  return (
    <VisualizationShell
      title="Bounding box and semantic overlays"
      subtitle="Computer vision translates visual coordinates into structured labels, drawing localization bounding boxes and computing pixel confidence probabilities."
      insight="Unlike classification, localization requires predicting coordinate points (x, y, w, h) and finding overlap IoU values against ground truth labels."
      legend={[
        { label: "Detected Object (Pred)", color: COLORS.pink },
        { label: "Ground Truth Box (GT)", color: COLORS.cyan },
        { label: "Intersection (Overlap)", color: COLORS.yellow },
      ]}
    >
      <div className="flex h-full flex-col gap-4 lg:flex-row">
        {/* SVG Container */}
        <div className="relative w-full max-w-[320px] mx-auto border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {/* Background image boundary */}
            <rect x="20" y="24" width="280" height="172" fill="none" stroke={COLORS.grid} strokeWidth="2" />

            {/* Stylized brutalist car object */}
            <rect x="70" y="110" width="110" height="34" fill="#2d3748" stroke={COLORS.border} strokeWidth="2" />
            <rect x="85" y="86" width="70" height="25" fill="#2d3748" stroke={COLORS.border} strokeWidth="2" />
            <circle cx="100" cy="144" r="12" fill={COLORS.bg} stroke={COLORS.border} strokeWidth="2" />
            <circle cx="150" cy="144" r="12" fill={COLORS.bg} stroke={COLORS.border} strokeWidth="2" />

            {/* Ground truth box (Cyan) */}
            <rect x={gtX} y={gtY} width={gtW} height={gtH} stroke={COLORS.cyan} strokeWidth="2.5" strokeDasharray="6 4" fill="none" />

            {/* Overlap area highlight (Yellow) */}
            {intersectionArea > 0 && (
              <rect x={ix1} y={iy1} width={iw} height={ih} fill="rgba(255, 234, 0, 0.25)" stroke={COLORS.yellow} strokeWidth="1.5" strokeDasharray="2 2" />
            )}

            {/* Prediction box (Pink) */}
            <rect x={predX} y={predY} width={predW} height={predH} stroke={COLORS.pink} strokeWidth="3" fill="none" />
            {/* Label box for prediction */}
            <rect x={predX} y={Math.max(24, predY - 18)} width="72" height="18" fill={COLORS.pink} />
            <text x={predX + 36} y={Math.max(24, predY - 18) + 13} fill="var(--color-on-surface)" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">CAR 98%</text>

            {/* Live IoU score and stats Overlay */}
            <g transform="translate(205, 30)">
              <rect x="0" y="0" width="85" height="48" fill={COLORS.bg} stroke={COLORS.border} strokeWidth="2" />
              <text x="8" y="18" fill={COLORS.yellow} fontSize="10" fontFamily="monospace" fontWeight="bold">IoU: {iou.toFixed(2)}</text>
              <text x="8" y="36" fill={COLORS.pink} fontSize="10" fontFamily="monospace" fontWeight="bold">Loss: {loss.toFixed(2)}</text>
            </g>
          </svg>
        </div>

        {/* Sliders Control Panel */}
        <div className="flex flex-1 flex-col gap-3 rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface">
          <span className="text-sm text-secondary font-semibold tracking-wide border-b-2 border-outline-variant pb-1.5 mb-1">Adjust Predicted Bounding Box</span>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-bold">
              <span>X POSITION:</span>
              <span className="text-primary font-semibold">{predX}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={predX}
              onChange={(e) => setPredX(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-bold">
              <span>Y POSITION:</span>
              <span className="text-primary font-semibold">{predY}px</span>
            </div>
            <input
              type="range"
              min="40"
              max="110"
              value={predY}
              onChange={(e) => setPredY(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-bold">
              <span>WIDTH:</span>
              <span className="text-primary font-semibold">{predW}px</span>
            </div>
            <input
              type="range"
              min="70"
              max="180"
              value={predW}
              onChange={(e) => setPredW(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-bold">
              <span>HEIGHT:</span>
              <span className="text-primary font-semibold">{predH}px</span>
            </div>
            <input
              type="range"
              min="50"
              max="130"
              value={predH}
              onChange={(e) => setPredH(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 15. NATURAL LANGUAGE PROCESSING (NLP)
// ─────────────────────────────────────────────────────────────
function NlpVisualization() {
  const [equation, setEquation] = useState<"king-queen" | "capital" | "age">("king-queen");
  const [noise, setNoise] = useState(0);

  const equationData = {
    "king-queen": {
      title: "King - Man + Woman = Queen",
      labelA: "MAN",
      labelB: "WOMAN",
      labelC: "KING",
      labelD: "QUEEN",
      relX: "GENDER SHIFT",
      relY: "ROYALTY SHIFT",
      neighbors: [
        { val: "QUEEN (98%)", noiseMax: 2 },
        { val: "PRINCESS (81%)", noiseMax: 5 },
        { val: "DUCHESS (68%)", noiseMax: 8 },
        { val: "CHAIR (21%)", noiseMax: 10 }
      ]
    },
    capital: {
      title: "Paris - France + Germany = Berlin",
      labelA: "FRANCE",
      labelB: "GERMANY",
      labelC: "PARIS",
      labelD: "BERLIN",
      relX: "GEOGRAPHY SHIFT",
      relY: "CAPITAL STATUS",
      neighbors: [
        { val: "BERLIN (95%)", noiseMax: 2 },
        { val: "MUNICH (79%)", noiseMax: 5 },
        { val: "FRANKFURT (65%)", noiseMax: 8 },
        { val: "AIRPLANE (24%)", noiseMax: 10 }
      ]
    },
    age: {
      title: "Dog - Adult + Baby = Puppy",
      labelA: "ADULT",
      labelB: "BABY",
      labelC: "DOG",
      labelD: "PUPPY",
      relX: "AGE SHIFT",
      relY: "SPECIES SHIFT",
      neighbors: [
        { val: "PUPPY (96%)", noiseMax: 2 },
        { val: "KITTEN (78%)", noiseMax: 5 },
        { val: "FOAL (62%)", noiseMax: 8 },
        { val: "TELEVISION (18%)", noiseMax: 10 }
      ]
    }
  };

  const current = equationData[equation];

  // Calculate vector nodes
  const ax = 80, ay = 150; // A: e.g. MAN
  const bx = 210, by = 150; // B: e.g. WOMAN
  const cx = 80, cy = 70; // C: e.g. KING
  
  // Calculate Target node with noise
  const noiseX = noise * 3 * Math.sin(noise * 1.5);
  const noiseY = -noise * 3.5 * Math.cos(noise * 1.2);
  const dx = 210 + noiseX; // D: e.g. QUEEN (predicted)
  const dy = 70 + noiseY;

  // Determine closest retrieved neighbor word from lists based on noise level
  let retrievedWord = current.neighbors[0].val;
  for (let i = 0; i < current.neighbors.length; i++) {
    if (noise <= current.neighbors[i].noiseMax) {
      retrievedWord = current.neighbors[i].val;
      break;
    }
  }

  return (
    <VisualizationShell
      title="Mapping linguistic meaning to coordinates"
      subtitle="NLP translates raw words into dense vectors. In this semantic coordinate system, the relative spatial distance between vectors represents word meaning similarity."
      insight="Using vector math, we can compute semantic algebra. Introducing noise mimics high-dimensional projection errors during retrieval."
      legend={[
        { label: "Word Coordinates", color: COLORS.cyan },
        { label: "Semantic Relation", color: COLORS.pink },
        { label: "Algebra Vector", color: COLORS.yellow },
      ]}
    >
      <div className="flex h-full flex-col gap-4 lg:flex-row">
        {/* SVG Container */}
        <div className="relative w-full max-w-[320px] mx-auto border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {/* XY Axes */}
            <line x1="40" y1="20" x2="40" y2="190" stroke={COLORS.grid} strokeWidth="2" />
            <line x1="40" y1="190" x2="296" y2="190" stroke={COLORS.grid} strokeWidth="2" />
            <text x="32" y="24" fill={COLORS.muted} fontSize="10" fontFamily="monospace">Y</text>
            <text x="294" y="202" fill={COLORS.muted} fontSize="10" fontFamily="monospace">X</text>

            {/* Gender/Horizontal shift line (Pink dashed) */}
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke={COLORS.pink} strokeWidth="2" strokeDasharray="4 4" />
            <line x1={cx} y1={cy} x2={210} y2={70} stroke={COLORS.pink} strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />

            {/* Upward Royalty/Species/Status vectors (Yellow) */}
            <line x1={ax} y1={ay} x2={cx} y2={cy + 12} stroke={COLORS.yellow} strokeWidth="2.5" markerEnd="url(#nlp_arrow)" />
            {/* Algebra vector path from King (cx, cy) to noisy target Queen (dx, dy) */}
            <line x1={cx} y1={cy} x2={dx} y2={dy} stroke={COLORS.yellow} strokeWidth="2.5" strokeDasharray="2 2" markerEnd="url(#nlp_arrow)" />

            {/* Ground truth target node (Queen) - faint overlay if noise is high */}
            {noise > 0 && (
              <g opacity="0.3">
                <rect x={205} y={65} width="10" height="10" fill="none" stroke={COLORS.cyan} strokeWidth="1.5" />
                <text x={210} y={92} fill={COLORS.muted} fontSize="8" fontFamily="monospace" textAnchor="middle">{current.labelD}</text>
              </g>
            )}

            {/* Semantic Nodes */}
            {[
              { label: current.labelA, x: ax, y: ay },
              { label: current.labelB, x: bx, y: by },
              { label: current.labelC, x: cx, y: cy },
              { label: current.labelD, x: dx, y: dy, isTarget: true }
            ].map((node, i) => (
              <g key={i}>
                <rect 
                  x={node.x - 5} 
                  y={node.y - 5} 
                  width="10" 
                  height="10" 
                  fill={node.isTarget ? (noise > 3 ? COLORS.pink : COLORS.green) : COLORS.cyan} 
                  stroke="var(--color-outline-dark)" 
                  strokeWidth="2" 
                />
                <rect x={node.x - 30} y={node.y + 10} width="60" height="16" fill={COLORS.bg} stroke={COLORS.border} strokeWidth="1" />
                <text x={node.x} y={node.y + 21} fill="var(--color-on-surface)" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {node.isTarget ? (noise > 3 ? "RETRIEVED" : node.label) : node.label}
                </text>
              </g>
            ))}

            <defs>
              <marker id="nlp_arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <polygon points="0,0 10,5 0,10" fill={COLORS.yellow} />
              </marker>
            </defs>

            <text x="145" y="142" fill={COLORS.pink} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{current.relX}</text>
            <text x="48" y="112" fill={COLORS.yellow} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle" transform="rotate(-90 48 112)">{current.relY}</text>
          </svg>
        </div>

        {/* Controls and calculations */}
        <div className="flex flex-1 flex-col justify-between rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-secondary font-semibold tracking-wide">Semantic Equation:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setEquation("king-queen"); setNoise(0); }}
                className={`px-3 py-1.5 text-xs font-semibold border border-outline uppercase transition-all cursor-pointer  ${equation === "king-queen" ? "rounded bg-secondary text-outline-dark" : "rounded bg-surface-container-high hover:"}`}
              >
                King & Queen
              </button>
              <button
                onClick={() => { setEquation("capital"); setNoise(0); }}
                className={`px-3 py-1.5 text-xs font-semibold border border-outline uppercase transition-all cursor-pointer  ${equation === "capital" ? "rounded bg-secondary text-outline-dark" : "rounded bg-surface-container-high hover:"}`}
              >
                Capitals
              </button>
              <button
                onClick={() => { setEquation("age"); setNoise(0); }}
                className={`px-3 py-1.5 text-xs font-semibold border border-outline uppercase transition-all cursor-pointer  ${equation === "age" ? "rounded bg-secondary text-outline-dark" : "rounded bg-surface-container-high hover:"}`}
              >
                Age & Animals
              </button>
            </div>

            <div className="mt-2 border-t-2 border-outline-variant pt-2">
              <div className="flex justify-between text-on-surface font-bold mb-1">
                <span>VECTOR NOISE SCALE:</span>
                <span className={noise > 3 ? "text-primary font-semibold" : "text-secondary font-semibold"}>{noise} (distorted)</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={noise}
                onChange={(e) => setNoise(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="rounded bg-surface-container-lowest p-3 border border-outline text-xs leading-relaxed mt-2">
            <div className="text-on-surface-variant font-semibold tracking-wide mb-1">ALGEBRA RESULT:</div>
            <div className="text-on-surface text-sm font-bold mb-1.5 rounded bg-surface-container-lowest/60 p-1 border border-outline-variant">{current.title}</div>
            <div className="flex justify-between border-t border-outline-variant pt-1.5">
              <span className="text-on-surface-variant">Retrieved Nearest Vector:</span>
              <span className={`font-semibold uppercase tracking-wide ${noise > 3 ? "text-primary" : "text-secondary"}`}>{retrievedWord}</span>
            </div>
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 16. AUTOENCODERS
// ─────────────────────────────────────────────────────────────
function AutoencodersVisualization() {
  const [inputsState, setInputsState] = useState<boolean[]>([true, false, true, false, false]);

  const inputsY = [40, 75, 110, 145, 180];
  const bottleneckY = [85, 135];
  const outputsY = [40, 75, 110, 145, 180];

  // Sigmoid Helper
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

  // Compute Latent Nodes (z0, z1)
  // z0 detects features in the upper half (inputs 0, 1, 2)
  // z1 detects features in the lower half (inputs 2, 3, 4)
  const x0 = inputsState[0] ? 1 : 0;
  const x1 = inputsState[1] ? 1 : 0;
  const x2 = inputsState[2] ? 1 : 0;
  const x3 = inputsState[3] ? 1 : 0;
  const x4 = inputsState[4] ? 1 : 0;

  const z0 = sigmoid(1.8 * x0 + 1.8 * x1 + 0.8 * x2 - 1.8);
  const z1 = sigmoid(0.8 * x2 + 1.8 * x3 + 1.8 * x4 - 1.8);

  // Compute Reconstructed Outputs
  const r0 = sigmoid(3.0 * z0 - 1.5);
  const r1 = sigmoid(3.0 * z0 - 1.5);
  const r2 = sigmoid(2.0 * z0 + 2.0 * z1 - 2.0);
  const r3 = sigmoid(3.0 * z1 - 1.5);
  const r4 = sigmoid(3.0 * z1 - 1.5);

  const reconstructions = [r0, r1, r2, r3, r4];
  const latentValues = [z0, z1];

  const handleToggle = (index: number) => {
    const next = [...inputsState];
    next[index] = !next[index];
    setInputsState(next);
  };

  const setPreset = (preset: string) => {
    switch (preset) {
      case "all":
        setInputsState([true, true, true, true, true]);
        break;
      case "edges":
        setInputsState([true, false, false, false, true]);
        break;
      case "center":
        setInputsState([false, false, true, false, false]);
        break;
      case "clear":
        setInputsState([false, false, false, false, false]);
        break;
    }
  };

  return (
    <VisualizationShell
      title="Compress data through a tight bottleneck"
      subtitle="Autoencoders compress data into a highly restricted bottleneck layer (latent space) and then reconstruct the original input from it."
      insight="Click the input nodes to toggle binary signals. Observe how latent activation levels shift and how outputs attempt lossy reconstruction."
      legend={[
        { label: "Input Vector", color: COLORS.cyan },
        { label: "Latent Code", color: COLORS.yellow },
        { label: "Reconstructed Output", color: COLORS.pink },
      ]}
    >
      <div className="flex h-full flex-col gap-4 lg:flex-row">
        {/* SVG Container */}
        <div className="relative w-full max-w-[320px] mx-auto border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {/* Encoder lines (cyan or yellow depending on active input) */}
            {inputsY.map((inY, i) =>
              bottleneckY.map((botY, j) => {
                const isActive = inputsState[i];
                return (
                  <line
                    key={`enc-${i}-${j}`}
                    x1="60"
                    y1={inY}
                    x2="160"
                    y2={botY}
                    stroke={isActive ? COLORS.cyan : COLORS.grid}
                    strokeWidth={isActive ? "2" : "1"}
                    strokeOpacity={isActive ? "0.6" : "0.15"}
                  />
                );
              })
            )}

            {/* Decoder lines (pink proportional to reconstruction confidence) */}
            {bottleneckY.map((botY, j) =>
              outputsY.map((outY, i) => {
                const activeAmount = latentValues[j];
                return (
                  <line
                    key={`dec-${j}-${i}`}
                    x1="160"
                    y1={botY}
                    x2="260"
                    y2={outY}
                    stroke={COLORS.pink}
                    strokeWidth="1.5"
                    strokeOpacity={0.1 + 0.65 * activeAmount}
                  />
                );
              })
            )}

            {/* Input Nodes - Clickable */}
            {inputsY.map((y, i) => {
              const isActive = inputsState[i];
              return (
                <g 
                  key={`in-node-${i}`} 
                  className="cursor-pointer select-none"
                  onClick={() => handleToggle(i)}
                >
                  <rect 
                    x="48" 
                    y={y - 10} 
                    width="20" 
                    height="20" 
                    fill={isActive ? COLORS.cyan : "#222"} 
                    stroke={COLORS.cyan} 
                    strokeWidth="2.5" 
                  />
                  <text 
                    x="58" 
                    y={y + 4} 
                    fill={isActive ? "#000" : COLORS.cyan} 
                    fontSize="10" 
                    fontFamily="monospace" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {isActive ? "1" : "0"}
                  </text>
                </g>
              );
            })}

            {/* Bottleneck Nodes (Latent) */}
            {bottleneckY.map((y, i) => {
              const val = latentValues[i];
              return (
                <g key={`bot-node-${i}`}>
                  <rect 
                    x="150" 
                    y={y - 10} 
                    width="20" 
                    height="20" 
                    fill={`rgba(255, 234, 0, ${val})`} 
                    stroke={COLORS.yellow} 
                    strokeWidth="2.5" 
                  />
                  <text 
                    x="160" 
                    y={y + 4} 
                    fill="var(--color-on-surface)" 
                    fontSize="8" 
                    fontFamily="monospace" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {val.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Output Nodes (Reconstruction) */}
            {outputsY.map((y, i) => {
              const val = reconstructions[i];
              return (
                <g key={`out-node-${i}`}>
                  <rect 
                    x="250" 
                    y={y - 10} 
                    width="20" 
                    height="20" 
                    fill={`rgba(255, 51, 102, ${val})`} 
                    stroke={COLORS.pink} 
                    strokeWidth="2.5" 
                  />
                  <text 
                    x="260" 
                    y={y + 4} 
                    fill="var(--color-on-surface)" 
                    fontSize="8" 
                    fontFamily="monospace" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {val.toFixed(2)}
                  </text>
                </g>
              );
            })}

            <text x="58" y="24" fill={COLORS.cyan} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">INPUT</text>
            <text x="160" y="24" fill={COLORS.yellow} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">LATENT Z</text>
            <text x="260" y="24" fill={COLORS.pink} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">RECON X̂</text>
          </svg>
        </div>

        {/* Preset & Details panel */}
        <div className="flex flex-1 flex-col justify-between rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-secondary font-semibold tracking-wide">Load Input Presets:</span>
            <div className="flex flex-wrap gap-2">
              {["all", "edges", "center", "clear"].map((p) => {
                const labels = { all: "All 1s", edges: "Edges Only", center: "Center Only", clear: "Clear All" };
                return (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    className="px-3 py-1.5 text-[10px] font-semibold border border-outline uppercase rounded bg-surface-container-high hover:bg-tertiary hover:text-on-tertiary transition-all cursor-pointer  hover: active:translate-y-0 "
                  >
                    {labels[p as keyof typeof labels]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 border-t-2 border-outline-variant pt-2 flex flex-col gap-1.5">
            <div className="font-semibold text-primary tracking-wide">RECONSTRUCTION LOSS:</div>
            <div className="rounded bg-surface-container-lowest p-3 border border-outline text-sm font-semibold flex justify-between items-center">
              <span>MSE Loss:</span>
              <span className="text-primary text-base">
                {(
                  inputsState.reduce((acc, current, idx) => {
                    const x = current ? 1 : 0;
                    const xHat = reconstructions[idx];
                    return acc + Math.pow(x - xHat, 2);
                  }, 0) / 5
                ).toFixed(4)}
              </span>
            </div>
            <div className="text-on-surface-variant text-[10px] leading-relaxed mt-1">
              Note: Because the latent space has only 2 nodes (capacity = 2 real numbers), compressing 5 binary inputs introduces small loss when reconstruction is decoded.
            </div>
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 17. TRANSFORMERS
// ─────────────────────────────────────────────────────────────
function TransformersVisualization() {
  const [hoveredToken, setHoveredToken] = useState<number | null>(1); // Default to "dog" (index 1)

  const words = ["The", "dog", "was", "tired"];
  const matrix = [
    [0.60, 0.15, 0.10, 0.15], // The
    [0.08, 0.15, 0.05, 0.72], // dog -> attends highly to tired
    [0.10, 0.22, 0.50, 0.18], // was
    [0.05, 0.68, 0.12, 0.15]  // tired -> attends highly to dog
  ];

  const getInsightText = () => {
    if (hoveredToken === null) return "Hover over or click a word to explore context connections.";
    const qWord = words[hoveredToken];
    const weights = matrix[hoveredToken];
    
    // Find highest attended key
    let maxIdx = 0;
    let maxVal = -1;
    weights.forEach((w, idx) => {
      if (w > maxVal) {
        maxVal = w;
        maxIdx = idx;
      }
    });

    const kWord = words[maxIdx];
    if (qWord === "dog" && kWord === "tired") {
      return `QUERY "${qWord}" focuses heavily on KEY "${kWord}" (${(maxVal * 100).toFixed(0)}%). This highlights a strong subject-adjective semantic relationship.`;
    }
    if (qWord === "tired" && kWord === "dog") {
      return `QUERY "${qWord}" attends back to "${kWord}" (${(maxVal * 100).toFixed(0)}%), binding the adjective context to the subject noun.`;
    }
    return `QUERY "${qWord}" attends highest to KEY "${kWord}" (${(maxVal * 100).toFixed(0)}% weight) to gather local context.`;
  };

  return (
    <VisualizationShell
      title="Self-Attention word compatibility heatmap"
      subtitle="Transformers use self-attention to calculate how much each word in a sentence should attend to every other word, creating a dynamic compatibility weight matrix."
      insight="Notice how attention routing is bidirectional and computed in parallel. Hover or click rows/tokens to isolate attention vectors."
      legend={[
        { label: "High Attention", color: COLORS.pink },
        { label: "Medium Attention", color: COLORS.yellow },
        { label: "Low Attention", color: COLORS.grid },
      ]}
    >
      <div className="flex h-full flex-col gap-4 lg:flex-row">
        {/* SVG Container */}
        <div className="relative w-full max-w-[320px] mx-auto border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {words.map((_, rIdx) =>
              words.map((_, cIdx) => {
                const val = matrix[rIdx][cIdx];
                let fill = COLORS.grid;
                if (val > 0.5) fill = COLORS.pink;
                else if (val > 0.12) fill = COLORS.yellow;
                
                const isSelected = hoveredToken === rIdx;
                return (
                  <g key={`cell-${rIdx}-${cIdx}`}>
                    <rect
                      x={45 + cIdx * 22}
                      y={40 + rIdx * 22}
                      width="20"
                      height="20"
                      fill={fill}
                      fillOpacity={isSelected ? 1.0 : (hoveredToken === null ? 0.8 : 0.25)}
                      stroke="var(--color-outline-dark)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={45 + cIdx * 22 + 10}
                      y={40 + rIdx * 22 + 13}
                      fill={val > 0.5 ? "var(--color-surface-bright)" : "var(--color-on-surface)"}
                      fontSize="7"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                      fillOpacity={isSelected ? 1.0 : (hoveredToken === null ? 0.7 : 0.2)}
                    >
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })
            )}

            {/* Row labels (Query words) */}
            {words.map((word, rIdx) => {
              const isSelected = hoveredToken === rIdx;
              return (
                <text
                  key={`row-${rIdx}`}
                  x="40"
                  y={40 + rIdx * 22 + 13}
                  fill={isSelected ? COLORS.pink : "var(--color-on-surface-variant)"}
                  fillOpacity={hoveredToken !== null && !isSelected ? 0.3 : 1.0}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="end"
                  className="cursor-pointer select-none"
                  onMouseEnter={() => setHoveredToken(rIdx)}
                  onClick={() => setHoveredToken(rIdx)}
                >
                  {word}
                </text>
              );
            })}

            {/* Column labels (Key words) */}
            {words.map((word, cIdx) => (
              <text
                key={`col-${cIdx}`}
                x={45 + cIdx * 22 + 10}
                y={32}
                fill="var(--color-on-surface)"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {word}
              </text>
            ))}

            {/* Query-Key Routing visual (Right column) */}
            <text x="238" y="16" fill={COLORS.muted} fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">QUERY ➔ KEY ROUTING</text>

            {/* Words and connections */}
            {words.map((qWord, rIdx) => {
              const isSelectedQuery = hoveredToken === rIdx;
              return (
                <g key={`routing-row-${rIdx}`}>
                  {/* Query Word */}
                  <text
                    x="195"
                    y={42 + rIdx * 34 + 10}
                    fill={isSelectedQuery ? COLORS.cyan : "var(--color-on-surface-variant)"}
                    fillOpacity={hoveredToken !== null && !isSelectedQuery ? 0.3 : 1.0}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                    className="cursor-pointer select-none"
                    onMouseEnter={() => setHoveredToken(rIdx)}
                    onClick={() => setHoveredToken(rIdx)}
                  >
                    {qWord}
                  </text>

                  {/* Key Word */}
                  <text
                    x="280"
                    y={42 + rIdx * 34 + 10}
                    fill="var(--color-on-surface)"
                    fillOpacity={hoveredToken !== null && hoveredToken !== rIdx ? 0.5 : 1.0}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="start"
                  >
                    {qWord}
                  </text>

                  {/* Connections from active query node to all key nodes */}
                  {words.map((_, cIdx) => {
                    const weight = matrix[rIdx][cIdx];
                    const isLinkActive = hoveredToken === rIdx;
                    
                    let strokeColor = COLORS.grid;
                    if (isLinkActive) {
                      strokeColor = weight > 0.4 ? COLORS.pink : COLORS.yellow;
                    }

                    const opacity = isLinkActive 
                      ? 0.15 + weight * 0.85 
                      : (hoveredToken === null ? 0.05 + weight * 0.2 : 0.02);

                    return (
                      <path
                        key={`link-${rIdx}-${cIdx}`}
                        d={`M 200,${42 + rIdx * 34 + 6} C 235,${42 + rIdx * 34 + 6} 235,${42 + cIdx * 34 + 6} 275,${42 + cIdx * 34 + 6}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isLinkActive ? 1.0 + weight * 4.0 : 0.5 + weight * 1.5}
                        strokeOpacity={opacity}
                        pointerEvents="none"
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Explain Box */}
        <div className="flex flex-1 flex-col justify-between rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface gap-3">
          <div className="flex flex-col gap-2">
            <div className="text-secondary font-semibold tracking-wide mb-1">Attention Analysis:</div>
            <div className="text-on-surface leading-relaxed text-xs">
              {getInsightText()}
            </div>
          </div>
          <div className="mt-2 text-on-surface-variant text-[10px] flex justify-between border-t-2 border-outline-variant pt-2">
            <span>Hover/Click words to inspect different tokens</span>
            {hoveredToken !== null && (
              <button 
                onClick={() => setHoveredToken(null)}
                className="text-error hover:underline font-bold"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 18. LARGE LANGUAGE MODELS (LLMs)
// ─────────────────────────────────────────────────────────────
function LlmsVisualization() {
  const [temperature, setTemperature] = useState(0.7);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([
    "The",
    "cat",
    "sat",
    "on",
    "the"
  ]);

  // Transition grammar rules for autoregressive token predictions
  const getCandidates = (lastToken: string) => {
    const clean = lastToken.toLowerCase().replace(/[^a-z.]/g, "");
    switch (clean) {
      case "the":
        return [
          { token: "mat", logit: 4.5 },
          { token: "couch", logit: 3.2 },
          { token: "floor", logit: 2.5 },
          { token: "bed", logit: 2.0 },
          { token: "rug", logit: 1.5 }
        ];
      case "mat":
      case "rug":
      case "floor":
      case "bed":
        return [
          { token: "and", logit: 4.2 },
          { token: "to", logit: 2.5 },
          { token: "sleep", logit: 2.0 },
          { token: "purr", logit: 1.8 },
          { token: "stretch", logit: 1.2 }
        ];
      case "couch":
        return [
          { token: "comfortably", logit: 3.8 },
          { token: "quietly", logit: 3.0 },
          { token: "and", logit: 2.8 },
          { token: "to", logit: 1.5 },
          { token: "while", logit: 1.0 }
        ];
      case "comfortably":
      case "quietly":
      case "sleep":
      case "purr":
      case "stretch":
        return [
          { token: ".", logit: 4.5 },
          { token: "happily", logit: 3.2 },
          { token: "warmly", logit: 2.8 },
          { token: "peacefully", logit: 2.5 },
          { token: "softly", logit: 1.8 }
        ];
      case "and":
        return [
          { token: "purred", logit: 4.0 },
          { token: "slept", logit: 3.5 },
          { token: "yawned", logit: 3.0 },
          { token: "dreamt", logit: 2.5 },
          { token: "relaxed", logit: 1.8 }
        ];
      case "purred":
      case "slept":
      case "yawned":
      case "dreamt":
      case "relaxed":
      case "happily":
      case "warmly":
      case "peacefully":
      case "softly":
        return [
          { token: ".", logit: 5.0 },
          { token: "and", logit: 2.0 },
          { token: "then", logit: 1.8 },
          { token: "soon", logit: 1.5 },
          { token: "there", logit: 0.8 }
        ];
      case ".":
        return [
          { token: "Soon", logit: 3.8 },
          { token: "Then", logit: 3.2 },
          { token: "It", logit: 3.0 },
          { token: "A", logit: 2.5 },
          { token: "The", logit: 2.0 }
        ];
      case "soon":
      case "then":
      case "it":
      case "a":
        return [
          { token: "mouse", logit: 3.8 },
          { token: "dog", logit: 3.2 },
          { token: "bird", logit: 2.5 },
          { token: "cat", logit: 4.5 },
          { token: "shadow", logit: 1.2 }
        ];
      case "mouse":
      case "dog":
      case "bird":
      case "cat":
      case "shadow":
        return [
          { token: "ran", logit: 4.0 },
          { token: "slept", logit: 3.0 },
          { token: "sat", logit: 4.5 },
          { token: "watched", logit: 2.8 },
          { token: "played", logit: 1.5 }
        ];
      case "ran":
      case "watched":
      case "played":
      case "sat":
        return [
          { token: "on", logit: 4.8 },
          { token: "by", logit: 3.0 },
          { token: "near", logit: 2.5 },
          { token: "under", logit: 2.0 },
          { token: "happily", logit: 1.2 }
        ];
      case "on":
      case "by":
      case "near":
      case "under":
        return [
          { token: "the", logit: 5.0 },
          { token: "a", logit: 3.0 },
          { token: "some", logit: 2.0 },
          { token: "our", logit: 1.5 },
          { token: "her", logit: 1.0 }
        ];
      default:
        return [
          { token: "cat", logit: 3.0 },
          { token: "sat", logit: 2.5 },
          { token: "mat", logit: 2.0 },
          { token: "the", logit: 1.5 },
          { token: ".", logit: 1.0 }
        ];
    }
  };

  const lastToken = generatedTokens[generatedTokens.length - 1];
  const candidates = getCandidates(lastToken);

  // Softmax with Temperature
  const tempScaled = candidates.map(c => ({
    ...c,
    scaledLogit: c.logit / Math.max(0.05, temperature)
  }));
  const maxScaled = Math.max(...tempScaled.map(c => c.scaledLogit));
  const expScores = tempScaled.map(c => ({
    ...c,
    exp: Math.exp(c.scaledLogit - maxScaled)
  }));
  const sumExp = expScores.reduce((sum, c) => sum + c.exp, 0);
  const distribution = expScores.map(c => ({
    token: c.token,
    logit: c.logit,
    prob: sumExp > 0 ? c.exp / sumExp : 0
  }));

  const handleGenerate = useCallback(() => {
    if (generatedTokens.length >= 14) {
      setGeneratedTokens(["The", "cat", "sat", "on", "the"]);
      return;
    }

    // Sample from probability distribution
    const r = Math.random();
    let cumulative = 0;
    let selectedToken = distribution[0].token;

    for (let i = 0; i < distribution.length; i++) {
      cumulative += distribution[i].prob;
      if (r <= cumulative) {
        selectedToken = distribution[i].token;
        break;
      }
    }

    // Adjust spacing for period
    if (selectedToken === ".") {
      setGeneratedTokens(prev => [...prev.slice(0, -1), prev[prev.length - 1] + "."]);
    } else {
      setGeneratedTokens(prev => [...prev, selectedToken]);
    }
  }, [distribution, generatedTokens.length]);

  const handleReset = () => {
    setGeneratedTokens(["The", "cat", "sat", "on", "the"]);
  };

  return (
    <VisualizationShell
      title="Autoregressive token probability routing"
      subtitle="Large Language Models generate text word-by-word (autoregressively) by predicting a probability distribution over the next token and sampling from it."
      insight="Adjust the temperature slider. Lower temperature polarizes probabilities (greedy); higher temperature spreads them (creative)."
      legend={[
        { label: "High Prob Candidate", color: COLORS.pink },
        { label: "Alternative Candidate", color: COLORS.yellow },
        { label: "Low Probability", color: COLORS.muted },
      ]}
    >
      <div className="flex h-full flex-col gap-4 lg:flex-row">
        {/* SVG Container */}
        <div className="relative w-full max-w-[320px] mx-auto border border-outline bg-surface-container-lowest p-4 flex items-center justify-center rounded">
          <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
            {/* Context Prompt box */}
            <rect x="20" y="24" width="280" height="42" fill={COLORS.bg} stroke={COLORS.cyan} strokeWidth="2.5" />
            <text x="32" y="40" fill={COLORS.muted} fontSize="8" fontFamily="monospace" fontWeight="bold">CURRENT CONTEXT WINDOW:</text>
            <text 
              x="32" 
              y="56" 
              fill={COLORS.cyan} 
              fontSize="10" 
              fontFamily="monospace" 
              fontWeight="bold"
              className="truncate"
            >
              &quot;{generatedTokens.join(" ")}&quot;
            </text>

            {/* Connection arrow down */}
            <line x1="160" y1="66" x2="160" y2="88" stroke={COLORS.border} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#llm_arrow)" />

            {/* Probability Bars */}
            {distribution.map((item, i) => {
              const barWidth = item.prob * 140;
              const isHighest = i === 0;
              const isSecond = i === 1;
              const color = isHighest ? COLORS.pink : (isSecond ? COLORS.yellow : COLORS.muted);
              
              return (
                <g key={i}>
                  <text 
                    x="20" 
                    y={108 + i * 22} 
                    fill="var(--color-on-surface)" 
                    fontSize="9" 
                    fontFamily="monospace" 
                    fontWeight="bold"
                    textAnchor="start"
                  >
                    {item.token.toUpperCase()}
                  </text>
                  <rect
                    x="90"
                    y={98 + i * 22}
                    width={Math.max(1, barWidth)}
                    height="12"
                    fill={color}
                    stroke="var(--color-outline-dark)"
                    strokeWidth="1"
                  />
                  <text 
                    x={96 + Math.max(1, barWidth)} 
                    y={108 + i * 22} 
                    fill={color} 
                    fontSize="8" 
                    fontFamily="monospace" 
                    fontWeight="bold"
                  >
                    {(item.prob * 100).toFixed(1)}%
                  </text>
                </g>
              );
            })}

            <defs>
              <marker id="llm_arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                <polygon points="0,0 10,5 0,10" fill="var(--color-outline-dark)" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Controls and Stats Panel */}
        <div className="flex flex-1 flex-col justify-between rounded bg-surface p-4 border border-outline font-mono text-xs text-on-surface gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between font-bold text-on-surface">
              <span>TEMPERATURE (T):</span>
              <span className={temperature < 0.5 ? "text-primary" : (temperature > 1.2 ? "text-pink" : "text-yellow")}>
                {temperature.toFixed(2)} {temperature < 0.4 ? "(Greedy)" : (temperature > 1.2 ? "(Creative)" : "(Balanced)")}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="mt-3 border-t-2 border-outline-variant pt-3 flex flex-col gap-2">
            <div className="text-on-surface-variant">
              Generated length: <span className="text-on-surface font-bold">{generatedTokens.length}/14 words</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                className="flex-1 border border-outline rounded bg-secondary text-outline-dark px-3 py-1.5 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all cursor-pointer"
              >
                {generatedTokens.length >= 14 ? "Reset Prompt" : "Generate Next Word"}
              </button>
              <button
                onClick={handleReset}
                className="border border-outline rounded bg-surface-container-high text-on-surface px-3 py-1.5 font-mono text-xs font-semibold uppercase  hover: active:translate-y-0  transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT EXPORT
// ─────────────────────────────────────────────────────────────
export default function AlgorithmVisualization({ algorithmId }: Props) {
  switch (algorithmId) {
    // ── Foundations ─────────────────────────
    case "calculus":
      return <CalculusVisualization />;
    case "linear-algebra":
      return <LinearAlgebraVisualization />;
    case "probability-theory":
      return <ProbabilityTheoryVisualization />;

    // ── Core Models ─────────────────────────
    case "linear-regression":
      return <LinearRegressionVisualization />;
    case "logistic-regression":
      return <LogisticRegressionVisualization />;
    case "maximum-likelihood":
      return <MaximumLikelihoodVisualization />;
    case "bayesian-inference":
      return <BayesianVisualization />;
    case "knn":
      return <KnnVisualization />;
    case "instance-based-trees":
      return <DecisionTreeVisualization />;
    case "support-vector-machines":
      return <SvmVisualization />;
    case "mcmc":
      return <McmcVisualization />;

    // ── Unsupervised & Ensembles ────────────
    case "clustering":
      return <KMeansVisualization />;
    case "dimensionality-reduction":
      return <PcaVisualization />;
    case "ensemble-learning":
      return <RandomForestVisualization />;

    // ── Deep Learning ───────────────────────
    case "neural-networks":
      return <NeuralNetworkVisualization />;
    case "cnn":
      return <CnnVisualization />;
    case "computer-vision":
      return <ComputerVisionVisualization />;
    case "nlp":
      return <NlpVisualization />;
    case "autoencoders":
      return <AutoencodersVisualization />;
    case "transformers":
      return <TransformersVisualization />;
    case "llms":
      return <LlmsVisualization />;

    // ── Fallback ────────────────────────────
    default:
      return <DefaultVisualization />;
  }
}
