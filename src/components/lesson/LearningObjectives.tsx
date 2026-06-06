import React from 'react';

interface LearningObjectivesProps {
  objectives: string[] | undefined;
}

export default function LearningObjectives({ objectives }: LearningObjectivesProps) {
  if (!objectives || objectives.length === 0) return null;

  return (
    <div className="mb-8 rounded-lg border border-outline bg-surface-container-low p-5 sm:p-6">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary mb-3">Learning Objectives</h3>
      <ol className="list-decimal pl-5 space-y-2 text-on-surface-variant text-[15px] sm:text-base leading-relaxed">
        {objectives.map((obj, i) => (
          <li key={i} className="pl-1">
            {obj}
          </li>
        ))}
      </ol>
    </div>
  );
}
