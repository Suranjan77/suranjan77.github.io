export * from "./types";
import { LearningModule } from "./learningModuleTypes";
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
import { classicalSynthesis } from "./10b_synthesis_classical";
import { cnn } from "./11_cnn";
import { computerVision } from "./12_computer_vision";
import { nlp } from "./13_nlp";
import { autoencoders } from "./14_autoencoders";
import { transformers } from "./15_transformers";
import { llms } from "./16_llms";
import { reinforcementLearning } from "./17_reinforcement_learning";
import { generativeModels } from "./19_generative_models";
import { regularization } from "./20_regularization";
import { dlSynthesis } from "./20b_synthesis_deep_learning";
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
import { llmSynthesis } from "./36b_synthesis_llms";
import { imageSegmentation } from "./37_image_segmentation";
import { visionTransformers } from "./38_vision_transformers";

export const algorithmsList: LearningModule[] = [
  appliedMlWorkflow,
  linearRegression,
  logisticRegression,
  regularization,
  knn,
  naiveBayes,
  svm,
  decisionTrees,
  ensembleLearning,
  clustering,
  gmmEm,
  dimensionalityReduction,
  mcmc,
  neuralNetworks,
  classicalSynthesis,
  backpropagation,
  cnn,
  computerVision,
  imageSegmentation,
  embeddingsTokenization,
  sequenceModels,
  nlp,
  autoencoders,
  generativeModels,
  transformers,
  visionTransformers,
  llms,
  dlSynthesis,
  fineTuning,
  rag,
  llmEvaluationSafety,
  aiInference,
  reinforcementLearning,
  llmSynthesis,
];
