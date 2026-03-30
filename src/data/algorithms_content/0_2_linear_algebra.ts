import { Algorithm } from "./types";

export const linearAlgebra: Algorithm = {
  id: "linear-algebra",
  title: "Linear Algebra & Data Structure",
  category: "Linear Algebra",
  shortDescription: "The structural language of algorithms, handling massive multidimensional datasets through matrices and vectors.",
  
  fullDescription: `
While Calculus tells a machine learning algorithm *how* to learn, **Linear Algebra provides the actual physical structure for the data and the model.** Machine Learning is virtually synonymous with applied linear algebra.

An algorithm does not look at an image and see a cat; it sees a grid of millions of numbers representing pixel intensities. When we map inputs (features) to outputs (predictions), we aren't using single algebraic formulas; we are stretching, rotating, and projecting massive, highly-dimensional spaces of data using **Vectors and Matrices**.

### Vectors, Matrices, and Tensors
A **Scalar** is a single number. A **Vector** is a 1D array of numbers (an arrow in space). A **Matrix** is a 2D grid of numbers. A **Tensor** is an N-dimensional grid. Every piece of input data—from a word embedding to a high-definition video frame—is ultimately flattened into one of these geometric structures.

Modern machine learning completely relies on the fact that matrix operations—such as calculating the **Dot Product** between an input vector and a weight matrix—can be highly parallelized on Graphics Processing Units (GPUs). This single realization is what catapulted neural networks from theoretical concepts to dominating modern AI.

### Eigenvalues and Dimensionality
Linear algebra doesn't just store data; it structures relationships. Powerful concepts like **Eigenvalues, Eigenvectors, and Singular Value Decomposition (SVD)** allow algorithms like Principal Component Analysis (PCA) to extract the most important components of chaotic data, reducing its geometry from thousands of dimensions into a tightly packed, perfectly separated structure.
  `,

  intuition: `
Imagine a vast, empty room with an origin point painted in the exact center. 

1. **A Vector** is an arrow pointing from the origin to a specific location in that room. It has length (magnitude) and direction. A picture of an apple is just one exceedingly long arrow pointing into a million-dimensional room.
2. **A Dataset** is a massive cloud of arrows scattered around the origin.
3. **A Matrix** is a structural machine that intercepts an arrow and transforms it. It might stretch the arrow, squash it flat, or completely rotate it into a new dimension.

When a Neural Network learns, it is slowly adjusting massive Transformation Machines (matrices of weights) so that the messy cloud of input arrows smoothly morphs and aligns so that all "Cat" arrows point left, and all "Dog" arrows point right. Machine learning is just finding the optimal geometric rotation of space.
  `,

  mathematics: `
### 1. Vector Spaces & Dot Products
A vector $\\mathbf{x} = [x_1, x_2, \\dots, x_n]^T$ represents $n$ features. The **Dot Product** between an input vector $\\mathbf{x}$ and a weight vector $\\mathbf{w}$ is the fundamental building block of predictive models:

$$ \\mathbf{w} \\cdot \\mathbf{x} = \\sum_{i=1}^{n} w_i x_i $$

Geometrically, this measures how closely the input aligned with the learned weights. If they point in similar directions, the dot product is highly positive.

### 2. Matrix Multiplication
A dataset containing $m$ examples with $n$ features is stored as an $m \\times n$ matrix $\\mathbf{X}$. Applying weights to an entire dataset simultaneously is a matrix multiplication:

$$ \\mathbf{Y} = \\mathbf{X} \\mathbf{W} + \\mathbf{b} $$

This single elegant operation replaces massive \`for\` loops and allows for massively parallel GPU computation.

### 3. Eigenvectors and Singular Value Decomposition
Given a square transformation matrix $A$, an **eigenvector** $v$ is a unique arrow that, when transformed by $A$, only scales up or down—it does not change its angle. The scale factor is the **eigenvalue** $\\lambda$:

$$ A \\mathbf{v} = \\lambda \\mathbf{v} $$

For non-square matrices (most datasets), we use **SVD** to break the data apart into structural roots: $\\mathbf{X} = \\mathbf{U} \\Sigma \\mathbf{V}^T$, decomposing the dataset into the directions of largest variance, paving the way for data compression and dimensionality reduction.
  `,

  pros: [
    "Matrix multiplication enables massive hardware acceleration natively inside GPUs and TPUs.",
    "Data representation is standardized purely into neat multidimensional arrays, allowing disparate algorithms to interoperate freely.",
    "Techniques like SVD elegantly isolate the true signal from noise computationally fast without requiring labeled samples.",
    "Provides a clean generalized framework: equations written for 2-dimensional space instantly scale flawlessly to 2-million-dimensional space."
  ],
  
  cons: [
    "High dimensionality introduces the purely mathematical 'Curse of Dimensionality'—distance metrics break down as dimensions scale too high.",
    "Inverting massive matrices (required fundamentally for the Normal Equation in Linear Regression) scales terribly computationally ($O(N^3)$ complexity).",
    "Sparse matrices (mostly zeros, like in Natural Language Processing) consume immense memory explicitly tracking empty space if not compressed cleverly.",
    "Condition number instability: highly correlated features will fundamentally warp vector spaces, leading to extreme numerical instability."
  ],

  codeSnippet: `
# Foundational Concepts — no snippet required
`
};
