import { Algorithm } from "./types";

export const clustering: Algorithm = {
  id: "clustering",
  title: "Clustering (K-Means, EM, GMM)",
  category: "Clustering",
  shortDescription: "Unsupervised algorithmic partitioning of data, progressing from discrete hard assignments (K-Means) to probabilistic multivariate Gaussian models (GMMs).",

  fullDescription: `
Clustering algorithms computationally derive distinct geometric taxonomies intrinsic to entirely unlabelled empirical data. K-Means establishes rigid, perfectly spherical centroids by iteratively minimising the within-cluster sum of squares. Gaussian Mixture Models (GMMs) formally generalise this paradigm by postulating that the underlying dataset is explicitly generated from a linear combination of multiple Gaussian probability distributions, thereby accommodating clusters exhibiting significant variance in both elliptical morphology and spatial density. The constituent parameters of these GMMs are derived exclusively via the rigorous Expectation-Maximisation (EM) algorithm.

### Empirical Applications
Clustering techniques are foundational in market segmentation profiling within quantitative finance, rigorous algorithmic anomaly detection across complex industrial sensor arrays, structural document categorisation spanning raw natural language processing pipelines, and precise spatial image segmentation within computer vision architectures.
  `,

  intuition: `
K-Means methodology relies exclusively upon strictly defined heuristic borders. Topologically, if an observation resides within a multidimensional spatial region, it is categorically assigned to whichever analytical centroid mathematically lies closest in Euclidean distance. 

Conversely, GMMs mathematically utilise probabilistic soft boundaries. If an empirical observation perfectly bisects the distance between two structural distributions, the GMM probabilistically dictates that the observation holds a 50% membership affiliation to Group A and a 50% affiliation to Group B, elegantly preserving inherent systemic uncertainty.
  `,

  mathematics: `
### 1. Hard K-Means Objective Function
The algorithm systematically minimises the analytical Within-Cluster Sum of Squares (WCSS):

$$ J = \\sum_{j=1}^{K} \\sum_{i \\in C_j} \\|x_i - \\mu_j\\|^2 $$

### 2. Gaussian Mixture Models (GMM) Probability Density
A GMM postulates that the total aggregate probability density fundamentally operates as a strictly weighted summation of $K$ independent multivariate Gaussian distributions:

$$ P(x) = \\sum_{k=1}^{K} \\pi_k \\, \\mathcal{N}(x | \\mu_k, \\Sigma_k) $$

### 3. Formal Expectation-Maximisation (EM) Derivation
The EM algorithm iteratively navigates this complex parameter space by establishing rigorous lower bounds upon the log-likelihood function:

**E-Step (Expectation)**: Calculate the precise statistical 'responsibility', denoted functionally as $\\gamma(z_{nk})$, that cluster $k$ formally attributes for the empirical data point $x_n$:

$$ \\gamma(z_{nk}) = \\frac{\\pi_k \\mathcal{N}(x_n | \\mu_k, \\Sigma_k)}{\\sum_{j=1}^{K} \\pi_j \\mathcal{N}(x_n | \\mu_j, \\Sigma_j)} $$

**M-Step (Maximisation)**: Systematically update the constituent statistical parameters explicitly utilising the newly derived responsibilities:

$$ N_k = \\sum_{n=1}^{N} \\gamma(z_{nk}) $$
$$ \\mu_k^{\\text{new}} = \\frac{1}{N_k} \\sum_{n=1}^{N} \\gamma(z_{nk}) x_n $$
  `,

  pros: [
    "Successfully delineates complex latent data topologies purely from unlabelled geometric spatial relationships without human intervention.",
    "Sophisticated GMMs yield highly detailed probabilistic soft cluster assignments whilst explicitly modelling covariance structures."
  ],

  cons: [
    "Fundamentally mathematically sensitive specifically to the initial deterministic or stochastic seeding of centroid vectors.",
    "Necessitates explicitly declaring the abstract parameter $K$ (representing the total volume of discrete clusters) a priori before computation."
  ],

  codeSnippet: `import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.cluster import KMeans

# 2 Distinct geometric spatial groups
X = np.array([
    [1.5, 2.0], [1.1, 1.8], [2.1, 2.2], 
    [8.0, 8.5], [8.2, 8.1], [8.8, 9.0]
])

kmeans = KMeans(n_clusters=2, random_state=42)
kmeans_labels = kmeans.fit_predict(X)

gmm = GaussianMixture(n_components=2, covariance_type='diag', random_state=42)
gmm.fit(X)

print(f"Computed GMM Probabilities for structural coordinate [2.0, 2.0]: {gmm.predict_proba([[2.0, 2.0]])[0]}")`
};
