import { LearningModule } from "./types";

export const evaluationMetrics: LearningModule = {
  id: "evaluation-metrics",
  title: "Evaluation Metrics",
  category: "Evaluation Metrics",
  prerequisites: ["logistic-regression", "probability-theory"],
  tracks: ["practitioner"],
  difficulty: 2,
  relatedModules: ["logistic-regression", "probability-theory", "bias-variance"],
  shortDescription: "Measuring binary classification performance using confusion matrices, precision, recall, and ROC/AUC curves.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Construct a confusion matrix and compute accuracy, precision, recall, and F1-score',
    'Explain why accuracy is misleading on imbalanced datasets',
    'Explain how changing the decision threshold impacts precision and recall',
    'Plot and interpret ROC and Precision-Recall curves, explaining the significance of AUC',
  ],
  keyTerms: [
    { term: 'Precision', definition: 'The ratio of correctly predicted positive observations to the total predicted positives.' },
    { term: 'Recall (Sensitivity)', definition: 'The ratio of correctly predicted positive observations to all actual positives.' },
    { term: 'ROC Curve (Receiver Operating Characteristic)', definition: 'A graph showing the performance of a classification model at all classification thresholds.' },
  ],
  workedExamples: [
    {
      title: 'Precision and Recall calculation',
      problem: 'In a test set of 100 actual positive instances, the model predicts positive for 90 of them (TP = 90). The model also predicts positive for 10 actual negative instances (FP = 10). Calculate Precision and Recall.',
      solution: 'Precision = $\\frac{TP}{TP + FP} = \\frac{90}{90 + 10} = 0.9$ (or $90\\%$). Recall = $\\frac{TP}{TP + FN} = \\frac{90}{100} = 0.9$ (or $90\\%$).',
    },
  ],
  misconceptions: [
    {
      claim: 'You should always maximize the ROC AUC score regardless of class balance.',
      correction: 'ROC AUC can be overly optimistic on highly imbalanced datasets because the False Positive Rate denominator includes a large number of true negatives. Precision-Recall AUC is a more informative metric when the positive class is rare.'
    },
    {
      claim: 'A model with high precision always has high recall.',
      correction: 'There is a fundamental tradeoff: increasing the decision threshold increases precision but decreases recall, while lowering the threshold increases recall but decreases precision.'
    }
  ],
  references: [
    {
      title: "Introduction to Information Retrieval (Evaluation chapter)",
      authors: "Manning, C. D. et al",
      url: "https://nlp.stanford.edu/IR-book/",
      type: "textbook"
    },
    {
      title: "Receiver-Operating Characteristic Analysis",
      authors: "Fawcett, T",
      url: "https://sciencedirect.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Accuracy Paradox',
      description: 'In a dataset where 99% of samples are negative, a dummy model predicting always-negative gets 99% accuracy but fails completely to find positive instances.',
      mitigation: 'Use F1-score, Cohen Kappa, or precision-recall curves instead of accuracy.'
    }
  ],

  fullDescription: `
Classification evaluation goes beyond accuracy. On imbalanced datasets such as fraud detection or medical screening, a model can achieve high accuracy by mostly predicting the majority class while failing on the cases that matter.

A **confusion matrix** compares actual labels with predicted labels. From it we derive precision, recall, F1-score, false positive rate, and accuracy. By sweeping the decision threshold, we can trace curves such as ROC and precision-recall.
  `,

  intuition: `
Imagine a fire alarm:
- **True Positive (TP)**: There is a fire, and the alarm rings. (Success).
- **False Positive (FP / Type I Error)**: There is no fire, but the alarm rings anyway. (False alarm - annoying, hurts precision).
- **True Negative (TN)**: There is no fire, and the alarm is silent. (Success).
- **False Negative (FN / Type II Error)**: There is a fire, but the alarm stays silent. (Disaster - hurts recall).

A sensitive alarm has high **recall** because it catches most fires, but may have low **precision** because many alarms are false. A conservative alarm can have high precision but lower recall. The threshold determines that operating point.
  `,

  mathematics: `
### 1. The Confusion Matrix
A tabular layout mapping predictions against actual states:

| | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actual Positive** | True Positive (TP) | False Negative (FN) |
| **Actual Negative** | False Positive (FP) | True Negative (TN) |

### 2. Core Metrics
- **Accuracy**: The fraction of all predictions that are correct:

$$ \\text{Accuracy} = \\frac{TP + TN}{TP + TN + FP + FN} $$

- **Precision**: The fraction of predicted positive examples that are actually positive:

$$ \\text{Precision} = \\frac{TP}{TP + FP} $$

- **Recall (Sensitivity)**: The fraction of actual positive examples that are correctly predicted:

$$ \\text{Recall} = \\frac{TP}{TP + FN} $$

- **F1-Score**: The harmonic mean of precision and recall, balancing both:

$$ F1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}} = \\frac{2TP}{2TP + FP + FN} $$

### 3. ROC Curve and AUC
The Receiver Operating Characteristic (ROC) curve plots the **True Positive Rate (TPR = Recall)** against the **False Positive Rate (FPR)** at every classification threshold $t \\in [0, 1]$:

$$ \\text{FPR} = \\frac{FP}{FP + TN} $$

The **Area Under the Curve (AUC)** measures the probability that a classifier will rank a randomly chosen positive instance higher than a randomly chosen negative one.
  `,

  pros: [
    "Precision-Recall and F1 offer robust assessments under extreme class imbalances.",
    "ROC curves illustrate classifier behavior across all possible operational decision thresholds.",
    "AUC is threshold-independent, providing a single scalar to rank overall model quality."
  ],

  cons: [
    "F1-score treats precision and recall with equal weight, which may not fit specific business costs (e.g. medical diagnosis prioritizes Recall).",
    "AUC can be misleading when the ROC curves of two models intersect.",
    "None of these metrics account for calibration of predicted probabilities."
  ],

  codeSnippet: `from sklearn.metrics import confusion_matrix, precision_score, recall_score, roc_auc_score

# y_true are actual classes (0 or 1), y_pred are predicted classes
# y_probs are predicted probabilities for class 1
# cm = confusion_matrix(y_true, y_pred)

precision = precision_score(y_true, y_pred)
recall = recall_score(y_true, y_pred)
auc = roc_auc_score(y_true, y_probs)
`,
  tldr: [
    'Every binary metric is derived from the **confusion matrix** of TP, FP, TN, FN counts.',
    'Precision $= \\frac{TP}{TP+FP}$ asks "of the positives I flagged, how many were right?"; recall $= \\frac{TP}{TP+FN}$ asks "of the real positives, how many did I catch?"',
    'F1 $= \\frac{2PR}{P+R}$ is the **harmonic mean** of precision and recall — it punishes a model that sacrifices one to inflate the other.',
    '**Accuracy lies on imbalanced data**: a do-nothing model predicting all-negative scores 99% accuracy on a 1%-positive problem while catching zero positives.',
    'There is a **precision-recall tradeoff** controlled by the decision threshold; lowering it raises recall and lowers precision.',
    '**ROC-AUC** is threshold-independent and equals the probability the model ranks a random positive above a random negative ($0.5$ = random, $1.0$ = perfect).',
  ],
  additionalSections: [
    {
      heading: 'From the Confusion Matrix to Precision, Recall, and F1',
      content: `
Every scalar metric for binary classification is just a different summary of four counts. Fix a decision threshold, label each example, and tally:

$$ \\begin{array}{c|cc} & \\text{Pred} + & \\text{Pred} - \\\\ \\hline \\text{Actual} + & TP & FN \\\\ \\text{Actual} - & FP & TN \\end{array} $$

The three workhorse metrics read off this table directly:

$$ \\text{Precision} = \\frac{TP}{TP + FP}, \\qquad \\text{Recall} = \\frac{TP}{TP + FN}, \\qquad F_1 = \\frac{2 \\cdot P \\cdot R}{P + R} = \\frac{2TP}{2TP + FP + FN} $$

Precision divides by the **column** of predicted positives — it measures how trustworthy a positive prediction is. Recall divides by the **row** of actual positives — it measures coverage of the true positives. They answer genuinely different questions and the same model can be strong on one and weak on the other.

**Worked confusion-matrix example.** A spam filter is evaluated on $1000$ emails. It produces $TP = 80$, $FP = 20$, $FN = 40$, $TN = 860$.

$$ \\text{Precision} = \\frac{80}{80 + 20} = 0.80, \\qquad \\text{Recall} = \\frac{80}{80 + 40} = \\frac{80}{120} \\approx 0.667 $$

$$ F_1 = \\frac{2 \\times 0.80 \\times 0.667}{0.80 + 0.667} = \\frac{1.067}{1.467} \\approx 0.727 $$

So $80\\%$ of flagged emails really are spam, but the filter only catches $\\approx 67\\%$ of all spam. The $F_1$ of $\\approx 0.73$ sits between the two and is dragged toward the **lower** value — that is the signature of the harmonic mean.

**The precision-recall tradeoff.** A probabilistic classifier outputs a score; you convert it to a label by thresholding at $t$. Raising $t$ makes the model more selective: fewer positives are flagged, so $FP$ falls (precision rises) but $FN$ rises (recall falls). Lowering $t$ does the reverse. You cannot freely maximize both — you choose an operating point that matches the cost of false alarms versus missed positives.
      `,
    },
    {
      heading: 'ROC Curves and AUC: A Threshold-Free Summary',
      content: `
Rather than commit to one threshold, the **ROC curve** sweeps every threshold and plots the True Positive Rate (recall) against the False Positive Rate:

$$ \\text{TPR} = \\frac{TP}{TP + FN}, \\qquad \\text{FPR} = \\frac{FP}{FP + TN} $$

At a very high threshold nothing is flagged positive, so the curve starts at $(0, 0)$; at a very low threshold everything is flagged, so it ends at $(1, 1)$. A model that perfectly separates the classes hugs the top-left corner. A model that guesses randomly traces the diagonal $\\text{TPR} = \\text{FPR}$.

The **Area Under the Curve (AUC)** collapses the whole curve into one number with a clean probabilistic meaning:

$$ \\text{AUC} = P\\big(\\,\\hat{s}(x^{+}) > \\hat{s}(x^{-})\\,\\big) $$

the probability that the model assigns a higher score to a randomly drawn positive than to a randomly drawn negative. Hence $\\text{AUC} = 0.5$ is no better than coin-flipping, $\\text{AUC} = 1.0$ is perfect ranking, and AUC is **threshold-independent** — it judges the ranking, not any single operating point.

**Caveat on imbalance.** Because FPR has the large true-negative count $TN$ in its denominator, a flood of easy negatives barely moves the FPR, so ROC-AUC can look reassuringly high even when the model is poor at the rare positive class. When positives are rare, prefer the **Precision-Recall curve** and its area (average precision), which ignore $TN$ entirely.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A classifier yields the confusion matrix $TP = 50$, $FP = 10$, $FN = 5$, $TN = 35$. Compute accuracy, precision, recall, and F1.',
      difficulty: 'warm-up',
      hint: 'Accuracy uses all four counts; precision divides by predicted positives, recall by actual positives.',
      solution: 'Total $= 50 + 10 + 5 + 35 = 100$. Accuracy $= \\frac{TP + TN}{100} = \\frac{50 + 35}{100} = 0.85$. Precision $= \\frac{50}{50 + 10} \\approx 0.833$. Recall $= \\frac{50}{50 + 5} \\approx 0.909$. F1 $= \\frac{2 \\times 0.833 \\times 0.909}{0.833 + 0.909} = \\frac{1.515}{1.742} \\approx 0.870$.',
    },
    {
      prompt: 'A dataset has 990 negatives and 10 positives. A lazy model predicts **negative for every example**. Compute its accuracy, then its recall and precision for the positive class, and explain why accuracy is misleading here.',
      difficulty: 'core',
      hint: 'For an all-negative model, $TP = 0$ and $FP = 0$. Watch the precision denominator.',
      solution: 'The model gets all 990 negatives right and all 10 positives wrong: $TN = 990$, $FN = 10$, $TP = 0$, $FP = 0$. Accuracy $= \\frac{0 + 990}{1000} = 0.99$ ($99\\%$). Recall $= \\frac{0}{0 + 10} = 0$ — it catches **none** of the positives. Precision $= \\frac{0}{0 + 0}$ is undefined (conventionally reported as $0$). Despite the impressive $99\\%$ accuracy, the model is worthless for finding the rare class. This is the **accuracy paradox**: on imbalanced data, accuracy is dominated by the majority class and hides total failure on the minority class.',
    },
    {
      prompt: 'A cancer screening test is being tuned. You may pick a high-recall operating point ($R = 0.98$, $P = 0.30$) or a high-precision one ($R = 0.55$, $P = 0.90$). Which should the screening program choose, and why? Compute F1 for both.',
      difficulty: 'core',
      solution: 'High-recall point: F1 $= \\frac{2 \\times 0.30 \\times 0.98}{0.30 + 0.98} = \\frac{0.588}{1.28} \\approx 0.459$. High-precision point: F1 $= \\frac{2 \\times 0.90 \\times 0.55}{0.90 + 0.55} = \\frac{0.99}{1.45} \\approx 0.683$. Although the high-precision point has the better F1, a **screening** test should favor the high-recall point. A false negative means a missed cancer (potentially fatal), whereas a false positive only triggers a follow-up test. Missing a true case is far costlier than a false alarm, so recall is the priority — F1 is the wrong objective when the two error types have very different costs.',
    },
    {
      prompt: 'Model A has ROC-AUC $= 0.92$ and Model B has ROC-AUC $= 0.74$, both at the default $0.5$ threshold giving identical accuracy of $0.88$. What does the AUC gap tell you that accuracy does not, and what does AUC $= 0.92$ mean concretely?',
      difficulty: 'challenge',
      hint: 'AUC is a property of the ranking across all thresholds, not of one operating point.',
      solution: 'Accuracy is measured at a single threshold, so two models can tie on accuracy yet rank examples very differently. AUC is **threshold-independent**: it summarizes how well each model separates positives from negatives across every threshold. Model A (AUC $0.92$) ranks a random positive above a random negative $92\\%$ of the time, versus $74\\%$ for Model B. So Model A gives you far more headroom to tune the threshold for a desired precision/recall tradeoff, and is the more robust ranker even though the two look equal at the default cutoff. Concretely, AUC $= 0.92$ means $P(\\hat{s}(x^+) > \\hat{s}(x^-)) = 0.92$.',
    },
  ],
  comparisons: [
    {
      title: 'Accuracy vs Precision/Recall vs F1 vs ROC-AUC',
      methods: ['Accuracy', 'Precision / Recall', 'F1', 'ROC-AUC'],
      rows: [
        {
          dimension: 'What it measures',
          values: [
            'Overall fraction of correct predictions',
            'Trustworthiness of positives (P) and coverage of positives (R), separately',
            'Harmonic mean balancing precision and recall',
            'Quality of the ranking / separability across all thresholds',
          ],
        },
        {
          dimension: 'Behavior on class imbalance',
          values: [
            'Misleading — dominated by the majority class',
            'Informative — exposes failure on the rare positive class',
            'Robust — stays low if either P or R collapses',
            'Can be optimistic; prefer PR-AUC when positives are rare',
          ],
        },
        {
          dimension: 'Threshold-dependent?',
          values: ['Yes', 'Yes', 'Yes', 'No — integrates over all thresholds'],
        },
        {
          dimension: 'When to use',
          values: [
            'Balanced classes with equal error costs',
            'You care about a specific error type (false alarms vs misses)',
            'You need one balanced score on imbalanced data',
            'Comparing/ranking models independent of a chosen cutoff',
          ],
        },
      ],
      takeaway: 'Never trust accuracy alone on imbalanced data. Use precision/recall (or F1) at your chosen operating point, and ROC-AUC (or PR-AUC for rare positives) to compare models across thresholds.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'Use **recall** when missing a positive is costly — disease screening, fraud detection, safety alarms.',
      'Use **precision** when a false positive is costly — spam filtering, flagging accounts for suspension, expensive follow-up actions.',
      'Use **F1** when you need a single balanced number and the classes are imbalanced.',
      'Use **ROC-AUC** (or PR-AUC) to compare models independently of any chosen threshold.',
    ],
    avoidWhen: [
      'Never report **accuracy alone** on imbalanced data — it hides total failure on the rare class.',
      'Avoid **ROC-AUC** as the headline metric when positives are very rare — a sea of true negatives flatters the FPR; use PR-AUC instead.',
      'Avoid **F1** when the costs of false positives and false negatives are very different — optimize the relevant one (or a weighted $F_\\beta$) instead.',
    ],
    rulesOfThumb: [
      'Always look at the full confusion matrix before trusting any single scalar.',
      'Pick the metric from the **business cost** of each error type, not by convenience.',
      'On rare-positive problems, report precision, recall, and PR-AUC together rather than accuracy or ROC-AUC alone.',
      'Quote the threshold whenever you report precision, recall, or F1 — they all move with it.',
    ],
  },
  caseStudies: [
    {
      title: 'Why a 99.8%-accurate fraud model can be useless',
      domain: 'Financial fraud detection',
      scenario: 'Credit-card fraud is extreme imbalance: in a benchmark of $284{,}807$ transactions only $492$ ($\\approx 0.17\\%$) are fraudulent. A model that simply predicts "legitimate" for every transaction is correct on the $284{,}315$ genuine ones and wrong only on the $492$ frauds, scoring $\\frac{284{,}315}{284{,}807} \\approx 99.8\\%$ accuracy — yet it catches **zero** fraud.',
      approach: 'Discard accuracy and evaluate with metrics that focus on the rare positive class: precision, recall, and the area under the Precision-Recall curve. Sweep the decision threshold to trace the precision-recall tradeoff and choose an operating point that catches enough fraud without drowning analysts in false alarms.',
      outcome: 'The all-negative baseline has accuracy $\\approx 99.8\\%$ but recall $= 0$ and precision undefined ($0$) — the precision/recall view immediately reveals it is worthless. A genuine classifier on this data instead achieves high **PR-AUC (average precision $\\approx 0.8$)** while accuracy barely moves, demonstrating that on $0.17\\%$-positive data only precision, recall, and PR-AUC — not accuracy or even ROC-AUC — reveal real performance.',
      source: {
        title: 'Credit Card Fraud Detection (ULB Machine Learning Group dataset, Kaggle)',
        authors: 'Dal Pozzolo, A., Caelen, O., Johnson, R. A. and Bontempi, G.',
        url: 'https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud',
        type: 'documentation',
      },
    },
  ],
  quiz: [
    {
      question: 'On a dataset that is 99% negative, a model that always predicts "negative" achieves 99% accuracy. What is the right conclusion?',
      options: [
        { text: 'Accuracy is misleading here; the model has zero recall and is useless for the positive class.', correct: true },
        { text: 'The model is excellent because 99% accuracy is very high.', correct: false },
        { text: 'The model has high precision and high recall.', correct: false },
        { text: 'Accuracy is always the best metric for this problem.', correct: false },
      ],
      explanation: 'This is the accuracy paradox. With $TP = 0$, recall $= \\frac{0}{0 + FN} = 0$, so the model never finds a positive. Accuracy is inflated purely by the majority class; on imbalanced data you must look at precision, recall, F1, or PR-AUC.',
    },
    {
      question: 'A model flags many emails as spam and catches almost all real spam, but a lot of legitimate email is wrongly flagged. How does this profile read in precision/recall terms?',
      options: [
        { text: 'High recall, low precision.', correct: true },
        { text: 'High precision, low recall.', correct: false },
        { text: 'High precision, high recall.', correct: false },
        { text: 'Low precision, low recall.', correct: false },
      ],
      explanation: 'Catching almost all real spam means few false negatives, so recall $= \\frac{TP}{TP + FN}$ is high. Wrongly flagging legitimate email means many false positives, so precision $= \\frac{TP}{TP + FP}$ is low. Recall is about coverage of the positives; precision is about the trustworthiness of a positive prediction.',
    },
    {
      question: 'Why is F1 defined as the harmonic mean of precision and recall rather than the arithmetic mean?',
      options: [
        { text: 'The harmonic mean stays low unless BOTH precision and recall are high, punishing a model that sacrifices one for the other.', correct: true },
        { text: 'The harmonic mean is always larger than the arithmetic mean, making scores look better.', correct: false },
        { text: 'The arithmetic mean cannot be computed when precision and recall differ.', correct: false },
        { text: 'The harmonic mean ignores recall entirely.', correct: false },
      ],
      explanation: 'The harmonic mean is dominated by the smaller value. A model with precision $1.0$ and recall $0.01$ has arithmetic mean $\\approx 0.50$ but F1 $= \\frac{2 \\times 1.0 \\times 0.01}{1.01} \\approx 0.02$. That is exactly what we want: F1 rewards a genuine balance rather than letting one strong number mask a collapsed one.',
    },
    {
      question: 'What does an ROC-AUC of 0.85 mean?',
      options: [
        { text: 'There is an 85% chance the model scores a random positive higher than a random negative; it is threshold-independent.', correct: true },
        { text: 'The model is correct 85% of the time at the default threshold.', correct: false },
        { text: 'The model has 85% precision.', correct: false },
        { text: 'AUC measures performance only at the 0.5 threshold.', correct: false },
      ],
      explanation: 'AUC equals $P(\\hat{s}(x^+) > \\hat{s}(x^-))$ — the probability a random positive is ranked above a random negative. It summarizes the ranking across all thresholds, so it is threshold-independent and is not an accuracy or precision at any single cutoff. $0.5$ is random, $1.0$ is perfect.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
