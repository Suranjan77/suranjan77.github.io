import { Algorithm } from "./types";

export const linearRegression: Algorithm = {
  id: "linear-regression",
  title: "Linear & Logistic Regression",
  category: "Linear Regression",
  shortDescription: "Two baseline models that turn a weighted sum of features into either a number or a calibrated probability.",

  fullDescription: `
Linear and logistic regression are often the first models worth fitting because they expose the entire machine-learning workflow without hiding it behind many layers. You choose a simple model family, measure its mistakes with a loss function, and solve for parameters that make that loss small.

Linear regression predicts a continuous value such as price, demand, temperature, or risk score. Logistic regression predicts the probability of a class such as churn/no churn, fraud/not fraud, pass/fail, or disease/no disease. The important shared idea is the linear score:

$$ z = w^T x + b $$

Linear regression uses that score directly as the prediction. Logistic regression passes it through a sigmoid so the output is constrained to the interval $[0, 1]$.

### Where is it used?
Use linear regression when the target is numeric and roughly changes in a straight-line way with the features. Use logistic regression when the target is categorical but you still want interpretable coefficients and probabilities. In practice, both are strong baselines: if a complex model only barely beats them, the extra complexity may not be buying much.
  `,

  intuition: `
In the interactive lab, linear regression is the ruler problem. Each point has a vertical residual: the gap between the observed value and the line's prediction. Squaring those gaps makes large misses expensive, so one outlier can visibly pull the fitted line. That is not a UI trick; it is exactly what the squared-error objective asks the model to do.

Logistic regression is the boundary problem. A linear score says which side of a boundary a point sits on. The sigmoid converts distance from that boundary into confidence: far on one side means probability near 1, far on the other side means probability near 0, and the boundary itself is the uncertain region around 0.5.

The useful mental model is this: regression is not "drawing a line"; it is choosing parameters that minimize a specific loss under a specific assumption about the shape of the relationship.
  `,

  mathematics: `
### 1. Linear regression model
For a row of features $x_i$, the model predicts:

$$ \\hat{y}_i = w^T x_i + b $$

The residual is the signed error:

$$ r_i = y_i - \\hat{y}_i $$

Ordinary least squares chooses parameters that minimize mean squared error:

$$ \\mathcal{L}(w,b) = \\frac{1}{n}\\sum_{i=1}^n (y_i - (w^T x_i + b))^2 $$

With a full-rank design matrix, the closed-form solution is:

$$ \\hat{w} = (X^T X)^{-1}X^T y $$

### 2. Logistic regression model
For binary labels $y_i \\in \\{0,1\\}$, logistic regression starts with the same linear score:

$$ z_i = w^T x_i + b $$

Then it maps the score to a probability:

$$ \\hat{p}_i = P(y_i=1|x_i) = \\sigma(z_i) = \\frac{1}{1 + e^{-z_i}} $$

The decision boundary at threshold $t$ is where:

$$ \\sigma(w^T x + b) = t $$

For the common threshold $t=0.5$, this simplifies to:

$$ w^T x + b = 0 $$

### 3. Cross-entropy loss
Squared error is not the right objective for class probabilities. Logistic regression uses binary cross-entropy:

$$ \\mathcal{L}(w,b) = -\\frac{1}{n}\\sum_{i=1}^{n}\\left[y_i\\log(\\hat{p}_i) + (1-y_i)\\log(1-\\hat{p}_i)\\right] $$

Its gradient has a compact form:

$$ \\nabla_w \\mathcal{L} = \\frac{1}{n}X^T(\\hat{p} - y) $$

This is why the algorithm is so useful pedagogically: the update direction is literally driven by predicted probability minus observed label.
  `,

  pros: [
    "Incredibly easy to understand. You can look at the final weights and know exactly how much each feature influenced the prediction.",
    "Extremely fast to train, making it the perfect baseline model to try before moving on to complex neural networks."
  ],

  cons: [
    "It assumes the relationship between variables is a perfectly straight line. If the real world is curved or complex, these models will fail.",
    "Highly sensitive to outliers. A single extreme data point can drag the entire line out of place.",
    "If two of your input features are highly correlated (like 'years alive' and 'age'), the math can break down."
  ],

  codeSnippet: `import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error, log_loss

# Linear regression: predict a numeric score from one feature.
hours = np.array([[1.1], [2.1], [3.0], [4.0], [5.2], [6.1], [7.0], [8.4]])
score = np.array([2.2, 2.8, 4.1, 4.6, 5.9, 6.7, 7.6, 8.7])

lin = LinearRegression()
lin.fit(hours, score)
score_hat = lin.predict(hours)

print("Linear slope:", lin.coef_[0])
print("Linear intercept:", lin.intercept_)
print("MSE:", mean_squared_error(score, score_hat))

# Logistic regression: predict probability of passing from two features.
# Features: [hours studied, practice-test average]
X = np.array([
    [1.2, 2.0],
    [2.0, 3.2],
    [2.8, 2.4],
    [3.6, 4.0],
    [5.2, 5.1],
    [6.4, 5.8],
    [7.1, 7.4],
    [8.2, 6.8],
    [8.8, 8.5],
])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1, 1])

clf = LogisticRegression()
clf.fit(X, y)
prob = clf.predict_proba(X)[:, 1]

print("Logistic weights:", clf.coef_[0])
print("Logistic intercept:", clf.intercept_[0])
print("Cross-entropy:", log_loss(y, prob))
print("New example pass probability:", clf.predict_proba([[5.5, 6.0]])[0, 1])`
};
