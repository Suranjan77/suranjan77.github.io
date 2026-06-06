export type AlgorithmCategory =
  | "Calculus"
  | "Linear Algebra"
  | "Probability Theory"
  | "Maximum Likelihood"
  | "Bayesian Inference"
  | "Linear Regression"
  | "Logistic Regression"
  | "K-Nearest Neighbors"
  | "Decision Trees"
  | "Clustering"
  | "Support Vector Machines"
  | "Ensemble Learning"
  | "Dimensionality Reduction"
  | "Markov Chain Monte Carlo"
  | "Neural Networks / Deep Learning"
  | "Convolutional Neural Networks"
  | "Computer Vision"
  | "Natural Language Processing"
  | "Autoencoders"
  | "Transformers"
  | "Large Language Models"
  | "Reinforcement Learning"
  | "Model Complexity & Bias-Variance"
  | "Generative Models"
  | "Regularization"
  | "Evaluation Metrics"
  | "Statistics and Estimation"
  | "Gradient Descent and Optimization"
  | "Data Preparation and Feature Engineering"
  | "Naive Bayes"
  | "Model Selection and Cross-Validation"
  | "Gaussian Mixtures and EM"
  | "Anomaly Detection"
  | "Backpropagation"
  | "Sequence Models"
  | "Embeddings and Tokenization"
  | "Retrieval-Augmented Generation"
  | "Fine-Tuning and Preference Optimization"
  | "LLM Evaluation and Safety"
  | "AI Inference Systems";

export interface Algorithm {
  id: string;
  title: string;
  category: AlgorithmCategory;
  shortDescription: string;
  fullDescription: string;
  intuition: string;
  mathematics: string;
  pros: string[];
  cons: string[];
  codeSnippet: string;
}

export * from './learningModuleTypes';
