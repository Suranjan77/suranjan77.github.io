# Module Inventory

Established: 2026-06-06

## Existing Algorithm Modules

| File Name | ID (`id`) | Title (`title`) | Category (`category`) | Matching Viz Component? | Route Slug |
| --- | --- | --- | --- | --- | --- |
| `0_1_calculus.ts` | `calculus` | Calculus & Optimisation | Calculus | Yes (`CalculusViz.tsx`) | `/algorithms/calculus` |
| `0_2_linear_algebra.ts` | `linear-algebra` | Linear Algebra & Data Structure | Linear Algebra | Yes (`LinearAlgebraViz.tsx`) | `/algorithms/linear-algebra` |
| `0_3_probability_theory.ts` | `probability-theory` | Probability & Statistics | Probability Theory | Yes (`ProbabilityViz.tsx`) | `/algorithms/probability-theory` |
| `1_maximum_likelihood.ts` | `maximum-likelihood` | Maximum Likelihood Estimation | Maximum Likelihood | Yes (`MaximumLikelihoodViz.tsx`) | `/algorithms/maximum-likelihood` |
| `2_bayesian.ts` | `bayesian-inference` | Bayesian Inference | Bayesian Inference | Yes (`BayesianInferenceViz.tsx`) | `/algorithms/bayesian-inference` |
| `3_linear_regression.ts` | `linear-regression` | Linear & Logistic Regression | Linear Regression | Yes (`LinearRegressionViz.tsx`) | `/algorithms/linear-regression` |
| `4_instances_trees.ts` | `instance-based-trees` | Instance-based Learning & Decision Trees | Instance-based Learning & Decision Trees | No | `/algorithms/instance-based-trees` |
| `5_clustering.ts` | `clustering` | Clustering (K-Means, EM, GMM) | Clustering | Yes (`KMeansViz.tsx`) | `/algorithms/clustering` |
| `6_svm.ts` | `support-vector-machines` | Support Vector Machines | Support Vector Machines | No | `/algorithms/support-vector-machines` |
| `7_ensemble.ts` | `ensemble-learning` | Ensemble Learning (RFs & GBMs) | Ensemble Learning | No | `/algorithms/ensemble-learning` |
| `8_dimensionality.ts` | `dimensionality-reduction` | Dimensionality Reduction | Dimensionality Reduction | Yes (`PCAViz.tsx`) | `/algorithms/dimensionality-reduction` |
| `9_mcmc.ts` | `mcmc` | Markov Chain Monte Carlo | Markov Chain Monte Carlo | Yes (`MCMCViz.tsx`) | `/algorithms/mcmc` |
| `10_neural_networks.ts` | `neural-networks` | Neural Networks & Deep Learning | Neural Networks / Deep Learning | Yes (`NeuralNetworkViz.tsx`) | `/algorithms/neural-networks` |
| `11_cnn.ts` | `cnn` | Convolutional Neural Networks | Convolutional Neural Networks | Yes (`CNNViz.tsx`) | `/algorithms/cnn` |
| `12_computer_vision.ts` | `computer-vision` | Computer Vision Foundations | Computer Vision | Yes (`ComputerVisionViz.tsx`) | `/algorithms/computer-vision` |
| `13_nlp.ts` | `nlp` | Natural Language Processing | Natural Language Processing | Yes (`NLPEmbeddingsViz.tsx`) | `/algorithms/nlp` |
| `14_autoencoders.ts` | `autoencoders` | Autoencoders | Autoencoders | Yes (`AutoencoderViz.tsx`) | `/algorithms/autoencoders` |
| `15_transformers.ts` | `transformers` | Transformers | Transformers | No | `/algorithms/transformers` |
| `16_llms.ts` | `llms` | Large Language Models | Large Language Models | No | `/algorithms/llms` |
| `17_reinforcement_learning.ts` | `reinforcement-learning` | Reinforcement Learning | Reinforcement Learning | Yes (`RLViz.tsx`) | `/algorithms/reinforcement-learning` |
| `18_bias_variance.ts` | `bias-variance` | Bias-Variance Tradeoff | Model Complexity & Bias-Variance | Yes (`BiasVarianceViz.tsx`) | `/algorithms/bias-variance` |
| `19_generative_models.ts` | `generative-models` | Generative Adversarial Networks | Generative Models | Yes (`GenerativeViz.tsx`) | `/algorithms/generative-models` |
| `20_regularization.ts` | `regularization` | L1 & L2 Regularization | Regularization | Yes (`RegularizationViz.tsx`) | `/algorithms/regularization` |
| `21_evaluation_metrics.ts` | `evaluation-metrics` | Evaluation Metrics | Evaluation Metrics | Yes (`EvaluationMetricsViz.tsx`) | `/algorithms/evaluation-metrics` |

## Combined Modules That Need Splitting

1. **`4_instances_trees.ts`**
   - Currently contains a combined category/record `Instance-based Learning & Decision Trees`.
   - Needs to be split into separate `knn` (K-Nearest Neighbors) and `decision-trees` (Decision Trees) files.
   - Separate visualization files already exist: `KNNViz.tsx` and `DecisionTreeViz.tsx`.

2. **`3_linear_regression.ts`**
   - *Analysis:* Let's check whether it covers both linear and logistic regression.
   - *Findings:* Yes, the file contains references to or content for Logistic Regression, but `LogisticRegressionViz.tsx` exists separately. We will need to split this module or verify its content. Let's document that it contains linear regression with some logistic references, and they need to be fully separated.
   - *Module presence:* No separate logistic regression module file exists currently (only `3_linear_regression.ts` and the viz `LogisticRegressionViz.tsx` exist). Thus, Logistic Regression needs to be extracted or created as a separate module in Milestone 2.

## Supplemental Data Check

We check if `src/data/algorithmSupplemental.ts` contains entries for all module IDs.

Supplemental data keys found: `calculus`, `linear-algebra`, `probability-theory`, `maximum-likelihood`, `bayesian-inference`, `linear-regression`, `instance-based-trees`, `clustering`, `support-vector-machines`, `ensemble-learning`, `dimensionality-reduction`, `mcmc`, `neural-networks`, `cnn`, `computer-vision`, `nlp`, `autoencoders`, `transformers`, `llms`, `reinforcement-learning`, `bias-variance`, `generative-models`, `regularization`, `evaluation-metrics`

### Check Result:
All active module IDs have corresponding entries in `src/data/algorithmSupplemental.ts`.
