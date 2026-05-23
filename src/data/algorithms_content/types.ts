export type AlgorithmCategory =
  | "Calculus"
  | "Linear Algebra"
  | "Probability Theory"
  | "Maximum Likelihood"
  | "Bayesian Inference"
  | "Linear Regression"
  | "Instance-based Learning & Decision Trees"
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
  | "Evaluation Metrics";

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
