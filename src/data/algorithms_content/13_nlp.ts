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
print(vectors[1].tolist())`,
  tldr: [
    'Classical NLP represents text as counts: **Bag-of-Words** and **TF-IDF** weight each term by how often it appears in a document, discounted by how common it is across the corpus.',
    'TF-IDF is $\\text{tf-idf}(t,d) = tf(t,d) \\times \\log\\frac{N}{df(t)}$ — frequent-in-this-document, rare-across-the-corpus terms score highest.',
    'N-gram language models use the **chain rule** plus a **Markov assumption** to approximate $P(w_1,\\ldots,w_n)$ as a product of short, local conditional probabilities.',
    '**Laplace (add-one) smoothing** prevents zero probabilities for n-grams unseen during training by pretending every n-gram occurred at least once.',
    'Bag-of-words and n-gram counts ignore long-range meaning — they capture surface statistics, not semantics, which is why dense **word embeddings** were developed.',
    'These statistical methods (Naive Bayes spam filters, n-gram language models) predate deep learning and still serve as fast, interpretable baselines.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: TF-IDF from First Principles',
      content: `
TF-IDF combines two signals about a term $t$ in a document $d$ drawn from a corpus of $N$ documents:

$$ \\text{tf-idf}(t,d) = tf(t,d) \\times \\log\\frac{N}{df(t)} $$

**Term Frequency** $tf(t,d)$ measures how often $t$ occurs in $d$ (often normalized by document length so longer documents do not automatically score higher):

$$ tf(t,d) = \\frac{\\text{count of } t \\text{ in } d}{\\text{total terms in } d} $$

**Document Frequency** $df(t)$ counts how many documents in the corpus contain $t$ at least once. The **inverse document frequency** term $\\log\\frac{N}{df(t)}$ is large when a word is rare across documents (informative, like a topic word) and close to zero when a word appears in nearly every document (uninformative, like "the" or "and"). Multiplying the two means a term only scores highly when it is **both** frequent in this specific document **and** rare across the corpus as a whole — exactly the signature of a word that characterizes what this document is about.

**Worked example.** Consider a tiny 3-document corpus:

- $d_1$: "the cat sat on the mat" (6 terms)
- $d_2$: "the dog sat on the log" (6 terms)
- $d_3$: "cats and dogs are great" (5 terms)

Compute the TF-IDF of the term "cat" in $d_1$. First, term frequency:

$$ tf(\\text{cat}, d_1) = \\frac{1}{6} \\approx 0.1667 $$

("cat" appears once among the 6 terms of $d_1$.) Next, document frequency: "cat" appears only in $d_1$ (note "cats" in $d_3$ is a different surface form here, so it does not count), so $df(\\text{cat}) = 1$ out of $N = 3$ documents:

$$ \\log\\frac{N}{df(t)} = \\log\\frac{3}{1} = \\log 3 \\approx 1.0986 $$

Multiplying gives:

$$ \\text{tf-idf}(\\text{cat}, d_1) = 0.1667 \\times 1.0986 \\approx 0.1831 $$

Compare this with a word like "the", which has $df(\\text{the}) = 2$ (it appears in $d_1$ and $d_2$) and $tf(\\text{the}, d_1) = 2/6 \\approx 0.333$: $\\text{tf-idf}(\\text{the}, d_1) = 0.333 \\times \\log(3/2) \\approx 0.333 \\times 0.405 \\approx 0.135$. Even though "the" is more frequent in the document, its near-ubiquity across the corpus drags its score down relative to a rarer, more topical word.
      `,
    },
    {
      heading: 'Derivation: N-gram Language Models via the Chain Rule and Markov Assumption',
      content: `
A language model assigns a probability to a sequence of words $w_1, \\ldots, w_n$. The **chain rule of probability** lets us factor this joint probability exactly, with no approximation, into a product of conditionals:

$$ P(w_1, \\ldots, w_n) = \\prod_{i=1}^{n} P(w_i \\mid w_1, \\ldots, w_{i-1}) $$

The problem is that conditioning on the *entire* history $w_1, \\ldots, w_{i-1}$ requires more training data than any corpus could provide — most long histories are seen rarely or never. The **Markov assumption** fixes this by truncating the history to the last $k-1$ words. For a **bigram model** ($k=2$), we assume each word depends only on the immediately preceding word:

$$ P(w_1, \\ldots, w_n) \\approx \\prod_{i=1}^{n} P(w_i \\mid w_{i-1}) $$

Each bigram probability is estimated from corpus counts via maximum likelihood:

$$ P(w_i \\mid w_{i-1}) = \\frac{\\text{count}(w_{i-1}, w_i)}{\\text{count}(w_{i-1})} $$

**Worked example.** Suppose a small training corpus yields these counts: $\\text{count}(\\text{"I"}) = 100$, $\\text{count}(\\text{"I love"}) = 30$, $\\text{count}(\\text{"love"}) = 40$, $\\text{count}(\\text{"love nlp"}) = 20$, $\\text{count}(\\text{"nlp"}) = 25$, $\\text{count}(\\text{"nlp"}, \\text{"<END>"}) = 10$. Estimate the bigram probabilities:

$$ P(\\text{love} \\mid \\text{I}) = \\frac{30}{100} = 0.30, \\quad P(\\text{nlp} \\mid \\text{love}) = \\frac{20}{40} = 0.50, \\quad P(\\text{<END>} \\mid \\text{nlp}) = \\frac{10}{25} = 0.40 $$

The probability of the sentence "I love nlp" (with an implicit end marker) is the product of these bigram probabilities:

$$ P(\\text{I love nlp}) \\approx P(\\text{love}\\mid\\text{I}) \\times P(\\text{nlp}\\mid\\text{love}) \\times P(\\text{<END>}\\mid\\text{nlp}) = 0.30 \\times 0.50 \\times 0.40 = 0.06 $$

**Laplace (add-one) smoothing.** If a bigram such as "nlp rocks" never appeared in training, the maximum-likelihood estimate gives $P(\\text{rocks} \\mid \\text{nlp}) = 0$, which would zero out the probability of *any* sentence containing it — too brittle. Laplace smoothing adds a pseudo-count of 1 to every possible bigram before normalizing, using the vocabulary size $V$:

$$ P_{\\text{Laplace}}(w_i \\mid w_{i-1}) = \\frac{\\text{count}(w_{i-1}, w_i) + 1}{\\text{count}(w_{i-1}) + V} $$

If the vocabulary has $V = 500$ distinct words and $\\text{count}(\\text{nlp}) = 25$ with $\\text{count}(\\text{nlp}, \\text{rocks}) = 0$, smoothing gives $P_{\\text{Laplace}}(\\text{rocks} \\mid \\text{nlp}) = \\frac{0 + 1}{25 + 500} = \\frac{1}{525} \\approx 0.0019$ — small, but no longer zero, so previously unseen combinations no longer collapse the whole sequence probability to nothing.
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A document contains 50 words in total. The term "model" appears 4 times in it. Compute the term frequency $tf(\\text{model}, d)$.',
      difficulty: 'warm-up',
      solution: 'Term frequency is the count of the term divided by the total number of terms in the document: $tf(\\text{model}, d) = \\frac{4}{50} = 0.08$.',
      tags: ['tf-idf', 'computation'],
    },
    {
      prompt: 'A corpus has $N = 200$ documents. The word "kernel" appears in $df(\\text{kernel}) = 8$ of them. Compute the inverse document frequency $\\log\\frac{N}{df(t)}$ (natural log), and explain in one sentence why this value is large for rare words.',
      difficulty: 'core',
      hint: 'Plug $N$ and $df(t)$ directly into $\\log\\frac{N}{df(t)}$; recall $\\ln(25) \\approx 3.22$.',
      solution: '$\\log\\frac{N}{df(t)} = \\log\\frac{200}{8} = \\log(25) \\approx 3.22$. This value is large for rare words because as $df(t)$ shrinks relative to $N$, the ratio $N/df(t)$ grows, and the logarithm of a large ratio is large — so words that show up in only a handful of documents out of many get a strong inverse-document-frequency boost, marking them as more discriminative than common words.',
      tags: ['tf-idf', 'computation'],
    },
    {
      prompt: 'From a training corpus you observe $\\text{count}(\\text{"machine"}) = 60$ and $\\text{count}(\\text{"machine learning"}) = 18$. Estimate the bigram probability $P(\\text{learning} \\mid \\text{machine})$ using maximum likelihood.',
      difficulty: 'core',
      hint: 'Use $P(w_i \\mid w_{i-1}) = \\frac{\\text{count}(w_{i-1}, w_i)}{\\text{count}(w_{i-1})}$.',
      solution: '$P(\\text{learning} \\mid \\text{machine}) = \\frac{\\text{count}(\\text{machine}, \\text{learning})}{\\text{count}(\\text{machine})} = \\frac{18}{60} = 0.30$.',
      tags: ['n-gram', 'computation'],
    },
    {
      prompt: 'The bigram "deep fakes" never occurs in your training corpus, even though both words individually occur often: $\\text{count}(\\text{"deep"}) = 120$ and $\\text{count}(\\text{"deep fakes"}) = 0$. The vocabulary has $V = 1000$ unique words. Apply Laplace (add-one) smoothing to estimate $P_{\\text{Laplace}}(\\text{fakes} \\mid \\text{deep})$, and explain why the unsmoothed maximum-likelihood estimate would be problematic for a language model.',
      difficulty: 'challenge',
      hint: 'Use $P_{\\text{Laplace}}(w_i \\mid w_{i-1}) = \\frac{\\text{count}(w_{i-1}, w_i) + 1}{\\text{count}(w_{i-1}) + V}$.',
      solution: '$P_{\\text{Laplace}}(\\text{fakes} \\mid \\text{deep}) = \\frac{0 + 1}{120 + 1000} = \\frac{1}{1120} \\approx 0.00089$. The unsmoothed maximum-likelihood estimate would give $P(\\text{fakes} \\mid \\text{deep}) = 0/120 = 0$, and because sentence probability is a **product** of bigram probabilities, a single zero-probability bigram would force the probability of any sentence containing "deep fakes" to exactly zero — even if every other word in the sentence is perfectly ordinary. Smoothing reserves a small amount of probability mass for unseen combinations so the model degrades gracefully instead of catastrophically.',
      tags: ['n-gram', 'smoothing', 'conceptual'],
    },
  ],
  comparisons: [
    {
      title: 'Bag-of-Words / TF-IDF vs N-gram Language Models vs Word Embeddings',
      methods: ['Bag-of-Words / TF-IDF', 'N-gram Language Models', 'Word Embeddings (e.g. Word2Vec)'],
      rows: [
        {
          dimension: 'Captures word order / local context',
          values: ['No — a document is an unordered multiset of word counts', 'Yes, but only within a fixed short window (e.g. the previous 1-2 words)', 'No inherent order capture in the static vectors themselves, but training context windows shape the vectors'],
        },
        {
          dimension: 'Representation dimensionality',
          values: ['One dimension per vocabulary term — typically tens of thousands, very sparse', 'Conceptually a table of $V^k$ possible n-grams for vocabulary size $V$ — also huge and sparse', 'Fixed, small dense vectors (commonly 50-300 dimensions)'],
        },
        {
          dimension: 'Captures semantic similarity',
          values: ['No — "good" and "great" are entirely unrelated dimensions', 'No — similarity is not represented, only sequential likelihood', 'Yes — similar words land close together in vector space (e.g. king - man + woman ≈ queen)'],
        },
        {
          dimension: 'Data / compute needed',
          values: ['Very low — simple counting', 'Low to moderate — counting plus smoothing', 'Higher — requires training over large text corpora'],
        },
        {
          dimension: 'Typical use case',
          values: ['Document classification, search/retrieval ranking, spam filtering', 'Speech recognition rescoring, autocomplete, early machine translation', 'Semantic search, clustering, as input features to neural networks'],
        },
      ],
      takeaway: 'Bag-of-words/TF-IDF and n-gram models are simple, fast, and interpretable count-based statistics, but neither represents meaning — they just represent presence or local sequence likelihood. Word embeddings trade interpretability and simplicity for the ability to place semantically related words near each other, which is why they became the foundation for modern neural NLP.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You need a **fast, interpretable baseline** for text classification or search ranking and have limited training data (TF-IDF + a linear model or Naive Bayes).',
      'You are building **speech recognition rescoring** or **autocomplete** features where local word-sequence likelihood matters more than deep semantics (n-gram models).',
      'Your corpus is small, your compute budget is tight, or you must explain exactly why a document scored the way it did to a non-technical stakeholder.',
    ],
    avoidWhen: [
      'The task depends on **semantic similarity** between words with no lexical overlap (e.g. matching "automobile" to "car") — bag-of-words and n-grams will miss this entirely.',
      'You need to model **long-range dependencies** spanning many words — fixed-window n-grams and order-blind bag-of-words both fail here.',
      'You have abundant text data and compute — modern contextual embeddings (e.g. Transformer-based models) will outperform these classical statistics on almost every semantic task.',
    ],
    rulesOfThumb: [
      'Always apply smoothing (Laplace, or better, more advanced techniques like Kneser-Ney) before deploying any n-gram language model — zero counts will otherwise zero out entire sequence probabilities.',
      'For TF-IDF, strip or downweight stopwords first; otherwise ubiquitous function words can still dominate raw term-frequency counts before IDF has a chance to discount them.',
      'Treat bag-of-words/TF-IDF and n-gram counts as a cheap, strong baseline to beat — if a fancier embedding-based model cannot clearly outperform them, the added complexity may not be worth it.',
    ],
  },
  caseStudies: [
    {
      title: 'Early statistical machine translation with n-gram language models',
      domain: 'Machine Translation',
      scenario: 'Before neural machine translation became dominant, systems like the influential IBM translation models and later phrase-based statistical MT systems (e.g. Moses) needed a way to judge whether a candidate translated sentence was fluent, natural-sounding output in the target language, separate from whether it was a faithful translation of the source.',
      approach: 'A target-language n-gram model (commonly trigram or higher, trained on large monolingual corpora) was combined with a translation model in a log-linear framework. The translation model proposed candidate phrase reorderings and substitutions, while the n-gram language model scored each candidate sentence using $P(w_1,\\ldots,w_n) \\approx \\prod_i P(w_i \\mid w_{i-2}, w_{i-1})$, with smoothing (e.g. Kneser-Ney) handling n-grams unseen in training. The decoder searched for the candidate maximizing the combined translation-model and language-model score.',
      outcome: 'Adding a well-tuned n-gram language model component was one of the largest single contributors to translation quality in these systems, often improving BLEU scores by several points over translation-model-only baselines, simply by rejecting grammatically broken or unnatural word orderings that a pure phrase-substitution model would otherwise output. This pattern — pairing a content model with a separate fluency model — predates and foreshadows the encoder-decoder architectures used in later neural MT.',
      source: {
        title: 'Speech and Language Processing (Ch. on N-gram Language Models and Machine Translation)',
        authors: 'Jurafsky, D. and Martin, J. H',
        url: 'https://web.stanford.edu/~jurafsky/slp3/',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'Why does TF-IDF multiply term frequency by $\\log\\frac{N}{df(t)}$ rather than using term frequency alone?',
      options: [
        { text: 'To downweight terms that appear in many documents and are therefore less discriminative.', correct: true },
        { text: 'To convert word counts into probabilities that sum to one.', correct: false },
        { text: 'To guarantee the score is always between 0 and 1.', correct: false },
        { text: 'To capture the order in which words appear in the document.', correct: false },
      ],
      explanation: 'The inverse-document-frequency factor shrinks toward zero for words that appear in almost every document (like "the"), and grows for words that appear in only a few documents. This rewards terms that are both common locally and rare globally — the signature of an informative, topic-specific word. TF-IDF does not normalize to a probability distribution, is not bounded to [0,1] in general, and bag-of-words style counts carry no word-order information.',
    },
    {
      question: 'A bigram language model assumes $P(w_1,\\ldots,w_n) \\approx \\prod_i P(w_i \\mid w_{i-1})$. What assumption makes this approximation valid?',
      options: [
        { text: 'The Markov assumption — each word depends only on a fixed, short recent history.', correct: true },
        { text: 'That all words in the vocabulary are equally likely.', correct: false },
        { text: 'That the corpus contains every possible word sequence at least once.', correct: false },
        { text: 'That words are conditionally independent of all other words.', correct: false },
      ],
      explanation: 'The chain rule alone gives an exact factorization conditioning on the full history. The Markov assumption truncates that history to just the previous word (for a bigram model), trading some accuracy for tractable estimation from finite data. It does not assume uniform word probabilities, full corpus coverage, or full independence — only independence from everything except the immediate predecessor.',
    },
    {
      question: 'Why is Laplace (add-one) smoothing applied when estimating n-gram probabilities?',
      options: [
        { text: 'To avoid assigning zero probability to n-grams that were never observed during training.', correct: true },
        { text: 'To make the model run faster at inference time.', correct: false },
        { text: 'To increase the vocabulary size of the model.', correct: false },
        { text: 'To remove the need for a training corpus altogether.', correct: false },
      ],
      explanation: 'Maximum-likelihood n-gram estimates assign exactly zero probability to any n-gram absent from training data, which can zero out the probability of an entire sentence since sentence probability is a product of n-gram probabilities. Adding a pseudo-count of 1 to every possible n-gram before normalizing ensures every n-gram gets some nonzero probability mass. It has no effect on inference speed, vocabulary size, or the need for training data.',
    },
    {
      question: 'Which limitation is shared by both bag-of-words/TF-IDF representations and n-gram language models, but is addressed by dense word embeddings?',
      options: [
        { text: 'Neither captures semantic similarity between words that are spelled differently but mean similar things.', correct: true },
        { text: 'Both require labeled training data to compute.', correct: false },
        { text: 'Both can only be computed for documents written in English.', correct: false },
        { text: 'Both require a neural network to train.', correct: false },
        { text: 'Both produce vectors with exactly one dimension per word.', correct: false },
      ],
      explanation: 'Bag-of-words/TF-IDF treats each vocabulary word as its own independent dimension, and n-gram models only capture short sequential dependencies — neither represents that "good" and "great" are related in meaning. Dense embeddings place semantically related words near each other in a shared continuous space. Both classical methods are unsupervised counting techniques (no labels or neural networks required) and are language-agnostic in principle.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
