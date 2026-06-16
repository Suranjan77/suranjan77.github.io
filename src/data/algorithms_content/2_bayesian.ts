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
print(f"95% Bayesian Credible Interval: [{lower_bound:.2f}, {upper_bound:.2f}]")`,
  tldr: [
    'Bayes’ theorem updates beliefs: the **posterior** is proportional to the **likelihood** times the **prior**, $P(\\theta \\mid X) \\propto P(X \\mid \\theta)\\,P(\\theta)$.',
    'The **prior** encodes what you believe before seeing data; the **posterior** is a full distribution over parameters, not a single number.',
    'With a **conjugate prior** the posterior stays in the same family: a $\\text{Beta}(a, b)$ prior plus $s$ successes and $f$ failures gives a $\\text{Beta}(a+s, b+f)$ posterior.',
    '**MAP** maximizes the posterior (prior $\\times$ likelihood) and equals **MLE** plus a regularizer; full Bayesian inference keeps the whole posterior and its **uncertainty**.',
    'It shines with **small data**, genuine prior knowledge, and a need for calibrated uncertainty, but the **evidence** integral is often intractable and needs MCMC or variational approximations.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Posterior ∝ Likelihood × Prior',
      content: `
Bayes’ theorem follows directly from the definition of conditional probability. For parameters $\\theta$ and observed data $X$, the joint probability can be factored two ways:

$$ P(\\theta, X) = P(\\theta \\mid X)\\,P(X) = P(X \\mid \\theta)\\,P(\\theta) $$

Equating the two factorizations and dividing by $P(X)$ gives Bayes’ theorem:

$$ P(\\theta \\mid X) = \\frac{P(X \\mid \\theta)\\,P(\\theta)}{P(X)} $$

The denominator $P(X) = \\int P(X \\mid \\theta)\\,P(\\theta)\\,d\\theta$ is the **evidence**. Crucially, it does **not** depend on $\\theta$ — it is a single normalizing constant that makes the posterior integrate to one. As a function of $\\theta$, we can therefore drop it and write:

$$ P(\\theta \\mid X) \\propto P(X \\mid \\theta)\\,P(\\theta) $$

In words: **posterior is proportional to likelihood times prior**. This is the workhorse of Bayesian inference. To find the *shape* of the posterior (its mode for MAP, or its relative density) we only ever need the numerator; the evidence is recovered at the end by normalizing. This is exactly why MAP, $\\arg\\max_\\theta P(X \\mid \\theta)P(\\theta)$, never needs the intractable integral.
      `,
    },
    {
      heading: 'Derivation: The Beta-Bernoulli Conjugate Update',
      content: `
Suppose we observe $n$ Bernoulli trials with $s$ successes and $f = n - s$ failures, governed by an unknown success probability $\\theta \\in [0, 1]$. The likelihood is:

$$ P(X \\mid \\theta) = \\theta^{s}(1-\\theta)^{f} $$

We place a $\\text{Beta}(a, b)$ prior, whose density (up to a constant in $\\theta$) is:

$$ P(\\theta) = \\frac{\\theta^{a-1}(1-\\theta)^{b-1}}{B(a, b)} \\propto \\theta^{a-1}(1-\\theta)^{b-1} $$

Multiplying likelihood by prior and keeping only the $\\theta$-dependence:

$$ P(\\theta \\mid X) \\propto \\theta^{s}(1-\\theta)^{f} \\cdot \\theta^{a-1}(1-\\theta)^{b-1} = \\theta^{(a+s)-1}(1-\\theta)^{(b+f)-1} $$

This is the **kernel of a Beta distribution** with new parameters $a + s$ and $b + f$. Because no integration was needed to recognize the family, the Beta prior is **conjugate** to the Bernoulli likelihood:

$$ \\text{Beta}(a, b) \\;\\xrightarrow{\\;s\\text{ successes},\\, f\\text{ failures}\\;}\\; \\text{Beta}(a + s, b + f) $$

The posterior mean of a $\\text{Beta}(\\alpha, \\beta)$ is $\\frac{\\alpha}{\\alpha + \\beta}$, so here:

$$ \\mathbb{E}[\\theta \\mid X] = \\frac{a + s}{(a + s) + (b + f)} = \\frac{a + s}{a + b + s + f} $$

Read this as **pseudo-counts**: the prior contributes $a$ imagined successes and $b$ imagined failures, which are simply added to the real $s$ and $f$. As data accumulates ($s + f \\to \\infty$) the prior’s influence vanishes and the posterior mean approaches the empirical frequency $s / (s + f)$.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'You start with a uniform prior $\\text{Beta}(1, 1)$ on a coin’s probability of heads, then flip it and observe 6 heads and 2 tails. What is the posterior distribution?',
      difficulty: 'warm-up',
      hint: 'A $\\text{Beta}(a, b)$ prior with $s$ successes and $f$ failures updates to $\\text{Beta}(a + s, b + f)$.',
      solution: 'Here $a = 1$, $b = 1$, $s = 6$, $f = 2$. The posterior is $\\text{Beta}(1 + 6,\\; 1 + 2) = \\text{Beta}(7, 3)$. Because the prior was uniform, the posterior is driven entirely by the data, but the pseudo-counts of $1$ and $1$ still nudge the estimate slightly away from the raw fraction $6/8$.',
    },
    {
      prompt: 'Using the $\\text{Beta}(7, 3)$ posterior from the previous exercise, compute the posterior mean probability of heads. Compare it to the maximum likelihood estimate.',
      difficulty: 'core',
      hint: 'The mean of $\\text{Beta}(\\alpha, \\beta)$ is $\\frac{\\alpha}{\\alpha + \\beta}$. The MLE is just the observed frequency.',
      solution: 'Posterior mean $= \\frac{7}{7 + 3} = \\frac{7}{10} = 0.70$. The MLE is the raw frequency $\\frac{s}{s + f} = \\frac{6}{8} = 0.75$. The Bayesian estimate is pulled slightly toward $0.5$ because the uniform prior’s pseudo-counts ($1$ success, $1$ failure) act like a tiny dose of skepticism, shrinking the estimate away from the extreme data value.',
    },
    {
      prompt: 'A skeptical analyst encodes "this coin is probably fair" as a $\\text{Beta}(20, 20)$ prior, then observes 6 heads and 2 tails. Find the posterior mean and explain how the prior changed the conclusion versus a $\\text{Beta}(1, 1)$ prior.',
      difficulty: 'core',
      solution: 'Posterior is $\\text{Beta}(20 + 6,\\; 20 + 2) = \\text{Beta}(26, 22)$, with mean $\\frac{26}{26 + 22} = \\frac{26}{48} \\approx 0.542$. With the weak $\\text{Beta}(1, 1)$ prior the posterior mean was $0.70$. The strong prior contributes $40$ pseudo-observations that swamp the $8$ real flips, so the posterior barely moves from $0.5$. This illustrates that a confident prior requires far more data to be overturned.',
    },
    {
      prompt: 'Show that for any $\\text{Beta}(a, b)$ prior, the posterior mean after observing $s$ successes and $f$ failures is a weighted average of the prior mean and the data frequency. Identify the weights.',
      difficulty: 'challenge',
      hint: 'Let the prior mean be $\\frac{a}{a + b}$ and the data frequency be $\\frac{s}{s + f}$. Write $n_0 = a + b$ and $n = s + f$.',
      solution: 'The posterior mean is $\\frac{a + s}{a + b + s + f}$. Let $n_0 = a + b$ (prior strength) and $n = s + f$ (data size). Then $\\frac{a + s}{n_0 + n} = \\frac{n_0}{n_0 + n}\\cdot\\frac{a}{n_0} + \\frac{n}{n_0 + n}\\cdot\\frac{s}{n}$, i.e. $\\frac{n_0}{n_0 + n}\\,(\\text{prior mean}) + \\frac{n}{n_0 + n}\\,(\\text{data frequency})$. The weights are the relative pseudo-count masses: the prior gets weight $\\frac{n_0}{n_0 + n}$ and the data gets weight $\\frac{n}{n_0 + n}$. As $n \\to \\infty$ the data weight $\\to 1$ and the prior is forgotten.',
    },
  ],
  comparisons: [
    {
      title: 'MLE vs MAP vs Full Bayesian',
      methods: ['MLE', 'MAP', 'Full Bayesian'],
      rows: [
        {
          dimension: 'What you estimate',
          values: ['Single point: $\\arg\\max_\\theta P(X \\mid \\theta)$', 'Single point: $\\arg\\max_\\theta P(X \\mid \\theta)P(\\theta)$', 'Whole posterior distribution $P(\\theta \\mid X)$'],
        },
        {
          dimension: 'Role of the prior',
          values: ['None — ignores prior beliefs', 'Acts as a regularizer on the estimate', 'Fully propagated through the posterior'],
        },
        {
          dimension: 'Uncertainty quantification',
          values: ['None from the estimate itself', 'None — still just a point', 'Full: credible intervals, predictive variance'],
        },
        {
          dimension: 'Computational cost',
          values: ['Cheapest — one optimization', 'Cheap — one penalized optimization', 'Expensive — integration / MCMC / VI'],
        },
        {
          dimension: 'Behavior with little data',
          values: ['Overfits / unstable estimates', 'Prior stabilizes the estimate', 'Honestly reports wide uncertainty'],
        },
      ],
      takeaway: 'MLE and MAP both collapse the answer to a single number — MAP just adds the prior as a regularizer. Only full Bayesian inference keeps the entire posterior, which is what you pay for when you genuinely need calibrated uncertainty.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You have **small or expensive data**, where a single point estimate would overfit and uncertainty matters.',
      'You possess **genuine prior knowledge** (expert opinion, physical constraints, past experiments) worth encoding.',
      'Downstream decisions need **calibrated uncertainty** — credible intervals, risk-aware choices, or sequential decisions like bandits.',
    ],
    avoidWhen: [
      'You have **huge amounts of data**, where the likelihood dominates and MLE gives essentially the same answer far more cheaply.',
      'You **cannot justify a prior** and any choice would be arbitrary or contentious for stakeholders.',
      'You are **compute- or latency-constrained** and cannot afford MCMC / variational inference over a high-dimensional posterior.',
    ],
    rulesOfThumb: [
      'Prefer conjugate priors when available — they give exact, cheap posterior updates.',
      'Treat prior strength as pseudo-counts: ask "how many imaginary observations is this prior worth?" before committing.',
      'Always run a sensitivity check — if conclusions flip under a reasonable alternative prior, report that.',
    ],
  },
  caseStudies: [
    {
      title: 'Bayesian A/B testing for a checkout button',
      domain: 'Product experimentation',
      scenario: 'A team tests a new checkout button (variant B) against the current one (variant A). After the experiment, A had 1000 visitors with 100 conversions and B had 1000 visitors with 120 conversions. A frequentist p-value is borderline, so the team wants the directly actionable quantity: the probability that B is actually better than A.',
      approach: 'Model each conversion rate with a uniform $\\text{Beta}(1, 1)$ prior. By conjugacy the posteriors are $\\theta_A \\sim \\text{Beta}(1 + 100,\\; 1 + 900) = \\text{Beta}(101, 901)$ and $\\theta_B \\sim \\text{Beta}(1 + 120,\\; 1 + 880) = \\text{Beta}(121, 881)$. Draw many samples from each posterior and estimate $P(\\theta_B > \\theta_A)$, plus the posterior distribution of the uplift $\\theta_B - \\theta_A$.',
      outcome: 'The posterior means are $\\approx 10.1\\%$ for A and $\\approx 12.1\\%$ for B. Sampling gives $P(\\theta_B > \\theta_A) \\approx 0.93$ — about a 93% probability that B is the better variant — with an expected relative uplift near $20\\%$. Instead of a hard accept/reject p-value, the team gets a probability they can weigh against the rollout risk, and can frame the decision in terms of expected loss if they pick wrong.',
      source: {
        title: 'Bayesian Data Analysis (Ch. 2-3, Beta-Binomial inference)',
        authors: 'Gelman, A. et al.',
        url: 'https://www.stat.columbia.edu/~gelman/book/',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'In Bayes’ theorem, what role does the prior $P(\\theta)$ play?',
      options: [
        { text: 'It encodes what you believe about the parameters before seeing the data.', correct: true },
        { text: 'It is the probability of the data averaged over all parameter values.', correct: false },
        { text: 'It measures how well a fixed $\\theta$ explains the observed data.', correct: false },
        { text: 'It is always uniform and therefore has no effect.', correct: false },
      ],
      explanation: 'The prior $P(\\theta)$ is your belief about the parameters *before* observing data. The data-averaged probability is the evidence $P(X)$; how well a $\\theta$ explains the data is the likelihood $P(X \\mid \\theta)$. Priors need not be uniform, and even when uniform they still contribute pseudo-counts.',
    },
    {
      question: 'What does the posterior distribution $P(\\theta \\mid X)$ represent?',
      options: [
        { text: 'A full distribution of belief over parameter values after combining prior and data.', correct: true },
        { text: 'A single best-guess value for the parameter.', correct: false },
        { text: 'The probability of the data given a fixed parameter.', correct: false },
        { text: 'The long-run frequency of the parameter over repeated experiments.', correct: false },
      ],
      explanation: 'The posterior is an entire distribution over $\\theta$ obtained by combining the prior with the likelihood. A single best guess is a point estimate (e.g. MAP) extracted *from* it; the likelihood is $P(X \\mid \\theta)$; and treating $\\theta$ as having a distribution of belief is precisely what distinguishes the Bayesian view from the frequentist frequency interpretation.',
    },
    {
      question: 'How does MAP estimation differ from MLE?',
      options: [
        { text: 'MAP maximizes likelihood times prior, so it adds a prior (regularization) term that MLE lacks.', correct: true },
        { text: 'MAP returns a full posterior distribution while MLE returns a point.', correct: false },
        { text: 'MAP ignores the data and uses only the prior.', correct: false },
        { text: 'MAP and MLE always give identical answers.', correct: false },
      ],
      explanation: 'MAP maximizes $P(X \\mid \\theta)P(\\theta)$, equivalently $\\log P(X \\mid \\theta) + \\log P(\\theta)$, so the prior acts as a regularizer on top of the MLE objective. Both are point estimates (neither returns the full posterior). MAP uses both data and prior, and the two coincide only when the prior is flat.',
    },
    {
      question: 'What does it mean for a prior to be conjugate to a likelihood?',
      options: [
        { text: 'The posterior belongs to the same distribution family as the prior, giving a closed-form update.', correct: true },
        { text: 'The prior and likelihood are statistically independent.', correct: false },
        { text: 'The prior guarantees the posterior is uniform.', correct: false },
        { text: 'The prior makes the evidence integral equal to one without normalization.', correct: false },
      ],
      explanation: 'A conjugate prior yields a posterior in the same family as the prior, so the update is just a parameter adjustment with no integration needed — e.g. a Beta prior with a Bernoulli likelihood gives a Beta posterior. It says nothing about independence, does not force a uniform posterior, and the evidence still normalizes the posterior in the usual way.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
