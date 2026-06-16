"use client";

import React, { useState, useEffect, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";

const W = 640;
const H = 420;

export default function ModelSelectionViz() {
  const [numFolds, setNumFolds] = useState<number>(5);
  const [activeFold, setActiveFold] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 20 data points representing items in the dataset
  const numDataPoints = 20;

  // Simulate scores for each fold (with slight variability)
  const foldScores = useMemo(() => {
    const scores: Record<number, { train: number[]; val: number[] }> = {
      3: {
        train: [0.88, 0.89, 0.86],
        val: [0.76, 0.81, 0.73]
      },
      5: {
        train: [0.89, 0.88, 0.90, 0.87, 0.89],
        val: [0.78, 0.82, 0.75, 0.84, 0.80]
      },
      10: {
        train: [0.89, 0.89, 0.88, 0.90, 0.89, 0.88, 0.90, 0.89, 0.87, 0.89],
        val: [0.78, 0.81, 0.74, 0.86, 0.80, 0.77, 0.83, 0.79, 0.72, 0.82]
      }
    };
    return scores[numFolds] || scores[5];
  }, [numFolds]);

  // Handle active fold animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveFold(prev => (prev + 1) % numFolds);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, numFolds]);

  // Calculations for average CV metrics
  const trainScores = foldScores.train;
  const valScores = foldScores.val;

  const averageValScore = useMemo(() => {
    return valScores.reduce((s, x) => s + x, 0) / valScores.length;
  }, [valScores]);

  const pad = { left: 50, right: 30, top: 40, bottom: 40 };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label="K-Fold Split Visualizer"
          >
            <title>K-Fold Split Visualizer</title>
            <defs>
              <pattern id="cv-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#cv-grid)" />

            {/* Split partitioning diagram */}
            <g transform="translate(0, 10)">
              <text x={pad.left} y={24} fill={COLORS.muted} fontSize={12} fontWeight={700}>
                DATA SPLITS ACROSS FOLDS
              </text>

              {Array.from({ length: numFolds }).map((_, fIdx) => {
                const rowY = 50 + fIdx * (180 / numFolds);
                const isActive = activeFold === fIdx;

                return (
                  <g key={`fold-row-${fIdx}`}>
                    {/* Fold Label */}
                    <text x={pad.left} y={rowY + 12} fontSize={9} fill={isActive ? COLORS.pink : COLORS.muted} fontWeight={isActive ? 800 : 600}>
                      Fold {fIdx + 1} {isActive ? "◀" : ""}
                    </text>

                    {/* Boxes row */}
                    {Array.from({ length: numDataPoints }).map((_, dIdx) => {
                      const boxW = (W - pad.left - pad.right - 180) / numDataPoints - 2;
                      const boxX = pad.left + 50 + dIdx * (boxW + 2);

                      // Determine if this data index is in validation fold
                      const valFoldSize = Math.floor(numDataPoints / numFolds);
                      const isVal = dIdx >= fIdx * valFoldSize && dIdx < (fIdx + 1) * valFoldSize;

                      return (
                        <rect
                          key={`box-${fIdx}-${dIdx}`}
                          x={boxX}
                          y={rowY}
                          width={boxW}
                          height={16}
                          fill={isVal ? COLORS.pink : COLORS.cyan}
                          opacity={isActive ? 1 : 0.45}
                          stroke={isActive ? COLORS.muted : "none"}
                          strokeWidth={1}
                          rx={1.5}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>

            {/* Fold score readouts */}
            <g transform="translate(0, 260)">
              <text x={pad.left} y={24} fill={COLORS.muted} fontSize={12} fontWeight={700}>
                FOLD ACCURACY COMPARISON (ACTIVE FOLD: {activeFold + 1})
              </text>

              {/* Training accuracy gauge */}
              <rect x={pad.left} y={45} width={(W - pad.left - pad.right - 100) * trainScores[activeFold]} height={20} fill={COLORS.cyan} rx={2} />
              <text x={pad.left + 8} y={58} fill="#fff" fontSize={10} fontWeight={800}>
                TRAIN SCORE: {(trainScores[activeFold] * 100).toFixed(1)}%
              </text>

              {/* Validation accuracy gauge */}
              <rect x={pad.left} y={75} width={(W - pad.left - pad.right - 100) * valScores[activeFold]} height={20} fill={COLORS.pink} rx={2} />
              <text x={pad.left + 8} y={88} fill="#fff" fontSize={10} fontWeight={800}>
                VALIDATION SCORE: {(valScores[activeFold] * 100).toFixed(1)}%
              </text>
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Folds Selection</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="folds-select">
              Number of Folds (K)
            </label>
            <select
              id="folds-select"
              value={numFolds}
              onChange={e => {
                const val = Number(e.target.value);
                setNumFolds(val);
                setActiveFold(0);
              }}
              disabled={isPlaying}
              className="w-full border border-outline bg-surface p-2 text-xs sm:text-sm rounded"
              aria-label="Select number of folds K"
            >
              <option value={3}>K = 3 Folds</option>
              <option value={5}>K = 5 Folds</option>
              <option value={10}>K = 10 Folds</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[12px]" htmlFor="active-fold-select">
              Select Active Fold Step
            </label>
            <select
              id="active-fold-select"
              value={activeFold}
              onChange={e => setActiveFold(Number(e.target.value))}
              disabled={isPlaying}
              className="w-full border border-outline bg-surface p-2 text-xs sm:text-sm rounded"
              aria-label="Select active fold split iteration"
            >
              {Array.from({ length: numFolds }).map((_, idx) => (
                <option key={`opt-fold-${idx}`} value={idx}>Fold split {idx + 1}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-full flex h-9 items-center justify-center border border-outline font-bold tracking-wider cursor-pointer active:scale-[0.98] transition-all text-[12px] ${
                isPlaying
                  ? "bg-warning/20 border-warning hover:bg-warning/30 text-warning"
                  : "bg-cyan text-white hover:bg-cyan/90"
              }`}
              aria-label={isPlaying ? "Pause fold splitting animation loop" : "Animate cross-validation loop"}
            >
              {isPlaying ? "PAUSE CV LOOP" : "ANIMATE CV LOOP"}
            </button>
          </div>
        </div>

        {/* Validation Score outputs */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[12px]">GENERALIZATION ESTIMATE</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Avg CV score:</div>
            <div className="font-bold text-right text-cyan">{(averageValScore * 100).toFixed(2)}%</div>
            <div>Score deviation:</div>
            <div className="font-bold text-right text-yellow">
              ±{(Math.sqrt(valScores.reduce((s, x) => s + Math.pow(x - averageValScore, 2), 0) / (valScores.length - 1)) * 100).toFixed(2)}%
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-snug text-on-surface-variant font-sans">
            *Training scores are consistently higher than validation scores due to model fitting capacity. Average validation score is the true generalization proxy.
          </p>
        </div>
      </div>
    </div>
  );
}
