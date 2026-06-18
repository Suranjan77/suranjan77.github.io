import { algorithms, type Algorithm, type AlgorithmCategory } from "@/data/algorithms";

export type AccentColor = "primary" | "secondary" | "tertiary";

const categoryConfig: Record<
  AlgorithmCategory,
  {
    color: AccentColor;
    route: string;
    label: string;
    description: string;
  }
> = {
  "Calculus": {
    color: "primary",
    route: "/algorithms/calculus",
    label: "Calculus",
    description: "The mathematical study of continuous change, providing the foundation for optimization algorithms.",
  },
  "Linear Algebra": {
    color: "secondary",
    route: "/algorithms/linear-algebra",
    label: "Linear Algebra",
    description: "The mathematics of vectors and matrices, essential for managing multi-dimensional data.",
  },
  "Probability Theory": {
    color: "tertiary",
    route: "/algorithms/probability-theory",
    label: "Probability Theory",
    description: "The framework for modeling uncertainty, noise, and likelihood in data.",
  },
  "Maximum Likelihood": {
    color: "primary",
    route: "/algorithms/maximum-likelihood",
    label: "Maximum Likelihood",
    description: "Estimate model parameters by choosing the values that make the observed data most likely.",
  },
  "Bayesian Inference": {
    color: "secondary",
    route: "/algorithms/bayesian-inference",
    label: "Bayesian Inference",
    description: "Formally update probabilistic beliefs continuously as empirical new evidence logically becomes statistically available.",
  },
  "Linear Regression": {
    color: "tertiary",
    route: "/algorithms/linear-regression",
    label: "Linear Regression",
    description: "Predict continuous specific values or distinct probabilities reliably using exact distinct linear explicit feature combinations.",
  },
  "Logistic Regression": {
    color: "tertiary",
    route: "/algorithms/logistic-regression",
    label: "Logistic Regression",
    description: "Predict binary category probabilities using a linear boundary feeding into a sigmoid function.",
  },
  "K-Nearest Neighbors": {
    color: "primary",
    route: "/algorithms/knn",
    label: "K-Nearest Neighbors",
    description: "Predict from nearby examples using proximity-based distance metrics.",
  },
  "Decision Trees": {
    color: "primary",
    route: "/algorithms/decision-trees",
    label: "Decision Trees",
    description: "Predict from interpretable rule paths through a decision tree flowchart.",
  },
  "Clustering": {
    color: "secondary",
    route: "/algorithms/clustering",
    label: "Clustering Methods",
    description: "Find hidden groups in unlabeled data using distances, centroids, or probabilistic assignments.",
  },
  "Support Vector Machines": {
    color: "tertiary",
    route: "/algorithms/support-vector-machines",
    label: "Support Vector Machines",
    description: "Find high-margin classification boundaries, with kernels for nonlinear feature spaces.",
  },
  "Ensemble Learning": {
    color: "primary",
    route: "/algorithms/ensemble-learning",
    label: "Ensemble Learning",
    description: "Combine many weak or diverse models into a stronger predictor.",
  },
  "Dimensionality Reduction": {
    color: "secondary",
    route: "/algorithms/dimensionality-reduction",
    label: "Dimensionality Reduction",
    description: "Compress high-dimensional features while preserving the structure that matters most.",
  },
  "Markov Chain Monte Carlo": {
    color: "tertiary",
    route: "/algorithms/mcmc",
    label: "Markov Chain Monte Carlo",
    description: "Approximate difficult probability distributions by drawing dependent random samples.",
  },
  "Neural Networks / Deep Learning": {
    color: "primary",
    route: "/algorithms/neural-networks",
    label: "Deep Learning Architectures",
    description: "Build adaptive computational deep graphs capable of multi-layered hierarchical representation learning.",
  },
  "Convolutional Neural Networks": {
    color: "secondary",
    route: "/algorithms/cnn",
    label: "Convolutional Networks (CNN)",
    description: "Build translation-invariant, feature-extracting convolutional grid pipelines for visual applications.",
  },
  "Computer Vision": {
    color: "tertiary",
    route: "/algorithms/computer-vision",
    label: "Computer Vision",
    description: "Detect, localize, segment, and understand physical shapes and visual scenes from raw pixel matrices.",
  },
  "Natural Language Processing": {
    color: "primary",
    route: "/algorithms/nlp",
    label: "Natural Language Processing",
    description: "Encode human text into dense vector spaces to translate, analyze, and generate languages.",
  },
  "Autoencoders": {
    color: "secondary",
    route: "/algorithms/autoencoders",
    label: "Autoencoders",
    description: "Self-supervised reconstruction networks designed to compress data and capture low-dimensional feature manifolds.",
  },
  "Transformers": {
    color: "tertiary",
    route: "/algorithms/transformers",
    label: "Transformers",
    description: "Harness self-attention mechanisms to dynamically capture context and parallelize deep sequence processing.",
  },
  "Large Language Models": {
    color: "primary",
    route: "/algorithms/llms",
    label: "Large Language Models",
    description: "Scale autoregressive transformers on massive web data to emerge with coding and logic abilities.",
  },
  "Reinforcement Learning": {
    color: "secondary",
    route: "/algorithms/reinforcement-learning",
    label: "Reinforcement Learning",
    description: "Train autonomous agents to make sequences of decisions to maximize cumulative rewards in dynamic environments.",
  },
  "Machine Learning Concepts": {
    color: "tertiary",
    route: "/algorithms/applied-ml-workflow",
    label: "ML Concepts & Workflow",
    description: "End-to-end data preparation, model selection, evaluation, and handling anomalies.",
  },
  "Generative Models": {
    color: "primary",
    route: "/algorithms/generative-models",
    label: "Generative Models",
    description: "Train models to create realistic, high-dimensional data samples by learning underlying probability distributions.",
  },
  "Regularization": {
    color: "secondary",
    route: "/algorithms/regularization",
    label: "L1 & L2 Regularization",
    description: "Enforce geometric constraints on parameter space to prevent overfitting and encourage sparse features.",
  },

  "Statistics and Estimation": {
    color: "primary",
    route: "/algorithms/statistics-estimation",
    label: "Statistics and Estimation",
    description: "Calculate uncertainty and draw robust estimates from data samples using statistical techniques like bootstrapping.",
  },
  "Gradient Descent and Optimization": {
    color: "secondary",
    route: "/algorithms/gradient-descent",
    label: "Gradient Descent and Optimization",
    description: "Train models by wiggling weights in the direction of steepest loss descent using gradient updates.",
  },

  "Naive Bayes": {
    color: "primary",
    route: "/algorithms/naive-bayes",
    label: "Naive Bayes",
    description: "Probabilistic classification model based on Bayes' Theorem with a naive independence assumption.",
  },

  "Gaussian Mixtures and EM": {
    color: "tertiary",
    route: "/algorithms/gmm-em",
    label: "GMM & EM",
    description: "Soft probabilistic clustering using mixture models fit with the Expectation-Maximization algorithm.",
  },

  "Backpropagation": {
    color: "secondary",
    route: "/algorithms/backpropagation",
    label: "Backpropagation",
    description: "Learn how deep networks update parameters by passing error gradients backward through computational graphs.",
  },
  "Sequence Models": {
    color: "tertiary",
    route: "/algorithms/sequence-models",
    label: "Sequence Models",
    description: "Process sequential inputs like text or time-series data using RNNs, LSTMs, and GRUs.",
  },
  "Embeddings and Tokenization": {
    color: "primary",
    route: "/algorithms/embeddings-tokenization",
    label: "Embeddings & Tokenization",
    description: "Convert raw text into tokens and map them to dense vector spaces preserving semantic relationships.",
  },
  "Retrieval-Augmented Generation": {
    color: "secondary",
    route: "/algorithms/rag",
    label: "RAG Systems",
    description: "Enhance large language models by retrieving relevant external facts before generating answers.",
  },
  "Fine-Tuning and Preference Optimization": {
    color: "tertiary",
    route: "/algorithms/fine-tuning",
    label: "Fine-Tuning & RLHF",
    description: "Adapt pre-trained models to specific domains or align them with human values using preference learning.",
  },
  "LLM Evaluation and Safety": {
    color: "primary",
    route: "/algorithms/llm-evaluation-safety",
    label: "LLM Eval & Safety",
    description: "Measure language model performance, reliability, and safety using benchmarks and safety guardrails.",
  },
  "AI Inference Systems": {
    color: "secondary",
    route: "/algorithms/ai-inference",
    label: "AI Inference Systems",
    description: "Optimize execution of deep models with quantization, batching, and KV cache serving techniques.",
  },
};

const algorithmIcons: Record<string, string> = {
  "calculus": "show_chart",
  "linear-algebra": "grid_on",
  "probability-theory": "casino",
  "maximum-likelihood": "functions",
  "bayesian-inference": "schema",
  "linear-regression": "show_chart",
  "instance-based-trees": "account_tree",
  "clustering": "bubble_chart",
  "support-vector-machines": "shield",
  "ensemble-learning": "forest",
  "dimensionality-reduction": "scatter_plot",
  "mcmc": "sync",
  "neural-networks": "hub",
  "cnn": "layers",
  "computer-vision": "visibility",
  "nlp": "translate",
  "autoencoders": "compress",
  "transformers": "psychology",
  "llms": "forum",
  "reinforcement-learning": "smart_toy",
  "applied-ml-workflow": "query_stats",
  "generative-models": "auto_awesome",
  "regularization": "align_horizontal_center",
  "statistics-estimation": "analytics",
  "gradient-descent": "trending_down",
  "naive-bayes": "calculate",
  "gmm-em": "lens",
  "backpropagation": "alt_route",
  "sequence-models": "repeat",
  "embeddings-tokenization": "pattern",
  "rag": "find_in_page",
  "fine-tuning": "tune",
  "llm-evaluation-safety": "gavel",
  "ai-inference": "memory",
};

export function getAlgorithmBySlug(slug: string): Algorithm | undefined {
  return algorithms.find((algorithm) => algorithm.id === slug);
}

export function getCategoryColor(category: AlgorithmCategory): AccentColor {
  return categoryConfig[category].color;
}

export function getCategoryRoute(category: AlgorithmCategory): string {
  return categoryConfig[category].route;
}

export function getCategoryLabel(category: AlgorithmCategory): string {
  return categoryConfig[category].label;
}

export function getCategoryDescription(category: AlgorithmCategory): string {
  return categoryConfig[category].description;
}

export function getAlgorithmIcon(id: string): string {
  return algorithmIcons[id] ?? "data_object";
}

export function getAlgorithmRoute(id: string): string {
  return `/algorithms/${id}`;
}

export function getFormulaPreview(mathematics: string): string {
  const normalized = mathematics.replace(/\r\n/g, "\n");
  const blockMatch = normalized.match(/\$\$([\s\S]*?)\$\$/);

  if (blockMatch?.[1]) {
    return blockMatch[1].replace(/\s+/g, " ").trim();
  }

  const inlineMatch = normalized.match(/\$([^$\n]+)\$/);
  if (inlineMatch?.[1]) {
    return inlineMatch[1].replace(/\s+/g, " ").trim();
  }

  return "f(x) = ...";
}

export function formatLogicContent(content: string): string {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(-\s|\d+\.\s)/g, "$1\n\n$2")
    .replace(/([^\n])\n(\$\$)/g, "$1\n\n$2")
    .replace(/(\$\$)\n([^\n])/g, "$1\n\n$2")
    .trim();
}

export function getAccentClasses(color: AccentColor) {
  if (color === "secondary") {
    return {
      badge: "border border-secondary/30 bg-secondary/10 text-secondary",
      glow: "bg-secondary/5",
      surface: "bg-surface-container",
      icon: "bg-secondary/15 text-secondary border-secondary/20",
      subtleText: "text-secondary/80",
      border: "border-secondary/20",
    };
  }

  if (color === "tertiary") {
    return {
      badge: "border border-tertiary/40 bg-tertiary/10 text-on-surface",
      glow: "bg-tertiary/5",
      surface: "bg-surface-container",
      icon: "bg-tertiary/15 text-tertiary border-tertiary/20",
      subtleText: "text-tertiary/80",
      border: "border-tertiary/20",
    };
  }

  return {
    badge: "border border-primary/30 bg-primary/10 text-primary",
    glow: "bg-primary/5",
    surface: "bg-surface-container",
    icon: "bg-primary/15 text-primary border-primary/20",
    subtleText: "text-primary/80",
    border: "border-primary/20",
  };
}
