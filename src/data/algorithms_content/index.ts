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
];
