import React from 'react';
import { ComparisonTable as ComparisonTableType } from '@/data/algorithms_content/learningModuleTypes';
import InlineMarkdown from '@/components/ui/InlineMarkdown';

interface ComparisonTableProps {
  comparisons: ComparisonTableType[] | undefined;
}

export default function ComparisonTable({ comparisons }: ComparisonTableProps) {
  if (!comparisons || comparisons.length === 0) return null;

  return (
    <div className="mb-8 space-y-6">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
        How It Compares
      </h3>
      {comparisons.map((table, idx) => (
        <SingleTable key={idx} table={table} />
      ))}
    </div>
  );
}

function SingleTable({ table }: { table: ComparisonTableType }) {
  return (
    <div className="rounded-lg border border-outline bg-surface-container-low overflow-hidden">
      {table.title && (
        <div className="border-b border-outline bg-surface-container px-5 py-4">
          <h4 className="font-headline text-base font-semibold text-on-surface">
            {table.title}
          </h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[15px] sm:text-sm">
          <thead>
            <tr className="border-b border-outline bg-surface-container">
              <th className="px-4 py-3 font-headline text-sm font-semibold text-on-surface-variant">
                Dimension
              </th>
              {table.methods.map((method, i) => (
                <th
                  key={i}
                  className="px-4 py-3 font-headline text-sm font-semibold text-on-surface"
                >
                  {method}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-outline/50 last:border-0 align-top"
              >
                <th
                  scope="row"
                  className="px-4 py-3 font-medium text-on-surface-variant"
                >
                  {row.dimension}
                </th>
                {table.methods.map((_, methodIdx) => (
                  <td key={methodIdx} className="px-4 py-3 text-on-surface-variant">
                    <InlineMarkdown content={row.values[methodIdx] ?? "—"} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.takeaway && (
        <div className="border-t border-outline bg-surface px-5 py-4 accent-left-primary">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Takeaway
          </span>
          <InlineMarkdown
            content={table.takeaway}
            className="mt-1 block text-[15px] leading-relaxed text-on-surface-variant sm:text-sm"
          />
        </div>
      )}
    </div>
  );
}
