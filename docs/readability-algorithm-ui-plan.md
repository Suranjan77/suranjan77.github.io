# Readability and Algorithm UI Cleanup Plan

> **Status:** Planned
> **Last updated:** 2026-06-16
> **Scope:** Improve readability and reduce algorithm UI clutter by clarifying hierarchy across reading, navigation, and interactive-lab modes.

---

## 1. Strategic Diagnosis

The problem is not simply that the font is too small. The site is currently asking one screen to behave like three products at once:

- **Reference book:** long-form explanations, math, code, examples, derivations, references.
- **Curriculum navigator:** tracks, prerequisites, module sequence, progress, sticky section links.
- **Interactive lab:** diagrams, controls, legends, stat panels, instructions, simulations.

The clutter appears because these modes often speak at the same visual volume. Small type is one symptom. Heavy borders, repeated labels, dense uppercase metadata, persistent sidebars, sticky bars, legends, and control panels are the rest of the same issue.

The right fix is **hierarchy first, typography second**:

1. Decide which mode is primary on each surface.
2. Promote the primary task.
3. Demote, collapse, or relocate supporting UI.
4. Raise text size where the text still needs to be read.

If we only enlarge everything, the page may become more readable but more exhausting.

---

## 2. Product Mode Rules

These rules govern the redesign. Every phase should preserve them.

### Reading Mode

Primary task: understand the lesson.

- Lesson prose, equations, examples, and code are primary.
- Navigation and metadata should orient, not compete.
- Section shells should reduce repeated chrome.
- Long optional material can stay available but should not interrupt the main reading path.

### Navigation Mode

Primary task: choose where to go next.

- Sidebar, sticky module progress, and section navigation are useful, but they are secondary inside a lesson.
- Persistent navigation must be readable, compact, and calm.
- If navigation needs tiny text to fit, the layout is carrying too much information.

### Lab Mode

Primary task: manipulate the algorithm and understand the result.

- The plot/canvas and the controls that affect it are primary.
- Legends, stat panels, and explanatory notes are supporting.
- Instructions should be near the relevant control or collapsed into a concise help area.
- State changes must be understandable without relying on color alone.

---

## 3. Goals

- Make lesson prose, navigation, controls, captions, form labels, and algorithm UI readable without browser zoom.
- Reduce clutter by clarifying hierarchy, not by removing useful learning content.
- Keep the study-workspace density where it helps learning.
- Establish reusable typography and section patterns so future modules do not reintroduce tiny one-off UI.
- Improve shared lesson and visualization primitives before spending effort on individual visualizations.
- Keep each phase shippable and reversible.

## 4. Non-Goals

- Do not rewrite algorithm content.
- Do not turn the site into a marketing page or oversized editorial layout.
- Do not replace the design system wholesale.
- Do not change routing, data schema, or static export behavior unless a phase explicitly calls for a small compatibility update.
- Do not treat every tiny visual mark as a bug. Decorative indices, axis ticks, compact IDs, and ornaments may stay smaller when they do not carry primary meaning.

---

## 5. Readability and Accessibility Targets

| Surface | Target |
|---|---|
| Lesson prose | `17px` mobile minimum, `18px` desktop target, line-height around `1.65` to `1.8`. |
| Supporting explanatory copy | `15px` to `16px` preferred. |
| Dense but essential text | `14px` minimum. |
| Persistent navigation | `13px` minimum; `14px` preferred where space allows. |
| Chips and metadata | `12px` only for nonessential labels; `13px` to `14px` preferred. |
| Interactive controls | Visible label text `13px` minimum; accessible names required for icon-only controls. |
| Code and math | `14px` to `16px`; preserve horizontal overflow for long code, formulas, and KaTeX. |
| SVG labels | `12px` minimum for meaningful labels; `13px` to `14px` preferred for annotations and stat cards. Axis ticks may be smaller if chart meaning remains clear. |
| Touch/click targets | `40px` high where practical; `44px` preferred on touch surfaces. |
| Focus and state | Visible focus, sufficient contrast, and non-color cues for selected, correct, incorrect, warning, and active states. |

---

## 6. Acceptance Gates

These gates prevent subjective cleanup from drifting.

| Gate | Acceptance |
|---|---|
| Mode hierarchy | Each changed surface identifies its primary mode: reading, navigation, or lab. Supporting UI is visually demoted or relocated. |
| Core lesson prose | Normal rendered lesson prose meets the prose target. No `sm:` breakpoint makes prose smaller than the base size. |
| Core lesson shell | Essential headings, section subtitles, metadata, and component copy are at least `14px`, except decorative counters or nonessential indices. |
| Persistent navigation | Sidebar and sticky lesson navigation labels are at least `13px`; anchor jumps are not hidden under sticky bars. |
| Shared visualization chrome | Shell title, subtitle, legend labels, insight text, instructions, and controls are at least `13px`; primary explanatory text is at least `14px`. |
| Individual diagrams | Meaningful SVG labels and stat panels are readable at `390px`, `768px`, and `1440px`; no primary label/control overlaps at those widths. |
| Accessibility | Keyboard focus remains visible; state is not color-only; controls have accessible names. |
| Full site | `npm run lint`, `npm run test`, and `npm run build` pass. Cypress/mobile checks run when the changed surface is covered by existing specs or layout risk is high. |

---

## 7. Phase Plan

### Phase 0 - Audit, Mode Map, and Regression Loop

**Purpose:** Create the evidence base before changing UI.

#### Work

- Run a targeted tiny-text and density audit:

```bash
rg -n "text-\[(8|9|10|11|12|13)px\]|text-xs|prose-sm|sm:text-xs|sm:text-base|tracking-\[0\.(1[4-9]|2)[^\]]*em\]" src
```

- Classify findings as:
  - **Essential:** body copy, controls, labels, navigation, stat values, instructions.
  - **Supporting:** captions, metadata, legend items, secondary notes.
  - **Decorative:** counters, axis ticks, ornaments, compact IDs.
- Map representative surfaces to product mode:
  - Lesson pages: reading primary.
  - Sticky nav/sidebar: navigation secondary inside lessons.
  - Visualization sections: lab primary inside a reading flow.
  - Playground/GradForge: lab primary.
- Capture baseline screenshots or notes at:
  - `390px`
  - `768px`
  - `1440px`
- Representative pages:
  - Home.
  - Calculus.
  - Linear Regression.
  - Transformers.
  - Playground.
  - GradForge.

#### Exit Criteria

- Prioritized issue list exists.
- Findings are classified as essential, supporting, or decorative.
- Surfaces are mapped to reading, navigation, or lab mode.
- Audit command is documented.
- No product UI changes are made in this phase.

---

### Phase 1 - Hierarchy and Type Foundations

**Purpose:** Establish shared rules so every later phase does less local guessing.

#### Work

- Add or revise global utilities in `src/app/globals.css`:
  - readable prose utility.
  - section label/eyebrow utility.
  - metadata/chip utility.
  - compact control text utility.
  - secondary/decorative label guidance.
- Raise `chip-base`, `text-label-upper`, and `text-mono-sm`.
- Remove breakpoint regressions where text gets smaller on larger screens.
- Define a small set of usage rules:
  - prose uses prose utility.
  - metadata uses metadata utility.
  - controls use control utility.
  - decorative labels are allowed only when classified as decorative.
- Update shared renderers first:
  - `src/components/lesson/LogicContent.tsx`
  - `src/components/ui/MarkdownRenderer.tsx`
  - `src/components/ui/CodeBlock.tsx`

#### Exit Criteria

- Core lesson prose meets the prose target.
- Essential text in shared renderers is at least `14px`.
- No `sm:` breakpoint shrinks prose or essential lesson copy.
- `npm run lint`, `npm run test`, and `npm run build` pass.

---

### Phase 2 - Reading Mode: Lesson Shell

**Purpose:** Make algorithm pages feel like one learning flow instead of many equal-weight boxes.

#### Work

- Simplify `LessonPage.tsx`:
  - keep title, description, difficulty, time, and track metadata.
  - reduce repeated chip styling and dense uppercase labels.
  - increase spacing around primary description and prose.
- Standardize section treatment:
  - add a `LessonSection` shell only if it reduces duplication and future churn.
  - use fewer full rectangular borders.
  - reduce repeated icon blocks where they add noise.
  - remove section subtitles that merely restate the heading.
- Preserve learning flow:
  - TL;DR and objectives stay near the top.
  - visualization remains distinct but should not overwhelm prose.
  - optional derivations, practice answers, and quiz explanations stay collapsible.
- Check lesson interactions:
  - quiz answer states have non-color cues.
  - reveal/collapse controls have readable labels and focus states.

#### Files Likely Involved

- `src/components/lesson/LessonPage.tsx`
- `src/components/lesson/TLDR.tsx`
- `src/components/lesson/LearningObjectives.tsx`
- `src/components/lesson/MathDerivations.tsx`
- `src/components/lesson/PracticeExercises.tsx`
- `src/components/lesson/WorkedExamples.tsx`
- `src/components/lesson/ComparisonTable.tsx`
- `src/components/lesson/WhenToUse.tsx`
- `src/components/lesson/CaseStudy.tsx`
- `src/components/lesson/SelfCheckQuiz.tsx`

#### Exit Criteria

- Reading mode is clearly primary on algorithm pages.
- Lesson sections meet the core lesson shell gate.
- Content sections remain keyboard reachable and anchor-linked.
- Unit tests for changed lesson components pass.

---

### Phase 3 - Navigation Mode: Persistent Orientation

**Purpose:** Keep orientation useful without letting navigation dominate the lesson.

#### Work

- Redesign `LessonNavigator.tsx` density:
  - raise tiny module metadata and section tab text.
  - reduce uppercase mono usage and excessive tracking.
  - use labels, icons, or compact controls based on available width.
  - limit sticky nav height.
  - verify anchor offsets after sticky height changes.
- Improve `Sidebar.tsx`:
  - raise track sequence text.
  - raise utility links and prerequisite chips.
  - reduce ultra-small uppercase labels.
  - preserve dense navigation value while improving click targets.
- Check `Header.tsx` and `SearchBar.tsx` for matching scale and focus behavior.

#### Files Likely Involved

- `src/components/lesson/LessonNavigator.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/components/SearchBar.tsx`

#### Exit Criteria

- Persistent navigation meets the navigation gate.
- Navigation remains secondary inside lessons.
- Mobile navigation does not wrap awkwardly.
- Anchor jumps do not hide headings.
- Keyboard focus remains visible.
- Cypress navigation/mobile specs pass when feasible.

---

### Phase 4 - Lab Mode: Shared Visualization Shell and Controls

**Purpose:** Make algorithm interactions clearer before touching individual diagrams.

#### Work

- Update `VisualizationShell`:
  - make title, subtitle, insight, legend, and label text readable.
  - demote "Interactive Diagram" and "Key Insight" badges.
  - make plot/canvas the visual center.
- Update shared primitives:
  - `ControlPanel`
  - `NarrativeControls`
  - `StepIndicator`
  - `VisualizationInstruction`
  - `PlotFrame`
- Improve control hierarchy:
  - group controls by task.
  - increase hit areas where needed.
  - ensure controls have accessible names and visible focus.
  - keep controls near the output they affect.
- Rework legends:
  - avoid many tiny pills wrapping across the top.
  - use concise inline legends or a secondary details area.
- Preserve visualization sizing and avoid layout shifts.

#### Files Likely Involved

- `src/components/ui/visualizationPrimitives.tsx`
- `src/components/ui/AlgorithmVisualization.tsx`
- `src/components/ui/visualizations/D3Visualization.tsx`
- `src/components/ui/visualizations/*.tsx`

#### Exit Criteria

- Shared visualization chrome meets the shared visualization gate.
- Plot/canvas and primary controls are visibly dominant.
- Controls are easier to hit and interpret.
- State is not communicated by color alone.
- Visualizations still render nonblank and interactive.
- Visualization tests and Cypress specs pass when feasible.

---

### Phase 5 - Representative Diagrams, Not Broad Cleanup

**Purpose:** Validate the shared primitives against a small, meaningful set before scaling.

#### Work

- Select 5-7 representative visualizations that stress different layouts:
  - dense controls.
  - SVG annotations.
  - stat panels.
  - legends.
  - mobile wrapping.
- Recommended starting set:
  - Linear Regression.
  - Logistic Regression.
  - Decision Trees.
  - Neural Networks.
  - Transformers.
  - RAG.
  - Evaluation Metrics.
- For each selected diagram:
  - remove or consolidate nonessential labels.
  - move explanatory text out of the plot where practical.
  - enlarge meaningful SVG labels.
  - keep algorithmically important marks visually dominant.
  - verify `390px`, `768px`, and `1440px`.
- Feed repeated fixes back into shared primitives before continuing.

#### Exit Criteria

- Representative diagrams meet the individual diagram gate.
- Shared primitive gaps discovered during this phase are fixed centrally.
- Visual accuracy tests still pass.
- Mobile screenshots show no overlapping primary controls or labels.

---

### Phase 6 - Scale Visualization Cleanup

**Purpose:** Apply the proven approach to the remaining visualization set without inventing new local patterns.

#### Work

- Triage the remaining visualization files by severity.
- Apply shared primitive changes where possible.
- Make local diagram edits only when the problem is truly diagram-specific.
- Keep a small exception list for decorative tiny text that is intentionally retained.

#### Exit Criteria

- High-severity diagrams are cleaned up.
- Remaining tiny text exceptions are classified.
- Visualization audit tests pass.

---

### Phase 7 - Secondary Labs and Sitewide Cleanup

**Purpose:** Apply the readability standard to adjacent interactive surfaces after the algorithm learning path is stable.

#### Work

- Review standalone interactive surfaces:
  - `src/components/ui/AlgorithmSimulator.tsx`
  - `src/app/playground/page.tsx`
  - `src/app/gradforge/page.tsx`
  - `src/components/ui/GradForgeLab.tsx`
- Raise tiny labels, stat cards, form controls, and instruction text.
- Reduce panel density where controls, stats, and explanatory text compete.
- Preserve task-oriented lab layouts; do not turn them into landing pages.

#### Exit Criteria

- Essential lab text is at least `14px`.
- Interactive controls remain usable at `390px`, `768px`, and `1440px`.
- Existing lab tests and smoke checks pass.

---

### Phase 8 - Verification, Regression Tests, and Polish

**Purpose:** Lock in readability improvements and prevent regression.

#### Work

- Re-run the tiny-text audit and compare against Phase 0.
- Decide whether remaining tiny text is decorative, acceptable, or deferred.
- Add or update tests where practical:
  - component tests for visualization controls and lesson sections if markup changes.
  - Cypress assertions for mobile nav and visualization overlap where existing specs make this cheap.
  - visual/audit checks for visualization rendering.
- Run full verification:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - `npm run cy:run` or `npm run test:e2e` when feasible
- Manual review:
  - inspect representative algorithms at `390px`, `768px`, and `1440px`.
  - check keyboard navigation through sticky nav, collapsible sections, and visualization controls.
  - verify KaTeX and code blocks remain readable and horizontally scrollable.

#### Exit Criteria

- Build, lint, and tests pass.
- Representative pages meet the acceptance gates.
- No major UI text overlaps or truncates.
- The docs plan is updated with completed phases and deferred items.

---

## 8. Strategic Guardrails

- Treat hierarchy as the core problem and typography as one tool.
- Fix shared surfaces before individual diagrams.
- Prefer removing, moving, or collapsing secondary UI before reducing text size.
- Keep the learning task primary. More whitespace is helpful only when it improves comprehension or control clarity.
- Preserve useful density. This is a study workspace, not a landing page.
- Avoid creating a new design system. Add a shared component or utility only when it removes repeated local typography or section-shell decisions.
- Treat the audit as advisory, not a blunt rule.
- Make each phase shippable. Do not bundle global typography, navigation, lesson shells, and every visualization into one large change.

---

## 9. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Larger text worsens clutter | Pair every size increase with a hierarchy decision: primary, supporting, or decorative. |
| Larger text causes wrapping and vertical growth | Use responsive layout constraints, test mobile early, and simplify surrounding chrome instead of shrinking text back down. |
| Sticky navigation takes too much space | Reduce nav chrome, use compact controls, and verify anchor offset behavior. |
| Visualization cleanup becomes a file-by-file campaign | Validate on representative diagrams first, then push repeated fixes back into shared primitives. |
| Visualization changes break tests | Run visualization tests after each group of changes and keep algorithm math untouched. |
| Inconsistent typography returns through one-off classes | Add reusable utilities and rerun the audit after each phase. |
| Decluttering removes useful context | Preserve content, but change presentation: collapse, relocate, or de-emphasize secondary context instead of deleting it. |
| Audit creates false positives | Classify findings as essential, supporting, or decorative before changing code. |
| Scope expands into a full redesign | Keep phases anchored to hierarchy, readability, clutter reduction, and acceptance gates. |

---

## 10. Third-Eye Review

The deeper issue is product-mode conflict. The lesson page is trying to be a reading surface, a curriculum dashboard, and a lab bench at the same time. The current UI gives too many of those responsibilities equal volume.

The most important design question for every screen is therefore: **what mode is primary here?** On a lesson page, reading is primary. In the visualization section, lab mode temporarily becomes primary, but only inside that section. In the sidebar and sticky navigator, navigation is useful but secondary.

The main failure mode would be treating this as a typography sweep. A typography sweep will find hundreds of tiny classes and can produce a superficially cleaner but strategically confused UI. The work should instead reduce competition: fewer repeated labels, less section chrome, calmer nav, clearer controls, and only then larger text.

The second failure mode is overcorrecting. This site should still feel like a serious study workspace. Learners need sequence, progress, formulas, code, controls, and feedback. The goal is not spaciousness. The goal is that the next useful learning action is obvious.

The third failure mode is local inconsistency. If each visualization is cleaned manually, the site will acquire 40 slightly different UI systems. Representative diagrams should pressure-test shared primitives, and broad cleanup should happen only after those primitives are proven.

The plan is strong if it stays disciplined: audit, establish hierarchy and type foundations, make reading mode primary, calm navigation, clean shared lab chrome, validate on representative diagrams, then scale. That sequence attacks the actual cause rather than chasing symptoms.

---

## 11. Work Tracker

### Phase 0 - Audit, Mode Map, and Regression Loop ✅ COMPLETE (2026-06-16)
- [x] Tiny text class audit completed.
- [x] Findings classified as essential, supporting, or decorative.
- [x] Surfaces mapped to reading, navigation, or lab mode.
- [x] Baseline notes captured (see findings below; live screenshots deferred — no browser in this env).
- [x] Reusable audit command documented (see §7 Phase 0).

#### Audit results (baseline)

Run of the documented audit command: **552 matches across 75 files** —
`text-xs` ×183, `text-[8–13px]` ×260, heavy `tracking-[≥0.14em]` ×84,
`sm:`-breakpoint **shrink** regressions ×14, `prose-sm` ×1.

**Classification & mode map:**

| Surface (mode) | Finding | Class | Priority |
|---|---|---|---|
| Lesson shell + active-learning components (`LessonPage`, `TLDR`, `LearningObjectives`, `ComparisonTable`, `WhenToUse`, `PracticeExercises`, `SelfCheckQuiz`, `CaseStudy`, `Misconceptions`, `WorkedExamples`, `ReferenceList`) — **reading** | `text-[15px] sm:text-sm` and `text-sm sm:text-xs`: prose/metadata **shrinks on larger screens** (direct gate violation) | Essential | **High (Phase 1/2)** |
| Shared renderers (`LogicContent`, `CodeBlock`) — **reading** | `sm:text-base`/`sm:text-sm`/`sm:text-xs` shrink modifiers on prose, headings, code header | Essential | **High (Phase 1)** |
| `globals.css` utilities | `chip-base` 12px, `text-label-upper` ~11px (below 13px nav/label target); `text-mono-sm` 14px (OK) | Essential/Supporting | **High (Phase 1)** |
| `Sidebar.tsx`, `LessonNavigator.tsx` — **navigation** | 13 / (navigator) tiny mono metadata + heavy uppercase tracking | Essential/Supporting | Medium (Phase 3) |
| Visualization "Mental model" / code-snippet labels (`text-xs sm:text-sm`) across ~40 `visualizations/*.tsx` — **lab** | Base 12px label that grows to 14px on desktop; tiny stat/legend text | Supporting | Medium (Phase 4–6) |
| `AlgorithmSimulator` (35), `GradForgeLab` (32), `playground`/`gradforge` pages — **lab** | Highest tiny-text density; dense stat/control labels | Mixed | Lower (Phase 7) |
| Axis ticks, compact indices, ornaments in viz | small but non-primary | Decorative | Retain (exception list) |

**Key takeaway:** the most clear-cut, highest-leverage fixes are the
`sm:` **shrink regressions** concentrated in the lesson/reading surfaces
(several of them in the recently-added active-learning components), plus
raising the two shared `globals.css` label utilities — exactly the
Phase 1 / Phase 2 scope. The long tail (≈90% of raw matches) is
supporting/decorative text inside the 40 visualization files and the two
standalone labs, which the plan correctly defers to Phases 4–7 behind
shared-primitive changes.

### Phase 1 - Hierarchy and Type Foundations
- [ ] Global text utilities revised.
- [ ] Shared hierarchy usage rules documented in code comments or component patterns where useful.
- [ ] Lesson prose and markdown renderer updated.
- [ ] Shared chips, labels, metadata, and code-block labels updated.

### Phase 2 - Reading Mode: Lesson Shell
- [ ] Header simplified.
- [ ] Repeated section shell standardized or reduced.
- [ ] Long optional content remains collapsible.
- [ ] Quiz/reveal states checked for non-color cues.

### Phase 3 - Navigation Mode: Persistent Orientation
- [ ] Sticky lesson navigator made more readable.
- [ ] Sidebar navigation made more readable.
- [ ] Header/search labels checked.
- [ ] Anchor offsets and mobile navigation checked.

### Phase 4 - Lab Mode: Shared Visualization Shell and Controls
- [ ] Visualization shell typography raised.
- [ ] Controls and stepper hierarchy improved.
- [ ] Legend and instruction density reduced.
- [ ] Focus states and accessible names checked.

### Phase 5 - Representative Diagrams
- [ ] Representative visualization set finalized.
- [ ] First representative diagrams cleaned up.
- [ ] Repeated fixes pushed back into shared primitives.
- [ ] Mobile overlap checks completed.

### Phase 6 - Scale Visualization Cleanup
- [ ] Remaining visualization severity list finalized.
- [ ] High-severity diagrams cleaned up.
- [ ] Tiny text exceptions classified.

### Phase 7 - Secondary Labs and Sitewide Cleanup
- [ ] Playground readability checked.
- [ ] GradForge readability checked.
- [ ] Algorithm simulator readability checked.

### Phase 8 - Verification, Regression Tests, and Polish
- [ ] Audit rerun and remaining exceptions classified.
- [ ] Lint, tests, and build pass.
- [ ] Cypress or manual viewport checks completed.
- [ ] Plan updated with completed work and deferred items.
