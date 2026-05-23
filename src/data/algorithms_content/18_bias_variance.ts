import { Algorithm } from "./types";

export const biasVariance: Algorithm = {
  id: "bias-variance",
  title: "Bias-Variance Tradeoff",
  category: "Model Complexity & Bias-Variance",
  shortDescription: "Balancing model complexity to minimize error from high bias (underfitting) and high variance (overfitting).",

  fullDescription: `
The Bias-Variance Tradeoff is a core diagnostic framework in statistical machine learning. It decomposes the expected generalization error of any predictive model into three components: Bias, Variance, and Irreducible Noise.

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

As model capacity (e.g., polynomial degree, network size) increases, training error drops monotonically, but validation/generalization error forms a U-shape, reaching its lowest point at the optimal tradeoff.
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
    "Establishes a theoretical limit on accuracy (the noise floor $\\sigma^2$).",
    "Informs feature engineering and selection criteria."
  ],

  cons: [
    "In practice, computing exact bias and variance terms is impossible because the true underlying distribution $f(x)$ is unknown.",
    "Modern deep learning exhibits a 'double descent' phenomenon where extremely overparameterized models bypass the classical tradeoff and generalize well.",
    "Does not give direct recipes for hyperparameters; requires cross-validation search."
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
