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
  relatedModules: ["calculus", "neural-networks", "regularization"]
};
