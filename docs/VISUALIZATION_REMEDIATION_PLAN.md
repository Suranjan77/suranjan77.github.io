# Visualization Remediation Plan — Single Developer

**Project:** `suranjan77.github.io` — ML Learning Platform
**Implementor:** One person (or one coding agent)
**Structure:** Sequential milestones (not calendar dates)
**Rule:** Do NOT start a milestone until the previous one is complete.

---

## Current State Summary

Based on the interactive diagram audit (June 2026):
- **Total diagrams:** 40
- **VERIFIED / KEEP:** 6 (Linear Regression, Logistic Regression, PCA, Evaluation Metrics, CNN, and Computer Vision)
- **REMEDIATION / REFINE:** 34
- **Open Defects:** 34 S3 defects (Accuracy coverage)
- **Problem:** 34 diagrams lack a diagram-specific independent numerical oracle covering default, interior, and boundary states.
- **Goal:** Add a pure test-local oracle and display agreement assertions for each of the 34 remaining diagrams.

---

## Milestone 1 — Foundation Track Remediation

**Goal:** Remediate the 7 `foundations` track diagrams by adding test-local oracles and display agreement assertions.

### Tasks

#### M1-T1: Math and Calculus
1. **Target:** `calculus` (VIZ-FND-001) & `linear-algebra` (VIZ-FND-002)
2. **Action:** Create `src/components/ui/visualizations/__tests__/CalculusViz.test.tsx` and `LinearAlgebraViz.test.tsx` (or update if they exist).
3. **Oracle:** Implement a pure numerical oracle for calculus (derivatives/integrals) and linear algebra (vectors/matrices).
4. **Assertions:** Assert that the visual DOM output matches the oracle for default, interior, and boundary states.

#### M1-T2: Probability & Statistics
1. **Target:** `probability-theory` (VIZ-FND-003), `maximum-likelihood` (VIZ-FND-004), `bayesian-inference` (VIZ-FND-005), `statistics-estimation` (VIZ-FND-006)
2. **Action:** Write/update test files for each component.
3. **Oracle:** Implement statistical and probabilistic numerical oracles in the tests.
4. **Assertions:** Verify default and boundary states (e.g., extreme probabilities like 0 or 1).

#### M1-T3: Gradient Descent
1. **Target:** `gradient-descent` (VIZ-FND-007)
2. **Action:** Write/update test file.
3. **Oracle:** Implement a test-local gradient descent step calculation.
4. **Assertions:** Verify visualization matches expected descent path and minimum.

**Acceptance:** 
- 7 test files updated/created with numerical oracles.
- `npm run test` passes.
- Update `DEFECT_LOG.md` to mark VIZ-FND-001 through VIZ-FND-007 as "Closed".
- Update `AUDIT_REGISTER.md` to change disposition to VERIFIED for these 7.

---

## Milestone 2 — Practitioner Track (Classic ML)

**Goal:** Remediate 7 classic machine learning algorithms from the `practitioner` track.

### Tasks

#### M2-T1: Data Prep & SVM
1. **Target:** `data-preparation` (VIZ-PRC-008), `support-vector-machines` (VIZ-PRC-013)
2. **Action:** Write/update test files.
3. **Oracle:** Test-local data transforms and SVM margin/hyperplane calculations.
4. **Assertions:** Check visual elements against oracle.

#### M2-T2: Trees & KNN
1. **Target:** `knn` (VIZ-PRC-011), `decision-trees` (VIZ-PRC-012)
2. **Action:** Write/update test files.
3. **Oracle:** Nearest neighbor distance calculations and tree split impurity metrics (Gini/Entropy).
4. **Assertions:** Assert correctly grouped nodes and tree structures.

#### M2-T3: Naive Bayes & Ensemble
1. **Target:** `naive-bayes` (VIZ-PRC-014), `ensemble-learning` (VIZ-PRC-015)
2. **Action:** Write/update test files.
3. **Oracle:** Conditional probability calculator and voting/boosting aggregrator.
4. **Assertions:** Assert output matches oracle.

#### M2-T4: Regularization
1. **Target:** `regularization` (VIZ-PRC-023)
2. **Action:** Write/update test files.
3. **Oracle:** L1/L2 penalty calculations on model weights.
4. **Assertions:** Assert visual shrinking of weights.

**Acceptance:** 
- 7 test files updated/created.
- `npm run test` passes.
- `DEFECT_LOG.md` and `AUDIT_REGISTER.md` updated.

---

## Milestone 3 — Practitioner Track (Unsupervised & Advanced Tuning)

**Goal:** Remediate 7 unsupervised and tuning diagrams.

### Tasks

#### M3-T1: Clustering
1. **Target:** `clustering` (VIZ-PRC-016), `gmm-em` (VIZ-PRC-017)
2. **Action:** Write/update test files.
3. **Oracle:** KMeans centroid assignment and GMM expectation-maximization probability steps.
4. **Assertions:** Check DOM nodes corresponding to cluster centers/assignments.

#### M3-T2: Advanced Probabilistic & Anomaly
1. **Target:** `mcmc` (VIZ-PRC-019), `anomaly-detection` (VIZ-PRC-020)
2. **Action:** Write/update test files.
3. **Oracle:** Markov chain state transitions and anomaly scoring threshold logic.
4. **Assertions:** Match MCMC visual paths and outlier highlights against the oracle.

#### M3-T3: Model Selection & Bias-Variance
1. **Target:** `model-selection` (VIZ-PRC-021), `bias-variance` (VIZ-PRC-022)
2. **Action:** Write/update test files.
3. **Oracle:** Cross-validation splitting logic and error decomposition formulas.
4. **Assertions:** Validate DOM output for training/validation folds and error curves.

**Acceptance:** 
- 6 test files updated/created. (Dimensionality reduction and Evaluation Metrics are already VERIFIED).
- `npm run test` passes.
- `DEFECT_LOG.md` and `AUDIT_REGISTER.md` updated.

---

## Milestone 4 — Practitioner Track (Deep Learning & GenAI)

**Goal:** Remediate 6 neural network and generative models diagrams.

### Tasks

#### M4-T1: Neural Networks & Autoencoders
1. **Target:** `neural-networks` (VIZ-PRC-025), `autoencoders` (VIZ-PRC-029)
2. **Action:** Write/update test files.
3. **Oracle:** Forward pass matrix multiplication and activation function calculations.
4. **Assertions:** Compare visual node activations to oracle output.

#### M4-T2: NLP & Transformers
1. **Target:** `nlp` (VIZ-PRC-028), `transformers` (VIZ-PRC-030)
2. **Action:** Write/update test files.
3. **Oracle:** Word embedding similarity logic and self-attention score calculations.
4. **Assertions:** Assert correct attention weights and embedding distances.

#### M4-T3: LLMs & RL & Generative
1. **Target:** `llms` (VIZ-PRC-031), `reinforcement-learning` (VIZ-PRC-032), `generative-models` (VIZ-PRC-033)
2. **Action:** Write/update test files.
3. **Oracle:** Next-token probability distributions, Q-value updates, and diffusion/GAN generation steps.
4. **Assertions:** Assert accurate UI representations of these complex states.

**Acceptance:** 
- 7 test files updated/created. (CNN and Computer Vision are already VERIFIED).
- `npm run test` passes.
- `DEFECT_LOG.md` and `AUDIT_REGISTER.md` updated.

---

## Milestone 5 — Modern AI Track

**Goal:** Remediate the final 7 diagrams from the `modern-ai` track.

### Tasks

#### M5-T1: Deep Learning Mechanisms
1. **Target:** `backpropagation` (VIZ-MAI-034), `sequence-models` (VIZ-MAI-035)
2. **Action:** Write/update test files.
3. **Oracle:** Chain rule gradient calculation and RNN hidden state updates.
4. **Assertions:** Check visual flow of gradients and state across time steps.

#### M5-T2: Modern NLP Techniques
1. **Target:** `embeddings-tokenization` (VIZ-MAI-036), `rag` (VIZ-MAI-037)
2. **Action:** Write/update test files.
3. **Oracle:** Tokenizer splitting rules and vector similarity search.
4. **Assertions:** Validate UI token boundaries and retrieved document rankings.

#### M5-T3: Advanced LLM Workflows
1. **Target:** `fine-tuning` (VIZ-MAI-038), `llm-evaluation-safety` (VIZ-MAI-039), `ai-inference` (VIZ-MAI-040)
2. **Action:** Write/update test files.
3. **Oracle:** LoRA rank updates, perplexity scores, and KV-cache memory states.
4. **Assertions:** Validate DOM representation of weight updates, safety filters, and decoding trees.

**Acceptance:** 
- 7 test files updated/created.
- `npm run test` passes.
- `DEFECT_LOG.md` and `AUDIT_REGISTER.md` updated.

---

## Milestone 6 — Final Audit & Closure

**Goal:** Ensure all 40 visualizations are fully verified and all defects are closed.

### Tasks

#### M6-T1: Final Test Run
1. Run `npm run test`. Ensure 100% pass rate.
2. Run Cypress end-to-end tests to ensure no regressions in visual layout or routing.

#### M6-T2: Update Master Documentation
1. Update `FINAL_REPORT.md`:
   - Change VERIFIED/KEEP to 40.
   - Change REMEDIATION/REFINE to 0.
   - Update "Remaining Limitations" to remove the 34 diagram warning.
2. Verify all `dossiers/*.md` are updated with oracle test evidence.

**Acceptance:** 
- All 40 diagrams are VERIFIED.
- Zero open S3 defects.
- Documentation accurately reflects a fully verified interactive visualization suite.
