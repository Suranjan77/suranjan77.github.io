import { Algorithm } from "./types";

export const neuralNetworks: Algorithm = {
  id: "neural-networks",
  title: "Neural Networks & Deep Learning",
  category: "Neural Networks / Deep Learning",
  shortDescription: "Layered differentiable models that learn feature representations by optimizing weights with gradient descent.",

  fullDescription: `
Neural networks are layered differentiable functions. Each layer applies a linear transformation followed by a non-linear activation, and training adjusts the weights so the final output minimizes a loss function.

Deep learning means using many such layers. Depth lets the model build representations hierarchically: early layers learn simple signals, middle layers combine them, and later layers specialize them for the target task.

### Where is it used?
They are used in language models, recommender systems, image recognition, speech recognition, translation, scientific modeling, and medical imaging. They are strongest when you have enough data, compute, and evaluation discipline to justify their flexibility.
  `,

  intuition: `
Imagine a model trying to identify whether a photo contains a car.

The workers at the very start of the line (the first layer) only look at tiny, zoomed-in pixels. They can only recognize basic things like straight edges or simple curves. They pass their findings to the next group of workers.

The second layer of workers looks at those edges and curves and combines them. They might say, "Ah, these curves make a circle!" or "These edges make a rectangle!" They pass this up the chain.

The deeper layers combine those shapes into task-level evidence: wheels, windows, chassis-like structure, and background context. The output layer converts that evidence into class scores or probabilities.
  `,

  mathematics: `
### 1. The Forward Pass
A basic Neural Network layer takes your input data ($x$), multiplies it by a set of weights ($W$), adds a bias ($b$), and then passes the result through an "activation function" ($f$) to introduce non-linearity (so it can learn curves, not just straight lines):

$$ z^{(1)} = W^{(1)}x + b^{(1)} $$
$$ a^{(1)} = f(z^{(1)}) $$
$$ \\hat{y} = W^{(2)}a^{(1)} + b^{(2)} $$

### 2. Backpropagation (How it learns)
When the network makes a prediction, the loss $\\mathcal{L}$ measures the error. Backpropagation applies the chain rule to compute gradients of that loss with respect to every trainable weight:

$$ \\frac{\\partial \\mathcal{L}}{\\partial W^{(1)}} = \\frac{\\partial \\mathcal{L}}{\\partial a^{(1)}} \\frac{\\partial a^{(1)}}{\\partial z^{(1)}} \\frac{\\partial z^{(1)}}{\\partial W^{(1)}} $$

An optimizer such as stochastic gradient descent or Adam then updates the weights in a direction that tends to reduce the loss on future batches.
  `,

  pros: [
    "They can learn useful feature representations directly from data instead of relying only on hand-engineered features.",
    "They scale well with data and compute, especially on GPUs and other accelerator hardware.",
    "They support many architectures: dense networks, CNNs, RNNs, transformers, autoencoders, and graph neural networks."
  ],

  cons: [
    "They can be difficult to interpret, especially when many layers and millions of parameters interact.",
    "They often need more data and tuning than simpler models. On small tabular datasets, tree ensembles are frequently stronger baselines.",
    "Training and serving large networks can be expensive and requires careful monitoring for overfitting, drift, and failure modes."
  ],

  codeSnippet: `import torch
import torch.nn as nn
import torch.optim as optim

# Build a simple Neural Network with PyTorch
class SimpleNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(10, 32), # Input layer
            nn.ReLU(),         # Activation function
            nn.Linear(32, 16), # Hidden layer
            nn.ReLU(),         # Activation function
            nn.Linear(16, 1),  # Output layer
            nn.Sigmoid()       # Squish output between 0 and 1
        )
        
    def forward(self, x):
        return self.layers(x)

model = SimpleNetwork()
criterion = nn.BCELoss() # How we measure mistakes
optimizer = optim.Adam(model.parameters(), lr=0.01) # How we update weights

# Fake data: 8 examples, 10 features each
x_batch = torch.randn(8, 10)
y_batch = torch.empty(8, 1).random_(2)

# One training step
optimizer.zero_grad()                 # Clear previous gradients
predictions = model(x_batch)          # 1. Forward pass
loss = criterion(predictions, y_batch)# 2. Compute loss
loss.backward()                       # 3. Backpropagate gradients
optimizer.step()                      # 4. Update weights

print(f"Current Error (Loss): {loss.item():.4f}")`
};
