import { LearningModule } from "./types";

export const autoencoders: LearningModule = {
  id: "autoencoders",
  title: "Autoencoders",
  category: "Autoencoders",
  prerequisites: ["neural-networks", "dimensionality-reduction"],
  tracks: ["practitioner"],
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

print(f"Reconstruction Loss: {loss.item():.4f}")`
};
