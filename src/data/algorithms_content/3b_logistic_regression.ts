import { LearningModule } from "./types";

export const logisticRegression: LearningModule = {
  id: "logistic-regression",
  title: "Logistic Regression",
  category: "Logistic Regression",
  prerequisites: ["linear-regression"],
  tracks: ["practitioner"],
  difficulty: 2,
  shortDescription: "A classification model that uses a sigmoid function to map a linear combination of features to a probability between 0 and 1.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Map linear scores to probabilities using the Sigmoid (logistic) function',
    'Formulate the Binary Cross-Entropy loss function and explain its derivation from MLE',
    'Compute prediction values and evaluate log-loss for classification model outputs',
    'Interpret model coefficients as changes in log-odds',
  ],
  keyTerms: [
    { term: 'Sigmoid Function', definition: 'An S-shaped function that maps any real number to a value between 0 and 1.' },
    { term: 'Odds Ratio', definition: 'The ratio of the probability of an event occurring to the probability of it not occurring.' },
    { term: 'Binary Cross-Entropy', definition: 'A loss function measuring the performance of a classification model whose output is a probability value between 0 and 1.' },
  ],
  workedExamples: [
    {
      title: 'Sigmoid Probability Calculation',
      problem: 'Given linear score $z = w^T x + b = 2.0$, calculate the predicted probability $p$.',
      solution: '$p = \\sigma(2.0) = \\frac{1}{1 + e^{-2}} \\approx \\frac{1}{1 + 0.135} \\approx 0.88$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Logistic regression is a regression algorithm that predicts continuous numbers.',
      correction: 'Although it uses linear regression math under the hood, it is a classification algorithm that predicts categorical class probabilities.'
    },
    {
      claim: 'Using mean squared error is fine for logistic regression training.',
      correction: 'MSE is non-convex when combined with the Sigmoid function, which makes optimization difficult due to local minima and flat gradients. Cross-entropy is convex and guarantees a single global minimum.'
    }
  ],
  references: [
    {
      title: "The Elements of Statistical Learning",
      authors: "Hastie, T., Tibshirani, R. and Friedman, J",
      url: "https://web.stanford.edu/~hastie/ElemStatLearn/",
      type: "textbook"
    },
    {
      title: "An Introduction to Statistical Learning",
      authors: "James, G., Witten, D., Hastie, T. and Tibshirani, R",
      url: "https://www.statlearning.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Complete Separation',
      description: 'When a feature perfectly separates the two classes, the weights can grow infinitely large to push probabilities to exactly 0 and 1, causing numeric instability.',
      mitigation: 'Apply L1 or L2 regularization (weight decay) to penalize large weights.'
    }
  ],
  fullDescription: `
Logistic regression is a fundamental classification algorithm in machine learning. Despite the word "regression" in its name, it is used for binary classification tasks. The key idea is to take the same linear combination of features used in linear regression, but pass the output score through a non-linear activation function—the Sigmoid—to map it to a probability value between 0 and 1.

Pedagogically, logistic regression demonstrates how we extend linear models to categorical outputs, why squared error is unsuitable for classification, and how cross-entropy loss and maximum likelihood estimation guide the optimization process.

### Where is it used?
Logistic regression is widely used for binary classification tasks where probability estimates and interpretability are important, such as user churn prediction (churn/no churn), fraud detection (fraud/legitimate), clinical diagnostics (disease present/absent), or email spam filtering.
  `,
  intuition: `
Logistic regression is the boundary problem. The model calculates a linear score for each data point based on its features. This score indicates which side of a decision boundary the point falls on. The sigmoid function then converts the distance from this boundary into a probability: points far on one side have a probability near 1, points far on the other side have a probability near 0, and the decision boundary itself is the line of maximum uncertainty where the probability is exactly 0.5.
  `,
  mathematics: `
### 1. The Logistic Model and Sigmoid Function
For binary labels $y_i \\in \\{0, 1\\}$, we start with the linear score $z_i$:

$$ z_i = w^T x_i + b $$

We pass this score through the Sigmoid function to get a calibrated probability:

$$ \\hat{p}_i = P(y_i=1|x_i) = \\sigma(z_i) = \\frac{1}{1 + e^{-z_i}} $$

The decision boundary at threshold $t=0.5$ is simply where the linear score is zero:

$$ w^T x_i + b = 0 $$

### 2. Binary Cross-Entropy Loss
Since squared error is non-convex and unsuitable for probabilities, logistic regression uses binary cross-entropy loss, derived from maximum likelihood estimation:

$$ \\mathcal{L}(w,b) = -\\frac{1}{n}\\sum_{i=1}^{n}\\left[y_i\\log(\\hat{p}_i) + (1-y_i)\\log(1-\\hat{p}_i)\\right] $$

The gradient of this loss function with respect to the weights is remarkably simple:

$$ \\nabla_w \\mathcal{L} = \\frac{1}{n}X^T(\\hat{p} - y) $$

This shows that the direction of weight updates is directly driven by the prediction error $(\\hat{p} - y)$.
  `,
  pros: [
    "Outputs well-calibrated probabilities rather than just hard classes.",
    "Very easy to interpret; feature weights show the log-odds impact of each variable.",
    "Fast to train and serves as an excellent classification baseline."
  ],
  cons: [
    "Assumes a linear decision boundary in the feature space.",
    "Can easily overfit if features are highly dimensional or collinear (requires regularization).",
    "Cannot solve complex non-linear classification problems without manual feature engineering."
  ],
  codeSnippet: `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss

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
print("Cross-entropy loss:", log_loss(y, prob))
print("Probability of passing for [5.5, 6.0]:", clf.predict_proba([[5.5, 6.0]])[0, 1])`
};
