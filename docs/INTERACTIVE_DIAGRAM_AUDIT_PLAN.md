# Interactive Diagram Audit Plan

**Project:** `suranjan77.github.io` — ML Learning Reference Site  
**Scope:** All 40 interactive diagrams routed from the three curriculum tracks  
**Executor:** One developer or coding agent  
**Structure:** Sequential audit and remediation milestones  
**Primary question:** Does each diagram provide the most suitable, accurate,
consistent, reliable, and effective interactive explanation for its module?

---

## 1. Operating Rules

1. Audit diagrams in curriculum-track order.
2. Do not mark a diagram `VERIFIED` because it renders or because a control
   changes state. The mathematical or algorithmic result must be checked
   independently.
3. Every diagram must end with one disposition:
   - `KEEP`: already fit for purpose; only negligible polish may be needed.
   - `REFINE`: concept is suitable, but accuracy, interaction, copy, or UI
     changes are required.
   - `REWORK`: the current concept is useful but the simulation or interaction
     model needs substantial reconstruction.
   - `REPLACE`: a different visual or interactive model would teach the topic
     more effectively.
   - `REMOVE`: interaction adds no useful explanatory value and a static
     explanation is preferable.
4. A diagram cannot receive `KEEP` or become `VERIFIED` without evidence for:
   purpose fit, correctness, interaction behavior, responsive behavior,
   accessibility, and regression coverage.
5. Fix S1 and S2 defects before auditing the next track. S3 and S4 defects may
   be queued until the track remediation milestone.
6. Use deterministic data or seeded randomness whenever the expected output is
   asserted.
7. Do not preserve an interaction merely because it already exists. If it
   does not materially improve understanding, simplify or replace it.
8. The site is not an LMS. Do not add completion tracking, learner scoring,
   analytics, accounts, or progress persistence as part of this audit.
9. Update the audit register and diagram dossier immediately after each
   evaluation. Do not reconstruct evidence from memory at the end.
10. Run focused tests after every diagram fix and full validation at each track
    gate.

---

## 2. Current State

The production site currently has:

- 40 `LearningModule` records.
- 40 `*Viz.tsx` diagram components.
- 3 curriculum tracks:
  - Mathematical Foundations: 7 modules.
  - ML Practitioner: 26 modules.
  - Modern AI: 7 modules.
- A shared router in
  `src/components/ui/visualizations/D3Visualization.tsx`.
- Shared primitives in
  `src/components/ui/visualizationPrimitives.tsx`.
- Unit and interaction coverage in:
  - `D3Visualization.test.tsx`
  - `VisualizationInteractions.test.tsx`
  - `VisualizationAlgorithmAccuracy.test.tsx`
  - `visualizationPrimitives.test.tsx`
  - `useAnimationEngine.test.tsx`
- Cypress coverage that:
  - Crawls every module for rendering failures.
  - Exercises detailed controls only on Gradient Descent.
  - Checks visualization width only on the Calculus mobile route.

### Known audit risks

1. Explicit numerical accuracy tests currently cover only a small subset:
   Linear Regression, Logistic Regression, Computer Vision, CNN, Evaluation
   Metrics, and PCA.
2. Render tests cover the original router set more strongly than the 14 newer
   extended visualizations.
3. The router currently falls back to the Linear Regression scene for an
   unknown algorithm ID:
   ```ts
   const config = configs[algorithmId] ?? configs["linear-regression"];
   ```
   This contradicts the program requirement that unknown IDs show an explicit
   visualization error. It must be resolved before audit evidence is trusted.
4. Many diagrams use hand-authored data and simplified formulas. Each
   simplification must be classified as:
   - mathematically exact,
   - pedagogically simplified but valid,
   - illustrative only,
   - misleading or incorrect.
5. UI implementation is split between shared primitives and locally styled
   panels, increasing the chance of inconsistent controls, labels, spacing,
   colors, and mobile behavior.
6. Some stochastic diagrams may not be deterministic enough for reliable
   correctness tests.
7. A diagram can be algorithmically correct but still be ineffective if the
   control does not expose the module's central causal relationship.

---

## 3. Audit Objectives

For every diagram, determine:

1. **Purpose fit**
   - What exact learning objective does the diagram support?
   - Is that objective central to the module?
   - Is an interactive diagram the best medium?
   - Does the interaction reveal causality or merely animate decoration?

2. **Algorithmic and mathematical accuracy**
   - Are formulas, state transitions, metrics, labels, and outputs correct?
   - Do displayed values agree with an independent implementation?
   - Are edge cases and invalid states handled correctly?
   - Are simplifications disclosed and pedagogically defensible?

3. **Interaction correctness**
   - Does every control affect the intended state?
   - Are controls bounded, resettable, keyboard operable, and synchronized?
   - Do play, pause, reset, step, drag, and presets behave predictably?
   - Can asynchronous or animated state become stale or contradictory?

4. **UI consistency**
   - Does the diagram use the site's typography, surfaces, borders, colors,
     icons, control hierarchy, and spacing?
   - Are labels and units formatted consistently?
   - Are status messages expressed without decorative emoji or unexplained
     color dependence?

5. **Accessibility and responsive behavior**
   - Is the SVG or canvas named?
   - Are controls labelled and keyboard accessible?
   - Is meaning available without color alone?
   - Does the diagram remain usable at 360, 768, 1024, and 1440 pixel widths?
   - Does reduced-motion mode preserve the explanation?

6. **Effectiveness**
   - Can a reader predict what a control will do?
   - Does the diagram make the module's key mechanism easier to explain?
   - Is the key insight supported by what is actually shown?
   - Is cognitive load proportional to the concept?
   - Would a different representation produce a clearer mental model?

7. **Engineering quality**
   - Is state derived consistently rather than duplicated?
   - Is randomness deterministic?
   - Are calculations separable and testable?
   - Are there avoidable performance or rendering problems?
   - Does the component use shared primitives where appropriate?

---

## 4. Required Deliverables

Create these artifacts during execution:

```text
docs/visualization-audit/
├── AUDIT_REGISTER.md
├── DEFECT_LOG.md
├── DESIGN_CONSISTENCY.md
├── FINAL_REPORT.md
├── evidence/
│   ├── foundations/
│   ├── practitioner/
│   └── modern-ai/
└── dossiers/
    ├── foundations/
    ├── practitioner/
    └── modern-ai/
```

### 4.1 Audit register

`AUDIT_REGISTER.md` must contain one row per module:

| Field | Required value |
|---|---|
| Track | `foundations`, `practitioner`, or `modern-ai` |
| Module ID | Route ID |
| Diagram component | Exact component file |
| Auditor status | `BACKLOG`, `IN REVIEW`, `BLOCKED`, `REMEDIATION`, `VERIFIED` |
| Purpose score | 0–4 |
| Accuracy score | 0–4 |
| Interaction score | 0–4 |
| UI score | 0–4 |
| Accessibility score | 0–4 |
| Effectiveness score | 0–4 |
| Test confidence | `NONE`, `LOW`, `MEDIUM`, `HIGH` |
| Disposition | `KEEP`, `REFINE`, `REWORK`, `REPLACE`, `REMOVE` |
| Open defects | Defect IDs |
| Evidence | Link to dossier |

### 4.2 Diagram dossier

Create one Markdown dossier per diagram:

```md
# <Module title> — Diagram Audit

## Identity
- Track:
- Route:
- Component:
- Review date:
- Disposition:

## Intended teaching purpose
- Module objective served:
- Intended mental model:
- Why interaction is or is not appropriate:

## Behavior inventory
| Control/action | State affected | Expected result | Actual result | Status |

## Independent accuracy specification
- Governing formula/algorithm:
- Assumptions:
- Reference source:
- Test vectors:
- Independently computed expected outputs:

## Findings
### Purpose fit
### Mathematical/algorithmic accuracy
### Interaction and state
### UI consistency
### Accessibility
### Responsive behavior
### Effectiveness
### Performance and maintainability

## Scores
| Dimension | Score | Evidence |

## Defects
| ID | Severity | Description | Reproduction | Required change |

## Remediation
- Code changes:
- Tests added:
- Simplifications disclosed:

## Verification
- Focused unit tests:
- Interaction tests:
- Browser checks:
- Build/lint:
- Final status:
```

### 4.3 Evidence

Each diagram must have:

- Desktop screenshot at 1440×900.
- Tablet screenshot at 768×1024.
- Mobile screenshot at 360×800.
- Screenshot or captured state for every major mode or preset.
- Recorded expected and actual numerical values for at least:
  - default state,
  - one interior control value,
  - each boundary value,
  - reset state.
- Keyboard-only interaction result.
- Reduced-motion result if animation exists.
- Automated test file and test name references.

Screenshots are diagnostic evidence, not proof of mathematical correctness.

---

## 5. Scoring Rubric

Score each dimension from 0 to 4.

| Score | Meaning |
|---:|---|
| 4 | Correct, deliberate, consistent, well tested, and clearly effective |
| 3 | Fundamentally sound with localized improvements required |
| 2 | Material limitations; useful only after meaningful remediation |
| 1 | Major conceptual, behavioral, or usability problems |
| 0 | Incorrect, broken, misleading, inaccessible, or unsuitable |

### 5.1 Purpose fit

- **4:** Directly demonstrates the module's central mechanism and the
  interaction exposes a meaningful causal relationship.
- **3:** Relevant and useful, but omits an important dimension or includes
  avoidable detail.
- **2:** Demonstrates a secondary concept or relies heavily on accompanying
  prose to become meaningful.
- **1:** Loosely related or primarily decorative.
- **0:** Teaches the wrong concept.

### 5.2 Accuracy

- **4:** Independent implementation agrees across normal, boundary, and edge
  cases; simplifications are explicit.
- **3:** Core results are correct with small display, rounding, or scope issues.
- **2:** Correct only for narrow presets or contains undisclosed
  simplifications.
- **1:** Material outputs or transitions are wrong.
- **0:** Fundamentally incorrect or misleading.

### 5.3 Interaction

- **4:** All controls are coherent, bounded, resettable, keyboard operable, and
  covered by tests.
- **3:** Core interactions work; minor state or feedback issues remain.
- **2:** Important controls are confusing, fragile, or weakly tested.
- **1:** Common sequences produce stale, contradictory, or broken state.
- **0:** Interaction is unusable.

### 5.4 UI consistency

- **4:** Uses shared visual language and control patterns consistently.
- **3:** Small local inconsistencies.
- **2:** Multiple bespoke patterns or unclear hierarchy.
- **1:** Appears detached from the site.
- **0:** Visual structure prevents use.

### 5.5 Accessibility

- **4:** Named graphic, labelled controls, keyboard access, non-color cues,
  reduced-motion support, and usable zoom/reflow.
- **3:** Meets core requirements with localized omissions.
- **2:** Several barriers but primary interaction remains possible.
- **1:** Major keyboard, labeling, contrast, or reflow failure.
- **0:** Primary content is inaccessible.

### 5.6 Effectiveness

- **4:** A reader can accurately explain the mechanism after interacting.
- **3:** Clarifies the topic but could improve sequencing or feedback.
- **2:** Some explanatory value, with substantial cognitive overhead.
- **1:** Interaction distracts or encourages a weak mental model.
- **0:** Actively miseducates.

### Release threshold

A diagram is `VERIFIED` only when:

- Accuracy = 4.
- Purpose fit ≥ 3.
- Interaction ≥ 3.
- UI consistency ≥ 3.
- Accessibility ≥ 3.
- Effectiveness ≥ 3.
- No open S1 or S2 defects.
- At least one deterministic accuracy test exists.
- Major interactions have automated coverage.

---

## 6. Defect Severity

| Severity | Definition | Required response |
|---|---|---|
| S1 | Diagram teaches a materially false result, crashes the route, or makes the primary content inaccessible | Stop the track audit and fix immediately |
| S2 | Wrong calculation/state transition, broken major control, misleading central representation, or major accessibility failure | Fix before track verification |
| S3 | Local UI inconsistency, weak feedback, missing edge case, incomplete test, or non-critical responsive issue | Fix during track remediation |
| S4 | Copy, spacing, minor visual polish, or maintainability improvement | Queue unless cheap and isolated |

Defect IDs use `VIZ-<track>-NNN`, for example `VIZ-FND-001`.

---

## 7. Standard Evaluation Procedure

Perform these steps for every diagram.

### Step 1 — Establish the specification

1. Read the module's objectives, intuition, mathematics, worked examples,
   misconceptions, and failure modes.
2. Write one sentence defining what the diagram must teach.
3. Identify the minimum variables that must be interactive.
4. Identify what should remain fixed to avoid unnecessary complexity.
5. Choose an authoritative reference:
   - textbook or original paper,
   - official framework documentation,
   - a small independent reference implementation.
6. State all pedagogical simplifications before inspecting output.

### Step 2 — Inspect implementation

1. Trace the module ID through `D3Visualization.tsx`.
2. Confirm the expected component is rendered.
3. Identify:
   - input state,
   - derived calculations,
   - randomness,
   - animation state,
   - display formatting,
   - reset logic,
   - accessible names,
   - shared versus local UI primitives.
4. Flag duplicated state, magic constants, silent clamping, and formulas
   embedded directly in JSX.

### Step 3 — Build an independent oracle

Use a pure function or test-local implementation that does not call the
diagram's calculation code.

Examples:

- analytical formula,
- brute-force enumeration,
- matrix multiplication,
- finite differences,
- seeded Monte Carlo reference,
- explicit traversal of a small graph,
- hand-calculated confusion matrix,
- independently implemented metric.

Do not validate a function by calling the same helper used by production.

### Step 4 — Test normal and boundary behavior

At minimum test:

- default state,
- minimum control value,
- maximum control value,
- one meaningful interior value,
- every preset,
- reset after mutation,
- repeated play/pause/reset,
- rapid control changes,
- empty or degenerate input where applicable,
- invalid or numerically unstable input where applicable.

### Step 5 — Evaluate teaching effectiveness

Answer:

1. What changes when the reader manipulates the control?
2. Is that change the most important relationship in the topic?
3. Is the visual encoding mathematically meaningful?
4. Does the diagram explain why the output changes?
5. Can the reader distinguish model behavior from illustrative decoration?
6. Does the final key insight accurately summarize the observed behavior?
7. Would a static formula, table, or annotated sequence be clearer?

### Step 6 — Evaluate presentation

Check:

- shared surface and border tokens,
- headline/body/mono typography roles,
- line icons only where icons are needed,
- no decorative emoji,
- consistent button, slider, select, and stepper patterns,
- visible units and precision,
- no unexplained acronyms,
- no color-only state distinctions,
- no clipped labels or overlapping marks,
- no horizontal overflow,
- touch targets and focus visibility.

### Step 7 — Remediate and verify

1. Fix correctness before styling.
2. Extract pure calculation helpers when this enables independent tests.
3. Replace non-deterministic randomness with seeded randomness.
4. Add focused tests for every fixed defect.
5. Re-run the full diagram procedure after remediation.
6. Record the final disposition and scores.

---

## 8. Milestone VA0 — Audit Infrastructure and Trusted Routing

**Goal:** Ensure every route maps to exactly one intended diagram and establish
repeatable evidence collection.

### VA0-T1: Create the audit workspace

1. Create the directory structure from Section 4.
2. Create the 40-row `AUDIT_REGISTER.md`.
3. Create `DEFECT_LOG.md` with severity, owner, status, and evidence columns.
4. Create a dossier template.

**Acceptance:** All files exist and all 40 module IDs are registered once.

### VA0-T2: Reconcile module-to-diagram routing

1. Build a typed registry containing:
   - module ID,
   - component,
   - title,
   - accessible image label.
2. Compare it against `algorithmsList`.
3. Add a test asserting:
   - every module has one diagram,
   - no registry entry points to an unknown module,
   - there are no duplicate IDs.
4. Remove the unknown-ID Linear Regression fallback.
5. Render explicit error UI for unknown IDs.
6. Update the contradictory fallback test.

**Acceptance:** A missing or unknown mapping fails tests and cannot display an
unrelated diagram.

### VA0-T3: Record baseline behavior

1. Run lint, unit tests, build, and Cypress.
2. Record current counts and failures.
3. Capture initial desktop, tablet, and mobile screenshots for all 40 routes.
4. Record console errors, React warnings, and uncaught exceptions.
5. Record diagram render time and interaction delay for obvious outliers.

**Acceptance:** Baseline evidence exists for every route.

### VA0-T4: Define a common UI contract

Document the required pattern for:

- diagram title and subtitle,
- plot and control layout,
- legends,
- sliders and displayed values,
- selects and presets,
- step/play/pause/reset controls,
- status and error messages,
- key insight,
- mobile stacking,
- SVG accessible naming,
- reduced motion.

**Acceptance:** `DESIGN_CONSISTENCY.md` contains implementable rules, not
subjective adjectives.

### VA0-T5: Add audit helpers

1. Add reusable test helpers for:
   - rendering by module ID,
   - locating control panels,
   - changing range/select/button controls,
   - checking reset invariants,
   - checking finite displayed numbers,
   - checking accessible SVG names.
2. Add Cypress helpers for viewport and console checks.
3. Add deterministic screenshot naming by track and module ID.

**Acceptance:** Later audit tests do not duplicate browser setup or basic
interaction plumbing.

### VA0 completion gate

- 40 modules map to 40 intended diagrams.
- Unknown IDs cannot silently render a valid but unrelated diagram.
- Baseline and dossier structure exist.
- Shared review criteria are fixed before scoring begins.

---

## 9. Milestone VA1 — Mathematical Foundations Track

**Goal:** Verify that the seven foundation diagrams establish accurate mental
models that later tracks can rely on.

| Order | Module ID | Component | Primary verification |
|---:|---|---|---|
| 1 | `calculus` | `CalculusViz.tsx` | Secant slope converges to analytical derivative; tangent equation and limit behavior |
| 2 | `linear-algebra` | `LinearAlgebraViz.tsx` | Dot product, projection, basis coordinates, and matrix transform agree with independent vector calculations |
| 3 | `probability-theory` | `ProbabilityViz.tsx` | Empirical counts, normalized probabilities, TVD, and convergence claims are computed correctly |
| 4 | `maximum-likelihood` | `MaximumLikelihoodViz.tsx` | Gaussian likelihood/log-likelihood and optimum mean agree with sample statistics |
| 5 | `bayesian-inference` | `BayesianInferenceViz.tsx` | Beta-Binomial prior, likelihood, posterior parameters, MAP/mean labels, and sequential updates |
| 6 | `statistics-estimation` | `StatisticsViz.tsx` | Sample estimates, bootstrap resampling, standard error, intervals, and seeded reproducibility |
| 7 | `gradient-descent` | `GradientDescentViz.tsx` | Gradient formula, update rule, optimizer paths, learning-rate behavior, convergence/divergence states |

### Tasks for each foundation diagram

1. Create dossier and purpose statement.
2. Derive expected values by hand or independent pure function.
3. Test numerical output at boundaries and representative interior states.
4. Verify animation does not alter mathematical state.
5. Check terminology against the module mathematics.
6. Evaluate whether the control exposes the central relationship.
7. Check desktop/tablet/mobile and keyboard operation.
8. Assign disposition and defects.
9. Remediate all S1–S3 findings.
10. Re-score and mark `VERIFIED`.

### VA1-T8: Foundation cross-diagram consistency

Check that:

- derivative notation is consistent between Calculus and Gradient Descent,
- probability notation is consistent between Probability, MLE, Bayesian, and
  Statistics,
- axes, legends, sample counts, distributions, and rounding use compatible
  conventions,
- deterministic sampling is used where tests depend on generated data.

### VA1 completion gate

- 7/7 dossiers complete.
- 7/7 diagrams have deterministic accuracy assertions.
- No open S1–S2 defects.
- Track-wide notation and UI findings resolved or documented.

---

## 10. Milestone VA2 — ML Practitioner Track, Core Models

**Goal:** Audit supervised-learning diagrams where boundaries, metrics, and
model behavior can be checked directly.

| Order | Module ID | Component | Primary verification |
|---:|---|---|---|
| 1 | `data-preparation` | `DataPreparationViz.tsx` | Scaling, imputation, split isolation, and leakage behavior |
| 2 | `linear-regression` | `LinearRegressionViz.tsx` | OLS coefficients, residuals, SSE, gradient descent, displayed formula |
| 3 | `logistic-regression` | `LogisticRegressionViz.tsx` | Logit/sigmoid mapping, threshold, boundary, predictions, accuracy |
| 4 | `knn` | `KNNViz.tsx` | Distance ordering, odd-k bounds, voting, ties, and boundary classification |
| 5 | `decision-trees` | `DecisionTreeViz.tsx` | Split criterion, threshold partitions, leaf predictions, and traversal |
| 6 | `support-vector-machines` | `SVMViz.tsx` | Hyperplane, margin width, support-vector identification, soft-margin effect |
| 7 | `naive-bayes` | `NaiveBayesViz.tsx` | Priors, conditional likelihoods, smoothing, log evidence, final class |
| 8 | `ensemble-learning` | `EnsembleViz.tsx` | Weak learner predictions, aggregation, weights, and combined decision |

### Special suitability questions

- Does Linear Regression need both direct fit and optimization modes, or does
  that duplicate Gradient Descent?
- Does the Logistic Regression diagram explain probability calibration as
  distinct from geometric classification?
- Does KNN show why feature scaling matters?
- Does the Decision Tree diagram expose impurity reduction rather than only a
  finished partition?
- Does the SVM diagram distinguish margin geometry from probability?
- Does Naive Bayes make the independence assumption visible?
- Does the Ensemble diagram accurately distinguish bagging from boosting?

### VA2 completion gate

- 8/8 dossiers complete and verified.
- Classification outputs are independently reproducible.
- Boundary and metric labels match the generated predictions.
- No open S1–S2 defects.

---

## 11. Milestone VA3 — ML Practitioner Track, Unsupervised and Evaluation

| Order | Module ID | Component | Primary verification |
|---:|---|---|---|
| 1 | `clustering` | `KMeansViz.tsx` | Assignment/update alternation, centroid means, inertia, convergence |
| 2 | `gmm-em` | `GMMEMViz.tsx` | Responsibilities normalize, E/M steps use current parameters, likelihood does not regress unexpectedly |
| 3 | `dimensionality-reduction` | `PCAViz.tsx` | Covariance/eigenvector direction, projection, explained variance |
| 4 | `mcmc` | `MCMCViz.tsx` | Proposal density, acceptance ratio, seeded accept/reject, trace/histogram consistency |
| 5 | `anomaly-detection` | `AnomalyDetectionViz.tsx` | Score direction, threshold/contamination behavior, labels and counts |
| 6 | `model-selection` | `ModelSelectionViz.tsx` | Fold membership, no leakage, train/validation aggregation, model choice |
| 7 | `bias-variance` | `BiasVarianceViz.tsx` | Error decomposition or disclosed conceptual approximation; curve relationships |
| 8 | `regularization` | `RegularizationViz.tsx` | L1/L2 penalties, constrained optimum geometry, coefficient shrinkage |
| 9 | `evaluation-metrics` | `EvaluationMetricsViz.tsx` | Confusion matrix, precision, recall, F1, ROC/PR behavior, threshold edges |

### Special suitability questions

- Does K-Means show objective minimization or only movement?
- Does GMM/EM visually distinguish soft assignment from K-Means?
- Does PCA avoid implying that projection always preserves clusters?
- Does MCMC distinguish samples from independent draws?
- Does Model Selection make data leakage and nested tuning risks clear?
- Are Bias-Variance curves computed, illustrative, or falsely precise?
- Does Regularization connect coefficient behavior to geometry?
- Are metric tradeoffs shown using a coherent underlying dataset?

### VA3 completion gate

- 9/9 dossiers complete and verified.
- Stochastic diagrams are deterministic under test.
- Every displayed metric is derived from inspectable state.
- Illustrative-only curves are labelled as such.

---

## 12. Milestone VA4 — ML Practitioner Track, Neural and Applied Models

| Order | Module ID | Component | Primary verification |
|---:|---|---|---|
| 1 | `neural-networks` | `NeuralNetworkViz.tsx` | Forward activations, loss, local derivatives, weight gradients |
| 2 | `cnn` | `CNNViz.tsx` | Kernel placement, convolution sum, stride/padding assumptions, output dimensions |
| 3 | `computer-vision` | `ComputerVisionViz.tsx` | Pixel input, selected kernel, convolution output, thresholding |
| 4 | `nlp` | `NLPEmbeddingsViz.tsx` | Vector arithmetic, similarity, analogy sequence, geometric labels |
| 5 | `autoencoders` | `AutoencoderViz.tsx` | Encoding/decoding flow, bottleneck dimensionality, reconstruction-error claim |
| 6 | `transformers` | `TransformerViz.tsx` | Q/K/V derivation, scaled dot-product attention, softmax normalization |
| 7 | `llms` | `LLMViz.tsx` | Logit scaling, softmax, temperature limits, sampling distribution |
| 8 | `reinforcement-learning` | `RLViz.tsx` | Bellman/Q update, reward transition, policy action, terminal handling |
| 9 | `generative-models` | `GenerativeViz.tsx` | Latent interpolation semantics and clear disclosure of illustrative generator output |

### Special suitability questions

- Does the Neural Network diagram duplicate Backpropagation without enough
  network-level context?
- Are CNN and Computer Vision sufficiently distinct?
- Are NLP analogy vectors presented as a toy example rather than a general
  guarantee?
- Does the Autoencoder diagram simulate a reconstruction or only animate
  degradation?
- Does the Transformer diagram compute attention or display hand-authored
  weights?
- Does the LLM diagram sample from its displayed probabilities?
- Does the RL environment obey its stated transition and update rules?
- Does the Generative diagram avoid claiming visual realism from a synthetic
  shape interpolation?

### VA4 completion gate

- 9/9 dossiers complete and verified.
- Attention, softmax, gradient, convolution, and Bellman calculations have
  independent assertions.
- Illustrative generative behavior is clearly distinguished from a trained
  model simulation.

---

## 13. Milestone VA5 — Modern AI Track

| Order | Module ID | Component | Primary verification |
|---:|---|---|---|
| 1 | `backpropagation` | `BackpropagationViz.tsx` | Topological order, chain rule, gradient accumulation, finite differences |
| 2 | `sequence-models` | `SequenceModelsViz.tsx` | Recurrence and gradient products across time; vanishing/exploding regimes |
| 3 | `embeddings-tokenization` | `EmbeddingsTokenizationViz.tsx` | Tokenization steps, IDs, vector dimensions, cosine similarity |
| 4 | `rag` | `RAGViz.tsx` | Retrieval ranking, context construction, failure-mode causality |
| 5 | `fine-tuning` | `FineTuningViz.tsx` | Full/adapter trainable parameters, low-rank dimensions, update path |
| 6 | `llm-evaluation-safety` | `LLMEvalSafetyViz.tsx` | Metric normalization, weighting, tradeoffs, safety threshold behavior |
| 7 | `ai-inference` | `AIInferenceViz.tsx` | Weight memory, KV cache, precision, batch/context scaling, capacity limit |

### Special suitability questions

- Does Backpropagation add value beyond GradForge, and is the boundary between
  the diagram and lab clear?
- Does Sequence Models show actual recurrence or only a qualitative gradient
  curve?
- Are tokenization outputs explicitly toy outputs when no real tokenizer is
  used?
- Does RAG simulate retrieval rankings or merely swap scripted text?
- Are Fine-Tuning parameter counts dimensionally correct?
- Does LLM Evaluation avoid implying that unlike metrics can be combined
  without normalization choices?
- Does AI Inference state architecture assumptions for KV-cache and memory
  formulas?

### VA5 completion gate

- 7/7 dossiers complete and verified.
- Systems estimates expose assumptions and units.
- Scripted conceptual diagrams are labelled as scenarios, not model execution.
- No open S1–S2 defects.

---

## 14. Milestone VA6 — Cross-Track Design and Accessibility

**Goal:** Evaluate the diagrams as one product after individual correctness is
established.

### VA6-T1: UI consistency matrix

Compare all 40 diagrams for:

- plot/control column widths,
- minimum heights,
- panel padding,
- border and surface tokens,
- typography roles,
- legends,
- sliders,
- selects,
- steppers,
- buttons,
- reset behavior,
- disabled state,
- status/error presentation,
- decimal precision and units,
- loading and animation behavior.

**Acceptance:** Every intentional exception is documented; accidental
exceptions are fixed.

### VA6-T2: Accessibility matrix

Automate and manually check:

- one unique accessible name per visualization,
- labels for every form control,
- keyboard operation for every primary interaction,
- visible focus,
- no required hover-only information,
- non-color state cues,
- reduced-motion behavior,
- text contrast,
- SVG title/description quality,
- 200% zoom and reflow.

**Acceptance:** No major accessibility failure remains.

### VA6-T3: Responsive matrix

Run every diagram at:

- 360×800,
- 768×1024,
- 1024×768,
- 1440×900.

Check:

- no page-level horizontal overflow,
- plot labels remain visible,
- controls do not overlap,
- SVG content stays within the viewport,
- touch targets remain usable,
- legends wrap without obscuring the plot,
- mobile ordering preserves explanatory sequence.

**Acceptance:** All 40 diagrams pass all four viewports or have a documented,
tested alternative mobile presentation.

### VA6-T4: Language and artifact audit

Search for:

- decorative emoji,
- inconsistent icons,
- unexplained abbreviations,
- inconsistent capitalization,
- vague labels such as “value” without units,
- false precision,
- “AI magic” language,
- claims not demonstrated by the diagram.

**Acceptance:** Diagram language is technical, concise, and consistent with the
module.

### VA6-T5: Performance and stability

Check:

- repeated mount/unmount,
- timers and animation cleanup,
- hidden-tab behavior,
- rapid route changes,
- repeated play/reset,
- expensive recalculation,
- unnecessary render loops,
- deterministic hydration,
- console warnings.

**Acceptance:** No timer leak, stale update, hydration issue, or obvious
interaction lag remains.

---

## 15. Milestone VA7 — Final Effectiveness Review and Release Gate

### VA7-T1: Revisit every disposition

For every `REFINE`, `REWORK`, `REPLACE`, or `REMOVE` decision:

1. Confirm remediation was implemented.
2. Re-run the original audit procedure.
3. Compare before/after evidence.
4. Confirm the final interaction still serves the stated objective.

### VA7-T2: Track walkthroughs

Walk each track in order without reading implementation code:

1. Open every module.
2. Read the diagram subtitle.
3. Use the primary interaction.
4. State the inferred mental model.
5. Compare it with the module learning objective and mathematics.
6. Record duplication, contradiction, or progression problems.

### VA7-T3: Full automated validation

Required commands:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

Required automated outcomes:

- All 40 module routes render the intended diagram.
- All 40 diagrams have accessible names.
- All 40 diagrams have at least one accuracy assertion.
- All major interaction classes have browser coverage.
- All four viewport classes pass overflow checks.
- Unknown IDs produce explicit error UI.
- No console errors or hydration warnings occur.

### VA7-T4: Final report

`FINAL_REPORT.md` must include:

- executive summary,
- 40-diagram score table,
- final dispositions,
- defects by severity and category,
- replaced or removed concepts,
- accuracy methods used,
- accessibility results,
- responsive results,
- test coverage before and after,
- remaining limitations,
- recommended future diagrams only where a genuine conceptual gap remains.

### Final release gate

The audit program is complete only when:

- 40/40 dossiers are complete.
- 40/40 diagrams have a final disposition.
- 40/40 diagrams meet the release threshold or are intentionally removed.
- No open S1 or S2 defects remain.
- All S3 deferrals have rationale and a target.
- Full lint, test, build, and Cypress validation pass.
- The final report distinguishes exact simulation, valid simplification, and
  illustrative scenario for every diagram.

---

## 16. Initial Audit Register

All entries begin as `BACKLOG`. Review order within a track must ultimately
follow `getTrackModules(track)`; the batches below group related validation
work.

### Mathematical Foundations

| Module ID | Component | Status |
|---|---|---|
| `calculus` | `CalculusViz.tsx` | `BACKLOG` |
| `linear-algebra` | `LinearAlgebraViz.tsx` | `BACKLOG` |
| `probability-theory` | `ProbabilityViz.tsx` | `BACKLOG` |
| `maximum-likelihood` | `MaximumLikelihoodViz.tsx` | `BACKLOG` |
| `bayesian-inference` | `BayesianInferenceViz.tsx` | `BACKLOG` |
| `statistics-estimation` | `StatisticsViz.tsx` | `BACKLOG` |
| `gradient-descent` | `GradientDescentViz.tsx` | `BACKLOG` |

### ML Practitioner

| Module ID | Component | Status |
|---|---|---|
| `data-preparation` | `DataPreparationViz.tsx` | `BACKLOG` |
| `linear-regression` | `LinearRegressionViz.tsx` | `BACKLOG` |
| `logistic-regression` | `LogisticRegressionViz.tsx` | `BACKLOG` |
| `knn` | `KNNViz.tsx` | `BACKLOG` |
| `decision-trees` | `DecisionTreeViz.tsx` | `BACKLOG` |
| `support-vector-machines` | `SVMViz.tsx` | `BACKLOG` |
| `naive-bayes` | `NaiveBayesViz.tsx` | `BACKLOG` |
| `ensemble-learning` | `EnsembleViz.tsx` | `BACKLOG` |
| `clustering` | `KMeansViz.tsx` | `BACKLOG` |
| `gmm-em` | `GMMEMViz.tsx` | `BACKLOG` |
| `dimensionality-reduction` | `PCAViz.tsx` | `BACKLOG` |
| `mcmc` | `MCMCViz.tsx` | `BACKLOG` |
| `anomaly-detection` | `AnomalyDetectionViz.tsx` | `BACKLOG` |
| `model-selection` | `ModelSelectionViz.tsx` | `BACKLOG` |
| `bias-variance` | `BiasVarianceViz.tsx` | `BACKLOG` |
| `regularization` | `RegularizationViz.tsx` | `BACKLOG` |
| `evaluation-metrics` | `EvaluationMetricsViz.tsx` | `BACKLOG` |
| `neural-networks` | `NeuralNetworkViz.tsx` | `BACKLOG` |
| `cnn` | `CNNViz.tsx` | `BACKLOG` |
| `computer-vision` | `ComputerVisionViz.tsx` | `BACKLOG` |
| `nlp` | `NLPEmbeddingsViz.tsx` | `BACKLOG` |
| `autoencoders` | `AutoencoderViz.tsx` | `BACKLOG` |
| `transformers` | `TransformerViz.tsx` | `BACKLOG` |
| `llms` | `LLMViz.tsx` | `BACKLOG` |
| `reinforcement-learning` | `RLViz.tsx` | `BACKLOG` |
| `generative-models` | `GenerativeViz.tsx` | `BACKLOG` |

### Modern AI

| Module ID | Component | Status |
|---|---|---|
| `backpropagation` | `BackpropagationViz.tsx` | `BACKLOG` |
| `sequence-models` | `SequenceModelsViz.tsx` | `BACKLOG` |
| `embeddings-tokenization` | `EmbeddingsTokenizationViz.tsx` | `BACKLOG` |
| `rag` | `RAGViz.tsx` | `BACKLOG` |
| `fine-tuning` | `FineTuningViz.tsx` | `BACKLOG` |
| `llm-evaluation-safety` | `LLMEvalSafetyViz.tsx` | `BACKLOG` |
| `ai-inference` | `AIInferenceViz.tsx` | `BACKLOG` |

---

## 17. Test Strategy by Diagram Type

### Deterministic numerical diagrams

Examples: regression, metrics, convolution, attention, inference memory.

Required:

- pure calculation helper,
- table-driven expected values,
- boundary and degenerate cases,
- display value agreement,
- reset invariant.

### Stochastic simulations

Examples: probability sampling, bootstrap, MCMC, generative sampling.

Required:

- seeded PRNG,
- fixed-seed exact assertions,
- multi-seed property assertions,
- statistical tolerance with documented rationale,
- no flaky timing dependency.

### State-machine and stepper diagrams

Examples: Bayesian update, K-Means, CNN scan, Backpropagation, RAG.

Required:

- explicit state-transition table,
- next/previous/reset bounds,
- no skipped or unreachable states,
- displayed narrative synchronized with state,
- play/pause cleanup.

### Direct manipulation diagrams

Examples: draggable boundaries, axes, nodes, or points.

Required:

- pointer and keyboard alternative,
- coordinate clamping,
- model output derived from final coordinate,
- labels updated during manipulation,
- mobile/touch behavior.

### Illustrative systems diagrams

Examples: RAG, fine-tuning, LLM safety, generative models.

Required:

- explicit scenario assumptions,
- no implication that scripted text is live model output,
- causal connection between controls and scenario,
- quantitative claims independently checked,
- replacement considered if interaction is cosmetic.

---

## 18. Definition of Done for One Diagram

A single diagram is done when:

1. Its dossier is complete.
2. Its teaching purpose is explicit.
3. Its disposition is justified.
4. Its formulas and outputs are independently checked.
5. Its main controls and reset behavior are tested.
6. Its edge cases do not produce invalid, stale, infinite, or `NaN` output.
7. Its UI follows the common diagram contract.
8. Its accessible name and controls are valid.
9. It works at all required viewports.
10. Reduced-motion behavior is acceptable.
11. All S1–S3 defects found during its audit are resolved.
12. Focused tests, full unit tests, lint, and build pass.

Rendering without crashing is necessary, but it is not evidence that the
diagram is correct or effective.
