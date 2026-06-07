"use client";

import { clsx } from "clsx";

interface AlgorithmCardProps {
  title: string;
  description: string;
  category: string;
  index?: number;
  difficulty?: 1 | 2 | 3;
  active?: boolean;
  onClick?: () => void;
  id?: string;
  controls?: string;
}

export default function AlgorithmCard({
  title,
  description,
  category,
  index,
  difficulty = 1,
  active = false,
  onClick,
  id,
  controls,
}: AlgorithmCardProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-controls={controls}
      className={clsx(
        "group flex h-full min-h-[206px] w-full flex-col border border-outline bg-surface px-5 py-5 text-left transition-colors hover:border-primary focus-visible:outline-primary sm:min-h-[220px] sm:px-6 sm:py-6",
        active && "border-primary bg-surface-container-low",
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <span className="font-mono text-[10px] text-on-surface-variant">
          {String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <span className="max-w-[52%] border border-outline bg-surface-container-high px-2 py-1 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-on-surface sm:max-w-[60%]">
          {category}
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-7">
        <h3 className="font-headline text-lg font-medium leading-snug text-on-surface group-hover:text-primary sm:text-xl">
          {title}
        </h3>

        <p className="mt-3 line-clamp-3 max-w-[34rem] text-sm font-medium leading-6 text-on-surface-variant">
          {description}
        </p>

        <div className="mt-auto pt-6">
          <div className="mb-3 h-px bg-outline" />
          <div className="flex gap-1.5" aria-label={`Difficulty ${difficulty} of 3`}>
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={clsx(
                  "h-1.5 w-1.5",
                  dot <= difficulty ? "bg-on-surface-variant" : "bg-outline",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
