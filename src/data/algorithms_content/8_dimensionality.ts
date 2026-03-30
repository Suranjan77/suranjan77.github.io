import { Algorithm } from "./types";

export const dimensionalityReduction: Algorithm = {
  id: "dimensionality-reduction",
  title: "Dimensionality Reduction",
  category: "Dimensionality Reduction",
  shortDescription: "Techniques for heavily compressing features while retaining essential mathematical variance.",
  fullDescription: "Dimensionality reduction encompasses algorithms that map high-dimensional data down into a lower-dimensional space. The most prominent technique, Principal Component Analysis (PCA), mathematically orthogonalizes the dataset by identifying axes (components) of maximum variance and projecting the data onto them. This effectively compresses noise and isolates the most important structural signals in the dataset.\n\n### Real-World Applications\nUsed for exploratory data visualization (compressing 1000s of features onto a 2D plot), powerful data compression pipelines, mitigating the geometric curse of dimensionality in downstream machine learning tasks, and high-speed facial recognition systems (Eigenfaces).",
  intuition: "Imagine taking a 3D photograph of an airplane. A bad angle (from the front) creates a 2D shadow that looks like a basic cross, hiding the details. A perfect statistical angle (from the top) projects a 2D shadow that perfectly reveals the wings, tail, and body. PCA mathematically searches for that exact perfect angle that captures the object's defining shape.",
  mathematics: "### The Covariance Matrix\n\nGiven an $n \\times d$ precisely centered data matrix $X$, the empirical $d \\times d$ symmetric covariance matrix is rigorously defined simply as:\n\n$$ \\Sigma = \\frac{1}{n-1} X^T X $$\n\n### Spectral Eigenvalue Decomposition\n\nPCA decomposes this specific $\\Sigma$ directly into rigorously structural independent eigenvectors ($v_i$) and eigenvalues ($\\lambda_i$):\n\n$$ \\Sigma v_i = \\lambda_i v_i $$\n\nEach exactly structural analytically valid eigenvector acts as a principal component axis.",
  pros: [
    "Perfect for removing correlated features.",
    "Specifically structurally isolates pure geometric variance to maximize computational efficiency."
  ],
  cons: [
    "Strictly assumes the latent relationships are fundamentally linear.",
    "Analytically precisely removes structural interpretability, transforming real features into abstract numbers."
  ],
  codeSnippet: `import numpy as np
from sklearn.decomposition import PCA

# Data: 100 samples with 5 correlating features
X = np.random.randn(100, 5)

# Initialize PCA to keep components explaining 95% variance
pca = PCA(n_components=0.95)
X_reduced = pca.fit_transform(X)

print(f"Original shape: {X.shape}")
print(f"Reduced shape: {X_reduced.shape}")
print(f"Explained Variance Ratio: {pca.explained_variance_ratio_}")`
};
