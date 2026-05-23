import type { Algorithm, AlgorithmCategory } from "@/data/algorithms";

export type CurriculumFilter = "all" | "foundations" | "classical" | "deep-learning";

export interface CurriculumTrack {
  name: string;
  ids: string[];
}

export const curriculumTabs: Array<{ id: CurriculumFilter; label: string }> = [
  { id: "all", label: "All Topics" },
  { id: "foundations", label: "Foundations" },
  { id: "classical", label: "Classical ML" },
  { id: "deep-learning", label: "Deep Learning & AI" },
];

export const curriculumTracks: CurriculumTrack[] = [
  {
    name: "Foundations",
    ids: ["calculus", "linear-algebra", "probability-theory"],
  },
  {
    name: "Classical ML",
    ids: [
      "maximum-likelihood",
      "bayesian-inference",
      "linear-regression",
      "instance-based-trees",
      "clustering",
      "support-vector-machines",
      "ensemble-learning",
      "dimensionality-reduction",
      "mcmc",
    ],
  },
  {
    name: "Deep Learning & AI",
    ids: [
      "neural-networks",
      "cnn",
      "computer-vision",
      "nlp",
      "autoencoders",
      "transformers",
      "llms",
    ],
  },
];

const foundationCategories: AlgorithmCategory[] = [
  "Calculus",
  "Linear Algebra",
  "Probability Theory",
];

const deepLearningCategories: AlgorithmCategory[] = [
  "Neural Networks / Deep Learning",
  "Convolutional Neural Networks",
  "Computer Vision",
  "Natural Language Processing",
  "Autoencoders",
  "Transformers",
  "Large Language Models",
];

export function filterAlgorithms(
  algorithms: Algorithm[],
  selectedFilter: CurriculumFilter,
) {
  if (selectedFilter === "all") {
    return algorithms;
  }

  return algorithms.filter((algorithm) => {
    const isFoundation = foundationCategories.includes(algorithm.category);
    const isDeepLearning = deepLearningCategories.includes(algorithm.category);

    if (selectedFilter === "foundations") {
      return isFoundation;
    }

    if (selectedFilter === "deep-learning") {
      return isDeepLearning;
    }

    return !isFoundation && !isDeepLearning;
  });
}
