import React from 'react';
import { CaseStudy as CaseStudyType } from '@/data/algorithms_content/learningModuleTypes';
import LogicContent from '@/components/ui/LogicContent';

interface CaseStudyProps {
  studies: CaseStudyType[] | undefined;
}

export default function CaseStudy({ studies }: CaseStudyProps) {
  if (!studies || studies.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
        Real-World Case Studies
      </h3>
      {studies.map((study, idx) => (
        <article
          key={idx}
          className="rounded-lg border border-outline bg-surface-container-low overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline bg-surface-container px-5 py-4">
            <h4 className="font-headline text-base font-semibold text-on-surface">
              {study.title}
            </h4>
            {study.domain && (
              <span className="shrink-0 rounded-full border border-secondary/30 bg-secondary/12 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-secondary">
                {study.domain}
              </span>
            )}
          </div>

          <div className="space-y-4 p-5">
            <CaseBlock label="Scenario" content={study.scenario} />
            <CaseBlock label="Approach" content={study.approach} />
            <CaseBlock label="Outcome" content={study.outcome} accent />
            {study.source && (
              <p className="border-t border-outline/40 pt-3 text-sm text-on-surface-variant">
                Source:{" "}
                {study.source.url ? (
                  <a
                    href={study.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {study.source.title}
                  </a>
                ) : (
                  <span className="text-on-surface">{study.source.title}</span>
                )}
                {study.source.authors ? ` — ${study.source.authors}` : null}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function CaseBlock({
  label,
  content,
  accent = false,
}: {
  label: string;
  content: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded border border-outline bg-surface p-4 ${accent ? "accent-left-success" : ""}`}
    >
      <div
        className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${accent ? "text-success" : "text-on-surface-variant"}`}
      >
        {label}
      </div>
      <LogicContent content={content} size="sm" />
    </div>
  );
}
