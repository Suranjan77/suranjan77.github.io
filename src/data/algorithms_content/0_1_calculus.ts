import { LearningModule } from "./types";

export const calculus: LearningModule = {
  id: "calculus",
  title: "Calculus & Optimisation",
  category: "Calculus",
  prerequisites: [],
  tracks: ['foundations'],
  difficulty: 1,
  relatedModules: ['linear-algebra', 'probability-theory'],
  shortDescription: "The math behind how AI learns from its mistakes by finding the fastest way to improve.",
  estimatedMinutes: 30,
  learningObjectives: [
    'Compute derivatives of common functions using differentiation rules',
    'Explain the geometric meaning of a gradient vector',
    'Apply the chain rule to compute gradients through composed functions',
    'Distinguish between partial derivatives and the full gradient',
  ],
  keyTerms: [
    { term: 'Derivative', definition: 'The instantaneous rate of change of a function with respect to its input.' },
    { term: 'Gradient', definition: 'A vector of partial derivatives pointing in the direction of steepest ascent.' },
    { term: 'Chain Rule', definition: 'A formula for computing the derivative of a composed function.' },
  ],
  workedExamples: [
    {
      title: 'Derivative of Mean Squared Error',
      problem: 'Given $L(w) = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - wx_i)^2$, compute $\\frac{dL}{dw}$.',
      solution: 'Apply the chain rule: $\\frac{dL}{dw} = \\frac{1}{n}\\sum_{i=1}^{n} 2(y_i - wx_i)(-x_i) = -\\frac{2}{n}\\sum_{i=1}^{n} x_i(y_i - wx_i)$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Gradient Descent always finds the absolute best global minimum.',
      correction: 'Gradient descent can get trapped in local minima or saddle points, especially in non-convex loss landscapes.'
    },
    {
      claim: 'A larger learning rate is always better because the model learns faster.',
      correction: 'If the learning rate is too large, the optimizer may overshoot the minimum and diverge, causing training to fail.'
    }
  ],
  references: [
    {
      title: "Calculus",
      authors: "Spivak, M",
      url: "https://www.publishorperish.com",
      type: "textbook"
    },
    {
      title: "Mathematics for Machine Learning",
      authors: "Deisenroth, M. P., Faisal, A. A. and Ong, C. S",
      url: "https://mml-book.github.io",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Vanishing Gradients',
      description: 'Gradients become extremely small during backpropagation, stopping weights from updating.',
      mitigation: 'Use activation functions like ReLU, skip connections, or batch normalization.'
    }
  ],

  fullDescription: `
Machine learning is really just a giant game of "getting better through trial and error." During training, an AI model tries to find the best possible settings to make the fewest mistakes. **Calculus is the math of continuous change**, and it gives our models the exact instructions they need to improve.

While linear algebra helps us calculate *how wrong* our model's predictions are, calculus tells us exactly *how to fix* the model's internal settings to make fewer mistakes next time. Without calculus, AI would just be guessing randomly. With it, models can take smart, calculated steps to get better after every single example they see.

### Moving Beyond High School Math

In high school calculus, you might have looked at simple curves with one variable, like $f(x)$. But modern AI models have millions or even billions of variables (we call them weights). Because of this, we need **Multivariate Calculus**. 

Instead of finding a single slope, the AI calculates a **Gradient**—a mathematical arrow made up of many slopes that points in the direction where the error increases the fastest. By taking a step in the *opposite* direction (a process called Gradient Descent), models like neural networks slowly walk down the hill until they reach the bottom, where the error is lowest.

The explosion of modern AI is mostly thanks to a specific trick from calculus called the **Chain Rule**. In computer science, we call this *backpropagation*. It's a clever way to figure out exactly how much a single tiny weight deep inside a neural network contributed to a mistake made at the very end.
  `,

  intuition: `
Imagine you're blindfolded and dropped somewhere in a hilly landscape. Your goal is to find the lowest point in the deepest valley (which represents making zero mistakes). Since you're blindfolded, you can't just look around and walk straight to the bottom.

Calculus is like feeling the slope of the ground right under your feet. 
By feeling the ground, you can figure out which way is uphill and which way is downhill. You then take a small step downhill. If you keep doing this—feeling the slope and taking a step down—you'll eventually reach the bottom of a valley.

In machine learning:
1. **The Landscape** is the error surface (all the possible mistakes the model could make).
2. **Your Coordinates** are the model's current settings (weights).
3. **Feeling the slope** is calculating the gradient vector $\\nabla L$.
4. **Taking a step downhill** is updating the model's weights to be slightly better.
  `,

  mathematics: `
### 1. The Derivative
A derivative simply measures how fast something is changing at a specific moment. Mathematically, it looks like this:

$$ f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h} $$

In machine learning, if $f(x)$ is our error (or loss), the derivative $f'(x)$ tells us exactly how much our error will go up or down if we tweak our parameter $x$ just a tiny bit.

### 2. Partial Derivatives and the Gradient
When we have lots of parameters $\\mathbf{w} = [w_1, w_2, ..., w_n]$, we calculate the slope for each one individually while pretending the others are frozen. When we put all these individual slopes together into a list, we call it the **Gradient**, $\\nabla L$:

$$ \\nabla L(\\mathbf{w}) = \\begin{bmatrix} \\frac{\\partial L}{\\partial w_1} \\\\ \\frac{\\partial L}{\\partial w_2} \\\\ \\vdots \\\\ \\frac{\\partial L}{\\partial w_n} \\end{bmatrix} $$

To improve the model, we subtract a small fraction of this gradient from our current weights. The size of the step we take is controlled by a setting called the learning rate, $\\alpha$:
$$ \\mathbf{w}_{new} = \\mathbf{w}_{old} - \\alpha \\nabla L(\\mathbf{w}_{old}) $$

### 3. The Chain Rule
The Chain Rule is the true hero of deep learning. It tells us how to find the derivative of functions that are stuffed inside other functions. If $y = f(u)$ and $u = g(x)$, the rule says:

$$ \\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} $$

Neural networks are basically just giant chains of functions: $Output = f_3(f_2(f_1(X)))$. The chain rule lets us work backwards from the final error, multiplying slopes together to figure out exactly how to adjust every single weight in the network.
  `,

  pros: [
    "It's the engine behind gradient descent, which is how almost all modern neural networks learn.",
    "The Chain Rule (via backpropagation) makes it incredibly efficient to train massive, deep networks.",
    "For simple problems (like linear regression), calculus can give us a math equation to find the absolute perfect answer instantly.",
    "It lets us use advanced tricks (like looking at the curvature of the error landscape) to speed up learning."
  ],

  cons: [
    "Calculus only works on smooth, continuous math functions. It can't handle sudden jumps or rigid rules like decision trees.",
    "Models can get stuck in 'local minima'—shallow valleys that aren't the true bottom, but the math thinks we're done because the ground is flat.",
    "Vanishing Gradients: In very deep networks, multiplying lots of tiny slopes together makes the final update so small that the AI stops learning.",
    "Exploding Gradients: On the flip side, multiplying large slopes together can cause updates to spiral out of control and crash the math."
  ],

  codeSnippet: `def numerical_gradient(f, x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)`,
  tldr: [
    'A **derivative** measures the instantaneous rate of change; in ML it tells us how the loss reacts to a tiny change in one parameter.',
    'The **gradient** $\\nabla L$ stacks every partial derivative and points in the direction of steepest *ascent* — so we step the opposite way to reduce loss.',
    'Gradient descent updates $\\mathbf{w} \\leftarrow \\mathbf{w} - \\alpha\\nabla L$; the **learning rate** $\\alpha$ is the key knob — too big diverges, too small crawls.',
    'The **chain rule** differentiates deeply nested functions, which is exactly what **backpropagation** does through the layers of a neural network.',
    'Calculus needs reasonably smooth functions; it struggles with saddle points, local minima, and vanishing/exploding gradients.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Why the Gradient Points Uphill',
      content: `
Why is the gradient specifically the direction of *steepest ascent*? Consider the rate of change of $L$ as we move away from $\\mathbf{w}$ along an arbitrary **unit** direction $\\mathbf{u}$. That rate is the directional derivative:

$$ D_{\\mathbf{u}} L = \\nabla L \\cdot \\mathbf{u} = \\lVert \\nabla L \\rVert \\, \\lVert \\mathbf{u} \\rVert \\cos\\theta = \\lVert \\nabla L \\rVert \\cos\\theta $$

where $\\theta$ is the angle between $\\nabla L$ and $\\mathbf{u}$ (and $\\lVert \\mathbf{u} \\rVert = 1$). This expression is largest when $\\cos\\theta = 1$, i.e. when $\\mathbf{u}$ points the **same way** as $\\nabla L$. Therefore the gradient is the direction of fastest increase, and $-\\nabla L$ is the direction of fastest decrease — which is exactly the direction we step during training.
      `,
    },
    {
      heading: 'Derivation: The Gradient Descent Update Rule',
      content: `
Why does subtracting the gradient actually lower the loss? Let $g = \\nabla L(\\mathbf{w})$ and take a small step $\\Delta\\mathbf{w} = -\\alpha g$. A first-order Taylor expansion gives:

$$ L(\\mathbf{w} - \\alpha g) \\approx L(\\mathbf{w}) + g^T(-\\alpha g) = L(\\mathbf{w}) - \\alpha \\lVert g \\rVert^2 $$

Because $\\lVert g \\rVert^2 \\ge 0$, the predicted change $-\\alpha\\lVert g\\rVert^2$ is non-positive for any $\\alpha > 0$: the loss goes **down** (strictly, unless $g = 0$, meaning we are already at a stationary point). The catch is that this is only a *local linear approximation* — it holds when $\\alpha$ is small enough. If $\\alpha$ is too large, the higher-order terms we dropped dominate and the step can overshoot and *increase* the loss. That is precisely the tension behind learning-rate tuning.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'Differentiate $f(x) = 3x^2 + 2x - 5$.',
      difficulty: 'warm-up',
      solution: 'Apply the power rule term by term: $f\'(x) = 6x + 2$. The constant $-5$ vanishes because its rate of change is zero.',
    },
    {
      prompt: 'Use the chain rule to differentiate $f(x) = (2x + 1)^3$.',
      difficulty: 'core',
      hint: 'Let $u = 2x + 1$, so $f = u^3$ and $\\frac{df}{dx} = \\frac{df}{du}\\cdot\\frac{du}{dx}$.',
      solution: '$\\frac{df}{du} = 3u^2$ and $\\frac{du}{dx} = 2$, so $f\'(x) = 3(2x+1)^2 \\cdot 2 = 6(2x+1)^2$.',
    },
    {
      prompt: 'Compute the gradient $\\nabla f$ of $f(w_1, w_2) = w_1^2 w_2 + w_2^3$.',
      difficulty: 'core',
      solution: 'Take each partial derivative, holding the other variable fixed. $\\frac{\\partial f}{\\partial w_1} = 2 w_1 w_2$ and $\\frac{\\partial f}{\\partial w_2} = w_1^2 + 3 w_2^2$. So $\\nabla f = [\\,2 w_1 w_2,\\; w_1^2 + 3 w_2^2\\,]$.',
    },
    {
      prompt: 'Minimize $L(w) = w^2$ by gradient descent from $w_0 = 4$ with learning rate $\\alpha = 0.1$. Compute $w_1$ and $w_2$ (two update steps).',
      difficulty: 'challenge',
      hint: 'The update rule is $w_{t+1} = w_t - \\alpha L\'(w_t)$, and $L\'(w) = 2w$.',
      solution: 'Step 1: $L\'(4) = 8$, so $w_1 = 4 - 0.1(8) = 3.2$. Step 2: $L\'(3.2) = 6.4$, so $w_2 = 3.2 - 0.1(6.4) = 2.56$. Each step moves toward the minimum at $w = 0$, with shrinking steps as the gradient itself shrinks.',
    },
  ],
  comparisons: [
    {
      title: 'Three ways to compute a derivative',
      methods: ['Analytical (by hand)', 'Numerical (finite difference)', 'Automatic (autodiff)'],
      rows: [
        {
          dimension: 'How it works',
          values: ['Apply symbolic rules manually', '$\\frac{f(x+h) - f(x-h)}{2h}$', 'Chain rule applied to elementary operations'],
        },
        {
          dimension: 'Accuracy',
          values: ['Exact', 'Approximate (truncation + round-off error)', 'Exact to machine precision'],
        },
        {
          dimension: 'Cost for many parameters',
          values: ['Tedious, often infeasible', 'Expensive: $O(n)$ function evaluations', 'Cheap: one backward pass (reverse mode)'],
        },
        {
          dimension: 'Typical role in ML',
          values: ['Building intuition and formulas', 'Gradient checking / unit tests', 'Training every modern deep network'],
        },
      ],
      takeaway: 'Autodiff yields exact gradients for the price of a single backward pass, which is why it powers PyTorch, JAX, and TensorFlow; numerical differentiation survives mainly as a sanity check on hand-derived gradients.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'Your loss and model are **differentiable** (or differentiable almost everywhere, like ReLU networks) with respect to the parameters.',
      'The parameter space is large — thousands to billions of weights — where closed-form solutions are infeasible.',
      'You can obtain gradients cheaply via **automatic differentiation**.',
    ],
    avoidWhen: [
      'The objective is **non-differentiable, discrete, or combinatorial** (e.g. choosing decision-tree splits) — use greedy or discrete search instead.',
      'There is no usable gradient signal or it is extremely noisy — consider gradient-free methods (evolutionary strategies, Bayesian optimization).',
      'A cheap **closed-form** solution already exists (e.g. small linear regression) — just solve it directly.',
    ],
    rulesOfThumb: [
      'Tune the learning rate before almost anything else — it is the single most important hyperparameter.',
      'If the loss diverges to NaN, the learning rate is almost always too high.',
      'When implementing gradients by hand, verify them with numerical gradient checking.',
    ],
  },
  caseStudies: [
    {
      title: 'Backpropagation at scale — the 2012 ImageNet breakthrough',
      domain: 'Computer vision',
      scenario: 'Before 2012, image classifiers on the ImageNet benchmark plateaued around a **26% top-5 error** using hand-engineered features. The open question was whether a deep neural network trained purely by gradient descent could do meaningfully better.',
      approach: 'AlexNet — a deep convolutional network with roughly **60 million parameters** — was trained by stochastic gradient descent with **backpropagation** (the chain rule applied layer by layer) on GPUs, using ReLU activations specifically to keep gradients from vanishing in the deep stack.',
      outcome: 'Top-5 error fell to about **15.3%**, versus **26.2%** for the next-best entry — a jump of nearly 11 percentage points that launched the modern deep-learning era. The enabling mathematics was nothing more exotic than the chain rule run backwards at scale, with ReLU preserving gradient flow.',
      source: {
        title: 'ImageNet Classification with Deep Convolutional Neural Networks',
        authors: 'Krizhevsky, A., Sutskever, I. and Hinton, G. E.',
        url: 'https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'The gradient $\\nabla L$ points in the direction of:',
      options: [
        { text: 'Steepest ascent of $L$.', correct: true },
        { text: 'Steepest descent of $L$.', correct: false },
        { text: 'The global minimum of $L$.', correct: false },
        { text: 'Zero curvature.', correct: false },
      ],
      explanation: 'The gradient points uphill — the direction in which $L$ increases fastest. That is exactly why gradient *descent* steps in the opposite direction, $-\\nabla L$. It points toward steeper loss locally, not directly at the global minimum.',
    },
    {
      question: 'Why might gradient descent fail to find the global minimum of a loss surface?',
      options: [
        { text: 'It can get stuck at local minima or saddle points where the gradient is nearly zero.', correct: true },
        { text: 'Derivatives do not exist for quadratic functions.', correct: false },
        { text: 'The learning rate is guaranteed to be too small.', correct: false },
        { text: 'Gradients computed by autodiff are only approximate.', correct: false },
      ],
      explanation: 'In non-convex landscapes the gradient vanishes not only at the global minimum but also at local minima and saddle points, so descent can halt or stall there. Quadratics are perfectly differentiable, and autodiff gradients are exact.',
    },
    {
      question: 'During training the loss suddenly explodes to NaN. The most likely cause is:',
      options: [
        { text: 'The learning rate is too large, so updates overshoot and diverge.', correct: true },
        { text: 'The learning rate is too small.', correct: false },
        { text: 'The dataset has too many examples.', correct: false },
        { text: 'The gradient is exactly zero.', correct: false },
      ],
      explanation: 'A too-large learning rate makes each step overshoot the minimum; the loss grows, gradients grow, and the values blow up to infinity/NaN. A tiny learning rate would merely make training slow, and a zero gradient would stall — not explode.',
    },
    {
      question: 'Backpropagation is essentially a systematic application of which rule of calculus?',
      options: [
        { text: 'The chain rule.', correct: true },
        { text: 'The fundamental theorem of calculus.', correct: false },
        { text: "L'Hopital's rule.", correct: false },
        { text: 'The product rule, exclusively.', correct: false },
      ],
      explanation: 'A neural network is a composition of functions, and backpropagation computes the derivative of the final loss with respect to each weight by multiplying local derivatives along the chain — the chain rule applied backwards through the layers.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
