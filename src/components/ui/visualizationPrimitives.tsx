"use client";

import React, { type ReactNode, useEffect, useRef } from "react";

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

// Convert hex colors (and standard rgb/rgba strings) to rgba to support opacity blending
function hexToRgba(hex: string, opacity: number): string {
  if (hex.startsWith("#")) {
    const cleanHex = hex.replace("#", "");
    let r = 0, g = 0, b = 0;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (hex.startsWith("rgba")) return hex;
  if (hex.startsWith("rgb")) {
    return hex.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  }
  return hex;
}

// Parse SVG path coordinates and draw onto Canvas context
function drawPath(ctx: CanvasRenderingContext2D, pathStr: string) {
  ctx.beginPath();
  const pathRegex = /([MLQZCSmlqzcs])([^MLQZCSmlqzcs]*)/g;
  let match;
  let currentX = 0;
  let currentY = 0;

  while ((match = pathRegex.exec(pathStr)) !== null) {
    const cmd = match[1];
    const argsStr = match[2].trim();
    const args = argsStr
      ? argsStr
          .split(/[\s,]+/)
          .map(Number)
          .filter((n) => !isNaN(n))
      : [];

    switch (cmd) {
      case "M":
        if (args.length >= 2) {
          ctx.moveTo(args[0], args[1]);
          currentX = args[0];
          currentY = args[1];
        }
        break;
      case "m":
        if (args.length >= 2) {
          currentX += args[0];
          currentY += args[1];
          ctx.moveTo(currentX, currentY);
        }
        break;
      case "L":
        if (args.length >= 2) {
          ctx.lineTo(args[0], args[1]);
          currentX = args[0];
          currentY = args[1];
        }
        break;
      case "l":
        if (args.length >= 2) {
          currentX += args[0];
          currentY += args[1];
          ctx.lineTo(currentX, currentY);
        }
        break;
      case "Q":
        if (args.length >= 4) {
          ctx.quadraticCurveTo(args[0], args[1], args[2], args[3]);
          currentX = args[2];
          currentY = args[3];
        }
        break;
      case "q":
        if (args.length >= 4) {
          ctx.quadraticCurveTo(currentX + args[0], currentY + args[1], currentX + args[2], currentY + args[3]);
          currentX += args[2];
          currentY += args[3];
        }
        break;
      case "C":
        if (args.length >= 6) {
          ctx.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
          currentX = args[4];
          currentY = args[5];
        }
        break;
      case "c":
        if (args.length >= 6) {
          ctx.bezierCurveTo(
            currentX + args[0],
            currentY + args[1],
            currentX + args[2],
            currentY + args[3],
            currentX + args[4],
            currentY + args[5]
          );
          currentX += args[4];
          currentY += args[5];
        }
        break;
      case "Z":
      case "z":
        ctx.closePath();
        break;
      default:
        break;
    }
  }
}

interface InteractiveCanvasProps {
  viewBox?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  children: ReactNode;
}

export function InteractiveCanvas({
  viewBox,
  className = "",
  onClick,
  children,
  ...props
}: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [vbX, vbY, vbWidth, vbHeight] = viewBox
    ? viewBox.split(" ").map(Number)
    : [0, 0, 320, 220];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Draw elegant background graph paper grid on the canvas base
      ctx.strokeStyle = "rgba(232, 226, 213, 0.42)"; // Soft Japandi grid lines
      ctx.lineWidth = 0.5;
      const gridSpacing = 20;
      for (let x = 0; x <= width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }

      // 2. Draw high-precision observatory crop marks at the corners of the canvas
      const pad = 10;
      const len = 12;
      ctx.strokeStyle = "#BEB6A5"; // Outline dark
      ctx.lineWidth = 1;
      // Top Left
      ctx.beginPath(); ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad); ctx.stroke();
      // Top Right
      ctx.beginPath(); ctx.moveTo(width - pad, pad + len); ctx.lineTo(width - pad, pad); ctx.lineTo(width - pad - len, pad); ctx.stroke();
      // Bottom Left
      ctx.beginPath(); ctx.moveTo(pad, height - pad - len); ctx.lineTo(pad, height - pad); ctx.lineTo(pad + len, height - pad); ctx.stroke();
      // Bottom Right
      ctx.beginPath(); ctx.moveTo(width - pad, height - pad - len); ctx.lineTo(width - pad, height - pad); ctx.lineTo(width - pad - len, height - pad); ctx.stroke();

      // 3. ASPECT RATIO LOCKING: Scale coordinate system uniformly to fit viewBox (meet rule)
      ctx.save();
      const scale = Math.min(width / vbWidth, height / vbHeight);
      const offsetX = (width - vbWidth * scale) / 2;
      const offsetY = (height - vbHeight * scale) / 2;

      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // 4. CLIPPING: Clip to viewBox to ensure boundaries are perfectly sharp and diagrams don't leak
      ctx.save();
      ctx.beginPath();
      ctx.rect(vbX, vbY, vbWidth, vbHeight);
      ctx.clip();

      const gradients: Record<string, any> = {};

      const renderNode = (node: any) => {
        if (!node) return;
        if (Array.isArray(node)) {
          node.forEach(renderNode);
          return;
        }

        if (node.type === React.Fragment) {
          if (node.props && node.props.children) {
            React.Children.forEach(node.props.children, renderNode);
          }
          return;
        }

        // Evaluate functional components (like ScatterAxes)
        let resolvedNode = node;
        while (resolvedNode && typeof resolvedNode.type === "function") {
          try {
            resolvedNode = resolvedNode.type(resolvedNode.props);
          } catch (e) {
            break;
          }
        }

        if (!resolvedNode || !resolvedNode.type) return;

        const { type, props } = resolvedNode;
        ctx.save();

        if (props.opacity !== undefined) {
          ctx.globalAlpha *= Number(props.opacity);
        }

        if (props.transform) {
          const translateMatch = props.transform.match(/translate\(([^)]+)\)/);
          if (translateMatch) {
            const parts = translateMatch[1].trim().split(/[\s,]+/);
            const tx = Number(parts[0]);
            const ty = parts[1] !== undefined ? Number(parts[1]) : 0;
            ctx.translate(tx, ty);
          }
          const rotateMatch = props.transform.match(/rotate\(([^)]+)\)/);
          if (rotateMatch) {
            const angle = (Number(rotateMatch[1]) * Math.PI) / 180;
            ctx.rotate(angle);
          }
          const scaleMatch = props.transform.match(/scale\(([^)]+)\)/);
          if (scaleMatch) {
            const parts = scaleMatch[1].trim().split(/[\s,]+/);
            const sx = Number(parts[0]);
            const sy = parts[1] !== undefined ? Number(parts[1]) : sx;
            ctx.scale(sx, sy);
          }
        }

        const fill = props.fill || "none";
        const stroke = props.stroke || "none";
        const strokeWidth = props.strokeWidth !== undefined ? Number(props.strokeWidth) : 1;
        const fillOpacity = props.fillOpacity !== undefined ? Number(props.fillOpacity) : 1;
        const strokeOpacity = props.strokeOpacity !== undefined ? Number(props.strokeOpacity) : 1;

        const setStrokeStyles = () => {
          ctx.strokeStyle = stroke === "var(--color-outline-dark)" ? "#BEB6A5" : stroke;
          ctx.lineWidth = strokeWidth;
          ctx.globalAlpha *= strokeOpacity;
          if (props.strokeDasharray) {
            ctx.setLineDash(props.strokeDasharray.split(/[\s,]+/).map(Number));
          } else {
            ctx.setLineDash([]);
          }
        };

        const setFillStyles = () => {
          ctx.globalAlpha *= fillOpacity;
          if (fill.startsWith("url(#")) {
            const id = fill.substring(5, fill.length - 1);
            const grad = gradients[id];
            if (grad) {
              let gx1 = 0, gy1 = 0, gx2 = vbWidth, gy2 = 0;
              if (type === "rect") {
                const rx = Number(props.x || 0);
                const ry = Number(props.y || 0);
                const rw = Number(props.width || vbWidth);
                const rh = Number(props.height || vbHeight);
                gx1 = rx + (Number(grad.x1 || 0) * rw);
                gy1 = ry + (Number(grad.y1 || 0) * rh);
                gx2 = rx + (Number(grad.x2 || 1) * rw);
                gy2 = ry + (Number(grad.y2 || 0) * rh);
              }
              const canvasGrad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
              grad.stops.forEach((s: any) => {
                canvasGrad.addColorStop(s.offset, hexToRgba(s.color, s.opacity));
              });
              ctx.fillStyle = canvasGrad;
            } else {
              ctx.fillStyle = "transparent";
            }
          } else if (fill === "var(--color-surface)") {
            ctx.fillStyle = "#FAF8F2";
          } else {
            ctx.fillStyle = fill;
          }
        };

        if (type === "defs") {
          React.Children.forEach(props.children, (child: any) => {
            if (child && child.type === "linearGradient") {
              const stops: any[] = [];
              React.Children.forEach(child.props.children, (stop: any) => {
                if (stop && stop.type === "stop") {
                  stops.push({
                    offset: parseFloat(stop.props.offset) / (stop.props.offset.endsWith("%") ? 100 : 1),
                    color: stop.props.stopColor || "black",
                    opacity: stop.props.stopOpacity !== undefined ? Number(stop.props.stopOpacity) : 1,
                  });
                }
              });
              gradients[child.props.id] = {
                x1: child.props.x1,
                y1: child.props.y1,
                x2: child.props.x2,
                y2: child.props.y2,
                stops,
              };
            }
          });
        } else if (type === "g") {
          if (props.children) {
            React.Children.forEach(props.children, renderNode);
          }
        } else if (type === "line") {
          ctx.beginPath();
          ctx.moveTo(Number(props.x1), Number(props.y1));
          ctx.lineTo(Number(props.x2), Number(props.y2));
          if (stroke !== "none") {
            setStrokeStyles();
            ctx.stroke();
          }
        } else if (type === "circle") {
          const cx = Number(props.cx);
          const cy = Number(props.cy);
          const r = Number(props.r);

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);

          const isDataPoint = fill === COLORS.cyan || fill === COLORS.pink;
          if (isDataPoint) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = hexToRgba(fill, 0.4);
            ctx.shadowOffsetY = 1.5;
          }

          if (fill !== "none") {
            setFillStyles();
            ctx.fill();
          }

          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";

          if (stroke !== "none") {
            setStrokeStyles();
            ctx.stroke();
          }

          // Premium Concentric Reticle for Circle Data Point
          if (isDataPoint && r >= 3.5) {
            ctx.beginPath();
            ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "#FAF8F2";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx, cy, r + 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(fill, 0.5);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        } else if (type === "rect") {
          const rx = Number(props.x || 0);
          const ry = Number(props.y || 0);
          const rw = Number(props.width || 0);
          const rh = Number(props.height || 0);

          const isDataPoint = (rw <= 12 && rh <= 12) && (fill === COLORS.cyan || fill === COLORS.pink);

          ctx.beginPath();
          if (isDataPoint) {
            // Draw as beautiful rounded squares (Japandi)
            const radius = Math.min(rw, rh) * 0.35;
            ctx.roundRect(rx, ry, rw, rh, radius);
            ctx.shadowBlur = 6;
            ctx.shadowColor = hexToRgba(fill, 0.4);
            ctx.shadowOffsetY = 1.5;
          } else {
            ctx.rect(rx, ry, rw, rh);
          }

          if (fill !== "none") {
            setFillStyles();
            ctx.fill();
          }

          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";

          if (stroke !== "none") {
            setStrokeStyles();
            ctx.stroke();
          }

          // Concentric Reticle for Rect Data Point
          if (isDataPoint) {
            ctx.beginPath();
            ctx.arc(rx + rw / 2, ry + rh / 2, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "#FAF8F2";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(rx + rw / 2, ry + rh / 2, Math.max(rw, rh) / 2 + 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(fill, 0.5);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        } else if (type === "polygon") {
          const coordPairs = props.points.trim().split(/[\s,]+/);
          if (coordPairs.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(Number(coordPairs[0]), Number(coordPairs[1]));
            for (let i = 2; i < coordPairs.length; i += 2) {
              if (coordPairs[i] !== undefined && coordPairs[i+1] !== undefined) {
                ctx.lineTo(Number(coordPairs[i]), Number(coordPairs[i+1]));
              }
            }
            ctx.closePath();

            const isHighlightNode = fill === COLORS.cyan || fill === COLORS.pink || fill === COLORS.yellow;
            if (isHighlightNode) {
              ctx.shadowBlur = 7;
              ctx.shadowColor = fill;
              ctx.shadowOffsetY = 1.5;
            }

            if (fill !== "none") {
              setFillStyles();
              ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";

            if (stroke !== "none") {
              setStrokeStyles();
              ctx.stroke();
            }
          }
        } else if (type === "path") {
          if (props.d) {
            drawPath(ctx, props.d);

            const isDecisionLine = stroke === COLORS.yellow || stroke === COLORS.pink || stroke === COLORS.cyan || stroke === COLORS.muted;
            if (isDecisionLine && strokeWidth >= 2) {
              ctx.shadowBlur = 4;
              ctx.shadowColor = "rgba(30, 27, 22, 0.12)";
              ctx.shadowOffsetY = 1;
            }

            if (fill !== "none") {
              setFillStyles();
              ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";

            if (stroke !== "none") {
              setStrokeStyles();
              ctx.stroke();
            }
          }
        } else if (type === "text") {
          const tx = Number(props.x || 0);
          const ty = Number(props.y || 0);
          const textVal = props.children !== undefined ? String(props.children) : "";

          const fontSz = props.fontSize || "9";
          ctx.font = `${props.fontWeight || "bold"} ${fontSz}px var(--font-mono), var(--font-label), monospace`;
          ctx.textAlign = props.textAnchor === "middle" ? "center" : props.textAnchor === "end" ? "right" : "left";
          ctx.textBaseline = "middle";

          if (fill !== "none") {
            ctx.fillStyle = fill === "var(--color-on-surface)" ? "#1E1B16" : fill;
            ctx.globalAlpha *= fillOpacity;
            ctx.fillText(textVal, tx, ty);
          }
        }

        ctx.restore();
      };

      React.Children.forEach(children, renderNode);
      ctx.restore(); // Restore viewBox clip
      ctx.restore(); // Restore aspect-ratio scale
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [children, vbWidth, vbHeight, vbX, vbY]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onClick={(e) => {
        if (onClick && canvasRef.current) {
          onClick(e);
        }
      }}
      style={{ display: "block" }}
      {...props}
    />
  );
}


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
  // If the direct child is an <svg> tag or an InteractiveCanvas, wrap/normalize it
  let content = children;
  if (React.isValidElement(children) && (children.type === "svg" || children.type === InteractiveCanvas)) {
    const svgProps = children.props as any;
    content = (
      <InteractiveCanvas
        viewBox={svgProps.viewBox}
        className={svgProps.className}
        onClick={svgProps.onClick}
      >
        {svgProps.children}
      </InteractiveCanvas>
    );
  }

  return (
    <div
      className={`relative flex min-h-[400px] w-full items-center justify-center overflow-hidden border border-outline bg-surface ${className}`}
    >
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {content}
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

// -------------------------------------------------------------
// Pedagogical Canvas Drawing Helpers
// -------------------------------------------------------------
export const drawHelper = {
  clear: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
  },

  grid: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "rgba(232, 226, 213, 0.35)"; // Soft Japandi grid line
    ctx.lineWidth = 0.5;
    const spacing = 20;
    for (let x = 0; x <= width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }
  },

  cropMarks: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const pad = 10;
    const len = 12;
    ctx.strokeStyle = "#BEB6A5"; // Outline dark
    ctx.lineWidth = 1;
    // Top Left
    ctx.beginPath(); ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad); ctx.stroke();
    // Top Right
    ctx.beginPath(); ctx.moveTo(width - pad, pad + len); ctx.lineTo(width - pad, pad); ctx.lineTo(width - pad - len, pad); ctx.stroke();
    // Bottom Left
    ctx.beginPath(); ctx.moveTo(pad, height - pad - len); ctx.lineTo(pad, height - pad); ctx.lineTo(pad + len, height - pad); ctx.stroke();
    // Bottom Right
    ctx.beginPath(); ctx.moveTo(width - pad, height - pad - len); ctx.lineTo(width - pad, height - pad); ctx.lineTo(width - pad - len, height - pad); ctx.stroke();
  },

  axes: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding = { left: 40, right: 24, top: 24, bottom: 30 }
  ) => {
    ctx.strokeStyle = "#BEB6A5";
    ctx.lineWidth = 1.2;

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // X Axis
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Labels X, Y
    ctx.font = "bold 9px var(--font-mono), monospace";
    ctx.fillStyle = "#6F6658";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Y label
    ctx.fillText("Y", padding.left - 12, padding.top + 2);
    // X label
    ctx.fillText("X", width - padding.right + 10, height - padding.bottom + 2);
  },

  point: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    style: "circle" | "square" | "triangle" | "star" | "reticle" = "reticle",
    size = 5.5
  ) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Soft colored drop glow
    ctx.shadowBlur = 6;
    ctx.shadowColor = hexToRgba(color, 0.45);
    ctx.shadowOffsetY = 1.5;

    ctx.beginPath();
    if (style === "circle" || style === "reticle") {
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === "square") {
      ctx.roundRect(x - size, y - size, size * 2, size * 2, size * 0.35);
      ctx.fill();
    } else if (style === "triangle") {
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x - size, y + size);
      ctx.closePath();
      ctx.fill();
    } else if (style === "star") {
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size + x, -Math.sin((18 + i * 72) * Math.PI / 180) * size + y);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (size / 2) + x, -Math.sin((54 + i * 72) * Math.PI / 180) * (size / 2) + y);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // Crisp white border
    ctx.strokeStyle = "#FAF8F2";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Concentric outer observatory details
    if (style === "reticle" && size >= 3.5) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "#FAF8F2";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, size + 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(color, 0.4);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();
  },

  line: (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width = 1.5,
    dash: number[] = []
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash.length > 0) {
      ctx.setLineDash(dash);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.restore();
  },

  rect: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    stroke = "none",
    strokeWidth = 1,
    radius = 0
  ) => {
    ctx.save();
    ctx.beginPath();
    if (radius > 0) {
      ctx.roundRect(x, y, w, h, radius);
    } else {
      ctx.rect(x, y, w, h);
    }
    if (fill !== "none") {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke !== "none") {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
    ctx.restore();
  },

  path: (
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number }>,
    color: string,
    width = 1.5,
    fill = "none",
    dash: number[] = []
  ) => {
    if (points.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    if (fill !== "none") {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (color !== "none") {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      if (dash.length > 0) {
        ctx.setLineDash(dash);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
    }
    ctx.restore();
  },

  text: (
    ctx: CanvasRenderingContext2D,
    label: string,
    x: number,
    y: number,
    color = "#1E1B16",
    font = "9px var(--font-mono), monospace",
    align: CanvasTextAlign = "left",
    baseline: CanvasTextBaseline = "middle"
  ) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(label, x, y);
    ctx.restore();
  },
};

interface NativeCanvasPlotProps {
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  onDraw: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    helpers: typeof drawHelper
  ) => void;
  onClick?: (x: number, y: number, rect: DOMRect) => void;
  onMouseMove?: (x: number, y: number, rect: DOMRect) => void;
  onMouseLeave?: () => void;
  className?: string;
}

export function NativeCanvasPlot({
  viewBoxWidth = 320,
  viewBoxHeight = 220,
  onDraw,
  onClick,
  onMouseMove,
  onMouseLeave,
  className = "",
}: NativeCanvasPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleDraw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawHelper.clear(ctx, width, height);

      // Draw background grid and crop marks natively
      drawHelper.grid(ctx, width, height);
      drawHelper.cropMarks(ctx, width, height);

      // Lock Aspect Ratio & Center
      ctx.save();
      const scale = Math.min(width / viewBoxWidth, height / viewBoxHeight);
      const offsetX = (width - viewBoxWidth * scale) / 2;
      const offsetY = (height - viewBoxHeight * scale) / 2;

      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Clip drawing inside coordinate system
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, viewBoxWidth, viewBoxHeight);
      ctx.clip();

      // Trigger draw callback
      onDraw(ctx, viewBoxWidth, viewBoxHeight, drawHelper);

      ctx.restore(); // restore clip
      ctx.restore(); // restore scale
    };

    handleDraw();
    const observer = new ResizeObserver(handleDraw);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [onDraw, viewBoxWidth, viewBoxHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onClick={(e) => {
        if (onClick && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const scale = Math.min(rect.width / viewBoxWidth, rect.height / viewBoxHeight);
          const offsetX = (rect.width - viewBoxWidth * scale) / 2;
          const offsetY = (rect.height - viewBoxHeight * scale) / 2;

          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          const mappedX = (clickX - offsetX) / scale;
          const mappedY = (clickY - offsetY) / scale;

          if (mappedX >= 0 && mappedX <= viewBoxWidth && mappedY >= 0 && mappedY <= viewBoxHeight) {
            onClick(mappedX, mappedY, rect);
          }
        }
      }}
      onMouseMove={(e) => {
        if (onMouseMove && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const scale = Math.min(rect.width / viewBoxWidth, rect.height / viewBoxHeight);
          const offsetX = (rect.width - viewBoxWidth * scale) / 2;
          const offsetY = (rect.height - viewBoxHeight * scale) / 2;

          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          const mappedX = (mouseX - offsetX) / scale;
          const mappedY = (mouseY - offsetY) / scale;

          if (mappedX >= 0 && mappedX <= viewBoxWidth && mappedY >= 0 && mappedY <= viewBoxHeight) {
            onMouseMove(mappedX, mappedY, rect);
          } else {
            if (onMouseLeave) onMouseLeave();
          }
        }
      }}
      onMouseLeave={() => {
        if (onMouseLeave) onMouseLeave();
      }}
      style={{ display: "block" }}
    />
  );
}
