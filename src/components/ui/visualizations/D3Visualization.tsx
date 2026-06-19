"use client";

import * as d3 from "d3";
import React from "react";
import {
  COLORS,
  VisualizationShell,
} from "../visualizationPrimitives";

import CalculusViz from "./CalculusViz";
import LinearAlgebraViz from "./LinearAlgebraViz";
import ProbabilityViz from "./ProbabilityViz";
import MaximumLikelihoodViz from "./MaximumLikelihoodViz";
import BayesianInferenceViz from "./BayesianInferenceViz";

import LinearRegressionViz from "./LinearRegressionViz";
import LogisticRegressionViz from "./LogisticRegressionViz";
import KNNViz from "./KNNViz";
import DecisionTreeViz from "./DecisionTreeViz";
import SVMViz from "./SVMViz";
import KMeansViz from "./KMeansViz";
import EnsembleViz from "./EnsembleViz";
import PCAViz from "./PCAViz";
import MCMCViz from "./MCMCViz";

import NeuralNetworkViz from "./NeuralNetworkViz";
import CNNViz from "./CNNViz";
import ComputerVisionViz from "./ComputerVisionViz";
import NLPEmbeddingsViz from "./NLPEmbeddingsViz";
import AutoencoderViz from "./AutoencoderViz";
import TransformerViz from "./TransformerViz";
import LLMViz from "./LLMViz";
import RLViz from "./RLViz";
import GenerativeViz from "./GenerativeViz";

import RegularizationViz from "./RegularizationViz";
import StatisticsViz from "./StatisticsViz";
import GradientDescentViz from "./GradientDescentViz";
import NaiveBayesViz from "./NaiveBayesViz";
import GMMEMViz from "./GMMEMViz";
import BackpropagationViz from "./BackpropagationViz";
import SequenceModelsViz from "./SequenceModelsViz";
import EmbeddingsTokenizationViz from "./EmbeddingsTokenizationViz";
import RAGViz from "./RAGViz";
import FineTuningViz from "./FineTuningViz";
import LLMEvalSafetyViz from "./LLMEvalSafetyViz";
import AIInferenceViz from "./AIInferenceViz";

type AlgorithmKind =
  | "calculus"
  | "linear-algebra"
  | "probability"
  | "mle"
  | "bayes"
  | "linear-regression"
  | "logistic-regression"
  | "knn"
  | "tree"
  | "svm"
  | "kmeans"
  | "ensemble"
  | "dimensionality"
  | "mcmc"
  | "neural-network"
  | "cnn"
  | "vision"
  | "nlp"
  | "autoencoder"
  | "transformer"
  | "llm"
  | "rl"
  | "generative"
  | "regularization";

interface SceneConfig {
  kind: AlgorithmKind;
  title: string;
  subtitle: string;
  insight: string;
  legend: Array<{ label: string; color: string }>;
  control: {
    label: string;
    low: string;
    high: string;
    value: (control: number) => string;
  };
}

const percentControl = (label: string, low: string, high: string) => ({
  label,
  low,
  high,
  value: (control: number) => `${control}%`,
});

const extendedVisualizations: Record<
  string,
  {
    component: React.ComponentType;
    title: string;
    subtitle: string;
    insight: string;
  }
> = {
  "statistics-estimation": {
    component: StatisticsViz,
    title: "Is Your Model's Accuracy Real, or Luck?",
    subtitle: "A single test-set score hides error bars. Resample the test set to reveal them — and to judge whether one model truly beats another.",
    insight: "The bootstrap turns one test set into a confidence interval on a metric, so you can tell a real improvement from noise.",
  },
  "gradient-descent": {
    component: GradientDescentViz,
    title: "Optimizer Race: Why Momentum and Adam Beat Plain SGD",
    subtitle: "Three optimizers descend the same 3D loss landscape from the same point. A shallow pit traps plain SGD, while momentum and Adam coast through it to the deep valley.",
    insight: "Gradient descent only feels the local slope, so plain SGD stalls in the first dip; momentum's accumulated speed and Adam's adaptive steps carry training past traps.",
  },
  "naive-bayes": {
    component: NaiveBayesViz,
    title: "Spam Filter: Every Word Tugs the Verdict",
    subtitle: "Toggle words in the email; each one pulls the decision toward spam or ham by how often it appears in each, until the running total crosses the 50/50 line.",
    insight: "Naive Bayes adds up each word's log-likelihood ratio, so one strong word can tip a borderline email across the decision line.",
  },
  "gmm-em": {
    component: GMMEMViz,
    title: "Gaussian Mixtures and Expectation-Maximization",
    subtitle: "Alternate soft assignments and parameter updates for a mixture model.",
    insight: "EM improves latent-variable models by alternating inference and parameter estimation.",
  },
  backpropagation: {
    component: BackpropagationViz,
    title: "Backpropagation Through a Computational Graph",
    subtitle: "Change inputs and trace local derivatives backward through a graph.",
    insight: "Backpropagation reuses local derivatives to efficiently compute parameter gradients.",
  },
  "sequence-models": {
    component: SequenceModelsViz,
    title: "Sequence Models and Gradient Flow",
    subtitle: "Compare vanishing, stable, and exploding gradients through an unrolled recurrent model.",
    insight: "Long-range learning depends on preserving useful gradient magnitude across time steps.",
  },
  "embeddings-tokenization": {
    component: EmbeddingsTokenizationViz,
    title: "Embeddings and Tokenization",
    subtitle: "Tokenize text and inspect how token identities map into a geometric representation.",
    insight: "Tokenization defines model inputs; embeddings turn those discrete IDs into learnable vectors.",
  },
  rag: {
    component: RAGViz,
    title: "Retrieval-Augmented Generation",
    subtitle: "Step through query, retrieval, context assembly, and grounded generation.",
    insight: "RAG improves grounding by supplying retrieved evidence at inference time.",
  },
  "fine-tuning": {
    component: FineTuningViz,
    title: "Fine-Tuning and Parameter-Efficient Adaptation",
    subtitle: "Compare full-model updates with low-rank adaptation.",
    insight: "Low-rank adapters can specialize a model while training far fewer parameters.",
  },
  "llm-evaluation-safety": {
    component: LLMEvalSafetyViz,
    title: "LLM Evaluation and Safety",
    subtitle: "Reweight quality, safety, cost, and latency to compare model choices.",
    insight: "Evaluation is multi-objective; a useful model must meet capability and risk constraints.",
  },
  "ai-inference": {
    component: AIInferenceViz,
    title: "AI Inference Systems",
    subtitle: "Estimate memory and throughput as model size, precision, context, and batching change.",
    insight: "Serving performance is governed by model weights, KV cache growth, and hardware limits.",
  },
};

const configs: Record<string, SceneConfig> = {
  "calculus": {
    kind: "calculus",
    title: "The Derivative Is the Steepness of the Hill",
    subtitle: "Read the curve as a hill. The slope of the line touching it tells you how steep the ground is — climbing, flat at the summit, or descending.",
    insight: "A derivative is the steepness of the hill under your feet: positive climbing, zero at the summit, negative descending.",
    legend: [
      { label: "The hill f(x)", color: COLORS.cyan },
      { label: "Tangent (steepness here)", color: COLORS.pink },
      { label: "Chord & rise/run", color: COLORS.yellow },
    ],
    control: percentControl("Limit Distance (h → 0)", "large h", "h ≈ 0"),
  },
  "linear-algebra": {
    kind: "linear-algebra",
    title: "How Embeddings Find What's Similar",
    subtitle: "Drag a query vector through an embedding space; the dot product (as cosine similarity) ranks which items point the same way — the engine behind search, recommendations, and attention.",
    insight: "A dot product scores how much two vectors point the same way, so ranking items by it is how embeddings retrieve the most similar one.",
    legend: [
      { label: "Query", color: COLORS.yellow },
      { label: "Items", color: COLORS.cyan },
      { label: "Top match", color: COLORS.pink },
    ],
    control: percentControl("Vector Angle", "acute", "wide"),
  },
  "probability-theory": {
    kind: "probability",
    title: "Every Column of Data Has a Shape",
    subtitle: "Pick something a model might measure — heights, conversions, arrivals, wait times — and watch its probability distribution reshape as you drag the parameters. Draw samples and they fill in under the curve.",
    insight: "A probability distribution captures the whole shape of a data column with just a parameter or two; draw enough samples and they converge onto that shape — the Law of Large Numbers.",
    legend: [
      { label: "Distribution (theory)", color: COLORS.pink },
      { label: "Samples drawn", color: COLORS.cyan },
      { label: "Mean", color: COLORS.yellow },
    ],
    control: {
      label: "Sample Count",
      low: "n = 20",
      high: "n = 2,000",
      value: (control) => `n=${Math.round(20 + control * 19.8)}`,
    },
  },
  "maximum-likelihood": {
    kind: "mle",
    title: "Likelihood Pulls the Model Toward Observations",
    subtitle: "The model mean moves under the observations while likelihood stems show each point's density.",
    insight: "Maximum likelihood chooses parameters that make the observed data collectively least surprising.",
    legend: [
      { label: "Model density", color: COLORS.pink },
      { label: "Observations", color: COLORS.cyan },
      { label: "Likelihood stems", color: COLORS.yellow },
    ],
    control: {
      label: "Mean Parameter",
      low: "mu = 3.5",
      high: "mu = 6.5",
      value: (control) => `mu=${(3.5 + (control / 100) * 3).toFixed(2)}`,
    },
  },
  "bayesian-inference": {
    kind: "bayes",
    title: "A/B Test: Which Variant Really Wins?",
    subtitle: "Start unsure which variant converts better. Each visitor reshapes a belief curve over its true rate, until P(B beats A) is high enough to decide.",
    insight: "Bayesian inference turns a trickle of noisy data into calibrated confidence — wide, overlapping beliefs sharpen and separate into a decision.",
    legend: [
      { label: "Belief: Variant A", color: COLORS.cyan },
      { label: "Belief: Variant B", color: COLORS.pink },
    ],
    control: {
      label: "Observed Successes",
      low: "2 / 12",
      high: "10 / 12",
      value: (control) => `${Math.round(2 + (control / 100) * 8)} / 12`,
    },
  },
  "linear-regression": {
    kind: "linear-regression",
    title: "Predicting From Many Features at Once",
    subtitle: "A model predicts house price from several features. Train it and watch every prediction slide onto the predicted-equals-actual diagonal as the per-feature weights settle.",
    insight: "Linear regression is a weighted sum of features; training tunes all the weights together to minimize total squared error.",
    legend: [
      { label: "Predictions", color: COLORS.pink },
      { label: "Residuals", color: COLORS.yellow },
      { label: "Perfect fit", color: COLORS.cyan },
    ],
    control: {
      label: "Slope Trial",
      low: "shallow",
      high: "steep",
      value: (control) => `m=${(0.45 + (control / 100) * 0.9).toFixed(2)}`,
    },
  },
  "logistic-regression": {
    kind: "logistic-regression",
    title: "From Score to Probability to Decision",
    subtitle: "Predict the probability of passing from hours studied. The sigmoid bends a linear score into a 0–1 probability; a movable threshold turns it into a yes/no — trading misses against false alarms.",
    insight: "Logistic regression outputs a calibrated probability via the sigmoid; the decision threshold is a separate knob you tune for the cost of each error.",
    legend: [
      { label: "Passed", color: COLORS.cyan },
      { label: "Failed", color: COLORS.pink },
      { label: "P(pass) curve", color: COLORS.yellow },
    ],
    control: percentControl("Decision Threshold", "left", "right"),
  },
  "knn": {
    kind: "knn",
    title: "Tag a New Song by Its Nearest Neighbours",
    subtitle: "Drop a new track on the tempo–energy map; the k closest tagged songs vote on its genre.",
    insight: "KNN never trains — it just asks the k most similar stored examples to vote; k controls crowd vs single neighbour.",
    legend: [
      { label: "New track", color: COLORS.yellow },
      { label: "Lo-fi", color: COLORS.cyan },
      { label: "EDM", color: COLORS.pink },
    ],
    control: {
      label: "Neighbor Count",
      low: "k = 1",
      high: "k = 7",
      value: (control) => `k=${Math.round(1 + (control / 100) * 6)}`,
    },
  },
  "instance-based-trees": {
    kind: "tree",
    title: "A Loan Tree Is a Flowchart of Yes/No Questions",
    subtitle: "Drop an applicant on the income–credit map and watch it fall through the questions to an Approve/Deny verdict.",
    insight: "A tree carves the space into axis-aligned boxes; adding a question (more depth) fits finer regions and fixes the dumb one-rule mistakes.",
    legend: [
      { label: "Applicant being judged", color: COLORS.yellow },
      { label: "Repaid / Approve", color: COLORS.cyan },
      { label: "Defaulted / Deny", color: COLORS.pink },
    ],
    control: percentControl("Active Data Point", "point 1", "point N"),
  },
  "support-vector-machines": {
    kind: "svm",
    title: "The Kernel Trick: Lifting Data Until It Splits",
    subtitle: "A ring of one class traps the other in 2D. Lift each point by its distance from the centre and a single flat plane suddenly separates them.",
    insight: "When no line can separate classes, projecting into a higher dimension can make them linearly separable — and that flat boundary maps back to a curve.",
    legend: [
      { label: "Inner core", color: COLORS.pink },
      { label: "Outer ring", color: COLORS.cyan },
      { label: "Separating plane", color: COLORS.yellow },
    ],
    control: {
      label: "Lift",
      low: "flat (2D)",
      high: "lifted (3D)",
      value: (control) => `lift=${(control / 100).toFixed(2)}`,
    },
  },
  "clustering": {
    kind: "kmeans",
    title: "Find Customer Segments in Unlabelled Data",
    subtitle: "Customers plotted by spend and visits, with no labels. Run k-means and watch it discover the segments — and read off who they are.",
    insight: "Clustering is unsupervised: with no labels, k-means alternates assign-to-nearest and move-to-mean until raw points resolve into nameable groups.",
    legend: [
      { label: "Occasional shoppers", color: COLORS.cyan },
      { label: "Loyal regulars", color: COLORS.pink },
      { label: "VIP big-spenders", color: COLORS.yellow },
    ],
    control: {
      label: "Iteration Step",
      low: "initial",
      high: "converged",
      value: (control) => `step ${Math.round((control / 100) * 6)}`,
    },
  },
  "ensemble-learning": {
    kind: "ensemble",
    title: "A Committee of Weak Rules Beats Any One Expert",
    subtitle: "No single straight rule can flag fraud along a diagonal boundary. Add weak threshold rules and watch their majority vote carve an accurate staircase.",
    insight: "Each weak learner is barely better than chance; because their mistakes are uncorrelated, the majority vote cancels them and committee error drops toward zero.",
    legend: [
      { label: "Weak rule cut", color: COLORS.yellow },
      { label: "Legit", color: COLORS.cyan },
      { label: "Fraud", color: COLORS.pink },
    ],
    control: {
      label: "Learners Included",
      low: "1 stump",
      high: "5 stumps",
      value: (control) => `${Math.round(1 + (control / 100) * 4)} stumps`,
    },
  },
  "dimensionality-reduction": {
    kind: "dimensionality",
    title: "How Few Ingredients Still Look Like the Picture",
    subtitle: "Rebuild an image from only its top-k pattern components. A handful already keep most of the variance — the rest is fine detail.",
    insight: "A few high-variance components carry most of the structure, so keeping only those reconstructs the data while storing far less.",
    legend: [
      { label: "Reconstruction", color: COLORS.pink },
      { label: "Variance kept", color: COLORS.yellow },
    ],
    control: percentControl("Components kept", "few", "many"),
  },
  "mcmc": {
    kind: "mcmc",
    title: "MCMC Explores a Target Distribution by Walking",
    subtitle: "Accepted and rejected proposals show how a local random walk builds samples from a global density.",
    insight: "MCMC turns a hard distribution into a sequence of dependent samples with the right long-run density.",
    legend: [
      { label: "Target", color: COLORS.pink },
      { label: "Accepted", color: COLORS.cyan },
      { label: "Rejected", color: COLORS.yellow },
    ],
    control: {
      label: "Chain Length",
      low: "few draws",
      high: "many draws",
      value: (control) => `${Math.round(10 + control * 0.9)} draws`,
    },
  },
  "neural-networks": {
    kind: "neural-network",
    title: "Hidden Layers Bend a Boundary a Line Can't",
    subtitle: "These two classes form an XOR checkerboard no straight line can separate. Add hidden neurons one at a time and watch each one fold the decision boundary until it wraps every cluster.",
    insight: "A single neuron can only draw a straight line; each hidden neuron adds a fold, so stacking them lets the network carve any shape — that is what depth buys over a linear model.",
    legend: [
      { label: "Class A", color: COLORS.cyan },
      { label: "Class B", color: COLORS.pink },
      { label: "Misclassified", color: COLORS.yellow },
    ],
    control: percentControl("Hidden Neurons", "none", "two"),
  },
  "cnn": {
    kind: "cnn",
    title: "CNN Kernels Scan Local Patterns",
    subtitle: "A moving kernel window links an input patch to a feature-map activation.",
    insight: "Convolutions reuse a small local filter across space, detecting the same feature wherever it appears.",
    legend: [
      { label: "Kernel", color: COLORS.yellow },
      { label: "Input", color: COLORS.cyan },
      { label: "Feature map", color: COLORS.pink },
    ],
    control: percentControl("Kernel Position", "top-left", "bottom-right"),
  },
  "computer-vision": {
    kind: "vision",
    title: "Computer Vision Builds Features From Pixels",
    subtitle: "Raw pixels become filter responses, then thresholded evidence for a visible edge.",
    insight: "Vision systems transform local pixel contrast into increasingly semantic feature responses.",
    legend: [
      { label: "Pixels", color: COLORS.cyan },
      { label: "Filter response", color: COLORS.pink },
      { label: "Gradient", color: COLORS.yellow },
    ],
    control: {
      label: "Edge Threshold",
      low: "sensitive",
      high: "selective",
      value: (control) => `t=${Math.round(10 + control * 0.9)}`,
    },
  },
  "nlp": {
    kind: "nlp",
    title: "Embeddings Turn Words Into Geometry",
    subtitle: "Token neighborhoods and analogy arrows show semantic relationships as vector directions.",
    insight: "Embedding spaces make linguistic similarity measurable with distance and direction.",
    legend: [
      { label: "Tokens", color: COLORS.cyan },
      { label: "Selected", color: COLORS.pink },
      { label: "Analogy", color: COLORS.yellow },
    ],
    control: percentControl("Neighborhood Focus", "local", "analogy"),
  },
  "autoencoders": {
    kind: "autoencoder",
    title: "Autoencoders Compress Through a Bottleneck",
    subtitle: "The encoder squeezes input structure into a latent code, then reconstructs what it can preserve.",
    insight: "A tight bottleneck forces the model to learn the most reusable structure in the input.",
    legend: [
      { label: "Input", color: COLORS.cyan },
      { label: "Latent code", color: COLORS.yellow },
      { label: "Reconstruction", color: COLORS.pink },
    ],
    control: {
      label: "Bottleneck Width",
      low: "narrow",
      high: "wide",
      value: (control) => `${Math.round(1 + (control / 100) * 7)} dims`,
    },
  },
  "transformers": {
    kind: "transformer",
    title: "Transformers Route Information With Attention",
    subtitle: "The selected query token attends across context through a matrix and matching arc diagram.",
    insight: "Attention lets each token choose which other tokens should influence its representation.",
    legend: [
      { label: "Query", color: COLORS.pink },
      { label: "Strong attention", color: COLORS.yellow },
      { label: "Context", color: COLORS.cyan },
    ],
    control: {
      label: "Query Token",
      low: "first",
      high: "last",
      value: (control) => `token ${Math.round(1 + (control / 100) * 4)}`,
    },
  },
  "llms": {
    kind: "llm",
    title: "Temperature: The Creativity Dial",
    subtitle: "An LLM picks each word by sampling from a probability distribution over tokens. Drag temperature and watch one tall spike (predictable) melt into flat bars (anything goes) — then add words to build a sentence.",
    insight: "Dividing every logit by the temperature before softmax is the single knob that trades predictable, repetitive output for diverse, creative, riskier output.",
    legend: [
      { label: "Top token", color: COLORS.pink },
      { label: "Alternatives", color: COLORS.cyan },
    ],
    control: {
      label: "Temperature",
      low: "focused",
      high: "diverse",
      value: (control) => `T=${(0.3 + (control / 100) * 1.7).toFixed(1)}`,
    },
  },
  "reinforcement-learning": {
    kind: "rl",
    title: "Reinforcement Learning Improves a Policy by Rollout",
    subtitle: "Grid values, policy arrows, and an agent path connect reward to action choice.",
    insight: "RL learns action preferences from delayed outcomes rather than labeled examples.",
    legend: [
      { label: "Policy", color: COLORS.yellow },
      { label: "Reward", color: COLORS.cyan },
      { label: "Penalty", color: COLORS.pink },
    ],
    control: {
      label: "Rollout Step",
      low: "start",
      high: "goal",
      value: (control) => `step ${Math.round((control / 100) * 6)}`,
    },
  },
  "generative-models": {
    kind: "generative",
    title: "Walk the Latent Space and Watch Faces Morph",
    subtitle: "A 2-D latent code decodes into a face. Walk a straight line between two codes and one face morphs smoothly into another.",
    insight: "Generative models organise data into a continuous latent space, so points between known samples decode into new, plausible ones.",
    legend: [
      { label: "Latent walk", color: COLORS.yellow },
      { label: "Start face z", color: COLORS.cyan },
      { label: "End face z", color: COLORS.pink },
    ],
    control: percentControl("Latent Interpolation", "source A", "source B"),
  },
  "regularization": {
    kind: "regularization",
    title: "Why L1 Zeros Weights and L2 Just Shrinks Them",
    subtitle: "A weight budget pulls the best fit back to its edge. The diamond's corners sit on the axes, so L1 snaps a weight to exactly zero; the smooth circle never does.",
    insight: "L1's cornered budget lands solutions on the axes — sparsity and free feature selection; L2's round budget only shrinks weights.",
    legend: [
      { label: "Best fit + loss", color: COLORS.pink },
      { label: "Weight budget", color: COLORS.cyan },
      { label: "Solution w*", color: COLORS.yellow },
    ],
    control: percentControl("Penalty Geometry", "L1", "L2"),
  },
};

export interface VisualizationRegistryEntry {
  component: React.ComponentType;
  title: string;
  subtitle: string;
  insight: string;
  accessibleLabel: string;
  legend?: SceneConfig["legend"];
}

const visualizationComponents: Record<string, React.ComponentType> = {
  calculus: CalculusViz,
  "linear-algebra": LinearAlgebraViz,
  "probability-theory": ProbabilityViz,
  "maximum-likelihood": MaximumLikelihoodViz,
  "bayesian-inference": BayesianInferenceViz,
  "statistics-estimation": StatisticsViz,
  "gradient-descent": GradientDescentViz,
  "linear-regression": LinearRegressionViz,
  "logistic-regression": LogisticRegressionViz,
  knn: KNNViz,
  "decision-trees": DecisionTreeViz,
  "support-vector-machines": SVMViz,
  "naive-bayes": NaiveBayesViz,
  "ensemble-learning": EnsembleViz,
  clustering: KMeansViz,
  "gmm-em": GMMEMViz,
  "dimensionality-reduction": PCAViz,
  mcmc: MCMCViz,
  regularization: RegularizationViz,
  "neural-networks": NeuralNetworkViz,
  cnn: CNNViz,
  "computer-vision": ComputerVisionViz,
  nlp: NLPEmbeddingsViz,
  autoencoders: AutoencoderViz,
  transformers: TransformerViz,
  llms: LLMViz,
  "reinforcement-learning": RLViz,
  "generative-models": GenerativeViz,
  backpropagation: BackpropagationViz,
  "sequence-models": SequenceModelsViz,
  "embeddings-tokenization": EmbeddingsTokenizationViz,
  rag: RAGViz,
  "fine-tuning": FineTuningViz,
  "llm-evaluation-safety": LLMEvalSafetyViz,
  "ai-inference": AIInferenceViz,
};

const accessibleLabels: Record<string, string> = {
  calculus: "Derivative Limit Visualizer",
  "linear-algebra": "Embedding Similarity Search",
  "probability-theory": "Probability Distribution Explorer",
  "maximum-likelihood": "Maximum Likelihood Optimization",
  "bayesian-inference": "Bayesian A/B Test Belief Update",
  "statistics-estimation": "Bootstrap Confidence on Model Accuracy",
  "gradient-descent": "Gradient Descent Optimizer Race",
  "linear-regression": "Multivariable Linear Regression Fit",
  "logistic-regression": "Logistic Regression Probability Curve",
  knn: "K-Nearest Neighbors Genre Vote",
  "decision-trees": "Decision Tree Loan Approval",
  "support-vector-machines": "SVM Kernel Trick Lift to 3D",
  "naive-bayes": "Naive Bayes Spam Evidence Tug of War",
  "ensemble-learning": "Ensemble Weak Learners Committee Vote",
  clustering: "K-Means Customer Segmentation",
  "gmm-em": "GMM EM Fit Visualizer",
  "dimensionality-reduction": "Low-Rank Image Reconstruction",
  mcmc: "MCMC Metropolis-Hastings Walker",
  regularization: "Regularization Loss Contours",
  "neural-networks": "Neural Network Decision Boundary",
  cnn: "Convolutional Neural Network Scanner",
  "computer-vision": "Computer Vision Sandbox",
  nlp: "NLP Embeddings Analogy Grid",
  autoencoders: "Autoencoder Bottleneck Compression",
  transformers: "Transformer Self-Attention Layer",
  llms: "LLM Temperature Sampling",
  "reinforcement-learning": "Q-Learning Reinforcement Learning Gridworld",
  "generative-models": "Generative Models Latent Space Walk",
  backpropagation: "Backpropagation Computational Graph Visualizer",
  "sequence-models": "Sequence Models RNN Unrolled Graph Visualizer",
  "embeddings-tokenization": "Tokenization and embedding comparison",
  rag: "RAG Pipeline Flow Diagram",
  "fine-tuning": "LoRA vs Full Fine-Tuning Parameter Update Diagram",
  "llm-evaluation-safety": "LLM Model Scores Bar Chart",
  "ai-inference": "AI inference memory and throughput calculator",
};

const legacyConfigId: Record<string, string> = {
  "decision-trees": "instance-based-trees",
};

export const visualizationRegistry: Record<string, VisualizationRegistryEntry> =
  Object.fromEntries(
    Object.entries(visualizationComponents).map(([moduleId, component]) => {
      const extended = extendedVisualizations[moduleId];
      const config = configs[legacyConfigId[moduleId] ?? moduleId];
      const metadata = extended ?? config;

      if (!metadata) {
        throw new Error(`Missing visualization metadata for "${moduleId}"`);
      }

      return [
        moduleId,
        {
          component,
          title: metadata.title,
          subtitle: metadata.subtitle,
          insight: metadata.insight,
          accessibleLabel: accessibleLabels[moduleId],
          legend: config?.legend,
        },
      ];
    }),
  );

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 338 };
const x = d3.scaleLinear().domain([0, 10]).range([plot.left, plot.right]);
const y = d3.scaleLinear().domain([0, 10]).range([plot.bottom, plot.top]);

const basePoints = [
  { x: 1.2, y: 2.1, label: 0 },
  { x: 2.1, y: 3.4, label: 0 },
  { x: 3.5, y: 5.3, label: 0 },
  { x: 4.3, y: 4.5, label: 0 },
  { x: 5.8, y: 6.2, label: 1 },
  { x: 6.6, y: 5.7, label: 1 },
  { x: 7.7, y: 7.2, label: 1 },
  { x: 8.8, y: 8.1, label: 1 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Axis({ labelX = "x", labelY = "y" }: { labelX?: string; labelY?: string }) {
  const ticks = [0, 2.5, 5, 7.5, 10];
  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
          <line x1={plot.left} x2={plot.right} y1={y(tick)} y2={y(tick)} stroke={COLORS.grid} strokeWidth={1} />
        </g>
      ))}
      <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <text x={plot.right + 16} y={plot.bottom + 4} fill={COLORS.muted} fontSize={14} fontWeight={700}>{labelX}</text>
      <text x={plot.left - 20} y={plot.top - 8} fill={COLORS.muted} fontSize={14} fontWeight={700}>{labelY}</text>
    </g>
  );
}

function PointMark({ px, py, color, r = 6, label }: { px: number; py: number; color: string; r?: number; label?: string }) {
  return (
    <g>
      <circle cx={px} cy={py} r={r + 4} fill="none" stroke={color} strokeOpacity={0.25} />
      <circle cx={px} cy={py} r={r} fill={color} stroke={COLORS.bg} strokeWidth={2} />
      {label && <text x={px + 10} y={py - 8} fill={color} fontSize={12} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{label}</text>}
    </g>
  );
}

function Vector({ x1, y1, x2, y2, color, label }: { x1: number; y1: number; x2: number; y2: number; color: string; label?: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 10;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path
        d={`M${x2},${y2} L${x2 - head * Math.cos(angle - 0.45)},${y2 - head * Math.sin(angle - 0.45)} L${x2 - head * Math.cos(angle + 0.45)},${y2 - head * Math.sin(angle + 0.45)} Z`}
        fill={color}
      />
      {label && <text x={x2 + 10} y={y2} fill={color} fontSize={13} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{label}</text>}
    </g>
  );
}

function MiniStat({ x0, y0, label, value }: { x0: number; y0: number; label: string; value: string }) {
  return (
    <g>
      <rect x={x0} y={y0} width={166} height={54} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} />
      <text x={x0 + 14} y={y0 + 21} fill={COLORS.muted} fontSize={11} fontWeight={700}>{label}</text>
      <text x={x0 + 14} y={y0 + 41} fill={COLORS.pink} fontSize={17} fontWeight={800}>{value}</text>
    </g>
  );
}

function StageIndicator({ stages, currentStage, startX = 70, y = 372, width = 112 }: { stages: string[]; currentStage: number; startX?: number; y?: number; width?: number }) {
  const totalWidth = stages.length * width + (stages.length - 1) * 16;
  const centeredStartX = 320 - totalWidth / 2; // Center horizontally at W/2 = 320
  const actualStartX = startX !== 70 ? startX : centeredStartX;

  return (
    <g>
      {stages.map((name, i) => (
        <g key={name}>
          <rect x={actualStartX + i * (width + 16)} y={y} width={width} height={26} fill={i === currentStage ? COLORS.yellow : "transparent"} fillOpacity={i === currentStage ? 0.2 : 0} stroke={i === currentStage ? COLORS.yellow : COLORS.border} />
          <text x={actualStartX + i * (width + 16) + width / 2} y={y + 17} textAnchor="middle" fill={i === currentStage ? COLORS.yellow : COLORS.muted} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={2} paintOrder="stroke">{name}</text>
        </g>
      ))}
    </g>
  );
}

function Scene({ kind, control }: { kind: AlgorithmKind; control: number }) {
  const line = d3.line<{ x: number; y: number }>().x((d) => d.x).y((d) => d.y).curve(d3.curveMonotoneX);
  const t = control / 100;
  const curve = d3.range(0, 10.05, 0.16).map((v) => ({ x: x(v), y: y(5 + 2.4 * Math.sin(v * 0.82 - 1.1)) }));
  const density = d3.range(0, 10.05, 0.12).map((v) => ({ x: x(v), y: y(8.5 * Math.exp(-0.5 * ((v - (3.5 + 3 * t)) / 1.2) ** 2)) }));

  if (kind === "calculus") {
    const focus = 5.5; // Fixed focus point
    const h = 4.2 * (1 - t) + 0.001; // Avoid divide by zero
    const sec = focus + h;
    const fy = 5 + 2.4 * Math.sin(focus * 0.82 - 1.1);
    const sy = 5 + 2.4 * Math.sin(sec * 0.82 - 1.1);
    const exactSlope = 2.4 * 0.82 * Math.cos(focus * 0.82 - 1.1);
    const secantSlope = (sy - fy) / h;
    return (
      <>
        <Axis labelY="f(x)" />
        <path d={line(curve) ?? ""} fill="none" stroke={COLORS.cyan} strokeWidth={4} />
        <line x1={x(focus - 2)} y1={y(fy - exactSlope * 2)} x2={x(focus + 2)} y2={y(fy + exactSlope * 2)} stroke={COLORS.pink} strokeWidth={3} />
        <line x1={x(focus - 2)} y1={y(fy - secantSlope * 2)} x2={x(sec + 2)} y2={y(sy + secantSlope * (sec + 2 - focus))} stroke={COLORS.yellow} strokeWidth={3} strokeDasharray="7 6" />
        <PointMark px={x(focus)} py={y(fy)} color={COLORS.pink} />
        <PointMark px={x(sec)} py={y(sy)} color={COLORS.yellow} r={4} />
        <MiniStat x0={440} y0={84} label="secant slope" value={secantSlope.toFixed(2)} />
        <MiniStat x0={440} y0={152} label="tangent slope" value={exactSlope.toFixed(2)} />
      </>
    );
  }

  if (kind === "linear-algebra") {
    const origin = { x: 220, y: 210 };
    const ax = origin.x + 116 * Math.cos(0.8 + t * 1.4);
    const ay = origin.y - 116 * Math.sin(0.8 + t * 1.4);
    const bx = origin.x + 134;
    const by = origin.y - 52;
    const bSquared = (bx - origin.x) ** 2 + (by - origin.y) ** 2;
    const exactDot = ((ax - origin.x) * (bx - origin.x) + (ay - origin.y) * (by - origin.y));
    const proj = exactDot / bSquared;
    return (
      <>
        <Axis labelX="basis 1" labelY="basis 2" />
        <Vector x1={origin.x} y1={origin.y} x2={bx} y2={by} color={COLORS.cyan} label="b" />
        <Vector x1={origin.x} y1={origin.y} x2={ax} y2={ay} color={COLORS.pink} label="a" />
        <line x1={ax} y1={ay} x2={origin.x + (bx - origin.x) * proj} y2={origin.y + (by - origin.y) * proj} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="5 5" />
        <Vector x1={origin.x} y1={origin.y} x2={origin.x + (bx - origin.x) * proj} y2={origin.y + (by - origin.y) * proj} color={COLORS.yellow} />
        <MiniStat x0={440} y0={84} label="dot product (a·b)" value={(exactDot / 100).toFixed(0)} />
        <MiniStat x0={440} y0={152} label="projection scalar" value={proj.toFixed(2)} />
      </>
    );
  }

  if (["probability", "bayes", "mle"].includes(kind)) {
    const bars = [0.1, 0.19, 0.26, 0.21, 0.15, 0.09];
    // Generate pseudo-random deterministic variance based on n
    const n = 20 + t * 1980;
    const varianceScale = 1 / Math.sqrt(Math.max(1, n));
    const samples = bars.map((b, i) => clamp(b + Math.sin((i + 1) * 7.3 * (t + 1) * 11) * 0.8 * varianceScale, 0.03, 0.42));
    
    // MLE logic
    const mlePoints = [2.1, 3.2, 4.3, 5.2, 7.6];
    let logLikelihood = 0;
    if (kind === "mle") {
      mlePoints.forEach((v) => {
        const likelihood = Math.exp(-0.5 * ((v - (3.5 + 3 * t)) / 1.2) ** 2) / (1.2 * Math.sqrt(2 * Math.PI));
        logLikelihood += Math.log(Math.max(0.0001, likelihood));
      });
    }

    return (
      <>
        <Axis labelX={kind === "bayes" ? "theta" : "value"} labelY="mass" />
        {kind === "probability" && bars.map((b, i) => (
          <g key={i}>
            <rect x={x(1 + i * 1.35)} y={y(b * 22)} width={28} height={plot.bottom - y(b * 22)} fill={COLORS.pink} opacity={0.28} />
            <rect x={x(1 + i * 1.35) + 34} y={y(samples[i] * 22)} width={28} height={plot.bottom - y(samples[i] * 22)} fill={COLORS.cyan} opacity={0.75} />
          </g>
        ))}
        
        {kind === "mle" && <path d={line(density) ?? ""} fill="none" stroke={COLORS.pink} strokeWidth={4} />}
        {kind === "mle" && mlePoints.map((v) => {
          const yy = 8.5 * Math.exp(-0.5 * ((v - (3.5 + 3 * t)) / 1.2) ** 2);
          return <g key={v}><line x1={x(v)} x2={x(v)} y1={plot.bottom} y2={y(yy)} stroke={COLORS.yellow} strokeDasharray="4 4" /><PointMark px={x(v)} py={plot.bottom} color={COLORS.cyan} r={5} /></g>;
        })}
        {kind === "mle" && <MiniStat x0={440} y0={84} label="Total Log-Likelihood" value={logLikelihood.toFixed(1)} />}

        {kind === "bayes" && [0, 1, 2].map((idx) => {
          const color = [COLORS.cyan, COLORS.yellow, COLORS.pink][idx];
          // Prior is static (shift=0), Likelihood shifts with t, Posterior is between
          const priorShift = 0;
          const likelihoodShift = -2 + t * 4;
          const shift = idx === 0 ? priorShift : idx === 1 ? likelihoodShift : (priorShift * 1.6 + likelihoodShift * (0.8 + t)) / (2.4 + t);
          const pts = d3.range(0, 10.05, 0.1).map((v) => ({ x: x(v), y: y(7 * Math.exp(-0.5 * ((v - (4.5 + shift)) / (1.6 - idx * 0.25)) ** 2)) }));
          return <path key={idx} d={line(pts) ?? ""} fill="none" stroke={color} strokeWidth={idx === 2 ? 4 : 2.5} strokeDasharray={idx === 0 ? "7 5" : undefined} />;
        })}
        {kind === "bayes" && <MiniStat x0={440} y0={84} label="Observations" value={`${Math.round(2 + t * 8)} successes`} />}
      </>
    );
  }

  if (["linear-regression", "logistic-regression", "knn", "tree", "svm", "ensemble"].includes(kind)) {
    let boundary = 4.5 + t * 2;
    if (kind === "tree") boundary = 5.0;
    const thresholdOffset = (t - 0.5) * 6;
    if (kind === "logistic-regression") boundary = 5 + thresholdOffset * 0.7;

    const query = kind === "knn" ? { x: 5.5, y: 4.5 } : { x: 4.5 + t * 2.4, y: 5.2 - t };
    const k = Math.round(1 + t * 6);
    const nearest = [...basePoints].sort((a, b) => Math.hypot(a.x - query.x, a.y - query.y) - Math.hypot(b.x - query.x, b.y - query.y)).slice(0, k);
    const supportRadius = 5 + (1 - t) * 7;
    const activeExample = basePoints[Math.min(basePoints.length - 1, Math.round(t * (basePoints.length - 1)))];
    
    let sse = 0;
    if (kind === "linear-regression") {
      basePoints.forEach((p) => {
        const predY = 1.2 + t * 2 + (0.62 + t * 0.08) * p.x;
        sse += (p.y - predY) ** 2;
      });
    }

    const class1Count = nearest.filter(p => p.label === 1).length;
    const predClass = class1Count > k / 2 ? "1 (Pink)" : "0 (Cyan)";
    const stumps = [
      { dim: "x", value: 3.2, dir: 1 },
      { dim: "y", value: 5.4, dir: -1 },
      { dim: "x", value: 6.8, dir: 1 },
      { dim: "y", value: 7.2, dir: -1 },
      { dim: "x", value: 4.9, dir: -1 },
    ] as const;
    const stumpCount = Math.round(1 + t * 4);
    return (
      <>
        <Axis labelX="feature 1" labelY="feature 2" />
        {kind === "tree" && <><rect x={plot.left} y={plot.top} width={x(boundary) - plot.left} height={plot.bottom - plot.top} fill={COLORS.cyan} opacity={0.09} /><rect x={x(boundary)} y={plot.top} width={plot.right - x(boundary)} height={plot.bottom - plot.top} fill={COLORS.pink} opacity={0.09} /><line x1={x(boundary)} y1={plot.top} x2={x(boundary)} y2={plot.bottom} stroke={COLORS.yellow} strokeWidth={3} /></>}
        {kind === "svm" && <><path d={`M${x(2)},${y(8)} L${x(8.6)},${y(1.6)}`} stroke={COLORS.pink} strokeWidth={3} /><path d={`M${x(1.4 + t * 0.8)},${y(7.2 + t * 0.8)} L${x(8 + t * 0.8)},${y(0.8 + t * 0.8)} M${x(2.8 - t * 0.8)},${y(9 - t * 0.8)} L${x(9.4 - t * 0.8)},${y(2.6 - t * 0.8)}`} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="7 5" /></>}
        {kind === "ensemble" && <g>
          {d3.range(plot.left, plot.right, 14).map((px) => d3.range(plot.top, plot.bottom, 14).map((py) => {
            const dx = x.invert(px);
            const dy = y.invert(py);
            const vote = stumps.slice(0, stumpCount).reduce((sum, stump) => {
              const feature = stump.dim === "x" ? dx : dy;
              const pred = stump.dir === 1 ? feature > stump.value : feature < stump.value;
              return sum + (pred ? 1 : -1);
            }, 0);
            return <rect key={`${px}-${py}`} x={px} y={py} width={14} height={14} fill={vote >= 0 ? COLORS.pink : COLORS.cyan} opacity={0.08 + Math.abs(vote) * 0.035} />;
          }))}
          {stumps.slice(0, stumpCount).map((stump, i) => <line key={i} x1={stump.dim === "y" ? plot.left : x(stump.value)} x2={stump.dim === "y" ? plot.right : x(stump.value)} y1={stump.dim === "y" ? y(stump.value) : plot.top} y2={stump.dim === "y" ? y(stump.value) : plot.bottom} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="5 5" />)}
        </g>}
        {kind === "logistic-regression" && d3.range(0, 10, 0.5).map((v) => <line key={v} x1={x(v)} x2={x(v)} y1={plot.top} y2={plot.bottom} stroke={v > boundary ? COLORS.pink : COLORS.cyan} strokeOpacity={0.12} />)}
        {kind === "linear-regression" && <path d={`M${x(0.6)},${y(1.2 + t * 2)} L${x(9.5)},${y(7.4 + t)}`} stroke={COLORS.pink} strokeWidth={4} />}
        {kind === "knn" && <circle cx={x(query.x)} cy={y(query.y)} r={46 + t * 48} fill="none" stroke={COLORS.yellow} strokeWidth={3} strokeDasharray="7 5" />}
        {basePoints.map((p) => {
          const predY = 1.2 + t * 2 + (0.62 + t * 0.08) * p.x;
          const isNear = nearest.includes(p);
          const isSupport = Math.abs((p.y + p.x) - 10) < supportRadius / 2.4;
          const res = p.y - predY;
          const size = Math.abs(y(p.y) - y(predY));
          return (
            <g key={`${p.x}-${p.y}`}>
              {kind === "linear-regression" && (
                <g>
                  <rect x={res > 0 ? x(p.x) - size : x(p.x)} y={res > 0 ? y(p.y) : y(predY)} width={size} height={size} fill={COLORS.yellow} opacity={0.2} stroke={COLORS.yellow} />
                  <line x1={x(p.x)} y1={y(p.y)} x2={x(p.x)} y2={y(predY)} stroke={COLORS.yellow} strokeWidth={2} />
                </g>
              )}
              {kind === "knn" && isNear && <line x1={x(query.x)} y1={y(query.y)} x2={x(p.x)} y2={y(p.y)} stroke={COLORS.yellow} strokeWidth={1.5} />}
              <PointMark px={x(p.x)} py={y(p.y)} color={p.label ? COLORS.pink : COLORS.cyan} r={isNear || isSupport ? 8 : 6} />
              {kind === "svm" && isSupport && <circle cx={x(p.x)} cy={y(p.y)} r={13} fill="none" stroke={COLORS.yellow} strokeWidth={2} />}
            </g>
          );
        })}
        {kind === "linear-regression" && <MiniStat x0={440} y0={84} label="Sum of Squared Errors" value={sse.toFixed(1)} />}
        {kind === "knn" && <PointMark px={x(query.x)} py={y(query.y)} color={COLORS.yellow} r={9} />}
        {kind === "knn" && <MiniStat x0={440} y0={84} label="k neighbors" value={k.toString()} />}
        {kind === "knn" && <MiniStat x0={440} y0={152} label="predicted class" value={predClass} />}
        {kind === "logistic-regression" && <path d={line(d3.range(-5, 5.05, 0.12).map((v) => ({ x: 452 + (v + 5) * 15, y: 326 - 240 / (1 + Math.exp(-(v - thresholdOffset) * 1.5)) }))) ?? ""} fill="none" stroke={COLORS.yellow} strokeWidth={4} />}
        {kind === "tree" && <><PointMark px={x(activeExample.x)} py={y(activeExample.y)} color={COLORS.yellow} r={9} /><g transform="translate(452 70)"><TreeDiagram activeRight={activeExample.x > boundary} /></g></>}
      </>
    );
  }

  if (["kmeans", "dimensionality", "mcmc", "generative"].includes(kind)) {
    const c1 = { x: 3 + t, y: 7 - t };
    const c2 = { x: 7 - t, y: 3 + t };
    const cloud = basePoints.concat([{ x: 2.4, y: 6.8, label: 0 }, { x: 8.1, y: 3.6, label: 1 }]);
    const angle = -0.7 + t * 1.8;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const chainLength = Math.round(10 + t * 90);
    return (
      <>
        <Axis labelX={kind === "dimensionality" ? "component 1" : "latent x"} labelY={kind === "dimensionality" ? "component 2" : "latent y"} />
        {kind === "mcmc" && <path d={line(density) ?? ""} fill="none" stroke={COLORS.pink} strokeWidth={4} />}
        {kind === "generative" && <><path d={`M${x(2)},${y(2)} C${x(4)},${y(8)} ${x(6)},${y(1)} ${x(8.5)},${y(7.5)}`} fill="none" stroke={COLORS.yellow} strokeWidth={4} /><PointMark px={x(2 + t * 6.5)} py={y(2 + Math.sin(t * Math.PI) * 4.7 + t * 5.5)} color={COLORS.yellow} label="z" /></>}
        {kind === "dimensionality" && <line x1={x(5 - ux * 4.2)} y1={y(5 - uy * 4.2)} x2={x(5 + ux * 4.2)} y2={y(5 + uy * 4.2)} stroke={COLORS.pink} strokeWidth={4} />}
        {cloud.map((p) => {
          const centeredX = p.x - 5;
          const centeredY = p.y - 5;
          const projection = centeredX * ux + centeredY * uy;
          const onAxisX = kind === "dimensionality" ? 5 + projection * ux : p.x;
          const onAxisY = kind === "dimensionality" ? 5 + projection * uy : p.y;
          return (
            <g key={`${p.x}-${p.y}`}>
              {kind === "kmeans" && <line x1={x(p.x)} y1={y(p.y)} x2={x(p.label ? c2.x : c1.x)} y2={y(p.label ? c2.y : c1.y)} stroke={COLORS.yellow} strokeOpacity={0.5} />}
              {kind === "dimensionality" && <line x1={x(p.x)} y1={y(p.y)} x2={x(onAxisX)} y2={y(onAxisY)} stroke={COLORS.yellow} strokeDasharray="4 4" />}
              <PointMark px={x(p.x)} py={y(p.y)} color={p.label ? COLORS.pink : COLORS.cyan} r={5} />
              {kind === "generative" && <circle cx={x(2 + p.label * 5 + Math.sin(p.x + t * 4) * 0.6)} cy={y(2 + p.label * 5 + Math.cos(p.y + t * 4) * 0.6)} r={5} fill={p.label ? COLORS.pink : COLORS.cyan} opacity={0.45} />}
            </g>
          );
        })}
        {kind === "kmeans" && <><PointMark px={x(c1.x)} py={y(c1.y)} color={COLORS.cyan} r={10} label="C1" /><PointMark px={x(c2.x)} py={y(c2.y)} color={COLORS.pink} r={10} label="C2" /></>}
        {kind === "mcmc" && d3.range(0, chainLength).map((i) => <PointMark key={i} px={x(2 + i * 0.065 + Math.sin(i) * 0.35)} py={y(1.3 + Math.abs(Math.sin(i * 0.7)) * 6)} color={i % 5 === 0 ? COLORS.yellow : COLORS.cyan} r={i % 5 === 0 ? 4 : 5} />)}
        {kind === "dimensionality" && <MiniStat x0={440} y0={80} label="variance captured" value={`${Math.round(42 + Math.abs(Math.cos(angle - 0.65)) * 53)}%`} />}
      </>
    );
  }

  if (["neural-network", "cnn", "vision", "nlp", "autoencoder", "transformer", "llm", "rl"].includes(kind)) {
    return <NeuralScene kind={kind} t={t} />;
  }



  const mode = t < 0.5 ? "L1" : "L2";
  return (
    <>
      <Axis labelX="w1" labelY="w2" />
      {[1, 2, 3, 4].map((r) => <ellipse key={r} cx={x(6.6)} cy={y(6.8)} rx={r * 32} ry={r * 22} fill="none" stroke={COLORS.pink} strokeOpacity={0.24} strokeWidth={2} />)}
      {mode === "L1" ? <path d={`M${x(5)},${y(8.6)} L${x(8.4)},${y(5)} L${x(5)},${y(1.4)} L${x(1.6)},${y(5)} Z`} fill={COLORS.cyan} opacity={0.14} stroke={COLORS.cyan} strokeWidth={3} /> : <circle cx={x(5)} cy={y(5)} r={92} fill={COLORS.cyan} opacity={0.14} stroke={COLORS.cyan} strokeWidth={3} />}
      <PointMark px={x(mode === "L1" ? 5 : 5.7)} py={y(mode === "L1" ? 8.6 : 7.2)} color={COLORS.yellow} label={`${mode} optimum`} />
    </>
  );
}

function TreeDiagram({ activeRight }: { activeRight: boolean }) {
  return (
    <g>
      <rect x={0} y={0} width={140} height={48} fill="rgba(250,248,242,0.9)" stroke={COLORS.border} />
      <rect x={-34} y={86} width={88} height={42} fill="rgba(85,107,74,0.12)" stroke={activeRight ? COLORS.border : COLORS.cyan} strokeWidth={activeRight ? 1 : 3} />
      <rect x={90} y={86} width={88} height={42} fill="rgba(141,81,73,0.12)" stroke={activeRight ? COLORS.pink : COLORS.border} strokeWidth={activeRight ? 3 : 1} />
      <line x1={50} y1={48} x2={10} y2={86} stroke={activeRight ? COLORS.border : COLORS.yellow} strokeWidth={activeRight ? 2 : 4} />
      <line x1={90} y1={48} x2={130} y2={86} stroke={activeRight ? COLORS.yellow : COLORS.border} strokeWidth={activeRight ? 4 : 2} />
      <text x={18} y={28} fill={COLORS.muted} fontSize={12} fontWeight={800} stroke="rgba(250,248,242,0.9)" strokeWidth={3} paintOrder="stroke">x &lt; split?</text>
      <text x={-12} y={112} fill={COLORS.cyan} fontSize={12} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">leaf A</text>
      <text x={112} y={112} fill={COLORS.pink} fontSize={12} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">leaf B</text>
    </g>
  );
}

function NeuralScene({ kind, t }: { kind: AlgorithmKind; t: number }) {
  if (kind === "neural-network") {
    const stageIndex = t < 0.25 ? 0 : t < 0.52 ? 1 : t < 0.76 ? 2 : 3;
    const stageNames = ["1. input features", "2. hidden activations", "3. prediction loss", "4. backprop update"];
    const sample = [
      { label: "x1", value: 0.82 },
      { label: "x2", value: 0.34 },
      { label: "bias", value: 1 },
    ];
    const hidden = [
      { y: 112, z: 0.92, a: 0.72, label: "h1" },
      { y: 188, z: -0.38, a: 0.41, label: "h2" },
      { y: 264, z: 0.21, a: 0.55, label: "h3" },
    ];
    const inputY = [112, 188, 264];
    const output = 0.68 + Math.sin(t * Math.PI * 1.15) * 0.08;
    const target = 1;
    const loss = (target - output) ** 2;
    const layerX = { input: 108, hidden: 286, output: 474 };
    const active = (index: number) => stageIndex >= index;
    const forwardOpacity = active(1) ? 0.72 : 0.18;
    const gradientOpacity = active(3) ? 0.75 : 0.12;
    const nodeFill = (on: boolean, color: string) => (on ? color : COLORS.bg);
    const nodeOpacity = (on: boolean) => (on ? 0.9 : 0.22);
    const weight = (i: number, h: number) => 0.8 + ((i + h) % 3) * 0.45;

    return (
      <g>
        <rect x={54} y={54} width={532} height={302} fill="rgba(250,248,242,0.68)" stroke={COLORS.border} />
        <StageIndicator stages={stageNames} currentStage={stageIndex} />

        <text x={layerX.input} y={82} textAnchor="middle" fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">features</text>
        <text x={layerX.hidden} y={82} textAnchor="middle" fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">weighted sum + ReLU</text>
        <text x={layerX.output} y={82} textAnchor="middle" fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">prediction</text>

        {inputY.map((iy, i) => hidden.map((h, hIndex) => (
          <line
            key={`forward-${i}-${h.label}`}
            x1={layerX.input + 18}
            y1={iy}
            x2={layerX.hidden - 20}
            y2={h.y}
            stroke={COLORS.cyan}
            strokeWidth={weight(i, hIndex)}
            strokeOpacity={forwardOpacity}
          />
        )))}
        {hidden.map((h) => (
          <line
            key={`hidden-out-${h.label}`}
            x1={layerX.hidden + 20}
            y1={h.y}
            x2={layerX.output - 22}
            y2={188}
            stroke={COLORS.cyan}
            strokeWidth={1.8 + h.a * 2.6}
            strokeOpacity={active(2) ? 0.78 : 0.2}
          />
        ))}
        {hidden.map((h) => (
          <line
            key={`grad-${h.label}`}
            x1={layerX.output - 26}
            y1={188}
            x2={layerX.hidden + 24}
            y2={h.y}
            stroke={COLORS.pink}
            strokeWidth={2.4}
            strokeOpacity={gradientOpacity}
            strokeDasharray="7 5"
          />
        ))}

        {sample.map((feature, i) => (
          <g key={feature.label}>
            <circle
              cx={layerX.input}
              cy={inputY[i]}
              r={18}
              fill={nodeFill(active(0), COLORS.cyan)}
              fillOpacity={nodeOpacity(active(0))}
              stroke={active(0) ? COLORS.cyan : COLORS.border}
              strokeWidth={2}
            />
            <text x={layerX.input} y={inputY[i] + 4} textAnchor="middle" fill={active(0) ? COLORS.bg : COLORS.muted} fontSize={12} fontWeight={900}>
              {feature.label}
            </text>
            <rect x={layerX.input - 40} y={inputY[i] + 26} width={80} height={8} fill={COLORS.bg} stroke={COLORS.border} />
            <rect x={layerX.input - 40} y={inputY[i] + 26} width={80 * feature.value} height={8} fill={COLORS.cyan} fillOpacity={0.55} />
            <text x={layerX.input} y={inputY[i] + 45} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{feature.value.toFixed(2)}</text>
          </g>
        ))}

        {hidden.map((unit) => (
          <g key={unit.label}>
            <circle
              cx={layerX.hidden}
              cy={unit.y}
              r={22}
              fill={nodeFill(active(1), unit.a > 0.58 ? COLORS.yellow : COLORS.pink)}
              fillOpacity={nodeOpacity(active(1))}
              stroke={active(1) ? COLORS.yellow : COLORS.border}
              strokeWidth={2.5}
            />
            <text x={layerX.hidden} y={unit.y + 4} textAnchor="middle" fill={active(1) ? COLORS.bg : COLORS.muted} fontSize={12} fontWeight={900}>
              {unit.label}
            </text>
            <text x={layerX.hidden} y={unit.y + 45} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
              z={unit.z.toFixed(2)}
            </text>
            <rect x={layerX.hidden - 39} y={unit.y + 26} width={78} height={8} fill={COLORS.bg} stroke={COLORS.border} />
            <rect x={layerX.hidden - 39} y={unit.y + 26} width={78 * unit.a} height={8} fill={COLORS.yellow} fillOpacity={0.65} />
          </g>
        ))}

        <g>
          <circle
            cx={layerX.output}
            cy={188}
            r={29}
            fill={nodeFill(active(2), COLORS.yellow)}
            fillOpacity={nodeOpacity(active(2))}
            stroke={active(2) ? COLORS.yellow : COLORS.border}
            strokeWidth={3}
          />
          <text x={layerX.output} y={184} textAnchor="middle" fill={active(2) ? COLORS.bg : COLORS.muted} fontSize={12} fontWeight={900}>yhat</text>
          <text x={layerX.output} y={200} textAnchor="middle" fill={active(2) ? COLORS.bg : COLORS.muted} fontSize={11} fontWeight={800}>{output.toFixed(2)}</text>
          <line x1={layerX.output} x2={layerX.output + 70} y1={188} y2={188} stroke={COLORS.yellow} strokeWidth={3} strokeOpacity={active(2) ? 0.7 : 0.2} />
          <rect x={layerX.output + 80} y={142} width={74} height={92} fill="rgba(141,81,73,0.08)" stroke={COLORS.border} />
          <text x={layerX.output + 117} y={164} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>target</text>
          <text x={layerX.output + 117} y={190} textAnchor="middle" fill={COLORS.pink} fontSize={24} fontWeight={900}>{target}</text>
          <text x={layerX.output + 117} y={216} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>loss {loss.toFixed(2)}</text>
        </g>

        <g opacity={active(3) ? 1 : 0.28}>
          <path d="M470 268 C400 320 270 320 166 286" fill="none" stroke={COLORS.pink} strokeWidth={3} strokeDasharray="8 6" />
          <path d="M166 286 L181 284 L173 298 Z" fill={COLORS.pink} />
          <text x={326} y={334} textAnchor="middle" fill={COLORS.pink} fontSize={12} fontWeight={900} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
            gradient tells each weight how to change
          </text>
        </g>
      </g>
    );
  }

  if (kind === "cnn" || kind === "vision") {
    const n = kind === "cnn" ? 6 : 8;
    const size = 24;
    const start = { x: 80, y: 92 };
    const kx = start.x + Math.floor(t * (n - 3)) * size;
    const ky = start.y + Math.floor((1 - t) * (n - 3)) * size;
    const kernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const calcValue = (Math.sin(t * 10) * 4 + 2).toFixed(1);
    
    return (
      <g>
        {d3.range(n).map((r) => d3.range(n).map((c) => <rect key={`${r}-${c}`} x={start.x + c * size} y={start.y + r * size} width={size} height={size} fill={(r + c + (kind === "vision" ? 2 : 0)) % 3 === 0 ? COLORS.cyan : COLORS.bg} fillOpacity={(r + c) % 3 === 0 ? 0.55 : 1} stroke={COLORS.border} strokeWidth={0.8} />))}
        <rect x={kx} y={ky} width={size * 3} height={size * 3} fill="none" stroke={COLORS.yellow} strokeWidth={4} />
        
        {/* Kernel Overlay */}
        <g transform={`translate(${kx}, ${ky})`}>
          {d3.range(3).map((r) => d3.range(3).map((c) => (
            <text key={`k-${r}-${c}`} x={c * size + size / 2} y={r * size + size / 2 + 4} textAnchor="middle" fill={COLORS.yellow} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
              {kernel[r][c]}
            </text>
          )))}
        </g>

        <Vector x1={kx + size * 1.5} y1={ky + size * 1.5} x2={410} y2={178} color={COLORS.yellow} />
        
        <text x={(kx + size * 1.5 + 410) / 2} y={ky + size * 1.5 - 10} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
          Σ(px × w) = {calcValue}
        </text>

        {d3.range(4).map((r) => d3.range(4).map((c) => <rect key={`${r}-${c}`} x={430 + c * 30} y={122 + r * 30} width={30} height={30} fill={(r + c + Math.round(t * 4)) % 2 ? COLORS.pink : COLORS.bg} fillOpacity={0.5} stroke={COLORS.border} />))}
        <text x={112} y={72} fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{kind === "cnn" ? "input grid" : "raw pixels"}</text>
        <text x={430} y={104} fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{kind === "cnn" ? "feature map" : "edge response"}</text>

        <MiniStat x0={430} y0={265} label="active filter" value="vertical edge" />
      </g>
    );
  }

  if (kind === "nlp") {
    const tokens = [{ w: "king", a: 2, b: 8 }, { w: "queen", a: 7, b: 8 }, { w: "man", a: 2.3, b: 3 }, { w: "woman", a: 7.2, b: 3.2 }, { w: "city", a: 8.3, b: 1.5 }, { w: "royal", a: 4.5, b: 7.2 }];
    const radius = 35 + t * 92;
    
    const target = tokens.find(t => t.w === "royal")!;
    const simTokens = [...tokens].filter(tok => tok.w !== "royal").sort((a, b) => {
      const distA = Math.sqrt((a.a - target.a)**2 + (a.b - target.b)**2);
      const distB = Math.sqrt((b.a - target.a)**2 + (b.b - target.b)**2);
      return distA - distB;
    }).slice(0, 3);

    return (
      <g>
        <Axis labelX="semantic x" labelY="semantic y" />
        <circle cx={x(4.5)} cy={y(7.2)} r={radius} fill="none" stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="6 5" />
        {tokens.map((p) => <PointMark key={p.w} px={x(p.a)} py={y(p.b)} color={p.w === "royal" || p.w === "queen" ? COLORS.pink : COLORS.cyan} label={p.w} />)}
        <Vector x1={x(2.3)} y1={y(3)} x2={x(2)} y2={y(8)} color={COLORS.yellow} />
        <Vector x1={x(7.2)} y1={y(3.2)} x2={x(7)} y2={y(8)} color={COLORS.yellow} />
        
        {/* Similarity Score Table */}
        <rect x={420} y={140} width={180} height={130} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} />
        <text x={434} y={166} fill={COLORS.muted} fontSize={11} fontWeight={800} letterSpacing="0.05em">Cosine Similarity</text>
        <text x={434} y={180} fill={COLORS.cyan} fontSize={10} fontWeight={700}>query: &quot;royal&quot;</text>
        
        {simTokens.map((st, i) => {
          const dist = Math.sqrt((st.a - target.a)**2 + (st.b - target.b)**2);
          const sim = Math.max(0, 1 - dist / 10);
          return (
            <g key={st.w}>
              <text x={434} y={210 + i * 22} fill={COLORS.muted} fontSize={12} fontWeight={700}>&quot;{st.w}&quot;</text>
              <rect x={490} y={202 + i * 22} width={60} height={6} fill={COLORS.bg} stroke={COLORS.border} />
              <rect x={490} y={202 + i * 22} width={60 * sim} height={6} fill={COLORS.pink} />
              <text x={586} y={210 + i * 22} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>{sim.toFixed(2)}</text>
            </g>
          );
        })}

        <MiniStat x0={420} y0={60} label="search radius" value={`${radius.toFixed(1)}`} />
      </g>
    );
  }

  if (kind === "transformer") {
    const toks = ["the", "model", "attends", "to", "context"];
    const q = Math.min(toks.length - 1, Math.floor(t * toks.length));
    
    // Generate soft-max weights for current query token
    const rawWeights = toks.map((_, i) => Math.exp(-Math.abs(q - i) * 1.5));
    const sum = d3.sum(rawWeights);
    const weights = rawWeights.map(w => w / sum);

    return (
      <g>
        {toks.map((tok, i) => <text key={tok} x={86 + i * 98} y={84} fill={i === q ? COLORS.pink : COLORS.muted} fontSize={16} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{tok}</text>)}
        {toks.map((_, i) => {
          const midX = 100 + (q + i) * 49;
          const midY = 180 - Math.abs(q - i) * 14;
          return (
            <g key={`path-${i}`}>
              <path d={`M${100 + q * 98},105 Q${midX},${midY} ${100 + i * 98},105`} fill="none" stroke={i === q ? COLORS.pink : COLORS.yellow} strokeWidth={2 + (i === q ? 3 : 1)} strokeOpacity={0.35 + (i === q ? 0.4 : 0)} />
              <text x={midX} y={midY - 8} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
                {weights[i].toFixed(2)}
              </text>
            </g>
          );
        })}
        {toks.map((_, r) => toks.map((__, c) => <rect key={`${r}-${c}`} x={110 + c * 34} y={214 + r * 34} width={31} height={31} fill={c === q ? COLORS.yellow : COLORS.cyan} opacity={c === q ? 0.75 : 0.12 + ((r + c) % 3) * 0.14} />))}
        
        {/* Softmax Distribution Box */}
        <rect x={110 + toks.length * 34 + 60} y={214} width={140} height={154} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} />
        <text x={124 + toks.length * 34 + 60} y={236} fill={COLORS.muted} fontSize={11} fontWeight={800}>Softmax(Q × K)</text>
        {toks.map((tok, i) => (
          <g key={`dist-${tok}`}>
            <text x={124 + toks.length * 34 + 60} y={264 + i * 22} fill={i === q ? COLORS.pink : COLORS.muted} fontSize={11} fontWeight={700}>{tok}</text>
            <rect x={178 + toks.length * 34 + 60} y={256 + i * 22} width={50} height={6} fill={COLORS.bg} stroke={COLORS.border} />
            <rect x={178 + toks.length * 34 + 60} y={256 + i * 22} width={50 * weights[i]} height={6} fill={i === q ? COLORS.pink : COLORS.yellow} />
          </g>
        ))}
      </g>
    );
  }

  if (kind === "llm") {
    // Show temperature effect on logits
    const temp = 0.5 + t * 2.0; // Temperature ranges from 0.5 to 2.5
    const logits = [4.2, 3.1, 2.5, 1.2, 0.8]; // Raw logits
    const words = ["learning", "models", "data", "reasoning", "systems"];
    
    const expLogits = logits.map(l => Math.exp(l / temp));
    const totalExp = d3.sum(expLogits) ?? 1;
    const probs = expLogits.map(e => e / totalExp);

    return (
      <g>
        <text x={84} y={88} fill={COLORS.cyan} fontSize={18} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">context: machine learning improves</text>
        
        <text x={140} y={126} fill={COLORS.muted} fontSize={10} fontWeight={800} letterSpacing="0.05em">RAW LOGITS</text>
        <text x={260} y={126} fill={COLORS.muted} fontSize={10} fontWeight={800} letterSpacing="0.05em">SOFTMAX PROBABILITIES</text>

        {words.map((w, i) => (
          <g key={w}>
            <text x={118} y={150 + i * 42} textAnchor="end" fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{w}</text>
            
            {/* Logits */}
            <text x={140} y={150 + i * 42} fill={COLORS.cyan} fontSize={12} fontWeight={700}>{logits[i].toFixed(1)}</text>
            
            {/* Arrow */}
            <Vector x1={174} y1={146 + i * 42} x2={240} y2={146 + i * 42} color={COLORS.yellow} />
            <text x={207} y={142 + i * 42} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700}>÷ {temp.toFixed(1)}</text>
            
            {/* Probability Bar */}
            <rect x={260} y={134 + i * 42} width={probs[i] * 240} height={24} fill={i === 0 ? COLORS.pink : COLORS.yellow} opacity={i === 0 ? 0.85 : 0.45} />
            <text x={260 + probs[i] * 240 + 8} y={151 + i * 42} fill={COLORS.muted} fontSize={12} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{(probs[i] * 100).toFixed(1)}%</text>
          </g>
        ))}

        <MiniStat x0={500} y0={60} label="temperature" value={temp.toFixed(2)} />
      </g>
    );
  }

  if (kind === "rl") {
    const s = 52;
    const path = [[0, 4], [1, 4], [2, 3], [3, 2], [4, 1], [4, 0]];
    const step = Math.min(path.length - 1, Math.round(t * (path.length - 1)));
    const [agentC, agentR] = path[step];
    const pathD = path.slice(0, step + 1).map(([c, r], i) => `${i === 0 ? "M" : "L"}${110 + c * s},${94 + r * s}`).join(" ");
    
    // Fake Q-values for cells
    const getQ = (r: number, c: number) => {
      const distToGoal = Math.abs(r - 0) + Math.abs(c - 4);
      return Math.max(0, 10 - distToGoal * 1.5).toFixed(1);
    };

    return (
      <g>
        {d3.range(5).map((r) => d3.range(5).map((c) => (
          <g key={`${r}-${c}`}>
            <rect x={86 + c * s} y={70 + r * s} width={s} height={s} fill={r === 0 && c === 4 ? COLORS.cyan : r === 3 && c === 2 ? COLORS.pink : COLORS.bg} fillOpacity={r === 0 && c === 4 || r === 3 && c === 2 ? 0.35 : 1} stroke={COLORS.border} />
            <text x={86 + c * s + s / 2} y={70 + r * s + s / 2 + 4} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800} opacity={0.6}>{getQ(r, c)}</text>
          </g>
        )))}
        
        <path d={pathD} fill="none" stroke={COLORS.yellow} strokeWidth={4} strokeDasharray="8 5" />
        
        <PointMark px={110 + agentC * s} py={94 + agentR * s} color={COLORS.yellow} label="agent" />
        
        {/* Reward Counter */}
        <MiniStat x0={400} y0={100} label="cumulative reward" value={(step * 1.5).toFixed(1)} />
        <MiniStat x0={400} y0={170} label="current q-value" value={getQ(agentR, agentC)} />
      </g>
    );
  }

  const latentWidth = 16 + t * 72;
  const reconError = Math.round((1 - t) * 74 + 8);
  
  // Reconstructed grid logic to show quality loss
  // Add noise or blur as the bottleneck shrinks
  const opacityOffset = (1 - t) * 0.6; // More bottleneck -> more noise
  
  return (
    <g>
      <Vector x1={110} y1={210} x2={250} y2={210} color={COLORS.cyan} label="encode" />
      <rect x={320 - latentWidth / 2} y={176} width={latentWidth} height={68} fill={COLORS.yellow} opacity={0.24} stroke={COLORS.yellow} strokeWidth={3} />
      <Vector x1={354} y1={210} x2={500} y2={210} color={COLORS.pink} label="decode" />
      
      <text x={90} y={170} fill={COLORS.cyan} fontSize={16} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">input (high res)</text>
      <text x={284} y={216} fill={COLORS.yellow} fontSize={14} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">latent (z)</text>
      <text x={488} y={170} fill={COLORS.pink} fontSize={16} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">reconstruction</text>

      {/* Input Grid (Perfect) */}
      <g transform="translate(60, 220)">
        {d3.range(4).map(r => d3.range(4).map(c => (
          <rect key={`in-${r}-${c}`} x={c*16} y={r*16} width={14} height={14} fill={(r+c)%2===0 ? COLORS.cyan : COLORS.bg} stroke={COLORS.border} />
        )))}
      </g>
      
      {/* Reconstruction Grid (Degraded based on t) */}
      <g transform="translate(456, 220)">
        {d3.range(4).map(r => d3.range(4).map(c => {
          const isTarget = (r+c)%2===0;
          // Randomly invert colors based on error rate
          const corrupted = Math.sin(r * 13 + c * 7) * 0.5 + 0.5 < opacityOffset;
          const fill = isTarget !== corrupted ? COLORS.pink : COLORS.bg;
          return <rect key={`out-${r}-${c}`} x={c*16} y={r*16} width={14} height={14} fill={fill} opacity={1 - opacityOffset * 0.5} stroke={COLORS.border} />;
        }))}
      </g>

      <MiniStat x0={440} y0={60} label="compression" value={`${(t * 100).toFixed(0)}% info`} />
      <MiniStat x0={440} y0={290} label="reconstruction error" value={`${reconError}%`} />
    </g>
  );
}

export default function D3Visualization({ algorithmId }: { algorithmId: string }) {
  const entry = visualizationRegistry[algorithmId];

  if (!entry) {
    return (
      <div
        role="alert"
        className="border border-error bg-error/5 p-6 text-on-surface"
        data-testid="visualization-error"
      >
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-error">
          Visualization unavailable
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          No interactive diagram is registered for module{" "}
          <code className="font-mono text-on-surface">{algorithmId}</code>.
        </p>
      </div>
    );
  }

  const Visualization = entry.component;

  return (
    <VisualizationShell
      title={entry.title}
      subtitle={entry.subtitle}
      insight={entry.insight}
      legend={entry.legend}
    >
      <Visualization />
    </VisualizationShell>
  );
}
