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
print("MSE:", mean_squared_error(score, score_hat))`,
  tldr: [
    'Linear regression predicts a continuous target as $\\hat{y} = w^T x + b$ and fits $w, b$ by minimizing **mean squared error**.',
    'Squared loss is convex, so there is a unique global optimum given by the closed-form **normal equation** $\\hat{w} = (X^T X)^{-1} X^T y$.',
    'Coefficients are directly interpretable: each one is the expected change in $y$ per unit change in a feature, holding the others fixed.',
    'It is a fast, strong **baseline**, but assumes linearity in the parameters and is sensitive to outliers and multicollinearity.',
    'When features are correlated or you want feature selection, reach for the regularized cousins **Ridge** (L2) and **Lasso** (L1).',
  ],
  additionalSections: [
    {
      heading: 'Derivation: The Normal Equation',
      content: `
Fold the intercept into the weights by appending a column of ones to the design matrix, so $\\beta = [b, w]^T$ and the model is simply $\\hat{y} = X\\beta$. Ordinary least squares minimizes the squared residuals:

$$ \\mathcal{L}(\\beta) = \\lVert y - X\\beta \\rVert^2 = (y - X\\beta)^T (y - X\\beta) $$

Expanding the quadratic:

$$ \\mathcal{L}(\\beta) = y^T y - 2\\beta^T X^T y + \\beta^T X^T X \\beta $$

Take the gradient with respect to $\\beta$ and use $\\nabla_\\beta (\\beta^T A \\beta) = 2A\\beta$ for symmetric $A = X^T X$:

$$ \\nabla_\\beta \\mathcal{L} = -2 X^T y + 2 X^T X \\beta $$

Set the gradient to zero. This gives the **normal equations**:

$$ X^T X \\beta = X^T y \\quad \\Longrightarrow \\quad \\hat{\\beta} = (X^T X)^{-1} X^T y $$

Because $X^T X$ is positive semidefinite, $\\mathcal{L}$ is convex, so this stationary point is the **global** minimum. The inverse exists only when $X$ has full column rank — i.e. no feature is a perfect linear combination of the others. Perfect multicollinearity makes $X^T X$ singular and the solution non-unique.
      `,
    },
    {
      heading: 'Derivation: Slope and Intercept for Simple Regression',
      content: `
For a single feature, the normal equations reduce to the familiar textbook formulas. Minimizing $\\sum_i (y_i - w x_i - b)^2$, set the two partial derivatives to zero:

$$ \\frac{\\partial \\mathcal{L}}{\\partial b} = -2\\sum_i (y_i - w x_i - b) = 0 \\;\\Rightarrow\\; b = \\bar{y} - w\\bar{x} $$

Substituting back and solving $\\partial \\mathcal{L} / \\partial w = 0$ yields:

$$ w = \\frac{\\sum_i (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum_i (x_i - \\bar{x})^2} = \\frac{\\operatorname{Cov}(x, y)}{\\operatorname{Var}(x)} $$

So the slope is just the covariance of $x$ and $y$ divided by the variance of $x$, and the line always passes through the point of means $(\\bar{x}, \\bar{y})$.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A fitted model is $\\hat{y} = 1.5x + 0.5$. Compute the predictions and residuals for the observed points $(2, 4)$ and $(4, 6)$.',
      difficulty: 'warm-up',
      solution: 'At $x=2$: $\\hat{y} = 1.5(2) + 0.5 = 3.5$, residual $r = 4 - 3.5 = 0.5$. At $x=4$: $\\hat{y} = 1.5(4) + 0.5 = 6.5$, residual $r = 6 - 6.5 = -0.5$. The residuals have opposite signs, so the line passes between the two points.',
    },
    {
      prompt: 'Fit an OLS line $y = wx + b$ to the three points $(0, 1)$, $(1, 1)$, $(2, 3)$. Report the slope and intercept.',
      difficulty: 'core',
      hint: 'Use $w = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2}$ and $b = \\bar{y} - w\\bar{x}$.',
      solution: 'Means: $\\bar{x} = 1$, $\\bar{y} = 5/3$. Numerator $\\sum (x_i-\\bar{x})(y_i-\\bar{y}) = (-1)(1-5/3) + (0)(1-5/3) + (1)(3-5/3) = (-1)(-2/3) + 0 + (1)(4/3) = 2/3 + 4/3 = 2$. Denominator $\\sum (x_i-\\bar{x})^2 = 1 + 0 + 1 = 2$. So $w = 2/2 = 1$ and $b = 5/3 - 1 \\cdot 1 = 2/3$. The line is $\\hat{y} = x + 2/3$.',
    },
    {
      prompt: 'Suppose you add a constant $c$ to **every** target value $y_i$, leaving the features unchanged, and refit OLS. How do the slope $w$ and intercept $b$ change?',
      difficulty: 'core',
      solution: 'The slope is unchanged. From $w = \\operatorname{Cov}(x, y)/\\operatorname{Var}(x)$, shifting every $y_i$ by $c$ shifts $\\bar{y}$ by $c$ but leaves $(y_i - \\bar{y})$ — and hence the covariance — unchanged. The intercept increases by exactly $c$: $b_{new} = (\\bar{y}+c) - w\\bar{x} = b_{old} + c$. Geometrically the whole line is translated up by $c$.',
    },
    {
      prompt: 'Prove that when an intercept term is included, the OLS residuals always sum to zero: $\\sum_i r_i = 0$.',
      difficulty: 'challenge',
      hint: 'Look at the normal equation that corresponds to the intercept column (the column of ones in $X$).',
      solution: 'The normal equations state $X^T(y - X\\hat{\\beta}) = X^T r = 0$, one equation per column of $X$. The intercept corresponds to a column of all ones, $\\mathbf{1}$. Its equation is $\\mathbf{1}^T r = \\sum_i r_i = 0$. Hence the residuals are mean-zero by construction whenever an intercept is fit. (Without an intercept this guarantee disappears.)',
    },
  ],
  comparisons: [
    {
      title: 'OLS vs Ridge vs Lasso',
      methods: ['OLS', 'Ridge', 'Lasso'],
      rows: [
        {
          dimension: 'Penalty term',
          values: ['None', 'L2: $\\lambda\\sum w_j^2$', 'L1: $\\lambda\\sum |w_j|$'],
        },
        {
          dimension: 'Handles multicollinearity',
          values: ['Poorly — coefficients can blow up', 'Well — shrinks correlated weights together', 'Well — tends to keep one of a correlated group'],
        },
        {
          dimension: 'Feature selection',
          values: ['No', 'No — shrinks but never to exactly zero', 'Yes — drives some weights to exactly $0$'],
        },
        {
          dimension: 'Closed-form solution',
          values: ['Yes', 'Yes: $(X^T X + \\lambda I)^{-1}X^T y$', 'No — needs coordinate/iterative descent'],
        },
        {
          dimension: 'Use it when',
          values: ['Few, roughly independent features', 'Many correlated features', 'You suspect a sparse true model'],
        },
      ],
      takeaway: 'Start with OLS as a baseline; switch to Ridge when features are correlated, and to Lasso when you also want automatic feature selection.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You expect an approximately **linear** relationship between features and target, or you can engineer features (logs, polynomials) that make it linear.',
      'You need an **interpretable** model whose coefficients you can explain to stakeholders.',
      'You want a fast, low-variance **baseline** to benchmark more complex models against.',
    ],
    avoidWhen: [
      'The relationship is strongly **non-linear** and resists feature engineering — prefer trees or neural networks.',
      'Features are **highly collinear** — coefficients become unstable; use Ridge/Lasso instead.',
      'The data has heavy **outliers** or non-constant error variance (heteroscedasticity) that violate OLS assumptions — consider robust or weighted regression.',
    ],
    rulesOfThumb: [
      'Standardize features before comparing coefficient magnitudes.',
      'If a variance inflation factor (VIF) exceeds ~10, treat multicollinearity seriously and regularize.',
      'Always plot residuals against fitted values to check linearity and constant variance.',
    ],
  },
  caseStudies: [
    {
      title: 'Allocating an advertising budget across channels',
      domain: 'Marketing analytics',
      scenario: 'A firm spends on TV, radio, and newspaper advertising across 200 markets and wants to know which channels actually drive **sales** (the *Advertising* dataset popularized in *An Introduction to Statistical Learning*). Looked at individually, all three channels appear positively correlated with sales.',
      approach: 'Fit a multiple linear regression $\\text{sales} \\sim \\text{TV} + \\text{radio} + \\text{newspaper}$, then inspect each coefficient, its statistical significance, and the overall fit — checking whether channels that look useful alone remain useful once the others are controlled for.',
      outcome: 'TV and radio have strong, statistically significant positive coefficients, while the newspaper coefficient becomes small and **not significant** once TV and radio are included; the model explains roughly **90% of the variance** in sales ($R^2 \\approx 0.90$). The actionable lesson: a feature that correlates with the target on its own (newspaper) can be revealed as redundant once confounders are accounted for — so budget is better shifted toward radio.',
      source: {
        title: 'An Introduction to Statistical Learning (Ch. 3, Advertising data)',
        authors: 'James, G., Witten, D., Hastie, T. and Tibshirani, R.',
        url: 'https://www.statlearning.com',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'Why does OLS square the residuals instead of taking their absolute values?',
      options: [
        { text: 'Squaring makes the loss smooth and convex, yielding a closed-form solution.', correct: true },
        { text: 'Squaring makes the model robust to outliers.', correct: false },
        { text: 'Squaring is what makes the model "linear".', correct: false },
        { text: 'Absolute-value loss has no minimum.', correct: false },
      ],
      explanation: 'Squared error is differentiable everywhere and convex, which is what gives the closed-form normal equation. A side effect is that large residuals are penalized heavily, making OLS **sensitive** to outliers — the opposite of robust. Absolute-value (L1) loss does have a minimum; it is just not differentiable at zero.',
    },
    {
      question: 'The normal equation $\\hat{\\beta} = (X^T X)^{-1} X^T y$ fails to give a unique solution when:',
      options: [
        { text: '$X^T X$ is singular because of perfectly collinear features.', correct: true },
        { text: 'The target $y$ contains negative values.', correct: false },
        { text: 'There are more samples than features.', correct: false },
        { text: 'The features have been standardized.', correct: false },
      ],
      explanation: 'A unique solution requires $X^T X$ to be invertible, which needs $X$ to have full column rank. Perfect multicollinearity (one feature is a linear combination of others) makes $X^T X$ singular. Having more samples than features actually helps; the sign of $y$ and standardization are irrelevant to invertibility.',
    },
    {
      question: 'A model reaches $R^2 = 0.95$ on the **training** set. What can you safely conclude?',
      options: [
        { text: 'It fits the training data well, but this alone says nothing about generalization.', correct: true },
        { text: 'It will perform well on unseen data.', correct: false },
        { text: 'It is definitely not overfitting.', correct: false },
        { text: 'It is correct 95% of the time.', correct: false },
      ],
      explanation: '$R^2$ is the fraction of variance explained on the data it is computed on. A high *training* $R^2$ can simply reflect overfitting and tells you nothing directly about test performance. It is also not an accuracy percentage.',
    },
    {
      question: 'You replace a feature $x$ with the pair $[x, x^2]$ and fit linear regression, producing a curved fit. The model is:',
      options: [
        { text: 'Still linear regression — it is linear in the parameters even though it bends in $x$.', correct: true },
        { text: 'No longer linear regression because the fit is curved.', correct: false },
        { text: 'Unsolvable with the normal equation.', correct: false },
        { text: 'Guaranteed to overfit.', correct: false },
      ],
      explanation: '"Linear" in linear regression refers to linearity in the **parameters**, not the features. Polynomial (or other) feature transforms keep the entire closed-form machinery intact while letting the model fit curves. Overfitting is a risk with high-degree features but is not guaranteed.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
