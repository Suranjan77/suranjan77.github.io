import { Algorithm } from "./types";

export const cnn: Algorithm = {
  id: "cnn",
  title: "Convolutional Neural Networks",
  category: "Convolutional Neural Networks",
  shortDescription: "Neural networks for grid-like data that reuse small filters across space to learn local, translation-aware features.",

  fullDescription: `
Convolutional Neural Networks (CNNs) are built around a simple constraint: nearby pixels matter together, and the same visual pattern can appear in many positions. Instead of connecting every input pixel to every hidden unit, a convolutional layer learns a small kernel and applies it across the image.

This gives the model three useful biases. Local receptive fields make early layers sensitive to edges and textures. Weight sharing keeps the parameter count small. Stacking layers expands the effective receptive field, so later layers can combine local evidence into object parts and class-level features.

CNNs are not magic image recognizers. They are a way of saying: "look for the same learned pattern everywhere, then compose the detected patterns into higher-level evidence."
  `,

  intuition: `
Think of a kernel as a learned template. A vertical-edge kernel gives a large positive response when the left side of a small image patch is bright and the right side is dark. Sliding that kernel across an image produces a feature map: high values mark positions where that pattern appears.

Training learns the kernel values rather than hand-coding them. A first layer might learn edges and color contrasts; later layers combine those maps into corners, repeated textures, eyes, wheels, or other task-relevant evidence. Pooling or strided convolution then trades exact location for a more compact representation.
  `,

  mathematics: `
### 1. Cross-correlation used in CNNs
Most deep-learning libraries implement cross-correlation, often still called convolution. For input image $X$ and kernel $K$, the output activation at location $(i,j)$ is:

$$ Y_{i,j} = b + \\sum_{c=1}^{C_{in}}\\sum_{u=0}^{k_h-1}\\sum_{v=0}^{k_w-1} K_{c,u,v}X_{c,i+u,j+v} $$

With $C_{out}$ learned kernels, the layer produces $C_{out}$ feature maps.

### 2. Output Spatial Dimensions
For one spatial dimension, input size $W$, kernel size $F$, padding $P$, dilation $D$, and stride $S$ produce:

$$ O = \\left\\lfloor \\frac{W + 2P - D(F-1) - 1}{S} \\right\\rfloor + 1 $$

### 3. Parameters and why sharing matters
A dense layer from a $32\\times32\\times3$ image to $64$ hidden units needs $32\\cdot32\\cdot3\\cdot64=196{,}608$ weights. A $3\\times3$ convolution with $64$ output channels needs only:

$$ 3\\cdot3\\cdot3\\cdot64 = 1{,}728 $$

That parameter sharing is the main reason CNNs train efficiently on images.
  `,

  pros: [
    "Extremely efficient parameters: Weight sharing drastically reduces parameter count compared to fully connected layers.",
    "Translation-aware features: The same learned detector is reused across the image, so a pattern can be recognized in multiple positions.",
    "Hierarchical feature learning: Automatically builds features from simple edges to complex shapes."
  ],

  cons: [
    "Requires useful locality: Works best when nearby values have meaning, as in images, spectrograms, and some time-series data.",
    "GPU dependent: Convolutions are highly parallelizable but computationally expensive, demanding GPU acceleration.",
    "Adversarial vulnerability: Tiny, imperceptible changes in pixels can completely disrupt model classifications."
  ],

  codeSnippet: `import torch
import torch.nn as nn
import torch.nn.functional as F

# A simple Convolutional Neural Network in PyTorch
class SimpleCNN(nn.Module):
    def __init__(self):
        super().__init__()
        # Input has 3 channels (RGB), outputs 16 channels, filter is 3x3
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1)
        # Pooling window is 2x2, cuts width/height in half
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        # Final fully connected classifier
        self.fc = nn.Linear(16 * 16 * 16, 10) # Assumes 32x32 input size

    def forward(self, x):
        # 1. Slide filters + apply non-linear activation
        x = F.relu(self.conv1(x))
        # 2. Downsample
        x = self.pool(x)
        # 3. Flatten representation for classifier
        x = torch.flatten(x, 1)
        # 4. Compute output class scores
        return self.fc(x)

# Create model and run fake RGB image batch through it
model = SimpleCNN()
fake_images = torch.randn(4, 3, 32, 32) # Batch of 4 images
logits = model(fake_images)
print(f"Output shape: {logits.shape}") # Expect [4, 10]`
};
