import { LearningModule } from "./types";

export const linearAlgebra: LearningModule = {
  id: "linear-algebra",
  title: "Linear Algebra & Data Structure",
  category: "Linear Algebra",
  prerequisites: [],
  tracks: ['foundations'],
  difficulty: 1,
  relatedModules: ['calculus'],
  shortDescription: "The structural foundation of algorithms, managing massive multidimensional datasets via matrices and vectors.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Compute vector operations such as addition, scalar multiplication, and dot products',
    'Perform matrix multiplication and explain the dimension compatibility rules',
    'Describe the geometric interpretation of linear independence and matrix span',
    'Explain the concept of eigenvalues and eigenvectors and their application in dimensionality reduction',
  ],
  keyTerms: [
    { term: 'Vector', definition: 'An ordered list of numbers representing a coordinate point or direction in space.' },
    { term: 'Matrix', definition: 'A 2D array of numbers that represents a linear transformation.' },
    { term: 'Eigenvector', definition: 'A non-zero vector whose direction does not change when a linear transformation is applied.' },
  ],
  workedExamples: [
    {
      title: 'Matrix Multiplication',
      problem: 'Compute $C = AB$ where $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ and $B = \\begin{bmatrix} 5 \\\\ 6 \\end{bmatrix}$.',
      solution: '$C = \\begin{bmatrix} 1 \\times 5 + 2 \\times 6 \\\\ 3 \\times 5 + 4 \\times 6 \\end{bmatrix} = \\begin{bmatrix} 17 \\\\ 39 \\end{bmatrix}$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Matrix multiplication is always commutative ($AB = BA$).',
      correction: 'Matrix multiplication is non-commutative in general. Changing the order of multiplication represents applying transformations in a different sequence.'
    },
    {
      claim: 'A matrix must be invertible to be useful.',
      correction: 'Many matrices in machine learning are not invertible (singular), which is why we use techniques like pseudoinverse or regularization.'
    }
  ],
  references: [
    {
      title: "Introduction to Linear Algebra",
      authors: "Strang, G",
      url: "https://math.mit.edu/~gs/",
      type: "textbook"
    },
    {
      title: "Linear Algebra and Learning from Data",
      authors: "Strang, G",
      url: "https://math.mit.edu/~gs/",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Singular Matrix (Determinant = 0)',
      description: 'Attempting to invert a singular matrix leads to computational errors and division by zero.',
      mitigation: 'Use the Moore-Penrose pseudoinverse or add a small identity matrix component (L2 regularization).'
    }
  ],

  fullDescription: `
While calculus explains *how* a machine learning algorithm learns, **linear algebra provides the actual structure for the data and the model.** In many ways, machine learning is just applied linear algebra.

An AI doesn't "see" an image the way we do; instead, it looks at a grid of numbers representing pixel colors. When an algorithm turns inputs (like an image) into outputs (like "that's a cat"), it's not just doing simple math. It's actually stretching, rotating, and squishing massive amounts of data using **Vectors and Matrices**.

### Vectors, Matrices, and Tensors
A **Scalar** is just a single number. A **Vector** is a list of numbers (like a line pointing somewhere in space). A **Matrix** is a 2D grid of numbers (like a spreadsheet). A **Tensor** is just a grid with even more dimensions (like a cube of numbers). Every piece of data in AI—from words in a sentence to frames in a video—is eventually turned into one of these shapes.

Modern AI is only possible because operations on these shapes—like multiplying an input vector by a weight matrix—can be done incredibly fast on graphics cards (GPUs). This speed is what took neural networks from a cool idea to a world-changing technology.

### Eigenvalues and Dimensionality
Linear algebra isn't just for storing data; it also helps us find hidden patterns. Advanced ideas like **Eigenvalues, Eigenvectors, and Singular Value Decomposition (SVD)** help algorithms (like Principal Component Analysis) find the most important information in a messy dataset. They can take data with thousands of confusing dimensions and squash it down into a simple, easy-to-understand space.
  `,

  intuition: `
Imagine a huge, empty 3D room with a starting point right in the middle.

1. **A Vector** is like an arrow pointing from the center to a specific spot in the room. It has a length and a direction. To an AI, a picture is just one incredibly long arrow pointing into a space with millions of dimensions.
2. **A Dataset** is a massive cloud of these arrows, all starting from the center.
3. **A Matrix** is like a machine that grabs an arrow and changes it—maybe stretching it, squishing it, or rotating it to point somewhere entirely new.

When a neural network is learning, it's constantly tweaking these massive "machines" (the weight matrices) to make sure the cloud of input arrows gets rotated and stretched until the different categories (like cats and dogs) are neatly separated. Machine learning is basically just finding the perfect way to rotate space!
  `,

  mathematics: `
### 1. Vector Spaces and Dot Products
A vector $\\mathbf{x} = [x_1, x_2, \\dots, x_n]^T$ holds $n$ different features. The **Dot Product** between an input vector $\\mathbf{x}$ and a weight vector $\\mathbf{w}$ is the most basic math operation in AI:

$$ \\mathbf{w} \\cdot \\mathbf{x} = \\sum_{i=1}^{n} w_i x_i $$

Visually, this operation measures how much the input data lines up with what the model is looking for. A big positive number means they point in the same direction!

### 2. Matrix Multiplication
If we have a dataset with $m$ examples and $n$ features, we can write it as an $m \\times n$ matrix $\\mathbf{X}$. Applying our model's weights to the whole dataset at once is called matrix multiplication:

$$ \\mathbf{Y} = \\mathbf{X} \\mathbf{W} + \\mathbf{b} $$

This beautiful piece of math replaces slow, repetitive loops in code and lets GPUs process millions of examples at the exact same time.

### 3. Eigenvectors and Singular Value Decomposition
Imagine a matrix $A$ that stretches and rotates space. An **eigenvector** $v$ is a special arrow that doesn't change direction when $A$ transforms it—it only gets longer or shorter. The amount it stretches or shrinks is the **eigenvalue** $\\lambda$:

$$ A \\mathbf{v} = \\lambda \\mathbf{v} $$

For datasets that aren't perfectly square, we use **Singular Value Decomposition (SVD)** to break the data down into its core building blocks: $\\mathbf{X} = \\mathbf{U} \\Sigma \\mathbf{V}^T$. This helps us find the directions where the data varies the most, which is the secret sauce behind data compression and reducing dimensions.
  `,

  pros: [
    "Matrix math is perfect for modern GPUs and TPUs, allowing for massive speedups.",
    "Turning all data into standard grids (tensors) lets different algorithms work together easily.",
    "Tricks like SVD can magically separate important signals from random noise without needing labeled data.",
    "It scales perfectly: math that works in 2D space works exactly the same way in a million-dimensional space."
  ],

  cons: [
    "The 'Curse of Dimensionality': As you add more dimensions, everything gets incredibly far apart, making it hard for algorithms to find patterns.",
    "Doing complex math on massive matrices (like finding the inverse) is extremely slow and takes a lot of computing power.",
    "Sparse matrices (grids filled mostly with zeros, common in text processing) can waste huge amounts of memory if not handled carefully.",
    "If your features are too similar to each other, it can warp the math space and cause the algorithm to crash or give crazy answers."
  ],


  codeSnippet: `import numpy as np

def dot_product(v1, v2):
    return np.dot(v1, v2)`,
  tldr: [
    'A **vector** is a list of numbers (a point/direction in space); a **matrix** is a 2D grid that encodes a linear transformation; a **tensor** generalizes this to more dimensions.',
    'The **dot product** $\\mathbf{w} \\cdot \\mathbf{x} = \\sum_i w_i x_i = \\lVert\\mathbf{w}\\rVert\\,\\lVert\\mathbf{x}\\rVert\\cos\\theta$ measures alignment: positive means same direction, zero means orthogonal.',
    'Matrix multiplication $C = AB$ needs the inner dimensions to match ($A$ is $m\\times k$, $B$ is $k\\times n$) and is **not commutative**: $AB \\neq BA$ in general.',
    'An **eigenvector** $\\mathbf{v}$ satisfies $A\\mathbf{v} = \\lambda\\mathbf{v}$ — its direction is unchanged by $A$, only scaled by the eigenvalue $\\lambda$.',
    'A matrix is **invertible** exactly when its determinant is non-zero (full rank); **SVD** $X = U\\Sigma V^T$ always exists and powers PCA, compression, and the pseudoinverse.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Orthogonal Projection and the Least-Squares Normal Equations',
      content: `
The single most reused idea in machine learning is **projecting a vector onto a subspace** — it underlies least squares, PCA, and the pseudoinverse. Let us build it from the dot product.

**Projecting onto a single vector.** Suppose we want the component of $\\mathbf{b}$ that lies along a direction $\\mathbf{a}$. Write the projection as a scalar multiple $\\hat{\\mathbf{b}} = c\\,\\mathbf{a}$. The error $\\mathbf{b} - c\\mathbf{a}$ must be **orthogonal** to $\\mathbf{a}$, so their dot product is zero:

$$ \\mathbf{a}^T(\\mathbf{b} - c\\mathbf{a}) = 0 \\quad\\Longrightarrow\\quad \\mathbf{a}^T\\mathbf{b} = c\\,\\mathbf{a}^T\\mathbf{a} \\quad\\Longrightarrow\\quad c = \\frac{\\mathbf{a}^T\\mathbf{b}}{\\mathbf{a}^T\\mathbf{a}} $$

So the projection is $\\hat{\\mathbf{b}} = \\dfrac{\\mathbf{a}^T\\mathbf{b}}{\\mathbf{a}^T\\mathbf{a}}\\,\\mathbf{a}$. The geometry — "drop a perpendicular" — is encoded entirely by setting a dot product to zero.

**Projecting onto a subspace (least squares).** Now replace the single direction $\\mathbf{a}$ with the column space of a matrix $A$ (each column is one feature). We want the vector $\\hat{\\mathbf{x}}$ such that $A\\hat{\\mathbf{x}}$ is as close as possible to a target $\\mathbf{b}$ that generally does **not** lie in the column space. The residual $\\mathbf{b} - A\\hat{\\mathbf{x}}$ must be orthogonal to **every** column of $A$, i.e. to the whole column space:

$$ A^T(\\mathbf{b} - A\\hat{\\mathbf{x}}) = \\mathbf{0} $$

Rearranging gives the **normal equations**:

$$ A^T A\\,\\hat{\\mathbf{x}} = A^T\\mathbf{b} \\quad\\Longrightarrow\\quad \\hat{\\mathbf{x}} = (A^T A)^{-1} A^T \\mathbf{b} $$

The matrix $(A^T A)^{-1} A^T$ is the **Moore–Penrose pseudoinverse** $A^{+}$. It exists whenever $A$ has full column rank so that $A^T A$ is invertible. This is exactly the formula that the Linear Regression module solves for its weights — least squares *is* an orthogonal projection of the targets onto the span of the features.
      `,
    },
    {
      heading: 'Why SVD Gives the Best Low-Rank Approximation',
      content: `
Every real matrix $X$ (shape $m \\times n$) factors as a **Singular Value Decomposition**:

$$ X = U \\Sigma V^T = \\sum_{i=1}^{r} \\sigma_i\\, \\mathbf{u}_i \\mathbf{v}_i^T $$

where $U$ and $V$ are orthogonal (their columns are orthonormal directions), and $\\Sigma$ is diagonal with the **singular values** $\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge \\sigma_r > 0$ sorted from largest to smallest. Each term $\\sigma_i \\mathbf{u}_i \\mathbf{v}_i^T$ is a rank-1 building block, and they are ordered by importance.

**The key theorem (Eckart–Young).** If you are allowed only $k$ building blocks, the best possible rank-$k$ approximation — in both the Frobenius and spectral norms — is to keep the $k$ *largest* singular values and truncate the rest:

$$ X_k = \\sum_{i=1}^{k} \\sigma_i\\, \\mathbf{u}_i \\mathbf{v}_i^T, \\qquad \\min_{\\operatorname{rank}(B) \\le k} \\lVert X - B \\rVert_F = \\lVert X - X_k \\rVert_F = \\sqrt{\\sum_{i=k+1}^{r} \\sigma_i^2} $$

The error left over is governed entirely by the singular values you *discarded*. Since the total "energy" of the matrix is $\\lVert X \\rVert_F^2 = \\sum_i \\sigma_i^2$, the fraction of energy retained by keeping the top $k$ components is:

$$ \\text{energy retained} = \\frac{\\sum_{i=1}^{k} \\sigma_i^2}{\\sum_{i=1}^{r} \\sigma_i^2} $$

This is the precise sense in which SVD finds "the directions where the data varies most." **PCA** is SVD applied to mean-centered data: the right singular vectors $\\mathbf{v}_i$ are the principal axes, and $\\sigma_i^2$ is proportional to the variance captured along axis $i$. Because the singular values typically decay fast, a handful of components often retain ~90% of the energy while throwing away most of the storage — the basis of image compression and dimensionality reduction.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'Compute the dot product of $\\mathbf{a} = [2,\\,-1,\\,3]$ and $\\mathbf{b} = [4,\\,0,\\,1]$, then state whether the angle between them is acute, right, or obtuse.',
      difficulty: 'warm-up',
      solution: 'Dot product $\\mathbf{a}\\cdot\\mathbf{b} = (2)(4) + (-1)(0) + (3)(1) = 8 + 0 + 3 = 11$. Since $\\mathbf{a}\\cdot\\mathbf{b} = \\lVert\\mathbf{a}\\rVert\\lVert\\mathbf{b}\\rVert\\cos\\theta$ and the magnitudes are positive, a **positive** dot product means $\\cos\\theta > 0$, so the angle is **acute** (the vectors point in broadly the same direction).',
    },
    {
      prompt: 'Given $A = \\begin{bmatrix} 1 & 2 \\\\ 0 & 3 \\end{bmatrix}$ and $B = \\begin{bmatrix} 4 & 1 \\\\ 2 & 0 \\end{bmatrix}$, compute both $AB$ and $BA$ and confirm they differ.',
      difficulty: 'core',
      hint: 'Entry $(i,j)$ of the product is the dot product of row $i$ of the left matrix with column $j$ of the right matrix.',
      solution: '$AB = \\begin{bmatrix} 1\\cdot4 + 2\\cdot2 & 1\\cdot1 + 2\\cdot0 \\\\ 0\\cdot4 + 3\\cdot2 & 0\\cdot1 + 3\\cdot0 \\end{bmatrix} = \\begin{bmatrix} 8 & 1 \\\\ 6 & 0 \\end{bmatrix}$. $BA = \\begin{bmatrix} 4\\cdot1 + 1\\cdot0 & 4\\cdot2 + 1\\cdot3 \\\\ 2\\cdot1 + 0\\cdot0 & 2\\cdot2 + 0\\cdot3 \\end{bmatrix} = \\begin{bmatrix} 4 & 11 \\\\ 2 & 4 \\end{bmatrix}$. Since $\\begin{bmatrix} 8 & 1 \\\\ 6 & 0 \\end{bmatrix} \\neq \\begin{bmatrix} 4 & 11 \\\\ 2 & 4 \\end{bmatrix}$, matrix multiplication is **not commutative**.',
    },
    {
      prompt: 'Find the eigenvalues of $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$.',
      difficulty: 'core',
      hint: 'Solve $\\det(A - \\lambda I) = 0$. For a $2\\times2$ matrix this is $\\lambda^2 - (\\text{trace})\\lambda + \\det = 0$.',
      solution: 'The characteristic equation is $\\det\\begin{bmatrix} 2-\\lambda & 1 \\\\ 1 & 2-\\lambda \\end{bmatrix} = (2-\\lambda)^2 - 1 = 0$. Expanding: $(2-\\lambda)^2 = 1 \\Rightarrow 2-\\lambda = \\pm 1$, giving $\\lambda = 1$ and $\\lambda = 3$. Check: trace $= 2+2 = 4 = \\lambda_1 + \\lambda_2 = 1 + 3$ and $\\det = 4 - 1 = 3 = \\lambda_1\\lambda_2 = 1\\cdot3$. The eigenvalues are $\\lambda = 1$ and $\\lambda = 3$.',
    },
    {
      prompt: 'For the matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$ from the previous exercise, find a unit eigenvector for the eigenvalue $\\lambda = 3$, and explain geometrically what $A$ does to that direction.',
      difficulty: 'challenge',
      hint: 'Solve $(A - 3I)\\mathbf{v} = \\mathbf{0}$ for the direction, then normalize it to length 1.',
      solution: 'Solve $(A - 3I)\\mathbf{v} = \\begin{bmatrix} -1 & 1 \\\\ 1 & -1 \\end{bmatrix}\\begin{bmatrix} v_1 \\\\ v_2 \\end{bmatrix} = \\mathbf{0}$. Both rows give $-v_1 + v_2 = 0$, i.e. $v_1 = v_2$. So any multiple of $[1, 1]^T$ works; normalizing by its length $\\sqrt{2}$ gives the unit eigenvector $\\mathbf{v} = \\tfrac{1}{\\sqrt{2}}[1, 1]^T$. Geometrically, $A$ leaves this $45^\\circ$ diagonal direction pointing exactly the same way but **stretches it by a factor of 3** ($A\\mathbf{v} = 3\\mathbf{v}$). (The other eigenvector $[1,-1]^T$ is only scaled by 1, i.e. left unchanged.)',
    },
  ],
  comparisons: [
    {
      title: 'Vector Norms: L1 vs L2 vs L∞',
      methods: ['L1 (Manhattan)', 'L2 (Euclidean)', 'L∞ (Max)'],
      rows: [
        {
          dimension: 'Definition',
          values: ['$\\lVert\\mathbf{x}\\rVert_1 = \\sum_i |x_i|$', '$\\lVert\\mathbf{x}\\rVert_2 = \\sqrt{\\sum_i x_i^2}$', '$\\lVert\\mathbf{x}\\rVert_\\infty = \\max_i |x_i|$'],
        },
        {
          dimension: 'Value of $[3, 4]$',
          values: ['$3 + 4 = 7$', '$\\sqrt{9+16} = 5$', '$\\max(3,4) = 4$'],
        },
        {
          dimension: 'Unit ball shape',
          values: ['Diamond', 'Circle / sphere', 'Square / cube'],
        },
        {
          dimension: 'ML role',
          values: ['Lasso penalty — induces sparsity', 'Ridge penalty, distances, geometry', 'Worst-case / robustness bounds'],
        },
      ],
      takeaway: 'For any vector $\\lVert\\mathbf{x}\\rVert_\\infty \\le \\lVert\\mathbf{x}\\rVert_2 \\le \\lVert\\mathbf{x}\\rVert_1$. Pick L2 for geometry and smooth optimization, L1 when you want sparse solutions, and L∞ when you care about the single largest component.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need to represent data as **vectors, matrices, or tensors** so it can be batched and run efficiently on GPUs/TPUs.',
      'A problem reduces to a **linear transformation** — projections, rotations, scaling, or solving a system $A\\mathbf{x} = \\mathbf{b}$.',
      'You want to find **low-dimensional structure** in high-dimensional data via eigen-decomposition, PCA, or SVD.',
    ],
    avoidWhen: [
      'The relationship in the data is fundamentally **non-linear** and cannot be captured by linear maps alone — you will need kernels, feature transforms, or neural networks on top.',
      'A matrix is **singular or nearly so** (determinant near zero); inverting it directly is numerically unstable — prefer the pseudoinverse, SVD, or regularization.',
      'Dimensionality is extreme and data is sparse, where dense matrix operations waste memory — use sparse representations instead.',
    ],
    rulesOfThumb: [
      'Always check dimension compatibility first: $(m\\times k)(k\\times n) \\to (m\\times n)$ — the inner dimensions must match.',
      'Never compute an explicit inverse to solve $A\\mathbf{x} = \\mathbf{b}$; use a solver (e.g. `np.linalg.solve`) — it is faster and more stable.',
      'When in doubt about whether a matrix is well-behaved, inspect its singular values: a large ratio $\\sigma_{\\max}/\\sigma_{\\min}$ (condition number) signals trouble.',
    ],
  },
  caseStudies: [
    {
      title: 'Image compression with truncated SVD',
      domain: 'Computer vision / data compression',
      scenario: 'A grayscale photograph is stored as a $512 \\times 512$ matrix of pixel intensities — exactly $512 \\times 512 = 262{,}144$ numbers. Most natural images are highly redundant: neighboring pixels are strongly correlated, so the matrix is far from "random" and its information concentrates in a few directions.',
      approach: 'Compute the Singular Value Decomposition $X = U\\Sigma V^T$ and keep only the top $k$ singular values, forming the rank-$k$ approximation $X_k = \\sum_{i=1}^{k}\\sigma_i\\mathbf{u}_i\\mathbf{v}_i^T$ (Eckart–Young guarantees this is the best rank-$k$ reconstruction). Storage drops from $512^2$ values to only $k(512 + 512 + 1)$ values — the truncated columns of $U$ and $V$ plus the singular values.',
      outcome: 'Because singular values decay rapidly, keeping just $k = 50$ components reconstructs the image at near-original visual quality while storing $50 \\times (1024 + 1) = 51{,}250$ numbers versus $262{,}144$ — about a **5x reduction (to ~20% of the original size)**. The retained energy $\\sum_{i=1}^{50}\\sigma_i^2 / \\sum_i \\sigma_i^2$ commonly exceeds **90%**, and at $k = 100$ the image is typically indistinguishable from the original to the eye. This same truncation is exactly how PCA reduces dimensionality.',
      source: {
        title: 'Linear Algebra and Learning from Data',
        authors: 'Strang, G',
        url: 'https://math.mit.edu/~gs/',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'What does it mean for $\\mathbf{v}$ to be an eigenvector of a matrix $A$?',
      options: [
        { text: 'Applying $A$ leaves the direction of $\\mathbf{v}$ unchanged, only scaling it: $A\\mathbf{v} = \\lambda\\mathbf{v}$.', correct: true },
        { text: '$\\mathbf{v}$ is mapped to the zero vector by $A$.', correct: false },
        { text: '$\\mathbf{v}$ has length 1 after $A$ is applied.', correct: false },
        { text: '$\\mathbf{v}$ is orthogonal to every column of $A$.', correct: false },
      ],
      explanation: 'An eigenvector is a special non-zero direction that a transformation does not rotate — it only stretches or shrinks it by the eigenvalue $\\lambda$, captured exactly by $A\\mathbf{v} = \\lambda\\mathbf{v}$. A vector sent to zero lies in the null space (a special case with $\\lambda = 0$), but the defining property is preservation of direction, not unit length or orthogonality.',
    },
    {
      question: 'A square matrix $A$ is invertible if and only if:',
      options: [
        { text: 'Its determinant is non-zero (equivalently, it has full rank).', correct: true },
        { text: 'All of its entries are non-zero.', correct: false },
        { text: 'It is symmetric ($A = A^T$).', correct: false },
        { text: 'It has more rows than columns.', correct: false },
      ],
      explanation: 'Invertibility is equivalent to a non-zero determinant, which is equivalent to full rank (no column is a linear combination of the others) and to having no zero eigenvalues. Symmetry, non-zero entries, and shape are not the deciding factors — a matrix full of non-zero numbers can still be singular if its rows are linearly dependent.',
    },
    {
      question: 'Two non-zero vectors $\\mathbf{a}$ and $\\mathbf{b}$ have $\\mathbf{a}\\cdot\\mathbf{b} = 0$. What does this tell you geometrically?',
      options: [
        { text: 'They are orthogonal (perpendicular, at a $90^\\circ$ angle).', correct: true },
        { text: 'They point in the same direction.', correct: false },
        { text: 'They have the same magnitude.', correct: false },
        { text: 'At least one of them is the zero vector.', correct: false },
      ],
      explanation: 'Since $\\mathbf{a}\\cdot\\mathbf{b} = \\lVert\\mathbf{a}\\rVert\\lVert\\mathbf{b}\\rVert\\cos\\theta$ and both magnitudes are non-zero, a zero dot product forces $\\cos\\theta = 0$, i.e. $\\theta = 90^\\circ$. The vectors are orthogonal. Same-direction vectors have a positive dot product; magnitude is unrelated.',
    },
    {
      question: 'You want to multiply matrices $A$ (shape $3 \\times 4$) and $B$ (shape $4 \\times 2$). Which product is valid, and what is its shape?',
      options: [
        { text: '$AB$ is valid and has shape $3 \\times 2$.', correct: true },
        { text: '$BA$ is valid and has shape $4 \\times 4$.', correct: false },
        { text: 'Both $AB$ and $BA$ are valid.', correct: false },
        { text: 'Neither product is valid.', correct: false },
      ],
      explanation: 'For $AB$ the inner dimensions must match: $A$ is $3\\times\\mathbf{4}$ and $B$ is $\\mathbf{4}\\times2$, so $AB$ is defined and inherits the outer dimensions, $3\\times2$. $BA$ would require the inner dimensions $2$ and $3$ to match, which they do not, so $BA$ is undefined.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
