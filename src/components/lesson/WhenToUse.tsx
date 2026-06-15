import React from 'react';
import { UsageGuidance } from '@/data/algorithms_content/learningModuleTypes';
import InlineMarkdown from '@/components/ui/InlineMarkdown';

interface WhenToUseProps {
  guidance: UsageGuidance | undefined;
}

export default function WhenToUse({ guidance }: WhenToUseProps) {
  if (!guidance) return null;
  const { useWhen, avoidWhen, rulesOfThumb } = guidance;
  if (!useWhen?.length && !avoidWhen?.length) return null;

  return (
    <div className="mb-8 space-y-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
        When to Use It
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-outline bg-surface-container-low accent-left-success p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-success">
            Reach for this when
          </h4>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-on-surface-variant sm:text-base">
            {useWhen.map((item, i) => (
              <li key={i}>
                <InlineMarkdown content={item} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-outline bg-surface-container-low accent-left-error p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-error">
            Avoid it when
          </h4>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-on-surface-variant sm:text-base">
            {avoidWhen.map((item, i) => (
              <li key={i}>
                <InlineMarkdown content={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {rulesOfThumb && rulesOfThumb.length > 0 && (
        <div className="rounded-lg border border-outline bg-surface-container-low p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
            Rules of thumb
          </h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-on-surface-variant sm:text-base">
            {rulesOfThumb.map((item, i) => (
              <li key={i}>
                <InlineMarkdown content={item} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
