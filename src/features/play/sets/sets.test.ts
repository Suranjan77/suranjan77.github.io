import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NICKNAME_ANIMALS, NICKNAME_COLOURS, pickNickname } from "../nicknames";
import { parsePlayerMessage } from "../protocol";
import { roundCount, type QuizImage } from "../types";
import { userExperience } from "./aaq-u3";
import { designingSlides } from "./l1-a4";
import { courseOfSet, courses, findSet, loadCourse, loadSet } from "./index";

const publicDir = join(process.cwd(), "public");

/**
 * A set may show one worked example to several questions on purpose: the
 * formulas set works every formula on the same small sheet of orders. No
 * other picture may appear in two questions of a set.
 */
const WORKED_EXAMPLES: Record<string, string[]> = {
  "l2-u9-t1-formulas": ["/play/l2-u9/t2-orders.png"],
};
/**
 * A weekly set has 12 to 16 questions and asks 3 to 6 twice. A taster day's
 * opening quiz is also its icebreaker: longer, and asking nothing twice,
 * because nothing has been taught yet to come back to.
 */
const WEEKLY_SET = { questions: [12, 16], twice: [3, 6], rounds: 22 };
const SET_SHAPES: Record<string, typeof WEEKLY_SET> = {
  "y11-da-start": { questions: [20, 24], twice: [0, 0], rounds: 24 },
};
const loadedCourses =await Promise.all(courses.map(async (course) => ({ course, sections: await loadCourse(course) })));
const questionSets = loadedCourses.flatMap(({ sections }) => sections.flatMap((section) => section.sets));

function checkImage(image: QuizImage) {
  expect(image.alt.trim().length).toBeGreaterThan(10);
  expect(existsSync(join(publicDir, image.src))).toBe(true);
  expect(image.width).toBeGreaterThan(0);
  expect(image.height).toBeGreaterThan(0);
}

describe("courses", () => {
  it("have unique ids, none the start of another, and are listed lowest level first", () => {
    const ids = courses.map((course) => course.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of ids) for (const b of ids) if (a !== b) expect(b.startsWith(`${a}-`)).toBe(false);
    const levels = courses.map((course) => course.level);
    expect(levels).toEqual([...levels].sort());
  });

  for (const { course, sections } of loadedCourses) {
    it(`${course.id}: every section has sets, and every set id names its course`, () => {
      expect(sections.length).toBeGreaterThan(0);
      for (const section of sections) {
        expect(section.title.trim()).not.toBe("");
        expect(section.sets.length).toBeGreaterThan(0);
        for (const set of section.sets) {
          expect(courseOfSet(set.id)).toBe(course);
          expect(findSet(set.id)).toBe(set);
        }
      }
    });
  }

  it("load a set by id, and nothing for an unknown id", async () => {
    expect(await loadSet(questionSets[0].id)).toBe(questionSets[0]);
    expect(await loadSet("no-such-course-t01")).toBeUndefined();
  });
});

describe("question sets", () => {
  it("have unique ids", () => {
    expect(new Set(questionSets.map((set) => set.id)).size).toBe(questionSets.length);
  });

  for (const set of questionSets) {
    describe(set.title, () => {
      const shape = SET_SHAPES[set.id] ?? WEEKLY_SET;
      it(`has ${shape.questions.join(" to ")} questions with unique ids, and asks ${shape.twice.join(" to ")} of them twice`, () => {
        expect(set.questions.length).toBeGreaterThanOrEqual(shape.questions[0]);
        expect(set.questions.length).toBeLessThanOrEqual(shape.questions[1]);
        expect(new Set(set.questions.map((q) => q.id)).size).toBe(set.questions.length);
        const twice = set.questions.filter((q) => q.askTwice).length;
        expect(twice).toBeGreaterThanOrEqual(shape.twice[0]);
        expect(twice).toBeLessThanOrEqual(shape.twice[1]);
        expect(roundCount(set)).toBeLessThanOrEqual(shape.rounds);
      });

      it("shows each picture in one question only", () => {
        const pictures = set.questions.flatMap((q) => [q.image, ...q.choices.map((c) => c.image)].flatMap((image) => (image ? [image.src] : [])));
        const repeated = [...new Set(pictures.filter((src, i) => pictures.indexOf(src) !== i))];
        expect(repeated).toEqual(WORKED_EXAMPLES[set.id] ?? []);
      });

      for (const question of set.questions) {
        it(`${question.id}: two to four choices of one kind, a valid answer and a reason`, () => {
          expect(question.prompt.trim()).not.toBe("");
          expect(question.explanation.trim().length).toBeGreaterThan(20);
          expect(question.choices.length).toBeGreaterThanOrEqual(2);
          expect(question.choices.length).toBeLessThanOrEqual(4);
          expect(Number.isInteger(question.answer)).toBe(true);
          expect(question.answer).toBeGreaterThanOrEqual(0);
          expect(question.answer).toBeLessThan(question.choices.length);
          if (question.seconds !== undefined) expect(question.seconds).toBeGreaterThanOrEqual(10);

          const kinds = new Set(question.choices.map((c) => (c.image ? "image" : "text")));
          expect(kinds.size).toBe(1);
          for (const choice of question.choices) {
            if (choice.image) checkImage(choice.image);
            else expect(choice.text.trim()).not.toBe("");
          }
          if (question.image) checkImage(question.image);
          const texts = question.choices.flatMap((c) => (c.text ? [c.text] : []));
          expect(new Set(texts).size).toBe(texts.length);
        });
      }
    });
  }
});

/** WCAG 2.2 relative luminance and contrast ratio. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Questions whose answer is the only choice with 4.5:1 contrast, measured from the figure source. */
const contrastQuestions = [
  { figures: "aaq-u3", name: /t04-button-[a-z]+/, set: userExperience, id: "contrast-button", quotesRatios: true },
  { figures: "l1-a4", name: /s4-contrast-[a-z]+/, set: designingSlides, id: "contrast", quotesRatios: false },
];

describe("the contrast questions", () => {
  for (const { figures, name, set, id, quotesRatios } of contrastQuestions) {
    it(`${set.id} ${id}: exactly one choice passes 4.5:1, and it is the answer`, () => {
      const html = readFileSync(join(process.cwd(), `scripts/play-figures/${figures}.html`), "utf8");
      const pattern = new RegExp(`data-name="(${name.source})"[\\s\\S]*?data-contrast style="background:(#[0-9a-f]{6});color:(#[0-9a-f]{6})"`, "g");
      const measured = new Map([...html.matchAll(pattern)].map(([, figure, bg, fg]) => [figure, contrast(bg, fg)]));
      const question = set.questions.find((q) => q.id === id)!;
      const ratios = question.choices.map((choice) => measured.get(choice.image!.src.match(name)![0])!);

      expect(ratios.every((r) => r !== undefined)).toBe(true);
      expect(ratios.filter((r) => r >= 4.5)).toHaveLength(1);
      expect(ratios[question.answer]).toBeGreaterThanOrEqual(4.5);
      if (quotesRatios) for (const ratio of ratios) expect(question.explanation).toContain(`${ratio.toFixed(1)}:1`);
    });
  }
});

describe("nicknames", () => {
  it("are distinct for a full room and come only from the word lists", () => {
    const taken = new Set<string>();
    for (let i = 0; i < 60; i += 1) taken.add(pickNickname(taken, () => 0.5));
    expect(taken.size).toBe(60);
    for (const name of taken) {
      const [colour, animal] = name.split(" ");
      expect(NICKNAME_COLOURS).toContain(colour);
      expect(NICKNAME_ANIMALS).toContain(animal);
    }
  });
});

describe("messages from phones", () => {
  it("accept only the three things a phone can say", () => {
    expect(parsePlayerMessage({ t: "answer", index: 2, choice: 1 })).toEqual({ t: "answer", index: 2, choice: 1 });
    expect(parsePlayerMessage({ t: "seen", index: 2 })).toEqual({ t: "seen", index: 2 });
    expect(parsePlayerMessage({ t: "reroll", name: "Something rude" })).toEqual({ t: "reroll" });
    expect(parsePlayerMessage({ t: "answer", index: "2", choice: 1 })).toBeNull();
    expect(parsePlayerMessage({ t: "rename", name: "x" })).toBeNull();
    expect(parsePlayerMessage(null)).toBeNull();
  });
});
