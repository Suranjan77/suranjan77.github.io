import { Algorithm } from "./types";

export const maximumLikelihood: Algorithm = {
  id: "maximum-likelihood",
  title: "Maximum Likelihood Estimation",
  category: "Maximum Likelihood",
  shortDescription: "A foundational mathematical methodology for estimating the parameters of a statistical model given empirical observations.",

  fullDescription: `
Maximum Likelihood Estimation (MLE) constitutes a ubiquitous principle for estimating the unknown parameters of a probability distribution by systematically maximising a likelihood function. It addresses the fundamental inquiry: 'Under which specific parametric configuration is the observed empirical data most mathematically probable?' MLE serves as the foundational bedrock for numerous learning algorithms, underpinning both classical logistic regression and the objective functions employed within contemporary neural networks.

### Empirical Applications
MLE is exceptionally rigorous for scenarios wherein the underlying data-generating process is explicitly known or can be strongly assumed parametrically. Standard applications include estimating the noise parameters of a sensor (assuming Gaussian error distributions), evaluating conversion rates during A/B testing protocols (via the Binomial distribution), or forecasting component failure intervals within reliability engineering (via the Exponential distribution).
  `,

  intuition: `
Consider instances where one possesses a heavily biased coin and observes exactly 7 heads resulting from 10 consecutive flips. What is the most probabilistically sound estimate of the true underlying probability of observing a head?

MLE posits that the estimate is precisely 0.7. This specific parameter value strictly maximises the mathematical likelihood of observing the exact data sequence that was actually recorded, rendering it more probable than under any alternative parameterisation. MLE perfectly aligns the empirical evidence with the simplest, most statistically rigorous mathematical explanation.
  `,

  mathematics: `
### 1. The Likelihood Function
Let $X = \\{x_1, x_2, \\dots, x_n\\}$ denote an independent and identically distributed (i.i.d.) sample drawn from a probability distribution characterised by a density or mass function $P(x | \\theta)$. The likelihood of the parameter vector $\\theta$, conditional upon the observed data, is defined as the joint probability:

$$ \\mathcal{L}(\\theta | X) = \\prod_{i=1}^{n} P(x_i | \\theta) $$

### 2. Log-Likelihood
Given that computing the multiplicative product of exceedingly small probabilities invariably induces numerical underflow within computational architectures, and because differentiating products is analytically tedious, it is mathematically customary to maximise the **log-likelihood** instead:

$$ \\log \\mathcal{L}(\\theta | X) = \\sum_{i=1}^{n} \\log P(x_i | \\theta) $$

### 3. Computional Optimisation
The Maximum Likelihood Estimate (MLE), formally denoted as $\\hat{\\theta}_{\\text{MLE}}$, is the parameter value that unequivocally maximises this objective function:

$$ \\hat{\\theta}_{\\text{MLE}} = \\arg\\max_{\\theta} \\log \\mathcal{L}(\\theta | X) $$

To derive $\\hat{\\theta}_{\\text{MLE}}$ analytically, one typically computes the partial derivative of the log-likelihood with respect to $\\theta$, equates it to zero, and solves the resulting system of equations:

$$ \\frac{\\partial}{\\partial \\theta} \\sum_{i=1}^{n} \\log P(x_i | \\theta) = 0 $$

### Example: Bernoulli Distribution
For a binary event with probability $p$ of success, the probability mass function is $P(x_i | p) = p^{x_i}(1-p)^{1-x_i}$. The corresponding log-likelihood is:

$$ \\log \\mathcal{L}(p) = \\sum_{i=1}^n \\left[ x_i \\log p + (1-x_i) \\log(1-p) \\right] $$

Taking the derivative with respect to $p$ and setting it to zero systematically yields the empirical sample mean: $\\hat{p} = \\frac{1}{n} \\sum_{i=1}^n x_i$.
  `,

  pros: [
    "MLE is statistically consistent and asymptotically efficient as the sample size approaches infinity.",
    "It provides a rigorous, principled framework for deriving modern loss functions (e.g., Mean Squared Error is mathematically equivalent to MLE under the assumption of Gaussian noise).",
    "Estimates are strictly invariant under functional parameter transformations."
  ],

  cons: [
    "MLE exhibits a severe propensity to overfit when applied to exceedingly small sample sizes without regularisation.",
    "The methodology relies entirely upon the correct mathematical specification of the underlying probability distribution; misspecification comprehensively invalidates the estimates.",
    "Computational optimisation can be analytically intractable and highly problematic for complex, non-convex log-likelihood landscapes."
  ],

  codeSnippet: `import numpy as np
from scipy.optimize import minimize

data = np.array([2.3, 1.9, 2.5, 2.8, 1.7])

def neg_log_likelihood(params):
    mu, sigma = params
    if sigma <= 0: return np.inf
    n = len(data)
    # Minimizing negative log-likelihood is equivalent to maximising log-likelihood
    ll = - (n/2)*np.log(2*np.pi) - n*np.log(sigma) - np.sum((data - mu)**2)/(2*sigma**2)
    return -ll

result = minimize(neg_log_likelihood, [0.0, 1.0])
mu_est, sigma_est = result.x

print(f"MLE Derived Mean: {mu_est:.2f}")
print(f"MLE Derived Std Dev: {sigma_est:.2f}")`
};
