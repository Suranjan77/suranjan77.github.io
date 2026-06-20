import { LearningModule } from "./types";

export const generativeModels: LearningModule = {
  id: "generative-models",
  title: "Generative Adversarial Networks",
  category: "Generative Models",
  prerequisites: ["neural-networks"],
  tracks: ["modern-ai"],
  difficulty: 4,
  relatedModules: ["neural-networks", "autoencoders", "diffusion-models"],
  shortDescription: "Training a generator and a discriminator in a minimax game to generate highly realistic, synthetic data.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Explain the minimax game formulation of Generative Adversarial Networks',
    'Describe the role of the Generator and the Discriminator',
    'Compare GANs, Variational Autoencoders (VAEs), and Diffusion Models',
    'Identify common training issues such as mode collapse and vanishing gradients',
  ],
  keyTerms: [
    { term: 'Generator', definition: 'A neural network that maps a random noise vector to a synthetic data sample.' },
    { term: 'Discriminator', definition: 'A classifier network that distinguishes between real data samples and synthetic ones.' },
    { term: 'Mode Collapse', definition: 'A failure mode where the generator learns to produce samples from only a few categories (modes), ignoring diversity.' },
  ],
  misconceptions: [
    {
      claim: 'The generator and discriminator should both reach 100% accuracy.',
      correction: 'In an ideal equilibrium, the discriminator output should be exactly 0.5 for all samples, meaning it cannot distinguish real from fake data, and the generator is producing perfect replicas.'
    },
    {
      claim: 'GANs are the only way to generate realistic images.',
      correction: 'Diffusion models (like Stable Diffusion) and Autoregressive models (like Transformers) have largely replaced GANs for image and text generation due to training stability.'
    }
  ],
  references: [
    {
      title: "Generative Adversarial Networks",
      authors: "Goodfellow, I. et al",
      url: "https://arxiv.org/abs/1406.2661",
      type: "textbook"
    },
    {
      title: "Deep Generative Modeling",
      authors: "Tomczak, J. M",
      url: "https://link.springer.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Mode Collapse',
      description: 'The generator outputs identical or very similar images (e.g. generating only one digit instead of all digits from 0-9) to fool the discriminator.',
      mitigation: 'Use Wasserstein GAN (WGAN) loss, spectral normalization, or minibatch discrimination.'
    }
  ],

  fullDescription: `
Generative Adversarial Networks (GANs) are generative models trained through a two-player game between a generator ($G$) and a discriminator ($D$).

- **The Generator ($G$)** maps random latent vectors from $p_z$ into synthetic samples.
- **The Discriminator ($D$)** estimates whether a sample came from the real data distribution $p_{data}$ or from the generator.
  `,

  intuition: `
Think of the interaction as a game between a counterfeiter and an inspector:

1. **Initial Phase**: The counterfeiter makes highly unconvincing copies (random noise). The detective easily spots them.
2. **Adversarial Feedback**: The counterfeiter receives feedback (their fakes were rejected) and improves their paper and printing methods. The detective also learns to spot newer, more subtle flaws.
3. **Equilibrium**: Eventually, the counterfeiter makes flawless bills that are indistinguishable from real currency. The detective has to guess randomly (50% accuracy).

In the ideal equilibrium, generated samples are indistinguishable from real samples, so the discriminator can do no better than guessing. In practice, GANs rarely reach that ideal exactly.
  `,

  mathematics: `
### 1. The Minimax Objective Function
The adversarial training process is formulated as a minimax game over the value function $V(D, G)$:

$$ \\min_{G} \\max_{D} V(D, G) = E_{x \\sim p_{data}}[\\log D(x)] + E_{z \\sim p_z}[\\log(1 - D(G(z)))] $$

Where:
- $D(x)$ is the probability that $x$ came from the real data rather than $p_g$.
- $G(z)$ is the generated sample from latent noise $z$.
- $E_{x \\sim p_{data}}$ is the expected log-probability of classifying real samples correctly.
- $E_{z \\sim p_z}$ is the expected log-probability of detecting fake samples.

### 2. Training Alternations
In practice, training alternates between:
1. **Maximizing $D$**: Update parameters of $D$ to maximize $\\log D(x) + \\log(1 - D(G(z)))$.
2. **Minimizing $G$**: Update parameters of $G$ to minimize $\\log(1 - D(G(z)))$ (or in practice, maximize $\\log D(G(z))$ to prevent vanishing gradients early in training).
  `,

  pros: [
    "Generates sharp, highly realistic, high-fidelity synthetic images and audio compared to other methods.",
    "Does not require explicit density modeling or intractable integrals (like Variational Autoencoders).",
    "Latent space interpolation allows smooth blending and semantic manipulation of generated attributes."
  ],

  cons: [
    "Extremely unstable to train; prone to **Mode Collapse** where the generator outputs identical patterns repeatedly.",
    "Evaluation is indirect; sample quality is often assessed with proxy metrics such as FID or by downstream performance.",
    "Non-convergence: gradient descent can oscillate in parameter loops instead of reaching Nash Equilibrium."
  ],

  codeSnippet: `# Pseudo-code training loop step for GANs
import torch
import torch.nn as nn

# D and G are PyTorch nn.Modules, optimizer_D and optimizer_G are optimizers
criterion = nn.BCELoss()

def train_step(real_data, noise):
    # 1. Train Discriminator
    d_real_loss = criterion(D(real_data), torch.ones(real_data.size(0), 1))
    fake_data = G(noise)
    d_fake_loss = criterion(D(fake_data.detach()), torch.zeros(noise.size(0), 1))
    loss_D = d_real_loss + d_fake_loss
    # Optimize D...

    # 2. Train Generator
    loss_G = criterion(D(fake_data), torch.ones(fake_data.size(0), 1))
    # Optimize G...
`,
  tldr: [
    'GANs pit a **generator** against a **discriminator** in a minimax game; at equilibrium the generator’s distribution matches the real data distribution.',
    'The optimal discriminator for a fixed generator is $D^*(x) = \\frac{p_{data}(x)}{p_{data}(x) + p_g(x)}$, and plugging it back in reveals the GAN objective is minimizing the **Jensen-Shannon divergence** between $p_{data}$ and $p_g$.',
    'Diffusion models instead define a fixed **forward noising process** that gradually destroys structure, then train a network to **reverse** it step by step, denoising pure noise back into data.',
    'GAN training is a fragile **saddle-point** search (two networks chasing a moving target), while diffusion training is a stable **regression** problem (predict the noise), at the cost of needing many sampling steps.',
    'Mode collapse, vanishing gradients, and non-convergence are the classic GAN failure modes; diffusion models trade training instability for slow, multi-step sampling.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: The Optimal Discriminator and the Jensen-Shannon Connection',
      content: `
Start from the minimax value function:

$$ V(D, G) = \\mathbb{E}_{x \\sim p_{data}}[\\log D(x)] + \\mathbb{E}_{z \\sim p_z}[\\log(1 - D(G(z)))] $$

Rewrite the second expectation as an integral over the generator’s induced distribution $p_g$ (the distribution of $G(z)$ when $z \\sim p_z$), so both terms become integrals over $x$:

$$ V(D, G) = \\int_x p_{data}(x) \\log D(x)\\, dx + \\int_x p_g(x) \\log(1 - D(x))\\, dx $$

**Step 1 — Optimal discriminator for a fixed generator.** For each fixed $x$, we want to choose $D(x) = y \\in [0,1]$ to maximize the pointwise integrand $a \\log y + b \\log(1-y)$, where $a = p_{data}(x)$ and $b = p_g(x)$. Taking the derivative with respect to $y$ and setting it to zero:

$$ \\frac{a}{y} - \\frac{b}{1-y} = 0 \\quad \\Longrightarrow \\quad y^* = \\frac{a}{a+b} $$

So the optimal discriminator is:

$$ D^*(x) = \\frac{p_{data}(x)}{p_{data}(x) + p_g(x)} $$

This matches the intuition: if the generator perfectly matches the data ($p_g = p_{data}$), the best the discriminator can do is output $D^*(x) = 0.5$ everywhere — pure guessing.

**Step 2 — Plugging $D^*$ back in.** Substitute $D^*$ into $V(D, G)$ and simplify using $p_{data} + p_g$ in the denominator of both terms:

$$ V(D^*, G) = \\mathbb{E}_{x \\sim p_{data}}\\left[\\log \\frac{p_{data}(x)}{p_{data}(x)+p_g(x)}\\right] + \\mathbb{E}_{x \\sim p_g}\\left[\\log \\frac{p_g(x)}{p_{data}(x)+p_g(x)}\\right] $$

Multiply and divide each fraction by 2 to expose the average distribution $m = (p_{data}+p_g)/2$:

$$ V(D^*, G) = -\\log 4 + \\mathrm{KL}\\!\\left(p_{data} \\,\\Big\\|\\, m\\right) + \\mathrm{KL}\\!\\left(p_g \\,\\Big\\|\\, m\\right) $$

The sum of the two KL terms is, by definition, twice the **Jensen-Shannon divergence**:

$$ V(D^*, G) = -\\log 4 + 2 \\cdot \\mathrm{JSD}(p_{data} \\| p_g) $$

Since the JSD is always non-negative and equals zero **only** when the two distributions are identical, the global minimum over $G$ of $V(D^*, G)$ is $-\\log 4$, achieved exactly when $p_g = p_{data}$. This is the formal justification for the intuition that adversarial training pushes the generator’s distribution to match the true data distribution — the discriminator acts as a learned, ever-improving proxy for a statistical distance between $p_{data}$ and $p_g$.
      `,
    },
    {
      heading: 'Derivation: Diffusion Forward and Reverse Processes',
      content: `
Diffusion models take a very different route to generation: instead of an adversarial game, they define a fixed, hand-specified **forward (noising) process** and learn to invert it.

**Step 1 — The forward process.** Starting from a real data sample $x_0 \\sim p_{data}$, the forward process adds a small amount of Gaussian noise at each of $T$ timesteps, governed by a variance schedule $\\beta_1, \\dots, \\beta_T \\in (0,1)$:

$$ q(x_t \\mid x_{t-1}) = \\mathcal{N}\\!\\left(x_t;\\, \\sqrt{1-\\beta_t}\\, x_{t-1},\\, \\beta_t I\\right) $$

This says: $x_t$ is a slightly shrunk, slightly noised version of $x_{t-1}$. Because each step is Gaussian and the process is Markov, the marginal distribution of $x_t$ given the original $x_0$ also has a closed form. Defining $\\alpha_t = 1 - \\beta_t$ and $\\bar{\\alpha}_t = \\prod_{s=1}^t \\alpha_s$, one can show by repeated substitution (the reparameterization trick applied $t$ times) that:

$$ q(x_t \\mid x_0) = \\mathcal{N}\\!\\left(x_t;\\, \\sqrt{\\bar{\\alpha}_t}\\, x_0,\\, (1-\\bar{\\alpha}_t) I\\right) $$

so we can jump directly from $x_0$ to any noise level $x_t$ in one step: $x_t = \\sqrt{\\bar{\\alpha}_t}\\, x_0 + \\sqrt{1-\\bar{\\alpha}_t}\\, \\epsilon$, with $\\epsilon \\sim \\mathcal{N}(0, I)$. As $T \\to \\infty$ with a well-chosen schedule, $\\bar{\\alpha}_T \\to 0$ and $x_T$ becomes indistinguishable from pure Gaussian noise, regardless of $x_0$.

**Step 2 — Why the reverse process can be learned.** The forward process is fixed and requires no learning — it is just an algebraic recipe for adding noise. Generation requires the **reverse** process $p_\\theta(x_{t-1} \\mid x_t)$, which removes noise step by step, starting from $x_T \\sim \\mathcal{N}(0, I)$ and ending at a sample $x_0$ that looks like real data. Crucially, for small enough $\\beta_t$, the true reverse conditional $q(x_{t-1} \\mid x_t, x_0)$ is *also* Gaussian (a standard fact about Gaussian Markov chains), so it is reasonable to model the learned reverse step as Gaussian too:

$$ p_\\theta(x_{t-1} \\mid x_t) = \\mathcal{N}\\!\\left(x_{t-1};\\, \\mu_\\theta(x_t, t),\\, \\Sigma_\\theta(x_t, t)\\right) $$

**Step 3 — The training objective.** Rather than predicting $x_{t-1}$ directly, it turns out to be far more stable to train a network $\\epsilon_\\theta(x_t, t)$ to predict the **noise** $\\epsilon$ that was added to produce $x_t$ from $x_0$. The training objective reduces (after simplifying the variational bound) to a simple regression loss:

$$ \\mathcal{L}_{simple}(\\theta) = \\mathbb{E}_{t,\\, x_0,\\, \\epsilon}\\Big[\\big\\lVert \\epsilon - \\epsilon_\\theta(\\sqrt{\\bar{\\alpha}_t}\\, x_0 + \\sqrt{1-\\bar{\\alpha}_t}\\, \\epsilon,\\; t)\\big\\rVert^2\\Big] $$

This is equivalent to learning the **score** (gradient of the log-density) of progressively noised versions of the data distribution. Because each individual denoising step only has to undo a *small* amount of Gaussian noise, the network’s job at every step is simple and well-conditioned — unlike a GAN generator, which must produce a fully realistic sample in one forward pass while satisfying an adversary. Sampling then proceeds by starting at $x_T \\sim \\mathcal{N}(0, I)$ and iteratively applying the learned reverse step for $t = T, T-1, \\dots, 1$, each time using $\\epsilon_\\theta$ to estimate and partially remove noise. Repeating many small, easy denoising steps is why diffusion sampling is stable and produces high-quality samples, at the cost of requiring many network evaluations (often tens to thousands, depending on the sampler) instead of a single forward pass.
      `,
    },
  ],
  comparisons: [
    {
      title: 'GAN vs VAE vs Diffusion Model',
      methods: ['GAN', 'VAE', 'Diffusion Model'],
      rows: [
        {
          dimension: 'Training stability',
          values: ['Unstable — adversarial saddle-point search, prone to mode collapse and non-convergence', 'Stable — single, well-defined loss (reconstruction + KL) being minimized', 'Stable — simple denoising regression loss at each step'],
        },
        {
          dimension: 'Sample quality (images)',
          values: ['Historically sharpest, most photorealistic samples', 'Tends to produce blurrier samples due to the reconstruction objective and Gaussian decoder assumption', 'State-of-the-art fidelity, often surpassing GANs (e.g. Stable Diffusion, Imagen)'],
        },
        {
          dimension: 'Sampling speed',
          values: ['Fast — a single forward pass through $G$', 'Fast — a single decoder forward pass', 'Slow — requires many iterative denoising steps (tens to thousands), though distillation/fast samplers narrow this gap'],
        },
        {
          dimension: 'Likelihood estimation',
          values: ['No tractable likelihood — cannot directly score how probable a given sample is', 'Tractable lower bound on log-likelihood (the ELBO)', 'Tractable (approximate) likelihood via the variational bound, generally tighter than VAE'],
        },
        {
          dimension: 'Latent space structure',
          values: ['Latent space is learned implicitly; interpolation is often smooth but not principled', 'Explicit, regularized continuous latent space designed for smooth interpolation', 'No single compact latent code; generation unfolds across the noise trajectory $x_T \\to x_0$'],
        },
      ],
      takeaway: 'Choose GANs when you need fast, single-pass sampling and the sharpest possible images and can tolerate finicky training; choose VAEs when you need a stable, principled latent space and tractable likelihoods with modest sample quality; choose diffusion models when sample quality and training stability both matter most and you can afford slower, multi-step sampling.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need **fast, single-pass** sample generation at inference time (e.g. real-time image synthesis) and can invest in stabilizing adversarial training.',
      'You want the **sharpest possible** generated images/audio and have enough data and compute to tune a GAN variant (StyleGAN, WGAN-GP) carefully.',
      'You need smooth **latent-space interpolation or manipulation** (e.g. face attribute editing) and a GAN’s implicit latent structure is sufficient.',
      'You are comparing against diffusion or autoregressive baselines and need a strong, well-understood adversarial baseline.',
    ],
    avoidWhen: [
      'Training stability and reproducibility matter more than peak sample sharpness — prefer diffusion models or VAEs.',
      'You need a **tractable likelihood** or principled uncertainty estimates over generated samples — GANs provide neither; use VAEs or diffusion models instead.',
      'You have limited compute/engineering budget to babysit adversarial training (tuning learning rate ratios, avoiding mode collapse) — a diffusion model’s simpler loss is often easier to get working.',
      'Inference-time latency is not critical but sample quality and diversity are paramount — diffusion models are usually the safer default today.',
    ],
    rulesOfThumb: [
      'If training oscillates or the generator collapses, try a Wasserstein loss with gradient penalty (WGAN-GP) or spectral normalization before tuning learning rates further.',
      'Monitor the discriminator’s accuracy: if it pins to ~100% the generator’s gradients vanish; if it stays near 50% too early, it may be too weak to provide useful signal.',
      'For diffusion models, more timesteps generally improve sample quality but increase sampling cost — use fast samplers (DDIM, distillation) when latency matters.',
    ],
  },
  caseStudies: [
    {
      title: 'StyleGAN: photorealistic synthetic faces',
      domain: 'Computer vision / synthetic media',
      scenario: 'NVIDIA researchers wanted a GAN architecture capable of generating high-resolution (1024x1024) human face images with fine, controllable detail (hair strands, pores, freckles) and smoothly disentangled attributes like pose, identity, and style — far beyond what earlier DCGAN-style architectures could produce.',
      approach: 'StyleGAN introduced a mapping network that transforms the latent code $z$ into an intermediate latent space $w$, then injects style information at multiple resolutions via adaptive instance normalization (AdaIN), combined with progressive growing of the generator and discriminator from low to high resolution during training.',
      outcome: 'StyleGAN (and its successor StyleGAN2) produced face images judged photorealistic by human evaluators at rates close to indistinguishable from real photographs in user studies, popularizing sites like "This Person Does Not Exist." It also enabled fine-grained semantic editing (changing age, expression, or lighting) by manipulating the learned $w$-space, demonstrating that adversarial training can yield not just realism but a structured, controllable latent representation.',
      source: {
        title: 'A Style-Based Generator Architecture for Generative Adversarial Networks',
        authors: 'Karras, T., Laine, S. and Aila, T.',
        url: 'https://arxiv.org/abs/1812.04948',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'At the global optimum of the GAN minimax game (assuming infinite capacity and an optimal discriminator at every step), what is the value of $V(D^*, G^*)$?',
      options: [
        { text: '$-\\log 4$, achieved when $p_g = p_{data}$ and the Jensen-Shannon divergence is zero.', correct: true },
        { text: '$0$, because the discriminator and generator losses cancel exactly.', correct: false },
        { text: '$+\\infty$, because the generator keeps improving forever.', correct: false },
        { text: 'It depends on the architecture of $G$ and cannot be determined analytically.', correct: false },
      ],
      explanation: 'Substituting the optimal discriminator $D^*(x) = p_{data}(x)/(p_{data}(x)+p_g(x))$ back into the value function shows $V(D^*, G) = -\\log 4 + 2\\,\\mathrm{JSD}(p_{data}\\|p_g)$. Since JSD is non-negative and zero only when the distributions match, the global minimum over $G$ is exactly $-\\log 4$, attained when $p_g = p_{data}$.',
    },
    {
      question: 'In the diffusion model forward process $q(x_t \\mid x_{t-1}) = \\mathcal{N}(x_t; \\sqrt{1-\\beta_t}\\,x_{t-1}, \\beta_t I)$, what happens as $t$ increases from $0$ to a large $T$ with a well-chosen schedule?',
      options: [
        { text: '$x_t$ progressively loses structure and approaches an isotropic Gaussian distribution, independent of $x_0$.', correct: true },
        { text: '$x_t$ converges back to the exact original sample $x_0$.', correct: false },
        { text: '$x_t$ becomes deterministic with zero variance.', correct: false },
        { text: '$x_t$ oscillates between the data distribution and noise.', correct: false },
      ],
      explanation: 'Each forward step shrinks the signal slightly (by $\\sqrt{1-\\beta_t}$) and adds a bit of Gaussian noise. Compounding this over many steps, $\\bar{\\alpha}_T \\to 0$, so $x_T$ is essentially pure noise $\\mathcal{N}(0, I)$ regardless of the starting $x_0$ — this is exactly what makes it possible to start sampling from pure noise at inference time.',
    },
    {
      question: 'Why is GAN training fundamentally harder to reason about with standard optimization theory than training a diffusion model’s denoising network?',
      options: [
        { text: 'GAN training searches for a saddle point of a two-player game whose loss landscape changes every step, while diffusion training minimizes a single fixed regression loss.', correct: true },
        { text: 'GANs use more parameters than diffusion models, making optimization slower.', correct: false },
        { text: 'Diffusion models do not use gradient descent at all.', correct: false },
        { text: 'GANs cannot be trained with backpropagation.', correct: false },
      ],
      explanation: 'GANs require solving $\\min_G \\max_D V(D,G)$, a saddle-point problem where $D$ and $G$ are each other’s moving targets, so classic convex minimization guarantees do not apply. Diffusion models instead train $\\epsilon_\\theta$ against a fixed noise-prediction regression target, which behaves like ordinary supervised learning and is comparatively stable.',
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Compare GANs, VAEs, and Diffusion Models for an application that requires generating high-quality images while also computing a meaningful estimate of how likely a given image is under the trained model. Which framework is the most suitable and why?',
      expectedAnswerRubric: 'A strong answer should explain that vanilla GANs do not provide a tractable likelihood or density estimate, as the discriminator score is uncalibrated. VAEs provide an ELBO on the log-likelihood but can produce blurrier images. Diffusion models are typically best because they provide a variational bound on likelihood while producing state-of-the-art sample quality. Therefore, Diffusion or VAEs are suitable, with Diffusion favored for quality.'
    }
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
