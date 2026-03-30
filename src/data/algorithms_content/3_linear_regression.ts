import { Algorithm } from "./types";

export const linearRegression: Algorithm = {
  id: "linear-regression",
  title: "Linear & Logistic Regression",
  category: "Linear Regression",
  shortDescription: "A parametric class of models predicting continuous values (Linear) or class probabilities (Logistic) using strictly linear feature combinations.",
  fullDescription: "Linear regression mathematically models the fundamental relationship between a continuous target variable and input features by fitting an $n$-dimensional hyperplane. Logistic regression extends this concept by passing the linear output directly through the logistic (sigmoid) function. This maps the raw unbounded output to a probabilistic value bounded strictly between 0 and 1, facilitating robust binary classification.\n\n### Real-World Applications\nLinear Regression is ideal for straightforward pricing models (e.g., predicting exact housing prices based on quantifiable total square footage), robust long-term forecasting, or measuring feature impact. Logistic regression is used in institutional credit scoring, critical biomedical research (mapping precise disease probability), and targeted direct marketing.",
  intuition: "Linear Regression algorithmically draws a straight 'line of best fit' directly through scattered data points, minimizing vertical distance. Logistic Regression similarly draws a linear boundary to sharply split two distinct classes, but it outputs an 'S-shaped' probability curve.",
  mathematics: "### Ordinary Least Squares (OLS) Linear Regression\n\nFor a specific input vector $x \\in \\mathbb{R}^p$, the parametric model relies on a weights vector $w$:\n\n$$ \\hat{y} = w^T x + b $$\n\nUnder Maximum Likelihood estimation, the objective is equivalent to minimizing the Mean Squared Error (MSE):\n\n$$ \\mathcal{L}(w) = \\frac{1}{n} \\|y - Xw\\|^2 $$\n\nThe analytical closed-form solution (Normal Equation) is:\n\n$$ \\hat{w} = (X^T X)^{-1} X^T y $$\n\n### Logistic Regression Classification\n\nFor binary classification $y \\in \\{0, 1\\}$, we pass the linear combination through the sigmoid function $\\sigma(z) = \\frac{1}{1 + e^{-z}}$:\n\n$$ P(y=1|x) = \\sigma(w^T x + b) $$\n\n### Binary Cross-Entropy Analytical Loss\n\nThe optimal weights are iteratively estimated by maximizing mathematical likelihood, which is structurally equivalent to minimizing the Binary Cross-Entropy (BCE). It relies on sums of logarithms:\n\n$$ \\mathcal{L}(w) = -\\frac{1}{n} \\sum_{i=1}^{n} \\left[ y_i \\log(\\hat{y}_i) + (1-y_i) \\log(1-\\hat{y}_i) \\right] $$\n\nThe exact calculus gradient derivation for optimizing is mathematically simple:\n\n$$ \\nabla_w \\mathcal{L} = \\frac{1}{n} X^T (\\hat{y} - y) $$",
  pros: [
    "Extraordinarily interpretative mathematically: feature mathematical coefficients directly explain the model's exact logic.",
    "Remarkably efficient and blazing fast to train, repeatedly providing a strong baseline parametric starting point."
  ],
  cons: [
    "Cannot capture fully non-linear functional relationships without rigorous feature engineering.",
    "Severely sensitive to strong mathematical outliers and explicit severe multicollinearity."
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
