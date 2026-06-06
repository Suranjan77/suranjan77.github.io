import { LearningModule } from "./types";

export const mcmc: LearningModule = {
  id: "mcmc",
  title: "Markov Chain Monte Carlo",
  category: "Markov Chain Monte Carlo",
  prerequisites: ["probability-theory", "bayesian-inference"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["bayesian-inference", "maximum-likelihood"],
  shortDescription: "A family of sampling algorithms that approximate hard probability distributions by constructing a Markov chain.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Explain the mathematical foundation of Markov Chain Monte Carlo sampling',
    'Describe the Metropolis-Hastings acceptance ratio and its rationale',
    'Identify diagnostic metrics for MCMC convergence such as Gelman-Rubin $\\hat{R}$ and Effective Sample Size',
    'Explain the concept of burn-in or warm-up phase in MCMC',
  ],
  keyTerms: [
    { term: 'Markov Chain', definition: 'A sequence of random variables where the probability of the next state depends only on the current state.' },
    { term: 'Stationary Distribution', definition: 'A probability distribution that remains invariant under the transitions of the Markov chain.' },
    { term: 'Metropolis-Hastings', definition: 'A specific MCMC algorithm that uses proposal distributions and acceptance criteria to sample from target distributions.' },
  ],
  workedExamples: [
    {
      title: 'Metropolis-Hastings Acceptance Probability',
      problem: 'Target density $P(x) \\propto e^{-x^2}$. Current state $x = 1.0$, proposed state $x\' = 1.5$. Calculate the acceptance probability $\\alpha$.',
      solution: '$P(x) = e^{-1} \\approx 0.368$. $P(x\') = e^{-2.25} \\approx 0.105$. Acceptance ratio is $\\frac{P(x\')}{P(x)} = \\frac{e^{-2.25}}{e^{-1}} = e^{-1.25} \\approx 0.286$. Therefore, $\\alpha = \\min(1, 0.286) = 0.286$. The step is accepted with a $28.6\\%$ probability.',
    },
  ],
  misconceptions: [
    {
      claim: 'MCMC samples are completely independent of each other.',
      correction: 'Because each step is proposed from the current position, adjacent samples are highly correlated. This autocorrelation reduces the effective sample size.'
    },
    {
      claim: 'The chain always converges to the true distribution immediately.',
      correction: 'MCMC chains require a "burn-in" or "warm-up" phase to discard early samples before the chain reaches its stationary distribution.'
    }
  ],
  references: [
    {
      title: "Markov Chains and Mixing Times",
      authors: "Levin, D.A. and Peres, Y",
      url: "https://www.ams.org",
      type: "textbook"
    },
    {
      title: "Handbook of Markov Chain Monte Carlo",
      authors: "Brooks, S. et al",
      url: "https://www.crcpress.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Poor Mixing',
      description: 'If the proposal step size is too small, the chain explores very slowly. If the step size is too large, proposed steps are almost always rejected.',
      mitigation: 'Tune proposal variance, use adaptive samplers, or switch to Hamiltonian Monte Carlo (HMC).'
    }
  ],

  fullDescription: `
Markov Chain Monte Carlo (MCMC) is used when a probability distribution is known up to proportionality, but direct integration or exact sampling is too difficult. This is common in Bayesian inference, where the posterior may be high-dimensional and analytically intractable.

MCMC builds a Markov chain whose stationary distribution is the target distribution. After warm-up, the visited states behave like dependent samples from that target. Histograms, expectations, credible intervals, and posterior summaries can then be estimated from those samples.

### Where is it used?
MCMC is used in Bayesian modeling, physics simulation, hierarchical medical models, ecological inference, and risk analysis when closed-form calculations are not available.
  `,

  intuition: `
Imagine a landscape where height represents probability density. The sampler proposes nearby moves. Moves to higher-density regions are usually accepted, but some lower-density moves are accepted too.

That occasional willingness to move downhill matters. It keeps the chain from getting trapped at one local peak and lets it explore the distribution. The result is not a perfect map, but an approximation that improves with better proposals, diagnostics, and enough effective samples.
  `,

  mathematics: `
### 1. The Metropolis-Hastings Algorithm
To map out a target probability distribution $P(x)$, the algorithm is currently at state $x$. It proposes a random jump to a new state $x'$. It then calculates an acceptance ratio ($\\alpha$):

$$ \\alpha = \\min\\left(1, \\frac{P(x')}{P(x)}\\right) $$

This ratio asks whether the proposed state is more probable than the current state.
If $P(x')$ is greater than $P(x)$, the ratio is 1, and the algorithm *always* moves to the new spot. 
If the proposed state is less probable, the algorithm may still accept it with probability $\\alpha$. Otherwise, it stays at $x$ and records the current state again.

### 2. Why it works
Allowing occasional lower-density moves is crucial because it improves exploration. In practice, you still need convergence diagnostics, warm-up removal, and effective sample size checks before trusting the estimates.
  `,

  pros: [
    "It can estimate posterior quantities for models where direct integration is not feasible.",
    "It does not require a Gaussian posterior and can represent skewed, correlated, or multi-modal distributions if the chain mixes well."
  ],

  cons: [
    "It is notoriously slow. Taking millions of tiny random steps takes a lot of computing power and time.",
    "It can be very difficult to know exactly when the algorithm has 'finished' mapping the mountain. You often have to run multiple walkers at the same time to check if they agree."
  ],

  codeSnippet: `import numpy as np

# Let's build a simple MCMC walker!
def target_density(x):
    # A weird, two-peaked math equation we want to map
    return np.exp(-0.5 * (x - 2)**2) + 0.5 * np.exp(-0.5 * (x + 2)**2)

current_x = 0.0
samples = []
n_iterations = 10000

for _ in range(n_iterations):
    # Propose a random step
    proposed_x = current_x + np.random.normal(0, 1.5)
    
    # Calculate if the new spot is better or worse
    acceptance_ratio = target_density(proposed_x) / target_density(current_x)
    
    # Roll the dice to see if we accept the move!
    if np.random.rand() < acceptance_ratio:
        current_x = proposed_x
        
    samples.append(current_x)

print(f"We took {len(samples)} steps to map the mountain!")`
};
