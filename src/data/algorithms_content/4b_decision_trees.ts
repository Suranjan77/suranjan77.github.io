import { LearningModule } from "./types";

export const decisionTrees: LearningModule = {
  id: "decision-trees",
  title: "Decision Trees",
  category: "Decision Trees",
  prerequisites: [],
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
print(f"Decision Tree Class for coordinate [7, 7]: {dt.predict([[7, 7]])[0]}")`,
  tldr: [
    'A decision tree recursively partitions feature space with **axis-aligned** splits, asking one feature-threshold question per node until it reaches a leaf prediction.',
    'Each split is chosen **greedily** to minimize child impurity, measured by **Gini impurity** $1 - \\sum_i p_i^2$ or **entropy** $-\\sum_i p_i \\log_2 p_i$.',
    '**Information gain** is the drop in impurity from parent to the weighted average of the children; the algorithm picks the split with the largest gain.',
    'Trees are highly **interpretable** and need no feature scaling, but a deep, unpruned tree **overfits** by memorizing noise and is **high-variance**.',
    'Control overfitting with depth limits, minimum-samples constraints, or pruning; for raw accuracy, prefer **ensembles** (Random Forest, Gradient Boosting).',
  ],
  additionalSections: [
    {
      heading: 'Impurity Measures: Gini and Entropy Defined',
      content: `
At a node holding a set $D$ of labeled examples, let $p_i$ be the fraction of examples in class $i$ (so $\\sum_i p_i = 1$). We need a number that is **small when the node is pure** (one class dominates) and **large when classes are evenly mixed**.

**Gini impurity** is the probability that two independent draws from the node's label distribution disagree — equivalently, the chance of mislabeling a random example if we label it by sampling from the same distribution:

$$ Gini(D) = \\sum_{i=1}^{c} p_i (1 - p_i) = 1 - \\sum_{i=1}^{c} p_i^2 $$

For a pure node ($p_1 = 1$) it is $0$; for a balanced binary node ($p_1 = p_2 = 0.5$) it is $1 - (0.25 + 0.25) = 0.5$, its maximum for two classes.

**Entropy** measures the average information (in bits) needed to encode the class of a random example:

$$ H(D) = - \\sum_{i=1}^{c} p_i \\log_2(p_i) $$

It is $0$ for a pure node and $1$ bit for a balanced binary node ($-0.5\\log_2 0.5 - 0.5\\log_2 0.5 = 1$), its maximum for two classes. Both metrics share the same shape: minimized at purity, maximized at a uniform mix. Gini is slightly cheaper (no logarithm) and is the CART default, while entropy/information gain is the ID3/C4.5 default; in practice they rarely produce different trees.
      `,
    },
    {
      heading: 'Worked Split: Computing Information Gain',
      content: `
A parent node $D$ contains $10$ examples: $5$ positive and $5$ negative. We evaluate a candidate split on the feature "$age < 30$".

**Step 1 — parent impurity.** With $p_+ = p_- = 0.5$:

$$ Gini(D) = 1 - (0.5^2 + 0.5^2) = 1 - 0.5 = 0.5 $$

**Step 2 — apply the split.** The condition sends examples into two children:

$$ D_L = \\{4\\text{ positive},\\, 1\\text{ negative}\\}, \\qquad D_R = \\{1\\text{ positive},\\, 4\\text{ negative}\\} $$

**Step 3 — child impurities.** For $D_L$, $p_+ = 0.8$, $p_- = 0.2$:

$$ Gini(D_L) = 1 - (0.8^2 + 0.2^2) = 1 - (0.64 + 0.04) = 0.32 $$

By symmetry $Gini(D_R) = 0.32$ as well.

**Step 4 — weighted child impurity.** Each child has $5$ of the $10$ examples:

$$ Gini_{split} = \\frac{5}{10}(0.32) + \\frac{5}{10}(0.32) = 0.32 $$

**Step 5 — information gain.** The impurity drop from parent to children:

$$ Gain = Gini(D) - Gini_{split} = 0.5 - 0.32 = 0.18 $$

A positive gain of $0.18$ means the split makes the node meaningfully purer. The tree compares this gain against every other candidate feature and threshold, and **greedily** keeps the one with the largest gain. If we had used entropy instead, the parent entropy would be $1$ bit, each child entropy $-0.8\\log_2 0.8 - 0.2\\log_2 0.2 \\approx 0.722$, weighted child entropy $0.722$, giving an information gain of $1 - 0.722 = 0.278$ bits — a different scale, but the same ordering of which split is best.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A leaf node contains 6 examples of class A and 2 of class B. Compute its Gini impurity.',
      difficulty: 'warm-up',
      hints: ['Use $Gini = 1 - \\sum_i p_i^2$ with $p_A = 6/8$ and $p_B = 2/8$.'],
      solution: 'The proportions are $p_A = 6/8 = 0.75$ and $p_B = 2/8 = 0.25$. Then $Gini = 1 - (0.75^2 + 0.25^2) = 1 - (0.5625 + 0.0625) = 1 - 0.625 = 0.375$.',
    },
    {
      prompt: 'A node with 8 examples (4 positive, 4 negative) is split into $D_L = \\{3\\text{ pos}, 1\\text{ neg}\\}$ and $D_R = \\{1\\text{ pos}, 3\\text{ neg}\\}$. Compute the information gain using Gini impurity.',
      difficulty: 'core',
      hints: ['First get the parent Gini, then each child Gini, then weight the children by their fraction of examples.'],
      solution: 'Parent: $p_+ = p_- = 0.5$, so $Gini(D) = 1 - (0.25 + 0.25) = 0.5$. Each child has 4 examples with proportions $0.75/0.25$: $Gini(D_L) = Gini(D_R) = 1 - (0.75^2 + 0.25^2) = 1 - 0.625 = 0.375$. Weighted child Gini $= \\frac{4}{8}(0.375) + \\frac{4}{8}(0.375) = 0.375$. Information gain $= 0.5 - 0.375 = 0.125$.',
    },
    {
      prompt: 'A node of 8 examples (4 positive, 4 negative) can be split two ways. Split X yields children $\\{4\\text{ pos}, 0\\text{ neg}\\}$ and $\\{0\\text{ pos}, 4\\text{ neg}\\}$. Split Y yields $\\{3\\text{ pos}, 1\\text{ neg}\\}$ and $\\{1\\text{ pos}, 3\\text{ neg}\\}$. Which split should the tree choose, and why?',
      difficulty: 'core',
      solution: "Parent $Gini = 0.5$. Split X produces two **pure** children, each with $Gini = 1 - (1^2 + 0^2) = 0$, so weighted child Gini $= 0$ and gain $= 0.5 - 0 = 0.5$. Split Y (from the previous exercise) has weighted child Gini $= 0.375$ and gain $= 0.125$. The tree chooses **Split X** because it has the larger information gain ($0.5 > 0.125$) — it perfectly separates the classes.",
    },
    {
      prompt: 'A decision tree is grown to full depth on a noisy dataset. Analyze the relationship between training accuracy, test accuracy, impurity, and model variance in this scenario.',
      difficulty: 'challenge',
      hints: ["Consider what happens to the leaf size as the tree keeps splitting.", "Relate the purity of terminal nodes to the model's capacity to memorize noise."],
      solution: "An unrestricted tree keeps splitting until every leaf is pure ($Gini = 0$, $entropy = 0$), which in the limit means one (or a few same-class) training points per leaf. Such leaves carve the feature space into tiny axis-aligned regions that fit not just the signal but also the **noise** in the training labels, so training accuracy approaches 100%. Because these fine partitions are determined by individual points, a small change in the data would relocate them — this is the tree high variance. On unseen data those memorized boundaries do not transfer, so test accuracy drops. The fixes constrain capacity: limit max depth, require a minimum number of samples per split/leaf, or prune back low-gain branches.",
    },
  ],
  comparisons: [
    {
      title: 'Single Decision Tree vs Random Forest vs Gradient Boosting',
      methods: ['Single Decision Tree', 'Random Forest', 'Gradient Boosting'],
      rows: [
        {
          dimension: 'Bias / variance',
          values: ['Low bias, **high variance**', 'Low bias, variance reduced by averaging', 'Bias reduced sequentially, variance controlled by shrinkage'],
        },
        {
          dimension: 'Interpretability',
          values: ['High — readable if/else rules', 'Moderate — needs feature-importance summaries', 'Low — many additive trees, needs SHAP/importances'],
        },
        {
          dimension: 'Overfitting tendency',
          values: ['High if unpruned', 'Low — bagging averages out noise', 'Moderate — overfits if too many trees or high learning rate'],
        },
        {
          dimension: 'Training cost',
          values: ['Cheapest — one tree', 'Moderate — many trees, but **parallelizable**', 'Higher — trees built **sequentially**'],
        },
        {
          dimension: 'Typical accuracy',
          values: ['Baseline', 'Strong, robust out of the box', 'Often **state of the art** on tabular data when tuned'],
        },
      ],
      takeaway: 'Use a single tree when you need transparent rules; reach for Random Forest for a robust low-variance default, and Gradient Boosting when you want top tabular accuracy and can afford tuning.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need an **interpretable** model whose decisions can be read off as explicit if/else rules (e.g. explaining a loan denial).',
      'The data has **mixed feature types** (numerical and categorical) and you want to skip feature scaling and most preprocessing.',
      'You want to capture **non-linear interactions** automatically without manually engineering them.',
    ],
    avoidWhen: [
      'You need the **highest possible accuracy** on tabular data — a single tree is usually beaten by Random Forest or Gradient Boosting.',
      'The true relationship is **smooth or linear** — axis-aligned splits approximate it as a clumsy staircase, so linear models do better.',
      'The dataset is **small or noisy** and a deep tree would memorize it — at minimum, constrain depth or prune.',
    ],
    rulesOfThumb: [
      'Always limit complexity: set a max depth or a minimum number of samples per leaf to fight overfitting.',
      'Do not bother scaling features — splits are threshold-based and scale-invariant.',
      'If accuracy matters more than interpretability, jump straight to an ensemble of trees.',
    ],
  },
  caseStudies: [
    {
      title: 'CART on the UCI German credit-risk benchmark',
      domain: 'Credit risk / finance',
      scenario: 'A lender wants to classify loan applicants as **good** or **bad** credit risks from 20 attributes (account status, loan duration, credit history, employment, etc.) on the 1,000-record UCI German Credit dataset. The model must be **auditable**: a regulator may ask why any individual applicant was declined.',
      approach: 'Train a CART classification tree using Gini impurity to choose splits, then control overfitting by limiting tree depth and pruning low-information branches (cost-complexity pruning, as described in Breiman et al.). The fitted tree is read as a small set of human-legible rules, e.g. "if checking-account status is negative and loan duration exceeds 24 months, flag as high risk."',
      outcome: 'A pruned single tree typically lands around **70-73% classification accuracy** on held-out data on this benchmark — modestly below a Random Forest (roughly **76-78%**) — but delivers **explicit decision rules** an analyst can audit and a regulator can review. The case illustrates the core practitioner trade-off: a single tree trades a few points of accuracy for transparency, and ensembles recover that accuracy at the cost of interpretability.',
      source: {
        title: 'Classification and Regression Trees',
        authors: 'Breiman, L., Friedman, J., Stone, C.J. and Olshen, R.A.',
        url: 'https://www.routledge.com',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'What does Gini impurity (or entropy) measure at a tree node?',
      options: [
        { text: 'How mixed the class labels are — it is $0$ for a pure node and maximal for an evenly balanced node.', correct: true },
        { text: 'The number of examples that reach the node.', correct: false },
        { text: 'The depth of the node within the tree.', correct: false },
        { text: 'The prediction error on the test set.', correct: false },
      ],
      explanation: 'Both Gini impurity and entropy quantify class **disorder** at a node from the label proportions $p_i$. They equal $0$ when one class dominates (pure) and are largest when classes are evenly mixed. They depend only on the label distribution, not on node count, depth, or test error.',
    },
    {
      question: 'Why does a fully grown, unpruned decision tree tend to overfit?',
      options: [
        { text: 'It keeps splitting until leaves are pure, carving tiny regions that fit noise as well as signal.', correct: true },
        { text: 'It applies too much regularization to the splits.', correct: false },
        { text: 'It scales features incorrectly before splitting.', correct: false },
        { text: 'It always uses entropy instead of Gini.', correct: false },
      ],
      explanation: 'Without depth or sample constraints, the tree splits until every leaf is pure, often isolating individual training points. Those fine, axis-aligned regions memorize label noise, giving near-perfect training accuracy but poor generalization. Trees use no regularization or scaling by default, and the impurity metric chosen is not the cause.',
    },
    {
      question: 'Decision trees choose splits "greedily." What does that mean?',
      options: [
        { text: 'At each node they pick the split with the highest immediate information gain, without checking whether it is globally optimal.', correct: true },
        { text: 'They search every possible whole-tree structure and keep the best one.', correct: false },
        { text: 'They always split on the feature with the most categories.', correct: false },
        { text: 'They prefer splits that maximize the number of leaves.', correct: false },
      ],
      explanation: 'Tree learning is greedy: at each node it selects the locally best split (largest information gain) and never backtracks. Finding the globally optimal tree is NP-hard, so the greedy heuristic is used instead — which is why the result may be suboptimal overall.',
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Explain why decision boundaries produced by a standard decision tree are typically described as "axis-aligned", and discuss the implications for modeling smooth or diagonal boundaries.',
      expectedAnswerRubric: 'The answer should state that each split in a decision tree thresholds a single feature at a time, resulting in cuts that are perpendicular to the feature axes. It should mention that this creates rectangular, axis-aligned regions, meaning that smooth or diagonal boundaries can only be approximated using a \\"staircase\\" pattern with many splits.'
    }
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
