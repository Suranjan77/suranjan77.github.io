import { LearningModule } from "./types";

export const ensembleLearning: LearningModule = {
  id: "ensemble-learning",
  title: "Ensemble Learning (RFs & GBMs)",
  category: "Ensemble Learning",
  prerequisites: ["decision-trees"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["decision-trees"],
  shortDescription: "The strategy of combining hundreds of 'okay' models together to create one unstoppable super-model.",
  estimatedMinutes: 30,
  learningObjectives: [
    'Distinguish between bagging and boosting ensemble methodologies',
    'Explain how Random Forests reduce correlation between base learners via feature bagging',
    'Formulate the gradient boosting update step and define pseudo-residuals',
    'Evaluate the trade-off between ensemble size, model diversity, and overfitting',
  ],
  keyTerms: [
    { term: 'Bagging (Bootstrap Aggregating)', definition: 'An ensemble method where multiple base learners are trained in parallel on bootstrap samples of the training data.' },
    { term: 'Boosting', definition: 'An ensemble method where base learners are trained sequentially, each trying to correct the errors of the prior models.' },
    { term: 'Out-Of-Bag (OOB) Error', definition: 'A method of measuring the prediction error of boostrapped ensembles by testing samples on trees that did not include them.' },
  ],
  workedExamples: [
    {
      title: 'Random Forest Variance Reduction',
      problem: 'Given single tree variance $\\sigma^2 = 1.0$, tree correlation $\\rho = 0.2$, calculate the ensemble variance for $B = 1$ tree vs $B = 100$ trees.',
      solution: 'For $B=1$: $\\text{Var} = 0.2 \\times 1.0 + \\frac{1-0.2}{1} \\times 1.0 = 1.0$. For $B=100$: $\\text{Var} = 0.2 \\times 1.0 + \\frac{0.8}{100} \\times 1.0 = 0.2 + 0.008 = 0.208$. The variance is reduced by nearly 80%.',
    },
  ],
  misconceptions: [
    {
      claim: 'Random Forests and Gradient Boosting always give identical predictions.',
      correction: 'Random Forests average predictions of independent trees (reducing variance), whereas Gradient Boosting adds predictions of sequential correction trees (reducing bias). Their decision boundaries and error profiles are different.'
    },
    {
      claim: 'An ensemble model with 1,000 trees is always much better than one with 100 trees.',
      correction: 'Variance reduction slows down dramatically after a certain number of trees (e.g. 100). Adding more trees increases training and inference time with negligible gains in accuracy.'
    }
  ],
  references: [
    {
      title: "Greedy Function Approximation: A Gradient Boosting Machine",
      authors: "Friedman, J.H",
      url: "https://projecteuclid.org",
      type: "textbook"
    },
    {
      title: "Ensemble Methods: Foundations and Algorithms",
      authors: "Zhou, Z.-H",
      url: "https://www.crcpress.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Boosting Overfitting via Learning Rate',
      description: 'If the boosting learning rate $\\nu$ is too high or the number of trees is too large, the model will fit noise in pseudo-residuals, causing overfitting.',
      mitigation: 'Shrink the learning rate (e.g. $\\nu = 0.01$) and use early stopping based on validation loss.'
    }
  ],

  fullDescription: `
Ensemble learning is based on a very simple idea: the wisdom of the crowd. Instead of trying to build one massive, incredibly complex algorithm that gets everything right, you build hundreds of simple, slightly flawed algorithms and have them vote on the final answer. 

There are two main ways to do this:
1. **Bagging (like Random Forests)**: You build hundreds of independent Decision Trees at the same time, but you give each tree a slightly different, randomized version of the data. When it's time to make a prediction, all the trees vote, and the majority wins.
2. **Boosting (like XGBoost or Gradient Boosting)**: You build trees one at a time. The first tree makes a prediction and inevitably gets some things wrong. The second tree is built specifically to fix the mistakes of the first tree. The third tree fixes the mistakes of the second, and so on.

### Where is it used?
If you have structured data in a spreadsheet (rows and columns), Ensemble Learning is almost certainly the best tool for the job. It absolutely dominates machine learning competitions like Kaggle. It is used heavily in algorithmic stock trading, credit risk scoring, and predicting customer behavior.
  `,

  intuition: `
**Bagging (Random Forests)**: Imagine you want to guess the exact number of jellybeans in a jar. If you ask one person, they might be way off. But if you ask 1,000 random people and average their guesses, the final answer is usually incredibly close to the truth. The errors of the individuals cancel each other out.

**Boosting (Gradient Boosting)**: Imagine you are taking a difficult math test. You take it once and get a 60%. A tutor looks at your test, ignores the questions you got right, and forces you to study *only* the specific types of questions you got wrong. You take the test again and get an 80%. A second tutor looks at your new mistakes and focuses only on those. By the end, you are getting a 100%.
  `,

  mathematics: `
### 1. Variance Reduction in Bagging
If a single decision tree has a variance (error rate) of $\\sigma^2$, and the trees in your forest have a correlation of $\\rho$ (meaning they make similar mistakes), the total error of a forest with $B$ trees is:

$$ \\text{Var}(\\text{ensemble}) = \\rho \\sigma^2 + \\frac{1-\\rho}{B} \\sigma^2 $$

Random Forests use a clever trick to force $\\rho$ to be as close to zero as possible: every time a tree wants to ask a question, it is only allowed to look at a random subset of the features. This forces the trees to be diverse, which mathematically guarantees a massive drop in the overall error rate.

### 2. Gradient Boosting Machines (GBM)
Gradient Boosting builds a model step-by-step. The final prediction $f_m(x)$ is just the prediction from the previous step $f_{m-1}(x)$, plus a tiny adjustment from a new, weak tree $h_m(x)$, scaled by a learning rate $\\nu$:

$$ f_m(x) = f_{m-1}(x) + \\nu \\, h_m(x) $$

How does it know what the new tree $h_m(x)$ should learn? It calculates the "pseudo-residuals"—which is just the calculus gradient of the loss function. It literally calculates exactly how wrong the current model is for every single data point:

$$ r_{im} = -\\left[\\frac{\\partial L(y_i, f(x_i))}{\\partial f(x_i)}\\right]_{f=f_{m-1}} $$

The new tree is then trained to predict those exact errors, perfectly counteracting the mistakes of the previous trees.
  `,

  pros: [
    "It is widely considered the absolute best approach for standard, tabular data (like Excel spreadsheets or SQL databases).",
    "Random Forests require almost no tuning. You can usually just run them with default settings and get an excellent result.",
    "They naturally handle missing data, weird outliers, and a mix of numbers and categories without breaking a sweat."
  ],

  cons: [
    "They are 'black boxes'. Because the final answer is a combination of hundreds of trees, it is very difficult to explain exactly *why* the model made a specific prediction.",
    "Boosting models (like XGBoost) are very sensitive to their settings. If you set the learning rate wrong, they will overfit and memorize the training data.",
    "They are large and slow to train compared to simple models like Linear Regression."
  ],

  codeSnippet: `import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

X = np.random.rand(100, 5)
y = (X[:, 0] + X[:, 1] > 1.0).astype(int)

# Random Forest implementation
rf = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
rf.fit(X, y)
print(f"Random Forest Accuracy: {rf.score(X, y):.2f}")

# Gradient Boosting implementation
gbm = GradientBoostingClassifier(n_estimators=50, learning_rate=0.1, max_depth=3)
gbm.fit(X, y)
print(f"Gradient Boosting Accuracy: {gbm.score(X, y):.2f}")`,
  tldr: [
    'An **ensemble** combines many base learners so the crowd outperforms any single model — the two workhorses are **bagging** (parallel) and **boosting** (sequential).',
    '**Bagging** (e.g. Random Forest) trains decorrelated trees on bootstrap samples and averages them; this mainly cuts **variance** without raising bias.',
    '**Boosting** (e.g. Gradient Boosting / XGBoost) fits learners sequentially to the residuals/gradients of the current model; this mainly cuts **bias**.',
    'Averaging $M$ models with per-model variance $\\sigma^2$ and pairwise correlation $\\rho$ gives variance $\\rho\\sigma^2 + \\frac{1-\\rho}{M}\\sigma^2$, so **decorrelation** ($\\rho \\to 0$) is what makes the forest powerful.',
    'Boosting can reach lower error than bagging on tabular data but **overfits** if you add too many trees or use too large a learning rate — control it with shrinkage and early stopping.',
    'For structured/tabular problems, gradient-boosted trees are the go-to default; random forests are the low-tuning, high-robustness baseline.',
  ],
  additionalSections: [
    {
      heading: 'Why averaging reduces variance: the bagging argument',
      content: `
Suppose you have $M$ base models whose predictions $\\hat{f}_1, \\dots, \\hat{f}_M$ are each unbiased with variance $\\sigma^2$. The bagged predictor is the average:

$$ \\bar{f} = \\frac{1}{M}\\sum_{i=1}^{M} \\hat{f}_i $$

**Independent case.** If the models are independent (identically distributed, $\\rho = 0$), the variance of the mean shrinks linearly with $M$:

$$ \\operatorname{Var}(\\bar{f}) = \\frac{1}{M^2}\\sum_{i=1}^{M}\\operatorname{Var}(\\hat{f}_i) = \\frac{M\\sigma^2}{M^2} = \\frac{\\sigma^2}{M} $$

Averaging $M$ independent estimators cuts variance by a factor of $M$, while leaving the (zero) bias untouched. This is the entire reason bagging works.

**Correlated case.** Real trees trained on bootstrap samples of the *same* data are not independent — they share structure and make similar mistakes. If every pair has correlation $\\rho$, then using $\\operatorname{Var}(\\bar{f}) = \\frac{1}{M^2}\\big(\\sum_i \\operatorname{Var}(\\hat{f}_i) + \\sum_{i \\neq j}\\operatorname{Cov}(\\hat{f}_i, \\hat{f}_j)\\big)$ with $\\operatorname{Cov} = \\rho\\sigma^2$ gives:

$$ \\operatorname{Var}(\\bar{f}) = \\rho\\sigma^2 + \\frac{1-\\rho}{M}\\sigma^2 $$

As $M \\to \\infty$ the second term vanishes but the first term $\\rho\\sigma^2$ **does not**. So no matter how many trees you add, correlation sets a floor on variance reduction. This is precisely why **Random Forests** add a second source of randomness — sampling a random subset of features at every split — to drive $\\rho$ down and lower that floor.
      `,
    },
    {
      heading: 'Why boosting reduces bias: sequential residual fitting',
      content: `
Boosting takes the opposite stance from bagging. Instead of averaging low-bias, high-variance learners, it combines many **high-bias, low-variance** weak learners (shallow trees) and reduces bias by fitting them in sequence. Starting from an initial guess $f_0$, each round adds a new learner scaled by a learning rate $\\nu$:

$$ f_m(x) = f_{m-1}(x) + \\nu \\, h_m(x) $$

The new learner $h_m$ is trained on the **pseudo-residuals** — the negative gradient of the loss at the current predictions:

$$ r_{im} = -\\left[\\frac{\\partial L(y_i, f(x_i))}{\\partial f(x_i)}\\right]_{f = f_{m-1}} $$

For squared-error loss $L = \\frac{1}{2}(y_i - f(x_i))^2$, this gradient is simply the ordinary residual $r_{im} = y_i - f_{m-1}(x_i)$, so each tree literally predicts what the current ensemble still gets wrong. Because every round drives the model toward the part of the target it has not yet captured, the **systematic error (bias) shrinks** step by step. The price is that the model has no automatic variance protection: keep adding trees and it will eventually fit noise, so shrinkage ($\\nu \\ll 1$) and early stopping are essential.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'Five trees in a forest classify a sample as classes $[1, 0, 1, 1, 0]$. What is the majority-vote prediction, and what would the averaged (soft) probability of class $1$ be if the trees output probabilities $[0.9, 0.4, 0.7, 0.6, 0.3]$?',
      difficulty: 'warm-up',
      solution: 'Hard vote: three trees say class $1$ and two say class $0$, so the majority vote is **class $1$**. Soft vote: average the probabilities, $(0.9 + 0.4 + 0.7 + 0.6 + 0.3)/5 = 2.9/5 = 0.58$. Since $0.58 > 0.5$, soft voting also predicts class $1$.',
    },
    {
      prompt: 'A single tree has variance $\\sigma^2 = 4$. Using the bagging variance formula, compute the ensemble variance for $M = 25$ trees when (a) the trees are independent ($\\rho = 0$) and (b) they are correlated with $\\rho = 0.3$.',
      difficulty: 'core',
      hint: 'Use $\\operatorname{Var} = \\rho\\sigma^2 + \\frac{1-\\rho}{M}\\sigma^2$.',
      solution: '(a) With $\\rho = 0$: $\\operatorname{Var} = 0 + \\frac{1}{25}\\times 4 = 0.16$ — a $25\\times$ reduction. (b) With $\\rho = 0.3$: $\\operatorname{Var} = 0.3 \\times 4 + \\frac{0.7}{25}\\times 4 = 1.2 + 0.112 = 1.312$. The correlation term $\\rho\\sigma^2 = 1.2$ dominates and sets a floor: even with infinitely many trees the variance cannot drop below $1.2$.',
    },
    {
      prompt: 'You are modeling a complex, highly non-linear tabular dataset where a single decision tree already trains with **low variance but high bias** (it underfits badly). Would bagging or boosting be the more appropriate first choice, and why?',
      difficulty: 'core',
      solution: 'Boosting. Bagging primarily reduces **variance**; averaging many already-low-variance learners barely helps if the dominant error is **bias** (underfitting). Boosting fits learners sequentially to the residuals/gradients of the current model, directly attacking bias and letting the ensemble represent the complex non-linear structure. Bagging would mostly reproduce the same underfit prediction many times.',
    },
    {
      prompt: 'For a Random Forest, derive the limiting ensemble variance as the number of trees $M \\to \\infty$, and explain why feature subsampling (limiting splits to a random subset of features) improves it.',
      difficulty: 'challenge',
      hint: 'Take the limit of $\\rho\\sigma^2 + \\frac{1-\\rho}{M}\\sigma^2$ and ask which term survives.',
      solution: 'As $M \\to \\infty$ the term $\\frac{1-\\rho}{M}\\sigma^2 \\to 0$, leaving $\\lim_{M\\to\\infty}\\operatorname{Var} = \\rho\\sigma^2$. So the *irreducible* part of the bagged variance is governed entirely by the pairwise correlation $\\rho$ between trees, not by how many trees you grow. Feature subsampling forces individual trees to split on different variables, decorrelating them and lowering $\\rho$. A lower $\\rho$ lowers the floor $\\rho\\sigma^2$, which is exactly why Random Forests beat plain bagged trees even though both average over many trees.',
    },
  ],
  comparisons: [
    {
      title: 'Bagging vs Boosting vs Stacking',
      methods: ['Bagging (Random Forest)', 'Boosting (Gradient Boosting / XGBoost)', 'Stacking'],
      rows: [
        {
          dimension: 'Primarily reduces',
          values: ['Variance', 'Bias (and some variance)', 'Both — corrects systematic errors of base models'],
        },
        {
          dimension: 'Training scheme',
          values: ['Parallel — trees are independent', 'Sequential — each learner fixes the last', 'Two-level — base models in parallel, a meta-learner on top'],
        },
        {
          dimension: 'Base learners',
          values: ['Deep, low-bias trees (decorrelated)', 'Shallow, high-bias weak learners', 'Heterogeneous models (trees, linear, kNN, ...)'],
        },
        {
          dimension: 'Overfitting risk',
          values: ['Low — more trees rarely hurts', 'High — too many trees / large $\\nu$ overfit', 'Moderate — meta-learner can overfit without CV'],
        },
        {
          dimension: 'Tuning effort',
          values: ['Low — strong defaults', 'High — learning rate, depth, n_estimators, early stopping', 'High — design base models and meta-learner'],
        },
        {
          dimension: 'Interpretability',
          values: ['Low (but cheap importances / OOB)', 'Low (importances + SHAP common)', 'Lowest — stacked layers obscure reasoning'],
        },
      ],
      takeaway: 'Reach for a Random Forest when you want a robust, low-tuning baseline; use gradient boosting to squeeze out the best tabular accuracy at the cost of careful tuning; use stacking to combine genuinely diverse models when the last bit of performance matters.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You have **structured / tabular** data (rows and columns) and want strong off-the-shelf accuracy.',
      'A single decision tree **overfits** (high variance) — bagging/Random Forest will stabilize it.',
      'You need to squeeze out **maximum accuracy** on a tabular benchmark and can afford to tune — gradient boosting usually wins.',
      'Features are a **mix of types** with missing values and outliers, which tree ensembles handle gracefully.',
    ],
    avoidWhen: [
      'You need a **transparent, fully interpretable** model for regulators or stakeholders — a single tree or linear model is easier to explain.',
      'The signal is genuinely **linear and low-dimensional** — a regularized linear model is faster and just as accurate.',
      'You are working with **unstructured data** (images, audio, raw text) where deep learning dominates.',
      'You have a **very tight latency or memory budget** at inference — hundreds of trees can be too heavy.',
    ],
    rulesOfThumb: [
      'Start with a Random Forest as a tough baseline before investing time tuning a boosting model.',
      'For boosting, use a **small learning rate** ($\\nu \\approx 0.01$–$0.1$) with **early stopping** on a validation set rather than guessing n_estimators.',
      'Diversity is the whole game: decorrelated base learners help, near-identical ones do not.',
      'Use **out-of-bag (OOB) error** for a free validation estimate on bagged ensembles.',
    ],
  },
  caseStudies: [
    {
      title: 'Gradient boosting dominating tabular machine-learning competitions',
      domain: 'Competitive ML / tabular prediction',
      scenario: 'Teams competing on structured tabular datasets (click prediction, ranking, risk scoring) need the highest possible accuracy. The question is which model family consistently delivers winning results on this kind of data.',
      approach: 'Chen and Guestrin introduced **XGBoost**, a scalable, regularized gradient-boosted tree system with sparsity-aware split finding and a clever cache/out-of-core design, and benchmarked it across competition and production workloads.',
      outcome: 'XGBoost became the dominant tool for tabular problems: among the **29 winning solutions** published on Kaggle in 2015, **17 used XGBoost** (with **8 using it as the sole learner**), and it powered the top entries of the KDDCup 2015. It also ran roughly an order of magnitude faster than existing implementations on a single machine and scaled to billions of examples. The lesson: well-tuned gradient boosting, not a single tree or linear model, is the default winner on structured data.',
      source: {
        title: 'XGBoost: A Scalable Tree Boosting System',
        authors: 'Chen, T. and Guestrin, C.',
        url: 'https://arxiv.org/abs/1603.02754',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'What is the primary error component that bagging (e.g. a Random Forest) reduces?',
      options: [
        { text: 'Variance — averaging many decorrelated models cancels their individual fluctuations.', correct: true },
        { text: 'Bias — each tree is forced to underfit less.', correct: false },
        { text: 'Irreducible noise in the data labels.', correct: false },
        { text: 'Training time, by parallelizing the trees.', correct: false },
      ],
      explanation: 'Bagging averages many high-variance, low-bias learners. Averaging leaves bias roughly unchanged but shrinks variance toward $\\rho\\sigma^2$, so its main effect is **variance** reduction. It cannot remove irreducible noise, and while trees can train in parallel, that is a speed property, not the statistical reason bagging works.',
    },
    {
      question: 'Boosting reduces error mainly by:',
      options: [
        { text: 'Sequentially fitting each new learner to the residuals/gradients of the current model, which lowers bias.', correct: true },
        { text: 'Averaging many independent trees trained in parallel.', correct: false },
        { text: 'Selecting a random subset of features at every split.', correct: false },
        { text: 'Removing outliers before training each tree.', correct: false },
      ],
      explanation: 'Boosting is **sequential**: each weak learner is trained on what the current ensemble still gets wrong (the pseudo-residuals / negative gradient), so the systematic error (bias) drops round by round. Parallel averaging and per-split feature sampling describe bagging / Random Forests, not boosting.',
    },
    {
      question: 'In the bagged-variance formula $\\rho\\sigma^2 + \\frac{1-\\rho}{M}\\sigma^2$, why do diverse (decorrelated) base learners matter so much?',
      options: [
        { text: 'As $M \\to \\infty$ the variance approaches $\\rho\\sigma^2$, so lowering $\\rho$ lowers the floor that adding trees cannot beat.', correct: true },
        { text: 'Lower $\\rho$ increases the bias term, balancing the model.', correct: false },
        { text: 'Correlation has no effect once you use enough trees.', correct: false },
        { text: 'Diversity mainly speeds up training rather than improving accuracy.', correct: false },
      ],
      explanation: 'Sending $M \\to \\infty$ kills the $\\frac{1-\\rho}{M}\\sigma^2$ term but leaves $\\rho\\sigma^2$. That residual floor is set entirely by the pairwise correlation, so decorrelating the learners (e.g. via feature subsampling) is what actually lowers the achievable variance — more trees alone cannot get past it.',
    },
    {
      question: 'Which statement about overfitting in boosting is correct?',
      options: [
        { text: 'Adding too many trees or using too large a learning rate can overfit, so shrinkage and early stopping are used.', correct: true },
        { text: 'Boosting cannot overfit because each tree is weak.', correct: false },
        { text: 'More boosting rounds always improve test accuracy monotonically.', correct: false },
        { text: 'Overfitting in boosting is fixed by increasing the learning rate.', correct: false },
      ],
      explanation: 'Unlike bagging, boosting has no built-in variance protection: it keeps driving down training error and will eventually fit noise in the residuals. Test error typically improves then worsens, so practitioners use a **small learning rate** ($\\nu$) plus **early stopping**. Increasing $\\nu$ makes overfitting worse, not better.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
