import { Algorithm } from "./types";

export const svm: Algorithm = {
  id: "support-vector-machines",
  title: "Support Vector Machines",
  category: "Support Vector Machines",
  shortDescription: "Finds an optimal geometric hyperplane maximizing the precise margin, leveraging kernel transformations for non-linear data.",
  fullDescription: "Support Vector Machines (SVMs) are remarkably robust statistical linear and non-linear classifiers. They seek the optimal hyperplane that not only strictly separates the defined target classes, but actively mathematically guarantees the absolute maximum possible margin between the closest observed data points of both classes. Points residing geometrically firmly on these extreme boundary edges are mathematically named Support Vectors.\n\n### Real-World Applications\nCategorizing complex high-dimensional text strings, analyzing dense biological protein sequences seamlessly, and providing an exceptionally strong foundational classifier for clean small-data scenarios securely immune to minor outliers.",
  intuition: "Instead of just drawing any line that separates apples from oranges, an SVM draws the widest possible road separating them. The road is determined entirely by the specific apples and oranges placed exactly on the immediate edge of the curb. Moving any other point further back has zero effect on the road's trajectory.",
  mathematics: "### Hard-Margin Logic\n\nFor a fully linearly separable dataset, the strict fundamental objective is completely mathematically effectively equivalent to minimizing $\\frac{1}{2} \\|w\\|^2$ subject strictly to exactly for all $i$:\n\n$$ y_i (w^T x_i + b) \\ge 1 \\quad \\forall i $$\n\n### The Kernel Trick\n\nWhen structural data is heavily non-linear, we mathematically map points into an incredibly high-dimensional abstract space cleanly using purely a kernel function exactly defined as $K(x_i, x_j) = \\phi(x_i)^T \\phi(x_j)$. The highly robust popular Radial Basis Function (RBF) explicitly operates analytically as:\n\n$$ K(x_i, x_j) = \\exp(-\\gamma \\|x_i - x_j\\|^2) $$",
  pros: [
    "Mathematically elegant guaranteed global optimum resulting globally safely in uniquely robust boundaries.",
    "The Kernel Trick handles wildly complex continuous explicit severe non-linear geometry robustly strictly."
  ],
  cons: [
    "Computationally exceptionally extremely slow for vast datasets as training complexity intrinsically scales at $O(n^3)$.",
    "Severely highly susceptible to poorly chosen hyperparameters $C$ and $\\gamma$."
  ],
  codeSnippet: `import numpy as np
from sklearn.svm import SVC

X = np.array([[1, 2], [2, 3], [1.5, 1.8], [8, 8], [9, 10], [8.5, 9.2]])
y = np.array([0, 0, 0, 1, 1, 1])

clf = SVC(kernel='rbf', C=1.0)
clf.fit(X, y)

print(f"Number of Support Vectors: {clf.n_support_}")`
};
