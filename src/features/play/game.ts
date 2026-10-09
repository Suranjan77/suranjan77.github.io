import { pickNickname } from "./nicknames";
import type { PlayerView } from "./protocol";
import { CHOICE_LABELS, DEFAULT_QUESTION_SECONDS, type QuestionSet } from "./types";

/**
 * The game, as run by the teacher's screen. Every function is pure and takes
 * the clock as an argument, so the rules can be tested without a network or a
 * timer. The state is plain JSON: it can be kept in the teacher's tab across a
 * reload and is discarded when the session ends.
 */

export const MAX_REROLLS = 3;
/** Answers that arrive just after the deadline still count: phones lag. */
export const ANSWER_GRACE_MS = 1000;

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

export type QuestionResult = {
  index: number;
  /** How many chose each option. */
  counts: number[];
  correct: number;
  /** Players in the room when the answer was revealed. */
  players: number;
};

export type GamePhase = "lobby" | "question" | "reveal" | "final";

export type GameState = {
  setId: string;
  phase: GamePhase;
  index: number;
  startedAt: number;
  deadline: number;
  players: Record<string, Player>;
  answers: Record<string, { choice: number; at: number }>;
  results: QuestionResult[];
  nextJoinOrder: number;
};

export function newGame(setId: string): GameState {
  return {
    setId,
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

/** Mark exactly the given players as connected, e.g. after the teacher's screen reconnects. */
export function syncConnected(state: GameState, connected: readonly string[]): GameState {
  const present = new Set(connected);
  const players = Object.fromEntries(
    Object.entries(state.players).map(([pid, player]) => [pid, { ...player, connected: present.has(pid) }]),
  );
  return { ...state, players };
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

export function questionSeconds(set: QuestionSet, index: number): number {
  return set.questions[index]?.seconds ?? DEFAULT_QUESTION_SECONDS;
}

export function startQuestion(state: GameState, set: QuestionSet, index: number, now: number): GameState {
  if (index < 0 || index >= set.questions.length) return state;
  return {
    ...state,
    phase: "question",
    index,
    startedAt: now,
    deadline: now + questionSeconds(set, index) * 1000,
    answers: {},
  };
}

export function submitAnswer(
  state: GameState,
  set: QuestionSet,
  pid: string,
  index: number,
  choice: number,
  now: number,
): GameState {
  const question = set.questions[state.index];
  if (
    state.phase !== "question" ||
    index !== state.index ||
    !question ||
    !state.players[pid] ||
    state.answers[pid] ||
    !Number.isInteger(choice) ||
    choice < 0 ||
    choice >= question.choices.length ||
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
  const question = set.questions[state.index];
  if (state.phase !== "question" || !question) return state;
  const limit = questionSeconds(set, state.index) * 1000;
  const counts = question.choices.map(() => 0);
  let correct = 0;

  const players = Object.fromEntries(
    Object.entries(state.players).map(([pid, player]) => {
      const answer = state.answers[pid];
      if (!answer) return [pid, { ...player, lastGained: 0, lastOutcome: "none" as Outcome }];
      counts[answer.choice] += 1;
      if (answer.choice !== question.answer) return [pid, { ...player, lastGained: 0, lastOutcome: "wrong" as Outcome }];
      correct += 1;
      const gained = pointsFor(answer.at - state.startedAt, limit);
      return [pid, { ...player, score: player.score + gained, lastGained: gained, lastOutcome: "correct" as Outcome }];
    }),
  );

  const result: QuestionResult = { index: state.index, counts, correct, players: Object.keys(players).length };
  return {
    ...state,
    phase: "reveal",
    players,
    results: [...state.results.filter((r) => r.index !== state.index), result],
  };
}

/** After a reveal: the next question, or the final standings after the last one. */
export function advance(state: GameState, set: QuestionSet, now: number): GameState {
  if (state.phase === "lobby") return startQuestion(state, set, 0, now);
  if (state.phase !== "reveal") return state;
  if (state.index + 1 >= set.questions.length) return { ...state, phase: "final", answers: {} };
  return startQuestion(state, set, state.index + 1, now);
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

/** Questions the room found hardest first, for the teacher to pick up after the game. */
export function hardestQuestions(state: GameState, limit = 3): QuestionResult[] {
  const rate = (r: QuestionResult) => (r.players === 0 ? 1 : r.correct / r.players);
  return [...state.results].sort((a, b) => rate(a) - rate(b) || a.index - b.index).slice(0, limit);
}

export function viewFor(state: GameState, set: QuestionSet, pid: string, now: number): PlayerView | null {
  const player = state.players[pid];
  if (!player) return null;
  const name = player.name;
  const total = set.questions.length;
  const question = set.questions[state.index];

  switch (state.phase) {
    case "lobby":
      return { phase: "lobby", name, rerollsLeft: MAX_REROLLS - player.rerolls, setTitle: set.title };
    case "question": {
      const pictures = question.choices.some((c) => c.image);
      return {
        phase: "question",
        name,
        index: state.index,
        total,
        prompt: question.prompt,
        choices: question.choices.map((choice, i) => ({
          label: CHOICE_LABELS[i],
          ...(choice.text !== undefined ? { text: choice.text } : {}),
        })),
        pictures,
        secondsLeft: Math.max(0, Math.ceil((state.deadline - now) / 1000)),
        answered: state.answers[pid]?.choice ?? null,
      };
    }
    case "reveal":
      return {
        phase: "reveal",
        name,
        index: state.index,
        total,
        outcome: player.lastOutcome,
        gained: player.lastGained,
        score: player.score,
        correctLabel: CHOICE_LABELS[question.answer],
      };
    case "final": {
      const standing = topThree(state).find((s) => s.pid === pid);
      return { phase: "final", name, score: player.score, place: standing?.place ?? null };
    }
  }
}
