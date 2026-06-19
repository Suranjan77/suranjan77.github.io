import { LearningModule } from "./types";

export const clustering: LearningModule = {
  id: "clustering",
  title: "Clustering (K-Means, EM, GMM)",
  category: "Clustering",
  difficulty: 2,
  tracks: ["practitioner"],
  shortDescription: "Algorithms that automatically group similar data points together without needing human labels.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Explain the mechanics of the K-Means clustering algorithm',
    'Evaluate cluster quality using inertia and silhouette scores',
    'Compare K-Means and Gaussian Mixture Models (GMM)',
    'Formulate the steps of the Expectation-Maximization (EM) algorithm',
  ],
  keyTerms: [
    { term: 'Centroid', definition: 'The geometric center of a cluster, computed as the mean of all data points assigned to the cluster.' },
    { term: 'Expectation-Maximization (EM)', definition: 'An iterative optimization method used to find maximum likelihood estimates of parameters in probabilistic models with latent variables.' },
    { term: 'Inertia', definition: 'The sum of squared distances of samples to their closest cluster center.' },
  ],
  workedExamples: [
    {
      title: 'K-Means Centroid Update Step',
      problem: 'Given a 2D cluster containing three points: $A(1, 2)$, $B(3, 4)$, and $C(5, 6)$, compute the new centroid coordinate.',
      solution: 'The new centroid is the mean of the coordinates: $\\mu_x = \\frac{1+3+5}{3} = 3$, $\\mu_y = \\frac{2+4+6}{3} = 4$. So the new centroid is $(3, 4)$.',
    },
  ],
  misconceptions: [
    {
      claim: 'K-Means will automatically choose the best number of clusters $K$.',
      correction: 'K-Means requires the user to specify $K$ beforehand. Techniques like the Elbow Method or Silhouette analysis are needed to guide this choice.'
    },
    {
      claim: 'K-Means works well on all cluster shapes.',
      correction: 'K-Means assumes clusters are spherical and of similar size. It performs poorly on elongated, nested, or highly irregular cluster shapes.'
    }
  ],
  references: [
    {
      title: "Pattern Recognition and Machine Learning",
      authors: "Bishop, C. M",
      url: "https://www.springer.com",
      type: "textbook"
    },
    {
      title: "Data Clustering: Algorithms and Applications",
      authors: "Aggarwal, C. C. and Reddy, C. K",
      url: "https://www.crcpress.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Sensitivity to Initialization',
      description: 'Bad random centroid initialization can lead to poor local minima.',
      mitigation: 'Use algorithms like K-Means++ to seed centroids far apart, or run multiple random initializations.'
    }
  ],

  fullDescription: `
Clustering algorithms are the detectives of machine learning. You hand them a massive pile of completely unlabelled data, and they automatically organize it into distinct, meaningful groups based on hidden patterns.

K-Means is the most famous clustering algorithm. It works by dropping a set number of "center points" (centroids) into the data and shifting them around until they sit perfectly in the middle of distinct, spherical clusters. 

Gaussian Mixture Models (GMMs) are the smarter, more flexible upgrade to K-Means. Instead of assuming every cluster is a perfect circle, GMMs assume the data is made up of several overlapping bell curves (Gaussian distributions). This allows them to find clusters that are stretched out, dense in the middle, or overlapping. To figure out where these bell curves are, GMMs use a clever mathematical trick called the Expectation-Maximization (EM) algorithm.

### Where is it used?
Clustering is used everywhere you need to find hidden structure. It's used in marketing to automatically segment customers into different buying personas, in finance to detect unusual spending patterns (anomalies), in biology to group genes with similar behaviors, and in computer vision to separate the foreground of an image from the background.
  `,

  intuition: `
**K-Means**: Imagine you have a map of a city with pins for every coffee shop, and you want to open 3 new distribution centers. K-Means draws hard borders on the map. Every coffee shop is assigned to exactly one distribution center—whichever one is closest in a straight line.

**GMMs**: Now imagine the distribution centers share delivery zones. A coffee shop right on the border isn't forced to choose just one. A GMM uses "soft boundaries." It might say, "This coffee shop is 70% likely to be served by Center A, and 30% likely to be served by Center B." It embraces the uncertainty of the real world.
  `,

  mathematics: `
### 1. K-Means Objective Function
K-Means tries to minimize the "Within-Cluster Sum of Squares" (WCSS). In plain English: it wants the distance between every data point $x_i$ and its assigned center point $\\mu_j$ to be as small as possible:

$$ J = \\sum_{j=1}^{K} \\sum_{i \\in C_j} \\|x_i - \\mu_j\\|^2 $$

### 2. Gaussian Mixture Models (GMM)
A GMM assumes that your data was generated by $K$ different Gaussian (bell curve) distributions mixed together. The total probability of seeing a specific data point $x$ is the sum of the probabilities from each of those individual bell curves:

$$ P(x) = \\sum_{k=1}^{K} \\pi_k \\, \\mathcal{N}(x | \\mu_k, \\Sigma_k) $$

### 3. Expectation-Maximization (EM)
Because GMMs are complex, you can't solve them with a single equation. Instead, the EM algorithm takes turns guessing and checking:

**E-Step (Expectation)**: Guess which cluster each data point belongs to. It calculates the "responsibility" $\\gamma(z_{nk})$—the probability that cluster $k$ is responsible for creating data point $x_n$:

$$ \\gamma(z_{nk}) = \\frac{\\pi_k \\mathcal{N}(x_n | \\mu_k, \\Sigma_k)}{\\sum_{j=1}^{K} \\pi_j \\mathcal{N}(x_n | \\mu_j, \\Sigma_j)} $$

**M-Step (Maximization)**: Now that we have a good guess of who belongs to what, we update the center (mean) and shape (variance) of the clusters to better fit the data:

$$ N_k = \\sum_{n=1}^{N} \\gamma(z_{nk}) $$
$$ \\mu_k^{\\text{new}} = \\frac{1}{N_k} \\sum_{n=1}^{N} \\gamma(z_{nk}) x_n $$
  `,

  pros: [
    "It works completely unsupervised. You don't need to spend hundreds of hours manually labeling data for the AI to learn.",
    "GMMs provide 'soft' assignments, giving you a percentage probability of belonging to a cluster rather than a rigid Yes/No.",
    "It can reveal hidden patterns in your data that human analysts might completely miss."
  ],

  cons: [
    "You usually have to tell the algorithm exactly how many clusters ($K$) to look for before it starts, which involves a lot of guesswork.",
    "K-Means is terrible at finding clusters that aren't perfectly spherical (like a ring of data surrounding another cluster).",
    "The final result heavily depends on where the algorithm randomly places its starting points. A bad start leads to a bad result."
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

print(f"Computed GMM Probabilities for structural coordinate [2.0, 2.0]: {gmm.predict_proba([[2.0, 2.0]])[0]}")`,
  tldr: [
    'K-Means partitions data into $K$ clusters by minimizing **inertia** (within-cluster sum of squares), the total squared distance from each point to its assigned centroid.',
    'It runs **Lloyd\'s algorithm**: alternate between *assigning* each point to its nearest centroid and *updating* each centroid to the **mean** of its assigned points.',
    'For fixed assignments, the cluster mean is the provably optimal centroid — which is exactly why the update step uses the mean.',
    'The objective is non-convex, so K-Means converges only to a **local** optimum; the result depends on initialization — use **k-means++** and multiple restarts.',
    'It assumes **spherical**, similarly sized clusters and is sensitive to feature scale, so **standardize** features first; for arbitrary shapes or noise prefer DBSCAN.',
    'Choose $K$ with diagnostics like the **elbow method** (inertia vs $K$) or **silhouette** analysis — K-Means will not pick $K$ for you.',
  ],
  additionalSections: [
    {
      heading: 'The Objective: Why the Centroid Is the Mean',
      content: `
K-Means minimizes the **within-cluster sum of squares** (WCSS), also called **inertia**. Given clusters $C_1, \\dots, C_K$ with centroids $\\mu_1, \\dots, \\mu_K$, the objective is:

$$ J = \\sum_{j=1}^{K} \\sum_{i \\in C_j} \\lVert x_i - \\mu_j \\rVert^2 $$

Suppose the assignments are **fixed** and we ask: for a single cluster $C_j$, which centroid $\\mu_j$ minimizes its contribution $\\sum_{i \\in C_j} \\lVert x_i - \\mu_j \\rVert^2$? Treat this as a function of $\\mu_j$ and take the gradient:

$$ \\nabla_{\\mu_j} \\sum_{i \\in C_j} \\lVert x_i - \\mu_j \\rVert^2 = \\sum_{i \\in C_j} -2 (x_i - \\mu_j) $$

Setting the gradient to zero gives:

$$ \\sum_{i \\in C_j} (x_i - \\mu_j) = 0 \\quad \\Longrightarrow \\quad \\mu_j = \\frac{1}{|C_j|} \\sum_{i \\in C_j} x_i $$

So the optimal centroid for a fixed set of assignments is precisely the **arithmetic mean** of the points in the cluster. The sum of squared distances is a convex quadratic in $\\mu_j$, so this stationary point is the unique global minimizer of that inner sum. This is exactly why the update step replaces each centroid with the mean of its members.
      `,
    },
    {
      heading: 'Lloyd\'s Algorithm and Why It Converges',
      content: `
**Lloyd's algorithm** is coordinate descent on the joint objective $J(\\text{assignments}, \\text{centroids})$. It alternates two steps until assignments stop changing:

$$ \\textbf{Assign: } \\; c_i = \\arg\\min_{j} \\lVert x_i - \\mu_j \\rVert^2 \\qquad \\textbf{Update: } \\; \\mu_j = \\frac{1}{|C_j|}\\sum_{i \\in C_j} x_i $$

Each step can only **decrease or hold** the objective $J$:

- The **assign** step fixes the centroids and minimizes $J$ over assignments. Sending each point to its nearest centroid cannot increase any term, so $J$ does not go up.
- The **update** step fixes the assignments and minimizes $J$ over centroids. As derived above, the mean is the optimal centroid for fixed assignments, so $J$ again does not go up.

Because $J$ is monotonically non-increasing and bounded below by $0$, and there are only finitely many possible assignments (at most $K^n$), the algorithm must **converge in finitely many iterations**. However, each step only performs a *local* (coordinate-wise) minimization, so the fixed point reached is a **local** optimum of the non-convex objective, not necessarily the global one. Different initializations can converge to different local optima with different inertia — the motivation for k-means++ seeding and multiple restarts.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A cluster contains the points $(2, 1)$, $(4, 3)$, and $(6, 2)$. Compute the centroid and the cluster inertia (sum of squared distances to that centroid).',
      difficulty: 'warm-up',
      hints: ['The centroid is the coordinate-wise mean; inertia sums $\\lVert x_i - \\mu \\rVert^2$ over the three points.'],
      solution: 'Centroid: $\\mu_x = (2+4+6)/3 = 4$, $\\mu_y = (1+3+2)/3 = 2$, so $\\mu = (4, 2)$. Squared distances: $(2,1)$: $(2-4)^2 + (1-2)^2 = 4 + 1 = 5$; $(4,3)$: $0 + 1 = 1$; $(6,2)$: $4 + 0 = 4$. Inertia $= 5 + 1 + 4 = 10$.',
    },
    {
      prompt: 'On the 1D points $\\{1, 2, 6, 7\\}$ with initial centroids $\\mu_1 = 1$ and $\\mu_2 = 8$, run **one full iteration** of K-Means (assign, then update). Give the new centroids.',
      difficulty: 'core',
      hints: ['Assign each point to the nearer centroid, then set each new centroid to the mean of its members.'],
      solution: 'Assign: $1$ (|1-1|=0 vs |1-8|=7) and $2$ (|2-1|=1 vs |2-8|=6) go to $\\mu_1$; $6$ (|6-1|=5 vs |6-8|=2) and $7$ (|7-1|=6 vs |7-8|=1) go to $\\mu_2$. Update: $\\mu_1 = (1+2)/2 = 1.5$, $\\mu_2 = (6+7)/2 = 6.5$. The new centroids are $1.5$ and $6.5$ (and a second iteration would leave them unchanged — convergence).',
    },
    {
      prompt: 'Using the elbow method, inertia for $K = 1, 2, 3, 4, 5$ is measured as $[200, 90, 35, 28, 24]$. Which $K$ does the elbow suggest, and why?',
      difficulty: 'core',
      solution: 'Look at the marginal drop in inertia as $K$ increases: $200\\to90$ (drop 110), $90\\to35$ (drop 55), $35\\to28$ (drop 7), $28\\to24$ (drop 4). The drops are large up to $K=3$ and then flatten sharply. The "elbow" — where adding another cluster stops buying much reduction in inertia — is at $K = 3$. Beyond it the curve is nearly flat, indicating diminishing returns.',
    },
    {
      prompt: 'Given the 1D points $\\{0, 2, 10, 12\\}$ and $K = 2$, run K-Means to convergence for two different initializations: (a) centroids $\\{0, 2\\}$ and (b) centroids $\\{1, 11\\}$. Contrast the final clustering and inertia for both cases, and explain what this demonstrates about the algorithm.',
      difficulty: 'challenge',
      hints: ['First, carry out assign/update until assignments stabilize for each seeding.', 'Second, compute and compare the inertia of the final clusterings to demonstrate sensitivity to initialization.'],
      solution: 'Init (b) $\\{1, 11\\}$: assign $0,2\\to1$ and $10,12\\to11$; update to $\\mu=\\{1, 11\\}$ (means of $\\{0,2\\}$ and $\\{10,12\\}$), already stable. Inertia $= (0-1)^2+(2-1)^2+(10-11)^2+(12-11)^2 = 1+1+1+1 = 4$ — the good solution. Init (a) $\\{0, 2\\}$: assign $0\\to0$; $2\\to2$; $10,12$ (closer to 2) $\\to2$; update $\\mu_1=0$, $\\mu_2=(2+10+12)/3=8$. Re-assign with $\\{0,8\\}$: $0,2\\to0$ (|2-0|=2<|2-8|=6), $10,12\\to8$; update $\\mu_1=(0+2)/2=1$, $\\mu_2=(10+12)/2=11$ — now identical to (b), inertia $4$. So here both eventually reach inertia $4$, but (a) needed extra iterations and a poor early split ($\\mu_2=8$, inertia $1+1+4+16=22$ at that step) — illustrating how a bad seed wastes iterations and, with less symmetric data, can trap K-Means in a worse local optimum.',
    },
  ],
  comparisons: [
    {
      title: 'K-Means vs Hierarchical vs DBSCAN',
      methods: ['K-Means', 'Hierarchical (Agglomerative)', 'DBSCAN'],
      rows: [
        {
          dimension: 'Must specify number of clusters?',
          values: ['Yes — choose $K$ up front', 'No — cut the dendrogram at any level afterward', 'No — emerges from density (set $\\varepsilon$, minPts)'],
        },
        {
          dimension: 'Cluster shape assumption',
          values: ['Spherical, similarly sized (convex)', 'Depends on linkage; can capture nested structure', 'Arbitrary shapes — follows dense regions'],
        },
        {
          dimension: 'Handling of outliers / noise',
          values: ['Poor — every point is forced into a cluster', 'Poor — outliers attach to the nearest merge', 'Excellent — labels sparse points as noise'],
        },
        {
          dimension: 'Scalability',
          values: ['High — roughly $O(nKi)$, scales to large $n$', 'Low — naive $O(n^2)$ to $O(n^3)$ memory/time', 'Moderate — $O(n \\log n)$ with spatial index'],
        },
      ],
      takeaway: 'Reach for K-Means when you expect a known number of compact, roughly spherical clusters and need speed; use hierarchical clustering to explore nested structure without fixing $K$; choose DBSCAN when clusters have arbitrary shapes or the data contains noise you want flagged rather than absorbed.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You expect a known, modest number of **compact, roughly spherical** clusters of similar size.',
      'You need a **fast, scalable** partitioning that handles large datasets in near-linear time per iteration.',
      'You want a simple, interpretable baseline for **segmentation** (e.g. grouping customers or quantizing colors).',
    ],
    avoidWhen: [
      'Clusters have **arbitrary, elongated, or nested shapes** (e.g. concentric rings) — prefer DBSCAN or spectral clustering.',
      'The data contains heavy **outliers or noise** you do not want forced into clusters — DBSCAN flags them instead.',
      'Clusters have very **different densities or sizes**, which violate the equal-variance, spherical assumption.',
      'You cannot meaningfully **scale** features, since unscaled large-range features will dominate the Euclidean distance.',
    ],
    rulesOfThumb: [
      'Always **standardize** features (zero mean, unit variance) before K-Means so no single feature dominates the distance.',
      'Use **k-means++** initialization and several restarts (sklearn n_init), keeping the run with the lowest inertia.',
      'Pick $K$ with the **elbow method** on inertia and corroborate with **silhouette** scores rather than a single heuristic.',
      'Remember inertia always decreases as $K$ grows, so never choose $K$ by minimizing inertia alone.',
    ],
  },
  caseStudies: [
    {
      title: 'Color quantization: compressing an image to K colors',
      domain: 'Computer vision / image compression',
      scenario: 'A photograph stored in 24-bit color can contain up to $2^{24} \\approx 16.7$ million distinct colors. Displaying or transmitting it cheaply calls for a much smaller palette while keeping the image visually faithful.',
      approach: 'Treat each pixel as a point in 3D RGB space and run K-Means with $K = 64$ over the pixels. Each centroid becomes a palette color, and every pixel is recolored to its nearest centroid — minimizing the within-cluster squared color distance, which is exactly perceived reconstruction error in RGB.',
      outcome: 'The palette collapses from ~16.7 million possible colors down to **64 colors** — a $> 99.99\\%$ reduction in distinct colors — while the image remains visually almost indistinguishable from the original. Storing a 64-color palette needs only **6 bits per pixel** for the index versus 24 bits for full color, roughly a **4x** reduction in raw pixel storage. This is the canonical color-quantization demo shipped in scikit-learn.',
      source: {
        title: 'scikit-learn: Color Quantization using K-Means',
        authors: 'scikit-learn developers',
        url: 'https://scikit-learn.org/stable/auto_examples/cluster/plot_color_quantization.html',
        type: 'documentation',
      },
    },
  ],
  quiz: [
    {
      question: 'On data shaped as two concentric rings, K-Means with $K = 2$ performs poorly. What is the core reason?',
      options: [
        { text: 'K-Means assumes spherical, convex clusters, so it cuts the rings instead of separating inner from outer.', correct: true },
        { text: 'K-Means cannot handle 2D data.', correct: false },
        { text: 'Inertia is undefined for ring-shaped data.', correct: false },
        { text: 'The centroids would be identical for both rings.', correct: false },
      ],
      explanation: 'Minimizing squared distance to a single centroid produces convex, roughly spherical (Voronoi) partitions. Concentric rings are non-convex and share a center, so K-Means slices them in half rather than separating inner and outer. Density-based (DBSCAN) or spectral methods handle such shapes.',
    },
    {
      question: 'Which statement about choosing the number of clusters $K$ in K-Means is correct?',
      options: [
        { text: 'You must specify $K$ in advance; inertia keeps dropping as $K$ grows, so use the elbow or silhouette to pick it.', correct: true },
        { text: 'K-Means automatically discovers the optimal $K$ by minimizing inertia.', correct: false },
        { text: 'The best $K$ is always the one with the lowest inertia.', correct: false },
        { text: 'Silhouette score increases monotonically with $K$, so pick the largest $K$.', correct: false },
      ],
      explanation: 'K-Means needs $K$ as input. Inertia is monotonically non-increasing in $K$ (it reaches $0$ when $K = n$), so minimizing it just picks the largest $K$. Practitioners instead look for the elbow in the inertia curve or maximize the silhouette score, which trades cohesion against separation.',
    },
    {
      question: 'Before running K-Means on features measured in very different units (e.g. age in years and income in dollars), what is the most important preprocessing step?',
      options: [
        { text: 'Standardize/scale the features so no single feature dominates the Euclidean distance.', correct: true },
        { text: 'Remove the target label column.', correct: false },
        { text: 'Sort the rows by the largest feature.', correct: false },
        { text: 'Convert all features to integers.', correct: false },
      ],
      explanation: 'K-Means relies on Euclidean distance, which is dominated by features with the largest numeric range. Income in dollars would swamp age in years, so the centroids would effectively ignore age. Standardizing to comparable scales (e.g. zero mean, unit variance) lets every feature contribute meaningfully.',
    },
  ],
  shortAnswerQuestions: [
    {
      question: "If K-Means is run several times on the same dataset with different random seeds, it may return different clusterings. Explain why this happens mathematically and how it is typically mitigated in practice.",
      expectedAnswerRubric: "The answer should state that the within-cluster sum of squares (inertia) objective is non-convex. Lloyd's algorithm converges to a local optimum rather than a global one, and the local optimum it reaches depends heavily on the initial centroid placement. Mitigation strategies include using K-means++ initialization to seed centroids well and running the algorithm multiple times to select the clustering with the lowest inertia."
    }
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
