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
`,
  tldr: [
    'Expected test error decomposes into three additive pieces: $\\text{Bias}^2 + \\text{Variance} + \\sigma^2$ (irreducible noise).',
    '**High bias = underfitting**: the model is too simple, so train error and test error are both high and close together.',
    '**High variance = overfitting**: the model is too flexible, so train error is very low but test error is high — a large gap.',
    'The two trade off: increasing capacity lowers bias but raises variance, so the best model sits near the bottom of the U-shaped test-error curve.',
    'Fix high bias by adding capacity/features; fix high variance with more data, regularization, or a simpler model. Neither fix touches the irreducible $\\sigma^2$.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: The Bias-Variance Decomposition',
      content: `
Let the data be generated by $y = f(x) + \\epsilon$ with $\\mathbb{E}[\\epsilon] = 0$ and $\\text{Var}(\\epsilon) = \\sigma^2$, where $\\epsilon$ is independent of $\\hat{f}(x)$. Fix a query point $x$ and take the expectation over both the noise $\\epsilon$ and the random training set (which makes $\\hat{f}(x)$ random). We want to expand:

$$ \\mathbb{E}\\left[(y - \\hat{f}(x))^2\\right] $$

Substitute $y = f(x) + \\epsilon$ and add-and-subtract the mean prediction $\\mathbb{E}[\\hat{f}(x)]$:

$$ y - \\hat{f}(x) = \\underbrace{\\epsilon}_{\\text{noise}} + \\underbrace{\\left(f(x) - \\mathbb{E}[\\hat{f}(x)]\\right)}_{-\\,\\text{Bias}} + \\underbrace{\\left(\\mathbb{E}[\\hat{f}(x)] - \\hat{f}(x)\\right)}_{-\\,\\text{deviation}} $$

Square this sum. Because $\\epsilon$ has mean zero and is independent of $\\hat{f}(x)$, and because $\\mathbb{E}\\left[\\mathbb{E}[\\hat{f}(x)] - \\hat{f}(x)\\right] = 0$, all three cross-terms vanish in expectation. What remains is the sum of three squared expectations:

$$ \\mathbb{E}\\left[(y - \\hat{f}(x))^2\\right] = \\underbrace{\\left(\\mathbb{E}[\\hat{f}(x)] - f(x)\\right)^2}_{\\text{Bias}^2} + \\underbrace{\\mathbb{E}\\left[\\left(\\hat{f}(x) - \\mathbb{E}[\\hat{f}(x)]\\right)^2\\right]}_{\\text{Variance}} + \\underbrace{\\sigma^2}_{\\text{Irreducible}} $$

Reading each term explicitly:

- **$\\text{Bias}^2 = \\left(\\mathbb{E}[\\hat{f}(x)] - f(x)\\right)^2$** — how far the *average* model (over all possible training sets) sits from the truth. Driven by model family being too simple.
- **$\\text{Variance} = \\mathbb{E}\\left[\\left(\\hat{f}(x) - \\mathbb{E}[\\hat{f}(x)]\\right)^2\\right]$** — how much the prediction wobbles as the training set changes. Driven by model flexibility.
- **$\\sigma^2$** — the noise floor. No model, however clever, can drive total error below $\\sigma^2$.

Since the left side is a fixed quantity for a given model and the irreducible $\\sigma^2$ is constant, lowering bias typically forces variance up and vice versa — that is the **tradeoff**.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'At a query point, a model has $\\text{Bias} = -0.4$, $\\text{Variance} = 0.05$, and the data noise has $\\sigma^2 = 0.10$. Compute the expected squared prediction error.',
      difficulty: 'warm-up',
      hint: 'Use $\\mathbb{E}[(y - \\hat{f})^2] = \\text{Bias}^2 + \\text{Variance} + \\sigma^2$. Remember to square the bias.',
      solution: '$\\text{Bias}^2 = (-0.4)^2 = 0.16$. Total error $= 0.16 + 0.05 + 0.10 = 0.31$. Note that even a perfect-on-average model ($\\text{Bias}=0$) could not beat $0.05 + 0.10 = 0.15$ here, because $\\sigma^2$ is irreducible.',
    },
    {
      prompt: 'A model scores **2% error on the training set** and **3% error on the validation set**. A second model scores **18% training error** and **19% validation error**. Diagnose each as underfitting (high bias) or overfitting (high variance).',
      difficulty: 'core',
      hint: 'Look at the level of the train error and the size of the train-to-validation gap.',
      solution: 'Model 1 has low train error and only a small ($1\\%$) gap, so it generalizes well — it is a good fit, not strongly overfitting. Model 2 has high train error AND high validation error that are close together — the model cannot even fit the training data, the signature of **high bias / underfitting**. (Overfitting would instead look like low train error with a large gap, e.g. $1\\%$ train and $15\\%$ validation.)',
    },
    {
      prompt: 'A polynomial regression gets $1\\%$ training error but $22\\%$ validation error. List three concrete actions, and explain why each helps. Then say which single action you would try first.',
      difficulty: 'core',
      solution: 'The huge gap (low train, high validation) is classic **high variance / overfitting**. Fixes: (1) **Add regularization** (L2/L1) — penalizes large weights, shrinking the effective capacity so the model stops chasing noise. (2) **Collect more training data** — averages out idiosyncratic noise, pulling $\\hat{f}$ toward its expectation and lowering variance. (3) **Reduce model complexity** — e.g. lower the polynomial degree or prune features, directly cutting the variance term. First try: add regularization (cheapest, no new data needed) and tune its strength on the validation set.',
    },
    {
      prompt: 'Explain why collecting more training data reduces variance but generally does NOT reduce bias, referring to the decomposition terms.',
      difficulty: 'challenge',
      hint: 'Which terms depend on the chosen model family, and which depend on the randomness of the training sample?',
      solution: 'Variance $= \\mathbb{E}[(\\hat{f}(x) - \\mathbb{E}[\\hat{f}(x)])^2]$ measures how much $\\hat{f}$ wobbles across different training samples. More data makes each fit more stable and closer to the average fit, so this term shrinks (often $\\propto 1/n$). Bias $= \\mathbb{E}[\\hat{f}(x)] - f(x)$ depends on the *average* model the family can produce. If the family is too simple to represent $f$ (e.g. a line for quadratic data), its average is still wrong no matter how many points you average over — so bias is unchanged. To cut bias you must change the model family (add capacity/features), not the sample size.',
    },
  ],
  comparisons: [
    {
      title: 'Three regimes: Underfitting vs Good fit vs Overfitting',
      methods: ['Underfitting (high bias)', 'Good fit', 'Overfitting (high variance)'],
      rows: [
        {
          dimension: 'Training error',
          values: ['High', 'Low', 'Very low (often near $0$)'],
        },
        {
          dimension: 'Test / validation error',
          values: ['High', 'Low', 'High'],
        },
        {
          dimension: 'Train-to-test gap',
          values: ['Small', 'Small', 'Large'],
        },
        {
          dimension: 'Model complexity',
          values: ['Too low', 'About right', 'Too high'],
        },
        {
          dimension: 'Symptoms',
          values: ['Model cannot even fit the training data; flat, oversimplified predictions', 'Both errors low and close; sits near the bottom of the validation U-curve', 'Memorizes training noise; predictions swing wildly with small data changes'],
        },
        {
          dimension: 'Typical fixes',
          values: ['Add features, increase capacity, reduce regularization, train longer', 'Keep it; monitor with cross-validation', 'Add data, add L1/L2 regularization, reduce capacity, early stopping'],
        },
      ],
      takeaway: 'Read the two error numbers together: high-and-close means high bias, low-train-but-high-test means high variance. The fixes for the two regimes are nearly opposite, so diagnose before you act.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You see **both** train and validation error high and close together — add capacity (features, higher-degree terms, a more flexible model) or reduce regularization to cut **bias**.',
      'You see **low train error but a large gap** to validation error — add **regularization**, gather more data, or simplify the model to cut **variance**.',
      'You are choosing model complexity or a regularization strength and want a principled way to read learning/validation curves.',
    ],
    avoidWhen: [
      'Train and validation error are already low and close — the model is well balanced; adding complexity now just invites overfitting.',
      'The remaining error is plausibly the **irreducible** noise floor $\\sigma^2$ — no amount of capacity, data, or tuning will push error below it, so stop chasing it.',
      'You are working with massively overparameterized deep networks in the **double descent** regime, where the classical "more capacity = more variance" intuition can break down.',
    ],
    rulesOfThumb: [
      'High bias is identified by high training error; high variance is identified by a large train-to-test gap. Check the training error first.',
      'More data lowers variance but not bias — if your gap is already tiny, more data will not help.',
      'When unsure which knob to turn, plot the validation error against model complexity and pick the bottom of the U.',
    ],
  },
  caseStudies: [
    {
      title: 'Polynomial degree sweep: the U-shaped test-error curve',
      domain: 'Regression model selection',
      scenario: 'Data is generated from a smooth true function corrupted by Gaussian noise, and polynomial regression is fit at increasing degrees ($1, 2, \\dots, 15$). The question is which degree generalizes best — the canonical demonstration of the bias-variance tradeoff in *The Elements of Statistical Learning* (Ch. 7).',
      approach: 'Sweep the polynomial degree, recording **training MSE** and **held-out test MSE** at each degree. Low degrees are too rigid to capture the curve (high bias); high degrees flex enough to interpolate the noise (high variance). The optimum is read off the bottom of the test-error curve.',
      outcome: 'Training error falls **monotonically** toward $0$ as degree increases (the degree-15 fit nearly interpolates every point). Test error is **U-shaped**: it drops as the model gains just enough flexibility, bottoms out near a moderate degree, then climbs sharply as high-degree terms chase noise — at degree $15$ the test MSE is several times the minimum. The lesson: pick the degree at the bottom of the U, not the degree with the smallest training error.',
      source: {
        title: 'The Elements of Statistical Learning (Ch. 7, Model Assessment and Selection)',
        authors: 'Hastie, T., Tibshirani, R. and Friedman, J.',
        url: 'https://web.stanford.edu/~hastie/ElemStatLearn/',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'A model achieves $1\\%$ training error but $20\\%$ validation error. This is the signature of:',
      options: [
        { text: 'High variance (overfitting).', correct: true },
        { text: 'High bias (underfitting).', correct: false },
        { text: 'Pure irreducible error.', correct: false },
        { text: 'A perfectly balanced model.', correct: false },
      ],
      explanation: 'Very low training error with a large gap to validation error means the model has memorized the training data, including its noise, and fails to generalize — high variance / overfitting. High bias would instead show high training error.',
    },
    {
      question: 'Both training error and validation error are high and roughly equal (e.g. $18\\%$ and $19\\%$). The model most likely suffers from:',
      options: [
        { text: 'High bias (underfitting) — it is too simple to capture the pattern.', correct: true },
        { text: 'High variance (overfitting).', correct: false },
        { text: 'Too much training data.', correct: false },
        { text: 'Over-regularization is impossible to diagnose here.', correct: false },
      ],
      explanation: 'When the model cannot even fit the training data well (high train error) and validation error is similar, the model family is too rigid for the signal — high bias / underfitting. The fix is more capacity or fewer constraints, not more data.',
    },
    {
      question: 'In the decomposition $\\mathbb{E}[(y - \\hat{f}(x))^2] = \\text{Bias}^2 + \\text{Variance} + \\sigma^2$, the term $\\sigma^2$ represents error that:',
      options: [
        { text: 'Cannot be removed by any model, because it comes from noise in the data itself.', correct: true },
        { text: 'Disappears once you collect enough training data.', correct: false },
        { text: 'Is removed by adding more model capacity.', correct: false },
        { text: 'Is the same as the bias squared.', correct: false },
      ],
      explanation: '$\\sigma^2$ is the variance of the noise $\\epsilon$ in $y = f(x) + \\epsilon$. It is the irreducible error floor — no choice of model, amount of data, or amount of tuning can push expected error below it.',
    },
    {
      question: 'Which statement about adding more training data is correct?',
      options: [
        { text: 'It mainly reduces variance and leaves bias largely unchanged.', correct: true },
        { text: 'It mainly reduces bias and leaves variance unchanged.', correct: false },
        { text: 'It reduces the irreducible error $\\sigma^2$.', correct: false },
        { text: 'It always reduces all three error terms equally.', correct: false },
      ],
      explanation: 'More data stabilizes the fit across samples, shrinking the variance term, but it does not change the model family, so a too-simple model keeps its bias. It also cannot reduce $\\sigma^2$, which is a property of the data noise, not the model.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
