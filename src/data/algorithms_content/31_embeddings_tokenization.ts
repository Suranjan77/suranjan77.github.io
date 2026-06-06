import { LearningModule } from "./types";

export const embeddingsTokenization: LearningModule = {
  id: "embeddings-tokenization",
  title: "Embeddings and Tokenization",
  category: "Embeddings and Tokenization",
  prerequisites: ["nlp", "linear-algebra"],
  tracks: ["modern-ai"],
  difficulty: 2,
  estimatedMinutes: 35,
  shortDescription: "Techniques for dividing raw text into tokens and mapping them to dense, continuous vector spaces that capture semantic similarities.",
  learningObjectives: [
    "Contrast character, word, and subword tokenization in terms of vocabulary size and out-of-vocabulary handling.",
    "Explain the mechanics of Byte Pair Encoding (BPE) for building token vocabularies.",
    "Formulate embedding lookup as a matrix multiplication of a one-hot vector and a weight matrix.",
    "Calculate semantic similarity between embeddings using cosine similarity.",
    "Analyze semantic bias and representation drift in high-dimensional embedding spaces."
  ],
  keyTerms: [
    {
      term: "Tokenization",
      definition: "The process of breaking a sequence of text characters down into smaller units, such as words, subwords, or characters."
    },
    {
      term: "Byte Pair Encoding (BPE)",
      definition: "An iterative subword tokenization algorithm that builds a vocabulary by merging the most frequent pairs of adjacent characters or token sequences."
    },
    {
      term: "Embedding",
      definition: "A dense, low-dimensional vector representation of a token in a continuous space, designed to capture semantic and syntactic meaning."
    },
    {
      term: "Cosine Similarity",
      definition: "A geometric metric calculating the cosine of the angle between two vectors, measuring their directional alignment regardless of magnitude."
    }
  ],
  workedExamples: [
    {
      title: "Cosine Similarity Computation",
      problem: "Given two 3-dimensional token embeddings $\\mathbf{u} = [0.6, 0.8, 0.0]$ and $\\mathbf{v} = [0.5, 0.0, 0.866]$, calculate their dot product, their Euclidean norms, and their cosine similarity to assess semantic relatedness.",
      solution: "First, let's calculate the dot product:\n$$\\mathbf{u} \\cdot \\mathbf{v} = (0.6 \\times 0.5) + (0.8 \\times 0.0) + (0.0 \\times 0.866) = 0.3 + 0.0 + 0.0 = 0.3$$\n\nNext, calculate the Euclidean norms (lengths) of each vector:\n$$\\|\\mathbf{u}\\| = \\sqrt{0.6^2 + 0.8^2 + 0.0^2} = \\sqrt{0.36 + 0.64 + 0.0} = \\sqrt{1.0} = 1.0$$\n$$\\|\\mathbf{v}\\| = \\sqrt{0.5^2 + 0.0^2 + 0.866^2} = \\sqrt{0.25 + 0.0 + 0.75} = \\sqrt{1.0} = 1.0$$\n\nNow, calculate the cosine similarity:\n$$\\text{Similarity} = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|} = \\frac{0.3}{1.0 \\times 1.0} = 0.3$$\n\nThe cosine similarity between $\\mathbf{u}$ and $\\mathbf{v}$ is $0.3$, representing a moderate positive alignment in the embedding space."
    }
  ],
  misconceptions: [
    {
      claim: "Tokenization is a simple rule-based split on whitespace and punctuation marks.",
      correction: "While simple tokenizers split on spaces, modern language models use subword tokenization algorithms like Byte Pair Encoding (BPE) or WordPiece to handle compound words and out-of-vocabulary terms by splitting them into common subword prefixes or suffixes."
    },
    {
      claim: "Embeddings capture a single, objective, and unbiased definition of words.",
      correction: "Embeddings reflect whatever associations exist in their training data. If the corpus contains societal or historical biases, the resulting spatial relationships (e.g. vector math like King - Man + Woman = Queen) will reflect and encode those biases."
    }
  ],
  references: [
    {
      title: "Speech and Language Processing (Chapter 2 & 6)",
      authors: "Dan Jurafsky and James H. Martin",
      url: "https://web.stanford.edu/~jurafsky/slp3/",
      type: "textbook"
    },
    {
      title: "Efficient Estimation of Word Representations in Vector Space",
      authors: "Tomas Mikolov, Kai Chen, Greg Corrado, and Jeffrey Dean",
      url: "https://arxiv.org/abs/1301.3781",
      type: "paper"
    }
  ],
  failureModes: [
    {
      name: "Out of Vocabulary (OOV) and Unknown Tokens",
      description: "When using word-level tokenization, words not encountered during training cannot be processed, yielding a generic unknown token ([UNK]) that loses all semantic detail.",
      mitigation: "Adopt subword tokenizers which fall back to character-level representations for unfamiliar words, avoiding complete loss of information."
    },
    {
      name: "Vocabulary Size Tradeoff",
      description: "An excessively large vocabulary demands massive embedding parameters, while a vocabulary that is too small leads to fragmented, lengthy sequences that strain attention context windows.",
      mitigation: "Tune the vocabulary limit (typically 32000 to 100000 tokens for language models) to balance parameter budget and average sequence length."
    }
  ],
  pros: [
    "Subword tokenizers completely eliminate out-of-vocabulary issues.",
    "Embeddings compress sparse, high-dimensional words into dense, dense vector structures.",
    "Cosine similarity enables fast semantic search and document retrieval."
  ],
  cons: [
    "Subword tokenizers can split words in non-intuitive ways that complicate interpretation.",
    "Embeddings require massive datasets to learn accurate semantic relationships.",
    "Static embeddings fail to handle polysemy (words with multiple meanings depending on context)."
  ],
  intuition: "Computers do not understand text; they only understand numbers. To solve this, we must first break text into pieces called tokens (which can be whole words, syllables, or letters). This is tokenization. Next, we assign each token a vector (a list of coordinates in a high-dimensional space). This is an embedding. If two tokens have similar meanings (like 'king' and 'queen'), their vectors will point in similar directions. This allows the model to perform mathematical operations on semantics, turning language understanding into geometry.",
  mathematics: "### Embedding Lookup as Matrix Multiplication\n\nLet $V$ represent the vocabulary size and $d$ represent the embedding dimension. Let $\\mathbf{E} \\in \\mathbb{R}^{V \\times d}$ be the embedding lookup weight matrix.\n\nGiven a token with index $i \\in \\{0, 1, \\dots, V-1\\}$, we represent it as a one-hot row vector $\\mathbf{x} \\in \\mathbb{R}^V$, where $\\mathbf{x}_i = 1$ and all other elements are 0. The embedding vector $\\mathbf{e} \\in \\mathbb{R}^d$ is the matrix product:\n$$\\mathbf{e} = \\mathbf{x} \\mathbf{E} = \\mathbf{E}_{i,:}$$\nwhere $\\mathbf{E}_{i,:}$ denotes the $i$-th row of the embedding matrix.\n\n### Cosine Similarity\n\nFor two embedding vectors $\\mathbf{u}, \\mathbf{v} \\in \\mathbb{R}^d$, the cosine similarity measures the angle $\\theta$ between them:\n$$\\text{CosineSimilarity}(\\mathbf{u}, \\mathbf{v}) = \\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\|_2 \\|\\mathbf{v}\\|_2} = \\frac{\\sum_{k=1}^d u_k v_k}{\\sqrt{\\sum_{k=1}^d u_k^2} \\sqrt{\\sum_{k=1}^d v_k^2}}$$\nThis value ranges from $-1.0$ (opposite directions) to $1.0$ (identical direction), with $0.0$ indicating orthogonality.",
  fullDescription: "Embeddings and Tokenization form the interface between raw textual characters and deep learning architectures. Tokenization decomposes character sequences into integer IDs, while embeddings map those integer IDs into continuous vector manifolds that capture semantic context.",
  codeSnippet: `/**
 * Simple Character-level Byte Pair Encoding (BPE) Tokenizer
 */
export class BPETokenizer {
  private vocab: Map<string, number> = new Map();
  private merges: Map<string, string> = new Map();

  constructor() {}

  /**
   * Fits vocabulary by merging most frequent adjacent character pairs
   */
  fit(corpus: string, maxVocabSize: number) {
    // Start with individual characters as vocabulary
    const chars = Array.from(new Set(corpus));
    chars.forEach((c, idx) => this.vocab.set(c, idx));
    
    let currentVocabSize = chars.length;
    let splits = corpus.split("").filter(c => c.trim().length > 0);

    while (currentVocabSize < maxVocabSize) {
      const pairCounts = new Map<string, number>();
      
      for (let i = 0; i < splits.length - 1; i++) {
        const pair = splits[i] + "," + splits[i + 1];
        pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
      }

      if (pairCounts.size === 0) break;

      // Find most frequent pair
      let bestPair = "";
      let maxCount = 0;
      for (const [pair, count] of pairCounts.entries()) {
        if (count > maxCount) {
          maxCount = count;
          bestPair = pair;
        }
      }

      if (maxCount < 2) break;

      const [p1, p2] = bestPair.split(",");
      const merged = p1 + p2;
      
      this.merges.set(p1 + "," + p2, merged);
      this.vocab.set(merged, currentVocabSize++);

      // Perform merges in our splits array
      const newSplits: string[] = [];
      let i = 0;
      while (i < splits.length) {
        if (i < splits.length - 1 && splits[i] === p1 && splits[i + 1] === p2) {
          newSplits.push(merged);
          i += 2;
        } else {
          newSplits.push(splits[i]);
          i++;
        }
      }
      splits = newSplits;
    }
  }

  tokenize(text: string): number[] {
    const tokens: number[] = [];
    const textChars = text.split("");
    
    // Simple greedy lookup of substrings in vocabulary
    let i = 0;
    while (i < textChars.length) {
      let longestMatch = "";
      let matchIdx = -1;
      
      for (let len = 1; len <= textChars.length - i; len++) {
        const substr = textChars.slice(i, i + len).join("");
        if (this.vocab.has(substr)) {
          longestMatch = substr;
          matchIdx = this.vocab.get(substr) ?? -1;
        }
      }

      if (matchIdx !== -1) {
        tokens.push(matchIdx);
        i += Math.max(1, longestMatch.length);
      } else {
        // Fallback for character not in vocabulary
        tokens.push(-1);
        i++;
      }
    }
    return tokens;
  }
}`,
  relatedModules: ["nlp", "linear-algebra", "transformers"]
};
