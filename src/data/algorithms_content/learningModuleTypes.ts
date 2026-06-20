import { AlgorithmCategory } from "./types";

export interface GlossaryTerm {
  term: string;
  definition: string;
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

// --- Active-learning content types (all optional on LearningModule) ---

export interface QuizOption {
  text: string;                   // inline markdown
  correct: boolean;
}

export interface QuizQuestion {
  question: string;               // markdown + KaTeX
  options: QuizOption[];          // 3-5 options, at least one correct
  explanation: string;            // shown after answering (markdown + KaTeX)
}

export interface ShortAnswerQuestion {
  question: string;               // markdown + KaTeX
  expectedAnswerRubric: string;   // markdown + KaTeX (rubric for self-grading)
}

export interface CaseStudy {
  title: string;
  domain?: string;                // e.g. 'Healthcare', 'Ad ranking'
  scenario: string;               // markdown — real-world setup with real numbers
  approach: string;               // markdown — how the method was applied
  outcome: string;                // markdown — quantified result / lesson learned
  source?: Reference;             // reuse existing Reference type for citation
}

export interface ComparisonRow {
  dimension: string;              // e.g. 'Training cost', 'Interpretability'
  values: string[];               // one inline-markdown cell per method
}

export interface ComparisonTable {
  title?: string;
  methods: string[];              // column headers, e.g. ['SVM', 'Neural Net']
  rows: ComparisonRow[];          // each row.values.length must equal methods.length
  takeaway?: string;              // markdown summary line under the table
}

export interface UsageGuidance {
  useWhen: string[];              // markdown bullets
  avoidWhen: string[];            // markdown bullets
  rulesOfThumb?: string[];        // optional quick heuristics
}

export type TrackId = 'practitioner' | 'modern-ai';
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
  codeSnippet?: string;
  hasVisualization?: boolean;

  // --- New fields (ALL optional so existing files don't break) ---
  tracks?: TrackId[];
  difficulty?: Difficulty;
  estimatedMinutes?: number;
  prerequisites?: string[];         // array of module IDs
  relatedModules?: string[];        // array of module IDs
  learningObjectives?: string[];
  keyTerms?: GlossaryTerm[];
  notationTable?: string;           // markdown table of symbols
  additionalSections?: ContentSection[];
  failureModes?: FailureMode[];
  misconceptions?: Misconception[];
  references?: Reference[];
  review?: ReviewMetadata;

  // --- Active-learning additions (all optional, backward compatible) ---
  quiz?: QuizQuestion[];
  shortAnswerQuestions?: ShortAnswerQuestion[];
  caseStudies?: CaseStudy[];
  comparisons?: ComparisonTable[];
  usageGuidance?: UsageGuidance;
  tldr?: string[];                 // 3-6 bullet quick-review summary points
}
