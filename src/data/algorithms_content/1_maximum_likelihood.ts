import { Algorithm } from "./types";

export const maximumLikelihood: Algorithm = {
  id: "maximum-likelihood",
  title: "Maximum Likelihood Estimation",
  category: "Maximum Likelihood",
  shortDescription: "A foundational mathematical method to estimate the parameters of a statistical model given observations.",
  fullDescription: "Maximum Likelihood Estimation (MLE) is a generic principle for estimating the unknown parameters of a probability distribution by maximizing a likelihood function. It answers the question: 'Under which parameters is the observed data most mathematically probable?' It serves as the bedrock for many learning algorithms, including logistic regression and objective functions in neural networks.\n\n### Real-World Applications\nMLE is excellent for problems where the underlying data generating process is known or can be strongly assumed. Examples include estimating parameters of a noisy sensor (Gaussian errors), conversion rates on a website undergoing A/B testing (Binomial distribution), or forecasting component failure times in reliability testing (Exponential distribution).",
  intuition: "Imagine you have a biased coin, and you flip it 10 times, getting 7 heads. What is the most likely true probability of getting a head? MLE says it's exactly 0.7, because that parameter value makes the data you actually observed more likely than any other possible value. It perfectly matches the evidence to the simplest mathematical explanation.",
  mathematics: "### The Likelihood Function\n\nLet $X = \\{x_1, x_2, \\dots, x_n\\}$ be an independent and identically distributed (i.i.d.) sample drawn from a probability distribution with density or mass function $P(x | \\theta)$. The likelihood of the parameter $\\theta$ given the data is the joint probability:\n\n$$ \\mathcal{L}(\\theta | X) = \\prod_{i=1}^{n} P(x_i | \\theta) $$\n\n### Log-Likelihood\n\nBecause computing the products of small probabilities causes numerical underflow on computers, and because differentiating products is tedious, we almost always maximize the **log-likelihood**:\n\n$$ \\log \\mathcal{L}(\\theta | X) = \\sum_{i=1}^{n} \\log P(x_i | \\theta) $$\n\n### Optimization\n\nThe Maximum Likelihood Estimate (MLE), denoted $\\hat{\\theta}_{\\text{MLE}}$, is the value that maximizes this function:\n\n$$ \\hat{\\theta}_{\\text{MLE}} = \\arg\\max_{\\theta} \\log \\mathcal{L}(\\theta | X) $$\n\nTo find $\\hat{\\theta}_{\\text{MLE}}$, we typically take the partial derivative of the log-likelihood with respect to $\\theta$, set it to zero, and solve the system of equations:\n\n$$ \\frac{\\partial}{\\partial \\theta} \\sum_{i=1}^{n} \\log P(x_i | \\theta) = 0 $$\n\n### Example: Bernoulli Distribution\n\nFor a coin flip with probability $p$ of heads, $P(x_i | p) = p^{x_i}(1-p)^{1-x_i}$. The log-likelihood is:\n\n$$ \\log \\mathcal{L}(p) = \\sum_{i=1}^n \\left[ x_i \\log p + (1-x_i) \\log(1-p) \\right] $$\n\nTaking the derivative with respect to $p$ and setting to zero yields the empirical sample mean: $\\hat{p} = \\frac{1}{n} \\sum_{i=1}^n x_i$.",
  pros: [
    "Statistically consistent and asymptotically efficient.",
    "Provides a principled framework for deriving modern loss functions (e.g., MSE is equivalent to MLE under a Gaussian noise assumption).",
    "Invariant under functional parameter transformations."
  ],
  cons: [
    "Can severely overfit if the sample size is extremely small.",
    "Relies entirely on correct mathematical specification of the underlying probability distribution.",
    "Optimization can be intractable and difficult for non-convex log-likelihood landscapes."
  ],
  codeSnippet: `import numpy as np
from scipy.optimize import minimize

data = np.array([2.3, 1.9, 2.5, 2.8, 1.7])

def neg_log_likelihood(params):
    mu, sigma = params
    if sigma <= 0: return np.inf
    n = len(data)
    ll = - (n/2)*np.log(2*np.pi) - n*np.log(sigma) - np.sum((data - mu)**2)/(2*sigma**2)
    return -ll

result = minimize(neg_log_likelihood, [0.0, 1.0])
mu_est, sigma_est = result.x

print(f"MLE Derived Mean: {mu_est:.2f}")
print(f"MLE Derived Std Dev: {sigma_est:.2f}")`
};
