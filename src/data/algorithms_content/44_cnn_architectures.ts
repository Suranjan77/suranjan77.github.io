import { LearningModule } from "./types";

export const cnnArchitectures: LearningModule = {
  id: "cnn-architectures",
  title: "Modern CNN Architectures",
  category: "Computer Vision",
  prerequisites: ["cnn"],
  tracks: ["computer-vision"],
  difficulty: 3,
  relatedModules: ["cnn", "computer-vision", "object-detection", "vision-transformers"],
  shortDescription:
    "How convolutional backbones evolved from AlexNet to ResNet and EfficientNet — and the single idea, the residual connection, that let networks go from tens to hundreds of layers without their gradients vanishing.",
  estimatedMinutes: 30,
  learningObjectives: [
    "Trace the backbone lineage — AlexNet → VGG → Inception → ResNet → EfficientNet — and what each contributed",
    "Explain the degradation problem and why naively stacking layers makes a plain deep network worse, even on training data",
    "Derive how a residual (skip) connection preserves gradient flow and lets very deep networks train",
    "Describe compound scaling (EfficientNet) and why balancing depth, width, and resolution beats scaling depth alone",
  ],
  keyTerms: [
    {
      term: "Residual Connection",
      definition:
        "A skip path that adds a block's input to its output, $y = F(x) + x$, so the block only has to learn the residual $F(x)$ and gradients get an identity highway back to earlier layers.",
    },
    {
      term: "Degradation Problem",
      definition:
        "The empirical finding that beyond a certain depth, plain stacked networks have *higher* training error than shallower ones — a optimization failure, not overfitting.",
    },
    {
      term: "1×1 Convolution (Bottleneck)",
      definition:
        "A convolution that mixes channels at each pixel without spatial extent, used to cheaply reduce or expand channel dimension (Inception, ResNet bottlenecks).",
    },
    {
      term: "Compound Scaling",
      definition:
        "EfficientNet's principle of scaling network depth, width, and input resolution together by a balanced set of factors rather than enlarging one dimension in isolation.",
    },
  ],
  misconceptions: [
    {
      claim:
        "To improve a CNN you can just keep stacking more layers.",
      correction:
        "Plain very deep networks suffer the degradation problem: past a point their training error *rises*, because gradients vanish/explode and the optimizer cannot drive the extra layers to even learn an identity. Residual connections are what made depth usable.",
    },
    {
      claim:
        "Residual connections help by effectively skipping (removing) layers.",
      correction:
        "The network stays fully deep and all layers train. The skip adds an identity path so each block learns a *residual* on top of its input and gradients flow back undiminished — it changes what the layers learn and how gradients propagate, it does not bypass computation.",
    },
    {
      claim:
        "A bigger model just means a deeper model.",
      correction:
        "Depth is only one axis. EfficientNet showed that for a fixed compute budget, scaling depth, width (channels), and input resolution *together* in balanced proportions beats pouring all the budget into depth alone.",
    },
  ],
  references: [
    {
      title: "Deep Residual Learning for Image Recognition (ResNet)",
      authors: "He, K., Zhang, X., Ren, S. and Sun, J.",
      url: "https://arxiv.org/abs/1512.03385",
      type: "paper",
    },
    {
      title: "Very Deep Convolutional Networks for Large-Scale Image Recognition (VGG)",
      authors: "Simonyan, K. and Zisserman, A.",
      url: "https://arxiv.org/abs/1409.1556",
      type: "paper",
    },
    {
      title: "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks",
      authors: "Tan, M. and Le, Q. V.",
      url: "https://arxiv.org/abs/1905.11946",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Vanishing/exploding gradients in deep plain stacks",
      description:
        "Without skip connections or careful normalization, gradients in a very deep network shrink (or blow up) multiplicatively layer by layer, so early layers receive almost no learning signal and the network underfits.",
      mitigation:
        "Use residual connections to give gradients an identity path, add batch/layer normalization, and initialize weights to preserve signal variance (He/Xavier initialization).",
    },
    {
      name: "Unbalanced scaling wastes compute",
      description:
        "Enlarging only depth (or only resolution) quickly hits diminishing returns and can hurt accuracy per FLOP — extra depth without matching width and resolution starves or overwhelms the representation.",
      mitigation:
        "Scale depth, width, and resolution jointly (EfficientNet compound scaling) and pick the trade-off with the deployment compute budget in mind.",
    },
  ],
  fullDescription: `
The convolutional network you already know is a building block; this module is about how those blocks were assembled into the backbones that defined a decade of computer vision — and the one structural idea that unlocked real depth.

### The lineage
- **AlexNet (2012)** showed a deep CNN on GPUs could crush classical methods on ImageNet, kicking off the deep-learning era of vision.
- **VGG (2014)** made architecture uniform and deep: stacks of small $3\\times3$ convolutions, demonstrating that two stacked $3\\times3$ filters cover the same receptive field as one $5\\times5$ with fewer parameters and more nonlinearity.
- **Inception/GoogLeNet (2014)** ran several filter sizes in parallel and used $1\\times1$ convolutions as cheap channel bottlenecks, getting accuracy at far lower cost.
- **ResNet (2015)** introduced the **residual connection** and trained networks of *152 layers* — an order of magnitude deeper than before — winning ImageNet and becoming the default backbone everywhere.
- **EfficientNet (2019)** systematized model scaling, balancing depth, width, and resolution to hit state-of-the-art accuracy at a fraction of the compute.

### The turning point
The jump from "tens of layers" to "hundreds" was not just more of the same. Plain deep networks hit the **degradation problem**: adding layers eventually *raised* training error. ResNet's fix — letting each block learn a residual $F(x)$ added back to its input $x$ — gave gradients a clean path home and made extreme depth trainable. That single idea reverberates far beyond CNNs (Transformers use the same residual blocks).
  `,
  intuition: `
Picture passing a whispered message down a long line of people. Each person mishears slightly, so by the end of a very long line the message is noise — that is a deep plain network, where the learning signal (the gradient) degrades a little at every layer until the earliest layers hear nothing useful.

Now give everyone a second rule: alongside whispering their *change* to the message, they also pass the message through *unchanged*. Even if someone adds nothing useful, the original still arrives intact at the far end. That untouched pass-through is the **residual connection**: each layer only has to learn a small *correction* (the residual) on top of what it received, and — crucially — the signal (and the gradient on the way back) has a clear highway that never gets multiplied away. Suddenly a line of 150 people works as well as a line of 10, because no link can silence the chain. That is why ResNets train at depths that broke every earlier design.
  `,
  mathematics: `
### 1. The residual block
A plain block computes $y = F(x)$. A residual block adds the input back:

$$ y = F(x) + x, $$

so the layers only need to learn the *residual* $F(x) = y - x$. Learning a near-identity mapping becomes trivial — drive $F$ toward zero — which is exactly what the degradation problem showed plain stacks could not do.

### 2. Why the gradient survives
Backpropagating through $y = F(x) + x$, the gradient with respect to the input is

$$ \\frac{\\partial L}{\\partial x} = \\frac{\\partial L}{\\partial y}\\left(1 + \\frac{\\partial F}{\\partial x}\\right). $$

The $+1$ from the identity path means the gradient reaching $x$ is at least $\\partial L / \\partial y$, never multiplied down to zero by a chain of small factors. Stacking $N$ residual blocks, the signal back to block $k$ carries a sum that always includes the undiminished identity term — in contrast to a plain stack whose gradient is a *product* of factors $\\prod_i \\partial F_i / \\partial x_i$ that decays or explodes.

### 3. Compound scaling
EfficientNet scales depth $d$, width $w$, and resolution $r$ by a single coefficient $\\phi$ with fixed ratios:

$$ d = \\alpha^{\\phi}, \\quad w = \\beta^{\\phi}, \\quad r = \\gamma^{\\phi}, \\qquad \\alpha\\cdot\\beta^2\\cdot\\gamma^2 \\approx 2, $$

so each unit of $\\phi$ roughly doubles FLOPs while keeping the three dimensions in balance.
  `,
  pros: [
    "Residual connections make very deep networks trainable, unlocking large accuracy gains and a reusable block that powers CNNs and Transformers alike.",
    "Mature, pretrained backbones (ResNet, EfficientNet) transfer extremely well, so most vision systems start from one rather than training from scratch.",
    "A clear menu of accuracy/compute trade-offs (ResNet-18 → ResNet-152, EfficientNet-B0 → B7) lets you match the model to the hardware budget.",
  ],
  cons: [
    "Large backbones are compute- and memory-hungry to train and to serve, especially at high input resolution.",
    "Architecture choices (depth, width, normalization, scaling) interact and still require experimentation or neural-architecture search to optimize.",
    "Convolutional inductive biases that help on limited data can cap peak accuracy at very large scale, where Vision Transformers can pull ahead.",
  ],
  codeSnippet: `import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """The idea that unlocked depth: learn F(x), then add x back."""
    def __init__(self, ch):
        super().__init__()
        self.conv1 = nn.Conv2d(ch, ch, 3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(ch)
        self.conv2 = nn.Conv2d(ch, ch, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(ch)

    def forward(self, x):
        out = torch.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        return torch.relu(out + x)          # <-- residual (skip) connection

# A plain block has no '+ x'; gradients then pass through a product of factors
# and can vanish. The identity path guarantees d_out/d_in includes a '+1' term.
x = torch.rand(1, 16, 32, 32)
print("Residual block output:", tuple(ResidualBlock(16)(x).shape))

# In practice: torchvision.models.resnet50(weights="DEFAULT") stacks these.`,
  tldr: [
    "Backbone lineage: **AlexNet → VGG → Inception → ResNet → EfficientNet**, each adding a key idea (depth on GPUs, uniform 3×3 stacks, multi-scale 1×1 bottlenecks, residuals, balanced scaling).",
    "Naively stacking layers hits the **degradation problem**: past a point a plain deep net has *higher training error* — an optimization failure, not overfitting.",
    "The **residual connection** $y = F(x) + x$ lets each block learn a small correction and gives the gradient an **identity highway** ($\\partial L/\\partial x$ keeps a $+1$ term), so hundreds of layers train.",
    "VGG showed stacked **3×3 convs** match larger receptive fields with fewer parameters and more nonlinearity; Inception used **1×1 convolutions** as cheap channel bottlenecks.",
    "**EfficientNet** scales depth, width, and resolution *together* (compound scaling) for far better accuracy per FLOP than scaling depth alone.",
    "The residual block generalized far beyond CNNs — **Transformers use the same skip-connection structure**.",
  ],
  additionalSections: [
    {
      heading: "Derivation: Why the Identity Path Saves the Gradient",
      content: `
Consider a stack of $N$ blocks. In a **plain** network, block $i$ computes $x_{i} = F_i(x_{i-1})$, so backpropagation multiplies Jacobians:

$$ \\frac{\\partial L}{\\partial x_0} = \\frac{\\partial L}{\\partial x_N}\\prod_{i=1}^{N}\\frac{\\partial F_i}{\\partial x_{i-1}}. $$

This gradient is a *product* of $N$ factors. If their magnitudes are typically below $1$, the product shrinks geometrically and the earliest layers receive an exponentially tiny signal (vanishing gradient); if above $1$, it explodes. Either way, training the first layers of a very deep plain stack is nearly impossible — which is the mechanism behind the degradation problem (the network cannot even learn to make the extra layers an identity map).

Now make each block **residual**: $x_i = F_i(x_{i-1}) + x_{i-1}$. The per-block Jacobian becomes $\\big(1 + \\partial F_i/\\partial x_{i-1}\\big)$, and expanding the product over the stack gives a sum of paths in which one term is the bare identity:

$$ \\frac{\\partial L}{\\partial x_0} = \\frac{\\partial L}{\\partial x_N}\\prod_{i=1}^{N}\\Big(1 + \\frac{\\partial F_i}{\\partial x_{i-1}}\\Big) = \\frac{\\partial L}{\\partial x_N}\\Big(1 + \\sum_i \\frac{\\partial F_i}{\\partial x_{i-1}} + \\dots\\Big). $$

The leading $1$ means the output gradient flows back to *every* block essentially undiminished — there is always a path that is pure identity, never multiplied down. The residual terms add learnable corrections on top. This is why a 152-layer ResNet trains where a 152-layer plain network degrades: the skip connection converts a fragile *product* of factors into a robust *sum* that preserves the signal. The same reasoning explains why residual blocks are now standard in essentially every deep architecture, Transformers included.
      `,
    },
  ],
  comparisons: [
    {
      title: "Milestone CNN Backbones",
      methods: ["VGG", "Inception", "ResNet", "EfficientNet"],
      rows: [
        {
          dimension: "Key idea",
          values: [
            "Uniform stacks of 3×3 convs",
            "Parallel multi-scale + 1×1 bottlenecks",
            "Residual (skip) connections",
            "Balanced compound scaling",
          ],
        },
        {
          dimension: "Trainable depth",
          values: ["~16–19 layers", "~22 layers", "Up to 152+ layers", "Scaled families (B0–B7)"],
        },
        {
          dimension: "Parameter efficiency",
          values: ["Low — many params", "High for its accuracy", "Good", "Highest accuracy/FLOP"],
        },
        {
          dimension: "Main contribution",
          values: [
            "Depth + small filters",
            "Cost-efficient width",
            "Made extreme depth trainable",
            "Principled scaling rule",
          ],
        },
      ],
      takeaway:
        "Each milestone added one durable idea; ResNet's residual connection was the structural breakthrough, and EfficientNet's scaling rule is the recipe for sizing a backbone to a compute budget.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "You need a strong, well-understood vision **backbone** — start from a pretrained ResNet or EfficientNet and fine-tune.",
      "You want a tunable **accuracy/compute trade-off** (pick a depth or EfficientNet variant for your latency/memory budget).",
      "You are designing any deep network and want the gradient to flow — reach for **residual blocks** and normalization by default.",
      "Data or compute is limited enough that a CNN's inductive biases beat a from-scratch Vision Transformer.",
    ],
    avoidWhen: [
      "You expect to train from scratch at very large scale where a Vision Transformer may surpass a CNN backbone.",
      "Extreme edge constraints demand a hand-tuned tiny model — even EfficientNet-B0 may be too large (consider MobileNet-class designs).",
      "The task is non-spatial or tabular, where convolutional backbones are simply the wrong tool.",
      "You need exact per-pixel or set outputs — pair the backbone with a segmentation or detection head rather than using the classifier alone.",
    ],
    rulesOfThumb: [
      "Default to a pretrained ResNet-50 as a baseline backbone; move to EfficientNet for better accuracy-per-FLOP.",
      "Add residual connections and batch/layer norm to any deep network you build — do not stack plain layers past ~20 deep.",
      "When scaling up, increase depth, width, and resolution together rather than one alone.",
    ],
  },
  caseStudies: [
    {
      title: "ResNet trains 152 layers and wins ImageNet 2015",
      domain: "Image classification",
      scenario:
        "By 2015, evidence showed that simply stacking more layers onto a plain CNN eventually *increased* training error — the degradation problem — so networks were effectively capped at a few tens of layers, well short of the depth thought necessary for richer features.",
      approach:
        "He et al. reframed each block to learn a residual function $F(x)$ added to its input via an identity skip connection, so a block could trivially represent identity (by driving $F$ to zero) and gradients could propagate backward through the identity path. This let them train networks of 50, 101, and 152 layers stably.",
      outcome:
        "The 152-layer ResNet achieved a **3.57% top-5 error on ImageNet**, winning the ILSVRC 2015 classification challenge and beating prior approaches and reported human-level performance (~5%), while a plain network of the same depth performed *worse* than a shallower one. Residual connections became a near-universal building block across deep learning.",
      source: {
        title: "Deep Residual Learning for Image Recognition",
        authors: "He, K., Zhang, X., Ren, S. and Sun, J.",
        url: "https://arxiv.org/abs/1512.03385",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "What is the degradation problem that motivated residual connections?",
      options: [
        {
          text: "Beyond some depth, a plain stacked network has higher training error than a shallower one — an optimization failure, not overfitting.",
          correct: true,
        },
        {
          text: "Deep networks always overfit the training data and generalize poorly.",
          correct: false,
        },
        {
          text: "Convolutions degrade image resolution at every layer.",
          correct: false,
        },
        {
          text: "Deeper networks need exponentially more training images.",
          correct: false,
        },
      ],
      explanation:
        "The degradation problem is that adding layers to a plain network eventually raises its *training* error — so it is not overfitting but an optimization difficulty (vanishing/exploding gradients and the inability to even learn identity mappings). Residual connections fixed it.",
    },
    {
      question:
        "Backpropagating through a residual block $y = F(x) + x$, what is $\\partial L / \\partial x$?",
      options: [
        {
          text: "$\\frac{\\partial L}{\\partial y}\\left(1 + \\frac{\\partial F}{\\partial x}\\right)$ — the $+1$ identity term keeps the gradient from vanishing.",
          correct: true,
        },
        {
          text: "$\\frac{\\partial L}{\\partial y}\\cdot\\frac{\\partial F}{\\partial x}$ — the same as a plain block.",
          correct: false,
        },
        { text: "Always exactly zero.", correct: false },
        { text: "$\\frac{\\partial L}{\\partial y}$ squared.", correct: false },
      ],
      explanation:
        "Differentiating $y = F(x) + x$ gives $\\partial L/\\partial x = \\partial L/\\partial y \\,(1 + \\partial F/\\partial x)$. The identity path contributes the $+1$, so the gradient reaching $x$ is at least $\\partial L/\\partial y$ — it is not multiplied down to zero by a chain of small factors, which is why deep ResNets train.",
    },
    {
      question:
        "What does EfficientNet's compound scaling do?",
      options: [
        {
          text: "Scales depth, width, and input resolution together in balanced proportions for better accuracy per FLOP.",
          correct: true,
        },
        {
          text: "Scales only depth, since depth is all that matters.",
          correct: false,
        },
        {
          text: "Removes layers to make the network smaller.",
          correct: false,
        },
        {
          text: "Replaces all convolutions with attention.",
          correct: false,
        },
      ],
      explanation:
        "EfficientNet scales depth ($\\alpha^\\phi$), width ($\\beta^\\phi$), and resolution ($\\gamma^\\phi$) jointly with a single coefficient and fixed ratios, so the three dimensions stay balanced. This achieves better accuracy at a given compute budget than enlarging any one dimension alone.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Explain why a 152-layer plain CNN fails to train well while a 152-layer ResNet succeeds, in terms of gradient flow.",
      expectedAnswerRubric:
        "A strong answer should explain that in a plain deep network the input gradient is a product of per-layer Jacobians, so if their magnitudes are below (or above) 1 the gradient vanishes (or explodes) exponentially with depth, starving the early layers and causing the degradation problem (training error rises with depth, and the net cannot even learn identity mappings). It should state that a residual block $y = F(x)+x$ gives $\\partial L/\\partial x = \\partial L/\\partial y\\,(1 + \\partial F/\\partial x)$, so the identity path contributes a $+1$ that lets the gradient flow back to every block essentially undiminished — converting a fragile product into a robust sum — which makes 152 layers trainable and lets each block learn only a residual correction.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
