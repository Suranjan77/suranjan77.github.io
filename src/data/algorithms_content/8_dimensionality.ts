import { LearningModule } from "./types";

export const dimensionalityReduction: LearningModule = {
  id: "dimensionality-reduction",
  title: "Dimensionality Reduction",
  category: "Dimensionality Reduction",
  prerequisites: ["clustering"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["clustering"],
  shortDescription: "Techniques to shrink massive datasets down to their most important core features, making them easier to visualize and faster to process.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain the mathematical purpose of covariance matrices in Principal Component Analysis',
    'Formulate the eigenvalue problem and relate eigenvalues to explained variance',
    'Distinguish between PCA (linear projection) and non-linear methods (like t-SNE or UMAP)',
    'Interpret the explained variance ratio of principal components',
  ],
  keyTerms: [
    { term: 'Covariance Matrix', definition: 'A matrix whose elements represent the covariances between pairs of features.' },
    { term: 'Principal Component', definition: 'A linear combination of the original variables that captures the maximum variance in the dataset.' },
    { term: 'Explained Variance Ratio', definition: 'The fraction of the total variance in the dataset that is captured by each principal component.' },
  ],
  workedExamples: [
    {
      title: 'Explained Variance calculation',
      problem: 'PCA returns three eigenvalues: $\\lambda_1 = 6.0$, $\\lambda_2 = 3.0$, $\\lambda_3 = 1.0$. Calculate the explained variance ratio of the first component.',
      solution: 'Total variance is the sum of eigenvalues: $\\sum \\lambda_i = 6.0 + 3.0 + 1.0 = 10.0$. Explained variance ratio for component 1 is $\\frac{\\lambda_1}{\\text{Total}} = \\frac{6.0}{10.0} = 0.6$ (or 60%).',
    },
  ],
  misconceptions: [
    {
      claim: 'PCA is a feature selection technique.',
      correction: 'Feature selection chooses a subset of the original features. PCA is feature extraction; it creates entirely new features that are linear combinations of the original ones.'
    },
    {
      claim: 'PCA does not require centering the data.',
      correction: 'Without centering the columns to have zero mean, the first principal component would point in the direction of the mean vector instead of the direction of maximum variance.'
    }
  ],
  references: [
    {
      title: "Principal Component Analysis",
      authors: "Jolliffe, I.T",
      url: "https://www.springer.com",
      type: "textbook"
    },
    {
      title: "UMAP: Uniform Manifold Approximation and Projection",
      authors: "McInnes, L., Healy, J. and Melville, J",
      url: "https://arxiv.org",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Non-Linear Manifolds',
      description: 'PCA cannot capture non-linear relationships, like a Swiss roll dataset, and will compress it poorly.',
      mitigation: 'Use Kernel PCA, Isomap, t-SNE, or Autoencoders.'
    }
  ],

  fullDescription: `
Imagine you have a spreadsheet with 1,000 columns describing a house (square footage, number of windows, color of the front door, distance to the nearest coffee shop, etc.). "Dimensionality Reduction" algorithms figure out how to compress those 1,000 columns down to, say, 10 columns, without losing the core "meaning" of the data.

The most famous technique is Principal Component Analysis (PCA). PCA looks at all your data and mathematically figures out which combinations of features actually matter. For example, it might figure out that "number of bedrooms," "number of bathrooms," and "square footage" all basically measure the same thing: "House Size." It combines them into one new super-feature, throwing away the redundant noise.

### Where is it used?
It is heavily used for data visualization. Humans can't visualize a 1,000-dimensional graph, but PCA can compress that data down to 2 or 3 dimensions so we can actually look at it on a screen. It's also used to compress images, speed up facial recognition systems, and clean up messy data before feeding it into other machine learning models.
  `,

  intuition: `
Imagine you are trying to take a photograph of a complex 3D object, like a bicycle. If you take the photo from the front, it just looks like a thin line (a tire and some handlebars). You've lost almost all the information about what the object is. 

But if you walk around to the side and take a photo, you capture the wheels, the frame, the pedals, and the seat. You have successfully compressed a 3D object into a 2D photograph while keeping the maximum amount of useful visual information. 

PCA does exactly this, but with math. It mathematically rotates your data until it finds the absolute best "camera angle" that captures the widest, most informative view of your dataset.
  `,

  mathematics: `
### 1. The Covariance Matrix
To figure out how features relate to each other, PCA first calculates a Covariance Matrix ($\\Sigma$). If you have a dataset $X$ (where the average of every column is zero), the covariance matrix is calculated as:

$$ \\Sigma = \\frac{1}{n-1} X^T X $$

This matrix tells the algorithm which features move together (like height and weight) and which are completely unrelated.

### 2. Eigenvectors and Eigenvalues
PCA then performs a mathematical operation called "Eigendecomposition" on that covariance matrix:

$$ \\Sigma v_i = \\lambda_i v_i $$

It finds special directions called **Eigenvectors** ($v_i$). These are the new "camera angles." It also finds **Eigenvalues** ($\\lambda_i$), which tell you exactly how much information (variance) is captured by that specific camera angle. You simply keep the top few eigenvectors with the biggest eigenvalues, and throw the rest away!
  `,

  pros: [
    "It is a brilliant, mathematically proven way to remove redundant, highly correlated columns from your data.",
    "It drastically speeds up other machine learning algorithms by giving them less, but higher-quality, data to process.",
    "It allows you to visualize incredibly complex datasets on a standard 2D screen."
  ],

  cons: [
    "PCA assumes that the relationships in your data are straight lines (linear). If your data is curved or twisted, standard PCA will fail.",
    "The new 'super-features' it creates are mathematically abstract. You might compress 10 columns into 'Component 1', but it becomes very hard to explain to a human what 'Component 1' actually represents in the real world."
  ],

  codeSnippet: `import numpy as np
from sklearn.decomposition import PCA

# Create a fake dataset: 100 rows, 5 columns
X = np.random.randn(100, 5)

# Tell PCA to keep enough components to explain 95% of the data's variance
pca = PCA(n_components=0.95)
X_reduced = pca.fit_transform(X)

print(f"Original shape: {X.shape}")
print(f"Reduced shape: {X_reduced.shape}")
print(f"How much information each new column holds: {pca.explained_variance_ratio_}")`,
  tldr: [
    'PCA finds new axes (**principal components**) that are orthogonal directions of **maximum variance** in the data.',
    'Those directions are the **eigenvectors** of the covariance matrix $\\Sigma$; each eigenvalue $\\lambda_i$ equals the variance captured along its component.',
    'The **explained variance ratio** of component $i$ is $\\lambda_i / \\sum_j \\lambda_j$; keep the top $k$ components until the cumulative ratio crosses your threshold (e.g. 95%).',
    'Always **center** the data (and usually **standardize** it) first, otherwise components chase the mean or the largest-unit feature instead of the true structure.',
    'PCA is **linear** and great for compression and decorrelation; for nonlinear visualization reach for **t-SNE** or **UMAP**.',
  ],
  additionalSections: [
    {
      heading: 'Why Maximum-Variance Directions Are Eigenvectors of the Covariance Matrix',
      content: `
Center the data so every column has zero mean, and let $\\mathbf{\\Sigma} = \\frac{1}{n-1} X^T X$ be the covariance matrix. We want a unit direction $\\mathbf{w}$ ($\\lVert \\mathbf{w} \\rVert = 1$) that, when the data is projected onto it, has the largest possible variance. The variance of the projection $X\\mathbf{w}$ is:

$$ \\operatorname{Var}(X\\mathbf{w}) = \\frac{1}{n-1} (X\\mathbf{w})^T (X\\mathbf{w}) = \\mathbf{w}^T \\mathbf{\\Sigma} \\, \\mathbf{w} $$

We maximize this subject to $\\mathbf{w}^T \\mathbf{w} = 1$. Form the Lagrangian:

$$ \\mathcal{L}(\\mathbf{w}, \\lambda) = \\mathbf{w}^T \\mathbf{\\Sigma} \\, \\mathbf{w} - \\lambda (\\mathbf{w}^T \\mathbf{w} - 1) $$

Setting $\\nabla_{\\mathbf{w}} \\mathcal{L} = 0$ gives the **eigenvalue equation**:

$$ \\mathbf{\\Sigma} \\, \\mathbf{w} = \\lambda \\mathbf{w} $$

So every stationary direction is an eigenvector of $\\mathbf{\\Sigma}$. Left-multiplying by $\\mathbf{w}^T$ and using $\\mathbf{w}^T \\mathbf{w} = 1$ shows the variance captured along that direction is exactly its eigenvalue:

$$ \\mathbf{w}^T \\mathbf{\\Sigma} \\, \\mathbf{w} = \\lambda $$

Therefore the **largest** eigenvalue's eigenvector is the first principal component, the second-largest gives the second component (orthogonal to the first because $\\mathbf{\\Sigma}$ is symmetric), and so on. The eigenvectors form an orthonormal basis, and the data expressed in that basis has **uncorrelated** coordinates.
      `,
    },
    {
      heading: 'Explained Variance Ratio and Choosing $k$',
      content: `
Because the eigenvectors are orthonormal, total variance is preserved and equals the sum of eigenvalues (the trace of $\\mathbf{\\Sigma}$):

$$ \\text{Total variance} = \\sum_{i=1}^{d} \\lambda_i = \\operatorname{tr}(\\mathbf{\\Sigma}) $$

The **explained variance ratio** of component $i$ is the fraction of that total it accounts for:

$$ \\text{EVR}_i = \\frac{\\lambda_i}{\\sum_{j=1}^{d} \\lambda_j} $$

To compress to $k$ dimensions while retaining a target fraction $\\tau$ (e.g. $\\tau = 0.95$) of the variance, sort eigenvalues in descending order and pick the smallest $k$ such that the **cumulative** ratio crosses $\\tau$:

$$ \\frac{\\sum_{i=1}^{k} \\lambda_i}{\\sum_{j=1}^{d} \\lambda_j} \\;\\ge\\; \\tau $$

Plotting the cumulative ratio against $k$ (the "scree" / cumulative-variance curve) makes the trade-off between compression and information retention visible at a glance.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'PCA on a 4-feature dataset returns eigenvalues $\\lambda = [8, 4, 2, 1]$. What is the explained variance ratio of the **first** component, and what is the cumulative ratio of the first **two**?',
      difficulty: 'warm-up',
      solution: 'Total variance $= 8 + 4 + 2 + 1 = 15$. First component EVR $= 8/15 \\approx 0.533$ (53.3%). First two cumulative $= (8 + 4)/15 = 12/15 = 0.80$ (80%).',
    },
    {
      prompt: 'Using the same eigenvalues $\\lambda = [8, 4, 2, 1]$, how many components must you keep to retain at least **95%** of the variance?',
      difficulty: 'core',
      hints: ['Accumulate the sorted eigenvalues.', 'Find the smallest $k$ whose cumulative ratio reaches 0.95.'],
      solution: 'Total $= 15$. Cumulative ratios: $k=1: 8/15 = 0.533$; $k=2: 12/15 = 0.800$; $k=3: 14/15 \\approx 0.933$; $k=4: 15/15 = 1.000$. Three components ($0.933$) still fall short of $0.95$, so you must keep all **4** components to reach the 95% threshold. (This dataset has no near-zero eigenvalue, so it does not compress well at 95%.)',
    },
    {
      prompt: 'Two features measure the same physical quantity but in different units: feature A is a length in **millimetres** (values in the thousands) and feature B is the same length in **metres** (values near 1). You run PCA **without** standardizing. What happens, and how do you fix it?',
      difficulty: 'core',
      hints: ['Variance scales with the square of the units.', 'Compare the variance of A versus B.'],
      solution: 'Variance scales with the square of the measurement scale, so feature A (millimetres) has roughly $1000^2 = 10^6$ times the variance of feature B (metres) even though they carry identical information. PCA maximizes variance, so the first component will align almost entirely with A and essentially ignore B and every other modestly-scaled feature. The fix is to **standardize** each feature to zero mean and unit variance (z-score) before PCA, i.e. run PCA on the correlation matrix rather than the raw covariance matrix, so each feature contributes on equal footing.',
    },
    {
      prompt: 'Prove that the projected data produced by PCA has mutually uncorrelated features.',
      difficulty: 'challenge',
      hints: ['Stack the top eigenvectors as columns of $W$.', 'Compute the covariance of $XW$ using $\\mathbf{\\Sigma} = W \\Lambda W^T$.'],
      solution: 'Let $W = [\\mathbf{w}_1, \\dots, \\mathbf{w}_k]$ hold orthonormal eigenvectors of $\\mathbf{\\Sigma}$, so $W^T W = I$ and $\\mathbf{\\Sigma} W = W \\Lambda$ with $\\Lambda = \\operatorname{diag}(\\lambda_1, \\dots, \\lambda_k)$. The projected data is $Z = X W$. Its covariance is $\\operatorname{Cov}(Z) = W^T \\mathbf{\\Sigma} W = W^T (W \\Lambda) = (W^T W)\\Lambda = \\Lambda$, which is **diagonal**. Off-diagonal entries are zero, so distinct principal components are uncorrelated, and the variance of component $i$ is exactly $\\lambda_i$.',
    },
  ],
  comparisons: [
    {
      title: 'PCA vs t-SNE vs UMAP',
      methods: ['PCA', 't-SNE', 'UMAP'],
      rows: [
        {
          dimension: 'Linear or nonlinear',
          values: ['Linear projection', 'Nonlinear manifold', 'Nonlinear manifold'],
        },
        {
          dimension: 'Structure preserved',
          values: ['Global variance / distances', 'Mostly local neighborhoods', 'Local with some global structure'],
        },
        {
          dimension: 'Deterministic?',
          values: ['Yes (up to sign)', 'No — random init, stochastic', 'No — random init, stochastic'],
        },
        {
          dimension: 'Main use',
          values: ['Compression & decorrelation', '2D/3D visualization', '2D/3D visualization'],
        },
        {
          dimension: 'New points / inverse transform',
          values: ['Easy — apply the linear map; invertible', 'No native transform for new points', 'Supports transforming new points'],
        },
      ],
      takeaway: 'Use PCA when you need a fast, reversible, deterministic compression of linearly correlated features; use t-SNE or UMAP only to **visualize** cluster structure, never as preprocessing whose axes you intend to interpret.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'Features are numerous and **linearly correlated**, and you want to compress them into a few uncorrelated components.',
      'You need a **fast, deterministic, reversible** transform that also works on new incoming data (e.g. as a preprocessing step before a classifier).',
      'You want to **decorrelate** features or remove redundancy / noise before feeding another model.',
    ],
    avoidWhen: [
      'The structure is strongly **nonlinear** (curved manifolds like a Swiss roll) — PCA flattens it; use Kernel PCA, t-SNE, UMAP, or autoencoders.',
      'You need **interpretable** original features — principal components are abstract linear combinations, not real-world variables.',
      'You only care about a pretty 2D cluster picture — t-SNE/UMAP usually separate clusters more clearly for **visualization**.',
    ],
    rulesOfThumb: [
      'Always **center**, and almost always **standardize** (z-score) features before PCA, especially when units differ.',
      'Choose $k$ from the cumulative explained-variance curve — a 95% or 99% threshold is a common default.',
      'Treat t-SNE and UMAP as visualization tools only; their axes have no consistent meaning and distances between far-apart clusters are not reliable.',
    ],
  },
  caseStudies: [
    {
      title: 'Eigenfaces: compressing face images for recognition',
      domain: 'Computer vision / face recognition',
      scenario: 'Turk and Pentland needed to recognize human faces from grayscale images. A modest $128 \\times 128$ image is a point in a **16,384-dimensional** pixel space — far too high-dimensional to compare or classify directly, and dominated by redundant, correlated pixels.',
      approach: 'Center the training faces by subtracting the average face, then run PCA on the image set. The top eigenvectors of the covariance matrix — the "**eigenfaces**" — span a low-dimensional "face space." Each face is then represented by its coordinates (weights) along the top $k$ eigenfaces, and recognition reduces to a nearest-neighbour comparison in that compact space.',
      outcome: 'A small handful of eigenfaces captured most of the variation across faces: roughly **7 of the top eigenfaces** sufficed to characterize the face set, and in their experiments about **40 eigenfaces** were enough for reliable recognition — collapsing the original 16,384-dimensional representation by **over two orders of magnitude** while preserving the discriminative variance. On their test database the system recognized faces with around **96% accuracy** under varying lighting.',
      source: {
        title: 'Eigenfaces for Recognition',
        authors: 'Turk, M. and Pentland, A.',
        url: 'https://www.face-rec.org/algorithms/PCA/jcn.pdf',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'A dataset has two features: length in millimeters and weight in kilograms. Explain what would happen if you ran PCA on this dataset without standardizing the features first, and why.',
      expectedAnswerRubric: "The answer should state that variance scales with the square of the feature's units. Because millimeters will have much larger numeric values than kilograms, the length feature will have a massively inflated variance. Since PCA seeks to maximize variance, the first principal component will align almost entirely with the length feature, ignoring the weight feature regardless of its actual informational importance. Standardizing the features solves this."
    }
  ],
  quiz: [
    {
      question: 'What does the first principal component represent?',
      options: [
        { text: 'The direction in feature space along which the data has maximum variance.', correct: true },
        { text: 'The original feature with the largest mean value.', correct: false },
        { text: 'The direction along which the data has minimum variance.', correct: false },
        { text: 'The average of all the original features.', correct: false },
      ],
      explanation: 'PCA seeks orthonormal directions that maximize the variance of the projected data. The first principal component is the eigenvector of the covariance matrix with the **largest** eigenvalue, and that eigenvalue equals the variance captured along it.',
    },
    {
      question: 'Why is it important to standardize (z-score) features before running PCA when they are on different scales?',
      options: [
        { text: 'Because PCA maximizes variance, a feature with a much larger numeric scale would dominate the components regardless of its true importance.', correct: true },
        { text: 'Because PCA cannot run on negative numbers.', correct: false },
        { text: 'Because standardizing turns a nonlinear problem into a linear one.', correct: false },
        { text: 'Because it makes the eigenvalues sum to exactly one.', correct: false },
      ],
      explanation: 'Variance scales with the square of a feature\'s units, so an unstandardized large-scale feature inflates its variance and hijacks the leading components. Standardizing puts every feature on equal footing (equivalent to using the correlation matrix). It does not linearize anything, nor does it normalize the eigenvalue sum to one.',
    },
    {
      question: 'After projecting data onto its principal components, the resulting components are:',
      options: [
        { text: 'Mutually orthogonal and uncorrelated (the projected covariance matrix is diagonal).', correct: true },
        { text: 'Highly correlated with one another.', correct: false },
        { text: 'Identical copies of the original features.', correct: false },
        { text: 'Always exactly two in number.', correct: false },
      ],
      explanation: 'Principal components are the orthonormal eigenvectors of a symmetric covariance matrix, so they are mutually orthogonal. In the new basis the covariance matrix is diagonal ($\\Lambda$), meaning the components are uncorrelated, with variance $\\lambda_i$ along component $i$.',
    },
    {
      question: 'Standard PCA struggles with a "Swiss roll" dataset (a 2D sheet curled into 3D). Why?',
      options: [
        { text: 'PCA is a linear method and can only find flat projections, so it cannot unroll a curved manifold.', correct: true },
        { text: 'PCA requires more than three dimensions to work at all.', correct: false },
        { text: 'PCA cannot be computed when eigenvalues are positive.', correct: false },
        { text: 'PCA only works on image data.', correct: false },
      ],
      explanation: 'PCA projects data onto a linear subspace, so it cannot capture the nonlinear, curved structure of a manifold like the Swiss roll — it would flatten and overlap distant points. Nonlinear methods such as Kernel PCA, Isomap, t-SNE, or UMAP are designed for that case.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
