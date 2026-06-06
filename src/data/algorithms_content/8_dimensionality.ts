import { LearningModule } from "./types";

export const dimensionalityReduction: LearningModule = {
  id: "dimensionality-reduction",
  title: "Dimensionality Reduction",
  category: "Dimensionality Reduction",
  prerequisites: ["linear-algebra"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["linear-algebra", "clustering"],
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
print(f"How much information each new column holds: {pca.explained_variance_ratio_}")`
};
