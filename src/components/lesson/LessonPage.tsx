"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ChartNoAxesCombined,
  Code2,
  Lightbulb,
  Sigma,
} from "lucide-react";
import { LearningModule } from "@/data/algorithms_content/learningModuleTypes";
import CodeBlock from "@/components/ui/CodeBlock";
import LogicContent from "@/components/ui/LogicContent";
import AlgorithmVisualization from "@/components/ui/AlgorithmVisualization";
import { VisualizationErrorBoundary } from "@/components/ui/visualizations/VisualizationErrorBoundary";
import {
  getAccentClasses,
  getCategoryColor,
  getCategoryLabel,
  getCategoryRoute,
} from "@/lib/algorithmPresentation";

// Lesson section components
import PrerequisiteLinks from "./PrerequisiteLinks";
import LearningObjectives from "./LearningObjectives";
import NotationTable from "./NotationTable";
import WorkedExamples from "./WorkedExamples";
import Misconceptions from "./Misconceptions";
import ReferenceList from "./ReferenceList";
import RelatedModules from "./RelatedModules";
import ModuleNavigation from "./ModuleNavigation";
import MetadataBar from "./MetadataBar";

interface LessonPageProps {
  module: LearningModule;
  allModules: LearningModule[];
}

export default function LessonPage({ module, allModules }: LessonPageProps) {
  const categoryRoute = getCategoryRoute(module.category);
  const categoryLabel = getCategoryLabel(module.category);
  const accent = getAccentClasses(getCategoryColor(module.category));

  return (
    <div className="relative px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
      <section className="relative z-10 mx-auto max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[15px] text-on-surface-variant/70 sm:mb-8 sm:text-sm">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="text-outline-variant">›</span>
          <Link href={categoryRoute} className="transition-colors hover:text-primary">
            {categoryLabel}
          </Link>
          <span className="text-outline-variant">›</span>
          <span className="font-medium text-on-surface-variant">
            {module.title}
          </span>
        </nav>

        {/* Header Jumbotron */}
        <div className="mb-8 border border-outline bg-surface-container-low p-5 sm:mb-10 sm:p-8 lg:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center px-4 py-2 text-sm font-medium tracking-wide sm:py-1.5 sm:text-xs ${accent.badge}`}>
              {categoryLabel}
            </div>
          </div>

          <h1 className="mb-5 max-w-4xl text-balance font-headline text-[2.35rem] font-semibold leading-tight tracking-normal text-on-surface sm:text-5xl lg:text-6xl">
            {module.title}
          </h1>
          
          <MetadataBar 
            difficulty={module.difficulty}
            estimatedMinutes={module.estimatedMinutes}
            tracks={module.tracks}
          />
          
          <p className="mt-4 text-on-surface-variant text-[17px] sm:text-lg leading-relaxed max-w-4xl">
            {module.shortDescription}
          </p>
        </div>

        {/* Prerequisites and Learning Objectives */}
        <PrerequisiteLinks prerequisites={module.prerequisites} allModules={allModules} />
        <LearningObjectives objectives={module.learningObjectives} />
      </section>

      {/* Stacked content sections */}
      <section className="relative z-10 mx-auto max-w-6xl space-y-8">
        
        {/* Intuition Section */}
        <div className="overflow-hidden border border-outline bg-surface-container-low">
          <div className="border-b border-outline px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-tertiary/30 bg-tertiary/12 text-tertiary">
                <Lightbulb size={18} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  Intuition
                </h2>
                <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                  How to think conceptually about this topic
                </p>
              </div>
            </div>
            <div className="mt-4">
              <LogicContent content={module.intuition} />
            </div>
          </div>
        </div>

        {/* Notation Table Section */}
        <NotationTable notationTable={module.notationTable} />

        {/* Mathematics Section */}
        <div className="overflow-hidden border border-outline bg-surface-container-low">
          <div className="border-b border-outline px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/12 text-primary">
                <Sigma size={18} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  The Mathematics
                </h2>
                <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                  Formal formulations, equations, and derivations
                </p>
              </div>
            </div>
            <div className="mt-4">
              <LogicContent content={module.mathematics} />
            </div>
          </div>
        </div>

        {/* Worked Examples Section */}
        <WorkedExamples examples={module.workedExamples} />

        {module.id === "backpropagation" && (
          <aside className="grid gap-px border border-outline bg-border sm:grid-cols-[1fr_auto]">
            <div className="bg-primary p-6 text-on-primary sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-primary/70">
                Companion laboratory
              </p>
              <h2 className="mt-3 font-headline text-2xl font-medium">
                Put reverse-mode autodiff into practice.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-on-primary/80">
                Build scalar computation graphs, step through the backward
                pass, inspect local derivatives, and verify gradients with
                finite differences in GradForge.
              </p>
            </div>
            <div className="flex items-center bg-surface p-6 sm:p-8">
              <Link
                href="/gradforge"
                className="w-full border border-outline-dark bg-surface px-5 py-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface transition-colors hover:border-primary hover:text-primary"
              >
                Open GradForge →
              </Link>
            </div>
          </aside>
        )}

        {/* In-Depth Description Section */}
        <div className="overflow-hidden border border-outline bg-surface-container-low">
          <div className="border-b border-outline px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-secondary/30 bg-secondary/12 text-secondary">
                <BookOpen size={18} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  In Depth
                </h2>
                <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                  Detailed explanations, contexts, and details
                </p>
              </div>
            </div>
            <div className="mt-4">
              <LogicContent content={module.fullDescription} />
            </div>
          </div>
        </div>

        {/* Implementation / Code Section */}
        <div className="overflow-hidden border border-outline bg-surface-container-low">
          <div className="border-b border-outline px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-outline-variant/30 bg-outline-variant/10 text-on-surface">
                <Code2 size={18} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  Implementation
                </h2>
                <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                  Reference code implementation
                </p>
              </div>
            </div>
            <div className="mt-4">
              <CodeBlock code={module.codeSnippet} />
            </div>
          </div>
        </div>

        {/* Interactive Visualization Section */}
        <div className="overflow-hidden border border-outline bg-surface-container-low">
          <div className="border-b border-outline px-6 py-5 sm:px-8 bg-surface-container">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/12 text-primary">
                <ChartNoAxesCombined size={18} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  Interactive Diagram
                </h2>
                <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                  Interact with parameters to build hands-on mental models
                </p>
              </div>
            </div>
          </div>
          <div className="p-2 sm:p-6 bg-surface-container-low">
            <div className="min-h-[380px]">
              <VisualizationErrorBoundary algorithmId={module.id}>
                <AlgorithmVisualization algorithmId={module.id} />
              </VisualizationErrorBoundary>
            </div>
          </div>
        </div>

        {/* Pros and Cons (Strengths and Limitations) Section */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-outline bg-surface-container-low accent-left-success p-5">
            <h3 className="text-sm font-semibold tracking-wide text-success uppercase">
              Strengths & Advantages
            </h3>
            <ul className="mt-4 list-disc pl-5 space-y-2 text-on-surface-variant text-sm sm:text-base leading-relaxed">
              {module.pros.map((pro, i) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-outline bg-surface-container-low accent-left-error p-5">
            <h3 className="text-sm font-semibold tracking-wide text-error uppercase">
              Limitations & Drawbacks
            </h3>
            <ul className="mt-4 list-disc pl-5 space-y-2 text-on-surface-variant text-sm sm:text-base leading-relaxed">
              {module.cons.map((con, i) => (
                <li key={i}>{con}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Misconceptions */}
        <Misconceptions misconceptions={module.misconceptions} />

        {/* References */}
        <ReferenceList references={module.references} />

        {/* Related Modules */}
        <RelatedModules relatedModules={module.relatedModules} allModules={allModules} />

        {/* Module Navigation links */}
        <ModuleNavigation currentModule={module} allModules={allModules} />

      </section>
    </div>
  );
}
