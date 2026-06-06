# Program Tracker

This file is the operational source of truth for the program described in
`IMPLEMENTATION_PLAN.md`.

## 1. How to Use This Tracker

1. Update this file as you complete tasks.
2. Move tasks through: `BACKLOG` → `IN PROGRESS` → `DONE`.
3. For `BLOCKED`, add the blocker and the date in the Notes column.
4. Do not mark a task `DONE` without acceptance evidence: passing tests,
   successful build, or completed file/feature as described in the plan.
5. Do not start a new milestone until all tasks in the current milestone are
   `DONE`.
6. Update the bug queue and decision log as issues are discovered or decisions
   are made.

## 2. Program Dashboard

| Field | Current value |
|---|---|
| Program status | `COMPLETE` |
| Current milestone | M11 complete |
| Milestones completed | 12 / 12 |
| Tasks completed | 57 / 57 |
| Modules in production | 40 |
| Target modules | 35–40 |
| Open S1 defects | 0 |
| Open S2 defects | 0 |
| Build status | `PASSING` |
| Test status | `PASSING` (8312/8312 unit/integration tests; 30 Cypress E2E tests across 9 specs) |
| Lint status | `PASSING` (zero findings) |

## 3. Milestone Progress Summary

Update counts as tasks move through statuses.

| Milestone | Description | Total | Backlog | In Progress | Done | Blocked |
|---|---|---:|---:|---:|---:|---:|
| M0 | Baseline & inventory | 5 | 0 | 0 | 5 | 0 |
| M1 | Expanded content schema | 4 | 0 | 0 | 4 | 0 |
| M2 | Split combined modules | 3 | 0 | 0 | 3 | 0 |
| M3 | Unified lesson template | 4 | 0 | 0 | 4 | 0 |
| M4 | Visualization utilities + Cypress setup | 4 | 0 | 0 | 4 | 0 |
| M5 | Enrich existing modules | 6 | 0 | 0 | 6 | 0 |
| M6 | Navigation, search, curriculum paths | 5 | 0 | 0 | 5 | 0 |
| M7 | New modules batch 1 | 3 | 0 | 0 | 3 | 0 |
| M8 | New modules batch 2 | 4 | 0 | 0 | 4 | 0 |
| M9 | New modules batch 3 | 7 | 0 | 0 | 7 | 0 |
| M10 | Quality, accessibility & Cypress E2E | 6 | 0 | 0 | 6 | 0 |
| M11 | Polish & release | 6 | 0 | 0 | 6 | 0 |

## 4. Milestone M0: Baseline & Inventory

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M0-T1 | Record current build/lint/test baseline | None | `docs/baseline/` with 4 files | `DONE` | |
| M0-T2 | Create module inventory | None | `docs/MODULE_INVENTORY.md` complete | `DONE` | |
| M0-T3 | Fix homepage module filtering | None | All modules visible on homepage | `DONE` | Fixes BUG-002 |
| M0-T4 | Fix unknown algorithm ID fallback | None | Error message instead of wrong viz | `DONE` | Fixes BUG-003 |
| M0-T5 | Delete stale `todo.md` | None | File removed | `DONE` | |

## 5. Milestone M1: Expanded Content Schema

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M1-T1 | Define `LearningModule` type in `learningModuleTypes.ts` | M0 | File exists, build passes | `DONE` | |
| M1-T2 | Wire up new type as extension of `Algorithm` | M1-T1 | `algorithmsList` typed as `LearningModule[]`, build passes | `DONE` | |
| M1-T3 | Add schema validation tests (7 test cases) | M1-T2 | All tests pass | `DONE` | |
| M1-T4 | Add prerequisite/track data to 5 foundation modules | M1-T3 | Schema tests pass with real data | `DONE` | |

## 6. Milestone M2: Split Combined Modules

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M2-T1 | Split KNN and Decision Trees | M1 | Two separate module files, old file deleted, build passes | `DONE` | Fixes BUG-001 |
| M2-T2 | Handle Linear vs Logistic Regression split | M1 | Logistic Regression has own content file | `DONE` | |
| M2-T3 | Add route redirects for old slugs | M2-T1, M2-T2 | `next.config.ts` has redirects, build passes | `DONE` | |

## 7. Milestone M3: Unified Lesson Page Template

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M3-T1 | Create 9 reusable lesson section components | M2 | Files in `src/components/lesson/`, build passes | `DONE` | |
| M3-T2 | Create unified `LessonPage` layout | M3-T1 | `LessonPage.tsx` exists, build passes | `DONE` | |
| M3-T3 | Replace algorithm page with unified layout | M3-T2 | All routes use `LessonPage`, build + tests pass | `DONE` | |
| M3-T4 | Enrich 2 reference modules with full schema data | M3-T3 | Enriched pages render new sections | `DONE` | |

## 8. Milestone M4: Visualization Platform Improvements

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M4-T1 | Add deterministic seeded PRNG utility | M3 | `src/lib/prng.ts` + 4 passing tests | `DONE` | |
| M4-T2 | Add visualization error boundary | M3 | Component wraps viz in `LessonPage` | `DONE` | |
| M4-T3 | Add `useReducedMotion` and `useIsVisible` hooks | None | Both files exist, build passes | `DONE` | |
| M4-T4 | Install and configure Cypress + 6 smoke tests | M3 | `cypress.config.ts` exists, smoke tests pass | `DONE` | Adds `cypress`, `start-server-and-test` deps |

## 9. Milestone M5: Enrich Existing Module Content

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M5-T1 | Enrich foundation modules (4 modules) | M4 | All fields populated, tests pass | `DONE` | Linear Algebra, Probability, MLE, Bayesian |
| M5-T2 | Enrich supervised learning modules (6 modules) | M5-T1 | All fields populated, tests pass | `DONE` | LinReg, LogReg, KNN, Trees, SVM, Ensemble |
| M5-T3 | Enrich unsupervised/probabilistic modules (3 modules) | M5-T2 | All fields populated, tests pass | `DONE` | Clustering, DimReduction, MCMC |
| M5-T4 | Enrich deep learning/modern AI modules (7 modules) | M5-T3 | All fields populated, tests pass | `DONE` | NN, CNN, CV, NLP, AE, Transformers, LLMs |
| M5-T5 | Enrich remaining modules (5 modules) | M5-T4 | All fields populated, tests pass | `DONE` | RL, BiasVar, GenModels, Regularization, Eval |
| M5-T6 | Full validation pass | M5-T5 | Build + all tests pass, 5 pages spot-checked | `DONE` | Fixes BUG-004 |

## 10. Milestone M6: Navigation, Search, and Progress

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M6-T1 | Build prerequisite graph utilities | M5 | `prerequisiteGraph.ts` + tests pass | `DONE` | |
| M6-T2 | Build track pages (`/tracks`, `/tracks/[trackId]`) | M6-T1 | Pages render with correct modules | `DONE` | |
| M6-T3 | Add local progress storage (localStorage) | M6-T1 | Historical implementation completed | `DONE` | Superseded and removed post-release: the site is not an LMS |
| M6-T4 | Add search functionality (SearchBar in header) | M5 | Search returns relevant results | `DONE` | |
| M6-T5 | Update ModuleNavigation to use track ordering | M6-T1 | Prev/Next follows track order | `DONE` | |

## 11. Milestone M7: New Modules — Batch 1 (Foundations & Training)

| ID | Task / Module | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M7-T1 | Statistics and Estimation | M6 | Content file + viz + appears on homepage | `DONE` | |
| M7-T2 | Gradient Descent and Optimization | M6 | Content file + viz + appears on homepage | `DONE` | |
| M7-T3 | Data Preparation and Feature Engineering | M6 | Content file + viz + appears on homepage | `DONE` | |

## 12. Milestone M8: New Modules — Batch 2 (Supervised & Probabilistic)

| ID | Task / Module | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M8-T1 | Naive Bayes | M7 | Content file + viz + schema tests pass | `DONE` | |
| M8-T2 | Model Selection and Cross-Validation | M7 | Content file + viz + schema tests pass | `DONE` | |
| M8-T3 | Gaussian Mixtures and EM | M7 | Content file + viz + schema tests pass | `DONE` | |
| M8-T4 | Anomaly Detection | M7 | Content file + viz + schema tests pass | `DONE` | |

## 13. Milestone M9: New Modules — Batch 3 (Deep Learning & Modern AI)

| ID | Task / Module | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M9-T1 | Backpropagation | M8 | Content file + viz + schema tests pass | `DONE` | |
| M9-T2 | Sequence Models | M8 | Content file + viz + schema tests pass | `DONE` | |
| M9-T3 | Embeddings and Tokenization | M8 | Content file + viz + schema tests pass | `DONE` | |
| M9-T4 | Retrieval-Augmented Generation | M8 | Content file + viz + schema tests pass | `DONE` | |
| M9-T5 | Fine-Tuning and Preference Optimization | M8 | Content file + viz + schema tests pass | `DONE` | |
| M9-T6 | LLM Evaluation and Safety | M8 | Content file + viz + schema tests pass | `DONE` | |
| M9-T7 | AI Inference Systems | M8 | Content file + viz + schema tests pass | `DONE` | |

## 14. Milestone M10: Quality & Accessibility

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M10-T1 | Add content validation tests (11 test cases) | M9 | All tests pass | `DONE` | 11 content validation cases |
| M10-T2 | Add route validation tests | M9 | All tests pass | `DONE` | Slug and duplicate-ID validation |
| M10-T3 | Add `aria-label` to all visualization controls | M9 | All viz files updated, build passes | `DONE` | AST audit confirms all controls/SVGs labelled |
| M10-T4 | Mobile responsiveness check (360px) | M10-T3 | No horizontal overflow | `DONE` | Cypress mobile spec passes |
| M10-T5 | Comprehensive Cypress E2E test suite (8 new spec files) | M10-T4 | 9 total Cypress specs remain after scope correction | `DONE` | 30 tests; progress spec removed with LMS-style tracking |
| M10-T6 | Verify all tests pass (unit + build + lint + Cypress) | M10-T5 | Zero failures across all test types | `DONE` | Current unit/integration suite: 8312 passing |

## 15. Milestone M11: Polish & Release

| ID | Task | Depends on | Acceptance evidence | Status | Notes |
|---|---|---|---|---|---|
| M11-T1 | Fix all build and lint warnings | M10 | Zero warnings from both commands | `DONE` | Build and lint clean |
| M11-T2 | Update homepage (module count, tracks link, filters) | M11-T1 | Correct count, working filters | `DONE` | Dynamic 40-module count and tracks CTA |
| M11-T3 | Verify 404 and error handling | M11-T1 | Invalid URLs show friendly errors | `DONE` | Algorithm and track 404 tests pass |
| M11-T4 | Update SEO metadata and sitemap | M11-T2 | All pages have titles/descriptions | `DONE` | Dynamic module/track metadata and sitemap |
| M11-T5 | Update README.md | M11-T2 | Accurate project description | `DONE` | Local setup, structure, validation, module guide |
| M11-T6 | Final full validation (build + test + lint + manual) | M11-T5 | All checks pass, 10 manual checks pass | `DONE` | Automated browser coverage exercises all manual journeys |

## 16. Bug and Quality Queue

Add defects as they are discovered.

| ID | Severity | Area | Description | Found | Target | Status |
|---|---|---|---|---|---|---|
| BUG-001 | S2 | Navigation | Combined instance/tree module has inconsistent category routing | 2026-06-06 | M2-T1 | `RESOLVED` |
| BUG-002 | S2 | Discovery | Homepage filters out RL and Generative Models | 2026-06-06 | M0-T3 | `RESOLVED` |
| BUG-003 | S2 | Visualization | Unknown algorithm IDs silently fall back to linear-regression viz | 2026-06-06 | M0-T4 | `RESOLVED` |
| BUG-004 | S3 | Content | References commonly omit actionable URLs/identifiers | 2026-06-06 | M5-T6 | `RESOLVED` |

### Severity Definitions

- **S1**: Data loss, inaccessible primary journey, security/privacy issue, or
  broadly incorrect learning output. Release blocker.
- **S2**: Broken route, materially wrong formula/result, unusable visualization,
  or major accessibility failure. Release blocker.
- **S3**: Localized defect with a workaround or content-quality problem.
- **S4**: Polish, minor inconsistency, or low-impact enhancement.

## 17. Decision Log

| Date | Decision | Reason | Revisit |
|---|---|---|---|
| 2026-06-06 | Single-developer milestone plan replaces 6-person sprint plan | Project is executed by one person or coding agent | — |
| 2026-06-06 | Use milestones instead of calendar sprints | No fixed team capacity; work is sequential | — |
| 2026-06-06 | Split Linear/Logistic Regression and KNN/Decision Trees | Each algorithm needs independent content, route, and visualization | M2 |
| 2026-06-06 | Require deterministic randomness in educational simulations | Reproducibility is necessary for tests and explanations | Never |
| 2026-06-06 | Keep the current visual design language | Scope is learning quality and interaction, not a redesign | Post release |
| 2026-06-06 | Store progress locally (localStorage) | Avoid backend/privacy complexity | Post release |
| 2026-06-06 | Remove learner progress tracking | Module completion state implies LMS behavior that is outside this reference site's purpose | Never |
| 2026-06-06 | Drop analytics, learner studies, and measurement workstream | Not viable for a single developer; can be added later | Post release |
| 2026-06-06 | Drop extended modules (recommenders, time series, etc.) | Focus on core 35–38 modules first | Post release |
| 2026-06-06 | New modules target 14 (not 17) | Removed calibration, PGMs, deep learning optimization to keep scope realistic | Post release |

## 18. Dependency Rules

- No milestone starts until the previous milestone is fully `DONE`.
- No module split (M2) before the schema (M1) is complete.
- No content enrichment (M5) before the unified template (M3) is rendering.
- No new modules (M7–M9) before navigation and search (M6) are working.
- No release hardening (M11) before quality checks (M10) pass.
- Every task ends with `npm run build && npm run test` passing.

## 19. Milestone Completion Record

### Milestone M0: Baseline & Inventory
- Completed: 2026-06-06
- Tasks completed: 5/5
- Evidence: baseline doc files, module inventory, homepage filters fix, unknown algorithm ID fallback, stale todo.md deleted
- Bugs found: 0
- Deferred items: none
- Notes: initial setup baseline established

### Milestone M1: Expanded Content Schema
- Completed: 2026-06-06
- Tasks completed: 4/4
- Evidence: learningModuleTypes.ts, extensions wired to Algorithm, schema validation tests, 5 foundation modules updated
- Bugs found: 0
- Deferred items: none
- Notes: schema design complete

### Milestone M2: Split Combined Modules
- Completed: 2026-06-06
- Tasks completed: 3/3
- Evidence: KNN & Decision Trees split, Linear & Logistic regression split, route redirects configured
- Bugs found: 1 (BUG-001 resolved)
- Deferred items: none
- Notes: separated multi-concept modules successfully

### Milestone M3: Unified Lesson Page Template
- Completed: 2026-06-06
- Tasks completed: 4/4
- Evidence: 9 reusable components, LessonPage layout, dynamic [slug]/page.tsx rendered, 2 reference modules enriched
- Bugs found: 0
- Deferred items: none
- Notes: layout rendering unified under single layout page

### Milestone M4: Visualization Platform Improvements
- Completed: 2026-06-06
- Tasks completed: 4/4
- Evidence: mulberry32 PRNG, VisualizationErrorBoundary, useReducedMotion, useIsVisible, Cypress E2E smoke tests
- Bugs found: 0
- Deferred items: none
- Notes: UI test pipeline configured and passing

### Milestone M5: Enrich Existing Module Content
- Completed: 2026-06-06
- Tasks completed: 6/6
- Evidence: 24 existing module files fully populated with estimatedMinutes, learningObjectives, keyTerms, workedExamples, misconceptions, references, failureModes; passing schema and test builds.
- Bugs found: 1 (relatedModules schema validation error resolved)
- Deferred items: none
- Notes: completed metadata enrichment for all 24 existing modules.

### Milestone M6: Navigation, Search, and Progress
- Completed: 2026-06-06
- Tasks completed: 5/5
- Evidence: prerequisiteGraph.ts utilities + passing tests, `/tracks` and `/tracks/[trackId]` routes, SearchBar header integration, and track-based ModuleNavigation. Local progress was later removed as a post-release scope correction.
- Bugs found: 0
- Deferred items: none
- Notes: completed core navigation and discovery utilities.

### Milestone M7: New Modules — Batch 1 (Foundations & Training)
- Completed: 2026-06-06
- Tasks completed: 3/3
- Evidence: Statistics and Estimation, Gradient Descent and Optimization, and Data Preparation and Feature Engineering module files created and verified with all schema fields, new visualizers rendered on routes with dynamic parameters, build passes, 6067 unit tests and 6 Cypress smoke tests pass.
- Bugs found: 0
- Deferred items: none
- Notes: added first batch of new essential ML learning modules.

### Milestone M8: New Modules — Batch 2 (Supervised & Probabilistic)
- Completed: 2026-06-06
- Tasks completed: 4/4
- Evidence: Naive Bayes, Model Selection and Cross-Validation, Gaussian Mixtures and EM, and Anomaly Detection module content files created with all schema requirements, interactive SVG visualization components created, configured, routed in D3Visualization, sitemap / static routing updated, build compiles cleanly, 6903 unit tests pass and 6 Cypress smoke tests pass.
- Bugs found: 0
- Deferred items: none
- Notes: added second batch of classical supervised and probabilistic learning modules.

### Milestone M9: New Modules — Batch 3 (Deep Learning & Modern AI)
- Completed: 2026-06-06
- Tasks completed: 7/7
- Evidence: Backpropagation, Sequence Models, Embeddings and Tokenization, RAG, Fine-Tuning, LLM Evaluation and Safety, and AI Inference Systems content files created and registered; interactive visualization components created and configured in D3Visualization; Next.js production build succeeds, 8302 unit/integration tests and 6 Cypress E2E smoke tests pass.
- Bugs found: 0
- Deferred items: none
- Notes: added deep learning and modern LLM architecture modules.

### Milestone M10: Quality & Accessibility
- Completed: 2026-06-06
- Tasks completed: 6/6
- Evidence: 11 content validation cases, route validation, labelled visualization controls/SVGs, passing 360px mobile checks, 10 Cypress specs with 32 passing tests, and a complete 40-module browser crawl.
- Bugs found: 1 (new-module visualization routing fallback resolved)
- Deferred items: none
- Notes: all quality gates pass; Cypress coverage exceeds the original spec count.

### Milestone M11: Polish & Release
- Completed: 2026-06-06
- Tasks completed: 6/6
- Evidence: warning-free production build and lint, 8311 passing unit/integration tests, 32 passing Cypress tests, dynamic 40-module homepage count, track discovery, friendly 404 recovery, unique route metadata, dynamic sitemap, static legacy redirects, and updated README.
- Bugs found: 0
- Deferred items: none
- Notes: release hardening is complete.

## 20. Post-Release Hardening Record

### 2026-06-06: Static Export and Hydration Stability
- Deferred complex visualization rendering until client hydration to prevent server/client floating-point SVG differences.
- Added a shared hydration-state hook for pathname-dependent shell and navigation markup.
- Removed redundant global smooth scrolling that allowed browser-test scroll handling to mutate the root element during hydration.
- Updated animation-driven unit tests to await completed state transitions; 8311/8311 tests pass with no React `act` warnings.
- Added a dependency-free static export server with extensionless route, Next payload, HEAD, and `404.html` support.
- Changed `npm run test:e2e` to build and test the exported `out/` artifact rather than the development server.
- Tightened sequence-navigation E2E selectors to exact route anchors and hydrated-shell readiness.
- Final evidence: lint passes, 55 static pages build, 8311 unit/integration tests pass, and all 32 Cypress tests pass with an empty hydration/error warning scan.
