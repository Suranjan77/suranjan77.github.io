import { describe, expect, it } from "vitest";
import {
  ANSWER_GRACE_MS,
  MAX_REROLLS,
  advance,
  everyoneAnswered,
  hardestQuestions,
  joinPlayer,
  leavePlayer,
  newGame,
  pointsFor,
  removePlayer,
  rerollName,
  revealAnswer,
  submitAnswer,
  syncConnected,
  topThree,
  viewFor,
  type GameState,
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

function seeded() {
  let x = 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
}

function lobbyWith(...pids: string[]): GameState {
  const random = seeded();
  return pids.reduce((state, pid) => joinPlayer(state, pid, random), newGame(set.id));
}

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
});

describe("answering", () => {
  it("accepts one answer per student, for the current question, until just after the deadline", () => {
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
    expect(state.results).toEqual([{ index: 0, counts: [1, 1], correct: 1, players: 3 }]);
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
    return revealAnswer(state, set);
  }

  it("shows at most three students, and nobody with no points", () => {
    const top = topThree(played());
    expect(top.map((s) => s.pid)).toEqual(["p4", "p1", "p2"]);
    expect(top.map((s) => s.place)).toEqual([1, 2, 3]);
    expect(topThree(lobbyWith("p1"))).toEqual([]);
  });

  it("ends after the last question and tells only the top three their place", () => {
    const final = advance(played(), set, 40_000);
    expect(final.phase).toBe("final");
    expect(viewFor(final, set, "p4", 0)).toMatchObject({ phase: "final", place: 1 });
    expect(viewFor(final, set, "p5", 0)).toMatchObject({ phase: "final", place: null, score: 0 });
  });

  it("lists the questions the room found hardest first", () => {
    expect(hardestQuestions(played()).map((r) => r.index)).toEqual([1, 0]);
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
    let state = advance(lobbyWith("p1"), pictureSet, 0);
    expect(viewFor(state, pictureSet, "p1", 2500)).toEqual({
      phase: "question", name: state.players.p1.name, index: 0, total: 1, prompt: "One?",
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
