import { LearningModule } from "./types";

export const svm: LearningModule = {
  id: "support-vector-machines",
  title: "Support Vector Machines",
  category: "Support Vector Machines",
  prerequisites: ["linear-algebra", "probability-theory"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["linear-regression", "logistic-regression"],
  shortDescription: "A margin-based classifier that chooses the separating boundary with the largest distance to the nearest training points.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain the concept of margins and why SVM maximizes the margin',
    'Distinguish between hard-margin and soft-margin SVM formulations',
    'Explain the role of support vectors in defining the decision boundary',
    'Describe the Kernel Trick and compute the Radial Basis Function (RBF) kernel',
  ],
  keyTerms: [
    { term: 'Support Vector', definition: 'The data points closest to the decision boundary that influence its position and orientation.' },
    { term: 'Margin', definition: 'The distance between the decision boundary and the closest training data points.' },
    { term: 'Kernel Trick', definition: 'A method that projects data into a higher-dimensional space to make it linearly separable, without explicitly calculating the new coordinates.' },
  ],
  workedExamples: [
    {
      title: 'RBF Kernel Similarity',
      problem: 'Calculate the RBF kernel value $K(x_1, x_2)$ for $x_1 = (1, 2)$, $x_2 = (2, 2)$ with $\\gamma = 0.5$.',
      solution: 'Squared Euclidean distance is $\\|x_1 - x_2\\|^2 = (1-2)^2 + (2-2)^2 = 1 + 0 = 1$. RBF kernel value $K(x_1, x_2) = \\exp(-\\gamma \\|x_1 - x_2\\|^2) = \\exp(-0.5 \\times 1) = e^{-0.5} \\approx 0.607$.',
    },
  ],
  misconceptions: [
    {
      claim: 'SVMs only work for binary classification.',
      correction: 'SVMs can be extended to multi-class classification using One-vs-One (OvO) or One-vs-Rest (OvR) strategies.'
    },
    {
      claim: 'Adding more features will always make SVM slower to evaluate.',
      correction: 'Thanks to the Kernel Trick, the evaluation time depends on the number of support vectors rather than the dimensionality of the high-dimensional space.'
    }
  ],
  references: [
    {
      title: "A Training Algorithm for Optimal Margin Classifiers",
      authors: "Boser, B.E., Guyon, I.M. and Vapnik, V.N",
      url: "https://dl.acm.org",
      type: "textbook"
    },
    {
      title: "Understanding Machine Learning: From Theory to Algorithms",
      authors: "Shalev-Shwartz, S. and Ben-David, S",
      url: "https://www.cambridge.org",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Sensitivity to Hyperparameters (C and Gamma)',
      description: 'If $C$ is too large, the margin becomes narrow and overfits. If $\\gamma$ is too large, the kernel acts like individual indicators and fails to generalize.',
      mitigation: 'Use grid search with cross-validation to tune $C$ and $\\gamma$.'
    }
  ],

  fullDescription: `
Support Vector Machines (SVMs) are margin-based classifiers. If many separating lines classify the training data correctly, an SVM chooses the one with the largest margin: the greatest distance to the closest training examples.

Those closest examples are the support vectors. They matter because moving them changes the boundary, while points far from the margin often have no effect on the fitted classifier.

### Where is it used?
SVMs are useful when the dataset is medium-sized and the feature representation is strong. They are historically common in text classification, handwritten digit recognition, and biological classification tasks.
  `,

  intuition: `
The intuition is geometric. A boundary that barely separates the training data is fragile: a small measurement error can flip the prediction. A wider margin is more stable because new points can move slightly without crossing the boundary.

When a straight boundary is not enough, kernels let the SVM compute dot products in a richer feature space without explicitly constructing every transformed feature. In the original input space, that can produce curved decision boundaries.
  `,

  mathematics: `
### 1. The Margin
For separable data, the hard-margin SVM solves:

$$ y_i (w^T x_i + b) \\ge 1 \\quad \\forall i $$

### 2. The Kernel Trick
Real data is rarely perfectly separable, so practical SVMs use slack variables and a penalty parameter $C$ to trade off margin width against classification mistakes. Kernels replace inner products $x_i^T x_j$ with a function $K(x_i, x_j)$:

The most popular kernel is the Radial Basis Function (RBF), which measures the distance between two points $x_i$ and $x_j$ and creates smooth, curved boundaries:

$$ K(x_i, x_j) = \\exp(-\\gamma \\|x_i - x_j\\|^2) $$
  `,

  pros: [
    "The convex training objective has a global optimum, which makes the optimization behavior easier to reason about than many neural models.",
    "Kernels allow nonlinear decision boundaries while keeping the optimization problem in terms of pairwise similarities.",
    "It is highly effective even when you have more features (columns) than actual data points (rows)."
  ],

  cons: [
    "Kernel SVMs can be slow and memory-heavy on very large datasets because they depend on many pairwise similarities.",
    "They do not naturally produce calibrated probabilities without an additional calibration step.",
    "Performance is sensitive to kernel choice, feature scaling, and hyperparameters such as C and gamma."
  ],

  codeSnippet: `import numpy as np
from sklearn.svm import SVC

X = np.array([[1, 2], [2, 3], [1.5, 1.8], [8, 8], [9, 10], [8.5, 9.2]])
y = np.array([0, 0, 0, 1, 1, 1])

clf = SVC(kernel='rbf', C=1.0)
clf.fit(X, y)

print(f"Number of Computed Support Vectors: {clf.n_support_}")`
};
