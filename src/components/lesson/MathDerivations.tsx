"use client";
import React, { useState } from 'react';
import { ContentSection } from '@/data/algorithms_content/learningModuleTypes';
import LogicContent from '@/components/ui/LogicContent';

interface MathDerivationsProps {
  sections: ContentSection[] | undefined;
}

export default function MathDerivations({ sections }: MathDerivationsProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
        Full Derivations
      </h3>
      {sections.map((section, idx) => (
        <DerivationCard key={idx} section={section} />
      ))}
    </div>
  );
}

function DerivationCard({ section }: { section: ContentSection }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-outline bg-surface-container-low overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 border-b border-outline bg-surface-container px-5 py-4 text-left transition-colors hover:bg-surface-container-high"
      >
        <h4 className="font-headline text-base font-semibold text-on-surface">
          {section.heading}
        </h4>
        <span className="shrink-0 rounded bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
          {isOpen ? "Hide" : "Show full derivation"}
        </span>
      </button>

      {isOpen && (
        <div className="p-5">
          <LogicContent content={section.content} />
        </div>
      )}
    </div>
  );
}
