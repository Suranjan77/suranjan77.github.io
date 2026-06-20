import { describe, it, expect } from 'vitest';
import { getModuleById, getPrerequisiteModules, getNextModules, getTrackModules } from '../prerequisiteGraph';

describe('Prerequisite Graph Utilities', () => {
  it('getModuleById returns the correct module for a known ID', () => {
    const mod = getModuleById('linear-regression');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('linear-regression');
  });

  it('getModuleById returns undefined for an unknown ID', () => {
    const mod = getModuleById('non-existent-id-xyz');
    expect(mod).toBeUndefined();
  });

  it('getTrackModules("practitioner") returns only practitioner modules', () => {
    const mods = getTrackModules('practitioner');
    expect(mods.length).toBeGreaterThan(0);
    for (const m of mods) {
      expect(m.tracks).toContain('practitioner');
    }
  });

  it('track modules appear before modules that depend on them in sorted result', () => {
    const allTrackMods = getTrackModules('practitioner');
    const ids = allTrackMods.map(m => m.id);

    const decisionTreesIndex = ids.indexOf('decision-trees');
    const ensembleIndex = ids.indexOf('ensemble-learning');

    if (decisionTreesIndex !== -1 && ensembleIndex !== -1) {
      expect(decisionTreesIndex).toBeLessThan(ensembleIndex);
    }
  });
});
