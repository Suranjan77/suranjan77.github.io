import { Algorithm } from "./types";

export const linearAlgebra: Algorithm = {
  id: "linear-algebra",
  title: "Linear Algebra & Data Structure",
  category: "Linear Algebra",
  shortDescription: "The structural foundation of algorithms, managing massive multidimensional datasets via matrices and vectors.",

  fullDescription: `
Whereas calculus elucidates the mechanism by which a machine learning algorithm learns, **linear algebra provides the mathematical structure for both the data and the model.** Machine learning is fundamentally synonymous with applied linear algebra.

An algorithm does not visually perceive an image; rather, it processes a matrix of numerical values representing pixel intensities. When mapping inputs (features) to outputs (predictions), the procedure transcends simple algebraic formulae; it fundamentally involves the linear transformation—stretching, rotating, and projecting—of highly dimensional data spaces utilising **Vectors and Matrices**.

### Vectors, Matrices, and Tensors
A **Scalar** is a singular numerical magnitude. A **Vector** is a one-dimensional array of numbers (representing a directed line segment in space). A **Matrix** is a two-dimensional rectangular array. A **Tensor** extends this to an N-dimensional arrangement. All empirical input data—from linguistic word embeddings to high-definition video frames—is ultimately encoded into one of these geometric constructs.

Contemporary machine learning inherently relies upon the reality that matrix operations—such as calculating the **Dot Product** between an input vector and a weight matrix—can be highly parallelised on Graphics Processing Units (GPUs). This computational efficiency is the primary catalyst that propelled neural networks from theoretical abstraction to modern prominence.

### Eigenvalues and Dimensionality
Linear algebra extends beyond data storage; it rigorously structures relational dynamics. Advanced concepts including **Eigenvalues, Eigenvectors, and Singular Value Decomposition (SVD)** permit algorithms such as Principal Component Analysis (PCA) to extract the maximal variance within chaotic data, effectively reducing its geometric complexity from thousands of dimensions into a concise, linearly separable subspace.
  `,

  intuition: `
Visualise an expansive, empty spatial volume with an origin coordinate definitively established at its centre.

1. **A Vector** is analogous to an arrow originating from the centre and extending to a specific spatial coordinate. It possesses both magnitude (length) and direction. An image of an object is mathematically just one exceptionally elongated vector extending into a million-dimensional space.
2. **A Dataset** constitutes a massive distribution of vectors radiating from the origin.
3. **A Matrix** functions as a structural transformation mechanism. It intercepts a vector and modifies it—potentially scaling it, compressing it, or unequivocally rotating it into a novel dimensional plane.

During the training phase of a neural network, the algorithm iteratively adjusts massive transformation matrices (the weights) to ensure that the complex distribution of input vectors is smoothly transformed and linearly separated. Machine learning, conceptually, is the derivation of the optimal geometric rotation of multidimensional space.
  `,

  mathematics: `
### 1. Vector Spaces and Dot Products
A vector $\\mathbf{x} = [x_1, x_2, \\dots, x_n]^T$ encapsulates $n$ distinct features. The **Dot Product** between an input vector $\\mathbf{x}$ and a parameter vector $\\mathbf{w}$ represents the fundamental arithmetic operation of predictive modelling:

$$ \\mathbf{w} \\cdot \\mathbf{x} = \\sum_{i=1}^{n} w_i x_i $$

Geometrically, this operation quantifies the degree of alignment between the input data and the learned parameters. A highly positive dot product indicates strong directional congruence.

### 2. Matrix Multiplication
A dataset comprising $m$ observations with $n$ features is codified as an $m \\times n$ matrix $\\mathbf{X}$. The simultaneous application of parameters to an entire dataset constitutes matrix multiplication:

$$ \\mathbf{Y} = \\mathbf{X} \\mathbf{W} + \\mathbf{b} $$

This elegant mathematical operation supersedes computationally expensive iterative loops and facilitates massively parallelised GPU computation.

### 3. Eigenvectors and Singular Value Decomposition
Given a square transformation matrix $A$, an **eigenvector** $v$ is a unique vector which, under the transformation $A$, solely scales in magnitude without altering its spatial orientation. The corresponding scaling factor is the **eigenvalue** $\\lambda$:

$$ A \\mathbf{v} = \\lambda \\mathbf{v} $$

For non-square matrices (typical of most empirical datasets), **Singular Value Decomposition (SVD)** is employed to decompose the data into its fundamental structural components: $\\mathbf{X} = \\mathbf{U} \\Sigma \\mathbf{V}^T$, isolating the directions of maximum variance and thereby providing the mathematical foundation for data compression and dimensionality reduction.
  `,

  pros: [
    "Matrix multiplication inherently facilitates massive hardware acceleration explicitly within modern GPUs and TPUs.",
    "The standardisation of data representation into rigorous multidimensional arrays permits disparate algorithms to interoperate seamlessly.",
    "Techniques such as SVD elegantly and computationally isolate deterministic signals from stochastic noise without necessitating labelled samples.",
    "Provides an exceptionally generalised framework: mathematical operations defined for a two-dimensional space scale flawlessly to an N-dimensional paradigm."
  ],

  cons: [
    "Extreme high dimensionality precipitates the 'Curse of Dimensionality'—distance metrics statistically deteriorate as spatial dimensions scale disproportionately.",
    "The inversion of massive matrices (a fundamental requirement for the Normal Equation in analytical linear regression) exhibits severe computational complexity ($O(N^3)$).",
    "Sparse matrices (predominantly populated with zeros, as seen in Natural Language Processing) consume immense memory resources by explicitly encoding null space unless computationally compressed.",
    "Condition number instability: highly correlated (collinear) features fundamentally warp vector spaces, precipitating extreme numerical instability during inversion."
  ],


  codeSnippet: ``
};
