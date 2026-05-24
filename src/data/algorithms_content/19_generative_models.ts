import { Algorithm } from "./types";

export const generativeModels: Algorithm = {
  id: "generative-models",
  title: "Generative Adversarial Networks",
  category: "Generative Models",
  shortDescription: "Training a generator and a discriminator in a minimax game to generate highly realistic, synthetic data.",

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
