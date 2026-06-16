"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Braces,
  Briefcase,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Dumbbell,
  FileText,
  Lightbulb,
  List,
  Sigma,
} from "lucide-react";
import type { LearningModule } from "@/data/algorithms_content/learningModuleTypes";
import { getTrackModules } from "@/lib/prerequisiteGraph";
import { getTrackAnchor, learningTracks } from "@/lib/tracks";

const coreSections = [
  { id: "intuition", label: "Intuition", icon: Lightbulb },
  { id: "visualization", label: "Diagram", icon: ChartNoAxesCombined },
  { id: "mathematics", label: "Mathematics", icon: Sigma },
  { id: "depth", label: "In Depth", icon: BookOpen },
  { id: "implementation", label: "Code", icon: Braces },
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
  const currentIndex = modules.findIndex(
    (module) => module.id === currentModule.id,
  );
  const previous = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < modules.length - 1
      ? modules[currentIndex + 1]
      : null;
  const track = learningTracks.find(({ id }) => id === primaryTrack);
  const progress =
    currentIndex >= 0 ? Math.round(((currentIndex + 1) / modules.length) * 100) : 0;
  const sections = [
    ...coreSections.slice(0, 3),
    ...(currentModule.additionalSections?.length
      ? [{ id: "derivations", label: "Derivations", icon: Sigma } as const]
      : []),
    ...(currentModule.workedExamples?.length
      ? [{ id: "examples", label: "Examples", icon: FileText } as const]
      : []),
    ...(currentModule.practiceExercises?.length
      ? [{ id: "practice", label: "Practice", icon: Dumbbell } as const]
      : []),
    ...coreSections.slice(3),
    ...(currentModule.caseStudies?.length
      ? [{ id: "case-studies", label: "Case Studies", icon: Briefcase } as const]
      : []),
    ...(currentModule.quiz?.length
      ? [{ id: "quiz", label: "Quiz", icon: CircleHelp } as const]
      : []),
    ...(currentModule.references?.length
      ? [{ id: "references", label: "References", icon: List } as const]
      : []),
  ];
  const sectionIds = sections.map(({ id }) => id);
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id ?? "",
  );

  useEffect(() => {
    if (!sectionIds.length || typeof IntersectionObserver === "undefined") {
      return;
    }

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (!visibleEntries.length) {
          return;
        }

        const nearestEntry = visibleEntries.reduce((current, next) => {
          const currentDistance = Math.abs(current.boundingClientRect.top);
          const nextDistance = Math.abs(next.boundingClientRect.top);
          return nextDistance < currentDistance ? next : current;
        });

        setActiveSection(nearestEntry.target.id);
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 0.1, 0.25],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sectionIds.join(",")]);

  return (
    <div
      aria-label="Lesson navigation"
      className="z-20 -mx-4 mb-8 border-y border-outline bg-background/95 sm:-mx-8 lg:sticky lg:top-[73px] lg:-mx-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid border-x border-outline bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.8fr)]">
          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                  {track && primaryTrack ? (
                    <Link
                      href={`/#${getTrackAnchor(primaryTrack)}`}
                      className="text-primary hover:underline"
                    >
                      {track.title}
                    </Link>
                  ) : (
                    <span>Curriculum</span>
                  )}
                  <span aria-hidden="true" className="text-outline-dark">
                    /
                  </span>
                  <span>
                    Module {currentIndex + 1} of {modules.length}
                  </span>
                </div>
                <p className="mt-2 truncate font-headline text-lg font-medium text-on-surface sm:text-xl">
                  {currentModule.title}
                </p>
              </div>
              <span className="hidden shrink-0 font-mono text-[12px] text-on-surface-variant sm:block">
                {progress}% complete
              </span>
            </div>

            <div
              className="mt-4 h-px bg-outline"
              role="progressbar"
              aria-label="Track progress"
              aria-valuemin={0}
              aria-valuemax={modules.length}
              aria-valuenow={Math.max(currentIndex + 1, 0)}
            >
              <div
                className="h-px bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 lg:hidden">
              <label htmlFor="lesson-module-select" className="sr-only">
                Choose a module in this track
              </label>
              <select
                id="lesson-module-select"
                value={currentModule.id}
                onChange={(event) =>
                  router.push(`/algorithms/${event.target.value}`)
                }
                className="h-10 min-w-0 flex-1 border border-outline bg-background px-3 text-sm font-medium text-on-surface focus:border-primary focus:outline-none"
              >
                {modules.map((module, index) => (
                  <option key={module.id} value={module.id}>
                    {index + 1}. {module.title}
                  </option>
                ))}
              </select>
              <CompactModuleLink module={previous} direction="previous" />
              <CompactModuleLink module={next} direction="next" />
            </div>
          </div>

          <div className="hidden border-l border-outline lg:grid lg:grid-cols-2">
            <ModuleLink module={previous} direction="previous" />
            <ModuleLink module={next} direction="next" />
          </div>
        </div>

        <nav
          aria-label="Sections in this lesson"
          className="overflow-x-auto border-x border-t border-outline bg-surface-container-low"
        >
          <div className="flex min-w-max items-stretch">
            <span className="hidden items-center border-r border-outline px-5 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant sm:flex">
              On this page
            </span>
            {sections.map(({ id, label, icon: Icon }, index) => (
              <a
                key={id}
                href={`#${id}`}
                aria-label={label}
                aria-current={activeSection === id ? "location" : undefined}
                onClick={() => setActiveSection(id)}
                className={`group inline-flex min-h-11 items-center gap-2 border-r border-outline px-4 font-mono text-[13px] uppercase tracking-[0.06em] transition-colors ${
                  activeSection === id
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-primary-container hover:text-primary"
                }`}
              >
                <span
                  className={
                    activeSection === id
                      ? "text-on-primary/70"
                      : "text-outline-dark group-hover:text-primary"
                  }
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon size={13} strokeWidth={1.7} aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function ModuleLink({
  module,
  direction,
}: {
  module: LearningModule | null;
  direction: "previous" | "next";
}) {
  const isPrevious = direction === "previous";
  const label = isPrevious ? "Previous module" : "Next module";

  if (!module) {
    return (
      <div
        aria-label={`No ${direction} module`}
        className="flex min-h-28 items-center justify-center bg-surface-container-low px-5 font-mono text-[12px] uppercase tracking-[0.08em] text-outline-dark"
      >
        {isPrevious ? "Start of track" : "End of track"}
      </div>
    );
  }

  return (
    <Link
      href={`/algorithms/${module.id}`}
      aria-label={`${label}: ${module.title}`}
      className={`group flex min-h-28 flex-col justify-center gap-2 px-5 transition-colors hover:bg-primary-container ${
        isPrevious
          ? "border-r border-outline text-left"
          : "items-end text-right"
      }`}
    >
      <span className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
        {isPrevious && <ArrowLeft size={13} aria-hidden="true" />}
        {label}
        {!isPrevious && <ArrowRight size={13} aria-hidden="true" />}
      </span>
      <span className="line-clamp-2 font-headline text-sm font-medium leading-5 text-on-surface group-hover:text-primary">
        {module.title}
      </span>
    </Link>
  );
}

function CompactModuleLink({
  module,
  direction,
}: {
  module: LearningModule | null;
  direction: "previous" | "next";
}) {
  const isPrevious = direction === "previous";

  return (
    <Link
      href={module ? `/algorithms/${module.id}` : "#"}
      aria-label={
        module
          ? `${isPrevious ? "Previous" : "Next"} module: ${module.title}`
          : `No ${direction} module`
      }
      aria-disabled={!module}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center border ${
        module
          ? "border-outline bg-background text-on-surface hover:border-primary hover:text-primary"
          : "pointer-events-none border-outline bg-surface-container-high text-outline-dark"
      }`}
    >
      {isPrevious ? (
        <ChevronLeft size={17} aria-hidden="true" />
      ) : (
        <ChevronRight size={17} aria-hidden="true" />
      )}
    </Link>
  );
}
