"use client";

import Link from "next/link";
import { clsx } from "clsx";

interface AlgorithmCardProps {
  title: string;
  description: string;
  formula: string;
  icon: string;
  slug: string;
  color: "primary" | "secondary" | "tertiary";
}

export default function AlgorithmCard({
  title,
  description,
  formula,
  icon,
  slug,
  color,
}: AlgorithmCardProps) {
  const colorMap = {
    primary: {
      border: "hover:border-primary/40",
      bg: "bg-primary/10",
      text: "text-primary",
      formulaBg: "bg-primary/5",
      formulaText: "text-primary/70",
    },
    secondary: {
      border: "hover:border-secondary/40",
      bg: "bg-secondary/10",
      text: "text-secondary",
      formulaBg: "bg-secondary/5",
      formulaText: "text-secondary/70",
    },
    tertiary: {
      border: "hover:border-tertiary/40",
      bg: "bg-tertiary/10",
      text: "text-tertiary",
      formulaBg: "bg-tertiary/5",
      formulaText: "text-tertiary/70",
    },
  };

  const colors = colorMap[color];

  return (
    <div className={clsx(
      "glass-card p-8 rounded-xl group transition-all duration-500 relative overflow-hidden",
      colors.border
    )}>
      <div className="absolute inset-0 neural-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className={clsx(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-6 border transition-transform duration-500 group-hover:scale-110",
          colors.bg,
          colors.text,
          color === 'primary' ? 'border-primary/20' : color === 'secondary' ? 'border-secondary/20' : 'border-tertiary/20'
        )}>
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <h4 className="font-headline text-2xl font-semibold text-slate-50 mb-3 tracking-tight">{title}</h4>
        <p className="text-on-surface-variant leading-relaxed mb-8">{description}</p>
        <div className="flex items-center justify-between">
          <span className={clsx(
            "font-mono text-xs px-2 py-1 rounded",
            colors.formulaBg,
            colors.formulaText
          )}>
            {formula}
          </span>
          <Link
            href={`/algorithms/${slug}`}
            className={clsx(
              "flex items-center gap-2 font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all",
              colors.text
            )}
          >
            Learn More
            <span className="material-symbols-outlined">trending_flat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
