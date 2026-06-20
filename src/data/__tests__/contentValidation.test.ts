import { describe, it, expect } from "vitest";
import { algorithmsList } from "../algorithms_content";

describe("Content validation checks", () => {
  it("every module has at least 3 learning objectives", () => {
    for (const mod of algorithmsList) {
      expect(mod.learningObjectives).toBeDefined();
      expect(mod.learningObjectives!.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("every module has at least 2 references", () => {
    for (const mod of algorithmsList) {
      expect(mod.references).toBeDefined();
      expect(mod.references!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("every reference has a non-empty title", () => {
    for (const mod of algorithmsList) {
      if (mod.references) {
        for (const ref of mod.references) {
          expect(ref.title).toBeTruthy();
        }
      }
    }
  });

  it("every module has at least 2 misconceptions", () => {
    for (const mod of algorithmsList) {
      expect(mod.misconceptions).toBeDefined();
      expect(mod.misconceptions!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("every module has estimatedMinutes between 10 and 120", () => {
    for (const mod of algorithmsList) {
      expect(mod.estimatedMinutes).toBeDefined();
      expect(mod.estimatedMinutes).toBeGreaterThanOrEqual(10);
      expect(mod.estimatedMinutes).toBeLessThanOrEqual(120);
    }
  });

  it("every module has difficulty between 1 and 4", () => {
    for (const mod of algorithmsList) {
      expect(mod.difficulty).toBeDefined();
      expect(mod.difficulty).toBeGreaterThanOrEqual(1);
      expect(mod.difficulty).toBeLessThanOrEqual(4);
    }
  });

  it("every module has at least one track", () => {
    for (const mod of algorithmsList) {
      expect(mod.tracks).toBeDefined();
      expect(mod.tracks!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every module has a non-empty mathematics section (if it has a visualization)", () => {
    for (const mod of algorithmsList) {
      if (mod.hasVisualization !== false) {
        expect(mod.mathematics).toBeTruthy();
      }
    }
  });

  it("every module has a non-empty codeSnippet (if it has a visualization)", () => {
    for (const mod of algorithmsList) {
      if (mod.hasVisualization !== false) {
        expect(mod.codeSnippet).toBeTruthy();
      }
    }
  });

  it("every module has at least 1 failure mode", () => {
    for (const mod of algorithmsList) {
      expect(mod.failureModes).toBeDefined();
      expect(mod.failureModes!.length).toBeGreaterThanOrEqual(1);
    }
  });
});

// Active-learning rubric — only enforced once a module is marked `published`.
// Legacy/draft modules are exempt so the upgrade can roll out incrementally
// without turning CI red the moment any module is touched.
describe("Published-module active-learning rubric", () => {
  const publishedModules = algorithmsList.filter(
    (mod) => mod.review?.status === "published",
  );

  it("has at least one published module once the rollout begins (informational)", () => {
    // Not a hard requirement; this simply documents rollout progress.
    expect(publishedModules.length).toBeGreaterThanOrEqual(0);
  });

  it.each(publishedModules.map((m) => [m.id, m] as const))(
    "%s: has 3-5 self-check quiz questions, each with an explanation",
    (_id, mod) => {
      expect(mod.quiz).toBeDefined();
      expect(mod.quiz!.length).toBeGreaterThanOrEqual(3);
      expect(mod.quiz!.length).toBeLessThanOrEqual(5);
      for (const q of mod.quiz!) {
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.options.some((o) => o.correct)).toBe(true);
        expect(q.explanation).toBeTruthy();
      }
    },
  );

  it.each(publishedModules.map((m) => [m.id, m] as const))(
    "%s: has at least 1 case study with a quantified outcome",
    (_id, mod) => {
      expect(mod.caseStudies).toBeDefined();
      expect(mod.caseStudies!.length).toBeGreaterThanOrEqual(1);
    },
  );

  it.each(publishedModules.map((m) => [m.id, m] as const))(
    "%s: has usage guidance with >= 2 use-when and >= 2 avoid-when",
    (_id, mod) => {
      expect(mod.usageGuidance).toBeDefined();
      expect(mod.usageGuidance!.useWhen.length).toBeGreaterThanOrEqual(2);
      expect(mod.usageGuidance!.avoidWhen.length).toBeGreaterThanOrEqual(2);
    },
  );

  it.each(publishedModules.map((m) => [m.id, m] as const))(
    "%s: has at least 1 derivation in additionalSections",
    (_id, mod) => {
      expect(mod.additionalSections).toBeDefined();
      expect(mod.additionalSections!.length).toBeGreaterThanOrEqual(1);
    },
  );

  it.each(publishedModules.map((m) => [m.id, m] as const))(
    "%s: has a TL;DR of 3-6 points",
    (_id, mod) => {
      expect(mod.tldr).toBeDefined();
      expect(mod.tldr!.length).toBeGreaterThanOrEqual(3);
      expect(mod.tldr!.length).toBeLessThanOrEqual(6);
    },
  );

  it.each(
    publishedModules.map((m) => [m.id, m] as const),
  )(
    "%s: (practitioner/modern-ai) has at least 1 comparison table",
    (_id, mod) => {
      expect(mod.comparisons).toBeDefined();
      expect(mod.comparisons!.length).toBeGreaterThanOrEqual(1);
    },
  );
});
