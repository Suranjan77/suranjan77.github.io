import { LearningModule } from "./types";

export const gradientBoosting: LearningModule = {
  id: "gradient-boosting",
  title: "Gradient Boosting",
  category: "Ensemble Learning",
  prerequisites: ["decision-trees", "ensemble-learning"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["ensemble-learning", "decision-trees", "regularization", "model-evaluation"],
  shortDescription:
    "Build a strong predictor by adding many shallow trees one at a time, each fit to the errors the current ensemble still makes — a stage-wise descent down the loss gradient that powers XGBoost and LightGBM.",
  estimatedMinutes: 35,
  learningObjectives: [
    "Explain the additive, stage-wise nature of boosting and how it differs from bagging's parallel averaging",
    "Derive boosting as gradient descent in function space, where each tree approximates the negative gradient (the residual for squared loss)",
    "Use the key regularizers — learning-rate shrinkage, tree depth, subsampling, and early stopping — to control overfitting",
    "Describe what XGBoost and LightGBM add (second-order objective, regularized splits, histogram/leaf-wise growth) and when to reach for boosting",
  ],
  keyTerms: [
    {
      term: "Boosting",
      definition:
        "An ensemble method that adds weak learners sequentially, each one correcting the errors of the running ensemble, so the models are trained in a dependent chain rather than independently.",
    },
    {
      term: "Shrinkage (Learning Rate)",
      definition:
        "A factor $\\nu \\in (0,1]$ that scales each new tree's contribution. Smaller values need more trees but generalize better — the single most important boosting regularizer.",
    },
    {
      term: "Functional Gradient",
      definition:
        "The gradient of the loss with respect to the model's predictions. Boosting fits each new tree to the negative functional gradient, so it is gradient descent performed in the space of functions.",
    },
    {
      term: "Early Stopping",
      definition:
        "Halting the addition of trees when a validation metric stops improving, capping model complexity at the point of best generalization.",
    },
  ],
  misconceptions: [
    {
      claim:
        "Boosting and bagging are basically the same ensemble idea.",
      correction:
        "Bagging (e.g. random forests) trains many high-variance trees independently in parallel and averages them to cut variance. Boosting trains shallow, high-bias trees sequentially, each fixing the residual errors of the last, primarily reducing bias. They attack opposite parts of the error.",
    },
    {
      claim:
        "A bigger learning rate just trains faster with no downside.",
      correction:
        "The learning rate is a regularizer, not a speed knob. Large steps let each tree overfit the current residuals, hurting generalization; the standard recipe is a small rate (e.g. 0.05–0.1) with more trees and early stopping.",
    },
    {
      claim:
        "Gradient boosting only works for regression with squared-error residuals.",
      correction:
        "Squared loss makes the negative gradient equal the plain residual, which is the easy case to picture. For any differentiable loss (logistic, Poisson, ranking objectives) each tree simply fits the negative gradient of that loss — boosting is general gradient descent in function space.",
    },
  ],
  references: [
    {
      title: "Greedy Function Approximation: A Gradient Boosting Machine",
      authors: "Friedman, J. H.",
      url: "https://projecteuclid.org/euclid.aos/1013203451",
      type: "paper",
    },
    {
      title: "XGBoost: A Scalable Tree Boosting System",
      authors: "Chen, T. and Guestrin, C.",
      url: "https://arxiv.org/abs/1603.02754",
      type: "paper",
    },
    {
      title: "LightGBM: A Highly Efficient Gradient Boosting Decision Tree",
      authors: "Ke, G., Meng, Q., Finley, T., Wang, T., et al.",
      url: "https://papers.nips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Overfitting from too many trees or too large a learning rate",
      description:
        "Because boosting keeps reducing training error, an unchecked ensemble with a high learning rate or thousands of trees will eventually fit noise, and test error turns back up.",
      mitigation:
        "Use a small learning rate with early stopping on a validation set, cap tree depth (commonly 3–8), and add row/column subsampling and L1/L2 leaf penalties (as XGBoost does).",
    },
    {
      name: "Sensitivity to noisy labels and outliers",
      description:
        "Sequential residual fitting means later trees chase the largest current errors, so mislabeled points or outliers can dominate and distort the ensemble.",
      mitigation:
        "Use robust losses (Huber, quantile) instead of squared error, clean or down-weight outliers, and rely on subsampling and shrinkage to limit any single point's influence.",
    },
  ],
  fullDescription: `
Gradient boosting turns a crowd of *weak* learners — typically shallow decision trees that are barely better than guessing — into one of the most accurate models available for tabular data. The trick is **sequential correction**: each new tree is trained on the mistakes the ensemble has made so far.

### The loop
1. Start with a trivial prediction (for regression, the mean of the targets).
2. Compute the **residuals** — how far off the current ensemble is on each example.
3. Fit a new shallow tree to those residuals.
4. Add a *shrunken* fraction of that tree to the ensemble.
5. Repeat for hundreds or thousands of rounds.

Each round nudges the predictions a little closer to the targets, descending the loss one small, tree-shaped step at a time.

### Why it is so effective
Boosting attacks **bias**: the weak learners are deliberately too simple to overfit individually, but their sum becomes expressive. Modern implementations — **XGBoost**, **LightGBM**, **CatBoost** — wrap this idea in a regularized, second-order objective with clever engineering (histogram-binned splits, leaf-wise growth, parallelization, built-in handling of missing values), and they routinely win on structured data where deep nets struggle. The cost is that the sequential dependence makes training harder to parallelize than bagging and the model more sensitive to its hyperparameters.
  `,
  intuition: `
Picture a student practicing archery. The first shot lands well below and left of the bull's-eye — that gap *is* the residual. The coach does not start over; instead they whisper a small correction: "next time aim a touch higher and right." Shot two is closer; the new gap suggests another small tweak. After many rounds of "look at the current error, make a small adjustment toward it," the arrows cluster on target.

Gradient boosting is exactly this coaching loop, with shallow trees as the corrections. No single tree tries to hit the target outright — each only points at the *current* error and contributes a fraction of the fix (that fraction is the learning rate). Bagging, by contrast, is like asking a hundred archers to shoot at once and averaging where their arrows land: it steadies a shaky aim (variance) but cannot teach a systematically-off archer to aim better (bias). Boosting teaches; bagging averages.
  `,
  mathematics: `
### 1. Additive model
Boosting builds an additive ensemble of $M$ functions (trees) $h_m$ with weights $\\nu$ (the learning rate):

$$ F_M(x) = F_0(x) + \\nu \\sum_{m=1}^{M} h_m(x). $$

### 2. Gradient descent in function space
We want to minimize the total loss $\\sum_i L(y_i, F(x_i))$. At round $m$, treat the current predictions as the variable and take the negative gradient of the loss at each point — the **pseudo-residual**:

$$ r_{im} = -\\left[\\frac{\\partial L(y_i, F(x_i))}{\\partial F(x_i)}\\right]_{F=F_{m-1}}. $$

The new tree $h_m$ is fit (by least squares) to these pseudo-residuals, so adding it moves $F$ in the steepest-descent direction:

$$ F_m(x) = F_{m-1}(x) + \\nu\\, h_m(x). $$

### 3. The squared-loss special case
For $L = \\tfrac{1}{2}(y-F)^2$, the gradient is simply $\\partial L / \\partial F = -(y-F)$, so the pseudo-residual is the **ordinary residual**:

$$ r_{im} = y_i - F_{m-1}(x_i). $$

This is why the canonical picture is "fit the next tree to what's left over." For other losses (logistic for classification, Huber for robustness) the same recipe holds with a different gradient.
  `,
  pros: [
    "State-of-the-art accuracy on tabular/structured data — often the top performer in practice and in competitions.",
    "Flexible: works with any differentiable loss (regression, classification, ranking) by fitting the loss's negative gradient.",
    "Strong, well-understood regularization knobs (shrinkage, depth, subsampling, early stopping) give fine control over the bias–variance trade-off.",
  ],
  cons: [
    "Sequential training is harder to parallelize than bagging and can be slow for very large numbers of trees.",
    "Sensitive to hyperparameters (learning rate, depth, number of trees) and to noisy labels/outliers, so it needs careful tuning and validation.",
    "Less interpretable than a single tree, and an unchecked ensemble will overfit because it keeps driving training error down.",
  ],
  codeSnippet: `import numpy as np
from sklearn.tree import DecisionTreeRegressor

# Gradient boosting for squared loss, by hand: each tree fits the residuals.
rng = np.random.RandomState(0)
X = np.sort(rng.rand(120, 1), axis=0)
y = np.sin(6 * X[:, 0]) + 0.1 * rng.randn(120)

lr = 0.1                       # shrinkage: each tree contributes only a fraction
F = np.full_like(y, y.mean())  # F_0 = mean prediction
trees = []

for m in range(200):
    residual = y - F                       # = negative gradient of 0.5*(y-F)^2
    stump = DecisionTreeRegressor(max_depth=2).fit(X, residual)
    F += lr * stump.predict(X)             # take a small step toward the targets
    trees.append(stump)

def predict(Xq):
    out = np.full(Xq.shape[0], y.mean())
    for t in trees:
        out += lr * t.predict(Xq)
    return out

print("Train MSE:", round(np.mean((y - predict(X)) ** 2), 4))
# In practice use XGBoost / LightGBM with early stopping instead of this loop.`,
  tldr: [
    "Gradient boosting is an **additive, stage-wise** ensemble: add shallow trees one at a time, each fit to the **errors the current ensemble still makes**.",
    "It is **gradient descent in function space** — each tree approximates the negative gradient of the loss (for squared loss, exactly the **residual**).",
    "It reduces **bias** by combining deliberately weak learners; **bagging** (random forests) instead reduces **variance** by averaging independent strong trees.",
    "The **learning rate (shrinkage)** is the key regularizer: smaller steps + more trees + **early stopping** generalize better than fewer big steps.",
    "Works with **any differentiable loss** (regression, logistic classification, ranking) by fitting that loss's gradient.",
    "**XGBoost / LightGBM / CatBoost** add a regularized second-order objective and fast histogram/leaf-wise tree growth — the go-to models for tabular data.",
  ],
  additionalSections: [
    {
      heading: "Derivation: Boosting Is Gradient Descent in Function Space",
      content: `
Ordinary gradient descent updates a parameter vector $\\theta \\leftarrow \\theta - \\nu\\,\\nabla_\\theta L$. Friedman's insight was to perform the *same* update on the **function** $F$ itself rather than on parameters.

Consider the objective evaluated at the training points, $J(F) = \\sum_i L\\big(y_i, F(x_i)\\big)$, and treat the vector of predictions $\\big(F(x_1),\\dots,F(x_n)\\big)$ as the thing we optimize. The gradient component at point $i$ is

$$ g_i = \\frac{\\partial L\\big(y_i, F(x_i)\\big)}{\\partial F(x_i)}. $$

Steepest descent says: move each prediction in the direction $-g_i$. If we could set $F(x_i) \\leftarrow F(x_i) - \\nu\\,g_i$ pointwise we would be done — but that only updates the *training* points and gives no rule for new inputs. So we need a function that **generalizes** the negative-gradient direction to all of $x$.

That is exactly what fitting a tree does. We define the pseudo-residual $r_i = -g_i$ and fit a regression tree $h_m$ to the pairs $(x_i, r_i)$ by least squares. The tree is the best simple function that points, on average, in the negative-gradient direction *and* extends to unseen $x$. Updating

$$ F_m = F_{m-1} + \\nu\\,h_m $$

is therefore a single gradient-descent step taken in function space, with the learning rate $\\nu$ playing its usual role. For squared loss $L=\\tfrac12(y-F)^2$ we get $g_i = -(y_i - F(x_i))$, so the pseudo-residual is the ordinary residual and "fit the next tree to what's left over" is revealed as a special case of this general descent. Swap in the logistic loss and the same machinery produces classification boosting; swap in Huber loss and you get a robust variant — all from changing which gradient the trees chase.
      `,
    },
    {
      heading: "Why Shrinkage and Early Stopping Beat a Single Big Step",
      content: `
A natural question: if each tree points down the gradient, why scale it by a small $\\nu$ instead of taking the full step? The answer is regularization.

Each tree $h_m$ is fit to the *current* residuals, which include not just signal but also the noise the previous trees have not yet (and should not) explain. Taking a full step ($\\nu = 1$) lets a single tree aggressively absorb that noise, so the ensemble overfits fast and its test error bottoms out early and shallowly. Scaling by a small $\\nu$ (say $0.05$) means no one tree commits hard to the current residual pattern; many small, partially-overlapping corrections **average out the noise** while still accumulating the signal — much like a small SGD learning rate yields a smoother optimization path. Empirically this lowers the achievable test error, at the cost of needing proportionally more trees (roughly $M \\propto 1/\\nu$).

This sets up a clean recipe. Because training error decreases monotonically with more trees but *validation* error is U-shaped, you fix a small $\\nu$, keep adding trees, and **early-stop** at the validation minimum. Shrinkage controls how fast you travel; early stopping decides when to get off. Layer on tree-depth limits (capping interaction order), row subsampling (stochastic gradient boosting, which also speeds training), and column subsampling, and you have independent dials on the bias–variance trade-off — the reason a well-tuned boosting model is both highly accurate and controllably regularized.
      `,
    },
  ],
  comparisons: [
    {
      title: "Boosting vs Bagging (Random Forests)",
      methods: ["Gradient Boosting", "Bagging / Random Forest"],
      rows: [
        {
          dimension: "How trees are trained",
          values: [
            "Sequentially — each fits the previous ensemble's errors",
            "Independently, in parallel, on bootstrap samples",
          ],
        },
        {
          dimension: "Base learner",
          values: [
            "Shallow, high-bias trees (weak learners)",
            "Deep, high-variance trees (strong learners)",
          ],
        },
        {
          dimension: "Mainly reduces",
          values: ["Bias", "Variance"],
        },
        {
          dimension: "Overfitting behavior",
          values: [
            "Can overfit with too many trees — needs early stopping",
            "Adding trees does not overfit; it stabilizes",
          ],
        },
        {
          dimension: "Parallelism & tuning",
          values: [
            "Sequential; more hyperparameter-sensitive",
            "Embarrassingly parallel; robust defaults",
          ],
        },
      ],
      takeaway:
        "Reach for random forests when you want a strong, low-tuning baseline; reach for gradient boosting (XGBoost/LightGBM) when you will tune and want the last few points of accuracy on tabular data.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "You have **structured/tabular** data and want top-tier predictive accuracy.",
      "You can afford to **tune** (learning rate, depth, number of trees) and validate with early stopping.",
      "The task needs a **custom or non-squared loss** (logistic, Poisson, ranking) — boosting handles any differentiable objective.",
      "Features interact in moderate-order ways that shallow trees capture well, and you value built-in handling of missing values (XGBoost/LightGBM).",
    ],
    avoidWhen: [
      "You need a **fast, low-tuning baseline** — a random forest is more forgiving out of the box.",
      "Data is **very noisy or has many mislabeled points**, where sequential residual-chasing amplifies errors unless you use robust losses.",
      "You require a **highly interpretable** single model, or have a hard real-time training-parallelism constraint the sequential algorithm cannot meet.",
      "The problem is perceptual (images, audio, text) where deep networks dominate — boosting is a tabular tool.",
    ],
    rulesOfThumb: [
      "Start with a small learning rate (0.05–0.1), depth 3–8, and let early stopping choose the number of trees.",
      "Trade learning rate against tree count: halving the rate roughly doubles the trees needed.",
      "Add row/column subsampling for both regularization and speed before reaching for more exotic tweaks.",
    ],
  },
  caseStudies: [
    {
      title: "XGBoost becomes the default winner of tabular ML competitions",
      domain: "Applied / competition machine learning",
      scenario:
        "By the mid-2010s, structured-data competitions on platforms like Kaggle needed a model that squeezed maximal accuracy out of heterogeneous tabular features with missing values — a regime where deep nets underperformed and single trees were too weak.",
      approach:
        "XGBoost implemented gradient boosting with a regularized, second-order (Newton) objective, sparsity-aware split finding for missing values, and a fast approximate histogram split algorithm with parallel and out-of-core training, exposing shrinkage, depth, and subsampling as tuning knobs with early stopping.",
      outcome:
        "Chen and Guestrin reported that XGBoost was used by the **majority of winning teams** in a survey of Kaggle competitions in 2015 — among 29 challenge-winning solutions published that year, **17 used XGBoost**, frequently as the core model — and it ran roughly an order of magnitude faster than existing implementations. Gradient boosting libraries (XGBoost, then LightGBM and CatBoost) have remained the default first model for tabular problems ever since.",
      source: {
        title: "XGBoost: A Scalable Tree Boosting System",
        authors: "Chen, T. and Guestrin, C.",
        url: "https://arxiv.org/abs/1603.02754",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "In gradient boosting for squared-error regression, what does each new tree fit?",
      options: [
        {
          text: "The residuals — what the current ensemble still gets wrong (the negative gradient of the loss).",
          correct: true,
        },
        {
          text: "A fresh bootstrap sample of the original targets, independently of other trees.",
          correct: false,
        },
        { text: "The raw targets, like every other tree in the ensemble.", correct: false },
        {
          text: "The features with the highest correlation to the label.",
          correct: false,
        },
      ],
      explanation:
        "Boosting is stage-wise: tree $m$ is fit to the pseudo-residuals $r_i = -\\partial L/\\partial F$. For squared loss this is exactly the ordinary residual $y_i - F_{m-1}(x_i)$, so each tree corrects the running ensemble's current errors. Bootstrap sampling of independent trees is bagging, not boosting.",
    },
    {
      question:
        "How does gradient boosting relate to gradient descent?",
      options: [
        {
          text: "It performs gradient descent in function space — each tree approximates the negative gradient of the loss, scaled by the learning rate.",
          correct: true,
        },
        {
          text: "It is unrelated; boosting uses no gradients, only tree splits.",
          correct: false,
        },
        {
          text: "It runs gradient descent on the pixels of the input.",
          correct: false,
        },
        {
          text: "It uses gradient descent only to prune the final tree.",
          correct: false,
        },
      ],
      explanation:
        "Treating the predictions as the variable, the negative gradient of the loss at each point is the steepest-descent direction. Fitting a tree to those pseudo-residuals and adding $\\nu\\,h_m$ takes one descent step that also generalizes to new inputs — gradient descent performed over functions rather than parameters.",
    },
    {
      question:
        "Why use a small learning rate (shrinkage) with many trees rather than a large rate with few?",
      options: [
        {
          text: "Small steps stop any single tree from overfitting the current residuals, so many small corrections average out noise and generalize better.",
          correct: true,
        },
        {
          text: "A small learning rate makes training faster overall.",
          correct: false,
        },
        {
          text: "A large learning rate is required for the math to converge at all.",
          correct: false,
        },
        {
          text: "The learning rate has no effect on generalization, only on speed.",
          correct: false,
        },
      ],
      explanation:
        "The learning rate is a regularizer. Full steps let one tree aggressively absorb noise in the residuals; small steps spread the correction over many partially-overlapping trees that average out noise while accumulating signal — lowering test error at the cost of needing roughly $1/\\nu$ times as many trees, with early stopping picking the count.",
    },
    {
      question:
        "Which statement best contrasts boosting with bagging?",
      options: [
        {
          text: "Boosting trains shallow trees sequentially to reduce bias; bagging trains deep trees in parallel and averages them to reduce variance.",
          correct: true,
        },
        {
          text: "Boosting and bagging both train trees independently and average them.",
          correct: false,
        },
        {
          text: "Bagging reduces bias while boosting reduces variance.",
          correct: false,
        },
        {
          text: "Boosting cannot use decision trees as base learners.",
          correct: false,
        },
      ],
      explanation:
        "Bagging (random forests) averages many independent high-variance trees to cut variance and does not overfit as trees are added. Boosting adds high-bias shallow trees in a dependent sequence, each correcting prior errors, mainly cutting bias — and it can overfit with too many trees, hence early stopping.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Explain why gradient boosting is described as 'gradient descent in function space,' and how the squared-error residual is a special case.",
      expectedAnswerRubric:
        "A strong answer should state that boosting treats the model's vector of predictions as the optimization variable and computes the negative gradient of the loss at each training point (the pseudo-residual), then fits a regression tree to those pseudo-residuals so that adding ν·h_m takes a steepest-descent step that also generalizes to new inputs — i.e. descent performed over functions rather than parameters, with ν as the learning rate. It should note that for squared loss L = ½(y−F)², the gradient ∂L/∂F = −(y−F), so the pseudo-residual equals the ordinary residual y − F_{m−1}, recovering the familiar 'fit the next tree to what's left over,' and that other differentiable losses (logistic, Huber) just change which gradient the trees chase.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
