import { LearningModule } from "./types";

export const appliedMlWorkflow: LearningModule = {
  id: "applied-ml-workflow",
  title: "Applied ML Workflow & Concepts",
  category: "Machine Learning Concepts",
  prerequisites: [],
  tracks: ["practitioner"],
  difficulty: 2,
  estimatedMinutes: 60,
  shortDescription: "A comprehensive guide to the applied machine learning lifecycle: data preparation, bias-variance tradeoff, model selection, evaluation metrics, and handling anomalies.",
  learningObjectives: [
    "Understand the importance of data preparation, scaling, encoding, and feature engineering.",
    "Recognize the bias-variance tradeoff, and learn to diagnose underfitting and overfitting.",
    "Select and interpret appropriate evaluation metrics (Precision, Recall, F1, ROC-AUC) based on business context.",
    "Implement robust model selection workflows using techniques like K-Fold Cross-Validation.",
    "Identify techniques and algorithms used for anomaly detection and outlier handling."
  ],
  keyTerms: [
    { term: "Data Leakage", definition: "A critical error where information from outside the training dataset (such as the test set) is inadvertently used to train the model, artificially inflating performance estimates." },
    { term: "Bias-Variance Tradeoff", definition: "The fundamental tension between a model's ability to learn complex patterns (variance) and its underlying assumptions about the data (bias)." },
    { term: "Cross-Validation", definition: "A robust resampling procedure used to evaluate models, where data is split into folds, and the model is trained and validated iteratively on different subsets." },
    { term: "Precision and Recall", definition: "Precision is the fraction of relevant instances among the retrieved instances, while recall is the fraction of relevant instances that were retrieved." },
    { term: "Anomaly Detection", definition: "The process of identifying rare items, events, or observations that raise suspicions by differing significantly from the majority of the data." },
    { term: "SMOTE", definition: "Synthetic Minority Over-sampling Technique, a method used to address imbalanced datasets by generating synthetic samples for the minority class." }
  ],
  hasVisualization: false,
  fullDescription: `The journey of a machine learning model from conception to production involves much more than just picking an algorithm and calling \`.fit()\`. In the real world, the bulk of a practitioner's time is spent grappling with messy data, diagnosing model performance, and ensuring that the model generalizes well to unseen data. This module consolidates these critical **Applied Machine Learning Workflow** concepts.

We begin with **Data Preparation and Feature Engineering**, which form the foundation of any predictive model. Garbage in means garbage out. We cover strategies for handling missing data, transforming distributions, and encoding categorical variables safely without causing data leakage.

Next, we explore the core diagnostic tool of machine learning: **The Bias-Variance Tradeoff**. Understanding this tradeoff allows you to diagnose why a model is failing—whether it's too simple to capture the underlying trend (high bias) or so complex that it memorizes noise (high variance).

Following that, we dive into **Model Selection and Cross-Validation**. Relying on a single train-test split is often misleading due to sampling variability. We discuss K-Fold cross-validation, stratified sampling, and how to tune hyperparameters properly without leaking information.

We then address the critical issue of **Evaluation Metrics**. Accuracy is a dangerous metric on imbalanced datasets. We unpack Confusion Matrices, Precision, Recall, F1-Score, and the ROC-AUC curve, teaching you how to align mathematical metrics with business objectives.

Finally, we cover **Anomaly Detection**, a unique paradigm where the goal is not merely classification, but identifying outliers in highly skewed contexts like fraud detection or predictive maintenance.`,
  tldr: [
    "Data preparation is the foundation of ML. Always split your data *before* applying transformations to prevent data leakage.",
    "The Bias-Variance tradeoff defines model behavior. High bias leads to underfitting; high variance leads to overfitting.",
    "Never rely on a single train-test split for hyperparameter tuning. Use K-Fold Cross-Validation.",
    "Accuracy is misleading on imbalanced datasets. Use Precision, Recall, F1-Score, or ROC-AUC depending on the cost of false positives vs. false negatives.",
    "Anomaly detection focuses on finding rare, structural outliers, using methods like Isolation Forests or One-Class SVMs."
  ],
  additionalSections: [
    {
      heading: "1. Data Preparation & Feature Engineering",
      content: `Before any algorithm can learn, data must be cleaned, transformed, and engineered. 

**Handling Missing Data**: Missing values can crash algorithms or skew results. 
* *Imputation* replaces missing values with the mean, median, or mode.
* *Advanced Imputation* uses algorithms (like KNN) to predict the missing value based on other features.
* *Flagging* involves creating a new binary feature indicating whether the value was missing, which can sometimes carry predictive signal.

**Feature Scaling**: Algorithms relying on distances (like KNN, SVMs, or Neural Networks) require features to be on a similar scale.
* *Standardization (Z-score)*: Centers data around a mean of 0 and a standard deviation of 1. Best when data follows a Gaussian distribution.
* *Min-Max Scaling*: Squeezes data into a fixed range, usually [0, 1]. Useful when you need strict bounds.

**Categorical Encoding**: Algorithms only understand numbers.
* *One-Hot Encoding*: Creates a binary column for each category. Safe for nominal data but can lead to high dimensionality (the "curse of dimensionality").
* *Ordinal Encoding*: Assigns an integer to each category. Only use this when there is an inherent mathematical order (e.g., Low=1, Medium=2, High=3).

> [!WARNING]
> **Data Leakage**: The cardinal sin of data preparation. If you apply a standard scaler to your *entire* dataset before splitting into train/test, information about the test set's distribution leaks into the training process. Always split first, fit the scaler on the train set, and then transform both train and test sets.`
    },
    {
      heading: "2. The Bias-Variance Tradeoff",
      content: `Every supervised learning algorithm faces a fundamental tradeoff between Bias and Variance.

* **Bias** is the error introduced by approximating a real-world problem, which may be complex, with a simplified model. High bias models (e.g., Linear Regression) make strong assumptions and tend to **underfit** the data.
* **Variance** is the model's sensitivity to small fluctuations in the training set. High variance models (e.g., Deep Decision Trees) model the random noise in the training data rather than the intended outputs, causing them to **overfit**.

**Diagnosing the Tradeoff:**
* **High Training Error, High Validation Error:** The model is underfitting (High Bias). Solution: Add more complex features, use a more complex algorithm, or decrease regularization.
* **Low Training Error, High Validation Error:** The model is overfitting (High Variance). Solution: Get more training data, simplify the model, apply regularization, or use techniques like dropout (in neural networks) or pruning (in trees).`
    },
    {
      heading: "3. Model Selection and Cross-Validation",
      content: `How do we know a model will perform well in the real world? A single train/test split is risky—by pure luck, the test set might contain easy examples, giving a false sense of security.

**K-Fold Cross-Validation** mitigates this risk:
1. The training dataset is divided into $K$ equally sized folds.
2. The model is trained $K$ times. In each iteration, it trains on $K-1$ folds and validates on the remaining 1 fold.
3. The final performance metric is the average of the metrics from all $K$ iterations.

This ensures every data point gets a turn in the validation set, providing a robust estimate of out-of-sample performance.

When tuning hyperparameters (e.g., finding the best learning rate or tree depth), you must use a **Train / Validation / Test** split or **Nested Cross-Validation**. If you tune hyperparameters based on test set performance, you are overfitting to the test set, invalidating it as a true measure of generalization.`
    },
    {
      heading: "4. Evaluation Metrics Beyond Accuracy",
      content: `Consider a dataset predicting a rare disease that occurs in 1% of the population. A model that simply predicts "No Disease" for everyone achieves 99% accuracy but is entirely useless.

For imbalanced datasets, we turn to the **Confusion Matrix** (True Positives, False Positives, True Negatives, False Negatives) and its derived metrics:

* **Precision**: Of all instances the model predicted as positive, how many were actually positive? $\\frac{TP}{TP + FP}$. Use when the cost of a false positive is high (e.g., spam filtering).
* **Recall (Sensitivity)**: Of all actual positive instances, how many did the model find? $\\frac{TP}{TP + FN}$. Use when the cost of a false negative is high (e.g., cancer screening).
* **F1-Score**: The harmonic mean of Precision and Recall. It punishes extreme values, providing a balanced metric when you care about both.
* **ROC Curve & AUC**: The Receiver Operating Characteristic curve plots the True Positive Rate against the False Positive Rate at various threshold settings. The Area Under the Curve (AUC) provides an aggregate measure of performance across all possible classification thresholds. An AUC of 1.0 is perfect; 0.5 is random guessing.`
    },
    {
      heading: "5. Anomaly Detection",
      content: `Anomaly Detection (or Outlier Detection) is the identification of rare items, events, or observations that raise suspicions by differing significantly from the majority of the data. 

Unlike standard classification, anomaly detection datasets are wildly imbalanced (e.g., 1 anomaly for every 10,000 normal events), and the anomalies often don't follow a consistent pattern—they are just "different."

**Common Techniques:**
* **Statistical Methods**: Flagging points that are more than 3 standard deviations from the mean (Z-Score). Only works well for low-dimensional, normally distributed data.
* **Isolation Forests**: An ensemble of random decision trees. Anomalies are "few and different," meaning they require fewer splits to be isolated in a tree structure. The shorter the path length to isolate a point, the more anomalous it is.
* **One-Class SVM**: Learns a tight boundary encompassing the "normal" data. Anything falling outside this boundary is flagged as an anomaly.`
    }
  ],
  workedExamples: [
    {
      title: "Choosing between Precision and Recall",
      problem: "You are building a fraud detection model for a credit card company. A False Positive means declining a legitimate transaction (annoying the customer). A False Negative means letting a fraudulent transaction through (costing the bank money). How do you balance metrics?",
      solution: "In fraud detection, a False Negative (missed fraud) usually costs significantly more money than a False Positive (declined transaction). Therefore, you should optimize the model for **higher Recall** to catch as much fraud as possible. However, if Recall gets too high at the severe expense of Precision, customer churn will increase due to declined cards. Teams usually set a minimum acceptable Precision floor, and then maximize Recall."
    },
    {
      title: "Diagnosing Bias vs Variance",
      problem: "You train a Random Forest on a housing dataset. Your Training Mean Absolute Error (MAE) is $5,000, but your Validation MAE is $45,000. Is your model suffering from high bias or high variance, and what should you do?",
      solution: "The model is suffering from **High Variance (Overfitting)**. It has essentially memorized the training data (very low error) but fails to generalize to unseen data (very high validation error). To fix this, you should reduce the complexity of the Random Forest: limit the `max_depth` of the trees, increase `min_samples_split`, or gather more training data."
    },
    {
      title: "Data Leakage in Scaling",
      problem: "A junior data scientist runs `StandardScaler().fit_transform(X)` on the entire dataset `X`, and then splits the data using `train_test_split`. Why is this a problem?",
      solution: "This is **Data Leakage**. By fitting the scaler on the entire dataset, the scaler calculates the mean and standard deviation using the test data. The training data is then transformed using information from the test data. The test data is no longer truly unseen. The correct approach is to split the data first, call `fit()` only on the training data, and then `transform()` both sets."
    }
  ],
  practiceExercises: [
    {
      difficulty: "warm-up",
      prompt: "A spam filter classifies 100 emails. It predicts 20 are spam. Out of those 20, 15 are actually spam (True Positives), and 5 are legitimate (False Positives). It misses 10 actual spam emails (False Negatives). Calculate the Precision.",
      solution: "Precision = TP / (TP + FP)\nPrecision = 15 / (15 + 5) = 15 / 20 = 0.75 or 75%."
    },
    {
      difficulty: "core",
      prompt: "Explain why K-Fold Cross-Validation is preferred over a single Train-Test split, especially for small datasets.",
      solution: "With small datasets, a single train-test split is highly susceptible to random variance—the test set might accidentally contain only 'easy' or 'hard' examples. K-Fold CV ensures that every single data point is used in the validation set exactly once, providing a much more reliable and stable estimate of the model's true performance."
    },
    {
      difficulty: "challenge",
      prompt: "You are building a model to predict mechanical failure in a jet engine (an extremely rare but catastrophic event). You achieve 99.9% accuracy. Why should you still be concerned, and what metrics would give you a better picture?",
      solution: "Because engine failure is extremely rare (perhaps 1 in 10,000 flights), a naive model that always predicts 'No Failure' will achieve 99.99% accuracy. Accuracy hides the fact that the model fails to detect the minority class. You should use **Recall** (to ensure you aren't missing catastrophic failures) and look at the **Precision-Recall Curve (PR-AUC)** rather than just accuracy or ROC-AUC, since PR-AUC is more informative for highly imbalanced datasets."
    }
  ],
  quiz: [
    {
      question: "Which of the following is an example of Data Leakage?",
      options: [
        { text: "Applying One-Hot Encoding to categorical variables before training.", correct: false },
        { text: "Imputing missing values in the entire dataset using the global mean before splitting into train and test sets.", correct: true },
        { text: "Using 10-Fold Cross-Validation to tune hyperparameters.", correct: false },
        { text: "Removing outliers that fall 3 standard deviations away from the mean in the training set.", correct: false }
      ],
      explanation: "Imputing with the global mean uses information from the test set (which influences the global mean) to fill values in the training set. This leaks future information. Always split first, then impute the training set, and use the training set's mean to impute the test set."
    },
    {
      question: "If your model performs poorly on the training data AND poorly on the validation data, what is the most likely diagnosis?",
      options: [
        { text: "High Variance (Overfitting)", correct: false },
        { text: "High Bias (Underfitting)", correct: true },
        { text: "Data Leakage", correct: false },
        { text: "Perfectly balanced Bias and Variance", correct: false }
      ],
      explanation: "Poor performance on both train and validation sets indicates the model is too simple to capture the underlying patterns in the data. This is High Bias (underfitting)."
    },
    {
      question: "In the context of the Confusion Matrix, what does a False Positive represent in a medical test for a disease?",
      options: [
        { text: "A sick patient diagnosed as sick.", correct: false },
        { text: "A healthy patient diagnosed as sick.", correct: true },
        { text: "A sick patient diagnosed as healthy.", correct: false },
        { text: "A healthy patient diagnosed as healthy.", correct: false }
      ],
      explanation: "A False Positive occurs when the model predicts the positive class (Disease) but the actual class is negative (Healthy)."
    },
    {
      question: "How does the Isolation Forest algorithm identify anomalies?",
      options: [
        { text: "By fitting a Gaussian distribution and finding points with low probability.", correct: false },
        { text: "By mapping data to a high-dimensional space and finding a hyper-sphere that encloses normal data.", correct: false },
        { text: "By randomly partitioning data and isolating points; anomalies require fewer partitions to be isolated.", correct: true },
        { text: "By finding points that have the fewest nearest neighbors within a specific radius.", correct: false }
      ],
      explanation: "Isolation Forests build random decision trees. Anomalies, being 'few and different', are separated from the rest of the data closer to the root of the tree (requiring fewer splits/partitions)."
    }
  ],
  caseStudies: [
    {
      title: "Predictive Maintenance in Manufacturing",
      scenario: "A manufacturing plant wants to predict when a critical milling machine is about to fail. The dataset contains vibration and temperature sensor logs recorded every second for two years. Failures occurred only 5 times in two years. The plant manager trained a Logistic Regression model and is thrilled that it achieves 99.99% accuracy.",
      approach: "The data science team steps in and realizes the accuracy metric is a trap. They switch the evaluation metric to Recall and the Precision-Recall AUC. They discover the Logistic Regression model has a Recall of 0%—it never once predicted a failure. They switch the approach to an Anomaly Detection framework using Isolation Forests, treating failures as outliers rather than a standard binary classification task.",
      outcome: "By shifting the workflow to Anomaly Detection and optimizing for Recall, the new system correctly predicted 4 out of the next 5 failures hours in advance, saving the plant an estimated $2.5 million in unplanned downtime, despite an increase in false positive alerts."
    }
  ],
  comparisons: [
    {
      title: "Evaluation Metrics Comparison",
      methods: ["Accuracy", "Precision", "Recall", "F1-Score"],
      rows: [
        { dimension: "Definition", values: ["Overall correctness", "Exactness (Quality)", "Completeness (Quantity)", "Harmonic mean of Precision/Recall"] },
        { dimension: "Best Used When", values: ["Balanced classes", "False Positives are costly", "False Negatives are costly", "Seeking a balance on imbalanced data"] },
        { dimension: "Vulnerability", values: ["Imbalanced datasets", "Can be gamed by predicting positive rarely", "Can be gamed by predicting positive always", "Less intuitive to explain to business stakeholders"] }
      ],
      takeaway: "Never rely on Accuracy for rare events. Choose Precision when false alarms are expensive, and Recall when missing an event is dangerous."
    }
  ],
  usageGuidance: [
    {
      useWhen: [
        "Use K-Fold Cross-Validation for almost all tabular data problems to ensure robust model selection.",
        "Use Stratified K-Fold for imbalanced classification tasks to ensure each fold has the same ratio of classes.",
        "Use Precision and Recall for evaluating models on highly skewed datasets."
      ],
      avoidWhen: [
        "Avoid random K-Fold splits on Time Series data; use time-based sequential splitting instead.",
        "Avoid using standard supervised algorithms out-of-the-box for anomaly detection; use specialized outlier models.",
        "Never use test data for any form of scaling, imputation, or hyperparameter tuning."
      ]
    }
  ],
  references: [
    {
      title: "Scikit-Learn Documentation: Cross-validation",
      url: "https://scikit-learn.org/stable/modules/cross_validation.html",
      type: "documentation",
      description: "Comprehensive guide to evaluating estimator performance robustly."
    },
    {
      title: "Understanding the Bias-Variance Tradeoff",
      url: "http://scott.fortmann-roe.com/docs/BiasVariance.html",
      type: "tutorial",
      description: "A classic, highly visual essay explaining the tradeoff."
    },
    {
      title: "Isolation Forest (Liu, Ting and Zhou, 2008)",
      url: "https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf",
      type: "paper",
      description: "The original paper introducing the Isolation Forest algorithm for anomaly detection."
    }
  ],
  misconceptions: [
    {
      claim: "High accuracy always means a good model.",
      correction: "If a dataset has 99% negative cases and 1% positive cases, a dummy model that always predicts 'negative' will have 99% accuracy but is completely useless. You need metrics like Precision, Recall, and F1-score to reveal the truth."
    },
    {
      claim: "You should use your entire dataset to scale features (e.g. Min-Max) before splitting into train/test.",
      correction: "This causes data leakage. The test set's mean, variance, or min/max will influence the training data. Always split the data first, fit the scaler on the training set, and then transform both sets."
    },
    {
      claim: "More data always solves high bias (underfitting).",
      correction: "Adding more data to an underfitting model will not help. If a linear line cannot fit a curved relationship, millions of data points won't make the straight line bend. You need a more complex model or better features."
    }
  ],
  failureModes: [
    {
      name: "Data Leakage during Cross Validation",
      description: "Applying a transformation (like SMOTE oversampling or feature selection) to the entire training dataset before doing cross-validation.",
      mitigation: "Always perform data transformations *inside* the cross-validation loop. Libraries like Scikit-Learn's `Pipeline` object ensure that transformations are applied exclusively to the training folds during each CV iteration."
    },
    {
      name: "Optimizing the Wrong Metric",
      description: "Spending weeks tuning a model to improve ROC-AUC from 0.85 to 0.88, only to realize the business problem required minimizing False Positives, and the new model actually has worse Precision.",
      mitigation: "Establish the business cost of False Positives vs False Negatives before modeling begins. Tie hyperparameter search directly to the specific metric that reflects business value (e.g., F1-Score or custom cost functions)."
    }
  ]
};
