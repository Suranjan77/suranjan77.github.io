# Implementation Plan — Single Developer

> **Post-release scope update (2026-06-06):** Learner progress tracking was
> removed because this project is a reference and experimentation site, not a
> learning management system. Historical M6/M10 progress tasks below document
> the original implementation plan but are no longer product requirements.
>
> **Visualization Audit update (2026-06-06):** Following the interactive diagram audit, Milestone 12 has been added to remediate 34 visualization accuracy defects (S3) by adding independent test-local numerical oracles. The actual diagram count is 40.

**Project:** `suranjan77.github.io` — ML Learning Platform
**Implementor:** One person (or one coding agent)
**Structure:** Sequential milestones (not calendar dates)
**Rule:** Do NOT start a milestone until the previous one is complete.

---

## Current State Summary

The site is a Next.js 16 + React 19 application with:

- **22 module data files** in `src/data/algorithms_content/` — each exports an `Algorithm` object with fields: `id`, `title`, `category`, `shortDescription`, `fullDescription`, `intuition`, `mathematics`, `pros`, `cons`, `codeSnippet`.
- **25 visualization components** in `src/components/ui/visualizations/` — one per algorithm, plus infrastructure files. All routed through `D3Visualization.tsx` (a 73KB router file).
- **1 dynamic route** at `src/app/algorithms/[slug]/page.tsx` which renders either `FoundationView.tsx` or a standard view depending on category.
- **2 lab pages:** `/playground` (neural network playground) and `/gradforge`.
- **1 homepage** at `src/app/page.tsx` (83KB).
- **Supplemental data** in `src/data/algorithmSupplemental.ts` — all 22 algorithms have `whenToUse`, `assumptions`, and `references` (with some URLs).
- **9 existing test files** covering: algorithm data, visualizations (accuracy, interactions), component rendering, animation hooks, curriculum explorer, GradForge lab, visualization primitives.
- **Stack:** TypeScript 5, Tailwind CSS v4, D3.js v7, KaTeX, Framer Motion, Vitest, React Testing Library, jsdom.
- **Key large files:** `D3Visualization.tsx` (73KB), `GradForgeLab.tsx` (66KB), `page.tsx` homepage (83KB), `AlgorithmSimulator.tsx` (40KB).
- **Utility files:** `src/lib/algorithmPresentation.ts`, `src/lib/curriculum.ts`, `src/lib/site.ts`, `src/lib/utils.ts`.
- **Layout components:** `AppShell.tsx`, `Header.tsx`, `Sidebar.tsx`.
- **Known issues:**
  - `4_instances_trees.ts` combines KNN + Decision Trees into one record (but separate `KNNViz.tsx` and `DecisionTreeViz.tsx` already exist).
  - `3_linear_regression.ts` may combine Linear + Logistic Regression content (but `LogisticRegressionViz.tsx` exists separately).
  - Homepage filters out RL and Generative Models despite those modules existing.
  - Unknown algorithm IDs silently fall back to a linear-regression visualization.
  - Content schema is too shallow (no prerequisites, objectives, exercises, references with URLs, etc.).
  - `todo.md` is stale — all 5 items listed there are already implemented.

---

## Milestone 0 — Baseline & Inventory

**Goal:** Establish a known-good baseline so nothing breaks silently during later work.

### Tasks

#### M0-T1: Record current build/lint/test baseline
1. Create the directory `docs/baseline/`.
2. Run `npm run build` and save the full terminal output to `docs/baseline/build_output.txt`.
3. Run `npm run lint` and save the full terminal output to `docs/baseline/lint_output.txt`.
4. Run `npm run test` and save the full terminal output to `docs/baseline/test_output.txt`.
5. Create `docs/baseline/BASELINE_SUMMARY.md` with this content:
   - Number of build warnings/errors.
   - Number of lint warnings/errors.
   - Number of tests passing/failing/skipped.
   - Date the baseline was taken.

**Acceptance:** `docs/baseline/` folder exists with all 4 files.

#### M0-T2: Create a module inventory
1. Create `docs/MODULE_INVENTORY.md`.
2. For each of the 22 algorithm files in `src/data/algorithms_content/` (excluding `index.ts` and `types.ts`), record a row in a Markdown table with columns:
   - File name (e.g., `0_1_calculus.ts`)
   - `id` value from the exported object (open the file and read the `id` field)
   - `title` value
   - `category` value
   - Has matching visualization component in `src/components/ui/visualizations/`? (Yes/No)
   - Route slug used in the URL
3. Add a section titled "Combined Modules That Need Splitting" listing:
   - `4_instances_trees.ts` → needs to become separate KNN and Decision Trees files
   - Verify whether `3_linear_regression.ts` covers both linear and logistic regression by reading its content; document findings
4. Add a section titled "Supplemental Data Check" confirming whether `src/data/algorithmSupplemental.ts` has entries for all module IDs.

**Acceptance:** `docs/MODULE_INVENTORY.md` exists with complete table and analysis sections.

#### M0-T3: Fix homepage module filtering
1. Open `src/app/page.tsx`.
2. Search for code that filters or excludes modules from the homepage grid/card list.
3. Find the specific condition that excludes Reinforcement Learning and Generative Models.
4. Remove or fix that filtering condition so **all** modules in `algorithmsList` appear on the homepage.
5. Run `npm run build` to confirm no errors.
6. Run `npm run test` to confirm no test regressions.

**Acceptance:** All modules (including Reinforcement Learning and Generative Models) appear on the homepage. Build and tests pass.

#### M0-T4: Fix unknown algorithm ID fallback
1. Open `src/components/ui/visualizations/D3Visualization.tsx`.
2. Search for the `switch` statement, `if-else` chain, or mapping object that selects which visualization component to render based on the algorithm ID or category.
3. Find the `default` case or fallback that renders `LinearRegressionViz` when the ID is not recognized.
4. Change the fallback to render an explicit error UI instead:
   ```tsx
   <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
     <h3>Visualization Not Found</h3>
     <p>No visualization component exists for algorithm: {algorithmId}</p>
   </div>
   ```
5. Run `npm run test` to confirm existing tests still pass (they should — this only affects unrecognized IDs).

**Acceptance:** Unknown algorithm IDs show an error message instead of the wrong visualization. All existing tests pass.

#### M0-T5: Delete stale todo.md
1. Delete `todo.md` from the project root — all 5 items listed there are already implemented.

**Acceptance:** `todo.md` no longer exists.

### Milestone 0 is DONE when
- `docs/baseline/` folder exists with build, lint, test output, and summary.
- `docs/MODULE_INVENTORY.md` exists with a complete table.
- All modules appear on the homepage.
- Unknown algorithm IDs show an error instead of a wrong visualization.
- `todo.md` is deleted.
- `npm run build` passes.
- `npm run test` passes (same pass/fail count as baseline, or better).

---

## Milestone 1 — Expand the Content Schema

**Goal:** Upgrade the `Algorithm` type so every module can carry structured content (prerequisites, references, etc.) without breaking existing modules.

### Tasks

#### M1-T1: Define the new `LearningModule` type
1. Create a new file `src/data/algorithms_content/learningModuleTypes.ts`.
2. Add these exact TypeScript type definitions:

```ts
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
  category: string;
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
```

3. **Critical:** All new fields MUST have `?` (optional) so every existing module file type-checks without changes.

**Acceptance:** File exists, TypeScript compiles with `npm run build`.

#### M1-T2: Wire up the new type as an extension of the old one
1. Open `src/data/algorithms_content/types.ts`.
2. Add this line at the bottom: `export * from './learningModuleTypes';`
3. Open `src/data/algorithms_content/index.ts`.
4. Add this import at the top: `import { LearningModule } from './learningModuleTypes';`
5. Change the type annotation of `algorithmsList` from implicit to explicit:
   ```ts
   export const algorithmsList: LearningModule[] = [
     calculus,
     linearAlgebra,
     // ... rest unchanged
   ];
   ```
6. Run `npm run build` — it MUST pass because all new fields are optional and `LearningModule` extends `Algorithm`'s shape.
7. Run `npm run test` — all existing tests MUST still pass.

**Acceptance:** `algorithmsList` is typed as `LearningModule[]`. Build and tests pass.

#### M1-T3: Add schema validation tests
1. Create `src/data/algorithms_content/__tests__/schema.test.ts`.
2. Import `algorithmsList` and write these test cases:

```ts
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
```

3. Run `npm run test` — all new tests should pass.

**Acceptance:** Schema validation test file exists with 7 test cases, all passing.

#### M1-T4: Add prerequisite and track data to foundation modules
1. Open each of these files and add the new optional fields. **First read the file to confirm the exact `id` value, then use those exact IDs in prerequisite arrays:**

   **`0_1_calculus.ts`:** Add to the exported object:
   ```ts
   prerequisites: [],
   tracks: ['foundations'],
   difficulty: 1 as const,
   relatedModules: ['linear-algebra', 'probability-theory'],  // verify these IDs!
   ```

   **`0_2_linear_algebra.ts`:**
   ```ts
   prerequisites: [],
   tracks: ['foundations'],
   difficulty: 1 as const,
   relatedModules: ['calculus'],
   ```

   **`0_3_probability_theory.ts`:**
   ```ts
   prerequisites: [],
   tracks: ['foundations'],
   difficulty: 1 as const,
   relatedModules: ['bayesian-inference', 'maximum-likelihood'],  // verify these IDs!
   ```

   **`1_maximum_likelihood.ts`:**
   ```ts
   prerequisites: ['probability-theory'],  // verify this ID!
   tracks: ['foundations'],
   difficulty: 2 as const,
   relatedModules: ['bayesian-inference'],
   ```

   **`2_bayesian.ts`:**
   ```ts
   prerequisites: ['probability-theory'],  // verify this ID!
   tracks: ['foundations'],
   difficulty: 2 as const,
   relatedModules: ['maximum-likelihood'],
   ```

2. **IMPORTANT:** Before adding prerequisite IDs, open each file and check the actual `id` field value. Use those exact values. For example, if `0_3_probability_theory.ts` has `id: 'probability'` instead of `id: 'probability-theory'`, use `'probability'`.
3. Run `npm run test` — the schema validation tests (especially the prerequisite ID and cycle tests) should pass.

**Acceptance:** 5 foundation modules have `prerequisites`, `tracks`, `difficulty`, and `relatedModules`. Schema validation tests pass.

### Milestone 1 is DONE when
- `learningModuleTypes.ts` exists with all types defined.
- `algorithmsList` is typed as `LearningModule[]`.
- Schema validation tests exist (7 test cases) and all pass.
- 5 foundation modules have prerequisites and track data.
- `npm run build` and `npm run test` both pass.

---

## Milestone 2 — Split Combined Modules

**Goal:** Separate the two combined algorithm records so every module has its own ID, route, content, and visualization.

### Tasks

#### M2-T1: Split KNN and Decision Trees
1. Open `src/data/algorithms_content/4_instances_trees.ts` and read the full file.
2. Create `src/data/algorithms_content/4a_knn.ts`:
   - Export a `const knn: LearningModule` (import `LearningModule` from `./learningModuleTypes`).
   - Set `id` to `'knn'`.
   - Set `title` to `'K-Nearest Neighbors'`.
   - Set `category` to `'K-Nearest Neighbors'`.
   - Copy only the KNN-relevant portions from the original file's `shortDescription`, `fullDescription`, `intuition`, `mathematics`, `pros`, `cons`, `codeSnippet`. If the content is interleaved, separate it carefully.
   - Add `prerequisites: ['probability-theory']` (use the actual ID from `0_3_probability_theory.ts`).
   - Add `tracks: ['practitioner']`, `difficulty: 2 as const`.
3. Create `src/data/algorithms_content/4b_decision_trees.ts`:
   - Export a `const decisionTrees: LearningModule`.
   - Set `id` to `'decision-trees'`.
   - Set `title` to `'Decision Trees'`.
   - Set `category` to `'Decision Trees'`.
   - Copy the decision-tree-relevant content from the original file.
   - Add `prerequisites: ['probability-theory']`, `tracks: ['practitioner']`, `difficulty: 2 as const`.
4. Open `src/data/algorithms_content/types.ts`:
   - In the `AlgorithmCategory` union type, remove `"Instance-based Learning & Decision Trees"`.
   - Add `"K-Nearest Neighbors"` and `"Decision Trees"` as new union members.
5. Open `src/data/algorithms_content/index.ts`:
   - Remove the import of `instanceBasedTrees` from `./4_instances_trees`.
   - Add: `import { knn } from './4a_knn';`
   - Add: `import { decisionTrees } from './4b_decision_trees';`
   - In the `algorithmsList` array, replace `instanceBasedTrees` with `knn, decisionTrees`.
6. Open `src/components/ui/visualizations/D3Visualization.tsx`:
   - Find the mapping from category/ID to visualization component.
   - Add a mapping for the new `'knn'` ID or `'K-Nearest Neighbors'` category → `KNNViz`.
   - Add a mapping for `'decision-trees'` ID or `'Decision Trees'` category → `DecisionTreeViz`.
   - Remove or update the old `"Instance-based Learning & Decision Trees"` mapping.
7. Search the entire `src/` directory for any other references to `"Instance-based Learning & Decision Trees"`, `instanceBasedTrees`, or `4_instances_trees`. Update all references.
8. Delete `src/data/algorithms_content/4_instances_trees.ts`.
9. Run `npm run build` and `npm run test`.

**Acceptance:** Two separate module files exist. Both render correctly (each with its own viz). Old file is deleted. Build and tests pass.

#### M2-T2: Handle Linear vs Logistic Regression
1. Open `src/data/algorithms_content/3_linear_regression.ts` and read its entire content.
2. **Decision point:**
   - If the file covers BOTH linear and logistic regression → split it: keep `3_linear_regression.ts` for linear only, create `3b_logistic_regression.ts` for logistic.
   - If the file only covers linear regression → check if a `logistic_regression` content file exists elsewhere. If not, create `3b_logistic_regression.ts` with new content.
3. The logistic regression file should:
   - Have `id: 'logistic-regression'`, `title: 'Logistic Regression'`, `category: 'Logistic Regression'`.
   - Cover: log odds, sigmoid, cross-entropy loss, decision boundaries, multiclass extensions, threshold selection.
   - Have `prerequisites` that include linear regression's ID.
4. Update `AlgorithmCategory` in `types.ts` — add `"Logistic Regression"` if not present.
5. Update `index.ts` to export the new module and add it to `algorithmsList`.
6. Update `D3Visualization.tsx` — map the new logistic regression ID/category to `LogisticRegressionViz.tsx` (which already exists).
7. Run `npm run build` and `npm run test`.

**Acceptance:** Linear and Logistic Regression are separate modules. Each maps to its own visualization. Build and tests pass.

#### M2-T3: Add route redirects for old slugs
1. Open `next.config.ts`.
2. Read the current content to understand the existing structure.
3. Add a `redirects()` function (or extend the existing one):
   ```ts
   async redirects() {
     return [
       {
         source: '/algorithms/instances-trees',  // or whatever the old slug was
         destination: '/algorithms/knn',
         permanent: true,
       },
       // Add any other old slugs that changed
     ];
   }
   ```
4. **Important:** Check the MODULE_INVENTORY.md you created in M0-T2 to find the exact old slug value. It will be the `id` from the deleted `4_instances_trees.ts` file.
5. Run `npm run build` to verify.

**Acceptance:** Old URLs redirect to new ones. Build passes.

### Milestone 2 is DONE when
- KNN and Decision Trees are separate modules with separate content files.
- Logistic Regression has its own content file (separate from Linear Regression).
- Old combined files are deleted.
- `D3Visualization.tsx` routes to the correct visualization for each new module.
- `AlgorithmCategory` union type is updated.
- Redirects exist for old URLs.
- `npm run build` and `npm run test` both pass.
- The homepage shows all modules including the newly split ones.

---

## Milestone 3 — Unified Lesson Page Template

**Goal:** Replace the current split between `FoundationView.tsx` and the standard view with one unified template that renders all the new `LearningModule` fields.

### Tasks

#### M3-T1: Create reusable lesson section components
1. Create the directory `src/components/lesson/`.
2. Create these files — each component receives props and renders a section. If the prop is `undefined` or an empty array, the component returns `null` (renders nothing):

   **`src/components/lesson/PrerequisiteLinks.tsx`**
   - Props: `prerequisites: string[] | undefined`, `allModules: LearningModule[]`
   - Renders: A "Prerequisites" heading followed by a list of links. Each link text is the prerequisite module's title. Each link goes to `/algorithms/{prerequisiteId}`.
   - If `prerequisites` is undefined or empty, return `null`.

   **`src/components/lesson/LearningObjectives.tsx`**
   - Props: `objectives: string[] | undefined`
   - Renders: A "Learning Objectives" heading followed by a numbered `<ol>` list.
   - If undefined or empty, return `null`.

   **`src/components/lesson/NotationTable.tsx`**
   - Props: `notationTable: string | undefined`
   - Renders: The markdown string using the existing `MarkdownRenderer` component (check `src/components/ui/MarkdownRenderer.tsx` for how the project renders markdown).
   - If undefined or empty, return `null`.

   **`src/components/lesson/WorkedExamples.tsx`**
   - Props: `examples: WorkedExample[] | undefined`
   - Renders: Each example as a card with the title, problem (markdown), and a collapsible/expandable solution section. Use a `<details><summary>` element or a state toggle for the collapse.
   - If undefined or empty, return `null`.

   **`src/components/lesson/Misconceptions.tsx`**
   - Props: `misconceptions: Misconception[] | undefined`
   - Renders: Each misconception as a card with "Common Misconception:" prefix for the claim, and "Correction:" prefix for the correction. Use a visually distinct style (e.g., a warning/info card style matching the site's existing card styles).
   - If undefined or empty, return `null`.

   **`src/components/lesson/ReferenceList.tsx`**
   - Props: `references: Reference[] | undefined`
   - Renders: A numbered list of references. Each shows title, authors (if present), and a clickable URL or DOI link (if present). Show the type as a badge/tag.
   - If undefined or empty, return `null`.

   **`src/components/lesson/RelatedModules.tsx`**
   - Props: `relatedModules: string[] | undefined`, `allModules: LearningModule[]`
   - Renders: A "Related Topics" heading followed by clickable links/cards to the related modules.
   - If undefined or empty, return `null`.

   **`src/components/lesson/ModuleNavigation.tsx`**
   - Props: `currentModule: LearningModule`, `allModules: LearningModule[]`
   - Renders: "← Previous" and "Next →" links based on the module's index in `allModules`. Shows the previous/next module's title. If it's the first module, hide "Previous". If it's the last, hide "Next".

   **`src/components/lesson/MetadataBar.tsx`**
   - Props: `difficulty: Difficulty | undefined`, `estimatedMinutes: number | undefined`, `tracks: TrackId[] | undefined`
   - Renders: A horizontal bar with badge-style elements for difficulty level (1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert), estimated reading time, and track names. Only show items that have values.
   - If all props are undefined, return `null`.

3. **Styling:** Match the existing site's dark theme and card styles. Look at `src/app/globals.css` and the existing component files for color variables, spacing, border-radius patterns, etc. Do NOT introduce new design patterns.

**Acceptance:** All 9 component files exist in `src/components/lesson/`. Each handles undefined/empty props by returning null. Build passes.

#### M3-T2: Create the unified `LessonPage` layout component
1. Create `src/components/lesson/LessonPage.tsx`.
2. This component receives: `module: LearningModule` and `allModules: LearningModule[]`.
3. Render sections in this exact order (skip sections where data is undefined/empty — the child components handle this):
   1. `<h1>` with `module.title`
   2. `<MetadataBar>` with difficulty, estimatedMinutes, tracks
   3. `<p>` with `module.shortDescription`
   4. `<PrerequisiteLinks>` with prerequisites and allModules
   5. `<LearningObjectives>` with learningObjectives
   6. Section "Intuition" → render `module.intuition` as markdown
   7. `<NotationTable>` with notationTable
   8. Section "Mathematics" → render `module.mathematics` as markdown (with KaTeX)
   9. `<WorkedExamples>` with workedExamples
   10. Section "In Depth" → render `module.fullDescription` as markdown
   11. Section "Implementation" → render `module.codeSnippet` with syntax highlighting (use the existing `CodeBlock` component from `src/components/ui/CodeBlock.tsx`)
   12. Section "Interactive Visualization" → this is where the existing visualization gets embedded. Import and use the existing visualization rendering mechanism. Check how `src/app/algorithms/[slug]/page.tsx` currently embeds visualizations and replicate that approach.
   13. Section "Strengths" → render `module.pros` as a list
   14. Section "Limitations" → render `module.cons` as a list
   15. `<Misconceptions>` with misconceptions
   16. `<ReferenceList>` with references
   17. `<RelatedModules>` with relatedModules and allModules
   18. `<ModuleNavigation>` with currentModule and allModules
4. Use the existing markdown rendering approach from the project (check how `MarkdownRenderer.tsx` or `react-markdown` with `remark-math` and `rehype-katex` is used elsewhere).

**Acceptance:** `LessonPage.tsx` exists and compiles. Build passes.

#### M3-T3: Replace the algorithm page with the unified layout
1. Open `src/app/algorithms/[slug]/page.tsx` — read it fully to understand current rendering logic.
2. Replace the rendering logic:
   - Import `LessonPage` from `@/components/lesson/LessonPage`.
   - Import `algorithmsList` from `@/data/algorithms_content`.
   - Keep the existing slug-to-module lookup logic.
   - Keep the existing metadata generation (title, description for SEO).
   - Replace the JSX that currently switches between `FoundationView` and the standard view with: `<LessonPage module={module} allModules={algorithmsList} />`.
3. **Do NOT delete `FoundationView.tsx` yet** — just stop using it. It can be deleted in a later cleanup.
4. Run `npm run build` — must pass.
5. Run `npm run test` — must pass.
6. Manually verify by running `npm run dev` and checking:
   - `/algorithms/calculus` (a foundation module)
   - `/algorithms/clustering` (a standard module)
   - Both should render without errors and show the existing content.

**Acceptance:** All algorithm pages use the unified layout. No more Foundation vs Standard split. Build and tests pass.

#### M3-T4: Enrich 2 reference modules with full new-schema data
Pick **Calculus** and one other module (e.g., **Clustering**) to demonstrate the full enriched layout.

For each, open the content file and add these fields:
1. `learningObjectives`: 3-5 strings starting with action verbs. Example for Calculus:
   ```ts
   learningObjectives: [
     'Compute derivatives of common functions using differentiation rules',
     'Explain the geometric meaning of a gradient vector',
     'Apply the chain rule to compute gradients through composed functions',
     'Distinguish between partial derivatives and the full gradient',
   ],
   ```
2. `keyTerms`: 3-5 terms with definitions. Example:
   ```ts
   keyTerms: [
     { term: 'Derivative', definition: 'The instantaneous rate of change of a function with respect to its input.' },
     { term: 'Gradient', definition: 'A vector of partial derivatives pointing in the direction of steepest ascent.' },
     { term: 'Chain Rule', definition: 'A formula for computing the derivative of a composed function.' },
   ],
   ```
3. `workedExamples`: At least 1 with problem and solution in markdown. Example:
   ```ts
   workedExamples: [
     {
       title: 'Derivative of Mean Squared Error',
       problem: 'Given $L(w) = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - wx_i)^2$, compute $\\frac{dL}{dw}$.',
       solution: 'Apply the chain rule: $\\frac{dL}{dw} = \\frac{1}{n}\\sum_{i=1}^{n} 2(y_i - wx_i)(-x_i) = -\\frac{2}{n}\\sum_{i=1}^{n} x_i(y_i - wx_i)$.',
     },
   ],
   ```
4. `misconceptions`: At least 2.
5. `references`: At least 2, each with a `url` field.
6. `failureModes`: At least 1.
7. `estimatedMinutes`: A reasonable number (e.g., 30).

Run `npm run build` and verify the enriched pages render correctly — new sections should appear.

**Acceptance:** Calculus and one other module show the enriched content (objectives, examples, references etc.) on their lesson pages.

### Milestone 3 is DONE when
- All 9 lesson section components exist in `src/components/lesson/`.
- `LessonPage.tsx` exists and renders a unified layout.
- `src/app/algorithms/[slug]/page.tsx` uses the unified layout.
- 2 modules demonstrate the enriched content.
- All other modules still render correctly (graceful fallback for missing optional fields).
- `npm run build` and `npm run test` both pass.

---

## Milestone 4 — Visualization Platform Improvements

**Goal:** Add shared utilities that improve visualization consistency, testability, and accessibility.

### Tasks

#### M4-T1: Add deterministic seeded PRNG utility
1. Create `src/lib/prng.ts`:
   ```ts
   /**
    * Mulberry32 — a simple, fast, deterministic PRNG.
    * Same seed always produces the same sequence.
    */
   export function createSeededRNG(seed: number) {
     let state = seed | 0;

     function next(): number {
       state = (state + 0x6d2b79f5) | 0;
       let t = Math.imul(state ^ (state >>> 15), 1 | state);
       t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
       return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
     }

     function nextInt(min: number, max: number): number {
       return Math.floor(next() * (max - min + 1)) + min;
     }

     function nextGaussian(): number {
       // Box-Muller transform
       const u1 = next();
       const u2 = next();
       return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
     }

     return { next, nextInt, nextGaussian };
   }
   ```
2. Create `src/lib/__tests__/prng.test.ts`:
   ```ts
   import { describe, it, expect } from 'vitest';
   import { createSeededRNG } from '../prng';

   describe('Seeded PRNG', () => {
     it('same seed produces same sequence', () => {
       const rng1 = createSeededRNG(42);
       const rng2 = createSeededRNG(42);
       for (let i = 0; i < 100; i++) {
         expect(rng1.next()).toBe(rng2.next());
       }
     });

     it('different seeds produce different sequences', () => {
       const rng1 = createSeededRNG(42);
       const rng2 = createSeededRNG(99);
       // At least one of the first 10 values should differ
       let allSame = true;
       for (let i = 0; i < 10; i++) {
         if (rng1.next() !== rng2.next()) allSame = false;
       }
       expect(allSame).toBe(false);
     });

     it('nextInt stays within bounds', () => {
       const rng = createSeededRNG(123);
       for (let i = 0; i < 1000; i++) {
         const val = rng.nextInt(5, 10);
         expect(val).toBeGreaterThanOrEqual(5);
         expect(val).toBeLessThanOrEqual(10);
       }
     });

     it('next() produces values in [0, 1)', () => {
       const rng = createSeededRNG(7);
       for (let i = 0; i < 1000; i++) {
         const val = rng.next();
         expect(val).toBeGreaterThanOrEqual(0);
         expect(val).toBeLessThan(1);
       }
     });
   });
   ```
3. Run `npm run test` — all 4 new tests should pass.

**Acceptance:** `src/lib/prng.ts` and its test file exist. Tests pass.

#### M4-T2: Add a visualization error boundary component
1. Create `src/components/ui/visualizations/VisualizationErrorBoundary.tsx`:
   ```tsx
   'use client';
   import React, { Component, ReactNode } from 'react';

   interface Props {
     children: ReactNode;
     algorithmId?: string;
   }

   interface State {
     hasError: boolean;
     error: Error | null;
   }

   export class VisualizationErrorBoundary extends Component<Props, State> {
     constructor(props: Props) {
       super(props);
       this.state = { hasError: false, error: null };
     }

     static getDerivedStateFromError(error: Error): State {
       return { hasError: true, error };
     }

     componentDidCatch(error: Error, info: React.ErrorInfo) {
       console.error('Visualization error:', error, info);
     }

     handleReset = () => {
       this.setState({ hasError: false, error: null });
     };

     render() {
       if (this.state.hasError) {
         return (
           <div style={{
             padding: '2rem',
             textAlign: 'center',
             border: '1px solid rgba(239, 68, 68, 0.3)',
             borderRadius: '0.5rem',
             backgroundColor: 'rgba(239, 68, 68, 0.1)',
           }}>
             <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>
               Visualization Error
             </h3>
             <p style={{ color: '#a1a1aa', marginBottom: '1rem' }}>
               This visualization encountered an error. Please try resetting or refreshing the page.
             </p>
             <button
               onClick={this.handleReset}
               style={{
                 padding: '0.5rem 1rem',
                 borderRadius: '0.25rem',
                 border: '1px solid #ef4444',
                 backgroundColor: 'transparent',
                 color: '#ef4444',
                 cursor: 'pointer',
               }}
             >
               Reset Visualization
             </button>
           </div>
         );
       }
       return this.props.children;
     }
   }
   ```
2. In `LessonPage.tsx` (created in M3), wrap the visualization embed with this error boundary:
   ```tsx
   <VisualizationErrorBoundary algorithmId={module.id}>
     {/* existing visualization embed */}
   </VisualizationErrorBoundary>
   ```
3. Run `npm run build`.

**Acceptance:** Error boundary component exists and wraps the visualization in the lesson page. Build passes.

#### M4-T3: Add reduced-motion and viewport-visibility hooks
1. Create `src/lib/useReducedMotion.ts`:
   ```ts
   'use client';
   import { useState, useEffect } from 'react';

   export function useReducedMotion(): boolean {
     const [prefersReduced, setPrefersReduced] = useState(false);

     useEffect(() => {
       const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
       setPrefersReduced(mql.matches);

       const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
       mql.addEventListener('change', handler);
       return () => mql.removeEventListener('change', handler);
     }, []);

     return prefersReduced;
   }
   ```
2. Create `src/lib/useIsVisible.ts`:
   ```ts
   'use client';
   import { useState, useEffect, RefObject } from 'react';

   export function useIsVisible(ref: RefObject<HTMLElement | null>): boolean {
     const [isVisible, setIsVisible] = useState(false);

     useEffect(() => {
       const element = ref.current;
       if (!element) return;

       const observer = new IntersectionObserver(
         ([entry]) => setIsVisible(entry.isIntersecting),
         { threshold: 0.1 }
       );

       observer.observe(element);
       return () => observer.disconnect();
     }, [ref]);

     return isVisible;
   }
   ```
3. Run `npm run build`.

**Acceptance:** Both hook files exist. Build passes.

#### M4-T4: Install and configure Cypress with initial smoke tests
1. Install Cypress as a dev dependency:
   ```bash
   npm install --save-dev cypress
   ```
2. Run Cypress once to generate the default folder structure:
   ```bash
   npx cypress open
   ```
   Then close it. This creates the `cypress/` directory with `e2e/`, `fixtures/`, and `support/` subdirectories.
3. Create `cypress.config.ts` in the project root:
   ```ts
   import { defineConfig } from 'cypress';

   export default defineConfig({
     e2e: {
       baseUrl: 'http://localhost:3000',
       viewportWidth: 1280,
       viewportHeight: 720,
       defaultCommandTimeout: 10000,
       video: false,
       screenshotOnRunFailure: true,
       setupNodeEvents(on, config) {
         // future event listeners go here
       },
     },
   });
   ```
4. Create `cypress/support/e2e.ts` (Cypress loads this before every E2E test):
   ```ts
   // Global setup for all E2E tests
   // Add custom commands here in the future

   // Suppress uncaught exceptions from the app that would fail tests
   Cypress.on('uncaught:exception', (err) => {
     // Return false to prevent Cypress from failing the test on app errors
     // We will have specific tests for error handling instead
     if (err.message.includes('NEXT_NOT_FOUND')) return false;
     return true;
   });
   ```
5. Add Cypress scripts to `package.json` under `"scripts"`:
   ```json
   "cy:open": "cypress open",
   "cy:run": "cypress run",
   "test:e2e": "start-server-and-test dev http://localhost:3000 cy:run"
   ```
6. Install `start-server-and-test` as a dev dependency (it starts the dev server, waits for it, runs Cypress, then shuts down):
   ```bash
   npm install --save-dev start-server-and-test
   ```
7. Create the first smoke test file `cypress/e2e/smoke.cy.ts`:
   ```ts
   describe('Smoke Tests', () => {
     it('homepage loads successfully', () => {
       cy.visit('/');
       cy.get('h1').should('exist');
       // Page should contain at least some module cards/links
       cy.get('a[href*="/algorithms/"]').should('have.length.greaterThan', 0);
     });

     it('a foundation module page loads without errors', () => {
       // Visit the first algorithm — read the actual slug from the homepage link
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();
       // The page should have a heading with the module title
       cy.get('h1').should('exist').and('not.be.empty');
       // The page should not show a Next.js error overlay
       cy.get('#__next-build-error').should('not.exist');
     });

     it('a module page contains a visualization section', () => {
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();
       // There should be an SVG element (the visualization) or a visualization container
       cy.get('svg, [data-testid="visualization"]').should('exist');
     });

     it('playground page loads', () => {
       cy.visit('/playground');
       cy.get('h1, h2').should('exist');
     });

     it('gradforge page loads', () => {
       cy.visit('/gradforge');
       cy.get('h1, h2').should('exist');
     });

     it('404 page shows for invalid route', () => {
       cy.visit('/algorithms/this-does-not-exist', { failOnStatusCode: false });
       // Should show some kind of not-found message, not a blank page or crash
       cy.contains(/not found|404|doesn't exist/i).should('exist');
     });
   });
   ```
8. Test it works:
   - In one terminal, run `npm run dev` and wait for it to start.
   - In another terminal, run `npx cypress run` — all 6 smoke tests should pass.
   - Stop the dev server.
9. Add `cypress/videos/`, `cypress/screenshots/`, and `cypress/downloads/` to `.gitignore`:
   ```
   # Cypress artifacts
   cypress/videos
   cypress/screenshots
   cypress/downloads
   ```

**Acceptance:** Cypress is installed and configured. `cypress.config.ts` exists. 6 smoke tests in `cypress/e2e/smoke.cy.ts` pass when run against the dev server. `.gitignore` updated.

### Milestone 4 is DONE when
- `src/lib/prng.ts` exists with tests (4 test cases pass).
- `VisualizationErrorBoundary.tsx` exists and is used in `LessonPage.tsx`.
- `useReducedMotion.ts` and `useIsVisible.ts` exist.
- Cypress is installed with `cypress.config.ts` and 6 smoke tests passing.
- `npm run build` and `npm run test` both pass.

---

## Milestone 5 — Enrich Existing Module Content

**Goal:** Add the new structured fields (objectives, prerequisites, references, misconceptions, worked examples) to ALL existing modules.

### Content Guidelines (apply to every module)

For each module, add these fields:

- **`learningObjectives`**: 3-5 strings. Each must start with an action verb (Compute, Explain, Identify, Compare, Apply, Derive, Distinguish, Implement). Each must be specific. Example: `"Compute the posterior distribution for a beta-binomial model given observed data"`. Do NOT use vague objectives like `"Understand Bayesian inference"`.
- **`keyTerms`**: 3-5 terms with one-sentence definitions. Use the module's existing content to identify the key vocabulary.
- **`workedExamples`**: At least 1 per module. Must include a concrete numeric problem and step-by-step solution. Use KaTeX math in the markdown strings. Pull from the module's existing `mathematics` content.
- **`misconceptions`**: At least 2 per module. Format: `{ claim: "...", correction: "..." }`. The claim should be something a student might incorrectly believe. The correction should be specific.
- **`references`**: At least 2 per module. Check `src/data/algorithmSupplemental.ts` — it already has references for every module. Copy those references over and add `url` fields where possible. At least one reference per module should have a URL.
- **`failureModes`**: At least 1 per module describing when the algorithm fails or gives bad results, and how to mitigate.
- **`estimatedMinutes`**: Number between 15 and 60. Foundation modules: 20-30. Standard modules: 30-45. Advanced modules: 40-60.
- **`prerequisites`**: Array of other module IDs. Check the actual `id` values in the files. Foundation modules (calculus, linear algebra, probability) have `[]`. Others should list what should be studied first.
- **`tracks`**: `['foundations']` for math foundations, `['practitioner']` for classical ML, `['modern-ai']` for deep learning and beyond.
- **`difficulty`**: `1` for intro/foundations, `2` for intermediate, `3` for advanced, `4` for expert.
- **`relatedModules`**: Array of related module IDs.

### Tasks

#### M5-T1: Enrich foundation modules
Enrich these files (Calculus may already be done from M3-T4):
1. `0_2_linear_algebra.ts`
2. `0_3_probability_theory.ts`
3. `1_maximum_likelihood.ts`
4. `2_bayesian.ts`

After each file, run `npm run test` to verify schema tests pass.

#### M5-T2: Enrich supervised learning modules
Enrich these files:
1. `3_linear_regression.ts`
2. `3b_logistic_regression.ts` (created in M2)
3. `4a_knn.ts` (created in M2)
4. `4b_decision_trees.ts` (created in M2)
5. `6_svm.ts`
6. `7_ensemble.ts`

After each file, run `npm run test`.

#### M5-T3: Enrich unsupervised and probabilistic modules
Enrich:
1. `5_clustering.ts`
2. `8_dimensionality.ts`
3. `9_mcmc.ts`

#### M5-T4: Enrich deep learning and modern AI modules
Enrich:
1. `10_neural_networks.ts`
2. `11_cnn.ts`
3. `12_computer_vision.ts`
4. `13_nlp.ts`
5. `14_autoencoders.ts`
6. `15_transformers.ts`
7. `16_llms.ts`

For these, set `tracks: ['modern-ai']`.

#### M5-T5: Enrich remaining modules
Enrich:
1. `17_reinforcement_learning.ts`
2. `18_bias_variance.ts`
3. `19_generative_models.ts`
4. `20_regularization.ts`
5. `21_evaluation_metrics.ts`

#### M5-T6: Final validation
1. Run `npm run build` — must pass.
2. Run `npm run test` — all schema validation tests must pass, including:
   - All prerequisite IDs are valid.
   - No prerequisite cycles.
   - All module IDs are unique.
3. Spot-check 5 different module pages by running `npm run dev` and visiting them in the browser.

### Milestone 5 is DONE when
- Every module in `algorithmsList` has: `learningObjectives` (≥3), `keyTerms` (≥3), `workedExamples` (≥1), `misconceptions` (≥2), `references` (≥2 with at least 1 URL), `estimatedMinutes`, `failureModes` (≥1), `prerequisites`, `tracks`, `difficulty`, `relatedModules`.
- Schema validation tests pass with no errors.
- `npm run build` and `npm run test` both pass.

---

## Milestone 6 — Navigation, Search, and Progress

**Goal:** Add prerequisite-based navigation, module search, and local progress tracking.

### Tasks

#### M6-T1: Build prerequisite graph utilities
1. Create `src/lib/prerequisiteGraph.ts`:
   ```ts
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
   ```
2. Create `src/lib/__tests__/prerequisiteGraph.test.ts` with tests:
   - `getModuleById` returns the correct module for a known ID.
   - `getModuleById` returns undefined for an unknown ID.
   - `getTrackModules('foundations')` returns only foundation modules.
   - Foundation modules appear before modules that depend on them in the sorted result.

**Acceptance:** Utility file and tests exist. Tests pass.

#### M6-T2: Build track pages
1. Create `src/app/tracks/page.tsx`:
   - Import `algorithmsList` and `TrackId`.
   - Define the 3 tracks with metadata:
     ```ts
     const tracks = [
       { id: 'foundations' as TrackId, title: 'Mathematical Foundations', description: 'Core mathematics for machine learning: calculus, linear algebra, probability, and statistical inference.' },
       { id: 'practitioner' as TrackId, title: 'ML Practitioner', description: 'Classical machine learning algorithms: regression, classification, clustering, and model evaluation.' },
       { id: 'modern-ai' as TrackId, title: 'Modern AI', description: 'Deep learning, transformers, large language models, and modern AI systems.' },
     ];
     ```
   - Render each track as a card showing: title, description, number of modules in that track.
   - Each card links to `/tracks/{trackId}`.
   - Match the existing site styling (dark theme, card patterns from the homepage).

2. Create `src/app/tracks/[trackId]/page.tsx`:
   - Read `trackId` from params.
   - Use `getTrackModules(trackId)` to get the sorted module list.
   - Render each module as a row/card showing: title, difficulty badge, estimated time, short description.
   - Each row links to `/algorithms/{moduleId}`.
   - Show a "Track not found" message for invalid trackIds.

3. Add a link to the tracks page from the site header:
   - Open `src/components/layout/Header.tsx`.
   - Add a navigation link: `<Link href="/tracks">Tracks</Link>`.

**Acceptance:** `/tracks` page shows 3 track cards. `/tracks/foundations` (and others) shows modules in order. Header has a "Tracks" link. Build passes.

#### M6-T3: Add local progress storage
1. Create `src/lib/progress.ts`:
   ```ts
   export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

   export interface ModuleProgress {
     status: ProgressStatus;
     lastVisited?: string;  // ISO date string
     version: 1;
   }

   const STORAGE_KEY = 'ml-learning-progress-v1';

   function getStore(): Record<string, ModuleProgress> {
     if (typeof window === 'undefined') return {};
     try {
       const raw = localStorage.getItem(STORAGE_KEY);
       return raw ? JSON.parse(raw) : {};
     } catch {
       return {};
     }
   }

   function saveStore(store: Record<string, ModuleProgress>) {
     if (typeof window === 'undefined') return;
     localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
   }

   export function getProgress(moduleId: string): ModuleProgress {
     const store = getStore();
     return store[moduleId] || { status: 'not_started', version: 1 };
   }

   export function setProgress(moduleId: string, status: ProgressStatus) {
     const store = getStore();
     store[moduleId] = {
       status,
       lastVisited: new Date().toISOString(),
       version: 1,
     };
     saveStore(store);
   }

   export function getAllProgress(): Record<string, ModuleProgress> {
     return getStore();
   }

   export function clearProgress() {
     if (typeof window === 'undefined') return;
     localStorage.removeItem(STORAGE_KEY);
   }
   ```

2. In `LessonPage.tsx`, add a `useEffect` that marks the module as `'in_progress'` when the page opens:
   ```tsx
   useEffect(() => {
     setProgress(module.id, 'in_progress');
   }, [module.id]);
   ```
   Import `setProgress` from `@/lib/progress`.

**Acceptance:** Progress is saved to localStorage when visiting a module. `getProgress` and `getAllProgress` work correctly.

#### M6-T4: Add search functionality
1. Create `src/lib/search.ts`:
   ```ts
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
   ```

2. Create `src/components/SearchBar.tsx`:
   - A search input field with a dropdown results list.
   - Uses `searchModules()` on each keystroke (debounced to 200ms).
   - Shows matching module titles as clickable links to `/algorithms/{id}`.
   - Shows "No results found" when the query has text but no matches.
   - Closes the dropdown when clicking outside.
   - **Styling:** Match the site's dark theme. Use a semi-transparent backdrop for the dropdown.

3. Add `<SearchBar />` to the site header:
   - Open `src/components/layout/Header.tsx`.
   - Import and render `<SearchBar />` in the header.

**Acceptance:** Search bar in header. Typing returns relevant modules. Clicking a result navigates to the module page. Build passes.

#### M6-T5: Update ModuleNavigation to use track ordering
1. Update `src/components/lesson/ModuleNavigation.tsx`:
   - Instead of using the raw `algorithmsList` index for prev/next, use the module's primary track.
   - Get the sorted track modules using `getTrackModules(module.tracks?.[0])`.
   - Find the current module's position in that sorted list.
   - Show "← Previous" and "Next →" with the adjacent modules from that track.
   - If the module has no track, fall back to the `algorithmsList` order.

**Acceptance:** Previous/Next navigation follows track ordering. Build passes.

### Milestone 6 is DONE when
- Track pages exist at `/tracks` and `/tracks/[trackId]`.
- Local progress is saved to localStorage when visiting a module.
- A search bar exists in the site header and returns relevant results.
- Previous/Next navigation works using track ordering.
- `npm run build` and `npm run test` both pass.

---

## Milestone 7 — New Essential Modules (Batch 1: Foundations & Training)

**Goal:** Add 3 new modules that fill critical gaps in the curriculum.

### General Process for Each New Module

1. Create a content file in `src/data/algorithms_content/` with ALL `LearningModule` fields filled (not optional — new modules should be complete from the start).
2. Add the new category string to `AlgorithmCategory` union in `types.ts`.
3. Add the import and array entry in `index.ts`.
4. Create a visualization component in `src/components/ui/visualizations/`. If a full interactive D3 visualization is too complex, create a component that renders a meaningful static or semi-interactive display (e.g., a table, chart, or formula diagram using SVG). Do NOT leave it as just a text placeholder.
5. Update `D3Visualization.tsx` to route to the new visualization component.
6. Run `npm run build` and `npm run test` after each module.

### Tasks

#### M7-T1: Statistics and Estimation module
- **File:** `src/data/algorithms_content/22_statistics_estimation.ts`
- **id:** `'statistics-estimation'`
- **title:** `'Statistics and Estimation'`
- **category:** `'Statistics and Estimation'`
- **Content:** Descriptive statistics (mean, median, mode, variance, standard deviation), sampling distributions, point estimators, bias and consistency, standard error, confidence intervals, bootstrap method, hypothesis testing basics (null/alternative, p-values, type I/II errors).
- **prerequisites:** Use the actual probability theory module ID.
- **tracks:** `['foundations']`
- **difficulty:** `2`
- **Visualization file:** `src/components/ui/visualizations/StatisticsViz.tsx`
  - Show a bootstrap sampling demonstration: display a sample of points, repeatedly resample with replacement, build a histogram of the bootstrapped statistic (e.g., mean), show the confidence interval.
  - Controls: sample size slider (10-100), number of bootstrap samples slider (100-5000), seed input, statistic selector (mean/median).
  - Metric: bootstrap confidence interval bounds.

#### M7-T2: Gradient Descent and Optimization module
- **File:** `src/data/algorithms_content/23_gradient_descent.ts`
- **id:** `'gradient-descent'`
- **title:** `'Gradient Descent and Optimization'`
- **category:** `'Gradient Descent and Optimization'`
- **Content:** Objective/loss functions, gradients as directions, learning rate, batch vs mini-batch vs stochastic gradient descent, momentum, Adam optimizer, learning rate schedules, saddle points, local minima, convergence criteria.
- **prerequisites:** Use the actual calculus module ID.
- **tracks:** `['foundations']`
- **difficulty:** `2`
- **Visualization file:** `src/components/ui/visualizations/GradientDescentViz.tsx`
  - Show optimizer trajectories on a 2D contour plot of a loss surface.
  - Controls: optimizer selector (SGD, SGD+Momentum, Adam), learning rate slider, surface preset (bowl, saddle, Rosenbrock), seed.
  - Metric: current loss value, number of steps taken.

#### M7-T3: Data Preparation and Feature Engineering module
- **File:** `src/data/algorithms_content/24_data_preparation.ts`
- **id:** `'data-preparation'`
- **title:** `'Data Preparation and Feature Engineering'`
- **category:** `'Data Preparation and Feature Engineering'`
- **Content:** Data types, handling missing values (drop/impute), encoding categorical features (one-hot, label), scaling methods (standard, min-max, robust), train/test splitting, data leakage, feature engineering basics, pipeline patterns.
- **prerequisites:** `[]`
- **tracks:** `['practitioner']`
- **difficulty:** `1`
- **Visualization file:** `src/components/ui/visualizations/DataPreparationViz.tsx`
  - Show the effect of different scaling methods on a small dataset visualized as a scatter plot.
  - Controls: scaling method selector (none, standardization, min-max, robust), toggle to introduce data leakage, toggle missing values.
  - Metric: show before/after distributions.

### Milestone 7 is DONE when
- 3 new module files exist with complete `LearningModule` data (all fields filled).
- Each has a working visualization component.
- All 3 appear on the homepage and in their respective track pages.
- Schema validation tests pass (prerequisite IDs valid, no cycles).
- `npm run build` and `npm run test` both pass.

---

## Milestone 8 — New Essential Modules (Batch 2: Supervised & Probabilistic)

**Goal:** Add 4 modules filling gaps in supervised learning and probabilistic methods.

### Tasks

Follow the same General Process from Milestone 7 for each module.

#### M8-T1: Naive Bayes module
- **File:** `src/data/algorithms_content/25_naive_bayes.ts`
- **id:** `'naive-bayes'`
- **Content:** Conditional independence assumption, Bayes theorem application, Gaussian/multinomial/Bernoulli variants, Laplace smoothing, log-space computation, text classification example, calibration issues.
- **prerequisites:** `['probability-theory', 'bayesian-inference']` (use actual IDs)
- **tracks:** `['practitioner']`, **difficulty:** `2`
- **Visualization:** Per-feature likelihood accumulation showing how evidence from each feature contributes to the posterior.

#### M8-T2: Model Selection and Cross-Validation module
- **File:** `src/data/algorithms_content/26_model_selection.ts`
- **id:** `'model-selection'`
- **Content:** Holdout validation, k-fold cross-validation, stratified k-fold, leave-one-out, nested CV, hyperparameter search (grid, random, Bayesian intro), selection bias, learning curves, model comparison.
- **prerequisites:** `['evaluation-metrics']` (use actual ID)
- **tracks:** `['practitioner']`, **difficulty:** `2`
- **Visualization:** Animated fold assignment showing how data is split across folds, with resulting per-fold and average scores.

#### M8-T3: Gaussian Mixtures and EM module
- **File:** `src/data/algorithms_content/27_gmm_em.ts`
- **id:** `'gmm-em'`
- **Content:** Mixture models motivation, latent variables, responsibilities (soft assignments), E-step, M-step, covariance parameterizations, initialization strategies, local optima, BIC/AIC for model selection, connection to K-means as a special case.
- **prerequisites:** `['clustering', 'maximum-likelihood']` (use actual IDs)
- **tracks:** `['practitioner']`, **difficulty:** `3`
- **Visualization:** Step-by-step EM iteration showing responsibilities and Gaussian components updating.

#### M8-T4: Anomaly Detection module
- **File:** `src/data/algorithms_content/28_anomaly_detection.ts`
- **id:** `'anomaly-detection'`
- **Content:** Statistical thresholds (z-score, IQR), isolation forest intuition, one-class SVM, autoencoder-based scoring, contamination ratio, evaluation challenges (few labels), precision at review capacity, concept drift.
- **prerequisites:** `['clustering']` (use actual ID)
- **tracks:** `['practitioner']`, **difficulty:** `2`
- **Visualization:** Compare anomaly scoring methods on a 2D dataset with adjustable contamination.

### Milestone 8 is DONE when
- 4 new module files exist with complete data.
- Each has a working visualization component.
- Schema validation tests pass.
- `npm run build` and `npm run test` both pass.

---

## Milestone 9 — New Essential Modules (Batch 3: Deep Learning & Modern AI)

**Goal:** Add 7 modules covering deep learning specifics and modern AI topics.

### Tasks

Follow the same General Process from Milestone 7 for each module.

#### M9-T1: Backpropagation module
- **id:** `'backpropagation'`
- **Content:** Computational graphs, local derivatives at each node, chain rule in reverse, vector-Jacobian products, parameter sharing, gradient accumulation, gradient checking with finite differences, common implementation errors (forgetting to zero gradients, wrong graph attachment).
- **prerequisites:** `['calculus', 'neural-networks']` (use actual IDs)
- **tracks:** `['modern-ai']`, **difficulty:** `3`
- **Visualization:** A small computational graph (3-4 nodes) with numeric values. Show forward pass values and backward pass gradients at each node.

#### M9-T2: Sequence Models module
- **id:** `'sequence-models'`
- **Content:** Sequence data, RNNs, hidden state, backpropagation through time, vanishing/exploding gradients, LSTM (gates: forget, input, output), GRU, teacher forcing, bidirectional RNNs, transition to attention mechanisms.
- **prerequisites:** `['neural-networks']` (use actual ID)
- **tracks:** `['modern-ai']`, **difficulty:** `3`
- **Visualization:** RNN unrolled through time showing hidden state values and gradient magnitude at each timestep.

#### M9-T3: Embeddings and Tokenization module
- **id:** `'embeddings-tokenization'`
- **Content:** Character-level, word-level, subword tokenization (BPE intuition), vocabulary size tradeoffs, unknown/OOV tokens, embedding lookup tables, static embeddings (Word2Vec/GloVe intuition), contextual embeddings, cosine similarity, embedding bias, dimensionality.
- **prerequisites:** `['nlp', 'linear-algebra']` (use actual IDs)
- **tracks:** `['modern-ai']`, **difficulty:** `2`
- **Visualization:** Live tokenization of user-input text showing token boundaries and IDs. Show embedding similarity between selected tokens.

#### M9-T4: Retrieval-Augmented Generation module
- **id:** `'rag'`
- **Content:** Motivation (knowledge cutoff, hallucination), document chunking strategies, embedding-based indexing, retrieval (dense/sparse), reranking, context window construction, grounded generation, citation, evaluation (retrieval quality, answer quality), prompt injection risks, freshness/staleness.
- **prerequisites:** `['llms', 'embeddings-tokenization']` (use actual IDs)
- **tracks:** `['modern-ai']`, **difficulty:** `3`
- **Visualization:** End-to-end retrieval pipeline diagram with toggleable failure modes (bad chunking, irrelevant retrieval, hallucinated answer).

#### M9-T5: Fine-Tuning and Preference Optimization module
- **id:** `'fine-tuning'`
- **Content:** Supervised fine-tuning (SFT), full vs parameter-efficient fine-tuning, LoRA/adapters, reward modeling, RLHF pipeline intuition, DPO as a simpler alternative, catastrophic forgetting, evaluation after fine-tuning, data quality for fine-tuning.
- **prerequisites:** `['llms']` (use actual ID)
- **tracks:** `['modern-ai']`, **difficulty:** `3`
- **Visualization:** Diagram showing which parameters are updated in full fine-tuning vs LoRA. Show the scale difference.

#### M9-T6: LLM Evaluation and Safety module
- **id:** `'llm-evaluation-safety'`
- **Content:** Task-specific metrics (BLEU, ROUGE, exact match), human evaluation, LLM-as-judge, benchmark contamination, robustness testing, hallucination detection, prompt injection, bias in outputs, privacy risks, red teaming methodology, monitoring in production.
- **prerequisites:** `['llms']` (use actual ID)
- **tracks:** `['modern-ai']`, **difficulty:** `3`
- **Visualization:** Evaluation matrix comparing models across quality, safety, cost, and latency dimensions.

#### M9-T7: AI Inference Systems module
- **id:** `'ai-inference'`
- **Content:** Precision formats (FP32, FP16, INT8, INT4), quantization methods, batching (static, dynamic, continuous), latency vs throughput tradeoff, KV cache and memory, context length scaling, speculative decoding intuition, memory estimation formula (params × precision + KV cache), serving architectures.
- **prerequisites:** `['transformers', 'llms']` (use actual IDs)
- **tracks:** `['modern-ai']`, **difficulty:** `3`
- **Visualization:** Memory and latency calculator. User inputs: parameter count, precision, sequence length, batch size. Shows: total memory, KV cache size, estimated tokens/second.

### Milestone 9 is DONE when
- 7 new module files exist with complete data.
- Each has a working visualization component.
- Schema validation tests pass.
- `npm run build` and `npm run test` both pass.
- Total module count is 40 modules.

---

## Milestone 10 — Quality, Accessibility, and Testing

**Goal:** Add automated quality checks, accessibility improvements, and strengthen testing.

### Tasks

#### M10-T1: Add comprehensive content validation tests
1. Create `src/data/__tests__/contentValidation.test.ts`.
2. Write tests that iterate over EVERY module in `algorithmsList` and verify:
   ```ts
   it('every module has at least 3 learning objectives', () => { ... });
   it('every module has at least 1 worked example', () => { ... });
   it('every module has at least 2 references', () => { ... });
   it('every reference has a non-empty title', () => { ... });
   it('every module has at least 2 misconceptions', () => { ... });
   it('every module has estimatedMinutes between 10 and 120', () => { ... });
   it('every module has difficulty between 1 and 4', () => { ... });
   it('every module has at least one track', () => { ... });
   it('every module has a non-empty mathematics section', () => { ... });
   it('every module has a non-empty codeSnippet', () => { ... });
   it('every module has at least 1 failure mode', () => { ... });
   ```
3. Run `npm run test` — all tests should pass.

**Acceptance:** 11 content validation tests exist and pass.

#### M10-T2: Add route validation tests
1. Create `src/app/__tests__/routes.test.ts`.
2. Write tests:
   ```ts
   it('every module ID is a valid URL slug', () => {
     for (const mod of algorithmsList) {
       expect(mod.id).toMatch(/^[a-z0-9-]+$/);
       expect(mod.id.length).toBeGreaterThan(0);
       expect(mod.id.length).toBeLessThan(100);
     }
   });

   it('no two modules share the same ID', () => {
     const ids = algorithmsList.map(m => m.id);
     const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
     expect(duplicates).toEqual([]);
   });
   ```

**Acceptance:** Route validation tests exist and pass.

#### M10-T3: Add `aria-label` to visualization controls
1. For each visualization file in `src/components/ui/visualizations/` (all 25+ files):
   - Find every `<input>`, `<select>`, `<button>`, and interactive element.
   - Add an `aria-label` attribute describing what the control does. Example: `<input type="range" aria-label="Learning rate slider" ... />`.
   - Find the main SVG element and add: `role="img"` and `aria-label="[Description of what the visualization shows]"`.
   - If the SVG doesn't have a `<title>` element, add one as the first child: `<title>[What the visualization shows]</title>`.
2. This is a mechanical find-and-add task. Do NOT change any visualization logic, styling, or behavior.
3. Run `npm run build` and `npm run test` after processing all files.

**Acceptance:** Every visualization component has `aria-label` on interactive controls and on the SVG container. Build and tests pass.

#### M10-T4: Mobile responsiveness check
1. For each visualization component, check the SVG container sizing:
   - The SVG should use `width="100%"` or a responsive container, not a fixed pixel width.
   - If a fixed width is used (e.g., `width={600}`), wrap it in a container with `max-width: 100%; overflow-x: auto;`.
2. For control panels below/above visualizations:
   - If controls are laid out horizontally and overflow on narrow screens, add `flex-wrap: wrap` to the control container.
3. Check the main lesson page layout for 360px width:
   - Ensure no horizontal overflow.
   - Ensure text doesn't overflow its container.
   - Ensure code blocks have horizontal scroll (not page overflow).

**Acceptance:** No horizontal overflow at 360px viewport width on lesson pages. Visualizations are responsive.

#### M10-T5: Add comprehensive Cypress E2E test suite
These tests run against the dev server and verify the real UI in a real browser. Start the dev server (`npm run dev`) before running Cypress, or use `npm run test:e2e`.

1. Create `cypress/e2e/homepage.cy.ts`:
   ```ts
   describe('Homepage', () => {
     beforeEach(() => {
       cy.visit('/');
     });

     it('displays the correct number of module cards', () => {
       // The homepage should show a card/link for every module
       // Count should match algorithmsList.length (35-38 modules at this point)
       cy.get('a[href*="/algorithms/"]').should('have.length.greaterThan', 30);
     });

     it('all category filters work without errors', () => {
       // Find all filter/tab buttons on the homepage
       // Click each one and verify the page doesn't crash
       cy.get('button, [role="tab"]').each(($btn) => {
         const text = $btn.text();
         // Only click category-related buttons (skip other UI buttons)
         if (text && text.length > 2 && text.length < 50) {
           cy.wrap($btn).click();
           // Page should still have content, not be blank
           cy.get('main').should('exist');
         }
       });
     });

     it('clicking a module card navigates to the module page', () => {
       cy.get('a[href*="/algorithms/"]').first().click();
       cy.url().should('include', '/algorithms/');
       cy.get('h1').should('exist').and('not.be.empty');
     });
   });
   ```

2. Create `cypress/e2e/module-page.cy.ts`:
   ```ts
   describe('Module Page', () => {
     // Test with a known module — use a foundation module that should always exist
     // Replace 'calculus' with the actual slug if different
     const testSlug = 'calculus';

     beforeEach(() => {
       cy.visit(`/algorithms/${testSlug}`);
     });

     it('renders the module title', () => {
       cy.get('h1').should('exist').and('not.be.empty');
     });

     it('renders learning objectives section when data exists', () => {
       // After enrichment, this module should have objectives
       cy.contains(/learning objectives|objectives/i).should('exist');
     });

     it('renders the mathematics section', () => {
       // KaTeX-rendered math should produce .katex elements
       cy.get('.katex').should('have.length.greaterThan', 0);
     });

     it('renders the visualization without errors', () => {
       // Should have an SVG or canvas element
       cy.get('svg, canvas').should('have.length.greaterThan', 0);
       // Should NOT show the error boundary
       cy.contains('Visualization Error').should('not.exist');
     });

     it('renders the code snippet with syntax highlighting', () => {
       // The code block should exist (react-syntax-highlighter adds <pre><code>)
       cy.get('pre code, pre').should('have.length.greaterThan', 0);
     });

     it('renders references section when data exists', () => {
       cy.contains(/references/i).should('exist');
     });

     it('renders previous/next navigation', () => {
       // Should have at least one navigation link (previous or next)
       cy.contains(/previous|next|←|→/i).should('exist');
     });

     it('metadata bar shows difficulty and estimated time', () => {
       // Should show difficulty badge and/or time estimate
       cy.contains(/beginner|intermediate|advanced|expert|min/i).should('exist');
     });
   });
   ```

3. Create `cypress/e2e/all-modules.cy.ts`:
   ```ts
   // This test dynamically visits EVERY module page and checks it doesn't crash.
   // It reads module slugs from the homepage links.
   describe('All Module Pages Load', () => {
     it('collects all module links from homepage and visits each', () => {
       cy.visit('/');

       // Collect all algorithm page hrefs
       const hrefs: string[] = [];
       cy.get('a[href*="/algorithms/"]')
         .each(($link) => {
           const href = $link.attr('href');
           if (href && !hrefs.includes(href)) {
             hrefs.push(href);
           }
         })
         .then(() => {
           // Visit each module page
           for (const href of hrefs) {
             cy.visit(href);
             // Must have a title
             cy.get('h1').should('exist').and('not.be.empty');
             // Must NOT show the visualization error boundary
             cy.contains('Visualization Error').should('not.exist');
             // Must NOT show the "Visualization not found" fallback
             cy.contains('Visualization not found').should('not.exist');
             // Must NOT be a 404 page
             cy.contains(/not found|404/i).should('not.exist');
           }
         });
     });
   });
   ```

4. Create `cypress/e2e/tracks.cy.ts`:
   ```ts
   describe('Track Pages', () => {
     it('tracks index page loads and shows 3 tracks', () => {
       cy.visit('/tracks');
       // Should show cards/links for foundations, practitioner, modern-ai
       cy.contains(/foundation/i).should('exist');
       cy.contains(/practitioner/i).should('exist');
       cy.contains(/modern ai/i).should('exist');
     });

     it('clicking a track shows its modules', () => {
       cy.visit('/tracks');
       cy.get('a[href*="/tracks/"]').first().click();
       cy.url().should('include', '/tracks/');
       // Should show at least one module link
       cy.get('a[href*="/algorithms/"]').should('have.length.greaterThan', 0);
     });

     it('invalid track shows a not-found message', () => {
       cy.visit('/tracks/nonexistent-track', { failOnStatusCode: false });
       cy.contains(/not found|no track|invalid/i).should('exist');
     });
   });
   ```

5. Create `cypress/e2e/search.cy.ts`:
   ```ts
   describe('Search', () => {
     beforeEach(() => {
       cy.visit('/');
     });

     it('search bar exists in the header', () => {
       cy.get('input[type="search"], input[type="text"][placeholder*="earch"]').should('exist');
     });

     it('typing a query shows search results', () => {
       cy.get('input[type="search"], input[type="text"][placeholder*="earch"]')
         .first()
         .type('regression');
       // Should show at least one result (Linear Regression or Logistic Regression)
       // Results appear as links or list items
       cy.contains(/linear regression|logistic regression/i).should('be.visible');
     });

     it('clicking a search result navigates to the module', () => {
       cy.get('input[type="search"], input[type="text"][placeholder*="earch"]')
         .first()
         .type('neural');
       // Click the first result that appears
       cy.contains(/neural network/i).first().click();
       cy.url().should('include', '/algorithms/');
       cy.get('h1').should('exist');
     });

     it('searching for nonsense shows no results', () => {
       cy.get('input[type="search"], input[type="text"][placeholder*="earch"]')
         .first()
         .type('xyznonexistent123');
       cy.contains(/no results|nothing found/i).should('be.visible');
     });
   });
   ```

6. Create `cypress/e2e/navigation.cy.ts`:
   ```ts
   describe('Module Navigation', () => {
     it('previous/next links navigate between modules', () => {
       cy.visit('/');
       // Navigate to the first module
       cy.get('a[href*="/algorithms/"]').first().click();
       cy.url().should('include', '/algorithms/');

       // Store current URL, then click "Next"
       cy.url().then((firstUrl) => {
         cy.contains(/next|→/i).first().click();
         cy.url().should('not.eq', firstUrl);
         cy.get('h1').should('exist').and('not.be.empty');

         // Now click "Previous" to go back
         cy.contains(/previous|←/i).first().click();
         cy.url().should('eq', firstUrl);
       });
     });

     it('related modules links work', () => {
       // Visit a module that should have related modules
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();

       // If a "Related" section exists, click a link in it
       cy.get('body').then(($body) => {
         if ($body.text().match(/related/i)) {
           cy.contains(/related/i)
             .parent()
             .find('a[href*="/algorithms/"]')
             .first()
             .click();
           cy.get('h1').should('exist').and('not.be.empty');
         }
       });
     });
   });
   ```

7. Create `cypress/e2e/progress.cy.ts`:
   ```ts
   describe('Progress Tracking', () => {
     beforeEach(() => {
       // Clear localStorage before each test
       cy.clearLocalStorage();
     });

     it('visiting a module saves progress to localStorage', () => {
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();

       // Wait for the page to fully render
       cy.get('h1').should('exist');

       // Check that localStorage has a progress entry
       cy.window().then((win) => {
         const raw = win.localStorage.getItem('ml-learning-progress-v1');
         expect(raw).to.not.be.null;
         const progress = JSON.parse(raw!);
         // At least one module should be marked
         expect(Object.keys(progress).length).to.be.greaterThan(0);
         // That module should have status 'in_progress'
         const firstKey = Object.keys(progress)[0];
         expect(progress[firstKey].status).to.eq('in_progress');
       });
     });

     it('progress persists after page refresh', () => {
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();
       cy.get('h1').should('exist');

       // Reload the page
       cy.reload();

       // Progress should still be in localStorage
       cy.window().then((win) => {
         const raw = win.localStorage.getItem('ml-learning-progress-v1');
         expect(raw).to.not.be.null;
         const progress = JSON.parse(raw!);
         expect(Object.keys(progress).length).to.be.greaterThan(0);
       });
     });
   });
   ```

8. Create `cypress/e2e/visualization-interactions.cy.ts`:
   ```ts
   describe('Visualization Interactions', () => {
     it('visualization controls are interactive', () => {
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();

       // Find slider/range inputs inside the visualization area
       cy.get('body').then(($body) => {
         // If there are range inputs, interact with one
         if ($body.find('input[type="range"]').length > 0) {
           cy.get('input[type="range"]').first().then(($slider) => {
             const min = parseFloat($slider.attr('min') || '0');
             const max = parseFloat($slider.attr('max') || '100');
             const midValue = (min + max) / 2;

             // Change the slider value
             cy.wrap($slider).invoke('val', midValue).trigger('input').trigger('change');

             // The visualization should still be visible (no crash)
             cy.get('svg, canvas').should('exist');
             cy.contains('Visualization Error').should('not.exist');
           });
         }
       });
     });

     it('select/dropdown controls work without errors', () => {
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();

       cy.get('body').then(($body) => {
         if ($body.find('select').length > 0) {
           cy.get('select').first().then(($select) => {
             // Get available options
             const options = $select.find('option');
             if (options.length > 1) {
               // Select the second option
               cy.wrap($select).select(options.eq(1).val() as string);
               // Visualization should not crash
               cy.get('svg, canvas').should('exist');
               cy.contains('Visualization Error').should('not.exist');
             }
           });
         }
       });
     });

     it('reset/buttons do not crash the visualization', () => {
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();

       cy.get('body').then(($body) => {
         // Find buttons that look like reset/clear actions
         const resetButtons = $body.find('button').filter((_, el) => {
           const text = el.textContent?.toLowerCase() || '';
           return text.includes('reset') || text.includes('clear') || text.includes('restart');
         });

         if (resetButtons.length > 0) {
           cy.wrap(resetButtons.first()).click();
           cy.get('svg, canvas').should('exist');
           cy.contains('Visualization Error').should('not.exist');
         }
       });
     });
   });
   ```

9. Create `cypress/e2e/mobile.cy.ts`:
   ```ts
   describe('Mobile Viewport', () => {
     beforeEach(() => {
       // Set viewport to 360px width (small mobile)
       cy.viewport(360, 640);
     });

     it('homepage renders without horizontal overflow', () => {
       cy.visit('/');
       // Body should not have horizontal scrollbar
       cy.document().then((doc) => {
         expect(doc.documentElement.scrollWidth).to.be.lte(doc.documentElement.clientWidth + 1);
       });
     });

     it('module page renders without horizontal overflow', () => {
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();
       cy.get('h1').should('exist');
       cy.document().then((doc) => {
         expect(doc.documentElement.scrollWidth).to.be.lte(doc.documentElement.clientWidth + 1);
       });
     });

     it('visualization does not overflow on mobile', () => {
       cy.visit('/');
       cy.get('a[href*="/algorithms/"]').first().click();
       // SVG container should not cause overflow
       cy.get('svg').each(($svg) => {
         const svgWidth = $svg[0].getBoundingClientRect().width;
         expect(svgWidth).to.be.lte(360);
       });
     });
   });
   ```

10. Run the full Cypress suite:
    - Start the dev server: `npm run dev`
    - In another terminal: `npx cypress run`
    - All tests across all 9 spec files (smoke + 8 new) should pass.
    - Fix any failing tests by either fixing the app code or adjusting selectors.

**Acceptance:** 9 Cypress spec files exist in `cypress/e2e/`. All tests pass when run against the dev server. Test files cover: homepage, module pages, all-modules loading, tracks, search, navigation, progress, visualization interactions, and mobile viewport.

#### M10-T6: Verify all existing tests still pass
1. Run `npm run test` and verify:
   - All original 9 test files still pass.
   - All new test files pass.
   - There are no skipped or failing tests.
2. Run `npm run build` with zero errors.
3. Run `npm run lint` and fix any errors.
4. Run `npx cypress run` (with dev server running) and verify all Cypress tests pass.

**Acceptance:** Zero unit test failures. Zero build errors. Zero lint errors. All Cypress E2E tests pass.

### Milestone 10 is DONE when
- Content validation tests (11 cases) exist and pass.
- Route validation tests exist and pass.
- All visualization components have aria-labels.
- Visualizations are responsive (no overflow at 360px).
- 9 Cypress E2E spec files exist and all tests pass.
- `npm run build`, `npm run test`, and `npm run lint` all pass with zero errors.

---

## Milestone 11 — Polish and Release Hardening

**Goal:** Final polish, documentation, and verification.

### Tasks

#### M11-T1: Fix all build and lint warnings
1. Run `npm run build` — fix every warning and error.
2. Run `npm run lint` — fix every warning and error.
3. Re-run both to confirm zero issues.

**Acceptance:** Zero warnings and errors from both commands.

#### M11-T2: Update the homepage
1. Open `src/app/page.tsx`.
2. Ensure the total module count displayed is correct (dynamically derived from `algorithmsList.length`, not hardcoded).
3. Add a visible link or section for the Tracks page.
4. Verify the category filter/tabs work correctly with all new categories (including the ones added for split and new modules).
5. Verify the search bar (added in M6) works from the homepage.

**Acceptance:** Homepage shows correct module count, has a tracks link, and category filters work for all categories.

#### M11-T3: Verify 404 and error handling
1. Open `src/app/not-found.tsx` — ensure it has:
   - A link back to the homepage.
   - A link to the tracks page.
   - A suggestion to use search.
2. Verify that navigating to `/algorithms/nonexistent-slug` shows the 404 page (not a crash or blank page).
3. Verify that navigating to `/tracks/invalid-track` shows a "Track not found" message (not a crash).

**Acceptance:** Invalid URLs show friendly error messages with navigation options.

#### M11-T4: Update SEO metadata
1. Check `src/app/algorithms/[slug]/page.tsx` — ensure each module page generates:
   - A `<title>` of format: `{Module Title} | ML Learning Platform` (or similar).
   - A `<meta name="description">` using the module's `shortDescription`.
2. Check `src/app/sitemap.ts` — ensure it generates URLs for ALL modules (including newly added ones). It should dynamically iterate over `algorithmsList` rather than having a hardcoded list.
3. Check `src/app/tracks/page.tsx` and `src/app/tracks/[trackId]/page.tsx` — add appropriate titles and descriptions.

**Acceptance:** All pages have unique titles and descriptions. Sitemap includes all routes.

#### M11-T5: Update README.md
1. Replace the content of `README.md` with an accurate description:
   - **Project name and purpose:** An interactive machine learning learning platform.
   - **How to run locally:** `npm install`, `npm run dev`, visit `http://localhost:3000`.
   - **How to run tests:** `npm run test`.
   - **How to build:** `npm run build`.
   - **Project structure:** Brief overview of `src/data/algorithms_content/` (module data), `src/components/ui/visualizations/` (visualizations), `src/components/lesson/` (lesson layout), `src/app/` (pages and routes).
   - **How to add a new module:** Brief guide: create content file with `LearningModule` type, add category to types, add to index, create visualization component, update D3Visualization routing.
   - **Current stats:** Total number of modules, number of tracks, tech stack.
2. Keep it concise — under 100 lines.

**Acceptance:** README accurately describes the project and is up to date.

#### M11-T6: Final full validation
Run all of these and confirm zero issues:
1. `npm run build` — zero errors, zero warnings.
2. `npm run test` — all tests pass, zero failures.
3. `npm run lint` — zero errors, zero warnings.
4. Manual smoke test (run `npm run dev` and check):
   - [ ] Homepage loads and shows all modules.
   - [ ] A foundation module (e.g., calculus) renders correctly with enriched content.
   - [ ] A supervised learning module (e.g., KNN — split module) renders correctly.
   - [ ] A new module (e.g., gradient descent) renders correctly.
   - [ ] Track index page loads and shows 3 tracks.
   - [ ] A track detail page loads and shows modules in order.
   - [ ] Search works from the header.
   - [ ] Previous/Next navigation works on a lesson page.
   - [ ] 404 page shows for an invalid slug.
   - [ ] Progress appears saved (revisit a module, check it's marked in_progress).

**Acceptance:** All automated checks pass. All manual checks pass.

### Milestone 11 is DONE when
- Zero build errors/warnings.
- Zero lint errors/warnings.
- All tests pass.
- Homepage, tracks, search, navigation all work correctly.
- README is updated.
- 404/error handling works.
- SEO metadata is correct.
- The site is ready for deployment.

---

## Milestone 12 — Visualization Accuracy Remediation

**Goal:** Resolve the 34 open S3 accuracy coverage defects identified in the visualization audit by adding pure test-local numerical oracles and display agreement assertions for all remaining diagrams.

### Tasks

#### M12-T1: Foundations Track Remediation
1. For the 7 remaining foundations diagrams (`calculus`, `linear-algebra`, `probability-theory`, `maximum-likelihood`, `bayesian-inference`, `statistics-estimation`, `gradient-descent`), build diagram-specific independent numerical oracles.
2. Add display agreement assertions covering default, interior, and boundary states.
3. Update the respective dossiers in `docs/visualization-audit/dossiers/foundations/` with evidence.

#### M12-T2: Practitioner Track Remediation
1. For the 20 remaining practitioner diagrams (excluding the 4 verified ones), build diagram-specific independent numerical oracles.
2. Add display agreement assertions covering default, interior, and boundary states.
3. Update the respective dossiers in `docs/visualization-audit/dossiers/practitioner/` with evidence.

#### M12-T3: Modern AI Track Remediation
1. For the 7 modern-ai diagrams (`backpropagation`, `sequence-models`, `embeddings-tokenization`, `rag`, `fine-tuning`, `llm-evaluation-safety`, `ai-inference`), build diagram-specific independent numerical oracles.
2. Add display agreement assertions covering default, interior, and boundary states.
3. Update the respective dossiers in `docs/visualization-audit/dossiers/modern-ai/` with evidence.

#### M12-T4: Design Consistency Verification
1. Ensure all 40 diagrams strictly adhere to the `DESIGN_CONSISTENCY.md` contract.
2. Verify that each diagram is wrapped in `VisualizationShell`.
3. Confirm that all inputs and interactive elements have accessible labels, and mathematical states are reset correctly.
4. Run `npm run test` and `npx cypress run` to ensure no regressions in layout, accessibility, or mobile responsiveness.

### Milestone 12 is DONE when
- All 34 open S3 defects in `DEFECT_LOG.md` are closed.
- Every diagram has test-local oracles covering its mathematical states.
- `AUDIT_REGISTER.md` shows all 40 diagrams as VERIFIED / KEEP.
- `npm run test` passes.

---

## Summary Table

| Milestone | Primary Deliverable | Tasks |
|---|---|---:|
| M0 | Baseline & inventory | 5 |
| M1 | Expanded content schema | 4 |
| M2 | Split combined modules | 3 |
| M3 | Unified lesson template | 4 |
| M4 | Visualization utilities + Cypress setup | 4 |
| M5 | Enrich all existing modules | 6 |
| M6 | Navigation, search, progress | 5 |
| M7 | New modules batch 1 (3 modules) | 3 |
| M8 | New modules batch 2 (4 modules) | 4 |
| M9 | New modules batch 3 (7 modules) | 7 |
| M10 | Quality, accessibility & Cypress E2E suite | 6 |
| M11 | Polish & release | 6 |
| M12 | Visualization accuracy remediation | 4 |
| **Total** | **40 modules, unified template, search, tracks, E2E tests, verified diagrams** | **61** |

---

## Rules for the Implementor

1. **Never start a milestone before the previous one is complete** — all "Done when" criteria must be met.
2. **Run `npm run build` and `npm run test` after every task.** If either fails, fix before moving on. After M4-T4, also run `npx cypress run` (with dev server running) after tasks that change UI.
3. **Do not rewrite existing visualization components** unless specifically required by a task. Add to them, don't replace.
4. **Do not change the visual design** (colors, fonts, layout patterns). Match what exists in `globals.css` and existing components.
5. **Do not add new npm dependencies** without explicit approval. Pre-approved exceptions: `cypress` and `start-server-and-test` (added in M4-T4).
6. **Do not create backend services, databases, or API routes.** This is a static site.
7. **When adding content to modules,** use accurate ML/AI information. If unsure about a concept, add a `// TODO: verify` comment.
8. **Keep files small.** No single file should exceed 500 lines. Split large components.
9. **All TypeScript — no `any` types.** Use proper typing for all new code.
10. **Read files before editing them.** Always check the actual values (like module IDs) rather than guessing.
11. **Preserve existing tests.** Never delete or weaken an existing test. Only add new ones.
12. **Commit after each completed task** (not each milestone — tasks are the commit granularity).
