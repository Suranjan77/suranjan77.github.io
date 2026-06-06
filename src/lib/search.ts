import { algorithmsList, LearningModule } from '@/data/algorithms_content';

export interface SearchResult {
  module: LearningModule;
  score: number;
}

export function searchModules(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const terms = query.toLowerCase().split(/\s+/);
  const results: SearchResult[] = [];

  for (const mod of algorithmsList) {
    let score = 0;
    const titleLower = mod.title.toLowerCase();
    const descLower = mod.shortDescription.toLowerCase();

    for (const term of terms) {
      if (titleLower.includes(term)) score += 10;
      if (descLower.includes(term)) score += 3;
      if (mod.learningObjectives?.some(o => o.toLowerCase().includes(term))) score += 2;
      if (mod.keyTerms?.some(t => t.term.toLowerCase().includes(term))) score += 5;
    }

    if (score > 0) {
      results.push({ module: mod, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
