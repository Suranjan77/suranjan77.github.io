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
    description: "Build incredibly highly parameterized incredibly adaptive computational exact logical algorithmic dynamic deep graphs explicitly highly capable of massive multi-layered representation learning.",
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
      badge: "bg-secondary/10 border-secondary/20 text-secondary",
      glow: "bg-secondary/5",
      surface: "from-secondary/20 to-surface-container",
      icon: "bg-secondary/15 text-secondary border-secondary/20",
      subtleText: "text-secondary/80",
      border: "border-secondary/20",
    };
  }

  if (color === "tertiary") {
    return {
      badge: "bg-tertiary/10 border-tertiary/20 text-tertiary",
      glow: "bg-tertiary/5",
      surface: "from-tertiary/20 to-surface-container",
      icon: "bg-tertiary/15 text-tertiary border-tertiary/20",
      subtleText: "text-tertiary/80",
      border: "border-tertiary/20",
    };
  }

  return {
    badge: "bg-primary/10 border-primary/20 text-primary",
    glow: "bg-primary/5",
    surface: "from-primary/20 to-surface-container",
    icon: "bg-primary/15 text-primary border-primary/20",
    subtleText: "text-primary/80",
    border: "border-primary/20",
  };
}
