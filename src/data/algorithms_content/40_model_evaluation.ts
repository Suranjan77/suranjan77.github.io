import { LearningModule } from "./types";

export const modelEvaluation: LearningModule = {
  id: "model-evaluation",
  title: "Model Evaluation & Validation",
  category: "Machine Learning Concepts",
  prerequisites: ["logistic-regression"],
  tracks: ["practitioner"],
  difficulty: 2,
  relatedModules: ["logistic-regression", "regularization", "applied-ml-workflow"],
  shortDescription:
    "The methodology for measuring whether a model actually works: honest train/validation/test splits, cross-validation, threshold-aware classification metrics, and the leakage traps that make good scores lie.",
  estimatedMinutes: 30,
  learningObjectives: [
    "Design an honest evaluation protocol with train/validation/test splits and k-fold cross-validation, and explain what each split is for",
    "Compute and interpret precision, recall, F1, and the confusion matrix, and choose the right metric for a class-imbalanced problem",
    "Read ROC and precision–recall curves and explain what ROC-AUC does and does not tell you",
    "Identify data leakage and other failures that produce optimistic offline scores which collapse in production",
  ],
  keyTerms: [
    {
      term: "Validation Set",
      definition:
        "Held-out data used to tune hyperparameters and choose models. Because you make decisions based on it, it stops being an unbiased estimate of generalization — that is the test set's job.",
    },
    {
      term: "k-Fold Cross-Validation",
      definition:
        "Splitting the data into k folds, training on k−1 and validating on the held-out fold, rotating k times and averaging. It uses all data for both training and validation and gives a variance estimate of the score.",
    },
    {
      term: "Precision vs Recall",
      definition:
        "Precision = TP/(TP+FP), the fraction of positive predictions that are correct. Recall = TP/(TP+FN), the fraction of actual positives that were caught. The decision threshold trades one against the other.",
    },
    {
      term: "Data Leakage",
      definition:
        "When information unavailable at prediction time leaks into training (or into preprocessing fit on the whole dataset), inflating offline scores in a way that does not transfer to production.",
    },
  ],
  misconceptions: [
    {
      claim:
        "High accuracy means the model is good.",
      correction:
        "On imbalanced data, accuracy is dominated by the majority class — a model that always predicts 'not fraud' on a 1%-fraud dataset is 99% accurate and useless. Precision, recall, F1, and PR-AUC reveal what accuracy hides.",
    },
    {
      claim:
        "The test set can be used to pick the best model or threshold.",
      correction:
        "Any decision made using the test set leaks it into model selection, so its score is no longer an unbiased estimate of generalization. Tune on validation (or via cross-validation) and touch the test set only once, at the very end.",
    },
    {
      claim:
        "ROC-AUC is always the right headline metric.",
      correction:
        "ROC-AUC averages over all thresholds and can look deceptively high on heavily imbalanced data because the huge true-negative pool keeps the false-positive rate low. When positives are rare, the precision–recall curve and PR-AUC are more informative.",
    },
  ],
  references: [
    {
      title: "An Introduction to Statistical Learning",
      authors: "James, G., Witten, D., Hastie, T. and Tibshirani, R.",
      url: "https://www.statlearning.com/",
      type: "textbook",
    },
    {
      title: "The Relationship Between Precision-Recall and ROC Curves",
      authors: "Davis, J. and Goadrich, M.",
      url: "https://www.biostat.wisc.edu/~page/rocpr.pdf",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Data leakage inflates offline scores",
      description:
        "Fitting a scaler, imputer, or feature selector on the full dataset before splitting, or including a feature that encodes the label (a 'time of payout' column for a fraud model), produces near-perfect validation scores that evaporate in production.",
      mitigation:
        "Split first, then fit all preprocessing inside the training fold only (use a pipeline so cross-validation refits it per fold); audit features for target information and respect temporal ordering with time-based splits.",
    },
    {
      name: "Evaluating on the wrong metric for the imbalance",
      description:
        "Reporting accuracy or even ROC-AUC on a rare-positive problem can hide that the model rarely catches the positive class, because the dominant negatives swamp the score.",
      mitigation:
        "Match the metric to the cost structure: use precision/recall/F1 or PR-AUC, set the decision threshold from the business cost of false positives vs false negatives, and report a confusion matrix.",
    },
  ],
  fullDescription: `
A model's training loss tells you how well it memorized; **evaluation** tells you whether it will work on data it has never seen. Getting this right is less about exotic metrics and more about an honest *protocol*.

### The three-way split
Data is partitioned into:

1. **Training set** — the model learns its parameters here.
2. **Validation set** — used to choose hyperparameters, features, and models. Because you make choices based on it, it is *optimistically biased*.
3. **Test set** — locked away and used exactly once, at the end, to report an unbiased estimate of generalization.

When data is scarce, **k-fold cross-validation** replaces a single validation split: rotate the held-out fold k times and average, so every point is used for both training and validation, and you also get a variance estimate.

### Choosing the metric
For classification, raw accuracy is often the wrong headline. The **confusion matrix** breaks predictions into true/false positives and negatives, from which **precision** (are my positive calls right?) and **recall** (did I catch the positives?) follow. Their balance is governed by the **decision threshold**, and sweeping that threshold traces the **ROC** and **precision–recall** curves. Which curve to trust depends on class balance and on the relative cost of the two error types.

The throughline: an impressive offline number means nothing if the protocol let information leak or measured the wrong thing.
  `,
  intuition: `
Think of evaluation like grading a student honestly. If you let them study the exact exam beforehand, a perfect score proves nothing — that is what training accuracy is. The **validation set** is a practice exam you use to decide which study strategy works; but once you've picked the strategy *because* it aced the practice exam, the practice score is rosy. So you keep one final, sealed exam — the **test set** — and open it only once.

For the metric, imagine a smoke alarm. One that never goes off has great "accuracy" in a house that rarely catches fire — but zero **recall**: it misses the one event that matters. One that shrieks at burnt toast has high recall but poor **precision**, and you'll soon ignore it. The **threshold** is how twitchy you set the alarm, and there is no universally right setting — it depends on whether a missed fire or a false alarm is worse. Evaluation is the discipline of measuring that trade-off honestly instead of celebrating a number that was never tested fairly.
  `,
  mathematics: `
### 1. Confusion-matrix metrics
From true positives $TP$, false positives $FP$, true negatives $TN$, and false negatives $FN$:

$$ \\text{Precision} = \\frac{TP}{TP+FP}, \\qquad \\text{Recall} = \\frac{TP}{TP+FN}, \\qquad \\text{Accuracy} = \\frac{TP+TN}{TP+TN+FP+FN}. $$

The **F1 score** is their harmonic mean, which stays low unless *both* are high:

$$ F_1 = \\frac{2\\,\\text{Precision}\\cdot\\text{Recall}}{\\text{Precision}+\\text{Recall}}. $$

### 2. ROC and the threshold sweep
A classifier outputs a score; a threshold $\\tau$ turns it into a label. As $\\tau$ varies, plot the true-positive rate against the false-positive rate:

$$ \\text{TPR} = \\frac{TP}{TP+FN}, \\qquad \\text{FPR} = \\frac{FP}{FP+TN}. $$

The **ROC curve** is this parametric path; **ROC-AUC** is the area under it and equals the probability that a random positive is scored above a random negative. A perfect model has AUC $=1$; random guessing gives $0.5$.

### 3. k-fold cross-validation estimate
With folds $1,\\dots,k$ and per-fold score $s_i$, the cross-validated estimate and its spread are

$$ \\bar{s} = \\frac{1}{k}\\sum_{i=1}^{k} s_i, \\qquad \\widehat{\\operatorname{SD}} = \\sqrt{\\frac{1}{k-1}\\sum_{i=1}^{k}(s_i-\\bar{s})^2}. $$

The standard deviation across folds is a cheap, honest signal of how sensitive the score is to which data the model happened to see.
  `,
  pros: [
    "A disciplined split-and-cross-validate protocol gives an honest, low-bias estimate of how a model will generalize before it ships.",
    "Threshold-aware metrics (precision, recall, F1, ROC/PR curves) expose behavior that a single accuracy number hides, especially under class imbalance.",
    "Cross-validation squeezes a reliable score and a variance estimate out of limited data, reducing the luck of any one split.",
  ],
  cons: [
    "Rigorous evaluation costs compute (k-fold means k trainings) and discipline (a strictly held-out test set, leakage-proof pipelines).",
    "No metric is universally right — choosing among accuracy, F1, ROC-AUC, and PR-AUC requires understanding the class balance and error costs.",
    "Static offline splits can still mislead under distribution shift or temporal structure, which need time-based or grouped validation to evaluate honestly.",
  ],
  codeSnippet: `import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import precision_recall_fscore_support, roc_auc_score

X = np.random.RandomState(0).randn(1000, 8)
y = (X[:, 0] + 0.5 * X[:, 1] > 0).astype(int)

# Put preprocessing INSIDE the pipeline so it is refit per fold -> no leakage.
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
auc = cross_val_score(pipe, X, y, cv=cv, scoring="roc_auc")
print(f"ROC-AUC: {auc.mean():.3f} +/- {auc.std():.3f}")   # mean and spread across folds

# Threshold-aware metrics on a held-out split
pipe.fit(X[:800], y[:800])
proba = pipe.predict_proba(X[800:])[:, 1]
for tau in (0.3, 0.5, 0.7):
    pred = (proba >= tau).astype(int)
    p, r, f1, _ = precision_recall_fscore_support(
        y[800:], pred, average="binary", zero_division=0)
    print(f"tau={tau}: precision={p:.2f} recall={r:.2f} F1={f1:.2f}")
print("Test ROC-AUC:", round(roc_auc_score(y[800:], proba), 3))`,
  tldr: [
    "Evaluation is about an **honest protocol**, not exotic metrics: train to learn, **validation** to choose, **test** (used once) to report.",
    "Use **k-fold cross-validation** when data is scarce — every point trains and validates, and you get a **variance** estimate across folds.",
    "On imbalanced data **accuracy lies**; read the **confusion matrix** and use precision, recall, **F1**, and PR-AUC.",
    "The **decision threshold** trades **precision against recall**; sweeping it traces the **ROC** and **precision–recall** curves. ROC-AUC = P(random positive scored above random negative).",
    "**Data leakage** — fitting preprocessing on all data, or using a feature that encodes the label — is the classic way to get great offline scores that collapse in production.",
    "Pick the metric and threshold from the **cost of false positives vs false negatives**, not by habit.",
  ],
  additionalSections: [
    {
      heading: "Derivation: Why ROC-AUC Can Flatter an Imbalanced Classifier",
      content: `
ROC plots the true-positive rate against the false-positive rate as the threshold sweeps:

$$ \\text{TPR} = \\frac{TP}{TP+FN}, \\qquad \\text{FPR} = \\frac{FP}{FP+TN}. $$

The subtle point hides in the FPR denominator. On a problem where positives are rare — say 1,000 positives among 1,000,000 examples — the negative pool $FP+TN$ is enormous. A model can rack up *thousands* of false positives and still have a tiny FPR, because thousands divided by ~a million is near zero. So the ROC curve hugs the top-left and **ROC-AUC stays high even when most positive predictions are wrong**.

Precision tells a different story because its denominator is the predictions you actually made:

$$ \\text{Precision} = \\frac{TP}{TP+FP}. $$

Here those same thousands of false positives sit right next to a few hundred true positives, so precision craters. This is why, when positives are rare and the cost of chasing false alarms is real, the **precision–recall curve and PR-AUC are the honest summaries**: they ignore the giant true-negative pool that lets ROC-AUC look good. The rule of thumb: ROC-AUC for roughly balanced problems or when true negatives matter; PR-AUC when positives are scarce and you care about the quality of positive predictions. Davis and Goadrich showed the two curves are connected but *not* interchangeable — a model can dominate in ROC space while another dominates in PR space.
      `,
    },
    {
      heading: "Derivation: The Bias–Variance View of Train/Validation/Test",
      content: `
Why three splits, and why does the validation score drift optimistic? Expected test error for a point can be decomposed into

$$ \\mathbb{E}\\big[(y-\\hat f(x))^2\\big] = \\underbrace{\\big(\\mathbb{E}[\\hat f(x)]-f(x)\\big)^2}_{\\text{bias}^2} + \\underbrace{\\operatorname{Var}(\\hat f(x))}_{\\text{variance}} + \\underbrace{\\sigma^2}_{\\text{irreducible}}. $$

Choosing a more flexible model lowers bias but raises variance; the validation set is how we find the sweet spot. But here is the trap: **every time you consult the validation set to pick a model or threshold, you are optimizing against that specific sample.** With enough choices, you start fitting the validation set's noise — its score becomes biased downward (too optimistic) for exactly the same reason training error is. This is "validation overfitting" or, at scale, *adaptive overfitting* from a much-reused benchmark.

The fix is structural. The **test set** is never used for any decision, so its score is an unbiased estimate of generalization — but only if you keep that promise and look once. **k-fold cross-validation** reduces the *variance* of the validation estimate (averaging k folds instead of trusting one split) without solving the bias from reuse, which is why a final untouched test set is still required. Splitting is not bureaucracy; it is the only way to separate "error from a model that is too simple/complex" (bias/variance) from "error we fooled ourselves into not seeing" (leakage and reuse).
      `,
    },
  ],
  comparisons: [
    {
      title: "Holdout vs k-Fold Cross-Validation vs Leave-One-Out",
      methods: ["Single Holdout", "k-Fold CV", "Leave-One-Out CV"],
      rows: [
        {
          dimension: "Trainings required",
          values: ["1", "k (e.g. 5–10)", "n (one per sample)"],
        },
        {
          dimension: "Data efficiency",
          values: [
            "Wastes the holdout for training",
            "Every point trains and validates",
            "Maximal — almost all data trains each time",
          ],
        },
        {
          dimension: "Score variance",
          values: [
            "High — depends on the one split",
            "Lower — averaged over folds",
            "Low bias but high variance, correlated folds",
          ],
        },
        {
          dimension: "Cost",
          values: ["Cheapest", "Moderate", "Expensive for large n"],
        },
        {
          dimension: "Best when",
          values: [
            "Data is plentiful",
            "The usual default",
            "Data is very small",
          ],
        },
      ],
      takeaway:
        "k-fold is the workhorse: far more reliable than a single holdout without leave-one-out's cost. Always keep a separate, untouched test set on top of whichever validation scheme you use.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "Before shipping any model — to get an honest, leakage-free estimate of how it will generalize.",
      "Comparing models or tuning hyperparameters: use cross-validation on the training data, never the test set.",
      "Setting a decision threshold from the real cost of false positives vs false negatives rather than defaulting to 0.5.",
      "Diagnosing whether disappointing production performance comes from bias, variance, leakage, or distribution shift.",
    ],
    avoidWhen: [
      "Reporting the test score after using that same test set to choose the model — that number is no longer trustworthy.",
      "Leaning on accuracy (or even ROC-AUC) alone for a heavily imbalanced problem.",
      "Using random k-fold on time-series or grouped data, where it leaks the future (or a group) into training — use time-based or grouped splits.",
      "Fitting scalers, imputers, or feature selection on the full dataset before splitting.",
    ],
    rulesOfThumb: [
      "Split first, then fit all preprocessing inside the training fold (use a pipeline).",
      "Default to stratified 5- or 10-fold CV for tuning; hold out a final test set you touch once.",
      "On rare-positive problems, prefer PR-AUC and report a confusion matrix at your chosen threshold.",
    ],
  },
  caseStudies: [
    {
      title: "Leakage turns a 'near-perfect' model into a production flop",
      domain: "Tabular ML / data science practice",
      scenario:
        "A team building a churn classifier reports a stunning held-out ROC-AUC of 0.99 and ships it. In production the model is barely better than guessing. The offline and online numbers disagree wildly — a textbook symptom of evaluation that measured the wrong thing.",
      approach:
        "An audit retraced the pipeline. Two leaks were found: a StandardScaler and target-encoded features had been fit on the *entire* dataset before splitting (so test statistics bled into training), and an 'account_closed_date' feature was effectively a proxy for the churn label that would not be known at prediction time. The fix was to move all preprocessing inside a per-fold pipeline and remove future-dependent features, then re-evaluate with stratified cross-validation and a final untouched test set.",
      outcome:
        "After closing the leaks, the honest cross-validated ROC-AUC dropped to about **0.78** — far less flashy but now *matching* production performance within a couple of points. The lesson is the canonical one: a score that looks too good usually reflects a broken protocol, and a leakage-proof evaluation that agrees with production is worth more than a higher number that does not.",
      source: {
        title: "An Introduction to Statistical Learning",
        authors: "James, G., Witten, D., Hastie, T. and Tibshirani, R.",
        url: "https://www.statlearning.com/",
        type: "textbook",
      },
    },
  ],
  quiz: [
    {
      question:
        "A fraud detector is evaluated on data that is 1% fraud. It predicts 'not fraud' for everyone. What is true?",
      options: [
        {
          text: "It scores 99% accuracy but 0% recall, so accuracy is the wrong headline metric here.",
          correct: true,
        },
        {
          text: "It scores 1% accuracy, correctly flagging the failure.",
          correct: false,
        },
        {
          text: "Its precision is 0.99 because most labels are 'not fraud'.",
          correct: false,
        },
        {
          text: "Its F1 score is high because accuracy is high.",
          correct: false,
        },
      ],
      explanation:
        "Predicting the majority class gives 99% accuracy on a 1%-positive problem, but it never catches a single fraud, so recall = TP/(TP+FN) = 0 and F1 = 0. This is why precision, recall, F1, and PR-AUC — not accuracy — are used under imbalance.",
    },
    {
      question:
        "Why must the test set be used only once, at the very end?",
      options: [
        {
          text: "Any decision made using it leaks it into model selection, so its score stops being an unbiased estimate of generalization.",
          correct: true,
        },
        {
          text: "Reusing it is computationally too expensive.",
          correct: false,
        },
        {
          text: "Test sets can only be loaded into memory once.",
          correct: false,
        },
        {
          text: "It must stay small, and repeated use would shrink it.",
          correct: false,
        },
      ],
      explanation:
        "Once you choose a model, threshold, or feature because it does well on the test set, you have optimized against that sample — its score becomes optimistically biased, exactly like training error. Tune on validation or via cross-validation; reserve the test set for a single final report.",
    },
    {
      question:
        "On a problem with very rare positives, why can ROC-AUC look high even when most positive predictions are wrong?",
      options: [
        {
          text: "FPR divides false positives by the huge true-negative pool, so even many false positives barely raise it; precision (and PR-AUC) expose the problem.",
          correct: true,
        },
        {
          text: "ROC-AUC ignores false positives entirely.",
          correct: false,
        },
        {
          text: "ROC-AUC only counts the majority class.",
          correct: false,
        },
        {
          text: "ROC-AUC is computed at a single threshold of 0.5.",
          correct: false,
        },
      ],
      explanation:
        "FPR = FP/(FP+TN). With positives rare, the negative pool is enormous, so thousands of false positives still give a tiny FPR and the ROC hugs the top-left. Precision = TP/(TP+FP) has no such cushion, so the PR curve and PR-AUC reveal the poor positive-prediction quality.",
    },
    {
      question:
        "Which procedure correctly avoids data leakage when scaling features inside cross-validation?",
      options: [
        {
          text: "Fit the scaler on each fold's training portion only, inside a pipeline that is refit every fold.",
          correct: true,
        },
        {
          text: "Fit the scaler once on the entire dataset, then run cross-validation.",
          correct: false,
        },
        {
          text: "Fit the scaler on the test set so it matches deployment.",
          correct: false,
        },
        {
          text: "Scale after computing the metrics to keep the data raw during training.",
          correct: false,
        },
      ],
      explanation:
        "Preprocessing must learn its parameters (means, variances, encodings) from training data only. Wrapping the scaler and model in a pipeline makes cross-validation refit the scaler on each fold's training portion, so no information from the held-out fold leaks into training.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "A colleague reports a held-out ROC-AUC of 0.98 on a churn model but it performs poorly in production. List the evaluation problems you would investigate and how you would fix them.",
      expectedAnswerRubric:
        "A strong answer should suspect data leakage first: preprocessing (scaling, encoding, imputation, feature selection) fit on the full dataset before splitting, and features that encode the target or use post-outcome information; the fix is to fit all preprocessing inside a per-fold pipeline and remove future-dependent features. It should question whether the test set was reused for model/threshold selection (optimistic bias) and recommend a single untouched test set plus cross-validation for tuning. It should consider class imbalance making ROC-AUC flattering and suggest PR-AUC / precision / recall / a confusion matrix, and consider temporal structure requiring time-based rather than random splits. The goal is an honest, leakage-free protocol whose offline score matches production.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
