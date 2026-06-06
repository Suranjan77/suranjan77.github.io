"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import type { LearningModule } from "@/data/algorithms_content/learningModuleTypes";
import { getTrackModules } from "@/lib/prerequisiteGraph";

const lessonSections = [
  ["intuition", "Intuition"],
  ["visualization", "Diagram"],
  ["mathematics", "Math"],
  ["examples", "Examples"],
  ["implementation", "Code"],
  ["references", "References"],
] as const;

export default function LessonNavigator({
  currentModule,
  allModules,
}: {
  currentModule: LearningModule;
  allModules: LearningModule[];
}) {
  const router = useRouter();
  const primaryTrack = currentModule.tracks?.[0];
  const modules = primaryTrack ? getTrackModules(primaryTrack) : allModules;
  const currentIndex = modules.findIndex((module) => module.id === currentModule.id);
  const previous = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < modules.length - 1
      ? modules[currentIndex + 1]
      : null;

  return (
    <div
      aria-label="Lesson navigation"
      className="z-20 -mx-4 mb-8 border-y border-outline bg-background/95 px-4 py-3 sm:-mx-8 sm:px-8 lg:sticky lg:top-[73px] lg:-mx-12 lg:px-12"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <List size={16} className="hidden shrink-0 text-primary sm:block" aria-hidden="true" />
          <label htmlFor="lesson-module-select" className="sr-only">
            Choose a module in this track
          </label>
          <select
            id="lesson-module-select"
            value={currentModule.id}
            onChange={(event) => router.push(`/algorithms/${event.target.value}`)}
            className="min-w-0 flex-1 border border-outline bg-surface px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:outline-none xl:w-64"
          >
            {modules.map((module, index) => (
              <option key={module.id} value={module.id}>
                {index + 1}. {module.title}
              </option>
            ))}
          </select>
          <Link
            href={previous ? `/algorithms/${previous.id}` : "#"}
            aria-label={previous ? `Previous module: ${previous.title}` : "No previous module"}
            aria-disabled={!previous}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center border ${
              previous
                ? "border-outline bg-surface text-on-surface hover:border-primary hover:text-primary"
                : "pointer-events-none border-outline bg-surface-container-high text-outline-dark"
            }`}
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </Link>
          <Link
            href={next ? `/algorithms/${next.id}` : "#"}
            aria-label={next ? `Next module: ${next.title}` : "No next module"}
            aria-disabled={!next}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center border ${
              next
                ? "border-outline bg-surface text-on-surface hover:border-primary hover:text-primary"
                : "pointer-events-none border-outline bg-surface-container-high text-outline-dark"
            }`}
          >
            <ChevronRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <nav aria-label="Sections in this lesson" className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-1">
            {lessonSections.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="border border-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:border-outline hover:bg-surface hover:text-primary"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
