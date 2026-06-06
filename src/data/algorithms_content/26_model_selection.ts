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
  relatedModules: ["evaluation-metrics", "bias-variance", "data-preparation"]
};
