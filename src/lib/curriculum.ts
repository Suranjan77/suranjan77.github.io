import type { Algorithm, AlgorithmCategory } from "@/data/algorithms";

export type CurriculumFilter = "all" | "classical" | "deep-learning";

export interface CurriculumTrack {
  name: string;
  ids: string[];
}

export const curriculumTabs: Array<{ id: CurriculumFilter; label: string }> = [
  { id: "all", label: "All Topics" },
  { id: "classical", label: "Classical ML" },
  { id: "deep-learning", label: "Deep Learning & AI" },
];

export const curriculumTracks: CurriculumTrack[] = [
  {
    name: "Classical ML",
    ids: [
      "applied-ml-workflow",
      "linear-regression",
      "logistic-regression",
      "regularization",
      "knn",
      "naive-bayes",
      "support-vector-machines",
      "decision-trees",
      "ensemble-learning",
      "clustering",
      "gmm-em",
      "dimensionality-reduction",
      "mcmc",
    ],
  },
  {
    name: "Deep Learning & AI",
    ids: [
      "neural-networks",
      "backpropagation",
      "cnn",
      "computer-vision",
      "embeddings-tokenization",
      "sequence-models",
      "nlp",
      "autoencoders",
      "generative-models",
      "transformers",
      "llms",
      "fine-tuning",
      "rag",
      "llm-evaluation-safety",
      "ai-inference",
      "reinforcement-learning",
    ],
  },
];

const deepLearningCategories: AlgorithmCategory[] = [
  "Neural Networks / Deep Learning",
  "Convolutional Neural Networks",
  "Computer Vision",
  "Natural Language Processing",
  "Autoencoders",
  "Transformers",
  "Large Language Models",
  "Reinforcement Learning",
  "Generative Models",
];

export function filterAlgorithms(
  algorithms: Algorithm[],
  selectedFilter: CurriculumFilter,
) {
  if (selectedFilter === "all") {
    return algorithms;
  }

  return algorithms.filter((algorithm) => {
    const isDeepLearning = deepLearningCategories.includes(algorithm.category);

    if (selectedFilter === "deep-learning") {
      return isDeepLearning;
    }

    return !isDeepLearning;
  });
}
