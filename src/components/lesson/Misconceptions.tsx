import React from 'react';
import { Misconception } from '@/data/algorithms_content/learningModuleTypes';

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
                <p className="mt-1 text-on-surface font-medium leading-relaxed text-[15px] sm:text-base">{mis.claim}</p>
              </div>
              <div className="border-t border-outline/30 pt-3">
                <span className="text-[11px] font-bold text-success uppercase tracking-wider">Correction</span>
                <p className="mt-1 text-on-surface-variant leading-relaxed text-[15px] sm:text-base">{mis.correction}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
