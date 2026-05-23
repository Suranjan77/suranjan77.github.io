import { Algorithm } from "./types";

export const transformers: Algorithm = {
  id: "transformers",
  title: "Transformers",
  category: "Transformers",
  shortDescription: "Sequence models built around attention, letting each token form a context-dependent weighted mixture of other token representations.",

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
print("Output representation shape:", output_vectors.shape)`
};
