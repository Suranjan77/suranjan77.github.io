import { Algorithm } from "./types";

export const svm: Algorithm = {
  id: "support-vector-machines",
  title: "Support Vector Machines",
  category: "Support Vector Machines",
  shortDescription: "Derives an optimal geometric hyperplane that maximises the precise mathematical margin, deploying kernel transformations for profound non-linear separability.",

  fullDescription: `
Support Vector Machines (SVMs) represent exceptionally robust parametric algorithms operating as both linear and non-linear classifiers. They systematically seek the optimal multidimensional hyperplane that not only strictly partitions the defined categorical target classes, but actively and analytically guarantees the absolute maximum possible margin separating the most proximal observed empirical data points of both classes. Observations residing geometrically upon these extreme functional boundary edges are formally designated as Support Vectors.

### Empirical Applications
SVMs hold pronounced effectiveness in structurally categorising complex high-dimensional text matrices, analysing dense biological protein arrays seamlessly, and providing an extraordinarily resilient foundational framework for structurally clean small-data scenarios securely immunised against stochastic minor outliers.
  `,

  intuition: `
Rather than determining an arbitrary discriminatory vector capable of separating bipartite classes, an SVM structurally establishes the widest discernible spatial boundary dividing them. This exclusionary zone is delineated entirely by the specific empirical observations situated exactly upon the immediate mathematical edge of the margin. Modifying the spatial position of any secondary observation located further interior to the respective class cluster exerts strictly zero mathematical effect upon the model's derived trajectory.
  `,

  mathematics: `
### 1. Hard-Margin Objective Logic
For a perfectly linearly separable multidimensional dataset, the foundational mathematical objective is functionally equivalent to minimising $\\frac{1}{2} \\|w\\|^2$, subject stringently to the strict inequality for all observations $i$:

$$ y_i (w^T x_i + b) \\ge 1 \\quad \\forall i $$

### 2. The Kernel Trick Methodology
When the structural topology of the empirical data exhibits profound non-linearity, SVMs mathematically project observations into an extraordinarily high-dimensional abstract feature space natively utilising a kernel function, rigorously defined as $K(x_i, x_j) = \\phi(x_i)^T \\phi(x_j)$. The highly ubiquitous and robust Radial Basis Function (RBF) explicitly operates analytically as:

$$ K(x_i, x_j) = \\exp(-\\gamma \\|x_i - x_j\\|^2) $$
  `,

  pros: [
    "Provides a mathematically elegant, guaranteed global optimum, yielding universally secure and distinctly robust decision boundaries.",
    "The Kernel Trick securely accommodates wildly complex, continuous, and explicit severe geometric non-linearity with rigorous structural integrity."
  ],

  cons: [
    "Computationally exceptionally burdensome for vast empirical datasets, as systemic training complexity intrinsically scales at $O(n^3)$.",
    "Exhibits severe mathematical susceptibility to the suboptimal selection of regularisation hyperparameters $C$ and $\\gamma$."
  ],

  codeSnippet: `import numpy as np
from sklearn.svm import SVC

X = np.array([[1, 2], [2, 3], [1.5, 1.8], [8, 8], [9, 10], [8.5, 9.2]])
y = np.array([0, 0, 0, 1, 1, 1])

clf = SVC(kernel='rbf', C=1.0)
clf.fit(X, y)

print(f"Number of Computed Support Vectors: {clf.n_support_}")`
};
