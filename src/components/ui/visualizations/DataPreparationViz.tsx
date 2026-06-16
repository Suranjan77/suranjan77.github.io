"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Subplot boundaries
const leftPlot = { left: 45, top: 40, width: 230, height: 230, bottom: 270 };
const rightPlot = { left: 345, top: 40, width: 230, height: 230, bottom: 270 };

interface DataPoint {
  id: number;
  label: string;
  x: number; // Raw X (e.g. range 100 to 1500)
  y: number; // Raw Y (e.g. range 2 to 20)
  isMissingX?: boolean;
  isTest?: boolean;
}

export default function DataPreparationViz() {
  const [scalingMethod, setScalingMethod] = useState<"none" | "standard" | "minmax" | "robust">("none");
  const [missingValues, setMissingValues] = useState<boolean>(false);
  const [dataLeakage, setDataLeakage] = useState<boolean>(false);

  // Raw dataset: 12 train points, 4 test points
  const rawPoints: DataPoint[] = useMemo(() => [
    // Train points
    { id: 1, label: "A", x: 200, y: 3 },
    { id: 2, label: "B", x: 400, y: 5 },
    { id: 3, label: "C", x: 600, y: 9, isMissingX: true }, // missing
    { id: 4, label: "D", x: 800, y: 12 },
    { id: 5, label: "E", x: 1000, y: 15 },
    { id: 6, label: "F", x: 1200, y: 18 },
    { id: 7, label: "G", x: 300, y: 14 },
    { id: 8, label: "H", x: 500, y: 11 },
    { id: 9, label: "I", x: 1400, y: 6 }, // outlier-ish in X
    { id: 10, label: "J", x: 750, y: 4 },
    { id: 11, label: "K", x: 950, y: 8 },
    { id: 12, label: "L", x: 1100, y: 13 },
    // Test points
    { id: 13, label: "T1", x: 350, y: 7, isTest: true },
    { id: 14, label: "T2", x: 700, y: 16, isTest: true },
    { id: 15, label: "T3", x: 1050, y: 10, isTest: true },
    { id: 16, label: "T4", x: 1450, y: 19, isTest: true } // test set outlier
  ], []);

  // Preprocessed data calculation
  const processedPoints = useMemo(() => {
    // 1. Missing values imputation (mean imputation)
    // Find mean of available X values in training set
    const validTrainX = rawPoints.filter(p => !p.isTest && (!missingValues || !p.isMissingX)).map(p => p.x);
    const meanTrainX = validTrainX.reduce((s, val) => s + val, 0) / validTrainX.length;

    const pointsWithImputation = rawPoints.map(p => {
      let currentX = p.x;
      let imputed = false;
      if (missingValues && p.isMissingX) {
        currentX = meanTrainX;
        imputed = true;
      }
      return { ...p, x: currentX, imputed };
    });

    // 2. Compute statistics for scaling
    // Split train vs all depending on whether data leakage is enabled
    const scalingFitPoints = pointsWithImputation.filter(p => dataLeakage ? true : !p.isTest);
    
    // Fit statistics for X
    const fitX = scalingFitPoints.map(p => p.x);
    const minX = Math.min(...fitX);
    const maxX = Math.max(...fitX);
    const meanX = fitX.reduce((s, v) => s + v, 0) / fitX.length;
    const stdX = Math.sqrt(fitX.reduce((s, v) => s + Math.pow(v - meanX, 2), 0) / (fitX.length - 1));
    const sortedX = [...fitX].sort((a, b) => a - b);
    const medianX = sortedX[Math.floor(sortedX.length / 2)];
    const q1X = sortedX[Math.floor(sortedX.length * 0.25)];
    const q3X = sortedX[Math.floor(sortedX.length * 0.75)];
    const iqrX = q3X - q1X || 1;

    // Fit statistics for Y
    const fitY = scalingFitPoints.map(p => p.y);
    const minY = Math.min(...fitY);
    const maxY = Math.max(...fitY);
    const meanY = fitY.reduce((s, v) => s + v, 0) / fitY.length;
    const stdY = Math.sqrt(fitY.reduce((s, v) => s + Math.pow(v - meanY, 2), 0) / (fitY.length - 1));
    const sortedY = [...fitY].sort((a, b) => a - b);
    const medianY = sortedY[Math.floor(sortedY.length / 2)];
    const q1Y = sortedY[Math.floor(sortedY.length * 0.25)];
    const q3Y = sortedY[Math.floor(sortedY.length * 0.75)];
    const iqrY = q3Y - q1Y || 1;

    // Apply scaling
    return pointsWithImputation.map(p => {
      let sx = p.x;
      let sy = p.y;

      if (scalingMethod === "standard") {
        sx = (p.x - meanX) / (stdX || 1);
        sy = (p.y - meanY) / (stdY || 1);
      } else if (scalingMethod === "minmax") {
        sx = (p.x - minX) / ((maxX - minX) || 1);
        sy = (p.y - minY) / ((maxY - minY) || 1);
      } else if (scalingMethod === "robust") {
        sx = (p.x - medianX) / iqrX;
        sy = (p.y - medianY) / iqrY;
      }

      return {
        ...p,
        scaledX: sx,
        scaledY: sy
      };
    });
  }, [rawPoints, scalingMethod, missingValues, dataLeakage]);

  // Limits mapping for raw and scaled
  const rawLimits = { minX: 100, maxX: 1600, minY: 1, maxY: 21 };
  
  const scaledLimits = useMemo(() => {
    if (scalingMethod === "minmax") {
      return { minX: -0.1, maxX: 1.1, minY: -0.1, maxY: 1.1 };
    } else if (scalingMethod === "standard") {
      return { minX: -2.5, maxX: 2.5, minY: -2.5, maxY: 2.5 };
    } else if (scalingMethod === "robust") {
      return { minX: -2.0, maxX: 2.0, minY: -2.0, maxY: 2.0 };
    }
    // Default same as raw
    return rawLimits;
  }, [scalingMethod]);

  // Helpers to scale points to SVG canvas coordinates
  const getLeftCoords = (x: number, y: number) => {
    const px = leftPlot.left + ((x - rawLimits.minX) / (rawLimits.maxX - rawLimits.minX)) * leftPlot.width;
    const py = leftPlot.bottom - ((y - rawLimits.minY) / (rawLimits.maxY - rawLimits.minY)) * leftPlot.height;
    return { px, py };
  };

  const getRightCoords = (x: number, y: number) => {
    const px = rightPlot.left + ((x - scaledLimits.minX) / (scaledLimits.maxX - scaledLimits.minX)) * rightPlot.width;
    const py = rightPlot.bottom - ((y - scaledLimits.minY) / (scaledLimits.maxY - scaledLimits.minY)) * rightPlot.height;
    return { px, py };
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label="Data Prep and Feature Scaling View"
          >
            <title>Data Prep and Feature Scaling View</title>
            <defs>
              <pattern id="dp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#dp-grid)" />

            {/* Left Plot: Raw Coordinates */}
            <g>
              <text x={leftPlot.left} y={leftPlot.top - 16} fill={COLORS.muted} fontSize={11} fontWeight={700}>
                RAW FEATURES
              </text>
              <rect x={leftPlot.left} y={leftPlot.top} width={leftPlot.width} height={leftPlot.height} fill="none" stroke={COLORS.border} strokeWidth={1.5} />
              
              {/* Axes Labels */}
              <text x={leftPlot.left + leftPlot.width / 2} y={leftPlot.bottom + 22} textAnchor="middle" fontSize={9} fill={COLORS.muted} fontWeight={700}>
                X: Size (100 to 1600 sqft)
              </text>
              <text
                x={leftPlot.left - 24}
                y={leftPlot.top + leftPlot.height / 2}
                textAnchor="middle"
                transform={`rotate(-90, ${leftPlot.left - 24}, ${leftPlot.top + leftPlot.height / 2})`}
                fontSize={9}
                fill={COLORS.muted}
                fontWeight={700}
              >
                Y: Rooms (1 to 21)
              </text>

              {processedPoints.map(p => {
                // If missingX is true and missingValues toggle is off, we hide this point in raw plot
                if (p.isMissingX && !missingValues) return null;
                const { px, py } = getLeftCoords(p.imputed ? p.x : rawPoints.find(rp => rp.id === p.id)!.x, p.y);

                return (
                  <circle
                    key={`left-${p.id}`}
                    cx={px}
                    cy={py}
                    r={p.isTest ? 5 : 4.5}
                    fill={p.imputed ? COLORS.yellow : (p.isTest ? COLORS.pink : COLORS.cyan)}
                    stroke={COLORS.border}
                    strokeWidth={1}
                    opacity={0.85}
                  />
                );
              })}
            </g>

            {/* Right Plot: Scaled Coordinates */}
            <g>
              <text x={rightPlot.left} y={rightPlot.top - 16} fill={COLORS.muted} fontSize={11} fontWeight={700}>
                PREPROCESSED / SCALED ({scalingMethod.toUpperCase()})
              </text>
              <rect x={rightPlot.left} y={rightPlot.top} width={rightPlot.width} height={rightPlot.height} fill="none" stroke={COLORS.border} strokeWidth={1.5} />
              
              {/* Axes Labels */}
              <text x={rightPlot.left + rightPlot.width / 2} y={rightPlot.bottom + 22} textAnchor="middle" fontSize={9} fill={COLORS.muted} fontWeight={700}>
                Scaled X
              </text>
              <text
                x={rightPlot.left - 24}
                y={rightPlot.top + rightPlot.height / 2}
                textAnchor="middle"
                transform={`rotate(-90, ${rightPlot.left - 24}, ${rightPlot.top + rightPlot.height / 2})`}
                fontSize={9}
                fill={COLORS.muted}
                fontWeight={700}
              >
                Scaled Y
              </text>

              {processedPoints.map(p => {
                if (p.isMissingX && !missingValues) return null;
                
                // Get scaled target coordinates
                const xVal = scalingMethod === "none" ? p.x : p.scaledX;
                const yVal = scalingMethod === "none" ? p.y : p.scaledY;
                const { px, py } = getRightCoords(xVal, yVal);

                return (
                  <circle
                    key={`right-${p.id}`}
                    cx={px}
                    cy={py}
                    r={p.isTest ? 5 : 4.5}
                    fill={p.imputed ? COLORS.yellow : (p.isTest ? COLORS.pink : COLORS.cyan)}
                    stroke={COLORS.border}
                    strokeWidth={1}
                    opacity={0.85}
                  />
                );
              })}
            </g>

            {/* Legend info panel */}
            <g transform="translate(45, 335)">
              <rect width={530} height={50} fill="rgba(250,248,242,0.85)" stroke={COLORS.border} rx={2} />
              <circle cx={20} cy={25} r={5} fill={COLORS.cyan} />
              <text x={32} y={29} fontSize={12} fill={COLORS.muted} fontWeight={600}>Training Set</text>
              
              <circle cx={130} cy={25} r={5} fill={COLORS.pink} />
              <text x={142} y={29} fontSize={12} fill={COLORS.muted} fontWeight={600}>Test Set</text>
              
              <circle cx={230} cy={25} r={5} fill={COLORS.yellow} />
              <text x={242} y={29} fontSize={12} fill={COLORS.muted} fontWeight={600}>Imputed (Missing)</text>

              {dataLeakage && (
                <text x={370} y={29} fontSize={10} fill={COLORS.pink} fontWeight={800}>
                  DATA LEAKAGE ACTIVE
                </text>
              )}
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Preprocessing</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="scaling-select">
              Scaling Transformation
            </label>
            <select
              id="scaling-select"
              value={scalingMethod}
              onChange={e => setScalingMethod(e.target.value as "none" | "standard" | "minmax" | "robust")}
              className="w-full border border-outline bg-surface p-2 text-xs sm:text-sm rounded"
              aria-label="Select feature scaling method"
            >
              <option value="none">No Scaling (Raw)</option>
              <option value="minmax">Min-Max scaling [0, 1]</option>
              <option value="standard">Standardization (Mean=0, Std=1)</option>
              <option value="robust">Robust scaling (Median, IQR)</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-2">
              <input
                id="missing-toggle"
                type="checkbox"
                checked={missingValues}
                onChange={e => setMissingValues(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-cyan"
                aria-label="Toggle missing value imputation simulation"
              />
              <label htmlFor="missing-toggle" className="text-xs uppercase font-bold text-on-surface-variant cursor-pointer select-none">
                Handle Missing Values
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="leakage-toggle"
                type="checkbox"
                checked={dataLeakage}
                onChange={e => setDataLeakage(e.target.checked)}
                disabled={scalingMethod === "none"}
                className="w-4 h-4 cursor-pointer accent-cyan disabled:opacity-50"
                aria-label="Toggle data leakage simulation"
              />
              <label htmlFor="leakage-toggle" className="text-xs uppercase font-bold text-on-surface-variant cursor-pointer select-none disabled:opacity-50">
                Simulate Data Leakage
              </label>
            </div>
          </div>
        </div>

        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">Insights</div>
          <div className="text-xs font-sans text-on-surface-variant leading-relaxed">
            {scalingMethod === "none" && "Features have wildly different ranges (X goes to 1500, Y only to 20). Distance measurements would be dominated by X."}
            {scalingMethod === "minmax" && "Min-Max scales all coordinates strictly into a [0, 1] box. Outliers compress normal variance."}
            {scalingMethod === "standard" && "Standardization rescales so points are centered at 0 with standard deviations as the unit scale."}
            {scalingMethod === "robust" && "Robust Scaling uses median and IQR, meaning outliers (like point I/T4) don't distort normal points' scaling."}
            {dataLeakage && " Notice how test points skew the scaling parameters, shifting training points away from their clean train-only fit!"}
            {!dataLeakage && scalingMethod !== "none" && " Clean scaling: scaler only fits on training data, keeping test set coordinates purely separate."}
          </div>
        </div>
      </div>
    </div>
  );
}
