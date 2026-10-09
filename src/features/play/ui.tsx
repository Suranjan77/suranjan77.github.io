import qrcode from "qrcode-generator";
import { useMemo } from "react";

/**
 * Each choice has a letter, a shape and a colour, so it can be told apart by
 * any one of them: nobody depends on colour alone.
 */
export const CHOICE_STYLES = [
  { label: "A", shape: "triangle", colour: "#556B4A", tint: "#E4E9DE" },
  { label: "B", shape: "diamond", colour: "#B0573E", tint: "#EFDBD0" },
  { label: "C", shape: "circle", colour: "#7A6332", tint: "#EFE6D2" },
  { label: "D", shape: "square", colour: "#5B4F7A", tint: "#E6E2EF" },
] as const;

export function ChoiceMark({ index, size = 40 }: { index: number; size?: number }) {
  const style = CHOICE_STYLES[index];
  const shape = {
    triangle: <polygon points="20,4 37,34 3,34" />,
    diamond: <polygon points="20,2 38,20 20,38 2,20" />,
    circle: <circle cx="20" cy="20" r="17" />,
    square: <rect x="4" y="4" width="32" height="32" />,
  }[style.shape];
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 40 40" width={size} height={size} fill={style.colour} className="absolute inset-0">
        {shape}
      </svg>
      <span
        className="relative font-body font-semibold text-white"
        style={{ fontSize: size * 0.42, marginTop: style.shape === "triangle" ? size * 0.18 : 0 }}
      >
        {style.label}
      </span>
    </span>
  );
}

/** A QR code drawn as one SVG path. */
export function QrCode({ text, size = 220, label }: { text: string; size?: number; label: string }) {
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
    <svg viewBox={`0 0 ${count} ${count}`} width={size} height={size} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={count} height={count} fill="#FFFFFF" />
      <path d={path} fill="#1E1B16" />
    </svg>
  );
}

export function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}
