"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

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

function DiagramCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const ctx = canvas.getContext("2d");

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#FAF8F2";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(232, 226, 213, 0.85)";
      ctx.lineWidth = 1;
      const grid = 28;
      for (let x = 0; x <= width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }

      const cx = width * 0.62;
      const cy = height * 0.44;
      const radius = Math.min(width, height) * 0.26;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.18);
      for (let i = 0; i < 5; i += 1) {
        const rx = radius - i * radius * 0.15;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, rx * 0.38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(85, 107, 74, ${0.1 + i * 0.025})`;
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = "rgba(85, 107, 74, 0.22)";
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.moveTo(width * 0.1, height * 0.78);
      ctx.bezierCurveTo(width * 0.28, height * 0.58, width * 0.4, height * 0.7, width * 0.55, height * 0.48);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(30, 27, 22, 0.45)";
      ctx.font = "10px monospace";
      ctx.fillText("diagram plane", 18, height - 18);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

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
          <div className="mb-3 inline-block border border-outline bg-surface-container-high px-3 py-1 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-primary">
            Interactive Diagram
          </div>
          <h4 className="mb-2 text-balance font-headline text-xl font-medium tracking-normal text-on-background">
            {title}
          </h4>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-on-surface-variant">
            {subtitle}
          </p>
        </div>

        {legend && legend.length > 0 && (
          <div className="flex max-w-full flex-wrap items-center gap-2 lg:justify-end">
            {legend.map((item) => (
              <div
                key={item.label}
                className="inline-flex min-h-7 items-center gap-2 border border-outline bg-surface-container-high px-3 py-1 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-on-surface"
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

      <div className="relative z-10 flex-1 py-8">
        {children}
      </div>

      <div className="relative z-10 flex flex-col gap-3 border-t border-outline py-6 text-sm font-medium leading-relaxed text-on-surface sm:flex-row sm:items-start">
        <span className="w-max shrink-0 border border-outline bg-surface-container-high px-3 py-1 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-warning">
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
      className={`relative flex min-h-[400px] w-full items-center justify-center overflow-hidden border border-outline bg-surface ${className}`}
    >
      <DiagramCanvas />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
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

export function ScatterAxes() {
  return (
    <>
      <line
        x1="40"
        y1="24"
        x2="40"
        y2="190"
        stroke={COLORS.border}
        strokeWidth="2"
      />
      <line
        x1="40"
        y1="190"
        x2="296"
        y2="190"
        stroke={COLORS.border}
        strokeWidth="2"
      />
      <text
        x="24"
        y="22"
        fill={COLORS.border}
        fontSize="12"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Y
      </text>
      <text
        x="296"
        y="208"
        fill={COLORS.border}
        fontSize="12"
        fontFamily="monospace"
        fontWeight="bold"
      >
        X
      </text>
    </>
  );
}
