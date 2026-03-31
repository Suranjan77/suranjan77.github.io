import { Algorithm } from "./types";

export const neuralNetworks: Algorithm = {
  id: "neural-networks",
  title: "Neural Networks & Deep Learning",
  category: "Neural Networks / Deep Learning",
  shortDescription: "Highly parameterised, flexible computational architectures capable of profound hierarchical feature learning securely derived through rigorous backpropagation.",

  fullDescription: `
Neural Networks (encompassing Multilayer Perceptrons, spatial CNNs, and temporal RNNs) sequentially concatenate dense hierarchical layers of interconnected linear regressions interspersed heavily with specific non-linear activation functions. Rather than waiting formally for a human practitioner to manually engineer raw predictive features, deep networks inherently recursively transform the complex input sequentially to efficiently discover latent geometric regularities independently. They structurally possess an immense, functionally massive computational statistical capacity, rendering them capable of robustly approximating profoundly continuous, multi-dimensional functions without structural bounding.

### Empirical Applications
Currently establishing the undisputed foundational bedrock of all modern advanced generative AI (e.g., conversational Large Language Models), formulating sophisticated deep reinforcement learning functional systems propelling autonomous vehicular algorithms, dictating highly advanced physical robotics kinematics, powering sophisticated global machine translation services, and providing undisputed state-of-the-art methodology within medical computer vision oncology diagnostics.
  `,

  intuition: `
If a basic linear model functions analogously to a singular specialist examining a complete image and attempting to heuristically guess the subject based solely upon terminal global statistics (e.g., aggregate colour), a Deep Neural Network structurally manifests as an incredible hierarchical committee of thousands of layered specialists. 

First-level specialists mathematically detect precise straight geometric lines and localised gradients; second-level specialists subsequently algebraically combine those primitive lines to identify specific curves and boundaries; deep-level specialists conceptually recognise combinations of boundaries as structured macroscopic entities (e.g., 'ears' and 'fur'), progressively establishing a rich, abstract multi-dimensional representation that explicitly permits the final output layer to confidently and accurately declare a successful classification.
  `,

  mathematics: `
### 1. Abstract Feed-Forward Propagation
A Multilayer Perceptron structurally explicitly applies repeated affine mathematical transformations, systematically and sequentially cascaded directly into non-linear activation functions (denoted as $f$):

$$ z^{(1)} = W^{(1)}x + b^{(1)} $$
$$ a^{(1)} = f(z^{(1)}) $$
$$ \\hat{y} = W^{(2)}a^{(1)} + b^{(2)} $$

### 2. The Calculus Chain Rule and Backpropagation Methodology
Deep architectural models are dynamically optimised structurally via sequential Stochastic Gradient Descent (SGD) variants. To determine exactly how a specific weight parameter influences the global empirical network loss $\\mathcal{L}$, the algorithm intrinsically utilises the multivariate Calculus Chain Rule, mathematically backpropagating the absolute gradient sequentially from the terminal loss function backwards towards the input layer:

$$ \\frac{\\partial \\mathcal{L}}{\\partial W^{(1)}} = \\frac{\\partial \\mathcal{L}}{\\partial a^{(1)}} \\frac{\\partial a^{(1)}}{\\partial z^{(1)}} \\frac{\\partial z^{(1)}}{\\partial W^{(1)}} $$

Wherein the critical localised pure derivative explicitly and mathematically passing backward through the non-linear activation layer is strictly formulated as analytically $\\frac{\\partial a^{(1)}}{\\partial z^{(1)}} = f'(z^{(1)})$.
  `,

  pros: [
    "Theoretically and empirically proven capable of approximating any arbitrarily complex, totally abstract continuous functional relationship (Universal Approximation Theorem).",
    "Efficiently and securely obviates the exceptionally tedious empirical requirement for formally constructing exhaustive raw human feature engineering matrices.",
    "Exhibits extraordinarily high structural scalability across massively parallel computational hardware (GPUs and TPUs)."
  ],

  cons: [
    "Notoriously difficult to interpret, interrogate, or audit the internally learned explicit abstract parameters (the ubiquitous 'Black Box' problem).",
    "Environmentally and financially expensive to continuously computationally train, mandating extensive hardware infrastructure."
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

# Construct and memorise the structural network architecture
model = SimpleMLP()
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# Forward pass execution and Backpropagation calculus derivation
x_batch = torch.randn(8, 10)
y_batch = torch.empty(8, 1).random_(2)

optimizer.zero_grad()
predictions = model(x_batch)
loss = criterion(predictions, y_batch)
loss.backward()
optimizer.step()

print(f"Computed Analytical BCE Error Loss: {loss.item():.4f}")`
};
