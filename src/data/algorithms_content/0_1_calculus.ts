import { Algorithm } from "./types";

export const calculus: Algorithm = {
  id: "calculus",
  title: "Calculus & Optimization",
  category: "Calculus",
  shortDescription: "The mathematical engine of learning, driving how models minimize errors through gradients.",
  
  fullDescription: `
Machine Learning is fundamentally an optimization problem. When we train a model, we are asking a computational mechanism to navigate a massive, high-dimensional landscape of possibilities to find the lowest possible error. **Calculus is the language of continuous change** that provides the internal compass for this navigation.

If algebra tells us how to calculate the cost of a prediction, calculus tells us exactly *how to change* our model's internal parameters to make that cost smaller. Without calculus, algorithms would be forced to guess randomly in the dark. With it, models can smoothly descend error surfaces, making calculated adjustments after every observation.

### Moving Beyond Single Curves

While introductory calculus focuses on single variables $f(x)$, machine learning models typically involve millions or billions of variables (weights). This requires **Multivariate Calculus**. 
Instead of a single derivative, we calculate a **Gradient**—a vector of partial derivatives that points in the direction of steepest ascent. By moving in the opposite direction (Gradient Descent), we guide neural networks, regression models, and SVMs toward optimal parameters.

Modern AI exists precisely because of a specific application of the **Chain Rule** known in computer science as *backpropagation*, which allows us to instantly calculate how an error at the output of a deep network was influenced by a single weight buried dozens of layers deep.
  `,

  intuition: `
Imagine you are blindfolded on a rugged mountain range, and your goal is to find the deepest valley (the minimum error). You cannot see the landscape, so you cannot just teleport to the bottom. 

Calculus allows you to "feel" the slope of the ground directly beneath your feet. 
By calculating the derivative at your exact location, you determine which direction is uphill and which is downhill. You take a step straight downhill. If you repeat this process—feeling the slope and stepping down—you will eventually settle into a valley. 

In machine learning:
1. **The Mountain** is the Loss Surface (representing error).
2. **Your Coordinates** (latitude/longitude) are the model parameters (weights).
3. **Feeling the slope** is calculating the Gradient $\\nabla L$.
4. **Stepping down** is updating the weights.
  `,

  mathematics: `
### 1. The Derivative
A derivative measures the instantaneous rate of change of a function with respect to a single variable. Formally, it is defined by a limit:

$$ f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h} $$

In ML, if $f(x)$ is our Loss, $f'(x)$ tells us exactly how the Loss will change if we shift our parameter $x$ by a tiny amount.

### 2. Partial Derivatives & The Gradient
When dealing with multiple parameters $\\mathbf{w} = [w_1, w_2, ..., w_n]$, we compute isolated derivatives for each parameter while holding the others constant. The vector of all these partial derivatives is the **Gradient**, $\\nabla L$:

$$ \\nabla L(\\mathbf{w}) = \\begin{bmatrix} \\frac{\\partial L}{\\partial w_1} \\\\ \\frac{\\partial L}{\\partial w_2} \\\\ \\vdots \\\\ \\frac{\\partial L}{\\partial w_n} \\end{bmatrix} $$

The steepest descent update rule simply subtracts a portion of this gradient (scaled by a learning rate $\\alpha$):
$$ \\mathbf{w}_{new} = \\mathbf{w}_{old} - \\alpha \\nabla L(\\mathbf{w}_{old}) $$

### 3. The Chain Rule
The most consequential theorem powering deep learning is the Chain Rule. It tells us how to compute the derivative of nested functions. If $y = f(u)$ and $u = g(x)$, then:

$$ \\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} $$

Neural networks are just massive nested functions: $Output = f_3(f_2(f_1(X)))$. The chain rule lets us cleanly multiply backward through the network to distribute the blame for an error to every individual weight.
  `,

  pros: [
    "Powers Gradient Descent, the backbone of almost all modern neural networks and regression models.",
    "The Chain Rule allows efficient algorithmic scaling (Backpropagation) across deeply nested computation graphs.",
    "Provides analytical guarantees—if a loss function is convex (like in Linear Regression), calculus guarantees we can find the exact global minimum algebraically.",
    "Enables second-order optimization methods (like Newton's method using the Hessian matrix) which can navigate complex curvature much faster than standard gradients."
  ],
  
  cons: [
    "Calculus-based optimization strictly requires continuous, smooth, differentiable functions—it cannot seamlessly handle discrete step functions or rigid tree splits.",
    "It struggles with local minima: if the model rolls into a shallow valley, the gradient becomes zero, and the model falsely believes it has found the best possible solution.",
    "Vanishing Gradients: In deep architectures, multiplying many small derivatives via the Chain Rule can cause the gradient to shrink to zero, stopping learning entirely.",
    "Exploding Gradients: Conversely, multiplying large derivatives can scale the updates infinitely, causing the model parameters to fracture into NaN (Not a Number)."
  ],

  codeSnippet: `
# Foundational Concepts — no snippet required
`
};
