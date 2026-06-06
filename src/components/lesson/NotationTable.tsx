import React from 'react';
import LogicContent from '@/components/ui/LogicContent';

interface NotationTableProps {
  notationTable: string | undefined;
}

export default function NotationTable({ notationTable }: NotationTableProps) {
  if (!notationTable || notationTable.trim() === '') return null;

  return (
    <div className="mb-8 rounded-lg border border-outline bg-surface-container-low p-5 sm:p-6">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary mb-3">Mathematical Notation</h3>
      <div className="overflow-x-auto">
        <LogicContent content={notationTable} />
      </div>
    </div>
  );
}
