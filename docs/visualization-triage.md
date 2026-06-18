# Visualization Triage (Phase 0)

> Companion to `visualization-pedagogy-overhaul-plan.md`. Classifies every
> registered visual into **Keep / Reframe / Simplify**, names the insight
> moment for each Reframe target, and inventories the tests coupled to each.
>
> Auditing note: the three-width visual sweep (390 / 768 / 1440px) was
> approximated from the source rather than captured as screenshots — 26 of the
> 40 visuals share the same cramped `lg:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]`
> two-column grid (the small-canvas / overlap failure mode the plan calls out),
> so that grid usage is the primary triage signal alongside pedagogy.

## Test surfaces (so §9 churn is known up front)

- **Accuracy suites** — assert text/state per component:
  - `VisualizationAccuracyFoundations.test.tsx`
  - `VisualizationAccuracyPractitioner.test.tsx` (SVM here, line ~40)
  - `VisualizationAccuracyModernAI.test.tsx`
  - `VisualizationAlgorithmAccuracy.test.tsx`
- **Interaction contracts** — `VisualizationInteractions.test.tsx` (23 cases; SVM at ~130).
- **Audit contract** — `VisualizationAudit.test.tsx`: every registered module must
  expose a `role="img"` whose name equals its `accessibleLabel`, emit no
  `NaN`/`Infinity`, and give every control an accessible name. **Invariant for all
  phases.** Any aria-label change must update `accessibleLabels` in `D3Visualization.tsx`.
- `visualizationPrimitives.test.tsx`, `D3Visualization.test.tsx`, `useAnimationEngine.test.tsx`.

## Triage table

| Module (id) | Component | Tier | Notes / insight moment |
|---|---|---|---|
| support-vector-machines | SVMViz | **Reframe** | **Exemplar.** Insight: *2D where one class encircles another → lift to 3D → a flat plane slices them apart.* The kernel trick. |
| dimensionality-reduction | PCAViz | **Reframe** | Insight: *progressive low-rank reconstruction — "how few ingredients still look like the picture."* Aha over eigen-math. |
| calculus | CalculusViz (via D3 Scene) | Reframe | Insight: *secant chord collapses onto the curve and becomes the tangent as h→0.* |
| linear-algebra | LinearAlgebraViz | Simplify | Dot-product + projection is fine; trim stat panels. |
| maximum-likelihood | MaximumLikelihoodViz | Reframe | Insight: *slide the bell until the observed points sit highest under it.* |
| probability-theory | ProbabilityViz | Keep | Convergence-of-bars already clicks. Layout only. |
| bayesian-inference | BayesianInferenceViz | Keep | Strong guided stepper. Layout only. |
| linear-regression | LinearRegressionViz | Keep | Residual squares already carry the idea. Layout only. |
| logistic-regression | LogisticRegressionViz | Simplify | Two-panel is good; reduce stat clutter. |
| knn | KNNViz | Keep | Radius/vote reads well. Layout only. |
| decision-trees | DecisionTreeViz | Keep | Synced partition+tree is good. Layout only. |
| clustering | KMeansViz | Keep | Assignment/move loop clicks. Layout only. |
| ensemble-learning | EnsembleViz | Simplify | Aggregate surface busy; trim per-stump noise. |
| gmm-em | GMMEMViz | Simplify | EM step is fine; reduce panels. |
| mcmc | MCMCViz | Keep | Walk + accept/reject reads well. Layout only. |
| naive-bayes | NaiveBayesViz | Keep | Evidence toggles work. Layout only. |
| anomaly-detection | AnomalyDetectionViz | Simplify | Trim scoring panels. |
| model-selection | ModelSelectionViz | Keep | Fold walk is clear. Layout only. |
| bias-variance | BiasVarianceViz | Keep | Under/overfit slider clicks. Layout only. |
| regularization | RegularizationViz | Reframe | Insight: *L1's diamond corner snaps a weight to exactly zero; L2's circle never does.* |
| evaluation-metrics | EvaluationMetricsViz | Simplify | Threshold sweep good; trim. |
| statistics-estimation | StatisticsViz | Keep | Bootstrap resample reads well. |
| gradient-descent | GradientDescentViz | Keep | Path-on-surface is good. |
| data-preparation | DataPreparationViz | Simplify | Many panels; trim. |
| neural-networks | NeuralNetworkViz | Keep | Forward/back stepper is strong. Layout only. |
| cnn | CNNViz | **Keep** | **Reference for clarity** — Phase 1 migration proof, layout only. |
| computer-vision | ComputerVisionViz | Simplify | Paint sandbox busy; trim. |
| nlp | NLPEmbeddingsViz | Keep | Analogy arrows click. Layout only. |
| autoencoders | AutoencoderViz | Keep | Bottleneck drag reads well. |
| transformers | TransformerViz | Keep | Attention arcs click. Layout only. |
| llms | LLMViz | Keep | Temperature reshapes bars well. |
| reinforcement-learning | RLViz | Keep | Gridworld policy is clear. |
| generative-models | GenerativeViz | Reframe | Insight: *walk a latent line and watch one sample morph smoothly into another.* |
| backpropagation | BackpropagationViz | Keep | Graph credit-assignment is good. |
| sequence-models | SequenceModelsViz | Simplify | Gradient-flow panels busy. |
| embeddings-tokenization | EmbeddingsTokenizationViz | Keep | Token→vector map reads well. |
| rag | RAGViz | Keep | Pipeline stepper clear. |
| fine-tuning | FineTuningViz | Keep | LoRA vs full is clear. |
| llm-evaluation-safety | LLMEvalSafetyViz | Keep | Weighted scores fine. |
| ai-inference | AIInferenceViz | Simplify | Calculator-heavy; trim. |

## Rollout order for Reframe tier (Phase 3)

- **3a Foundations:** calculus, maximum-likelihood, dimensionality-reduction.
- **3b Practitioner:** support-vector-machines (done as exemplar in Phase 2), regularization.
- **3c Modern AI:** generative-models.

Everything else is Keep (layout-only migration, Phase 5) or Simplify (Phase 4).
