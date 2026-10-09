import { describe, expect, it } from "vitest";
import {
  ANSWER_GRACE_MS,
  MAX_REROLLS,
  MIN_REPEAT_GAP,
  advance,
  buildPlan,
  everyoneAnswered,
  finish,
  hardestQuestions,
  joinPlayer,
  leavePlayer,
  newGame,
  pointsFor,
  questionOrder,
  removePlayer,
  rerollName,
  revealAnswer,
  shownQuestion,
  submitAnswer,
  syncConnected,
  topThree,
  viewFor,
  type GameState,
  type Round,
} from "./game";
import type { QuestionSet } from "./types";

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
  it("asks every question exactly twice, with at least MIN_REPEAT_GAP rounds before the repeat", () => {
    for (const count of [8, 10, 12]) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const order = questionOrder(count, seeded(seed));
        expect(order).toHaveLength(count * 2);
        for (let q = 0; q < count; q += 1) {
          expect(order.filter((x) => x === q)).toHaveLength(2);
          expect(order.lastIndexOf(q) - order.indexOf(q)).toBeGreaterThanOrEqual(MIN_REPEAT_GAP);
        }
      }
    }
  });

  it("varies from game to game", () => {
    const orders = new Set(Array.from({ length: 20 }, (_, seed) => questionOrder(8, seeded(seed + 1)).join(",")));
    expect(orders.size).toBeGreaterThan(15);
  });

  it("still spaces repeats when there are too few questions to shuffle", () => {
    const order = questionOrder(3, seeded());
    expect(order.slice(0, 3)).toEqual(order.slice(3));
  });

  it("reshuffles the choices on the repeat so the answer is under a different letter", () => {
    const bigger: QuestionSet = {
      ...set,
      questions: Array.from({ length: 8 }, (_, i) => ({
        id: `q${i}`,
        prompt: `Q${i}?`,
        choices: [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }].slice(0, 2 + (i % 3)),
        answer: i % 2,
        explanation: "Because.",
      })),
    };
    for (let seed = 1; seed <= 50; seed += 1) {
      const plan = buildPlan(bigger, seeded(seed));
      const state: GameState = { ...newGame(bigger), plan };
      bigger.questions.forEach((question, q) => {
        const [first, second] = plan.map((round, i) => ({ round, i })).filter(({ round }) => round.question === q);
        expect(first.round.repeat).toBe(false);
        expect(second.round.repeat).toBe(true);
        expect([...first.round.order].sort()).toEqual(question.choices.map((_, i) => i));
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
    expect(everyoneAnswered(state)).toBe(false);
    expect(everyoneAnswered(leavePlayer(state, "p2"))).toBe(true);
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
    let state = advance(lobbyWith("p1", "p2", "p3", "p4", "p5"), set, 0);
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

  it("shows at most three students, and nobody with no points", () => {
    const top = topThree(played());
    expect(top.map((s) => s.pid)).toEqual(["p4", "p1", "p2"]);
    expect(top.map((s) => s.place)).toEqual([1, 2, 3]);
    expect(topThree(lobbyWith("p1"))).toEqual([]);
  });

  it("ends after the last round and tells only the top three their place", () => {
    const final = advance(played(), set, 80_000);
    expect(final.phase).toBe("final");
    expect(viewFor(final, set, "p4", 0)).toMatchObject({ phase: "final", place: 1 });
    expect(viewFor(final, set, "p5", 0)).toMatchObject({ phase: "final", place: null, score: 1000 });
  });

  it("can skip to the results before the last round", () => {
    const early = finish(advance(lobbyWith("p1"), set, 0));
    expect(early.phase).toBe("final");
    expect(finish(lobbyWith("p1")).phase).toBe("lobby");
  });

  it("lists the hardest questions first, with the first and second time side by side", () => {
    expect(hardestQuestions(played())).toEqual([
      { question: 1, first: 0.2, second: 0 },
      { question: 0, first: 0.8, second: 1 },
    ]);
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
      choices: [{ label: "A" }, { label: "B" }], pictures: true, secondsLeft: 8, answered: null,
    });
    state = revealAnswer(submitAnswer(state, pictureSet, "p1", 0, 0, 100), pictureSet);
    expect(viewFor(state, pictureSet, "p1", 0)).toMatchObject({ phase: "reveal", outcome: "wrong", correctLabel: "B" });
  });

  it("forgets a removed student", () => {
    const state = removePlayer(lobbyWith("p1"), "p1");
    expect(viewFor(state, set, "p1", 0)).toBeNull();
  });
});
