import { Algorithm } from "./types";

export const clustering: Algorithm = {
  id: "clustering",
  title: "Clustering (K-Means, EM, GMM)",
  category: "Clustering",
  shortDescription: "Unsupervised partitioning of data, evolving from hard cluster assignments (K-Means) to soft probabilistic multivariate Gaussians (GMMs).",
  fullDescription: "Clustering algorithmically discovers distinct geometric groups residing inside entirely unlabeled raw data. K-Means finds rigid, perfectly spherical centroids by repeatedly minimizing within-cluster distance. Gaussian Mixture Models (GMMs) generalize this approach by assuming the underlying dataset is explicitly generated from a combination of multiple Gaussian probability distributions, allowing clusters of significantly varying elliptical shapes and densities. These GMM parameters are learned exclusively using the Expectation-Maximization (EM) algorithm.\n\n### Real-World Applications\nCustomer segmentation profiling for marketing databases, rigorous algorithmic anomaly detection in complex industrial equipment sensor logs, document grouping in raw natural language processing pipelines, and precise spatial image segmentation algorithms.",
  intuition: "K-Means relies exclusively on strictly hard borders. If you stand in a room, you belong exclusively to whichever pre-defined 'leader' is physically closest to you. GMMs instead wisely use probabilistic soft borders. If you stand exactly halfway between two leaders, GMM dictates you are 50% part of Group A and 50% part of Group B.",
  mathematics: "### Hard K-Means Objective Function\n\nMinimizes mathematically the exact Within-Cluster Sum of Squares (WCSS):\n\n$$ J = \\sum_{j=1}^{K} \\sum_{i \\in C_j} \\|x_i - \\mu_j\\|^2 $$\n\n### Gaussian Mixture Models (GMM) Probability Density\n\nA GMM assumes the total overall probability density is functionally a strict weighted sum of $K$ independent multivariate Gaussians:\n\n$$ P(x) = \\sum_{k=1}^{K} \\pi_k \\, \\mathcal{N}(x | \\mu_k, \\Sigma_k) $$\n\n### Formal Expectation-Maximization (EM) Derivation\n\nEM iteratively solves this problem by heavily bounding the log-likelihood:\n\n**E-Step**: Calculate the exact statistical 'responsibility' denoted $\\gamma(z_{nk})$ that cluster $k$ formally takes for empirical data point $x_n$:\n\n$$ \\gamma(z_{nk}) = \\frac{\\pi_k \\mathcal{N}(x_n | \\mu_k, \\Sigma_k)}{\\sum_{j=1}^{K} \\pi_j \\mathcal{N}(x_n | \\mu_j, \\Sigma_j)} $$\n\n**M-Step**: Update the statistical parameters using the newly derived responsibilities:\n\n$$ N_k = \\sum_{n=1}^{N} \\gamma(z_{nk}) $$\n$$ \\mu_k^{\\text{new}} = \\frac{1}{N_k} \\sum_{n=1}^{N} \\gamma(z_{nk}) x_n $$",
  pros: [
    "Successfully discovers complex latent data structures entirely algorithmically purely from hidden unlabeled geometric spatial relationships.",
    "Sophisticated GMMs provide mathematically detailed probabilistic soft clustering and capture feature covariances logically."
  ],
  cons: [
    "Fundamentally mathematically sensitive specifically to initialization vectors.",
    "Necessitates explicitly formally declaring the exact true parameter $K$ beforehand representing the number of discrete abstract clusters."
  ],
  codeSnippet: `import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.cluster import KMeans

# 2 Distinct spatial groups
X = np.array([
    [1.5, 2.0], [1.1, 1.8], [2.1, 2.2], 
    [8.0, 8.5], [8.2, 8.1], [8.8, 9.0]
])

kmeans = KMeans(n_clusters=2, random_state=42)
kmeans_labels = kmeans.fit_predict(X)

gmm = GaussianMixture(n_components=2, covariance_type='diag', random_state=42)
gmm.fit(X)

print(f"Computed GMM Probabilities for [2.0, 2.0]: {gmm.predict_proba([[2.0, 2.0]])[0]}")`
};
