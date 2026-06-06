import React from 'react';
import { Misconception } from '@/data/algorithms_content/learningModuleTypes';
import InlineMarkdown from '@/components/ui/InlineMarkdown';

interface MisconceptionsProps {
  misconceptions: Misconception[] | undefined;
}

export default function Misconceptions({ misconceptions }: MisconceptionsProps) {
  if (!misconceptions || misconceptions.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">Common Misconceptions</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {misconceptions.map((mis, idx) => (
          <div key={idx} className="rounded-lg border border-outline bg-surface-container-low accent-left-error p-5">
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-bold text-error uppercase tracking-wider">Misconception</span>
                <InlineMarkdown
                  content={mis.claim}
                  className="mt-1 block text-[15px] font-medium leading-relaxed text-on-surface sm:text-base"
                />
              </div>
              <div className="border-t border-outline/30 pt-3">
                <span className="text-[11px] font-bold text-success uppercase tracking-wider">Correction</span>
                <InlineMarkdown
                  content={mis.correction}
                  className="mt-1 block text-[15px] leading-relaxed text-on-surface-variant sm:text-base"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
