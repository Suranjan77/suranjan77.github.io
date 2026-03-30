import { Algorithm } from "./types";

export const neuralNetworks: Algorithm = {
  id: "neural-networks",
  title: "Neural Networks & Deep Learning",
  category: "Neural Networks / Deep Learning",
  shortDescription: "Highly-parameterised flexible computational graphs capable of extreme hierarchical feature learning securely through rigorous backpropagation.",
  fullDescription: "Neural Networks (spanning MLPs, spatial CNNs, and temporal RNNs) sequentially connect dense hierarchical layers of interconnected linear regressions interspersed heavily with non-linear activation functions. Rather than waiting formally for a human to manually engineer raw features, deep networks inherently recursively transform the complex input sequentially to efficiently discover latent geometric regularities. They structurally possess functionally massive computational statistical capacity, rendering them capable of robustly approximating continuous multi-dimensional functions.\n\n### Real-World Applications\nCurrently the bedrock foundation of all modern advanced generative AI (like conversational LLMs), sophisticated deep reinforcement learning functional systems driving autonomous vehicles, highly advanced physical robotics, sophisticated global machine translations, semantic real-time audio parsing, and undisputed state-of-the-art medical computer vision algorithms.",
  intuition: "If a basic linear model is a single specialist looking at an explicit image and trying to guess an animal based only strictly on overall color, a Deep Neural Network is an incredible hierarchy of thousands of layered specialists. First-level specialists detect straight geometric lines; second-level specialists combine those lines to find shapes; deep-level specialists recognize combinations of shapes as structured parts like 'ears' and 'fur', eventually reaching a rich abstraction that lets the final output layer explicitly declare 'It is a cat'.",
  mathematics: "### Abstract Feed Forward Propagation\n\nA Multilayer Perceptron structurally explicitly applies repeated affine mathematical transformations sequentially heavily followed directly by non-linear activations functions $f$:\n\n$$ z^{(1)} = W^{(1)}x + b^{(1)} $$\n$$ a^{(1)} = f(z^{(1)}) $$\n$$ \\hat{y} = W^{(2)}a^{(1)} + b^{(2)} $$\n\n### The Calculus Chain Rule and Backpropagation Methodology\n\nDeep Models are dynamically optimized structurally via sequential Stochastic Gradient Descent. To find exactly how a specific weight parameter affects the overall network loss $\\mathcal{L}$, we use the Calculus chain rule mathematically backpropagating from the final loss to the input:\n\n$$ \\frac{\\partial \\mathcal{L}}{\\partial W^{(1)}} = \\frac{\\partial \\mathcal{L}}{\\partial a^{(1)}} \\frac{\\partial a^{(1)}}{\\partial z^{(1)}} \\frac{\\partial z^{(1)}}{\\partial W^{(1)}} $$\n\nWhere the critical local pure derivative explicitly mathematically passing backwards through the non-linearity is explicitly strictly $\\frac{\\partial a^{(1)}}{\\partial z^{(1)}} = f'(z^{(1)})$.",
  pros: [
    "Theoretically capable of approximating any extremely complex totally abstract functional continuous relationship.",
    "Efficiently securely removes the tedious manual requirement for formally creating exhaustive raw human feature engineering matrices.",
    "Extraordinarily highly scalable."
  ],
  cons: [
    "Notoriously difficult to interpret or audit the learned explicit abstract parameters ('Black Box').",
    "Environmentally expensive computationally."
  ],
  codeSnippet: `import torch
import torch.nn as nn
import torch.optim as optim

class SimpleMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(10, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )
        
    def forward(self, x):
        return self.layers(x)

# Setup network
model = SimpleMLP()
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# Forward and Backprop
x_batch = torch.randn(8, 10)
y_batch = torch.empty(8, 1).random_(2)

optimizer.zero_grad()
predictions = model(x_batch)
loss = criterion(predictions, y_batch)
loss.backward()
optimizer.step()

print(f"BCE Error Loss: {loss.item():.4f}")`
};
