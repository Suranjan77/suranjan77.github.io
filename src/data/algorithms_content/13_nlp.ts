import { LearningModule } from "./types";

export const nlp: LearningModule = {
  id: "nlp",
  title: "Natural Language Processing",
  category: "Natural Language Processing",
  prerequisites: ["neural-networks"],
  tracks: ["modern-ai"],
  difficulty: 3,
  relatedModules: ["neural-networks", "transformers"],
  shortDescription: "Techniques to translate human speech and text into vector mathematics, enabling machines to read, translate, and synthesize language.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Explain the concept of word embeddings and dense vector representations',
    'Calculate Term Frequency-Inverse Document Frequency (TF-IDF) weights for a vocabulary',
    'Describe the mechanics of n-gram models and recurrent neural networks (RNNs)',
    'Distinguish between lexical, syntactic, and semantic levels of language processing',
  ],
  keyTerms: [
    { term: 'Tokenization', definition: 'The process of breaking down text streams into individual words, symbols, or subwords (tokens).' },
    { term: 'TF-IDF', definition: 'A numerical statistic intended to reflect how important a word is to a document in a collection or corpus.' },
    { term: 'Word Embedding', definition: 'A dense vector representation of a word that captures its semantic meaning and relationships with other words.' },
  ],
  workedExamples: [
    {
      title: 'TF-IDF Calculation',
      problem: 'A word appears 3 times in a document of 100 words. The total corpus has 10,000 documents, and 100 of them contain the word. Compute the TF-IDF weight using $\\text{IDF} = \\log_{10}(\\frac{N}{DF})$.',
      solution: 'Term Frequency $\\text{TF} = \\frac{3}{100} = 0.03$. Inverse Document Frequency $\\text{IDF} = \\log_{10}(\\frac{10000}{100}) = \\log_{10}(100) = 2$. Weight $\\text{TF-IDF} = 0.03 \\times 2 = 0.06$.',
    },
  ],
  misconceptions: [
    {
      claim: 'TF-IDF is a deep learning technique.',
      correction: 'TF-IDF is a classical, statistics-based frequency calculation that does not use neural networks or learn word embeddings.'
    },
    {
      claim: 'Word embeddings like Word2Vec capture the exact contextual meaning of a word in a specific sentence.',
      correction: 'Word2Vec assigns a single, static vector to each word regardless of context. Modern models (like Transformers) produce dynamic, context-dependent embeddings.'
    }
  ],
  references: [
    {
      title: "Speech and Language Processing",
      authors: "Jurafsky, D. and Martin, J. H",
      url: "https://web.stanford.edu/~jurafsky/slp3/",
      type: "textbook"
    },
    {
      title: "Foundations of Statistical Natural Language Processing",
      authors: "Manning, C. D. and Schütze, H",
      url: "https://nlp.stanford.edu/fsnlp/",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Out-of-Vocabulary (OOV) Words',
      description: 'Words that were not present in the training vocabulary cannot be embedded, causing classification failures.',
      mitigation: 'Use subword tokenization algorithms (like Byte-Pair Encoding or WordPiece).'
    }
  ],

  fullDescription: `
Natural Language Processing (NLP) is the mathematical discipline that allows computer chips to process, understand, and generate human languages. Because computers operate only on numbers, NLP maps text into continuous vector spaces.

Traditional statistical NLP relies on word frequencies and counts (like TF-IDF). Modern deep learning NLP embeds words, phrases, or full documents into dense vectors (Word Embeddings). In this geometric vector space, words with similar meanings are mapped close together, allowing models to capture subtle semantic nuances, context, and syntax.
  `,

  intuition: `
Imagine words as points in a giant multi-dimensional "meaning space". In this space, the spatial distance between points represents how related they are. 

If you take the vector for "King", subtract the vector for "Man", and add the vector for "Woman", you land almost exactly at the vector coordinates for "Queen". NLP is the process of translating human writing into these neat, coordinate-based maps.
  `,

  mathematics: `
### 1. Cosine Similarity
To measure semantic similarity between two text vectors ($u$ and $v$), we calculate the cosine of the angle between them. This focuses on direction rather than magnitude:

$$ \\text{Cosine Similarity}(u, v) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|} = \\frac{\\sum_{i} u_i v_i}{\\sqrt{\\sum_{i} u_i^2} \\sqrt{\\sum_{i} v_i^2}} $$

The value is bounded between -1 (opposite meaning) and +1 (identical direction).

### 2. Term Frequency-Inverse Document Frequency (TF-IDF)
A classic metric representing how important a word $t$ is to a specific document $d$ within a corpus $D$:

$$ \\text{TF-IDF}(t, d, D) = \\text{TF}(t, d) \\times \\text{IDF}(t, D) $$

$$ \\text{IDF}(t, D) = \\log \\left( \\frac{|D|}{1 + |\\{d \\in D : t \\in d\\}|} \\right) $$

Where $\\text{TF}$ is term count and $\\text{IDF}$ scales down words that appear too frequently across all documents (like "the", "and").
  `,

  pros: [
    "Unstructured data extraction: Converts millions of paragraphs, logs, and emails into structured databases.",
    "Captures semantic intent: Understands synonyms, context shifts, and metaphors via word embedding vector geometry.",
    "Powers global interaction: Enables real-time language translations and responsive chatbots."
  ],

  cons: [
    "Context ambiguity: Sarcasm, slang, and cultural double-meanings frequently trip up representations.",
    "Vocabulary sparsity: Rare terms or spelling mistakes can result in empty or inaccurate vectors.",
    "Computation bottlenecks: Sequential processing in recurrent architectures limits model training speed."
  ],

  codeSnippet: `import torch
import torch.nn as nn

# Create a lookup vocabulary of 5 words, mapping each to a 3-dimensional vector
vocab = {"hello": 0, "world": 1, "machine": 2, "learning": 3, "ai": 4}
embedding_layer = nn.Embedding(num_embeddings=5, embedding_dim=3)

# Initialize weights manually to demonstrate
with torch.no_grad():
    embedding_layer.weight.copy_(torch.tensor([
        [0.1, 2.0, -0.5], # hello
        [0.8, -1.0, 0.4], # world
        [-1.2, 0.3, 1.5], # machine
        [-0.9, 0.2, 1.4], # learning
        [-1.5, 0.5, 2.0]  # ai
    ]))

# Look up coordinates for "machine" and "ai" (indices 2 and 4)
input_indices = torch.tensor([2, 4])
vectors = embedding_layer(input_indices)

print("Vector representation of 'machine':")
print(vectors[0].tolist())
print("Vector representation of 'ai':")
print(vectors[1].tolist())`
};
