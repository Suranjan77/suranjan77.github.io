import { Algorithm } from "./types";

export const evaluationMetrics: Algorithm = {
  id: "evaluation-metrics",
  title: "Evaluation Metrics",
  category: "Evaluation Metrics",
  shortDescription: "Measuring binary classification performance using confusion matrices, precision, recall, and ROC/AUC curves.",

  fullDescription: `
Evaluating classification models goes beyond simple accuracy. In many datasets (particularly imbalanced ones like fraud detection or medical diagnosis), a model that guesses the majority class can have 99% accuracy while being completely useless.

To accurately assess performance, we construct a **Confusion Matrix** to map actual vs. predicted labels, and derive metrics like **Precision**, **Recall**, and **F1-Score**. By sweeping the decision threshold, we draw the **Receiver Operating Characteristic (ROC) Curve**.
  `,

  intuition: `
Imagine a fire alarm:
- **True Positive (TP)**: There is a fire, and the alarm rings. (Success).
- **False Positive (FP / Type I Error)**: There is no fire, but the alarm rings anyway. (False alarm - annoying, hurts precision).
- **True Negative (TN)**: There is no fire, and the alarm is silent. (Success).
- **False Negative (FN / Type II Error)**: There is a fire, but the alarm stays silent. (Disaster - hurts recall).

A sensitive alarm has high **Recall** (catches every fire) but low **Precision** (lots of false alarms). A conservative alarm has high **Precision** (only rings when there is definitely a fire) but low **Recall** (might miss small fires). The threshold slider balances these two risks.
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
