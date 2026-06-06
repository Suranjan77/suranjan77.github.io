import { describe, it, expect } from "vitest";
import { algorithmsList } from "../algorithms_content";

describe("Content validation checks", () => {
  it("every module has at least 3 learning objectives", () => {
    for (const mod of algorithmsList) {
      expect(mod.learningObjectives).toBeDefined();
      expect(mod.learningObjectives!.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("every module has at least 1 worked example", () => {
    for (const mod of algorithmsList) {
      expect(mod.workedExamples).toBeDefined();
      expect(mod.workedExamples!.length).toBeGreaterThanOrEqual(1);
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

  it("every module has a non-empty mathematics section", () => {
    for (const mod of algorithmsList) {
      expect(mod.mathematics).toBeTruthy();
    }
  });

  it("every module has a non-empty codeSnippet", () => {
    for (const mod of algorithmsList) {
      expect(mod.codeSnippet).toBeTruthy();
    }
  });

  it("every module has at least 1 failure mode", () => {
    for (const mod of algorithmsList) {
      expect(mod.failureModes).toBeDefined();
      expect(mod.failureModes!.length).toBeGreaterThanOrEqual(1);
    }
  });
});
