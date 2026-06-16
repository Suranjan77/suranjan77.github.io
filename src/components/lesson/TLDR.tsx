import React from 'react';
import InlineMarkdown from '@/components/ui/InlineMarkdown';

interface TLDRProps {
  points: string[] | undefined;
}

export default function TLDR({ points }: TLDRProps) {
  if (!points || points.length === 0) return null;

  return (
    <div className="mb-8 rounded-lg border border-outline bg-surface-container-low accent-left-primary p-5 sm:p-6">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary mb-3">
        TL;DR
      </h3>
      <ul className="list-disc pl-5 space-y-2 text-on-surface-variant text-[15px] sm:text-base leading-relaxed">
        {points.map((point, i) => (
          <li key={i} className="pl-1">
            <InlineMarkdown content={point} />
          </li>
        ))}
      </ul>
    </div>
  );
}
