import { Algorithm } from "./types";

export const linearRegression: Algorithm = {
  id: "linear-regression",
  title: "Linear & Logistic Regression",
  category: "Linear Regression",
  shortDescription: "A fundamental parametric class of models predicting continuous values (Linear) or class probabilities (Logistic) via globally linear feature combinations.",

  fullDescription: `
Linear regression mathematically models the fundamental relationship between a targeted continuous dependent variable and one or more independent input features by fitting an $n$-dimensional hyperplane. Logistic regression formally extends this concept for classification tasks by passing the linear output directly through the logistic (sigmoid) function. This transformation maps the raw unbounded output to a probabilistic value strictly bounded between 0 and 1, thereby facilitating robust binary classification modelling.

### Empirical Applications
Linear regression is optimally suited for straightforward continuous modelling (e.g., predicting exact pharmacological dosages based on quantifiable physiological metrics), robust long-term econometric forecasting, or isolating causal feature impact. Logistic regression is extensively utilised in institutional credit scoring applications, critical biomedical research (e.g., mapping precise disease incidence probabilities), and analytical targeted marketing.
  `,

  intuition: `
Linear regression algorithms systematically derive a 'line of best fit' through scattered multidimensional data points by mathematically minimising the aggregate squared vertical distances between the empirical observations and the model hyperplane. 

Logistic regression similarly constructs a linear decision boundary to distinctly partition two distinct classifications; however, rather than outputting a continuous raw value, it projects the distance from this boundary onto a continuous 'S-shaped' probability curve, quantifying the statistical likelihood of class membership.
  `,

  mathematics: `
### 1. Ordinary Least Squares (OLS) Linear Regression
For a specific input feature vector $x \\in \\mathbb{R}^p$, the parametric model relies on a precisely calibrated weights vector $w$:

$$ \\hat{y} = w^T x + b $$

Under the assumptions of Maximum Likelihood Estimation with Gaussian noise, the objective function is mathematically equivalent to minimising the Mean Squared Error (MSE):

$$ \\mathcal{L}(w) = \\frac{1}{n} \\|y - Xw\\|^2 $$

The analytical closed-form solution (the Normal Equation) is derived algebraically as:

$$ \\hat{w} = (X^T X)^{-1} X^T y $$

### 2. Logistic Regression Classification
For binary classification outcomes $y \\in \\{0, 1\\}$, the linear combination is processed through the sigmoid activation function $\\sigma(z) = \\frac{1}{1 + e^{-z}}$:

$$ P(y=1|x) = \\sigma(w^T x + b) $$

### 3. Binary Cross-Entropy Analytical Loss
The optimal parametric weights are iteratively estimated by maximising mathematical likelihood, which is structurally equivalent to minimising Binary Cross-Entropy (BCE). This formulation relies structurally upon sums of logarithmic probabilities:

$$ \\mathcal{L}(w) = -\\frac{1}{n} \\sum_{i=1}^{n} \\left[ y_i \\log(\\hat{y}_i) + (1-y_i) \\log(1-\\hat{y}_i) \\right] $$

The exact calculus gradient derivation required for computational optimisation is mathematically elegant:

$$ \\nabla_w \\mathcal{L} = \\frac{1}{n} X^T (\\hat{y} - y) $$
  `,

  pros: [
    "Extraordinarily interpretable mathematically: analytical feature coefficients directly explicate the model's exact inferential logic.",
    "Remarkably computationally efficient to train, frequently providing a robust baseline parametric starting point for complex analyses."
  ],

  cons: [
    "Inherently incapable of capturing fully non-linear functional relationships without rigorous, manual feature engineering (e.g., polynomial basis expansion).",
    "Exhibits severe mathematical sensitivity to extreme statistical outliers and explicit severe multicollinearity amongst input features."
  ],

  codeSnippet: `import numpy as np
from sklearn.linear_model import LogisticRegression

# Features: [Total Hours studied, Number of Past tests failed]
X = np.array([[2, 0], [4, 0], [1, 2], [3, 1], [5, 0], [1.5, 3]])

# Absolute Labels: Pass Exam [1] or Fail Exam [0]
y = np.array([1, 1, 0, 1, 1, 0])

clf = LogisticRegression(penalty='l2', C=1.0)
clf.fit(X, y)

print("Mathematical Weights (Studied, Failed):", clf.coef_[0])
print("Base Intercept log-odds:", clf.intercept_)

predict_prob = clf.predict_proba([[2.5, 1]])
print(f"Computed Pass Probability: {predict_prob[0][1]:.2%}")`
};
