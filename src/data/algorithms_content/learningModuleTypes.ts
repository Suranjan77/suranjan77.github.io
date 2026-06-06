import { AlgorithmCategory } from "./types";

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface WorkedExample {
  title: string;
  problem: string;       // markdown string with KaTeX math
  solution: string;      // markdown string with KaTeX math
}

export interface Reference {
  title: string;
  authors?: string;
  url?: string;
  doi?: string;
  type: 'textbook' | 'paper' | 'tutorial' | 'documentation' | 'video';
  description?: string;
}

export interface ContentSection {
  heading: string;
  content: string;       // markdown string
}

export interface FailureMode {
  name: string;
  description: string;
  mitigation: string;
}

export interface Misconception {
  claim: string;
  correction: string;
}

export interface ReviewMetadata {
  lastReviewed?: string;   // ISO date string like "2026-06-06"
  reviewedBy?: string;
  status: 'draft' | 'reviewed' | 'published';
}

export type TrackId = 'foundations' | 'practitioner' | 'modern-ai';
export type Difficulty = 1 | 2 | 3 | 4;

export interface LearningModule {
  // --- Existing fields (required — keep for backward compatibility) ---
  id: string;
  title: string;
  category: AlgorithmCategory;
  shortDescription: string;
  fullDescription: string;
  intuition: string;
  mathematics: string;
  pros: string[];
  cons: string[];
  codeSnippet: string;

  // --- New fields (ALL optional so existing files don't break) ---
  tracks?: TrackId[];
  difficulty?: Difficulty;
  estimatedMinutes?: number;
  prerequisites?: string[];         // array of module IDs
  relatedModules?: string[];        // array of module IDs
  learningObjectives?: string[];
  keyTerms?: GlossaryTerm[];
  notationTable?: string;           // markdown table of symbols
  workedExamples?: WorkedExample[];
  additionalSections?: ContentSection[];
  failureModes?: FailureMode[];
  misconceptions?: Misconception[];
  references?: Reference[];
  review?: ReviewMetadata;
}
