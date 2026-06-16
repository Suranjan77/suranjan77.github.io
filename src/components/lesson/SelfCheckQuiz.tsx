"use client";
import React, { useState } from 'react';
import { QuizQuestion } from '@/data/algorithms_content/learningModuleTypes';
import LogicContent from '@/components/ui/LogicContent';
import InlineMarkdown from '@/components/ui/InlineMarkdown';

interface SelfCheckQuizProps {
  questions: QuizQuestion[] | undefined;
}

export default function SelfCheckQuiz({ questions }: SelfCheckQuizProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
        Check Your Understanding
      </h3>
      {questions.map((question, idx) => (
        <QuestionCard key={idx} question={question} index={idx} />
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  index,
}: {
  question: QuizQuestion;
  index: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div className="rounded-lg border border-outline bg-surface-container-low overflow-hidden">
      <div className="border-b border-outline bg-surface-container px-5 py-4">
        <div className="flex gap-3">
          <span className="font-mono text-sm font-bold text-primary">
            Q{index + 1}
          </span>
          <div className="font-headline text-base font-semibold text-on-surface">
            <LogicContent content={question.question} size="sm" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <ul
          className="space-y-2"
          role="radiogroup"
          aria-label={`Question ${index + 1} options`}
        >
          {question.options.map((option, optionIdx) => {
            const isSelected = selected === optionIdx;
            const showState = answered && (isSelected || option.correct);
            let stateClasses =
              "border-outline bg-surface hover:border-primary hover:bg-primary-container";
            if (answered) {
              if (option.correct) {
                stateClasses = "border-success/40 bg-success/10 accent-left-success";
              } else if (isSelected) {
                stateClasses = "border-error/40 bg-error/10 accent-left-error";
              } else {
                stateClasses = "border-outline bg-surface opacity-70";
              }
            }

            return (
              <li key={optionIdx}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={answered}
                  onClick={() => setSelected(optionIdx)}
                  className={`flex w-full items-start gap-3 rounded border px-4 py-3 text-left text-[15px] leading-relaxed text-on-surface transition-colors ${stateClasses} ${answered ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className="mt-px font-mono text-xs font-bold text-on-surface-variant">
                    {String.fromCharCode(65 + optionIdx)}
                  </span>
                  <span className="flex-1">
                    <InlineMarkdown content={option.text} />
                  </span>
                  {showState && (
                    <span
                      className={`shrink-0 text-xs font-bold uppercase tracking-wider ${option.correct ? "text-success" : "text-error"}`}
                    >
                      {option.correct ? "Correct" : "Your pick"}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {answered && (
          <div className="mt-4 border-t border-outline/50 pt-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-primary">
              Explanation
            </div>
            <LogicContent content={question.explanation} size="sm" />
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
