import { LearningModule } from "./types";

export const regularization: LearningModule = {
  id: "regularization",
  title: "L1 & L2 Regularization",
  category: "Regularization",
  prerequisites: ["linear-regression", "bias-variance"],
  tracks: ["practitioner"],
  difficulty: 2,
  relatedModules: ["linear-regression", "logistic-regression", "bias-variance"],
  shortDescription: "Preventing overfitting by adding parameter penalty constraints (L1 Lasso and L2 Ridge) to the loss objective.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain the purpose of regularization in reducing variance',
    'Differentiate between L1 (Lasso) and L2 (Ridge) regularization mathematically and geometrically',
    'Describe why L1 regularization leads to parameter sparsity and feature selection',
    'List other regularization techniques such as dropout, early stopping, and data augmentation',
  ],
  keyTerms: [
    { term: 'L1 Regularization (Lasso)', definition: 'A regularization technique that adds a penalty equal to the sum of the absolute values of the weights.' },
    { term: 'L2 Regularization (Ridge)', definition: 'A regularization technique that adds a penalty equal to the sum of the squared values of the weights.' },
    { term: 'Sparsity', definition: 'A state where many model weights are exactly equal to zero, effectively removing the corresponding features.' },
  ],
  workedExamples: [
    {
      title: 'Regularized Loss calculation',
      problem: 'Given base MSE loss $L_0 = 2.0$, model weights $w = [3.0, -4.0]$, and regularization strength $\\lambda = 0.1$, calculate the total loss with L2 regularization.',
      solution: 'L2 penalty = $\\|w\\|_2^2 = 3.0^2 + (-4.0)^2 = 9.0 + 16.0 = 25.0$. Total Loss = $L_0 + \\lambda \\|w\\|_2^2 = 2.0 + 0.1 \\times 25.0 = 2.0 + 2.5 = 4.5$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Regularization is used to reduce model training error.',
      correction: 'Regularization adds a penalty that deliberately increases training error (adds bias) in order to decrease generalization/validation error on unseen data (reduces variance).'
    },
    {
      claim: 'L1 and L2 regularization cannot be combined.',
      correction: 'They are combined in a method called Elastic Net regularization, which balances the benefits of both sparsity and weight distribution.'
    }
  ],
  references: [
    {
      title: "Regression Shrinkage and Selection via the Lasso",
      authors: "Tibshirani, R",
      url: "https://www.jstor.org",
      type: "textbook"
    },
    {
      title: "Deep Learning (Chapter 7)",
      authors: "Goodfellow, I. et al",
      url: "https://www.deeplearningbook.org",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Underfitting',
      description: 'If the regularization strength $\\lambda$ is set too high, the penalty dominates, forcing weights to zero and preventing the model from learning patterns.',
      mitigation: 'Tune $\\lambda$ using cross-validation on a validation set.'
    }
  ],

  fullDescription: `
Regularization reduces overfitting by adding a penalty for overly large or complex model parameters. The model must now fit the data while keeping its weights under control.

- **L1 Regularization (Lasso)**: Adds a penalty proportional to the absolute values of the weights. This drives many parameters to exactly zero, producing **sparse models** and performing automatic feature selection.
- **L2 Regularization (Ridge / Weight Decay)**: Adds a penalty proportional to the squared values of the weights. This shrinks parameters toward zero but keeps them non-zero, distributing weights smoothly.
  `,

  intuition: `
Imagine fitting a model to noisy coordinates. Without penalties, the model can use extreme weights to chase every small fluctuation in the training set. That can reduce training loss while hurting generalization.

Regularization makes that behavior expensive.
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
    "Choosing the hyperparameter $\\lambda$ requires validation or cross-validation.",
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
