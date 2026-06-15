import { LearningModule } from "./types";

export const probabilityTheory: LearningModule = {
  id: "probability-theory",
  title: "Probability & Statistics",
  category: "Probability Theory",
  prerequisites: [],
  tracks: ['foundations'],
  difficulty: 1,
  relatedModules: ['bayesian-inference', 'maximum-likelihood'],
  shortDescription: "The math that helps AI deal with uncertainty, ignore random noise, and make smart guesses in a messy world.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Distinguish between discrete and continuous random variables',
    'Calculate expectation, variance, and covariance for simple probability distributions',
    'Apply Bayes Theorem to update conditional probabilities',
    'Explain the concept of entropy and cross-entropy in measuring information content',
  ],
  keyTerms: [
    { term: 'Random Variable', definition: 'A variable whose values depend on outcomes of a random phenomenon.' },
    { term: 'Probability Density Function', definition: 'A function that describes the relative likelihood for a continuous random variable to take on a given value.' },
    { term: 'Entropy', definition: 'A measure of the uncertainty or randomness in a set of data.' },
  ],
  workedExamples: [
    {
      title: 'Conditional Probability using Bayes Theorem',
      problem: 'Given $P(A) = 0.1$, $P(B|A) = 0.8$, and $P(B|A^c) = 0.2$, calculate $P(A|B)$.',
      solution: 'First find $P(B) = P(B|A)P(A) + P(B|A^c)P(A^c) = 0.8 \\times 0.1 + 0.2 \\times 0.9 = 0.08 + 0.18 = 0.26$. Then, $P(A|B) = \\frac{P(B|A)P(A)}{P(B)} = \\frac{0.08}{0.26} \\approx 0.308$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Correlation implies causation.',
      correction: 'Correlation measures linear association, but does not imply that one variable causes changes in the other.'
    },
    {
      claim: 'A probability of 0 means an event is impossible.',
      correction: 'For continuous random variables, the probability of any single exact value is 0, yet the values still occur.'
    }
  ],
  references: [
    {
      title: "Probability and Computing",
      authors: "Mitzenmacher, M. and Upfal, E",
      url: "https://www.cambridge.org",
      type: "textbook"
    },
    {
      title: "Probabilistic Machine Learning: An Introduction",
      authors: "Murphy, K. P",
      url: "https://probml.github.io/pml-book/book1.html",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Underflow in Product Probabilities',
      description: 'Multiplying many small probability values together causes numeric underflow to zero.',
      mitigation: 'Perform computations in log-space (e.g. sum of log-probabilities).'
    }
  ],

  fullDescription: `
While calculus helps models improve and linear algebra gives them structure, **probability theory gives AI the logic it needs to handle uncertainty.** 

The real world is messy. The data we feed into machine learning models is almost never perfect—it's full of random noise, missing pieces, and biased samples. If an AI could only think in absolute black-and-white terms, it would fail the moment it stepped outside the lab. Machine learning works because algorithms don't just make blind guesses; they use math to figure out exactly how confident they should be.

### Beyond Absolute Certainty

Probability lets algorithms measure their own uncertainty. Instead of giving a single, rigid answer (like "This house is worth exactly USD 400,000"), statistical machine learning gives a probabilistic forecast: "I am 95 percent sure this house is worth between USD 380,000 and USD 420,000, assuming the housing market behaves normally."

This isn't just a nice feature added on top of AI—**many of the most important machine learning models are built entirely out of probability math.** 

For example, Maximum Likelihood Estimation is the core math behind how most models measure their mistakes. Naive Bayes classifiers are just direct code translations of Bayes' Theorem. And Decision Trees rely on entropy (a concept from Information Theory that's deeply tied to probability) to figure out the best way to split up data.

### Random Variables and Expectations

In machine learning, we treat data points as random observations of the real world. When an algorithm calculates an average across thousands of examples, it's really estimating the **Expected Value**. When it calculates the variance (how spread out the data is), it's measuring exactly how unpredictable the real world is.
  `,

  intuition: `
Imagine you're trying to figure out the exact shape and size of an invisible, shifting cloud, but you're only allowed to look at a few raindrops falling from it.

1. **Probability asks:** If we already knew the exact shape of the cloud, what are the chances we'd see these specific raindrops?
2. **Statistics (Machine Learning) asks:** Since we only have these specific raindrops, what is the most likely shape of the invisible cloud they came from?

Usually, the AI assumes the cloud has a standard, predictable shape (like a Bell Curve, where most raindrops fall in the middle and fewer fall on the edges). It measures the center of the raindrops (the mean) and how spread out they are (the variance). By finding the mathematical curve that best explains the raindrops we actually saw, the AI makes a highly educated guess about the invisible cloud.
  `,

  mathematics: `
### 1. Probability Distributions and Density
A **Probability Density Function (PDF)** $p(x)$ describes how likely it is for a random variable $X$ to land on a specific value. The most famous distribution in machine learning is the **Gaussian (Normal) Distribution** (the Bell Curve):

$$ \\mathcal{N}(x | \\mu, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right) $$

When algorithms assume data follows this curve, they can compress massive, complex datasets into just two simple numbers: the mean $\\mu$ (the center) and the variance $\\sigma^2$ (how spread out it is).

### 2. Bayes' Theorem
Bayes' Theorem is the ultimate formula for changing your mind when you get new evidence:

$$ P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} $$

In machine learning, $A$ is our Model's Hypothesis, and $B$ is the Training Data. The whole goal of Bayesian AI is to calculate the **Posterior Distribution $P(\\text{Model} | \\text{Data})$**—which basically means "how much should I believe my model now that I've seen the data?"

### 3. Entropy and Information Theory
In AI, Information Theory uses a concept called entropy $H(X)$ to measure exactly how messy or unpredictable a dataset is:

$$ H(X) = - \\sum_{x} P(x) \\log P(x) $$

When a model is trained to minimize "Cross-Entropy" (or maximize "Information Gain"), the math is literally forcing the algorithm to reduce its own confusion and become more confident in its predictions.
  `,

  pros: [
    "It gives models the math they need to handle messy, noisy, and missing data without crashing.",
    "It allows AI to output confidence scores (like 'I am 80% sure this is a dog') instead of just rigid guesses.",
    "Concepts like entropy give us a perfect mathematical way to measure how messy data is, which is how decision trees work.",
    "Bayesian math lets human experts easily inject their own knowledge into the AI before it even starts learning."
  ],

  cons: [
    "The math can get incredibly slow and complicated when dealing with datasets that have thousands of dimensions.",
    "Most AI assumes every data point is totally independent, which completely breaks down when dealing with things like stock prices or weather over time.",
    "The real world rarely follows a perfect Bell Curve. If an AI assumes the data is normal when it isn't, it will make terrible predictions.",
    "Advanced probabilistic methods (like MCMC sampling) are incredibly slow compared to standard deep learning techniques."
  ],


  codeSnippet: `import numpy as np
from scipy import stats

# Generate 1000 random data points from a Normal Distribution
data = np.random.normal(loc=5.0, scale=2.0, size=1000)

# Calculate the Mean (Expected Value) and Variance
mean = np.mean(data)
variance = np.var(data)

print(f"Calculated Mean: {mean:.2f}")
print(f"Calculated Variance: {variance:.2f}")

# Use Bayes' Theorem to update our belief
prior_prob = 0.5
likelihood = 0.8
evidence = 0.6

posterior_prob = (likelihood * prior_prob) / evidence
print(f"Updated Bayesian Probability: {posterior_prob:.2f}")`,
  tldr: [
    'Probability quantifies uncertainty: a random variable $X$ has a distribution (PMF if discrete, PDF if continuous) summarized by its **expectation** $\\mathbb{E}[X]$ and **variance** $\\operatorname{Var}(X)$.',
    'Conditional probability $P(A \\mid B) = P(A \\cap B)/P(B)$ rescales the world to the event you already know happened.',
    '**Bayes’ rule** $P(A \\mid B) = \\frac{P(B \\mid A) P(A)}{P(B)}$ flips a conditional and is how models turn a prior belief plus evidence into a **posterior**.',
    'Events are **independent** iff $P(A \\cap B) = P(A) P(B)$ — independence is an assumption to justify, not a default.',
    'The **base rate** (prior $P(A)$) dominates: a highly accurate test for a rare condition can still produce a low posterior probability of actually having it.',
    'Entropy $H(X) = -\\sum_x P(x)\\log P(x)$ measures uncertainty, and minimizing cross-entropy is how classifiers are trained.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Bayes’ Rule from Conditional Probability',
      content: `
Start from the definition of conditional probability. For events $A$ and $B$ with $P(B) > 0$, the probability of $A$ given $B$ is the joint probability rescaled by the probability of the conditioning event:

$$ P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}, \\qquad P(B \\mid A) = \\frac{P(A \\cap B)}{P(A)} $$

Both expressions reference the **same** joint probability $P(A \\cap B)$. Solve each for it:

$$ P(A \\cap B) = P(A \\mid B)\\, P(B) = P(B \\mid A)\\, P(A) $$

Setting the two right-hand sides equal and dividing by $P(B)$ gives **Bayes’ rule**:

$$ P(A \\mid B) = \\frac{P(B \\mid A)\\, P(A)}{P(B)} $$

The denominator is usually expanded with the **law of total probability**. Since $A$ and its complement $A^c$ partition the sample space:

$$ P(B) = P(B \\mid A)\\,P(A) + P(B \\mid A^c)\\,P(A^c) $$

So every term needed for the posterior $P(A \\mid B)$ can be built from the prior $P(A)$ and the two likelihoods $P(B \\mid A)$ and $P(B \\mid A^c)$. In machine learning $A$ is a hypothesis and $B$ is observed data, so Bayes’ rule is literally the engine that updates a prior belief into a posterior once evidence arrives.
      `,
    },
    {
      heading: 'Derivation: Expectation and Variance of a Fair Die',
      content: `
Let $X$ be the result of rolling a fair six-sided die, so $X \\in \\{1,2,3,4,5,6\\}$ each with probability $P(x) = \\tfrac{1}{6}$. The **expectation** is the probability-weighted average of the outcomes:

$$ \\mathbb{E}[X] = \\sum_{x=1}^{6} x\\, P(x) = \\frac{1}{6}(1+2+3+4+5+6) = \\frac{21}{6} = 3.5 $$

Note $3.5$ is not an attainable face value — the expectation is a long-run average, not a prediction of a single roll. For the **variance** we use the identity $\\operatorname{Var}(X) = \\mathbb{E}[X^2] - (\\mathbb{E}[X])^2$. First the second moment:

$$ \\mathbb{E}[X^2] = \\frac{1}{6}(1^2+2^2+3^2+4^2+5^2+6^2) = \\frac{91}{6} \\approx 15.1667 $$

Then subtract the squared mean:

$$ \\operatorname{Var}(X) = \\frac{91}{6} - \\left(\\frac{7}{2}\\right)^2 = \\frac{91}{6} - \\frac{49}{4} = \\frac{182 - 147}{12} = \\frac{35}{12} \\approx 2.9167 $$

The standard deviation is $\\sigma = \\sqrt{35/12} \\approx 1.708$. This is the canonical recipe: expectation weights outcomes by their probabilities, and variance measures the expected squared spread of outcomes around that center.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'You roll two fair six-sided dice. Given that the **first** die shows a $3$, what is the probability that the **sum** of the two dice is $8$?',
      difficulty: 'warm-up',
      hint: 'Once the first die is fixed at $3$, only the second die is still random. What value must it take?',
      solution: 'Conditioning on the first die being $3$ leaves the second die uniform on $\\{1,\\dots,6\\}$. The sum equals $8$ only when the second die is $5$. So $P(\\text{sum}=8 \\mid \\text{first}=3) = \\tfrac{1}{6} \\approx 0.167$. (Contrast with the unconditional $P(\\text{sum}=8) = 5/36 \\approx 0.139$ — the extra information changed the probability.)',
    },
    {
      prompt: 'A bag has $3$ red and $2$ blue marbles. You draw two marbles **without replacement**. What is the probability that both are red?',
      difficulty: 'warm-up',
      solution: 'Use the chain rule $P(R_1 \\cap R_2) = P(R_1)\\,P(R_2 \\mid R_1)$. First draw: $P(R_1) = 3/5$. After removing one red, $2$ reds remain out of $4$ marbles, so $P(R_2 \\mid R_1) = 2/4 = 1/2$. Therefore $P(\\text{both red}) = \\tfrac{3}{5} \\cdot \\tfrac{1}{2} = \\tfrac{3}{10} = 0.3$.',
    },
    {
      prompt: 'A disease affects $1\\%$ of a population. A screening test has a $95\\%$ true-positive rate (sensitivity) and a $10\\%$ false-positive rate. A randomly chosen person tests **positive**. What is the probability they actually have the disease?',
      difficulty: 'core',
      hint: 'Apply Bayes’ rule and expand $P(+)$ with the law of total probability. Do not forget the $99\\%$ who are healthy.',
      solution: 'Let $D$ = has disease. Given: $P(D) = 0.01$, $P(+ \\mid D) = 0.95$, $P(+ \\mid D^c) = 0.10$. Total probability of a positive: $P(+) = 0.95 \\times 0.01 + 0.10 \\times 0.99 = 0.0095 + 0.099 = 0.1085$. Then $P(D \\mid +) = \\frac{P(+ \\mid D)P(D)}{P(+)} = \\frac{0.0095}{0.1085} \\approx 0.0875$. So despite a positive result, there is only about an **8.8%** chance of disease — because the low base rate ($1\\%$) means most positives come from the large healthy group.',
    },
    {
      prompt: 'Let $X$ be the number shown on a fair six-sided die. Compute $\\mathbb{E}[X]$, $\\operatorname{Var}(X)$, and then $\\mathbb{E}[2X + 1]$ and $\\operatorname{Var}(2X + 1)$.',
      difficulty: 'core',
      hint: 'Recall the linearity rules: $\\mathbb{E}[aX + b] = a\\,\\mathbb{E}[X] + b$ and $\\operatorname{Var}(aX + b) = a^2 \\operatorname{Var}(X)$.',
      solution: '$\\mathbb{E}[X] = \\tfrac{1}{6}(1+\\cdots+6) = 3.5$. $\\mathbb{E}[X^2] = \\tfrac{1}{6}(1+4+9+16+25+36) = 91/6$, so $\\operatorname{Var}(X) = 91/6 - 3.5^2 = 35/12 \\approx 2.917$. By linearity $\\mathbb{E}[2X+1] = 2(3.5) + 1 = 8$. The constant shift does not affect spread, and the scale factor squares: $\\operatorname{Var}(2X+1) = 2^2 \\cdot \\tfrac{35}{12} = \\tfrac{35}{3} \\approx 11.667$.',
    },
    {
      prompt: 'Two events satisfy $P(A) = 0.4$, $P(B) = 0.5$, and $P(A \\cap B) = 0.2$. Are $A$ and $B$ independent? What is $P(A \\mid B)$, and what would $P(A \\cap B)$ have to be for them to be independent?',
      difficulty: 'challenge',
      hint: 'Independence means $P(A \\cap B) = P(A)P(B)$. Compare that product to the given joint probability.',
      solution: 'Check independence: $P(A)P(B) = 0.4 \\times 0.5 = 0.2$, which equals the given $P(A \\cap B) = 0.2$. So $A$ and $B$ **are** independent. Consequently $P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{0.2}{0.5} = 0.4 = P(A)$ — knowing $B$ tells you nothing about $A$, the defining signature of independence. For independence to hold, $P(A \\cap B)$ must equal $P(A)P(B) = 0.2$ exactly; any other value (e.g. $0.3$ would imply positive dependence, $0.1$ negative dependence) breaks it.',
    },
  ],
  comparisons: [
    {
      title: 'PMF vs PDF vs CDF',
      methods: ['PMF $p(x)$', 'PDF $f(x)$', 'CDF $F(x)$'],
      rows: [
        {
          dimension: 'Applies to',
          values: ['Discrete random variables', 'Continuous random variables', 'Both discrete and continuous'],
        },
        {
          dimension: 'What the value means',
          values: ['$P(X = x)$ — an actual probability', 'A probability **density**, not a probability', '$P(X \\le x)$ — a cumulative probability'],
        },
        {
          dimension: 'Range of values',
          values: ['Each in $[0, 1]$', 'Non-negative, may exceed $1$', 'Monotonically increasing in $[0, 1]$'],
        },
        {
          dimension: 'Normalization',
          values: ['$\\sum_x p(x) = 1$', '$\\int_{-\\infty}^{\\infty} f(x)\\,dx = 1$', '$F(-\\infty)=0,\\; F(+\\infty)=1$'],
        },
        {
          dimension: 'Probability of an interval $[a,b]$',
          values: ['$\\sum_{a \\le x \\le b} p(x)$', '$\\int_a^b f(x)\\,dx$', '$F(b) - F(a)$'],
        },
        {
          dimension: 'Probability of a single exact point',
          values: ['Can be positive', 'Always $0$', 'Equals the jump in $F$ at that point'],
        },
      ],
      takeaway: 'The PMF and PDF describe local likelihood (a probability for discrete values, a density for continuous ones), while the CDF accumulates them and is the one object that works uniformly for both — differences of the CDF recover interval probabilities in either case.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need to **quantify uncertainty** — outputting a calibrated confidence (“80% chance of rain”) instead of a single rigid answer.',
      'You want to **update beliefs as evidence arrives**, the natural job of Bayes’ rule (spam filters, diagnostics, recommendation).',
      'You have **prior knowledge** worth encoding, or limited data where a sensible prior regularizes the estimate.',
      'You must reason about **how outcomes combine** — conditional, joint, and marginal probabilities of multiple interacting events.',
    ],
    avoidWhen: [
      'Outcomes are effectively **deterministic** and noise-free, where probabilistic machinery adds complexity for no benefit.',
      'You cannot justify the **distributional assumptions** (e.g. forcing a Gaussian onto heavy-tailed or multi-modal data leads to confidently wrong answers).',
      'Strong **dependence over time or space** is present (stock prices, weather) but your model assumes independent samples — the i.i.d. assumption fails.',
      'The state space is so high-dimensional that exact inference is intractable and approximations (e.g. MCMC) are too slow for the latency budget.',
    ],
    rulesOfThumb: [
      'Always estimate the **base rate** first — it usually matters more than test/model accuracy when the event is rare.',
      'Multiply many probabilities in **log-space** ($\\sum \\log p$) to avoid numeric underflow.',
      'Independence is an **assumption to verify**, not a default; check it before multiplying probabilities.',
      'Distinguish a **probability** (mass, dimensionless) from a **density** (which can exceed $1$) when reasoning about continuous variables.',
    ],
  },
  caseStudies: [
    {
      title: 'Why a 99%-accurate test can still mislead: the base-rate effect',
      domain: 'Medical screening / diagnostics',
      scenario: 'A rare disease has a prevalence of $1$ in $1000$, so the prior is $P(D) = 0.001$. A diagnostic test is described as “99% accurate”: it has a $99\\%$ sensitivity $P(+ \\mid D) = 0.99$ and a $99\\%$ specificity, meaning a $1\\%$ false-positive rate $P(+ \\mid D^c) = 0.01$. A patient with no other risk factors tests positive and asks, “What is the chance I actually have the disease?” Intuition often says “about 99%.”',
      approach: 'Apply Bayes’ rule with the law of total probability for the denominator. Compute the overall positive rate: $P(+) = P(+ \\mid D)P(D) + P(+ \\mid D^c)P(D^c) = (0.99)(0.001) + (0.01)(0.999) = 0.00099 + 0.00999 = 0.01098$. Then the posterior is $P(D \\mid +) = \\frac{(0.99)(0.001)}{0.01098}$.',
      outcome: 'The posterior is $P(D \\mid +) \\approx 0.090$, i.e. only about **9%** — not 99%. The reason is the base rate: out of $100{,}000$ people, only $100$ have the disease (about $99$ test positive), while $99{,}900$ are healthy and roughly $999$ of them test **false-positive**. True positives are swamped roughly $10$-to-$1$ by false positives, so a single positive on a rare condition is far from a diagnosis — which is exactly why screening programs confirm with a second, independent test. This base-rate fallacy is documented in Murphy’s probabilistic ML text and is the textbook illustration of why priors cannot be ignored.',
      source: {
        title: 'Probabilistic Machine Learning: An Introduction',
        authors: 'Murphy, K. P',
        url: 'https://probml.github.io/pml-book/book1.html',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'A test for a rare condition is $99\\%$ accurate, yet the probability that a person who tests positive actually has the condition is low. What best explains this?',
      options: [
        { text: 'The low base rate (prior) means false positives from the large healthy majority outnumber true positives.', correct: true },
        { text: 'The test is poorly calibrated and its stated accuracy is wrong.', correct: false },
        { text: 'Bayes’ rule does not apply to medical tests.', correct: false },
        { text: 'Sensitivity and specificity always cancel each other out.', correct: false },
      ],
      explanation: 'This is the **base-rate fallacy**. When the prior $P(D)$ is tiny, even a small false-positive rate applied to the huge healthy population produces many false positives, so the posterior $P(D \\mid +)$ stays low. Bayes’ rule fully applies; the issue is ignoring the prior, not a faulty test.',
    },
    {
      question: 'Events $A$ and $B$ are **independent**. Which statement is necessarily true?',
      options: [
        { text: '$P(A \\mid B) = P(A)$ and $P(A \\cap B) = P(A)P(B)$.', correct: true },
        { text: '$A$ and $B$ cannot both occur (they are mutually exclusive).', correct: false },
        { text: '$P(A \\cap B) = P(A) + P(B)$.', correct: false },
        { text: '$P(A \\mid B) = 0$.', correct: false },
      ],
      explanation: 'Independence means knowing $B$ does not change the probability of $A$, i.e. $P(A \\mid B) = P(A)$, equivalently $P(A \\cap B) = P(A)P(B)$. Independence is **not** the same as mutual exclusivity — in fact mutually exclusive events with positive probability are dependent, since one occurring rules the other out.',
    },
    {
      question: 'In a standard deck, you draw one card. Let $A$ = “card is a King” and $B$ = “card is a Heart.” What is $P(A \\mid B)$?',
      options: [
        { text: '$1/13$', correct: true },
        { text: '$1/52$', correct: false },
        { text: '$4/13$', correct: false },
        { text: '$1/4$', correct: false },
      ],
      explanation: 'Given the card is a Heart, the sample space shrinks to the $13$ Hearts, exactly one of which is a King. So $P(A \\mid B) = 1/13$. Equivalently $P(A \\cap B)/P(B) = (1/52)/(13/52) = 1/13$. Notice this equals $P(A) = 4/52 = 1/13$, so suit and rank are independent here.',
    },
    {
      question: 'You have $P(B \\mid A)$ but want $P(A \\mid B)$. What additional information does Bayes’ rule require to compute it?',
      options: [
        { text: 'The prior $P(A)$ and the evidence $P(B)$ (or the pieces to build $P(B)$ via total probability).', correct: true },
        { text: 'Nothing — $P(A \\mid B)$ always equals $P(B \\mid A)$.', correct: false },
        { text: 'Only that $A$ and $B$ are independent.', correct: false },
        { text: 'The variance of $A$ and $B$.', correct: false },
      ],
      explanation: 'Bayes’ rule is $P(A \\mid B) = \\frac{P(B \\mid A)P(A)}{P(B)}$, so you need the prior $P(A)$ and the marginal $P(B)$, which is typically expanded as $P(B \\mid A)P(A) + P(B \\mid A^c)P(A^c)$. Conditional probabilities are **not** symmetric — assuming $P(A \\mid B) = P(B \\mid A)$ is a common error (the “prosecutor’s fallacy”).',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
