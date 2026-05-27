"use client";

import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";

export interface LegendItem {
  label: string;
  color: string;
}

interface VisualizationShellProps {
  title: string;
  subtitle: string;
  insight: string;
  legend?: LegendItem[];
  children: ReactNode;
}

export const COLORS: Record<
  "bg" | "grid" | "border" | "pink" | "cyan" | "yellow" | "green" | "muted",
  string
> = {
  bg: "#FAF8F2",
  grid: "#E8E2D5",
  border: "#BEB6A5",
  pink: "#8D5149",
  cyan: "#556B4A",
  yellow: "#927A4B",
  green: "#556B4A",
  muted: "#6F6658",
};

export function VisualizationShell({
  title,
  subtitle,
  insight,
  legend,
  children,
}: VisualizationShellProps) {
  return (
    <div className="relative flex w-full flex-col font-body">
      <div className="relative z-10 flex flex-col items-start justify-between gap-4 border-b border-outline py-6 lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-3 inline-block border border-outline bg-surface-container-high px-3 py-1.5 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-primary sm:text-[10px] sm:tracking-[0.18em]">
            Interactive Diagram
          </div>
          <h4 className="mb-2 text-balance font-headline text-xl font-medium tracking-normal text-on-background">
            {title}
          </h4>
          <p className="max-w-2xl text-[15px] font-medium leading-7 text-on-surface-variant sm:text-sm sm:leading-relaxed">
            {subtitle}
          </p>
        </div>

        {legend && legend.length > 0 && (
          <div className="flex max-w-full flex-wrap items-center gap-2 lg:justify-end">
            {legend.map((item) => (
              <div
                key={item.label}
                className="inline-flex min-h-8 items-center gap-2 border border-outline bg-surface-container-high px-3 py-1.5 font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-on-surface sm:min-h-7 sm:py-1 sm:text-[10px] sm:tracking-[0.14em]"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1 py-6 sm:py-8">
        {children}
      </div>

      <div className="relative z-10 flex flex-col gap-3 border-t border-outline py-6 text-[15px] font-medium leading-7 text-on-surface sm:flex-row sm:items-start sm:text-sm sm:leading-relaxed">
        <span className="w-max shrink-0 border border-outline bg-surface-container-high px-3 py-1.5 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-warning sm:py-1 sm:text-[10px] sm:tracking-[0.18em]">
          Key Insight
        </span>
        <span className="font-sans font-medium text-on-surface-variant">
          {insight}
        </span>
      </div>
    </div>
  );
}

export function PlotFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex min-h-[320px] w-full items-center justify-center overflow-hidden border border-outline bg-surface sm:min-h-[400px] ${className}`}
    >
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function ControlPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-sans text-[13px] font-medium text-on-surface ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * AnimatedPointMark - A point marker using springs for smooth transition to new coordinates.
 */
export function AnimatedPointMark({
  px,
  py,
  color,
  r = 6,
  label,
  springConfig = { stiffness: 150, damping: 18 }
}: {
  px: number;
  py: number;
  color: string;
  r?: number;
  label?: string;
  springConfig?: { stiffness: number; damping: number };
}) {
  return (
    <motion.g
      initial={false}
      animate={{ x: px, y: py }}
      transition={{ type: "spring", ...springConfig }}
    >
      <motion.circle
        cx={0}
        cy={0}
        r={r + 4}
        fill="none"
        stroke={color}
        strokeOpacity={0.25}
      />
      <motion.circle
        cx={0}
        cy={0}
        r={r}
        fill={color}
        stroke={COLORS.bg}
        strokeWidth={2}
      />
      {label && (
        <text
          x={10}
          y={-8}
          fill={color}
          fontSize={12}
          fontWeight={700}
          stroke={COLORS.bg}
          strokeWidth={3}
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </motion.g>
  );
}

/**
 * AnimatedPath - A path that draws itself using Framer Motion pathLength.
 */
export function AnimatedPath({
  d,
  color,
  strokeWidth = 3,
  dashed = false,
  duration = 0.8,
  ...props
}: {
  d: string;
  color: string;
  strokeWidth?: number;
  dashed?: boolean;
  duration?: number;
  [key: string]: any;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? "7 6" : undefined}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration, ease: "easeInOut" }}
      {...props}
    />
  );
}

/**
 * PulseRing - A looping radial pulse centered at a coordinate.
 */
export function PulseRing({
  px,
  py,
  color,
  maxRadius = 24,
  duration = 1.5
}: {
  px: number;
  py: number;
  color: string;
  maxRadius?: number;
  duration?: number;
}) {
  return (
    <g transform={`translate(${px}, ${py})`}>
      <motion.circle
        cx={0}
        cy={0}
        initial={{ r: 4, opacity: 0.8 }}
        animate={{ r: maxRadius, opacity: 0 }}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: "easeOut"
        }}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
    </g>
  );
}

/**
 * FlowingEdge - An animated edge showing directional flow (ants marching).
 */
export function FlowingEdge({
  d,
  color,
  strokeWidth = 2,
  speed = 1.5,
  ...props
}: {
  d: string;
  color: string;
  strokeWidth?: number;
  speed?: number;
  [key: string]: any;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray="6 4"
      animate={{
        strokeDashoffset: [-20, 0]
      }}
      transition={{
        repeat: Infinity,
        duration: speed,
        ease: "linear"
      }}
      {...props}
    />
  );
}

/**
 * NarrativeControls - A standardized play, pause, step forward, backward, and reset button bar.
 */
export function NarrativeControls({
  isPlaying,
  onPlayToggle,
  onStepForward,
  onStepBackward,
  onReset,
  currentStep,
  totalSteps,
}: {
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onReset?: () => void;
  currentStep?: number;
  totalSteps?: number;
}) {
  return (
    <div className="flex items-center justify-between border border-outline bg-surface p-3 font-mono text-[11px] w-full">
      <div className="flex items-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="flex h-8 w-8 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        {onStepBackward && (
          <button
            onClick={onStepBackward}
            className="flex h-8 w-8 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            disabled={currentStep === 0}
            title="Step Backward"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onPlayToggle}
          className="flex h-8 px-3 items-center justify-center gap-1.5 border border-outline bg-surface-container hover:bg-outline-variant text-on-surface transition-colors cursor-pointer"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>PLAY</span>
            </>
          )}
        </button>
        {onStepForward && (
          <button
            onClick={onStepForward}
            className="flex h-8 w-8 items-center justify-center border border-outline bg-surface-container hover:bg-outline-variant text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            disabled={totalSteps !== undefined && currentStep === totalSteps - 1}
            title="Step Forward"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {currentStep !== undefined && totalSteps !== undefined && (
        <span className="font-bold text-primary tracking-wider">
          STEP {currentStep + 1} / {totalSteps}
        </span>
      )}
    </div>
  );
}

/**
 * StepIndicator - Progress line for Narrative Steppers.
 */
export function StepIndicator({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between gap-1.5">
        {steps.map((stepName, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <div
              key={stepName}
              className="flex flex-1 flex-col items-center text-center gap-1.5"
            >
              <div
                className="h-2 w-full transition-all duration-300"
                style={{
                  backgroundColor: isActive
                    ? COLORS.yellow
                    : isCompleted
                    ? COLORS.cyan
                    : COLORS.grid,
                }}
              />
              <span
                className={`font-mono text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "text-primary"
                    : isCompleted
                    ? "text-on-surface"
                    : "text-on-surface-variant"
                }`}
              >
                {stepName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * SVGFilters - Glowing effects definitions for SVGs.
 */
export function SVGFilters() {
  return (
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="intense-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur1" />
        <feGaussianBlur stdDeviation="2" result="blur2" />
        <feColorMatrix
          type="matrix"
          values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 2 -0.1"
          in="blur1"
          result="glow1"
        />
        <feMerge>
          <feMergeNode in="glow1" />
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

export function Vector({ x1, y1, x2, y2, color, label }: { x1: number; y1: number; x2: number; y2: number; color: string; label?: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 10;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path
        d={`M${x2},${y2} L${x2 - head * Math.cos(angle - 0.45)},${y2 - head * Math.sin(angle - 0.45)} L${x2 - head * Math.cos(angle + 0.45)},${y2 - head * Math.sin(angle + 0.45)} Z`}
        fill={color}
      />
      {label && <text x={x2 + 10} y={y2} fill={color} fontSize={13} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{label}</text>}
    </g>
  );
}

export function MiniStat({ x0, y0, label, value }: { x0: number; y0: number; label: string; value: string }) {
  return (
    <g>
      <rect x={x0} y={y0} width={166} height={54} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} />
      <text x={x0 + 14} y={y0 + 21} fill={COLORS.muted} fontSize={11} fontWeight={700}>{label}</text>
      <text x={x0 + 14} y={y0 + 41} fill={COLORS.pink} fontSize={17} fontWeight={800}>{value}</text>
    </g>
  );
}
