import { algorithmsList, LearningModule, TrackId } from '@/data/algorithms_content';

export function getModuleById(id: string): LearningModule | undefined {
  return algorithmsList.find(m => m.id === id);
}

export function getPrerequisiteModules(moduleId: string): LearningModule[] {
  const mod = getModuleById(moduleId);
  if (!mod?.prerequisites) return [];
  return mod.prerequisites
    .map(id => getModuleById(id))
    .filter((m): m is LearningModule => m !== undefined);
}

export function getNextModules(moduleId: string): LearningModule[] {
  return algorithmsList.filter(
    m => m.prerequisites?.includes(moduleId)
  );
}

export function getTrackModules(track: TrackId): LearningModule[] {
  const trackModules = algorithmsList.filter(
    m => m.tracks?.includes(track)
  );
  // Topological sort by prerequisites
  return topologicalSort(trackModules);
}

function topologicalSort(modules: LearningModule[]): LearningModule[] {
  const moduleIds = new Set(modules.map(m => m.id));
  const visited = new Set<string>();
  const result: LearningModule[] = [];

  function visit(mod: LearningModule) {
    if (visited.has(mod.id)) return;
    visited.add(mod.id);
    for (const prereqId of (mod.prerequisites || [])) {
      if (moduleIds.has(prereqId)) {
        const prereq = modules.find(m => m.id === prereqId);
        if (prereq) visit(prereq);
      }
    }
    result.push(mod);
  }

  for (const mod of modules) {
    visit(mod);
  }
  return result;
}
