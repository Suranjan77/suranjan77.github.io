"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { courseName, setDetails } from "./SetPicker";
import { courseOfSet } from "./sets";
import { DEFAULT_QUESTION_SECONDS, type Question, type QuestionSet, type QuizImage } from "./types";
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
      className="m-auto h-[92dvh] w-[min(64rem,96vw)] max-w-none overflow-hidden border border-outline-dark bg-background p-0 text-on-surface backdrop:bg-black/55"
    >
      <div className="flex h-full flex-col">
        <header className="flex flex-wrap items-start gap-x-6 gap-y-3 border-b border-outline-dark bg-surface px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">Preview{course ? ` · ${courseName(course)}` : ""}</p>
            <h2 id="preview-heading" className="mt-1 font-headline text-2xl font-medium">{set.title}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{setDetails(set)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={answers}
              onClick={() => setAnswers((shown) => !shown)}
              className={`inline-flex min-h-11 items-center border px-4 text-sm font-medium ${answers ? "border-primary bg-primary text-on-primary" : "border-outline-dark bg-surface hover:bg-surface-container-high"}`}
            >
              {answers ? "Hide answers" : "Show answers"}
            </button>
            {chosen ? (
              <span className="inline-flex min-h-11 items-center px-2 text-sm text-on-surface-variant">✓ Chosen</span>
            ) : (
              <button type="button" onClick={onChoose} className="inline-flex min-h-11 items-center bg-primary px-4 text-sm font-medium text-on-primary hover:bg-on-primary-container">
                Choose this set
              </button>
            )}
            <button type="button" autoFocus onClick={() => dialog.current?.close()} className="inline-flex min-h-11 items-center border border-outline-dark bg-surface px-4 text-sm font-medium hover:bg-surface-container-high">
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-5 text-sm text-on-surface-variant">
            In the game, every question is asked twice and its choices are shuffled each time, so the letters here are not the ones the room will see.
            {!answers && " Answers are hidden in case this screen is on the projector."}
          </p>
          <ol className="space-y-5">
            {set.questions.map((question, i) => (
              <QuestionCard key={question.id} number={i + 1} question={question} seconds={question.seconds ?? set.seconds ?? DEFAULT_QUESTION_SECONDS} answers={answers} />
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
    <li className="border border-outline-dark bg-surface p-4" data-testid="preview-question">
      <p className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">Question {number} · {seconds} seconds</p>
      <h3 className="mt-1 text-lg font-medium leading-snug">{question.prompt}</h3>
      {question.image && (
        <div className="mt-3 inline-block border border-outline bg-white p-2">
          <Picture image={question.image} className="h-auto max-h-72 w-auto" />
        </div>
      )}
      <ol className={`mt-3 grid gap-2 ${pictures ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
        {question.choices.map((choice, i) => {
          const right = answers && i === question.answer;
          return (
            <li
              key={i}
              className={`flex flex-col gap-2 border p-2.5 ${answers && !right ? "opacity-60" : ""}`}
              style={{ borderColor: CHOICE_STYLES[i].colour, background: CHOICE_STYLES[i].tint, borderWidth: right ? 4 : 1.5 }}
            >
              <div className="flex items-center gap-2">
                <ChoiceMark index={i} size={28} />
                <span className="sr-only">{CHOICE_STYLES[i].label}:</span>
                {choice.text !== undefined && <span className="leading-snug">{choice.text}</span>}
                {right && <span className="ml-auto shrink-0 whitespace-nowrap bg-on-surface px-2 py-0.5 text-xs font-semibold text-background">✓ Answer</span>}
              </div>
              {choice.image && <Picture image={choice.image} className="h-auto max-h-40 w-full object-contain" />}
            </li>
          );
        })}
      </ol>
      {answers && <p className="mt-3 border-l-2 border-primary pl-3 leading-relaxed text-on-surface-variant">{question.explanation}</p>}
    </li>
  );
}
