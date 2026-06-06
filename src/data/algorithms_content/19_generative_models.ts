import { LearningModule } from "./types";

export const generativeModels: LearningModule = {
  id: "generative-models",
  title: "Generative Adversarial Networks",
  category: "Generative Models",
  prerequisites: ["neural-networks", "probability-theory"],
  tracks: ["practitioner"],
  difficulty: 4,
  relatedModules: ["neural-networks", "probability-theory", "autoencoders"],
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
  workedExamples: [
    {
      title: 'Minimax Objective Loss',
      problem: 'Calculate the discriminator loss $L_D$ for a single real sample $x$ (with $D(x) = 0.9$) and a single fake sample $z$ (with $D(G(z)) = 0.2$). Objective is $L_D = -\\log D(x) - \\log(1 - D(G(z)))$.',
      solution: '$-\\log(0.9) - \\log(1-0.2) = -\\log(0.9) - \\log(0.8) \\approx 0.105 + 0.223 = 0.328$.',
    },
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
`
};
