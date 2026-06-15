# Active-Learning Content Upgrade — Implementation Plan & Work Tracker

> **Status:** In progress · **Branch:** `claude/product-improvement-proposal-x6iizh`
> **Owner:** Suranjan · **Last updated:** 2026-06-15
>
> This is the living source of truth for the upgrade. Update the **Work Tracker**
> checkboxes as tasks land. Keep the design sections in sync if the approach changes.

---

## 1. Context & Goal

ML Learn is a mature, polished platform (Next.js 16 static export, 40 typed modules
across 3 tracks, 40 tested D3 visualizations, KaTeX, full Cypress/Vitest coverage).
A focused content review returned one consistent verdict: it is **excellent to read,
but you cannot practice with it.** Active learning graded a **D**.

**Goal:** Convert ML Learn from a reference you *read* into a learning *system* you
*practice with* — using authored static content plus lightweight React. No runtime AI,
no backend; it stays a static GitHub Pages site.

### Gaps this upgrade closes
| # | Gap | Fix |
|---|-----|-----|
| 1 | Zero practice exercises (no schema field) | `practiceExercises` + `PracticeExercises.tsx` |
| 2 | Single, simple worked examples, no difficulty tiers | `ExerciseDifficulty` (warm-up / core / challenge) |
| 3 | No real-world case studies | `caseStudies` + `CaseStudy.tsx` |
| 4 | No method comparisons | `comparisons` + `ComparisonTable.tsx` |
| 5 | Formulas stated, never derived | reuse `additionalSections` + `MathDerivations.tsx` (foldable) |
| 6 | No "when to use / when NOT to use" | `usageGuidance` + `WhenToUse.tsx` |
| 7 | No TL;DR / quick review | `tldr` + `TLDR.tsx` |
| 8 | Modern-AI modules shallower than foundations | rubric + rollout prioritization |
| 9 | `notationTable` / `additionalSections` / `review` defined but unused | activated by this work |
| — | **Bonus bug:** `LearningObjectives.tsx` exists but is never rendered | wire into `LessonPage.tsx` |

### Design principles
- **Backward compatible:** every new field is **optional**; the existing 40 modules keep
  compiling and rendering unchanged.
- **Foldability:** heavy / answer-key material is **collapsed by default behind a toggle**
  (full math derivations, exercise hints + solutions, quiz explanations). TL;DR,
  objectives, case studies, comparisons, and when-to-use render open and inline.
- **Reuse, don't reinvent:** clone the proven reveal pattern in `WorkedExamples.tsx`
  (`"use client"` + `useState`); render all prose through existing `LogicContent` /
  `InlineMarkdown` (free GitHub-flavored markdown + KaTeX); reuse styling utilities
  (`surface-card-low`, `accent-left-{success,error,primary}`, section-card shell).
- **Static-export safe:** interactivity is `useState`-only — no `localStorage`, no
  `window`-at-import — so it renders identically under `output: 'export'`. No changes to
  the 40 D3 visualizations or the viz registry.

---

## 2. Architecture Reference (verified patterns to follow)

- **Schema:** `src/data/algorithms_content/learningModuleTypes.ts` — `LearningModule` has
  9 required legacy fields + a block of optional fields. `WorkedExample` already models
  problem + reveal-able solution.
- **Reveal pattern (clone this):** `src/components/lesson/WorkedExamples.tsx` —
  `"use client"`, `useState(false)` per card, a toggle button styled
  `bg-primary/10 border border-primary/20 ... text-primary`, body via `LogicContent`.
- **Section components contract:** default export; `if (!prop?.length) return null;`;
  `mb-8` wrapper; h3 header `font-headline text-sm font-bold uppercase tracking-wide
  text-primary`. See `Misconceptions.tsx`, `LearningObjectives.tsx`, `NotationTable.tsx`.
- **Markdown:** `LogicContent` (block prose, has `size="sm"`) and `InlineMarkdown` (inline,
  for table cells / list items / quiz options). Never render raw markdown.
- **Two-column accent grid:** pros/cons block in `LessonPage.tsx` (lines ~261-287) uses
  `accent-left-success` / `accent-left-error` — `WhenToUse.tsx` mirrors it exactly.
- **Lesson page stack:** `src/components/lesson/LessonPage.tsx` renders a flat
  `space-y-8` stack of section cards. Insert new sections by pedagogical flow (see §5).
- **On-this-page nav:** `src/components/lesson/LessonNavigator.tsx` — `coreSections`
  array + conditional appends keyed on `currentModule.X?.length` (lines 52-61). New
  anchors registered the same way. Icons from `lucide-react` (already a dep).
- **Rubric-as-test:** `src/data/__tests__/contentValidation.test.ts` asserts
  *unconditional* per-module minimums today. New rubric assertions MUST be **gated on
  `mod.review?.status === 'published'`** or CI goes red the moment any module is touched.
- **Schema integrity test:** `src/data/algorithms_content/__tests__/schema.test.ts`
  (id/slug/prereq-cycle). Good home for a `ComparisonTable` row/method length check.
- **E2E:** `cypress/e2e/module-page.cy.ts` asserts core h2 sections by text.

---

## 3. Schema Extensions  ✅ DONE

Added to `learningModuleTypes.ts` (all optional on `LearningModule`):

```ts
export type ExerciseDifficulty = 'warm-up' | 'core' | 'challenge';
export interface PracticeExercise { prompt: string; difficulty: ExerciseDifficulty; hint?: string; solution: string; tags?: string[]; }
export interface QuizOption { text: string; correct: boolean; }
export interface QuizQuestion { question: string; options: QuizOption[]; explanation: string; }
export interface CaseStudy { title: string; domain?: string; scenario: string; approach: string; outcome: string; source?: Reference; }
export interface ComparisonRow { dimension: string; values: string[]; }
export interface ComparisonTable { title?: string; methods: string[]; rows: ComparisonRow[]; takeaway?: string; }
export interface UsageGuidance { useWhen: string[]; avoidWhen: string[]; rulesOfThumb?: string[]; }

// appended to LearningModule:
practiceExercises?: PracticeExercise[];
quiz?: QuizQuestion[];
caseStudies?: CaseStudy[];
comparisons?: ComparisonTable[];
usageGuidance?: UsageGuidance;
tldr?: string[];
```

Reuse mapping: derivations → existing `additionalSections: ContentSection[]`; notation →
existing `notationTable`; completeness flag → existing `review.status`.

---

## 4. Components — `src/components/lesson/`

| File | Client? | Default-folded? | Renders | Pattern |
|------|---------|-----------------|---------|---------|
| `TLDR.tsx` | no | open | bullet quick-review card | `accent-left-primary` + `InlineMarkdown` ✅ DONE |
| `MathDerivations.tsx` | **yes** | **folded** | `additionalSections` as collapsible sub-cards, "Show full derivation" toggle | clone `WorkedExamples` reveal |
| `PracticeExercises.tsx` | **yes** | hint + solution **folded** | warm-up→core→challenge cards, difficulty chip, collapsible hint then solution | clone `WorkedExamples` reveal |
| `SelfCheckQuiz.tsx` | **yes** | explanation reveals on answer | MCQ; select locks + colors correct/incorrect, reveals explanation | `useState` per question; `accent-left-success/error` |
| `CaseStudy.tsx` | no | open | domain chip + scenario / approach / outcome blocks + optional cited source | section-card + `LogicContent` |
| `ComparisonTable.tsx` | no | open | real `<table>`, `overflow-x-auto`, `InlineMarkdown` cells, takeaway line | like `NotationTable` overflow wrapper |
| `WhenToUse.tsx` | no | open | two-column Use-when / Avoid-when + rules-of-thumb | mirror pros/cons grid in `LessonPage` |

**Interactive-component behavior notes**
- `PracticeExercises`: group by difficulty in fixed order warm-up → core → challenge, each
  with a colored difficulty chip. Per card: optional **Show hint** toggle, then **Reveal
  solution** toggle (independent `useState`).
- `SelfCheckQuiz`: per question, clicking an option locks the question, colors the chosen
  option (correct = success, wrong = error) and always highlights the correct one, then
  reveals `explanation`. Optional "reset" affordance is nice-to-have, not required.
- `ComparisonTable`: guard `row.values.length === methods.length` defensively at render
  (and assert in schema test).

---

## 5. Wiring

### `LessonPage.tsx` — insert sections in pedagogical order
1. Near top (after header jumbotron / `PrerequisiteLinks`): `<TLDR points={module.tldr} />`
   **and fix the orphaned** `<LearningObjectives objectives={module.learningObjectives} />`.
2. After **Mathematics** card (~line 177): `<MathDerivations sections={module.additionalSections} />`.
3. After **Worked Examples** (~line 182): `<div id="practice" className="scroll-mt-44"><PracticeExercises exercises={module.practiceExercises} /></div>`.
4. After **In Depth** (~line 233): `<ComparisonTable .../>` then `<WhenToUse guidance={module.usageGuidance} />`.
5. After pros/cons (~line 287): `<div id="case-studies" className="scroll-mt-44"><CaseStudy studies={module.caseStudies} /></div>`.
6. After **Misconceptions** (~line 290): `<div id="quiz" className="scroll-mt-44"><SelfCheckQuiz questions={module.quiz} /></div>` (self-check before References).

### `LessonNavigator.tsx` — register anchors (conditional-append idiom, lines 52-61)
- `practice` → icon `Dumbbell` (or `PencilRuler`), shown when `practiceExercises?.length`
- `case-studies` → icon `Briefcase`, shown when `caseStudies?.length`
- `quiz` → icon `CircleHelp`, shown when `quiz?.length`

---

## 6. Authoring Rubric (drives `review.status`)

A module is **`published`** only when it has **all** of:
- ≥ 3 `practiceExercises` spanning ≥ 2 difficulty tiers, each with a `solution`.
- 3–5 `quiz` questions, each with 3–5 options, ≥ 1 correct, non-empty `explanation`.
- ≥ 1 `caseStudy` with a quantified `outcome`.
- `usageGuidance` with ≥ 2 `useWhen` and ≥ 2 `avoidWhen`.
- ≥ 1 `comparisons` table (required for practitioner / modern-ai; optional for pure-math foundations).
- ≥ 1 derivation in `additionalSections` (for any non-trivial `mathematics`).
- `tldr` with 3–6 points.
- Plus all existing minimums already enforced by `contentValidation.test.ts`.

**Status ladder:** `draft` (legacy/untouched) → `reviewed` (rubric-complete, unverified)
→ `published` (meets full bar). New rubric assertions are **status-gated** so legacy
modules stay green and migrate incrementally.

---

## 7. Rollout

- **Phase 0 — Infra (no content):** schema + all 7 components + nav wiring + fix orphaned
  `LearningObjectives`. With zero modules using new fields, every component returns null →
  no visual change. Gate: `npm run test`, `npx tsc --noEmit`, `npm run build` pass.
- **Phase 1 — 3 exemplars (full rubric, `status: 'published'`):**
  - `3_linear_regression.ts` (practitioner — richest base, best template)
  - `0_1_calculus.ts` (foundations — Cypress smoke target → free E2E coverage)
  - `15_transformers.ts` (modern-ai — attacks gap #8; natural comparison vs sequence models)
- **Phase 2 — Track by track:** foundations → practitioner → modern-ai. Flip `status` to
  `published` per module as it meets the bar; prioritize modern-AI depth and obvious
  comparison pairs (SVM↔NN, trees↔ensembles, RAG↔fine-tuning).

---

## 8. Verification

- `npx tsc --noEmit` — optional fields are backward compatible.
- `npm run test` (Vitest) — schema + status-gated content validation + new component unit
  tests (clone `LessonNavigator.test.tsx` style for reveal/answer behavior; add
  `ComparisonTable` row/method length-match assertion).
- `npm run build` — static export integrity.
- `npm run test:e2e` (Cypress) — existing `module-page.cy.ts` still passes; add a spec
  asserting Practice / Quiz / Case-study render on an exemplar and the quiz reveal works.
- Manual: `npm run dev`, open the 3 exemplars — new sections render, KaTeX renders, fold
  toggles work, nav anchors jump correctly.

---

## 9. Risks

- **CI red on touch:** the existing content-validation test is unconditional — new rubric
  assertions MUST be status-gated. (Highest-priority integration detail.)
- **Hydration mismatch:** avoid `localStorage` / `window`-at-import in client components.
- **Authoring volume:** the real cost is content for 40 modules, not code; status-gating
  lets the upgrade ship incrementally with green CI.
- **Nav overflow:** tab strip is already `overflow-x-auto`; new tabs are conditional.

---

## 10. Work Tracker

### Phase 0 — Infrastructure
- [x] Schema extensions in `learningModuleTypes.ts`
- [x] `TLDR.tsx`
- [ ] `MathDerivations.tsx` (foldable)
- [ ] `PracticeExercises.tsx`
- [ ] `SelfCheckQuiz.tsx`
- [ ] `CaseStudy.tsx`
- [ ] `ComparisonTable.tsx`
- [ ] `WhenToUse.tsx`
- [ ] Wire all sections into `LessonPage.tsx` (+ fix orphaned `LearningObjectives`)
- [ ] Register `practice` / `case-studies` / `quiz` anchors in `LessonNavigator.tsx`
- [ ] Status-gated rubric assertions in `contentValidation.test.ts`
- [ ] `ComparisonTable` row/method length assertion in `schema.test.ts`
- [ ] Unit tests for `PracticeExercises` + `SelfCheckQuiz`
- [ ] Gate: `tsc --noEmit`, `npm run test`, `npm run build` all green

### Phase 1 — Exemplar modules (full rubric, `status: 'published'`)
- [ ] `3_linear_regression.ts`
- [ ] `0_1_calculus.ts`
- [ ] `15_transformers.ts`
- [ ] Cypress spec for new sections + quiz reveal
- [ ] Full verification suite green

### Phase 2 — Track rollout
- [ ] Foundations track (remaining modules)
- [ ] Practitioner track (remaining modules)
- [ ] Modern-AI track (remaining modules — prioritize depth, gap #8)
```
