import { LearningModule } from "./types";

export const gmmEm: LearningModule = {
  id: "gmm-em",
  title: "Gaussian Mixtures and EM",
  category: "Gaussian Mixtures and EM",
  prerequisites: ["clustering", "maximum-likelihood"],
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
  relatedModules: ["clustering", "maximum-likelihood", "bayesian-inference"]
};
