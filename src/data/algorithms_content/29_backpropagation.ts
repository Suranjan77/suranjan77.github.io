import { LearningModule } from "./types";

export const backpropagation: LearningModule = {
  id: "backpropagation",
  title: "Backpropagation",
  category: "Backpropagation",
  prerequisites: ["calculus", "neural-networks"],
  tracks: ["modern-ai"],
  difficulty: 3,
  estimatedMinutes: 40,
  shortDescription: "The foundational algorithm for training neural networks, using the chain rule of calculus to compute loss gradients with respect to model weights.",
  learningObjectives: [
    "Construct and interpret a computational graph for arbitrary mathematical expressions.",
    "Formulate and apply the chain rule of calculus in reverse mode to compute local derivatives.",
    "Compute vector-Jacobian products to propagate gradients through multi-dimensional matrix operations.",
    "Debug common gradient issues including vanishing, exploding, and un-zeroed gradients.",
    "Implement gradient checking using finite differences to verify analytical derivative correctness."
  ],
  keyTerms: [
    {
      term: "Computational Graph",
      definition: "A directed graph where nodes represent mathematical operations (variables or gates) and edges represent the flow of data."
    },
    {
      term: "Chain Rule",
      definition: "A calculus formula for computing the derivative of the composition of two or more functions, representing the propagation of gradients."
    },
    {
      term: "Vector-Jacobian Product (VJP)",
      definition: "An efficient way to calculate backpropagation gradients for matrix operations, multiplying an incoming gradient vector by the Jacobian matrix of local derivatives."
    },
    {
      term: "Gradient Accumulation",
      definition: "The process of summing gradients over multiple mini-batches before executing a weight update step, useful for training with large effective batch sizes."
    }
  ],
  workedExamples: [
    {
      title: "Forward and Backward Pass on a Simple Expression",
      problem: "Given the mathematical function $f(x, y, z) = (x + y) \cdot z$, perform a forward pass and a backward pass for the inputs $x = -2$, $y = 5$, and $z = -4$. Find the gradients of the output with respect to the inputs.",
      solution: "First, let's introduce intermediate variables for the computational graph:\n- Let $q = x + y$, so the output is $f = q \cdot z$.\n\n### Forward Pass:\n- $q = -2 + 5 = 3$\n- $f = 3 \cdot (-4) = -12$\n\n### Backward Pass (using the chain rule):\n- We start at the end node: $\\frac{\\partial f}{\\partial f} = 1.0$.\n- Compute derivative with respect to $q$: $\\frac{\\partial f}{\\partial q} = z = -4$.\n- Compute derivative with respect to $z$: $\\frac{\\partial f}{\\partial z} = q = 3$.\n- Now propagate through the addition gate ($q = x + y$):\n  - $\\frac{\\partial q}{\\partial x} = 1.0$, so $\\frac{\\partial f}{\\partial x} = \\frac{\\partial f}{\\partial q} \\cdot \\frac{\\partial q}{\\partial x} = (-4) \\cdot 1.0 = -4$.\n  - $\\frac{\\partial q}{\\partial y} = 1.0$, so $\\frac{\\partial f}{\\partial y} = \\frac{\\partial f}{\\partial q} \\cdot \\frac{\\partial q}{\\partial y} = (-4) \\cdot 1.0 = -4$.\n\nThe final gradients are $\\frac{\\partial f}{\\partial x} = -4$, $\\frac{\\partial f}{\\partial y} = -4$, and $\\frac{\\partial f}{\\partial z} = 3$."
    }
  ],
  misconceptions: [
    {
      claim: "Backpropagation is a unique optimization algorithm that updates neural network weights.",
      correction: "Backpropagation is only the method used to compute the gradients of the loss function with respect to weights. The actual updating of the weights is performed by separate optimization algorithms like Stochastic Gradient Descent or Adam, using those computed gradients."
    },
    {
      claim: "Gradients must always be calculated analytically and implemented by hand.",
      correction: "Modern deep learning libraries use automatic differentiation (autograd) to build the computational graph dynamically and compute gradients automatically, though manual implementation remains crucial for custom operators and verification."
    }
  ],
  references: [
    {
      title: "Calculus on Computational Graphs: Backpropagation",
      authors: "Christopher Olah",
      url: "https://colah.github.io/posts/2015-08-Backprop/",
      type: "tutorial"
    },
    {
      title: "Deep Learning (Chapter 6.5)",
      authors: "Ian Goodfellow, Yoshua Bengio, and Aaron Courville",
      url: "https://www.deeplearningbook.org/",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: "Forgetting to Zero Gradients",
      description: "In frameworks like PyTorch, gradients accumulate by default. Forgetting to clear them leads to incorrect gradients representing values across multiple steps.",
      mitigation: "Always call the appropriate optimizer or model zero-gradient function at the beginning of each training step."
    },
    {
      name: "Vanishing and Exploding Gradients",
      description: "In very deep networks, multiplying many small or large local derivatives together causes gradients to shrink to zero or grow exponentially.",
      mitigation: "Use proper weight initialization (such as He/Xavier), activation functions like ReLU, and techniques like batch normalization and gradient clipping."
    }
  ],
  pros: [
    "Computational complexity scales linearly with the number of operations in the graph.",
    "Enables end-to-end training of deeply nested neural network architectures.",
    "Highly parallelizable and efficiently mapped to modern GPU hardware."
  ],
  cons: [
    "Can suffer from numerical instability in very deep or recurrent networks.",
    "Requires storing intermediate activations in memory for the backward pass.",
    "Hard to debug when intermediate gradients overflow or underflow."
  ],
  intuition: "Think of backpropagation as a game of telephone in reverse. In the forward pass, information flows from the inputs, through layers, to produce a final prediction. We measure how wrong the prediction was using a loss function. In the backward pass, we want to trace the error back to its sources. If a node contributed heavily to the error, it gets a large gradient. We do this step-by-step, starting from the final loss and working backward. Each node computes its local contribution to the rate of change and multiplies it by the incoming gradient from the step ahead. This recursive multiplying is the chain rule in action.",
  mathematics: "### Forward and Backward Chain Rule\n\nLet $y = g(x)$ and $z = f(y) = f(g(x))$. According to the chain rule, the derivative of the output $z$ with respect to the input $x$ is:\n$$\\frac{\\partial z}{\\partial x} = \\frac{\\partial z}{\\partial y} \\cdot \\frac{\\partial y}{\\partial x}$$\n\nIn a computational graph with multiple paths, if a variable $x$ influences both $u$ and $v$, which then influence the final loss $L$, the gradient is the sum of paths:\n$$\\frac{\\partial L}{\\partial x} = \\frac{\\partial L}{\\partial u} \\cdot \\frac{\\partial u}{\\partial x} + \\frac{\\partial L}{\\partial v} \\cdot \\frac{\\partial v}{\\partial x}$$\n\n### Vector-Jacobian Product (VJP)\n\nFor a matrix operation $\\mathbf{y} = f(\\mathbf{x})$ where $\\mathbf{x} \\in \\mathbb{R}^n$ and $\\mathbf{y} \\in \\mathbb{R}^m$, the local derivative is represented by the $m \\times n$ Jacobian matrix $\\mathbf{J}$:\n$$\\mathbf{J}_{ij} = \\frac{\\partial y_i}{\\partial x_j}$$\n\nGiven the incoming gradient of the loss with respect to the output, $\\frac{\\partial L}{\\partial \\mathbf{y}} \\in \\mathbb{R}^m$ (represented as a row vector), the gradient with respect to the input $\\frac{\\partial L}{\\partial \\mathbf{x}} \\in \\mathbb{R}^n$ is computed via vector-matrix multiplication:\n$$\\frac{\\partial L}{\\partial \\mathbf{x}} = \\frac{\\partial L}{\\partial \\mathbf{y}} \\mathbf{J}$$\nThis vector-Jacobian product avoids computing the full Jacobian matrix explicitly, which is crucial for high-dimensional computational efficiency.",
  fullDescription: "Backpropagation is reverse-mode automatic differentiation applied to compute the gradient of a loss function with respect to the weights of a neural network. It enables gradient descent and other gradient-based optimization algorithms to update weights and train deep representations.",
  codeSnippet: `/**
 * Simple Computational Graph Engine for Scalar Operations (Micrograd-like)
 */
export class Value {
  public grad: number = 0;
  private _backward: () => void = () => {};

  constructor(
    public data: number,
    public prev: Value[] = [],
    public op: string = ""
  ) {}

  add(other: Value): Value {
    const out = new Value(this.data + other.data, [this, other], "+");
    out._backward = () => {
      this.grad += out.grad;
      other.grad += out.grad;
    };
    return out;
  }

  mul(other: Value): Value {
    const out = new Value(this.data * other.data, [this, other], "*");
    out._backward = () => {
      this.grad += other.data * out.grad;
      other.grad += this.data * out.grad;
    };
    return out;
  }

  backward() {
    const topo: Value[] = [];
    const visited = new Set<Value>();

    function buildTopo(v: Value) {
      if (!visited.has(v)) {
        visited.add(v);
        for (const child of v.prev) {
          buildTopo(child);
        }
        topo.push(v);
      }
    }

    buildTopo(this);
    this.grad = 1;

    for (let i = topo.length - 1; i >= 0; i--) {
      topo[i]._backward();
    }
  }
}`,
  relatedModules: ["neural-networks", "gradient-descent", "transformers"]
};
