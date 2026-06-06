"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { COLORS } from "../visualizationPrimitives";
import { createSeededRNG } from "@/lib/prng";

const W = 640;
const H = 420;

// Coordinate mapping: map mathematical [-3, 3] to pixels
const scaleX = (x: number) => 50 + ((x + 3.0) / 6.0) * (W - 220);
const scaleY = (y: number) => H - 50 - ((y + 3.0) / 6.0) * (H - 100);

const invertX = (px: number) => ((px - 50) / (W - 220)) * 6.0 - 3.0;
const invertY = (py: number) => ((H - 50 - py) / (H - 100)) * 6.0 - 3.0;

interface Point {
  x: number;
  y: number;
}

export default function GradientDescentViz() {
  const [optimizer, setOptimizer] = useState<"sgd" | "momentum" | "adam">("sgd");
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [surfacePreset, setSurfacePreset] = useState<"bowl" | "saddle" | "rosenbrock">("bowl");
  const [seed, setSeed] = useState<number>(42);
  const [path, setPath] = useState<Point[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepCount, setStepCount] = useState<number>(0);

  // Optimizer states
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const mRef = useRef<Point>({ x: 0, y: 0 });
  const vRef = useRef<Point>({ x: 0, y: 0 });
  const currentPosRef = useRef<Point>({ x: -2.0, y: 2.0 });
  const stepCountRef = useRef<number>(0);

  // Set initial position based on surface preset
  const resetSimulation = () => {
    setIsRunning(false);
    stepCountRef.current = 0;
    setStepCount(0);
    velocityRef.current = { x: 0, y: 0 };
    mRef.current = { x: 0, y: 0 };
    vRef.current = { x: 0, y: 0 };

    let startPos = { x: -2.0, y: 2.2 };
    if (surfacePreset === "saddle") {
      startPos = { x: -2.2, y: 0.1 }; // start near saddle center ridge to see trajectory split
    } else if (surfacePreset === "rosenbrock") {
      startPos = { x: -1.5, y: -1.5 };
    }
    currentPosRef.current = startPos;
    setPath([startPos]);
  };

  useEffect(() => {
    resetSimulation();
  }, [surfacePreset, seed]);

  // Define the function value f(x, y) and its gradient df/dx, df/dy
  const surfaceFunctions = useMemo(() => {
    return {
      bowl: {
        val: (x: number, y: number) => x * x + 1.5 * y * y,
        grad: (x: number, y: number) => ({ dx: 2 * x, dy: 3 * y })
      },
      saddle: {
        val: (x: number, y: number) => x * x - 1.2 * y * y,
        grad: (x: number, y: number) => ({ dx: 2 * x, dy: -2.4 * y })
      },
      rosenbrock: {
        // Scaled/modified Rosenbrock to fit nicely in [-3, 3] viewport
        // f(x, y) = (1 - x)^2 + 5(y - x^2)^2
        val: (x: number, y: number) => Math.pow(1 - x, 2) + 5 * Math.pow(y - x * x, 2),
        grad: (x: number, y: number) => ({
          dx: -2 * (1 - x) - 20 * x * (y - x * x),
          dy: 10 * (y - x * x)
        })
      }
    };
  }, []);

  const currentLoss = useMemo(() => {
    if (path.length === 0) return 0;
    const currentPoint = path[path.length - 1];
    return surfaceFunctions[surfacePreset].val(currentPoint.x, currentPoint.y);
  }, [path, surfacePreset, surfaceFunctions]);

  // Compute contour lines dynamically
  const contourLines = useMemo(() => {
    const lines: Array<{ level: number; d: string }> = [];
    const fn = surfaceFunctions[surfacePreset].val;
    const levels = surfacePreset === "rosenbrock" ? [0.5, 2, 5, 12, 25, 45] : [0.5, 1.5, 3.5, 6, 9.5, 14];
    
    // Draw approximate contour paths by sampling coordinates
    levels.forEach(level => {
      let d = "";
      const numPoints = 80;
      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const r = 0;
        
        // Find radius r such that fn(r*cos, r*sin) = level
        // Binary search for r
        let low = 0;
        let high = 5.0;
        for (let iter = 0; iter < 12; iter++) {
          const mid = (low + high) / 2;
          const px = mid * Math.cos(theta);
          const py = mid * Math.sin(theta);
          if (fn(px, py) < level) {
            low = mid;
          } else {
            high = mid;
          }
        }
        
        const px = low * Math.cos(theta);
        const py = low * Math.sin(theta);
        const cx = scaleX(px);
        const cy = scaleY(py);

        if (i === 0) {
          d += `M ${cx} ${cy}`;
        } else {
          d += ` L ${cx} ${cy}`;
        }
      }
      d += " Z";
      lines.push({ level, d });
    });
    return lines;
  }, [surfacePreset, surfaceFunctions]);

  // Simulation step update
  const runStep = () => {
    const current = currentPosRef.current;
    const { dx, dy } = surfaceFunctions[surfacePreset].grad(current.x, current.y);

    // Limit gradient sizes
    const gradLimit = 20;
    const gX = Math.max(-gradLimit, Math.min(gradLimit, dx));
    const gY = Math.max(-gradLimit, Math.min(gradLimit, dy));

    let nextX = current.x;
    let nextY = current.y;

    if (optimizer === "sgd") {
      nextX = current.x - learningRate * gX;
      nextY = current.y - learningRate * gY;
    } else if (optimizer === "momentum") {
      const beta = 0.9;
      velocityRef.current = {
        x: beta * velocityRef.current.x + learningRate * gX,
        y: beta * velocityRef.current.y + learningRate * gY
      };
      nextX = current.x - velocityRef.current.x;
      nextY = current.y - velocityRef.current.y;
    } else if (optimizer === "adam") {
      const beta1 = 0.9;
      const beta2 = 0.999;
      const eps = 1e-8;
      
      stepCountRef.current++;
      
      mRef.current = {
        x: beta1 * mRef.current.x + (1 - beta1) * gX,
        y: beta1 * mRef.current.y + (1 - beta1) * gY
      };
      
      vRef.current = {
        x: beta2 * vRef.current.x + (1 - beta2) * gX * gX,
        y: beta2 * vRef.current.y + (1 - beta2) * gY * gY
      };
      
      const mHatX = mRef.current.x / (1 - Math.pow(beta1, stepCountRef.current));
      const mHatY = mRef.current.y / (1 - Math.pow(beta1, stepCountRef.current));
      
      const vHatX = vRef.current.x / (1 - Math.pow(beta2, stepCountRef.current));
      const vHatY = vRef.current.y / (1 - Math.pow(beta2, stepCountRef.current));
      
      nextX = current.x - (learningRate * mHatX) / (Math.sqrt(vHatX) + eps);
      nextY = current.y - (learningRate * mHatY) / (Math.sqrt(vHatY) + eps);
    }

    // Bound check
    nextX = Math.max(-3.0, Math.min(3.0, nextX));
    nextY = Math.max(-3.0, Math.min(3.0, nextY));

    const nextPoint = { x: nextX, y: nextY };
    currentPosRef.current = nextPoint;
    setPath(prev => [...prev, nextPoint]);
    setStepCount(prev => prev + 1);

    // Stop if we converged
    const stepDiff = Math.sqrt(Math.pow(nextX - current.x, 2) + Math.pow(nextY - current.y, 2));
    if (stepDiff < 0.0001 || stepCountRef.current > 200) {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      runStep();
    }, 40);
    return () => clearInterval(interval);
  }, [isRunning, optimizer, learningRate, surfacePreset]);

  // Click on surface to start at custom coordinates
  const handleSurfaceClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isRunning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Convert pixel to math domain
    const x = invertX(px);
    const y = invertY(py);

    if (x >= -3.0 && x <= 3.0 && y >= -3.0 && y <= 3.0) {
      const customStart = { x, y };
      currentPosRef.current = customStart;
      velocityRef.current = { x: 0, y: 0 };
      mRef.current = { x: 0, y: 0 };
      vRef.current = { x: 0, y: 0 };
      stepCountRef.current = 0;
      setStepCount(0);
      setPath([customStart]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative border border-outline bg-surface overflow-hidden rounded">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none cursor-crosshair"
            onClick={handleSurfaceClick}
            role="img"
            aria-label="Gradient Descent Trajectory Visualizer"
          >
            <title>Gradient Descent Trajectory Visualizer</title>
            <defs>
              <pattern id="gd-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.grid} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#gd-grid-pattern)" />

            {/* Contour levels */}
            {contourLines.map((line, idx) => (
              <path
                key={`contour-${idx}`}
                d={line.d}
                fill="none"
                stroke={COLORS.border}
                strokeWidth={1}
                opacity={0.6}
              />
            ))}

            {/* Minimum target star marker */}
            <g transform={`translate(${scaleX(surfacePreset === "rosenbrock" ? 1.0 : 0)}, ${scaleY(surfacePreset === "rosenbrock" ? 1.0 : 0)})`}>
              <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill={COLORS.pink} />
              <text y={18} textAnchor="middle" fontSize={10} fill={COLORS.pink} fontWeight={800}>GLOBAL MINIMUM</text>
            </g>

            {/* Trajectory path */}
            {path.length > 1 && (
              <polyline
                points={path.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(" ")}
                fill="none"
                stroke={COLORS.cyan}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Trajectory steps (dots) */}
            {path.map((p, idx) => (
              <circle
                key={`path-pt-${idx}`}
                cx={scaleX(p.x)}
                cy={scaleY(p.y)}
                r={idx === path.length - 1 ? 5 : 2}
                fill={idx === path.length - 1 ? COLORS.pink : COLORS.cyan}
                stroke={idx === path.length - 1 ? "#fff" : "none"}
                strokeWidth={idx === path.length - 1 ? 1.5 : 0}
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="mb-3 flex items-center justify-between font-bold uppercase tracking-wide">
            <span>Controls</span>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[11px]" htmlFor="optimizer-select">
              Optimizer Method
            </label>
            <select
              id="optimizer-select"
              value={optimizer}
              onChange={e => setOptimizer(e.target.value as "sgd" | "momentum" | "adam")}
              className="w-full border border-outline bg-surface p-2 text-xs sm:text-sm rounded"
              aria-label="Select optimizer algorithm"
            >
              <option value="sgd">Standard SGD</option>
              <option value="momentum">SGD + Momentum</option>
              <option value="adam">Adam Optimizer</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[11px]" htmlFor="lr-slider">
              Learning Rate (α: {learningRate.toFixed(3)})
            </label>
            <input
              id="lr-slider"
              type="range"
              min={0.005}
              max={0.3}
              step={0.005}
              value={learningRate}
              onChange={e => setLearningRate(Number(e.target.value))}
              className="w-full h-1.5 bg-grid rounded-lg appearance-none cursor-pointer accent-cyan"
              aria-label="Learning rate slider from 0.005 to 0.3"
            />
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-on-surface-variant uppercase font-bold text-[11px]" htmlFor="surface-select">
              Loss Surface Preset
            </label>
            <select
              id="surface-select"
              value={surfacePreset}
              onChange={e => setSurfacePreset(e.target.value as "bowl" | "saddle" | "rosenbrock")}
              className="w-full border border-outline bg-surface p-2 text-xs sm:text-sm rounded"
              aria-label="Select loss surface shape preset"
            >
              <option value="bowl">Convex Bowl (f = x² + 1.5y²)</option>
              <option value="saddle">Non-Convex Saddle (f = x² - 1.2y²)</option>
              <option value="rosenbrock">Rosenbrock Valley</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={isRunning ? () => setIsRunning(false) : () => setIsRunning(true)}
              className={`w-full flex h-9 items-center justify-center border border-outline font-bold tracking-wider cursor-pointer active:scale-[0.98] transition-all text-[11px] ${
                isRunning
                  ? "bg-warning/20 border-warning hover:bg-warning/30 text-warning"
                  : "bg-cyan text-white hover:bg-cyan/90"
              }`}
              aria-label={isRunning ? "Pause optimization path" : "Run optimization path"}
            >
              {isRunning ? "PAUSE DESCENT" : "RUN DESCENT"}
            </button>

            <button
              onClick={resetSimulation}
              className="w-full flex h-9 items-center justify-center border border-outline bg-surface hover:bg-surface-container hover:text-primary active:scale-[0.98] transition-all font-bold tracking-wider cursor-pointer text-[11px]"
              aria-label="Reset trajectory to start position"
            >
              RESET TRAJECTORY
            </button>
          </div>
        </div>

        {/* Diagnostic Metrics */}
        <div className="rounded border border-outline bg-surface p-4 font-mono text-xs sm:text-sm text-on-surface">
          <div className="font-bold text-primary mb-2 uppercase text-[11px]">Loss metrics</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Steps taken:</div>
            <div className="font-bold text-right text-cyan">{stepCount}</div>
            <div>Current Loss:</div>
            <div className="font-bold text-right text-yellow">{currentLoss.toFixed(4)}</div>
            <div>Position (X, Y):</div>
            <div className="font-bold text-right text-pink">
              ({path.length > 0 ? path[path.length - 1].x.toFixed(2) : "—"}, {path.length > 0 ? path[path.length - 1].y.toFixed(2) : "—"})
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-snug text-on-surface-variant font-sans">
            *Click anywhere inside the coordinate grid to set a custom initial parameter point!
          </p>
        </div>
      </div>
    </div>
  );
}
