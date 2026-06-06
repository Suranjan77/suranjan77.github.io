import React from 'react';
import { Reference } from '@/data/algorithms_content/learningModuleTypes';

interface ReferenceListProps {
  references: Reference[] | undefined;
}

export default function ReferenceList({ references }: ReferenceListProps) {
  if (!references || references.length === 0) return null;

  const getBadgeClass = (type: Reference['type']) => {
    switch (type) {
      case 'textbook':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'paper':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'tutorial':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'documentation':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'video':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-outline/20 text-on-surface-variant border border-outline/30';
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-outline bg-surface-container-low p-5 sm:p-6">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary mb-4">References & Further Reading</h3>
      <ol className="list-decimal pl-5 space-y-4 text-on-surface-variant">
        {references.map((ref, idx) => (
          <li key={idx} className="pl-1">
            <div className="inline-flex flex-wrap items-baseline gap-2">
              <span className="font-medium text-on-surface text-[15px] sm:text-base">
                {ref.title}
              </span>
              <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getBadgeClass(ref.type)}`}>
                {ref.type}
              </span>
            </div>
            
            {ref.authors && (
              <p className="text-xs text-on-surface-variant/70 mt-1">
                By {ref.authors}
              </p>
            )}

            {ref.description && (
              <p className="text-sm text-on-surface-variant/90 mt-1 leading-relaxed">
                {ref.description}
              </p>
            )}

            {(ref.url || ref.doi) && (
              <div className="mt-2 flex gap-3 text-xs">
                {ref.url && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Resource →
                  </a>
                )}
                {ref.doi && (
                  <span className="text-on-surface-variant/50 font-mono">
                    DOI: {ref.doi}
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
