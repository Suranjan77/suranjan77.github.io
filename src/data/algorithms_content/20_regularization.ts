import { Algorithm } from "./types";

export const regularization: Algorithm = {
  id: "regularization",
  title: "L1 & L2 Regularization",
  category: "Regularization",
  shortDescription: "Preventing overfitting by adding parameter penalty constraints (L1 Lasso and L2 Ridge) to the loss objective.",

  fullDescription: `
Regularization is a fundamental technique used to prevent overfitting by penalizing large model parameters. It adds a regularization penalty term to the primary loss function (like Mean Squared Error).

- **L1 Regularization (Lasso)**: Adds a penalty proportional to the absolute values of the weights. This drives many parameters to exactly zero, producing **sparse models** and performing automatic feature selection.
- **L2 Regularization (Ridge / Weight Decay)**: Adds a penalty proportional to the squared values of the weights. This shrinks parameters toward zero but keeps them non-zero, distributing weights smoothly.
  `,

  intuition: `
Imagine fitting a model to noisy coordinates. Without penalties, the model can set extreme weight values (e.g. $w_1 = 1000, w_2 = -999$) to wiggle the line and hit every single point. This wiggling fits training noise perfectly but fails generalization.

Regularization forces the model to be "simple".
Geometrically:
- **L1 constraint** forms a **diamond/cross** shape ($|w_1| + |w_2| \\le C$). Contours of the unregularized loss are most likely to intersect the constraint diamond at its sharp corners, which lie directly on the axes (meaning one weight is exactly $0$).
- **L2 constraint** forms a **circle/hypersphere** ($w_1^2 + w_2^2 \\le C^2$). Loss contours intersect the circle smoothly at non-zero values on both axes.
  `,

  mathematics: `
Let the original loss function (e.g., MSE) be $L_0(\\mathbf{w})$.

### 1. L1 Regularization (Lasso Loss)
Adds the $L_1$ norm penalty of the weight vector:

$$ L(\\mathbf{w}) = L_0(\\mathbf{w}) + \\lambda \\sum_{j=1}^{d} |w_j| = L_0(\\mathbf{w}) + \\lambda \\|\\mathbf{w}\\|_1 $$

Where $\\lambda \\ge 0$ is the regularization strength.

### 2. L2 Regularization (Ridge Regression Loss)
Adds the squared $L_2$ norm penalty of the weight vector:

$$ L(\\mathbf{w}) = L_0(\\mathbf{w}) + \\lambda \\sum_{j=1}^{d} w_j^2 = L_0(\\mathbf{w}) + \\lambda \\|\\mathbf{w}\\|_2^2 $$

### 3. Gradient Analysis (Weight Decay)
Under L2 regularization, the gradient update step for weight $w_j$ becomes:

$$ w_j \\leftarrow w_j - \\alpha \\left( \\frac{\\partial L_0}{\\partial w_j} + 2\\lambda w_j \\right) = (1 - 2\\alpha\\lambda)w_j - \\alpha \\frac{\\partial L_0}{\\partial w_j} $$

Where $(1 - 2\\alpha\\lambda) < 1$ shrinks the weight at every iteration (known as **weight decay**).
  `,

  pros: [
    "L1 performs feature selection, identifying the most predictive variables by zeroing out irrelevant ones.",
    "L2 handles collinearity (correlated features) effectively, sharing predictive weight among them.",
    "Highly effective at improving generalization performance on small or noisy datasets."
  ],

  cons: [
    "Choosing the optimal hyperparameter $\\lambda$ requires computationally expensive cross-validation grid search.",
    "Lasso (L1) cannot yield analytical closed-form solutions (requires coordinate descent optimization).",
    "Extreme regularization causes high bias (underfitting), flattening the model predictions."
  ],

  codeSnippet: `import numpy as np
from sklearn.linear_model import Lasso, Ridge

# L1 Regularization (Lasso)
# alpha parameters map directly to lambda strength
lasso_reg = Lasso(alpha=0.1)
lasso_reg.fit(X, y)

# L2 Regularization (Ridge)
ridge_reg = Ridge(alpha=1.0)
ridge_reg.fit(X, y)
`
};
