import { LearningModule } from "./types";

export const decisionTrees: LearningModule = {
  id: "decision-trees",
  title: "Decision Trees",
  category: "Decision Trees",
  prerequisites: ["probability-theory"],
  tracks: ["practitioner"],
  difficulty: 2,
  shortDescription: "A flowchart-like model that makes decisions by asking a series of yes/no questions about features.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Explain how decision trees partition feature space recursively',
    'Compute Gini Impurity and Entropy for a given set of labels',
    'Calculate Information Gain to determine the optimal split feature and threshold',
    'Describe the role of pruning and tree depth constraints in preventing overfitting',
  ],
  keyTerms: [
    { term: 'Gini Impurity', definition: 'A metric measuring the probability of a random sample being classified incorrectly if it were randomly labeled according to the class distribution.' },
    { term: 'Information Gain', definition: 'The reduction in entropy or impurity achieved by partitioning a dataset according to a feature.' },
    { term: 'Pruning', definition: 'A technique that simplifies a decision tree by removing sections that provide little power to classify instances.' },
  ],
  workedExamples: [
    {
      title: 'Information Gain Calculation',
      problem: 'A node has 4 positive and 4 negative instances (entropy = 1). A split divides it into Node A (3 positive, 1 negative) and Node B (1 positive, 3 negative). Calculate the Information Gain. (Use entropy: Node A & B entropy $\\approx 0.811$).',
      solution: 'Parent entropy $H(D) = 1.0$. Split sizes are $|D_A| = 4, |D_B| = 4, |D| = 8$. Weighted child entropy = $\\frac{4}{8}(0.811) + \\frac{4}{8}(0.811) = 0.811$. Information Gain = $1.0 - 0.811 = 0.189$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Decision Trees always require features to be scaled (e.g. Z-score normalization).',
      correction: 'Unlike distance-based models, Decision Trees split features individually at single thresholds, meaning scaling has absolutely no effect on split locations or tree performance.'
    },
    {
      claim: 'A deeper tree is always more accurate.',
      correction: 'Deep trees can achieve 100% accuracy on training data but overfit significantly by memorizing noise. They perform poorly on unseen testing data unless regularized via depth limits or minimum sample splits.'
    }
  ],
  references: [
    {
      title: "Classification and Regression Trees",
      authors: "Breiman, L., Friedman, J., Stone, C.J. and Olshen, R.A",
      url: "https://www.routledge.com",
      type: "textbook"
    },
    {
      title: "Machine Learning with Random Forests and Decision Trees",
      authors: "Scott, S",
      url: "https://example.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'High Variance (Instability)',
      description: 'Small changes in the training data can alter the root split, completely changing the downstream tree structure.',
      mitigation: 'Use ensemble methods like Random Forest or Gradient Boosting, which average out individual tree variance.'
    }
  ],
  fullDescription: `
Decision Trees are non-parametric supervised learning models used for both classification and regression. They work by partitioning the feature space into distinct regions through a series of recursive binary splits. 

Starting at the root node, the model checks a specific feature condition (e.g., "Is age < 30?"). If yes, it goes down the left branch; if no, it goes down the right branch. This process repeats at subsequent nodes until a leaf node is reached, which contains the final prediction.

### Where is it used?
Decision Trees are widely used in business, finance, and medicine, where model interpretability and transparency are critical (e.g., explaining why a loan was denied, or determining a patient's risk category based on symptoms). They also serve as the fundamental building block for ensemble models like Random Forests and Gradient Boosting Machines.
  `,
  intuition: `
Imagine playing the game "20 Questions" to guess an animal. You don't ask "Does it have a tail?" first, because that doesn't narrow it down much. You ask "Is it a mammal?" because that splits the animal kingdom in half. A Decision Tree uses math to figure out the absolute best sequence of questions to ask to arrive at the right answer as fast as possible.
  `,
  mathematics: `
### 1. Splitting Criteria (Purity Metrics)
To find the best split at any node, the algorithm evaluates every possible feature split and measures the "impurity" (chaos) of the resulting child nodes. It aims to maximize the purity of the child nodes.

**Gini Impurity**: Measures how often a randomly chosen element from the set would be incorrectly labeled if it were randomly labeled according to the distribution of labels in the subset. Lower is better:

$$ Gini(p) = 1 - \\sum_{i=1}^{c} p_i^2 $$

**Information Entropy**: Measures the amount of disorder or uncertainty in a node. Lower is better:

$$ Entropy(p) = - \\sum_{i=1}^{c} p_i \\log_2(p_i) $$

**Information Gain**: The difference in impurity before and after the split:

$$ Gain(D, A) = Impurity(D) - \\sum_{v \\in Values(A)} \\frac{|D_v|}{|D|} Impurity(D_v) $$
  `,
  pros: [
    "Perfectly transparent and easy to interpret or visualize.",
    "Requires little to no data preprocessing (no feature scaling needed).",
    "Handles both numerical and categorical data naturally."
  ],
  cons: [
    "High tendency to overfit if not restricted (grows deep to memorize noise).",
    "Unstable; small changes in the data can lead to a completely different tree structure.",
    "Can struggle to capture complex linear relationships (creates staircase-like boundaries)."
  ],
  codeSnippet: `import numpy as np
from sklearn.tree import DecisionTreeClassifier

# Two-dimensional feature coordinates
X = np.array([[0, 0], [1, 1.5], [1.5, 1], [8, 8], [8.5, 7.5], [9, 9]])
# Binary Labels
y = np.array([0, 0, 0, 1, 1, 1])

# Initialize and fit Decision Tree
dt = DecisionTreeClassifier(max_depth=2, random_state=42)
dt.fit(X, y)
print(f"Decision Tree Class for coordinate [7, 7]: {dt.predict([[7, 7]])[0]}")`
};
