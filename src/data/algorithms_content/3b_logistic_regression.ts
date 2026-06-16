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
print("Probability of passing for [5.5, 6.0]:", clf.predict_proba([[5.5, 6.0]])[0, 1])`,
  tldr: [
    'Logistic regression predicts a **probability** by squashing the linear score $z = w^T x + b$ through the sigmoid $\\sigma(z) = 1/(1 + e^{-z}) \\in (0, 1)$.',
    'It is trained by minimizing **binary cross-entropy** (log-loss), which is the negative log-likelihood of the data under a Bernoulli model.',
    'Log-loss is **convex** in the parameters, while MSE-of-sigmoid is not — so cross-entropy gives a clean, single global optimum.',
    'Coefficients are interpretable as **log-odds**: a one-unit increase in feature $x_j$ multiplies the odds of the positive class by $e^{w_j}$.',
    'The gradient simplifies to $\\frac{1}{n}X^T(\\hat{p} - y)$ — the same "prediction-minus-target" form as linear regression — and there is **no closed form**, so it is fit iteratively.',
    'You turn a probability into a class by comparing it to a **threshold** (default $0.5$), which you can tune to trade off precision and recall.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: From Bernoulli Likelihood to Binary Cross-Entropy',
      content: `
Each label is a Bernoulli trial with success probability $\\hat{p}_i = \\sigma(z_i)$, where $z_i = w^T x_i + b$. The probability of a single observed label can be written compactly as:

$$ P(y_i \\mid x_i) = \\hat{p}_i^{\\,y_i}\\,(1 - \\hat{p}_i)^{\\,1 - y_i} $$

Assuming the $n$ examples are independent, the likelihood of the whole dataset is the product:

$$ \\mathcal{L}(w, b) = \\prod_{i=1}^{n} \\hat{p}_i^{\\,y_i}\\,(1 - \\hat{p}_i)^{\\,1 - y_i} $$

Maximizing a product is awkward, so take the log (which is monotonic, so the maximizer is unchanged) to get the **log-likelihood**:

$$ \\log \\mathcal{L}(w, b) = \\sum_{i=1}^{n}\\left[\\, y_i \\log \\hat{p}_i + (1 - y_i)\\log(1 - \\hat{p}_i) \\,\\right] $$

Minimizing a loss is more conventional than maximizing a likelihood, so we negate and average. The result is exactly the **binary cross-entropy** (log-loss):

$$ J(w, b) = -\\frac{1}{n}\\sum_{i=1}^{n}\\left[\\, y_i \\log \\hat{p}_i + (1 - y_i)\\log(1 - \\hat{p}_i) \\,\\right] $$

So log-loss is not an arbitrary choice — it is the negative log-likelihood of a Bernoulli model. Notice the per-example penalty: when $y_i = 1$ it is $-\\log \\hat{p}_i$, which blows up as $\\hat{p}_i \\to 0$ — the model is punished severely for being confidently wrong.
      `,
    },
    {
      heading: 'Derivation: The Gradient and Why Not MSE (Convexity)',
      content: `
A small but pivotal identity is that the sigmoid has an especially clean derivative:

$$ \\sigma'(z) = \\sigma(z)\\,(1 - \\sigma(z)) = \\hat{p}\\,(1 - \\hat{p}) $$

Differentiate the per-example log-loss $\\ell_i = -[\\,y_i \\log \\hat{p}_i + (1 - y_i)\\log(1 - \\hat{p}_i)\\,]$ with respect to $z_i$. Using $\\frac{\\partial \\ell_i}{\\partial \\hat{p}_i} = -\\frac{y_i}{\\hat{p}_i} + \\frac{1 - y_i}{1 - \\hat{p}_i}$ and the chain rule with $\\frac{\\partial \\hat{p}_i}{\\partial z_i} = \\hat{p}_i(1 - \\hat{p}_i)$, the $\\hat{p}_i(1 - \\hat{p}_i)$ terms cancel cleanly:

$$ \\frac{\\partial \\ell_i}{\\partial z_i} = \\hat{p}_i - y_i $$

Applying $\\frac{\\partial z_i}{\\partial w} = x_i$ and averaging over the dataset gives the elegant gradient:

$$ \\nabla_w J = \\frac{1}{n}\\sum_{i=1}^{n}(\\hat{p}_i - y_i)\\,x_i = \\frac{1}{n}X^T(\\hat{p} - y) $$

This is structurally identical to the linear-regression gradient: weight updates are driven by the **error** $(\\hat{p}_i - y_i)$.

**Why not MSE?** If you instead used $J_{\\text{mse}} = \\frac{1}{n}\\sum (\\sigma(z_i) - y_i)^2$, the chain rule pulls in an extra $\\sigma'(z_i) = \\hat{p}_i(1 - \\hat{p}_i)$ factor, giving a per-example gradient $\\propto (\\hat{p}_i - y_i)\\,\\hat{p}_i(1 - \\hat{p}_i)$. When the model is confidently wrong ($\\hat{p}_i \\to 0$ or $1$), that factor goes to zero, so the gradient **vanishes** and learning stalls. Worse, composing the squared error with the non-linear sigmoid makes $J_{\\text{mse}}$ **non-convex** in $(w, b)$ — it can have multiple local minima. Cross-entropy, by contrast, is convex in the parameters (its Hessian $\\frac{1}{n}X^T \\operatorname{diag}(\\hat{p}_i(1 - \\hat{p}_i)) X$ is positive semidefinite), so gradient descent converges to a single global optimum.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A logistic model produces a linear score $z = w^T x + b = -1.0$ for an example. Compute the predicted probability $\\hat{p} = \\sigma(z)$ and, using a $0.5$ threshold, give the predicted class.',
      difficulty: 'warm-up',
      hint: 'Use $\\sigma(z) = \\frac{1}{1 + e^{-z}}$, and recall $e^{1} \\approx 2.718$.',
      solution: '$\\hat{p} = \\sigma(-1.0) = \\frac{1}{1 + e^{1}} = \\frac{1}{1 + 2.718} = \\frac{1}{3.718} \\approx 0.269$. Since $0.269 < 0.5$, the predicted class is $0$ (the negative class).',
    },
    {
      prompt: 'The true label of an example is $y = 1$ and the model predicts $\\hat{p} = 0.8$. Compute the binary cross-entropy (log-loss) contribution of this single example. Then repeat for a confidently wrong prediction $\\hat{p} = 0.1$.',
      difficulty: 'core',
      hint: 'For $y = 1$, the per-example log-loss is simply $-\\log(\\hat{p})$ (use natural log).',
      solution: 'For $y = 1$, loss $= -[\\,1 \\cdot \\log \\hat{p} + 0 \\cdot \\log(1 - \\hat{p})\\,] = -\\log(\\hat{p})$. With $\\hat{p} = 0.8$: $-\\log(0.8) \\approx -(-0.223) = 0.223$. With $\\hat{p} = 0.1$: $-\\log(0.1) \\approx 2.303$. The confidently wrong prediction incurs roughly $10\\times$ the loss, illustrating how log-loss heavily penalizes confident mistakes.',
    },
    {
      prompt: 'A fitted logistic model for loan default has coefficient $w_j = 0.7$ for the standardized feature "debt-to-income ratio". Interpret this coefficient in terms of odds. By what factor do the odds of default change for a one-unit increase in this feature?',
      difficulty: 'core',
      hint: 'The odds multiply by $e^{w_j}$ for each one-unit increase in $x_j$.',
      solution: 'In logistic regression $\\log\\frac{p}{1-p} = w^T x + b$, so each coefficient is a change in log-odds. A one-unit increase in debt-to-income raises the log-odds of default by $0.7$, which multiplies the **odds** by $e^{0.7} \\approx 2.01$. In other words, the odds of default roughly **double** for each one-unit (one standard-deviation, since the feature is standardized) increase in debt-to-income, holding other features fixed.',
    },
    {
      prompt: 'A medical screening model outputs $\\hat{p} = 0.30$ (probability of disease). At the default threshold $0.5$ the patient is classified "no disease". Explain why a hospital might lower the threshold to $0.2$, and state what the new prediction would be.',
      difficulty: 'challenge',
      hint: 'Think about the asymmetric cost of a false negative versus a false positive in screening.',
      solution: 'At threshold $0.5$, $0.30 < 0.5$ predicts "no disease". At threshold $0.2$, $0.30 \\geq 0.2$ now predicts "disease" (positive). In screening, a **false negative** (missing a real disease) is far more costly than a **false positive** (an unnecessary follow-up test). Lowering the threshold makes the model more sensitive — it catches more true positives at the cost of more false positives — which is the right trade-off when misses are dangerous. The threshold is a deployment decision separate from training and does not change the fitted weights.',
    },
  ],
  comparisons: [
    {
      title: 'Logistic Regression vs Linear Regression vs SVM (classification)',
      methods: ['Logistic Regression', 'Linear Regression', 'SVM (classification)'],
      rows: [
        {
          dimension: 'Output type',
          values: ['Probability in $(0, 1)$ via sigmoid', 'Unbounded continuous value (not a probability)', 'Signed distance / class label (margin score)'],
        },
        {
          dimension: 'Loss function',
          values: ['Binary cross-entropy (log-loss)', 'Mean squared error', 'Hinge loss (max-margin)'],
        },
        {
          dimension: 'Decision boundary',
          values: ['Linear (hyperplane where $z = 0$)', 'Not designed for boundaries; thresholding a line is ad hoc', 'Linear, or non-linear via kernels'],
        },
        {
          dimension: 'Probability estimates',
          values: ['Yes — native, well-calibrated', 'No', 'No native probabilities (needs Platt scaling)'],
        },
        {
          dimension: 'Interpretability',
          values: ['High — coefficients are log-odds', 'High — coefficients are slopes', 'Lower — especially with kernels'],
        },
      ],
      takeaway: 'For binary classification with interpretable probabilities, reach for logistic regression. Linear regression is the wrong tool for classification (it has no probability or boundary semantics), and SVMs maximize the margin but do not give probabilities out of the box.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need calibrated **probability estimates**, not just hard class labels (e.g. risk scores, ranking by likelihood).',
      'You need an **interpretable** classifier whose coefficients (as log-odds / odds ratios) you can explain to stakeholders or regulators.',
      'You want a fast, low-variance **baseline** for a binary (or, via softmax, multiclass) classification problem.',
    ],
    avoidWhen: [
      'The decision boundary is strongly **non-linear** and resists feature engineering — prefer trees, gradient boosting, or neural networks.',
      'Classes are **perfectly (or near-perfectly) separable**, which causes weights to diverge — regularize, or use a margin method.',
      'Features are **highly collinear** or the dataset is wide ($p \\gg n$) without regularization — coefficients become unstable.',
    ],
    rulesOfThumb: [
      'Standardize features so coefficient magnitudes are comparable and L1/L2 regularization behaves sensibly.',
      'Always apply some regularization (L2 by default) to guard against complete separation and overfitting.',
      'Tune the decision threshold using a precision-recall or ROC analysis — do not blindly keep $0.5$ when class costs are asymmetric.',
    ],
  },
  caseStudies: [
    {
      title: 'Predicting credit-card default from balance and income',
      domain: 'Credit risk scoring',
      scenario: 'A lender wants to estimate the probability that a customer will **default** on their credit-card debt, using features such as current balance, annual income, and student status (the *Default* dataset from *An Introduction to Statistical Learning*, with 10,000 customers). The positive class (default) is rare — only about 3% of customers — making it a classic imbalanced binary classification problem.',
      approach: 'Fit a logistic regression $\\Pr(\\text{default} = 1) = \\sigma(\\beta_0 + \\beta_1 \\cdot \\text{balance} + \\beta_2 \\cdot \\text{income} + \\beta_3 \\cdot \\text{student})$, inspect each coefficient as a log-odds effect, and convert the predicted probabilities to decisions via a tuned threshold.',
      outcome: 'Balance is overwhelmingly the strongest predictor: its positive coefficient means the odds of default rise sharply with balance, and a customer with a $2,000 balance has a dramatically higher predicted default probability than one with a $500 balance. Using the default $0.5$ threshold the model reaches roughly **97% overall accuracy**, but because only ~3% of customers default, that headline accuracy is close to the naive "predict no one defaults" baseline — so the lender instead lowers the threshold to catch more true defaulters, trading a higher false-positive rate for far fewer costly missed defaults. The case study underscores that for imbalanced classification, probability calibration and threshold choice matter more than raw accuracy.',
      source: {
        title: 'An Introduction to Statistical Learning (Ch. 4, Default data)',
        authors: 'James, G., Witten, D., Hastie, T. and Tibshirani, R.',
        url: 'https://www.statlearning.com',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'What does the output of the sigmoid function in logistic regression represent?',
      options: [
        { text: 'An estimated probability of the positive class, $P(y = 1 \\mid x)$, lying strictly between 0 and 1.', correct: true },
        { text: 'The exact hard class label, either 0 or 1.', correct: false },
        { text: 'An unbounded real-valued score like a linear regression output.', correct: false },
        { text: 'The number of misclassified examples.', correct: false },
      ],
      explanation: 'The sigmoid squashes the linear score $z = w^T x + b$ into the open interval $(0, 1)$, which we interpret as $P(y = 1 \\mid x)$. A hard label only appears after you compare this probability to a threshold; the raw sigmoid output is itself a probability, not a class.',
    },
    {
      question: 'Why is binary cross-entropy preferred over mean squared error for training logistic regression?',
      options: [
        { text: 'Cross-entropy is convex in the parameters, whereas MSE composed with the sigmoid is non-convex and can stall on vanishing gradients.', correct: true },
        { text: 'MSE cannot be computed when the labels are 0 and 1.', correct: false },
        { text: 'Cross-entropy always trains faster on every dataset regardless of optimizer.', correct: false },
        { text: 'MSE requires a closed-form solution that logistic regression lacks.', correct: false },
      ],
      explanation: 'Composing squared error with the non-linear sigmoid yields a non-convex objective with possible local minima, and its gradient carries an extra $\\hat{p}(1 - \\hat{p})$ factor that vanishes when the model is confidently wrong. Cross-entropy is the negative Bernoulli log-likelihood, is convex in $(w, b)$, and has the clean gradient $\\frac{1}{n}X^T(\\hat{p} - y)$.',
    },
    {
      question: 'A logistic regression coefficient for a feature is $w_j = 1.1$. What is the correct interpretation?',
      options: [
        { text: 'A one-unit increase in the feature multiplies the odds of the positive class by $e^{1.1} \\approx 3.0$, holding other features fixed.', correct: true },
        { text: 'A one-unit increase in the feature raises the predicted probability by exactly $1.1$.', correct: false },
        { text: 'The feature explains 110% of the variance in the label.', correct: false },
        { text: 'The feature has no effect because coefficients above 1 are clipped.', correct: false },
      ],
      explanation: 'Logistic regression is linear in the **log-odds**: $\\log\\frac{p}{1-p} = w^T x + b$. So a coefficient is a change in log-odds, and exponentiating gives the odds ratio — here the odds multiply by $e^{1.1} \\approx 3.0$ per unit. It does not add directly to the probability (the sigmoid is non-linear) and is not a variance share.',
    },
    {
      question: 'You have a logistic model that outputs $\\hat{p} = 0.42$ for an example. With the default decision threshold, what class is predicted, and how could the prediction change?',
      options: [
        { text: 'Class 0, because $0.42 < 0.5$; lowering the threshold below $0.42$ would flip it to class 1.', correct: true },
        { text: 'Class 1, because any positive probability rounds up to 1.', correct: false },
        { text: 'The prediction is undefined until the model is retrained.', correct: false },
        { text: 'Class 0, and no threshold change could ever make it class 1.', correct: false },
      ],
      explanation: 'The default threshold is $0.5$, so $0.42 < 0.5$ predicts class 0. The threshold is a post-hoc decision separate from the fitted weights: lowering it below $0.42$ (e.g. to $0.4$) would classify this same example as positive. Tuning the threshold is how you trade off precision and recall for asymmetric costs.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
