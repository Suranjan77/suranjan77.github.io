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
  relatedModules: ["llms", "transformers", "neural-networks"],
  tldr: [
    'Fine-tuning adapts a pretrained model to a specific task or style by continuing training on new, narrower data.',
    '**Full fine-tuning** updates every weight — maximally expressive but memory-hungry and storage-heavy (a full model copy per task).',
    '**Parameter-efficient fine-tuning (PEFT)** like **LoRA** freezes the base model and trains a tiny set of new parameters, cutting trainable params by $100\\times$ to $1000\\times$.',
    '**Catastrophic forgetting** is the main risk: aggressively updating all weights on a narrow distribution can erase general capabilities.',
    '**Instruction tuning** fine-tunes on (instruction, response) pairs so a base model learns to follow natural-language commands rather than merely continue text.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: LoRA (Low-Rank Adaptation) and Its Parameter Savings',
      content: `
Fine-tuning normally updates a weight matrix $W \\in \\mathbb{R}^{d \\times k}$ to $W + \\Delta W$, where the full update $\\Delta W$ has $d \\times k$ free parameters. LoRA’s key idea is to **freeze** $W$ and constrain the update to be **low-rank**:

$$ \\Delta W = BA, \\qquad B \\in \\mathbb{R}^{d \\times r}, \\quad A \\in \\mathbb{R}^{r \\times k}, \\quad r \\ll \\min(d, k) $$

During the forward pass the adapted layer computes:

$$ h = W x + \\Delta W x = W x + B A x $$

Only $A$ and $B$ are trained; $W$ stays fixed. The number of trainable parameters drops from $d \\times k$ to $r(d + k)$.

**Concrete example.** Take a square projection with $d = k = 4096$ and rank $r = 8$.

- Full update: $d \\times k = 4096 \\times 4096 = 16{,}777{,}216 \\approx 16.8$M parameters.
- LoRA update: $r(d + k) = 8 \\times (4096 + 4096) = 8 \\times 8192 = 65{,}536 \\approx 65.5$K parameters.

That is a reduction by a factor of $16{,}777{,}216 / 65{,}536 = 256\\times$. Across an entire model this routinely yields a $100\\times$ to $1000\\times$ cut in trainable parameters, and the saved LoRA weights are only a few megabytes per task instead of a full multi-gigabyte checkpoint.

**Why is a low-rank update enough?** The *intrinsic dimension* argument: empirically, the update a model needs to adapt to a downstream task lives in a subspace whose dimension is far smaller than the full parameter count. Aghajanyan et al. showed large pretrained models can be fine-tuned within a surprisingly low-dimensional reparameterization. If the *change* in weights $\\Delta W$ has low intrinsic rank, then factoring it as $BA$ loses almost nothing while slashing the parameter budget. At inference, $BA$ can even be merged back into $W$, so LoRA adds **zero** extra latency once deployed.
      `,
    },
    {
      heading: 'Catastrophic Forgetting During Fine-tuning',
      content: `
A pretrained LLM stores broad general capabilities — grammar, world knowledge, reasoning — distributed across all of its weights. **Catastrophic forgetting** is what happens when fine-tuning on a narrow task distribution overwrites those weights and degrades the model’s general competence, even on things it used to do well.

The mechanism is straightforward. Gradient descent on a narrow dataset pushes weights toward whatever minimizes loss on *that* data. Because the new distribution covers only a sliver of what the model originally handled, the gradients carry no signal to *preserve* unrelated abilities. Large updates on a small, repetitive dataset move weights far from the pretrained solution, and the previously encoded knowledge is partially erased. Over many epochs the model can collapse into parroting the fine-tuning data while losing fluency and breadth elsewhere.

Several techniques mitigate it:

- **Low learning rate.** Small steps keep the fine-tuned weights in a neighborhood of the pretrained solution, so general capabilities are perturbed only gently. This is why fine-tuning learning rates are often $10\\times$ to $100\\times$ smaller than pretraining ones.
- **Fewer epochs / early stopping.** The longer you train on narrow data, the more the model specializes and forgets. One to a few epochs is often enough; stopping early limits drift.
- **LoRA’s implicit regularization.** Because the base weights $W$ are **frozen** and only the small low-rank $BA$ is learned, the original knowledge encoded in $W$ literally cannot be overwritten. The adaptation is confined to a tiny additive correction, which acts as a strong structural regularizer against forgetting. Keeping the LoRA rank $r$ small further limits how far the model can move.
- **Replaying general data.** Mixing some general-purpose examples back into the fine-tuning set reminds the model of its original distribution and counteracts forgetting directly.
      `,
    },
  ],
  comparisons: [
    {
      title: 'Full Fine-tuning vs LoRA vs Prompt Engineering',
      methods: ['Full Fine-tuning', 'LoRA', 'Prompt Engineering / In-Context Learning'],
      rows: [
        {
          dimension: 'Trainable parameters',
          values: ['All weights (billions)', 'Tiny low-rank adapters ($\\sim$0.1% of weights)', 'None — no training at all'],
        },
        {
          dimension: 'Compute & memory cost',
          values: ['Very high — needs optimizer state for every weight', 'Low — fits on a single GPU; base weights frozen', 'Effectively zero training cost; only inference'],
        },
        {
          dimension: 'Catastrophic forgetting risk',
          values: ['High — all weights can drift on narrow data', 'Low — base weights frozen, adapter is a small correction', 'None — weights never change'],
        },
        {
          dimension: 'Persistence of adaptation',
          values: ['Permanent, baked into the weights', 'Permanent, stored as a small reusable adapter', 'Ephemeral — lives only in the prompt for that request'],
        },
        {
          dimension: 'Storage per task',
          values: ['Full model copy (multi-GB)', 'A few MB per adapter', 'Nothing persisted'],
        },
      ],
      takeaway: 'Start with prompt engineering; if behavior needs to be reliable and persistent, reach for LoRA; reserve full fine-tuning for large-scale behavior changes where the compute and storage cost is justified.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need the model to reliably adopt a **specific behavior, format, or domain style** that prompting alone cannot pin down.',
      'You have a **labeled dataset** of task-specific examples (e.g. instruction-response pairs) to train on.',
      'The adaptation must be **persistent** and consistent across every request, not re-specified in each prompt.',
      'You want to serve **many task variants** cheaply — LoRA adapters share one frozen base model.',
    ],
    avoidWhen: [
      'A well-crafted **prompt or few-shot examples** already solve the task — fine-tuning adds cost and maintenance for no gain.',
      'You have **very little data** — fine-tuning on a tiny set risks overfitting and catastrophic forgetting.',
      'The needed knowledge changes **frequently** — retrieval-augmented generation (RAG) keeps facts fresh without retraining.',
      'You lack the **compute or MLOps** to train and version models, and the latency or storage budget for extra checkpoints is tight.',
    ],
    rulesOfThumb: [
      'Climb the ladder: prompt engineering, then RAG, then LoRA, then full fine-tuning — only escalate when the cheaper rung fails.',
      'Use a small learning rate and few epochs to limit catastrophic forgetting.',
      'For LoRA, start with rank $r$ in the 8–16 range and target the attention projections; raise $r$ only if quality is insufficient.',
    ],
  },
  caseStudies: [
    {
      title: 'LoRA matches full fine-tuning at a fraction of the trainable parameters',
      domain: 'NLP / LLM adaptation',
      scenario: 'Adapting very large pretrained language models (GPT-3 175B and RoBERTa/DeBERTa) to downstream tasks via full fine-tuning is prohibitively expensive: it updates and stores all 175B parameters per task, demanding enormous optimizer memory and a full model checkpoint for every deployment.',
      approach: 'Hu et al. (2021) introduced LoRA, freezing the pretrained weights and injecting trainable low-rank matrices $B A$ into the attention projections, training only those. They benchmarked against full fine-tuning across GLUE and generation tasks.',
      outcome: 'On GPT-3 175B, LoRA reduced the number of trainable parameters by roughly $10{,}000\\times$ and GPU memory by about $3\\times$, while matching or exceeding the quality of full fine-tuning on benchmarks like GLUE. Because the low-rank update can be merged into the base weights, LoRA also adds no inference latency. This established PEFT as the default way to adapt large models on modest hardware.',
      source: {
        title: 'LoRA: Low-Rank Adaptation of Large Language Models',
        authors: 'Hu, E. J., Shen, Y., Wallis, P., Allen-Zhu, Z., Li, Y., Wang, S., Wang, L. and Chen, W.',
        url: 'https://arxiv.org/abs/2106.09685',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: "Explain the mathematical and architectural mechanisms by which Parameter-Efficient Fine-Tuning methods like LoRA mitigate catastrophic forgetting compared to full fine-tuning.",
      expectedAnswerRubric: "A strong answer should mention that base weights are frozen ($W_0$ is unchanged), so the general knowledge encoded during pretraining is preserved by construction. It should also note that adaptation is mathematically confined to a low-rank additive correction ($\\Delta W = BA$), which acts as a structural regularizer preventing the model from shifting its distribution too radically."
    }
  ],
  quiz: [
    {
      question: 'In LoRA, given a frozen weight matrix $W \\in \\mathbb{R}^{d \\times k}$, the update is written as $\\Delta W = BA$. What are the shapes of $B$ and $A$?',
      options: [
        { text: '$B \\in \\mathbb{R}^{d \\times r}$ and $A \\in \\mathbb{R}^{r \\times k}$ with $r \\ll \\min(d, k)$.', correct: true },
        { text: '$B \\in \\mathbb{R}^{d \\times k}$ and $A \\in \\mathbb{R}^{d \\times k}$.', correct: false },
        { text: '$B \\in \\mathbb{R}^{r \\times d}$ and $A \\in \\mathbb{R}^{k \\times r}$ with $r \\gg \\max(d, k)$.', correct: false },
        { text: '$B$ and $A$ are both $r \\times r$ square matrices.', correct: false },
      ],
      explanation: 'LoRA factors the low-rank update so that $BA$ has the same shape as $W$ ($d \\times k$) while introducing only $r(d + k)$ trainable parameters. With $r \\ll \\min(d, k)$ this is far fewer than the $d \\times k$ parameters of a full update.',
    },
    {
      question: 'Which statement best describes catastrophic forgetting?',
      options: [
        { text: 'Fine-tuning on a narrow task distribution overwrites weights and degrades the model’s previously learned general capabilities.', correct: true },
        { text: 'The model runs out of context window and forgets earlier tokens in the prompt.', correct: false },
        { text: 'The optimizer diverges because the learning rate is set to zero.', correct: false },
        { text: 'The model permanently caches user data between sessions.', correct: false },
      ],
      explanation: 'Catastrophic forgetting is a training-time phenomenon: updating weights on a narrow distribution erases capabilities encoded during pretraining. It is unrelated to the context window or data caching, and it is made worse — not caused — by large learning rates rather than a zero learning rate.',
    },
    {
      question: 'For a $4096 \\times 4096$ weight matrix, roughly how many trainable parameters does a rank-$8$ LoRA adapter add, and how does it compare to full fine-tuning?',
      options: [
        { text: 'About $65.5$K parameters — a $256\\times$ reduction versus the $\\sim$16.8M of a full update.', correct: true },
        { text: 'About $16.8$M parameters — the same as full fine-tuning.', correct: false },
        { text: 'About $8$ parameters — one per rank.', correct: false },
        { text: 'About $33.6$M parameters — twice as many as full fine-tuning.', correct: false },
      ],
      explanation: 'LoRA adds $r(d + k) = 8 \\times (4096 + 4096) = 65{,}536$ parameters, while a full update is $4096 \\times 4096 = 16{,}777{,}216$. The ratio is $256\\times$ fewer trainable parameters.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
