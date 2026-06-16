"use client";

import React, { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "../MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import {
  COLORS,
  SVGFilters,
  AnimatedPointMark,
  VisualizationInstruction,
} from "../visualizationPrimitives";

const W = 640;
const H = 420;

// Subplot boundaries
const leftPlot = { left: 40, top: 44, right: 280, width: 240, bottom: 320, height: 276 };

// Coordinate scales for Left Plot
const scaleX = (val: number) => leftPlot.left + (val / 10) * leftPlot.width;
const scaleY = (val: number) => leftPlot.bottom - (val / 10) * leftPlot.height;
const invertX = (px: number) => ((px - leftPlot.left) / leftPlot.width) * 10;
const invertY = (py: number) => ((leftPlot.bottom - py) / leftPlot.height) * 10;

// Node positions in right Tree Panel
const nodes = {
  root: { x: 470, y: 70, label: "x1 < 5.0" },
  leafR: { x: 540, y: 160, label: "Leaf B (Pink)", color: COLORS.pink },
  nodeL: { x: 400, y: 160, label: "y < 4.5" },
  leafL_A: { x: 400, y: 160, label: "Leaf A (Cyan)", color: COLORS.cyan }, // when tree is small
  leafL_LL: { x: 345, y: 240, label: "Leaf A (Cyan)", color: COLORS.cyan }, // grown tree left
  leafL_LR: { x: 455, y: 240, label: "Leaf C (Yellow)", color: COLORS.yellow }, // grown tree right
};

const basePoints = [
  { id: 0, x: 1.5, y: 2.5, label: 0 },
  { id: 1, x: 3.0, y: 3.5, label: 0 },
  { id: 2, x: 2.2, y: 6.8, label: 0 },
  { id: 3, x: 4.1, y: 8.1, label: 0 },
  { id: 4, x: 6.5, y: 5.7, label: 1 },
  { id: 5, x: 8.2, y: 3.1, label: 1 },
  { id: 6, x: 7.5, y: 7.5, label: 1 },
  { id: 7, x: 8.9, y: 6.2, label: 1 },
  { id: 8, x: 3.5, y: 1.8, label: 1 }, // outlier for yellow leaf demo
];

export default function DecisionTreeViz() {
  const [isTreeGrown, setIsTreeGrown] = useState(false);
  const [query, setQuery] = useState<{ x: number; y: number } | null>(null);
  
  // Animation state
  const [animStep, setAnimStep] = useState<number>(-1); // -1 = idle, 0 = root, 1 = mid node, 2 = leaf, 3 = finished/flash
  const [animPos, setAnimPos] = useState({ x: nodes.root.x, y: nodes.root.y });
  const [flashRegion, setFlashRegion] = useState<"LL" | "LR" | "L" | "R" | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Stop any active animations
  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const handlePlotClick = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check if click was inside the left plot area
    const borderPadding = 5;
    if (
      px >= leftPlot.left - borderPadding &&
      px <= leftPlot.right + borderPadding &&
      py >= leftPlot.top - borderPadding &&
      py <= leftPlot.bottom + borderPadding
    ) {
      const qX = Math.max(0.2, Math.min(9.8, invertX(px)));
      const qY = Math.max(0.2, Math.min(9.8, invertY(py)));
      
      startPointFallAnimation(qX, qY);
    }
  };

  const startPointFallAnimation = (qx: number, qy: number) => {
    clearTimers();
    setQuery({ x: qx, y: qy });
    setFlashRegion(null);
    
    // Step 0: Place at root
    setAnimStep(0);
    setAnimPos({ x: nodes.root.x, y: nodes.root.y });

    // Step 1: Slide to Level 1
    const t1 = setTimeout(() => {
      setAnimStep(1);
      if (qx < 5.0) {
        if (!isTreeGrown) {
          // Lands in Left Leaf A
          setAnimPos({ x: nodes.leafL_A.x, y: nodes.leafL_A.y });
          triggerFlash("L", 0.5);
        } else {
          // Lands in split Node L
          setAnimPos({ x: nodes.nodeL.x, y: nodes.nodeL.y });
          // Proceed to Level 2
          const t2 = setTimeout(() => {
            setAnimStep(2);
            if (qy < 4.5) {
              setAnimPos({ x: nodes.leafL_LL.x, y: nodes.leafL_LL.y });
              triggerFlash("LL", 0.5);
            } else {
              setAnimPos({ x: nodes.leafL_LR.x, y: nodes.leafL_LR.y });
              triggerFlash("LR", 0.5);
            }
          }, 600);
          timersRef.current.push(t2);
        }
      } else {
        // Lands in Right Leaf B
        setAnimPos({ x: nodes.leafR.x, y: nodes.leafR.y });
        triggerFlash("R", 0.5);
      }
    }, 700);

    timersRef.current.push(t1);
  };

  const triggerFlash = (region: "LL" | "LR" | "L" | "R", delaySec: number) => {
    const tFlash = setTimeout(() => {
      setAnimStep(3);
      setFlashRegion(region);
      // Auto-clear flash after 1 second
      const tClear = setTimeout(() => {
        setFlashRegion(null);
      }, 1000);
      timersRef.current.push(tClear);
    }, delaySec * 1000);
    timersRef.current.push(tFlash);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const leftTicks = [0, 2.5, 5, 7.5, 10];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
      <div className="relative flex min-h-[450px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[550px]">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Decision Tree Space Partition"
            onPointerDown={handlePlotClick}
          >
            <title>Decision Tree Diagram</title>
            <SVGFilters />
            <rect width={W} height={H} fill={COLORS.bg} />

            {/* LEFT PLOT: Feature Space */}
            <g>
              {/* Shaded split regions */}
              {/* If tree is not grown, we have two regions split at x=5.0 */}
              {!isTreeGrown ? (
                <>
                  <rect
                    x={leftPlot.left}
                    y={leftPlot.top}
                    width={scaleX(5.0) - leftPlot.left}
                    height={leftPlot.height}
                    fill={COLORS.cyan}
                    fillOpacity={flashRegion === "L" ? 0.28 : 0.08}
                    className="transition-all duration-300"
                  />
                  <rect
                    x={scaleX(5.0)}
                    y={leftPlot.top}
                    width={leftPlot.right - scaleX(5.0)}
                    height={leftPlot.height}
                    fill={COLORS.pink}
                    fillOpacity={flashRegion === "R" ? 0.28 : 0.08}
                    className="transition-all duration-300"
                  />
                </>
              ) : (
                <>
                  {/* Left-Left region: x < 5.0 and y < 4.5 (Cyan) */}
                  <rect
                    x={leftPlot.left}
                    y={scaleY(4.5)}
                    width={scaleX(5.0) - leftPlot.left}
                    height={leftPlot.bottom - scaleY(4.5)}
                    fill={COLORS.cyan}
                    fillOpacity={flashRegion === "LL" ? 0.28 : 0.08}
                    className="transition-all duration-300"
                  />
                  {/* Left-Right region: x < 5.0 and y >= 4.5 (Yellow) */}
                  <rect
                    x={leftPlot.left}
                    y={leftPlot.top}
                    width={scaleX(5.0) - leftPlot.left}
                    height={scaleY(4.5) - leftPlot.top}
                    fill={COLORS.yellow}
                    fillOpacity={flashRegion === "LR" ? 0.28 : 0.08}
                    className="transition-all duration-300"
                  />
                  {/* Right region: x >= 5.0 (Pink) */}
                  <rect
                    x={scaleX(5.0)}
                    y={leftPlot.top}
                    width={leftPlot.right - scaleX(5.0)}
                    height={leftPlot.height}
                    fill={COLORS.pink}
                    fillOpacity={flashRegion === "R" ? 0.28 : 0.08}
                    className="transition-all duration-300"
                  />
                </>
              )}

              {/* Split lines */}
              {/* Split 1: x = 5.0 */}
              <line x1={scaleX(5.0)} y1={leftPlot.top} x2={scaleX(5.0)} y2={leftPlot.bottom} stroke={COLORS.yellow} strokeWidth={2.5} />
              
              {/* Split 2 (if grown): y = 4.5 for x < 5.0 */}
              {isTreeGrown && (
                <motion.line
                  x1={leftPlot.left}
                  y1={scaleY(4.5)}
                  x2={scaleX(5.0)}
                  y2={scaleY(4.5)}
                  stroke={COLORS.yellow}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Grid Ticks */}
              {leftTicks.map((tick) => (
                <g key={`l-tick-${tick}`}>
                  <line x1={scaleX(tick)} x2={scaleX(tick)} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
                  <line x1={leftPlot.left} x2={leftPlot.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke={COLORS.grid} strokeWidth={1} strokeOpacity={0.5} />
                </g>
              ))}

              {/* Border Axes */}
              <line x1={leftPlot.left} x2={leftPlot.left} y1={leftPlot.top} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <line x1={leftPlot.left} x2={leftPlot.right} y1={leftPlot.bottom} y2={leftPlot.bottom} stroke={COLORS.border} strokeWidth={1.5} />
              <text x={leftPlot.right + 8} y={leftPlot.bottom + 4} fill={COLORS.muted} fontSize={12} fontWeight={700}>x1 (Feature 1)</text>
              <text x={leftPlot.left - 8} y={leftPlot.top - 8} textAnchor="end" fill={COLORS.muted} fontSize={12} fontWeight={700}>x2</text>
              <text x={leftPlot.left + 5} y={leftPlot.top - 8} fill={COLORS.muted} fontSize={12} fontWeight={800}>FEATURE PARTITION</text>

              {/* Data points */}
              {basePoints.map((p) => (
                <AnimatedPointMark key={p.id} px={scaleX(p.x)} py={scaleY(p.y)} color={p.label ? COLORS.pink : COLORS.cyan} r={5} />
              ))}

              {/* Query Point placed in Feature Space */}
              {query && (
                <g>
                  <circle cx={scaleX(query.x)} cy={scaleY(query.y)} r={8} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={1.5} />
                  <circle cx={scaleX(query.x)} cy={scaleY(query.y)} r={2} fill={COLORS.bg} />
                </g>
              )}
            </g>

            {/* RIGHT PLOT: Tree Structure Diagram */}
            <g>
              {/* Tree boundary box */}
              <rect x={315} y={leftPlot.top} width={295} height={leftPlot.height} fill="none" stroke={COLORS.border} strokeDasharray="3 3" />
              <text x={325} y={leftPlot.top + 16} fill={COLORS.muted} fontSize={12} fontWeight={800}>DECISION TREE</text>

              {/* Tree connection lines */}
              {/* Root -> Left */}
              <line
                x1={nodes.root.x}
                y1={nodes.root.y + 12}
                x2={nodes.nodeL.x}
                y2={nodes.nodeL.y - 12}
                stroke={animStep >= 1 && query && query.x < 5.0 ? COLORS.yellow : COLORS.border}
                strokeWidth={animStep >= 1 && query && query.x < 5.0 ? 3.5 : 1.5}
                className="transition-all"
              />
              <text x={(nodes.root.x + nodes.nodeL.x) / 2 - 12} y={(nodes.root.y + nodes.nodeL.y) / 2} fill={COLORS.cyan} fontSize={8} fontWeight={800} textAnchor="end">YES</text>

              {/* Root -> Right (Leaf B) */}
              <line
                x1={nodes.root.x}
                y1={nodes.root.y + 12}
                x2={nodes.leafR.x}
                y2={nodes.leafR.y - 12}
                stroke={animStep >= 1 && query && query.x >= 5.0 ? COLORS.yellow : COLORS.border}
                strokeWidth={animStep >= 1 && query && query.x >= 5.0 ? 3.5 : 1.5}
                className="transition-all"
              />
              <text x={(nodes.root.x + nodes.leafR.x) / 2 + 12} y={(nodes.root.y + nodes.leafR.y) / 2} fill={COLORS.pink} fontSize={8} fontWeight={800} textAnchor="start">NO</text>

              {/* Level 2 connection lines (if grown) */}
              {isTreeGrown && (
                <>
                  {/* Node L -> Leaf LL */}
                  <line
                    x1={nodes.nodeL.x}
                    y1={nodes.nodeL.y + 12}
                    x2={nodes.leafL_LL.x}
                    y2={nodes.leafL_LL.y - 12}
                    stroke={animStep >= 2 && query && query.y < 4.5 ? COLORS.yellow : COLORS.border}
                    strokeWidth={animStep >= 2 && query && query.y < 4.5 ? 3.5 : 1.5}
                    className="transition-all"
                  />
                  <text x={(nodes.nodeL.x + nodes.leafL_LL.x) / 2 - 12} y={(nodes.nodeL.y + nodes.leafL_LL.y) / 2 + 4} fill={COLORS.cyan} fontSize={8} fontWeight={800} textAnchor="end">YES</text>

                  {/* Node L -> Leaf LR */}
                  <line
                    x1={nodes.nodeL.x}
                    y1={nodes.nodeL.y + 12}
                    x2={nodes.leafL_LR.x}
                    y2={nodes.leafL_LR.y - 12}
                    stroke={animStep >= 2 && query && query.y >= 4.5 ? COLORS.yellow : COLORS.border}
                    strokeWidth={animStep >= 2 && query && query.y >= 4.5 ? 3.5 : 1.5}
                    className="transition-all"
                  />
                  <text x={(nodes.nodeL.x + nodes.leafL_LR.x) / 2 + 12} y={(nodes.nodeL.y + nodes.leafL_LR.y) / 2 + 4} fill={COLORS.yellow} fontSize={8} fontWeight={800} textAnchor="start">NO</text>
                </>
              )}

              {/* Render Tree Nodes */}
              {/* Root Decision Node */}
              <g>
                <rect x={nodes.root.x - 36} y={nodes.root.y - 12} width={72} height={24} fill="rgba(250,248,242,0.95)" stroke={animStep === 0 ? COLORS.yellow : COLORS.border} strokeWidth={animStep === 0 ? 2.5 : 1} rx={2} />
                <text x={nodes.root.x} y={nodes.root.y + 4} fill={COLORS.muted} fontSize={9} fontWeight={800} textAnchor="middle">{nodes.root.label}</text>
              </g>

              {/* Right Leaf B (always Leaf B) */}
              <g>
                <rect x={nodes.leafR.x - 42} y={nodes.leafR.y - 12} width={84} height={24} fill="rgba(250,248,242,0.95)" stroke={flashRegion === "R" ? COLORS.pink : COLORS.border} strokeWidth={flashRegion === "R" ? 3 : 1} rx={2} />
                <text x={nodes.leafR.x} y={nodes.leafR.y + 4} fill={COLORS.pink} fontSize={9} fontWeight={800} textAnchor="middle">{nodes.leafR.label}</text>
              </g>

              {/* Left Node (either Leaf A or Decision Node) */}
              {!isTreeGrown ? (
                /* Leaf A */
                <g>
                  <rect x={nodes.leafL_A.x - 42} y={nodes.leafL_A.y - 12} width={84} height={24} fill="rgba(250,248,242,0.95)" stroke={flashRegion === "L" ? COLORS.cyan : COLORS.border} strokeWidth={flashRegion === "L" ? 3 : 1} rx={2} />
                  <text x={nodes.leafL_A.x} y={nodes.leafL_A.y + 4} fill={COLORS.cyan} fontSize={9} fontWeight={800} textAnchor="middle">{nodes.leafL_A.label}</text>
                </g>
              ) : (
                /* Decision Split Node */
                <>
                  <g>
                    <rect x={nodes.nodeL.x - 36} y={nodes.nodeL.y - 12} width={72} height={24} fill="rgba(250,248,242,0.95)" stroke={animStep === 1 ? COLORS.yellow : COLORS.border} strokeWidth={animStep === 1 ? 2.5 : 1} rx={2} />
                    <text x={nodes.nodeL.x} y={nodes.nodeL.y + 4} fill={COLORS.muted} fontSize={12} fontWeight={800} textAnchor="middle">x2 &lt; 4.5</text>
                  </g>

                  {/* Level 2 Leaves */}
                  {/* Left-Left: Leaf A */}
                  <g>
                    <rect x={nodes.leafL_LL.x - 42} y={nodes.leafL_LL.y - 12} width={84} height={24} fill="rgba(250,248,242,0.95)" stroke={flashRegion === "LL" ? COLORS.cyan : COLORS.border} strokeWidth={flashRegion === "LL" ? 3 : 1} rx={2} />
                    <text x={nodes.leafL_LL.x} y={nodes.leafL_LL.y + 4} fill={COLORS.cyan} fontSize={9} fontWeight={800} textAnchor="middle">{nodes.leafL_LL.label}</text>
                  </g>
                  {/* Left-Right: Leaf C */}
                  <g>
                    <rect x={nodes.leafL_LR.x - 42} y={nodes.leafL_LR.y - 12} width={84} height={24} fill="rgba(250,248,242,0.95)" stroke={flashRegion === "LR" ? COLORS.yellow : COLORS.border} strokeWidth={flashRegion === "LR" ? 3 : 1} rx={2} />
                    <text x={nodes.leafL_LR.x} y={nodes.leafL_LR.y + 4} fill={COLORS.yellow} fontSize={9} fontWeight={800} textAnchor="middle">{nodes.leafL_LR.label}</text>
                  </g>
                </>
              )}

              {/* Falling Query dot animation inside tree */}
              {animStep >= 0 && (
                <motion.circle
                  cx={animPos.x}
                  cy={animPos.y}
                  r={5}
                  fill={COLORS.yellow}
                  stroke={COLORS.bg}
                  strokeWidth={1}
                  animate={{ cx: animPos.x, cy: animPos.y }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.58 }}
                />
              )}
            </g>
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
            <span>Controls</span>
          </div>

          <button aria-label="REDUCE TREE SIZE (SHRINK) GROW TREE (ADD LEVEL 2 SPLIT)"
            onClick={() => {
              setIsTreeGrown(!isTreeGrown);
              setQuery(null);
              setAnimStep(-1);
            }}
            className="w-full flex h-9 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer mb-2"
          >
            {isTreeGrown ? "REDUCE TREE SIZE (SHRINK)" : "GROW TREE (ADD LEVEL 2 SPLIT)"}
          </button>

          <VisualizationInstruction
            title="Direct Manipulation:"
            content="Click anywhere inside the left feature box. A query point will appear and visually fall through the split test nodes down to a leaf in the tree."
            className="uppercase"
          />
        </div>

        {query && (
          <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
            <div className="mb-2 block text-[12px] font-bold uppercase tracking-wide text-on-surface-variant">
              DECISION TRACE
            </div>
            <div className="bg-surface-container p-3 border border-outline space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Query Coordinate:</span>
                <span className="font-bold text-primary">({query.x.toFixed(2)}, {query.y.toFixed(2)})</span>
              </div>
              <div className="flex justify-between">
                <span>Test 1 (x1 &lt; 5.0?):</span>
                <span className="font-bold">{query.x < 5.0 ? "YES (Go Left)" : "NO (Go Right)"}</span>
              </div>
              {isTreeGrown && query.x < 5.0 && (
                <div className="flex justify-between">
                  <span>Test 2 (x2 &lt; 4.5?):</span>
                  <span className="font-bold">{query.y < 4.5 ? "YES (Go Left-Left)" : "NO (Go Left-Right)"}</span>
                </div>
              )}
              <div className="border-t border-outline my-2 pt-2 flex justify-between text-sm font-bold">
                <span>FINAL DECISION:</span>
                {(() => {
                  if (query.x >= 5.0) return <span className="text-pink">Leaf B (Class 1)</span>;
                  if (!isTreeGrown) return <span className="text-cyan">Leaf A (Class 0)</span>;
                  return query.y < 4.5 ? <span className="text-cyan">Leaf A (Class 0)</span> : <span className="text-yellow">Leaf C (Class 1)</span>;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
