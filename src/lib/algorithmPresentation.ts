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
    description: "Learn foundational parameter estimation by directly mathematically maximizing the empirical observed likelihood structure.",
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
  "Instance-based Learning & Decision Trees": {
    color: "primary",
    route: "/algorithms/instance-and-trees",
    label: "Instance-based & Trees",
    description: "Effectively predict precise targets smoothly using robust spatial proximity logic or deeply nested conditional deterministic rules.",
  },
  "Clustering": {
    color: "secondary",
    route: "/algorithms/clustering",
    label: "Clustering Methods",
    description: "Discover deep distinct abstract geometric hidden groups structurally directly residing totally inside dense raw unlabeled datatypes.",
  },
  "Support Vector Machines": {
    color: "tertiary",
    route: "/algorithms/support-vector-machines",
    label: "Support Vector Machines",
    description: "Find the absolutely most robustly mathematically optimal wide margin geometrical classification separator effectively using robust explicit structural kernels.",
  },
  "Ensemble Learning": {
    color: "primary",
    route: "/algorithms/ensemble-learning",
    label: "Ensemble Learning",
    description: "Combine thousands of rapidly generated weak learning algorithms into one completely unified state-of-the-art predictive model.",
  },
  "Dimensionality Reduction": {
    color: "secondary",
    route: "/algorithms/dimensionality-reduction",
    label: "Dimensionality Reduction",
    description: "Dynamically compress overwhelmingly massive dense feature spaces completely whilst mathematically preserving extreme structural distinct geometric variances.",
  },
  "Markov Chain Monte Carlo": {
    color: "tertiary",
    route: "/algorithms/mcmc",
    label: "Markov Chain Monte Carlo",
    description: "Approximate mathematically analytically intractable profound continuous probability distribution integrals totally successfully completely using structured deeply stochastic advanced random walks.",
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
  "Model Complexity & Bias-Variance": {
    color: "tertiary",
    route: "/algorithms/bias-variance",
    label: "Bias-Variance Tradeoff",
    description: "Navigate model capacity boundaries to balance training fitting precision against generalization validity.",
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
  "Evaluation Metrics": {
    color: "tertiary",
    route: "/algorithms/evaluation-metrics",
    label: "Evaluation Metrics",
    description: "Use classification diagnostics like confusion matrices, precision-recall, and ROC/AUC curves to assess predictive performance.",
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
  "bias-variance": "query_stats",
  "generative-models": "auto_awesome",
  "regularization": "align_horizontal_center",
  "evaluation-metrics": "fact_check",
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
