import { LearningModule } from "./types";

export const cnn: LearningModule = {
  id: "cnn",
  title: "Convolutional Neural Networks",
  category: "Convolutional Neural Networks",
  prerequisites: ["neural-networks"],
  tracks: ["modern-ai", "computer-vision"],
  difficulty: 3,
  relatedModules: ["neural-networks", "computer-vision"],
  shortDescription: "Neural networks for grid-like data that reuse small filters across space to learn local, translation-aware features.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Explain the mathematical convolution operation as applied to grid-like data',
    'Describe the concepts of local receptive fields and weight sharing',
    'Calculate dimensions of output activation maps given filter size, stride, and padding',
    'Compare convolutional layers, pooling layers, and fully connected layers',
  ],
  keyTerms: [
    { term: 'Kernel (Filter)', definition: 'A small matrix of weights that slides across the input data to extract local features.' },
    { term: 'Stride', definition: 'The step size with which the filter moves across the input grid.' },
    { term: 'Pooling', definition: 'A downsampling operation that reduces the spatial dimensions of activation maps, introducing translation invariance.' },
  ],
  misconceptions: [
    {
      claim: 'CNNs are only useful for 2D images.',
      correction: 'CNNs can be applied to 1D data (such as audio signals or text sequences) and 3D data (such as videos or medical MRI scans) by adjusting the kernel dimensions.'
    },
    {
      claim: 'Pooling layers are always required in a CNN.',
      correction: 'Many modern CNN architectures replace pooling layers with strided convolutions to downsample while keeping the model fully differentiable.'
    }
  ],
  references: [
    {
      title: "Gradient-Based Learning Applied to Document Recognition",
      authors: "LeCun, Y. et al",
      url: "http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf",
      type: "textbook"
    },
    {
      title: "ImageNet Classification with Deep Convolutional Neural Networks",
      authors: "Krizhevsky, A., Sutskever, I. and Hinton, G. E",
      url: "https://papers.nips.cc",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Texture Bias (Lack of Shape Understanding)',
      description: 'CNNs often recognize objects by local textures (like elephant skin) rather than global shapes, making them easily fooled by synthetic styles.',
      mitigation: 'Train with data augmentation techniques that randomize style, color, and texture.'
    }
  ],

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
print(f"Output shape: {logits.shape}") # Expect [4, 10]`,
  tldr: [
    'A CNN slides small, learned **kernels** across an input grid instead of connecting every pixel to every neuron, so each output unit only looks at a local **receptive field**.',
    '**Weight sharing** means the same kernel is reused at every spatial position, which slashes parameter count and gives the network **translation equivariance**.',
    'Output spatial size follows $O = \\left\\lfloor \\frac{W - K + 2P}{S} \\right\\rfloor + 1$ — padding and stride are knobs you tune to control how much the map shrinks.',
    'Stacking convolutions grows the **effective receptive field** layer by layer, letting early layers see edges and later layers see whole objects.',
    'CNNs trade a strong spatial **inductive bias** for data efficiency on grid-like data (images, audio, video) compared to architectures with fewer built-in assumptions, like Vision Transformers.',
    'Pooling or strided convolutions downsample feature maps, compounding the receptive-field growth while keeping compute manageable.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Output Spatial Dimensions',
      content: `
A convolutional layer slides a $K \\times K$ kernel across a $W \\times W$ input (assume square for simplicity; rectangular inputs apply the formula per axis independently).

### Setting up the count

Without padding, the kernel’s top-left corner can sit at positions $0, 1, 2, \\dots$ as long as the whole $K \\times K$ window still fits inside the input. The last valid position is $W - K$, so there are $W - K + 1$ valid positions when the stride is $1$.

Zero-padding adds $P$ extra rows/columns on **each** side, effectively growing the input to size $W + 2P$ before the kernel slides over it. That gives $W + 2P - K + 1$ valid positions at stride $1$.

A stride of $S$ means the kernel only stops at every $S$-th position, so we divide the number of valid steps by $S$ and floor the result (a partial step that does not align is simply discarded):

$$ O = \\left\\lfloor \\frac{W - K + 2P}{S} \\right\\rfloor + 1 $$

### Worked example

Take a $32 \\times 32$ input, a $5 \\times 5$ kernel, padding $P = 2$, and stride $S = 1$:

$$ O = \\left\\lfloor \\frac{32 - 5 + 2(2)}{1} \\right\\rfloor + 1 = \\left\\lfloor \\frac{32 - 5 + 4}{1} \\right\\rfloor + 1 = \\lfloor 31 \\rfloor + 1 = 32 $$

The output is still $32 \\times 32$ — this is exactly “same” padding: $P = \\lfloor K/2 \\rfloor = 2$ for an odd kernel keeps spatial size unchanged at stride $1$, which is why $P=2$ was chosen here rather than some other value.

### Why padding and stride are chosen the way they are

Padding controls whether spatial size shrinks (“valid” padding, $P=0$) or is preserved (“same” padding, $P = \\lfloor K/2 \\rfloor$ for odd $K$). Preserving spatial size lets you stack many layers without the feature map vanishing to $1\\times1$ before the network is deep enough to build rich features, and it also keeps border pixels from being under-represented relative to central ones.

Stride controls how aggressively you downsample while convolving. $S=1$ keeps maximum spatial resolution and is typical for early layers that need to preserve fine detail; $S=2$ halves resolution each layer (similar to a pooling step fused into the convolution itself) and is common in deeper layers or modern architectures that replace explicit pooling with strided convolutions, since it reduces both compute and memory while still being fully differentiable.
      `,
    },
    {
      heading: 'Derivation: Parameter Sharing and Translation Equivariance',
      content: `
### Counting parameters in a dense layer

Suppose the input is a $32 \\times 32 \\times 3$ image (the standard CIFAR-style RGB image) and we want $64$ output features using a **fully connected** layer. Every output unit attaches a unique weight to every input pixel-channel, plus one bias per output unit:

$$ \\text{params}_{\\text{dense}} = (32 \\cdot 32 \\cdot 3) \\cdot 64 + 64 = 3{,}072 \\cdot 64 + 64 = 196{,}608 + 64 = 196{,}672 $$

This count scales with the **product** of input size and output size — it explodes quickly as images get larger, and it learns a completely independent set of weights for every spatial position, even though the same edge or texture pattern can appear anywhere in the image.

### Counting parameters in a convolutional layer

Now use a convolutional layer with a $3 \\times 3$ kernel, $3$ input channels, and $64$ output channels (i.e. $64$ kernels), producing $64$ feature maps that cover the *entire* spatial extent of the input:

$$ \\text{params}_{\\text{conv}} = (3 \\cdot 3 \\cdot 3) \\cdot 64 + 64 = 27 \\cdot 64 + 64 = 1{,}728 + 64 = 1{,}792 $$

That is roughly **110x fewer parameters** than the dense layer ($196{,}672 / 1{,}792 \\approx 109.8$), even though the convolution still produces a comparably rich set of $64$ feature maps spanning the whole image. The reason: the same $3\\times3\\times3$ kernel weights are **reused** (shared) at every one of the $32\\times32$ output positions, rather than learning a brand-new weight for each position.

### Why sharing implies translation equivariance

Because the identical kernel $K$ is convolved across all spatial locations, shifting the input by some offset $(\\Delta i, \\Delta j)$ shifts the output feature map by the same offset, rather than producing a different response:

$$ \\text{Conv}(\\text{Shift}_{\\Delta i, \\Delta j}(X))_{i,j} = \\text{Conv}(X)_{i-\\Delta i, j-\\Delta j} $$

This property — **translation equivariance** — is exactly what parameter sharing buys you: a learned “vertical edge” detector fires on vertical edges wherever they occur in the image, instead of having to be independently re-learned at every pixel location the way a dense layer would require. It is also the structural assumption that fails when spatial position is itself meaningful (e.g. a fixed-format form where “name” always appears in the top-left) — in that setting, the bias that helps CNNs generalize on natural images can actually hurt.
      `,
    },
  ],
  comparisons: [
    {
      title: 'Fully Connected Network vs CNN vs Vision Transformer (ViT)',
      methods: ['Fully Connected Network', 'CNN', 'Vision Transformer (ViT)'],
      rows: [
        {
          dimension: 'Parameter count (on images)',
          values: ['Very high — scales with input size $\\times$ output size', 'Low — kernels are shared across all spatial positions', 'Moderate-to-high — depends on patch size and embedding dimension, but no spatial weight sharing like convolution'],
        },
        {
          dimension: 'Inductive bias',
          values: ['None — must learn every spatial relationship from scratch', 'Strong: locality + translation equivariance built in', 'Weak/minimal — mostly learns spatial relationships via attention and positional embeddings'],
        },
        {
          dimension: 'Data efficiency',
          values: ['Poor on raw pixels — needs huge data to learn spatial structure', 'Good — strong bias lets it learn from comparatively modest datasets', 'Poor at small scale — typically needs large-scale pretraining to match or beat CNNs'],
        },
        {
          dimension: 'Long-range dependencies',
          values: ['Possible in principle, but parameter-inefficient', 'Limited per-layer; requires depth or large kernels to grow receptive field', 'Strong — self-attention connects any two patches in one layer'],
        },
        {
          dimension: 'Typical use case',
          values: ['Tabular data, or as the final classifier head', 'Image/audio/video tasks, especially with limited data or compute', 'Large-scale vision tasks with abundant data/pretraining and a need for global context'],
        },
      ],
      takeaway: 'CNNs sit between unstructured fully connected networks and ViTs: they trade ViT’s flexibility for a strong spatial prior that makes them far more data- and parameter-efficient on grid-like data, especially when large-scale pretraining is not available.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'Your data has a **grid-like spatial or temporal structure** (images, spectrograms, video frames, sensor grids) where nearby values are correlated.',
      'You need a **data-efficient** model and cannot rely on massive pretraining corpora the way Vision Transformers typically do.',
      'You want **translation-aware** features, e.g. detecting an object or pattern regardless of where it appears in the frame.',
      'Inference needs to run on **constrained hardware** (mobile/embedded) where a parameter-efficient architecture matters.',
    ],
    avoidWhen: [
      'The input has **no meaningful spatial locality** (e.g. shuffled tabular features) — convolution’s locality assumption buys you nothing.',
      'You need to model **long-range global dependencies** across the whole input in a single layer — attention-based architectures do this more directly.',
      'You have **very large labeled datasets and compute** and the absolute best accuracy matters more than data efficiency — a well-pretrained Vision Transformer may outperform CNNs.',
      'Spatial position itself is semantically meaningful and should **not** be treated as interchangeable (e.g. fixed-layout forms) — translation equivariance becomes a liability rather than a benefit.',
    ],
    rulesOfThumb: [
      'Start with “same” padding ($P = \\lfloor K/2 \\rfloor$ for odd $K$) and stride 1 in early layers to preserve resolution while learning features.',
      'Prefer small kernels (3x3) stacked deep over a single large kernel — it is more parameter-efficient and gives a comparable receptive field.',
      'Use strided convolutions or pooling deliberately to grow receptive field exponentially rather than relying on depth alone.',
    ],
  },
  caseStudies: [
    {
      title: 'AlexNet and the 2012 ImageNet breakthrough',
      domain: 'Computer vision / image classification',
      scenario: 'The ImageNet Large Scale Visual Recognition Challenge (ILSVRC) 2012 required classifying images into 1,000 categories across roughly 1.2 million training images. Prior winning approaches relied on hand-engineered features (e.g. SIFT) combined with classical classifiers, and progress had plateaued.',
      approach: 'Krizhevsky, Sutskever, and Hinton trained “AlexNet,” an 8-layer CNN (5 convolutional layers plus 3 fully connected layers) with ReLU activations, dropout regularization, and data augmentation, trained on GPUs using stacked small-stride convolutions and max pooling to progressively build hierarchical features from raw pixels.',
      outcome: 'AlexNet achieved a top-5 test error of **15.3%**, compared to **26.2%** for the second-place entry that used traditional hand-engineered features — a dramatic margin that is widely credited with triggering the deep learning boom in computer vision over the following decade.',
      source: {
        title: 'ImageNet Classification with Deep Convolutional Neural Networks',
        authors: 'Krizhevsky, A., Sutskever, I. and Hinton, G. E.',
        url: 'https://papers.nips.cc',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Compare the performance of a Convolutional Neural Network (CNN) and a Vision Transformer (ViT) when trained from scratch on a small dataset. Explain the underlying architectural reasons for any differences in data efficiency.',
      expectedAnswerRubric: 'A strong answer should mention the built-in spatial inductive biases of CNNs, specifically locality and translation equivariance due to weight sharing. It should contrast this with ViTs, which lack these strict inductive biases and must learn spatial relationships purely from data, generally requiring large-scale pretraining to match or exceed CNN performance.'
    }
  ],
  quiz: [
    {
      question: 'A $30\\times30$ input is convolved with a $4\\times4$ kernel, padding $P=1$, stride $S=2$. What is the output spatial size?',
      options: [
        { text: '$O = \\lfloor (30-4+2)/2 \\rfloor + 1 = 15$', correct: true },
        { text: '$O = 30$', correct: false },
        { text: '$O = \\lfloor (30-4)/2 \\rfloor = 13$', correct: false },
        { text: '$O = 28$', correct: false },
      ],
      explanation: 'Using $O = \\lfloor (W - K + 2P)/S \\rfloor + 1 = \\lfloor (30 - 4 + 2)/2 \\rfloor + 1 = \\lfloor 28/2 \\rfloor + 1 = 14 + 1 = 15$.',
    },
    {
      question: 'Why does a convolutional layer have far fewer parameters than a fully connected layer mapping the same input to the same number of output feature maps?',
      options: [
        { text: 'The same kernel weights are reused (shared) at every spatial position instead of learning a unique weight per position.', correct: true },
        { text: 'Convolutional layers do not use biases.', correct: false },
        { text: 'Convolutional layers only look at half of the input pixels.', correct: false },
        { text: 'Convolutional layers use a smaller learning rate.', correct: false },
      ],
      explanation: 'Parameter sharing is the key mechanism: a $3\\times3\\times C_{in}$ kernel is convolved across all spatial locations rather than each output position getting its own independent set of weights, which is what a dense layer would require. This is unrelated to bias terms, partial input coverage, or learning rate.',
    },
    {
      question: 'What does "translation equivariance" mean in the context of CNNs?',
      options: [
        { text: 'Shifting the input produces a correspondingly shifted output feature map, because the same kernel is applied everywhere.', correct: true },
        { text: 'The model’s output is completely unchanged no matter where a pattern appears in the input.', correct: false },
        { text: 'The kernel rotates to match the orientation of the input pattern.', correct: false },
        { text: 'Training loss stays constant across epochs.', correct: false },
      ],
      explanation: 'Translation equivariance means shift-in implies shift-out: if you translate the input, the resulting feature map translates by the same amount. This is different from translation **invariance** (output completely unchanged regardless of position), which pooling layers approximate by discarding some positional information.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
