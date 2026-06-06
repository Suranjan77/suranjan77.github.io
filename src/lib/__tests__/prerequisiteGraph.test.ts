import { describe, it, expect } from 'vitest';
import { getModuleById, getPrerequisiteModules, getNextModules, getTrackModules } from '../prerequisiteGraph';

describe('Prerequisite Graph Utilities', () => {
  it('getModuleById returns the correct module for a known ID', () => {
    const mod = getModuleById('calculus');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('calculus');
  });

  it('getModuleById returns undefined for an unknown ID', () => {
    const mod = getModuleById('non-existent-id-xyz');
    expect(mod).toBeUndefined();
  });

  it('getTrackModules("foundations") returns only foundation modules', () => {
    const mods = getTrackModules('foundations');
    expect(mods.length).toBeGreaterThan(0);
    for (const m of mods) {
      expect(m.tracks).toContain('foundations');
    }
  });

  it('foundation modules appear before modules that depend on them in sorted result', () => {
    const mods = getTrackModules('foundations');
    // For example, if linear-algebra is in foundations and is a prerequisite for probability-theory or maximum-likelihood (if we had it), it should be sorted.
    // Let's verify standard track sort for practitioner: linear-regression depends on linear-algebra & calculus, so linear-algebra & calculus (which are foundations) should be before linear-regression.
    // Let's test standard dependencies. If module B depends on A, and both are in the track, A must appear before B.
    const allTrackMods = getTrackModules('practitioner');
    const ids = allTrackMods.map(m => m.id);

    // Let's check a few known pairs in practitioner:
    // decision-trees depends on probability-theory (not in practitioner).
    // ensemble-learning depends on decision-trees. Both are in practitioner!
    const decisionTreesIndex = ids.indexOf('decision-trees');
    const ensembleIndex = ids.indexOf('ensemble-learning');

    if (decisionTreesIndex !== -1 && ensembleIndex !== -1) {
      expect(decisionTreesIndex).toBeLessThan(ensembleIndex);
    }
  });
});
