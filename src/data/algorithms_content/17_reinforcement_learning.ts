import { Algorithm } from "./types";

export const reinforcementLearning: Algorithm = {
  id: "reinforcement-learning",
  title: "Reinforcement Learning",
  category: "Reinforcement Learning",
  shortDescription: "Training autonomous agents to make sequential decisions by trial-and-error to maximize cumulative reward.",

  fullDescription: `
Reinforcement Learning (RL) is a paradigm of machine learning where an agent learns to make decisions by performing actions in an environment and receiving feedback in the form of rewards or penalties.

Unlike supervised learning where a model is trained on labeled target samples, an RL agent operates under **delayed feedback**. The goal is not just to select the best immediate action, but to find a sequence of actions—a policy—that maximizes the total expected cumulative reward over time.

### Core Components
1. **The Agent**: The learner or decision-maker.
2. **The Environment**: The physical or virtual world the agent interacts with.
3. **The State ($s$)**: The current configuration of the environment.
4. **The Action ($a$)**: The choices available to the agent.
5. **The Reward ($r$)**: The numerical feedback signaling success or failure.
  `,

  intuition: `
Imagine training a dog to catch a frisbee. You don't hand the dog a mathematical equation explaining aerodynamics. Instead, the dog runs around, attempts to catch it (action), misses (no reward), tries another way, catches it (treat/reward), and slowly learns which running patterns yield treats.

In computer science, an RL agent behaves similarly. By starting with random actions (exploration) and gradually shifting to executing actions it knows are lucrative (exploitation), the agent forms an internal map of "good" decisions.

The challenge is the **Credit Assignment Problem**: if an agent receives a huge reward at the end of a game, which specific moves made 20 steps earlier were responsible for the success? Temporal Difference learning resolves this by updating values step-by-step.
  `,

  mathematics: `
### 1. Markov Decision Processes (MDP)
An RL problem is formally modeled as a Markov Decision Process, defined by the tuple $(S, A, P, R, \\gamma)$ where:
- $S$ is the state space.
- $A$ is the action space.
- $P(s' | s, a)$ is the probability of transitioning to state $s'$ given state $s$ and action $a$.
- $R(s, a, s')$ is the reward function.
- $\\gamma \\in [0, 1)$ is the **discount factor**, which reduces the value of future rewards compared to immediate ones.

### 2. The Bellman Optimality Equation
The value of taking action $a$ in state $s$ under an optimal policy is defined by the Q-value, $Q^*(s, a)$:

$$ Q^*(s, a) = R(s, a) + \\gamma \\sum_{s'} P(s' | s, a) \\max_{a'} Q^*(s', a') $$

### 3. Q-Learning Algorithm
In model-free environments (where transition probabilities $P$ are unknown), the agent estimates $Q(s, a)$ iteratively by exploring:

$$ Q(s, a) \\leftarrow Q(s, a) + \\alpha \\left( r + \\gamma \\max_{a'} Q(s', a') - Q(s, a) \\right) $$

Where $\\alpha \\in (0, 1]$ is the **learning rate**, and the term in parentheses is the **Temporal Difference (TD) Error**.
  `,

  pros: [
    "No labeled dataset is required; the agent learns directly from interacting with the environment.",
    "Capable of solving complex sequential planning tasks that require long-term strategy (e.g., Chess, Go, robotic locomotion).",
    "Adapts dynamically to non-stationary environments as feedback loops change."
  ],

  cons: [
    "Highly sample-inefficient; agents often require millions of trial steps to converge on simple tasks.",
    "Sensitive to hyperparameter settings (learning rate, discount factor, exploration rate) and reward design.",
    "Exploration vs. exploitation dilemma can cause the agent to get stuck in sub-optimal local behaviors."
  ],

  codeSnippet: `import numpy as np

# Simple Q-Table update step for Q-learning
states_n, actions_n = 16, 4
Q_table = np.zeros((states_n, actions_n))

alpha = 0.1   # Learning rate
gamma = 0.95  # Discount factor
epsilon = 0.2 # Exploration rate

def update_q(state, action, reward, next_state):
    # Temporal Difference Target
    best_next_action = np.argmax(Q_table[next_state])
    td_target = reward + gamma * Q_table[next_state][best_next_action]
    
    # Update Q-value
    Q_table[state][action] += alpha * (td_target - Q_table[state][action])
`
};
