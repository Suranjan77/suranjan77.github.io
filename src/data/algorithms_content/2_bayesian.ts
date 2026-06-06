import { LearningModule } from "./types";

export const bayesianInference: LearningModule = {
  id: "bayesian-inference",
  title: "Bayesian Inference",
  category: "Bayesian Inference",
  prerequisites: ['probability-theory'],
  tracks: ['foundations'],
  difficulty: 2,
  relatedModules: ['maximum-likelihood'],
  shortDescription: "A mathematical way to update your beliefs as you get new information, rather than just making a single blind guess.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Distinguish between Bayesian and Frequentist paradigms of statistics',
    'Identify the components of Bayes Theorem: Prior, Likelihood, Posterior, and Evidence',
    'Explain Maximum a Posteriori (MAP) estimation and its relation to MLE and Regularization',
    'Contrast conjugate priors and numerical approximation techniques (MCMC, Variational Inference)',
  ],
  keyTerms: [
    { term: 'Prior Probability', definition: 'Initial belief about the probability of parameters before observing data.' },
    { term: 'Posterior Probability', definition: 'Updated belief about parameters after observing data, incorporating the prior and likelihood.' },
    { term: 'Credible Interval', definition: 'An interval in Bayesian statistics that contains a parameter with a specified probability.' },
  ],
  workedExamples: [
    {
      title: 'MAP Estimate for a Beta-Binomial Model',
      problem: 'Given prior Beta($\\alpha, \\beta$), find the posterior after observing $h$ heads and $t$ tails.',
      solution: 'By conjugacy, the posterior is Beta($\\alpha + h, \\beta + t$). The MAP estimate (mode of Beta) is $\\frac{\\alpha + h - 1}{\\alpha + h + \\beta + t - 2}$ for $\\alpha, \\beta > 1$.',
    },
  ],
  misconceptions: [
    {
      claim: 'A Bayesian credible interval is interpreted exactly like a frequentist confidence interval.',
      correction: 'A credible interval states there is a 95% probability that the parameter lies within the interval. A confidence interval states that 95% of similarly constructed intervals contain the true parameter.'
    },
    {
      claim: 'Bayesian inference is always better because it uses priors.',
      correction: 'If the prior is chosen poorly or is biased, it can severely skew the posterior distribution and lead to poor predictions.'
    }
  ],
  references: [
    {
      title: "Bayesian Data Analysis",
      authors: "Gelman, A. et al",
      url: "https://www.stat.columbia.edu/~gelman/book/",
      type: "textbook"
    },
    {
      title: "Statistical Rethinking",
      authors: "McElreath, R",
      url: "https://xcelab.net/rm/statistical-rethinking/",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Computational Intractability of the Evidence',
      description: 'The evidence term $P(X) = \\int P(X|\\theta)P(\\theta)d\\theta$ requires integration over high-dimensional spaces, which is often analytically impossible.',
      mitigation: 'Use Markov Chain Monte Carlo (MCMC) sampling or Variational Inference (VI) approximations.'
    }
  ],

  fullDescription: `
Bayesian inference is a formal mathematical framework for changing your mind. Unlike standard statistics (which assumes there is one single, fixed "true" answer out there), Bayesian math treats everything as a probability. Instead of giving you a single, rigid prediction, it gives you a full range of possibilities, showing exactly how confident the AI is in every possible answer.

### Where is it used?
This approach is crucial in high-stakes situations where data is rare, expensive, or messy, but human experts already know a lot about the problem. It's heavily used in medical diagnostics (combining a patient's test results with the general rarity of the disease), personalized medicine, advanced A/B testing, and predicting catastrophic system failures.
  `,

  intuition: `
Imagine you're testing a brand new drug. Before you even start, your initial assumption (the "prior") is probably that the drug doesn't work at all. 

If you run a tiny, low-quality test and get a positive result, a standard algorithm might immediately jump to the conclusion that the drug is a miracle cure. A Bayesian algorithm doesn't do that. It takes that small piece of new evidence and uses it to *slightly* update its initial skepticism. 

As you run more and more tests on thousands of people, the sheer weight of the new evidence slowly overwhelms the initial skepticism, until the algorithm is highly confident that the drug actually works. It's a mathematical model of how a rational human changes their mind.
  `,

  mathematics: `
### 1. Bayes' Theorem
Bayesian inference is built entirely on Bayes' Theorem, which is a formula for updating probabilities based on new evidence:

$$ P(\\theta | X) = \\frac{P(X | \\theta) P(\\theta)}{P(X)} $$

Here's what the pieces mean:
- $P(\\theta | X)$ is the **Posterior**: What you should believe *after* seeing the data.
- $P(X | \\theta)$ is the **Likelihood**: How well your current theory explains the data you just saw.
- $P(\\theta)$ is the **Prior**: What you believed *before* you saw any data.
- $P(X)$ is the **Evidence**: The total probability of seeing this data under all possible theories.

### 2. Maximum a Posteriori (MAP)
Calculating the exact Posterior distribution is often incredibly difficult for computers. To save time, we often just look for the single highest peak of the Posterior curve. This peak is called the MAP estimate:

$$ \\hat{\\theta}_{\\text{MAP}} = \\arg\\max_{\\theta} \\log P(\\theta | X) = \\arg\\max_{\\theta} \\left( \\log P(X | \\theta) + \\log P(\\theta) \\right) $$

Interestingly, MAP is mathematically identical to Maximum Likelihood Estimation (MLE), but with a built-in penalty (regularization) that comes from your Prior beliefs. For example, if you assume your parameters should be close to zero (a Gaussian prior), the math perfectly matches Ridge (L2) Regularization.

### 3. The Hard Part: Integration
The denominator $P(X)$ requires calculating complex integrals across hundreds or thousands of dimensions. Because this is often impossible to solve exactly, modern AI relies on heavy approximation techniques like Markov Chain Monte Carlo (MCMC) or Variational Inference to guess the shape of the curve.
  `,

  pros: [
    "It gives you a full picture of uncertainty, not just a single guess.",
    "It allows human experts to inject their own knowledge directly into the math before the AI even starts learning.",
    "It is incredibly resistant to overfitting, making it perfect for situations where you don't have a lot of data."
  ],

  cons: [
    "It is computationally exhausting. Calculating the full posterior distribution for a massive neural network is practically impossible.",
    "Choosing the 'Prior' is subjective. Two different scientists might choose two different priors, leading to two different results.",
    "Exact mathematical solutions only exist for very specific, simple combinations of distributions."
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
