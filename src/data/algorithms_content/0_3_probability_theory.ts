import { Algorithm } from "./types";

export const probabilityTheory: Algorithm = {
  id: "probability-theory",
  title: "Probability & Statistics",
  category: "Probability Theory",
  shortDescription: "The mathematical backbone for quantifying uncertainty, mitigating noise, and enabling rigorous reasoning under stochastic conditions.",

  fullDescription: `
Whereas calculus provides the mechanism for optimisation and linear algebra furnishes the structural framework, **probability theory supplies the formal logic for reasoning under uncertainty.** 

Empirical reality is rarely deterministic. The data that underpins machine learning is inherently stochastic, frequently corrupted by random noise, characterised by missing variables, or sampled from restricted populations. An algorithm constrained to absolute, rigid, Boolean extrapolations will invariably fail upon exposure to real-world complexity. Machine learning succeeds precisely because algorithms do not merely guess—they formally distribute their confidence mathematically.

### Beyond Deterministic Certainty

Probability theory permits algorithms to mathematically quantify their uncertainty. Rather than yielding a singular point estimate (e.g., "The predicted asset value is $400,000"), statistical machine learning provides a probabilistic forecast: "There exists a 95% likelihood that the asset value falls within the interval [$380,000, $420,000], assuming the underlying data generating process follows a Gaussian distribution."

This probabilistic framework is not merely an interpretative layer superimposed upon algorithms: **many of the most fundamental machine learning architectures emerge natively and strictly from probability theorems.** 

For instance, Maximum Likelihood Estimation explicitly defines the loss function for the vast majority of parametric models. Naive Bayes classifiers are direct programmatic applications of Bayes' Theorem. Decision Trees rely intrinsically upon entropy (a core concept from Information Theory deeply intertwined with probability) to determine optimal geometric data partitioning.

### Random Variables and Expectations

Data points within machine learning are conceptualised formally as empirical observations of underlying **Random Variables**. When an algorithm computes an arithmetic mean across thousands of observations, it is fundamentally estimating the **Expected Value**. When it calculates the variance or standard deviation of these observations, it is formally quantifying the intrinsic uncertainty of the data generation mechanism.
  `,

  intuition: `
Consider the challenge of inferring the precise shape, volume, and spatial coordinates of an invisible, constantly shifting atmospheric cloud (representing the true population distribution) while only being permitted to observe a small finite sample of individual water droplets (representing the dataset).

1. **Probability:** Given the true, parameters of the invisible cloud, what is the mathematical likelihood of observing this specific configuration of water droplets?
2. **Statistical Inference (Machine Learning):** Given the observation of this specific configuration of water droplets, what are the most probable parameters (shape and location) of the macroscopic cloud?

The algorithm typically posits that the underlying distribution is parametrically continuous (e.g., densely concentrated at a central coordinate and decaying symmetrically—a Normal Distribution). It measures the central tendency (the mean) and the dispersion (the variance) of the observed sample. By deriving the mathematical curve that maximises the likelihood of the observed sample, the algorithm statistically infers the parameters of the unobservable population.
  `,

  mathematics: `
### 1. Probability Distributions and Density
A **Probability Density Function (PDF)** $p(x)$ characterises the relative likelihood that a continuous random variable $X$ assumes a specific value. The most ubiquitous distribution in machine learning is the **Gaussian (Normal) Distribution**:

$$ \\mathcal{N}(x | \\mu, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right) $$

When algorithms operate under the assumption of Gaussian data, complex, high-dimensional datasets can be simplified into two highly compact parameters: the mean $\\mu$ (central tendency) and the variance $\\sigma^2$ (dispersion).

### 2. Bayes' Theorem
Bayes' Theorem provides the rigorous structural methodology for updating prior rational beliefs subsequent to the observation of new empirical evidence:

$$ P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} $$

Within the context of computational learning, $A$ represents the predictive Model Hypothesis, whilst $B$ represents the Training Data. The ultimate objective of Bayesian inference is to structurally compute the **Posterior Distribution $P(\\text{Model} | \\text{Data})$**.

### 3. Entropy and Information Theory
Within machine learning, Information Theory employs entropy $H(X)$ to uniquely and perfectly quantify the fundamental impurity or uncertainty inherent within a stochastic distribution:

$$ H(X) = - \\sum_{x} P(x) \\log P(x) $$

When a model is trained to minimise Cross-Entropy, or alternatively to maximise Information Gain, the algorithm is mathematically compelled to reduce uncertainty and optimise predictive confidence systematically and rigorously.
  `,

  pros: [
    "Provides pure mathematical rigour, permitting models to seamlessly and robustly process inherent noise and missing data.",
    "Fundamental for the generation of confidence intervals, allowing algorithms to communicate probabilistic uncertainty rather than forcing brittle point predictions.",
    "Entropy systematically measures the purity or disorder of datasets, which dictates the mathematically optimal splitting criteria for decision trees.",
    "Bayesian prior assumptions permit practitioners to securely and directly incorporate domain-specific human knowledge into the functional optimisation process."
  ],

  cons: [
    "Complex theoretical probabilistic formulae can become computationally intractable when processing exceedingly high-dimensional continuous data spaces.",
    "Standard machine learning models typically assume data points are Independent and Identically Distributed (i.i.d.), an assumption which explicitly fails on strongly ordered temporal data such as financial time series.",
    "Empirical real-world distributions are rarely mathematically pure Gaussians; the blind application of Normal assumptions to heavy-tailed datasets can severely compromise predictive validity.",
    "Markov Chain Monte Carlo (MCMC) sampling for the approximation of complex posterior distributions is computationally intensive and scales poorly compared to standard gradient descent techniques."
  ],


  codeSnippet: ``
};
