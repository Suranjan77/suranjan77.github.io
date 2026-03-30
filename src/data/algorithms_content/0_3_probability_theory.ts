import { Algorithm } from "./types";

export const probabilityTheory: Algorithm = {
  id: "probability-theory",
  title: "Probability & Statistics",
  category: "Probability Theory",
  shortDescription: "The mathematical backbone for handling uncertainty, noise, and complex reasoning under unknown conditions.",
  
  fullDescription: `
While Calculus provides the navigation and Linear Algebra provides the structure, **Probability Theory provides the logic for dealing with uncertainty.** 

The real world is almost never deterministic. The data that fuels machine learning is messy, corrupted by random noise, explicitly missing vital pieces, or sampled exclusively from tiny populations. An algorithm forced to make an absolute rigid, True/False guess will shatter entirely inside the real world. Machine learning works precisely because algorithms don't just guess—they formally distribute their confidence.

### Beyond Certainty

Probability theory allows algorithms to mathematically quantify their doubts. Instead of simply predicting "The price of this house is $400,000," statistical machine learning predicts "There is a 95% likelihood the price falls between $380,000 and $420,000, assuming the market behaves as a Gaussian distribution." 

This isn't merely an interpretative layer layered on top of algorithms: **many of the most fundamental machine learning algorithms natively emerge strictly entirely out of probability theorems.** 

For example, Maximum Likelihood Estimation explicitly defines the Loss Function for almost all parametric models. Naive Bayes classifiers are literally just extreme applications of Bayes' Theorem. Decision Trees rely heavily on entropy (a concept from Information Theory deeply entwined with probability) to determine where to geometrically split their data.

### Random Variables and Expectations

Data points in ML are conceptualized simply as observations of underlying **Random Variables**. If an algorithm calculates an average outcome over thousands of rows, it is fundamentally estimating the **Expected Value**. If it calculates the spread or variance of the points, it is measuring the intrinsic uncertainty of the system's generation.
  `,

  intuition: `
Imagine trying to guess the shape and location of an invisible, infinitely large, constantly shifting cloud (the true distribution of the universe) while only being allowed to capture and observe exactly three dozen tiny drops of water (your dataset).

1. **Probability:** Given the true shape of the massive invisible cloud, what is the chance you capture these specific 36 drops of water?
2. **Statistics / Machine Learning:** Given you just caught exactly these 36 drops of water, what is the most likely shape and location of the massive invisible cloud?

The algorithm assumes the cloud behaves smoothly mathematically (e.g., heavily packed in the center and fading away neatly at the edges—a Normal Distribution). It measures the average position of the drops (the mean) and how scattered they are (the variance). By finding the mathematical curve that makes those exact 36 drops "most likely" to occur, it statistically "learns" the invisible cloud.
  `,

  mathematics: `
### 1. Probability Distributions and Density
A **Probability Density Function (PDF)** $p(x)$ describes the relative likelihood for the continuous random variable $X$ to take on a given given value. The most ubiquitous in ML is the **Gaussian (Normal) Distribution**:

$$ \\mathcal{N}(x | \\mu, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right) $$

When algorithms assume data is Gaussian, they can simplify enormous swathes of complex data into two extremely compact parameters: the mean $\\mu$ (center) and the variance $\\sigma^2$ (spread).

### 2. Bayes' Theorem
Bayes' Theorem dictates structurally exactly how to update our prior rational beliefs natively explicitly after seeing new evidence:

$$ P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} $$

In machine learning terms, $A$ represents our predictive Model Hypothesis, and $B$ represents our Training Data. The ultimate goal is to structurally calculate the **Posterior Distribution $P(Model | Data)$**.

### 3. Entropy and Information
In Machine Learning, Information Theory relies on entropy $H(X)$ uniquely to measure exactly perfectly the fundamental impurity or uncertainty natively present inside a chaotic complex structured distribution:

$$ H(X) = - \\sum_{x} P(x) \\log P(x) $$

When we train a model fundamentally to minimize Cross-Entropy or drastically maximize structural Information Gain logically, we are mathematically compelling the algorithm strictly smoothly properly definitively uniquely completely successfully dependably nicely accurately cleanly.
  `,

  pros: [
    "Provides pure mathematical rigor allowing models to seamlessly handle inherent noise and missing data robustly.",
    "Crucial for generating confidence intervals, allowing algorithms to communicate when they are unsure, rather than forcing a broken prediction.",
    "Entropy allows us to systematically measure the purity or disorder of datasets, which perfectly dictates where decision trees should mathematically split.",
    "Bayesian prior assumptions let designers gracefully incorporate human-domain knowledge securely directly into the functional optimization calculations."
  ],
  
  cons: [
    "Deep theoretical probabilistic formulas can computationally shatter when processing infinitely high-dimensional continuous data spaces.",
    "Most standard ML models safely assume data points are Independent and Identically Distributed (i.i.d.), which explicitly fails on strongly ordered temporal data like stock markets.",
    "Real world distributions are rarely explicitly mathematically pure Gaussians; blindly applying Normal limits to heavy-tailed datasets breaks predictability cleanly.",
    "MCMC sampling for discovering extremely complex posteriors is extremely slow and scales horribly natively compared to standard algebraic descent."
  ],

  codeSnippet: `
# Foundational Concepts — no snippet required
`
};
