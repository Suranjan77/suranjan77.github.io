import React from 'react';
import Link from 'next/link';
import { LearningModule } from '@/data/algorithms_content/learningModuleTypes';
import { getTrackModules } from '@/lib/prerequisiteGraph';

interface ModuleNavigationProps {
  currentModule: LearningModule;
  allModules: LearningModule[];
}

export default function ModuleNavigation({ currentModule, allModules }: ModuleNavigationProps) {
  const primaryTrack = currentModule.tracks?.[0];
  const navigationList = primaryTrack ? getTrackModules(primaryTrack) : allModules;

  const currentIndex = navigationList.findIndex(m => m.id === currentModule.id);
  let prevModule: LearningModule | null = null;
  let nextModule: LearningModule | null = null;

  if (currentIndex !== -1) {
    prevModule = currentIndex > 0 ? navigationList[currentIndex - 1] : null;
    nextModule = currentIndex < navigationList.length - 1 ? navigationList[currentIndex + 1] : null;
  } else {
    // Fallback if not found in track modules list
    const fallbackIndex = allModules.findIndex(m => m.id === currentModule.id);
    if (fallbackIndex !== -1) {
      prevModule = fallbackIndex > 0 ? allModules[fallbackIndex - 1] : null;
      nextModule = fallbackIndex < allModules.length - 1 ? allModules[fallbackIndex + 1] : null;
    }
  }

  return (
    <div className="mt-12 flex flex-col sm:flex-row justify-between gap-4 border-t border-outline/50 pt-8">
      {prevModule ? (
        <Link
          href={`/algorithms/${prevModule.id}`}
          className="flex-1 rounded-lg border border-outline bg-surface-container-low p-4 text-left transition-colors hover:border-primary/50 group"
        >
          <div className="text-xs text-on-surface-variant/70">← Previous Topic</div>
          <div className="mt-1 font-headline text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
            {prevModule.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1 hidden sm:block" />
      )}

      {nextModule ? (
        <Link
          href={`/algorithms/${nextModule.id}`}
          className="flex-1 rounded-lg border border-outline bg-surface-container-low p-4 text-right transition-colors hover:border-primary/50 group"
        >
          <div className="text-xs text-on-surface-variant/70">Next Topic →</div>
          <div className="mt-1 font-headline text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
            {nextModule.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1 hidden sm:block" />
      )}
    </div>
  );
}
