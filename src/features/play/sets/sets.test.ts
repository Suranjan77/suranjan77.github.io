import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NICKNAME_ANIMALS, NICKNAME_COLOURS, pickNickname } from "../nicknames";
import { parsePlayerMessage } from "../protocol";
import type { QuizImage } from "../types";
import { userExperience } from "./aaq-u3";
import { questionSets } from "./index";

const publicDir = join(process.cwd(), "public");

function checkImage(image: QuizImage) {
  expect(image.alt.trim().length).toBeGreaterThan(10);
  expect(existsSync(join(publicDir, image.src))).toBe(true);
  expect(image.width).toBeGreaterThan(0);
  expect(image.height).toBeGreaterThan(0);
}

describe("question sets", () => {
  it("have unique ids", () => {
    expect(new Set(questionSets.map((set) => set.id)).size).toBe(questionSets.length);
  });

  for (const set of questionSets) {
    describe(set.title, () => {
      it("has questions with unique ids", () => {
        expect(set.questions.length).toBeGreaterThan(0);
        expect(new Set(set.questions.map((q) => q.id)).size).toBe(set.questions.length);
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

describe("the contrast question", () => {
  it("has exactly one button that passes 4.5:1, it is the answer, and the explanation's figures are the measured ones", () => {
    const html = readFileSync(join(process.cwd(), "scripts/play-figures/aaq-u3.html"), "utf8");
    const measured = new Map(
      [...html.matchAll(/data-name="(t04-button-[a-z]+)"[\s\S]*?data-contrast style="background:(#[0-9a-f]{6});color:(#[0-9a-f]{6})"/g)]
        .map(([, name, bg, fg]) => [name, contrast(bg, fg)]),
    );
    const question = userExperience.questions.find((q) => q.id === "contrast-button")!;
    const ratios = question.choices.map((choice) => measured.get(choice.image!.src.match(/(t04-button-[a-z]+)/)![1])!);

    expect(ratios.filter((r) => r >= 4.5)).toHaveLength(1);
    expect(ratios[question.answer]).toBeGreaterThanOrEqual(4.5);
    for (const ratio of ratios) expect(question.explanation).toContain(`${ratio.toFixed(1)}:1`);
  });
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
  it("accept only the two things a student can do", () => {
    expect(parsePlayerMessage({ t: "answer", index: 2, choice: 1 })).toEqual({ t: "answer", index: 2, choice: 1 });
    expect(parsePlayerMessage({ t: "reroll", name: "Something rude" })).toEqual({ t: "reroll" });
    expect(parsePlayerMessage({ t: "answer", index: "2", choice: 1 })).toBeNull();
    expect(parsePlayerMessage({ t: "rename", name: "x" })).toBeNull();
    expect(parsePlayerMessage(null)).toBeNull();
  });
});
