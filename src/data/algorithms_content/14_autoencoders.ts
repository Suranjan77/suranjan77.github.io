import { LearningModule } from "./types";

export const autoencoders: LearningModule = {
  id: "autoencoders",
  title: "Autoencoders",
  category: "Autoencoders",
  prerequisites: ["neural-networks", "dimensionality-reduction"],
  tracks: ["modern-ai"],
  difficulty: 3,
  relatedModules: ["neural-networks", "dimensionality-reduction", "generative-models"],
  shortDescription: "Neural networks that compress inputs into a tight bottleneck representation, then try to reconstruct the original input from it.",
  estimatedMinutes: 20,
  learningObjectives: [
    'Explain the encoder-decoder structure and the role of the latent space bottleneck',
    'Derive reconstruction loss for autoencoders (MSE vs Binary Cross-Entropy)',
    'Relate linear autoencoders with identity activation functions to PCA',
    'Describe Variational Autoencoders (VAEs) and the concept of a regularized latent space',
  ],
  keyTerms: [
    { term: 'Latent Space (Bottleneck)', definition: 'The low-dimensional representation space where the input features are compressed.' },
    { term: 'Reconstruction Loss', definition: 'A loss metric measuring the difference between the original input and the decoded reconstruction.' },
    { term: 'Variational Autoencoder (VAE)', definition: 'A probabilistic version of an autoencoder that maps inputs to probability distributions in latent space, enabling generation.' },
  ],
  workedExamples: [
    {
      title: 'Reconstruction Loss',
      problem: 'Calculate Mean Squared Error reconstruction loss for input vector $x = [1.0, 0.5]$ and reconstructed vector $\\hat{x} = [0.9, 0.7]$.',
      solution: 'Squared errors: $(1.0-0.9)^2 = 0.01$; $(0.5-0.7)^2 = 0.04$. Mean Squared Error $\\text{MSE} = \\frac{0.01 + 0.04}{2} = 0.025$.',
    },
  ],
  misconceptions: [
    {
      claim: 'Autoencoders are supervised learning models because they require labels.',
      correction: 'Autoencoders are self-supervised. They use the input itself as the label (the target $y$ equals the input $x$), meaning no external annotations are needed.'
    },
    {
      claim: 'A standard autoencoder can be used to generate new data directly.',
      correction: 'Standard autoencoders have unregularized, discrete latent spaces with large gaps, which leads to poor generation. Variational Autoencoders (VAEs) enforce a continuous, Gaussian prior on latent space, making generation reliable.'
    }
  ],
  references: [
    {
      title: "Reducing the Dimensionality of Data with Neural Networks",
      authors: "Hinton, G. E. and Salakhutdinov, R. R",
      url: "https://science.sciencemag.org",
      type: "textbook"
    },
    {
      title: "Deep Learning (Chapter 14)",
      authors: "Goodfellow, I. et al",
      url: "https://www.deeplearningbook.org",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Identity Mapping (Copying)',
      description: 'If the latent dimension is too large or the network is too powerful, it will simply memorize or copy inputs directly without learning useful abstractions.',
      mitigation: 'Use a tight bottleneck (undercomplete), add noise to inputs (denoising), or apply L1 regularization on activations (sparse autoencoders).'
    }
  ],

  fullDescription: `
Autoencoders are self-supervised neural networks designed for feature learning and dimensionality reduction. The network architecture is split into two halves:

1. **The Encoder**: Compresses high-dimensional inputs ($x$) into a low-dimensional bottleneck representation ($z$, the latent space).
2. **The Decoder**: Takes the latent code ($z$) and attempts to reconstruct the original input ($\\hat{x}$) as closely as possible.

Because the bottleneck has a very limited capacity, the network cannot simply copy the input. It is forced to discard noise and redundancy, learning only the most essential, underlying structural coordinates of the dataset.
  `,

  intuition: `
Imagine trying to describe a complex movie to a friend using a limit of only five words (the bottleneck). You cannot tell them about individual camera angles, minor characters, or costumes. You must choose five highly descriptive words that capture the exact essence of the film.

Your friend then takes those five words and tries to write the full plot summary. If their reconstruction matches the actual movie, you successfully compressed the movie's core signal. An autoencoder does this with numbers.
  `,

  mathematics: `
### 1. Feed-Forward Reconstruction
The encoder maps input $x$ to latent code $z$:

$$ z = g_{\\phi}(x) = \\sigma(W_e x + b_e) $$

The decoder maps latent code $z$ to output estimate $\\hat{x}$:

$$ \\hat{x} = f_{\\theta}(z) = \\sigma(W_d z + b_d) $$

We train the weights by minimizing the Reconstruction Loss:

$$ \\mathcal{L}_{recon}(x, \\hat{x}) = \\|x - \\hat{x}\\|^2 \\quad \\text{(Mean Squared Error)} $$

### 2. Variational Autoencoders (VAEs)
Instead of outputting a fixed point, VAEs output probability distribution parameters (mean $\\mu$ and variance $\\sigma^2$). They optimize the Evidence Lower Bound (ELBO):

$$ \\mathcal{L}_{VAE}(\\theta, \\phi; x) = \\mathbb{E}_{q_{\\phi}(z|x)}[\\log p_{\\theta}(x|z)] - D_{\\text{KL}}(q_{\\phi}(z|x) \\parallel p(z)) $$

Where the KL Divergence ($D_{\\text{KL}}$) forces the latent space to be a smooth, continuous Gaussian, allowing us to generate new realistic samples by picking random points.
  `,

  pros: [
    "Completely self-supervised: Requires no manual labels; uses the input dataset itself as the target.",
    "Powerful denoising: Denoising autoencoders learn to strip out corruption and restore clean signals.",
    "Smooth latent coordinates: VAEs provide continuous latent spaces, perfect for generating new data samples."
  ],

  cons: [
    "Overfitting vulnerability: If the bottleneck is too wide, the network simply learns identity mapping and memorizes data.",
    "Blurry reconstructions: Because they use MSE loss, reconstructions tend to be smooth averages, losing fine details.",
    "Disconnected latent spaces: Standard autoencoders can have massive empty regions in latent space, where output is garbage."
  ],

  codeSnippet: `import torch
import torch.nn as nn
import torch.optim as optim

# Simple Autoencoder in PyTorch
class Autoencoder(nn.Module):
    def __init__(self, input_dim=784, latent_dim=32):
        super().__init__()
        # Encoder: compresses from 784 down to 32 dimensions
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, latent_dim)
        )
        # Decoder: reconstructs 784 back from 32 dimensions
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 128),
            nn.ReLU(),
            nn.Linear(128, input_dim),
            nn.Sigmoid() # Squish outputs between 0 and 1 (like normalized pixels)
        )

    def forward(self, x):
        latent = self.encoder(x)
        reconstruction = self.decoder(latent)
        return reconstruction

# Define model, loss, and run training step
model = Autoencoder()
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.005)

# Fake inputs representing 4 flat image vectors (e.g. MNIST)
fake_inputs = torch.rand(4, 784)

optimizer.zero_grad()
outputs = model(fake_inputs)
loss = criterion(outputs, fake_inputs) # Target is the same as the input!
loss.backward()
optimizer.step()

print(f"Reconstruction Loss: {loss.item():.4f}")`,
  tldr: [
    'An autoencoder learns to **compress** ($x \\to z$) and then **reconstruct** ($z \\to \\hat{x}$) its own input, using the reconstruction error as the only training signal — no labels needed.',
    'A **linear** autoencoder with a bottleneck of size $k$ recovers the same subspace as the top-$k$ **PCA** components; nonlinear activations let it capture curved manifolds that PCA cannot.',
    'The bottleneck is the whole point: if it is as wide as the input, the network can learn the **identity function** and compression collapses to memorization.',
    '**Variational Autoencoders (VAEs)** replace the deterministic code $z$ with a distribution $q_\\phi(z|x)$ and optimize the **ELBO**, trading off reconstruction fidelity against a KL penalty that keeps the latent space smooth and sample-able.',
    'Vanilla autoencoders are great at **detection** (anomaly scoring via reconstruction error) but bad at **generation**; VAEs sacrifice some reconstruction sharpness to gain a usable generative latent space.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Why a Linear Autoencoder Recovers PCA',
      content: `
Consider a linear autoencoder with no nonlinearity: the encoder is $z = W_e x$ and the decoder is $\\hat{x} = W_d z = W_d W_e x$, trained to minimize reconstruction MSE over a centered dataset $X \\in \\mathbb{R}^{n \\times d}$:

$$ \\mathcal{L}(W_e, W_d) = \\frac{1}{n}\\lVert X - X W_e^T W_d^T \\rVert_F^2 $$

Let $M = W_d W_e \\in \\mathbb{R}^{d \\times d}$ be the combined linear map from input to reconstruction, restricted to have rank at most $k$ (the bottleneck width). The objective becomes a **low-rank matrix approximation** problem:

$$ \\min_{\\text{rank}(M) \\le k} \\lVert X - XM^T \\rVert_F^2 $$

This is exactly the setup the **Eckart–Young theorem** solves. Eckart–Young states that the best rank-$k$ approximation (in Frobenius norm) of a matrix $A$ is obtained by truncating its singular value decomposition $A = U\\Sigma V^T$ to the top $k$ singular values:

$$ A_k = U_k \\Sigma_k V_k^T = \\arg\\min_{\\text{rank}(B) \\le k} \\lVert A - B \\rVert_F $$

Applying this with $A = X$: the optimal rank-$k$ reconstruction of $X$ is its projection onto the subspace spanned by the top $k$ right-singular vectors $V_k$, i.e. $X_k = X V_k V_k^T$. But that is *precisely* what PCA does — the columns of $V_k$ (equivalently the top-$k$ eigenvectors of the covariance matrix $X^TX$) are the principal directions, and $X V_k$ is the PCA projection onto $k$ components. So at the global optimum, $W_e^T$ and $W_d$ must span the same column space as $V_k$ (up to an invertible $k \\times k$ change of basis — the bottleneck activations need not literally equal the orthonormal PCA scores, but the **subspace** they encode is identical).

**Worked illustration.** Let two centered, perfectly correlated 2D points be $x_1 = (1, 1)$ and $x_2 = (-1, -1)$, so

$$ X = \\begin{bmatrix} 1 & 1 \\\\ -1 & -1 \\end{bmatrix} $$

All the variance lies along the direction $v_1 = \\frac{1}{\\sqrt{2}}(1,1)$; the orthogonal direction $v_2 = \\frac{1}{\\sqrt 2}(1,-1)$ has zero variance. A bottleneck of $k=1$ should recover $v_1$. Indeed $X^T X = \\begin{bmatrix} 2 & 2 \\\\ 2 & 2\\end{bmatrix}$ has eigenvalues $4$ and $0$ with top eigenvector exactly $v_1$. Training a 1-unit linear autoencoder ($z = w_e^T x$, $\\hat{x} = w_d z$) to minimize $\\sum_i \\lVert x_i - w_d w_e^T x_i\\rVert^2$ drives $w_e$ and $w_d$ to align with $\\pm v_1$ (any scalar rescaling between encoder/decoder that preserves the product $w_d w_e^T$ achieves the same zero loss) — reconstruction is then **exact**, matching PCA's exact reconstruction whenever $k$ equals the true data rank.

The practical takeaway: nonlinear activations (ReLU, sigmoid, tanh) are exactly what let an autoencoder do *more* than PCA — without them, the bottleneck autoencoder is mathematically just PCA in a more expensive, iteratively-optimized disguise.
      `,
    },
    {
      heading: 'Derivation: The VAE Loss as Evidence Lower Bound (ELBO)',
      content: `
We want to fit a generative model $p_\\theta(x) = \\int p_\\theta(x|z)\\, p(z)\\, dz$ by maximizing the log-likelihood of the data, $\\log p_\\theta(x)$. The integral over $z$ is intractable for any reasonably expressive decoder, so instead we introduce an **approximate posterior** $q_\\phi(z|x)$ (the encoder) and derive a tractable lower bound.

Start from the log-likelihood and multiply-and-divide inside the integral by $q_\\phi(z|x)$:

$$ \\log p_\\theta(x) = \\log \\int p_\\theta(x, z)\\, dz = \\log \\int q_\\phi(z|x) \\frac{p_\\theta(x, z)}{q_\\phi(z|x)}\\, dz = \\log \\mathbb{E}_{q_\\phi(z|x)}\\!\\left[\\frac{p_\\theta(x,z)}{q_\\phi(z|x)}\\right] $$

Because $\\log$ is concave, **Jensen's inequality** says $\\log \\mathbb{E}[\\cdot] \\ge \\mathbb{E}[\\log(\\cdot)]$, giving:

$$ \\log p_\\theta(x) \\ge \\mathbb{E}_{q_\\phi(z|x)}\\left[\\log \\frac{p_\\theta(x,z)}{q_\\phi(z|x)}\\right] =: \\mathcal{L}(\\theta, \\phi; x) $$

This $\\mathcal{L}$ is the **Evidence Lower Bound (ELBO)**. Expand $p_\\theta(x,z) = p_\\theta(x|z)\\,p(z)$ inside the expectation:

$$ \\mathcal{L} = \\mathbb{E}_{q_\\phi(z|x)}\\Big[\\log p_\\theta(x|z) + \\log p(z) - \\log q_\\phi(z|x)\\Big] = \\mathbb{E}_{q_\\phi(z|x)}[\\log p_\\theta(x|z)] - \\mathbb{E}_{q_\\phi(z|x)}\\!\\left[\\log \\frac{q_\\phi(z|x)}{p(z)}\\right] $$

The second expectation is by definition the KL divergence between the approximate posterior and the prior, so:

$$ \\mathcal{L}(\\theta,\\phi;x) = \\underbrace{\\mathbb{E}_{q_\\phi(z|x)}[\\log p_\\theta(x|z)]}_{\\text{reconstruction term}} \\;-\\; \\underbrace{D_{KL}\\big(q_\\phi(z|x) \\,\\|\\, p(z)\\big)}_{\\text{regularization term}} $$

The gap between the true log-likelihood and the ELBO is exactly $D_{KL}(q_\\phi(z|x) \\| p_\\theta(z|x))$ — the divergence between the approximate and *true* posterior. Maximizing the ELBO therefore simultaneously pushes up the data log-likelihood and pulls $q_\\phi$ toward the true posterior; the bound is tight exactly when $q_\\phi(z|x) = p_\\theta(z|x)$.

**Interpreting the two terms as a tradeoff:**

- **Reconstruction term** $\\mathbb{E}_{q_\\phi(z|x)}[\\log p_\\theta(x|z)]$ rewards latent codes $z$ that let the decoder reconstruct $x$ well — for Gaussian decoder likelihoods this term reduces to (negative) MSE, exactly the vanilla-autoencoder loss. Pursued alone, it would let $q_\\phi(z|x)$ collapse to a near-deterministic spike anywhere convenient, just like a plain autoencoder.
- **Regularization term** $D_{KL}(q_\\phi(z|x) \\| p(z))$ penalizes the encoder for straying from the prior $p(z) = \\mathcal{N}(0, I)$. With a Gaussian encoder $q_\\phi(z|x) = \\mathcal{N}(\\mu(x), \\sigma^2(x))$, this KL term has the closed form $\\frac{1}{2}\\sum_j (\\mu_j^2 + \\sigma_j^2 - \\log \\sigma_j^2 - 1)$, which shrinks means toward $0$ and variances toward $1$. Pursued alone, it would collapse every input to the same uninformative $\\mathcal{N}(0,I)$ code, destroying reconstruction.

Balancing the two (sometimes with an explicit weight $\\beta$ on the KL term, as in $\\beta$-VAE) is what produces a latent space that is both **informative** (good reconstructions) and **continuous/sample-able** (good generation) — the central design tension that distinguishes VAEs from vanilla autoencoders.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'Given input $x = [2.0, 4.0, 6.0]$ and reconstruction $\\hat{x} = [2.5, 3.5, 6.5]$, compute the Mean Squared Error reconstruction loss.',
      difficulty: 'warm-up',
      hint: 'MSE is the average of the squared per-component differences.',
      solution: 'Squared errors: $(2.0-2.5)^2 = 0.25$, $(4.0-3.5)^2 = 0.25$, $(6.0-6.5)^2 = 0.25$. $\\text{MSE} = \\frac{0.25+0.25+0.25}{3} = 0.25$.',
      tags: ['computation'],
    },
    {
      prompt: 'An autoencoder has an encoder that is a single fully-connected layer mapping $\\mathbb{R}^{100}$ to $\\mathbb{R}^{10}$ (with bias), and a decoder that mirrors it, mapping $\\mathbb{R}^{10}$ back to $\\mathbb{R}^{100}$ (with bias). How many trainable parameters does the whole autoencoder have?',
      difficulty: 'core',
      hint: 'A fully-connected layer from size $a$ to size $b$ has $a \\times b$ weights plus $b$ biases.',
      solution: 'Encoder: weights $100 \\times 10 = 1000$, biases $10$, total $1010$. Decoder: weights $10 \\times 100 = 1000$, biases $100$, total $1100$. Grand total: $1010 + 1100 = 2110$ trainable parameters.',
      tags: ['architecture', 'computation'],
    },
    {
      prompt: 'Why does setting the bottleneck dimension exactly equal to the input dimension (e.g. encoding $\\mathbb{R}^{784}$ down to $\\mathbb{R}^{784}$) make the autoencoder trivial and useless for representation learning, even though it can achieve zero reconstruction loss?',
      difficulty: 'core',
      hint: 'Think about whether the encoder is forced to discard any information at all.',
      solution: 'When the latent dimension equals the input dimension, the encoder is no longer a genuine bottleneck — it has enough capacity to learn an invertible (or even literally identity) mapping, e.g. $z = x$ and $\\hat{x} = z$. The network can drive reconstruction loss to exactly zero without learning anything about the structure, correlations, or redundancy in the data, because it never had to throw any information away. Useful representation learning specifically requires an **undercomplete** bottleneck ($k < d$) — or some other constraint like sparsity or added noise — that forces the network to discover and keep only the most informative, compressed structure rather than just copying.',
      tags: ['conceptual', 'failure-mode'],
    },
    {
      prompt: 'In the VAE ELBO, $\\mathcal{L} = \\mathbb{E}_{q_\\phi(z|x)}[\\log p_\\theta(x|z)] - D_{KL}(q_\\phi(z|x)\\,\\|\\,p(z))$, explain what would happen during training if the KL term were removed entirely (i.e. you only maximized the reconstruction term).',
      difficulty: 'challenge',
      hint: 'Consider what stops the encoder from making each $q_\\phi(z|x)$ an arbitrarily narrow spike at a different, unconstrained location for every input.',
      solution: 'Without the KL penalty, nothing constrains $q_\\phi(z|x)$ to resemble the prior $p(z) = \\mathcal{N}(0,I)$. The optimizer would be free to shrink each $\\sigma(x)$ toward zero (making the encoder near-deterministic, like a plain autoencoder) and scatter the means $\\mu(x)$ wherever is most convenient for reconstruction, with no requirement that nearby latent points decode to similar outputs or that the latent space be densely packed around the origin. The model would essentially degrade into a vanilla autoencoder: it could still achieve excellent reconstruction, but the latent space would likely have large empty/unstructured regions. Sampling a random $z \\sim \\mathcal{N}(0,I)$ and decoding it would then often land in one of those gaps and produce garbage — destroying the modelʼs ability to generate new, realistic samples, which is the entire point of the KL regularization term.',
      tags: ['conceptual', 'derivation'],
    },
  ],
  comparisons: [
    {
      title: 'PCA vs Vanilla Autoencoder vs Variational Autoencoder',
      methods: ['PCA', 'Vanilla Autoencoder', 'Variational Autoencoder (VAE)'],
      rows: [
        {
          dimension: 'Linearity',
          values: ['Strictly linear projection', 'Linear or nonlinear (depends on activations)', 'Nonlinear (uses neural encoder/decoder)'],
        },
        {
          dimension: 'Training objective',
          values: ['Maximize variance explained (closed-form via SVD/eigendecomposition)', 'Minimize reconstruction loss (MSE / BCE) via gradient descent', 'Maximize ELBO: reconstruction term minus KL divergence to prior'],
        },
        {
          dimension: 'Latent space structure',
          values: ['Orthogonal axes ranked by variance; deterministic coordinates', 'Deterministic code; often has gaps and disconnected clusters', 'Continuous, smooth, approximately Gaussian — designed to be densely packed'],
        },
        {
          dimension: 'Generative capability',
          values: ['None — only a fixed linear projection, no sampling mechanism', 'Poor — decoding random latent points usually produces garbage', 'Good — sampling $z \\sim \\mathcal{N}(0,I)$ and decoding yields plausible new data'],
        },
        {
          dimension: 'Solution method',
          values: ['Closed-form (eigendecomposition / SVD)', 'Iterative optimization (backprop + gradient descent)', 'Iterative optimization with the reparameterization trick for backprop through sampling'],
        },
      ],
      takeaway: 'PCA is the linear, closed-form special case that a linear autoencoder converges to; vanilla autoencoders add nonlinearity for better compression but no usable generative structure; VAEs add a probabilistic regularizer that sacrifices some reconstruction sharpness in exchange for a smooth, sample-able latent space.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need **unsupervised dimensionality reduction or feature learning** on data with nonlinear structure that PCA cannot capture.',
      'You want an **anomaly/fraud detector**: train on normal data only, then flag inputs with unusually high reconstruction error.',
      'You need a **denoising** model — train a denoising autoencoder to map corrupted inputs back to clean ones.',
      'You want to **generate new, realistic samples** from a learned data distribution — choose a VAE specifically for this.',
    ],
    avoidWhen: [
      'Your data relationships are genuinely linear and well-behaved — plain **PCA** is cheaper, exact, and easier to interpret.',
      'You need **crisp, high-fidelity generative samples** (e.g. photorealistic images) — GANs or diffusion models typically outperform VAEs on sample sharpness.',
      'You have very little training data — autoencoders (especially deep ones) need enough data to learn a meaningful, non-trivial bottleneck rather than overfitting/memorizing.',
      'You need strong interpretability of the learned features — latent dimensions in autoencoders are usually entangled and hard to attribute meaning to, unlike PCA components or simple linear models.',
    ],
    rulesOfThumb: [
      'Start with the smallest bottleneck that still gives acceptable reconstruction — undercompleteness is what forces useful compression.',
      'For anomaly detection, set the reconstruction-error threshold using a held-out set of confirmed normal data, then validate on a small labeled anomaly set.',
      'If a VAEʼs samples look blurry or its latent space collapses, try tuning the KL weight ($\\beta$-VAE) rather than only changing network depth.',
    ],
  },
  caseStudies: [
    {
      title: 'Variational Autoencoders for generative modeling and representation learning',
      domain: 'Generative modeling / computer vision',
      scenario: 'Before 2013, training deep generative latent-variable models was largely intractable because the marginal likelihood $p_\\theta(x) = \\int p_\\theta(x|z)p(z)\\,dz$ could not be computed or differentiated efficiently for expressive neural decoders.',
      approach: 'Kingma and Welling introduced the Variational Autoencoder, pairing a neural network encoder $q_\\phi(z|x)$ with a neural decoder $p_\\theta(x|z)$, optimizing the Evidence Lower Bound (ELBO) directly with stochastic gradient descent via the **reparameterization trick** ($z = \\mu(x) + \\sigma(x)\\odot\\epsilon$, $\\epsilon \\sim \\mathcal{N}(0,I)$), which makes sampling differentiable.',
      outcome: 'On datasets such as MNIST and Frey Faces, the VAE produced a smooth, continuous latent space (often visualized in 2D) where interpolating between two latent points produced semantically meaningful, gradually morphing images — establishing VAEs as a foundational generative modeling technique that directly influenced later representation-learning and generative architectures.',
      source: {
        title: 'Auto-Encoding Variational Bayes',
        authors: 'Kingma, D. P. and Welling, M.',
        url: 'https://arxiv.org/abs/1312.6114',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'A linear autoencoder (no nonlinear activations) with a bottleneck of size $k$, trained to minimize reconstruction MSE, converges to a solution that:',
      options: [
        { text: 'Spans the same subspace as the top-$k$ PCA components, by the Eckart–Young theorem.', correct: true },
        { text: 'Always finds a strictly better subspace than PCA because it uses gradient descent.', correct: false },
        { text: 'Is unrelated to PCA since autoencoders are a deep learning technique.', correct: false },
        { text: 'Only works if the input data is already zero-mean and unit-variance.', correct: false },
      ],
      explanation: 'Without nonlinearities, the autoencoder objective reduces to a rank-$k$ matrix approximation problem, whose optimal solution (by Eckart–Young) is the projection onto the top-$k$ singular/eigen directions — exactly PCA. Gradient descent does not find a "better" subspace; at best it converges to the same optimum (and may do worse if poorly tuned).',
    },
    {
      question: 'Why are standard (vanilla) autoencoders generally poor at generating new, realistic samples by feeding random vectors into the decoder?',
      options: [
        { text: 'Their latent spaces are not regularized, so they often contain large gaps/discontinuous regions that decode to garbage.', correct: true },
        { text: 'Autoencoder decoders cannot process any input other than encoder outputs, by construction.', correct: false },
        { text: 'They always have a bottleneck dimension of exactly 1.', correct: false },
        { text: 'They are trained using labeled data, so they cannot generalize to unlabeled random vectors.', correct: false },
      ],
      explanation: 'Nothing in a vanilla autoencoderʼs loss encourages the latent space to be smooth, dense, or distributed like any particular probability distribution. Random latent points often fall outside the regions the encoder actually populated, producing meaningless decoder outputs. VAEs fix this by explicitly regularizing $q_\\phi(z|x)$ toward a known prior with the KL term.',
    },
    {
      question: 'In the VAE loss $\\mathcal{L} = \\mathbb{E}_{q_\\phi(z|x)}[\\log p_\\theta(x|z)] - D_{KL}(q_\\phi(z|x)\\|p(z))$, what is the role of the KL divergence term?',
      options: [
        { text: 'It regularizes the approximate posterior toward the prior, encouraging a smooth, continuous, sample-able latent space.', correct: true },
        { text: 'It directly measures reconstruction error between $x$ and $\\hat{x}$.', correct: false },
        { text: 'It guarantees the decoder output is always a valid probability distribution.', correct: false },
        { text: 'It is only used at test time, not during training.', correct: false },
      ],
      explanation: 'The KL term penalizes the encoder for producing posteriors $q_\\phi(z|x)$ that drift too far from the prior $p(z)$ (typically $\\mathcal{N}(0,I)$). This regularization is what keeps the latent space continuous and well-structured, at some cost to reconstruction sharpness — the core reconstruction-vs-regularization tradeoff of VAEs.',
    },
    {
      question: 'A bottleneck autoencoder is trained where the latent dimension exactly equals the input dimension. What is the most likely outcome?',
      options: [
        { text: 'The network can learn a trivial identity-like mapping, achieving near-zero reconstruction loss without learning any useful compressed representation.', correct: true },
        { text: 'Training will fail to converge because there is no information bottleneck.', correct: false },
        { text: 'The model becomes mathematically equivalent to a VAE.', correct: false },
        { text: 'Reconstruction loss will always be higher than with a smaller bottleneck.', correct: false },
      ],
      explanation: 'With no dimensionality reduction enforced, the network has enough capacity to pass information straight through (effectively learning the identity function), so it can minimize reconstruction loss trivially while learning nothing about the data’s underlying structure. Useful representation learning requires an undercomplete bottleneck or another constraint (sparsity, noise, etc.).',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
