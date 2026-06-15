import { LearningModule } from "./types";

export const maximumLikelihood: LearningModule = {
  id: "maximum-likelihood",
  title: "Maximum Likelihood Estimation",
  category: "Maximum Likelihood",
  prerequisites: ['probability-theory'],
  tracks: ['foundations'],
  difficulty: 2,
  relatedModules: ['bayesian-inference'],
  shortDescription: "A mathematical way to figure out the most likely rules of a game just by looking at the final score.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Define the likelihood function for a given probability model',
    'Explain why log-likelihood is used instead of standard likelihood',
    'Derive maximum likelihood estimators for simple distributions (like Bernoulli or Normal)',
    'Solve parameter estimation problems using optimization or analytical methods',
  ],
  keyTerms: [
    { term: 'Likelihood', definition: 'The probability of observing the given data as a function of the model parameters.' },
    { term: 'Log-Likelihood', definition: 'The natural logarithm of the likelihood function, used to simplify derivatives and avoid numeric underflow.' },
    { term: 'Parameter', definition: 'A configuration variable internal to the model whose value is estimated from data.' },
  ],
  workedExamples: [
    {
      title: 'MLE of a Bernoulli Trial',
      problem: 'Given $k$ successes out of $n$ independent trials, find the MLE of the success probability $p$.',
      solution: 'Likelihood $\\mathcal{L}(p) = p^k(1-p)^{n-k}$. Log-likelihood $\\ln \\mathcal{L}(p) = k \\ln p + (n-k) \\ln(1-p)$. Take derivative and set to zero: $\\frac{k}{p} - \\frac{n-k}{1-p} = 0 \\implies k(1-p) = (n-k)p \\implies k - kp = np - kp \\implies p = \\frac{k}{n}$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Likelihood is the same as probability.',
      correction: 'Probability calculates the chance of data given fixed parameters. Likelihood evaluates how likely different parameters are given the fixed observed data.'
    },
    {
      claim: 'MLE always yields unbiased estimators.',
      correction: 'MLE can be biased for small samples, e.g. the MLE estimator of variance $\\sigma^2$ is biased by a factor of $\\frac{n-1}{n}$.'
    }
  ],
  references: [
    {
      title: "Pattern Recognition and Machine Learning",
      authors: "Bishop, C. M",
      url: "https://www.springer.com",
      type: "textbook"
    },
    {
      title: "On the Mathematical Foundations of Theoretical Statistics",
      authors: "Fisher, R. A",
      url: "https://royalsocietypublishing.org",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Overfitting on Small Data',
      description: 'With very few observations, MLE can assign extreme probabilities (e.g., estimating coin bias as 100% heads after 2 flips).',
      mitigation: 'Use Bayesian estimation (MAP) or add prior regularization.'
    }
  ],

  fullDescription: `
Maximum Likelihood Estimation (MLE) is a core concept in statistics and machine learning. It answers a very simple question: "Given the data we just saw, what are the most likely rules that created it?" It's the mathematical engine behind how many algorithms learn from data, from simple trend lines to massive neural networks.

### Where is it used?
MLE is incredibly useful when you have a good guess about the general "shape" of your data (like a bell curve), but you don't know the exact details (like where the center of the curve is). It's used everywhere: figuring out the error rate of a factory machine, calculating the true conversion rate of a new website button in an A/B test, or predicting how long a lightbulb will last before burning out.
  `,

  intuition: `
Imagine you find a weird, weighted coin on the ground. You flip it 10 times, and it lands on heads 7 times. What's your best guess for the true probability of this coin landing on heads?

MLE says your best guess is exactly 70% (or 0.7). Why? Because if the true probability was 0.7, that makes the data you actually saw (7 heads out of 10) more likely to happen than if the probability was 0.5, or 0.9, or anything else. MLE simply finds the exact numbers that make your real-world observations the most mathematically probable outcome.
  `,

  mathematics: `
### 1. The Likelihood Function
Let's say we have a bunch of data points $X = \\{x_1, x_2, \\dots, x_n\\}$. We assume these data points come from some probability distribution (like a bell curve) that is controlled by some unknown settings, which we call parameters $\\theta$. 

The "Likelihood" of those parameters, given the data we saw, is calculated by multiplying the probability of seeing each individual data point:

$$ \\mathcal{L}(\\theta | X) = \\prod_{i=1}^{n} P(x_i | \\theta) $$

### 2. Log-Likelihood
Multiplying a bunch of tiny probabilities together (like $0.01 \\times 0.05 \\times 0.02$) quickly results in numbers so small that computers round them down to zero. Plus, multiplying is annoying to do calculus on. 

To fix this, we take the logarithm of the whole thing. In math, the log of a product becomes the sum of the logs. This turns our multiplication problem into an addition problem, which is much easier for computers to handle:

$$ \\log \\mathcal{L}(\\theta | X) = \\sum_{i=1}^{n} \\log P(x_i | \\theta) $$

### 3. Finding the Maximum
The Maximum Likelihood Estimate (MLE), written as $\\hat{\\theta}_{\\text{MLE}}$, is simply the parameter value that makes that log-likelihood equation as big as possible:

$$ \\hat{\\theta}_{\\text{MLE}} = \\arg\\max_{\\theta} \\log \\mathcal{L}(\\theta | X) $$

To find this peak, we use calculus. We take the derivative of the log-likelihood equation, set it to zero, and solve for $\\theta$:

$$ \\frac{\\partial}{\\partial \\theta} \\sum_{i=1}^{n} \\log P(x_i | \\theta) = 0 $$

### Example: Flipping a Coin
For a coin flip with probability $p$ of getting heads, the math for a single flip is $P(x_i | p) = p^{x_i}(1-p)^{1-x_i}$. The log-likelihood for a bunch of flips is:

$$ \\log \\mathcal{L}(p) = \\sum_{i=1}^n \\left[ x_i \\log p + (1-x_i) \\log(1-p) \\right] $$

If you do the calculus (take the derivative and set it to zero), the math perfectly proves that your best guess for $p$ is just the average number of heads you saw: $\\hat{p} = \\frac{1}{n} \\sum_{i=1}^n x_i$.
  `,

  pros: [
    "It's mathematically proven to give you the most accurate possible estimate as you get more and more data.",
    "It's the foundation for how we measure errors in machine learning (for example, Mean Squared Error is just MLE in disguise).",
    "It's consistent—if you transform the math, the best estimate transforms perfectly with it."
  ],

  cons: [
    "If you only have a tiny amount of data, MLE can make terrible, overconfident guesses (overfitting).",
    "It completely relies on you guessing the right 'shape' for your data. If you assume the data is a bell curve, but it's actually something else, MLE will give you the wrong answer.",
    "For really complex AI models, finding the exact maximum point using calculus is incredibly difficult or impossible."
  ],

  codeSnippet: `import numpy as np
from scipy.optimize import minimize

data = np.array([2.3, 1.9, 2.5, 2.8, 1.7])

def neg_log_likelihood(params):
    mu, sigma = params
    if sigma <= 0: return np.inf
    n = len(data)
    # Minimizing negative log-likelihood is the same as maximizing log-likelihood
    ll = - (n/2)*np.log(2*np.pi) - n*np.log(sigma) - np.sum((data - mu)**2)/(2*sigma**2)
    return -ll

result = minimize(neg_log_likelihood, [0.0, 1.0])
mu_est, sigma_est = result.x

print(f"MLE Derived Mean: {mu_est:.2f}")
print(f"MLE Derived Std Dev: {sigma_est:.2f}")`,
  tldr: [
    'Maximum Likelihood Estimation picks the parameters $\\theta$ that make the **observed data most probable**: $\\hat{\\theta} = \\arg\\max_\\theta \\mathcal{L}(\\theta \\mid X)$.',
    'We maximize the **log**-likelihood $\\sum_i \\log P(x_i \\mid \\theta)$ instead of the raw product — it turns multiplication into addition, avoids numeric underflow, and shares the same maximizer.',
    'For a Bernoulli/coin, the MLE of $p$ is just the **sample proportion** $\\hat{p} = k/n$; for a Gaussian, the MLE of the mean is the **sample mean**.',
    'MLE is **consistent and asymptotically efficient** (best possible as $n \\to \\infty$), but can **overfit on small samples**, giving overconfident estimates like $\\hat{p} = 1$ after two heads.',
    'Adding a prior turns MLE into **MAP** (a point estimate) or **full Bayesian** inference (a whole posterior distribution) — MLE is the special case of a flat prior.',
    'Many ML losses are negative log-likelihoods in disguise: **cross-entropy** trains classifiers and language models, and **MSE** is the Gaussian-noise MLE.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: MLE of the Bernoulli Parameter $p$',
      content: `
Suppose we observe $n$ independent coin flips $x_1, \\dots, x_n$ where each $x_i \\in \\{0, 1\\}$ and $k = \\sum_i x_i$ is the number of heads. Each flip has probability mass $P(x_i \\mid p) = p^{x_i}(1-p)^{1-x_i}$, so the likelihood is the product:

$$ \\mathcal{L}(p) = \\prod_{i=1}^{n} p^{x_i}(1-p)^{1-x_i} = p^{k}(1-p)^{n-k} $$

**Why the log?** Maximizing a product of many probabilities is numerically dangerous — the value shrinks toward zero and underflows — and the product rule makes the derivative awkward. Because $\\log$ is strictly increasing, the value of $p$ that maximizes $\\mathcal{L}(p)$ is the *same* value that maximizes $\\log \\mathcal{L}(p)$, and the logarithm turns the product into a sum:

$$ \\ell(p) = \\log \\mathcal{L}(p) = k \\log p + (n-k)\\log(1-p) $$

Differentiate with respect to $p$ and set the derivative to zero:

$$ \\frac{d\\ell}{dp} = \\frac{k}{p} - \\frac{n-k}{1-p} = 0 $$

Multiply through by $p(1-p)$:

$$ k(1-p) - (n-k)p = 0 \\;\\Rightarrow\\; k - kp - np + kp = 0 \\;\\Rightarrow\\; k = np $$

$$ \\boxed{\\hat{p}_{\\text{MLE}} = \\frac{k}{n}} $$

The second derivative $\\ell''(p) = -k/p^2 - (n-k)/(1-p)^2 < 0$, confirming this stationary point is a **maximum**. So the MLE of a coin bias is simply the fraction of flips that came up heads.
      `,
    },
    {
      heading: 'Derivation: Gaussian MLE for the Mean is the Sample Mean',
      content: `
Assume $x_1, \\dots, x_n$ are drawn independently from a Gaussian $\\mathcal{N}(\\mu, \\sigma^2)$ with known variance $\\sigma^2$. The density of one point is:

$$ P(x_i \\mid \\mu) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\!\\left(-\\frac{(x_i - \\mu)^2}{2\\sigma^2}\\right) $$

Taking the log of the joint likelihood turns the product into a sum and cancels the exponential:

$$ \\ell(\\mu) = \\sum_{i=1}^{n} \\log P(x_i \\mid \\mu) = -\\frac{n}{2}\\log(2\\pi\\sigma^2) - \\frac{1}{2\\sigma^2}\\sum_{i=1}^{n}(x_i - \\mu)^2 $$

Only the last term depends on $\\mu$, so maximizing $\\ell(\\mu)$ is the same as **minimizing the sum of squared errors** $\\sum_i (x_i - \\mu)^2$ — this is exactly why squared-error loss corresponds to a Gaussian-noise assumption. Differentiate and set to zero:

$$ \\frac{d\\ell}{d\\mu} = \\frac{1}{\\sigma^2}\\sum_{i=1}^{n}(x_i - \\mu) = 0 \\;\\Rightarrow\\; \\sum_{i=1}^{n} x_i = n\\mu $$

$$ \\boxed{\\hat{\\mu}_{\\text{MLE}} = \\frac{1}{n}\\sum_{i=1}^{n} x_i = \\bar{x}} $$

If we also maximize over $\\sigma^2$, the MLE is $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum_i (x_i - \\bar{x})^2$ — which divides by $n$, not $n-1$, and is therefore **biased low** for small samples (it underestimates the true spread).
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A coin is flipped 5 times giving the sequence H, H, T, H, T. Write down the likelihood $\\mathcal{L}(p)$ as a function of the head probability $p$.',
      difficulty: 'warm-up',
      hint: 'Count the heads and tails, then use $\\mathcal{L}(p) = p^{k}(1-p)^{n-k}$.',
      solution: 'There are $k = 3$ heads and $n - k = 2$ tails out of $n = 5$ flips. Since the flips are independent, the likelihood is $\\mathcal{L}(p) = p^3 (1-p)^2$.',
    },
    {
      prompt: 'Using the same data (3 heads in 5 flips), derive the maximum likelihood estimate $\\hat{p}$ and give its numeric value.',
      difficulty: 'core',
      hint: 'Take the log, differentiate, and set the result to zero.',
      solution: 'Log-likelihood: $\\ell(p) = 3\\log p + 2\\log(1-p)$. Derivative: $\\ell\'(p) = \\frac{3}{p} - \\frac{2}{1-p} = 0 \\Rightarrow 3(1-p) = 2p \\Rightarrow 3 = 5p$. So $\\hat{p} = 3/5 = 0.6$, exactly the observed proportion of heads.',
    },
    {
      prompt: 'You observe the four values $4, 6, 8, 10$ assumed drawn from a Gaussian. Compute the MLE of the mean $\\hat{\\mu}$ and the MLE of the variance $\\hat{\\sigma}^2$.',
      difficulty: 'core',
      hint: 'The Gaussian MLE for the mean is the sample mean; for the variance it divides by $n$, not $n-1$.',
      solution: 'Mean: $\\hat{\\mu} = (4+6+8+10)/4 = 28/4 = 7$. Squared deviations: $(4-7)^2 + (6-7)^2 + (8-7)^2 + (10-7)^2 = 9 + 1 + 1 + 9 = 20$. MLE variance divides by $n = 4$: $\\hat{\\sigma}^2 = 20/4 = 5$ (the unbiased sample variance would divide by $n-1 = 3$, giving $\\approx 6.67$).',
    },
    {
      prompt: 'Show that maximizing the likelihood $\\mathcal{L}(\\theta)$ and maximizing the log-likelihood $\\log \\mathcal{L}(\\theta)$ always give the same $\\hat{\\theta}$, and explain why MLE can fail badly after flipping a coin only twice and seeing two heads.',
      difficulty: 'challenge',
      hint: 'Use the fact that $\\log$ is a strictly increasing (monotone) function, then apply $\\hat{p} = k/n$ to $k = n = 2$.',
      solution: 'Because $\\log$ is strictly increasing, $\\mathcal{L}(\\theta_1) > \\mathcal{L}(\\theta_2)$ if and only if $\\log \\mathcal{L}(\\theta_1) > \\log \\mathcal{L}(\\theta_2)$. The ordering of every parameter value is preserved, so the argmax is identical — only the curve\'s height changes, not where its peak sits. For the coin, $\\hat{p} = k/n = 2/2 = 1$, claiming the coin can *never* land tails. With only two observations MLE overfits, assigning probability zero to an outcome that is clearly possible. A prior (MAP/Bayesian smoothing, e.g. Laplace add-one) pulls the estimate toward $1/2$ and fixes this.',
    },
  ],
  comparisons: [
    {
      title: 'MLE vs MAP vs Full Bayesian',
      methods: ['MLE', 'MAP', 'Full Bayesian'],
      rows: [
        {
          dimension: 'Uses a prior?',
          values: ['No — flat/uninformative prior', 'Yes — combines prior with likelihood', 'Yes — prior is integrated over'],
        },
        {
          dimension: 'What you get',
          values: ['Single point estimate $\\hat{\\theta}$', 'Single point estimate (posterior mode)', 'Full posterior distribution $P(\\theta \\mid X)$'],
        },
        {
          dimension: 'Behaviour on small data',
          values: ['Overfits — overconfident extremes', 'Regularized — prior pulls toward sensible values', 'Most robust — uncertainty stays explicit'],
        },
        {
          dimension: 'Quantifies uncertainty?',
          values: ['No', 'No — just a point', 'Yes — credible intervals from the posterior'],
        },
        {
          dimension: 'Computational cost',
          values: ['Cheapest — often closed form', 'Cheap — like MLE plus a penalty', 'Most expensive — integration / MCMC / variational'],
        },
      ],
      takeaway: 'MLE is the flat-prior special case of MAP; MAP adds regularization through a prior but still returns one number, while full Bayesian inference keeps the entire distribution at a higher computational cost.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You have a **reasonable amount of data** and a trusted parametric model (Bernoulli, Gaussian, Poisson, etc.) for how it was generated.',
      'You want a fast, **principled point estimate** with strong large-sample guarantees (consistency, asymptotic efficiency).',
      'You are fitting standard ML models — logistic regression, linear regression, language models — whose training objectives **are** negative log-likelihoods.',
    ],
    avoidWhen: [
      'You have **very few observations**, where MLE overfits and produces overconfident extremes — prefer MAP or a Bayesian posterior.',
      'You need **calibrated uncertainty** or credible intervals rather than a single number — use full Bayesian inference.',
      'You **cannot trust the assumed distribution**; a badly misspecified model makes the MLE confidently wrong.',
    ],
    rulesOfThumb: [
      'Always maximize the **log**-likelihood, and in code minimize the *negative* log-likelihood for numerical stability.',
      'If an estimate hits a hard boundary (like $\\hat{p} = 0$ or $1$), that is a red flag for too little data — add smoothing or a prior.',
      'Remember the bias correction: the unbiased variance divides by $n-1$, while the raw MLE divides by $n$.',
    ],
  },
  caseStudies: [
    {
      title: 'Cross-entropy: MLE as the engine behind logistic regression and language models',
      domain: 'Machine learning / NLP',
      scenario: 'A team trains a binary classifier (and, more broadly, a next-token language model) and needs a loss function. They want the parameters that make the **observed labels / tokens most probable** under the model.',
      approach: 'They frame training as maximum likelihood: each label is a Bernoulli (or categorical) outcome, so the log-likelihood of the dataset is $\\sum_i [y_i \\log \\hat{p}_i + (1-y_i)\\log(1-\\hat{p}_i)]$. Maximizing this is identical to **minimizing the cross-entropy loss**, because cross-entropy is exactly the *negative* log-likelihood of a categorical model. Optimization is done by gradient descent rather than a closed form.',
      outcome: 'This single identity — cross-entropy equals negative log-likelihood — is the standard training objective for logistic regression and essentially every modern language model. Concretely, a perfectly confident correct prediction contributes $-\\log(1) = 0$ to the loss, while a confident wrong prediction ($\\hat{p}_i \\to 0$ for the true class) drives the per-example loss to $+\\infty$, so MLE relentlessly punishes overconfident mistakes. Bishop (Ch. 4) shows the maximum-likelihood logistic regression objective reduces precisely to this cross-entropy error.',
      source: {
        title: 'Pattern Recognition and Machine Learning',
        authors: 'Bishop, C. M',
        url: 'https://www.springer.com',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'Why do we usually maximize the log-likelihood instead of the likelihood itself?',
      options: [
        { text: 'The log turns the product into a sum, avoids numeric underflow, and has the same maximizer.', correct: true },
        { text: 'The log changes which parameter value is optimal, giving a better estimate.', correct: false },
        { text: 'The likelihood cannot be differentiated, but the log-likelihood can.', correct: false },
        { text: 'Taking the log makes the estimator unbiased.', correct: false },
      ],
      explanation: 'Because $\\log$ is strictly increasing, it preserves the location of the maximum — so the argmax is unchanged. Its real value is practical: products of many tiny probabilities underflow to zero, and the log converts the product into a numerically stable, easy-to-differentiate sum. It does not affect bias.',
    },
    {
      question: 'What is the key difference between Maximum Likelihood (MLE) and Maximum A Posteriori (MAP) estimation?',
      options: [
        { text: 'MAP incorporates a prior over the parameters, while MLE uses only the likelihood (a flat prior).', correct: true },
        { text: 'MLE returns a full distribution while MAP returns a single point.', correct: false },
        { text: 'MAP can only be used for Gaussian data, MLE for any distribution.', correct: false },
        { text: 'MLE always overfits while MAP never does.', correct: false },
      ],
      explanation: 'MAP multiplies the likelihood by a prior $P(\\theta)$ and maximizes the posterior, whereas MLE maximizes the likelihood alone — equivalent to MAP with a flat prior. Both return a single point estimate (it is full Bayesian inference that returns a distribution). The prior in MAP acts as regularization, reducing but not eliminating overfitting.',
    },
    {
      question: 'You flip a coin twice and get two heads. What does the MLE estimate for the probability of heads, and what does this reveal?',
      options: [
        { text: '$\\hat{p} = 1.0$, illustrating that MLE overfits and is overconfident on small samples.', correct: true },
        { text: '$\\hat{p} = 0.5$, because coins are assumed fair by default.', correct: false },
        { text: '$\\hat{p} = 0.75$, after smoothing the estimate.', correct: false },
        { text: 'MLE is undefined because the sample is too small.', correct: false },
      ],
      explanation: 'The Bernoulli MLE is $\\hat{p} = k/n = 2/2 = 1.0$, implying tails is impossible — clearly wrong. MLE has no built-in prior to temper extreme estimates, so tiny samples produce overconfident answers. A prior (MAP / Laplace smoothing) would pull the estimate back toward $0.5$.',
    },
    {
      question: 'Why is the cross-entropy loss used to train classifiers and language models considered a maximum likelihood method?',
      options: [
        { text: 'Minimizing cross-entropy is exactly the same as maximizing the log-likelihood of the observed labels.', correct: true },
        { text: 'Cross-entropy adds a prior, making it a Bayesian rather than a likelihood method.', correct: false },
        { text: 'Cross-entropy measures distance in feature space, unrelated to likelihood.', correct: false },
        { text: 'They are unrelated; cross-entropy just happens to work well empirically.', correct: false },
      ],
      explanation: 'Cross-entropy is the *negative* log-likelihood of a Bernoulli/categorical model of the labels. Minimizing it is therefore identical to maximizing the log-likelihood, which is why it is the standard training objective for logistic regression and language models. No prior is involved, so it is MLE rather than Bayesian.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
