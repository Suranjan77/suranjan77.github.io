import { Algorithm } from "./types";

export const mcmc: Algorithm = {
  id: "mcmc",
  title: "Markov Chain Monte Carlo",
  category: "Markov Chain Monte Carlo",
  shortDescription: "A powerful class of probabilistic algorithms that sample from complex posterior distributions when analytical solutions are intractable.",
  fullDescription: "Markov Chain Monte Carlo (MCMC) techniques solve the fundamental problem of Bayesian inference: computing the posterior distribution when the normalizing constant (the evidence integral) is mathematically impossible to evaluate directly. MCMC algorithms construct a clever Markov Chain—a random walk sequence—whose steady-state equilibrium precisely matches the target complex distribution.\n\n### Real-World Applications\nUsed to solve extraordinarily complex physics simulations, fit generalized multi-level hierarchical Bayesian models in medical research, and conduct exact high-dimensional quantitative risk analysis when normal approximations completely fail.",
  intuition: "Imagine you are blindfolded on a mountain and want to find the exact topography (the density). You take a random step in any direction. If the step goes up, you always accept it. If it goes down, you only sometimes accept it, based on how steep the drop is. Over time, your random wandering naturally builds a perfect map of the mountain's shape without ever seeing the whole thing at once.",
  mathematics: "### Metropolis-Hastings Acceptance\n\nTo safely randomly sample from target density $P(x)$, we propose a new state from a proposal distribution.",
  pros: [
    "Guarantees convergence to the exact true posterior density without making strict sweeping parametric structural assumptions.",
    "Easily handles immensely complex highly correlated non-Gaussian posteriors."
  ],
  cons: [
    "Computationally exceptionally expensive.",
    "Assessing convergence can be challenging and typically relies on multiple chains."
  ],
  codeSnippet: `import numpy as np

# Let's perform a simple Metropolis-Hastings step
def target_density(x):
    # A simple but unnormalized bimodal distribution
    return np.exp(-0.5 * (x - 2)**2) + 0.5 * np.exp(-0.5 * (x + 2)**2)

current_x = 0.0
samples = []
n_iterations = 10000

for _ in range(n_iterations):
    # Propose a step
    proposed_x = current_x + np.random.normal(0, 1.5)
    
    # Calculate acceptance probability
    acceptance_ratio = target_density(proposed_x) / target_density(current_x)
    
    if np.random.rand() < acceptance_ratio:
        current_x = proposed_x
        
    samples.append(current_x)

print(f"Generated {len(samples)} valid samples from the target density.")`
};
