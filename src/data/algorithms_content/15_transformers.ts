import { LearningModule } from "./types";

export const transformers: LearningModule = {
  id: "transformers",
  title: "Transformers",
  category: "Transformers",
  prerequisites: ["neural-networks", "nlp"],
  tracks: ["modern-ai"],
  difficulty: 4,
  relatedModules: ["neural-networks", "nlp", "llms", "vision-transformers"],
  shortDescription: "Sequence models built around attention, letting each token form a context-dependent weighted mixture of other token representations.",
  estimatedMinutes: 30,
  learningObjectives: [
    'Explain the limitations of recurrent neural networks (RNNs) and why attention is superior',
    'Formulate the Scaled Dot-Product Attention equation and define Query, Key, and Value vectors',
    'Describe Multi-Head Attention and its utility in attending to information at different positions',
    'Explain the role of positional encodings in preserving token sequence order',
  ],
  keyTerms: [
    { term: 'Self-Attention', definition: 'An attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence.' },
    { term: 'Scaled Dot-Product Attention', definition: 'Attention mechanism scaled by the square root of the head dimension to avoid extremely small gradients.' },
    { term: 'Positional Encoding', definition: 'A representation injected into input embeddings to provide information about the relative or absolute position of tokens.' },
  ],
  misconceptions: [
    {
      claim: 'Transformers process tokens sequentially like LSTMs.',
      correction: 'Transformers process all tokens in a sequence simultaneously (parallel computation), which makes them extremely fast to train on GPUs compared to LSTMs.'
    },
    {
      claim: 'Attention weights always represent exact causal relationships.',
      correction: 'Attention weights represent correlation and context mixture, not direct causal relationships or proof of logic.'
    }
  ],
  references: [
    {
      title: "Attention Is All You Need",
      authors: "Vaswani, A. et al",
      url: "https://arxiv.org/abs/1706.03762",
      type: "textbook"
    },
    {
      title: "Illustrated Transformer",
      authors: "Alammar, J",
      url: "https://jalammar.github.io/illustrated-transformer/",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Quadratic Scaling Bottleneck',
      description: 'Computing self-attention requires calculating an $N \\times N$ attention matrix, which scales quadratically ($O(N^2)$) in memory and compute with sequence length $N$.',
      mitigation: 'Use linear attention approximations, sparse attention patterns, or flash attention kernel optimizations.'
    }
  ],

  fullDescription: `
Transformers replace recurrence with attention. Instead of updating a hidden state one token at a time, a Transformer layer lets each token compare itself with the other tokens and build a new representation from the most relevant ones.

For encoders, tokens can attend bidirectionally across the whole input. For decoder language models, causal masking prevents a token from attending to future tokens. In both cases, self-attention creates direct paths between distant positions, while feed-forward layers and residual connections refine the representation.

The key tradeoff is compute: full attention forms an $N\\times N$ matrix for a sequence of length $N$. That gives powerful long-range interactions, but the cost grows quadratically with context length.
  `,

  intuition: `
Imagine reading the sentence: "The animal did not cross the street because it was tired."

The representation for "it" should borrow heavily from "animal." If the sentence ended with "because it was too wide," the useful source would shift toward "street." Attention makes that borrowing explicit: each token creates scores against other tokens, normalizes them into weights, and averages their value vectors.

Multi-head attention repeats this process in parallel. One head can track pronouns, another can track syntactic roles, and another can track nearby phrase structure. The model learns these heads from data rather than being given grammar rules.
  `,

  mathematics: `
### 1. Query, key, and value projections
Given token representations $X \\in \\mathbb{R}^{N\\times d_{model}}$, a layer projects them into queries, keys, and values:

$$ Q = X W_Q \\quad \\text{(Query)} $$
$$ K = X W_K \\quad \\text{(Key)} $$
$$ V = X W_V \\quad \\text{(Value)} $$

### 2. Scaled dot-product attention
Compatibility scores come from dot products between queries and keys. Dividing by $\\sqrt{d_k}$ keeps the softmax from saturating when vector dimensions are large:

$$ \\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V $$

For decoder-only generation, a mask sets scores for future positions to $-\\infty$ before the softmax.

### 3. Multi-Head Attention
To model several relationships at once, attention runs in $h$ learned subspaces:

$$ \\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O $$

$$ \\text{head}_i = \\text{Attention}(Q W_i^Q, K W_i^K, V W_i^V) $$
  `,

  pros: [
    "Highly parallelizable: Processes sequences all at once, allowing training across thousands of GPUs.",
    "No long-range decay: Directly links tokens over thousands of words without information decay.",
    "Extremely versatile: Scales well beyond text to vision (Vision Transformers), audio, and biological structures (AlphaFold)."
  ],

  cons: [
    "Quadratic compute complexity: Calculating the attention matrix scales at $\\mathcal{O}(N^2)$ with sequence length $N$, limiting context size.",
    "No built-in order: Because they process all tokens at once, they require manual positional encodings to know word order.",
    "Massive dataset requirement: Lacks spatial assumptions (inductive biases) of CNNs, requiring huge datasets to train from scratch."
  ],

  codeSnippet: `import torch
import torch.nn.functional as F

# A demonstration of Scaled Dot-Product Self-Attention
def self_attention(x, d_k=8):
    # Assumes input x has shape [seq_len, d_model] -> [3, 8]
    # Linear projection matrices (initialized randomly)
    W_q = torch.randn(8, d_k)
    W_k = torch.randn(8, d_k)
    W_v = torch.randn(8, 8)
    
    # 1. Project into Query, Key, Value spaces
    Q = torch.matmul(x, W_q) # Shape: [3, d_k]
    K = torch.matmul(x, W_k) # Shape: [3, d_k]
    V = torch.matmul(x, W_v) # Shape: [3, 8]
    
    # 2. Compute similarity matrix [seq_len, seq_len]
    scores = torch.matmul(Q, K.transpose(0, 1)) / (d_k ** 0.5)
    
    # 3. Softmax weights
    attention_weights = F.softmax(scores, dim=-1)
    
    # 4. Multiply weights by Values
    output = torch.matmul(attention_weights, V)
    return output, attention_weights

# Fake sequence of 3 tokens (e.g., "AI is cool"), model dim is 8
x_sequence = torch.randn(3, 8)
output_vectors, weights = self_attention(x_sequence)

print("Attention weight matrix:")
print(weights.tolist()) # Shows how much each token attends to others
print("Output representation shape:", output_vectors.shape)`,
  tldr: [
    'A transformer replaces recurrence with **self-attention**: each token builds a new representation as a weighted mixture of every token\'s value vector.',
    'Scores come from query–key dot products, scaled by $\\sqrt{d_k}$ and normalized by softmax: $\\text{softmax}(QK^T/\\sqrt{d_k})V$.',
    '**Multi-head** attention runs several attention maps in parallel so different heads capture different relationships (pronouns, syntax, position).',
    'All tokens are processed **simultaneously**, making transformers highly parallelizable — but they need **positional encodings** to recover word order.',
    'The cost is **quadratic** in sequence length ($O(N^2)$), which motivates sparse, linear, and flash-attention variants.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Why Scale by the Square Root of $d_k$',
      content: `
The $\\sqrt{d_k}$ factor is not arbitrary — it keeps the softmax in a healthy range. Assume the components of a query $q$ and a key $k$ are independent with mean $0$ and variance $1$. Their dot product is:

$$ q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i $$

Each term $q_i k_i$ has mean $0$ and variance $\\mathbb{E}[q_i^2]\\,\\mathbb{E}[k_i^2] = 1$, and the terms are independent, so:

$$ \\operatorname{Var}(q \\cdot k) = \\sum_{i=1}^{d_k} \\operatorname{Var}(q_i k_i) = d_k $$

The standard deviation therefore grows like $\\sqrt{d_k}$. For large $d_k$, raw scores can be large in magnitude, pushing the softmax into saturated regions where one weight is ~1 and the rest ~0 — and where gradients nearly vanish. Dividing by $\\sqrt{d_k}$ rescales the scores back to **unit variance**, keeping the softmax sensitive and trainable. That is precisely why the formula is $QK^T/\\sqrt{d_k}$ rather than just $QK^T$.
      `,
    },
    {
      heading: 'Derivation: Attention Output Is a Convex Combination of Values',
      content: `
For a single query, let $a = \\text{softmax}(s)$ be the attention weights over $N$ keys. By definition of softmax, $a_j \\ge 0$ and $\\sum_{j=1}^{N} a_j = 1$. The output is:

$$ o = \\sum_{j=1}^{N} a_j v_j = aV $$

Because the weights are non-negative and sum to one, $o$ is a **convex combination** of the value vectors $v_j$ — it always lies inside their convex hull. The conceptual payoff: a single attention layer can only **mix** representations that already exist in the sequence; it cannot extrapolate beyond them. Richer, non-convex transformations come from stacking attention with the feed-forward layers and residual connections that surround it.
      `,
    },
  ],
  comparisons: [
    {
      title: 'Sequence-modeling architectures',
      methods: ['RNN / LSTM', '1D CNN', 'Transformer'],
      rows: [
        {
          dimension: 'Parallel across sequence',
          values: ['No — sequential per timestep', 'Yes', 'Yes'],
        },
        {
          dimension: 'Path length between distant tokens',
          values: ['$O(N)$', '$O(N/k)$, less with dilation', '$O(1)$ — direct attention'],
        },
        {
          dimension: 'Compute per layer',
          values: ['$O(N d^2)$', '$O(N k d^2)$', '$O(N^2 d)$'],
        },
        {
          dimension: 'Very long context',
          values: ['Struggles (vanishing gradients)', 'Limited receptive field', 'Strong, but quadratic cost'],
        },
        {
          dimension: 'Order awareness',
          values: ['Built-in via recurrence', 'Built-in via locality', 'Needs positional encodings'],
        },
      ],
      takeaway: 'Transformers trade a quadratic compute cost for $O(1)$ path length and full parallelism — which is exactly why they overtook RNNs once data and compute became abundant.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You have enough data and compute to **pretrain or fine-tune** a large model and need to capture long-range dependencies.',
      'The task benefits from modeling **global context** — translation, summarization, code, or protein structure.',
      'You want one architecture that **transfers across modalities** (text, vision, audio).',
    ],
    avoidWhen: [
      'Sequences are extremely long and you are memory/latency constrained **without** access to efficient-attention variants — the $O(N^2)$ cost dominates.',
      'You have **little data** and no pretrained model — a transformer\'s weak inductive bias makes it data-hungry; a CNN, RNN, or classical model may win.',
      'The problem is simple or low-dimensional, where a lighter model is faster and just as accurate.',
    ],
    rulesOfThumb: [
      'Prefer fine-tuning a pretrained transformer over training one from scratch whenever you can.',
      'For long documents, reach for sparse / linear / flash attention before naively growing the context window.',
      'Always inject positional information (sinusoidal, learned, or rotary/RoPE).',
    ],
  },
  caseStudies: [
    {
      title: 'Attention Is All You Need — translation without recurrence',
      domain: 'Natural language processing',
      scenario: 'In 2017, the strongest machine-translation systems were deep LSTMs/GRUs with attention bolted on. They were slow to train because recurrence forbids parallelizing across sequence positions — each timestep waits for the previous one.',
      approach: 'The Transformer removed recurrence entirely, relying only on **multi-head self-attention** plus position-wise feed-forward layers and residual connections. This let the whole sequence be processed in parallel during training.',
      outcome: 'On the WMT 2014 English→German benchmark the Transformer reached **28.4 BLEU**, a new state of the art, while training in a small fraction of the time and cost of the recurrent competitors. The architecture went on to become the foundation of BERT, GPT, and essentially every modern large language model.',
      source: {
        title: 'Attention Is All You Need',
        authors: 'Vaswani, A. et al.',
        url: 'https://arxiv.org/abs/1706.03762',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Why is it necessary to scale the dot products by $\\frac{1}{\\sqrt{d_k}}$ in the scaled dot-product attention mechanism?',
      expectedAnswerRubric: 'The answer should explain that the variance of the dot product grows linearly with the head dimension $d_k$. Scaling by the square root of $d_k$ keeps the variance of the scores near 1, preventing the subsequent softmax function from operating in regions with extremely small gradients (saturating), which would hinder learning.'
    }
  ],
  quiz: [
    {
      question: 'A transformer processes the tokens of an input sequence:',
      options: [
        { text: 'All in parallel, which is exactly why positional encodings are required.', correct: true },
        { text: 'One at a time, like an LSTM.', correct: false },
        { text: 'In strictly reverse order.', correct: false },
        { text: 'Only during inference, not training.', correct: false },
      ],
      explanation: 'Self-attention sees all positions simultaneously, giving full parallelism but no inherent notion of order. Positional encodings are added precisely to reinject word-order information.',
    },
    {
      question: 'The main scalability bottleneck of vanilla self-attention is:',
      options: [
        { text: 'The $N \\times N$ attention matrix, costing $O(N^2)$ in time and memory.', correct: true },
        { text: 'The number of attention heads.', correct: false },
        { text: 'The position-wise feed-forward layers.', correct: false },
        { text: 'The embedding lookup table.', correct: false },
      ],
      explanation: 'Forming $QK^T$ yields an $N \\times N$ score matrix, so cost scales quadratically with sequence length $N$. This is what sparse, linear, and flash-attention methods are designed to mitigate.',
    },
    {
      question: 'A high attention weight from token A to token B most accurately means:',
      options: [
        { text: "B's value contributes strongly to A's new representation — context/correlation, not proven causation.", correct: true },
        { text: 'B causally determines A.', correct: false },
        { text: 'A and B are the same token.', correct: false },
        { text: 'The model has converged.', correct: false },
      ],
      explanation: 'Attention weights describe how much each value vector is mixed into a token\'s updated representation. They capture learned relevance/correlation, not a logical or causal proof.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
