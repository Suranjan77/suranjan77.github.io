"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  PulseRing,
  VisualizationInstruction,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Actions: 0 = Up, 1 = Right, 2 = Down, 3 = Left
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];
const actionNames = ["UP", "RIGHT", "DOWN", "LEFT"];

export default function RLViz() {
  const [agentPos, setAgentPos] = useState({ r: 4, c: 0 });
  const [goalPos, setGoalPos] = useState({ r: 0, c: 4 });
  const [penaltyPos, setPenaltyPos] = useState({ r: 2, c: 2 });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [cumulativeReward, setCumulativeReward] = useState(0);
  const [episodes, setEpisodes] = useState(0);

  // Q-values table state: Q[row][col][action]
  const [qTable, setQTable] = useState<number[][][]>(() =>
    Array(5)
      .fill(null)
      .map(() =>
        Array(5)
          .fill(null)
          .map(() => Array(4).fill(0))
      )
  );

  const [activeUpdateCell, setActiveUpdateCell] = useState<{ r: number; c: number } | null>(null);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reinforcement Learning parameters
  const alpha = 0.5; // learning rate
  const gamma = 0.9; // discount factor
  const epsilon = 0.2; // exploration rate

  const getReward = (r: number, c: number) => {
    if (r === goalPos.r && c === goalPos.c) return 10;
    if (r === penaltyPos.r && c === penaltyPos.c) return -5;
    return -0.1; // step penalty to find shortest path
  };

  const handleStep = (manualAction?: number) => {
    let act = 0;
    if (manualAction !== undefined) {
      act = manualAction;
    } else {
      // Epsilon-greedy action selection
      if (Math.random() < epsilon) {
        act = Math.floor(Math.random() * 4); // explore
      } else {
        // exploit: find max Q-value index
        const qs = qTable[agentPos.r][agentPos.c];
        let maxQ = -999;
        let bestActions: number[] = [];
        qs.forEach((q, idx) => {
          if (q > maxQ) {
            maxQ = q;
            bestActions = [idx];
          } else if (q === maxQ) {
            bestActions.push(idx);
          }
        });
        act = bestActions[Math.floor(Math.random() * bestActions.length)];
      }
    }

    // Compute next state coordinates
    const nextR = Math.max(0, Math.min(4, agentPos.r + dy[act]));
    const nextC = Math.max(0, Math.min(4, agentPos.c + dx[act]));

    // Q-value update rule
    const reward = getReward(nextR, nextC);
    const maxNextQ = Math.max(...qTable[nextR][nextC]);
    const oldQ = qTable[agentPos.r][agentPos.c][act];
    const newQ = oldQ + alpha * (reward + gamma * maxNextQ - oldQ);

    // Update Q-table state
    setQTable((prev) => {
      const nextTable = prev.map((row) => row.map((actions) => [...actions]));
      nextTable[agentPos.r][agentPos.c][act] = parseFloat(newQ.toFixed(2));
      return nextTable;
    });

    setActiveUpdateCell({ r: agentPos.r, c: agentPos.c });
    setTimeout(() => setActiveUpdateCell(null), 300);

    // Update coordinates and accumulation metrics
    setCumulativeReward((prev) => parseFloat((prev + reward).toFixed(1)));
    setAgentPos({ r: nextR, c: nextC });

    // Check terminal conditions
    if ((nextR === goalPos.r && nextC === goalPos.c) || (nextR === penaltyPos.r && nextC === penaltyPos.c)) {
      // reset agent
      setAgentPos({ r: 4, c: 0 });
      setEpisodes((prev) => prev + 1);
    }
  };

  // Autoplay simulation tick
  useEffect(() => {
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        handleStep();
      }, 300);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, agentPos, qTable, goalPos, penaltyPos]);

  const handleReset = () => {
    setAgentPos({ r: 4, c: 0 });
    setQTable(
      Array(5)
        .fill(null)
        .map(() =>
          Array(5)
            .fill(null)
            .map(() => Array(4).fill(0))
        )
    );
    setCumulativeReward(0);
    setEpisodes(0);
    setIsPlaying(false);
  };

  // Drag goal destination to change Q values policy maps
  const moveGoal = (r: number, c: number) => {
    if (r === penaltyPos.r && c === penaltyPos.c) return;
    setGoalPos({ r, c });
    setAgentPos({ r: 4, c: 0 });
  };

  const gridOffset = { x: 74, y: 70 };
  const cellSize = 54;

  // Derive active policy direction for arrows inside cell
  const getPolicyArrowAngle = (r: number, c: number) => {
    if (r === goalPos.r && c === goalPos.c) return null;
    if (r === penaltyPos.r && c === penaltyPos.c) return null;

    const qs = qTable[r][c];
    if (qs.every((q) => q === 0)) return null;

    let maxQ = -999;
    let bestAct = 0;
    qs.forEach((q, idx) => {
      if (q > maxQ) {
        maxQ = q;
        bestAct = idx;
      }
    });

    // 0=Up (0 deg), 1=Right (90 deg), 2=Down (180 deg), 3=Left (270 deg)
    return bestAct * 90;
  };

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Q-Learning Reinforcement Learning Gridworld">
            <title>R L Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* 5x5 Grid Cells */}
            {Array(5).fill(null).map((_, r) =>
              Array(5).fill(null).map((__, c) => {
                const isGoal = r === goalPos.r && c === goalPos.c;
                const isPenalty = r === penaltyPos.r && c === penaltyPos.c;
                const isAgent = r === agentPos.r && c === agentPos.c;
                const isUpdating = activeUpdateCell?.r === r && activeUpdateCell?.c === c;

                // Color coding cells
                let fillVal = COLORS.bg;
                if (isGoal) fillVal = COLORS.green;
                else if (isPenalty) fillVal = COLORS.pink;

                const opacityVal = isGoal || isPenalty ? 0.35 : 1;
                const arrowAngle = getPolicyArrowAngle(r, c);

                const cx = gridOffset.x + c * cellSize + cellSize / 2;
                const cy = gridOffset.y + r * cellSize + cellSize / 2;

                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={gridOffset.x + c * cellSize}
                      y={gridOffset.y + r * cellSize}
                      width={cellSize - 2}
                      height={cellSize - 2}
                      fill={fillVal}
                      fillOpacity={opacityVal}
                      stroke={isUpdating ? COLORS.yellow : COLORS.grid}
                      strokeWidth={isUpdating ? 3.5 : 1}
                      className="cursor-pointer transition-colors duration-150 hover:stroke-yellow-600"
                      onPointerDown={() => moveGoal(r, c)}
                    />

                    {/* Q-Values summaries text inside cells */}
                    {!isGoal && !isPenalty && (
                      <g className="pointer-events-none select-none" opacity={0.65}>
                        <text x={cx} y={cy - cellSize / 3 + 1} textAnchor="middle" fill={COLORS.muted} fontSize={7} fontWeight={700}>
                          {qTable[r][c][0] > 0 ? `+${qTable[r][c][0]}` : qTable[r][c][0]}
                        </text>
                        <text x={cx + cellSize / 3} y={cy + 3} textAnchor="middle" fill={COLORS.muted} fontSize={7} fontWeight={700}>
                          {qTable[r][c][1] > 0 ? `+${qTable[r][c][1]}` : qTable[r][c][1]}
                        </text>
                        <text x={cx} y={cy + cellSize / 3 + 4} textAnchor="middle" fill={COLORS.muted} fontSize={7} fontWeight={700}>
                          {qTable[r][c][2] > 0 ? `+${qTable[r][c][2]}` : qTable[r][c][2]}
                        </text>
                        <text x={cx - cellSize / 3} y={cy + 3} textAnchor="middle" fill={COLORS.muted} fontSize={7} fontWeight={700}>
                          {qTable[r][c][3] > 0 ? `+${qTable[r][c][3]}` : qTable[r][c][3]}
                        </text>
                      </g>
                    )}

                    {/* Policy arrows */}
                    {arrowAngle !== null && (
                      <g transform={`translate(${cx}, ${cy}) rotate(${arrowAngle})`} className="pointer-events-none select-none opacity-40">
                        <line x1={0} y1={10} x2={0} y2={-10} stroke={COLORS.yellow} strokeWidth={2} />
                        <polygon points="-4,-4 4,-4 0,-10" fill={COLORS.yellow} />
                      </g>
                    )}
                  </g>
                );
              })
            )}

            {/* Agent Dot (Yellow) */}
            <motion.circle
              cx={gridOffset.x + agentPos.c * cellSize + cellSize / 2}
              cy={gridOffset.y + agentPos.r * cellSize + cellSize / 2}
              r={12}
              fill={COLORS.yellow}
              stroke={COLORS.bg}
              strokeWidth={2}
              animate={{
                cx: gridOffset.x + agentPos.c * cellSize + cellSize / 2,
                cy: gridOffset.y + agentPos.r * cellSize + cellSize / 2,
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
            />

            {/* Cell Markers Labels (Goal, Penalty) */}
            <text x={gridOffset.x + goalPos.c * cellSize + cellSize / 2} y={gridOffset.y + goalPos.r * cellSize + cellSize / 2 + 4} textAnchor="middle" fill={COLORS.green} fontSize={12} fontWeight={900} className="pointer-events-none select-none">GOAL</text>
            <text x={gridOffset.x + penaltyPos.c * cellSize + cellSize / 2} y={gridOffset.y + penaltyPos.r * cellSize + cellSize / 2 + 4} textAnchor="middle" fill={COLORS.pink} fontSize={12} fontWeight={900} className="pointer-events-none select-none">TRAP</text>

            {/* In-Plot Info board */}
            <g transform="translate(426, 70)">
              <rect width={140} height={120} fill="rgba(250,248,242,0.85)" stroke={COLORS.border} rx={2} />
              <text x={12} y={22} fill={COLORS.muted} fontSize={12} fontWeight={800}>SIMULATION STATUS</text>
              
              <text x={12} y={48} fill={COLORS.muted} fontSize={12} fontWeight={700}>EPISODES COMPLETED:</text>
              <text x={12} y={64} fill={COLORS.cyan} fontSize={14} fontWeight={900}>{episodes}</text>

              <text x={12} y={88} fill={COLORS.muted} fontSize={12} fontWeight={700}>ACCUMULATED REWARD:</text>
              <text x={12} y={104} fill={COLORS.pink} fontSize={14} fontWeight={900}>{cumulativeReward}</text>
            </g>

            {/* Title / Legend */}
            <text x={gridOffset.x + 2.5 * cellSize} y={40} textAnchor="middle" fill={COLORS.muted} fontSize={12} fontWeight={800}>GRIDWORLD (Click cell to reposition GOAL)</text>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Manual Agent Controls</span>
          </div>

          {/* Navigation Button Pad */}
          <div className="flex flex-col items-center gap-1.5 mb-4">
            <button aria-label="UP"
              onClick={() => handleStep(0)}
              className="h-8 w-16 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
            >
              UP
            </button>
            <div className="flex gap-2">
              <button aria-label="LEFT"
                onClick={() => handleStep(3)}
                className="h-8 w-16 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
              >
                LEFT
              </button>
              <button aria-label="RIGHT"
                onClick={() => handleStep(1)}
                className="h-8 w-16 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
              >
                RIGHT
              </button>
            </div>
            <button aria-label="DOWN"
              onClick={() => handleStep(2)}
              className="h-8 w-16 border border-outline bg-surface hover:bg-outline-variant font-bold cursor-pointer"
            >
              DOWN
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button aria-label="PAUSE AUTO RUN AUTO EXPLORE"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex h-9 items-center justify-center border font-bold cursor-pointer transition-colors text-[12px] ${
                isPlaying ? "bg-warning/20 border-warning text-warning" : "bg-surface border-outline hover:bg-surface-container"
              }`}
            >
              {isPlaying ? "PAUSE AUTO RUN" : "AUTO EXPLORE"}
            </button>
            <button aria-label="RESET Q-TABLE"
              onClick={handleReset}
              className="flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container active:scale-[0.98] transition-all font-bold cursor-pointer text-[12px]"
            >
              RESET Q-TABLE
            </button>
          </div>

          <VisualizationInstruction
            title="Concept instruction:"
            content={`1. Move agent manually, or run **Auto Explore** to start Q-learning.
2. As Q-values accumulate in the cell quadrants, policy arrows will orient toward the highest valued path.`}
            className="uppercase"
          />
        </div>

        <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary">Mental model</span>
          <div className="mt-3 text-sm sm:text-[15px] leading-relaxed text-on-surface-variant">
            <MarkdownRenderer content={`Reinforcement learning agents learn optimal behavior through trial and error. The Q-learning algorithm estimates the expected future cumulative reward for taking an action in a state: $Q(s,a) = Q(s,a) + \alpha[R + \gamma \max Q(s',a') - Q(s,a)]$.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
