/** A picture shown on the teacher's screen. `src` is a path under public/. */
export type QuizImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** A choice is either words or a picture; every choice in one question is the same kind. */
export type Choice = { text: string; image?: never } | { image: QuizImage; text?: never };

export type Question = {
  id: string;
  prompt: string;
  /** A picture the question is about, shown above the choices. */
  image?: QuizImage;
  /** Two to four choices, shown as A–D. */
  choices: Choice[];
  /** Index into `choices`. */
  answer: number;
  /** Shown to the room after the answer is revealed: the reason, not just the fact. */
  explanation: string;
  /** Time allowed, in seconds. Defaults to DEFAULT_QUESTION_SECONDS. */
  seconds?: number;
};

export type QuestionSet = {
  id: string;
  /** e.g. "BTEC AAQ IT · Unit 3" */
  course: string;
  /** e.g. "Topic 2 · Page layout" */
  title: string;
  /** Specification reference the set checks, e.g. "A1". */
  spec: string;
  questions: Question[];
};

export const DEFAULT_QUESTION_SECONDS = 20;
export const CHOICE_LABELS = ["A", "B", "C", "D"] as const;
