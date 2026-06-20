import { LearningModule } from "./types";

export const neuralNetworks: LearningModule = {
  id: "neural-networks",
  title: "Neural Networks & Deep Learning",
  category: "Neural Networks / Deep Learning",
  prerequisites: ["logistic-regression"],
  tracks: ["modern-ai", "computer-vision"],
  difficulty: 3,
  relatedModules: ["logistic-regression", "cnn", "transformers"],
  shortDescription: "Layered differentiable models that learn feature representations by optimizing weights with gradient descent.",
  estimatedMinutes: 30,
  learningObjectives: [
    'Explain the forward pass through a Multi-Layer Perceptron (MLP)',
    'Describe how non-linear activations (ReLU, Sigmoid) enable networks to model non-linear functions',
    'Contrast forward propagation and backpropagation steps',
    'Explain the role of gradient descent in optimization of weights and biases',
  ],
  keyTerms: [
    { term: 'Activation Function', definition: 'A non-linear function applied to a neuron\'s output to introduce non-linearity into the network.' },
    { term: 'Backpropagation', definition: 'An algorithm that calculates gradients of the loss function with respect to weights using the chain rule.' },
    { term: 'Perceptron', definition: 'A single-layer neural network unit that computes a weighted sum of inputs and applies an activation function.' },
  ],
  misconceptions: [
    {
      claim: 'More layers always lead to better performance without any downside.',
      correction: 'Increasing depth increases model capacity, which can lead to severe overfitting if data is insufficient. It also increases training time and can cause vanishing/exploding gradient problems.'
    },
    {
      claim: 'Neural networks simulate the human brain exactly.',
      correction: 'Neural networks are inspired by biological networks, but their mathematical training (backpropagation) and structures differ significantly from biological brains.'
    }
  ],
  references: [
    {
      title: "Deep Learning",
      authors: "Goodfellow, I., Bengio, Y. and Courville, A",
      url: "https://www.deeplearningbook.org",
      type: "textbook"
    },
    {
      title: "Neural Networks and Deep Learning",
      authors: "Nielsen, M. A",
      url: "http://neuralnetworksanddeeplearning.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Vanishing Gradients',
      description: 'As gradients propagate backward through many layers, they can shrink to zero, stopping early layers from updating.',
      mitigation: 'Use ReLU activation functions, batch normalization, and residual skip connections.'
    }
  ],

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

print(f"Current Error (Loss): {loss.item():.4f}")`,
  tldr: [
    'A feedforward neural network (MLP) stacks layers of $z = Wx + b$ followed by a non-linear activation $f(z)$, letting it model curved decision boundaries that a single linear layer cannot.',
    'Non-linearity is the whole point: stacking purely linear layers collapses back into one linear layer, so the activation function is what gives the network its expressive power.',
    'The **Universal Approximation Theorem** says a single hidden layer with enough units can approximate any continuous function on a bounded domain — but "enough" can mean exponentially many units.',
    '**Depth** lets the network compose features hierarchically (edges to shapes to objects), often representing the same function with far fewer total parameters than a single very wide layer.',
    'Training uses **backpropagation** (the chain rule applied layer by layer) plus an optimizer like SGD or Adam to adjust every weight and bias to reduce the loss.',
    'XOR is the classic proof that you need at least one hidden layer: it is not linearly separable, so no single-layer perceptron can solve it.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Universal Approximation via ReLU "Bumps"',
      content: `
The Universal Approximation Theorem claims that a feedforward network with a single hidden layer and a non-linear activation can approximate any continuous function on a closed interval to arbitrary precision, given enough hidden units. The clearest way to see why is to build piecewise-linear approximations out of ReLU units.

### 1. A single ReLU is a hinge
A ReLU unit $f(x) = \\max(0, wx + b)$ is zero until $x = -b/w$, then rises linearly. It is a "hinge" with one bend. The key trick is that **adding and subtracting shifted hinges produces a bump**: a function that rises over some interval and then flattens or falls back to zero.

### 2. Building one bump from two ReLUs
Consider two ReLUs with the same slope but opposite sign, offset along $x$:

$$ h(x) = \\text{ReLU}(x) - \\text{ReLU}(x - 1) $$

For $x \\le 0$: $h(x) = 0 - 0 = 0$. For $0 < x \\le 1$: $h(x) = x - 0 = x$ (rising). For $x > 1$: $h(x) = x - (x-1) = 1$ (flat). So $h(x)$ is a ramp that climbs from $0$ to $1$ over $[0, 1]$ and then stays flat — a single "step-with-a-ramp" building block, made from just two hidden units.

### 3. Combining a few bumps to approximate a target function
Suppose the target function we want to approximate is the piecewise-linear "tent":

$$ g(x) = \\begin{cases} 2x & 0 \\le x \\le 0.5 \\\\ 2 - 2x & 0.5 < x \\le 1 \\\\ 0 & \\text{otherwise} \\end{cases} $$

We can build $g(x)$ exactly using **three** ReLUs:

$$ g(x) = 2\\,\\text{ReLU}(x) - 4\\,\\text{ReLU}(x - 0.5) + 2\\,\\text{ReLU}(x - 1) $$

Check the pieces. For $x \\le 0$, all three ReLUs are zero, so $g(x) = 0$. For $0 < x \\le 0.5$, only the first ReLU is active: $g(x) = 2x$, matching the rising edge. For $0.5 < x \\le 1$: $g(x) = 2x - 4(x - 0.5) = 2x - 4x + 2 = 2 - 2x$, matching the falling edge. For $x > 1$: $g(x) = 2x - 4(x-0.5) + 2(x-1) = 2x - 4x + 2 + 2x - 2 = 0$, back to flat.

### 4. Generalizing
Any continuous 1D function can be approximated arbitrarily closely by a fine enough grid of such tent/ramp pieces, each contributed by 2-3 ReLU units in the hidden layer, with the output layer just summing them with the right coefficients. This is the essence of the Universal Approximation Theorem: a wide-enough single hidden layer is a giant "piecewise-linear function fitter." The catch is that the number of bumps needed to control the error to within $\\epsilon$ can grow very quickly (often exponentially) as the function's complexity or the input dimension grows — which motivates going deep instead of just wide.
      `,
    },
    {
      heading: 'Derivation: Why Depth Can Beat Width Exponentially',
      content: `
Universal approximation tells us a wide single hidden layer is *sufficient* in principle, but says nothing about *efficiency*. The depth argument shows that composing layers can represent some functions with exponentially fewer total units than any single wide layer.

### 1. The composition argument
A network with $L$ layers is a composition of functions:

$$ F(x) = f^{(L)}(f^{(L-1)}(\\cdots f^{(1)}(x) \\cdots)) $$

Each layer can **reuse** the features built by the previous layer. If layer 1 learns $k$ useful primitive features, layer 2 can combine pairs (or larger groups) of them into $O(k^2)$ derived features — without needing $O(k^2)$ new parameters, because each layer-2 unit borrows the same $k$ shared building blocks. A single-layer ("shallow") network has no such reuse: every output unit must reconstruct all the relevant structure from scratch directly from the raw input, typically requiring far more hidden units to express the same function.

### 2. A concrete staged-feature example
Suppose the target function is a "parity-like" pattern over $n$ binary inputs grouped into pairs — e.g. you want to detect whether an **even number** of $n/2$ specific pairs are both "active." A two-layer composition can solve this efficiently:

- **Layer 1** (width $n/2$): each unit checks one pair, e.g. unit $i$ computes whether $x_{2i-1}$ AND $x_{2i}$ are both on — this needs only $n/2$ units, each looking at 2 inputs.
- **Layer 2** (small width): combines the $n/2$ pair-detectors to compute the overall parity/count condition.

Each layer here only needs to represent a *simple, local* function of its inputs. To replicate the same overall function in a **single** hidden layer (no reuse of intermediate pair-features), each hidden unit must be a function of potentially all $n$ raw inputs directly, and known results on threshold-circuit and Boolean-circuit complexity (e.g. the classical parity/XOR-circuit lower bounds) show that representing such structured Boolean functions with a single layer of threshold units can require a number of units that grows **exponentially in $n$**, whereas the depth-2 (or deeper) construction grows only **linearly**.

### 3. Why this matters for real networks
This is a simplified, discrete analogue of a more general principle that shows up across deep learning: stacking layers lets the network build a hierarchy of reusable, increasingly abstract intermediate features (edges to textures to parts to objects, in vision; characters to morphemes to phrases, in language). Each new layer multiplies the *expressive combinations* available from the previous layer's vocabulary, rather than starting over — which is why modestly deep networks often match or beat extremely wide shallow ones while using far fewer total parameters.
      `,
    },
  ],
  comparisons: [
    {
      title: 'Logistic Regression vs Single Hidden Layer MLP vs Deep MLP',
      methods: ['Logistic Regression', 'Single Hidden Layer MLP', 'Deep MLP'],
      rows: [
        {
          dimension: 'Representational capacity',
          values: ['Linear decision boundary only', 'Can approximate any continuous function given enough hidden units (universal approximation)', 'Can represent many structured functions with far fewer total parameters via hierarchical composition'],
        },
        {
          dimension: 'Risk of overfitting',
          values: ['Low — few parameters, strong bias', 'Moderate to high if hidden layer is very wide relative to data size', 'High — many parameters; needs regularization, dropout, and enough data'],
        },
        {
          dimension: 'Training difficulty',
          values: ['Easy — convex loss, fast convergence', 'Moderate — non-convex but generally well-behaved with modern optimizers', 'Harder — vanishing/exploding gradients, more hyperparameters, longer training'],
        },
        {
          dimension: 'Typical use case',
          values: ['Simple, interpretable binary classification on linearly separable or near-linear data', 'Small-to-medium tabular problems with mild non-linearity', 'Images, text, audio, and other high-dimensional, highly non-linear problems with abundant data'],
        },
      ],
      takeaway: 'Start with logistic regression as a cheap, interpretable baseline; reach for a single hidden layer when the data shows clear non-linear structure but stays modest in size; go deep only when the problem has rich hierarchical structure (vision, language, audio) and you have enough data and compute to justify the added overfitting risk and training difficulty.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'The relationship between inputs and outputs is **non-linear** and cannot be captured by simple feature engineering on a linear or logistic model.',
      'You have a **large** labeled dataset (thousands to millions of examples) relative to the number of parameters you plan to use.',
      'The input has rich structure that benefits from hierarchical features — images, audio, text, or other high-dimensional signals.',
      'You have access to enough compute (GPUs/TPUs) and time to iterate on architecture and hyperparameters.',
    ],
    avoidWhen: [
      'You have a **small** dataset (hundreds of rows) — a deep network will likely overfit; prefer linear/logistic regression or tree ensembles.',
      'You need a fully **interpretable** model for regulatory or stakeholder reasons — favor simpler, transparent models or add explicit explainability tooling.',
      'Latency or memory budgets are extremely tight (e.g. embedded devices) and a much smaller model would meet accuracy requirements.',
      'The relationship is genuinely close to linear — a neural network adds complexity and tuning burden without meaningfully improving accuracy.',
    ],
    rulesOfThumb: [
      'Start with the simplest model that could plausibly work (logistic regression or a shallow MLP) before reaching for depth.',
      'Watch the gap between training and validation loss — a widening gap signals overfitting; add dropout, weight decay, or more data.',
      'Prefer increasing depth over width when the problem has hierarchical structure; prefer width when the function is simple but needs fine resolution.',
    ],
  },
  caseStudies: [
    {
      title: 'The XOR problem and the first "AI winter" critique of perceptrons',
      domain: 'History of AI / foundations of deep learning',
      scenario: 'In 1969, Marvin Minsky and Seymour Papert published *Perceptrons*, proving that a single-layer perceptron cannot learn the XOR function because its four labeled points are not linearly separable. At the time, single-layer perceptrons were the dominant trainable neural model, and this result was widely read as a fundamental limitation of neural networks.',
      approach: 'The eventual resolution was architectural: adding a hidden layer of just 2 units lets the network first map the XOR inputs into a new 2D space where the classes become linearly separable, after which a final linear output layer can solve the problem. Backpropagation (popularized in the mid-1980s by Rumelhart, Hinton, and Williams) provided a practical algorithm for training such multi-layer networks end-to-end.',
      outcome: 'A minimal 2-2-1 MLP (2 inputs, 2 hidden ReLU/sigmoid units, 1 output) solves XOR with 100% accuracy on the 4 truth-table examples, something no single-layer perceptron can do for any choice of weights. This single example reframed the field’s understanding: the limitation was not "neural networks," but specifically *linear, single-layer* networks — motivating decades of subsequent work on deeper architectures and ultimately today’s deep learning systems.',
      source: {
        title: 'Neural Networks and Deep Learning, Ch. 1 ("Perceptrons" and the XOR limitation)',
        authors: 'Nielsen, M. A.',
        url: 'http://neuralnetworksanddeeplearning.com',
        type: 'textbook',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'According to the Universal Approximation Theorem, a single hidden layer with enough units can approximate any continuous function. Explain why modern deep learning architectures favor deeper networks over extremely wide single-layer networks despite this theorem.',
      expectedAnswerRubric: 'The answer should contrast representational capacity with efficiency. While a single wide layer is theoretically sufficient (capacity), the number of hidden units required can grow exponentially with function complexity. Deeper networks can represent the same hierarchical or compositional functions with exponentially fewer total parameters (efficiency), making them more practical to train and less prone to overfitting.'
    }
  ],
  quiz: [
    {
      question: 'Why does a feedforward network need a non-linear activation function between layers?',
      options: [
        { text: 'Without it, stacking multiple linear layers collapses mathematically into a single linear transformation, losing all benefit of depth.', correct: true },
        { text: 'Non-linear activations are only needed to speed up training, not for representational power.', correct: false },
        { text: 'Activations are required purely to keep outputs positive.', correct: false },
        { text: 'Linear layers cannot be trained with backpropagation.', correct: false },
      ],
      explanation: 'A composition of purely linear maps, $W_2(W_1x + b_1) + b_2$, is itself an affine function of $x$ — equivalent to one linear layer. The non-linear activation between layers is what allows depth to create genuinely more expressive, curved decision boundaries.',
    },
    {
      question: 'Why is the XOR function a classic illustration of the need for hidden layers?',
      options: [
        { text: 'XOR is not linearly separable, so no single straight-line decision boundary (i.e. no single-layer perceptron) can classify all four points correctly.', correct: true },
        { text: 'XOR cannot be computed by any digital circuit.', correct: false },
        { text: 'XOR requires more than two input features to define.', correct: false },
        { text: 'XOR can only be solved using convolutional layers.', correct: false },
      ],
      explanation: 'The two "positive" XOR points sit on opposite corners from the two "negative" points, so they cannot be separated by any single line. A hidden layer lets the network first re-represent the inputs in a space where the classes do become linearly separable.',
    },
    {
      question: 'A network performs near-perfectly on training data but much worse on validation data. Which is the most appropriate first response?',
      options: [
        { text: 'Treat it as a sign of overfitting and consider regularization (dropout, weight decay), more data, or a smaller model.', correct: true },
        { text: 'Immediately add more hidden layers to increase capacity further.', correct: false },
        { text: 'Lower the learning rate to zero so training stops changing the weights.', correct: false },
        { text: 'Conclude the model architecture is fundamentally incapable of solving the task.', correct: false },
      ],
      explanation: 'A large train-validation gap is the textbook signature of overfitting: the model has memorized training-specific patterns rather than learning generalizable structure. The fix is to reduce effective capacity or add data/regularization — not increase capacity, which would make the gap worse.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
