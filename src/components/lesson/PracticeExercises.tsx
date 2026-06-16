"use client";
import React, { useState } from 'react';
import {
  ExerciseDifficulty,
  PracticeExercise,
} from '@/data/algorithms_content/learningModuleTypes';
import LogicContent from '@/components/ui/LogicContent';

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
  if (!exercises || exercises.length === 0) return null;

  const ordered = [...exercises].sort(
    (a, b) =>
      DIFFICULTY_ORDER.indexOf(a.difficulty) -
      DIFFICULTY_ORDER.indexOf(b.difficulty),
  );

  return (
    <div className="mb-8 space-y-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
        Practice Exercises
      </h3>
      <p className="text-[15px] leading-relaxed text-on-surface-variant">
        Work each problem yourself first, then reveal the solution to check your
        approach.
      </p>
      {ordered.map((exercise, idx) => (
        <ExerciseCard key={idx} exercise={exercise} index={idx} />
      ))}
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
  const [hintOpen, setHintOpen] = useState(false);
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
          {exercise.hint && (
            <button
              onClick={() => setHintOpen(!hintOpen)}
              aria-expanded={hintOpen}
              className="flex items-center gap-2 rounded bg-secondary/10 border border-secondary/20 px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/20 transition-colors"
            >
              {hintOpen ? "Hide Hint" : "Show Hint"}
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

        {exercise.hint && hintOpen && (
          <div className="mt-4 rounded border border-secondary/20 bg-secondary/5 p-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-secondary">
              Hint
            </div>
            <LogicContent content={exercise.hint} size="sm" />
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
