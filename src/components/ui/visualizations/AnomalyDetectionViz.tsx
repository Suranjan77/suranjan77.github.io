"use client";

import React, { useState, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

const W = 640;
const H = 420;

const plot = { left: 50, top: 40, width: 380, height: 320, bottom: 360 };

interface DataPoint {
  id: number;
  x: number; // math coord [-3, 3]
  y: number; // math coord [-3, 3]
}

export default function AnomalyDetectionViz() {
  const [method, setMethod] = useState<"zscore" | "knn">("zscore");
  const [contamination, setContamination] = useState<number>(0.15); // expected ratio of outliers

  // 2D Dataset: 15 dense inliers, 4 extreme outliers
  const dataset: DataPoint[] = useMemo(() => [
    // Core Inliers
    { id: 1, x: -0.2, y: 0.1 },
    { id: 2, x: 0.3, y: -0.2 },
    { id: 3, x: 0.1, y: 0.4 },
    { id: 4, x: -0.4, y: -0.3 },
    { id: 5, x: 0.5, y: 0.2 },
    { id: 6, x: -0.1, y: -0.1 },
    { id: 7, x: 0.2, y: 0.3 },
    { id: 8, x: -0.3, y: 0.2 },
    { id: 9, x: 0.4, y: -0.4 },
    { id: 10, x: -0.2, y: -0.4 },
    { id: 11, x: 0.0, y: 0.0 },
    { id: 12, x: 0.1, y: -0.1 },
    { id: 13, x: -0.1, y: 0.2 },
    { id: 14, x: 0.3, y: 0.0 },
    { id: 15, x: -0.2, y: 0.3 },
    // Outliers
    { id: 16, x: -2.2, y: 2.1 }, // Top Left Outlier
    { id: 17, x: 2.4, y: -2.3 }, // Bottom Right Outlier
    { id: 18, x: 2.1, y: 2.2 },  // Top Right Outlier
    { id: 19, x: -0.1, y: -2.4 }  // Bottom Center Outlier
  ], []);

  // Compute anomaly scores for each point
  const scoredPoints = useMemo(() => {
    const n = dataset.length;

    if (method === "zscore") {
      // 1. Z-score (Distance from mean center of mass)
      const meanX = dataset.reduce((s, p) => s + p.x, 0) / n;
      const meanY = dataset.reduce((s, p) => s + p.y, 0) / n;
      
      const varianceX = dataset.reduce((s, p) => s + Math.pow(p.x - meanX, 2), 0) / (n - 1);
      const varianceY = dataset.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0) / (n - 1);
      
      const stdX = Math.sqrt(varianceX);
      const stdY = Math.sqrt(varianceY);

      return dataset.map(p => {
        const zx = (p.x - meanX) / (stdX || 1);
        const zy = (p.y - meanY) / (stdY || 1);
        const score = Math.sqrt(zx * zx + zy * zy); // Euclidean Z-score distance
        return { ...p, score };
      }).sort((a, b) => b.score - a.score);
    } else {
      // 2. K-NN Distance (k=3)
      const k = 3;
      const dist = (p1: DataPoint, p2: DataPoint) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

      return dataset.map(p1 => {
        const distances = dataset
          .filter(p2 => p2.id !== p1.id)
          .map(p2 => dist(p1, p2))
          .sort((a, b) => a - b);
        
        const score = distances[k - 1] || 0; // K-th neighbor distance
        return { ...p1, score };
      }).sort((a, b) => b.score - a.score);
    }
  }, [dataset, method]);

  // Determine anomaly cutoff index based on contamination threshold
  const anomaliesInfo = useMemo(() => {
    const numAnomalies = Math.max(1, Math.round(dataset.length * contamination));
    const sorted = [...scoredPoints];
    
    const anomalyIds = new Set(sorted.slice(0, numAnomalies).map(p => p.id));
    const thresholdScore = sorted[numAnomalies - 1]?.score ?? 0;

    return {
      anomalyIds,
      thresholdScore
    };
  }, [scoredPoints, contamination]);

  // Map math coordinate bounds [-3, 3] to pixels
  const scaleX = (val: number) => plot.left + ((val + 3.0) / 6.0) * plot.width;
  const scaleY = (val: number) => plot.bottom - ((val + 3.0) / 6.0) * plot.height;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label="2D Anomaly Detection Scatter Plot"
          >
            <title>2D Anomaly Detection Scatter Plot</title>
            <defs>
              <pattern id="ad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#ad-grid)" />

            {/* Subplot frame */}
            <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} fill="none" stroke={COLORS.border} strokeWidth={1.5} />

            {/* Shaded center region of inliers (for Z-score: ellipse, for KNN: boundary visual support) */}
            {method === "zscore" && (
              <ellipse
                cx={scaleX(0.04)} // approx center of core mass
                cy={scaleY(0.01)}
                rx={plot.width * 0.22}
                ry={plot.height * 0.22}
                fill={COLORS.cyan}
                opacity={0.08}
                stroke={COLORS.cyan}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            )}

            {/* Render data points */}
            {scoredPoints.map(p => {
              const isAnomaly = anomaliesInfo.anomalyIds.has(p.id);
              const cx = scaleX(p.x);
              const cy = scaleY(p.y);

              return (
                <g key={`pt-2d-${p.id}`}>
                  {isAnomaly && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={10}
                      fill="none"
                      stroke={COLORS.pink}
                      strokeWidth={1.5}
                      opacity={0.6}
                      className="animate-ping"
                      style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: "1.8s" }}
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={isAnomaly ? COLORS.pink : COLORS.cyan}
                    stroke={COLORS.border}
                    strokeWidth={1}
                    opacity={0.9}
                  />
                  {/* Score text below outlier points */}
                  {isAnomaly && (
                    <text x={cx} y={cy - 12} textAnchor="middle" fontSize={8} fill={COLORS.pink} fontWeight={800}>
                      {p.score.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Metric status text inside the plot */}
            <text x={plot.left + 15} y={plot.top + 25} fill={COLORS.muted} fontSize={10} fontWeight={700}>
              ALGORITHM: {method === "zscore" ? "Z-SCORE DISTANCE" : "3-NN DISTANCE"}
            </text>
            <text x={plot.left + 15} y={plot.top + 40} fill={COLORS.pink} fontSize={9} fontWeight={800}>
              ANOMALY THRESHOLD SCORE: &gt; {anomaliesInfo.thresholdScore.toFixed(3)}
            </text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Controls</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[11px]" htmlFor="method-select">
              Detection Method
            </label>
            <select
              id="method-select"
              value={method}
              onChange={e => setMethod(e.target.value as "zscore" | "knn")}
              className="w-full border border-outline bg-surface p-2 text-xs sm:text-sm rounded"
              aria-label="Select anomaly detection algorithm"
            >
              <option value="zscore">Statistical Z-Score (Center distance)</option>
              <option value="knn">K-Nearest Neighbor (k=3 distance)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[11px]" htmlFor="contamination-slider">
              Contamination Ratio ({(contamination * 100).toFixed(0)}%)
            </label>
            <input
              id="contamination-slider"
              type="range"
              min={0.05}
              max={0.3}
              step={0.05}
              value={contamination}
              onChange={e => setContamination(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Contamination ratio range slider from 5% to 30%"
            />
          </div>
        </div>

        {/* Diagnostic Outputs */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[11px]">Detection summary</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Total data:</div>
            <div className="font-bold text-right text-cyan">{dataset.length} points</div>
            <div>Flagged anomalies:</div>
            <div className="font-bold text-right text-pink">
              {anomaliesInfo.anomalyIds.size} ({((anomaliesInfo.anomalyIds.size / dataset.length) * 100).toFixed(0)}%)
            </div>
            <div>Inliers:</div>
            <div className="font-bold text-right text-cyan">
              {dataset.length - anomaliesInfo.anomalyIds.size}
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-snug text-on-surface-variant font-sans">
            *Z-score calculates global deviation from the centroid. K-NN distance detects outliers based on local sparsity (lack of near neighbors).
          </p>
        </div>
      </div>
    </div>
  );
}
