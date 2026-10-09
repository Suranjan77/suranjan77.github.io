import { pickNickname } from "./nicknames";
import type { PlayerView } from "./protocol";
import { CHOICE_LABELS, DEFAULT_QUESTION_SECONDS, type Choice, type Question, type QuestionSet, type QuizImage } from "./types";

/**
 * The game, as run by the teacher's screen. Every function is pure and takes
 * the clock (and, where it shuffles, the random source) as an argument, so the
 * rules can be tested without a network or a timer. The state is plain JSON:
 * it can be kept in the teacher's tab across a reload and is discarded when the
 * session ends.
 *
 * A game plays every question in the set twice. Retrieving an answer a second
 * time, after other questions in between, is what makes it stick; so the
 * repeat comes at least MIN_REPEAT_GAP rounds after the first, at a random
 * point, and its choices are reshuffled so the answer is under a different
 * letter.
 */

export const MAX_REROLLS = 3;
/** Answers that arrive just after the deadline still count: phones lag. */
export const ANSWER_GRACE_MS = 1000;
/** A question's repeat comes at least this many rounds after its first appearance. */
export const MIN_REPEAT_GAP = 3;

export type Outcome = "correct" | "wrong" | "none";

export type Player = {
  pid: string;
  name: string;
  score: number;
  connected: boolean;
  joinOrder: number;
  rerolls: number;
  lastGained: number;
  lastOutcome: Outcome;
};

/** One round of the game: which question, and the order its choices are shown in. */
export type Round = {
  question: number;
  /** order[shown position] = index into the question's choices. */
  order: number[];
  repeat: boolean;
};

export type RoundResult = {
  round: number;
  question: number;
  repeat: boolean;
  /** How many chose each choice, by shown position. */
  counts: number[];
  correct: number;
  /** Players in the room when the answer was revealed. */
  players: number;
};

export type GamePhase = "lobby" | "question" | "reveal" | "final";

export type GameState = {
  setId: string;
  plan: Round[];
  phase: GamePhase;
  /** Index into `plan`; -1 in the lobby. */
  index: number;
  startedAt: number;
  deadline: number;
  players: Record<string, Player>;
  /** Answers to the current round, by shown position. */
  answers: Record<string, { choice: number; at: number }>;
  results: RoundResult[];
  nextJoinOrder: number;
};

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** The order questions are asked in: each twice, repeats at least MIN_REPEAT_GAP rounds after the first. */
export function questionOrder(count: number, random: () => number = Math.random): number[] {
  const spaced = (sequence: number[]) =>
    range(count).every((q) => sequence.lastIndexOf(q) - sequence.indexOf(q) >= MIN_REPEAT_GAP);
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const sequence = shuffled([...range(count), ...range(count)], random);
    if (spaced(sequence)) return sequence;
  }
  // Too few questions to space at random: ask them all, then all again in the same order.
  const once = shuffled(range(count), random);
  return [...once, ...once];
}

/** Choice orders for a question's two rounds; the answer moves to a different letter on the repeat. */
function choiceOrders(question: Question, random: () => number): [number[], number[]] {
  const n = question.choices.length;
  const first = shuffled(range(n), random);
  if (n === 2) return [first, [first[1], first[0]]];
  let second = shuffled(range(n), random);
  while (second.indexOf(question.answer) === first.indexOf(question.answer)) second = shuffled(range(n), random);
  return [first, second];
}

export function buildPlan(set: QuestionSet, random: () => number = Math.random): Round[] {
  const orders = set.questions.map((q) => choiceOrders(q, random));
  const seen = new Set<number>();
  return questionOrder(set.questions.length, random).map((question) => {
    const repeat = seen.has(question);
    seen.add(question);
    return { question, order: orders[question][repeat ? 1 : 0], repeat };
  });
}

export function newGame(set: QuestionSet, random: () => number = Math.random): GameState {
  return {
    setId: set.id,
    plan: buildPlan(set, random),
    phase: "lobby",
    index: -1,
    startedAt: 0,
    deadline: 0,
    players: {},
    answers: {},
    results: [],
    nextJoinOrder: 0,
  };
}

/** A round as the room sees it: the question with its choices in shown order. */
export type ShownQuestion = {
  round: number;
  total: number;
  question: number;
  repeat: boolean;
  prompt: string;
  image?: QuizImage;
  choices: Choice[];
  /** Shown position of the correct choice. */
  answer: number;
  explanation: string;
  seconds: number;
};

export function shownQuestion(state: GameState, set: QuestionSet, round = state.index): ShownQuestion | null {
  const step = state.plan[round];
  const question = step && set.questions[step.question];
  if (!question) return null;
  return {
    round,
    total: state.plan.length,
    question: step.question,
    repeat: step.repeat,
    prompt: question.prompt,
    image: question.image,
    choices: step.order.map((i) => question.choices[i]),
    answer: step.order.indexOf(question.answer),
    explanation: question.explanation,
    seconds: question.seconds ?? DEFAULT_QUESTION_SECONDS,
  };
}

function takenNames(state: GameState, except?: string): Set<string> {
  return new Set(Object.values(state.players).filter((p) => p.pid !== except).map((p) => p.name));
}

/** A phone connected. A returning student keeps their name and score; a new one gets a name. */
export function joinPlayer(state: GameState, pid: string, random: () => number = Math.random): GameState {
  const existing = state.players[pid];
  if (existing) {
    return { ...state, players: { ...state.players, [pid]: { ...existing, connected: true } } };
  }
  const player: Player = {
    pid,
    name: pickNickname(takenNames(state), random),
    score: 0,
    connected: true,
    joinOrder: state.nextJoinOrder,
    rerolls: 0,
    lastGained: 0,
    lastOutcome: "none",
  };
  return { ...state, players: { ...state.players, [pid]: player }, nextJoinOrder: state.nextJoinOrder + 1 };
}

export function leavePlayer(state: GameState, pid: string): GameState {
  const player = state.players[pid];
  if (!player) return state;
  return { ...state, players: { ...state.players, [pid]: { ...player, connected: false } } };
}

/**
 * Mark exactly the given players as connected, e.g. after the teacher's screen
 * reconnects. A phone that joined while the teacher's screen was away is new
 * here, and joins now.
 */
export function syncConnected(state: GameState, connected: readonly string[], random: () => number = Math.random): GameState {
  const present = new Set(connected);
  const players = Object.fromEntries(
    Object.entries(state.players).map(([pid, player]) => [pid, { ...player, connected: present.has(pid) }]),
  );
  return [...present].reduce((next, pid) => (next.players[pid] ? next : joinPlayer(next, pid, random)), { ...state, players });
}

export function removePlayer(state: GameState, pid: string): GameState {
  if (!state.players[pid]) return state;
  const players = { ...state.players };
  const answers = { ...state.answers };
  delete players[pid];
  delete answers[pid];
  return { ...state, players, answers };
}

export function rerollName(state: GameState, pid: string, random: () => number = Math.random): GameState {
  const player = state.players[pid];
  if (!player || state.phase !== "lobby" || player.rerolls >= MAX_REROLLS) return state;
  const name = pickNickname(new Set([...takenNames(state, pid), player.name]), random);
  return { ...state, players: { ...state.players, [pid]: { ...player, name, rerolls: player.rerolls + 1 } } };
}

export function startRound(state: GameState, set: QuestionSet, round: number, now: number): GameState {
  const shown = shownQuestion(state, set, round);
  if (!shown) return state;
  return { ...state, phase: "question", index: round, startedAt: now, deadline: now + shown.seconds * 1000, answers: {} };
}

/** `choice` is the shown position the student tapped. */
export function submitAnswer(
  state: GameState,
  set: QuestionSet,
  pid: string,
  round: number,
  choice: number,
  now: number,
): GameState {
  const shown = shownQuestion(state, set);
  if (
    state.phase !== "question" ||
    round !== state.index ||
    !shown ||
    !state.players[pid] ||
    state.answers[pid] ||
    !Number.isInteger(choice) ||
    choice < 0 ||
    choice >= shown.choices.length ||
    now > state.deadline + ANSWER_GRACE_MS
  ) {
    return state;
  }
  return { ...state, answers: { ...state.answers, [pid]: { choice, at: now } } };
}

export function everyoneAnswered(state: GameState): boolean {
  const connected = Object.values(state.players).filter((p) => p.connected);
  return connected.length > 0 && connected.every((p) => state.answers[p.pid]);
}

/** 500 points for a correct answer at the deadline, rising to 1000 for an instant one. */
export function pointsFor(elapsedMs: number, limitMs: number): number {
  const fraction = Math.min(Math.max(elapsedMs / limitMs, 0), 1);
  return Math.round(1000 - 500 * fraction);
}

export function revealAnswer(state: GameState, set: QuestionSet): GameState {
  const shown = shownQuestion(state, set);
  if (state.phase !== "question" || !shown) return state;
  const limit = shown.seconds * 1000;
  const counts = shown.choices.map(() => 0);
  let correct = 0;

  const players = Object.fromEntries(
    Object.entries(state.players).map(([pid, player]) => {
      const answer = state.answers[pid];
      if (!answer) return [pid, { ...player, lastGained: 0, lastOutcome: "none" as Outcome }];
      counts[answer.choice] += 1;
      if (answer.choice !== shown.answer) return [pid, { ...player, lastGained: 0, lastOutcome: "wrong" as Outcome }];
      correct += 1;
      const gained = pointsFor(answer.at - state.startedAt, limit);
      return [pid, { ...player, score: player.score + gained, lastGained: gained, lastOutcome: "correct" as Outcome }];
    }),
  );

  const result: RoundResult = {
    round: state.index,
    question: shown.question,
    repeat: shown.repeat,
    counts,
    correct,
    players: Object.values(state.players).filter((p) => p.connected || state.answers[p.pid]).length,
  };
  return {
    ...state,
    phase: "reveal",
    players,
    results: [...state.results.filter((r) => r.round !== state.index), result],
  };
}

/** After a reveal: the next round, or the final standings after the last one. */
export function advance(state: GameState, set: QuestionSet, now: number): GameState {
  if (state.phase === "lobby") return startRound(state, set, 0, now);
  if (state.phase !== "reveal") return state;
  if (state.index + 1 >= state.plan.length) return finish(state);
  return startRound(state, set, state.index + 1, now);
}

/** Go to the final standings now, skipping any rounds left. */
export function finish(state: GameState): GameState {
  if (state.phase === "lobby" || state.phase === "final") return state;
  return { ...state, phase: "final", answers: {} };
}

export type Standing = { pid: string; name: string; score: number; place: 1 | 2 | 3 };

/** The top three, and only them: nobody else's position is ever shown. */
export function topThree(state: GameState): Standing[] {
  return Object.values(state.players)
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || a.joinOrder - b.joinOrder)
    .slice(0, 3)
    .map((p, i) => ({ pid: p.pid, name: p.name, score: p.score, place: (i + 1) as 1 | 2 | 3 }));
}

/** How the room did on one question, the first time it was asked and the second. Rates are 0–1, or null if not played. */
export type QuestionSummary = { question: number; first: number | null; second: number | null };

/** Questions the room found hardest first, for the teacher to pick up after the game. */
export function hardestQuestions(state: GameState, limit = 3): QuestionSummary[] {
  const rate = (r: RoundResult | undefined) => (r && r.players > 0 ? r.correct / r.players : null);
  const questions = [...new Set(state.results.map((r) => r.question))];
  return questions
    .map((question) => ({
      question,
      first: rate(state.results.find((r) => r.question === question && !r.repeat)),
      second: rate(state.results.find((r) => r.question === question && r.repeat)),
    }))
    .sort((a, b) => {
      const score = (s: QuestionSummary) => {
        const rates = [s.first, s.second].filter((x): x is number => x !== null);
        return rates.length ? rates.reduce((t, x) => t + x, 0) / rates.length : 1;
      };
      return score(a) - score(b) || a.question - b.question;
    })
    .slice(0, limit);
}

export function viewFor(state: GameState, set: QuestionSet, pid: string, now: number): PlayerView | null {
  const player = state.players[pid];
  if (!player) return null;
  const name = player.name;
  const total = state.plan.length;
  const shown = shownQuestion(state, set);

  switch (state.phase) {
    case "lobby":
      return { phase: "lobby", name, rerollsLeft: MAX_REROLLS - player.rerolls, setTitle: set.title };
    case "question":
      if (!shown) return null;
      return {
        phase: "question",
        name,
        index: state.index,
        total,
        prompt: shown.prompt,
        choices: shown.choices.map((choice, i) => ({
          label: CHOICE_LABELS[i],
          ...(choice.text !== undefined ? { text: choice.text } : {}),
        })),
        pictures: shown.choices.some((c) => c.image),
        secondsLeft: Math.max(0, Math.ceil((state.deadline - now) / 1000)),
        answered: state.answers[pid]?.choice ?? null,
      };
    case "reveal":
      if (!shown) return null;
      return {
        phase: "reveal",
        name,
        index: state.index,
        total,
        outcome: player.lastOutcome,
        gained: player.lastGained,
        score: player.score,
        correctLabel: CHOICE_LABELS[shown.answer],
      };
    case "final": {
      const standing = topThree(state).find((s) => s.pid === pid);
      return { phase: "final", name, score: player.score, place: standing?.place ?? null };
    }
  }
}
