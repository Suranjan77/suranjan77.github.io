import { LearningModule } from "./types";

export const regularization: LearningModule = {
  id: "regularization",
  title: "L1 & L2 Regularization",
  category: "Regularization",
  prerequisites: ["linear-regression", "bias-variance"],
  tracks: ["practitioner"],
  difficulty: 2,
  relatedModules: ["linear-regression", "logistic-regression", "bias-variance"],
  shortDescription: "Preventing overfitting by adding parameter penalty constraints (L1 Lasso and L2 Ridge) to the loss objective.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain the purpose of regularization in reducing variance',
    'Differentiate between L1 (Lasso) and L2 (Ridge) regularization mathematically and geometrically',
    'Describe why L1 regularization leads to parameter sparsity and feature selection',
    'List other regularization techniques such as dropout, early stopping, and data augmentation',
  ],
  keyTerms: [
    { term: 'L1 Regularization (Lasso)', definition: 'A regularization technique that adds a penalty equal to the sum of the absolute values of the weights.' },
    { term: 'L2 Regularization (Ridge)', definition: 'A regularization technique that adds a penalty equal to the sum of the squared values of the weights.' },
    { term: 'Sparsity', definition: 'A state where many model weights are exactly equal to zero, effectively removing the corresponding features.' },
  ],
  workedExamples: [
    {
      title: 'Regularized Loss calculation',
      problem: 'Given base MSE loss $L_0 = 2.0$, model weights $w = [3.0, -4.0]$, and regularization strength $\\lambda = 0.1$, calculate the total loss with L2 regularization.',
      solution: 'L2 penalty = $\\|w\\|_2^2 = 3.0^2 + (-4.0)^2 = 9.0 + 16.0 = 25.0$. Total Loss = $L_0 + \\lambda \\|w\\|_2^2 = 2.0 + 0.1 \\times 25.0 = 2.0 + 2.5 = 4.5$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Regularization is used to reduce model training error.',
      correction: 'Regularization adds a penalty that deliberately increases training error (adds bias) in order to decrease generalization/validation error on unseen data (reduces variance).'
    },
    {
      claim: 'L1 and L2 regularization cannot be combined.',
      correction: 'They are combined in a method called Elastic Net regularization, which balances the benefits of both sparsity and weight distribution.'
    }
  ],
  references: [
    {
      title: "Regression Shrinkage and Selection via the Lasso",
      authors: "Tibshirani, R",
      url: "https://www.jstor.org",
      type: "textbook"
    },
    {
      title: "Deep Learning (Chapter 7)",
      authors: "Goodfellow, I. et al",
      url: "https://www.deeplearningbook.org",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Underfitting',
      description: 'If the regularization strength $\\lambda$ is set too high, the penalty dominates, forcing weights to zero and preventing the model from learning patterns.',
      mitigation: 'Tune $\\lambda$ using cross-validation on a validation set.'
    }
  ],

  fullDescription: `
Regularization reduces overfitting by adding a penalty for overly large or complex model parameters. The model must now fit the data while keeping its weights under control.

- **L1 Regularization (Lasso)**: Adds a penalty proportional to the absolute values of the weights. This drives many parameters to exactly zero, producing **sparse models** and performing automatic feature selection.
- **L2 Regularization (Ridge / Weight Decay)**: Adds a penalty proportional to the squared values of the weights. This shrinks parameters toward zero but keeps them non-zero, distributing weights smoothly.
  `,

  intuition: `
Imagine fitting a model to noisy coordinates. Without penalties, the model can use extreme weights to chase every small fluctuation in the training set. That can reduce training loss while hurting generalization.

Regularization makes that behavior expensive.
Geometrically:
- **L1 constraint** forms a **diamond/cross** shape ($|w_1| + |w_2| \\le C$). Contours of the unregularized loss are most likely to intersect the constraint diamond at its sharp corners, which lie directly on the axes (meaning one weight is exactly $0$).
- **L2 constraint** forms a **circle/hypersphere** ($w_1^2 + w_2^2 \\le C^2$). Loss contours intersect the circle smoothly at non-zero values on both axes.
  `,

  mathematics: `
Let the original loss function (e.g., MSE) be $L_0(\\mathbf{w})$.

### 1. L1 Regularization (Lasso Loss)
Adds the $L_1$ norm penalty of the weight vector:

$$ L(\\mathbf{w}) = L_0(\\mathbf{w}) + \\lambda \\sum_{j=1}^{d} |w_j| = L_0(\\mathbf{w}) + \\lambda \\|\\mathbf{w}\\|_1 $$

Where $\\lambda \\ge 0$ is the regularization strength.

### 2. L2 Regularization (Ridge Regression Loss)
Adds the squared $L_2$ norm penalty of the weight vector:

$$ L(\\mathbf{w}) = L_0(\\mathbf{w}) + \\lambda \\sum_{j=1}^{d} w_j^2 = L_0(\\mathbf{w}) + \\lambda \\|\\mathbf{w}\\|_2^2 $$

### 3. Gradient Analysis (Weight Decay)
Under L2 regularization, the gradient update step for weight $w_j$ becomes:

$$ w_j \\leftarrow w_j - \\alpha \\left( \\frac{\\partial L_0}{\\partial w_j} + 2\\lambda w_j \\right) = (1 - 2\\alpha\\lambda)w_j - \\alpha \\frac{\\partial L_0}{\\partial w_j} $$

Where $(1 - 2\\alpha\\lambda) < 1$ shrinks the weight at every iteration (known as **weight decay**).
  `,

  pros: [
    "L1 performs feature selection, identifying the most predictive variables by zeroing out irrelevant ones.",
    "L2 handles collinearity (correlated features) effectively, sharing predictive weight among them.",
    "Highly effective at improving generalization performance on small or noisy datasets."
  ],

  cons: [
    "Choosing the hyperparameter $\\lambda$ requires validation or cross-validation.",
    "Lasso (L1) cannot yield analytical closed-form solutions (requires coordinate descent optimization).",
    "Extreme regularization causes high bias (underfitting), flattening the model predictions."
  ],

  codeSnippet: `import numpy as np
from sklearn.linear_model import Lasso, Ridge

# L1 Regularization (Lasso)
# alpha parameters map directly to lambda strength
lasso_reg = Lasso(alpha=0.1)
lasso_reg.fit(X, y)

# L2 Regularization (Ridge)
ridge_reg = Ridge(alpha=1.0)
ridge_reg.fit(X, y)
`,

  tldr: [
    'Regularization adds a penalty on the weights to the loss, trading a little extra **bias** for a lot less **variance**.',
    '**Ridge (L2)** penalizes $\\sum w_j^2$, giving a closed-form solution $\\hat\\beta = (X^TX + \\lambda I)^{-1}X^Ty$ that shrinks weights smoothly toward zero but never sets them exactly to $0$.',
    '**Lasso (L1)** penalizes $\\sum |w_j|$, which has corners on the axes — this geometry drives many weights to exactly $0$, giving automatic **feature selection** and sparse models.',
    '**Elastic Net** mixes L1 and L2 ($\\alpha$ controls the blend), keeping Lasso’s sparsity while sharing weight across correlated features like Ridge.',
    'The strength $\\lambda$ controls the bias-variance dial: $\\lambda = 0$ recovers plain OLS, while $\\lambda \\to \\infty$ shrinks all weights to (near) zero, causing severe underfitting.',
    'Always standardize features before regularizing — otherwise the penalty unfairly punishes large-scale features more than small-scale ones.',
  ],

  additionalSections: [
    {
      heading: 'Derivation: The Ridge Closed-Form Solution',
      content: `
Ridge regression minimizes the sum of squared residuals plus an L2 penalty on the weights:

$$ \\mathcal{L}(\\beta) = \\lVert y - X\\beta \\rVert^2 + \\lambda \\lVert \\beta \\rVert^2 = (y - X\\beta)^T(y - X\\beta) + \\lambda \\beta^T \\beta $$

Expand the quadratic term exactly as in OLS:

$$ \\mathcal{L}(\\beta) = y^Ty - 2\\beta^T X^T y + \\beta^T X^T X \\beta + \\lambda \\beta^T \\beta $$

Take the gradient with respect to $\\beta$. Using $\\nabla_\\beta(\\beta^T A \\beta) = 2A\\beta$ for symmetric $A$, and noting $\\lambda \\beta^T \\beta = \\lambda \\beta^T I \\beta$:

$$ \\nabla_\\beta \\mathcal{L} = -2X^Ty + 2X^TX\\beta + 2\\lambda \\beta $$

Set the gradient to zero and factor out $\\beta$:

$$ X^TX\\beta + \\lambda \\beta = X^Ty \\quad\\Longrightarrow\\quad (X^TX + \\lambda I)\\beta = X^Ty $$

$$ \\hat\\beta_{\\text{ridge}} = (X^TX + \\lambda I)^{-1} X^T y $$

**Why this guarantees invertibility.** $X^TX$ is always positive *semi*definite — for any vector $v$, $v^T(X^TX)v = \\lVert Xv \\rVert^2 \\ge 0$. If $X$ has collinear columns (rank-deficient), $X^TX$ has at least one zero eigenvalue and is singular, so $(X^TX)^{-1}$ does not exist (this is exactly OLS’s multicollinearity failure).

Adding $\\lambda I$ shifts **every** eigenvalue of $X^TX$ up by $\\lambda$. If $X^TX$ has eigen-decomposition with eigenvalues $\\mu_1, \\dots, \\mu_d \\ge 0$, then $X^TX + \\lambda I$ has eigenvalues $\\mu_1 + \\lambda, \\dots, \\mu_d + \\lambda$. For any $\\lambda > 0$, every eigenvalue is strictly positive, so the matrix is **positive definite** and therefore always invertible — regardless of whether $X^TX$ itself was singular. This is precisely why Ridge remains well-posed even with perfectly correlated or more features than samples ($d > n$), where OLS breaks down entirely.
      `,
    },
    {
      heading: 'Why Lasso (L1) Produces Sparsity but Ridge (L2) Does Not',
      content: `
**The geometric argument.** Both penalized problems can be rewritten as constrained optimization (by Lagrangian duality): minimize the unregularized loss $L_0(\\beta)$ subject to a budget on the weights — $\\sum |\\beta_j| \\le C$ for Lasso, or $\\sum \\beta_j^2 \\le C^2$ for Ridge. In two dimensions, the L1 budget region is a **diamond** (a square rotated 45°) with sharp corners sitting exactly on the axes, where one coordinate is $0$. The L2 budget region is a smooth **circle** with no preferred points — every boundary point has both coordinates non-zero.

The unconstrained loss $L_0(\\beta)$ has elliptical contours centered at the OLS solution $\\hat\\beta_{\\text{OLS}}$. The regularized solution is the point where the smallest such ellipse touches the constraint region. Because the diamond has corners, an ellipse is disproportionately likely to first touch the diamond exactly at a corner — i.e., at a point where one or more $\\beta_j = 0$. The circle has no corners, so the touching point almost always has every coordinate strictly non-zero; L2 shrinks coordinates but does not zero them out.

**The soft-thresholding argument (1D case).** Consider a single feature with the design column standardized so $X^TX = 1$ (e.g. $n$ orthonormal predictors), with OLS estimate $z = X^Ty$. The Lasso objective for one coefficient $\\beta$ is:

$$ f(\\beta) = \\frac{1}{2}(z - \\beta)^2 + \\lambda |\\beta| $$

Since $|\\beta|$ is not differentiable at $0$, use subgradients. For $\\beta > 0$: $f'(\\beta) = -(z-\\beta) + \\lambda = 0 \\Rightarrow \\beta = z - \\lambda$, valid only if $z > \\lambda$. For $\\beta < 0$: $\\beta = z + \\lambda$, valid only if $z < -\\lambda$. For $\\beta = 0$ to be optimal, the subgradient interval $[-\\lambda, \\lambda]$ of $|\\beta|$ at $0$ must contain $z$, i.e. $|z| \\le \\lambda$. Combining all three cases gives the **soft-thresholding operator**:

$$ \\hat\\beta_{\\text{lasso}} = S_\\lambda(z) = \\operatorname{sign}(z)\\,\\max(|z| - \\lambda, 0) $$

Whenever the unregularized estimate $z$ falls inside the band $[-\\lambda, \\lambda]$, Lasso snaps it to **exactly** $0$. Repeating the analogous derivation for Ridge in 1D, $f(\\beta) = \\frac{1}{2}(z-\\beta)^2 + \\lambda \\beta^2$, gives $f'(\\beta) = -(z - \\beta) + 2\\lambda\\beta = 0 \\Rightarrow \\hat\\beta_{\\text{ridge}} = \\frac{z}{1+2\\lambda}$ — a smooth rescaling that touches $0$ only in the limit $z \\to 0$, never snapping there for any finite, non-zero $z$. This is the algebraic root of why L1 selects features and L2 only shrinks them.
      `,
    },
  ],

  practiceExercises: [
    {
      prompt: 'You have one standardized predictor ($X^TX = 1$) with OLS estimate $z = X^Ty = 4$. Compute the Ridge coefficient with $\\lambda = 1$.',
      difficulty: 'warm-up',
      hint: 'Use $\\hat\\beta_{\\text{ridge}} = \\dfrac{z}{1+2\\lambda}$.',
      solution: '$\\hat\\beta_{\\text{ridge}} = \\dfrac{4}{1 + 2(1)} = \\dfrac{4}{3} \\approx 1.33$. Compare to the unregularized OLS estimate of $z = 4$: Ridge has shrunk it toward zero by a factor of $1/3$, but it remains non-zero.',
    },
    {
      prompt: 'For the same predictor ($z = 4$), compute the Lasso coefficient using soft-thresholding with $\\lambda = 1$ and then with $\\lambda = 5$.',
      difficulty: 'warm-up',
      hint: 'Use $\\hat\\beta_{\\text{lasso}} = \\operatorname{sign}(z)\\max(|z| - \\lambda, 0)$.',
      solution: 'With $\\lambda = 1$: $|z| = 4 > \\lambda$, so $\\hat\\beta = \\operatorname{sign}(4)(4 - 1) = 3$. With $\\lambda = 5$: $|z| = 4 \\le \\lambda$, so $\\hat\\beta = 0$ — the coefficient is killed entirely because the penalty exceeds the strength of evidence for that feature. This illustrates the sparsity threshold explicitly: any $|z| \\le \\lambda$ is zeroed out by Lasso, whereas Ridge would only ever approach (never reach) zero as $\\lambda$ grows.',
    },
    {
      prompt: 'Explain what happens to the Ridge solution $\\hat\\beta_{\\text{ridge}} = (X^TX + \\lambda I)^{-1}X^Ty$ as $\\lambda \\to 0$ and as $\\lambda \\to \\infty$. Connect each limit to the bias-variance tradeoff.',
      difficulty: 'core',
      hint: 'Think about what each limit does to the eigenvalues $\\mu_j + \\lambda$ of $X^TX + \\lambda I$.',
      solution: 'As $\\lambda \\to 0$, $X^TX + \\lambda I \\to X^TX$, so $\\hat\\beta_{\\text{ridge}} \\to \\hat\\beta_{\\text{OLS}} = (X^TX)^{-1}X^Ty$ (when this inverse exists) — zero bias from regularization but potentially high variance, especially with correlated or many features. As $\\lambda \\to \\infty$, every eigenvalue $\\mu_j + \\lambda$ is dominated by $\\lambda$, so $(X^TX+\\lambda I)^{-1} \\to \\frac{1}{\\lambda}I \\to 0$, forcing $\\hat\\beta_{\\text{ridge}} \\to 0$. This is maximal bias (the model predicts a constant, ignoring all features) but minimal variance (the estimate no longer depends on the noise in $y$ at all). The useful operating point is some intermediate $\\lambda$, chosen by cross-validation, that minimizes total expected test error = bias$^2$ + variance.',
    },
    {
      prompt: 'You train Ridge and Lasso on a dataset where two predictors $x_1$ and $x_2$ are nearly perfectly correlated (duplicates of each other) and both are genuinely predictive. Describe and justify how the fitted coefficient *paths* differ between the two methods as $\\lambda$ increases from $0$.',
      difficulty: 'challenge',
      hint: 'Think about the diamond-vs-circle constraint geometry directly along the line $\\beta_1 = \\beta_2$, and recall that Ridge’s penalty is a strictly convex function of each weight while Lasso’s is only convex (with a flat-ish region of indifference).',
      solution: 'With $x_1 \\approx x_2$, the loss is nearly constant along the line $\\beta_1 + \\beta_2 = k$ for any fixed combined contribution $k$ (the data cannot distinguish how credit is split between two identical columns). For **Ridge**, among all $(\\beta_1, \\beta_2)$ achieving the same $\\beta_1 + \\beta_2$, the L2 penalty $\\beta_1^2 + \\beta_2^2$ is uniquely minimized by splitting the weight evenly, $\\beta_1 = \\beta_2 = k/2$, because the squared penalty is strictly convex and symmetric — so Ridge’s coefficient paths for the two correlated features stay tied together and roughly equal as $\\lambda$ grows, both shrinking smoothly toward $0$. For **Lasso**, the L1 penalty $|\\beta_1| + |\\beta_2|$ is exactly the *same* value, $k$, for *every* such split (e.g. $(\\beta_1,\\beta_2) = (k,0)$ costs the same as $(k/2,k/2)$) — the L1 ball is flat-faced along that direction, so the optimizer has no preference and effectively picks one of the two arbitrarily (sensitive to tiny numerical perturbations), driving the other to exactly $0$. In practice Lasso’s coefficient paths for near-duplicate features are erratic: one path stays large while the other collapses to zero, and which one "wins" can flip with small data changes — a known instability that Elastic Net (mixing in an L2 term) is designed to fix by re-introducing the Ridge-style grouping effect.',
      tags: ['derivation', 'conceptual'],
    },
  ],

  comparisons: [
    {
      title: 'Ridge vs Lasso vs Elastic Net',
      methods: ['Ridge', 'Lasso', 'Elastic Net'],
      rows: [
        {
          dimension: 'Penalty term',
          values: ['L2: $\\lambda \\sum w_j^2$', 'L1: $\\lambda \\sum |w_j|$', 'Mix: $\\lambda\\left(\\alpha \\sum |w_j| + (1-\\alpha)\\sum w_j^2\\right)$'],
        },
        {
          dimension: 'Feature selection',
          values: ['No — shrinks but never reaches exactly $0$', 'Yes — drives many weights to exactly $0$', 'Yes — sparse, but less aggressively than pure Lasso'],
        },
        {
          dimension: 'Handling correlated features',
          values: ['Excellent — splits weight evenly across correlated features ("grouping effect")', 'Unstable — arbitrarily picks one of a correlated group, zeroing the rest', 'Good — groups correlated features like Ridge while still allowing sparsity'],
        },
        {
          dimension: 'Computational solution method',
          values: ['Closed-form: $(X^TX + \\lambda I)^{-1}X^Ty$', 'No closed form — coordinate descent or LARS', 'No closed form — coordinate descent (combines both penalty gradients)'],
        },
        {
          dimension: 'When to use',
          values: ['Many correlated features, want stable shrinkage, keep all features', 'Suspect a sparse true model, want automatic feature selection', 'High-dimensional + correlated features, want sparsity without Lasso’s instability'],
        },
      ],
      takeaway: 'Reach for Ridge when you want stable shrinkage and believe most features matter a little; reach for Lasso when you believe only a few features truly matter and want them named explicitly; reach for Elastic Net when both correlated structure and sparsity are present, which is the common case in high-dimensional real-world data.',
    },
  ],

  usageGuidance: {
    useWhen: [
      'You have **more features than you trust**, or more features than samples ($d \\ge n$), where plain OLS is unstable or impossible to compute.',
      'Your features are **correlated** and OLS coefficients are unstable or wildly large in magnitude (a sign of high variance).',
      'You want a model with built-in **feature selection** (Lasso/Elastic Net) to identify the small subset of variables that matter.',
      'You are seeing a large gap between training and validation error — i.e. the model is **overfitting** — and need a principled way to add bias and reduce variance.',
    ],
    avoidWhen: [
      'You have abundant data relative to the number of features and OLS is already stable and low-variance — added bias would only hurt.',
      'Interpretability of *unbiased* coefficients (e.g. for causal inference or formal statistical hypothesis testing) is essential, since regularized coefficients are intentionally biased.',
      'You haven’t standardized your features — the penalty will unfairly shrink large-scale features more than small-scale ones, distorting which variables look "important".',
      'The true relationship is highly non-linear and no amount of weight shrinkage will fix a fundamentally mis-specified linear model — consider tree ensembles or kernel methods instead.',
    ],
    rulesOfThumb: [
      'Always standardize (zero mean, unit variance) features before applying L1/L2 penalties, since the penalty is scale-sensitive.',
      'Select $\\lambda$ (and the Elastic Net mixing parameter $\\alpha$) via k-fold cross-validation, picking the largest $\\lambda$ within one standard error of the minimum CV error ("one-standard-error rule") for a simpler, more robust model.',
      'If you need feature selection but have many correlated predictors, prefer Elastic Net over pure Lasso to avoid its arbitrary, unstable feature-picking among correlated groups.',
    ],
  },

  caseStudies: [
    {
      title: 'Gene selection from microarray expression data',
      domain: 'Genomics / bioinformatics',
      scenario: 'A cancer classification study has gene-expression measurements for roughly **20,000 genes** but only a few hundred patient samples ($d \\gg n$) — the classic high-dimensional, low-sample-size setting where ordinary least squares is not even computable because $X^TX$ is singular.',
      approach: 'Researchers fit an L1-penalized (Lasso) regression/logistic model relating gene expression to a clinical outcome (e.g. tumor recurrence), sweeping $\\lambda$ via cross-validation. Elastic Net is often preferred in practice over pure Lasso because many genes in the same biological pathway are highly co-expressed (correlated), and pure Lasso would arbitrarily select just one gene per pathway while ignoring its correlated partners.',
      outcome: 'The penalty drives the vast majority of the ~20,000 gene coefficients to exactly zero, typically leaving a panel of only a few dozen genes (often 20-100) with non-zero weight — a result that is both statistically tractable and biologically interpretable as a candidate biomarker panel, at a modest cost in predictive accuracy compared to an (infeasible) unregularized fit.',
      source: {
        title: 'The Elements of Statistical Learning (Ch. 18, High-Dimensional Problems)',
        authors: 'Hastie, T., Tibshirani, R. and Friedman, J.',
        url: 'https://web.stanford.edu/~hastie/ElemStatLearn/',
        type: 'textbook',
      },
    },
  ],

  quiz: [
    {
      question: 'Why is the Ridge solution $(X^TX + \\lambda I)^{-1}X^Ty$ always computable, even when $X^TX$ is singular?',
      options: [
        { text: 'Adding $\\lambda I$ ($\\lambda > 0$) shifts every eigenvalue of $X^TX$ up by $\\lambda$, making all eigenvalues strictly positive and the matrix invertible.', correct: true },
        { text: 'Ridge regression does not actually require matrix inversion.', correct: false },
        { text: '$X^TX$ is never singular in practice.', correct: false },
        { text: 'The $\\lambda I$ term cancels out the singular directions of $X^TX$.', correct: false },
      ],
      explanation: '$X^TX$ is positive semidefinite with eigenvalues $\\mu_j \\ge 0$; if any $\\mu_j = 0$ it is singular. Adding $\\lambda I$ produces eigenvalues $\\mu_j + \\lambda$, all strictly positive for $\\lambda > 0$, so $X^TX + \\lambda I$ is positive definite and always invertible — regardless of collinearity or $d > n$.',
    },
    {
      question: 'Geometrically, why does L1 (Lasso) regularization tend to produce sparse solutions while L2 (Ridge) does not?',
      options: [
        { text: 'The L1 constraint region is a diamond with corners on the axes, which loss contours are likely to touch exactly where some coefficients are zero; the L2 constraint region is a smooth circle with no such corners.', correct: true },
        { text: 'L1 regularization uses a smaller value of $\\lambda$ by convention.', correct: false },
        { text: 'L2 regularization is not actually convex.', correct: false },
        { text: 'Lasso explicitly removes features before training begins.', correct: false },
      ],
      explanation: 'The Lagrangian dual view turns both penalties into a budget constraint on the weights. L1’s diamond-shaped budget region has sharp corners sitting on the coordinate axes (where one or more weights are exactly zero), and elliptical loss contours are disproportionately likely to first touch the region at those corners. L2’s circular region has no corners, so the optimum almost always has every coordinate non-zero.',
    },
    {
      question: 'In the 1D soft-thresholding solution $\\hat\\beta_{\\text{lasso}} = \\operatorname{sign}(z)\\max(|z|-\\lambda, 0)$, what happens when $|z| \\le \\lambda$?',
      options: [
        { text: 'The coefficient is set to exactly $0$.', correct: true },
        { text: 'The coefficient equals $z$ unchanged.', correct: false },
        { text: 'The coefficient flips sign.', correct: false },
        { text: 'The solution becomes undefined.', correct: false },
      ],
      explanation: 'When the magnitude of the unregularized estimate $z$ does not exceed the penalty strength $\\lambda$, $\\max(|z|-\\lambda, 0) = 0$, so the Lasso coefficient is snapped to exactly zero. This threshold behavior is the algebraic source of Lasso’s sparsity and has no analog in Ridge’s smooth rescaling $z/(1+2\\lambda)$.',
    },
    {
      question: 'Two features are near-perfect duplicates of each other. What is the key practical difference between how Ridge and Lasso handle them?',
      options: [
        { text: 'Ridge splits the weight evenly between the two (grouping effect); Lasso tends to arbitrarily keep one and zero out the other, which can be unstable.', correct: true },
        { text: 'Both methods always keep exactly one of the two features.', correct: false },
        { text: 'Ridge always zeros out both features; Lasso always keeps both.', correct: false },
        { text: 'There is no practical difference between the two methods in this case.', correct: false },
      ],
      explanation: 'Because the L2 penalty is strictly convex, Ridge’s unique minimizer splits credit evenly across duplicated/correlated features. The L1 penalty is flat along directions that redistribute weight between duplicate features, so Lasso has no preference and can arbitrarily assign all the weight to one of them while zeroing the other — a known instability that Elastic Net mitigates by blending in an L2 term.',
    },
  ],

  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
