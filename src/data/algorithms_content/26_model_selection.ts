import { LearningModule } from "./types";

export const modelSelection: LearningModule = {
  id: "model-selection",
  title: "Model Selection and Cross-Validation",
  category: "Model Selection and Cross-Validation",
  prerequisites: ["evaluation-metrics"],
  tracks: ["practitioner"],
  difficulty: 2,
  estimatedMinutes: 30,
  shortDescription: "Techniques for estimating model performance on unseen data, tuning hyperparameters, and avoiding selection bias.",
  learningObjectives: [
    "Contrast holdout validation, K-fold cross-validation, and Stratified K-fold cross-validation.",
    "Formulate hyperparameter tuning methods including Grid Search and Random Search.",
    "Identify sources of selection bias and implement Nested Cross-Validation to mitigate them.",
    "Construct and interpret learning curves to diagnose high bias (underfitting) vs high variance (overfitting).",
    "Explain when to use Leave-One-Out (LOOCV) cross-validation based on dataset size."
  ],
  keyTerms: [
    {
      term: "K-Fold Cross-Validation",
      definition: "A validation technique where the dataset is partitioned into K equal-sized folds; the model is trained K times, each time using K-1 folds for training and the remaining fold for testing."
    },
    {
      term: "Stratified K-Fold",
      definition: "A variation of K-fold cross-validation where each fold contains approximately the same percentage of samples of each target class as the complete dataset."
    },
    {
      term: "Nested Cross-Validation",
      definition: "An outer cross-validation loop to estimate model generalization performance, combined with an inner cross-validation loop to perform hyperparameter tuning."
    },
    {
      term: "Hyperparameters",
      definition: "Configuration variables external to the model that cannot be learned directly from data (e.g. learning rate, number of neighbors, regularization strength) and must be set before training."
    }
  ],
  workedExamples: [
    {
      title: "Average Score and Variance in K-Fold",
      problem: "A 5-fold cross-validation is performed on a regression model. The resulting $R^2$ scores on the validation folds are: $[0.78, 0.82, 0.75, 0.88, 0.81]$. Compute the average cross-validation score and the sample standard deviation of the validation scores.",
      solution: "First, compute the mean $\\mu$:\n$$\\mu = \\frac{0.78 + 0.82 + 0.75 + 0.88 + 0.81}{5} = \\frac{4.04}{5} = 0.808$$\n\nNext, compute the squared differences from the mean:\n- $(0.78 - 0.808)^2 = (-0.028)^2 = 0.000784$\n- $(0.82 - 0.808)^2 = (0.012)^2 = 0.000144$\n- $(0.75 - 0.808)^2 = (-0.058)^2 = 0.003364$\n- $(0.88 - 0.808)^2 = (0.072)^2 = 0.005184$\n- $(0.81 - 0.808)^2 = (0.002)^2 = 0.000004$\n\nSum of squared differences: $0.00948$.\n\nSample variance ($s^2$): \n$$s^2 = \\frac{0.00948}{5 - 1} = \\frac{0.00948}{4} = 0.00237$$\n\nSample standard deviation ($s$):\n$$s = \\sqrt{0.00237} \\approx 0.0487$$"
    }
  ],
  misconceptions: [
    {
      claim: "If you find the hyperparameters that maximize validation performance during cross-validation, that average score is an unbiased estimate of the model's performance on new data.",
      correction: "Tuning hyperparameters on the validation folds means information about those folds leaks into the selection process. The resulting validation score will be optimistically biased. You must use a separate test set, or Nested Cross-Validation, to get an unbiased estimate."
    },
    {
      claim: "Cross-validation creates multiple models, so the final production model is an ensemble of those K models.",
      correction: "Cross-validation is only used to evaluate the training procedure and select hyperparameters. Once the optimal hyperparameters are chosen, the final model is trained on the *entire* training dataset using those selected hyperparameters."
    }
  ],
  references: [
    {
      title: "An Introduction to Statistical Learning",
      authors: "Gareth James, Daniela Witten, Trevor Hastie, and Robert Tibshirani",
      url: "https://www.statlearning.com/",
      type: "textbook"
    },
    {
      title: "Scikit-Learn Cross-Validation Guide",
      url: "https://scikit-learn.org/stable/modules/cross_validation.html",
      type: "documentation"
    }
  ],
  failureModes: [
    {
      name: "Leakage of Temporal Data",
      description: "Applying standard K-fold cross-validation on time-series data leaks future values into the training set, leading to artificially inflated accuracy scores.",
      mitigation: "Use TimeSeriesSplit (rolling origin validation) where the training set only contains data prior to the validation fold."
    }
  ],
  pros: [
    "Provides a much more stable and robust performance estimate than a single train/test split.",
    "Ensures every single sample is used for validation exactly once.",
    "Crucial for tuning hyperparameters without overfitting."
  ],
  cons: [
    "Can be computationally expensive: training the model K times instead of once.",
    "Requires careful division of data (e.g. group-k-fold) to prevent label leakage between related clusters."
  ],
  intuition: "Imagine preparing for a major exam. If you only practice on one set of sample questions (the training set), you might memorize the answers and do terribly on the real test. If you save a small subset of practice questions (the holdout validation set), you get a better test of your skills. Cross-validation is like dividing all your practice questions into 5 piles. You study from 4 piles and test yourself on the 5th. You repeat this 5 times, rotating the test pile. The average score across all 5 tests is a very reliable indicator of how ready you are for the real exam.",
  mathematics: "### K-Fold Cross-Validation\n\nLet the dataset $D$ be split into $K$ disjoint, equal-sized subsets $F_1, \\dots, F_K$. Let $M(\\mathbf{x}; \\theta)$ be a model parameterized by $\\theta$.\n\nFor each fold $k \\in \\{1, \\dots, K\\}$:\n1. Train the model on the remaining folds: $D \\setminus F_k$ to obtain parameters $\\theta_k$.\n2. Compute the validation loss on $F_k$:\n   $$E_k = \\frac{1}{|F_k|} \\sum_{i \\in F_k} L(y_i, M(x_i; \\theta_k))$$\nwhere $L$ is the loss function.\n\nThe overall cross-validation error estimate is the average:\n$$CV = \\frac{1}{K} \\sum_{k=1}^{K} E_k$$\n\n### Grid Search vs Random Search\n\nTo find optimal hyperparameters $\\lambda$:\n- **Grid Search:** Evaluates a pre-defined Cartesian product grid of hyperparameter values $\\Lambda = \\Lambda_1 \\times \\dots \\times \\Lambda_m$.\n- **Random Search:** Samples values for each hyperparameter from a probability distribution over a specified range for a fixed number of iterations $T$:\n  $$\\lambda_t \\sim p(\\lambda), \\quad t=1,\\dots,T$$\n\n### Nested Cross-Validation\n\nNested CV uses an inner loop for hyperparameter search and an outer loop for evaluation:\n1. Outer Loop: Split data into $K$ outer folds. For each outer fold $k$:\n   1. Inner Loop: Split the remaining $K-1$ folds into $J$ inner folds.\n   2. For each hyperparameter candidate, perform $J$-fold CV. Select candidate $\\lambda^*$ with the best average score.\n   3. Train the model on the entire $K-1$ outer folds using $\\lambda^*$ to obtain $\\theta_k^*$.\n   4. Evaluate $\\theta_k^*$ on outer fold $k$ to get $E_k$.\n2. Unbiased performance estimate is $\\frac{1}{K}\\sum_k E_k$.",
  fullDescription: "Model selection is the process of choosing the best machine learning model from a set of candidates (e.g. linear vs polynomial regression, or SVM vs Decision Tree), or choosing the best hyperparameters for a given model. Cross-validation is the standard practice for estimating how well a model generalizes to unseen data, forming the backbone of model selection and parameter optimization pipelines.",
  codeSnippet: `/**
 * Simple K-Fold split generator. Returns arrays of training and validation indexes.
 */
export function kFoldSplits(
  numSamples: number,
  k: number = 5,
  shuffle: boolean = true,
  seed: number = 42
): Array<{ trainIndices: number[]; valIndices: number[] }> {
  const indices = Array.from({ length: numSamples }, (_, i) => i);

  if (shuffle) {
    // Deterministic shuffle
    let state = seed | 0;
    const random = () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    for (let i = numSamples - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }
  }

  const splits: Array<{ trainIndices: number[]; valIndices: number[] }> = [];
  const foldSize = Math.floor(numSamples / k);
  const remainder = numSamples % k;

  let currentStart = 0;
  for (let i = 0; i < k; i++) {
    // Distribute remainder samples across first few folds
    const currentSize = foldSize + (i < remainder ? 1 : 0);
    const valIndices = indices.slice(currentStart, currentStart + currentSize);
    
    // Train indices are everything except the validation indices
    const trainIndices = [
      ...indices.slice(0, currentStart),
      ...indices.slice(currentStart + currentSize)
    ];

    splits.push({ trainIndices, valIndices });
    currentStart += currentSize;
  }

  return splits;
}`,
  relatedModules: ["evaluation-metrics", "bias-variance", "data-preparation"],
  tldr: [
    'Cross-validation estimates **out-of-sample error** by rotating which slice of data is held out, averaging $K$ validation scores instead of trusting a single lucky (or unlucky) split.',
    'Never tune hyperparameters and report final performance on the **same** held-out data — that score is optimistically biased because the data has already “seen” the selection process.',
    '**Nested CV** (inner loop tunes, outer loop evaluates) is the principled fix for the optimism of naive single-level CV when both tuning and unbiased evaluation are required.',
    'Leave-One-Out CV ($K = n$) is nearly **unbiased** but has **high variance** because the $n$ training sets overlap almost completely, making the fold errors highly correlated.',
    'Small $K$ (e.g. $K=5$) trains on less data per fold, adding **bias**, but the folds overlap less, so the averaged estimate has **lower variance** — this is the classic bias-variance tradeoff of CV itself, not just of the model.',
    'Picking $K$ is a practical tradeoff: $K=5$ or $K=10$ is the standard default; use LOOCV mainly for very small datasets where every sample is precious.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Bias-Variance Tradeoff of the K-Fold CV Estimate',
      content: `
Cross-validation error itself is a **random variable** — it depends on how the data happened to be partitioned into folds — so it has its own bias and variance as an estimator of the true generalization error $\\text{Err}$.

### Bias

Let $n$ be the total sample size and each of the $K$ folds train on $n_{train} = n(1 - 1/K)$ points. Because learning curves are typically decreasing and concave, a model trained on fewer points has *higher* expected error than one trained on all $n$ points:

$$ \\mathbb{E}[E_k] = \\text{Err}(n_{train}) \\geq \\text{Err}(n) $$

As $K \\to n$ (Leave-One-Out CV, LOOCV), $n_{train} = n - 1 \\approx n$, so each fold's training set is almost the full dataset and $\\mathbb{E}[E_k] \\approx \\text{Err}(n)$: **bias is nearly zero**. As $K$ shrinks (e.g. $K=2$), $n_{train} = n/2$, which can be substantially worse than $n$, so the estimate is **biased upward** (pessimistic) relative to the error of a model fit on all the data.

### Variance: the covariance-of-folds argument

The CV estimate is the average of the $K$ fold errors:

$$ CV = \\frac{1}{K}\\sum_{k=1}^K E_k, \\qquad \\operatorname{Var}(CV) = \\frac{1}{K^2}\\sum_{k=1}^K \\operatorname{Var}(E_k) + \\frac{1}{K^2}\\sum_{k \\neq l} \\operatorname{Cov}(E_k, E_l) $$

If the $E_k$ were independent, the second sum would vanish and variance would shrink like $1/K$ — more folds would always be better. But the $E_k$ are **not** independent: every pair of training sets $D \\setminus F_k$ and $D \\setminus F_l$ overlaps in $n - 2n/K$ points. The larger $K$ is, the more two training folds overlap, so the two fitted models $\\theta_k$ and $\\theta_l$ become nearly identical, and their errors $E_k, E_l$ become **highly positively correlated**:

$$ \\text{overlap fraction} = \\frac{n_{train} - n/K}{n_{train}} = 1 - \\frac{1}{K-1} \\xrightarrow{K \\to n} 1 $$

At the extreme $K = n$ (LOOCV), every pair of training sets differs by only 2 points out of $n-1$, so $\\operatorname{Cov}(E_k, E_l)$ is almost as large as $\\operatorname{Var}(E_k)$ itself. The cross-term sum no longer shrinks with $K$ — it dominates — so $\\operatorname{Var}(CV)$ stays **high** instead of vanishing. Intuitively: LOOCV's $n$ "different" models are really $n$ nearly-identical models trained on nearly-identical data, so averaging them barely reduces noise; a single unusual data point can shift many fold errors in the same direction at once.

For small $K$ (e.g. $K=5$ or $10$), training sets overlap less ($1 - 1/(K-1)$ is smaller), the $E_k$ are more weakly correlated, and the cross-covariance terms are smaller, so $\\operatorname{Var}(CV)$ is **lower** — at the cost of the bias discussed above.

### The tradeoff

$$ \\underbrace{\\text{small } K}_{\\text{higher bias, lower variance}} \\quad \\longleftrightarrow \\quad \\underbrace{\\text{large } K \\to n}_{\\text{near-zero bias, higher variance}} $$

This is why $K=5$ or $K=10$ is the standard practical default: it sits in a sweet spot where the bias from training on $\\sim 80$–$90\\%$ of the data is small, while the fold overlap (and hence variance) has not yet exploded the way it does as $K \\to n$.
      `,
    },
    {
      heading: 'Worked Example: Naive CV vs Nested CV and the “Winner’s Curse”',
      content: `
Suppose we are tuning a single hyperparameter $\\lambda$ over candidates $\\{\\lambda_1, \\lambda_2, \\lambda_3\\}$ on a dataset, using 5-fold CV, and we want an honest estimate of how the final chosen model will perform on new data.

### Naive (single-level) CV

1. Run 5-fold CV for every candidate $\\lambda$, getting an average validation score for each:
   - $\\lambda_1$: mean accuracy $0.83$
   - $\\lambda_2$: mean accuracy $0.91$
   - $\\lambda_3$: mean accuracy $0.85$
2. Pick the best: $\\lambda_2$, reported CV accuracy $= 0.91$.
3. Report $0.91$ as "the model's expected accuracy on new data."

The problem: with only 3 candidates and noisy fold estimates (say each has standard error $\\approx 0.02$ from sampling variability), $\\lambda_2$'s score of $0.91$ is the **maximum of three noisy estimates**. Even if all three hyperparameters had *identical* true accuracy of $0.86$, the one that happens to score highest by chance will, on average, score above $0.86$ — this is the **winner's curse** (also called the optimism of model selection): selecting the max of several noisy estimates introduces an upward bias into that estimate, precisely because it was chosen for being the best. The reported $0.91$ overstates the true performance of $\\lambda_2$; the more candidates you search over, the worse this optimism gets.

### Nested CV — measuring the bias directly

To get an unbiased estimate, wrap an **outer** CV loop around the entire tuning procedure:

1. Split the data into 5 **outer** folds.
2. For outer fold $k$: using only the other 4 outer folds, run an **inner** 5-fold CV to pick the best $\\lambda$ for this outer split (the inner selection might pick $\\lambda_2$ in some outer folds, $\\lambda_3$ in others — this is expected and correct).
3. Refit on all 4 outer-training folds using the inner-selected $\\lambda^*$, then evaluate **once** on the untouched outer test fold $k$ to get $E_k$.
4. Average the 5 outer-fold scores: $E_1, \\dots, E_5 = 0.84, 0.87, 0.85, 0.86, 0.83$, so $CV_{nested} = 0.85$.

Notice $0.85 < 0.91$: the nested estimate is **lower** than the naive estimate, and this gap *is* the winner's curse made visible — the outer test folds were never used for hyperparameter selection, so $0.85$ is an honest estimate of how the full pipeline (tune-then-fit) will generalize, while $0.91$ was inflated by reusing the same folds for both choosing and reporting performance.

### Takeaway

Naive CV answers "how good is the *best score I found* while searching?" — which is optimistic. Nested CV answers "how good is the *entire tune-and-fit procedure*, evaluated on data it never touched?" — which is the question we actually care about. Use naive/single-level CV only to *select* the final hyperparameters to ship; use nested CV when you need to *report* an unbiased generalization estimate (e.g. in a paper or before deploying to a new domain).
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A 5-fold CV run on a classifier gives fold accuracies $[0.80, 0.84, 0.79, 0.83, 0.82]$. Compute the mean CV accuracy. If a colleague instead reports the accuracy from training once on 80% of the data and testing on the remaining 20%, which estimate would you trust more, and why?',
      difficulty: 'warm-up',
      hint: 'Think about how many "trials" each estimate is based on.',
      solution: 'Mean CV accuracy $= \\frac{0.80+0.84+0.79+0.83+0.82}{5} = \\frac{4.08}{5} = 0.816$. The 5-fold estimate is more trustworthy: it averages 5 independent-ish train/test trials covering the *entire* dataset for validation exactly once, smoothing out the luck of any single split. A single 80/20 split is just one draw and can be unusually easy or hard depending on which points happened to land in the test 20%.',
      tags: ['computation'],
    },
    {
      prompt: 'A data scientist tunes a regularization strength $\\lambda$ by trying 50 candidate values, picking whichever gives the best accuracy on the **test set**, and then reports that same test accuracy as the model’s expected performance in production. What is wrong with this procedure, and what should be done instead?',
      difficulty: 'core',
      hint: 'Consider what "test set" is supposed to mean, and what happens once you’ve used it to make a decision.',
      solution: 'The test set is supposed to be a stand-in for completely unseen future data, used **once** at the very end purely to measure performance. By using it to choose $\\lambda$ among 50 candidates, the data scientist has effectively let the test set leak into the model-selection process — the reported score is the maximum of 50 noisy estimates, so it suffers from the winner’s curse and is optimistically biased, often substantially so with 50 candidates. The fix: use a separate **validation set** (or cross-validation on the training data) to choose $\\lambda$, and reserve the test set untouched until the very end, evaluating the single chosen model on it exactly once. If hyperparameter tuning must be cross-validated and you still need an honest generalization estimate, use **nested cross-validation** instead.',
      tags: ['conceptual'],
    },
    {
      prompt: 'You have a dataset of only $n=18$ samples for a regression problem. Should you use $K=18$ (LOOCV), $K=5$, or a single 80/20 holdout split for model evaluation? Justify your choice using the bias-variance tradeoff of CV.',
      difficulty: 'core',
      hint: 'With so few samples, what does a holdout split throw away, and how much does LOOCV training data overlap from fold to fold?',
      solution: 'A single 80/20 holdout would only validate on $\\approx 3.6$ samples — far too few to give a reliable estimate, and it wastes the chance to validate on the other $\\approx 14$ points entirely. $K=5$ trains on $\\approx 14.4$ samples per fold, noticeably less than the full 18, which adds bias on such a small dataset where every sample matters for fitting. LOOCV ($K=18$) trains on 17 of 18 points each time — almost the full dataset — minimizing bias, which is exactly the regime where LOOCV’s usual variance problem matters least relative to its bias benefit, because there are so few total points that we badly need every one for training. With very small $n$, LOOCV (or close to it, e.g. $K=10$) is generally preferred over both a wasteful holdout split and a smaller $K$ that sacrifices too much training data.',
      tags: ['reasoning'],
    },
    {
      prompt: 'Design a nested cross-validation procedure to both (a) select among three candidate models — Ridge regression, Random Forest, and Gradient Boosting — each with their own hyperparameter grids, and (b) report an unbiased estimate of the final chosen pipeline’s test performance. Describe the outer and inner loops precisely.',
      difficulty: 'challenge',
      hint: 'The inner loop should jointly search over both "which model" and "which hyperparameters for that model" as one combined search space.',
      solution: 'Outer loop: split the full dataset into $K_{outer}=5$ folds. For each outer fold $k$: hold out fold $k$ as the outer test set; the remaining $4$ folds form the outer training set. Inner loop: on the outer training set only, run $K_{inner}=5$-fold CV (or randomized search) over the **combined** search space of \\{Ridge $\\times$ its $\\lambda$ grid\\} $\\cup$ \\{Random Forest $\\times$ its depth/tree-count grid\\} $\\cup$ \\{Gradient Boosting $\\times$ its learning-rate/depth grid\\}, treating "which model family" as just another categorical hyperparameter. Select the single (model, hyperparameter) combination with the best average inner-CV score. Refit that combination on the **entire** outer training set (all 4 folds), then evaluate once on the held-out outer test fold $k$ to get $E_k$. After all 5 outer folds, average $E_1,\\dots,E_5$ for the unbiased nested-CV performance estimate, and separately tally how often each model family was selected across outer folds as a sanity check on stability. Finally, for the model you actually ship, rerun the inner-loop search (which model + hyperparameters) one more time on the **full** dataset and train the winner on all the data — the nested-CV average from the outer loop is only used to *report* expected performance, not as a model you deploy directly.',
      tags: ['design', 'derivation'],
    },
  ],
  comparisons: [
    {
      title: 'Hold-out vs k-Fold vs Leave-One-Out Cross-Validation',
      methods: ['Hold-out Validation', 'k-Fold CV', 'Leave-One-Out CV'],
      rows: [
        {
          dimension: 'Bias of the error estimate',
          values: [
            'Highest — only trains on a fraction (e.g. 70-80%) of the data once',
            'Moderate — trains on $(K-1)/K$ of the data, e.g. 80-90% for $K=5,10$',
            'Lowest — trains on $n-1$ of $n$ points, almost the full dataset',
          ],
        },
        {
          dimension: 'Variance of the error estimate',
          values: [
            'Highest — a single split can be lucky or unlucky',
            'Moderate — folds overlap partially, so errors are weakly correlated',
            'Can be high — the $n$ training sets overlap almost completely, making fold errors highly correlated',
          ],
        },
        {
          dimension: 'Compute cost',
          values: [
            'Lowest — 1 train + 1 evaluate',
            'Moderate — $K$ trainings (typically 5-10)',
            'Highest — $n$ trainings (infeasible for large $n$ except for models with cheap closed-form updates)',
          ],
        },
        {
          dimension: 'Typical use case',
          values: [
            'Very large datasets where a single split is already statistically reliable, or quick prototyping',
            'The default choice for most datasets; standard for hyperparameter tuning',
            'Very small datasets where every training sample is precious',
          ],
        },
      ],
      takeaway: 'k-Fold CV (typically $K=5$ or $10$) is the practical default because it balances the bias of hold-out against the variance blow-up of LOOCV; reserve LOOCV for small-$n$ problems and hold-out for very large datasets or quick iteration.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need a **reliable estimate** of generalization performance, especially with a small-to-medium sized dataset where a single split would be noisy.',
      'You are **tuning hyperparameters** and need a principled way to compare candidates without touching the final test set.',
      'You must report an **unbiased** performance number after tuning — use nested CV specifically for this.',
      'Your data is i.i.d. (or you have a domain-appropriate variant like Stratified K-Fold for class imbalance, or Group K-Fold for clustered samples).',
    ],
    avoidWhen: [
      'Your data has a **temporal** structure — standard K-Fold leaks future information into training; use a rolling-origin / TimeSeriesSplit instead.',
      'Training a single model is **extremely expensive** (e.g. large deep nets) and $K$ retrainings are computationally infeasible — consider a single well-sized holdout split instead.',
      'Samples are **not independent** (e.g. multiple rows per patient/user) — naive K-Fold will leak information across folds; use Group K-Fold so all of one group’s rows stay on one side.',
      'You have already used the cross-validation folds to choose hyperparameters and are tempted to report that same CV score as your final unbiased performance estimate — this double-dips the data.',
    ],
    rulesOfThumb: [
      '$K=5$ or $K=10$ is a strong default for most tabular problems.',
      'Use Stratified K-Fold by default for classification, especially with imbalanced classes.',
      'If you must tune AND report an unbiased estimate, use nested CV; if you only need to tune, single-level CV plus a final untouched test set is sufficient.',
      'For datasets with $n$ in the low hundreds or fewer, lean toward larger $K$ (or LOOCV) to avoid starving the training folds.',
    ],
  },
  caseStudies: [
    {
      title: 'Selection bias in microarray gene-expression classification',
      domain: 'Bioinformatics / genomics',
      scenario: 'Early cancer-classification studies using microarray gene-expression data (often with only $n \\approx 50$–$100$ patient samples but $p \\approx 10{,}000+$ genes) repeatedly selected a small subset of "informative" genes using the **full** dataset (including what would become the test set) before cross-validating a classifier on those same genes.',
      approach: 'Ambroise and McLachlan (2002) demonstrated the effect by comparing this common but flawed "external" feature-selection procedure against a correct procedure where gene selection was performed **inside** each cross-validation fold (i.e. nested with respect to feature selection), using simulated null data (purely random labels) and real leukemia/colon-cancer microarray datasets.',
      outcome: 'When gene selection used the full dataset before CV, reported error rates were artificially low — in simulations with **pure noise features and random labels**, the flawed procedure still reported cross-validated error rates as low as **0-15%** (appearing highly predictive) instead of the expected **~50%** (chance level) that the correctly nested procedure recovered. This selection-bias effect — feature selection leaking test information into training, the same root cause as hyperparameter selection bias in CV — has since been one of the most cited cautionary examples for nested validation in high-dimensional biomedical data.',
      source: {
        title: 'Selection bias in gene extraction on the basis of microarray gene-expression data',
        authors: 'Ambroise, C. and McLachlan, G. J.',
        url: 'https://www.pnas.org/doi/10.1073/pnas.062607499',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'Why does Leave-One-Out Cross-Validation (LOOCV) tend to have high variance as an estimator of generalization error, despite having very low bias?',
      options: [
        { text: 'Its $n$ training sets overlap almost completely, so the fold errors are highly correlated and averaging them does not reduce noise much.', correct: true },
        { text: 'LOOCV trains on too little data in each fold, so each model underfits badly.', correct: false },
        { text: 'LOOCV is only defined for classification, so it cannot be applied to regression error metrics.', correct: false },
        { text: 'LOOCV always uses a different loss function than k-fold CV.', correct: false },
      ],
      explanation: 'LOOCV trains on $n-1$ of $n$ points each time, so consecutive training sets differ by only 2 points — they are nearly identical, making the resulting models (and hence their fold errors) highly correlated. Averaging highly correlated quantities does not shrink variance the way averaging independent quantities does, so the overall CV estimate stays noisy even though each individual fold is nearly unbiased.',
    },
    {
      question: 'A team selects the hyperparameter that gives the best average accuracy across 10-fold CV, and reports that same CV accuracy as the model’s expected accuracy on new data. What is the main problem with this?',
      options: [
        { text: 'The reported accuracy is optimistically biased because the same folds were used both to select and to evaluate the hyperparameter.', correct: true },
        { text: 'Ten folds is always too few to get any meaningful estimate.', correct: false },
        { text: 'Accuracy can never be estimated using cross-validation.', correct: false },
        { text: 'The model will definitely perform better in production than the CV score suggests.', correct: false },
      ],
      explanation: 'This is the "winner’s curse" of model selection: picking the hyperparameter with the best score among several candidates inflates that score, because it was chosen for looking best on those exact folds. To get an honest estimate, you need either an untouched test set evaluated once, or nested cross-validation.',
    },
    {
      question: 'In nested cross-validation, what is the role of the inner loop versus the outer loop?',
      options: [
        { text: 'The inner loop selects hyperparameters using only the outer training data; the outer loop evaluates the resulting pipeline on data never used for selection.', correct: true },
        { text: 'The inner loop evaluates final performance; the outer loop tunes hyperparameters.', correct: false },
        { text: 'Both loops use the exact same data split, just repeated for stability.', correct: false },
        { text: 'The inner loop is only needed for classification problems, not regression.', correct: false },
      ],
      explanation: 'Nested CV cleanly separates the two jobs: the inner loop searches for the best hyperparameters using only data from the current outer-training fold, and the outer loop measures how well the entire tune-then-fit procedure generalizes by testing on outer folds that were never touched during hyperparameter selection.',
    },
    {
      question: 'You have a dataset with only $n=15$ samples. Which validation strategy is generally most appropriate, and why?',
      options: [
        { text: 'A high-$K$ approach like LOOCV or $K=10$, because it maximizes the training data available in each fold, minimizing bias when samples are scarce.', correct: false },
        { text: 'A single 80/20 holdout split, because it is the fastest to compute.', correct: false },
        { text: 'LOOCV or a similarly large $K$, because with so few samples a holdout split wastes too much data and trains on too little; bias matters more than the variance cost here.', correct: true },
        { text: 'It does not matter — any validation strategy gives the same expected error with small data.', correct: false },
      ],
      explanation: 'With very few samples, a holdout split both starves the training set and gives an unreliable validation estimate (too few validation points). LOOCV (or close to it) trains on nearly all the data each time, minimizing the bias introduced by training-set shrinkage, which is the dominant concern with very small $n$ — even though LOOCV variance is higher in general, that drawback is a worthwhile trade when every sample is precious.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
