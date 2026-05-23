import { Algorithm } from "./types";

export const llms: Algorithm = {
  id: "llms",
  title: "Large Language Models",
  category: "Large Language Models",
  shortDescription: "Decoder-only Transformer language models trained to predict the next token and then adapted to follow instructions.",

  fullDescription: `
Large Language Models (LLMs) are usually decoder-only Transformers trained with an autoregressive objective: predict the next token from the previous tokens. A token can be a word, part of a word, punctuation mark, or byte-like unit depending on the tokenizer.

Pretraining teaches broad statistical structure from text and code. Instruction tuning then trains the model on examples of useful task-following behavior. Preference optimization methods, including RLHF-style pipelines, can further steer responses toward human preferences such as helpfulness, honesty, and harmlessness.

The central tension is that the training signal rewards plausible next-token distributions, not guaranteed truth. Good systems combine the model with retrieval, tools, evaluation, constraints, and careful prompting when factual accuracy matters.
  `,

  intuition: `
An LLM is best understood as a conditional probability model over tokens. If the prompt is "The capital of France is", a well-trained model assigns high probability to "Paris" because that continuation fits its learned representation of language and world facts.

Generation is iterative. The model samples or selects one token, appends it to the context, and repeats. Temperature, top-p, and other decoding settings decide how sharply or broadly the model samples from the next-token distribution.

This is why LLM behavior can feel both powerful and brittle. The same mechanism can produce useful code, summarize a paper, or confidently continue a false premise if the prompt and context make that continuation likely.
  `,

  mathematics: `
### 1. Autoregressive sequence modeling
An LLM factorizes the probability of a token sequence $x_{1:T}$ into left-to-right conditional probabilities:

$$ P(x_{1:T}) = \\prod_{t=1}^{T} P(x_t \\mid x_{<t}) $$

### 2. Next-token cross-entropy loss
For parameters $\\theta$ and vocabulary distribution $p_\\theta$, pretraining minimizes negative log likelihood:

$$ \\mathcal{L}(\\theta) = -\\frac{1}{T}\\sum_{t=1}^{T}\\log p_\\theta(x_t \\mid x_{<t}) $$

### 3. Temperature scaling
The network outputs logits $z_i$ over vocabulary items. Temperature $\\tau > 0$ rescales logits before softmax:

$$ P(x_i) = \\frac{e^{z_i / \\tau}}{\\sum_j e^{z_j / \\tau}} $$

Lower $\\tau$ concentrates probability on the highest-logit tokens. Higher $\\tau$ flattens the distribution and increases sampling diversity.
  `,

  pros: [
    "Unified interface: Natural language functions as a general-purpose programming language/API.",
    "Few-shot adaptation: Can solve entirely new tasks simply by showing a few examples in the prompt.",
    "Broad emergent skills: Capable of software engineering, logical reasoning, and document synthesis."
  ],

  cons: [
    "Hallucination prone: Optimizes plausible continuation, so factual claims need grounding and verification.",
    "High training and inference cost: State-of-the-art models require substantial data, accelerators, energy, and serving infrastructure.",
    "Safety and alignment risks: Tends to reflect biases, toxic statements, or misinformation present in its training data unless heavily aligned."
  ],

  codeSnippet: `import torch
import torch.nn.functional as F

# Simulate an autoregressive next-token generator loop
def generate_tokens(model_logits, prompt_indices, temperature=0.7, max_new_tokens=4):
    generated = list(prompt_indices)
    
    for _ in range(max_new_tokens):
        # 1. Grab model logits for the current step (simulated random logits here)
        # Vocabulary size is 5: ["the", "dog", "barked", "loudly", "."]
        logits = torch.randn(5) * 2.0 
        
        # 2. Apply temperature scaling
        scaled_logits = logits / temperature
        
        # 3. Softmax to turn into probabilities
        probs = F.softmax(scaled_logits, dim=-1)
        
        # 4. Sample next token index from probability distribution
        next_token = torch.multinomial(probs, num_samples=1).item()
        
        generated.append(next_token)
        
    return generated

# Vocabulary lookup map
vocab = {0: "the", 1: "dog", 2: "barked", 3: "loudly", 4: "."}
prompt = [0, 1] # "the dog"

# Generate 4 additional tokens
output_indices = generate_tokens(None, prompt, temperature=0.8, max_new_tokens=3)
generated_words = [vocab[idx] for idx in output_indices]

print("Prompt tokens: ['the', 'dog']")
print("Full generated sequence:", " ".join(generated_words))`
};
