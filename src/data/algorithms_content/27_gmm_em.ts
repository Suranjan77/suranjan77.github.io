import { LearningModule } from "./types";

export const gmmEm: LearningModule = {
  id: "gmm-em",
  title: "Gaussian Mixtures and EM",
  category: "Gaussian Mixtures and EM",
  prerequisites: ["clustering"],
  tracks: ["practitioner"],
  difficulty: 3,
  estimatedMinutes: 40,
  shortDescription: "A probabilistic clustering model that represents data as a mixture of multiple Gaussian distributions, optimized via the Expectation-Maximization (EM) algorithm.",
  learningObjectives: [
    "Formulate Gaussian Mixture Models (GMM) as a probabilistic latent variable model.",
    "Derive and explain the calculation of responsibilities in the Expectation (E) step.",
    "Formulate parameter updates for weights, means, and covariance matrices in the Maximization (M) step.",
    "Compare GMM and K-Means in terms of hard vs soft clustering assignments.",
    "Use BIC and AIC metrics to determine the optimal number of mixture components."
  ],
  keyTerms: [
    {
      term: "Latent Variable",
      definition: "A hidden, unobserved variable (e.g. cluster assignment in GMM) that is inferred from observed data."
    },
    {
      term: "Responsibility",
      definition: "The conditional probability that a specific mixture component generated a particular data point, given the observed data."
    },
    {
      term: "Expectation-Maximization",
      definition: "An iterative optimization algorithm to find maximum likelihood estimates of parameters in probabilistic models with latent variables."
    },
    {
      term: "Covariance Matrix",
      definition: "A matrix detailing the joint variability of coordinates, defining the shape, orientation, and spread of each Gaussian component."
    }
  ],
  workedExamples: [
    {
      title: "One-Dimensional GMM E-Step Calculation",
      problem: "Consider a 1D Gaussian Mixture Model with two components ($K=2$). Component 1 has weight $\\pi_1 = 0.4$, mean $\\mu_1 = 0$, and variance $\\sigma_1^2 = 1$. Component 2 has weight $\\pi_2 = 0.6$, mean $\\mu_2 = 4$, and variance $\\sigma_2^2 = 4$. Given a single observed data point $x = 2$, compute the responsibility $\\gamma_1(x)$ (the probability that $x$ belongs to Component 1).",
      solution: "First, compute the PDF values (densities) for each component at $x=2$:\n$$f_1(x) = \\frac{1}{\\sqrt{2\\pi \\sigma_1^2}} \\exp\\left(-\\frac{(x - \\mu_1)^2}{2\\sigma_1^2}\\right) = \\frac{1}{\\sqrt{2\\pi}} \\exp\\left(-\\frac{2^2}{2}\\right) \\approx 0.3989 \\times 0.1353 \\approx 0.0540$$\n\n$$f_2(x) = \\frac{1}{\\sqrt{2\\pi \\sigma_2^2}} \\exp\\left(-\\frac{(x - \\mu_2)^2}{2\\sigma_2^2}\\right) = \\frac{1}{\\sqrt{2\\pi \\times 4}} \\exp\\left(-\\frac{(2 - 4)^2}{2 \\times 4}\\right) = \\frac{1}{2\\sqrt{2\\pi}} \\exp\\left(-\\frac{4}{8}\\right) \\approx 0.1995 \\times 0.6065 \\approx 0.1210$$\n\nNow, apply Bayes' rule to find the responsibility $\\gamma_1(x)$:\n$$\\gamma_1(x) = \\frac{\\pi_1 f_1(x)}{\\pi_1 f_1(x) + \\pi_2 f_2(x)}$$\n$$\\gamma_1(x) = \\frac{0.4 \\times 0.0540}{(0.4 \\times 0.0540) + (0.6 \\times 0.1210)} = \\frac{0.0216}{0.0216 + 0.0726} = \\frac{0.0216}{0.0942} \\approx 0.229$$\n\nThus, the responsibility of Component 1 for generating $x=2$ is approximately $22.9\\%$."
    }
  ],
  misconceptions: [
    {
      claim: "Like K-Means, the EM algorithm for GMM is guaranteed to find the global maximum of the likelihood function.",
      correction: "The EM algorithm is a local optimization technique. It is highly sensitive to initialization and can easily get trapped in local maxima of the likelihood surface. Running EM multiple times with different initializations is standard practice."
    },
    {
      claim: "Responsibilities are binary values indicating which cluster a point belongs to.",
      correction: "Responsibilities are continuous probabilities sum-to-one across all components for each point. GMM is a soft clustering method, expressing fractional membership, unlike K-Means which assigns hard binary cluster labels."
    }
  ],
  references: [
    {
      title: "The Elements of Statistical Learning",
      authors: "Trevor Hastie, Robert Tibshirani, and Jerome Friedman",
      url: "https://hastie.su.domains/ElemStatLearn/",
      type: "textbook"
    },
    {
      title: "Pattern Recognition and Machine Learning",
      authors: "Christopher M. Bishop",
      url: "https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: "Singular Covariance Matrices",
      description: "If a Gaussian component collapses onto a single data point, its variance/covariance goes to zero, causing the likelihood density at that point to explode to infinity, crashing the algorithm.",
      mitigation: "Add a small regularization term (diagonal shift, e.g. $10^{-6}$) to the covariance matrices during calculation."
    }
  ],
  pros: [
    "Highly flexible; handles elliptical and oriented clusters, unlike K-Means which assumes spherical clusters.",
    "Provides soft, probabilistic clustering assignments (quantifying cluster assignment uncertainty).",
    "Learns full covariance structures, capturing dependencies between features."
  ],
  cons: [
    "Prone to singular covariance values if components collapse onto single points.",
    "Computationally more expensive than K-Means; requires calculating matrix inverses and determinants.",
    "Requires specifying the number of clusters beforehand."
  ],
  intuition: "Imagine looking at a height distribution chart. It has two peaks: one for children and one for adults. If you want to group these people without knowing their age, K-Means would draw a strict line right in the middle, assigning everyone on one side to 'children' and the other to 'adults'. A Gaussian Mixture Model recognizes that heights overlap. It places two bell curves (Gaussians) over the data. For a person near the middle, it doesn't give a strict label; it says they have a 60% probability of being an adult and a 40% probability of being a child. The EM algorithm is the step-by-step process of shifting and stretching these bell curves until they best fit the data.",
  mathematics: "### Probabilistic Model\n\nA Gaussian Mixture Model expresses the probability density of a data point $\\mathbf{x} \\in \\mathbb{R}^d$ as:\n$$p(\\mathbf{x}) = \\sum_{k=1}^{K} \\pi_k \\mathcal{N}(\\mathbf{x} | \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)$$\nwhere $K$ is the number of components, $\\pi_k$ is the mixture weight satisfying $\\sum_k \\pi_k = 1$, and $\\mathcal{N}(\\mathbf{x} | \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)$ is the multivariate Gaussian density:\n$$\\mathcal{N}(\\mathbf{x} | \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k) = \\frac{1}{(2\\pi)^{d/2} |\\mathbf{\\Sigma}_k|^{1/2}} \\exp\\left( -\\frac{1}{2} (\\mathbf{x} - \\mathbf{\\mu}_k)^T \\mathbf{\\Sigma}_k^{-1} (\\mathbf{x} - \\mathbf{\\mu}_k) \\right)$$\n\n### The Expectation-Maximization (EM) Algorithm\n\n#### 1. Expectation Step (E-step)\nCompute the responsibilities $\\gamma_{ik}$ (the conditional probability that component $k$ generated observation $\\mathbf{x}_i$):\n$$\\gamma_{ik} = \\frac{\\pi_k \\mathcal{N}(\\mathbf{x}_i | \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)}{\\sum_{j=1}^{K} \\pi_j \\mathcal{N}(\\mathbf{x}_i | \\mathbf{\\mu}_j, \\mathbf{\\Sigma}_j)}$$\n\nLet $N_k = \\sum_{i=1}^N \\gamma_{ik}$ represent the effective number of points assigned to cluster $k$.\n\n#### 2. Maximization Step (M-step)\nUpdate parameters using the computed responsibilities:\n- Mixture weights:\n  $$\\pi_k^{\\text{new}} = \\frac{N_k}{N}$$\n- Means:\n  $$\\mathbf{\\mu}_k^{\\text{new}} = \\frac{1}{N_k} \\sum_{i=1}^{N} \\gamma_{ik} \\mathbf{x}_i$$\n- Covariances:\n  $$\\mathbf{\\Sigma}_k^{\\text{new}} = \\frac{1}{N_k} \\sum_{i=1}^{N} \\gamma_{ik} (\\mathbf{x}_i - \\mathbf{\\mu}_k^{\\text{new}}) (\\mathbf{x}_i - \\mathbf{\\mu}_k^{\\text{new}})^T$$",
  fullDescription: "Gaussian Mixture Models (GMM) are a generative, probabilistic model that assumes all data points are generated from a mixture of a finite number of Gaussian distributions with unknown parameters. The Expectation-Maximization (EM) algorithm is a powerful mathematical optimization tool used to estimate the parameters of GMMs, iteratively alternating between calculating cluster assignment probabilities (E-step) and updating the distribution shapes (M-step).",
  codeSnippet: `/**
 * Simple 1D Gaussian Mixture Model Expectation-Maximization solver
 */
export class GMM1D {
  public weights: number[] = [];
  public means: number[] = [];
  public variances: number[] = [];

  constructor(private numComponents: number = 2) {}

  /**
   * Evaluates 1D Gaussian PDF
   */
  private gaussianPDF(x: number, mean: number, variance: number): number {
    const stdDev = Math.sqrt(variance);
    const exponent = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
    return (1 / (Math.sqrt(2 * Math.PI) * stdDev)) * exponent;
  }

  fit(data: number[], maxIterations: number = 50) {
    const n = data.length;
    
    // Initialize parameters
    this.weights = new Array(this.numComponents).fill(1 / this.numComponents);
    
    // Spread initial means across data range
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    this.means = Array.from(
      { length: this.numComponents },
      (_, idx) => min + (idx + 1) * (range / (this.numComponents + 1))
    );
    
    // Set initial variance as sample variance
    const globalMean = data.reduce((s, v) => s + v, 0) / n;
    const globalVar = data.reduce((s, v) => s + Math.pow(v - globalMean, 2), 0) / n;
    this.variances = new Array(this.numComponents).fill(globalVar);

    const responsibilities: number[][] = Array.from({ length: n }, () =>
      new Array(this.numComponents).fill(0)
    );

    for (let iter = 0; iter < maxIterations; iter++) {
      // --- E-Step ---
      for (let i = 0; i < n; i++) {
        let denominator = 0;
        const densities: number[] = [];

        for (let k = 0; k < this.numComponents; k++) {
          const pdf = this.gaussianPDF(data[i], this.means[k], this.variances[k]);
          const weightedDensity = this.weights[k] * pdf;
          densities.push(weightedDensity);
          denominator += weightedDensity;
        }

        for (let k = 0; k < this.numComponents; k++) {
          responsibilities[i][k] = denominator > 0 ? densities[k] / denominator : 1 / this.numComponents;
        }
      }

      // --- M-Step ---
      for (let k = 0; k < this.numComponents; k++) {
        let sumWeights = 0;
        let sumX = 0;

        for (let i = 0; i < n; i++) {
          const resp = responsibilities[i][k];
          sumWeights += resp;
          sumX += resp * data[i];
        }

        // Avoid division by zero
        const nK = sumWeights || 1e-6;

        this.weights[k] = nK / n;
        this.means[k] = sumX / nK;

        let sumVariance = 0;
        for (let i = 0; i < n; i++) {
          const resp = responsibilities[i][k];
          sumVariance += resp * Math.pow(data[i] - this.means[k], 2);
        }

        // Regularize to avoid component collapse (variance -> 0)
        this.variances[k] = (sumVariance / nK) + 1e-4;
      }
    }
  }
}`,
  relatedModules: ["clustering", "mcmc"],
  tldr: [
    'GMM models data as a weighted sum of $K$ Gaussian "bumps", each with its own mean $\\mu_k$ and covariance $\\Sigma_k$.',
    'EM alternates between **soft-assigning** points to clusters (E-step: compute responsibilities $\\gamma_{ik}$) and **re-fitting** each Gaussian to its weighted points (M-step).',
    'Unlike K-Means, assignments are probabilities, not hard labels — every point has some responsibility under every component.',
    'EM never decreases the log-likelihood; each iteration optimizes a tight lower bound (the ELBO), guaranteeing convergence to a **local** optimum.',
    'GMM reduces to K-Means in the limit of equal, isotropic, vanishing-variance components and uniform weights.',
    'Singular covariances (a component collapsing onto one point) are the main numerical failure mode — fix with covariance regularization.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: The E-Step Responsibility Formula and Monotonic Improvement',
      content: `
GMM is a **latent variable model**: each data point $\\mathbf{x}_i$ is assumed to have been generated by first picking a hidden component label $z_i \\in \\{1, \\dots, K\\}$ with probability $P(z_i = k) = \\pi_k$, and then drawing $\\mathbf{x}_i \\sim \\mathcal{N}(\\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)$. Since we never observe $z_i$, inference requires computing the **posterior** over the latent label given the data — this is exactly what Bayes' rule gives us.

### Bayes' rule for the responsibility

By definition, the responsibility $\\gamma_{ik}$ is the posterior probability that component $k$ generated point $\\mathbf{x}_i$:

$$ \\gamma_{ik} \\;=\\; P(z_i = k \\mid \\mathbf{x}_i) $$

Apply Bayes' rule, using the prior $P(z_i = k) = \\pi_k$ and the likelihood $P(\\mathbf{x}_i \\mid z_i = k) = \\mathcal{N}(\\mathbf{x}_i \\mid \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)$:

$$ \\gamma_{ik} = P(z_i = k \\mid \\mathbf{x}_i) = \\frac{P(\\mathbf{x}_i \\mid z_i = k)\\, P(z_i = k)}{P(\\mathbf{x}_i)} = \\frac{\\pi_k\\, \\mathcal{N}(\\mathbf{x}_i \\mid \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)}{\\sum_{j=1}^{K} \\pi_j\\, \\mathcal{N}(\\mathbf{x}_i \\mid \\mathbf{\\mu}_j, \\mathbf{\\Sigma}_j)} $$

The denominator is just the marginal density $p(\\mathbf{x}_i) = \\sum_j \\pi_j \\mathcal{N}(\\mathbf{x}_i \\mid \\mathbf{\\mu}_j, \\mathbf{\\Sigma}_j)$, obtained by summing out the latent label (the law of total probability). Note that for fixed $i$, $\\sum_k \\gamma_{ik} = 1$ — each point distributes exactly one "unit" of responsibility across the $K$ components.

### Why EM never makes the log-likelihood worse

The full-data log-likelihood we ultimately want to maximize is:

$$ \\ell(\\theta) = \\sum_{i=1}^N \\log \\left( \\sum_{k=1}^K \\pi_k \\mathcal{N}(\\mathbf{x}_i \\mid \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k) \\right) $$

The sum **inside** the log makes this hard to optimize directly — there is no closed form. The trick is to multiply and divide each term by the current responsibilities $\\gamma_{ik}$ (which sum to 1 over $k$) and apply **Jensen's inequality**. Since $\\log$ is concave, for any set of weights $\\gamma_{ik}$ summing to 1:

$$ \\log \\left( \\sum_k \\gamma_{ik} \\cdot \\frac{\\pi_k \\mathcal{N}(\\mathbf{x}_i \\mid \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)}{\\gamma_{ik}} \\right) \\;\\ge\\; \\sum_k \\gamma_{ik} \\log \\left( \\frac{\\pi_k \\mathcal{N}(\\mathbf{x}_i \\mid \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)}{\\gamma_{ik}} \\right) $$

Summing over $i$, the right-hand side defines a lower bound on the log-likelihood, often called the **Evidence Lower Bound (ELBO)**:

$$ \\ell(\\theta) \\;\\ge\\; \\sum_{i=1}^N \\sum_{k=1}^K \\gamma_{ik} \\log \\left( \\frac{\\pi_k \\mathcal{N}(\\mathbf{x}_i \\mid \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)}{\\gamma_{ik}} \\right) \\;=\\; \\text{ELBO}(\\theta, \\gamma) $$

The key fact (which follows from Jensen's inequality holding with **equality** exactly when the responsibilities equal the true posterior) is that:

- **E-step**: setting $\\gamma_{ik}$ to the Bayes-rule posterior above makes the bound **tight** — $\\text{ELBO} = \\ell(\\theta)$ at the current $\\theta$.
- **M-step**: maximizing the ELBO over $\\theta$ with $\\gamma$ held fixed can only increase (or keep equal) the bound.

Chaining these two facts: $\\ell(\\theta^{\\text{old}}) = \\text{ELBO}(\\theta^{\\text{old}}, \\gamma) \\le \\text{ELBO}(\\theta^{\\text{new}}, \\gamma) \\le \\ell(\\theta^{\\text{new}})$, where the last inequality is Jensen's inequality applied at the new parameters. So each full EM iteration **cannot decrease** the true log-likelihood — it climbs a staircase of tight lower bounds. This guarantees convergence to a stationary point, but says nothing about which one: poor initialization can still trap EM in a **local** maximum.
      `,
    },
    {
      heading: 'Derivation: The M-Step Closed-Form Updates',
      content: `
In the M-step, the responsibilities $\\gamma_{ik}$ computed in the E-step are treated as **fixed, known weights**. We then maximize the expected complete-data log-likelihood — the ELBO from above, rewritten by expanding $\\mathcal{N}$ and dropping the $-\\gamma_{ik}\\log \\gamma_{ik}$ entropy term (it does not depend on $\\theta$):

$$ Q(\\theta) = \\sum_{i=1}^N \\sum_{k=1}^K \\gamma_{ik} \\left[ \\log \\pi_k - \\frac{d}{2}\\log(2\\pi) - \\frac{1}{2}\\log|\\mathbf{\\Sigma}_k| - \\frac{1}{2}(\\mathbf{x}_i - \\mathbf{\\mu}_k)^T \\mathbf{\\Sigma}_k^{-1} (\\mathbf{x}_i - \\mathbf{\\mu}_k) \\right] $$

This decomposes into independent pieces for each $\\mu_k$, $\\Sigma_k$ (calculus) and the set of $\\pi_k$ (constrained optimization). Define $N_k = \\sum_i \\gamma_{ik}$, the effective number of points "claimed" by component $k$.

### Mean update

Only the quadratic term depends on $\\mu_k$. Take the gradient with respect to $\\mu_k$ and set it to zero:

$$ \\nabla_{\\mathbf{\\mu}_k} Q = \\sum_{i=1}^N \\gamma_{ik} \\, \\mathbf{\\Sigma}_k^{-1} (\\mathbf{x}_i - \\mathbf{\\mu}_k) = 0 $$

Since $\\mathbf{\\Sigma}_k^{-1}$ is invertible, this reduces to $\\sum_i \\gamma_{ik}(\\mathbf{x}_i - \\mathbf{\\mu}_k) = 0$, giving the **responsibility-weighted mean**:

$$ \\mathbf{\\mu}_k^{\\text{new}} = \\frac{1}{N_k} \\sum_{i=1}^N \\gamma_{ik}\\, \\mathbf{x}_i $$

### Covariance update

Taking the matrix derivative of $Q$ with respect to $\\mathbf{\\Sigma}_k^{-1}$ (a standard trick: differentiate $-\\frac12 \\log|\\Sigma_k^{-1}|^{-1}$ and the quadratic form, then set to zero) yields the **responsibility-weighted scatter matrix**:

$$ \\mathbf{\\Sigma}_k^{\\text{new}} = \\frac{1}{N_k} \\sum_{i=1}^N \\gamma_{ik} \\, (\\mathbf{x}_i - \\mathbf{\\mu}_k^{\\text{new}}) (\\mathbf{x}_i - \\mathbf{\\mu}_k^{\\text{new}})^T $$

This is exactly the weighted MLE of a Gaussian covariance, where each point's contribution is scaled by how much "belongs" to component $k$.

### Mixture weight update

The $\\pi_k$ terms must respect the constraint $\\sum_k \\pi_k = 1$, so we maximize $\\sum_{i,k} \\gamma_{ik} \\log \\pi_k$ subject to that constraint using a Lagrange multiplier $\\lambda$:

$$ \\mathcal{L} = \\sum_{i=1}^N \\sum_{k=1}^K \\gamma_{ik} \\log \\pi_k + \\lambda\\left(1 - \\sum_{k=1}^K \\pi_k\\right) $$

Differentiating with respect to $\\pi_k$ and setting to zero: $\\frac{N_k}{\\pi_k} = \\lambda \\;\\Rightarrow\\; \\pi_k = N_k / \\lambda$. Summing both sides over $k$ and using $\\sum_k \\pi_k = 1$ gives $\\lambda = \\sum_k N_k = N$ (total points). Substituting back:

$$ \\pi_k^{\\text{new}} = \\frac{N_k}{N} $$

So each updated weight is simply the fraction of total "soft membership" claimed by component $k$ — an intuitive, closed-form result that mirrors the M-step's general pattern: every update is a responsibility-weighted average of the corresponding sufficient statistic.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A 2-component 1D GMM has $\\pi_1 = 0.5$, $\\pi_2 = 0.5$, and at some point $x_i$ the (unnormalized) weighted densities are $\\pi_1 \\mathcal{N}(x_i \\mid \\mu_1, \\sigma_1^2) = 0.08$ and $\\pi_2 \\mathcal{N}(x_i \\mid \\mu_2, \\sigma_2^2) = 0.02$. Compute the responsibilities $\\gamma_{i1}$ and $\\gamma_{i2}$.',
      difficulty: 'warm-up',
      hints: ['Normalize the two weighted densities so they sum to 1.', 'Use the formula $\\gamma_{ik} = \\frac{\\pi_k \\mathcal{N}_k}{\\sum_j \\pi_j \\mathcal{N}_j}$.'],
      solution: 'The denominator is $0.08 + 0.02 = 0.10$. So $\\gamma_{i1} = 0.08 / 0.10 = 0.8$ and $\\gamma_{i2} = 0.02 / 0.10 = 0.2$. As required, $\\gamma_{i1} + \\gamma_{i2} = 1$: the point is mostly (80%) explained by component 1, but component 2 still gets partial (soft) credit.',
      tags: ['e-step', 'conceptual'],
    },
    {
      prompt: 'You have three 1D data points $x_1 = 1$, $x_2 = 2$, $x_3 = 9$ with responsibilities for component $k$ given by $\\gamma_{1k} = 0.9$, $\\gamma_{2k} = 0.8$, $\\gamma_{3k} = 0.1$. Compute the updated mean $\\mu_k^{\\text{new}}$ for this component.',
      difficulty: 'core',
      hints: ['Remember that this is a weighted average, not a plain average.', 'Use $\\mu_k^{\\text{new}} = \\frac{\\sum_i \\gamma_{ik} x_i}{\\sum_i \\gamma_{ik}}$.'],
      solution: 'Effective count $N_k = 0.9 + 0.8 + 0.1 = 1.8$. Weighted sum $\\sum_i \\gamma_{ik} x_i = 0.9(1) + 0.8(2) + 0.1(9) = 0.9 + 1.6 + 0.9 = 3.4$. So $\\mu_k^{\\text{new}} = 3.4 / 1.8 \\approx 1.89$. Notice the far-away outlier $x_3=9$ barely moves the mean because its responsibility (0.1) is small — this is exactly the soft, weighted averaging that distinguishes the M-step from a plain hard-assignment mean.',
      tags: ['m-step', 'computation'],
    },
    {
      prompt: 'During EM training, one Gaussian component’s covariance collapses toward a single data point, so $|\\mathbf{\\Sigma}_k| \\to 0$. Explain what happens to the log-likelihood and why this is considered a degenerate (pathological) solution rather than a "good fit".',
      difficulty: 'core',
      hints: ['Look closely at the Gaussian density formula.', 'What happens to $\\mathcal{N}(\\mathbf{x} \\mid \\mathbf{\\mu}_k, \\mathbf{\\Sigma}_k)$ as $\\Sigma_k \\to 0$ evaluated exactly at $\\mathbf{x} = \\mathbf{\\mu}_k$?'],
      solution: 'The Gaussian density has a $1/|\\mathbf{\\Sigma}_k|^{1/2}$ normalizing factor in front. As the covariance shrinks toward a single point, $|\\mathbf{\\Sigma}_k| \\to 0$, so the density evaluated at that exact point blows up toward $+\\infty$. Since the log-likelihood includes $\\log \\mathcal{N}(\\mathbf{x}_i \\mid \\dots)$ terms, the overall log-likelihood is **unbounded above** — EM can always increase it arbitrarily by collapsing a component onto a single training point, even though this generalizes terribly (zero density anywhere else). This is a known pathology of unconstrained Gaussian MLE, not a meaningful "perfect fit"; in practice it is prevented by regularizing the covariance (e.g. adding $\\epsilon I$) or imposing a minimum variance floor.',
      tags: ['failure-mode', 'conceptual'],
    },
    {
      prompt: 'Show informally that K-Means is a special case of GMM/EM. What constraints must be placed on the GMM to recover the exact K-Means algorithm?',
      difficulty: 'challenge',
      hints: ['Consider forcing every covariance to be the same isotropic matrix $\\sigma^2 I$.', 'What happens to the softmax-like responsibility formula as $\\sigma^2 \\to 0$?'],
      solution: 'Restrict every component to share the same isotropic covariance $\\mathbf{\\Sigma}_k = \\sigma^2 I$ and equal weights $\\pi_k = 1/K$. Then the responsibility formula reduces to a softmax over **negative squared distances**: $\\gamma_{ik} \\propto \\exp(-\\lVert \\mathbf{x}_i - \\mathbf{\\mu}_k \\rVert^2 / 2\\sigma^2)$. As $\\sigma^2 \\to 0^+$, this softmax becomes infinitely peaked: the responsibility for the **nearest** centroid (smallest distance) approaches 1, and all others approach 0 — exactly the hard assignment rule used in K-Means. In this limit, the weighted mean update $\\mu_k^{\\text{new}} = \\sum_i \\gamma_{ik}\\mathbf{x}_i / N_k$ becomes a plain average over the points hard-assigned to cluster $k$, which is precisely the K-Means centroid update. So K-Means is GMM/EM with shared spherical, vanishing-variance components and a hard-max E-step instead of a soft posterior.',
      tags: ['comparison', 'derivation'],
    },
  ],
  comparisons: [
    {
      title: 'K-Means vs GMM (EM) vs Hierarchical Clustering',
      methods: ['K-Means', 'GMM (EM)', 'Hierarchical Clustering'],
      rows: [
        {
          dimension: 'Cluster shape assumption',
          values: [
            'Spherical, equal-sized clusters (Euclidean Voronoi cells)',
            'Elliptical clusters of arbitrary orientation/shape via full covariance $\\Sigma_k$',
            'None imposed directly — shape emerges from the linkage/distance metric chosen',
          ],
        },
        {
          dimension: 'Assignment type',
          values: [
            'Hard — each point belongs to exactly one cluster',
            'Soft — each point gets a probability ($\\gamma_{ik}$) for every cluster',
            'Hard, but at every level of the dendrogram simultaneously',
          ],
        },
        {
          dimension: 'Output',
          values: [
            '$K$ centroids and a hard label per point',
            'Full generative model: $\\pi_k, \\mu_k, \\Sigma_k$ plus a probability distribution per point',
            'A dendrogram (tree) of nested clusters; choose $K$ post-hoc by cutting the tree',
          ],
        },
        {
          dimension: 'Computational cost',
          values: [
            'Cheapest — $O(NKd)$ per iteration, no matrix inversion',
            'More expensive — $O(NKd^2)$ to $O(NKd^3)$ per iteration due to covariance inverse/determinant',
            'Often $O(N^2 \\log N)$ or $O(N^3)$ depending on linkage — expensive for large $N$',
          ],
        },
        {
          dimension: 'Number of clusters',
          values: [
            'Must be chosen in advance ($K$)',
            'Must be chosen in advance, though BIC/AIC can help select it',
            'Not required upfront — read off the dendrogram at any cut height',
          ],
        },
      ],
      takeaway: 'Use K-Means for fast, simple, roughly-spherical clusters; use GMM when clusters overlap, vary in shape/size, or you need soft probabilistic membership; use hierarchical clustering when you want a multi-resolution view without committing to $K$ upfront, accepting a higher computational cost.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'Clusters are expected to be **elliptical, overlapping, or of different sizes/orientations** — GMM’s full covariance matrices capture this where K-Means cannot.',
      'You need **soft, probabilistic cluster memberships** (e.g. uncertainty-aware downstream decisions) rather than hard labels.',
      'You want a proper **generative density model** of the data — e.g. for anomaly detection (low-density points) or for sampling synthetic data.',
      'You have a reasonable estimate of the number of components $K$, possibly refined with BIC/AIC.',
    ],
    avoidWhen: [
      'The dataset is very **high-dimensional** with limited samples — estimating full $d \\times d$ covariance matrices per component becomes ill-conditioned and slow ($O(d^3)$ per inversion).',
      'You need a **hard guarantee against local optima** or fast, deterministic results — K-Means with k-means++ initialization is simpler and more robust for quick exploratory clustering.',
      'Clusters are **non-convex or manifold-shaped** (e.g. concentric rings, spirals) — no number or shape of Gaussians fits these well; consider DBSCAN or spectral clustering instead.',
      'You cannot tolerate the risk of **singular covariance collapse** without careful regularization and monitoring.',
    ],
    rulesOfThumb: [
      'Always run EM from multiple random (or k-means++-seeded) initializations and keep the run with the highest log-likelihood.',
      'Regularize covariance estimates (add $\\epsilon I$, e.g. $10^{-6}$) to avoid singularities, especially with small clusters or high dimensions.',
      'Use BIC (preferred for model selection) or AIC, plotted against $K$, to pick the number of components rather than guessing.',
      'Start with diagonal or spherical covariance constraints if data is high-dimensional or sample size is limited, then relax to full covariance only if justified.',
    ],
  },
  caseStudies: [
    {
      title: 'Speaker identification with Gaussian Mixture Models',
      domain: 'Speech and audio processing',
      scenario: 'Text-independent speaker verification/identification systems need to model the distribution of acoustic feature vectors (typically Mel-frequency cepstral coefficients, MFCCs) extracted from a speaker’s voice, without assuming any specific spoken text. Each speaker’s voice produces a complex, multi-modal distribution over the MFCC feature space due to different phonemes and vocal tract configurations.',
      approach: 'Reynolds, Quatieri, and Dunn modeled each enrolled speaker’s short-term spectral feature vectors as a Gaussian Mixture Model with typically 8 to 2048 diagonal-covariance components (depending on system scale), trained via EM on that speaker’s enrollment audio. At test time, a new utterance’s likelihood under each speaker’s GMM is computed, and the speaker model with the highest likelihood (or highest likelihood ratio against a universal background model) is selected.',
      outcome: 'GMM-based speaker recognition became the dominant approach in the NIST Speaker Recognition Evaluations through the 1990s and 2000s, with GMM-UBM (Universal Background Model) systems achieving equal error rates in the single-digit percentages on telephone-quality speech benchmarks of that era — establishing GMMs as the standard baseline that later i-vector and x-vector/deep-embedding methods were benchmarked against.',
      source: {
        title: 'Speaker Verification Using Adapted Gaussian Mixture Models',
        authors: 'Douglas A. Reynolds, Thomas F. Quatieri, Robert B. Dunn',
        url: 'https://www.sciencedirect.com/science/article/pii/S1051200499903601',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: "Explain the theoretical relationship between K-Means and Gaussian Mixture Models. How can the K-Means algorithm be derived as a specific limiting case of GMMs trained with Expectation-Maximization?",
      expectedAnswerRubric: "A good answer should explain that K-Means is a constrained version of GMMs where all mixture components share the same isotropic covariance $\\sigma^2 I$ and equal mixture weights. It must explicitly mention that taking the limit as $\\sigma^2 \\to 0$ causes the soft responsibilities in the E-step to collapse into hard, binary assignments (arg-min distance), which perfectly recovers the K-Means algorithm."
    }
  ],
  quiz: [
    {
      question: 'In the E-step responsibility formula $\\gamma_{ik} = \\frac{\\pi_k \\mathcal{N}(x_i \\mid \\mu_k, \\Sigma_k)}{\\sum_j \\pi_j \\mathcal{N}(x_i \\mid \\mu_j, \\Sigma_j)}$, what does the denominator represent?',
      options: [
        { text: 'The marginal density $p(x_i)$, obtained by summing out the latent component label.', correct: true },
        { text: 'The total number of data points $N$.', correct: false },
        { text: 'The determinant of the covariance matrix.', correct: false },
        { text: 'A normalization constant unrelated to the model.', correct: false },
      ],
      explanation: 'The denominator $\\sum_j \\pi_j \\mathcal{N}(x_i \\mid \\mu_j, \\Sigma_j)$ is exactly the GMM’s marginal density $p(x_i)$ — the law of total probability applied to the latent component label $z_i$. Dividing by it converts the joint $\\pi_k \\mathcal{N}(x_i \\mid \\mu_k, \\Sigma_k) = P(x_i, z_i=k)$ into the posterior $P(z_i = k \\mid x_i)$, which is Bayes’ rule.',
    },
    {
      question: 'Why is EM guaranteed to never decrease the log-likelihood at each iteration?',
      options: [
        { text: 'Each iteration tightens an ELBO lower bound in the E-step, then maximizes that same bound in the M-step, and Jensen’s inequality ensures the true log-likelihood is always above the bound.', correct: true },
        { text: 'Because the covariance matrices are always positive semi-definite.', correct: false },
        { text: 'Because K-Means is run first to initialize the means.', correct: false },
        { text: 'Because the responsibilities always sum to exactly 1 for each point.', correct: false },
      ],
      explanation: 'The E-step makes the ELBO tight at the current parameters ($\\text{ELBO} = \\ell(\\theta^{\\text{old}})$); the M-step can only increase or maintain that ELBO value; and Jensen’s inequality guarantees the true log-likelihood at the new parameters is at least as large as the (already non-decreased) ELBO. Chaining these gives $\\ell(\\theta^{\\text{new}}) \\ge \\ell(\\theta^{\\text{old}})$. This says nothing about avoiding local optima, however.',
    },
    {
      question: 'What is the closed-form M-step update for the mixture weight $\\pi_k$, where $N_k = \\sum_i \\gamma_{ik}$ and $N$ is the total number of points?',
      options: [
        { text: '$\\pi_k^{\\text{new}} = N_k / N$', correct: true },
        { text: '$\\pi_k^{\\text{new}} = 1/K$ always', correct: false },
        { text: '$\\pi_k^{\\text{new}} = N_k \\cdot N$', correct: false },
        { text: '$\\pi_k^{\\text{new}} = \\max_i \\gamma_{ik}$', correct: false },
      ],
      explanation: 'Maximizing the expected complete-data log-likelihood subject to $\\sum_k \\pi_k = 1$ via a Lagrange multiplier gives $\\pi_k^{\\text{new}} = N_k / N$ — the fraction of total soft responsibility claimed by component $k$. This is an intuitive weighted-average analog of the M-step’s mean and covariance updates.',
    }
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
