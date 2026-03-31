import { Algorithm } from "./types";

export const instanceBasedTrees: Algorithm = {
  id: "instance-based-trees",
  title: "Instance-based Learning & Decision Trees",
  category: "Instance-based Learning & Decision Trees",
  shortDescription: "Non-parametric analytical models that classify data by quantifying geometric distance (K-Nearest Neighbours) or structuring precise logical decision rule sequences (Decision Trees).",

  fullDescription: `
Instance-based learning models, such as K-Nearest Neighbours (KNN), and structural models like Decision Trees deviate fundamentally from parametric algorithms (e.g., linear regression). They are inherently non-parametric, meaning their mathematical complexity scales proportionately with the volume of the training dataset, rather than being constrained by a predefined functional form. 

KNN essentially memorises the entire parameterised dataset and classifies novel observation points strictly based upon their geometric proximity to existing proximate neighbours. Conversely, Decision Trees analytically partition the multi-dimensional feature space in a sequential manner, iteratively isolating pure regions of data until a logically homogeneous leaf node is definitively established.

### Empirical Applications
KNN exhibits significant utility in the development of foundational recommendation systems algorithms (e.g., collaborative filtering formulations), spatial pattern recognition within irregular topologies, and rapid exploratory analytical data imputation. Decision Trees are extensively deployed across institutional risk assessments, expert systems intended to rigorously mimic medical diagnostic flowcharts, and customer churn forecasting—contexts wherein direct, transparent human logical interpretability is frequently mandated by regulatory or operational constraints.
  `,

  intuition: `
**KNN**: Rather than constructing an overarching generalised rule, the algorithm defers decision-making until presented with a query. Upon receiving a query, it computes the distance to the 'k' closest empirical observations within the feature space and assigns classification based upon the modal response of those local neighbours.

**Decision Tree**: The algorithm constructs a sequential series of binary, analytically derived inquiries regarding the input features. By the conclusion of the sequential evaluation path, the algorithm mathematically narrows the observation down to a discrete, mutually exclusive categorical classification.
  `,

  mathematics: `
### 1. Analytical K-Nearest Neighbours Distance
KNN structurally relies upon rigorous metric mathematical distance functions computed analytically between a query vector $x$ and an existing dataset vector $x'$. The standard Euclidean distance metric operates as follows:

$$ d(x, x') = \\sqrt{\\sum_{i=1}^{p} (x_i - x_i')^2} $$

### 2. Decision Tree Splitting Criteria (Gini Impurity and Entropy)
To sequentially partition the dataset, Decision Trees iteratively select the feature and corresponding threshold that mathematically maximises the homogeneity (purity) of the resultant child nodes. Two primary objective functions evaluate this purity:

**Gini Impurity**: Quantifies the probability of misclassifying a randomly chosen empirical element if it were randomly labelled according to the structural distribution of labels within the node:

$$ Gini = 1 - \\sum_{i=1}^{c} p_i^2 $$

**Information Entropy**: Deriving from thermodynamic analogues, entropy mathematically quantifies the fundamental disorder within the node:

$$ Entropy = - \\sum_{i=1}^{c} p_i \\log_2(p_i) $$

Upon calculating these metrics, the algorithm computes the Information Gain (the subsequent mathematical reduction in entropy or Gini impurity) associated with every potential permutation of splits, irrevocably selecting the partition yielding the maximal gain at each iterative step.
  `,

  pros: [
    "Decision Trees are exceptionally interpretable, permitting rigorous visual and logical auditing by domain experts and non-technical stakeholders.",
    "KNN requires zero explicit training phase; it adapts instantaneously to the inclusion of novel empirical data without necessitating costly model retraining.",
    "Both methodologies are broadly agnostic to explicit functional linearity, proficiently capturing profound, non-linear architectural relationships within complex feature spaces without demanding manual mathematical transformations."
  ],

  cons: [
    "KNN becomes excruciatingly computationally expensive during the inference phase as dataset dimensionality scales, necessitating the calculation of distances against the explicit entirety of historical observations.",
    "Single Decision Trees manifest a severe vulnerability to structural overfitting, frequently memorising statistical noise and idiosyncrasies deeply embedded within the training sample unless aggressively bounded via pruning techniques.",
    "Both paradigms exhibit heightened sensitivity to the inherent 'Curse of Dimensionality'; KNN distance metrics statistically degrade in high-dimensional space, whilst unconstrained Trees geometrically fracture into irrelevant complexity."
  ],

  codeSnippet: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

# Two-dimensional topological Feature grid
X = np.array([[0, 0], [1, 1.5], [1.5, 1], [8, 8], [8.5, 7.5], [9, 9]])
# Binary Categorical Labels
y = np.array([0, 0, 0, 1, 1, 1])

# Initialise and execute K-Nearest Neighbours
knn = KNeighborsClassifier(n_neighbors=2)
knn.fit(X, y)
print(f"KNN Assigned Classification for spatial coordinate [2, 2]: {knn.predict([[2, 2]])[0]}")

# Initialise and execute Decision Tree
dt = DecisionTreeClassifier(max_depth=2, random_state=42)
dt.fit(X, y)
print(f"Decision Tree Assigned Classification for spatial coordinate [7, 7]: {dt.predict([[7, 7]])[0]}")`
};
