"use client";
import React, { useState } from 'react';
import { QuizQuestion, ShortAnswerQuestion } from '@/data/algorithms_content/learningModuleTypes';
import LogicContent from '@/components/ui/LogicContent';
import InlineMarkdown from '@/components/ui/InlineMarkdown';
import { CheckSquare } from 'lucide-react';

interface SelfCheckQuizProps {
  questions: QuizQuestion[] | undefined;
  shortAnswerQuestions?: ShortAnswerQuestion[];
}

export default function SelfCheckQuiz({ questions, shortAnswerQuestions }: SelfCheckQuizProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasMultipleChoice = questions && questions.length > 0;
  const hasShortAnswer = shortAnswerQuestions && shortAnswerQuestions.length > 0;

  if (!hasMultipleChoice && !hasShortAnswer) return null;

  return (
    <div className="overflow-hidden border border-outline bg-surface-container-low">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between border-b border-outline px-6 py-5 sm:px-8 text-left transition-colors hover:bg-surface-container-high focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/12 text-primary">
            <CheckSquare size={18} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
              Self-Check Quiz
            </h2>
            <p className="text-sm text-on-surface-variant/70">
              Check your understanding of the core concepts
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
          {isOpen ? "Hide" : "Show quiz"}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 py-5 sm:px-8 space-y-8">
          {hasMultipleChoice && (
            <div className="space-y-4">
              {hasShortAnswer && <h4 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant">Multiple Choice</h4>}
              {questions.map((question, idx) => (
                <QuestionCard key={`mc-${idx}`} question={question} index={idx} />
              ))}
            </div>
          )}
          
          {hasShortAnswer && (
            <div className="space-y-4">
              {hasMultipleChoice && <h4 className="font-headline text-sm font-bold uppercase tracking-wide text-on-surface-variant border-t border-outline/50 pt-6">Short Answer / Design Prompts</h4>}
              {shortAnswerQuestions.map((question, idx) => (
                <ShortAnswerCard key={`sa-${idx}`} question={question} index={idx + (hasMultipleChoice ? questions.length : 0)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShortAnswerCard({
  question,
  index,
}: {
  question: ShortAnswerQuestion;
  index: number;
}) {
  const [showRubric, setShowRubric] = useState(false);

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
        <p className="mb-4 text-sm text-on-surface-variant">
          Take a moment to formulate your answer. When you're ready, reveal the rubric to self-grade.
        </p>
        <button
          onClick={() => setShowRubric(!showRubric)}
          className="flex items-center gap-2 rounded bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          {showRubric ? "Hide Rubric" : "Reveal Rubric & Expected Answer"}
        </button>

        {showRubric && (
          <div className="mt-4 border-t border-outline/50 pt-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-primary">
              Self-Grading Rubric
            </div>
            <div className="rounded bg-surface p-4 border border-outline">
              <LogicContent content={question.expectedAnswerRubric} size="sm" />
            </div>
          </div>
        )}
      </div>
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
