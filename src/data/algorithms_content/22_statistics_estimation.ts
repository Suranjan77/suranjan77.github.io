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
  relatedModules: ["probability-theory", "maximum-likelihood", "bayesian-inference"],
  tldr: [
    'A **point estimator** is a function of the sample (a random variable) used to guess an unknown population parameter; its **standard error** is the standard deviation of its sampling distribution.',
    'The **sample mean** is an unbiased estimator of $\\mu$ with variance $\\sigma^2/n$, so its standard error is $\\sigma/\\sqrt{n}$ — uncertainty shrinks only as $\\sqrt{n}$.',
    'Sample variance divides by $n-1$ (**Bessel’s correction**) instead of $n$ precisely so that $\\mathbb{E}[S^2] = \\sigma^2$, correcting the downward bias from using $\\bar{X}$ in place of the true $\\mu$.',
    'A **95% confidence interval** is a statement about the procedure: across many samples, 95% of such intervals cover the true parameter. It is **not** a 95% probability that this particular interval contains $\\mu$.',
    'Estimators trade off **bias** and **variance**; mean squared error decomposes as $\\text{MSE} = \\text{bias}^2 + \\text{variance}$, so a slightly biased estimator can beat an unbiased one.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: The Sample Mean is Unbiased with Variance $\\sigma^2/n$',
      content: `
Let $X_1, \\dots, X_n$ be i.i.d. with $\\mathbb{E}[X_i] = \\mu$ and $\\operatorname{Var}(X_i) = \\sigma^2$. The estimator is $\\bar{X} = \\frac{1}{n}\\sum_{i=1}^n X_i$.

**Unbiasedness.** By linearity of expectation:

$$ \\mathbb{E}[\\bar{X}] = \\mathbb{E}\\!\\left[\\frac{1}{n}\\sum_{i=1}^n X_i\\right] = \\frac{1}{n}\\sum_{i=1}^n \\mathbb{E}[X_i] = \\frac{1}{n}\\cdot n\\mu = \\mu $$

So the sample mean is **unbiased**: on average it equals the population mean.

**Variance.** Because the $X_i$ are independent, the variance of a sum is the sum of variances, and constants pull out squared:

$$ \\operatorname{Var}(\\bar{X}) = \\operatorname{Var}\\!\\left(\\frac{1}{n}\\sum_{i=1}^n X_i\\right) = \\frac{1}{n^2}\\sum_{i=1}^n \\operatorname{Var}(X_i) = \\frac{1}{n^2}\\cdot n\\sigma^2 = \\frac{\\sigma^2}{n} $$

Taking the square root gives the **standard error** $SE = \\sigma/\\sqrt{n}$. The crucial consequence: to halve the standard error you must **quadruple** the sample size, since uncertainty falls only as $\\sqrt{n}$.
      `,
    },
    {
      heading: 'Derivation: Why Sample Variance Divides by $n-1$ (Bessel’s Correction)',
      content: `
A natural-looking variance estimator divides the squared deviations by $n$. We show this version is biased and that dividing by $n-1$ fixes it. Start from the algebraic identity, for any constant $\\mu$:

$$ \\sum_{i=1}^n (X_i - \\bar{X})^2 = \\sum_{i=1}^n (X_i - \\mu)^2 - n(\\bar{X} - \\mu)^2 $$

Take expectations of each term. Using $\\mathbb{E}[(X_i - \\mu)^2] = \\sigma^2$ and the result above that $\\mathbb{E}[(\\bar{X} - \\mu)^2] = \\operatorname{Var}(\\bar{X}) = \\sigma^2/n$:

$$ \\mathbb{E}\\!\\left[\\sum_{i=1}^n (X_i - \\bar{X})^2\\right] = n\\sigma^2 - n\\cdot\\frac{\\sigma^2}{n} = (n-1)\\sigma^2 $$

Dividing by $n$ would give $\\frac{n-1}{n}\\sigma^2 < \\sigma^2$ — a systematic **underestimate**. Dividing instead by $n-1$ yields an unbiased estimator:

$$ \\mathbb{E}[S^2] = \\mathbb{E}\\!\\left[\\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2\\right] = \\sigma^2 $$

Intuitively, the deviations are taken around $\\bar{X}$ (which is itself fit to the data and sits closer to the points than the unknown $\\mu$ does), so we lose one **degree of freedom**; dividing by $n-1$ compensates for it.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'Compute the sample mean $\\bar{x}$ and the (Bessel-corrected) sample variance $s^2$ of the dataset $\\{2, 4, 4, 6, 9\\}$.',
      difficulty: 'warm-up',
      hint: 'Use $\\bar{x} = \\frac{1}{n}\\sum x_i$ and $s^2 = \\frac{1}{n-1}\\sum (x_i - \\bar{x})^2$ with $n = 5$.',
      solution: 'Mean: $\\bar{x} = (2+4+4+6+9)/5 = 25/5 = 5$. Squared deviations: $(2-5)^2 = 9$, $(4-5)^2 = 1$, $(4-5)^2 = 1$, $(6-5)^2 = 1$, $(9-5)^2 = 16$, summing to $28$. Sample variance $s^2 = 28/(5-1) = 28/4 = 7$, and the sample standard deviation is $s = \\sqrt{7} \\approx 2.65$.',
    },
    {
      prompt: 'A sample of $n = 64$ measurements has standard deviation $s = 12$. Compute the standard error of the mean.',
      difficulty: 'warm-up',
      solution: 'The standard error of the mean is $SE = s/\\sqrt{n} = 12/\\sqrt{64} = 12/8 = 1.5$. Note this is much smaller than the spread of individual data points ($s = 12$): the mean of many observations is far more stable than any single observation.',
    },
    {
      prompt: 'A sample of $n = 49$ light bulbs has mean lifetime $\\bar{x} = 1200$ hours with sample standard deviation $s = 140$ hours. Construct an approximate 95% confidence interval for the population mean lifetime.',
      difficulty: 'core',
      hint: 'With $n$ moderately large, use $z^* = 1.96$ and the interval $\\bar{x} \\pm z^* \\cdot s/\\sqrt{n}$.',
      solution: 'Standard error: $SE = s/\\sqrt{n} = 140/\\sqrt{49} = 140/7 = 20$ hours. Margin of error: $ME = z^* \\cdot SE = 1.96 \\times 20 = 39.2$ hours. The 95% confidence interval is $1200 \\pm 39.2 = [1160.8,\\ 1239.2]$ hours. Interpretation: the procedure that generated this interval covers the true mean 95% of the time.',
    },
    {
      prompt: 'Consider estimating the population variance $\\sigma^2$ with the divide-by-$n$ estimator $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum (X_i - \\bar{X})^2$. Is it biased? If so, in which direction, and what is its expected value?',
      difficulty: 'challenge',
      hint: 'Recall that $\\mathbb{E}\\big[\\sum (X_i - \\bar{X})^2\\big] = (n-1)\\sigma^2$.',
      solution: 'Yes, it is biased. Since $\\mathbb{E}\\big[\\sum (X_i - \\bar{X})^2\\big] = (n-1)\\sigma^2$, we get $\\mathbb{E}[\\hat{\\sigma}^2] = \\frac{1}{n}(n-1)\\sigma^2 = \\frac{n-1}{n}\\sigma^2$. Because $\\frac{n-1}{n} < 1$, this estimator systematically **underestimates** $\\sigma^2$ (a downward bias of $-\\sigma^2/n$). The bias vanishes as $n \\to \\infty$, so it is asymptotically unbiased, but for finite $n$ the $n-1$ divisor is preferred when unbiasedness matters.',
    },
  ],
  comparisons: [
    {
      title: 'Point Estimate vs Confidence Interval',
      methods: ['Point Estimate', 'Confidence Interval'],
      rows: [
        {
          dimension: 'What it reports',
          values: ['A single best-guess value, e.g. $\\bar{x} = 172$', 'A range $[L, U]$ plus a confidence level, e.g. $[170.4, 173.6]$ at 95%'],
        },
        {
          dimension: 'Conveys uncertainty?',
          values: ['No — gives no sense of precision on its own', 'Yes — width reflects sample size and variability'],
        },
        {
          dimension: 'Effect of larger $n$',
          values: ['Becomes more accurate but looks identical in form', 'Interval narrows in proportion to $1/\\sqrt{n}$'],
        },
        {
          dimension: 'Correct interpretation',
          values: ['The realized value of an estimator (ideally unbiased)', 'A coverage claim about the procedure, not a probability for this specific interval'],
        },
        {
          dimension: 'Use it when',
          values: ['You need one number to act on or feed downstream', 'You must communicate or reason about uncertainty'],
        },
      ],
      takeaway: 'A point estimate answers "what is our best guess?"; a confidence interval answers "how sure are we?" Report both — a point estimate without an interval hides the uncertainty.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need to **quantify uncertainty** around a sample statistic — error bars on an accuracy score, a polling result, or an A/B-test lift.',
      'Samples are (approximately) **i.i.d.** and the sample size is large enough for the Central Limit Theorem to make $\\bar{X}$ roughly normal.',
      'You want a **distribution-free** estimate of a standard error for an awkward statistic (median, ratio, correlation) — reach for the **bootstrap**.',
    ],
    avoidWhen: [
      'Observations are **strongly dependent** (time series, clustered, or autocorrelated data) — naive standard errors will be far too small.',
      'The sample is **tiny or non-representative** — confidence intervals and bootstrap estimates become unreliable and badly biased.',
      'You are tempted to run **many tests and report only the significant ones** (p-hacking) — nominal error rates no longer hold without correction.',
    ],
    rulesOfThumb: [
      'Standard error scales as $1/\\sqrt{n}$: to halve it, quadruple the data.',
      'Use the t-distribution (not z) when $\\sigma$ is unknown and $n$ is small (roughly $n < 30$); the two converge for large $n$.',
      'Prefer 1000+ bootstrap resamples for a stable standard error, and many more (10000+) for stable interval endpoints.',
    ],
  },
  caseStudies: [
    {
      title: 'The margin of error in a political poll',
      domain: 'Survey statistics / polling',
      scenario: 'A national poll surveys $n = 1000$ randomly sampled likely voters and finds that $52\\%$ support a candidate. The reported headline includes the familiar phrase "margin of error of about plus or minus 3 percentage points."',
      approach: 'For a proportion $\\hat{p}$, the standard error is $SE = \\sqrt{\\hat{p}(1-\\hat{p})/n}$, which is largest near $\\hat{p} = 0.5$. The 95% margin of error is $1.96 \\times SE$. The worst-case ($\\hat{p}=0.5$) gives $SE = \\sqrt{0.25/1000} \\approx 0.0158$, so $ME \\approx 1.96 \\times 0.0158 \\approx 0.031$.',
      outcome: 'The margin of error is about $\\pm 3.1\\%$, yielding a 95% confidence interval of roughly $[48.9\\%,\\ 55.1\\%]$ for true support. Because the interval includes $50\\%$, the poll cannot confidently declare a lead. The general rule of thumb falls out directly: $1/\\sqrt{n} = 1/\\sqrt{1000} \\approx 3.2\\%$, which is why $n \\approx 1000$ is the industry-standard sample size for a roughly $\\pm 3\\%$ poll.',
      source: {
        title: 'All of Statistics: A Concise Course in Statistical Inference',
        authors: 'Larry Wasserman',
        url: 'https://link.springer.com/book/10.1007/978-0-387-21736-9',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'A study reports a 95% confidence interval of $[170.4, 173.6]$ cm for the mean height. Which interpretation is correct?',
      options: [
        { text: 'If we repeated the sampling procedure many times, about 95% of the intervals so constructed would contain the true mean.', correct: true },
        { text: 'There is a 95% probability that the true mean lies between 170.4 and 173.6 cm.', correct: false },
        { text: '95% of individual people have heights between 170.4 and 173.6 cm.', correct: false },
        { text: 'The sample mean has a 95% chance of falling in this interval.', correct: false },
      ],
      explanation: 'The true mean is a fixed constant, so this specific interval either contains it or not — there is no probability attached to this realized interval. The 95% is a property of the **procedure**: across many samples, 95% of the intervals it produces cover the parameter. It says nothing about the spread of individuals or the sample mean.',
    },
    {
      question: 'Why does the sample variance $S^2$ divide by $n - 1$ rather than $n$?',
      options: [
        { text: 'Dividing by $n-1$ makes $\\mathbb{E}[S^2] = \\sigma^2$, correcting the downward bias from measuring deviations around $\\bar{X}$ instead of the unknown $\\mu$.', correct: true },
        { text: 'Dividing by $n-1$ always makes the variance larger, which is safer.', correct: false },
        { text: 'It is required so that the standard deviation is never zero.', correct: false },
        { text: 'Because one data point is always discarded as an outlier.', correct: false },
      ],
      explanation: 'Deviations are taken around the sample mean $\\bar{X}$, which is fit to the data and lies closer to the points than the true $\\mu$. This makes the sum of squared deviations too small in expectation, $(n-1)\\sigma^2$ rather than $n\\sigma^2$. Dividing by $n-1$ (one lost degree of freedom) exactly removes the bias.',
    },
    {
      question: 'What is the difference between the standard deviation and the standard error of the mean?',
      options: [
        { text: 'Standard deviation measures the spread of individual observations; standard error measures the spread of the sample mean and equals $\\sigma/\\sqrt{n}$.', correct: true },
        { text: 'They are two names for the same quantity.', correct: false },
        { text: 'Standard error measures spread of the data; standard deviation measures spread of the mean.', correct: false },
        { text: 'Standard error is always larger than the standard deviation.', correct: false },
      ],
      explanation: 'The standard deviation $\\sigma$ describes variability among individual data points. The standard error $\\sigma/\\sqrt{n}$ describes variability of the **estimator** (the sample mean) and shrinks as $n$ grows. Since $\\sqrt{n} \\geq 1$, the standard error is never larger than the standard deviation.',
    },
    {
      question: 'Estimator A is unbiased with variance 10. Estimator B has a small bias but variance 2, giving a lower mean squared error. Which statement is true?',
      options: [
        { text: 'B can be preferable: MSE decomposes as $\\text{bias}^2 + \\text{variance}$, so a slightly biased, low-variance estimator can beat an unbiased one.', correct: true },
        { text: 'A is always better because unbiased estimators are optimal by definition.', correct: false },
        { text: 'B is invalid because a useful estimator must be unbiased.', correct: false },
        { text: 'Bias and variance cannot be traded off against each other.', correct: false },
      ],
      explanation: 'Mean squared error equals $\\text{bias}^2 + \\text{variance}$, so reducing variance can lower overall error even at the cost of some bias. Unbiasedness is not the sole criterion for a good estimator — this bias-variance tradeoff underlies techniques like regularization and shrinkage.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
