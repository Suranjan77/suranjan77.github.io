import { Algorithm } from "./types";

export const dimensionalityReduction: Algorithm = {
  id: "dimensionality-reduction",
  title: "Dimensionality Reduction",
  category: "Dimensionality Reduction",
  shortDescription: "Methodologies for the substantial mathematical compression of features whilst rigorously retaining essential structural variance.",

  fullDescription: `
Dimensionality reduction encompasses advanced algorithms fundamentally designed to map highly dimensional data configurations into lower-dimensional representational spaces. The most prominent analytical technique, Principal Component Analysis (PCA), mathematically orthogonalises the original dataset by successfully isolating the fundamental axes (principal components) exhibiting the maximum continuous geometric variance, subsequently projecting the raw data onto them. This effectively compresses extraneous statistical noise and definitively insulates the most salient structural signals intrinsic to the dataset.

### Empirical Applications
Dimensionality reduction is frequently leveraged for exploratory data visualisation protocols (effectively compressing thousands of empirical variables onto a discernible 2D or 3D coordinate plane), robust computational data compression pipelines, mitigating the geometric 'Curse of Dimensionality' in downstream machine learning tasks, and propelling high-speed facial recognition mechanisms (e.g., the Eigenfaces biometric system).
  `,

  intuition: `
Consider the analytical challenge of evaluating a complex three-dimensional object, such as an aircraft, via a static two-dimensional photograph. A suboptimal vantage point directly obscures structural details, projecting a shadow completely devoid of nuance. Alternatively, an optimal statistical projection (e.g., a superior orthogonal view) explicitly reveals the comprehensive proportions, explicitly capturing the wingspan, fuselage, and tail structure. 

PCA mathematically computes this precise, optimal 'viewing angle', systematically capturing the greatest measure of explicitly defining shape configuration and geometric variance inherent to high-dimensional empirical matrices.
  `,

  mathematics: `
### 1. The Covariance Matrix
Given a precisely mean-centred $n \\times d$ dataset matrix $X$, the empirical $d \\times d$ symmetric statistical covariance matrix is rigorously formulated as:

$$ \\Sigma = \\frac{1}{n-1} X^T X $$

### 2. Spectral Eigenvalue Decomposition
PCA systematically decomposes this specific covariance matrix $\\Sigma$ directly into rigorously independent structural eigenvectors ($v_i$) and equivalent corresponding eigenvalues ($\\lambda_i$):

$$ \\Sigma v_i = \\lambda_i v_i $$

Each exactly derived, analytically valid eigenvector structurally operates as an orthogonal principal component defining an axis of variance. The corresponding eigenvalue mathematically quantifies the precise absolute magnitude of the variance rigorously isolated along that specific eigenvector's dimension.
  `,

  pros: [
    "Mathematically flawless methodology for isolating and definitively eliminating severely correlated (collinear) variables within complex datasets.",
    "Specifically and structurally isolates pure geometric variance to analytically maximise computational downstream efficiency."
  ],

  cons: [
    "Strictly presupposes that the underlying latent parametric relationships governing the data are fundamentally perfectly linear.",
    "Analytically and precisely removes absolute structural interpretability, effectively transforming explicit real-world features into functionally abstract mathematical composite vectors."
  ],

  codeSnippet: `import numpy as np
from sklearn.decomposition import PCA

# Matrix definition: 100 random continuous samples with 5 correlating features
X = np.random.randn(100, 5)

# Initialise PCA strictly retaining components explaining 95% of aggregate variance
pca = PCA(n_components=0.95)
X_reduced = pca.fit_transform(X)

print(f"Original array shape dimensionality: {X.shape}")
print(f"Reduced array shape dimensionality: {X_reduced.shape}")
print(f"Explicit Explained Statistical Variance Factor Ratio: {pca.explained_variance_ratio_}")`
};
