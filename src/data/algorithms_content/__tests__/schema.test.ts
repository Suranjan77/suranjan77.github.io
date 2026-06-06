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
          expect(allIds.has(prereqId)).toBe(true);
        }
      }
    }
  });

  it('relatedModule IDs reference existing modules', () => {
    const allIds = new Set(algorithmsList.map(m => m.id));
    for (const mod of algorithmsList) {
      if (mod.relatedModules) {
        for (const relId of mod.relatedModules) {
          expect(allIds.has(relId)).toBe(true);
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
