# Computer Vision Learning Track — Implementation Plan & Work Tracker

> **Status:** In progress — Phase 2 (Image Segmentation) shipped · **Branch:** `claude/compassionate-ptolemy-2ockq9`
> **Owner:** Suranjan · **Last updated:** 2026-06-20
>
> **Start here next time:** read §8 (Implementation Playbook) — it is the verified,
> end-to-end recipe for authoring a module. Phase 1 (stand up the track) and Phases 3–6
> (Vision Transformers, Diffusion, plus the §3c practitioner/modern-ai unit modules)
> remain.
>
> Living source of truth for adding a third **learning track**, *Computer Vision*,
> to ML Learn. Update the **Work Tracker** checkboxes as tasks land; keep the design
> sections in sync if the approach changes.

---

## 1. Context & Goal

ML Learn currently ships **two learning tracks** — *ML Practitioner* (classical ML)
and *Modern AI Systems* (deep learning → transformers → LLMs) — defined in
`src/lib/tracks.ts`. A track is a guided, prerequisite-ordered path through a subset
of the 32 modules; modules opt in via their optional `tracks?: TrackId[]` field.

Vision content already exists but is **scattered across the modern-ai track**
(`cnn`, `computer-vision`, `autoencoders`, `generative-models`) with no dedicated
path that takes a learner from convolutions → detection/segmentation → modern
vision transformers and generative vision.

**Goal:** Introduce a **Computer Vision** track that (a) bundles the existing vision
modules into a coherent, prerequisite-ordered path, and (b) is rounded out with a
small number of **new modules** that close obvious gaps (image segmentation, vision
transformers, diffusion-based image generation). The site stays a static GitHub Pages
export — no backend, no runtime AI.

**Secondary goal (same effort).** While authoring new modules, also add the
previously-flagged unit-level gaps **where they fit existing tracks** — Gradient
Boosting and Model Evaluation & Validation strengthen *ML Practitioner*; Optimization &
Optimizers strengthens *Modern AI Systems*; Diffusion is already part of the CV track
above and simply carries multi-track membership. These are independent of the CV track
and can ship in any order — see §3c.

### Design principles
- **Additive & backward compatible.** Adding a track is a new `TrackId` plus a
  `learningTracks` entry. Existing modules **join** the CV track by appending
  `'computer-vision'` to their `tracks` array; they keep their current track
  memberships (a module can belong to multiple tracks — e.g. `['practitioner', 'modern-ai']`
  already exists). No module is removed from `modern-ai`.
- **Reuse the module pattern.** New modules follow the exact `LearningModule` shape and
  the active-learning rubric already used by published modules (TL;DR, learning
  objectives, derivations in `additionalSections`, ≥1 comparison table, ≥1 case study,
  3–5 quiz questions, usage guidance, references). The Self-Check Quiz is the only
  question-answer interaction (per the prior cleanup).
- **Ordering is automatic.** `getTrackModules()` in `src/lib/prerequisiteGraph.ts`
  topologically sorts a track's modules by `prerequisites`, so path order is derived
  from prerequisite edges — set those correctly and ordering takes care of itself.
- **Static-export safe.** New D3 visualizations use the existing `useState`-only viz
  pattern and register in `D3Visualization.tsx`; modules without a viz set
  `hasVisualization: false`.

---

## 2. Architecture Reference — every track touch-point (verified)

Adding a track touches a small, well-defined set of files. All paths verified against
the current tree.

| # | File | Change |
|---|------|--------|
| 1 | `src/data/algorithms_content/learningModuleTypes.ts` | Extend the union: `export type TrackId = 'practitioner' \| 'modern-ai' \| 'computer-vision';` |
| 2 | `src/lib/tracks.ts` | Append a `LearningTrack` entry `{ id: 'computer-vision', title: 'Computer Vision', description: '…' }` to `learningTracks`. |
| 3 | `src/components/layout/Sidebar.tsx` | Add `'computer-vision': 'Computer Vision'` to the `trackLabels` record (line ~21). |
| 4 | `src/components/lesson/MetadataBar.tsx` | Add a `case 'computer-vision': return 'Computer Vision';` to `formatTrackLabel` (line ~45). |
| 5 | `src/components/ui/TrackCurriculumExplorer.tsx` | No change required — it maps over `learningTracks`. Optionally revisit the hardcoded `"practitioner"` default-open (lines 20 & 98) if CV should auto-expand. |
| 6 | Module data files (`src/data/algorithms_content/*.ts`) | Append `'computer-vision'` to the `tracks` array of each module that belongs to the path (see §3). |
| 7 | `src/data/algorithms_content/index.ts` | Import + add each **new** module to `algorithmsList`. |
| 8 | `src/components/ui/visualizations/D3Visualization.tsx` | For each new module **with** a viz: (a) `import` the component, (b) add an `extendedVisualizations[id]` entry (`component`, `title`, `subtitle`, `insight`) **or** a `configs[id]` entry — the registry builder does `metadata = extendedVisualizations[id] ?? configs[id]` and **throws if neither exists**, (c) add a `visualizationComponents[id]` entry, (d) add an `accessibleLabels[id]` entry. |
| 9 | `src/data/algorithms.test.ts` | **Easy to miss.** Add the new module `id` to the hardcoded `requiredIds` array **in the same position** as in `algorithmsList`. This test asserts the exact curriculum order and fails otherwise. |
| 10 | `src/lib/__tests__/prerequisiteGraph.test.ts` | Add a `getTrackModules('computer-vision')` test mirroring the existing practitioner test. |

**No route change needed.** `/tracks/[trackId]` uses `generateStaticParams()` over
`learningTracks`, and `/algorithms/[slug]` uses `generateStaticParams()` over
`algorithmsList` — both pick up the new track and new modules automatically.

---

## 3. Track composition

### 3a. Existing modules that join the CV track (append `'computer-vision'`)
Listed in intended learning order (final order is derived topologically from prerequisites):

1. `neural-networks` *(foundation — also keeps its current track)*
2. `backpropagation` *(foundation)*
3. `cnn` — Convolutional Neural Networks
4. `computer-vision` — Computer Vision Foundations *(detection, IoU, segmentation overview)*
5. `autoencoders` — representation / denoising
6. `generative-models` — generative vision context

> Keep `neural-networks` / `backpropagation` membership light if they should not appear
> as "owned" by CV — alternatively reference them only as prerequisites. Decide during
> Phase 1; the safe default is to add them so the path is self-contained.

### 3b. New modules to author (the "create a new module" work)
Each is a full, rubric-compliant `LearningModule`. Folds in the earlier unit ideas
(segmentation, ViT, diffusion).

| New module | `id` | Prereqs | Viz? | Core content |
|---|---|---|---|---|
| **Image Segmentation** | `image-segmentation` | `cnn`, `computer-vision` | Yes — U-Net encoder/decoder + per-pixel mask | Semantic vs instance vs panoptic; U-Net skip connections; Dice/Tversky/focal loss; mIoU; Mask R-CNN head |
| **Vision Transformers** | `vision-transformers` | `transformers`, `computer-vision` | Yes — patchify + attention-over-patches | Patch embeddings, [CLS] token, ViT vs CNN inductive bias, DETR, CLIP image–text alignment |
| **Diffusion Models** | `diffusion-models` | `generative-models`, `neural-networks` | Yes — forward noising / reverse denoising over steps | Forward/reverse process, noise schedule, score/ε-prediction, DDPM vs DDIM, latent diffusion / text-to-image |

> `vision-transformers` also reasonably belongs to `modern-ai`; `diffusion-models` to
> both `modern-ai` and `computer-vision`. Use multi-track membership.

### 3c. Additional new modules for the existing tracks (the previously-flagged units)

These close unit-level gaps surfaced earlier. They are **not** part of the CV track —
each joins an existing track via its `tracks` field — but they reuse the identical
authoring workflow (§4) and ship under the same effort. `diffusion-models` from §3b
already covers the "Diffusion" unit and just adds `modern-ai` to its `tracks`.

| New module | `id` | Track(s) | Prereqs | Viz? | Core content |
|---|---|---|---|---|---|
| **Gradient Boosting** | `gradient-boosting` | `practitioner` | `decision-trees`, `ensemble` | Yes — additive stage-wise residual fitting | Boosting vs bagging, gradient / functional-gradient view, shrinkage, regularization, XGBoost/LightGBM, early stopping |
| **Model Evaluation & Validation** | `model-evaluation` | `practitioner` | `logistic-regression` | Yes — ROC/PR curve + threshold sweep | Train/val/test split, k-fold CV, precision/recall/F1, ROC-AUC, confusion matrix, bias–variance, data leakage |
| **Optimization & Optimizers** | `optimization-optimizers` | `modern-ai` | `backpropagation`, `neural-networks` | Yes — loss-surface descent under SGD/Momentum/Adam | GD / SGD / mini-batch, learning rate, momentum, RMSProp, Adam, LR schedules, warmup |

> Place `model-evaluation` early in the practitioner ordering (its only prereq is
> `logistic-regression`) so learners meet evaluation methodology before deeper models —
> the topological sort in `getTrackModules()` handles ordering once prereqs are set.

---

## 4. Per-new-module authoring checklist (apply to each new module)

Mirror a published exemplar such as `12_computer_vision.ts` or `3b_logistic_regression.ts`.

- [ ] Required legacy fields: `id`, `title`, `category`, `shortDescription`,
      `fullDescription`, `intuition`, `mathematics`, `pros`, `cons`, `codeSnippet`.
- [ ] `category`: add a new `AlgorithmCategory` literal in `types.ts` if the topic needs
      one (e.g. `"Image Segmentation"`), or reuse `"Computer Vision"`.
- [ ] Path metadata: `tracks` (incl. `'computer-vision'`), `difficulty` (1–4),
      `estimatedMinutes` (10–120), `prerequisites`, `relatedModules`.
- [ ] Active-learning content meeting the **published rubric** (enforced by tests once
      `review.status === 'published'`):
  - [ ] `learningObjectives` (≥3) and `tldr` (3–6 points)
  - [ ] `keyTerms`, `misconceptions` (≥2), `failureModes` (≥1)
  - [ ] `references` (≥2, each with a title)
  - [ ] `additionalSections` with ≥1 derivation
  - [ ] `comparisons` with ≥1 table (each row's `values.length === methods.length`)
  - [ ] `caseStudies` with ≥1 study (title/scenario/approach/outcome, quantified outcome)
  - [ ] `usageGuidance` with ≥2 `useWhen` and ≥2 `avoidWhen`
  - [ ] `quiz` with 3–5 questions, each ≥3 options, ≥1 correct, an `explanation`
  - [ ] optional `shortAnswerQuestions`
  - [ ] `review: { status: 'published', reviewedBy, lastReviewed }`
- [ ] Register in `index.ts` (import + push into `algorithmsList`).
- [ ] Visualization: author `XxxViz.tsx` under `src/components/ui/visualizations/`
      following the existing `useState`-only pattern, then register it in the three
      records inside `D3Visualization.tsx`. If deferring the viz, set
      `hasVisualization: false` (the mathematics/codeSnippet content-validation tests
      are then skipped for that module).

---

## 5. Work Tracker

### Phase 1 — Stand up the empty track (no new content yet)
- [ ] Extend `TrackId` union (file #1)
- [ ] Add `learningTracks` entry (file #2)
- [ ] Add `trackLabels` + `formatTrackLabel` mappings (files #3, #4)
- [ ] Append `'computer-vision'` to existing vision modules' `tracks` (§3a)
- [ ] Add `getTrackModules('computer-vision')` test (file #9)
- [ ] Verify `/` (TrackCurriculumExplorer) shows the new track with the bundled modules
- [ ] `npm run lint && npm run test && npm run build` green

### Phase 2 — New module: Image Segmentation ✅
- [x] Author `37_image_segmentation.ts` + register in `index.ts`
- [x] Author `ImageSegmentationViz` (threshold → per-pixel mask, live Dice/IoU) + register in `D3Visualization.tsx`
- [x] Meets §4 checklist; `status: 'published'`
- [x] lint + test (7037 passing) + build green
- [ ] Re-tag `tracks` to include `'computer-vision'` once Phase 1 lands (currently `['modern-ai']`)

### Phase 3 — New module: Vision Transformers
- [ ] Author `38_vision_transformers.ts` + register + (optional) `VisionTransformersViz`
- [ ] Meets §4 checklist; `status: 'published'`

### Phase 4 — New module: Diffusion Models
- [ ] Author `39_diffusion_models.ts` + register + (optional) `DiffusionViz`
- [ ] Meets §4 checklist; `status: 'published'`

### Phase 5 — Polish
- [ ] Confirm topological order of the CV path reads sensibly on the homepage
- [ ] Cross-link `relatedModules` between new and existing vision modules
- [ ] Decide whether CV should auto-expand in `TrackCurriculumExplorer`
- [ ] Update this tracker + the `active-learning-upgrade.md` rollout notes if relevant

### Phase 6 — Additional unit modules for existing tracks (§3c; independent of CV)
- [ ] Author `gradient-boosting` (practitioner) + register + (optional) viz; `status: 'published'`
- [ ] Author `model-evaluation` (practitioner) + register + (optional) viz; `status: 'published'`
- [ ] Author `optimization-optimizers` (modern-ai) + register + (optional) viz; `status: 'published'`
- [ ] Add `'modern-ai'` to `diffusion-models` `tracks` (covers the Diffusion unit)
- [ ] Each meets the §4 checklist; `npm run lint && npm run test && npm run build` green

---

## 6. Testing & validation gates

Run before every commit:

```bash
npm run lint        # ESLint — must be clean
npm run test        # Vitest — schema, content-validation, published rubric, track tests
npm run build       # next build — static export of all pages incl. /tracks/computer-vision
```

Test surfaces that will exercise this work automatically:
- `src/data/algorithms_content/__tests__/schema.test.ts` — id/slug uniqueness, prereq
  references exist, **no prerequisite cycles**, quiz/comparison/case-study structure.
- `src/data/__tests__/contentValidation.test.ts` — per-module minimums and the
  **published-module active-learning rubric** (the bar each new module must clear).
- `src/lib/__tests__/prerequisiteGraph.test.ts` — add the CV-track assertion here.

---

## 7. Risks & decisions to confirm

- **Multi-track vs move.** Recommendation: keep existing vision modules in `modern-ai`
  *and* add them to `computer-vision` (additive). Confirm you don't instead want them
  moved out of `modern-ai`.
- **Foundation modules in the path.** Including `neural-networks`/`backpropagation`
  makes the track self-contained but lengthens it. Default: include; easy to drop.
- **New `AlgorithmCategory` values.** Adding categories is a one-line union change but
  used in filters/labels — keep names consistent with existing style.
- **Visualization scope.** Three new D3 visualizations is the largest effort. If time-
  constrained, ship modules with `hasVisualization: false` first and add viz in a
  follow-up — the rubric does not require a visualization.

---

## 8. Implementation Playbook — verified from the Image Segmentation build (Phase 2)

> This section is the **ground truth** for authoring a new module. It was confirmed end-
> to-end while shipping `image-segmentation` (module #37, `4b184d4`): all gates green,
> 7037 tests passing, 33 static module pages. Follow it and the next module is mechanical.

### 8.1 Exact, ordered steps to add ONE new module
1. **Create the data file** `src/data/algorithms_content/NN_name.ts` exporting a
   `LearningModule` (see the content checklist in §4 and the field bar in §8.3).
   Mirror an exemplar: `12_computer_vision.ts` or `3b_logistic_regression.ts`.
2. **Register it** in `src/data/algorithms_content/index.ts`: add the `import` and insert
   into the `algorithmsList` array at the desired curriculum position.
3. **Update the order test**: add the same `id` to `requiredIds` in
   `src/data/algorithms.test.ts` **at the identical position** (this is the single
   easiest step to forget — see §2 row 9).
4. **Visualization** (if `hasVisualization` is not `false`):
   - Author `src/components/ui/visualizations/NameViz.tsx` (see §8.2).
   - Register in `src/components/ui/visualizations/D3Visualization.tsx`: `import`,
     `extendedVisualizations[id]`, `visualizationComponents[id]`, `accessibleLabels[id]`.
   - If deferring, set `hasVisualization: false` on the module instead. That skips the
     "mathematics/codeSnippet required" content tests AND excludes it from the viz audit.
5. **Run the gates** (§8.4). Fix, repeat until green. Commit + push.

The two routes (`/algorithms/[slug]`, `/tracks/[trackId]`) regenerate automatically via
`generateStaticParams()` — no routing work.

### 8.2 Visualization contract (the audit will fail builds if any is missed)
The auto-iterating audit is `src/components/ui/visualizations/VisualizationAudit.test.tsx`
(runs `getByRole("img", { name: accessibleLabel })`, scans controls, forbids NaN/Infinity).
A compliant viz:
- Is a `"use client"` component built on `VizShell` from `../visualizationPrimitives`
  (slots: `canvas`, `controls`, `caption`, `mentalModel`). Use `COLORS` for palette
  (keys: `bg, grid, border, pink, cyan(=green), yellow, green, muted`).
- Renders a canvas element with `role="img"` and an `aria-label` **exactly equal** to the
  string in `accessibleLabels[id]`.
- Gives **every** `button`/`input`/`select`/`textarea` an accessible name (`aria-label`).
- **Is deterministic** — no `Math.random()`, no `Date.now()`, no `window`-at-import — so it
  renders identically every run. Precompute scenes from indices.
- **Never emits the literal text `NaN` or `Infinity`** — guard every division
  (`den === 0 ? 0 : num/den`) and format numbers with `.toFixed(...)`.
- `legend` is optional; the registry only reads it from a `configs[id]` entry, so if you
  use `extendedVisualizations` (the common case) just render your own inline legend in the
  canvas (as `RAGViz` / `ImageSegmentationViz` do).
- **You do NOT need to write a bespoke accuracy test.** The `VisualizationAccuracy*.test.tsx`
  files import specific components by hand and do not auto-iterate, so they neither break
  on a new viz nor require a new entry. The audit + schema + content tests are the coverage.

Good template to copy: `RAGViz.tsx` (static-ish flow diagram) or `ImageSegmentationViz.tsx`
(interactive grid + slider + live metrics).

### 8.3 Test bars enforced on every module (so write to these the first time)
- **`src/data/algorithms.test.ts`** (per-module, auto-iterated):
  - `id` matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`; present in `requiredIds` in order.
  - "Substantial content": `title` ≥ 8 chars, `shortDescription/fullDescription/intuition/
    mathematics` ≥ 40 chars, `codeSnippet` ≥ 0; none may contain `TODO|TBD|FIXME|undefined|null`.
  - **Balanced math delimiters** across `{title, shortDescription, fullDescription,
    intuition, mathematics, codeSnippet}`: an **even** count of `$$` and an **even** count
    of lone `$`. (Only these 6 fields are checked — `additionalSections`, `tldr`, etc. are not.)
  - `pros`/`cons`: ≥ 2 each, every item > 20 chars.
  - Every sentence < 900 chars; searchable tokens normalized (handled automatically if you
    avoid stray symbols).
- **`schema.test.ts`**: unique slug; `prerequisites` & `relatedModules` must reference
  existing module ids; no prerequisite cycles; each quiz q has ≥ 2 options, ≥ 1 `correct`,
  an `explanation`; each comparison row `values.length === methods.length`; case studies
  have title/scenario/approach/outcome.
- **`contentValidation.test.ts`** (always): ≥ 3 `learningObjectives`; ≥ 2 `references`
  (each with a `title`); ≥ 2 `misconceptions`; `estimatedMinutes` ∈ [10,120];
  `difficulty` ∈ [1,4]; ≥ 1 `tracks`; non-empty `mathematics` & `codeSnippet` when
  `hasVisualization !== false`; ≥ 1 `failureMode`.
- **Published rubric** (`contentValidation.test.ts`, only when `review.status === 'published'`):
  `quiz` length 3–5, each q ≥ 3 options + `explanation`; ≥ 1 `caseStudy`; `usageGuidance`
  with ≥ 2 `useWhen` and ≥ 2 `avoidWhen`; ≥ 1 `additionalSections`; `tldr` length 3–6;
  ≥ 1 `comparisons`. **Setting `status: 'published'` opts you into all of these** — use
  `'reviewed'`/`'draft'` to defer if a module is intentionally incomplete.

### 8.4 Commands & environment gotchas
```bash
CYPRESS_INSTALL_BINARY=0 npm ci      # network policy blocks the Cypress binary (403); this skips it
npm run lint                          # ESLint — must be clean
npm run test                          # vitest --run — the full suite (~7k tests, ~15s)
CYPRESS_INSTALL_BINARY=0 npm run build  # next build, static export
```
- **JSX vs data files & apostrophes.** In `.tsx` viz/components, raw `'` and `"` in text
  trigger `react/no-unescaped-entities` — use `&apos;` / `&quot;`. In `.ts` **data files**,
  apostrophes inside string literals are fine (not JSX).
- `tsc` errors about `cypress`/`describe`/`cy` are **pre-existing** (Cypress not installed,
  excluded from the app build) — ignore them; the three commands above are the real gates.

### 8.5 Decisions taken in Phase 2 (defaults to reuse)
- **Reused the existing `"Computer Vision"` `AlgorithmCategory`** rather than adding a new
  one — avoids touching `types.ts` and every category filter/label. Add a new category only
  when a module genuinely needs its own bucket.
- **Assigned the module to an existing track** (`['modern-ai']`) because the
  `computer-vision` track (Phase 1) does not exist yet — keeps everything compiling. Re-tag
  to `'computer-vision'` (additively) when Phase 1 lands.
- **Used real, cited, quantified numbers** in the case study (U-Net ISBI IoU ~0.92/~0.78)
  — the rubric expects a quantified outcome, and reviewers value verifiable figures.
- Placed the module in `algorithmsList` adjacent to its topical neighbor (`computer-vision`),
  and mirrored that exact position in `requiredIds`.
