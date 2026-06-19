import { LearningModule } from "./types";

export const llms: LearningModule = {
  id: "llms",
  title: "Large Language Models",
  category: "Large Language Models",
  prerequisites: ["transformers"],
  tracks: ["modern-ai"],
  difficulty: 4,
  relatedModules: ["transformers", "nlp"],
  shortDescription: "Decoder-only Transformer language models trained to predict the next token and then adapted to follow instructions.",
  estimatedMinutes: 30,
  learningObjectives: [
    'Explain the autoregressive next-token prediction task',
    'Describe the stages of LLM development: Pretraining, Instruction Tuning, and Preference Optimization (RLHF/DPO)',
    'Explain decoding strategies such as greedy search, top-k, top-p, and temperature sampling',
    'Contrast hallucination, context limits, and retrieval-augmented generation architectures',
  ],
  keyTerms: [
    { term: 'Autoregressive', definition: 'A modeling approach where the model predicts the next element in a sequence using the previously predicted elements as inputs.' },
    { term: 'Temperature', definition: 'A hyperparameter that controls the randomness of next-token predictions by scaling logit values before softmax.' },
    { term: 'Instruction Tuning', definition: 'Fine-tuning a pretrained model on a dataset of prompt-response pairs to teach it to follow instructions.' },
  ],
  workedExamples: [
    {
      title: 'Autoregressive Decoding Probability',
      problem: 'For vocabulary [cat, dog, fish], model output logits are [2.0, 1.0, 0.0] at temperature $T = 1.0$. Calculate the next-token probability of "cat".',
      solution: 'Scale logits by temperature: $L = \\frac{\\text{logits}}{T} = [2.0, 1.0, 0.0]$. Next-token probabilities are $\\text{Softmax}([2.0, 1.0, 0.0]) = [\\frac{e^2}{e^2 + e^1 + e^0}, \\frac{e^1}{e^2 + e^1 + e^0}, \\frac{e^0}{e^2 + e^1 + e^0}] \\approx [\\frac{7.389}{7.389+2.718+1}, \\frac{2.718}{11.107}, \\frac{1}{11.107}] \\approx [0.665, 0.245, 0.090]$. The probability of "cat" is $66.5\\%$.',
    },
  ],
  misconceptions: [
    {
      claim: 'LLMs search a database of facts to answer questions.',
      correction: 'LLMs do not search databases or copy stored text; they generate text token-by-token based on statistical associations learned during training. They do not have access to real-time information unless combined with external retrieval tools.'
    },
    {
      claim: 'Higher temperature sampling increases the factual accuracy of the model.',
      correction: 'Higher temperature increases logit entropy, making predictions more random and creative but also increasing the probability of hallucinations and factually incorrect statements.'
    }
  ],
  references: [
    {
      title: "Language Models are Few-Shot Learners",
      authors: "Brown, T. B. et al",
      url: "https://arxiv.org/abs/2005.14165",
      type: "textbook"
    },
    {
      title: "Introducing LLaMA: A foundational, 65-billion-parameter large language model",
      authors: "Touvron, H. et al",
      url: "https://arxiv.org/abs/2302.13971",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Hallucination',
      description: 'The model generates highly plausible-sounding but factually incorrect or completely fabricated information.',
      mitigation: 'Use Retrieval-Augmented Generation (RAG), ground responses in source documents, and use low temperatures for factual tasks.'
    }
  ],

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
print("Full generated sequence:", " ".join(generated_words))`,
  tldr: [
    'An LLM is an **autoregressive** model that predicts the next token given all previous tokens: $p(x_{1:n}) = \\prod_t p(x_t \\mid x_{<t})$.',
    'Training minimizes the **cross-entropy / negative log-likelihood** of the next token; the exponentiated loss is **perplexity**, the model’s effective branching factor.',
    'Performance improves predictably with **scale** — more parameters, data, and compute — following empirical **power-law scaling laws** $L(N) \\propto N^{-\\alpha}$.',
    'New **emergent abilities** (in-context learning, multi-step reasoning, tool use) appear as scale grows, without being explicitly trained for.',
    'The dominant recipe is **pretraining** on a huge unlabeled corpus, then **fine-tuning** (instruction tuning + RLHF/DPO) to align behavior with human intent.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: The Autoregressive Language-Modeling Objective',
      content: `
We want a model of the joint probability of a token sequence $x_{1:n} = (x_1, x_2, \\ldots, x_n)$. Directly modeling this joint distribution is intractable — a vocabulary of size $V$ and length $n$ implies $V^n$ possible sequences. The **chain rule of probability** lets us factor any joint distribution into a product of conditionals exactly, with no approximation:

$$ p(x_1, x_2, \\ldots, x_n) = p(x_1)\\, p(x_2 \\mid x_1)\\, p(x_3 \\mid x_1, x_2) \\cdots p(x_n \\mid x_1, \\ldots, x_{n-1}) = \\prod_{t=1}^{n} p(x_t \\mid x_{<t}) $$

where $x_{<t}$ denotes all tokens before position $t$. A decoder-only Transformer with parameters $\\theta$ models each factor $p_\\theta(x_t \\mid x_{<t})$ with a causal (left-to-right) attention mask, so position $t$ can only attend to earlier positions.

**From likelihood to loss.** Given a corpus, maximum-likelihood estimation maximizes the probability the model assigns to the observed data. Taking logs turns the product into a sum, and we minimize the **negative** log-likelihood, averaged over the $N$ predicted tokens:

$$ \\mathcal{L}(\\theta) = -\\frac{1}{N}\\sum_{t=1}^{N} \\log p_\\theta(x_t \\mid x_{<t}) $$

This is exactly the **cross-entropy** between the one-hot empirical distribution of the true next token and the model’s predicted distribution: for a single step the target puts all mass on the true token $x_t$, so $H(\\text{target}, p_\\theta) = -\\log p_\\theta(x_t \\mid x_{<t})$.

**Connection to perplexity.** Perplexity is the exponentiated average cross-entropy:

$$ \\text{PPL} = \\exp\\!\\left( \\frac{1}{N}\\sum_{t=1}^{N} -\\log p_\\theta(x_t \\mid x_{<t}) \\right) = \\exp(\\mathcal{L}(\\theta)) $$

Intuitively, perplexity is the **effective branching factor** — the average number of equally likely tokens the model is choosing among at each step. A model with $\\text{PPL} = 1$ is perfectly certain and always correct; a model that assigns uniform probability over a vocabulary of size $V$ has $\\text{PPL} = V$. Lowering cross-entropy by a constant multiplicatively shrinks perplexity, which is why tiny loss improvements can correspond to meaningful gains in predictive quality.
      `,
    },
    {
      heading: 'Explanation: Neural Scaling Laws',
      content: `
A striking empirical finding (Kaplan et al. 2020; Hoffmann et al. 2022) is that the cross-entropy loss of a Transformer language model falls as a smooth **power law** in each of three resources — the number of non-embedding parameters $N$, the dataset size $D$ (tokens), and the training compute $C$ — as long as the other two are not the bottleneck:

$$ L(N) \\approx \\left(\\frac{N_c}{N}\\right)^{\\alpha_N}, \\qquad L(D) \\approx \\left(\\frac{D_c}{D}\\right)^{\\alpha_D}, \\qquad L(C) \\approx \\left(\\frac{C_c}{C}\\right)^{\\alpha_C} $$

On a log-log plot these are straight lines: $\\log L = -\\alpha \\log N + \\text{const}$. The exponents are small — Kaplan et al. report roughly $\\alpha_N \\approx 0.076$ for parameters and $\\alpha_D \\approx 0.095$ for data — which is precisely why scaling is *expensive*.

**Worked example: how much more to halve the loss?** Suppose loss scales as $L \\propto N^{-\\alpha}$ with $\\alpha = 0.076$ (ignoring the irreducible-loss floor for simplicity). To cut the loss in half we need a parameter multiplier $k$ such that:

$$ \\frac{L(kN)}{L(N)} = k^{-\\alpha} = \\frac{1}{2} \\;\\Longrightarrow\\; k = 2^{1/\\alpha} = 2^{1/0.076} \\approx 2^{13.2} \\approx 9{,}500 $$

So halving the loss by adding parameters alone demands on the order of **10,000x more parameters** — a brutal return curve. With the data exponent $\\alpha_D \\approx 0.095$, halving the loss via data alone needs $k = 2^{1/0.095} \\approx 2^{10.5} \\approx 1{,}500$x more tokens. The practical lesson, formalized by the **Chinchilla** compute-optimal analysis, is that for a fixed compute budget you should grow parameters and training tokens *together* (roughly in equal proportion) rather than pouring all compute into a giant model trained on too little data.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A language model assigns the following probabilities to the true next token at each of 3 positions: $0.5, 0.25, 0.5$. Compute the perplexity of the model on this sequence.',
      difficulty: 'warm-up',
      hints: [
        'Perplexity is $\\exp$ of the average negative log-probability: $\\text{PPL} = \\exp\\!\\left(-\\frac{1}{N}\\sum_t \\log p_t\\right)$.'
      ],
      solution: 'Average negative log-likelihood $= -\\frac{1}{3}(\\ln 0.5 + \\ln 0.25 + \\ln 0.5) = -\\frac{1}{3}(-0.693 - 1.386 - 0.693) = -\\frac{1}{3}(-2.772) = 0.924$. Then $\\text{PPL} = e^{0.924} \\approx 2.52$. Equivalently, using base-2 the per-token cross-entropy is $\\frac{1}{3}(1 + 2 + 1) = 1.33$ bits, so $\\text{PPL} = 2^{1.33} \\approx 2.52$ — the model is on average about as uncertain as choosing among 2.5 equally likely tokens.',
      tags: ['core-metric', 'computation'],
    },
    {
      prompt: 'At one position a model outputs logits $[2.0, 1.0, 0.0]$ over a 3-token vocabulary, and the **true** next token is the second one. Compute the next-token cross-entropy loss at this position (temperature $1.0$, natural log).',
      difficulty: 'core',
      hints: [
        'Cross-entropy at this step is $-\\log p(\\text{true token})$ where $p$ comes from the softmax of the logits.'
      ],
      solution: 'Softmax denominator: $e^{2} + e^{1} + e^{0} = 7.389 + 2.718 + 1.000 = 11.107$. Probability of the true (second) token: $p = e^{1}/11.107 = 2.718/11.107 \\approx 0.245$. Cross-entropy loss $= -\\ln(0.245) \\approx 1.407$ nats. (Had the true token been the first, the loss would have been $-\\ln(0.665) \\approx 0.408$ — lower, because the model already favored it.)',
      tags: ['loss', 'softmax'],
    },
    {
      prompt: 'A Transformer’s self-attention cost scales quadratically with sequence length. If processing a 2,000-token context costs $X$ FLOPs in the attention layers, roughly how much do the attention layers cost for an 8,000-token context, and why does this matter for long-context use?',
      difficulty: 'core',
      solution: 'Attention compute scales as $O(n^2)$ in sequence length $n$. Going from $n = 2{,}000$ to $n = 8{,}000$ is a $4\\times$ increase in length, so attention cost grows by $4^2 = 16\\times$, to roughly $16X$. (Memory for the attention matrix also grows $\\sim 16\\times$.) This quadratic blow-up is why naively quadrupling the context window is far more than 4x as expensive, and motivates techniques like FlashAttention, sparse/sliding-window attention, and KV-cache management for long-context serving.',
      tags: ['context-window', 'compute', 'conceptual'],
    },
    {
      prompt: 'You can scale up your model size by 10x or your dataset size by 10x. Given empirical scaling laws $L \\propto N^{-0.076}$ and $L \\propto D^{-0.095}$, evaluate which intervention is more effective and synthesize what this implies for compute-optimal training under a fixed budget.',
      difficulty: 'challenge',
      hints: [
        'Calculate the exact loss reduction multipliers for both a 10x increase in $N$ and a 10x increase in $D$.',
        'How does Chinchilla relate these separate scaling laws into a single budget recommendation?'
      ],
      solution: 'Parameters: $10^{-0.076} \\approx 0.839$, i.e. a $\\sim 16\\%$ loss reduction. Data: $10^{-0.095} \\approx 0.804$, i.e. a $\\sim 20\\%$ loss reduction. With these exponents the 10x data intervention reduces loss slightly more than 10x parameters. More importantly, neither should be scaled alone: the Chinchilla result shows that under a fixed compute budget the optimal strategy grows $N$ and $D$ together in roughly equal proportion — a model that is too large for its token budget (over-parameterized and under-trained) wastes compute. The takeaway is to balance model size against data, not to maximize parameters in isolation.',
      tags: ['scaling-laws', 'reasoning', 'compute-optimal'],
    },
  ],
  comparisons: [
    {
      title: 'Three stages of building an aligned LLM',
      methods: ['Pretraining', 'Supervised Fine-tuning', 'RLHF'],
      rows: [
        {
          dimension: 'Objective',
          values: [
            'Next-token cross-entropy (self-supervised NLL)',
            'Next-token cross-entropy on curated prompt-response pairs',
            'Maximize a learned reward (human preference) with a KL penalty to stay near the SFT policy',
          ],
        },
        {
          dimension: 'Data type',
          values: [
            'Massive **unlabeled** web text and code (trillions of tokens)',
            'Smaller **labeled** demonstrations of desired instruction-following',
            'Human **preference comparisons** (ranked pairs of responses) used to train a reward model',
          ],
        },
        {
          dimension: 'What it changes',
          values: [
            'Builds broad world knowledge and a general next-token predictor',
            'Teaches the model the **format** and **behavior** of following instructions',
            'Shifts the response **distribution** toward human-preferred (helpful, honest, harmless) outputs',
          ],
        },
        {
          dimension: 'Relative cost',
          values: [
            'Highest — dominates total compute (huge data + long training runs)',
            'Low — thousands to millions of examples, short training',
            'Moderate — needs human labeling plus reward-model and RL training loops',
          ],
        },
      ],
      takeaway: 'Pretraining creates raw capability at enormous cost; SFT cheaply teaches instruction-following; RLHF then aligns the model’s output distribution with human preferences. Each stage builds on the previous one rather than replacing it.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'The task is **open-ended language work** — drafting, summarizing, rewriting, translating, or answering questions — where flexible natural-language input and output are valuable.',
      'You need **few-shot or zero-shot** adaptation to a new task without collecting a labeled dataset or training a model.',
      'The problem benefits from broad **world knowledge** or code synthesis, and approximate, reviewable answers are acceptable.',
      'You can pair the model with **retrieval, tools, or verification** to ground its outputs when accuracy matters.',
    ],
    avoidWhen: [
      'You need **guaranteed factual correctness** or deterministic outputs without a verification/grounding layer — LLMs optimize plausibility, not truth.',
      'The task is a **narrow, well-defined** prediction problem (e.g. tabular classification) where a small, cheap, auditable model would be more accurate and far less costly.',
      'Latency, **cost**, or privacy constraints rule out large-model inference, and a smaller specialized model suffices.',
      'Decisions are **high-stakes and unsupervised** (medical, legal, financial) where hallucinations or bias could cause real harm without human review.',
    ],
    rulesOfThumb: [
      'Use **low temperature** (or greedy decoding) for factual/extractive tasks and higher temperature only for creative generation.',
      'Ground factual queries with **retrieval (RAG)** instead of relying on parametric memory, especially for recent or niche information.',
      'Measure quality with **task-specific evals**, not vibes — perplexity alone does not capture instruction-following or safety.',
      'Right-size the model: try the **smallest** model that passes your evals before reaching for the largest.',
    ],
  },
  caseStudies: [
    {
      title: 'GPT-3: scale unlocks few-shot in-context learning',
      domain: 'Natural language processing',
      scenario: 'Before GPT-3, adapting a language model to a new task typically required fine-tuning on a task-specific labeled dataset. Brown et al. (2020) asked whether simply scaling up an autoregressive Transformer would let a *single frozen* model perform new tasks from only a natural-language description and a handful of in-context examples — no gradient updates.',
      approach: 'They pretrained a 175-billion-parameter decoder-only Transformer on roughly 300 billion tokens of filtered web text, books, and Wikipedia, using the standard next-token cross-entropy objective. They then evaluated the same frozen weights across dozens of benchmarks in **zero-shot**, **one-shot**, and **few-shot** settings, supplying task examples purely in the prompt context.',
      outcome: 'GPT-3 (175B parameters, about 100x larger than its 1.5B-parameter predecessor GPT-2) achieved strong few-shot performance on many tasks, in some cases approaching fine-tuned baselines, and demonstrated that **in-context learning** strengthens systematically with scale. On the LAMBADA word-prediction benchmark, few-shot accuracy reached roughly **86%**. The work established few-shot prompting as a practical paradigm and is a canonical demonstration of an emergent capability appearing with scale.',
      source: {
        title: 'Language Models are Few-Shot Learners',
        authors: 'Brown, T. B. et al.',
        url: 'https://arxiv.org/abs/2005.14165',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'Which identity justifies factorizing a language model’s joint probability as $p(x_{1:n}) = \\prod_t p(x_t \\mid x_{<t})$?',
      options: [
        { text: 'The chain rule of probability, which holds exactly for any joint distribution.', correct: true },
        { text: 'An independence assumption that the tokens are i.i.d.', correct: false },
        { text: 'Bayes’ theorem applied to the prior over vocabularies.', correct: false },
        { text: 'The central limit theorem for long sequences.', correct: false },
      ],
      explanation: 'The chain rule decomposes any joint distribution into a product of conditionals with no approximation. It is *not* an independence assumption — quite the opposite, each factor conditions on all previous tokens. The autoregressive model simply parameterizes those conditionals.',
    },
    {
      question: 'A model achieves an average per-token cross-entropy of $1.386$ nats on a test set. What is its perplexity?',
      options: [
        { text: '$e^{1.386} \\approx 4$.', correct: true },
        { text: '$1.386$ — perplexity equals cross-entropy.', correct: false },
        { text: '$\\log(1.386) \\approx 0.33$.', correct: false },
        { text: '$1/1.386 \\approx 0.72$.', correct: false },
      ],
      explanation: 'Perplexity is the exponential of the average cross-entropy: $\\text{PPL} = e^{1.386} \\approx 4$. Intuitively the model is, on average, as uncertain as if choosing uniformly among 4 tokens.',
    },
    {
      question: 'Neural scaling laws state that loss falls as a power law $L \\propto N^{-\\alpha}$ with a small exponent (e.g. $\\alpha \\approx 0.08$). What does the *smallness* of $\\alpha$ imply?',
      options: [
        { text: 'Each additional halving of the loss requires an enormous (orders-of-magnitude) increase in scale.', correct: true },
        { text: 'Loss can be driven to exactly zero with modest additional compute.', correct: false },
        { text: 'Doubling the parameters roughly doubles model quality.', correct: false },
        { text: 'Scale has essentially no effect on loss.', correct: false },
      ],
      explanation: 'A small exponent means diminishing returns: to halve the loss you need a multiplier $k = 2^{1/\\alpha}$, which for $\\alpha \\approx 0.08$ is on the order of thousands. Scale reliably helps, but at steep, predictable cost — and the loss approaches an irreducible floor rather than zero.',
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Design a pipeline that takes a raw pretrained language model and aligns it to be a helpful and harmless assistant. Describe the role of RLHF in this pipeline relative to pretraining, and explain why RLHF cannot replace the pretraining phase.',
      expectedAnswerRubric: 'A strong answer should outline the stages: (1) Pretraining for broad capability, (2) Supervised Fine-Tuning (SFT) for instruction format, and (3) RLHF/DPO for preference alignment. It should emphasize that pretraining builds world knowledge and grammar, while RLHF only shifts the output distribution toward human preferences (helpfulness, honesty, harmlessness). RLHF requires a capable base model and cannot build world knowledge from scratch.'
    }
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
