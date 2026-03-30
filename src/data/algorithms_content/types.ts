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
  | "Neural Networks / Deep Learning";

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
