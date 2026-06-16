import { LearningModule } from "./types";

export const reinforcementLearning: LearningModule = {
  id: "reinforcement-learning",
  title: "Reinforcement Learning",
  category: "Reinforcement Learning",
  prerequisites: ["probability-theory"],
  tracks: ["modern-ai"],
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
`,
  tldr: [
    'An **agent** interacts with an **environment**: at each step it observes a state $s$, takes an action $a$, and receives a reward $r$ plus a next state $s^{\\prime}$ — the goal is to maximize expected **cumulative discounted reward**.',
    'A **value function** $V^\\pi(s)$ (or action-value $Q^\\pi(s,a)$) measures expected long-run return from a state under a policy, and satisfies a recursive **Bellman equation**.',
    'Every agent faces the **exploration vs. exploitation** trade-off: it must occasionally try uncertain actions (e.g. via $\\epsilon$-greedy) instead of always exploiting its current best estimate.',
    '**Value-based** methods (Q-learning, DQN) learn $Q$ and act greedily; **policy-based** methods (policy gradient) optimize a parameterized policy directly; **actor-critic** blends both.',
    'The **discount factor** $\\gamma \\in [0,1)$ trades off immediate vs. future reward and keeps the infinite-horizon return finite.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: The Bellman Equation for the State-Value Function',
      content: `
Define the **return** $G_t$ as the total discounted reward collected from time $t$ onward:

$$ G_t = \\sum_{k=0}^{\\infty} \\gamma^k r_{t+k+1} = r_{t+1} + \\gamma r_{t+2} + \\gamma^2 r_{t+3} + \\cdots $$

The crucial observation is that the return is **recursive**. Pull the first reward out of the sum and re-index the remainder:

$$ G_t = r_{t+1} + \\gamma \\left( r_{t+2} + \\gamma r_{t+3} + \\cdots \\right) = r_{t+1} + \\gamma G_{t+1} $$

The **state-value function** under a policy $\\pi$ is the expected return given that we start in state $s$ and thereafter follow $\\pi$:

$$ V^\\pi(s) = \\mathbb{E}_\\pi[\\, G_t \\mid s_t = s \\,] $$

Substitute the recursive form of the return and use linearity of expectation:

$$ V^\\pi(s) = \\mathbb{E}_\\pi[\\, r_{t+1} + \\gamma G_{t+1} \\mid s_t = s \\,] = \\mathbb{E}_\\pi[\\, r_{t+1} \\mid s_t = s \\,] + \\gamma\\, \\mathbb{E}_\\pi[\\, G_{t+1} \\mid s_t = s \\,] $$

Now apply the **tower property** (law of total expectation), conditioning on the action $a \\sim \\pi(\\cdot \\mid s)$ and the next state $s^{\\prime} \\sim P(\\cdot \\mid s, a)$. Because the process is Markov, once we know $s^{\\prime}$ the expected future return is exactly $V^\\pi(s^{\\prime})$, so $\\mathbb{E}_\\pi[\\, G_{t+1} \\mid s_t = s \\,] = \\mathbb{E}_\\pi[\\, V^\\pi(s^{\\prime}) \\mid s_t = s \\,]$. This yields the **Bellman expectation equation**:

$$ V^\\pi(s) = \\mathbb{E}_\\pi\\!\\left[\\, r + \\gamma\\, V^\\pi(s^{\\prime}) \\mid s \\,\\right] = \\sum_{a} \\pi(a \\mid s) \\sum_{s^{\\prime}} P(s^{\\prime} \\mid s, a)\\left[\\, R(s,a,s^{\\prime}) + \\gamma\\, V^\\pi(s^{\\prime}) \\,\\right] $$

**Role of $\\gamma$.** The discount factor weights a reward received $k$ steps in the future by $\\gamma^k$. With $\\gamma$ close to $0$ the agent is myopic, caring almost only about the immediate reward; with $\\gamma$ close to $1$ it is far-sighted, valuing distant rewards nearly as much as immediate ones. Mathematically, $\\gamma < 1$ also guarantees **convergence**: if every reward is bounded by $r_{\\max}$, the geometric series gives $|G_t| \\le \\frac{r_{\\max}}{1 - \\gamma}$, so the infinite-horizon return — and hence $V^\\pi$ — is finite and well defined.
      `,
    },
    {
      heading: 'Derivation: Q-Learning as Stochastic Approximation of the Bellman Optimality Equation',
      content: `
The **Bellman optimality equation** for the optimal action-value function $Q^*$ is a fixed-point condition:

$$ Q^*(s,a) = \\mathbb{E}\\!\\left[\\, r + \\gamma \\max_{a^{\\prime}} Q^*(s^{\\prime}, a^{\\prime}) \\mid s, a \\,\\right] = \\sum_{s^{\\prime}} P(s^{\\prime} \\mid s, a)\\left[\\, R(s,a,s^{\\prime}) + \\gamma \\max_{a^{\\prime}} Q^*(s^{\\prime},a^{\\prime}) \\,\\right] $$

If we knew the transition model $P$, we could solve this by **value iteration**, repeatedly applying the right-hand side as an operator. In the **model-free** setting we do not know $P$, so we cannot compute that expectation. Instead we **sample** it: each environment interaction $(s, a, r, s^{\\prime})$ provides one unbiased draw of the random quantity inside the expectation,

$$ y = r + \\gamma \\max_{a^{\\prime}} Q(s^{\\prime}, a^{\\prime}), $$

called the **TD target**. We want to drive our estimate $Q(s,a)$ toward the (unknown) mean of $y$. This is exactly the problem **stochastic approximation** (the Robbins–Monro method) solves: to estimate the mean of a noisy signal, nudge the current estimate a small fraction $\\alpha$ of the way toward each new sample,

$$ Q(s,a) \\leftarrow Q(s,a) + \\alpha\\big(\\, y - Q(s,a) \\,\\big). $$

Substituting the TD target gives the **Q-learning update rule**:

$$ Q(s,a) \\leftarrow Q(s,a) + \\alpha\\Big[\\, r + \\gamma \\max_{a^{\\prime}} Q(s^{\\prime},a^{\\prime}) - Q(s,a) \\,\\Big]. $$

The bracketed term is the **TD error**: the gap between the sampled target and the current estimate. As $\\alpha \\to 0$ appropriately (with $\\sum \\alpha = \\infty$, $\\sum \\alpha^2 < \\infty$) and every state-action pair is visited infinitely often, $Q$ provably converges to $Q^*$.

**Why it is off-policy.** The target uses $\\max_{a^{\\prime}} Q(s^{\\prime}, a^{\\prime})$ — the value of the **greedy** action in the next state — regardless of which action the agent actually took there. The agent can collect experience using any **behavior policy** (for example $\\epsilon$-greedy, which explores), yet still learn about the **target policy** that acts greedily. Because the policy being learned differs from the policy generating the data, Q-learning is **off-policy**. (Contrast SARSA, whose target uses $Q(s^{\\prime}, a^{\\prime})$ for the action $a^{\\prime}$ actually taken next, making it **on-policy**.)
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'An agent collects the reward sequence $r_1 = 2$, $r_2 = 0$, $r_3 = 8$ over three steps and then the episode ends. With discount factor $\\gamma = 0.5$, compute the discounted return $G_0$ from the start.',
      difficulty: 'warm-up',
      hint: 'Use $G_0 = r_1 + \\gamma r_2 + \\gamma^2 r_3$, weighting each reward by $\\gamma^k$.',
      solution: '$G_0 = 2 + (0.5)(0) + (0.5)^2(8) = 2 + 0 + 0.25 \\times 8 = 2 + 0 + 2 = 4$. The reward of $8$ arrives two steps later, so it is discounted by $\\gamma^2 = 0.25$ down to an effective contribution of $2$.',
      tags: ['conceptual', 'computation'],
    },
    {
      prompt: 'A Q-table currently holds $Q(s,a) = 3.0$. The agent takes action $a$, receives reward $r = 1$, and lands in state $s^{\\prime}$ where the action-values are $Q(s^{\\prime}, a_1) = 5$ and $Q(s^{\\prime}, a_2) = 2$. With learning rate $\\alpha = 0.1$ and discount $\\gamma = 0.9$, perform one Q-learning update and report the new $Q(s,a)$.',
      difficulty: 'core',
      hint: 'First form the TD target $r + \\gamma \\max_{a^{\\prime}} Q(s^{\\prime}, a^{\\prime})$, then the TD error, then apply $Q \\leftarrow Q + \\alpha \\times \\text{error}$.',
      solution: 'The greedy next-state value is $\\max_{a^{\\prime}} Q(s^{\\prime}, a^{\\prime}) = \\max(5, 2) = 5$. TD target $= r + \\gamma \\max_{a^{\\prime}} Q(s^{\\prime},a^{\\prime}) = 1 + 0.9 \\times 5 = 5.5$. TD error $= 5.5 - 3.0 = 2.5$. Update: $Q(s,a) \\leftarrow 3.0 + 0.1 \\times 2.5 = 3.0 + 0.25 = 3.25$. The estimate moves a small step (10%) toward the target rather than jumping all the way.',
      tags: ['computation', 'q-learning'],
    },
    {
      prompt: 'An agent uses an $\\epsilon$-greedy policy with $\\epsilon = 0.1$ over $4$ available actions, exactly one of which is the current greedy (best-estimate) action. What is the probability it selects the greedy action on a given step, and what is the probability it picks each specific non-greedy action?',
      difficulty: 'core',
      hint: 'With probability $1 - \\epsilon$ it exploits; with probability $\\epsilon$ it explores uniformly over **all** actions (including, in the standard formulation, the greedy one).',
      solution: 'In the standard $\\epsilon$-greedy rule, with probability $\\epsilon$ the agent picks uniformly among all $4$ actions, and with probability $1-\\epsilon$ it picks the greedy one. So the greedy action is chosen with probability $(1-\\epsilon) + \\epsilon/4 = 0.9 + 0.1/4 = 0.9 + 0.025 = 0.925$. Each of the $3$ non-greedy actions is chosen with probability $\\epsilon/4 = 0.025$. Check: $0.925 + 3 \\times 0.025 = 0.925 + 0.075 = 1.0$.',
      tags: ['conceptual', 'exploration'],
    },
    {
      prompt: 'Consider a tiny MDP. From state $s$ a fixed policy always takes one action leading to: state $A$ with probability $0.5$ and reward $4$, or state $B$ with probability $0.5$ and reward $0$. You already estimate $V^\\pi(A) = 10$ and $V^\\pi(B) = 6$. With $\\gamma = 0.9$, perform one Bellman backup to compute $V^\\pi(s)$.',
      difficulty: 'challenge',
      hint: 'Apply $V^\\pi(s) = \\sum_{s^{\\prime}} P(s^{\\prime} \\mid s)\\,[\\,R + \\gamma V^\\pi(s^{\\prime})\\,]$, summing over the two reachable next states.',
      solution: 'Backup over both branches: $V^\\pi(s) = 0.5\\,[\\,4 + 0.9 \\times 10\\,] + 0.5\\,[\\,0 + 0.9 \\times 6\\,]$. The first branch contributes $0.5 \\times (4 + 9) = 0.5 \\times 13 = 6.5$; the second contributes $0.5 \\times (0 + 5.4) = 0.5 \\times 5.4 = 2.7$. Therefore $V^\\pi(s) = 6.5 + 2.7 = 9.2$.',
      tags: ['derivation', 'bellman'],
    },
  ],
  comparisons: [
    {
      title: 'Value-Based vs. Policy Gradient vs. Actor-Critic',
      methods: ['Q-Learning (value-based)', 'Policy Gradient', 'Actor-Critic'],
      rows: [
        {
          dimension: 'What is learned',
          values: [
            'An action-value function $Q(s,a)$; the policy is implicitly greedy w.r.t. $Q$.',
            'A parameterized policy $\\pi_\\theta(a \\mid s)$ directly, no value function required.',
            'Both: an actor (policy $\\pi_\\theta$) and a critic (value/advantage estimate).',
          ],
        },
        {
          dimension: 'On- or off-policy',
          values: [
            'Off-policy — learns the greedy policy from exploratory data.',
            'On-policy — gradients are estimated from data drawn by the current policy.',
            'Typically on-policy (A2C/A3C), though off-policy variants exist (e.g. SAC).',
          ],
        },
        {
          dimension: 'Sample efficiency',
          values: [
            'Relatively high — experience replay lets each transition be reused many times.',
            'Low — high-variance gradient estimates, on-policy data is usually discarded after one update.',
            'Moderate — the critic reduces gradient variance, improving on raw policy gradient.',
          ],
        },
        {
          dimension: 'Continuous actions',
          values: [
            'Awkward — the $\\max_{a^{\\prime}}$ over actions is hard in continuous spaces.',
            'Natural — the policy can output continuous distributions (e.g. a Gaussian).',
            'Natural — the actor handles continuous actions; widely used in robotics control.',
          ],
        },
      ],
      takeaway: 'Use value-based methods for discrete actions where sample efficiency matters; use policy gradients when actions are continuous or the optimal policy is stochastic; actor-critic combines a directly optimizable policy with a variance-reducing critic and is the default for continuous control.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'The problem is **sequential decision-making**: actions influence future states and rewards, not just an immediate label.',
      'You can define a **reward signal** and either simulate the environment cheaply or afford large amounts of real interaction.',
      'No supervised dataset of correct actions exists, but you can evaluate outcomes (e.g. game outcomes, control objectives, robotics tasks).',
    ],
    avoidWhen: [
      'A **supervised** dataset of input-output pairs is available — direct supervised learning will be far cheaper and more stable.',
      'Environment interaction is **expensive or unsafe** and you cannot build a faithful simulator (RL is notoriously sample-hungry).',
      'You cannot specify a meaningful reward without inviting **reward hacking**, or the task is a single one-shot prediction with no temporal structure.',
    ],
    rulesOfThumb: [
      'Start with a strong simulator and a simple baseline (tabular Q-learning or a well-tuned DQN/PPO) before reaching for exotic algorithms.',
      'Tune the discount factor $\\gamma$ to the effective planning horizon; $\\gamma$ near $0.99$ corresponds to caring about roughly the next $\\sim 100$ steps.',
      'Anneal exploration (decay $\\epsilon$ or entropy bonus) over training, and shape rewards carefully to avoid loophole-abusing behavior.',
    ],
  },
  caseStudies: [
    {
      title: 'Deep Q-Networks reach human-level play on Atari 2600',
      domain: 'Game playing / control from pixels',
      scenario: 'DeepMind sought a single learning agent that could play many different Atari 2600 games directly from raw $210 \\times 160$ pixel frames and the game score, with no game-specific feature engineering or tuning across the $49$ games tested.',
      approach: 'They introduced the **Deep Q-Network (DQN)**: a convolutional neural network approximating $Q(s,a)$, trained with Q-learning. Two stabilizing tricks were key — an **experience replay** buffer that breaks correlations between consecutive samples and reuses experience, and a periodically updated **target network** for computing the TD target. The same architecture and hyperparameters were used for every game.',
      outcome: 'The single agent surpassed all previous algorithms and reached **human-level performance** (above $75\\%$ of a professional human tester’s score) on **29 of 49 games**, learning entirely from pixels and reward. This was a landmark demonstration that deep neural networks could serve as stable function approximators for value-based RL.',
      source: {
        title: 'Human-level control through deep reinforcement learning',
        authors: 'Mnih, V., Kavukcuoglu, K., Silver, D., et al.',
        url: 'https://www.nature.com/articles/nature14236',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'In the Bellman expectation equation $V^\\pi(s) = \\mathbb{E}_\\pi[\\,r + \\gamma V^\\pi(s^{\\prime})\\,]$, what role does the discount factor $\\gamma$ play?',
      options: [
        { text: 'It weights future rewards relative to immediate ones and keeps the infinite-horizon return finite when $\\gamma < 1$.', correct: true },
        { text: 'It is the learning rate that controls how fast value estimates are updated.', correct: false },
        { text: 'It is the probability of taking a random exploratory action.', correct: false },
        { text: 'It normalizes the reward so values always lie between $0$ and $1$.', correct: false },
      ],
      explanation: 'A reward $k$ steps away is weighted by $\\gamma^k$, so $\\gamma$ near $0$ makes the agent myopic and $\\gamma$ near $1$ far-sighted. With bounded rewards, $\\gamma < 1$ makes the geometric series converge, bounding the return by $r_{\\max}/(1-\\gamma)$. The learning rate is $\\alpha$, and exploration is governed by $\\epsilon$ — different quantities.',
    },
    {
      question: 'Why is Q-learning considered an **off-policy** algorithm?',
      options: [
        { text: 'Its target uses $\\max_{a^{\\prime}} Q(s^{\\prime}, a^{\\prime})$ — the greedy action — regardless of the (possibly exploratory) action the behavior policy actually took.', correct: true },
        { text: 'Because it never explores and always exploits the best-known action.', correct: false },
        { text: 'Because it requires the full transition model $P(s^{\\prime} \\mid s, a)$ to be known in advance.', correct: false },
        { text: 'Because it can only be applied after a policy has fully converged.', correct: false },
      ],
      explanation: 'Q-learning learns about the greedy target policy while generating experience with a different behavior policy (e.g. $\\epsilon$-greedy), because its TD target bootstraps from $\\max_{a^{\\prime}} Q(s^{\\prime},a^{\\prime})$ rather than the action actually taken. SARSA, which uses the action actually taken, is the on-policy counterpart. Q-learning is also model-free, so it does not need $P$.',
    },
    {
      question: 'An agent rewarded with the discounted return $G_t = \\sum_{k=0}^{\\infty} \\gamma^k r_{t+k+1}$ receives a constant reward of $1$ at every step forever, with $\\gamma = 0.9$. What is $G_t$?',
      options: [
        { text: '$10$', correct: true },
        { text: '$0.9$', correct: false },
        { text: '$\\infty$', correct: false },
        { text: '$1.9$', correct: false },
      ],
      explanation: 'This is a geometric series: $G_t = \\sum_{k=0}^{\\infty} \\gamma^k \\cdot 1 = \\frac{1}{1-\\gamma} = \\frac{1}{1-0.9} = \\frac{1}{0.1} = 10$. The discount factor below $1$ is exactly what keeps an infinite stream of rewards finite.',
    },
    {
      question: 'What problem does the exploration-exploitation trade-off describe, and how does $\\epsilon$-greedy address it?',
      options: [
        { text: 'Exploiting always-best estimates can miss better actions; $\\epsilon$-greedy occasionally picks a random action to keep exploring.', correct: true },
        { text: 'It describes overfitting to training data; $\\epsilon$-greedy adds regularization to the value function.', correct: false },
        { text: 'It describes how to discount future rewards; $\\epsilon$-greedy sets the value of $\\gamma$ each step.', correct: false },
        { text: 'It describes vanishing gradients in deep networks; $\\epsilon$-greedy rescales the gradients.', correct: false },
      ],
      explanation: 'If the agent always exploits its current best estimate it may never discover a superior action whose value it has underestimated. $\\epsilon$-greedy chooses the greedy action with probability $1-\\epsilon$ and a random action with probability $\\epsilon$, guaranteeing continued exploration; $\\epsilon$ is typically annealed downward over training. This is unrelated to overfitting, discounting, or gradient scaling.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
