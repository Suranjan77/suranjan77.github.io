import { Algorithm } from "./types";

export const svm: Algorithm = {
  id: "support-vector-machines",
  title: "Support Vector Machines",
  category: "Support Vector Machines",
  shortDescription: "A margin-based classifier that chooses the separating boundary with the largest distance to the nearest training points.",

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
