import Link from "next/link";
import { clsx } from "clsx";
import katex from "katex";

interface AlgorithmCardProps {
  title: string;
  description: string;
  formula: string;
  icon: string;
  slug: string;
  color: "primary" | "secondary" | "tertiary";
}

const colorMap = {
  primary: {
    topBorder: "bg-primary",
    formulaBg: "bg-primary/6",
    formulaBorder: "border-primary/15",
    formulaText: "text-primary/60",
    glow: "group-hover:shadow-[0_4px_24px_-4px_rgba(173,198,255,0.15)]",
    arrow: "text-primary group-hover:translate-x-1",
    dot: "bg-primary",
  },
  secondary: {
    topBorder: "bg-secondary",
    formulaBg: "bg-secondary/6",
    formulaBorder: "border-secondary/15",
    formulaText: "text-secondary/60",
    glow: "group-hover:shadow-[0_4px_24px_-4px_rgba(208,188,255,0.15)]",
    arrow: "text-secondary group-hover:translate-x-1",
    dot: "bg-secondary",
  },
  tertiary: {
    topBorder: "bg-tertiary",
    formulaBg: "bg-tertiary/6",
    formulaBorder: "border-tertiary/15",
    formulaText: "text-tertiary/60",
    glow: "group-hover:shadow-[0_4px_24px_-4px_rgba(123,208,255,0.15)]",
    arrow: "text-tertiary group-hover:translate-x-1",
    dot: "bg-tertiary",
  },
} as const;

export default function AlgorithmCard({
  title,
  description,
  formula,
  slug,
  color,
}: AlgorithmCardProps) {
  const colors = colorMap[color];

  return (
    <Link
      href={`/algorithms/${slug}`}
      className={clsx(
        "group relative flex h-full min-h-[270px] flex-col overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-high transition-all duration-300",
        "hover:bg-surface-container-highest hover:border-outline-variant/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        colors.glow,
      )}
    >
      {/* Category accent top border */}
      <div className={clsx("h-[2px] w-full", colors.topBorder)} />

      <div className="flex h-full flex-col p-6">
        {/* Header with formula chip */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                colors.dot,
              )}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
              Algorithm
            </p>
          </div>

          <div
            className={clsx(
              "max-w-[65%] truncate rounded-full border px-2.5 py-0.5 text-[10px] tracking-wide [&_.katex]:text-[10px]",
              colors.formulaBg,
              colors.formulaBorder,
              colors.formulaText,
            )}
            title={formula}
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(formula, {
                throwOnError: false,
                output: "html",
              }),
            }}
          />
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1">
          <h3 className="mb-3 text-balance font-headline text-[22px] font-bold leading-tight tracking-tight text-on-surface">
            {title}
          </h3>

          <p className="text-sm leading-7 text-on-surface-variant/80 sm:text-[15px]">
            {description}
          </p>
        </div>

        {/* Footer CTA */}
        <div className="mt-6 flex items-center justify-between border-t border-outline-variant/30 pt-4">
          <p className="text-xs text-on-surface-variant/60">
            Intuition · Math · Code
          </p>

          <span
            className={clsx(
              "inline-flex items-center gap-1 text-sm font-semibold transition-transform duration-200",
              colors.arrow,
            )}
          >
            Explore
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
