import qrcode from "qrcode-generator";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Each choice has a letter, a shape and a colour, so it can be told apart by
 * any one of them: nobody depends on colour alone. White text on each colour
 * is at least 4.5:1.
 */
export const CHOICE_STYLES = [
  { label: "A", shape: "triangle", colour: "#2F6B4A", tint: "#E1EEE2" },
  { label: "B", shape: "diamond", colour: "#B4442E", tint: "#F7E1D9" },
  { label: "C", shape: "circle", colour: "#8F6614", tint: "#F5EACB" },
  { label: "D", shape: "square", colour: "#5B4A8C", tint: "#E7E2F2" },
] as const;

export function ChoiceMark({ index, size = 40, inverse = false }: { index: number; size?: number; inverse?: boolean }) {
  const style = CHOICE_STYLES[index];
  const shape = {
    triangle: <path d="M20 4.5 Q21.6 4.5 22.4 6 L37 32 Q37.8 34.5 35.2 35 H4.8 Q2.2 34.5 3 32 L17.6 6 Q18.4 4.5 20 4.5 Z" />,
    diamond: <rect x="8" y="8" width="24" height="24" rx="4" transform="rotate(45 20 20)" />,
    circle: <circle cx="20" cy="20" r="17" />,
    square: <rect x="4" y="4" width="32" height="32" rx="6" />,
  }[style.shape];
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 40 40" width={size} height={size} fill={inverse ? "#FFFDF8" : style.colour} className="absolute inset-0">
        {shape}
      </svg>
      <span
        className="relative font-body font-bold"
        style={{ fontSize: size * 0.42, marginTop: style.shape === "triangle" ? size * 0.2 : 0, color: inverse ? style.colour : "#FFFDF8" }}
      >
        {style.label}
      </span>
    </span>
  );
}

/** A soft five-pointed star: the bonus that doubles a student's next right answer. */
export function StarMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 2.6c.5 0 .9.3 1.1.7l2.3 4.7 5.1.8c1 .1 1.4 1.4.7 2.1l-3.7 3.6.9 5.1c.2 1-.9 1.8-1.8 1.3L12 18.5l-4.6 2.4c-.9.5-2-.3-1.8-1.3l.9-5.1-3.7-3.6c-.7-.7-.3-2 .7-2.1l5.1-.8 2.3-4.7c.2-.4.6-.7 1.1-.7Z"
        fill="#F4B740"
        stroke="#B9801A"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M9.2 9.6 10.4 7.4" stroke="#FFF4D6" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** A small flame: right answers in a row. */
export function FlameMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <path d="M12.4 2.5c.6 3-1.2 4.6-2.6 6.2-1.3 1.5-2.8 3.1-2.8 6 0 3.5 2.4 6.3 5.6 6.3 3.4 0 5.9-2.6 5.9-6.2 0-2.4-1.1-4.1-2.1-5.3-.2 1.3-.8 2.3-1.8 2.8.4-3.6-.5-7.6-2.2-9.8Z" fill="#E8693A" stroke="#B5441E" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12.3 12.2c.2 1.6-.9 2.3-1.5 3.2-.4.6-.7 1.2-.7 2 0 1.4 1 2.4 2.1 2.4 1.3 0 2.2-1 2.2-2.4 0-1.9-1.1-3.4-2.1-5.2Z" fill="#F8C24A" />
    </svg>
  );
}

/** A countdown ring with the seconds left in the middle. Turns warm, and beats, in the last five seconds. */
export function TimerRing({ left, limit, size = 76 }: { left: number; limit: number; size?: number }) {
  const seconds = Math.ceil(left / 1000);
  const fraction = limit > 0 ? Math.max(0, Math.min(1, left / limit)) : 0;
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const urgent = seconds <= 5;
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${urgent && seconds > 0 ? "quiz-pulse" : ""}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 40 40" width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r={r} fill="#FFFDF8" stroke="#E9E2D4" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke={urgent ? "#C8553D" : "#2F6B4A"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          style={{ transition: "stroke-dashoffset 250ms linear, stroke 200ms" }}
        />
      </svg>
      <span className="relative font-mono font-medium tabular-nums" style={{ fontSize: size * 0.34 }}>{seconds}</span>
    </span>
  );
}

/** A number that counts up (or down) to its value when it changes. */
export function CountUp({ value, from, duration = 900 }: { value: number; from?: number; duration?: number }) {
  const [shown, setShown] = useState(from ?? value);
  const start = useRef(from ?? value);
  useEffect(() => {
    const begin = start.current;
    if (begin === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      start.current = value;
      return;
    }
    const t0 = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - t0) / duration, 1);
      setShown(Math.round(begin + (value - begin) * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
      else start.current = value;
    });
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <>{shown.toLocaleString("en-GB")}</>;
}

export function WaitingDots() {
  return (
    <span aria-hidden="true" className="inline-flex gap-1">
      <span className="quiz-dot inline-block h-1.5 w-1.5 rounded-[999px] bg-current" />
      <span className="quiz-dot inline-block h-1.5 w-1.5 rounded-[999px] bg-current" />
      <span className="quiz-dot inline-block h-1.5 w-1.5 rounded-[999px] bg-current" />
    </span>
  );
}

/** A QR code drawn as one SVG path. */
export function QrCode({ text, size = 220, label, className }: { text: string; size?: number; label: string; className?: string }) {
  const { path, count } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        if (qr.isDark(row, col)) d += `M${col + 4} ${row + 4}h1v1h-1z`;
      }
    }
    return { path: d, count: n + 8 };
  }, [text]);

  return (
    <svg viewBox={`0 0 ${count} ${count}`} width={size} height={size} role="img" aria-label={label} shapeRendering="crispEdges" className={className}>
      <rect width={count} height={count} fill="#FFFFFF" />
      <path d={path} fill="#1E1B16" />
    </svg>
  );
}

export function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

export function formatPoints(points: number): string {
  return points.toLocaleString("en-GB");
}

/**
 * Shown until the page's JavaScript runs. If it never does (a slow network, or
 * a page cached from before the site was updated), a reload link appears.
 */
export function Loading() {
  return (
    <div>
      <p className="text-on-surface-variant">Loading…</p>
      <p className="quiz-slow mt-6 text-lg">
        Still loading? <a href="" className="text-primary underline underline-offset-4">Reload the page</a>
      </p>
    </div>
  );
}
