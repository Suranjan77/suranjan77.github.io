import { LearningModule } from "./types";

export const reinforcementLearning: LearningModule = {
  id: "reinforcement-learning",
  title: "Reinforcement Learning",
  category: "Reinforcement Learning",
  prerequisites: ["probability-theory"],
  tracks: ["practitioner"],
  difficulty: 4,
  relatedModules: ["probability-theory", "neural-networks"],
  shortDescription: "Training autonomous agents to make sequential decisions by trial-and-error to maximize cumulative reward.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Identify components of a Markov Decision Process (MDP)',
    'Explain the Bellman Equation for value functions and state-action values ($Q$-values)',
    'Describe the exploration-exploitation dilemma and epsilon-greedy strategies',
    'Explain temporal difference learning and the Q-learning update step',
  ],
  keyTerms: [
    { term: 'Policy', definition: 'A mapping from states of the environment to actions to be taken.' },
    { term: 'Q-Value (State-Action Value)', definition: 'The expected cumulative reward of taking an action in a state and following a policy thereafter.' },
    { term: 'Markov Decision Process (MDP)', definition: 'A mathematical framework for modeling decision-making where outcomes are partly random and partly under control of a decision maker.' },
  ],
  workedExamples: [
    {
      title: 'Temporal Difference (TD) Target',
      problem: 'Given state $s$, action $a$, reward $r = 10$, next state $s\'$, discount factor $\\gamma = 0.9$, and estimated $Q(s\', a\') = 5.0$, compute the TD target.',
      solution: 'TD Target = $r + \\gamma \\max_{a\'} Q(s\', a\') = 10 + 0.9 \\times 5.0 = 10 + 4.5 = 14.5$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Reinforcement learning is just supervised learning with scalar labels.',
      correction: 'In supervised learning, the model is directly given the correct action. In RL, the agent must explore the environment to discover which actions yield the highest cumulative reward, and feedback is often delayed.'
    },
    {
      claim: 'The agent should always take the action with the highest estimated reward.',
      correction: 'If the agent always chooses the highest estimated reward (exploitation), it may never discover better actions (exploration), leading to suboptimal behaviors.'
    }
  ],
  references: [
    {
      title: "Reinforcement Learning: An Introduction",
      authors: "Sutton, R. S. and Barto, A. G",
      url: "http://incompleteideas.net/book/the-book-2nd.html",
      type: "textbook"
    },
    {
      title: "Algorithms for Reinforcement Learning",
      authors: "Szepesvári, C",
      url: "https://sztaki.hu/~szcsaba/papers/RLBook.pdf",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Reward Exploitation (Loophole Abuse)',
      description: 'The agent finds a shortcut in the environment that maximizes reward without achieving the actual intended goal.',
      mitigation: 'Carefully design the reward function (reward shaping) and add constraints or penalties for undesirable behaviors.'
    }
  ],

  fullDescription: `
Reinforcement Learning (RL) studies how an agent can learn good behavior by acting in an environment and receiving rewards or penalties.

Unlike supervised learning, the agent is not handed the correct answer for each state. It often receives **delayed feedback**, so the goal is to learn a policy: a rule for choosing actions that maximizes expected cumulative reward over time.

### Core Components
1. **The Agent**: The learner or decision-maker.
2. **The Environment**: The physical or virtual world the agent interacts with.
3. **The State ($s$)**: The current configuration of the environment.
4. **The Action ($a$)**: The choices available to the agent.
5. **The Reward ($r$)**: The numerical feedback signaling success or failure.
  `,

  intuition: `
Imagine training a robot to cross a room. It tries actions, sees whether it moves closer to the goal, hits obstacles, or reaches the target, and updates its behavior from those outcomes.

An RL agent starts by exploring, then gradually exploits actions that have produced better long-term results. The hard part is that an action can look bad immediately but be useful several steps later.

This is the **credit assignment problem**: if a reward arrives at the end of a sequence, which earlier actions deserve credit? Temporal-difference learning handles this by updating estimates one transition at a time.
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
