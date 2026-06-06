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
  workedExamples: [
    {
      title: "End-to-End RAG Ingestion and Querying Workflow",
      problem: "We have a document: 'RAG reduces hallucinations. Fine-tuning teaches style.' A user asks: 'How do we fix hallucinations?'. Outline the steps of chunking, embedding, vector database querying, prompt construction, and generation.",
      solution: "Here is the step-by-step workflow:\n\n1. **Chunking**: Split the document on punctuation to yield two chunks:\n   - Chunk A: 'RAG reduces hallucinations.'\n   - Chunk B: 'Fine-tuning teaches style.'\n\n2. **Embedding**: Pass these chunks through an embedding model to get vectors $\\mathbf{e}_A$ and $\\mathbf{e}_B$.\n\n3. **Query Embedding**: Embed the query 'How do we fix hallucinations?' to get query vector $\\mathbf{e}_Q$.\n\n4. **Retrieval**: Compute cosine similarities:\n   - Similarity($\\mathbf{e}_Q, \\mathbf{e}_A$) = 0.85\n   - Similarity($\\mathbf{e}_Q, \\mathbf{e}_B$) = 0.22\n   - Select Chunk A since it exceeds the similarity threshold.\n\n5. **Prompt Construction**: Place the retrieved snippet into a template:\n   ```text\n   Context: RAG reduces hallucinations.\n   Question: How do we fix hallucinations?\n   Answer using only the context above.\n   ```\n\n6. **Generation**: Feed this prompt to the LLM. The model reads the context and generates the correct answer: 'You can use RAG to reduce hallucinations.'"
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
  relatedModules: ["llms", "embeddings-tokenization", "transformers"]
};
