import { LearningModule } from "./types";

export const statisticsEstimation: LearningModule = {
  id: "statistics-estimation",
  title: "Statistics and Estimation",
  category: "Statistics and Estimation",
  prerequisites: ["probability-theory"],
  tracks: ["foundations"],
  difficulty: 2,
  estimatedMinutes: 30,
  shortDescription: "How to draw reliable conclusions and calculate uncertainty from data samples, rather than theoretical populations.",
  learningObjectives: [
    "Compute descriptive sample statistics including mean, variance, and standard deviation.",
    "Explain the Central Limit Theorem and how it justifies the use of normal distributions for sample means.",
    "Construct and interpret confidence intervals for a population mean under different sample sizes.",
    "Perform bootstrap resampling to estimate standard errors and confidence intervals for arbitrary estimators.",
    "Formulate null and alternative hypotheses and interpret p-values in hypothesis testing."
  ],
  keyTerms: [
    {
      term: "Point Estimator",
      definition: "A statistic calculated from sample data that serves as a single best guess for an unknown population parameter."
    },
    {
      term: "Standard Error",
      definition: "The standard deviation of the sampling distribution of a statistic (typically the sample mean)."
    },
    {
      term: "Confidence Interval",
      definition: "A range of values, derived from sample statistics, that is likely to contain the value of an unknown population parameter."
    },
    {
      term: "Bootstrap Resampling",
      definition: "A computer-intensive method of approximating the sampling distribution of a statistic by repeatedly resampling with replacement from the observed dataset."
    }
  ],
  workedExamples: [
    {
      title: "Confidence Interval for the Mean",
      problem: "A sample of $n = 100$ students has a mean height of $\\bar{x} = 172\\text{ cm}$ with a sample standard deviation of $s = 8\\text{ cm}$. Construct a $95\\%$ confidence interval for the population mean height $\\mu$.",
      solution: "First, compute the standard error of the mean: $SE = \\frac{s}{\\sqrt{n}} = \\frac{8}{\\sqrt{100}} = 0.8\\text{ cm}$. Since $n$ is large, we use the critical z-score for $95\\%$ confidence, which is $z^* \\approx 1.96$. The margin of error is $ME = z^* \\times SE = 1.96 \\times 0.8 = 1.568\\text{ cm}$. Therefore, the $95\\%$ confidence interval is $\\bar{x} \\pm ME = [172 - 1.568, 172 + 1.568] = [170.43, 173.57]\\text{ cm}$."
    }
  ],
  misconceptions: [
    {
      claim: "A 95% confidence interval means there is a 95% probability that the true parameter lies within this specific interval.",
      correction: "The true parameter is a fixed, non-random constant. Once the interval is calculated, it either contains the parameter (probability 1) or does not (probability 0). The 95% refers to the reliability of the estimation procedure: if we constructed many such intervals from different samples, 95% of them would contain the true parameter."
    },
    {
      claim: "A p-value is the probability that the null hypothesis is true.",
      correction: "A p-value is the probability, assuming the null hypothesis is true, of obtaining test results at least as extreme as the results actually observed."
    }
  ],
  references: [
    {
      title: "All of Statistics: A Concise Course in Statistical Inference",
      authors: "Larry Wasserman",
      url: "https://link.springer.com/book/10.1007/978-0-387-21736-9",
      type: "textbook"
    },
    {
      title: "An Introduction to the Bootstrap",
      authors: "Bradley Efron and Robert J. Tibshirani",
      url: "https://www.routledge.com/An-Introduction-to-the-Bootstrap/Efron-Tibshirani/p/book/9780412042317",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: "Small Sample Sizes in Bootstrap",
      description: "When the sample size $n$ is very small (e.g., $n < 15$), the empirical distribution of the sample is a poor representation of the population, leading to severely biased bootstrap confidence intervals.",
      mitigation: "Use parametric bootstrap or asymptotic theory when $n$ is small, or gather more data."
    }
  ],
  pros: [
    "Provides a mathematical framework for quantifying uncertainty.",
    "Bootstrap requires no parametric assumptions about the underlying distribution.",
    "Crucial for evaluating A/B test results and model performance differences."
  ],
  cons: [
    "Highly dependent on the assumption that samples are representative (i.e., independent and identically distributed).",
    "Hypothesis testing can be prone to p-hacking if protocols are not strictly followed."
  ],
  intuition: "Imagine you want to know the average height of everyone in a city. Measuring everyone is impossible. Instead, you measure 100 random people. The average of those 100 people is your *point estimate*. But how sure are you that this sample average matches the true city-wide average? Statistics and estimation provide the tools to put error bars on your guess, allowing you to say not just 'it is 172 cm' but 'we are 95% confident the true average is between 170.4 cm and 173.6 cm'.",
  mathematics: "### Sample Mean and Variance\n\nGiven a sample of observations $X_1, X_2, \\dots, X_n$ drawn from a population, the sample mean $\\bar{X}$ is:\n$$\\bar{X} = \\frac{1}{n} \\sum_{i=1}^{n} X_i$$\n\nThe sample variance $S^2$, which uses Bessel's correction ($n-1$) to remain unbiased, is:\n$$S^2 = \\frac{1}{n-1} \\sum_{i=1}^{n} (X_i - \\bar{X})^2$$\n\n### Central Limit Theorem (CLT)\n\nThe Central Limit Theorem states that for independent and identically distributed (i.i.d.) random variables with mean $\\mu$ and variance $\\sigma^2$, as $n \\to \\infty$, the sampling distribution of the sample mean converges to a normal distribution:\n$$\\bar{X}_n \\sim \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{n}\\right)$$\n\nThis standard deviation of the sample mean is the **Standard Error (SE)**:\n$$SE = \\frac{\\sigma}{\\sqrt{n}}$$\n\n### Confidence Intervals\n\nA $1 - \\alpha$ confidence interval for $\\mu$ is constructed as:\n$$\\bar{X} \\pm z_{1-\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}$$\nwhere $z_{1-\\alpha/2}$ is the critical value from the standard normal distribution. When the population standard deviation $\\sigma$ is unknown, we substitute the sample standard deviation $S$ and use Student's t-distribution critical value $t_{1-\\alpha/2, n-1}$.\n\n### The Bootstrap Method\n\nWhen analytical formulas for standard errors are unavailable (e.g., for the median or ratio estimators), we resample:\n1. Draw $n$ observations from the sample *with replacement* to form a bootstrap sample $X^{*b}$.\n2. Compute the statistic of interest $\\theta^{*b}$ on this sample.\n3. Repeat $B$ times (e.g., $B=1000$) to get $\\theta^{*1}, \\dots, \\theta^{*B}$.\n4. Estimate the standard error as the sample standard deviation of $\\theta^{*b}$.",
  fullDescription: "Estimation theory is a branch of statistics that deals with estimating the values of parameters based on measured empirical data. Point estimation calculates a single value, whereas interval estimation calculates a range of values. In machine learning, estimation is used everywhere, from training models (e.g., estimating weights that minimize loss) to validating them (e.g., calculating confidence intervals around accuracy scores via cross-validation or bootstrapping).\n\nThis module covers both parametric estimation (where we assume a specific probability distribution family) and non-parametric estimation (like bootstrap resampling), which has become a cornerstone of modern data analysis due to its flexibility and lack of restrictive assumptions.",
  codeSnippet: `/**
 * Computes sample mean, variance, and standard deviation
 */
export function calculateSampleStats(data: number[]): {
  mean: number;
  variance: number;
  stdDev: number;
} {
  const n = data.length;
  if (n === 0) throw new Error("Dataset cannot be empty");

  const mean = data.reduce((sum, val) => sum + val, 0) / n;

  if (n === 1) {
    return { mean, variance: 0, stdDev: 0 };
  }

  const sqDiffs = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  const variance = sqDiffs / (n - 1); // Bessel's correction
  const stdDev = Math.sqrt(variance);

  return { mean, variance, stdDev };
}

/**
 * Performs Bootstrap resampling to estimate the mean standard error
 */
export function bootstrapMeanSE(
  data: number[],
  numBootstrapSamples: number = 1000,
  seed: number = 42
): number {
  const n = data.length;
  if (n === 0) return 0;

  // Deterministic seeded random helper
  let state = seed | 0;
  function nextRandom(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  const bootstrapMeans: number[] = [];

  for (let b = 0; b < numBootstrapSamples; b++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(nextRandom() * n);
      sum += data[idx];
    }
    bootstrapMeans.push(sum / n);
  }

  const stats = calculateSampleStats(bootstrapMeans);
  return stats.stdDev; // Standard error of the bootstrapped mean
}`,
  relatedModules: ["probability-theory", "maximum-likelihood", "bayesian-inference"]
};
