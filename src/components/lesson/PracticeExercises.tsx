"use client";
import React, { useState } from 'react';
import {
  ExerciseDifficulty,
  PracticeExercise,
} from '@/data/algorithms_content/learningModuleTypes';
import LogicContent from '@/components/ui/LogicContent';
import { BrainCircuit } from 'lucide-react';

interface PracticeExercisesProps {
  exercises: PracticeExercise[] | undefined;
}

const DIFFICULTY_ORDER: ExerciseDifficulty[] = ['warm-up', 'core', 'challenge'];

const DIFFICULTY_LABEL: Record<ExerciseDifficulty, string> = {
  'warm-up': 'Warm-up',
  core: 'Core',
  challenge: 'Challenge',
};

const DIFFICULTY_CHIP: Record<ExerciseDifficulty, string> = {
  'warm-up': 'border-success/30 bg-success/12 text-success',
  core: 'border-primary/30 bg-primary/12 text-primary',
  challenge: 'border-error/30 bg-error/12 text-error',
};

export default function PracticeExercises({ exercises }: PracticeExercisesProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!exercises || exercises.length === 0) return null;

  const ordered = [...exercises].sort(
    (a, b) =>
      DIFFICULTY_ORDER.indexOf(a.difficulty) -
      DIFFICULTY_ORDER.indexOf(b.difficulty),
  );

  return (
    <div className="overflow-hidden border border-outline bg-surface-container-low">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between border-b border-outline px-6 py-5 sm:px-8 text-left transition-colors hover:bg-surface-container-high focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/12 text-primary">
            <BrainCircuit size={18} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
              Practice Exercises
            </h2>
            <p className="text-sm text-on-surface-variant/70">
              Work each problem yourself first, then reveal the solution
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
          {isOpen ? "Hide" : "Show exercises"}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 py-5 sm:px-8 space-y-4">
          {ordered.map((exercise, idx) => (
            <ExerciseCard key={idx} exercise={exercise} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
}: {
  exercise: PracticeExercise;
  index: number;
}) {
  const hintsList = exercise.hints || (exercise.hint ? [exercise.hint] : []);
  const [hintIndex, setHintIndex] = useState(-1);
  const [solutionOpen, setSolutionOpen] = useState(false);

  return (
    <div className="rounded-lg border border-outline bg-surface-container-low overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-outline bg-surface-container px-5 py-4">
        <h4 className="font-headline text-base font-semibold text-on-surface">
          Exercise {index + 1}
        </h4>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${DIFFICULTY_CHIP[exercise.difficulty]}`}
        >
          {DIFFICULTY_LABEL[exercise.difficulty]}
        </span>
      </div>

      <div className="p-5">
        <div className="rounded bg-surface p-4 border border-outline">
          <LogicContent content={exercise.prompt} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {hintsList.length > 0 && hintIndex < hintsList.length - 1 && (
            <button
              onClick={() => setHintIndex(hintIndex + 1)}
              className="flex items-center gap-2 rounded bg-secondary/10 border border-secondary/20 px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/20 transition-colors"
            >
              {hintIndex === -1 ? "Show Hint" : `Show Next Hint (${hintIndex + 2}/${hintsList.length})`}
            </button>
          )}
          {hintIndex >= 0 && (
             <button
              onClick={() => setHintIndex(-1)}
              className="flex items-center gap-2 rounded bg-secondary/10 border border-secondary/20 px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/20 transition-colors"
            >
              Hide Hints
            </button>
          )}
          <button
            onClick={() => setSolutionOpen(!solutionOpen)}
            aria-expanded={solutionOpen}
            className="flex items-center gap-2 rounded bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            {solutionOpen ? "Hide Solution" : "Reveal Solution"}
          </button>
        </div>

        {hintIndex >= 0 && (
          <div className="mt-4 space-y-3">
            {hintsList.slice(0, hintIndex + 1).map((h, i) => (
              <div key={i} className="rounded border border-secondary/20 bg-secondary/5 p-4">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Hint {hintsList.length > 1 ? i + 1 : ''}
                </div>
                <LogicContent content={h} size="sm" />
              </div>
            ))}
          </div>
        )}

        {solutionOpen && (
          <div className="mt-4 border-t border-outline/50 pt-4">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-primary">
              Solution
            </div>
            <div className="rounded bg-surface p-4 border border-outline">
              <LogicContent content={exercise.solution} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
