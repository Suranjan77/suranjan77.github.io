import React from 'react';
import Link from 'next/link';
import { LearningModule } from '@/data/algorithms_content/learningModuleTypes';
import InlineMarkdown from '@/components/ui/InlineMarkdown';

interface RelatedModulesProps {
  relatedModules: string[] | undefined;
  allModules: LearningModule[];
}

export default function RelatedModules({ relatedModules, allModules }: RelatedModulesProps) {
  if (!relatedModules || relatedModules.length === 0) return null;

  const matched = relatedModules
    .map(id => allModules.find(m => m.id === id))
    .filter((m): m is LearningModule => !!m);

  if (matched.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">Related Topics</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matched.map(module => (
          <Link
            key={module.id}
            href={`/algorithms/${module.id}`}
            className="group block rounded-lg border border-outline bg-surface-container-low p-4 hover:border-primary/50 transition-colors"
          >
            <h4 className="font-headline text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              {module.title}
            </h4>
            <InlineMarkdown
              content={module.shortDescription}
              className="mt-1 block line-clamp-2 text-xs text-on-surface-variant/75"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
