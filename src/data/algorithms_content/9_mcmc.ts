import { Algorithm } from "./types";

export const mcmc: Algorithm = {
  id: "mcmc",
  title: "Markov Chain Monte Carlo",
  category: "Markov Chain Monte Carlo",
  shortDescription: "A family of sampling algorithms that approximate hard probability distributions by constructing a Markov chain.",

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
