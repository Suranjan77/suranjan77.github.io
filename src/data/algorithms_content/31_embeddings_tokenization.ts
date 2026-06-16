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
  relatedModules: ["nlp", "linear-algebra", "transformers"],
  tldr: [
    'Tokenization splits raw text into discrete units; modern LLMs use **subword** tokenization (BPE, WordPiece) to balance vocabulary size against out-of-vocabulary coverage.',
    'An **embedding** maps each token ID to a dense, learned vector $\\mathbf{e} \\in \\mathbb{R}^d$ that places semantically related tokens near each other in space.',
    'Embedding lookup is just selecting a row of the matrix $\\mathbf{E}$ — equivalently a one-hot vector times $\\mathbf{E}$.',
    'Semantic similarity is measured with **cosine similarity** $\\cos(\\theta) = \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|}$, which compares direction and ignores magnitude.',
    'Static embeddings (word2vec, GloVe) give one vector per word; **contextual** embeddings (BERT) give a different vector per occurrence, resolving polysemy.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Why Cosine Similarity for Embeddings',
      content: `
Cosine similarity measures the angle $\\theta$ between two vectors rather than the straight-line distance between their tips. It comes directly from the geometric definition of the dot product:

$$ \\mathbf{u} \\cdot \\mathbf{v} = \\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|\\cos(\\theta) \\quad\\Longrightarrow\\quad \\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|} = \\frac{\\sum_{k=1}^d u_k v_k}{\\sqrt{\\sum_{k=1}^d u_k^2}\\,\\sqrt{\\sum_{k=1}^d v_k^2}} $$

The value lives in $[-1, 1]$: $1$ means the vectors point the same way, $0$ means they are orthogonal (unrelated), and $-1$ means they point in opposite directions.

**Why prefer it over Euclidean distance?** The cosine is **magnitude invariant**. Scaling a vector, $\\mathbf{u} \\to c\\,\\mathbf{u}$ for $c > 0$, leaves $\\cos(\\theta)$ unchanged because the factor $c$ appears in both numerator and denominator and cancels. In embedding spaces the *length* of a vector often tracks nuisance properties — token frequency or how often a word appears — while the *direction* carries the meaning. Euclidean distance $\\|\\mathbf{u} - \\mathbf{v}\\|$ mixes both: two vectors pointing in the same semantic direction but with different lengths can look far apart. Cosine isolates direction, so it compares meaning cleanly.

**Worked numeric example.** Take $\\mathbf{u} = [1, 2, 2]$ and $\\mathbf{v} = [2, 0, 1]$.

$$ \\mathbf{u} \\cdot \\mathbf{v} = (1)(2) + (2)(0) + (2)(1) = 2 + 0 + 2 = 4 $$
$$ \\|\\mathbf{u}\\| = \\sqrt{1^2 + 2^2 + 2^2} = \\sqrt{9} = 3, \\qquad \\|\\mathbf{v}\\| = \\sqrt{2^2 + 0^2 + 1^2} = \\sqrt{5} \\approx 2.236 $$
$$ \\cos(\\theta) = \\frac{4}{3 \\times 2.236} = \\frac{4}{6.708} \\approx 0.596 $$

So the angle is $\\theta = \\arccos(0.596) \\approx 53.4^{\\circ}$ — a moderate positive similarity. Note that if we doubled $\\mathbf{u}$ to $[2, 4, 4]$, both the dot product and $\\|\\mathbf{u}\\|$ would double, leaving the ratio — and the similarity — exactly $0.596$.
      `,
    },
    {
      heading: 'The Byte-Pair Encoding (BPE) Algorithm Step by Step',
      content: `
BPE builds a subword vocabulary bottom-up. It starts from individual characters and repeatedly merges the **most frequent adjacent pair** into a new symbol, learning an ordered list of merge rules. Walk through a tiny corpus where words carry counts:

$$ \\texttt{low} \\times 5, \\quad \\texttt{lower} \\times 2, \\quad \\texttt{newest} \\times 6, \\quad \\texttt{widest} \\times 3 $$

**Initial split** — every word becomes a sequence of characters:

- l o w  (×5)
- l o w e r  (×2)
- n e w e s t  (×6)
- w i d e s t  (×3)

**Step 1.** Count all adjacent pairs weighted by word frequency. The pair (e, s) appears in *newest* (×6) and *widest* (×3) = 9 times, the most frequent. Merge it into the token “es”. Sequences become: n e w **es** t (×6), w i d **es** t (×3).

**Step 2.** Now (es, t) occurs 6 + 3 = 9 times — the new top pair. Merge into “est”: n e w **est** (×6), w i d **est** (×3).

**Step 3.** The pair (l, o) appears in *low* (×5) and *lower* (×2) = 7 times. Merge into “lo”: **lo** w (×5), **lo** w e r (×2).

**Step 4.** The pair (lo, w) appears 5 + 2 = 7 times. Merge into “low”: **low** (×5), **low** e r (×2).

After four merges the learned vocabulary now contains the subwords “es”, “est”, “lo”, “low” on top of the original characters, and the merge rules are stored in order. A new word is tokenized by applying the same merges greedily.

**Why this balances vocabulary size against OOV.** A pure word vocabulary explodes in size and still cannot represent any word it never saw (it emits an [UNK] token, losing all information). A pure character vocabulary is tiny and never hits OOV, but produces very long sequences that strain the model’s context window. BPE interpolates: frequent whole words like “low” earn their own token (short sequences, like a word vocabulary), while a rare or unseen word such as “lowest” gracefully decomposes into known subwords (“low” + “est”), so there is **no out-of-vocabulary failure**. The number of merges is a single knob — typically tuned to a vocabulary of roughly 32k–100k tokens — that trades sequence length against vocabulary size.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'Compute the cosine similarity between $\\mathbf{u} = [3, 4]$ and $\\mathbf{v} = [4, 3]$ by hand.',
      difficulty: 'warm-up',
      hint: 'Both vectors have the same length; you only need the dot product and one norm squared.',
      solution: 'Dot product: $\\mathbf{u}\\cdot\\mathbf{v} = (3)(4) + (4)(3) = 12 + 12 = 24$. Norms: $\\|\\mathbf{u}\\| = \\sqrt{9+16} = 5$ and $\\|\\mathbf{v}\\| = \\sqrt{16+9} = 5$. Cosine similarity $= \\frac{24}{5 \\times 5} = \\frac{24}{25} = 0.96$ — a high similarity, since the two vectors are close in direction.',
      tags: ['coding', 'conceptual'],
    },
    {
      prompt: 'Given the toy corpus $\\texttt{hug} \\times 4$, $\\texttt{pug} \\times 2$, $\\texttt{hugs} \\times 1$ (split into characters), run **one** BPE merge step: identify the most frequent adjacent pair and show the resulting sequences.',
      difficulty: 'core',
      hint: 'Count each adjacent pair weighted by the word’s frequency, then merge the winner everywhere it occurs.',
      solution: 'Initial splits: h u g (×4), p u g (×2), h u g s (×1). Pair counts: (h,u) = 4 + 1 = 5; (u,g) = 4 + 2 + 1 = 7; (p,u) = 2; (g,s) = 1. The most frequent pair is (u, g) with count 7, so we merge it into the subword “ug”. Resulting sequences: h **ug** (×4), p **ug** (×2), h **ug** s (×1). The vocabulary now gains the token “ug”.',
      tags: ['derivation', 'conceptual'],
    },
    {
      prompt: 'The famous word2vec analogy is $\\text{king} - \\text{man} + \\text{woman} \\approx \\text{queen}$. Explain in terms of vector arithmetic why this works, and what relationship the difference vector $\\text{king} - \\text{man}$ encodes.',
      difficulty: 'core',
      solution: 'Embeddings learned from co-occurrence place words so that consistent *relationships* become roughly constant **offset vectors**. The difference $\\text{king} - \\text{man}$ isolates the component that distinguishes a male royal from a generic male — informally a “royalty + female-to-male contrast” direction. Because the same gender offset $\\text{woman} - \\text{man}$ recurs across many word pairs, adding it back gives $\\text{king} - \\text{man} + \\text{woman} = \\text{king} + (\\text{woman} - \\text{man})$, which lands near the vector that is royal but female: $\\text{queen}$. The analogy is solved by finding the vocabulary vector with highest cosine similarity to that computed point (excluding the input words). It works only to the extent that the relationship is *linear and consistent* in the space; many analogies are only approximate, and the same mechanism encodes social biases present in the corpus.',
      tags: ['conceptual'],
    },
    {
      prompt: 'A model has a vocabulary of $V = 50{,}000$ tokens. Compare the parameter count of the embedding table when the dimension is $d = 256$ versus $d = 1024$. What is the tradeoff in choosing the larger dimension?',
      difficulty: 'challenge',
      hint: 'The embedding matrix $\\mathbf{E}$ has shape $V \\times d$, so its parameter count is the product.',
      solution: 'Parameters $= V \\times d$. For $d = 256$: $50{,}000 \\times 256 = 12{,}800{,}000$ ($\\approx 12.8$M parameters). For $d = 1024$: $50{,}000 \\times 1024 = 51{,}200{,}000$ ($\\approx 51.2$M parameters) — a 4× increase, matching the 4× increase in $d$. The tradeoff: a larger $d$ gives the model more capacity to encode fine-grained semantic and syntactic distinctions and tends to improve downstream quality, but it costs 4× the embedding memory and compute, raises the risk of overfitting on smaller corpora, and increases the size of the output (un-embedding) projection if weights are tied. Dimension is therefore tuned to the data scale and compute budget.',
      tags: ['derivation', 'conceptual'],
    },
  ],
  comparisons: [
    {
      title: 'One-Hot vs Static vs Contextual Representations',
      methods: ['One-Hot Encoding', 'Word2Vec/Static Embeddings', 'Contextual Embeddings (BERT)'],
      rows: [
        {
          dimension: 'Dimensionality',
          values: ['$V$ (vocabulary size, e.g. 50k) — sparse', 'Low, dense (e.g. 100–300)', 'Low, dense (e.g. 768–1024)'],
        },
        {
          dimension: 'Captures meaning?',
          values: ['No — all tokens equidistant, no semantics', 'Yes — similar words get nearby vectors', 'Yes — rich semantics plus syntax'],
        },
        {
          dimension: 'Context-sensitivity',
          values: ['None', 'None — one fixed vector per word (polysemy unresolved)', 'Yes — vector changes with the surrounding sentence'],
        },
        {
          dimension: 'Typical use case',
          values: ['Tiny vocabularies, classical ML baselines', 'Lightweight semantic search, pre-deep-learning NLP', 'Modern NLP: QA, NER, retrieval, fine-tuning'],
        },
      ],
      takeaway: 'Move from one-hot (no meaning) to static embeddings (meaning, but one vector per word) to contextual embeddings (meaning that adapts to context) as your need to resolve polysemy and capture nuance grows — at the cost of more compute.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need to feed text into a neural network and want **dense** inputs that encode semantic similarity rather than sparse one-hot IDs.',
      'You are building **semantic search**, retrieval, clustering, or deduplication where cosine similarity between vectors ranks relevance.',
      'You face **out-of-vocabulary** or morphologically rich text and want subword tokenization (BPE/WordPiece) to avoid [UNK] tokens.',
    ],
    avoidWhen: [
      'The vocabulary is tiny and fixed and the categories carry no inherent similarity — plain one-hot or a learned lookup is simpler.',
      'You need to disambiguate **polysemous** words by context but only have static (word2vec/GloVe) embeddings — reach for contextual models like BERT instead.',
      'Your corpus is too small to learn meaningful geometry — embeddings trained from scratch on little data will be noisy; use pretrained vectors or transfer learning.',
    ],
    rulesOfThumb: [
      'Normalize embeddings to unit length so cosine similarity reduces to a plain dot product and is faster to compute at scale.',
      'Pick a vocabulary of roughly 32k–100k subword tokens for general-purpose language models to balance sequence length and parameters.',
      'Embedding dimension scales with task complexity and data size: a few hundred for static vectors, 768+ for large contextual models.',
    ],
  },
  caseStudies: [
    {
      title: 'Word2Vec: learning analogies from raw text at scale',
      domain: 'Natural language processing',
      scenario: 'Before 2013, word representations were largely sparse one-hot or count-based vectors that captured no semantic similarity and scaled poorly. Mikolov and colleagues at Google wanted dense word vectors learned efficiently from very large unlabeled corpora (on the order of billions of words).',
      approach: 'They introduced the Skip-gram and Continuous Bag-of-Words (CBOW) architectures — shallow neural networks trained to predict a word from its context (or vice versa) — which strip out the hidden non-linearity to train on huge datasets cheaply. The learned vectors were evaluated on a word-analogy benchmark using vector arithmetic such as $\\text{king} - \\text{man} + \\text{woman}$ and nearest-neighbour cosine similarity.',
      outcome: 'Training on a 1.6-billion-word corpus, the models learned 300-dimensional vectors in which linear analogies emerged: the system answered semantic/syntactic analogy questions at roughly **60% accuracy** (versus near-zero for earlier baselines), while training orders of magnitude faster than prior neural language models. This established that meaning can be captured as geometry in a dense vector space and seeded the modern embedding era.',
      source: {
        title: 'Efficient Estimation of Word Representations in Vector Space',
        authors: 'Mikolov, T., Chen, K., Corrado, G. and Dean, J.',
        url: 'https://arxiv.org/abs/1301.3781',
        type: 'paper',
      },
    },
  ],
  quiz: [
    {
      question: 'Why is cosine similarity usually preferred over Euclidean distance for comparing embeddings?',
      options: [
        { text: 'It is magnitude-invariant, so it compares direction (meaning) and ignores vector length.', correct: true },
        { text: 'It is always faster to compute than Euclidean distance.', correct: false },
        { text: 'It can only return positive values, which simplifies ranking.', correct: false },
        { text: 'It requires the vectors to be one-hot encoded first.', correct: false },
      ],
      explanation: 'Scaling a vector by a positive constant does not change its cosine similarity, because the factor cancels in numerator and denominator. Direction carries semantic meaning while magnitude often reflects nuisance factors like token frequency, so cosine isolates what matters. (Cosine actually ranges over $[-1, 1]$, and on unit-normalized vectors Euclidean distance and cosine are monotonically related.)',
    },
    {
      question: 'In Byte-Pair Encoding, which pair is merged at each step?',
      options: [
        { text: 'The most frequent pair of adjacent symbols in the current corpus.', correct: true },
        { text: 'A random pair, to encourage vocabulary diversity.', correct: false },
        { text: 'The longest pair of symbols available.', correct: false },
        { text: 'The least frequent pair, to capture rare words.', correct: false },
      ],
      explanation: 'BPE is greedy and frequency-driven: at each iteration it counts all adjacent symbol pairs and merges the single most frequent one into a new token, recording the merge rule. Repeating this grows common subwords first, which is what keeps frequent words short while still decomposing rare words.',
    },
    {
      question: 'What key limitation of static embeddings (like word2vec) do contextual embeddings (like BERT) address?',
      options: [
        { text: 'Polysemy — static embeddings assign one fixed vector per word regardless of context.', correct: true },
        { text: 'They eliminate the need for any tokenization step.', correct: false },
        { text: 'They make embedding tables smaller than the vocabulary.', correct: false },
        { text: 'They remove all bias from the training corpus.', correct: false },
      ],
      explanation: 'A static embedding gives the same vector to “bank” whether it means a riverbank or a financial institution. Contextual models produce a different vector for each occurrence based on the surrounding sentence, resolving polysemy. They still require tokenization and still inherit corpus biases.',
    },
    {
      question: 'Embedding lookup for a token with index $i$ is mathematically equivalent to:',
      options: [
        { text: 'Multiplying a one-hot row vector by the embedding matrix $\\mathbf{E}$, which selects row $i$.', correct: true },
        { text: 'Computing the cosine similarity between the token and every other token.', correct: false },
        { text: 'Averaging all rows of the embedding matrix.', correct: false },
        { text: 'Applying a softmax over the vocabulary.', correct: false },
      ],
      explanation: 'A one-hot vector $\\mathbf{x}$ with a single 1 at position $i$ satisfies $\\mathbf{x}\\mathbf{E} = \\mathbf{E}_{i,:}$, the $i$-th row. In practice frameworks implement this as a direct row index rather than an actual matrix multiply, but the two are equivalent.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
