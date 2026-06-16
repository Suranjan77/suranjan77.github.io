"use client";
import React, { useState } from 'react';
import { WorkedExample } from '@/data/algorithms_content/learningModuleTypes';
import LogicContent from '@/components/ui/LogicContent';

interface WorkedExamplesProps {
  examples: WorkedExample[] | undefined;
}

export default function WorkedExamples({ examples }: WorkedExamplesProps) {
  if (!examples || examples.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">Worked Examples</h3>
      {examples.map((ex, idx) => (
        <ExampleCard key={idx} example={ex} />
      ))}
    </div>
  );
}

function ExampleCard({ example }: { example: WorkedExample }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-outline bg-surface-container-low overflow-hidden">
      <div className="border-b border-outline bg-surface-container px-5 py-4">
        <h4 className="font-headline text-base font-semibold text-on-surface">
          {example.title}
        </h4>
      </div>
      <div className="p-5">
        <div className="mb-3 text-on-surface-variant font-medium text-sm uppercase tracking-wider">Problem</div>
        <div className="mb-5 rounded bg-surface p-4 border border-outline">
          <LogicContent content={example.problem} />
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          {isOpen ? "Hide Solution" : "Reveal Solution"}
        </button>

        {isOpen && (
          <div className="mt-5 border-t border-outline/50 pt-5">
            <div className="mb-3 text-primary font-medium text-sm uppercase tracking-wider">Solution</div>
            <div className="rounded bg-surface p-4 border border-outline">
              <LogicContent content={example.solution} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
