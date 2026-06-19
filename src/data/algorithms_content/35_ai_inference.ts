import { LearningModule } from "./types";

export const aiInference: LearningModule = {
  id: "ai-inference",
  title: "AI Inference Systems",
  category: "AI Inference Systems",
  prerequisites: ["transformers", "llms"],
  tracks: ["modern-ai"],
  difficulty: 3,
  estimatedMinutes: 40,
  shortDescription: "Techniques for deploying and serving deep models, covering model quantization, continuous batching, speculative decoding, and Key-Value (KV) cache management.",
  learningObjectives: [
    "Differentiate precision formats (FP32, FP16, INT8, INT4) and evaluate their memory footprints.",
    "Formulate quantization mappings from floating-point values to integer scales.",
    "Calculate the memory requirements of serving a model, accounting for parameter weights and Key-Value (KV) cache.",
    "Compare static batching, dynamic batching, and continuous batching in terms of latency and throughput.",
    "Explain the mechanics of speculative decoding and how it accelerates auto-regressive generation."
  ],
  keyTerms: [
    {
      term: "Quantization",
      definition: "The process of mapping continuous high-precision floating-point weights to low-precision integer formats (like INT8 or INT4) to decrease memory usage and latency."
    },
    {
      term: "Key-Value (KV) Cache",
      definition: "A memory-saving technique that stores the keys and values of past tokens in self-attention layers, avoiding redundant calculations during auto-regressive decoding steps."
    },
    {
      term: "Continuous Batching",
      definition: "A dynamic batching strategy that groups requests at the token level rather than the sequence level, inserting new requests as soon as old ones complete."
    },
    {
      term: "Speculative Decoding",
      definition: "An acceleration technique where a small, fast draft model generates candidate tokens, which are verified in parallel in a single forward pass by the large target model."
    }
  ],
  workedExamples: [
    {
      title: "Model and KV Cache Memory Estimation",
      problem: "Estimate the memory (in gigabytes) required to serve an 8-billion parameter language model in 16-bit precision (FP16), with a context window length of 4096 tokens and a batch size of 16. The model has 32 layers, a hidden dimension of 4096, and 32 attention heads.",
      solution: "Let's compute the memory requirements step-by-step:\n\n1. **Model Parameter Memory**:\n   - Parameters ($P$) = 8 billion = $8 \\times 10^9$\n   - FP16 precision uses 2 bytes per parameter.\n   $$M_{\\text{weights}} = P \\times 2\\text{ bytes} = 16 \\times 10^9\\text{ bytes} = 16.0\\text{ GB}$$\n\n2. **Key-Value (KV) Cache Memory**:\n   - For each token, each layer stores key and value vectors. The shape is: $2 \\times L \\times H \\times D_{\\text{head}}$ where $2$ represents the key and value matrices, $L$ is layers, $H$ is attention heads, and $D_{\\text{head}}$ is the head dimension.\n   - Note that $H \\times D_{\\text{head}} = d_{\\text{hidden}} = 4096$.\n   - KV cache memory per token (in bytes):\n     $$\\text{PerTokenBytes} = 2 \\times 32\\text{ layers} \\times 4096\\text{ dimension} \\times 2\\text{ bytes} = 524,288\\text{ bytes} = 0.524\\text{ MB}$$\n   - For batch size $B = 16$ and context length $C = 4096$:\n     $$M_{\\text{KV}} = B \\times C \\times \\text{PerTokenBytes} = 16 \\times 4096 \\dots = 65,536\\text{ tokens} \\times 524,288\\text{ bytes}$$\n     $$M_{\\text{KV}} = 34,359,738,368\\text{ bytes} = 32.0\\text{ GB}$$\n\n3. **Total Memory**:\n   $$M_{\\text{total}} = M_{\\text{weights}} + M_{\\text{KV}} = 16.0\\text{ GB} + 32.0\\text{ GB} = 48.0\\text{ GB}$$\n\nServing this model with the specified batch size and context length requires at least $48.0$ GB of GPU memory, where the KV cache makes up $66.7\\%$ of the total usage."
    }
  ],
  misconceptions: [
    {
      claim: "Quantizing a model from FP16 to INT8 halves the GPU compute latency for all workloads.",
      correction: "Quantization reduces memory bandwidth limits and storage size. However, compute latency only drops if the hardware (GPU/TPU) has optimized INT8 tensor cores and the execution framework avoids frequent conversions (dequantization) back to float for intermediate activation steps."
    },
    {
      claim: "Model weights are the only significant memory bottleneck when serving large language models.",
      correction: "While model weights dominate small batch sizes, the KV cache grows linearly with batch size and context length. As batch sizes and context lengths scale up, the KV cache memory can exceed the size of the model weights, as seen in the worked example."
    }
  ],
  references: [
    {
      title: "Efficiently Serving Large Language Models (vLLM)",
      authors: "Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, et al.",
      url: "https://arxiv.org/abs/2309.06180",
      type: "paper"
    },
    {
      title: "Speculative Decoding: Fast Coping with Large Models",
      authors: "Yaniv Leviathan, Matan Kalman, and Yossi Matias",
      url: "https://arxiv.org/abs/2211.17192",
      type: "paper"
    }
  ],
  failureModes: [
    {
      name: "KV Cache Out-of-Memory (OOM) Crashes",
      description: "When memory allocation for the KV cache is static, requests with varying lengths lead to fragmentation, exhausting GPU memory and triggering crashes.",
      mitigation: "Adopt virtual memory paging techniques (such as PagedAttention in vLLM) to allocate KV cache memory dynamically and reduce fragmentation."
    },
    {
      name: "Quantization Accuracy Degradation",
      description: "Quantizing weights to very low bitrates (like INT4 or INT3) can cause the model to lose reasoning accuracy, hallucinate, or output gibberish.",
      mitigation: "Use advanced quantization algorithms like GPTQ or AWQ that perform calibration searches, or use activation-aware quantization to protect outlier weights."
    }
  ],
  pros: [
    "Quantization decreases storage and memory costs, allowing large models to run on consumer hardware.",
    "Continuous batching improves overall serving throughput by maximizing GPU utilization.",
    "PagedAttention eliminates memory waste in attention layers."
  ],
  cons: [
    "Ultra-low bit quantization can degrade quality and reasoning accuracy.",
    "Speculative decoding throughput depends on a draft model aligning well with the target model's distributions.",
    "Managing KV cache pagination adds complexity to inference engine software."
  ],
  intuition: "Running deep learning models (especially LLMs) in production is incredibly expensive. Inference systems are about making serving as fast and cheap as possible. One way is quantization: storing weights in smaller formats (like 4-bit integers instead of 16-bit decimals), similar to compressing an image to save disk space. Another is caching: when generating a sentence word by word, the model has to re-read everything it has already generated. To avoid this, we save the past mathematical representations in a KV Cache. Finally, we batch requests dynamically at the word level (continuous batching) to keep the GPU busy without waiting for slow users to finish their prompts.",
  mathematics: "### Symmetric Uniform Quantization\n\nUniform quantization maps a continuous floating-point range $[x_{\\min}, x_{\\max}]$ to a signed $b$-bit integer range $[-2^{b-1}, 2^{b-1} - 1]$. For symmetric quantization, we calculate the scale factor $S$:\n$$S = \\frac{\\max(|x_{\\min}|, |x_{\\max}|)}{2^{b-1} - 1}$$\n\nThe quantization function $Q(x)$ maps float $x$ to integer $q$, and the dequantization function $\\tilde{Q}(q)$ maps integer back to float:\n$$q = \\operatorname{clip}\\left( \\operatorname{round}\\left( \\frac{x}{S} \\right), -2^{b-1}, 2^{b-1} - 1 \\right)$$\n$$\\tilde{Q}(q) = q \\times S$$\n\n### KV Cache Size Formula\n\nFor a transformer model with $L$ layers, $H$ attention heads, and head dimension $D_{\\text{head}}$, the number of bytes required to cache keys and values for a single token in precision $B_{\\text{precision}}$ (e.g. 2 bytes for FP16) is:\n$$\\text{BytesPerToken} = 2 \\times L \\times H \\times D_{\\text{head}} \\times B_{\\text{precision}}$$\n\nFor a serving batch size of $N_{\\text{batch}}$ and sequence length $N_{\\text{seq}}$, the total KV cache memory required in bytes is:\n$$\\text{TotalCacheMemory} = N_{\\text{batch}} \\times N_{\\text{seq}} \\times \\text{BytesPerToken}$$",
  fullDescription: "AI Inference Systems focuses on the software and hardware optimization layer necessary to serve deep learning models efficiently. It covers numerical precision quantization, memory cache management, dynamic scheduling, and speculative decoding techniques.",
  codeSnippet: `/**
 * Simple Symmetric Uniform Quantizer (Float to INT8)
 */
export class UniformQuantizer {
  private scale: number = 1.0;

  constructor(private bits: number = 8) {}

  /**
   * Calculates scale factor based on max absolute value
   */
  fit(weights: number[]) {
    let maxAbs = 0;
    for (const w of weights) {
      const abs = Math.abs(w);
      if (abs > maxAbs) {
        maxAbs = abs;
      }
    }

    const bound = Math.pow(2, this.bits - 1) - 1;
    this.scale = maxAbs / bound || 1.0;
  }

  /**
   * Quantizes a float value to a b-bit integer
   */
  quantize(value: number): number {
    const bound = Math.pow(2, this.bits - 1) - 1;
    const scaled = Math.round(value / this.scale);
    return Math.max(-bound - 1, Math.min(bound, scaled));
  }

  /**
   * Dequantizes an integer value back to float
   */
  dequantize(qValue: number): number {
    return qValue * this.scale;
  }

  /**
   * Helper to quantize an entire array of weights
   */
  quantizeArray(arr: number[]): number[] {
    this.fit(arr);
    return arr.map(w => this.quantize(w));
  }
}`,
  relatedModules: ["transformers", "llms", "neural-networks"],
  tldr: [
    'Autoregressive decoding generates one token per forward pass, so wall-clock latency is dominated by the **number of sequential steps**, not raw FLOPs.',
    'The **KV cache** stores the keys and values of all previous tokens, turning per-step attention work from $O(n)$ recomputation into a cheap $O(1)$ lookup-plus-append, at the cost of memory that grows linearly with sequence length and batch size.',
    'During decoding, each generated token reads the **entire weight matrix** for a single (or tiny-batch) matmul, so inference is **memory-bandwidth bound** — the GPU spends most of its time moving weights, not multiplying.',
    '**Batching** many requests reuses each loaded weight across many tokens, raising arithmetic intensity and GPU utilization, which boosts throughput but increases per-request latency.',
    '**Quantization** (FP16 to INT8/INT4) shrinks weight memory and bandwidth pressure roughly linearly with bit-width, trading a small accuracy loss for large speed and capacity gains.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Why the KV Cache Turns $O(n^2)$ Decoding into $O(n)$',
      content: `
In self-attention, the token at position $t$ produces a query $q_t$ and attends over the keys and values of **every** token up to and including itself: $k_1 \\dots k_t$ and $v_1 \\dots v_t$. The attention output is

$$ \\text{attn}(q_t) = \\sum_{i=1}^{t} \\operatorname{softmax}\\!\\left( \\frac{q_t \\cdot k_i}{\\sqrt{d}} \\right) v_i $$

**Naive decoding (no cache).** At each new step $t$, a stateless implementation re-embeds and re-projects the whole prefix of length $t$ to rebuild $k_1 \\dots k_t$ and $v_1 \\dots v_t$ from scratch. Building the keys and values for a prefix of length $t$ costs work proportional to $t$ (one projection per token). To generate $n$ tokens you pay this at every step, so the total work is

$$ \\sum_{t=1}^{n} O(t) = O\\!\\left( \\frac{n(n+1)}{2} \\right) = O(n^2). $$

The prefix is recomputed again and again — the same $k_i, v_i$ are regenerated $n - i$ times even though they never change.

**Cached decoding.** The keys and values of a token depend only on that token (and the fixed weights), so once computed they are **immutable**. The KV cache stores $k_1 \\dots k_{t-1}$ and $v_1 \\dots v_{t-1}$; at step $t$ we only project the **single** new token into $k_t, v_t$, append them, and attend. Per-step new-projection work is now $O(1)$ and the attention dot-products are $O(t)$, so the total over $n$ tokens is

$$ \\sum_{t=1}^{n} O(t)_{\\text{attention}} + O(1)_{\\text{projection}} = O(n) \\text{ projections} + O(n^2) \\text{ dot-products}, $$

but crucially the expensive **weight matmuls** (projections and the big feed-forward layers) drop from $O(n^2)$ to $O(n)$ — exactly one per generated token instead of one per token-per-step.

**Concrete numeric example.** Take a model with hidden dimension $d = 4096$ and suppose the per-token projection of $Q,K,V$ costs about $3 \\times 2 d^2 \\approx 1.0 \\times 10^{8}$ FLOPs (using $2 d^2$ FLOPs per linear map). Generating $n = 1000$ tokens:

- *Naive*: rebuild the prefix every step $\\Rightarrow$ roughly $\\sum_{t=1}^{1000} t \\times 10^{8} \\approx \\frac{1000 \\cdot 1001}{2} \\times 10^{8} \\approx 5.0 \\times 10^{13}$ projection FLOPs.
- *Cached*: project only the new token each step $\\Rightarrow 1000 \\times 10^{8} = 1.0 \\times 10^{11}$ projection FLOPs.

That is a $\\approx 500\\times$ reduction in projection FLOPs for a 1000-token generation — and the saving grows linearly with sequence length. The price is memory: the cache must hold $2 \\times L \\times d \\times n$ values per sequence, which is why long-context, large-batch serving becomes KV-cache-memory bound.
      `,
    },
    {
      heading: 'Why Autoregressive Decoding Is Memory-Bandwidth Bound (and How Batching Helps)',
      content: `
Whether a kernel is **compute-bound** or **memory-bound** is decided by its *arithmetic intensity*: the ratio of useful arithmetic to bytes moved from memory.

$$ \\text{Arithmetic Intensity} = \\frac{\\text{FLOPs performed}}{\\text{Bytes read/written}} \\;\\; \\left[ \\frac{\\text{FLOP}}{\\text{byte}} \\right] $$

A GPU has a peak compute rate (FLOP/s) and a peak memory bandwidth (byte/s). Their ratio defines a hardware *ridge point*. If a kernel’s arithmetic intensity is **below** the ridge point, the chip starves for data and runs at memory-bandwidth speed; above it, the chip is compute-limited.

**The batch-size-1 decoding problem.** Consider one weight matrix $W$ of shape $d \\times d$ multiplying a single token vector $x$ of shape $d \\times 1$. The matmul does about $2 d^2$ FLOPs but must read all $d^2$ weights from memory. In FP16 (2 bytes per weight) the intensity is

$$ \\frac{2 d^2 \\text{ FLOP}}{2 d^2 \\text{ bytes}} = 1 \\;\\frac{\\text{FLOP}}{\\text{byte}}. $$

Modern accelerators have ridge points of *hundreds* of FLOP/byte (for example, a chip with $\\sim 312$ TFLOP/s FP16 and $\\sim 2$ TB/s bandwidth has a ridge of $\\approx 156$ FLOP/byte). An intensity of $\\approx 1$ is far below that, so a single-token matmul runs at roughly **memory-bandwidth speed** — the GPU spends nearly all its time loading $W$ and almost none multiplying. This is why decoding latency tracks how fast you can stream the model’s weights, not its FLOP rating.

**How batching fixes it.** Stack $B$ token vectors into a $d \\times B$ matrix. The **same** weights $W$ are read **once** but reused across all $B$ tokens, so FLOPs scale with $B$ while bytes read stay fixed:

$$ \\text{Intensity} = \\frac{2 d^2 B}{2 d^2} = B \\;\\frac{\\text{FLOP}}{\\text{byte}}. $$

**Worked example.** With $d = 4096$ and the ridge point $\\approx 156$ FLOP/byte above:

- $B = 1$: intensity $1$ FLOP/byte $\\Rightarrow$ utilization $\\approx 1/156 \\approx 0.6\\%$ of peak compute — badly memory-bound.
- $B = 32$: intensity $32$ FLOP/byte $\\Rightarrow$ still memory-bound but $\\approx 20\\%$ of peak.
- $B \\approx 156$: intensity crosses the ridge $\\Rightarrow$ the kernel becomes compute-bound and approaches full GPU utilization.

So increasing batch size amortizes the expensive weight load across many tokens, lifting throughput dramatically. The trade-off is latency and memory: bigger batches mean each request may wait to be grouped, and the KV cache grows linearly with $B$. Continuous batching exists precisely to keep $B$ high token-by-token without making individual requests wait for a whole batch to finish.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A model has $L = 40$ layers and hidden dimension $d = 5120$ ($H \\times D_{\\text{head}} = 5120$). Using FP16 (2 bytes), compute the KV cache size for a **single** sequence of length $N_{\\text{seq}} = 2048$ tokens.',
      difficulty: 'warm-up',
      hints: [
        'Bytes per token $= 2 \\times L \\times d \\times B_{\\text{precision}}$.',
        'The leading $2$ is for storing both keys and values. Then multiply by the sequence length.'
      ],
      solution: 'Bytes per token $= 2 \\times 40 \\times 5120 \\times 2 = 819{,}200$ bytes $\\approx 0.78$ MB. For $N_{\\text{seq}} = 2048$ tokens: $819{,}200 \\times 2048 = 1{,}677{,}721{,}600$ bytes $\\approx 1.56$ GB. So a single 2048-token sequence already needs about **1.56 GB** of KV cache — multiply by batch size to see why long-context serving is memory-hungry.',
      tags: ['core-formula', 'memory'],
    },
    {
      prompt: 'A model has $7$ billion parameters. Compute its weight memory in (a) FP16, (b) INT8, and (c) INT4, and state the savings of INT4 relative to FP16.',
      difficulty: 'warm-up',
      solution: 'Memory $=$ parameters $\\times$ bytes-per-parameter. (a) FP16 $= 7 \\times 10^9 \\times 2 = 14 \\times 10^9$ bytes $\\approx 14$ GB. (b) INT8 $= 7 \\times 10^9 \\times 1 = 7$ GB. (c) INT4 $= 7 \\times 10^9 \\times 0.5 = 3.5$ GB. INT4 uses $3.5 / 14 = 1/4$ of the FP16 footprint — a **75% reduction**, which is what lets a 7B model fit comfortably on a consumer GPU.',
      tags: ['quantization', 'memory'],
    },
    {
      prompt: 'A serving system generates at a steady rate where each token takes $20$ ms (time-per-output-token). (a) What is the single-stream throughput in tokens/sec? (b) If continuous batching lets the GPU serve $B = 16$ concurrent requests at the same $20$ ms per-token step, what is the aggregate throughput, and what happens to each user’s perceived latency?',
      difficulty: 'core',
      hints: [
        'Tokens/sec for one stream $= 1000 / \\text{ms-per-token}$.',
        'With batching, each step still emits one token *per request*.'
      ],
      solution: '(a) Single stream: $1000 \\text{ ms} / 20 \\text{ ms} = 50$ tokens/sec. (b) With $B = 16$ requests advancing together, each 20 ms step emits 16 tokens (one per request), so aggregate throughput $= 16 \\times 50 = 800$ tokens/sec. Per-user latency is essentially unchanged at $\\approx 50$ tokens/sec *if* the batched step still takes 20 ms — but in practice the larger matmul is somewhat slower per step, so individual latency degrades slightly while total throughput rises roughly $16\\times$. This is the throughput-vs-latency trade-off of batching.',
      tags: ['throughput', 'batching'],
    },
    {
      prompt: 'Analyze the throughput-latency tradeoff when scaling inference batch size from 1 to 64. Justify your answer using arithmetic intensity and hardware utilization.',
      difficulty: 'challenge',
      hints: [
        'Think about how weight bytes are amortized across the batch.',
        'Consider what a request must wait for before its tokens are produced.'
      ],
      solution: 'At batch size $1$, a decode step reads the full weight matrix ($\\approx 2 d^2$ bytes) to do only $\\approx 2 d^2$ FLOPs, giving arithmetic intensity $\\approx 1$ FLOP/byte — deeply memory-bound, so the GPU is mostly idle while streaming weights. Raising the batch to $64$ reuses each loaded weight across $64$ tokens, lifting intensity to $\\approx 64$ FLOP/byte and pushing utilization toward (or past) the hardware ridge point, so total tokens/sec climbs nearly linearly until compute-bound. **Latency cost:** (i) a request may have to wait to be grouped into the batch (queuing delay), and (ii) the per-step matmul on a $d \\times 64$ activation is larger than on $d \\times 1$, so each step takes somewhat longer in wall-clock time, slowing the token cadence felt by any single user. Thus throughput (system-level) and latency (user-level) trade off against each other, which is the core scheduling tension continuous batching tries to balance.',
      tags: ['batching', 'roofline', 'conceptual'],
    },
  ],
  comparisons: [
    {
      title: 'Weight Precision: FP16/BF16 vs INT8 vs INT4',
      methods: ['FP16/BF16', 'INT8 Quantization', 'INT4 Quantization'],
      rows: [
        {
          dimension: 'Bytes per parameter',
          values: ['2 bytes', '1 byte', '0.5 bytes'],
        },
        {
          dimension: 'Weight memory for a 7B model',
          values: ['$\\approx 14$ GB', '$\\approx 7$ GB', '$\\approx 3.5$ GB'],
        },
        {
          dimension: 'Inference speed (bandwidth-bound decode)',
          values: ['Baseline', '$\\approx 2\\times$ less weight traffic, often faster decode', '$\\approx 4\\times$ less weight traffic, fastest decode'],
        },
        {
          dimension: 'Accuracy / quality loss',
          values: ['None (reference)', 'Near-lossless with good calibration (LLM.int8(), SmoothQuant)', 'Small but measurable; needs GPTQ/AWQ to stay usable'],
        },
        {
          dimension: 'Typical use case',
          values: ['Training and quality-critical or short-context serving', 'Default production serving sweet spot', 'Memory-constrained / consumer-GPU and edge deployment'],
        },
      ],
      takeaway: 'Each step down in precision roughly halves weight memory and bandwidth pressure; INT8 is usually near-free in quality with proper calibration, while INT4 trades a small, recoverable quality hit for the ability to run large models on modest hardware.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You are **serving** a trained model under latency or cost constraints and need to maximize tokens/sec per GPU dollar.',
      'Long contexts or high concurrency make the **KV cache** a memory bottleneck — paged attention and cache management pay off directly.',
      'You must fit a large model onto **limited GPU memory** (consumer or edge hardware) where INT8/INT4 quantization is the difference between fitting and not fitting.',
      'Workload has many concurrent requests, so **continuous batching** can keep the GPU at high arithmetic intensity.',
    ],
    avoidWhen: [
      'You are still **training or fine-tuning** — aggressive inference-time quantization and KV caching are decode-time optimizations, not training ones.',
      'The task is **quality-critical** and even small INT4 degradation is unacceptable (e.g. some medical or legal reasoning) — stay at FP16/BF16 or INT8.',
      'Traffic is extremely **low and bursty** with single isolated requests, where batching gives little benefit and just adds engineering complexity.',
      'A draft model that aligns well with the target is unavailable, making **speculative decoding** ineffective or even slower.',
    ],
    rulesOfThumb: [
      'Profile first: if decode is memory-bound (the common case), prioritize quantization and batching over raw FLOP optimizations.',
      'Start at INT8 for production; only drop to INT4 with a calibration method (GPTQ/AWQ) and an eval to confirm quality holds.',
      'Budget KV cache as $2 \\times L \\times d \\times \\text{bytes} \\times N_{\\text{seq}} \\times B$ and reserve headroom — it grows linearly with both context length and batch size.',
      'Push batch size up until you cross the hardware ridge point or hit a latency SLA, whichever comes first.',
    ],
  },
  caseStudies: [
    {
      title: 'vLLM and PagedAttention: near-zero KV cache waste',
      domain: 'LLM serving infrastructure',
      scenario: 'Production LLM serving systems pre-2023 reserved a contiguous block of GPU memory for each request’s KV cache sized to the maximum possible sequence length. Because most requests finish far short of that maximum, Kwon et al. measured that existing systems wasted **60% to 80%** of KV cache memory to internal and external fragmentation, capping how many requests could be batched concurrently.',
      approach: 'PagedAttention borrows the operating-system idea of virtual memory and paging: the KV cache is split into fixed-size **blocks** that need not be contiguous, allocated on demand as a sequence grows, and shared across sequences (e.g. for common prefixes). This nearly eliminates fragmentation and enables much larger effective batch sizes, which in turn raises arithmetic intensity and GPU utilization.',
      outcome: 'The vLLM system built on PagedAttention reduced KV cache waste to **under 4%** and improved serving throughput by **2 to 4 times** over prior systems such as FasterTransformer and Orca at the same latency level, with larger gains for longer sequences and bigger models — all without changing model accuracy.',
      source: {
        title: 'Efficient Memory Management for Large Language Model Serving with PagedAttention',
        authors: 'Kwon, W., Li, Z., Zhuang, S., Sheng, Y., Zheng, L., Yu, C. H., Gonzalez, J. E., Zhang, H., and Stoica, I.',
        url: 'https://arxiv.org/abs/2309.06180',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: "Explain the relationship between serving batch size, arithmetic intensity, and total system throughput versus individual request latency in autoregressive decoding.",
      expectedAnswerRubric: "A strong answer should note that increasing batch size reuses loaded weights across multiple tokens, thereby increasing arithmetic intensity and raising total throughput towards the hardware compute ridge point. It must also correctly identify that this optimization comes at the cost of higher individual request latency due to queuing delays and larger per-step matrix multiplications, alongside increased KV cache memory requirements."
    }
  ],
  quiz: [
    {
      question: 'During single-stream autoregressive decoding of a large transformer, the GPU is typically:',
      options: [
        { text: 'Memory-bandwidth bound — most time is spent reading weights for tiny batch-size-1 matmuls.', correct: true },
        { text: 'Compute bound — the matmuls saturate the tensor cores.', correct: false },
        { text: 'Network bound — the bottleneck is inter-GPU communication.', correct: false },
        { text: 'Disk bound — weights are streamed from SSD each step.', correct: false },
      ],
      explanation: 'A batch-size-1 decode step reads the entire weight matrix ($\\approx 2 d^2$ bytes) to perform only $\\approx 2 d^2$ FLOPs, an arithmetic intensity of $\\approx 1$ FLOP/byte — far below the hundreds-of-FLOP/byte ridge point of modern accelerators. The chip starves for data, so it runs at memory-bandwidth speed, not compute speed.',
    },
    {
      question: 'What is the primary purpose of the KV cache in autoregressive decoding?',
      options: [
        { text: 'It stores the keys and values of past tokens so each new step avoids recomputing attention over the whole prefix.', correct: true },
        { text: 'It compresses the model weights to a lower precision to save memory.', correct: false },
        { text: 'It stores the final softmax probabilities for every generated token.', correct: false },
        { text: 'It batches multiple user requests together at the token level.', correct: false },
      ],
      explanation: 'A token’s keys and values depend only on that token and the fixed weights, so they never change once computed. Caching them lets step $t$ project just the single new token instead of rebuilding the whole prefix, dropping the expensive weight-matmul work from $O(n^2)$ to $O(n)$ over a full generation. Compression is quantization, and token-level grouping is continuous batching — different techniques.',
    },
    {
      question: 'Quantizing a model’s weights from FP16 to INT4 reduces the weight memory footprint by approximately:',
      options: [
        { text: '75% (a factor of 4).', correct: true },
        { text: '25%.', correct: false },
        { text: '50% (a factor of 2).', correct: false },
        { text: '90%.', correct: false },
      ],
      explanation: 'FP16 uses 2 bytes per parameter and INT4 uses 0.5 bytes, a 4:1 ratio. So INT4 occupies $1/4$ of the FP16 footprint, a 75% reduction. INT8 (1 byte) would be the 50% / factor-of-2 case.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
