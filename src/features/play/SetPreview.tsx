"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { courseName, setDetails } from "./SetPicker";
import { courseOfSet } from "./sets";
import { questionSeconds, type Question, type QuestionSet, type QuizImage } from "./types";
import { CHOICE_STYLES, ChoiceMark } from "./ui";

/**
 * Every question in a set, for the teacher to read before choosing it. The
 * setup screen may already be on the projector, so the answers and their
 * reasons stay hidden until the teacher asks for them.
 */
export function SetPreview({ set, chosen, onChoose, onClose }: {
  set: QuestionSet;
  chosen: boolean;
  onChoose: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [answers, setAnswers] = useState(false);
  const course = courseOfSet(set.id);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="preview-heading"
      className="m-auto h-[92dvh] w-[min(64rem,96vw)] max-w-none overflow-hidden rounded-[26px] bg-[color:var(--quiz-paper)] p-0 text-[color:var(--quiz-ink)] shadow-2xl backdrop:bg-[#1E1B16]/60"
    >
      <div className="flex h-full flex-col">
        <header className="flex flex-wrap items-start gap-x-6 gap-y-3 border-b border-[color:var(--quiz-line)] bg-[color:var(--quiz-card)] px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-label text-[color:var(--quiz-muted)]">Preview{course ? ` · ${courseName(course)}` : ""}</p>
            <h2 id="preview-heading" className="mt-1 font-headline text-2xl font-medium">{set.title}</h2>
            <p className="mt-1 text-sm text-[color:var(--quiz-muted)]">{setDetails(set)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={answers}
              onClick={() => setAnswers((shown) => !shown)}
              className={`quiz-button-quiet ${answers ? "border-[color:var(--quiz-ink)] bg-[color:var(--quiz-ink)] text-[#FFFDF8] hover:bg-[#3A342C]" : ""}`}
            >
              {answers ? "Hide answers" : "Show answers"}
            </button>
            {chosen ? (
              <span className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[color:var(--quiz-green)]">✓ Chosen</span>
            ) : (
              <button type="button" onClick={onChoose} className="quiz-button min-h-11 px-5 text-sm">
                Choose this set
              </button>
            )}
            <button type="button" autoFocus onClick={() => dialog.current?.close()} className="quiz-button-quiet">
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-5 text-sm text-[color:var(--quiz-muted)]">
            In the game, every question is asked twice and its choices are shuffled each time, so the letters here are not the ones the room will see.
            {!answers && " Answers are hidden in case this screen is on the projector."}
          </p>
          <ol className="space-y-4">
            {set.questions.map((question, i) => (
              <QuestionCard key={question.id} number={i + 1} question={question} seconds={questionSeconds(question, set)} answers={answers} />
            ))}
          </ol>
        </div>
      </div>
    </dialog>
  );
}

function Picture({ image, className }: { image: QuizImage; className: string }) {
  return <Image src={image.src} alt={image.alt} width={image.width} height={image.height} className={className} sizes="(min-width: 1024px) 40vw, 90vw" unoptimized />;
}

function QuestionCard({ number, question, seconds, answers }: { number: number; question: Question; seconds: number; answers: boolean }) {
  const pictures = question.choices.some((choice) => choice.image);
  return (
    <li className="quiz-card p-5" data-testid="preview-question">
      <p className="font-mono text-[11px] uppercase tracking-label text-[color:var(--quiz-muted)]">Question {number} · {seconds} seconds</p>
      <h3 className="mt-1 text-lg font-medium leading-snug">{question.prompt}</h3>
      {question.image && (
        <div className="mt-3 inline-block rounded-[14px] bg-white p-2 ring-1 ring-[color:var(--quiz-line)]">
          <Picture image={question.image} className="h-auto max-h-72 w-auto" />
        </div>
      )}
      <ol className={`mt-3 grid gap-2 ${pictures ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
        {question.choices.map((choice, i) => {
          const right = answers && i === question.answer;
          return (
            <li
              key={i}
              className={`flex flex-col gap-2 rounded-[14px] p-2.5 ${answers && !right ? "opacity-55" : ""}`}
              style={{ background: CHOICE_STYLES[i].tint, boxShadow: right ? `0 0 0 3px ${CHOICE_STYLES[i].colour}` : undefined }}
            >
              <div className="flex items-center gap-2">
                <ChoiceMark index={i} size={28} />
                <span className="sr-only">{CHOICE_STYLES[i].label}:</span>
                {choice.text !== undefined && <span className="leading-snug">{choice.text}</span>}
                {right && <span className="quiz-pill ml-auto shrink-0 whitespace-nowrap bg-[color:var(--quiz-green)] text-xs text-white">✓ Answer</span>}
              </div>
              {choice.image && <Picture image={choice.image} className="h-auto max-h-40 w-full object-contain" />}
            </li>
          );
        })}
      </ol>
      {answers && <p className="mt-3 rounded-[14px] bg-[color:var(--quiz-green-soft)] px-3 py-2 leading-relaxed text-[#1D3B29]">{question.explanation}</p>}
    </li>
  );
}
