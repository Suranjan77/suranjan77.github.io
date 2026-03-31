import { Algorithm } from "./types";

export const bayesianInference: Algorithm = {
  id: "bayesian-inference",
  title: "Bayesian Inference",
  category: "Bayesian Inference",
  shortDescription: "A probabilistic framework that rigorously updates initial parametric beliefs as novel empirical evidence becomes sequentially available.",

  fullDescription: `
Bayesian inference provides a formal mathematical framework for integrating prior knowledge and sequentially updating it in light of newly acquired empirical evidence. In contrast to Maximum Likelihood Estimation, which assumes model parameters are fixed albeit unknown deterministic quantities, Bayesian inference formally treats all parameters as stochastic random variables possessing their own definitive probability distributions. It ultimately yields a comprehensive posterior probability distribution, rather than a singular, potentially brittle point estimate.

### Empirical Applications
This paradigm is crucial in high-stakes operational domains where empirical data is extraordinarily scarce, financially prohibitive to acquire, or highly uncertain, and where prior expert domain knowledge is available and analytically valuable. It is heavily utilised in medical diagnostics (formally integrating baseline population prevalence with clinical test sensitivity), personalised medicine spanning longitudinal patient histories, sophisticated A/B testing methodologies, and catastrophic system risk assessment modelling.
  `,

  intuition: `
Prior to the empirical evaluation of a novel pharmacological intervention, a prominent analytical assumption (defined mathematically as the 'prior') may postulate a strict null effect. Upon the conclusion of an initial, underpowered clinical trial yielding a positive outcome, a robust Bayesian analysis does not immediately conclude the intervention is categorically efficacious. Rather, it formally updates the initial belief towards a moderated intermediate probability (the 'posterior'). 

As iterative testing encompasses thousands of heterogeneous subjects, the cumulative weight of the empirical evidence systematically asymptotically overwhelms the initial sceptical prior, yielding a highly confident posterior distribution grounded entirely in observed reality.
  `,

  mathematics: `
### 1. Bayes' Theorem for Continuous probability Distributions
Fundamental Bayesian inference relies meticulously upon conditional probability and the continuous application of Bayes' Theorem to probability density functions, extending beyond discrete event tabulation:

$$ P(\\theta | X) = \\frac{P(X | \\theta) P(\\theta)}{P(X)} $$

Where the constituent mathematical parameters are defined as:
- $P(\\theta | X)$ is the **Posterior**: the rigorously updated probability distribution of the parameters subsequent to data observation.
- $P(X | \\theta)$ is the **Likelihood**: the mathematical probability of observing the specific data given explicit parameter configurations.
- $P(\\theta)$ is the **Prior**: the initial assumption or codified expert knowledge encapsulating the parameters' inherent distribution pre-observation.
- $P(X)$ is the **Marginal Likelihood** (or **Evidence**): the absolute total mathematical probability of observing the data marginalised across all possible parameter combinations. Evaluated computationally as an integral: $P(X) = \\int P(X | \\theta) P(\\theta) d\\theta$.

### 2. Maximum a Posteriori (MAP) Estimation
To circumvent the computational burden of calculating the profoundly complex full posterior distribution, practitioners frequently isolate the mode (the singular mathematical peak) of the posterior density, formally designated as the MAP estimate:

$$ \\hat{\\theta}_{\\text{MAP}} = \\arg\\max_{\\theta} \\log P(\\theta | X) = \\arg\\max_{\\theta} \\left( \\log P(X | \\theta) + \\log P(\\theta) \\right) $$

It is imperative to note that MAP is mathematically equivalent to MLE, albeit with an integrated regularisation penalty explicitly dictated by the prior distribution. For instance, postulating a Gaussian prior upon the parameter weights within a pure linear regression model mathematically equates identically to applying Ridge (L2) Regularisation.

### 3. The Fundamental Intractability Challenge
The denominator $P(X)$ invariably requires the computation of high-dimensional, highly intractable nested integrals. This severe computational constraint historically mandated an absolute reliance upon advanced sampling approximation paradigms, notably Variational Inference or Markov Chain Monte Carlo (MCMC) methods.
  `,

  pros: [
    "Provides a mathematically rigorous and fully quantified measure of absolute uncertainty (accessible via Bayesian credible intervals).",
    "Naturally and seamlessly incorporates subjective domain expert knowledge explicitly through the formulation of Priors.",
    "Exhibits significant robust resistance against aggressive overfitting, particularly within structurally small-data regimes."
  ],

  cons: [
    "Computationally excruciating to calculate and accurately process the full continuous posterior distribution across high-dimensional parameter spaces.",
    "The formal selection of a Prior distribution can occasionally introduce subjective bias, rendering the methodology scientifically controversial amongst frequentist peers.",
    "Exact analytical, closed-form solutions are exclusively constrained to mathematically 'conjugate' prior-likelihood distribution pairings."
  ],

  codeSnippet: `import numpy as np
from scipy import stats

prior_alpha, prior_beta = 2, 2
heads, tails = 8, 2

posterior_alpha = prior_alpha + heads
posterior_beta = prior_beta + tails
posterior_dist = stats.beta(posterior_alpha, posterior_beta)

map_estimate = (posterior_alpha - 1) / (posterior_alpha + posterior_beta - 2)
lower_bound, upper_bound = posterior_dist.ppf(0.025), posterior_dist.ppf(0.975)

print(f"MAP Point-Estimate of Parametric Bias: {map_estimate:.2f}")
print(f"95% Bayesian Credible Interval: [{lower_bound:.2f}, {upper_bound:.2f}]")`
};
