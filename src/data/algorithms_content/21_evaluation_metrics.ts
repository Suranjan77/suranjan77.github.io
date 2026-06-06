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
`
};
