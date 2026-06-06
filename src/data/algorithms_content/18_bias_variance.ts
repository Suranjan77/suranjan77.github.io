import { LearningModule } from "./types";

export const biasVariance: LearningModule = {
  id: "bias-variance",
  title: "Bias-Variance Tradeoff",
  category: "Model Complexity & Bias-Variance",
  prerequisites: ["probability-theory", "linear-regression"],
  tracks: ["practitioner"],
  difficulty: 2,
  relatedModules: ["probability-theory", "linear-regression", "regularization"],
  shortDescription: "Balancing model complexity to minimize error from high bias (underfitting) and high variance (overfitting).",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain expected prediction error in terms of bias, variance, and irreducible error',
    'Distinguish between underfitting (high bias) and overfitting (high variance) behaviors',
    'Identify diagnostic signs of high bias versus high variance on training and validation curves',
    'List regularization and training methods used to address bias and variance issues',
  ],
  keyTerms: [
    { term: 'Bias', definition: 'The error introduced by approximating a complex real-world relationship with a simpler model.' },
    { term: 'Variance', definition: 'The error introduced by a model\'s high sensitivity to fluctuations in the training dataset.' },
    { term: 'Irreducible Error', definition: 'The noise inherent in the data itself, which cannot be eliminated regardless of model selection.' },
  ],
  workedExamples: [
    {
      title: 'Error Decomposition',
      problem: 'Given true function $y = x^2$, a model family makes prediction $\\hat{f}(x)$. If expected prediction $\\mathbb{E}[\\hat{f}(x)] = x^2 - 1.0$, model variance is $0.5$, and irreducible noise variance is $0.2$, calculate the total expected squared prediction error.',
      solution: 'Total Error = $\\text{Bias}^2 + \\text{Variance} + \\text{Irreducible Error}$. Bias = $\\mathbb{E}[\\hat{f}(x)] - f(x) = (x^2-1.0) - x^2 = -1.0$. $\\text{Bias}^2 = 1.0$. Total Error = $1.0 + 0.5 + 0.2 = 1.7$.',
    },
  ],
  misconceptions: [
    {
      claim: 'You should always aim to have exactly zero bias and zero variance.',
      correction: 'Because reducing bias often increases variance, and vice versa, it is generally impossible to achieve zero for both. The goal is to find the optimal tradeoff that minimizes the sum of all three error components.'
    },
    {
      claim: 'Getting more training data always reduces bias.',
      correction: 'More training data helps reduce variance (overfitting), but it does not change the model family. If your model family is too simple (e.g., linear regression on highly non-linear data), the bias remains high.'
    }
  ],
  references: [
    {
      title: "Neural Networks and the Bias/Variance Dilemma",
      authors: "Geman, S., Bienenstock, E. and Doursat, R",
      url: "https://dl.acm.org",
      type: "textbook"
    },
    {
      title: "The Elements of Statistical Learning (Chapter 7)",
      authors: "Hastie, T. et al",
      url: "https://web.stanford.edu/~hastie/ElemStatLearn/",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'High Variance Overfitting',
      description: 'The model fits the training data perfectly (zero training error) but fails completely on the test dataset.',
      mitigation: 'Simplify the model (reduce capacity), collect more training data, or add L1/L2 regularization.'
    }
  ],

  fullDescription: `
The bias-variance tradeoff explains why model capacity matters. Expected prediction error can be viewed as a combination of bias, variance, and irreducible noise.

- **Bias**: Error introduced by approximating a complex real-world process with a simple model (e.g. fitting a straight line to quadratic data). High bias leads to **underfitting**.
- **Variance**: Error introduced by the model's sensitivity to small fluctuations in the training dataset. High variance leads to **overfitting**, where the model learns the noise rather than the signal.
- **Irreducible Error ($\\sigma^2$)**: The noise floor inherent in the data generating process, which no model can ever eliminate.
  `,

  intuition: `
Imagine a target board at an archery range:
1. **Low Bias, Low Variance**: Arrows are tightly clustered in the bullseye. (The ideal model: accurate and consistent).
2. **High Bias, Low Variance**: Arrows are tightly clustered, but far off target in the corner. (Underfitting: consistent, but consistently wrong).
3. **Low Bias, High Variance**: Arrows are spread widely across the entire board, but their average center is close to the bullseye. (Overfitting: highly inconsistent, chasing individual training noise).
4. **High Bias, High Variance**: Arrows are scattered and completely off target. (The worst case).

As model capacity increases, training error usually falls. Validation error often falls at first, then rises when the model starts fitting noise. The best model is usually near the bottom of that validation curve.
  `,

  mathematics: `
### 1. Mathematical Decomposition
Let the true data-generating process be $y = f(x) + \\epsilon$, where $E[\\epsilon] = 0$ and $\\text{Var}(\\epsilon) = \\sigma^2$ (irreducible noise).

If we fit a model $\\hat{f}(x)$ on a training set, the expected squared error at a query point $x$ is:

$$ E\\left[(y - \\hat{f}(x))^2\\right] = \\text{Bias}\\left[\\hat{f}(x)\\right]^2 + \\text{Variance}\\left[\\hat{f}(x)\\right] + \\sigma^2 $$

Where:

### 2. Bias Term
The difference between the expected prediction of our model and the true function:

$$ \\text{Bias}\\left[\\hat{f}(x)\\right] = E\\left[\\hat{f}(x)\\right] - f(x) $$

### 3. Variance Term
The variance of the model's prediction over different training set samples:

$$ \\text{Variance}\\left[\\hat{f}(x)\\right] = E\\left[\\left(\\hat{f}(x) - E\\left[\\hat{f}(x)\\right]\\right)^2\\right] $$
  `,

  pros: [
    "Provides a clear diagnostic roadmap for improving models (e.g., add features if bias is high; add data/regularization if variance is high).",
    "Separates avoidable modeling error from the irreducible noise floor $\\sigma^2$.",
    "Guides feature selection, model capacity decisions, and validation strategy."
  ],

  cons: [
    "In practice, computing exact bias and variance terms is impossible because the true underlying distribution $f(x)$ is unknown.",
    "Modern deep learning exhibits a 'double descent' phenomenon where extremely overparameterized models bypass the classical tradeoff and generalize well.",
    "Does not choose hyperparameters directly; validation or cross-validation is still required."
  ],

  codeSnippet: `import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline

# Create a polynomial regression model pipeline
def get_poly_model(degree):
    return make_pipeline(
        PolynomialFeatures(degree=degree),
        LinearRegression()
    )

# Fit model on training coordinates (X, y)
# model = get_poly_model(degree=3)
# model.fit(X, y)
`
};
