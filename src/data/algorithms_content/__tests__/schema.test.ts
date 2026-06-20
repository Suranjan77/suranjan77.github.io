import { describe, it, expect } from 'vitest';
import { algorithmsList } from '../index';

describe('Algorithm schema validation', () => {
  it('every module has a non-empty id', () => {
    for (const mod of algorithmsList) {
      expect(mod.id).toBeTruthy();
      expect(typeof mod.id).toBe('string');
    }
  });

  it('every module has a non-empty title', () => {
    for (const mod of algorithmsList) {
      expect(mod.title).toBeTruthy();
    }
  });

  it('every id is unique', () => {
    const ids = algorithmsList.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every id matches slug pattern', () => {
    for (const mod of algorithmsList) {
      expect(mod.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('prerequisite IDs reference existing modules', () => {
    const allIds = new Set(algorithmsList.map(m => m.id));
    for (const mod of algorithmsList) {
      if (mod.prerequisites) {
        for (const prereqId of mod.prerequisites) {
          expect(allIds.has(prereqId), `Module ${mod.id} has missing prerequisite: ${prereqId}`).toBe(true);
        }
      }
    }
  });

  it('relatedModule IDs reference existing modules', () => {
    const allIds = new Set(algorithmsList.map(m => m.id));
    for (const mod of algorithmsList) {
      if (mod.relatedModules) {
        for (const relId of mod.relatedModules) {
          expect(allIds.has(relId), `Module ${mod.id} has missing relatedModule: ${relId}`).toBe(true);
        }
      }
    }
  });

  it('has no prerequisite cycles', () => {
    // Build adjacency list: module -> its prerequisites
    const adjList = new Map<string, string[]>();
    for (const mod of algorithmsList) {
      adjList.set(mod.id, mod.prerequisites || []);
    }
    // DFS cycle detection
    const visited = new Set<string>();
    const inStack = new Set<string>();
    function hasCycle(node: string): boolean {
      if (inStack.has(node)) return true;
      if (visited.has(node)) return false;
      visited.add(node);
      inStack.add(node);
      for (const neighbor of (adjList.get(node) || [])) {
        if (hasCycle(neighbor)) return true;
      }
      inStack.delete(node);
      return false;
    }
    for (const mod of algorithmsList) {
      expect(hasCycle(mod.id)).toBe(false);
    }
  });
});

describe('Active-learning content structural integrity', () => {
  it('every quiz question has 2+ options, exactly-or-more than one correct, and an explanation', () => {
    for (const mod of algorithmsList) {
      for (const q of mod.quiz ?? []) {
        expect(q.question).toBeTruthy();
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.options.some((o) => o.correct)).toBe(true);
        expect(q.explanation).toBeTruthy();
      }
    }
  });

  it('every comparison row has one value per method', () => {
    for (const mod of algorithmsList) {
      for (const table of mod.comparisons ?? []) {
        expect(table.methods.length).toBeGreaterThanOrEqual(2);
        for (const row of table.rows) {
          expect(row.values.length).toBe(table.methods.length);
        }
      }
    }
  });

  it('every case study has scenario, approach, and outcome', () => {
    for (const mod of algorithmsList) {
      for (const study of mod.caseStudies ?? []) {
        expect(study.title).toBeTruthy();
        expect(study.scenario).toBeTruthy();
        expect(study.approach).toBeTruthy();
        expect(study.outcome).toBeTruthy();
      }
    }
  });
});
