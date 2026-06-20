import { LearningModule } from "./types";

export const diffusionModels: LearningModule = {
  id: "diffusion-models",
  title: "Diffusion Models",
  category: "Computer Vision",
  prerequisites: ["generative-models", "neural-networks"],
  tracks: ["computer-vision"],
  difficulty: 4,
  relatedModules: ["generative-models", "autoencoders", "vision-transformers", "cnn"],
  shortDescription:
    "Generate images by learning to reverse a gradual noising process: a fixed forward chain destroys an image into pure Gaussian noise, and a trained network denoises step by step to turn fresh noise back into a sample.",
  estimatedMinutes: 35,
  learningObjectives: [
    "Describe the fixed forward (noising) process and the learned reverse (denoising) process that define a diffusion model",
    "Derive and use the closed-form forward sampler $x_t = \\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1-\\bar\\alpha_t}\\,\\epsilon$ and explain the role of the noise schedule",
    "Explain why the network is trained to predict the added noise (or score) with a simple mean-squared-error objective",
    "Contrast DDPM and DDIM sampling and explain how latent diffusion makes text-to-image generation tractable",
  ],
  keyTerms: [
    {
      term: "Forward (Diffusion) Process",
      definition:
        "A fixed Markov chain that gradually adds Gaussian noise to an image over $T$ steps until it is indistinguishable from pure noise. It has no learnable parameters.",
    },
    {
      term: "Reverse (Denoising) Process",
      definition:
        "The learned chain that starts from pure noise and removes a little noise at each step to produce a sample — the part the neural network parameterizes.",
    },
    {
      term: "Noise Schedule",
      definition:
        "The sequence of variances $\\beta_t$ (and derived $\\bar\\alpha_t$) that controls how fast signal is destroyed across steps; its shape strongly affects sample quality.",
    },
    {
      term: "Latent Diffusion",
      definition:
        "Running the diffusion process in the compressed latent space of an autoencoder rather than on raw pixels, cutting compute dramatically — the basis of Stable Diffusion.",
    },
  ],
  misconceptions: [
    {
      claim:
        "A diffusion model denoises a real, slightly-noisy photograph to produce its output.",
      correction:
        "Generation starts from a sample of pure Gaussian noise — there is no underlying clean photo. The image *emerges* purely from the network's learned reverse steps; the forward (noising) process is only used during training to create supervised noisy/clean pairs.",
    },
    {
      claim:
        "The model removes all the noise in a single forward pass.",
      correction:
        "Sampling is iterative: DDPM uses hundreds to a thousand small reverse steps. A network can predict $x_0$ in one step, but the high quality comes from many gradual refinements. DDIM and distillation reduce the step count, but the process is still fundamentally iterative.",
    },
    {
      claim:
        "The network's job is to output the clean image directly.",
      correction:
        "In the standard formulation the network predicts the *noise* $\\epsilon$ that was added (equivalently, the score $\\nabla_{x}\\log p(x_t)$). The clean estimate $\\hat x_0$ is then derived algebraically. Noise/score/$x_0$ parameterizations are mathematically interchangeable, and $\\epsilon$-prediction trains most stably.",
    },
  ],
  references: [
    {
      title: "Denoising Diffusion Probabilistic Models (DDPM)",
      authors: "Ho, J., Jain, A. and Abbeel, P.",
      url: "https://arxiv.org/abs/2006.11239",
      type: "paper",
    },
    {
      title: "Denoising Diffusion Implicit Models (DDIM)",
      authors: "Song, J., Meng, C. and Ermon, S.",
      url: "https://arxiv.org/abs/2010.02502",
      type: "paper",
    },
    {
      title: "High-Resolution Image Synthesis with Latent Diffusion Models",
      authors: "Rombach, R., Blattmann, A., Lorenz, D., Esser, P. and Ommer, B.",
      url: "https://arxiv.org/abs/2112.10752",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Slow sampling",
      description:
        "A standard DDPM needs hundreds to a thousand sequential network evaluations to draw one sample, because each reverse step removes only a little noise. This makes naive generation far slower than a single-pass GAN.",
      mitigation:
        "Use a deterministic, non-Markovian sampler (DDIM) that produces good samples in 10–50 steps, run diffusion in a compressed latent space (latent diffusion), or distill the sampler (progressive / consistency distillation) down to a few steps.",
    },
    {
      name: "Guidance artifacts from over-strong conditioning",
      description:
        "Classifier-free guidance amplifies the conditioning signal to improve prompt adherence, but pushing the guidance scale too high produces oversaturated colors, blown-out contrast, and unnatural textures.",
      mitigation:
        "Tune the guidance scale (often 5–8 for text-to-image), use dynamic thresholding, or apply guidance only over a sub-range of timesteps.",
    },
  ],
  fullDescription: `
A diffusion model learns to create data by **reversing a process of gradual destruction**. The idea is disarmingly simple: if you can take any image and slowly turn it into static, then learning to undo each tiny step lets you start from static and *grow* an image.

There are two processes:

1. **Forward (diffusion) process** — fixed, no learning. Over $T$ steps it adds a small amount of Gaussian noise at a time until, by step $T$, the image is indistinguishable from pure noise. Because each step is a simple Gaussian, the whole thing has a convenient closed form: you can jump to the noise level of *any* step $t$ in one shot.

2. **Reverse (denoising) process** — learned. A neural network looks at a noisy image $x_t$ and the step index $t$ and predicts the noise that was added. Subtracting a calibrated amount of that predicted noise takes you from $x_t$ toward $x_{t-1}$. Chain these reverse steps from pure noise at $t=T$ down to $t=0$ and a clean sample appears.

### Why diffusion took over generative vision
Diffusion models displaced GANs as the default for high-fidelity image generation because they are **stable to train** (a plain regression loss — no adversarial min–max, no mode collapse) and offer **excellent sample quality and coverage**. Their one weakness — slow, many-step sampling — is largely tamed by faster samplers (DDIM) and by running the process in a compact latent space (latent diffusion), which is what makes modern text-to-image systems like Stable Diffusion practical.
  `,
  intuition: `
Imagine a clear photograph sitting in a snow globe. Shake the globe a tiny bit and a faint dusting of snow settles over the image; shake again and a little more; after enough shakes the picture is buried under uniform white noise. That is the **forward process** — and crucially, each shake is small and random in a known, simple way.

Now run the film backward. If you had a machine that, shown any snowed-over frame, could guess "this much snow was just added here," you could brush off that snow one layer at a time and watch the photograph reappear. The neural network *is* that machine. The astonishing part: once it has learned to brush snow off real photos, you can hand it a globe that is **nothing but snow** — fresh noise that never had a picture in it — and by removing snow step after step, a brand-new, never-before-seen photograph emerges. The model is not recovering a hidden image; it is hallucinating a plausible one consistent with everything it learned about how images get buried.
  `,
  mathematics: `
### 1. Forward process (fixed)
Given a clean image $x_0$, each step adds Gaussian noise governed by a schedule $\\beta_1,\\dots,\\beta_T$:

$$ q(x_t \\mid x_{t-1}) = \\mathcal{N}\\!\\big(x_t;\\, \\sqrt{1-\\beta_t}\\,x_{t-1},\\; \\beta_t \\mathbf{I}\\big). $$

Composing all steps gives a closed form that samples any noise level directly. With $\\alpha_t = 1-\\beta_t$ and $\\bar\\alpha_t = \\prod_{s=1}^{t}\\alpha_s$:

$$ x_t = \\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1-\\bar\\alpha_t}\\,\\epsilon, \\qquad \\epsilon \\sim \\mathcal{N}(0,\\mathbf{I}). $$

As $t \\to T$, $\\bar\\alpha_t \\to 0$, so $x_T$ is essentially pure noise.

### 2. Reverse process (learned)
A network $\\epsilon_\\theta(x_t, t)$ predicts the noise in $x_t$. The training objective is the simple denoising loss

$$ \\mathcal{L}_{\\text{simple}} = \\mathbb{E}_{x_0,\\,\\epsilon,\\,t}\\Big[\\big\\lVert \\epsilon - \\epsilon_\\theta(\\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1-\\bar\\alpha_t}\\,\\epsilon,\\; t)\\big\\rVert^2\\Big]. $$

### 3. Sampling
One DDPM reverse step subtracts the predicted noise and re-injects a little:

$$ x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}}\\Big(x_t - \\frac{1-\\alpha_t}{\\sqrt{1-\\bar\\alpha_t}}\\,\\epsilon_\\theta(x_t,t)\\Big) + \\sigma_t z, \\quad z \\sim \\mathcal{N}(0,\\mathbf{I}). $$

The predicted noise is proportional to the **score** $\\nabla_{x}\\log p(x_t) = -\\epsilon_\\theta / \\sqrt{1-\\bar\\alpha_t}$, linking diffusion to score-based generative models. DDIM drops the $\\sigma_t z$ term to make sampling deterministic and skippable, cutting the step count by 10–100×.
  `,
  pros: [
    "Stable training: a single regression (denoising) loss with no adversarial min–max, so none of the instability or mode collapse that plagues GANs.",
    "State-of-the-art sample quality and broad mode coverage, with a natural way to trade compute for fidelity by changing the number of sampling steps.",
    "Flexible conditioning (text, class, image, inpainting masks) via cross-attention and classifier-free guidance, enabling controllable text-to-image generation.",
  ],
  cons: [
    "Sampling is slow by default — hundreds of sequential network passes per image unless accelerated by DDIM, latent diffusion, or distillation.",
    "Training and high-resolution sampling are compute- and memory-intensive (mitigated, but not eliminated, by latent-space diffusion).",
    "Quality is sensitive to the noise schedule and guidance scale, and exact log-likelihood is less direct than in some other generative families.",
  ],
  codeSnippet: `import torch

T = 1000
betas = torch.linspace(1e-4, 2e-2, T)        # linear noise schedule
alphas = 1.0 - betas
abar = torch.cumprod(alphas, dim=0)           # cumulative product -> bar-alpha_t

def q_sample(x0, t, eps):
    """Forward: jump straight to noise level t in one step (closed form)."""
    a = abar[t].sqrt().view(-1, 1, 1, 1)
    b = (1 - abar[t]).sqrt().view(-1, 1, 1, 1)
    return a * x0 + b * eps                    # x_t = sqrt(abar) x0 + sqrt(1-abar) eps

def training_loss(model, x0):
    """The whole DDPM objective: predict the noise you added."""
    n = x0.size(0)
    t = torch.randint(0, T, (n,), device=x0.device)
    eps = torch.randn_like(x0)                 # the target
    xt = q_sample(x0, t, eps)
    eps_pred = model(xt, t)                    # network guesses the noise
    return ((eps - eps_pred) ** 2).mean()      # simple MSE loss

# Sampling (sketch): start x_T ~ N(0, I), then for t = T-1 .. 0 subtract the
# model's predicted noise (DDPM) or take a deterministic DDIM step.
x0 = torch.rand(4, 3, 32, 32)
print("Loss:", training_loss(lambda xt, t: torch.zeros_like(xt), x0).item())`,
  tldr: [
    "A **diffusion model** learns to generate by **reversing a gradual noising process** — destroy an image into noise, then learn to undo it one small step at a time.",
    "The **forward process** is fixed (no learning) and has a closed form: $x_t = \\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1-\\bar\\alpha_t}\\,\\epsilon$, so you can sample any noise level in one shot.",
    "The **reverse process** is a network trained with a **simple MSE loss to predict the added noise** $\\epsilon$ (equivalently, the score); the clean estimate is derived from it.",
    "**Generation starts from pure Gaussian noise** and iteratively denoises — there is no hidden real image being recovered.",
    "**DDPM** is high-quality but slow (hundreds of steps); **DDIM** makes sampling deterministic in 10–50 steps; **latent diffusion** runs the whole thing in a compressed autoencoder space to make text-to-image practical.",
    "Diffusion replaced GANs as the default for high-fidelity image generation thanks to **stable training** (no adversarial game) and strong **mode coverage**.",
  ],
  additionalSections: [
    {
      heading: "Derivation: From a Chain of Noisy Steps to a One-Line Forward Sampler",
      content: `
The forward process is defined step-by-step, $q(x_t\\mid x_{t-1}) = \\mathcal{N}(x_t; \\sqrt{1-\\beta_t}\\,x_{t-1}, \\beta_t\\mathbf{I})$. Training would be hopelessly slow if we had to simulate all $t$ steps to make one noisy example. Fortunately the composition collapses to a single Gaussian.

Write $\\alpha_t = 1-\\beta_t$. One step in reparameterized form is

$$ x_t = \\sqrt{\\alpha_t}\\,x_{t-1} + \\sqrt{1-\\alpha_t}\\,\\epsilon_{t}, \\qquad \\epsilon_t \\sim \\mathcal{N}(0,\\mathbf{I}). $$

Substitute the same expression for $x_{t-1}$:

$$ x_t = \\sqrt{\\alpha_t}\\big(\\sqrt{\\alpha_{t-1}}\\,x_{t-2} + \\sqrt{1-\\alpha_{t-1}}\\,\\epsilon_{t-1}\\big) + \\sqrt{1-\\alpha_t}\\,\\epsilon_t. $$

The two noise terms are independent zero-mean Gaussians, and the **sum of independent Gaussians is Gaussian** with variances adding: $\\sqrt{\\alpha_t(1-\\alpha_{t-1})}\\,\\epsilon_{t-1} + \\sqrt{1-\\alpha_t}\\,\\epsilon_t$ has variance $\\alpha_t(1-\\alpha_{t-1}) + (1-\\alpha_t) = 1 - \\alpha_t\\alpha_{t-1}$. So the pair merges into one draw with coefficient $\\sqrt{1-\\alpha_t\\alpha_{t-1}}$. Repeating down to $x_0$ and defining $\\bar\\alpha_t = \\prod_{s=1}^t \\alpha_s$ gives the closed form

$$ x_t = \\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1-\\bar\\alpha_t}\\,\\epsilon, \\qquad \\epsilon \\sim \\mathcal{N}(0,\\mathbf{I}). $$

This single line is what makes training cheap: to build a labeled example at any noise level, draw a random $t$ and a random $\\epsilon$, mix the clean image and the noise with these two coefficients, and you are done — no simulation of intermediate steps. The coefficient $\\sqrt{\\bar\\alpha_t}$ is the fraction of *signal* retained and $\\sqrt{1-\\bar\\alpha_t}$ the fraction of *noise*; as $\\bar\\alpha_t \\to 0$ the image dissolves into the standard normal that sampling starts from.
      `,
    },
    {
      heading: "Derivation: Why the Network Predicts the Noise",
      content: `
The principled objective for a latent-variable generative model is the variational bound (ELBO) on the data log-likelihood. For the diffusion chain it expands into a sum of per-step terms, each a KL divergence between the true reverse posterior $q(x_{t-1}\\mid x_t, x_0)$ and the model's $p_\\theta(x_{t-1}\\mid x_t)$. Because $q$ is Gaussian, these KL terms reduce to matching means.

The key move (Ho et al.) is the choice of parameterization. The true posterior mean can be written in terms of the noise $\\epsilon$ that produced $x_t$ from $x_0$. If we let the network predict that noise, $\\epsilon_\\theta(x_t,t)$, the per-step objective collapses to a weighted mean-squared error between the true and predicted noise. Dropping the time-dependent weights (which empirically *helps* sample quality) yields the famous **simple loss**:

$$ \\mathcal{L}_{\\text{simple}} = \\mathbb{E}_{x_0,\\epsilon,t}\\Big[\\big\\lVert \\epsilon - \\epsilon_\\theta\\big(\\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1-\\bar\\alpha_t}\\,\\epsilon,\\,t\\big)\\big\\rVert^2\\Big]. $$

So a daunting ELBO becomes ordinary regression: *add known noise, ask the network to name it.* Two consequences are worth holding onto. First, the clean image is recoverable from the prediction, $\\hat x_0 = (x_t - \\sqrt{1-\\bar\\alpha_t}\\,\\epsilon_\\theta)/\\sqrt{\\bar\\alpha_t}$, so noise-prediction and image-prediction are equivalent. Second, the predicted noise is proportional to the **score** of the noised data distribution, $\\nabla_{x}\\log p(x_t) = -\\epsilon_\\theta/\\sqrt{1-\\bar\\alpha_t}$, which is why diffusion and score-based (Langevin / SDE) generative models are two views of the same object: denoising *is* learning to follow the gradient that points back toward the data.
      `,
    },
  ],
  comparisons: [
    {
      title: "Diffusion vs GANs vs VAEs",
      methods: ["Diffusion", "GAN", "VAE"],
      rows: [
        {
          dimension: "Training objective",
          values: [
            "Denoising regression (stable MSE)",
            "Adversarial min–max (can be unstable)",
            "Evidence lower bound (reconstruction + KL)",
          ],
        },
        {
          dimension: "Sample quality",
          values: [
            "State of the art",
            "High, but prone to artifacts",
            "Lower — samples often blurry",
          ],
        },
        {
          dimension: "Mode coverage",
          values: [
            "Broad",
            "Can collapse to a few modes",
            "Broad",
          ],
        },
        {
          dimension: "Sampling speed",
          values: [
            "Slow (many steps) unless accelerated",
            "Fast (single pass)",
            "Fast (single pass)",
          ],
        },
        {
          dimension: "Latent structure",
          values: [
            "No compact latent by default (latent diffusion adds one)",
            "Low-dimensional latent",
            "Explicit, regularized latent",
          ],
        },
      ],
      takeaway:
        "Diffusion buys top quality and stable, mode-covering training at the cost of slow sampling — and faster samplers plus latent-space diffusion close most of that gap, which is why it is the default for modern high-fidelity image generation.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "You need **high-fidelity, diverse image generation** and can afford (or accelerate) multi-step sampling.",
      "**Training stability and mode coverage** matter — diffusion avoids the adversarial instability and mode collapse of GANs.",
      "You want **flexible conditioning**: text-to-image, inpainting, super-resolution, or image-to-image, all of which fit naturally via guidance and cross-attention.",
      "You can run in a **latent space** (via a pretrained autoencoder) to keep high-resolution generation affordable.",
    ],
    avoidWhen: [
      "You have a **hard real-time, single-pass latency budget** and cannot use few-step samplers or distillation — a GAN or feed-forward model may fit better.",
      "Compute is severely constrained for both training and sampling and a simpler generator suffices.",
      "You need **exact, tractable log-likelihoods** as a primary output rather than samples.",
      "The task is discrete/structured in a way that does not map cleanly to continuous Gaussian noising without extra machinery.",
    ],
    rulesOfThumb: [
      "Prototype with DDIM at 20–50 steps; only increase steps if quality is visibly limited.",
      "For high resolution, do diffusion in latent space (Stable Diffusion-style) rather than on raw pixels.",
      "Predict noise ($\\epsilon$) rather than $x_0$ for stable training, and tune the classifier-free guidance scale (≈5–8) for text-to-image.",
    ],
  },
  caseStudies: [
    {
      title: "DDPM sets a new bar for image generation on CIFAR-10",
      domain: "Generative image modeling",
      scenario:
        "Before 2020, GANs dominated high-fidelity image synthesis but were notoriously unstable to train and prone to mode collapse. It was unclear whether a likelihood-style model trained with a simple regression loss could compete on raw sample quality.",
      approach:
        "Ho, Jain and Abbeel trained a U-Net to predict the noise added by a fixed 1000-step Gaussian forward process, optimizing the simplified denoising MSE objective, then generated samples by running the learned reverse chain from pure noise back to a clean image.",
      outcome:
        "On unconditional **CIFAR-10**, DDPM reached an **FID of 3.17** and an **Inception score of 9.46**, beating the strong GAN baselines of the time — and did so with a stable, non-adversarial training procedure. The result kicked off the wave of work (DDIM, score-based SDEs, latent diffusion) that made diffusion the default approach for image, audio, and video generation.",
      source: {
        title: "Denoising Diffusion Probabilistic Models",
        authors: "Ho, J., Jain, A. and Abbeel, P.",
        url: "https://arxiv.org/abs/2006.11239",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "Where does a diffusion model start when generating a brand-new image?",
      options: [
        { text: "From a sample of pure Gaussian noise.", correct: true },
        { text: "From a real photo with a little noise added.", correct: false },
        { text: "From a blank (all-zero) image.", correct: false },
        { text: "From the training image closest to the prompt.", correct: false },
      ],
      explanation:
        "Sampling begins at $x_T \\sim \\mathcal{N}(0,\\mathbf{I})$ — pure noise that never contained an image — and the learned reverse process denoises it step by step into a new sample. The forward (noising) process is only used during training to build noisy/clean pairs.",
    },
    {
      question:
        "What does the neural network learn to predict in the standard (DDPM) formulation?",
      options: [
        {
          text: "The noise $\\epsilon$ that was added to produce the noisy input (equivalently, the score).",
          correct: true,
        },
        {
          text: "A binary mask of which pixels are noise.",
          correct: false,
        },
        {
          text: "The exact training image that the noisy input came from.",
          correct: false,
        },
        {
          text: "The discriminator's confidence that the image is real.",
          correct: false,
        },
      ],
      explanation:
        "The network $\\epsilon_\\theta(x_t,t)$ is trained with a simple MSE loss to predict the added noise. The clean estimate $\\hat x_0$ is then derived algebraically, and the predicted noise is proportional to the score $\\nabla_x \\log p(x_t)$ — there is no discriminator (that is GANs).",
    },
    {
      question:
        "The closed-form forward step is $x_t = \\sqrt{\\bar\\alpha_t}\\,x_0 + \\sqrt{1-\\bar\\alpha_t}\\,\\epsilon$. What happens as $t \\to T$ (so $\\bar\\alpha_t \\to 0$)?",
      options: [
        {
          text: "$x_t$ approaches pure Gaussian noise, since the signal coefficient vanishes and the noise coefficient goes to 1.",
          correct: true,
        },
        {
          text: "$x_t$ approaches the original clean image $x_0$.",
          correct: false,
        },
        {
          text: "$x_t$ becomes an all-zero image.",
          correct: false,
        },
        {
          text: "$x_t$ stops changing because the schedule saturates.",
          correct: false,
        },
      ],
      explanation:
        "$\\sqrt{\\bar\\alpha_t}$ is the fraction of signal kept and $\\sqrt{1-\\bar\\alpha_t}$ the fraction of noise. As $\\bar\\alpha_t \\to 0$ the signal term disappears and $x_t \\to \\epsilon \\sim \\mathcal{N}(0,\\mathbf{I})$ — exactly the distribution sampling starts from.",
    },
    {
      question:
        "What is the main practical advantage of DDIM (and latent diffusion) over a vanilla DDPM?",
      options: [
        {
          text: "Far faster sampling — deterministic few-step sampling and/or running in a compressed latent space.",
          correct: true,
        },
        {
          text: "It removes the need to train a neural network.",
          correct: false,
        },
        {
          text: "It makes the forward process learnable.",
          correct: false,
        },
        {
          text: "It guarantees exact log-likelihoods.",
          correct: false,
        },
      ],
      explanation:
        "Vanilla DDPM needs hundreds to a thousand sequential steps. DDIM is a deterministic, non-Markovian sampler that yields good images in 10–50 steps, and latent diffusion runs the whole process in a small autoencoder latent space — together they make high-resolution text-to-image generation practical.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Explain why training a diffusion model reduces to a simple mean-squared-error regression, despite the model being defined by a long Markov chain and a variational bound.",
      expectedAnswerRubric:
        "The answer should explain that the forward process has a closed form $x_t = \\sqrt{\\bar\\alpha_t}x_0 + \\sqrt{1-\\bar\\alpha_t}\\epsilon$, so a labeled training example at any noise level is made by sampling a random t and a random noise vector ε and mixing — no chain simulation needed. It should state that the ELBO decomposes into per-step KL terms between Gaussians that reduce to matching means, and that parameterizing the model to predict the added noise ε turns each term into an MSE between true and predicted noise; dropping the time weights gives the simple loss. A strong answer notes that x0 is recoverable from the predicted noise and that the predicted noise is proportional to the score, linking to score-based models.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
