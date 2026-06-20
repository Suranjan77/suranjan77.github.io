# Computer Vision Learning Track — Implementation Plan & Work Tracker

> **Status:** Proposed · **Branch:** `claude/compassionate-ptolemy-2ockq9`
> **Owner:** Suranjan · **Last updated:** 2026-06-20
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
| 8 | `src/components/ui/visualizations/D3Visualization.tsx` | For each new module **with** a viz: import the component, add a `configs` entry, a `visualizationComponents` entry, and an `accessibleLabels` entry. |
| 9 | `src/lib/__tests__/prerequisiteGraph.test.ts` | Add a `getTrackModules('computer-vision')` test mirroring the existing practitioner test. |

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

---

## 4. Per-new-module authoring checklist (apply to each of the 3)

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

### Phase 2 — New module: Image Segmentation
- [ ] Author `37_image_segmentation.ts` + register + (optional) `ImageSegmentationViz`
- [ ] Meets §4 checklist; `status: 'published'`

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
