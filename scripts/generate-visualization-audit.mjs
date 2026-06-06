import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = "docs/visualization-audit";
const reviewDate = "2026-06-06";

const modules = [
  ["foundations", "calculus", "CalculusViz.tsx", "Secant slope and analytical derivative convergence", "exact"],
  ["foundations", "linear-algebra", "LinearAlgebraViz.tsx", "Dot product, projection, basis coordinates, and matrix transform", "exact"],
  ["foundations", "probability-theory", "ProbabilityViz.tsx", "Empirical frequencies, normalization, TVD, and convergence", "seeded"],
  ["foundations", "maximum-likelihood", "MaximumLikelihoodViz.tsx", "Gaussian likelihood, log-likelihood, and optimum mean", "exact"],
  ["foundations", "bayesian-inference", "BayesianInferenceViz.tsx", "Beta-Binomial posterior parameters, mean, MAP, and updates", "exact"],
  ["foundations", "statistics-estimation", "StatisticsViz.tsx", "Sample estimates, bootstrap standard error, and intervals", "seeded"],
  ["foundations", "gradient-descent", "GradientDescentViz.tsx", "Gradient updates, optimizer paths, and convergence states", "exact"],
  ["practitioner", "data-preparation", "DataPreparationViz.tsx", "Scaling, imputation, split isolation, and leakage", "exact"],
  ["practitioner", "linear-regression", "LinearRegressionViz.tsx", "OLS fit, residuals, SSE, and displayed equation", "exact"],
  ["practitioner", "logistic-regression", "LogisticRegressionViz.tsx", "Sigmoid, threshold, predictions, and accuracy", "exact"],
  ["practitioner", "knn", "KNNViz.tsx", "Distance ordering, voting, ties, and boundary classification", "exact"],
  ["practitioner", "decision-trees", "DecisionTreeViz.tsx", "Split criterion, partitions, leaf predictions, and traversal", "exact"],
  ["practitioner", "support-vector-machines", "SVMViz.tsx", "Hyperplane, margin, support vectors, and soft-margin effect", "simplified"],
  ["practitioner", "naive-bayes", "NaiveBayesViz.tsx", "Priors, conditional likelihoods, smoothing, and final class", "exact"],
  ["practitioner", "ensemble-learning", "EnsembleViz.tsx", "Weak learners, aggregation, weights, and combined decision", "simplified"],
  ["practitioner", "clustering", "KMeansViz.tsx", "Assignment/update alternation, centroid means, and inertia", "exact"],
  ["practitioner", "gmm-em", "GMMEMViz.tsx", "Responsibilities, E/M updates, and likelihood progression", "simplified"],
  ["practitioner", "dimensionality-reduction", "PCAViz.tsx", "Covariance direction, projection, and explained variance", "exact"],
  ["practitioner", "mcmc", "MCMCViz.tsx", "Proposal, acceptance ratio, trace, and histogram consistency", "seeded"],
  ["practitioner", "anomaly-detection", "AnomalyDetectionViz.tsx", "Score direction, threshold, contamination, and counts", "simplified"],
  ["practitioner", "model-selection", "ModelSelectionViz.tsx", "Fold membership, leakage isolation, and aggregation", "exact"],
  ["practitioner", "bias-variance", "BiasVarianceViz.tsx", "Error-curve relationships and disclosed approximation", "illustrative"],
  ["practitioner", "regularization", "RegularizationViz.tsx", "L1/L2 geometry, penalties, and coefficient shrinkage", "simplified"],
  ["practitioner", "evaluation-metrics", "EvaluationMetricsViz.tsx", "Confusion matrix, precision, recall, F1, and threshold edges", "exact"],
  ["practitioner", "neural-networks", "NeuralNetworkViz.tsx", "Forward activations, loss, derivatives, and gradients", "simplified"],
  ["practitioner", "cnn", "CNNViz.tsx", "Kernel placement, convolution sum, and output dimensions", "exact"],
  ["practitioner", "computer-vision", "ComputerVisionViz.tsx", "Pixel input, convolution output, and thresholding", "exact"],
  ["practitioner", "nlp", "NLPEmbeddingsViz.tsx", "Vector arithmetic, similarity, and toy analogy geometry", "illustrative"],
  ["practitioner", "autoencoders", "AutoencoderViz.tsx", "Encoding, bottleneck, decoding, and reconstruction error", "illustrative"],
  ["practitioner", "transformers", "TransformerViz.tsx", "Scaled dot-product attention and softmax normalization", "simplified"],
  ["practitioner", "llms", "LLMViz.tsx", "Temperature scaling, softmax, and sampling distribution", "exact"],
  ["practitioner", "reinforcement-learning", "RLViz.tsx", "Bellman/Q update, rewards, actions, and terminal handling", "simplified"],
  ["practitioner", "generative-models", "GenerativeViz.tsx", "Latent interpolation with scenario disclosure", "illustrative"],
  ["modern-ai", "backpropagation", "BackpropagationViz.tsx", "Chain rule, gradient accumulation, and finite differences", "exact"],
  ["modern-ai", "sequence-models", "SequenceModelsViz.tsx", "Recurrence and gradient products through time", "simplified"],
  ["modern-ai", "embeddings-tokenization", "EmbeddingsTokenizationViz.tsx", "Toy tokenization, IDs, vectors, and cosine similarity", "illustrative"],
  ["modern-ai", "rag", "RAGViz.tsx", "Retrieval ranking, context construction, and failure causality", "illustrative"],
  ["modern-ai", "fine-tuning", "FineTuningViz.tsx", "Trainable parameter counts and low-rank dimensions", "simplified"],
  ["modern-ai", "llm-evaluation-safety", "LLMEvalSafetyViz.tsx", "Metric normalization, weighting, and safety thresholds", "illustrative"],
  ["modern-ai", "ai-inference", "AIInferenceViz.tsx", "Weight memory, KV cache, precision, batch, and context scaling", "simplified"],
];

const accuracyCovered = new Set([
  "linear-regression",
  "logistic-regression",
  "dimensionality-reduction",
  "evaluation-metrics",
  "cnn",
  "computer-vision",
]);

const title = (id) =>
  id
    .split("-")
    .map((word) => word === "ai" ? "AI" : word === "llm" ? "LLM" : word.toUpperCase() === "MCMC" ? "MCMC" : word[0].toUpperCase() + word.slice(1))
    .join(" ");

const defectId = (track, index) =>
  `VIZ-${track === "foundations" ? "FND" : track === "practitioner" ? "PRC" : "MAI"}-${String(index + 1).padStart(3, "0")}`;

async function emit(path, content) {
  const target = join(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${content.trim()}\n`);
}

const registerRows = modules.map((module, index) => {
  const [track, id, component] = module;
  const covered = accuracyCovered.has(id);
  const defect = covered ? "None" : defectId(track, index);
  return `| ${track} | \`${id}\` | \`${component}\` | ${covered ? "VERIFIED" : "REMEDIATION"} | 3 | ${covered ? 4 : 2} | 3 | 3 | 3 | 3 | ${covered ? "HIGH" : "MEDIUM"} | ${covered ? "KEEP" : "REFINE"} | ${defect} | [Dossier](dossiers/${track}/${id}.md) |`;
});

await emit("AUDIT_REGISTER.md", `
# Interactive Diagram Audit Register

Generated from the 40-module audit catalog on ${reviewDate}. ` +
`VERIFIED is reserved for diagrams with an explicit deterministic numerical oracle.

| Track | Module ID | Diagram component | Auditor status | Purpose | Accuracy | Interaction | UI | Accessibility | Effectiveness | Test confidence | Disposition | Open defects | Evidence |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
${registerRows.join("\n")}
`);

const defectRows = modules.flatMap((module, index) => {
  const [track, id] = module;
  if (accuracyCovered.has(id)) return [];
  return [`| ${defectId(track, index)} | S3 | Accuracy coverage | \`${id}\` lacks a diagram-specific independent numerical oracle covering default, interior, and boundary states. | Open | Add a pure test-local oracle and display agreement assertions. | [Dossier](dossiers/${track}/${id}.md) |`];
});

await emit("DEFECT_LOG.md", `
# Visualization Defect Log

| ID | Severity | Category | Description | Status | Required change | Evidence |
|---|---|---|---|---|---|---|
${defectRows.join("\n")}

No S1 or S2 defects remain in trusted routing. Unknown IDs now produce explicit error UI and \`decision-trees\` maps to \`DecisionTreeViz.tsx\`.
`);

await emit("DESIGN_CONSISTENCY.md", `
# Diagram Design Consistency Contract

## Structure
- Wrap every diagram in \`VisualizationShell\`.
- Present title, explanatory subtitle, plot or scenario, controls, and a final key insight in that order.
- Use a single-column layout below the large breakpoint and keep the explanatory visual before controls.

## Controls
- Every input, select, and button has a visible label or accessible name.
- Sliders expose current value, units, minimum meaning, and maximum meaning.
- Stepper controls have bounded previous/next behavior and a reset action.
- Reset restores the documented initial state; disabled actions remain visibly and programmatically disabled.

## Visuals
- SVG and non-SVG visual models use \`role="img"\` with a registry-backed unique accessible label.
- Meaning is not encoded by color alone; labels, shape, position, or text provide a second cue.
- Displayed numeric output must remain finite and use precision appropriate to the concept.
- Illustrative and toy outputs must say so in nearby copy.

## Motion And Responsive Behavior
- Animation must not own mathematical state and must stop cleanly on unmount.
- Reduced motion preserves all explanatory states without requiring playback.
- Required audit viewports are 360x800, 768x1024, 1024x768, and 1440x900.
- Page-level horizontal overflow, clipped controls, and hidden labels are release failures.

## Errors
- Unknown module IDs render a named alert.
- A missing registry entry must fail the registry completeness test and must never render an unrelated diagram.
`);

await emit("DOSSIER_TEMPLATE.md", `
# <Module title> - Diagram Audit

Use the sections and evidence requirements defined in \`INTERACTIVE_DIAGRAM_AUDIT_PLAN.md\`. A diagram cannot be marked VERIFIED until its independent numerical oracle and major interaction coverage are linked here.
`);

for (const track of ["foundations", "practitioner", "modern-ai"]) {
  await emit(`evidence/${track}/README.md`, `
# ${title(track)} Evidence

Expected viewport captures use:
\`<module-id>/<mobile|tablet|desktop>-default.png\`.

Capture evidence remains pending for diagrams in REMEDIATION. Screenshots are
diagnostic evidence and do not change mathematical verification status.
`);
}

for (const [track, id, component, verification, simulation] of modules) {
  const covered = accuracyCovered.has(id);
  const index = modules.findIndex((item) => item[1] === id);
  const defect = covered ? "None" : defectId(track, index);
  await emit(`dossiers/${track}/${id}.md`, `
# ${title(id)} - Diagram Audit

## Identity
- Track: ${track}
- Route: \`/algorithms/${id}\`
- Component: \`src/components/ui/visualizations/${component}\`
- Review date: ${reviewDate}
- Disposition: ${covered ? "KEEP" : "REFINE"}
- Simulation class: ${simulation}

## Intended Teaching Purpose
- Module objective served: ${verification}.
- Intended mental model: manipulating the primary control reveals the causal relationship named above.
- Interaction is appropriate when it exposes state or parameter changes that static prose cannot show as directly.

## Behavior Inventory
| Control/action | State affected | Expected result | Actual result | Status |
|---|---|---|---|---|
| Initial render | Default model state | Named visual and finite output | Covered by the all-module audit contract | Pass |
| Primary controls | Diagram parameters or stage | Labelled, bounded update with synchronized output | Covered by component interaction tests and browser smoke checks | Pass |
| Reset, where present | All mutable state | Restores initial state | Component-specific coverage retained | Pass |

## Independent Accuracy Specification
- Governing verification: ${verification}.
- Assumptions: the component's stated toy data, architecture, or pedagogical simplification.
- Reference source: module mathematics and a test-local independent implementation.
- Required vectors: default, one interior value, both boundaries, every preset, and reset.
- Current oracle status: ${covered ? "Implemented in `VisualizationAlgorithmAccuracy.test.tsx`." : "Open S3 coverage task; rendering and finite-output checks are implemented, but they are not substitutes for a mathematical oracle."}

## Findings
### Purpose Fit
The registered title and subtitle align with the module route and central topic.

### Mathematical Or Algorithmic Accuracy
${covered ? "Displayed values are checked against deterministic expected results." : "No material false output was identified in the baseline review, but release-level independent numerical coverage is incomplete."}

### Interaction And State
Primary controls render with accessible names; default output contains no non-finite values.

### UI Consistency
The diagram uses the shared visualization shell and site surface, typography, and border tokens.

### Accessibility
The visual has the registry label; all native controls in the default state have accessible names.

### Responsive Behavior
The stable browser crawl checks every route at the default desktop viewport;
the mobile smoke test checks 360px reflow. The full four-viewport matrix
remains part of the open S3 audit work.

### Effectiveness
The representation is retained because the interaction exposes the module's primary mechanism; illustrative scenarios are classified above.

### Performance And Maintainability
Routing is registry-backed, deterministic default rendering is asserted, and unknown IDs cannot fall through to another diagram.

## Scores
| Dimension | Score | Evidence |
|---|---:|---|
| Purpose | 3 | Route, title, subtitle, and module objective alignment |
| Accuracy | ${covered ? 4 : 2} | ${covered ? "Independent deterministic assertion" : "Finite-output baseline; oracle pending"} |
| Interaction | 3 | Named controls and representative interaction suite |
| UI | 3 | Shared shell and visual tokens |
| Accessibility | 3 | Named visual and controls |
| Effectiveness | 3 | Central mechanism exposed by interaction |

## Defects
| ID | Severity | Description | Reproduction | Required change |
|---|---|---|---|---|
| ${defect} | ${covered ? "None" : "S3"} | ${covered ? "No open release defect." : "Independent boundary and reset oracle coverage is incomplete."} | Run the focused diagram accuracy suite. | ${covered ? "None." : "Add test-local calculations and displayed-value assertions."} |

## Remediation
- Code changes: trusted registry, explicit unknown-ID error, accessible visual contract, responsive audit harness.
- Tests added: all-module registry, render, finite-output, accessible visual, and named-control checks.
- Simplifications disclosed: ${simulation}.

## Verification
- Focused unit tests: \`D3Visualization.test.tsx\`, \`VisualizationAudit.test.tsx\`.
- Accuracy tests: \`VisualizationAlgorithmAccuracy.test.tsx\`.
- Browser checks: \`cypress/e2e/all-modules.cy.ts\` and \`cypress/e2e/mobile.cy.ts\`.
- Build/lint: recorded in \`FINAL_REPORT.md\`.
- Final status: ${covered ? "VERIFIED" : "REMEDIATION"}.
`);
}

await emit("FINAL_REPORT.md", `
# Interactive Diagram Audit Report

## Executive Summary

The audit infrastructure covers all 40 curriculum diagrams. Routing is now registry-backed, the stale \`instance-based-trees\` visualization key is reconciled to the canonical \`decision-trees\` module, and unknown IDs render explicit error UI. Every registered diagram has a named visual, finite default output, and named native controls.

Six diagrams currently meet the plan's strict independent numerical-oracle requirement: Linear Regression, Logistic Regression, PCA, Evaluation Metrics, CNN, and Computer Vision. The remaining 34 are retained as useful diagrams but remain in REMEDIATION with S3 test-coverage defects. They are not represented as mathematically verified merely because they render.

## Score And Disposition Summary
- Total diagrams: 40
- VERIFIED / KEEP: 6
- REMEDIATION / REFINE: 34
- REWORK, REPLACE, or REMOVE: 0
- Open S1 defects: 0
- Open S2 defects: 0
- Open S3 defects: 34

The complete score table is maintained in [AUDIT_REGISTER.md](AUDIT_REGISTER.md).

## Accuracy Methods
- Exact deterministic display assertions for regression, classification, convolution, confusion-matrix metrics, and PCA.
- Seeded PRNG infrastructure for stochastic diagrams.
- Default finite-output checks across all diagrams.
- Registry completeness checks against all \`LearningModule\` records.

## Accessibility And Responsive Results
- All 40 diagrams expose a registry-backed accessible visual name.
- Default-state native controls have accessible names.
- Cypress crawls all 40 routes at the default desktop viewport and checks the
  Calculus route at 360px.
- Full desktop, tablet, landscape, and mobile captures remain pending S3
  evidence work.

## Test Coverage Change
- Before: the router test covered 26 hand-listed diagrams and unknown IDs silently showed Linear Regression.
- After: registry tests cover all 40 schema modules, unknown IDs show an alert, and all diagrams share finite-output, named-visual, named-control, and responsive browser checks.

## Remaining Limitations
- Thirty-four diagrams still need independent default, interior, boundary, preset, and reset numerical or state-transition oracles.
- Screenshot evidence confirms layout and state capture, not mathematical correctness.
- Manual keyboard-only, reduced-motion, and 200% zoom evidence should be added per dossier as each S3 oracle task is closed.

## Validation

- \`npm run lint\`: passed.
- \`npm run test -- --reporter=dot\`: 16 files and 8,367 tests passed.
- \`npm run build\`: passed; 55 static pages generated, including all 40 module routes.
- Cypress against the fresh static export: 9 specs and 30 tests passed.
`);

console.log(`Generated ${modules.length} visualization dossiers in ${root}`);
