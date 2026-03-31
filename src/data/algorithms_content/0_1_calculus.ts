import { Algorithm } from "./types";

export const calculus: Algorithm = {
  id: "calculus",
  title: "Calculus & Optimisation",
  category: "Calculus",
  shortDescription: "The mathematical foundation of learning, dictating how mathematical models minimise error functions via gradient computation.",

  fullDescription: `
Machine learning is fundamentally an optimisation paradigm. During the training phase, a computational model navigates a vast, high-dimensional parameter space to identify a global or robust local minimum of an error function. **Calculus functions as the language of continuous change**, providing the analytical framework necessary for this traversal.

Whereas linear algebra facilitates the computation of predictive cost, calculus dictates precisely *how to adjust* the model's internal parameters to iteratively reduce that cost. Devoid of calculus, learning algorithms would be relegated to stochastic guessing. With it, models can systematically descend error surfaces, enacting calculated, infinitesimal adjustments following each observation.

### Moving Beyond Single-Variable Analysis

Whilst introductory calculus examines functions of a single variable $f(x)$, contemporary machine learning models incorporate millions or billions of parameters (weights). This necessitates the application of **Multivariate Calculus**. 
Rather than computing a single derivative, the algorithm calculates a **Gradient**—a mathematical vector composed of partial derivatives that indicates the direction of steepest ascent. By traversing in the requisite opposite direction (Gradient Descent), architectures such as neural networks, regression models, and Support Vector Machines are guided towards optimal parameter configurations.

The proliferation of modern artificial intelligence is largely attributable to a specific implementation of the **Chain Rule**, known within computer science as *backpropagation*. This algorithmic technique permits the instantaneous computation of how an error at the output layer of a deep network is modulated by a single interconnected weight located ostensibly dozens of layers prior.
  `,

  intuition: `
Consider navigating a rugged topographical terrain whilst blindfolded, with the objective of locating the deepest adjacent valley (representing minimum error). Without visual feedback of the landscape, instantaneous transposition to the global minimum is impossible. 

Calculus provides the mathematical equivalent of physically assessing the gradient of the terrain immediately beneath one's location. 
By computing the derivative at a precise coordinate, one ascertains the vector of steepest inclination and its corresponding declination. A discrete step is subsequently taken in the direction of steepest descent. Iterating this procedure—assessing the local gradient and descending accordingly—will asymptotically lead the model to converge within a local minimum. 

Within the context of machine learning:
1. **The Terrain** represents the loss surface (characterising the error function).
2. **The Coordinates** correspond to the model parameters (weights).
3. **Assessing the local gradient** equates to calculating the gradient vector $\\nabla L$.
4. **Descending the terrain** corresponds to updating the model weights.
  `,

  mathematics: `
### 1. The Derivative
A mathematical derivative quantifies the instantaneous rate of change of a function with respect to a single independent variable. Formally, it is articulated as a limit:

$$ f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h} $$

In the domain of machine learning, if $f(x)$ denotes the loss function, $f'(x)$ specifies precisely how the loss will fluctuate given an infinitesimal perturbation to the parameter $x$.

### 2. Partial Derivatives and the Gradient
When operating with a multivariate parameter space $\\mathbf{w} = [w_1, w_2, ..., w_n]$, isolated derivatives are computed for each individual parameter whilst holding the remainder constant. The vector comprising all such partial derivatives is defined as the **Gradient**, $\\nabla L$:

$$ \\nabla L(\\mathbf{w}) = \\begin{bmatrix} \\frac{\\partial L}{\\partial w_1} \\\\ \\frac{\\partial L}{\\partial w_2} \\\\ \\vdots \\\\ \\frac{\\partial L}{\\partial w_n} \\end{bmatrix} $$

The steepest descent parameter update rule subtracts a fraction of this gradient vector (scaled by a hyperparameter termed the learning rate, $\\alpha$):
$$ \\mathbf{w}_{new} = \\mathbf{w}_{old} - \\alpha \\nabla L(\\mathbf{w}_{old}) $$

### 3. The Chain Rule
Arguably the most consequential theorem facilitating deep learning is the Chain Rule. It prescribes the methodology for computing the derivative of composite functions. Given $y = f(u)$ and $u = g(x)$, the rule states:

$$ \\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} $$

Neural architectures are structurally analogous to immense composite functions: $Output = f_3(f_2(f_1(X)))$. The chain rule furnishes the mechanism to systematically propagate derivatives backwards through the network, correctly attributing proportional responsibility for an output error to every constituent weight.
  `,

  pros: [
    "Facilitates gradient descent, constituting the foundational optimisation mechanism for contemporary neural networks and regression architectures.",
    "The Chain Rule permits highly efficient algorithmic scaling (via Backpropagation) across deeply nested computational graphs.",
    "Provides robust analytical guarantees; given a strictly convex loss function (e.g., in linear regression), calculus ensures the algebraic derivation of the exact global minimum.",
    "Enables the utilisation of second-order optimisation techniques (such as Newton's method incorporating the Hessian matrix) to optimally navigate complex geometric curvature."
  ],

  cons: [
    "Calculus-centric optimisation demands strictly continuous, smooth, and differentiable functions, rendering it incompatible with discrete step functions or rigid algorithmic tree splits.",
    "It exhibits vulnerability to convergence at suboptimal local minima: upon reaching a shallow local depression, the resultant gradient vanishes, erroneously suggesting the attainment of a global optima.",
    "Vanishing Gradients phenomenon: Within deeply stacked architectures, the multiplication of infinitesimally small derivatives via the Chain Rule can attenuate the gradient to zero, resulting in a cessation of algorithmic learning.",
    "Exploding Gradients phenomenon: Conversely, the recursive multiplication of excessively large derivatives can infinitely scale parameter updates, leading directly to numerical instability (Not a Number errors)."
  ],

  codeSnippet: ``
};
