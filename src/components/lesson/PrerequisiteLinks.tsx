import React from 'react';
import Link from 'next/link';
import { LearningModule } from '@/data/algorithms_content/learningModuleTypes';

interface PrerequisiteLinksProps {
  prerequisites: string[] | undefined;
  allModules: LearningModule[];
}

export default function PrerequisiteLinks({ prerequisites, allModules }: PrerequisiteLinksProps) {
  if (!prerequisites || prerequisites.length === 0) return null;

  const prereqModules = prerequisites
    .map(id => allModules.find(m => m.id === id))
    .filter((m): m is LearningModule => !!m);

  if (prereqModules.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-outline bg-surface-container-low p-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">Prerequisites</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {prereqModules.map(module => (
          <Link
            key={module.id}
            href={`/algorithms/${module.id}`}
            className="inline-flex items-center rounded border border-outline bg-surface-container px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            {module.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
