import { LearningModule } from "./types";

export const svm: LearningModule = {
  id: "support-vector-machines",
  title: "Support Vector Machines",
  category: "Support Vector Machines",
  prerequisites: ["logistic-regression"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["linear-regression", "logistic-regression"],
  shortDescription: "A margin-based classifier that chooses the separating boundary with the largest distance to the nearest training points.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain the concept of margins and why SVM maximizes the margin',
    'Distinguish between hard-margin and soft-margin SVM formulations',
    'Explain the role of support vectors in defining the decision boundary',
    'Describe the Kernel Trick and compute the Radial Basis Function (RBF) kernel',
  ],
  keyTerms: [
    { term: 'Support Vector', definition: 'The data points closest to the decision boundary that influence its position and orientation.' },
    { term: 'Margin', definition: 'The distance between the decision boundary and the closest training data points.' },
    { term: 'Kernel Trick', definition: 'A method that projects data into a higher-dimensional space to make it linearly separable, without explicitly calculating the new coordinates.' },
  ],
  workedExamples: [
    {
      title: 'RBF Kernel Similarity',
      problem: 'Calculate the RBF kernel value $K(x_1, x_2)$ for $x_1 = (1, 2)$, $x_2 = (2, 2)$ with $\\gamma = 0.5$.',
      solution: 'Squared Euclidean distance is $\\|x_1 - x_2\\|^2 = (1-2)^2 + (2-2)^2 = 1 + 0 = 1$. RBF kernel value $K(x_1, x_2) = \\exp(-\\gamma \\|x_1 - x_2\\|^2) = \\exp(-0.5 \\times 1) = e^{-0.5} \\approx 0.607$.',
    },
  ],
  misconceptions: [
    {
      claim: 'SVMs only work for binary classification.',
      correction: 'SVMs can be extended to multi-class classification using One-vs-One (OvO) or One-vs-Rest (OvR) strategies.'
    },
    {
      claim: 'Adding more features will always make SVM slower to evaluate.',
      correction: 'Thanks to the Kernel Trick, the evaluation time depends on the number of support vectors rather than the dimensionality of the high-dimensional space.'
    }
  ],
  references: [
    {
      title: "A Training Algorithm for Optimal Margin Classifiers",
      authors: "Boser, B.E., Guyon, I.M. and Vapnik, V.N",
      url: "https://dl.acm.org",
      type: "textbook"
    },
    {
      title: "Understanding Machine Learning: From Theory to Algorithms",
      authors: "Shalev-Shwartz, S. and Ben-David, S",
      url: "https://www.cambridge.org",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Sensitivity to Hyperparameters (C and Gamma)',
      description: 'If $C$ is too large, the margin becomes narrow and overfits. If $\\gamma$ is too large, the kernel acts like individual indicators and fails to generalize.',
      mitigation: 'Use grid search with cross-validation to tune $C$ and $\\gamma$.'
    }
  ],

  fullDescription: `
Support Vector Machines (SVMs) are margin-based classifiers. If many separating lines classify the training data correctly, an SVM chooses the one with the largest margin: the greatest distance to the closest training examples.

Those closest examples are the support vectors. They matter because moving them changes the boundary, while points far from the margin often have no effect on the fitted classifier.

### Where is it used?
SVMs are useful when the dataset is medium-sized and the feature representation is strong. They are historically common in text classification, handwritten digit recognition, and biological classification tasks.
  `,

  intuition: `
The intuition is geometric. A boundary that barely separates the training data is fragile: a small measurement error can flip the prediction. A wider margin is more stable because new points can move slightly without crossing the boundary.

When a straight boundary is not enough, kernels let the SVM compute dot products in a richer feature space without explicitly constructing every transformed feature. In the original input space, that can produce curved decision boundaries.
  `,

  mathematics: `
### 1. The Margin
For separable data, the hard-margin SVM solves:

$$ y_i (w^T x_i + b) \\ge 1 \\quad \\forall i $$

### 2. The Kernel Trick
Real data is rarely perfectly separable, so practical SVMs use slack variables and a penalty parameter $C$ to trade off margin width against classification mistakes. Kernels replace inner products $x_i^T x_j$ with a function $K(x_i, x_j)$:

The most popular kernel is the Radial Basis Function (RBF), which measures the distance between two points $x_i$ and $x_j$ and creates smooth, curved boundaries:

$$ K(x_i, x_j) = \\exp(-\\gamma \\|x_i - x_j\\|^2) $$
  `,

  pros: [
    "The convex training objective has a global optimum, which makes the optimization behavior easier to reason about than many neural models.",
    "Kernels allow nonlinear decision boundaries while keeping the optimization problem in terms of pairwise similarities.",
    "It is highly effective even when you have more features (columns) than actual data points (rows)."
  ],

  cons: [
    "Kernel SVMs can be slow and memory-heavy on very large datasets because they depend on many pairwise similarities.",
    "They do not naturally produce calibrated probabilities without an additional calibration step.",
    "Performance is sensitive to kernel choice, feature scaling, and hyperparameters such as C and gamma."
  ],

  codeSnippet: `import numpy as np
from sklearn.svm import SVC

X = np.array([[1, 2], [2, 3], [1.5, 1.8], [8, 8], [9, 10], [8.5, 9.2]])
y = np.array([0, 0, 0, 1, 1, 1])

clf = SVC(kernel='rbf', C=1.0)
clf.fit(X, y)

print(f"Number of Computed Support Vectors: {clf.n_support_}")`,
  tldr: [
    'An SVM is a **margin-based** classifier: among all boundaries that separate the classes, it picks the one whose distance to the nearest points is largest.',
    'The decision boundary is determined only by the **support vectors** — the points on or inside the margin. Moving other points does not change the fit.',
    'Maximizing the margin is equivalent to minimizing $\\frac{1}{2}\\lVert w \\rVert^2$ subject to $y_i(w^T x_i + b) \\ge 1$ — a **convex** quadratic program with a global optimum.',
    'The **kernel trick** replaces dot products $x_i^T x_j$ with a kernel $K(x_i, x_j)$, producing nonlinear boundaries without ever forming the high-dimensional features.',
    'The penalty $C$ controls the **soft margin**: large $C$ punishes misclassifications hard (narrow margin, risk of overfit); small $C$ tolerates errors for a wider, smoother margin.',
  ],
  additionalSections: [
    {
      heading: 'Why Maximizing the Margin Means Minimizing the Norm',
      content: `
Suppose a linear boundary $w^T x + b = 0$ separates the two classes. We are free to rescale $w$ and $b$, so fix the scale by requiring the closest points on each side to satisfy $w^T x + b = +1$ and $w^T x + b = -1$. These two parallel hyperplanes are the edges of the margin.

The signed distance from any point $x$ to the boundary is $\\frac{w^T x + b}{\\lVert w \\rVert}$. A positive support vector sits on $w^T x + b = +1$ and a negative one on $w^T x + b = -1$, so the total width between the two margin edges is:

$$ \\text{margin} = \\frac{1}{\\lVert w \\rVert} - \\frac{-1}{\\lVert w \\rVert} = \\frac{2}{\\lVert w \\rVert} $$

Maximizing $\\frac{2}{\\lVert w \\rVert}$ is the same as minimizing $\\lVert w \\rVert$, and minimizing $\\lVert w \\rVert$ is the same as minimizing $\\frac{1}{2}\\lVert w \\rVert^2$ (the squared form is differentiable and convex). With the constraint that every point lies on the correct side of its margin edge, the **hard-margin** problem is:

$$ \\min_{w, b} \\; \\frac{1}{2}\\lVert w \\rVert^2 \\quad \\text{subject to} \\quad y_i(w^T x_i + b) \\ge 1 \\;\\; \\forall i $$

This is a convex quadratic program, so any solution found is the global optimum.
      `,
    },
    {
      heading: 'Soft Margins and the Kernel Trick',
      content: `
Real data is rarely perfectly separable, so we relax each constraint with a **slack variable** $\\xi_i \\ge 0$ that measures how far point $i$ is on the wrong side of its margin edge. The penalty parameter $C$ weights the total slack against margin width:

$$ \\min_{w, b, \\xi} \\; \\frac{1}{2}\\lVert w \\rVert^2 + C \\sum_{i=1}^{n} \\xi_i \\quad \\text{subject to} \\quad y_i(w^T x_i + b) \\ge 1 - \\xi_i, \\;\\; \\xi_i \\ge 0 $$

A large $C$ makes each violation expensive, pushing toward a narrow, hard margin that can overfit; a small $C$ tolerates more violations in exchange for a wider, smoother margin.

Solving the dual of this problem reveals that both training and prediction depend on the data only through inner products $x_i^T x_j$. The **kernel trick** swaps each inner product for a kernel function $K(x_i, x_j) = \\phi(x_i)^T \\phi(x_j)$ that equals a dot product in some higher-dimensional feature space $\\phi(\\cdot)$ — without ever computing $\\phi$ explicitly. The decision function becomes:

$$ f(x) = \\operatorname{sign}\\!\\left( \\sum_{i} \\alpha_i y_i K(x_i, x) + b \\right) $$

Only support vectors have nonzero $\\alpha_i$, so the sum runs over them alone. The popular RBF kernel $K(x_i, x_j) = \\exp(-\\gamma \\lVert x_i - x_j \\rVert^2)$ corresponds to an infinite-dimensional feature space, yet costs only a single distance evaluation per pair.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A linear SVM has weight vector $w = (3, 4)$. What is the geometric width of the margin $\\frac{2}{\\lVert w \\rVert}$?',
      difficulty: 'warm-up',
      hints: ['Compute $\\lVert w \\rVert = \\sqrt{w_1^2 + w_2^2}$ first.'],
      solution: 'The norm is $\\lVert w \\rVert = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$. The margin width is $\\frac{2}{\\lVert w \\rVert} = \\frac{2}{5} = 0.4$.',
    },
    {
      prompt: 'A trained linear SVM has $w = (1, -1)$ and $b = -1$. Classify the point $x = (4, 1)$ using $f(x) = \\operatorname{sign}(w^T x + b)$, and state whether it lies inside the margin.',
      difficulty: 'core',
      hints: ['Compute $w^T x + b$.', 'The margin edges are at $\\pm 1$.'],
      solution: 'Score $w^T x + b = (1)(4) + (-1)(1) + (-1) = 4 - 1 - 1 = 2$. Since $2 > 0$, the predicted label is $+1$. Because $|2| \\ge 1$, the point is outside the margin (on the positive side, beyond the margin edge), so it is not a support vector for this fit.',
    },
    {
      prompt: 'Given support vectors at $x_+ = (3, 3)$ with label $+1$ and $x_- = (1, 1)$ with label $-1$, and weight vector $w = (1, 1)$, find the bias $b$ such that both points sit exactly on their margin edges.',
      difficulty: 'core',
      hints: ['On the margin edges, $w^T x_+ + b = +1$ and $w^T x_- + b = -1$.'],
      solution: 'From the positive support vector: $w^T x_+ + b = (1)(3) + (1)(3) + b = 6 + b = 1 \\Rightarrow b = -5$. Check the negative one: $w^T x_- + b = (1)(1) + (1)(1) + b = 2 + b = 2 - 5 = -3$. That gives $-3 \\ne -1$, so $w = (1,1)$ does not place both points on their edges; the consistent boundary requires rescaling $w$. With $w = (\\tfrac{1}{2}, \\tfrac{1}{2})$: positive gives $3 + b = 1 \\Rightarrow b = -2$, negative gives $1 + b = 1 - 2 = -1$, which matches. So $w = (\\tfrac{1}{2}, \\tfrac{1}{2}), b = -2$.',
    },
    {
      prompt: 'You train an RBF-kernel SVM and find it nearly memorizes the training set but generalizes poorly. How should you adjust your hyperparameters to fix this issue, and what is the geometric effect of these adjustments?',
      difficulty: 'challenge',
      solution: 'Memorizing the training set with poor generalization is classic overfitting. Both $C$ and $\\gamma$ are too large. Decrease $C$ so the soft-margin penalty tolerates more slack, widening and smoothing the margin instead of bending it to fit every point. Decrease $\\gamma$ so the RBF kernel $\\exp(-\\gamma \\lVert x_i - x_j \\rVert^2)$ has a larger effective radius — large $\\gamma$ makes each support vector influence only its immediate neighborhood, turning the boundary into isolated bumps around training points. Tune both together with cross-validated grid search.',
    },
  ],
  comparisons: [
    {
      title: 'SVM vs Logistic Regression vs K-Nearest Neighbors',
      methods: ['SVM', 'Logistic Regression', 'K-Nearest Neighbors'],
      rows: [
        {
          dimension: 'Decision boundary',
          values: ['Maximum-margin hyperplane (curved via kernels)', 'Single linear hyperplane', 'Implicit, locally defined by neighbors'],
        },
        {
          dimension: 'Margin / regularization',
          values: ['Explicit margin maximization; $C$ controls slack', 'Penalized log-loss; L1/L2 regularization', 'No margin; smoothing controlled by $k$'],
        },
        {
          dimension: 'Kernels / nonlinearity',
          values: ['Native via the kernel trick (RBF, polynomial)', 'Needs manual feature engineering', 'Naturally nonlinear from local geometry'],
        },
        {
          dimension: 'Scalability to large $N$',
          values: ['Poor — kernel cost grows with pairwise similarities', 'Excellent — trains fast, scales well', 'Slow at predict time; stores all data'],
        },
        {
          dimension: 'Probability outputs',
          values: ['Not native; needs Platt scaling/calibration', 'Native, well-calibrated probabilities', 'Estimated from neighbor vote fractions'],
        },
      ],
      takeaway: 'Reach for SVM on medium-sized, high-dimensional data with a clear margin; logistic regression when you need fast training and calibrated probabilities; KNN when the boundary is irregular and the dataset is small.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You have **medium-sized** data with a fairly **clear margin** between classes — SVMs shine where the separation is geometric.',
      'The problem is **high-dimensional**, such as text classification, where features often outnumber samples and a kernel SVM stays effective.',
      'You need a **nonlinear** boundary but want a convex objective with a global optimum — use an RBF or polynomial kernel.',
    ],
    avoidWhen: [
      'The dataset is **very large** ($N$ in the hundreds of thousands or more) — kernel training scales poorly; prefer logistic regression or linear models.',
      'You need **well-calibrated probabilities** out of the box — SVMs only give scores and require extra calibration.',
      'Features are on **wildly different scales** and you cannot standardize them — distance-based kernels become dominated by large-magnitude features.',
    ],
    rulesOfThumb: [
      'Always **scale or standardize** features before training; SVMs are not scale-invariant.',
      'Start with a **linear** kernel for high-dimensional sparse data (e.g. text); try **RBF** when you need nonlinearity.',
      'Tune $C$ and $\\gamma$ jointly with cross-validated grid search; they interact strongly.',
    ],
  },
  caseStudies: [
    {
      title: 'Handwritten digit recognition on USPS / MNIST',
      domain: 'Computer vision',
      scenario: 'Recognizing handwritten digits (0-9) from scanned images was a benchmark problem where each image is a high-dimensional pixel vector and classes overlap in subtle, nonlinear ways. SVMs with nonlinear kernels became a leading approach in the 1990s, competitive with the best neural networks of the era.',
      approach: 'Train a kernel SVM (polynomial or RBF) on the pixel vectors using a one-vs-rest or one-vs-one scheme for the ten digit classes, letting the kernel induce a nonlinear boundary without explicit feature construction.',
      outcome: 'On the USPS digit benchmark in Cortes & Vapnik (1995), the soft-margin support-vector network achieved a test error of about **4.0%** (roughly **96% accuracy**), matching or beating contemporary neural-network classifiers and establishing SVMs as state-of-the-art for the task.',
      source: {
        title: 'Support-Vector Networks',
        authors: 'Cortes, C. and Vapnik, V.',
        url: 'https://link.springer.com/article/10.1007/BF00994018',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Explain why maximizing the SVM margin is mathematically equivalent to minimizing $\\frac{1}{2}\\lVert w \\rVert^2$ subject to $y_i(w^T x_i + b) \\ge 1$.',
      expectedAnswerRubric: 'A complete answer should note that the geometric margin width between the hyperplanes $w^T x + b = 1$ and $w^T x + b = -1$ is $\\frac{2}{\\lVert w \\rVert}$. Therefore, maximizing the margin means minimizing $\\lVert w \\rVert$. Minimizing $\\frac{1}{2}\\lVert w \\rVert^2$ is an equivalent convex optimization problem that is easier to solve. The constraint $y_i(w^T x_i + b) \\ge 1$ ensures that all points are correctly classified and lie outside the margin.'
    }
  ],
  quiz: [
    {
      question: 'What are the support vectors in a trained SVM?',
      options: [
        { text: 'The training points lying on or inside the margin that determine the boundary.', correct: true },
        { text: 'The eigenvectors of the feature covariance matrix.', correct: false },
        { text: 'All training points, each weighted equally.', correct: false },
        { text: 'The points farthest from the decision boundary.', correct: false },
      ],
      explanation: 'Support vectors are exactly the points on or inside the margin (those with nonzero dual coefficients $\\alpha_i$). They alone define the boundary — removing a point that is far outside the margin leaves the fitted classifier unchanged.',
    },
    {
      question: 'What does the kernel trick accomplish?',
      options: [
        { text: 'It replaces dot products with $K(x_i, x_j)$ to get nonlinear boundaries without forming the high-dimensional features.', correct: true },
        { text: 'It removes outliers before training.', correct: false },
        { text: 'It guarantees the data becomes linearly separable in the original space.', correct: false },
        { text: 'It converts the SVM into a probabilistic model.', correct: false },
      ],
      explanation: 'A kernel $K(x_i, x_j) = \\phi(x_i)^T \\phi(x_j)$ computes an inner product in a higher-dimensional space implicitly. The SVM only ever needs inner products, so swapping them for a kernel yields nonlinear boundaries while never building the map $\\phi$ explicitly.',
    },
    {
      question: 'In soft-margin SVM, what is the role of the penalty parameter $C$?',
      options: [
        { text: 'It trades off margin width against the total slack (misclassification) allowed.', correct: true },
        { text: 'It sets the number of support vectors directly.', correct: false },
        { text: 'It is the learning rate for gradient descent.', correct: false },
        { text: 'It selects which kernel function to use.', correct: false },
      ],
      explanation: 'The soft-margin objective $\\frac{1}{2}\\lVert w \\rVert^2 + C \\sum_i \\xi_i$ uses $C$ to weight slack against margin width. Large $C$ penalizes violations heavily (narrow margin, overfit risk); small $C$ tolerates more slack for a wider, smoother margin.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
