import { LearningModule } from "./types";

export const optimizationOptimizers: LearningModule = {
  id: "optimization-optimizers",
  title: "Optimization & Optimizers",
  category: "Machine Learning Concepts",
  prerequisites: ["backpropagation", "neural-networks"],
  tracks: ["modern-ai"],
  difficulty: 3,
  relatedModules: ["backpropagation", "neural-networks", "regularization"],
  shortDescription:
    "How neural networks actually learn: turning the gradients from backpropagation into parameter updates with SGD, momentum, RMSProp, and Adam — plus the learning-rate schedules and warmup that make training converge.",
  estimatedMinutes: 35,
  learningObjectives: [
    "Explain the spectrum from full-batch gradient descent to stochastic and mini-batch SGD, and the noise/throughput trade-off between them",
    "Describe how momentum accelerates descent along consistent directions and damps oscillation across ravines",
    "Explain how adaptive methods (RMSProp, Adam) rescale each parameter's step using a running estimate of gradient magnitude",
    "Choose a learning rate and schedule (decay, warmup) and recognize the symptoms of one that is too high or too low",
  ],
  keyTerms: [
    {
      term: "Mini-batch SGD",
      definition:
        "Estimating the gradient from a small random batch of examples each step. It trades a noisier gradient for far more updates per pass and good hardware utilization.",
    },
    {
      term: "Momentum",
      definition:
        "Accumulating an exponentially-decaying running average of past gradients (a 'velocity') and stepping with it, so consistent directions build speed and oscillations cancel.",
    },
    {
      term: "Adaptive Learning Rate",
      definition:
        "Giving each parameter its own effective step size from a running estimate of its gradient magnitude (RMSProp, Adam), so rarely-updated or small-gradient directions are not starved.",
    },
    {
      term: "Learning-Rate Warmup",
      definition:
        "Starting from a tiny learning rate and ramping up over the first steps, which stabilizes early training for large-batch and Transformer models before normal decay takes over.",
    },
  ],
  misconceptions: [
    {
      claim:
        "Stochastic gradient descent computes the true gradient of the loss each step.",
      correction:
        "SGD uses a *noisy estimate* of the gradient from one example or a mini-batch, not the full-dataset gradient. That noise is a feature: it adds many cheap updates per epoch and can help escape sharp minima and saddle points.",
    },
    {
      claim:
        "Adam is always the best optimizer, so you never need to tune or consider SGD.",
      correction:
        "Adam converges fast and is forgiving, but well-tuned SGD with momentum often generalizes better on vision tasks and is the standard there. The right optimizer is task-dependent; Adam (or AdamW) is the safe default for Transformers and sparse-gradient problems, not a universal winner.",
    },
    {
      claim:
        "A higher learning rate always means faster training.",
      correction:
        "Past a point, a larger learning rate overshoots the minimum and the loss oscillates or diverges; too small and training crawls or stalls. There is a sweet spot, and schedules (warmup then decay) move it over the course of training.",
    },
  ],
  references: [
    {
      title: "Adam: A Method for Stochastic Optimization",
      authors: "Kingma, D. P. and Ba, J.",
      url: "https://arxiv.org/abs/1412.6980",
      type: "paper",
    },
    {
      title: "Deep Learning (Chapter 8: Optimization for Training Deep Models)",
      authors: "Goodfellow, I., Bengio, Y. and Courville, A.",
      url: "https://www.deeplearningbook.org/",
      type: "textbook",
    },
    {
      title: "Decoupled Weight Decay Regularization (AdamW)",
      authors: "Loshchilov, I. and Hutter, F.",
      url: "https://arxiv.org/abs/1711.05101",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Learning rate too high — divergence or oscillation",
      description:
        "If the step size exceeds what the local curvature tolerates, updates overshoot the minimum: the loss bounces, plateaus high, or blows up to NaN, especially in steep (high-curvature) directions.",
      mitigation:
        "Reduce the learning rate, add warmup so early steps are gentle, clip gradients, and use an adaptive optimizer or a schedule that decays the rate over time.",
    },
    {
      name: "Slow crawl in flat or ill-conditioned directions",
      description:
        "On an ill-conditioned loss (steep in some directions, nearly flat in others), plain SGD takes tiny steps along the flat directions and can stall far from the minimum while zig-zagging across the steep ones.",
      mitigation:
        "Use momentum to accumulate speed along consistent directions, or an adaptive method (RMSProp/Adam) that rescales each coordinate; normalize/standardize inputs and use normalization layers to improve conditioning.",
    },
  ],
  fullDescription: `
Backpropagation hands you the gradient — the direction of steepest increase of the loss. An **optimizer** decides what to *do* with it: how big a step to take, whether to remember past steps, and whether to treat every parameter the same. Getting this right is often the difference between a model that trains and one that does not.

### The batch spectrum
- **Full-batch gradient descent** uses the entire dataset for one exact gradient per step — stable but slow and memory-hungry.
- **Stochastic gradient descent (SGD)** uses a single example: very noisy, but cheap and frequent.
- **Mini-batch SGD** (the default) uses a small batch — a sweet spot that balances gradient quality, update frequency, and GPU efficiency.

### Beyond vanilla SGD
Plain SGD struggles on realistic loss surfaces that are steep in some directions and flat in others. Two ideas fix this:

1. **Momentum** keeps a running 'velocity' of past gradients, so progress accelerates in consistent directions and oscillations across a ravine cancel out.
2. **Adaptive methods** (**RMSProp**, **Adam**) give each parameter its own step size based on the recent magnitude of its gradients, so small-gradient directions are not starved and large-gradient directions do not explode.

**Adam** combines momentum with per-parameter scaling and is the default for Transformers and many modern models; well-tuned **SGD + momentum** still rules much of computer vision. On top of the optimizer sits the **learning-rate schedule** — warmup to stabilize the start, then decay to settle into a minimum — which often matters as much as the optimizer choice itself.
  `,
  intuition: `
Imagine rolling a ball down a hilly landscape to find the lowest valley. The **gradient** tells the ball which way is downhill right where it sits. Plain **gradient descent** is a ball with no inertia: at every instant it moves straight downhill by a fixed fraction of the slope. In a long, narrow valley it wastes energy bouncing from wall to wall while barely creeping along the valley floor.

**Momentum** gives the ball mass. It builds up speed rolling consistently downhill and its side-to-side bounces cancel, so it shoots along the valley floor instead of pinballing. **Adaptive methods** are cleverer still: they notice that some directions are steep and others shallow and give each its own step size — big strides where the ground is flat, careful steps where it is steep — so no direction is neglected.

And the **learning rate** is how far the ball is allowed to move each tick. Too large and it leaps over the valley and out the other side (diverging); too small and it inches along forever. Schedules change this allowance over time: start cautious (warmup), then take big confident strides, then shorten the steps to settle gently at the bottom.
  `,
  mathematics: `
### 1. The update rule
Let $\\theta$ be the parameters, $L$ the loss, and $g_t = \\nabla_\\theta L(\\theta_t)$ the gradient (from backprop). Gradient descent steps against the gradient with learning rate $\\eta$:

$$ \\theta_{t+1} = \\theta_t - \\eta\\, g_t. $$

In mini-batch SGD, $g_t$ is estimated from a random batch, so it is an unbiased but noisy estimate of the full gradient.

### 2. Momentum
Accumulate a velocity $v_t$ as an exponentially-decaying average of gradients ($\\beta \\approx 0.9$), and step with it:

$$ v_t = \\beta\\, v_{t-1} + g_t, \\qquad \\theta_{t+1} = \\theta_t - \\eta\\, v_t. $$

Consistent gradient directions reinforce ($v$ grows); alternating directions cancel.

### 3. RMSProp and Adam
RMSProp keeps a running average of squared gradients $s_t$ and divides the step by its root, giving each coordinate an adaptive scale. **Adam** adds a momentum term and bias-corrects both moving averages:

$$ m_t = \\beta_1 m_{t-1} + (1-\\beta_1) g_t, \\qquad v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2, $$

$$ \\hat m_t = \\frac{m_t}{1-\\beta_1^{\\,t}}, \\quad \\hat v_t = \\frac{v_t}{1-\\beta_2^{\\,t}}, \\qquad \\theta_{t+1} = \\theta_t - \\eta\\,\\frac{\\hat m_t}{\\sqrt{\\hat v_t}+\\epsilon}. $$

With defaults $\\beta_1=0.9$, $\\beta_2=0.999$, $\\epsilon=10^{-8}$, each parameter's effective step is roughly $\\eta$ regardless of its gradient scale — which is why Adam is robust to per-parameter conditioning.
  `,
  pros: [
    "Mini-batch SGD turns an intractable full-dataset optimization into many cheap, frequent, hardware-friendly updates.",
    "Momentum and adaptive methods (Adam) handle ill-conditioned loss surfaces that stall plain SGD, often training far faster with less tuning.",
    "Learning-rate schedules (warmup + decay) give a reliable recipe for stable starts and well-settled minima across many architectures.",
  ],
  cons: [
    "Performance is highly sensitive to the learning rate and schedule, which usually need tuning and can fail loudly (divergence) or quietly (slow crawl).",
    "Adaptive optimizers store extra per-parameter state (Adam doubles the optimizer memory) and can generalize worse than tuned SGD on some tasks.",
    "Stochastic noise means runs are not exactly reproducible and convergence is to a local/flat region, not a guaranteed global minimum.",
  ],
  codeSnippet: `import torch

# A toy ill-conditioned quadratic: steep in y, flat in x.
def loss(p):
    return 0.5 * (0.3 * p[0] ** 2 + 3.0 * p[1] ** 2)

def run(make_opt, steps=40):
    p = torch.tensor([-2.4, 0.9], requires_grad=True)
    opt = make_opt([p])
    for _ in range(steps):
        opt.zero_grad()
        loss(p).backward()        # gradient from backprop
        opt.step()                # optimizer turns it into an update
    return loss(p).item()

lr = 0.1
print("SGD:      ", round(run(lambda P: torch.optim.SGD(P, lr=lr)), 4))
print("Momentum: ", round(run(lambda P: torch.optim.SGD(P, lr=lr, momentum=0.9)), 4))
print("RMSProp:  ", round(run(lambda P: torch.optim.RMSprop(P, lr=lr)), 4))
print("Adam:     ", round(run(lambda P: torch.optim.Adam(P, lr=lr)), 4))
# Momentum and Adam reach a far lower loss in the same number of steps because
# they make progress along the flat x-direction that plain SGD crawls through.`,
  tldr: [
    "Backprop gives the **gradient**; the **optimizer** turns it into a parameter update — choosing step size, memory of past steps, and per-parameter scaling.",
    "**Mini-batch SGD** is the default: a noisy gradient from a small batch buys many cheap, frequent, GPU-friendly updates.",
    "**Momentum** accumulates a velocity of past gradients, accelerating consistent directions and damping oscillation across ravines.",
    "**Adaptive methods** (RMSProp, **Adam**) rescale each parameter's step by its recent gradient magnitude, so flat directions are not starved — Adam = momentum + per-parameter scaling + bias correction.",
    "The **learning rate** has a sweet spot: too high diverges/oscillates, too low crawls. **Schedules** (warmup then decay) move it over training.",
    "**Adam/AdamW** is the safe default for Transformers; well-tuned **SGD+momentum** still wins much of computer vision — optimizer choice is task-dependent.",
  ],
  additionalSections: [
    {
      heading: "Derivation: Why Momentum Beats SGD in a Ravine",
      content: `
Consider the canonical hard case: an ill-conditioned quadratic loss $L(\\theta) = \\tfrac12(a\\,x^2 + b\\,y^2)$ with $a \\ll b$ — gently sloped along $x$, steeply sloped along $y$. The gradient is $g = (a x,\\; b y)$, so the two coordinates decouple and we can analyze each on its own.

**Plain SGD.** The update $\\theta_{t+1} = \\theta_t - \\eta g_t$ becomes, per coordinate,

$$ x_{t+1} = (1-\\eta a)\\,x_t, \\qquad y_{t+1} = (1-\\eta b)\\,y_t. $$

Stability requires $|1-\\eta b| < 1$ in the *steep* direction, which caps $\\eta < 2/b$. But progress in the *flat* direction shrinks $x$ by only the factor $(1-\\eta a)$ per step, and since $a \\ll b$ that factor is barely below 1 — $x$ crawls. So the steep direction *limits the learning rate* while the flat direction *needs a large one*: SGD either oscillates in $y$ or stalls in $x$ (or both). The number of steps to converge scales with the **condition number** $b/a$.

**Momentum.** With $v_t = \\beta v_{t-1} + g_t$ and $\\theta_{t+1} = \\theta_t - \\eta v_t$, the flat direction now *accumulates*: because $g_x = a x$ keeps the same sign step after step, the velocity $v_x$ grows toward a geometric sum, effectively multiplying the step by up to $1/(1-\\beta)$ (e.g. $10\\times$ at $\\beta=0.9$). In the steep direction the gradient flips sign as the iterate overshoots, so successive contributions to $v_y$ partially **cancel**, damping the oscillation. Momentum thus *speeds up exactly the slow direction and calms exactly the fast one* — it improves the effective condition number, reducing the steps-to-converge from roughly $b/a$ toward $\\sqrt{b/a}$. That is the whole reason it is standard practice.
      `,
    },
    {
      heading: "Derivation: Adam as Momentum Plus Per-Coordinate Normalization",
      content: `
Momentum fixes consistency but still uses one global learning rate for every parameter. Adam adds the missing piece: **per-coordinate step sizes** learned from the data.

Track two exponential moving averages of the gradient — the mean (first moment) and the uncentered variance (second moment):

$$ m_t = \\beta_1 m_{t-1} + (1-\\beta_1) g_t, \\qquad v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2. $$

Both start at zero, so early on they are biased toward zero; dividing by $1-\\beta_1^{t}$ and $1-\\beta_2^{t}$ removes that bias (crucial in the first dozens of steps). The update is then

$$ \\theta_{t+1} = \\theta_t - \\eta\\,\\frac{\\hat m_t}{\\sqrt{\\hat v_t}+\\epsilon}. $$

Read the ratio coordinate by coordinate. $\\hat m_t$ is the momentum-smoothed direction; $\\sqrt{\\hat v_t}$ is roughly the typical magnitude of that coordinate's recent gradients. Dividing one by the other makes the **effective step size approximately $\\eta$ for every parameter, independent of its gradient scale** — a coordinate with tiny gradients (a flat direction) is boosted, and one with huge gradients (a steep direction) is reined in. This is exactly the per-direction rescaling that the ravine analysis above wanted, but achieved adaptively from the gradient history rather than from known curvature. The cost is two extra buffers per parameter (so Adam uses ~3× the memory of plain SGD) and a known tendency to sometimes generalize slightly worse than tuned SGD — which is why **AdamW**, decoupling weight decay from the adaptive step, is the common modern default for large models.
      `,
    },
  ],
  comparisons: [
    {
      title: "SGD vs SGD+Momentum vs Adam",
      methods: ["SGD", "SGD + Momentum", "Adam"],
      rows: [
        {
          dimension: "Per-parameter adaptivity",
          values: ["None — one global rate", "None — one global rate", "Yes — per-coordinate scaling"],
        },
        {
          dimension: "Uses gradient history",
          values: ["No", "Yes — velocity", "Yes — 1st & 2nd moments"],
        },
        {
          dimension: "Behavior in ravines",
          values: ["Zig-zags / crawls", "Accelerates along the valley", "Handles uneven curvature well"],
        },
        {
          dimension: "Tuning sensitivity",
          values: ["High — learning rate critical", "Moderate", "Lower — forgiving defaults"],
        },
        {
          dimension: "Extra optimizer memory",
          values: ["None", "1× params (velocity)", "2× params (m and v)"],
        },
        {
          dimension: "Typical home",
          values: ["Simple/convex problems", "Computer vision (tuned)", "Transformers, sparse gradients"],
        },
      ],
      takeaway:
        "Reach for Adam/AdamW as a robust default (especially Transformers); invest in tuned SGD+momentum when you want the best generalization on vision tasks. Plain SGD is mostly a teaching baseline.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "Training any neural network — the optimizer and learning-rate schedule are core hyperparameters, not afterthoughts.",
      "Default to **Adam/AdamW** for Transformers, NLP, and problems with sparse or wildly-scaled gradients where its robustness shines.",
      "Choose well-tuned **SGD + momentum** when you can afford to tune and want top generalization, especially in computer vision.",
      "Add **warmup then decay** for large-batch training and Transformers, where a cold start at full learning rate is unstable.",
    ],
    avoidWhen: [
      "Don't crank the learning rate to 'train faster' — past the sweet spot it oscillates or diverges; use a schedule instead.",
      "Don't assume Adam is strictly best; on some vision benchmarks it generalizes worse than tuned SGD.",
      "Don't ignore optimizer memory on huge models — Adam's extra per-parameter state can be the difference between fitting and OOM.",
      "Don't expect any optimizer to rescue a badly-conditioned, unnormalized model — fix inputs/normalization first.",
    ],
    rulesOfThumb: [
      "Start with AdamW (lr ≈ 3e-4) for Transformers, or SGD+momentum (lr ≈ 0.1 with decay) for CNNs, then tune.",
      "If the loss explodes or NaNs, your learning rate is too high — halve it, add warmup, or clip gradients.",
      "Use a schedule (cosine or step decay) and warmup; the schedule often matters as much as the optimizer.",
    ],
  },
  caseStudies: [
    {
      title: "Adam becomes the default optimizer for training deep networks",
      domain: "Deep learning practice",
      scenario:
        "By 2014, practitioners faced a confusing menu of optimizers (SGD, momentum, AdaGrad, RMSProp), each needing careful, problem-specific learning-rate tuning. Training deep models with sparse or very unevenly-scaled gradients — common in NLP and recommendation — was especially fiddly.",
      approach:
        "Kingma and Ba combined momentum (a first-moment estimate) with RMSProp-style per-parameter scaling (a second-moment estimate) and added bias correction for the zero-initialized averages, yielding Adam — an optimizer with well-behaved default hyperparameters ($\\beta_1=0.9$, $\\beta_2=0.999$, $\\epsilon=10^{-8}$) that adapts each parameter's effective step automatically.",
      outcome:
        "Adam matched or beat the best-tuned alternatives across MNIST, CIFAR-10, and logistic-regression benchmarks while needing far less learning-rate tuning, and it has since become the **most widely used optimizer in deep learning** — the standard choice (with its AdamW variant) for training virtually every large Transformer. The Adam paper is among the most-cited works in modern machine learning.",
      source: {
        title: "Adam: A Method for Stochastic Optimization",
        authors: "Kingma, D. P. and Ba, J.",
        url: "https://arxiv.org/abs/1412.6980",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "What does mini-batch SGD use as its gradient at each step?",
      options: [
        {
          text: "A noisy but unbiased estimate of the full gradient, computed from a small random batch.",
          correct: true,
        },
        {
          text: "The exact full-dataset gradient, just computed more efficiently.",
          correct: false,
        },
        {
          text: "The gradient of the previous step, reused to save computation.",
          correct: false,
        },
        {
          text: "A second-order (Hessian) estimate of curvature.",
          correct: false,
        },
      ],
      explanation:
        "Mini-batch SGD averages the gradient over a small random batch, an unbiased but noisy estimate of the true full-dataset gradient. The noise is useful — it gives many cheap updates per epoch and can help escape saddle points and sharp minima.",
    },
    {
      question:
        "On a loss that is steep in one direction and nearly flat in another, why does momentum outperform plain SGD?",
      options: [
        {
          text: "It accumulates velocity along the consistent flat direction while oscillations in the steep direction cancel, improving the effective conditioning.",
          correct: true,
        },
        {
          text: "It computes the exact second derivative to rescale each step.",
          correct: false,
        },
        {
          text: "It increases the learning rate every step until convergence.",
          correct: false,
        },
        {
          text: "It ignores the steep direction entirely.",
          correct: false,
        },
      ],
      explanation:
        "In the flat direction the gradient keeps the same sign, so the velocity builds up and the step grows (up to ~1/(1−β)). In the steep direction the gradient flips sign as the iterate overshoots, so contributions cancel and oscillation is damped — momentum speeds the slow direction and calms the fast one.",
    },
    {
      question:
        "What does Adam add on top of momentum?",
      options: [
        {
          text: "Per-parameter step scaling from a running average of squared gradients, plus bias correction of both moving averages.",
          correct: true,
        },
        {
          text: "A guarantee of finding the global minimum.",
          correct: false,
        },
        {
          text: "Removal of the learning-rate hyperparameter entirely.",
          correct: false,
        },
        {
          text: "Exact line search along the gradient each step.",
          correct: false,
        },
      ],
      explanation:
        "Adam keeps a first moment (momentum) and a second moment (running average of squared gradients), bias-corrects both (they start at zero), and divides the step by √(second moment). This makes each parameter's effective step ≈ η regardless of its gradient scale — momentum plus per-coordinate normalization.",
    },
    {
      question:
        "Training loss starts bouncing around and then shoots up to NaN. What is the most likely cause and fix?",
      options: [
        {
          text: "The learning rate is too high — lower it, add warmup, or clip gradients.",
          correct: true,
        },
        {
          text: "The learning rate is too low — raise it sharply.",
          correct: false,
        },
        {
          text: "The batch size is too large — there is no remedy.",
          correct: false,
        },
        {
          text: "Momentum must be disabled; it always causes divergence.",
          correct: false,
        },
      ],
      explanation:
        "Oscillation that escalates to NaN is the classic signature of overshooting: the step exceeds what the local curvature tolerates, especially in steep directions. The remedies are to reduce the learning rate, warm it up gradually, decay it on a schedule, and/or clip gradients.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Explain, using an ill-conditioned (steep-in-one-direction, flat-in-another) loss, why plain SGD struggles and how momentum and Adam each address it differently.",
      expectedAnswerRubric:
        "A strong answer should explain that on an ill-conditioned quadratic the steep direction caps the stable learning rate (η < 2/curvature) while the flat direction needs a large step, so SGD either oscillates in the steep direction or crawls in the flat one, with steps-to-converge scaling with the condition number. It should state that momentum accumulates velocity along the consistent flat direction (boosting the step by up to 1/(1−β)) while sign-flipping gradients in the steep direction cancel and damp oscillation, improving effective conditioning toward √(condition number). It should explain that Adam instead normalizes each coordinate by a running estimate of its gradient magnitude (second moment, with bias correction), making the effective per-parameter step roughly η regardless of curvature — adaptive per-direction rescaling rather than known-curvature rescaling — at the cost of extra optimizer memory.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
