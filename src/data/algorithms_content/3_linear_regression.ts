import { LearningModule } from "./types";

export const linearRegression: LearningModule = {
  id: "linear-regression",
  title: "Linear Regression",
  category: "Linear Regression",
  prerequisites: ["linear-algebra", "calculus"],
  tracks: ["practitioner"],
  difficulty: 2,
  shortDescription: "A baseline model that predicts a continuous numeric value by fitting a straight line through the data.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Formulate the linear regression prediction equation',
    'Define the Mean Squared Error (MSE) loss function',
    'Derive the closed-form normal equation for ordinary least squares',
    'Explain the impact of outliers and multicollinearity on linear regression performance',
  ],
  keyTerms: [
    { term: 'Residual', definition: 'The difference between the observed value and the predicted value.' },
    { term: 'Ordinary Least Squares (OLS)', definition: 'A method for estimating the parameters of a linear regression model by minimizing the sum of squared residuals.' },
    { term: 'Multicollinearity', definition: 'A state where two or more predictor variables in a multiple regression model are highly correlated.' },
  ],
  workedExamples: [
    {
      title: 'Ordinary Least Squares Parameters',
      problem: 'Given data points $(1, 2)$, $(2, 3)$, $(3, 5)$, compute the slope $w$ and intercept $b$ for the line $y = wx + b$.',
      solution: 'Means are $\\bar{x} = 2$, $\\bar{y} = 10/3$. $w = \\frac{\\sum (x_i-\\bar{x})(y_i-\\bar{y})}{\\sum (x_i-\\bar{x})^2} = \\frac{(1-2)(2-10/3) + (2-2)(3-10/3) + (3-2)(5-10/3)}{(1-2)^2 + (2-2)^2 + (3-2)^2} = \\frac{4/3 + 0 + 5/3}{2} = 1.5$. Intercept $b = \\bar{y} - w\\bar{x} = 10/3 - 1.5 \\times 2 = 1/3$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Linear regression can only fit straight lines.',
      correction: 'Linear regression is linear in parameters, meaning you can fit curves by transforming the features (e.g. polynomial features like $x^2$).'
    },
    {
      claim: 'A high R-squared value always means the model is good.',
      correction: 'R-squared can be artificially inflated by adding irrelevant features. It does not indicate whether the model is overfitted.'
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
      name: 'Outlier Sensitivity',
      description: 'A single extreme data point can heavily skew the regression line because the residuals are squared.',
      mitigation: 'Use robust regression techniques (like Huber loss or RANSAC) or perform outlier removal.'
    }
  ],
  fullDescription: `
Linear regression is one of the most fundamental algorithms in statistics and machine learning. It models the relationship between a dependent continuous variable (the target) and one or more independent variables (the features) by fitting a linear equation to the observed data.

Pedagogically, linear regression exposes the entire machine learning workflow: choosing a model family (linear scores), defining a loss function (mean squared error), and solving for parameters (via closed-form ordinary least squares or gradient descent) that make that loss as small as possible.

### Where is it used?
Linear regression is used when you want to predict continuous numeric values, such as predicting housing prices based on square footage, forecasting product demand based on seasonal advertising spend, estimating temperature, or calculating a customer risk score.
  `,
  intuition: `
In the interactive visualization, linear regression is the "ruler problem." Each data point has a vertical residual: the distance between the observed value and the line's prediction. Squaring these residuals makes large misses exponentially more expensive. Therefore, a single extreme outlier can pull the entire fitted line toward it. This represents exactly what the squared-error objective forces the model to do.
  `,
  mathematics: `
### 1. Linear Regression Model
For a row of features $x_i$, the model predicts a continuous value:

$$ \\hat{y}_i = w^T x_i + b $$

The residual is the signed error:

$$ r_i = y_i - \\hat{y}_i $$

### 2. Ordinary Least Squares (OLS)
OLS chooses the weights $w$ and intercept $b$ that minimize the Mean Squared Error (MSE):

$$ \\mathcal{L}(w,b) = \\frac{1}{n}\\sum_{i=1}^n (y_i - (w^T x_i + b))^2 $$

With a full-rank design matrix $X$, the closed-form normal equation solution is:

$$ \\hat{w} = (X^T X)^{-1}X^T y $$
  `,
  pros: [
    "Extremely easy to interpret; coefficients show the direct impact of each feature.",
    "Very fast to train and predict, serving as an excellent baseline.",
    "Has a closed-form analytical solution."
  ],
  cons: [
    "Assumes a linear relationship; fails if data patterns are non-linear.",
    "Highly sensitive to outliers, which pull the regression line disproportionally.",
    "Math breaks down if input features are highly correlated (multicollinearity)."
  ],
  codeSnippet: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# Predict a numeric score from study hours
hours = np.array([[1.1], [2.1], [3.0], [4.0], [5.2], [6.1], [7.0], [8.4]])
score = np.array([2.2, 2.8, 4.1, 4.6, 5.9, 6.7, 7.6, 8.7])

lin = LinearRegression()
lin.fit(hours, score)
score_hat = lin.predict(hours)

print("Linear slope:", lin.coef_[0])
print("Linear intercept:", lin.intercept_)
print("MSE:", mean_squared_error(score, score_hat))`
};
