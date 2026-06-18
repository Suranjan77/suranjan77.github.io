# Visualization Pedagogy Overhaul Plan

> **Status:** Planned
> **Last updated:** 2026-06-18
> **Scope:** Rebuild the per-algorithm interactive visualizations around pedagogy and a full-width layout. The job of each visual is to make the technique *click* in the reader's head — a clever, memorable intuition — not to be a data-accurate instrument panel.

---

## 1. Strategic Diagnosis

The visuals already run on React + SVG + `framer-motion` (animate, springs, `useNarrativeStepper`). d3 is effectively vestigial — it only lingers in a legacy `configs`/`SceneConfig` block inside `D3Visualization.tsx`. **The rendering library is not the bottleneck.** Swapping framer-motion for anime.js would be a large rewrite with no pedagogical payoff.

The real problems are three:

1. **Pedagogy.** Several visuals show the *mechanics* of an algorithm (axes, stat panels, exact numbers) without delivering the *insight*. A reader can drag the handle and watch numbers move without ever feeling the idea land. The SVD example captures the target standard: *show 2D data where one class encircles another, lift it into 3D where a flat plane suddenly separates them.* That is clever, visceral, and memorable — even though, strictly, it is the SVM kernel-trick intuition rather than SVD. The bar is **"brain clicks,"** not "numerically faithful."

2. **Layout.** 26 of ~40 visuals use the same internal two-column grid (`grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]`): canvas on the left, controls + explanation crammed into a ~340px right rail. The canvas ends up small, labels and stat cards overlap, and the explanation competes with the visual. The visual should own the **full width**; controls and prose move out of the canvas's way.

3. **Over-engineering in places.** Some visuals are too busy to read. Others are genuinely good and should be left alone — `CNNViz` is the reference for "clear and complete without clutter." Not every module needs a rewrite.

The right fix is **pedagogy and layout first, per-visual polish second** — and a triage so effort lands only where it pays off.

---

## 2. Design Principles

Every phase preserves these.

### The "click" standard

- Each visual must have one **insight moment** — a single beat where the idea becomes obvious. Design the visual backward from that moment.
- **Intuition beats accuracy.** Clever analogies, exaggerated geometry, and "not strictly correct but unforgettable" framings are welcome. Numerical fidelity is optional and secondary.
- Prefer **one strong idea per visual** over a faithful tour of the whole algorithm. Depth lives in the prose; the visual carries the spark.
- A short **guided narrative** (2–5 beats via the existing stepper) usually clicks better than a free-form sandbox. Let the reader *then* play once the idea has landed.

### Full-width visual

- The canvas spans the full content width. Controls and explanation relocate **below or into a compact strip**, never into a cramped side rail that shrinks the canvas.
- No primary label, stat, or annotation overlaps at `390px`, `768px`, or `1440px`.

### Restraint

- Simple and legible beats busy and complete. If a visual needs a legend to decode a legend, it is too complex.
- Keep what already works (e.g. `CNNViz`). Reuse beats rebuild.

---

## 3. Goals

- Reframe weak visuals so the technique clicks on first interaction.
- Give every visual a full-width canvas with controls/prose that don't compete.
- Establish one reusable **full-width visualization shell** and **narrative/controls pattern** so future modules inherit good defaults.
- Preserve and migrate the visuals that already work.
- Keep each phase shippable and reversible; checkpoint with a built exemplar before broad rollout.

## 4. Non-Goals

- Do not change the rendering library for its own sake. Keep `framer-motion`. Removing the dead d3 code is optional cleanup, not a goal.
- Do not rewrite algorithm prose/content (`src/data/algorithms_content/*`).
- Do not chase numerical accuracy. Where a clever-but-loose visual conflicts with an accuracy test, the **test changes, not the visual** (see §9).
- Do not redesign visuals already judged "good" in the triage.
- Do not change routing, data schema, or static-export behavior.

---

## 5. The "Click" Acceptance Bar

A reframed visual ships only if it passes all of these:

| Gate | Acceptance |
|---|---|
| Insight moment | There is one identifiable beat where the idea becomes obvious. A reviewer can name it in a sentence. |
| First-touch clarity | A reader who knows nothing about the technique reaches the insight within ~15 seconds of interacting, without reading the side prose first. |
| Full width | Canvas spans full content width; controls/prose are below or in a strip, not in a canvas-shrinking rail. |
| No overlap | No primary label/stat/control overlaps at 390 / 768 / 1440px. |
| Restraint | Removing any element would lose meaning — nothing decorative competes with the insight. |
| Accessibility | Keyboard-operable, visible focus, state not conveyed by color alone, accessible names on icon-only controls. |
| Build health | `npm run lint`, `npm run test`, `npm run build` pass. |

---

## 6. Full-Width Layout Spec

Replace the repeated `grid h-full gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]` with a stacked, full-width shell:

```
┌────────────────────────────────────────────┐
│  CANVAS  (full content width, responsive)    │  ← the visual owns this
│                                              │
├────────────────────────────────────────────┤
│  CONTROL STRIP  (step ◀ ▶, play, key knob)   │  ← compact, horizontal
├────────────────────────────────────────────┤
│  CAPTION / current-beat text  (1–2 lines)    │  ← changes per narrative step
└────────────────────────────────────────────┘
   ▸ Mental model (collapsible, full prose)       ← optional, expandable
```

- Introduce a shared `<VizShell>` (or extend `visualizationPrimitives.tsx`) that provides this frame so each viz only supplies the canvas + beats + controls config.
- The canvas keeps a fixed `viewBox` and scales to width; target a taller aspect on mobile, wider on desktop.
- The lesson section wrapper (`LessonPage.tsx` "Interactive Diagram", around line 154) may need to allow the diagram to use the full content column; verify it does not clip a wider canvas.
- Controls below the canvas, not beside it. Per-step caption replaces the cramped right-rail explanation. Long "Mental model" prose becomes a collapsible block.

---

## 7. Visualization Triage

Phase 0 produces the authoritative list. Tentative tiers to validate:

- **Keep (migrate to full-width shell only):** visuals that already click and read well — e.g. `CNNViz`. Layout change only, no redesign.
- **Reframe (redesign for the click):** visuals that show mechanics without insight — the SVD/dimensionality-reduction story, and others surfaced by the audit. These get a new narrative built backward from one insight moment.
- **Simplify (trim, don't rebuild):** visuals that are accurate but too busy — remove competing elements, keep the core.

Marquee reframe targets discussed:

- **SVM kernel trick** (`SVMViz`, `support-vector-machines`): the 2D-encircled → lift-to-3D → flat-plane-separates story. Highest-drama "click"; ideal exemplar.
- **SVD / dimensionality reduction** (`PCAViz`, `dimensionality-reduction`): reframe to a single vivid intuition (e.g. progressive low-rank reconstruction as "how few ingredients still look like the picture," or rotate→stretch→rotate), prioritizing the aha over exact eigen-math.

---

## 8. Phase Plan

### Phase 0 — Audit, Triage, and Regression Baseline

**Purpose:** Build the evidence base before touching UI.

**Work**
- Walk all ~40 visuals at 390 / 768 / 1440px; capture notes/screenshots of small-canvas and overlap failures.
- Classify each into **Keep / Reframe / Simplify** (§7).
- For every Reframe target, write a one-line **insight moment** and a 2–5 beat narrative outline.
- Inventory which visuals have accuracy tests (`VisualizationAccuracy*.test.tsx`) and interaction tests (`VisualizationInteractions.test.tsx`) so §9 churn is known up front.

**Exit criteria:** Triage table complete; every Reframe target has a named insight moment; no UI changed.

### Phase 1 — Full-Width Shell & Narrative/Controls Foundation

**Purpose:** Make the layout right once, centrally, so every later phase inherits it.

**Work**
- Build the `<VizShell>` full-width frame (§6) in/near `visualizationPrimitives.tsx`.
- Standardize a control strip + per-beat caption + collapsible "Mental model" pattern on top of `useNarrativeStepper`.
- Verify `LessonPage.tsx` diagram section allows full width; fix any clipping.
- Migrate one **Keep** visual (e.g. `CNNViz`) to `<VizShell>` as the proof the frame works without redesign.

**Exit criteria:** Shell exists, is responsive at all three widths, and a Keep visual renders full-width with no overlap. Lint/test/build pass.

### Phase 2 — Exemplar Reframe (checkpoint)

**Purpose:** Prove the "click" bar end-to-end on one marquee visual before committing to breadth.

**Work**
- Reframe **SVM kernel trick** (`SVMViz`) to the §5 bar using `<VizShell>`: 2D encircled data → lift to 3D → separating plane, as a guided narrative with a free-play tail.
- Replace its accuracy assertions with behavior/interaction assertions (§9).
- **Stop and review with the user.** Adjust the pattern from feedback.

**Exit criteria:** SVM passes the full §5 bar; user signs off on the pattern; tests green.

### Phase 3 — Roll Out Reframe Tier (by track)

**Purpose:** Apply the proven pattern across the Reframe tier in reviewable batches.

**Work**
- One sub-phase per track: **3a Foundations → 3b Practitioner → 3c Modern AI.**
- Each reframed visual: build backward from its Phase 0 insight moment, use `<VizShell>`, swap accuracy tests for behavior tests.

**Exit criteria:** Each track's Reframe targets pass the §5 bar; lint/test/build pass after each sub-phase.

### Phase 4 — Simplify Tier

**Purpose:** Reduce clutter on accurate-but-busy visuals.

**Work**
- Trim competing elements; keep the core idea; migrate to `<VizShell>`.

**Exit criteria:** Simplify targets read cleanly at all widths; tests pass.

### Phase 5 — Cleanup

**Purpose:** Finish migration and remove dead weight.

**Work**
- Migrate any remaining Keep visuals to `<VizShell>`; retire the old two-column grid.
- If the legacy d3 `SceneConfig` path is fully unused, remove it and drop the `d3` / `@types/d3` dependencies.
- Reconcile test suites (§9).

**Exit criteria:** No visual uses the old two-column layout; no dead d3; full suite green.

---

## 9. Testing & Acceptance Gates

The existing `VisualizationAccuracy*` suites assert **exact numeric stat-panel values** (secant slope, dot product, log-likelihood, total-variation distance, …). These are tightly coupled to the current designs and to numerical fidelity — which this overhaul de-prioritizes.

Policy:
- A **Reframe** visual that drops a numeric stat panel: **remove or rewrite** its accuracy assertions; replace with **behavior/interaction tests** (narrative advances, drag changes state, insight element appears, keyboard works).
- A **Keep/Simplify** visual that retains its stats: **keep** the accuracy test.
- `VisualizationInteractions.test.tsx` (23 cases) and the error-boundary/audit tests stay green throughout; update selectors as layout changes.

Per-phase gate: `npm run lint`, `npm run test`, `npm run build` pass. Run Cypress/responsive checks when a changed surface is covered or layout risk is high.

---

## 10. Risks & Open Questions

- **Accuracy-test churn.** Largest source of incidental work. Phase 0 inventory makes it predictable.
- **"Clever vs. misleading" line.** Loose-but-memorable is the goal; *wrong-in-a-way-that-plants-a-misconception* is not. Each Reframe should note one sentence of "what we're deliberately simplifying" for the prose to optionally caveat.
- **Mobile.** Full-width canvases must still click at 390px; some 3D-flavored ideas may need a simpler mobile beat.
- **Open:** confirm whether the legacy d3 `SceneConfig` path is reachable before removing it in Phase 5.

---

## 10a. Implementation lessons (carry into every reframe)

Learned while building the Phase 2 SVM exemplar:

- **Palette is red / green / yellow, not pink / cyan.** The `COLORS` tokens are
  *named* `pink` and `cyan` for historical reasons but render as a warm red
  (`#8D5149`) and an olive green (`#556B4A`). Never use the token name as a
  color word in captions or prose — it will be wrong. Describe elements by
  **role** ("inner core", "outer ring") and let the legend swatch carry the
  color. This also satisfies the "state not conveyed by color alone" gate.
- **Faking 3D needs depth ordering, not just transparency.** A separating
  surface only reads as 3D when it is drawn *between* the things it separates —
  render the group below it, then the surface, then the group above it — and
  when it has perspective cues: vertical depth compression, horizontal
  foreshortening (back edge narrower than front), and a visible thickness edge.
  A translucent polygon drawn on top of every point reads as a flat 2D
  rectangle, even if the data underneath is genuinely "lifted." Any future
  3D-flavored beat (autoencoder bottleneck, generative latent space, etc.)
  should reuse this layering recipe.

Learned while iterating on the Phase 3a calculus reframe (it took three passes):

- **Anchor abstract math to a concrete referent the reader already owns.** A
  bare function plot does not click — the reader can move the handle without the
  idea landing. Framing the curve as a *hill* (height vs distance) made every
  element mean something: slope = steepness underfoot, positive = climbing, zero
  = flat summit, negative = descending. Find the physical analogy first, then
  build the visual on it.
- **Keep explanatory text OFF the canvas.** In-SVG titles and stat boxes drawn
  over the diagram are clutter and overlap at narrow widths. The canvas carries
  only the picture plus minimal labels that sit *on* the thing they name (axis
  labels at the edges, "rise"/"run" on the triangle legs). All descriptive
  explanation goes *below*: the per-beat caption (make it genuinely teach, not
  just name the beat), a glanceable readout card in the control strip for the
  one live number, and the collapsible mental model for the full prose.
- **Never pre-spoil the punchline; one idea per visual.** Showing an always-on
  tangent next to the secant meant "take the limit" produced nothing new to
  watch — the answer was already on screen. And a magnifier lens layered a
  second idea (local linearity) over the secant story. Removing both made the
  single chord-becomes-tangent moment land.
- **Full-width canvases must map pointers through the SVG CTM, never
  `getBoundingClientRect`.** Because the canvas scales to the content width,
  screen pixels do not equal viewBox units. Use `svg.createSVGPoint()` +
  `getScreenCTM().inverse()` (as `useDraggable` and the reframed visuals do).
  A `getBoundingClientRect`-based mapping silently puts clicks outside the plot
  on any non-1:1 render — that is how the generative latent point became
  "undraggable." For draggable points, capture the pointer on down and update
  on move; click-to-place alone is not enough.

## Scope update (2026-06-18)

After reviewing the Phase 2–3 reframes the user decided **every remaining visual
should get the full reframe treatment**, not just the Reframe tier. The
Keep / Simplify tiers are retired: all ~40 visuals are now Reframe targets held
to the §5 "click" bar, built backward from one insight moment on `VizShell`,
with explanation below the canvas and behavior tests replacing numeric-accuracy
assertions. Phases 4 and 5 below are superseded — remaining work is "reframe
every visual not yet done," tracked in `docs/visualization-triage.md`.

### What "the treatment" means (not a migration)

A correction after the first Foundations batch came back too light: moving a
visual into `VizShell` and tidying the panels is **not** the bar. Every visual
must be reconsidered pedagogy-first, the same way SVM (2D→lift→plane), PCA
(low-rank image), generative (morphing faces), regularization (weight budget),
and calculus (the hill) were — several of which were **completely rebuilt**.
For each visual ask:

1. What is the single insight, and what is the one beat where it clicks?
2. Is there a concrete real-world anchor that makes it click faster? (hill,
   shadow, budget, faces, marbles-in-a-hat…) If the current visual is abstract,
   re-anchor it.
3. Would a reader who knows nothing reach the insight in ~15s? If not, redesign
   the visual — do not just relocate its panels.

Preserving a design is only acceptable when it *already* clicks at this bar
(and even then, re-anchor the framing/caption). A faithful instrument panel that
shows mechanics without delivering the aha must be rebuilt, not migrated.

### The real bar: dramatize the ML/AI *purpose*, not the textbook mechanic

The sharpest correction (after statistics/bayesian came back as polished versions
of their existing diagrams): the visual must make the reader understand **what
the technique does for someone doing machine learning / AI**, not just illustrate
its math. The winning reframes invented an entirely new picture of the technique's
*purpose*:

- SVM → data a line can't split gets lifted until a plane can (what the kernel
  trick buys you).
- Generative models → one face morphs into another (what sampling a latent space
  gives you).
- Calculus → steepness of a hill (what a gradient *is* when you train).

So for each technique, the controlling question is **"why does an ML practitioner
use this, and what does it let them do?"** — then build a fresh, concrete scenario
that shows that, even if it discards the conventional textbook diagram entirely.
Refining the existing math illustration is the failure mode; a new ML-grounded
scenario is the bar. Prefer scenarios a practitioner actually meets (a model's
accuracy, an A/B test, embedding similarity, training dynamics) over abstract math
objects (Beta curves, hats of marbles, generic distributions).

## Progress log — completed reframes

Tracks each shipped reframe (full §5 "click" bar: VizShell, clean canvas,
explanation below, behavior tests, lint/test/build green). Each line names the
new ML-purpose scenario and its one insight beat.

### Foundations track — DONE

- **calculus** → a *hill*: slope = steepness underfoot; secant chord collapses to
  the tangent at the flat summit.
- **maximum-likelihood** → slide-the-bell: drag a Gaussian until it best explains
  the observed points; log-likelihood peaks at the fit.
- **dimensionality-reduction** (`PCAViz`) → low-rank image reconstruction: "how few
  ingredients still look like the picture"; a handful of components keep most
  variance. Exports `pcaVarianceCapturedPercent`.
- **linear-algebra** → embedding similarity search: drag a query vector, cosine
  ranking re-sorts nearest neighbours.
- **probability-theory** → law-of-large-numbers convergence (sample mean settling).
- **bayesian-inference** → A/B test belief update: two Beta curves, P(B beats A)
  meter; log-space `logBeta` for numerical stability.
- **statistics-estimation** → "Is your model's 87% real?": bootstrap a test set into
  a confidence interval vs a second model's reference line.
- **gradient-descent** → optimizer race: SGD vs Momentum vs Adam on a lit 3D loss
  terrain with a shallow trap; pure `step()` + runners in state. Fixed the
  getBoundingClientRect→CTM pointer bug here.
- **regularization** → weight budget: L1 diamond corner zeros a weight, L2 circle
  shrinks them.

### Practitioner track — 9 of 14 DONE

- **linear-regression** → multivariable house-price predictor: predicted-vs-actual
  scatter + per-feature weight bars; training slider drives SSE→0, R²→1.
- **logistic-regression** → P(pass) sigmoid from hours studied with a draggable
  decision threshold; readout shows the missed-pass vs wrongly-passed trade-off.
- **knn** → "tag a new song" by nearest-neighbour vote on a tempo×energy map; a lone
  crossover outlier flips the tag when k drops to 1 (lazy, no training).
- **decision-trees** → loan-approval flowchart of yes/no questions; an applicant
  falls through income?→credit? to Approve/Deny. *Grow tree* fixes the income-only
  mistakes (7/9 → 9/9), dramatizing what depth buys.
- **naive-bayes** → spam-filter tug-of-war: each word draws a log-likelihood-ratio
  arrow left/right in a waterfall; ticking "money" tips a borderline email
  HAM→SPAM across the 50/50 line.
- **clustering** (`KMeansViz`) → customer segmentation: raw *unlabelled* dots resolve
  into named segments (Occasional / Loyal regulars / VIP big-spenders) via the
  assign→move loop. Kept the 3-beat `NarrativeControls` step contract.
- **ensemble-learning** → committee of 5 weak threshold rules on diagonal fraud data;
  each rule alone is 56–75%, the majority vote climbs 75→81→94→100%. Stump sequence
  verified offline by greedy search.
- **gmm-em** → fitting stretched vs circular clusters: K-Means cuts off the tail
  of stretched data with a rigid line; GMM stretches its ellipses to fit and softly
  assigns border points.
- **mcmc** → random walker on a probability mountain: proposes steps, always
  accepts uphill (more probable), occasionally accepts downhill to avoid getting
  stuck. Long run empirically maps the mountain shape.
- **applied-ml-workflow** → consolidated module replacing the legacy topics:
  anomaly-detection, model-selection, bias-variance, evaluation-metrics,
  and data-preparation. No visualization needed.

### Modern AI track

- **computer-vision** / **cnn** → Sobel convolution scan (CNN migrated as the
  Phase 1 Keep exemplar; computer-vision retains exact convolution stats).
- **generative-models** → walk a latent line and watch one face morph into another.
- Remaining: neural-networks, nlp, autoencoders, transformers, llms,
  reinforcement-learning, backpropagation, sequence-models, embeddings-tokenization,
  rag, fine-tuning, llm-evaluation-safety, ai-inference.

### Other fixes

- **Favicon** (2026-06-18): `src/app/favicon.ico` is auto-served by Next at
  `/favicon.ico` and overrides the `metadata.icons` entries; it held a stray
  black-circle/white-triangle, not the brand mark. Regenerated `favicon.ico`
  (16/32/48/256) and `public/favicon.png` from `public/logo-favicon.svg` (the SP
  monogram) via ImageMagick.

## 11. Checklist

- [x] Phase 0 — triage table, insight moments, test inventory (`docs/visualization-triage.md`)
- [x] Phase 1 — `<VizShell>` + narrative/controls pattern; CNNViz migrated
- [x] Phase 2 — SVM kernel-trick exemplar built; **user signed off**
- [x] Phase 3a — Foundations track fully reframed (calculus, maximum-likelihood,
  dimensionality-reduction, linear-algebra, probability-theory, bayesian-inference,
  statistics-estimation, gradient-descent, regularization)
- [x] Phase 3b — Practitioner track (10/10: linear-regression, logistic-regression,
  knn, decision-trees, naive-bayes, clustering, ensemble-learning, gmm-em, mcmc,
  applied-ml-workflow).
- [~] Phase 3c — Modern AI track (generative-models, cnn/computer-vision done) —
  remaining: neural-networks, nlp, autoencoders, transformers, llms,
  reinforcement-learning, backpropagation, sequence-models, embeddings-tokenization,
  rag, fine-tuning, llm-evaluation-safety, ai-inference
- [~] Phase 4/5 (superseded by full-reframe scope) — retire old two-column grid,
  remove dead d3 `SceneConfig` path + `d3`/`@types/d3` deps, reconcile tests
