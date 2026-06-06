import { LearningModule } from "./types";

export const fineTuning: LearningModule = {
  id: "fine-tuning",
  title: "Fine-Tuning and Preference Optimization",
  category: "Fine-Tuning and Preference Optimization",
  prerequisites: ["llms"],
  tracks: ["modern-ai"],
  difficulty: 3,
  estimatedMinutes: 45,
  shortDescription: "Methods for adapting pre-trained language models to specific domains or aligning them with human preferences using parameter-efficient fine-tuning and direct preference optimization.",
  learningObjectives: [
    "Differentiate supervised fine-tuning (SFT) from pre-training in terms of training loss and data requirements.",
    "Contrast full fine-tuning with Parameter-Efficient Fine-Tuning (PEFT) methods.",
    "Formulate and analyze Low-Rank Adaptation (LoRA) parameter updates.",
    "Outline the RLHF pipeline (SFT, reward modeling, PPO reinforcement learning) and identify its complexity bottlenecks.",
    "Explain Direct Preference Optimization (DPO) as a simplified alternative to RLHF that bypasses explicit reward models."
  ],
  keyTerms: [
    {
      term: "Supervised Fine-Tuning (SFT)",
      definition: "The process of training a pre-trained base model on structured prompt-response pairs using cross-entropy loss to teach instruction following."
    },
    {
      term: "Parameter-Efficient Fine-Tuning (PEFT)",
      definition: "A class of techniques that adapt large models by training only a tiny fraction of parameters, keeping the rest of the base model weights frozen."
    },
    {
      term: "Low-Rank Adaptation (LoRA)",
      definition: "A PEFT method that factors weight update matrices into two low-rank matrices, dramatically reducing memory and storage overhead."
    },
    {
      term: "Direct Preference Optimization (DPO)",
      definition: "A training algorithm that optimizes a language model directly on preference data (preferred vs rejected completions) using a closed-form loss function, eliminating the need for reinforcement learning."
    }
  ],
  workedExamples: [
    {
      title: "LoRA Parameter Reduction Calculation",
      problem: "A weight matrix in an attention layer has dimension $d_1 = 4096$ and $d_2 = 4096$. If we apply Low-Rank Adaptation (LoRA) with rank $r = 8$, compute the original parameter count, the new LoRA parameter count, and the percentage reduction in trainable parameters.",
      solution: "Let's perform the calculations:\n\n1. **Original Parameters**:\n   $$N_{\\text{orig}} = d_1 \\times d_2 = 4096 \\times 4096 = 16,777,216$$\n\n2. **LoRA Parameters**:\n   LoRA updates the weight matrix $\\mathbf{W}$ using two low-rank matrices $\\mathbf{A} \\in \\mathbb{R}^{d_1 \\times r}$ and $\\mathbf{B} \\in \\mathbb{R}^{r \\times d_2}$.\n   $$N_{\\text{LoRA}} = (d_1 \\times r) + (r \\times d_2) = (4096 \\times 8) + (8 \\times 4096) = 32,768 + 32,768 = 65,536$$\n\n3. **Percentage Reduction**:\n   $$\\text{Ratio} = \\frac{N_{\\text{LoRA}}}{N_{\\text{orig}}} = \\frac{65,536}{16,777,216} \\approx 0.003906$$\n   $$\\text{Percentage} = 100 - (0.003906 \\times 100) \\approx 99.61\\%$$\n\nThus, LoRA reduces the number of trainable parameters in this layer by $99.61\\%$, leaving only $65,536$ parameters to optimize instead of $16.78$ million."
    }
  ],
  misconceptions: [
    {
      claim: "Fine-tuning is the best way to load new factual knowledge base databases into a language model.",
      correction: "Fine-tuning is highly inefficient for storing new facts and can lead to hallucinations. It is best used for teaching style, formatting, task constraints, and behavior. For fetching new facts, Retrieval-Augmented Generation (RAG) is far more reliable."
    },
    {
      claim: "Using LoRA results in a model with slower inference speeds than full fine-tuning.",
      correction: "During training, LoRA stores weights separately. However, before deployment, the low-rank updates can be mathematically merged back into the base weights ($W_{\\text{final}} = W_{\\text{base}} + B \\cdot A$) so that inference speed is identical to a fully fine-tuned model."
    }
  ],
  references: [
    {
      title: "LoRA: Low-Rank Adaptation of Large Language Models",
      authors: "Edward J. Hu, Yuying Ye, Tony Allen, et al.",
      url: "https://arxiv.org/abs/2106.09685",
      type: "paper"
    },
    {
      title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
      authors: "Rafael Rafailov, Archit Sharma, Eric Mitchell, et al.",
      url: "https://arxiv.org/abs/2305.18290",
      type: "paper"
    }
  ],
  failureModes: [
    {
      name: "Catastrophic Forgetting",
      description: "When fine-tuning a model on a narrow domain or task, it can lose its general abilities (like reasoning or grammar) learned during pre-training.",
      mitigation: "Include general-purpose instruction datasets in the fine-tuning mixture, use low-rank adaptation with small ranks, or apply regularization constraints."
    },
    {
      name: "Reward Hacking in RLHF",
      description: "In reinforcement learning alignment, the model finds trick patterns that score high on the reward model but look unnatural or nonsensical to human evaluators.",
      mitigation: "Constrain updates using a Kullback-Leibler (KL) divergence penalty against the reference model to prevent the policy from shifting too far."
    }
  ],
  pros: [
    "Aligns model tone, structure, and output formats to specific operational requirements.",
    "LoRA reduces training GPU memory footprints and allows sharing base weights.",
    "Bypasses complex Reinforcement Learning loops using closed-form DPO loss functions."
  ],
  cons: [
    "Requires carefully curated instruction datasets to avoid degraded reasoning performance.",
    "Does not dynamically update factual information (retains training knowledge cutoff).",
    "Can introduce security vulnerabilities if fine-tuned on poisoned data."
  ],
  intuition: "Think of pre-training as school: the model reads the internet to learn how language, logic, and facts work. Supervised fine-tuning (SFT) is professional training: we teach the model how to act like a helpful assistant by showing it examples of good questions and answers. But how do we align its behavior with human preferences? Historically, we did RLHF: training a separate reward model to act as a judge, and using reinforcement learning to update the LLM. Now, we use DPO: we show the model pairs of preferred and rejected answers, and mathematically push its probability up for preferred answers and down for rejected ones, aligning it directly.",
  mathematics: "### Low-Rank Adaptation (LoRA) Equations\n\nFor a weight matrix update $\\Delta \\mathbf{W}$ of an attention layer $\\mathbf{W}_0 \\in \\mathbb{R}^{d \\times k}$, LoRA decomposes the update into two low-rank matrices $\\mathbf{B} \\in \\mathbb{R}^{d \\times r}$ and $\\mathbf{A} \\in \\mathbb{R}^{r \\times k}$ where $r \\ll \\min(d, k)$:\n$$\\mathbf{W} = \\mathbf{W}_0 + \\Delta \\mathbf{W} = \\mathbf{W}_0 + \\frac{\\alpha}{r} \\mathbf{B} \\mathbf{A}$$\nwhere $\\alpha$ is a scaling hyperparameter. The forward pass output $\\mathbf{h}$ for input $\\mathbf{x}$ is:\n$$\\mathbf{h} = \\mathbf{W}_0 \\mathbf{x} + \\Delta \\mathbf{W} \\mathbf{x} = \\mathbf{W}_0 \\mathbf{x} + \\frac{\\alpha}{r} \\mathbf{B} \\mathbf{A} \\mathbf{x}$$\nDuring training, only $\\mathbf{A}$ and $\\mathbf{B}$ are updated, while $\\mathbf{W}_0$ remains frozen.\n\n### Direct Preference Optimization (DPO) Loss\n\nGiven a prompt $x$, a preferred output $y_w$, and a rejected output $y_l$, DPO optimizes the policy model $\\pi_\\theta$ directly using a reference model $\\pi_{\\text{ref}}$ without training an explicit reward model. The loss function is:\n$$\\mathcal{L}_{\\text{DPO}}(\\pi_\\theta; \\pi_{\\text{ref}}) = -\\mathbb{E}_{(x, y_w, y_l)} \\left[ \\ln \\sigma \\left( \\beta \\ln \\frac{\\pi_\\theta(y_w | x)}{\\pi_{\\text{ref}}(y_w | x)} - \\beta \\ln \\frac{\\pi_\\theta(y_l | x)}{\\pi_{\\text{ref}}(y_l | x)} \\right) \\right]$$\nwhere $\\sigma$ is the sigmoid function and $\\beta$ is a hyperparameter scaling the KL penalty boundary, controlling how much the policy can deviate from the reference model.",
  fullDescription: "Fine-Tuning and Preference Optimization are the methodologies used to adapt pre-trained base models into specialized or instruction-aligned AI assistants. This module covers Supervised Fine-Tuning (SFT), Parameter-Efficient Fine-Tuning (PEFT) like LoRA, and preference alignment techniques like RLHF and DPO.",
  codeSnippet: `/**
 * Simple Mock Implementation of Low-Rank Adaptation (LoRA) Forward Step
 */
export class LoRALayer {
  public baseWeight: number[][]; // d_out x d_in
  public loraA: number[][];      // r x d_in
  public loraB: number[][];      // d_out x r
  
  constructor(
    public dIn: number,
    public dOut: number,
    public r: number,
    public alpha: number = 8
  ) {
    // Initialize base weight (representing frozen parameters)
    this.baseWeight = Array.from({ length: dOut }, () =>
      Array.from({ length: dIn }, () => Math.random() * 0.02 - 0.01)
    );

    // Initialize LoRA A with random normal (trainable)
    this.loraA = Array.from({ length: r }, () =>
      Array.from({ length: dIn }, () => Math.random() * 0.02 - 0.01)
    );

    // Initialize LoRA B with zeros (ensures delta is initially zero)
    this.loraB = Array.from({ length: dOut }, () =>
      new Array(r).fill(0)
    );
  }

  /**
   * Computes vector-matrix multiplication
   */
  private matMul(vec: number[], mat: number[][]): number[] {
    const out = new Array(mat.length).fill(0);
    for (let i = 0; i < mat.length; i++) {
      let sum = 0;
      for (let j = 0; j < vec.length; j++) {
        sum += mat[i][j] * vec[j];
      }
      out[i] = sum;
    }
    return out;
  }

  /**
   * Forward pass: h = W_base * x + (alpha / r) * B * A * x
   */
  forward(x: number[]): number[] {
    // 1. Base path: W_base * x
    const hBase = this.matMul(x, this.baseWeight);

    // 2. LoRA path: A * x
    const hTemp = this.matMul(x, this.loraA);

    // 3. LoRA path: B * (A * x)
    const hLora = this.matMul(hTemp, this.loraB);

    // 4. Combine paths with scaling factor
    const scale = this.alpha / this.r;
    return hBase.map((val, idx) => val + scale * hLora[idx]);
  }
}`,
  relatedModules: ["llms", "transformers", "neural-networks"]
};
