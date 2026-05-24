"use client";

import React, { type ReactNode } from "react";

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
