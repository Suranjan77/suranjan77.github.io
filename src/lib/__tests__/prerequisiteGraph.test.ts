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

  it('getTrackModules("computer-vision") returns only computer-vision modules', () => {
    const mods = getTrackModules('computer-vision');
    expect(mods.length).toBeGreaterThan(0);
    for (const m of mods) {
      expect(m.tracks).toContain('computer-vision');
    }
  });

  it('computer-vision track orders foundations before dependent vision modules', () => {
    const ids = getTrackModules('computer-vision').map(m => m.id);

    const cvFoundationIndex = ids.indexOf('computer-vision');
    const segmentationIndex = ids.indexOf('image-segmentation');

    if (cvFoundationIndex !== -1 && segmentationIndex !== -1) {
      expect(cvFoundationIndex).toBeLessThan(segmentationIndex);
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
