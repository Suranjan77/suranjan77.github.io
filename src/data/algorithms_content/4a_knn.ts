import { LearningModule } from "./types";

export const knn: LearningModule = {
  id: "knn",
  title: "K-Nearest Neighbors",
  category: "K-Nearest Neighbors",
  prerequisites: ["probability-theory"],
  tracks: ["practitioner"],
  difficulty: 2,
  shortDescription: "A simple algorithm that makes predictions for a new data point by finding the closest, most similar historical examples.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain the non-parametric nature of the K-Nearest Neighbors algorithm',
    'Compute distances between data points using Euclidean and Manhattan distance metrics',
    'Compare the behavior of the model for small versus large values of $K$ (overfitting vs underfitting)',
    'Describe why feature scaling is critical for distance-based algorithms',
  ],
  keyTerms: [
    { term: 'Non-parametric', definition: 'A class of model that does not make strong assumptions about the form of the underlying mapping function.' },
    { term: 'Euclidean Distance', definition: 'The straight-line distance between two points in a Euclidean space.' },
    { term: 'Curse of Dimensionality', definition: 'The phenomenon where distance metrics become less informative as the number of feature dimensions increases.' },
  ],
  workedExamples: [
    {
      title: 'KNN Classification',
      problem: 'Query point $q = (2, 3)$. Neighbors: $A(1, 2)$ class 0, $B(3, 4)$ class 1, $C(2, 5)$ class 1. Classify $q$ using $K=3$.',
      solution: 'Distances: $d(q, A) = \\sqrt{1+1} = \\sqrt{2} \\approx 1.41$, $d(q, B) = \\sqrt{1+1} = \\sqrt{2} \\approx 1.41$, $d(q, C) = \\sqrt{0+4} = 2$. All three are the nearest neighbors. Their classes are 0, 1, 1. By majority vote, the predicted class for $q$ is 1.',
    },
  ],
  misconceptions: [
    {
      claim: 'KNN actually trains a model during the `.fit()` step.',
      correction: 'In standard KNN, `.fit()` is a lazy step that just stores the training data in memory. All computation (finding neighbors and voting) happens during the prediction phase.'
    },
    {
      claim: 'You should always set $K$ as large as possible to get a smooth boundary.',
      correction: 'If $K$ is too large (approaching the dataset size $N$), the model will just predict the majority class of the entire dataset, leading to underfitting. If $K=1$, the model will overfit to individual noise points.'
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
      name: 'Unscaled Features Dominating',
      description: 'If one feature has values in range [0, 1,000,000] and another has range [0, 1], the first feature dominates the distance calculation entirely.',
      mitigation: 'Standardize or normalize features (e.g. using MinMaxScaler or StandardScaler) before running KNN.'
    }
  ],
  fullDescription: `
K-Nearest Neighbors (KNN) is one of the simplest and most intuitive algorithms in machine learning. It is a non-parametric method, meaning it does not assume any underlying mathematical shape for the data. Instead of training a model to find mathematical equations, KNN literally just memorizes the entire training dataset.

When you ask it to make a prediction for a new, unseen data point, it looks at the entire dataset, finds the $k$ data points that are geometrically closest (most similar) to the new point, and takes a vote. For classification, it returns the most common label among its neighbors; for regression, it returns the average value of its neighbors.

### Where is it used?
KNN is used in basic recommendation systems (finding users with similar movie tastes), anomaly detection (flagging transactions that are geometrically far from a user's normal spending clusters), and as a quick baseline algorithm before trying more complex models.
  `,
  intuition: `
Imagine you move to a new city and want to know if a specific neighborhood is safe. You don't need a complex mathematical formula; you just ask the 5 people who live closest to that neighborhood. If 4 out of 5 say it's safe, you assume it's safe. That's exactly how KNN works.
  `,
  mathematics: `
### 1. K-Nearest Neighbors Distance
KNN relies entirely on measuring the distance between a query data point $x$ and an existing database point $x'$. The most common distance metric is Euclidean distance:

$$ d(x, x') = \\sqrt{\\sum_{i=1}^{p} (x_i - x_i')^2} $$

Other metrics like Manhattan distance ($L_1$ norm) or Cosine similarity (for text/embeddings) are also frequently used:

**Manhattan Distance**:
$$ d_1(x, x') = \\sum_{i=1}^{p} |x_i - x_i'| $$
  `,
  pros: [
    "Extremely simple to understand and implement.",
    "No training phase whatsoever; adding new data is instant.",
    "Can easily handle complex, non-linear decision boundaries."
  ],
  cons: [
    "Extremely slow at prediction time on large datasets, because it must compute the distance to every single point.",
    "Requires keeping the entire dataset in memory.",
    "Sensitive to the scale of features; features with larger ranges will dominate the distance calculation."
  ],
  codeSnippet: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier

# Two-dimensional feature coordinates
X = np.array([[0, 0], [1, 1.5], [1.5, 1], [8, 8], [8.5, 7.5], [9, 9]])
# Binary Labels
y = np.array([0, 0, 0, 1, 1, 1])

# Initialize and fit KNN
knn = KNeighborsClassifier(n_neighbors=2)
knn.fit(X, y)
print(f"KNN Class for coordinate [2, 2]: {knn.predict([[2, 2]])[0]}")`
};
