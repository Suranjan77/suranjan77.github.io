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
  /** Time allowed, in seconds, before any extra for pictures. Defaults to the set's time. */
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
  /** Time allowed for questions that do not set their own. Defaults to DEFAULT_QUESTION_SECONDS. */
  seconds?: number;
  questions: Question[];
};

/** Sets that are taught together, e.g. one learning aim or one assignment task, in teaching order. */
export type CourseSection = {
  title: string;
  sets: QuestionSet[];
};

/**
 * One course unit on the teacher's screen. Its sets are loaded only when the
 * teacher opens it, so the teacher's page stays the same size as courses are added.
 */
export type Course = {
  /** Every set id in the course starts with this and a hyphen. */
  id: string;
  level: 1 | 2 | 3;
  /** e.g. "BTEC Level 1 Introductory Diploma in IT" */
  qualification: string;
  /** e.g. "Unit A4 · Researching a topic" */
  unit: string;
  /** What the sets cover, in a line, e.g. "Task 2: presenting research findings". */
  scope: string;
  load: () => Promise<CourseSection[]>;
};

export const DEFAULT_QUESTION_SECONDS = 20;
/** Extra time for a question with a picture, beside it or as its choices: the room has to look before it can answer. */
export const PICTURE_EXTRA_SECONDS = 15;

/** The time a question is given in the game. */
export function questionSeconds(question: Question, set: QuestionSet): number {
  const base = question.seconds ?? set.seconds ?? DEFAULT_QUESTION_SECONDS;
  const pictures = !!question.image || question.choices.some((choice) => choice.image);
  return base + (pictures ? PICTURE_EXTRA_SECONDS : 0);
}

export const CHOICE_LABELS = ["A", "B", "C", "D"] as const;
