import { LearningModule } from "./types";

export const sequenceModels: LearningModule = {
  id: "sequence-models",
  title: "Sequence Models",
  category: "Sequence Models",
  prerequisites: ["neural-networks"],
  tracks: ["modern-ai"],
  difficulty: 3,
  estimatedMinutes: 45,
  shortDescription: "Recurrent neural architectures designed to process sequential data, covering RNNs, LSTMs, GRUs, and the vanishing gradient problems associated with temporal dependencies.",
  learningObjectives: [
    "Differentiate sequence models from static feedforward architectures in terms of temporal state tracking.",
    "Formulate and analyze the recurrence relations of vanilla Recurrent Neural Networks (RNNs).",
    "Trace the flow of information through Long Short-Term Memory (LSTM) gates: forget, input, and output gates.",
    "Explain the mechanics of Backpropagation Through Time (BPTT) and how vanishing gradients occur over long sequences.",
    "Compare LSTMs and Gated Recurrent Units (GRUs) in terms of parameter efficiency and gate complexity."
  ],
  keyTerms: [
    {
      term: "Hidden State",
      definition: "A vector representing the memory of a recurrent network that gets updated at each step of the sequence based on the current input and the previous hidden state."
    },
    {
      term: "Backpropagation Through Time (BPTT)",
      definition: "An extension of backpropagation to recurrent networks where the computational graph is unrolled across all time steps, and gradients are propagated backward through time."
    },
    {
      term: "LSTM Gates",
      definition: "Neural pathways containing sigmoid activation functions that dynamically regulate the flow of information into, out of, and within the cell state."
    },
    {
      term: "Teacher Forcing",
      definition: "A training strategy for sequence-to-sequence models where the actual target token from the training data is fed as input to the next time step, instead of the model's own output."
    }
  ],
  workedExamples: [
    {
      title: "Vanilla RNN Hidden State Computation",
      problem: "Given a vanilla RNN with weight matrices $W_{hh} = 0.5$ (hidden-to-hidden) and $W_{xh} = 0.8$ (input-to-hidden), bias $b_h = 0.1$, and tanh activation. If the initial hidden state $h_0 = 0.0$ and we receive sequence inputs $x_1 = 1.0$ and $x_2 = -0.5$, compute the hidden states $h_1$ and $h_2$. Use $\\tanh(0.9) \\approx 0.716$ and $\\tanh(-0.042) \\approx -0.042$.",
      solution: "The recurrence equation for a vanilla RNN is:\n$$h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)$$\n\n### Time Step 1:\n- Compute linear combination:\n  $$z_1 = 0.5 \\times h_0 + 0.8 \\times x_1 + 0.1 = 0.5 \\times 0.0 + 0.8 \\times 1.0 + 0.1 = 0.9$$\n- Apply activation function:\n  $$h_1 = \\tanh(0.9) \\approx 0.716$$\n\n### Time Step 2:\n- Compute linear combination:\n  $$z_2 = 0.5 \\times h_1 + 0.8 \\times x_2 + 0.1 = 0.5 \\times 0.716 + 0.8 \\times (-0.5) + 0.1 = 0.358 - 0.400 + 0.1 = 0.058$$\n- Apply activation function:\n  $$h_2 = \\tanh(0.058) \\approx 0.058$$\n\nSo the hidden states are $h_1 \\approx 0.716$ and $h_2 \\approx 0.058$."
    }
  ],
  misconceptions: [
    {
      claim: "Vanilla Recurrent Neural Networks can easily learn very long-term dependencies in sequences.",
      correction: "Vanilla RNNs struggle to learn long-term dependencies (beyond a few dozen steps) because gradients fade exponentially as they are multiplied repeatedly backward through time, a problem that motivated the creation of LSTMs and GRUs."
    },
    {
      claim: "LSTMs completely eliminate the vanishing gradient problem.",
      correction: "While LSTMs greatly alleviate vanishing gradients by establishing a linear cell state flow with additive updates, they do not completely eliminate the issue for extremely long sequences or when parameters are poorly initialized."
    }
  ],
  references: [
    {
      title: "Understanding LSTM Networks",
      authors: "Christopher Olah",
      url: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/",
      type: "tutorial"
    },
    {
      title: "Supervised Sequence Labeling with Recurrent Neural Networks",
      authors: "Alex Graves",
      url: "https://link.springer.com/book/10.1007/978-3-642-24797-2",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: "Exploding Gradients in Recurrent Networks",
      description: "When the hidden-to-hidden weights have eigenvalues greater than 1.0, gradients can grow exponentially over time steps, causing numerical overflow and parameter destabilization.",
      mitigation: "Apply gradient clipping, which caps the norm of the gradient vector to a maximum threshold value before updating the weights."
    },
    {
      name: "Slow Sequential Processing",
      description: "Recurrent structures cannot process inputs in parallel because each step depends on the completion of the previous step's hidden state computation, limiting GPU throughput.",
      mitigation: "For long sequence modeling where training speed is critical, transition to attention-based architectures like Transformers which permit full parallelism."
    }
  ],
  pros: [
    "Capable of processing variable-length inputs without requiring fixed input dimensions.",
    "Maintains structural temporal order and captures sequence context dynamically.",
    "LSTMs can successfully capture dependencies across long intervals of time."
  ],
  cons: [
    "Sequential training is slow and cannot be easily parallelized like feedforward layers.",
    "Prone to vanishing and exploding gradients when processing long contexts.",
    "Prone to catastrophic forgetting, where newer inputs overwrite older historical context."
  ],
  intuition: "Imagine reading a sentence word by word. As you read, you don't forget the previous words; you carry a mental summary (a hidden state) in your head. For each new word, you update your understanding. Sequence models like RNNs mimic this behavior. A vanilla RNN simply combines the current input and the previous hidden state using a single layer. LSTMs improve on this by maintaining a separate, protected memory channel (the cell state). Inside an LSTM, gates act like valves: the forget gate decides what history to drop, the input gate decides what new info to write to the cell state, and the output gate decides what information to filter out as the final hidden state.",
  mathematics: "### Vanilla RNN Recurrence Equations\n\nFor an input sequence $\\mathbf{x}_1, \\mathbf{x}_2, \\dots, \\mathbf{x}_T$, the hidden state $\\mathbf{h}_t$ and output $\\mathbf{y}_t$ at step $t$ are:\n$$\\mathbf{h}_t = \\tanh(\\mathbf{W}_{hh} \\mathbf{h}_{t-1} + \\mathbf{W}_{xh} \\mathbf{x}_t + \\mathbf{b}_h)$$\n$$\\mathbf{y}_t = \\operatorname{softmax}(\\mathbf{W}_{hy} \\mathbf{h}_t + \\mathbf{b}_y)$$\n\n### Long Short-Term Memory (LSTM) Equations\n\nAn LSTM cell maintains a cell state $\\mathbf{C}_t$ and a hidden state $\\mathbf{h}_t$. At time step $t$, the operations are:\n\n1. **Forget Gate** $\\mathbf{f}_t$: Decides what to discard from the previous cell state.\n   $$\\mathbf{f}_t = \\sigma(\\mathbf{W}_f [\\mathbf{h}_{t-1}, \\mathbf{x}_t] + \\mathbf{b}_f)$$\n\n2. **Input Gate** $\\mathbf{i}_t$ and **Candidate Cell State** $\\tilde{\\mathbf{C}}_t$: Decide what new information to store.\n   $$\\mathbf{i}_t = \\sigma(\\mathbf{W}_i [\\mathbf{h}_{t-1}, \\mathbf{x}_t] + \\mathbf{b}_i)$$\n   $$\\tilde{\\mathbf{C}}_t = \\tanh(\\mathbf{W}_c [\\mathbf{h}_{t-1}, \\mathbf{x}_t] + \\mathbf{b}_c)$$\n\n3. **Update Cell State** $\\mathbf{C}_t$: Combine historical memory and candidate inputs.\n   $$\\mathbf{C}_t = \\mathbf{f}_t \\odot \\mathbf{C}_{t-1} + \\mathbf{i}_t \\odot \\tilde{\\mathbf{C}}_t$$\n\n4. **Output Gate** $\\mathbf{o}_t$ and **Hidden State** $\\mathbf{h}_t$: Decide what information is emitted.\n   $$\\mathbf{o}_t = \\sigma(\\mathbf{W}_o [\\mathbf{h}_{t-1}, \\mathbf{x}_t] + \\mathbf{b}_o)$$\n   $$\\mathbf{h}_t = \\mathbf{o}_t \\odot \\tanh(\\mathbf{C}_t)$$\n\nwhere $\\sigma(x) = \\frac{1}{1 + e^{-x}}$ is the sigmoid activation, and $\\odot$ represents element-wise (Hadamard) multiplication.",
  fullDescription: "Sequence models are neural network architectures optimized for sequential and temporal data. They process variable-length inputs by passing persistent hidden states across sequence steps, enabling applications in speech, translation, and time-series modeling.",
  codeSnippet: `/**
 * Simple Recurrent Neural Network Cell Implementation
 */
export class RNNCell {
  constructor(
    public inputDim: number,
    public hiddenDim: number,
    public Whh: number[][], // hiddenDim x hiddenDim
    public Wxh: number[][], // hiddenDim x inputDim
    public bh: number[]     // hiddenDim
  ) {}

  /**
   * Performs forward step computing next hidden state
   */
  step(x: number[], prevH: number[]): number[] {
    const nextH = new Array(this.hiddenDim).fill(0);
    
    for (let i = 0; i < this.hiddenDim; i++) {
      let sum = this.bh[i];
      
      // Hidden contribution
      for (let j = 0; j < this.hiddenDim; j++) {
        sum += this.Whh[i][j] * prevH[j];
      }
      
      // Input contribution
      for (let j = 0; j < this.inputDim; j++) {
        sum += this.Wxh[i][j] * x[j];
      }
      
      // Tanh activation
      nextH[i] = Math.tanh(sum);
    }
    
    return nextH;
  }

  /**
   * Unrolls RNN cell over a sequence of inputs
   */
  unroll(inputs: number[][], initH: number[]): number[][] {
    const states: number[][] = [];
    let currentH = [...initH];
    
    for (const x of inputs) {
      currentH = this.step(x, currentH);
      states.push(currentH);
    }
    
    return states;
  }
}`,
  relatedModules: ["neural-networks", "nlp", "transformers"]
};
