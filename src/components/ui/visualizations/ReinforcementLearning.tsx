"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  COLORS,
  ControlPanel,
  PlotFrame,
  VisualizationShell,
  NativeCanvasPlot,
  drawHelper,
} from "../visualizationPrimitives";

const GRID_SIZE = 5;
const CELL_PX = 32;
const OFFSET_X = 55;
const OFFSET_Y = 35;

type CellType = "empty" | "wall" | "trap" | "goal";

interface StateQ {
  up: number;
  right: number;
  down: number;
  left: number;
}

export default function ReinforcementLearningVisualization() {
  const [grid, setGrid] = useState<CellType[][]>([
    ["empty", "empty", "empty", "empty", "goal"],
    ["empty", "empty", "wall", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "trap", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "trap", "empty"],
  ]);

  const [agentPos, setAgentPos] = useState<{ r: number; c: number }>({ r: 4, c: 0 });
  const [qTable, setQTable] = useState<StateQ[][]>(
    Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({ up: 0, right: 0, down: 0, left: 0 }))
    )
  );

  const [alpha, setAlpha] = useState<number>(0.2); // Learning rate
  const [gamma, setGamma] = useState<number>(0.9); // Discount factor
  const [epsilon, setEpsilon] = useState<number>(0.3); // Exploration rate
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [episodes, setEpisodes] = useState<number>(0);
  const [steps, setSteps] = useState<number>(0);

  // Reset the agent to start position
  const resetAgent = useCallback(() => {
    // Start at bottom-left corner that isn't a wall or trap
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] !== "wall" && grid[r][c] !== "trap" && grid[r][c] !== "goal") {
          setAgentPos({ r, c });
          return;
        }
      }
    }
    setAgentPos({ r: 4, c: 0 });
  }, [grid]);

  // Execute one step of Q-learning
  const stepAgent = useCallback(() => {
    let currentR = agentPos.r;
    let currentC = agentPos.c;

    // Check if agent is currently on goal or trap -> reset
    if (grid[currentR][currentC] === "goal" || grid[currentR][currentC] === "trap") {
      resetAgent();
      setEpisodes((e) => e + 1);
      return;
    }

    const actions: ("up" | "right" | "down" | "left")[] = ["up", "right", "down", "left"];
    let chosenAction: "up" | "right" | "down" | "left";

    // Epsilon-greedy action selection
    if (Math.random() < epsilon) {
      // Explore
      chosenAction = actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Exploit
      const qs = qTable[currentR][currentC];
      let maxQ = -Infinity;
      let bestActions: typeof actions = [];
      actions.forEach((act) => {
        if (qs[act] > maxQ) {
          maxQ = qs[act];
          bestActions = [act];
        } else if (qs[act] === maxQ) {
          bestActions.push(act);
        }
      });
      chosenAction = bestActions[Math.floor(Math.random() * bestActions.length)];
    }

    // Determine target position based on action
    let nextR = currentR;
    let nextC = currentC;
    if (chosenAction === "up") nextR = Math.max(0, currentR - 1);
    else if (chosenAction === "down") nextR = Math.min(GRID_SIZE - 1, currentR + 1);
    else if (chosenAction === "left") nextC = Math.max(0, currentC - 1);
    else if (chosenAction === "right") nextC = Math.min(GRID_SIZE - 1, currentC + 1);

    // If hits wall, stay in place
    if (grid[nextR][nextC] === "wall") {
      nextR = currentR;
      nextC = currentC;
    }

    // Determine reward
    let reward = -0.1; // Small step penalty
    const nextType = grid[nextR][nextC];
    if (nextType === "goal") reward = 10;
    else if (nextType === "trap") reward = -10;

    // Q-value Update equation
    // Q(s,a) = Q(s,a) + alpha * (reward + gamma * max_a' Q(s', a') - Q(s,a))
    const nextQs = qTable[nextR][nextC];
    const maxNextQ = Math.max(nextQs.up, nextQs.right, nextQs.down, nextQs.left);
    const currentQ = qTable[currentR][currentC][chosenAction];

    const updatedQ = currentQ + alpha * (reward + gamma * maxNextQ - currentQ);

    setQTable((prev) => {
      const copy = prev.map((row) => row.map((qs) => ({ ...qs })));
      copy[currentR][currentC][chosenAction] = updatedQ;
      return copy;
    });

    setAgentPos({ r: nextR, c: nextC });
    setSteps((s) => s + 1);
  }, [agentPos, grid, qTable, alpha, gamma, epsilon, resetAgent]);

  // Handle auto playing loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      stepAgent();
    }, 180);
    return () => clearInterval(interval);
  }, [isPlaying, stepAgent]);

  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Draw frame background crop marks
      drawHelper.cropMarks(ctx, 320, 220);

      // Draw Grid cells
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const type = grid[r][c];
          const x = OFFSET_X + c * CELL_PX;
          const y = OFFSET_Y + r * CELL_PX;

          const cx = x + CELL_PX / 2;
          const cy = y + CELL_PX / 2;

          // Background base cell fill
          ctx.save();
          if (type === "wall") {
            ctx.fillStyle = COLORS.muted;
            ctx.fillRect(x, y, CELL_PX, CELL_PX);
          } else if (type === "trap") {
            ctx.fillStyle = "rgba(141, 81, 73, 0.22)"; // Soft pink hazard
            ctx.fillRect(x, y, CELL_PX, CELL_PX);
            // Draw an X hazard line
            ctx.strokeStyle = COLORS.pink;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 2, CELL_PX - 4, CELL_PX - 4);
          } else if (type === "goal") {
            ctx.fillStyle = "rgba(85, 107, 74, 0.25)"; // Soft green target
            ctx.fillRect(x, y, CELL_PX, CELL_PX);
            ctx.strokeStyle = COLORS.green;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, CELL_PX - 4, CELL_PX - 4);
          } else {
            ctx.fillStyle = "#FAF8F2";
            ctx.fillRect(x, y, CELL_PX, CELL_PX);
          }
          ctx.restore();

          // If empty/trap/goal, draw Q-value triangles
          if (type !== "wall") {
            const qs = qTable[r][c];
            const directions: { key: keyof StateQ; pts: [number, number][] }[] = [
              {
                key: "up",
                pts: [
                  [cx, cy],
                  [x, y],
                  [x + CELL_PX, y],
                ],
              },
              {
                key: "right",
                pts: [
                  [cx, cy],
                  [x + CELL_PX, y],
                  [x + CELL_PX, y + CELL_PX],
                ],
              },
              {
                key: "down",
                pts: [
                  [cx, cy],
                  [x + CELL_PX, y + CELL_PX],
                  [x, y + CELL_PX],
                ],
              },
              {
                key: "left",
                pts: [
                  [cx, cy],
                  [x, y + CELL_PX],
                  [x, y],
                ],
              },
            ];

            directions.forEach((dir) => {
              const val = qs[dir.key];
              if (Math.abs(val) > 0.001) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(dir.pts[0][0], dir.pts[0][1]);
                ctx.lineTo(dir.pts[1][0], dir.pts[1][1]);
                ctx.lineTo(dir.pts[2][0], dir.pts[2][1]);
                ctx.closePath();

                // Normalize color based on Q value (max expected around 10)
                const intensity = Math.min(1, Math.abs(val) / 10);
                if (val > 0) {
                  ctx.fillStyle = `rgba(85, 107, 74, ${intensity * 0.5})`; // Green tint
                } else {
                  ctx.fillStyle = `rgba(141, 81, 73, ${intensity * 0.5})`; // Red tint
                }
                ctx.fill();
                ctx.restore();
              }
            });

            // Draw thin divider diagonals inside cells
            ctx.save();
            ctx.strokeStyle = "rgba(190, 182, 165, 0.18)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + CELL_PX, y + CELL_PX);
            ctx.moveTo(x + CELL_PX, y);
            ctx.lineTo(x, y + CELL_PX);
            ctx.stroke();
            ctx.restore();
          }

          // Cell outline border
          ctx.save();
          ctx.strokeStyle = "rgba(190, 182, 165, 0.4)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, CELL_PX, CELL_PX);
          ctx.restore();
        }
      }

      // Draw agent reticle
      const ax = OFFSET_X + agentPos.c * CELL_PX + CELL_PX / 2;
      const ay = OFFSET_Y + agentPos.r * CELL_PX + CELL_PX / 2;
      drawHelper.point(ctx, ax, ay, COLORS.yellow, "reticle", 7);

      // Label Start/Goal text
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const type = grid[r][c];
          const x = OFFSET_X + c * CELL_PX;
          const y = OFFSET_Y + r * CELL_PX;
          if (type === "goal") {
            drawHelper.text(ctx, "GOAL", x + CELL_PX / 2, y + CELL_PX / 2, COLORS.green, "bold 7px var(--font-mono)", "center");
          } else if (type === "trap") {
            drawHelper.text(ctx, "TRAP", x + CELL_PX / 2, y + CELL_PX / 2, COLORS.pink, "bold 7px var(--font-mono)", "center");
          }
        }
      }

      // Statistics layout info
      ctx.fillStyle = COLORS.muted;
      ctx.font = "bold 8px var(--font-mono)";
      ctx.textAlign = "left";
      ctx.fillText(`Episodes: ${episodes}`, OFFSET_X + GRID_SIZE * CELL_PX + 20, OFFSET_Y + 20);
      ctx.fillText(`Steps: ${steps}`, OFFSET_X + GRID_SIZE * CELL_PX + 20, OFFSET_Y + 35);
      ctx.fillText("Grid Key:", OFFSET_X + GRID_SIZE * CELL_PX + 20, OFFSET_Y + 65);

      // Small legend circles
      ctx.fillStyle = "rgba(85, 107, 74, 0.4)";
      ctx.fillRect(OFFSET_X + GRID_SIZE * CELL_PX + 20, OFFSET_Y + 75, 8, 8);
      ctx.fillStyle = COLORS.muted;
      ctx.font = "7px var(--font-mono)";
      ctx.fillText("+Q (Reward)", OFFSET_X + GRID_SIZE * CELL_PX + 32, OFFSET_Y + 80);

      ctx.fillStyle = "rgba(141, 81, 73, 0.4)";
      ctx.fillRect(OFFSET_X + GRID_SIZE * CELL_PX + 20, OFFSET_Y + 90, 8, 8);
      ctx.fillStyle = COLORS.muted;
      ctx.fillText("-Q (Penalty)", OFFSET_X + GRID_SIZE * CELL_PX + 32, OFFSET_Y + 95);
    },
    [grid, agentPos, qTable, episodes, steps]
  );

  const handlePlotClick = (x: number, y: number) => {
    // Map x, y back to r, c
    const clickC = Math.floor((x - OFFSET_X) / CELL_PX);
    const clickR = Math.floor((y - OFFSET_Y) / CELL_PX);

    if (clickC >= 0 && clickC < GRID_SIZE && clickR >= 0 && clickR < GRID_SIZE) {
      setGrid((prev) => {
        const copy = prev.map((row) => [...row]);
        const current = copy[clickR][clickC];
        let next: CellType = "empty";
        if (current === "empty") next = "wall";
        else if (current === "wall") next = "trap";
        else if (current === "trap") next = "goal";
        else if (current === "goal") next = "empty";

        copy[clickR][clickC] = next;
        return copy;
      });

      // Clear Q-table cell values to reset learning context
      setQTable((prev) => {
        const copy = prev.map((row) => row.map((qs) => ({ ...qs })));
        copy[clickR][clickC] = { up: 0, right: 0, down: 0, left: 0 };
        return copy;
      });
    }
  };

  const handleReset = () => {
    setGrid([
      ["empty", "empty", "empty", "empty", "goal"],
      ["empty", "empty", "wall", "empty", "empty"],
      ["empty", "empty", "empty", "empty", "empty"],
      ["empty", "trap", "empty", "empty", "empty"],
      ["empty", "empty", "empty", "trap", "empty"],
    ]);
    setQTable(
      Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({ up: 0, right: 0, down: 0, left: 0 }))
      )
    );
    setEpisodes(0);
    setSteps(0);
    setAgentPos({ r: 4, c: 0 });
    setIsPlaying(false);
  };

  return (
    <VisualizationShell
      title="Q-Learning Pathfinder (Reinforcement Learning)"
      subtitle="Click grid blocks to cycle cells: Wall (brown) -> Trap (pink) -> Goal (green) -> Empty. Run the agent and observe Q-values updates."
      insight="Temporal Difference feedback updates state-action values. The triangles color-code Q-expectations: green denotes positive path values, and pink represents path penalties."
      legend={[
        { label: "Agent Location", color: COLORS.yellow },
        { label: "Barrier Wall", color: COLORS.muted },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px] relative">
          <NativeCanvasPlot
            onDraw={onDraw}
            onClick={handlePlotClick}
            className="h-full w-full cursor-pointer"
          />
          <div className="absolute right-6 bottom-6 border border-outline/30 bg-surface/80 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-on-surface-variant rounded-xs select-none">
            [Click cells to toggle grid properties]
          </div>
        </PlotFrame>

        <ControlPanel className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 border px-3 py-2 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                isPlaying
                  ? "bg-pink text-on-primary border-pink hover:bg-pink/90"
                  : "bg-primary text-on-primary border-primary hover:bg-primary/90"
              }`}
            >
              {isPlaying ? "Pause Agent" : "Auto Train"}
            </button>
            <button
              onClick={stepAgent}
              disabled={isPlaying}
              className="flex-1 border border-outline rounded bg-surface text-on-surface px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer text-center"
            >
              Manual Step
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Exploration Rate (ε)</span>
              <span className="text-pink font-bold">{(epsilon * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Learning Rate (α)</span>
              <span className="text-pink font-bold">{alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="flex justify-between font-bold uppercase tracking-wide text-primary">
              <span>Discount Factor (γ)</span>
              <span className="text-pink font-bold">{gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.02"
              value={gamma}
              onChange={(e) => setGamma(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <button
            onClick={handleReset}
            className="border border-outline rounded bg-surface-container text-on-surface px-3 py-2 font-mono text-[10px] font-bold uppercase hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Reset Grid & Q-Table
          </button>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
