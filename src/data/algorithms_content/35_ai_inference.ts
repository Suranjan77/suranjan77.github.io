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
  relatedModules: ["transformers", "llms", "neural-networks"]
};
