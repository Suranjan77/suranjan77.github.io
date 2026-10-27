import { describe, expect, it } from "vitest";
import {
  ANSWER_GRACE_MS,
  CATCH_UP_MAX,
  LEARNED_BONUS,
  MAX_REROLLS,
  MIN_REPEAT_GAP,
  SEEN_GRACE_MS,
  STAR_MAX,
  STREAK_MAX,
  STREAK_STEP,
  TOP_PLACES,
  advance,
  awardFor,
  awardStars,
  awaited,
  buildPlan,
  closeRound,
  currentStars,
  everyoneAnswered,
  finish,
  hardestQuestions,
  isStarRound,
  joinPlayer,
  leavePlayer,
  markSeen,
  newGame,
  pointsFor,
  questionOrder,
  removePlayer,
  rerollName,
  revealAnswer,
  risers,
  shownQuestion,
  submitAnswer,
  syncConnected,
  topPlaces,
  viewFor,
  type GameState,
  type Player,
  type Round,
} from "./game";
import { DEFAULT_QUESTION_SECONDS, PICTURE_EXTRA_SECONDS, questionSeconds, type Question, type QuestionSet } from "./types";

const set: QuestionSet = {
  id: "test",
  course: "Course",
  title: "Topic",
  spec: "A1",
  questions: [
    { id: "q1", prompt: "One?", choices: [{ text: "a" }, { text: "b" }], answer: 1, explanation: "Because.", seconds: 10 },
    { id: "q2", prompt: "Two?", choices: [{ text: "a" }, { text: "b" }, { text: "c" }], answer: 0, explanation: "Because.", seconds: 10 },
  ],
};

/** Choices in authored order, so a test knows which shown position is correct. */
const FIXED_PLAN: Round[] = [
  { question: 0, order: [0, 1], repeat: false },
  { question: 1, order: [0, 1, 2], repeat: false },
  { question: 0, order: [1, 0], repeat: true },
  { question: 1, order: [2, 0, 1], repeat: true },
];

function seeded(seed = 1) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
}

function lobbyWith(...pids: string[]): GameState {
  const random = seeded();
  const start: GameState = { ...newGame(set, random), plan: FIXED_PLAN };
  return pids.reduce((state, pid) => joinPlayer(state, pid, random), start);
}

describe("the order questions come in", () => {
  it("asks every question once, and the ones asked twice again at least MIN_REPEAT_GAP rounds later", () => {
    for (const count of [8, 12, 16]) {
      const twice = [0, 3, count - 2, count - 1];
      for (let seed = 1; seed <= 200; seed += 1) {
        const order = questionOrder(count, twice, seeded(seed));
        expect(order).toHaveLength(count + twice.length);
        for (let q = 0; q < count; q += 1) {
          expect(order.filter((x) => x === q)).toHaveLength(twice.includes(q) ? 2 : 1);
          if (twice.includes(q)) expect(order.lastIndexOf(q) - order.indexOf(q)).toBeGreaterThanOrEqual(MIN_REPEAT_GAP);
        }
      }
    }
  });

  it("asks nothing twice when no question says so", () => {
    expect([...questionOrder(10, [], seeded())].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("varies from game to game", () => {
    const orders = new Set(Array.from({ length: 20 }, (_, seed) => questionOrder(8, [1, 5], seeded(seed + 1)).join(",")));
    expect(orders.size).toBeGreaterThan(15);
  });

  it("still spaces repeats when there are too few questions to shuffle", () => {
    const order = questionOrder(3, [0, 1, 2], seeded());
    expect(order.slice(0, 3)).toEqual(order.slice(3));
  });

  it("reshuffles the choices on the repeat so the answer is under a different letter", () => {
    const bigger: QuestionSet = {
      ...set,
      questions: Array.from({ length: 10 }, (_, i) => ({
        id: `q${i}`,
        prompt: `Q${i}?`,
        choices: [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }].slice(0, 2 + (i % 3)),
        answer: i % 2,
        explanation: "Because.",
        ...(i < 8 ? { askTwice: true as const } : {}),
      })),
    };
    for (let seed = 1; seed <= 50; seed += 1) {
      const plan = buildPlan(bigger, seeded(seed));
      expect(plan).toHaveLength(18);
      const state: GameState = { ...newGame(bigger), plan };
      bigger.questions.forEach((question, q) => {
        const rounds = plan.map((round, i) => ({ round, i })).filter(({ round }) => round.question === q);
        expect(rounds).toHaveLength(question.askTwice ? 2 : 1);
        const [first, second] = rounds;
        expect(first.round.repeat).toBe(false);
        expect([...first.round.order].sort()).toEqual(question.choices.map((_, i) => i));
        if (!second) return;
        expect(second.round.repeat).toBe(true);
        const a = shownQuestion(state, bigger, first.i)!;
        const b = shownQuestion(state, bigger, second.i)!;
        expect(a.choices[a.answer]).toBe(question.choices[question.answer]);
        expect(b.choices[b.answer]).toBe(question.choices[question.answer]);
        expect(b.answer).not.toBe(a.answer);
      });
    }
  });
});

describe("joining", () => {
  it("gives every student a different name and keeps it when they reconnect", () => {
    let state = lobbyWith("p1", "p2", "p3");
    const names = Object.values(state.players).map((p) => p.name);
    expect(new Set(names).size).toBe(3);

    const name = state.players.p2.name;
    state = leavePlayer(state, "p2");
    expect(state.players.p2.connected).toBe(false);
    state = joinPlayer(state, "p2");
    expect(state.players.p2).toMatchObject({ name, connected: true });
  });

  it("limits rerolls and only allows them in the lobby", () => {
    let state = lobbyWith("p1");
    const first = state.players.p1.name;
    state = rerollName(state, "p1");
    expect(state.players.p1.name).not.toBe(first);
    for (let i = 0; i < 5; i += 1) state = rerollName(state, "p1");
    expect(state.players.p1.rerolls).toBe(MAX_REROLLS);

    const started = advance(lobbyWith("p2"), set, 0);
    expect(rerollName(started, "p2")).toBe(started);
  });

  it("marks exactly the listed students connected after the teacher reconnects", () => {
    const state = syncConnected(lobbyWith("p1", "p2"), ["p2"]);
    expect(state.players.p1.connected).toBe(false);
    expect(state.players.p2.connected).toBe(true);
  });

  it("gives a name to a student who joined while the teacher's screen was away", () => {
    const state = syncConnected(lobbyWith("p1"), ["p1", "p2"], seeded(2));
    expect(state.players.p2).toMatchObject({ connected: true, score: 0, joinOrder: 1 });
    expect(state.players.p2.name).not.toBe(state.players.p1.name);
  });
});

describe("answering", () => {
  it("accepts one answer per student, for the current round, until just after the deadline", () => {
    let state = advance(lobbyWith("p1", "p2", "p3"), set, 1000);
    state = submitAnswer(state, set, "p1", 0, 1, 2000);
    expect(state.answers.p1).toEqual({ choice: 1, at: 2000 });

    expect(submitAnswer(state, set, "p1", 0, 0, 2500)).toBe(state);
    expect(submitAnswer(state, set, "p2", 1, 0, 2500)).toBe(state);
    expect(submitAnswer(state, set, "p2", 0, 5, 2500)).toBe(state);
    expect(submitAnswer(state, set, "ghost", 0, 0, 2500)).toBe(state);
    expect(submitAnswer(state, set, "p2", 0, 0, state.deadline + ANSWER_GRACE_MS + 1)).toBe(state);
    expect(submitAnswer(state, set, "p3", 0, 0, state.deadline + ANSWER_GRACE_MS).answers.p3).toBeDefined();
  });

  it("waits only for connected students", () => {
    let state = advance(lobbyWith("p1", "p2"), set, 0);
    state = submitAnswer(state, set, "p1", 0, 1, 100);
    expect(everyoneAnswered(state, 200)).toBe(false);
    expect(everyoneAnswered(leavePlayer(state, "p2"), 200)).toBe(true);
  });

  it("stops waiting for a phone that never showed the question, once the first seconds are over", () => {
    let state = advance(lobbyWith("p1", "p2", "p3"), set, 0);
    state = markSeen(state, "p1", 0);
    state = markSeen(state, "p2", 0);
    state = submitAnswer(state, set, "p1", 0, 1, 1000);
    state = submitAnswer(state, set, "p2", 0, 0, 1500);
    // p3's phone went to sleep without the relay noticing: still "connected", but silent.
    expect(state.players.p3.connected).toBe(true);
    expect(everyoneAnswered(state, SEEN_GRACE_MS - 1)).toBe(false);
    expect(awaited(state, SEEN_GRACE_MS).map((p) => p.pid)).toEqual(["p1", "p2"]);
    expect(everyoneAnswered(state, SEEN_GRACE_MS)).toBe(true);
  });

  it("waits again for a phone that wakes up and shows the question", () => {
    let state = advance(lobbyWith("p1", "p2"), set, 0);
    state = submitAnswer(markSeen(state, "p1", 0), set, "p1", 0, 1, 1000);
    state = markSeen(state, "p2", 0);
    expect(everyoneAnswered(state, SEEN_GRACE_MS + 1000)).toBe(false);
  });

  it("waits for everyone as before when no phone has said it is showing the question", () => {
    let state = advance(lobbyWith("p1", "p2"), set, 0);
    expect(everyoneAnswered(state, SEEN_GRACE_MS + 1000)).toBe(false);
    state = submitAnswer(state, set, "p1", 0, 1, 1000);
    expect(everyoneAnswered(state, SEEN_GRACE_MS + 1000)).toBe(false);
  });

  it("only counts a phone as having seen the current round", () => {
    const state = advance(lobbyWith("p1"), set, 0);
    expect(markSeen(state, "p1", 1)).toBe(state);
    expect(markSeen(state, "ghost", 0)).toBe(state);
    const seen = markSeen(state, "p1", 0);
    expect(seen.seen).toEqual(["p1"]);
    expect(markSeen(seen, "p1", 0)).toBe(seen);
    expect(advance(revealAnswer(seen, set), set, 20_000).seen).toEqual([]);
  });
});

describe("scoring", () => {
  it("gives 1000 for an instant correct answer and 500 at the deadline", () => {
    expect(pointsFor(0, 10_000)).toBe(1000);
    expect(pointsFor(5_000, 10_000)).toBe(750);
    expect(pointsFor(10_000, 10_000)).toBe(500);
    expect(pointsFor(11_000, 10_000)).toBe(500);
  });

  it("scores correct answers only and records how the room answered", () => {
    let state = advance(lobbyWith("p1", "p2", "p3"), set, 0);
    state = submitAnswer(state, set, "p1", 0, 1, 0);
    state = submitAnswer(state, set, "p2", 0, 0, 1000);
    state = revealAnswer(state, set);

    expect(state.phase).toBe("reveal");
    expect(state.players.p1).toMatchObject({ score: 1000, lastGained: 1000, lastOutcome: "correct" });
    expect(state.players.p2).toMatchObject({ score: 0, lastOutcome: "wrong" });
    expect(state.players.p3).toMatchObject({ score: 0, lastOutcome: "none" });
    expect(state.results).toEqual([{ round: 0, question: 0, repeat: false, counts: [1, 1], correct: 1, players: 3 }]);
  });

  it("counts only students still in the room, or who answered, towards the correct rate", () => {
    let state = advance(lobbyWith("p1", "p2", "p3"), set, 0);
    state = submitAnswer(state, set, "p1", 0, 1, 0);
    state = submitAnswer(state, set, "p2", 0, 1, 0);
    state = leavePlayer(leavePlayer(state, "p2"), "p3");
    expect(revealAnswer(state, set).results[0]).toMatchObject({ correct: 2, players: 2 });
  });

  it("marks a repeat by where the answer is shown this time, not where it was before", () => {
    let state = lobbyWith("p1");
    for (const at of [0, 20_000]) state = revealAnswer(advance(state, set, at), set);
    state = advance(state, set, 40_000);
    expect(shownQuestion(state, set)).toMatchObject({ question: 0, repeat: true, answer: 0 });
    state = revealAnswer(submitAnswer(state, set, "p1", 2, 0, 40_000), set);
    expect(state.players.p1.lastOutcome).toBe("correct");
  });
});

describe("standings", () => {
  function played(): GameState {
    let state = advance(lobbyWith("p1", "p2", "p3", "p4", "p5", "p6"), set, 0);
    state = submitAnswer(state, set, "p1", 0, 1, 0);
    state = submitAnswer(state, set, "p2", 0, 1, 4000);
    state = submitAnswer(state, set, "p3", 0, 1, 8000);
    state = submitAnswer(state, set, "p4", 0, 1, 9000);
    state = submitAnswer(state, set, "p5", 0, 0, 0);
    state = advance(revealAnswer(state, set), set, 20_000);
    state = submitAnswer(state, set, "p4", 1, 0, 20_000);
    state = advance(revealAnswer(state, set), set, 40_000);
    for (const pid of ["p1", "p2", "p3", "p4", "p5"]) state = submitAnswer(state, set, pid, 2, 0, 40_000);
    state = advance(revealAnswer(state, set), set, 60_000);
    return revealAnswer(state, set);
  }

  it(`shows at most ${TOP_PLACES} students, and nobody with no points`, () => {
    const state = played();
    const top = topPlaces(state);
    expect(top).toHaveLength(TOP_PLACES);
    expect(top.map((s) => s.place)).toEqual([1, 2, 3, 4, 5]);
    expect(top.map((s) => s.pid)).not.toContain("p6");
    expect(top.map((s) => s.score)).toEqual([...top.map((s) => s.score)].sort((a, b) => b - a));
    expect(topPlaces(lobbyWith("p1"))).toEqual([]);
  });

  it("ends after the last round and tells only the top places theirs", () => {
    const state = played();
    const final = advance(state, set, 80_000);
    expect(final.phase).toBe("final");
    const leader = topPlaces(final)[0].pid;
    expect(viewFor(final, set, leader, 0)).toMatchObject({ phase: "final", place: 1 });
    expect(viewFor(final, set, "p6", 0)).toMatchObject({ phase: "final", place: null, score: 0 });
  });

  it("can skip to the results before the last round", () => {
    const early = finish(advance(lobbyWith("p1"), set, 0));
    expect(early.phase).toBe("final");
    expect(finish(lobbyWith("p1")).phase).toBe("lobby");
  });

  it("lists the hardest questions first, with the first and second time side by side", () => {
    const rate = (correct: number) => correct / 6;
    expect(hardestQuestions(played())).toEqual([
      { question: 1, first: rate(1), second: 0 },
      { question: 0, first: rate(4), second: rate(5) },
    ]);
  });
});

/** A game with the given players and scores, ready to play round `index` of a long plan. */
function midGame(scores: Record<string, number>, index = 4): GameState {
  const state = lobbyWith(...Object.keys(scores));
  const plan = [...FIXED_PLAN, ...FIXED_PLAN, ...FIXED_PLAN, ...FIXED_PLAN];
  const ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const players = Object.fromEntries(Object.entries(state.players).map(([pid, p]) => {
    const rank = ranked.indexOf(pid) + 1;
    return [pid, { ...p, score: scores[pid], rank, previousRank: rank }];
  }));
  return startRound({ ...state, plan, players }, index);
}

function startRound(state: GameState, index: number): GameState {
  return { ...state, phase: "question", index, startedAt: 0, deadline: 10_000, answers: {}, seen: [] };
}

describe("comeback scoring", () => {
  const fresh: Pick<Player, "score" | "streak" | "star" | "missed"> = { score: 0, streak: 0, star: false, missed: [] };
  const round = { elapsedMs: 0, limitMs: 10_000, leader: 0, question: 0, repeat: false, double: false };

  it("gives the leader speed points only, and more to anyone the further behind they are", () => {
    expect(awardFor({ ...fresh, score: 4000 }, { ...round, leader: 4000 })).toMatchObject({ base: 1000, catchUp: 0, total: 1000 });
    expect(awardFor({ ...fresh, score: 2000 }, { ...round, leader: 4000 }).catchUp).toBe(1000 * CATCH_UP_MAX * 0.5);
    expect(awardFor(fresh, { ...round, leader: 4000 }).catchUp).toBe(1000 * CATCH_UP_MAX);
    expect(awardFor(fresh, { ...round, leader: 4000, elapsedMs: 10_000 }).catchUp).toBe(500 * CATCH_UP_MAX);
  });

  it("adds a little for each right answer in a row, up to a limit", () => {
    expect(awardFor({ ...fresh, streak: 1 }, round).streak).toBe(STREAK_STEP);
    expect(awardFor({ ...fresh, streak: 100 }, round).streak).toBe(STREAK_MAX);
  });

  it("rewards getting a question right on its repeat after missing it the first time", () => {
    expect(awardFor({ ...fresh, missed: [0] }, { ...round, repeat: true }).learned).toBe(LEARNED_BONUS);
    expect(awardFor({ ...fresh, missed: [1] }, { ...round, repeat: true }).learned).toBe(0);
    expect(awardFor({ ...fresh, missed: [0] }, round).learned).toBe(0);
  });

  it("doubles for a star and for the final stretch, and both together", () => {
    expect(awardFor({ ...fresh, star: true }, round)).toMatchObject({ multiplier: 2, total: 2000 });
    expect(awardFor(fresh, { ...round, double: true })).toMatchObject({ multiplier: 2, total: 2000 });
    expect(awardFor({ ...fresh, star: true, streak: 1 }, { ...round, double: true })).toMatchObject({ multiplier: 4, total: 4 * 1050 });
  });

  it("never takes points away", () => {
    let state = midGame({ a: 5000, b: 1000 });
    state = revealAnswer(submitAnswer(state, set, "b", 4, 1, 0), set);
    expect(state.players.a.score).toBe(5000);
    expect(state.players.b.score).toBeGreaterThan(1000);
  });

  it("keeps streaks, records first-time misses, and spends a star on a right answer", () => {
    let state = lobbyWith("p1", "p2");
    state = { ...state, players: { ...state.players, p2: { ...state.players.p2, star: true } } };
    // Round 0 (question 0, answer under B): p1 right, p2 wrong.
    state = advance(state, set, 0);
    state = submitAnswer(submitAnswer(state, set, "p1", 0, 1, 0), set, "p2", 0, 0, 0);
    state = revealAnswer(state, set);
    expect(state.players.p1).toMatchObject({ streak: 1, missed: [] });
    expect(state.players.p2).toMatchObject({ streak: 0, missed: [0], star: true });
    // Round 1 (question 1, answer under A): both right; p2's star doubles it.
    state = advance(state, set, 20_000);
    state = submitAnswer(submitAnswer(state, set, "p1", 1, 0, 20_000), set, "p2", 1, 0, 20_000);
    state = revealAnswer(state, set);
    expect(state.players.p1.lastAward).toMatchObject({ streak: STREAK_STEP, multiplier: 1 });
    expect(state.players.p2.lastAward).toMatchObject({ multiplier: 2 });
    expect(state.players.p2.star).toBe(false);
    // Round 2 (question 0 again, answer under A): p2 has learned it.
    state = advance(state, set, 40_000);
    state = submitAnswer(state, set, "p2", 2, 0, 40_000);
    state = revealAnswer(state, set);
    expect(state.players.p2.lastAward?.learned).toBe(LEARNED_BONUS);
    expect(state.players.p1).toMatchObject({ streak: 0, bestStreak: 2 });
  });

  it("counts the final stretch double, and says so on the phones", () => {
    let state = lobbyWith("p1");
    for (let round = 0; round < 3; round += 1) state = revealAnswer(advance(state, set, round * 20_000), set);
    expect(viewFor(state, set, "p1", 0)).toMatchObject({ nextDouble: true });
    state = advance(state, set, 60_000);
    expect(shownQuestion(state, set)?.double).toBe(true);
    expect(viewFor(state, set, "p1", 60_000)).toMatchObject({ phase: "question", double: true });
  });

  it("tracks places, and shows students outside the top who climbed", () => {
    const scores = { a: 6000, b: 5000, c: 4000, d: 3000, e: 2000, f: 1000, g: 900, h: 0 };
    let state = midGame(scores);
    state = submitAnswer(state, set, "h", 4, 1, 0);
    state = revealAnswer(state, set);
    // 1000 for speed and 800 for catching up from nothing: past f and g, into sixth.
    expect(state.players.h).toMatchObject({ score: 1800, previousRank: 8, rank: 6 });
    expect(risers(state)).toEqual([{ pid: "h", name: state.players.h.name, climbed: 2 }]);
    expect(topPlaces(state).map((s) => s.moved)).toEqual([0, 0, 0, 0, 0]);
    expect(viewFor(state, set, "h", 0)).toMatchObject({ climbed: 2, place: null });
  });

  it("tells a student outside the top places about how far off they are", () => {
    const state = revealAnswer(midGame({ a: 6000, b: 5000, c: 4000, d: 3000, e: 2000, f: 1500 }), set);
    expect(viewFor(state, set, "f", 0)).toMatchObject({ place: null, behind: 510 });
    expect(viewFor(state, set, "a", 0)).toMatchObject({ place: 1, behind: null });
    const few = revealAnswer(midGame({ a: 6000, b: 0 }), set);
    expect(viewFor(few, set, "b", 0)).toMatchObject({ place: null, behind: 0 });
  });
});

describe("stars", () => {
  const scores = Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`s${i}`, (25 - i) * 100]));
  const revealAt = (index: number, extra: Partial<GameState> = {}) => ({ ...revealAnswer(midGame(scores, index), set), ...extra });

  it("are handed out only at some reveals, never after the last round", () => {
    const state = revealAt(4);
    expect(isStarRound(state, 0)).toBe(false);
    expect(isStarRound(state, 2)).toBe(true);
    expect(isStarRound(state, 3)).toBe(false);
    expect(isStarRound(state, state.plan.length - 1)).toBe(false);
    const quiet = revealAt(5);
    expect(awardStars(quiet, seeded())).toBe(quiet);
  });

  it("go to students outside the top places, more of them in a bigger room, and none to anyone holding one", () => {
    const after = awardStars(revealAt(4), seeded(3));
    const given = currentStars(after);
    expect(given.length).toBe(STAR_MAX);
    const top = new Set(topPlaces(after).map((s) => s.pid));
    for (const pid of given) {
      expect(top.has(pid)).toBe(false);
      expect(after.players[pid].star).toBe(true);
    }
    expect(awardStars(after, seeded(4))).toBe(after);
  });

  it("go more often to the students further down, but can go to anyone outside the top", () => {
    const counts: Record<string, number> = {};
    for (let seed = 1; seed <= 400; seed += 1) {
      for (const pid of currentStars(awardStars(revealAt(4), seeded(seed)))) counts[pid] = (counts[pid] ?? 0) + 1;
    }
    const top = new Set(topPlaces(revealAt(4)).map((s) => s.pid));
    const outside = Object.keys(scores).filter((pid) => !top.has(pid));
    for (const pid of outside) expect(counts[pid] ?? 0, pid).toBeGreaterThan(0);
    expect(counts.s24).toBeGreaterThan(counts.s6 * 2);
  });

  it("skip students who are not connected", () => {
    const state = revealAt(4);
    const players = Object.fromEntries(Object.entries(state.players).map(([pid, p]) => [pid, { ...p, connected: pid === "s20" }]));
    expect(currentStars(awardStars({ ...state, players }, seeded()))).toEqual(["s20"]);
  });

  it("tell only the students who got one", () => {
    const after = awardStars(revealAt(4), seeded(3));
    const [starred] = currentStars(after);
    expect(viewFor(after, set, starred, 0)).toMatchObject({ phase: "reveal", newStar: true, star: true });
    expect(viewFor(after, set, "s0", 0)).toMatchObject({ phase: "reveal", newStar: false, star: false });
  });
});

/**
 * Whole games between simulated students, from ones who get under half right
 * to ones who get nearly all right. The weakest must have a real chance at the
 * top places, and the strongest must still win most often.
 */
describe("everyone has a chance", () => {
  const bigSet: QuestionSet = {
    ...set,
    seconds: 20,
    // 16 questions, a third of them asked twice, like the sets.
    questions: Array.from({ length: 16 }, (_, i) => ({
      id: `q${i}`,
      prompt: "?",
      choices: [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }],
      answer: 0,
      explanation: "Because.",
      ...(i % 3 === 0 ? { askTwice: true as const } : {}),
    })),
  };

  /** Plays a game; returns the top places' skill fifths (0 weakest, 4 strongest). */
  function game(seed: number, students: number): number[] {
    const random = seeded(seed);
    let state = newGame(bigSet, random);
    for (let i = 0; i < students; i += 1) state = joinPlayer(state, `p${i}`, random);
    const skill = (pid: string) => Number(pid.slice(1)) / (students - 1);
    const missed = new Set<string>();
    let now = 0;
    state = advance(state, bigSet, now);
    while (state.phase === "question") {
      const step = state.plan[state.index];
      const shown = shownQuestion(state, bigSet)!;
      const difficulty = (random() - 0.5) * 0.3;
      for (const pid of Object.keys(state.players)) {
        // 45% to 85% right, a little more on a repeat they missed, and the stronger answer faster.
        const learned = step.repeat && missed.has(`${pid}:${step.question}`) ? 0.15 : 0;
        const right = random() < 0.45 + 0.4 * skill(pid) + difficulty + learned;
        if (!step.repeat && !right) missed.add(`${pid}:${step.question}`);
        const time = Math.min(0.95, Math.max(0.05, 0.55 - 0.3 * skill(pid) + 0.3 * (random() - 0.5)));
        state = submitAnswer(state, bigSet, pid, state.index, right ? shown.answer : (shown.answer + 1) % 4, now + time * shown.seconds * 1000);
      }
      state = closeRound(state, bigSet, random);
      now += 60_000;
      state = advance(state, bigSet, now);
    }
    return topPlaces(state).map((s) => Math.min(4, Math.floor(skill(s.pid) * 5)));
  }

  it("puts the weaker students in the top places in some games, while the strongest still win most", () => {
    const games = 300;
    const top = [0, 0, 0, 0, 0];
    const wins = [0, 0, 0, 0, 0];
    for (let seed = 1; seed <= games; seed += 1) {
      const fifths = game(seed, 25);
      for (const fifth of fifths) top[fifth] += 1;
      wins[fifths[0]] += 1;
    }
    // The weakest two fifths of the room reach the top five in at least one game in ten.
    expect(top[0] + top[1]).toBeGreaterThan(games / 10);
    expect(top[4]).toBeGreaterThan(top[3]);
    expect(wins[4]).toBeGreaterThan(games / 2);
  });
});

describe("time per question", () => {
  const picture = { src: "/a.png", alt: "A", width: 1, height: 1 };
  const text: Question = { id: "t", prompt: "?", choices: [{ text: "a" }, { text: "b" }], answer: 0, explanation: "Because." };

  it("is the question's own time, else the set's, else the default", () => {
    expect(questionSeconds({ ...text, seconds: 12 }, { ...set, seconds: 30 })).toBe(12);
    expect(questionSeconds(text, { ...set, seconds: 30 })).toBe(30);
    expect(questionSeconds(text, { ...set, seconds: undefined })).toBe(DEFAULT_QUESTION_SECONDS);
  });

  it("gives questions with a picture, beside them or as choices, extra time to look", () => {
    expect(questionSeconds({ ...text, image: picture }, { ...set, seconds: 30 })).toBe(30 + PICTURE_EXTRA_SECONDS);
    expect(questionSeconds({ ...text, choices: [{ image: picture }, { image: picture }] }, { ...set, seconds: undefined })).toBe(DEFAULT_QUESTION_SECONDS + PICTURE_EXTRA_SECONDS);
  });
});

describe("what a phone is shown", () => {
  it("sends picture questions without the pictures, and the reveal without other students' results", () => {
    const pictureSet: QuestionSet = {
      ...set,
      questions: [{
        ...set.questions[0],
        choices: [
          { image: { src: "/a.png", alt: "A", width: 1, height: 1 } },
          { image: { src: "/b.png", alt: "B", width: 1, height: 1 } },
        ],
      }],
    };
    let state: GameState = { ...lobbyWith("p1"), setId: pictureSet.id, plan: [FIXED_PLAN[0], FIXED_PLAN[2]] };
    state = advance(state, pictureSet, 0);
    expect(viewFor(state, pictureSet, "p1", 2500)).toEqual({
      phase: "question", name: state.players.p1.name, index: 0, total: 2, prompt: "One?",
      // 10 seconds, and 15 more because the choices are pictures.
      choices: [{ label: "A" }, { label: "B" }], pictures: true, secondsLeft: 23, answered: null,
      double: false, star: false, streak: 0,
    });
    state = revealAnswer(submitAnswer(state, pictureSet, "p1", 0, 0, 100), pictureSet);
    expect(viewFor(state, pictureSet, "p1", 0)).toMatchObject({ phase: "reveal", outcome: "wrong", correctLabel: "B" });
  });

  it("forgets a removed student", () => {
    const state = removePlayer(lobbyWith("p1"), "p1");
    expect(viewFor(state, set, "p1", 0)).toBeNull();
  });
});
