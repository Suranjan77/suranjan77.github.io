import { LearningModule } from "./types";

export const gradientDescent: LearningModule = {
  id: "gradient-descent",
  title: "Gradient Descent and Optimization",
  category: "Gradient Descent and Optimization",
  prerequisites: ["calculus"],
  tracks: ["foundations"],
  difficulty: 2,
  estimatedMinutes: 35,
  shortDescription: "The algorithm that powers deep learning by iteratively updating parameters in the direction of steepest loss descent.",
  learningObjectives: [
    "Formulate loss functions and compute their gradients mathematically.",
    "Compare Batch, Mini-batch, and Stochastic Gradient Descent (SGD) in terms of convergence and computational efficiency.",
    "Explain the role of momentum in overcoming local minima and saddle points.",
    "Describe the mechanics of adaptive learning rate optimizers, specifically RMSprop and Adam.",
    "Diagnose convergence issues such as exploding or vanishing gradients and identify appropriate mitigations."
  ],
  keyTerms: [
    {
      term: "Loss Function",
      definition: "A mathematical function that quantifies the difference between a model's predictions and the true targets."
    },
    {
      term: "Gradient",
      definition: "The vector of partial derivatives of a function, pointing in the direction of the greatest rate of increase of the function."
    },
    {
      term: "Learning Rate",
      definition: "A scalar hyperparameter that determines the step size taken in each parameter update iteration."
    },
    {
      term: "Adam Optimizer",
      definition: "An optimization algorithm that computes adaptive learning rates for each parameter using estimates of first and second moments of gradients."
    }
  ],
  workedExamples: [
    {
      title: "One-Dimensional Gradient Descent Step",
      problem: "Let the loss function be $L(w) = w^2 - 4w + 4$. With an initial parameter value $w_0 = 5$ and a learning rate $\\eta = 0.1$, calculate the updated parameter value $w_1$ after one step of gradient descent.",
      solution: "First, find the gradient (derivative) of $L(w)$:\n$$L'(w) = 2w - 4$$\n\nEvaluate the gradient at $w_0 = 5$:\n$$L'(5) = 2(5) - 4 = 6$$\n\nNow, apply the gradient descent update rule:\n$$w_1 = w_0 - \\eta \\times L'(w_0)$$\n$$w_1 = 5 - 0.1 \\times 6 = 5 - 0.6 = 4.4$$\n\n(Note: The minimum is at $w = 2$. The parameter has moved closer to the minimum.)"
    }
  ],
  misconceptions: [
    {
      claim: "Gradient descent always converges to the global minimum of the loss function.",
      correction: "For convex loss functions, gradient descent will find the global minimum. However, for non-convex functions (such as neural network loss surfaces), it can easily get stuck in local minima or saddle points."
    },
    {
      claim: "A larger learning rate is always better because the model will learn faster.",
      correction: "If the learning rate is too large, gradient descent can overshoot the minimum, bounce back and forth, or even diverge entirely, causing the loss to explode."
    }
  ],
  references: [
    {
      title: "Optimization Methods for Large-Scale Machine Learning",
      authors: "Léon Bottou, Frank E. Curtis, and Jorge Nocedal",
      url: "https://arxiv.org/abs/1606.04838",
      type: "paper"
    },
    {
      title: "Adam: A Method for Stochastic Optimization",
      authors: "Diederik P. Kingma and Jimmy Ba",
      url: "https://arxiv.org/abs/1412.6980",
      type: "paper"
    }
  ],
  failureModes: [
    {
      name: "Exploding Gradients",
      description: "When gradients grow exponentially during training, causing the updates to overshoot and parameters to become NaN.",
      mitigation: "Use gradient clipping, reduce the learning rate, or apply batch normalization."
    },
    {
      name: "Saddle Points",
      description: "Points where the gradient is zero but it is a minimum in one direction and a maximum in another. Standard SGD can stall here.",
      mitigation: "Use momentum, Adam, or add small random noise to the updates to break symmetry."
    }
  ],
  pros: [
    "Simple to understand and implement.",
    "Stochastic and mini-batch variants scale efficiently to massive datasets.",
    "Highly flexible; works with any differentiable loss function."
  ],
  cons: [
    "Requires careful tuning of the learning rate and optimization schedules.",
    "Can easily stall on flat plateaus or saddle points without advanced optimizers.",
    "Strictly requires the loss function to be differentiable."
  ],
  intuition: "Imagine standing on a foggy mountain at night. You want to find the lowest valley (the minimum loss), but you can only see a few inches in front of you. What do you do? You feel the slope of the ground under your feet and take a step in the direction that goes down the steepest. You repeat this step-by-step. If you take steps that are too big, you might jump right over a valley. If your steps are too small, it will take you forever to reach the bottom.",
  mathematics: "### The Gradient Descent Update Rule\n\nTo minimize a function $L(\\mathbf{w})$, gradient descent updates the parameter vector $\\mathbf{w}$ in the opposite direction of the gradient $\\nabla_{\\mathbf{w}} L(\\mathbf{w})$:\n$$\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla_{\\mathbf{w}} L(\\mathbf{w}_t)$$\nwhere $\\eta > 0$ is the learning rate.\n\n### Variants of Gradient Descent\n\n1. **Batch Gradient Descent:** Computes the gradient over the entire dataset of size $N$:\n   $$\\nabla_{\\mathbf{w}} L(\\mathbf{w}) = \\frac{1}{N} \\sum_{i=1}^{N} \\nabla_{\\mathbf{w}} L_i(\\mathbf{w})$$\n\n2. **Stochastic Gradient Descent (SGD):** Updates parameters using a single randomly chosen sample $i$:\n   $$\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla_{\\mathbf{w}} L_i(\\mathbf{w}_t)$$\n\n3. **Mini-batch Gradient Descent:** Updates parameters using a small subset (batch) of size $B$:\n   $$\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\left( \\frac{1}{B} \\sum_{i \\in \\text{Batch}} \\nabla_{\\mathbf{w}} L_i(\\mathbf{w}_t) \\right)$$\n\n### Optimization with Momentum\n\nMomentum mimics a heavy ball rolling down a hill, adding a fraction $\\beta$ of the previous step's velocity vector $\\mathbf{v}_t$ to smooth out oscillations:\n$$\\mathbf{v}_{t+1} = \\beta \\mathbf{v}_t + \\eta \\nabla_{\\mathbf{w}} L(\\mathbf{w}_t)$$\n$$\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\mathbf{v}_{t+1}$$\n\n### Adam (Adaptive Moment Estimation)\n\nAdam keeps running averages of both the gradients $m_t$ (first moment, mean) and the squared gradients $v_t$ (second moment, uncentered variance):\n$$m_{t} = \\beta_1 m_{t-1} + (1 - \\beta_1) g_t$$\n$$v_{t} = \\beta_2 v_{t-1} + (1 - \\beta_2) g_t^2$$\nwhere $g_t = \\nabla_{\\mathbf{w}} L(\\mathbf{w}_t)$. After applying bias correction for initialization at zero:\n$$\\hat{m}_t = \\frac{m_t}{1 - \\beta_1^t}, \\quad \\hat{v}_t = \\frac{v_t}{1 - \\beta_2^t}$$\n\nThe parameters are updated via:\n$$\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\frac{\\eta}{\\sqrt{\\hat{v}_t} + \\epsilon} \\hat{m}_t$$\nwhere $\\epsilon$ (e.g., $10^{-8}$) prevents division by zero.",
  fullDescription: "Optimization algorithms are the engines that train machine learning models. Gradient descent is the foundational method used to optimize parameters in neural networks, regressions, and classification tasks. Because the loss surfaces of deep neural networks are complex, non-convex, and high-dimensional, choosing the right optimization strategy (e.g., standard SGD, momentum, or adaptive methods like Adam) is one of the most critical decisions in training models successfully.\n\nThis module outlines the mechanics of gradient descent, compares different types of updates, details modern adaptive optimizers, and offers diagnostic strategies for debugging optimization issues.",
  codeSnippet: `/**
 * Performs a single gradient descent update step (with Momentum)
 */
export function gradientDescentStep(
  w: number,
  gradient: number,
  velocity: number,
  learningRate: number,
  momentum: number
): { nextW: number; nextVelocity: number } {
  // Compute new velocity: v = beta * v + lr * gradient
  const nextVelocity = momentum * velocity + learningRate * gradient;
  // Update parameter
  const nextW = w - nextVelocity;
  
  return { nextW, nextVelocity };
}

/**
 * Simulates Adam optimizer update step
 */
export function adamStep(
  w: number,
  gradient: number,
  m: number,
  v: number,
  t: number, // step index (1-based)
  learningRate: number,
  beta1: number = 0.9,
  beta2: number = 0.999,
  epsilon: number = 1e-8
): { nextW: number; nextM: number; nextV: number } {
  // Update biased first moment estimate
  const nextM = beta1 * m + (1 - beta1) * gradient;
  // Update biased second raw moment estimate
  const nextV = beta2 * v + (1 - beta2) * Math.pow(gradient, 2);
  
  // Compute bias-corrected first moment estimate
  const mHat = nextM / (1 - Math.pow(beta1, t));
  // Compute bias-corrected second raw moment estimate
  const vHat = nextV / (1 - Math.pow(beta2, t));
  
  // Update parameters
  const nextW = w - (learningRate * mHat) / (Math.sqrt(vHat) + epsilon);
  
  return { nextW, nextM, nextV };
}`,
  relatedModules: ["calculus", "neural-networks", "regularization"],
  tldr: [
    'Gradient descent iteratively steps parameters downhill: $\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta\\,\\nabla L(\\mathbf{w}_t)$, where the **learning rate** $\\eta$ sets the step size.',
    'On a quadratic the dynamics are exactly solvable — for $L(w) = w^2$ each step multiplies $w$ by $(1 - 2\\eta)$, so it **converges iff** $0 < \\eta < 1$ and is fastest at $\\eta = 1/2$.',
    'Too-large $\\eta$ overshoots and **diverges**; too-small crawls — the same trade-off scales up to deep networks.',
    '**Batch** GD uses the whole dataset (smooth, expensive), **stochastic** GD uses one sample (noisy, cheap), and **mini-batch** GD blends both — the default for deep learning.',
    'On non-convex surfaces the gradient vanishes at local minima and **saddle points** too, which is why momentum and adaptive optimizers exist.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Convergence vs Divergence on a Quadratic',
      content: `
The simplest landscape that reveals everything about the learning rate is the 1D quadratic $L(w) = w^2$, whose minimum sits at $w^* = 0$. Its gradient is $L'(w) = 2w$, so the update rule becomes a single multiplication:

$$ w_{t+1} = w_t - \\eta\\,L'(w_t) = w_t - \\eta(2 w_t) = (1 - 2\\eta)\\,w_t $$

Iterating from a start $w_0$ gives a clean geometric sequence:

$$ w_t = (1 - 2\\eta)^t\\, w_0 $$

Let $r = 1 - 2\\eta$ be the **contraction factor**. The behaviour is dictated entirely by $|r|$:

- $|r| < 1 \\Rightarrow w_t \\to 0$: **converges**. This requires $-1 < 1 - 2\\eta < 1$, i.e. $0 < \\eta < 1$.
- $|r| > 1 \\Rightarrow |w_t| \\to \\infty$: **diverges** (overshoots ever more). This happens for $\\eta > 1$.
- $r = 1$ (i.e. $\\eta = 0$) leaves $w$ frozen; $r = -1$ (i.e. $\\eta = 1$) makes it oscillate forever between $\\pm w_0$.

Concretely, start at $w_0 = 1$. With $\\eta = 0.1$, $r = 0.8$ and the iterates are $1, 0.8, 0.64, 0.512, \\dots$ smoothly shrinking. With $\\eta = 0.6$, $r = -0.2$ and they are $1, -0.2, 0.04, \\dots$, converging but with a sign flip each step. With $\\eta = 1.2$, $r = -1.4$ and they become $1, -1.4, 1.96, -2.744, \\dots$ — exploding. This is the divergence that shows up as a loss going to NaN in real training.
      `,
    },
    {
      heading: 'Derivation: The Optimal Step Size for a 1D Quadratic',
      content: `
For a general 1D quadratic $L(w) = \\frac{1}{2}a(w - w^*)^2$ with curvature $a = L''(w) > 0$, the gradient is $L'(w) = a(w - w^*)$ and the update on the error $e_t = w_t - w^*$ reads:

$$ e_{t+1} = e_t - \\eta\\,a\\,e_t = (1 - \\eta a)\\,e_t $$

We want to drive $e_t$ to zero as fast as possible, i.e. minimize $|1 - \\eta a|$ over $\\eta$. That magnitude is zero exactly when

$$ \\eta^{*} = \\frac{1}{a} = \\frac{1}{L''(w)} $$

at which point $e_{t+1} = 0$ — the iteration reaches the minimum in a **single step**. (For $L(w) = w^2$ we have $a = 2$, giving $\\eta^{*} = 1/2$, consistent with $r = 1 - 2\\eta = 0$.) This is no coincidence: dividing the gradient by the curvature $L''$ is precisely **Newton's method**, and constant-step gradient descent can only match it when the curvature is the same everywhere. In higher dimensions the relevant curvatures are the Hessian's eigenvalues $\\lambda_{\\min} \\le \\dots \\le \\lambda_{\\max}$; convergence requires $\\eta < 2/\\lambda_{\\max}$, and the worst-case rate is governed by the **condition number** $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$. A large $\\kappa$ (ill-conditioned, elongated valleys) forces a small $\\eta$ and slow zig-zagging progress — the very problem momentum and adaptive optimizers are built to fix.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'For $L(w) = w^2$ with learning rate $\\eta = 0.25$, start at $w_0 = 2$ and compute $w_1$ and $w_2$.',
      difficulty: 'warm-up',
      hint: 'The update simplifies to $w_{t+1} = (1 - 2\\eta)\\,w_t$.',
      solution: 'Here $1 - 2\\eta = 1 - 0.5 = 0.5$. So $w_1 = 0.5 \\times 2 = 1$ and $w_2 = 0.5 \\times 1 = 0.5$. The iterates halve each step, marching toward the minimum at $w = 0$.',
    },
    {
      prompt: 'For the loss $L(w) = w^2$, find the exact range of learning rates $\\eta$ for which gradient descent converges to the minimum, and state the value that converges fastest.',
      difficulty: 'core',
      hint: 'Write one step as $w_{t+1} = (1 - 2\\eta)\\,w_t$ and require the contraction factor to have magnitude below 1.',
      solution: 'One step multiplies $w$ by $r = 1 - 2\\eta$, so $w_t = r^t w_0$. Convergence needs $|r| < 1$: $-1 < 1 - 2\\eta < 1 \\Rightarrow 0 < \\eta < 1$. Convergence is fastest when $|r|$ is smallest, i.e. $r = 0$, giving $\\eta = 1/2$ — which reaches the minimum in a single step.',
    },
    {
      prompt: 'A tiny dataset has three points $(x, y) = (1, 1), (2, 2), (3, 2)$ and the model $\\hat{y} = wx$ with squared loss $L_i = (wx_i - y_i)^2$. At $w = 1$, compute (a) the full batch gradient $\\frac{1}{3}\\sum_i \\frac{\\partial L_i}{\\partial w}$ and (b) the stochastic gradient using only the third sample.',
      difficulty: 'core',
      hint: 'The per-sample gradient is $\\frac{\\partial L_i}{\\partial w} = 2 x_i (w x_i - y_i)$.',
      solution: 'Per-sample gradients at $w = 1$: sample 1: $2(1)(1\\cdot1 - 1) = 0$; sample 2: $2(2)(2 - 2) = 0$; sample 3: $2(3)(3 - 2) = 6$. (a) Batch gradient $= \\frac{1}{3}(0 + 0 + 6) = 2$. (b) Stochastic gradient on sample 3 alone $= 6$. The single-sample estimate is three times larger here — it is an unbiased but noisy estimate of the batch value, which is exactly the variance SGD trades for cheap steps.',
    },
    {
      prompt: 'Gradient descent is applied to $L(w) = w^2$ from $w_0 = 1$ with $\\eta = 1.5$. Compute $w_1, w_2, w_3$ and explain what is happening.',
      difficulty: 'challenge',
      hint: 'Use $w_{t+1} = (1 - 2\\eta)\\,w_t$ and examine the magnitude of the multiplier.',
      solution: 'The contraction factor is $r = 1 - 2(1.5) = -2$, with $|r| = 2 > 1$. So $w_1 = -2$, $w_2 = 4$, $w_3 = -8$: the iterates flip sign and **double in magnitude** every step. Because $\\eta = 1.5 > 1$ lies outside the convergence window $0 < \\eta < 1$, the optimizer overshoots the minimum increasingly badly and diverges — the loss $w_t^2$ explodes as $1, 4, 16, 64, \\dots$',
    },
  ],
  comparisons: [
    {
      title: 'Batch vs Stochastic vs Mini-batch Gradient Descent',
      methods: ['Batch GD', 'Stochastic GD (SGD)', 'Mini-batch GD'],
      rows: [
        {
          dimension: 'Samples per update',
          values: ['All $N$ examples', 'A single example', 'A small batch of $B$ (e.g. 32-512)'],
        },
        {
          dimension: 'Per-step cost',
          values: ['High — one full pass per step', 'Very low — one example per step', 'Moderate — one batch per step'],
        },
        {
          dimension: 'Gradient noise',
          values: ['None (exact gradient)', 'High variance', 'Low-to-moderate, shrinks like $1/\\sqrt{B}$'],
        },
        {
          dimension: 'Convergence smoothness',
          values: ['Smooth, monotone on convex losses', 'Noisy, jittery path; can escape shallow minima', 'Fairly smooth with mild helpful noise'],
        },
        {
          dimension: 'Hardware / parallelism',
          values: ['Wastes memory; underuses vectorized hardware on huge data', 'Poor GPU utilization — no parallel batch', 'Excellent — batch fills GPU/SIMD lanes'],
        },
        {
          dimension: 'Typical use',
          values: ['Small datasets that fit in memory', 'Online / streaming settings', 'The default for deep learning'],
        },
      ],
      takeaway: 'Mini-batch GD is the practical sweet spot: it recovers most of the noise-reduction of batch GD while keeping cheap, frequent updates and saturating modern parallel hardware. Pure SGD survives mainly for streaming data; full batch GD only for small problems.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'The loss is **differentiable** in the parameters and the parameter space is too large for a closed-form solution (most neural networks).',
      'The dataset is large enough that computing exact full-batch gradients every step is wasteful — **mini-batch** updates give faster wall-clock progress.',
      'You can afford to **tune the learning rate** (and optionally a schedule), the dominant hyperparameter for convergence.',
    ],
    avoidWhen: [
      'The objective is **non-differentiable, discrete, or combinatorial** — use discrete/greedy search or gradient-free methods.',
      'A cheap **closed-form** optimum exists (e.g. small ordinary least squares) — solve it directly instead of iterating.',
      'The loss surface is so **ill-conditioned or noisy** that plain GD stalls — reach for momentum, Adam, or second-order methods rather than fighting the learning rate alone.',
    ],
    rulesOfThumb: [
      'Tune the learning rate first; if the loss diverges to NaN it is almost always too high — drop it by 3-10x.',
      'Pick the largest mini-batch that fits in memory and gives stable steps; powers of two (32, 64, 256) suit GPUs well.',
      'Roughly, scaling the batch size by $k$ lets you scale the learning rate by about $k$ (the linear scaling rule) up to a limit.',
      'Decay the learning rate over training (step, cosine, or warmup-then-decay) to settle into the minimum.',
    ],
  },
  caseStudies: [
    {
      title: 'Training ResNet-50 on ImageNet in one hour with large-batch SGD',
      domain: 'Large-scale deep learning',
      scenario: 'Training a ResNet-50 image classifier on ImageNet (1.28M images) with mini-batch SGD on a single machine took days. The question was whether the mini-batch could be scaled up massively across many GPUs to slash wall-clock time without hurting accuracy — naively, large batches were known to degrade final accuracy and destabilize early training.',
      approach: 'Scale the mini-batch from 256 to **8192** across 256 GPUs, apply the **linear scaling rule** (multiply the learning rate by the same factor the batch grew), and add a gradual **learning-rate warmup** over the first few epochs so the large-batch SGD does not diverge while gradients are still erratic.',
      outcome: 'The team trained ResNet-50 to the **same ~76% top-1 accuracy** as the small-batch baseline while cutting training time to about **1 hour**, with near-linear scaling efficiency across the 256 GPUs. It demonstrated that mini-batch SGD plus a principled learning-rate schedule (warmup + linear scaling) makes large-scale gradient descent both fast and stable.',
      source: {
        title: 'Accurate, Large Minibatch SGD: Training ImageNet in 1 Hour',
        authors: 'Goyal, P., Dollár, P., Girshick, R., et al.',
        url: 'https://arxiv.org/abs/1706.02677',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'During training the loss climbs and then blows up to NaN. The most likely cause is:',
      options: [
        { text: 'The learning rate is too large, so updates overshoot the minimum and diverge.', correct: true },
        { text: 'The learning rate is too small, so the model is stuck.', correct: false },
        { text: 'The gradient is exactly zero everywhere.', correct: false },
        { text: 'The dataset has too few features.', correct: false },
      ],
      explanation: 'For $L(w) = w^2$ the step multiplies $w$ by $(1 - 2\\eta)$; once $\\eta$ pushes that factor past magnitude 1 the iterates grow without bound. The same overshoot in deep nets sends the loss to infinity/NaN. A small learning rate would merely be slow, and a zero gradient would stall rather than explode.',
    },
    {
      question: 'Why can gradient descent fail to reach the global minimum on a deep-network loss surface?',
      options: [
        { text: 'The surface is non-convex, so the gradient also vanishes at local minima and saddle points where descent can stall.', correct: true },
        { text: 'Gradients cannot be computed for functions of many variables.', correct: false },
        { text: 'The learning rate is guaranteed to be too large.', correct: false },
        { text: 'Squared-error losses have no minimum.', correct: false },
      ],
      explanation: 'In non-convex landscapes the gradient is zero not only at the global optimum but also at local minima and saddle points, so plain descent can get trapped or crawl across flat regions. High-dimensional gradients are perfectly computable (via backprop), and the issue is independent of any single learning-rate choice.',
    },
    {
      question: 'Compared with full-batch gradient descent, the gradient used by stochastic gradient descent (SGD) is:',
      options: [
        { text: 'An unbiased but high-variance (noisy) estimate, computed far more cheaply per step.', correct: true },
        { text: 'A biased estimate that systematically points the wrong way.', correct: false },
        { text: 'Exactly equal to the batch gradient on every step.', correct: false },
        { text: 'Always smaller in magnitude than the batch gradient.', correct: false },
      ],
      explanation: 'A single-sample gradient is an unbiased estimator of the full-batch gradient — its expectation equals the true gradient — but it has high variance, producing a noisy, jittery path. The payoff is a very cheap update; mini-batching averages several samples to cut that variance roughly like $1/\\sqrt{B}$.',
    },
    {
      question: 'What does the negative gradient direction $-\\nabla L(\\mathbf{w})$ represent at the current point?',
      options: [
        { text: 'The direction of locally steepest decrease of the loss.', correct: true },
        { text: 'A straight line pointing directly at the global minimum.', correct: false },
        { text: 'The direction of steepest increase of the loss.', correct: false },
        { text: 'A direction along which the loss does not change.', correct: false },
      ],
      explanation: 'The gradient points in the direction of steepest *ascent*, so its negative is the direction of steepest *descent* — locally the fastest way to reduce the loss. It is only a local direction; it does not generally aim straight at the global minimum, which is why descent follows a curved path.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
