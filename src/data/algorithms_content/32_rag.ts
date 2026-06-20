import { LearningModule } from "./types";

export const rag: LearningModule = {
  id: "rag",
  title: "Retrieval-Augmented Generation",
  category: "Retrieval-Augmented Generation",
  prerequisites: ["llms", "embeddings-tokenization"],
  tracks: ["modern-ai"],
  difficulty: 3,
  estimatedMinutes: 40,
  shortDescription: "A system architecture that enhances LLM generation by retrieving relevant context documents from an external vector index to minimize hallucinations and leverage private datasets.",
  learningObjectives: [
    "Explain the core components of the RAG pipeline including ingestion, retrieval, and generation.",
    "Compare document chunking strategies (such as fixed-size, recursive, or semantic) and evaluate their tradeoffs.",
    "Formulate query-document matching as a vector search over an embedding space.",
    "Identify and mitigate common failure modes in retrieval (like low recall) and generation (like hallucination).",
    "Design prompts that constrain LLMs to base their answers strictly on retrieved document facts."
  ],
  keyTerms: [
    {
      term: "Retrieval-Augmented Generation (RAG)",
      definition: "An architecture that queries an external database of documents to retrieve factual snippets and injects them into the language model's prompt before generation."
    },
    {
      term: "Vector Database",
      definition: "A specialized index designed to store, index, and query high-dimensional embedding vectors using approximate nearest neighbor algorithms."
    },
    {
      term: "Semantic Chunking",
      definition: "The process of splitting long documents into smaller segments based on changes in topic or meaning, rather than raw character or token counts."
    },
    {
      term: "Reranker",
      definition: "A model that evaluates a retrieved list of documents against a query to order them more accurately by relevance, typically using a cross-encoder network."
    }
  ],
  misconceptions: [
    {
      claim: "Retrieval-Augmented Generation is a type of fine-tuning that updates the LLM parameters.",
      correction: "RAG does not update any neural network weights of the language model. Instead, it only updates the context window (input prompt) of the model dynamically. Fine-tuning, by contrast, modifies the actual model parameters permanently."
    },
    {
      claim: "Using RAG guarantees that the LLM will never generate hallucinated or false responses.",
      correction: "While RAG significantly reduces hallucinations by providing grounding context, the model can still generate false claims if the retrieval step fetches irrelevant documents (bad context) or if the model fails to follow instructions (hallucinated synthesis)."
    }
  ],
  references: [
    {
      title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
      authors: "Patrick Lewis, Ethan Perez, Aleksandra Piktus, et al.",
      url: "https://arxiv.org/abs/2005.11401",
      type: "paper"
    },
    {
      title: "RAG Triad for Evaluation",
      authors: "TruLens Documentation",
      url: "https://www.trulens.org/",
      type: "documentation"
    }
  ],
  failureModes: [
    {
      name: "Retrieval Failure (Low Recall)",
      description: "The vector search fails to retrieve the document containing the answer, meaning the model has no factual basis for its generation.",
      mitigation: "Use hybrid search (combining sparse keyword search like BM25 and dense vector search) and implement a semantic reranker."
    },
    {
      name: "Hallucination (Faithfulness Error)",
      description: "The retriever successfully fetches the correct context, but the LLM ignores it or fabricates details that are not in the context.",
      mitigation: "Refine system instructions, use chain-of-thought prompting, and evaluate output faithfulness using an LLM-as-judge."
    }
  ],
  pros: [
    "Avoids the high cost and computational resources required for continuous model fine-tuning.",
    "Bypasses the training knowledge cutoff date by retrieving fresh data in real time.",
    "Provides transparency and auditability by citing specific source documents."
  ],
  cons: [
    "Increases inference latency due to the extra database lookup step.",
    "Constrained by the model's context window limit (cannot handle unlimited text).",
    "Vulnerable to prompt injection attacks disguised within retrieved third-party text."
  ],
  intuition: "Imagine taking an open-book exam. Instead of memorizing the entire library (which is what fine-tuning is like), you are allowed to look up books. When you get a question, you search the catalog to find the most relevant book pages (retrieval), read them, and write your answer based on those pages (generation). This is Retrieval-Augmented Generation. It separates the LLM's reasoning engine (the brain) from its factual knowledge database (the book library), making it easier to keep information accurate and up-to-date.",
  mathematics: "### Vector Similarity Retrieval\n\nGiven a user query embedding $\\mathbf{q} \\in \\mathbb{R}^d$ and a database of document chunk embeddings $\\mathbf{D} = \\{\\mathbf{d}_1, \\mathbf{d}_2, \\dots, \\mathbf{d}_N\\} \\subset \\mathbb{R}^d$, the retrieval step computes the similarity score for each chunk using cosine similarity:\n$$\\text{Score}(i) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}_i}{\\|\\mathbf{q}\\|_2 \\|\\mathbf{d}_i\\|_2}$$\n\nThe top-$k$ chunks with the highest scores are selected:\n$$\\mathcal{R} = \\operatorname{arg\\,max}_{i \\in \\{1, \\dots, N\\}}^{[k]} \\text{Score}(i)$$\n\n### Ingestion Pipeline Representation\n\nLet a raw document text $D$ be parsed into overlapping chunks $C_j$ using a chunking operator $\\mathcal{T}_{\\text{chunk}}$:\n$$C_1, C_2, \\dots, C_M = \\mathcal{T}_{\\text{chunk}}(D, \\text{size}, \\text{overlap})$$\n\nEach chunk is embedded using the encoding function $\\mathcal{E}$:\n$$\\mathbf{d}_j = \\mathcal{E}(C_j)$$\nThese vectors are indexed in a vector space $\\mathcal{V}$ to support sub-linear approximate nearest neighbor (ANN) searches, such as Hierarchical Navigable Small World (HNSW) graphs.",
  fullDescription: "Retrieval-Augmented Generation (RAG) is a design pattern that integrates information retrieval systems with generative large language models. By retrieving semantically relevant text fragments and inserting them into the model's prompt, RAG grounds generations in fact and enables querying of private, dynamic data sources.",
  codeSnippet: `/**
 * Simple In-Memory Retrieval-Augmented Generation (RAG) Pipeline
 */
export class RAGPipeline {
  private chunks: { text: string; embedding: number[] }[] = [];

  constructor() {}

  /**
   * Encodes text into a mock embedding vector (for demonstration)
   */
  private mockEmbed(text: string): number[] {
    const vocab = ["hallucination", "rag", "fine-tuning", "llm", "search"];
    const vector = new Array(vocab.length).fill(0);
    const words = text.toLowerCase().split(/\\s+/);
    
    words.forEach(word => {
      const idx = vocab.indexOf(word);
      if (idx !== -1) {
        vector[idx] += 1;
      }
    });

    // Normalize vector
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1.0;
    return vector.map(v => v / norm);
  }

  /**
   * Adds a document to the index by chunking and embedding
   */
  addDocument(docText: string) {
    const sentences = docText.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 0);
    
    for (const sentence of sentences) {
      this.chunks.push({
        text: sentence,
        embedding: this.mockEmbed(sentence)
      });
    }
  }

  /**
   * Retrieves top-k relevant chunks matching the query
   */
  retrieve(query: string, k: number = 1): string[] {
    const queryVector = this.mockEmbed(query);
    
    const scoredChunks = this.chunks.map(chunk => {
      // Calculate dot product (both are normalized, so this is cosine similarity)
      const similarity = chunk.embedding.reduce((sum, val, idx) => sum + val * queryVector[idx], 0);
      return { text: chunk.text, score: similarity };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, k).map(c => c.text);
  }

  /**
   * Generates a context-grounded prompt for the LLM
   */
  generatePrompt(query: string): string {
    const context = this.retrieve(query, 1)[0] || "No relevant context found.";
    return \`Context: \${context}\\nQuestion: \${query}\\nAnswer the question using ONLY the context above.\`;
  }
}`,
  relatedModules: ["llms", "embeddings-tokenization", "transformers"],
  tldr: [
    'RAG **retrieves** the most relevant chunks from an external corpus, **augments** the prompt with them, then has the LLM **generate** an answer grounded in that context.',
    'It works like an open-book exam: the model reasons over fetched facts instead of relying solely on parametric memory.',
    'Grounding generations in real source text sharply **reduces hallucination** and lets the model cite where an answer came from.',
    'No retraining required — you update knowledge by editing the index, so RAG sidesteps the cost and staleness of fine-tuning.',
    'Quality hinges on retrieval: chunking strategy, embedding quality, and top-$k$ selection determine whether the right context ever reaches the model.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: The Retrieval Step and a Worked Top-k Example',
      content: `
Retrieval turns "find relevant text" into a geometry problem. Every document chunk $C_i$ is passed through an encoder $\\mathcal{E}$ to produce an embedding $\\mathbf{d}_i = \\mathcal{E}(C_i) \\in \\mathbb{R}^d$, and the user query is embedded the same way: $\\mathbf{q} = \\mathcal{E}(\\text{query})$. Because both live in the *same* vector space, semantic closeness becomes geometric closeness.

We rank chunks by a similarity score. The two standard choices are the **dot product** and **cosine similarity**:

$$ \\text{dot}(\\mathbf{q}, \\mathbf{d}_i) = \\mathbf{q} \\cdot \\mathbf{d}_i = \\sum_{j=1}^{d} q_j d_{ij}, \\qquad \\cos(\\mathbf{q}, \\mathbf{d}_i) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}_i}{\\lVert \\mathbf{q} \\rVert_2 \\, \\lVert \\mathbf{d}_i \\rVert_2} $$

Cosine similarity is just the dot product of the **L2-normalized** vectors, so it measures only the *angle* between them and ignores magnitude. When embeddings are pre-normalized to unit length, dot product and cosine give identical rankings. Top-$k$ retrieval then selects the $k$ chunks with the highest score:

$$ \\mathcal{R} = \\operatorname*{arg\\,max}^{[k]}_{i \\in \\{1, \\dots, N\\}} \\; \\text{sim}(\\mathbf{q}, \\mathbf{d}_i) $$

For large $N$, computing all $N$ similarities exactly is expensive, so vector databases use **approximate nearest neighbor (ANN)** indexes (e.g. HNSW graphs) to find the top-$k$ in roughly logarithmic time at the cost of occasionally missing a true neighbor.

**Worked numeric example (top-2 by cosine).** Take a query and three candidate chunk vectors in $\\mathbb{R}^3$:

$$ \\mathbf{q} = [1, 0, 1], \\quad \\mathbf{d}_1 = [1, 1, 0], \\quad \\mathbf{d}_2 = [0, 1, 1], \\quad \\mathbf{d}_3 = [2, 0, 2] $$

First the dot products: $\\mathbf{q} \\cdot \\mathbf{d}_1 = 1$, $\\mathbf{q} \\cdot \\mathbf{d}_2 = 1$, $\\mathbf{q} \\cdot \\mathbf{d}_3 = 4$. The norms: $\\lVert \\mathbf{q} \\rVert = \\sqrt{2}$, $\\lVert \\mathbf{d}_1 \\rVert = \\lVert \\mathbf{d}_2 \\rVert = \\sqrt{2}$, $\\lVert \\mathbf{d}_3 \\rVert = \\sqrt{8}$. So the cosine scores are:

$$ \\cos(\\mathbf{q}, \\mathbf{d}_1) = \\frac{1}{\\sqrt{2}\\sqrt{2}} = 0.5, \\quad \\cos(\\mathbf{q}, \\mathbf{d}_2) = \\frac{1}{2} = 0.5, \\quad \\cos(\\mathbf{q}, \\mathbf{d}_3) = \\frac{4}{\\sqrt{2}\\sqrt{8}} = \\frac{4}{4} = 1.0 $$

Ranking gives $\\mathbf{d}_3$ (1.0) first, then a tie between $\\mathbf{d}_1$ and $\\mathbf{d}_2$ (0.5 each). **Top-2** retrieval returns $\\{\\mathbf{d}_3, \\mathbf{d}_1\\}$ (breaking the tie by index). Note the lesson from $\\mathbf{d}_3 = 2\\mathbf{q}$: it points in exactly the same direction as the query, so cosine scores it a perfect $1.0$ even though its raw magnitude is large — direction, not length, is what cosine rewards.
      `,
    },
    {
      heading: 'Chunking Strategy and the Precision/Recall Tradeoff',
      content: `
Before anything can be retrieved, a document must be split into chunks, and that choice quietly governs retrieval quality. A chunk is the *atomic unit* returned to the model, so its size trades off two failure modes.

**Why chunk size matters.** A single embedding is a fixed-length summary of whatever text it encodes. If a chunk is **too large** (say an entire 5-page section), its embedding becomes an average of many topics; the one relevant sentence is *diluted* by surrounding noise, pulling the vector away from any specific query and lowering similarity scores — a precision problem. If a chunk is **too small** (a single clause), the embedding may match the query keyword but the retrieved snippet *lacks the surrounding context* needed to actually answer — you retrieve "the dose is 50 mg" without "for adult patients with condition X". The practical sweet spot is usually a few hundred tokens with a small overlap (e.g. 10–20%) so that ideas straddling a boundary are not cut in half.

**Quantifying retrieval quality.** Suppose for a query there are $R$ truly relevant chunks in the corpus, and the retriever returns $k$ chunks of which $\\text{rel}_k$ are relevant. Two standard metrics:

$$ \\text{precision@}k = \\frac{\\text{rel}_k}{k}, \\qquad \\text{recall@}k = \\frac{\\text{rel}_k}{R} $$

Precision@k asks "of what I returned, how much was useful?"; recall@k asks "of everything useful, how much did I find?". In RAG, **recall@k is usually the metric that matters most**: if the answer-bearing chunk is never retrieved, no amount of clever prompting can recover it — the generator is blind to it.

**Why we cannot just make k huge.** Raising $k$ monotonically helps recall (more chunks = more chances to include the right one) but it is bounded by the **context window**. If each chunk is $t$ tokens and the model has a context budget of $L$ tokens shared with the system prompt, question, and answer, then feasibly $k \\lesssim L / t$. Stuffing more chunks also invites the "lost in the middle" effect, where models attend poorly to content buried in a long context, and it raises latency and token cost. So $k$ is chosen to maximize recall *subject to* the window limit, and a **reranker** is often added to reorder a large candidate set down to the few highest-value chunks that fit.
      `,
    },
  ],
  comparisons: [
    {
      title: 'RAG vs Fine-tuning vs Long-context Prompting',
      methods: ['RAG', 'Fine-tuning', 'Long-context prompting'],
      rows: [
        {
          dimension: 'Knowledge freshness',
          values: ['Update the index any time — instantly current', 'Stale until the next expensive retraining run', 'Fresh, but you must paste the source in every call'],
        },
        {
          dimension: 'Cost to update knowledge',
          values: ['Low — re-embed and upsert new chunks', 'High — GPU hours plus data curation per update', 'Low to set up, but high per-query token cost'],
        },
        {
          dimension: 'Hallucination control',
          values: ['Strong — answers grounded in cited, retrieved text', 'Weak — baked-in facts can still be confabulated', 'Strong if the answer is in-context, but no retrieval filter'],
        },
        {
          dimension: 'Scales to large corpora',
          values: ['Yes — retrieval selects only relevant slices', 'Indirectly — knowledge is compressed into weights', 'No — limited by the context window size'],
        },
        {
          dimension: 'Best at teaching style/format',
          values: ['No — changes facts, not behavior', 'Yes — shapes tone, format, and skills', 'Partially — via few-shot examples in the prompt'],
        },
        {
          dimension: 'When to use',
          values: ['Large, changing, private knowledge bases needing citations', 'Fixed domain skills, tone, or output format', 'Small, one-off documents that fit in the window'],
        },
      ],
      takeaway: 'Reach for RAG when knowledge is large, private, or fast-changing and you need grounded, citable answers; fine-tune to change *behavior* (style, format, skills) rather than facts; use long-context prompting for small, ad-hoc documents. They compose well — e.g. fine-tune for tone while RAG supplies the facts.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'Your knowledge base is **large, private, or frequently changing** (internal docs, support tickets, product catalogs) and cannot be baked into weights.',
      'You need **citations and auditability** — answers must point back to specific source passages.',
      'You must respect the model’s **knowledge cutoff** and serve up-to-date facts without retraining.',
      'Hallucination cost is high (legal, medical, financial) and grounding answers in retrieved text materially lowers risk.',
    ],
    avoidWhen: [
      'The task is about **behavior, tone, or output format** rather than facts — that is a fine-tuning job, not retrieval.',
      'The entire relevant source comfortably **fits in the context window** — just paste it in and skip the retrieval infrastructure.',
      'The added **retrieval latency** is unacceptable for your real-time use case and the knowledge is static enough to fine-tune instead.',
      'Your corpus is tiny or low-quality — a poor index retrieves poor context, and "garbage in, garbage out" can make RAG worse than a plain prompt.',
    ],
    rulesOfThumb: [
      'Optimize **recall first**: if the answer chunk is never retrieved, no prompt can save you.',
      'Start with a few-hundred-token chunk size and ~10–20% overlap, then tune empirically on your own eval set.',
      'Add a **reranker** when you need high recall from a large candidate set but a small context window.',
      'Always instruct the model to answer **only** from the provided context and to say "I don’t know" when the context is insufficient.',
    ],
  },
  caseStudies: [
    {
      title: 'The original RAG paper on open-domain question answering',
      domain: 'Knowledge-intensive NLP',
      scenario: 'Lewis et al. (2020) at Facebook AI tackled knowledge-intensive tasks like open-domain question answering, where a parametric-only sequence model (BART) must recall specific facts it may never have reliably memorized, and cannot easily be updated or inspected.',
      approach: 'They coupled a pretrained neural retriever (Dense Passage Retrieval) over a Wikipedia index with a pretrained seq2seq generator (BART), training the two **end-to-end** so the model retrieves top-$k$ passages and conditions generation on them. They studied both a variant that fixes one passage per output (RAG-Sequence) and one that can attend to different passages per token (RAG-Token).',
      outcome: 'RAG set state-of-the-art results on three open-domain QA benchmarks, reaching **44.5% exact match on Natural Questions** and outperforming both a comparable parametric-only seq2seq baseline and prior extractive "retrieve-and-read" pipelines. Crucially, because knowledge lived in a swappable non-parametric index, the authors could **update the model’s world knowledge by replacing the document index** — no retraining — demonstrating the core practical advantage that defines modern RAG systems.',
      source: {
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        authors: 'Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., et al.',
        url: 'https://arxiv.org/abs/2005.11401',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: "Discuss the precision-recall tradeoffs of choosing a very large chunk size (e.g., an entire 2,000-token article) versus a very small chunk size (e.g., a single sentence) in a RAG system. How does chunk size affect the embedding representation?",
      expectedAnswerRubric: "The answer should explain that a very large chunk size dilutes the embedding, as it averages many topics together; this causes the vector to lose alignment with specific queries, lowering retrieval precision/recall. Conversely, a very small chunk creates a highly specific embedding that matches queries well, but lacks the surrounding context needed by the LLM to actually formulate a comprehensive answer."
    }
  ],
  quiz: [
    {
      question: 'In a RAG pipeline using cosine similarity, why does normalizing the embeddings to unit length make the dot product and cosine similarity produce the same ranking?',
      options: [
        { text: 'Cosine similarity is the dot product of L2-normalized vectors, so after normalization the two scores are identical.', correct: true },
        { text: 'Normalization changes the angle between vectors so that all chunks become equidistant.', correct: false },
        { text: 'The dot product ignores direction, while cosine ignores magnitude, so normalization makes them cancel out.', correct: false },
        { text: 'Normalization converts the vectors into probabilities, which the LLM requires.', correct: false },
      ],
      explanation: 'Cosine similarity divides the dot product by the product of the two norms. If every vector already has norm 1, that denominator is 1, so cosine equals the raw dot product — and therefore yields the same ordering of chunks.',
    },
    {
      question: 'A RAG system retrieves the correct passage into the context, yet the model still answers with a fabricated detail not present in that passage. This is best described as:',
      options: [
        { text: 'A faithfulness (generation) failure, not a retrieval failure.', correct: true },
        { text: 'A low-recall retrieval failure.', correct: false },
        { text: 'A chunking error caused by overly small chunks.', correct: false },
        { text: 'Proof that RAG cannot reduce hallucination at all.', correct: false },
      ],
      explanation: 'Retrieval succeeded — the right context was present — so this is a generation/faithfulness problem: the model ignored or contradicted its context. Mitigations include stronger "answer only from context" instructions and faithfulness evaluation, which are different from fixing low recall.',
    },
    {
      question: 'Why is recall@k typically the most important retrieval metric to optimize in a RAG system?',
      options: [
        { text: 'If the answer-bearing chunk is never retrieved, the generator has no way to produce a grounded answer.', correct: true },
        { text: 'Because precision is impossible to measure without labeled data.', correct: false },
        { text: 'Because recall directly controls the model’s context window size.', correct: false },
        { text: 'Because higher recall always lowers inference latency.', correct: false },
      ],
      explanation: 'Recall measures whether the relevant chunk made it into the retrieved set at all. A missing fact is unrecoverable downstream — no prompt or reranker can use context that was never fetched. Some irrelevant chunks (lower precision) are more tolerable and can be filtered by a reranker.',
    }
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
