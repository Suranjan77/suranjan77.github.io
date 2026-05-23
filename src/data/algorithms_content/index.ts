export * from "./types";
import { calculus } from "./0_1_calculus";
import { linearAlgebra } from "./0_2_linear_algebra";
import { probabilityTheory } from "./0_3_probability_theory";
import { maximumLikelihood } from "./1_maximum_likelihood";
import { bayesianInference } from "./2_bayesian";
import { linearRegression } from "./3_linear_regression";
import { instanceBasedTrees } from "./4_instances_trees";
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
import { biasVariance } from "./18_bias_variance";
import { generativeModels } from "./19_generative_models";
import { regularization } from "./20_regularization";
import { evaluationMetrics } from "./21_evaluation_metrics";

export const algorithmsList = [
  calculus,
  linearAlgebra,
  probabilityTheory,
  maximumLikelihood,
  bayesianInference,
  linearRegression,
  instanceBasedTrees,
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
  biasVariance,
  generativeModels,
  regularization,
  evaluationMetrics,
];
