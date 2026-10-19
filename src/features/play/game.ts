import { pickNickname } from "./nicknames";
import type { PlayerView } from "./protocol";
import { CHOICE_LABELS, questionSeconds, type Choice, type Question, type QuestionSet, type QuizImage } from "./types";

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
/**
 * For this long after a question starts, the room waits for every connected
 * phone. After it, only for phones that have shown the question: a phone that
 * locked or lost its connection without the relay noticing never says it has,
 * and must not hold the room until the clock runs out.
 */
export const SEEN_GRACE_MS = 5000;
/** A question's repeat comes at least this many rounds after its first appearance. */
export const MIN_REPEAT_GAP = 3;
/** How many places the room sees. Nobody below them is ever shown a position. */
export const TOP_PLACES = 5;

/*
 * Scoring. Speed points reward knowing it; the bonuses below give everyone a
 * way back to the top without taking points from anyone, so a leader is never
 * punished for leading:
 * - catch-up: a right answer is worth more the further behind the leader you are;
 * - streak: right answers in a row add a little more each time;
 * - learned it: getting a question right on its repeat after missing it the first time;
 * - stars: every few rounds, students outside the top places, more often those
 *   lower down, get a star that doubles their next right answer;
 * - the final stretch: the last rounds count double, so the top is open to the end.
 */
/** A right answer earns up to this share more, in proportion to the gap to the leader. */
export const CATCH_UP_MAX = 0.8;
/** Each right answer in a row after the first adds this… */
export const STREAK_STEP = 50;
/** …up to this. */
export const STREAK_MAX = 200;
/** Points for a repeat answered right after the first time was missed. */
export const LEARNED_BONUS = 300;
/** The last this many rounds count double (fewer in a very short game: never more than a quarter of it). */
export const FINAL_STRETCH_ROUNDS = 3;
/** Stars are first handed out at this round's reveal (counted from 0)… */
export const STAR_FIRST_ROUND = 2;
/** …and then every this many rounds. */
export const STAR_EVERY = 2;
/** About one in this many students outside the top places gets a star… */
export const STAR_PER = 4;
/** …but never more than this many at once. */
export const STAR_MAX = 4;

export type Outcome = "correct" | "wrong" | "none";

/** What a right answer earned, part by part. `total` is (base + catchUp + streak + learned) × multiplier. */
export type Award = {
  base: number;
  catchUp: number;
  streak: number;
  learned: number;
  /** 1, 2 for a star or the final stretch, 4 for both. */
  multiplier: number;
  total: number;
};

export type Player = {
  pid: string;
  name: string;
  score: number;
  connected: boolean;
  joinOrder: number;
  rerolls: number;
  lastGained: number;
  lastOutcome: Outcome;
  lastAward: Award | null;
  /** Right answers in a row, up to now. */
  streak: number;
  bestStreak: number;
  /** Holds a star: the next right answer counts double. */
  star: boolean;
  /** Questions (by index in the set) this student missed the first time they were asked. */
  missed: number[];
  /** Place in the whole room after the last reveal (1 is the leader); 0 before any. */
  rank: number;
  /** Place after the reveal before that. */
  previousRank: number;
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

/** Stars handed out at a round's reveal. */
export type StarDrop = { round: number; pids: string[] };

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
  /** Players whose phone has shown the current round. */
  seen: string[];
  results: RoundResult[];
  stars: StarDrop[];
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
    seen: [],
    results: [],
    stars: [],
    nextJoinOrder: 0,
  };
}

/** A game kept by an older version of the teacher's screen, brought up to date after a reload. */
export function restoreGame(saved: GameState): GameState {
  const players = Object.fromEntries(Object.entries(saved.players ?? {}).map(([pid, p]) => [pid, {
    lastAward: null,
    streak: 0,
    bestStreak: 0,
    star: false,
    missed: [],
    rank: 0,
    previousRank: 0,
    ...(p as Partial<Player>),
  } as Player]));
  return { ...saved, players, seen: saved.seen ?? [], stars: saved.stars ?? [], answers: saved.answers ?? {} };
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
  /** In the final stretch: right answers count double. */
  double: boolean;
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
    seconds: questionSeconds(question, set),
    double: isFinalStretch(state, round),
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
    lastAward: null,
    streak: 0,
    bestStreak: 0,
    star: false,
    missed: [],
    rank: 0,
    previousRank: 0,
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
  return { ...state, players, answers, seen: state.seen.filter((p) => p !== pid) };
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
  return { ...state, phase: "question", index: round, startedAt: now, deadline: now + shown.seconds * 1000, answers: {}, seen: [] };
}

/** A phone says it is showing this round's question. */
export function markSeen(state: GameState, pid: string, round: number): GameState {
  if (state.phase !== "question" || round !== state.index || !state.players[pid] || state.seen.includes(pid)) return state;
  return { ...state, seen: [...state.seen, pid] };
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

/**
 * The students the room is waiting for this round: connected, and their phone
 * has shown the question, or answered it. In the first seconds of a round,
 * every connected student, so a slow phone is not passed over.
 */
export function awaited(state: GameState, now: number): Player[] {
  const connected = Object.values(state.players).filter((p) => p.connected);
  // No phone has said it is showing the question (an older page, say): wait for everyone, as before.
  if (now - state.startedAt < SEEN_GRACE_MS || state.seen.length === 0) return connected;
  return connected.filter((p) => state.answers[p.pid] || state.seen.includes(p.pid));
}

export function everyoneAnswered(state: GameState, now: number): boolean {
  if (state.phase !== "question") return false;
  const waiting = awaited(state, now);
  return waiting.length > 0 && waiting.every((p) => state.answers[p.pid]);
}

/** 500 points for a correct answer at the deadline, rising to 1000 for an instant one. */
export function pointsFor(elapsedMs: number, limitMs: number): number {
  const fraction = Math.min(Math.max(elapsedMs / limitMs, 0), 1);
  return Math.round(1000 - 500 * fraction);
}

export function isFinalStretch(state: GameState, round = state.index): boolean {
  const rounds = Math.min(FINAL_STRETCH_ROUNDS, Math.floor(state.plan.length / 4));
  return round >= state.plan.length - rounds && round < state.plan.length;
}

const tens = (n: number) => Math.round(n / 10) * 10;

/**
 * What a right answer earns. `leader` is the top score before this round, so
 * everyone's catch-up is measured from the same place.
 */
export function awardFor(
  player: Pick<Player, "score" | "streak" | "star" | "missed">,
  { elapsedMs, limitMs, leader, question, repeat, double }: {
    elapsedMs: number;
    limitMs: number;
    leader: number;
    question: number;
    repeat: boolean;
    double: boolean;
  },
): Award {
  const base = pointsFor(elapsedMs, limitMs);
  const behind = leader > 0 ? Math.max(0, leader - player.score) / leader : 0;
  const catchUp = tens(base * CATCH_UP_MAX * behind);
  const streak = Math.min(STREAK_MAX, player.streak * STREAK_STEP);
  const learned = repeat && player.missed.includes(question) ? LEARNED_BONUS : 0;
  const multiplier = (player.star ? 2 : 1) * (double ? 2 : 1);
  return { base, catchUp, streak, learned, multiplier, total: (base + catchUp + streak + learned) * multiplier };
}

/** Everyone in order: highest score first, then whoever joined first. */
function ranked(players: Iterable<Player>): Player[] {
  return [...players].sort((a, b) => b.score - a.score || a.joinOrder - b.joinOrder);
}

export function revealAnswer(state: GameState, set: QuestionSet): GameState {
  const shown = shownQuestion(state, set);
  if (state.phase !== "question" || !shown) return state;
  const limitMs = shown.seconds * 1000;
  const leader = Math.max(0, ...Object.values(state.players).map((p) => p.score));
  const counts = shown.choices.map(() => 0);
  let correct = 0;

  const scored = Object.values(state.players).map((player): Player => {
    const answer = state.answers[player.pid];
    const right = answer?.choice === shown.answer;
    if (answer) counts[answer.choice] += 1;
    const missed = !right && !shown.repeat ? [...player.missed, shown.question] : player.missed;
    if (!right) {
      return { ...player, lastGained: 0, lastOutcome: answer ? "wrong" : "none", lastAward: null, streak: 0, missed };
    }
    correct += 1;
    const award = awardFor(player, { elapsedMs: answer.at - state.startedAt, limitMs, leader, question: shown.question, repeat: shown.repeat, double: shown.double });
    const streak = player.streak + 1;
    return {
      ...player,
      score: player.score + award.total,
      lastGained: award.total,
      lastOutcome: "correct",
      lastAward: award,
      streak,
      bestStreak: Math.max(player.bestStreak, streak),
      star: false,
    };
  });
  const players = Object.fromEntries(
    ranked(scored).map((player, i) => [player.pid, { ...player, previousRank: player.rank || i + 1, rank: i + 1 }]),
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

/** True after the reveals where stars are handed out. */
export function isStarRound(state: GameState, round = state.index): boolean {
  return round >= STAR_FIRST_ROUND && (round - STAR_FIRST_ROUND) % STAR_EVERY === 0 && round + 1 < state.plan.length;
}

/**
 * Stars: at some reveals, a few connected students outside the top places get
 * a star that doubles their next right answer. Lower places are likelier to
 * get one (a student's chance grows with how far down they are), but every
 * place outside the top has a chance. Nobody holds two.
 */
export function awardStars(state: GameState, random: () => number = Math.random): GameState {
  if (state.phase !== "reveal" || !isStarRound(state) || state.stars.some((d) => d.round === state.index)) return state;
  const pool = ranked(Object.values(state.players))
    .map((player, i) => ({ player, place: i + 1 }))
    .filter(({ player, place }) => place > TOP_PLACES && player.connected && !player.star);
  const count = Math.min(STAR_MAX, Math.max(1, Math.round(pool.length / STAR_PER)), pool.length);
  const picked: string[] = [];
  for (let n = 0; n < count; n += 1) {
    const total = pool.reduce((sum, { place }) => sum + (place - TOP_PLACES), 0);
    let roll = random() * total;
    const i = Math.max(0, pool.findIndex(({ place }) => (roll -= place - TOP_PLACES) < 0));
    picked.push(pool[i].player.pid);
    pool.splice(i, 1);
  }
  if (picked.length === 0) return state;
  const players = { ...state.players };
  for (const pid of picked) players[pid] = { ...players[pid], star: true };
  return { ...state, players, stars: [...state.stars, { round: state.index, pids: picked }] };
}

/** The stars handed out at the current round's reveal. */
export function currentStars(state: GameState): string[] {
  return state.phase === "reveal" ? state.stars.find((d) => d.round === state.index)?.pids ?? [] : [];
}

/** Reveal the answer and score it, then hand out any stars. */
export function closeRound(state: GameState, set: QuestionSet, random: () => number = Math.random): GameState {
  return awardStars(revealAnswer(state, set), random);
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
  return { ...state, phase: "final", answers: {}, seen: [] };
}

export type Standing = {
  pid: string;
  name: string;
  score: number;
  place: number;
  /** Places gained since the reveal before; negative if lost. */
  moved: number;
  streak: number;
};

/** The top places, and only them: nobody else's position is ever shown. */
export function topPlaces(state: GameState, limit = TOP_PLACES): Standing[] {
  return ranked(Object.values(state.players).filter((p) => p.score > 0))
    .slice(0, limit)
    .map((p, i) => ({
      pid: p.pid,
      name: p.name,
      score: p.score,
      place: i + 1,
      moved: p.previousRank && p.rank ? p.previousRank - p.rank : 0,
      streak: p.streak,
    }));
}

/**
 * Students outside the top places who climbed the most at this reveal, so the
 * room sees someone coming up. Only how far they climbed is shown, not where
 * they are.
 */
export function risers(state: GameState, limit = 3): { pid: string; name: string; climbed: number }[] {
  const top = new Set(topPlaces(state).map((s) => s.pid));
  return Object.values(state.players)
    .filter((p) => !top.has(p.pid) && p.lastOutcome === "correct" && p.previousRank - p.rank >= 2)
    .map((p) => ({ pid: p.pid, name: p.name, climbed: p.previousRank - p.rank }))
    .sort((a, b) => b.climbed - a.climbed || a.name.localeCompare(b.name))
    .slice(0, limit);
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

/**
 * About how many points the student needs to pass the last of the top places:
 * null if they are in them, 0 if there is a free place any right answer takes.
 */
function behindTop(state: GameState, pid: string): number | null {
  const top = topPlaces(state);
  if (top.some((s) => s.pid === pid)) return null;
  if (top.length < TOP_PLACES) return 0;
  return Math.max(0, top[TOP_PLACES - 1].score - state.players[pid].score) + 10;
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
        double: shown.double,
        star: player.star,
        streak: player.streak,
      };
    case "reveal": {
      if (!shown) return null;
      const place = topPlaces(state).find((s) => s.pid === pid)?.place ?? null;
      return {
        phase: "reveal",
        name,
        index: state.index,
        total,
        outcome: player.lastOutcome,
        award: player.lastAward,
        score: player.score,
        correctLabel: CHOICE_LABELS[shown.answer],
        streak: player.streak,
        place,
        climbed: player.previousRank && player.rank ? player.previousRank - player.rank : 0,
        behind: behindTop(state, pid),
        newStar: currentStars(state).includes(pid),
        star: player.star,
        nextDouble: isFinalStretch(state, state.index + 1),
      };
    }
    case "final": {
      const place = topPlaces(state).find((s) => s.pid === pid)?.place ?? null;
      return { phase: "final", name, score: player.score, place, bestStreak: player.bestStreak };
    }
  }
}
