import { Algorithm } from "./types";

export const mcmc: Algorithm = {
  id: "mcmc",
  title: "Markov Chain Monte Carlo",
  category: "Markov Chain Monte Carlo",
  shortDescription: "A formidable methodology of probabilistic statistical algorithms sampling complex posterior distributions when analytical solutions remain undeniably intractable.",

  fullDescription: `
Markov Chain Monte Carlo (MCMC) techniques formally address the fundamental pervasive challenge complicating advanced Bayesian inference: computing the mathematically rigorous continuous posterior distribution when the structural normalising constant (the marginal likelihood evidence integral) remains completely analytically impossible to evaluate directly. MCMC algorithms function by mathematically establishing an artificial Markov Chain—a highly stochastic sequential random walk protocol—whose steady-state equilibrium precisely empirically matches the topography of the target complex, convoluted probability distribution.

### Empirical Applications
MCMC techniques are routinely deployed to resolve extraordinarily mathematically intense physics simulations, reliably fit highly generalised multi-level hierarchical Bayesian paradigms within advanced empirical medical research, and conduct exceedingly exact, high-dimensional quantitative risk and latency analysis when conventional Normal approximations predictably completely collapse.
  `,

  intuition: `
Consider the objective of systematically mapping the distinct topography of an immensely complex mountain range whilst entirely blindfolded. You enact an exploratory random step extending in an arbitrary direction. If this incremental step results in a measurable elevation gain, you invariably systematically accept the location change. If the arbitrary step results in an elevation loss, you explicitly solely conditionally accept it based probabilistically upon the steepness of the resultant spatial descent. 

Iterated sufficiently over time, this highly stochastic yet probabilistically bounded wandering completely structures a functionally perfect simulated projection mapping the mountain's shape, systematically circumventing the intrinsic requirement to holistically visualise the topology simultaneously.
  `,

  mathematics: `
### 1. Metropolis-Hastings Acceptance Validation
To securely and properly sample an entirely arbitrary target density $P(x)$, the algorithm iteratively proposes a theoretical novel state derived from an asymmetric or symmetric proposal probability distribution. A candidate transition from current state $x$ to proposed state $x'$ is meticulously evaluated utilising the fundamental Metropolis-Hastings acceptance scalar ratio:

$$ \\alpha = \\min\\left(1, \\frac{P(x')}{P(x)}\\right) $$

If the stochastically uniform generated random continuous sample $u \\sim U(0,1)$ mathematically strictly satisfies $u \\le \\alpha$, the state formally sequentially transitions to $x'$; otherwise, it analytically remains strictly anchored at $x$.

### 2. Theoretical Convergence
The mathematically robust foundation inherent within MCMC strictly guarantees that, given sufficient unconstrained iterations spanning asymptotic lengths, the aggregate histogram comprising the visited states will explicitly theoretically converge uniformly onto the profound target posterior density function definitively regardless of initial parametrisations.
  `,

  pros: [
    "Structurally guarantees rigorous mathematical convergence identifying the exact true complex statistical posterior density without resorting to strictly brittle parametric approximations.",
    "Methodically exceptionally proficient at successfully modelling enormously complex, highly structurally correlated, entirely non-Gaussian empirical posteriors."
  ],

  cons: [
    "Computationally exceptionally prolonged; producing adequately independent continuous empirical samples mandates considerable operational execution duration.",
    "Formally assessing the true analytical absolute convergence status represents a challenging theoretical hurdle, conventionally relying extensively upon processing simultaneous multiple divergent chains."
  ],

  codeSnippet: `import numpy as np

# Let us explicitly compute a rudimentary programmatic Metropolis-Hastings stochastic step
def target_density(x):
    # A functionally identifiable but unnormalised bimodal analytic statistical distribution
    return np.exp(-0.5 * (x - 2)**2) + 0.5 * np.exp(-0.5 * (x + 2)**2)

current_x = 0.0
samples = []
n_iterations = 10000

for _ in range(n_iterations):
    # Propose an exploratory conditional step
    proposed_x = current_x + np.random.normal(0, 1.5)
    
    # Calculate conditional acceptance analytical scalar probability
    acceptance_ratio = target_density(proposed_x) / target_density(current_x)
    
    if np.random.rand() < acceptance_ratio:
        current_x = proposed_x
        
    samples.append(current_x)

print(f"Algorithm Generated {len(samples)} valid stochastic empirical samples mapping the target statistical density.")`
};
