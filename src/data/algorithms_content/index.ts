export * from "./types";
import { LearningModule } from "./learningModuleTypes";
import { calculus } from "./0_1_calculus";
import { linearAlgebra } from "./0_2_linear_algebra";
import { probabilityTheory } from "./0_3_probability_theory";
import { maximumLikelihood } from "./1_maximum_likelihood";
import { bayesianInference } from "./2_bayesian";
import { linearRegression } from "./3_linear_regression";
import { logisticRegression } from "./3b_logistic_regression";
import { knn } from "./4a_knn";
import { decisionTrees } from "./4b_decision_trees";
import { clustering } from "./5_clustering";
import { svm } from "./6_svm";
import { ensembleLearning } from "./7_ensemble";
import { dimensionalityReduction } from "./8_dimensionality";
import { mcmc } from "./9_mcmc";
import { neuralNetworks } from "./10_neural_networks";
import { cnn } from "./11_cnn";
import { computerVision } from "./12_computer_vision";
import { nlp } from "./13_nlp";
import { autoencoders } from "./14_autoencoders";
import { transformers } from "./15_transformers";
import { llms } from "./16_llms";
import { reinforcementLearning } from "./17_reinforcement_learning";
import { generativeModels } from "./19_generative_models";
import { regularization } from "./20_regularization";
import { statisticsEstimation } from "./22_statistics_estimation";
import { gradientDescent } from "./23_gradient_descent";
import { naiveBayes } from "./25_naive_bayes";
import { gmmEm } from "./27_gmm_em";
import { backpropagation } from "./29_backpropagation";
import { sequenceModels } from "./30_sequence_models";
import { embeddingsTokenization } from "./31_embeddings_tokenization";
import { rag } from "./32_rag";
import { fineTuning } from "./33_fine_tuning";
import { llmEvaluationSafety } from "./34_llm_evaluation_safety";
import { aiInference } from "./35_ai_inference";
import { appliedMlWorkflow } from "./36_applied_ml_workflow";

export const algorithmsList: LearningModule[] = [
  calculus,
  linearAlgebra,
  probabilityTheory,
  maximumLikelihood,
  bayesianInference,
  linearRegression,
  logisticRegression,
  knn,
  decisionTrees,
  clustering,
  svm,
  ensembleLearning,
  dimensionalityReduction,
  mcmc,
  neuralNetworks,
  cnn,
  computerVision,
  nlp,
  autoencoders,
  transformers,
  llms,
  reinforcementLearning,
  generativeModels,
  regularization,
  statisticsEstimation,
  gradientDescent,
  naiveBayes,
  gmmEm,
  backpropagation,
  sequenceModels,
  embeddingsTokenization,
  rag,
  fineTuning,
  llmEvaluationSafety,
  aiInference,
  appliedMlWorkflow,
];
