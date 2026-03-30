import { Algorithm } from "./types";

export const bayesianInference: Algorithm = {
  id: "bayesian-inference",
  title: "Bayesian Inference",
  category: "Bayesian Inference",
  shortDescription: "A probabilistic framework that updates our original belief about parameters as more evidence or data becomes sequentially available.",
  fullDescription: "Bayesian Inference provides a formal mathematical framework for incorporating prior knowledge and updating it in light of newly acquired evidence. Unlike Maximum Likelihood, which assumes parameters are fixed but unknown quantities, Bayesian inference treats parameters as random variables with their own entire probability distributions. It ultimately outputs a full posterior probability distribution, rather than a single point estimate.\n\n### Real-World Applications\nCrucial in high-stakes fields where data is extraordinarily scarce, expensive, or highly uncertain, and where prior expert domain knowledge is available and valuable. It is heavily utilized in medical diagnostics (incorporating baseline population prevalence with test accuracy), personalized medicine spanning multiple patient histories, sophisticated A/B testing, and catastrophic system risk assessment models.",
  intuition: "Before you test a new experimental drug, you strongly suspect it has zero effect (this is your 'prior'). When the very first small clinical trial shows a positive effect, you intuitively don't instantly jump to believing it's a miracle cure. Instead, you update your belief to be somewhere between 'no effect' and 'miracle cure' (this is your 'posterior'). As you test thousands of people, the massive weight of the evidence overwhelms your initial skeptical prior.",
  mathematics: "### Bayes' Theorem for Probability Distributions\n\nBayesian inference relies heavily on conditional probability and Bayes' theorem applied continuously to probability densities rather than just discrete events:\n\n$$ P(\\theta | X) = \\frac{P(X | \\theta) P(\\theta)}{P(X)} $$\n\nWhere mathematical terms are:\n- $P(\\theta | X)$ is the **Posterior**: our rigorously updated belief about the parameters after observing the data.\n- $P(X | \\theta)$ is the **Likelihood**: how mathematically probable the data is given these specific parameters.\n- $P(\\theta)$ is the **Prior**: our initial, pre-data belief or expert knowledge encapsulating the parameters' distribution.\n- $P(X)$ is the **Marginal Likelihood** (or **Evidence**): the absolute total mathematical probability of seeing the data across all possible parameter combinations. Evaluated as an integral: $P(X) = \\int P(X | \\theta) P(\\theta) d\\theta$.\n\n### Maximum a Posteriori (MAP) Estimation\n\nInstead of calculating the incredibly complex full posterior distribution, practitioners often simply seek the mode (the mathematical peak) of the posterior distribution, officially known as the MAP estimate:\n\n$$ \\hat{\\theta}_{\\text{MAP}} = \\arg\\max_{\\theta} \\log P(\\theta | X) = \\arg\\max_{\\theta} \\left( \\log P(X | \\theta) + \\log P(\\theta) \\right) $$\n\nNotice that MAP is mathematically essentially MLE but with an added regularisation penalty strictly determined by the Prior. For instance, assuming a Gaussian prior on the weights in a pure linear regression model mathematically corresponds exactly to applying Ridge (L2) Regularisation.\n\n### The Fundamental Intractability Problem\n\nThe denominator $P(X)$ often requires computing high-dimensional, highly intractable nested integrals. This computational wall forces the absolute reliance on sampling approximation techniques like Variational Inference or Markov Chain Monte Carlo (MCMC).",
  pros: [
    "Provides a mathematically rigorous measure of absolute uncertainty (accessible via credible intervals).",
    "Naturally and seamlessly incorporates domain expert knowledge immediately through Priors.",
    "Significantly robust against aggressive overfitting architectures, especially in absolute small-data regimes."
  ],
  cons: [
    "Computationally excruciatingly expensive to calculate and process the full posterior distribution in high dimensions.",
    "Formally choosing a Prior can occasionally be subjective and scientifically controversial among peers.",
    "Exact analytical solutions are exclusively only available for mathematically 'conjugate' distributions."
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

print(f"MAP Point-Estimate of Bias: {map_estimate:.2f}")
print(f"95% Bayesian Credible Interval: [{lower_bound:.2f}, {upper_bound:.2f}]")`
};
