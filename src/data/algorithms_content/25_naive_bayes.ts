import { LearningModule } from "./types";

export const naiveBayes: LearningModule = {
  id: "naive-bayes",
  title: "Naive Bayes",
  category: "Naive Bayes",
  prerequisites: ["probability-theory", "bayesian-inference"],
  tracks: ["practitioner"],
  difficulty: 2,
  estimatedMinutes: 30,
  shortDescription: "A fast, probabilistic classifier that computes class probabilities using Bayes' Theorem with the 'naive' assumption of feature independence.",
  learningObjectives: [
    "Formulate the Naive Bayes classification model using Bayes' Theorem.",
    "Explain the 'naive' conditional independence assumption and its mathematical implications.",
    "Contrast Gaussian, Multinomial, and Bernoulli Naive Bayes variants and their use cases.",
    "Apply Laplace smoothing to handle zero-frequency feature occurrences.",
    "Explain the reason for computing probabilities in log-space to prevent underflow."
  ],
  keyTerms: [
    {
      term: "Conditional Independence",
      definition: "An assumption that the presence or absence of a particular feature is unrelated to the presence or absence of any other feature, given the class label."
    },
    {
      term: "Laplace Smoothing",
      definition: "A technique used to smooth categorical data by adding a small positive constant (usually 1) to all feature counts to avoid zero probability estimates."
    },
    {
      term: "Prior Probability",
      definition: "The initial probability of a class before observing any feature data, computed as the class proportion in the training dataset."
    },
    {
      term: "Likelihood",
      definition: "The conditional probability of observing a specific feature value given the class label."
    }
  ],
  workedExamples: [
    {
      title: "Laplace-Smoothed Document Classification",
      problem: "A text corpus contains 10 'Spam' emails and 20 'Ham' (not spam) emails. The word 'free' occurs 8 times in Spam and 1 time in Ham. Calculate the prior probabilities, and then use Laplace smoothing (with $\\alpha = 1$, vocabulary size $|V| = 1000$) to find the conditional probabilities $P(\\text{free} | \\text{Spam})$ and $P(\\text{free} | \\text{Ham})$.",
      solution: "First, find class priors:\n$$P(\\text{Spam}) = \\frac{10}{30} = \\frac{1}{3}, \\quad P(\\text{Ham}) = \\frac{20}{30} = \\frac{2}{3}$$\n\nApplying Laplace smoothing, let $N_c$ be the total word count in class $c$. Suppose Spam has $N_{\\text{Spam}} = 200$ total words and Ham has $N_{\\text{Ham}} = 400$ total words. The smoothed conditional probabilities are:\n$$P(\\text{free} | \\text{Spam}) = \\frac{\\text{count}(\\text{free}, \\text{Spam}) + 1}{N_{\\text{Spam}} + |V|} = \\frac{8 + 1}{200 + 1000} = \\frac{9}{1200} = 0.0075$$\n\n$$P(\\text{free} | \\text{Ham}) = \\frac{\\text{count}(\\text{free}, \\text{Ham}) + 1}{N_{\\text{Ham}} + |V|} = \\frac{1 + 1}{400 + 1000} = \\frac{2}{1400} \\approx 0.0014$$"
    }
  ],
  misconceptions: [
    {
      claim: "Naive Bayes requires features to be truly independent in the real world to perform well.",
      correction: "Even though features are rarely independent in reality (e.g. 'credit' and 'card' in spam), Naive Bayes often yields highly accurate classification decisions because the decision boundary (not the absolute probabilities) is what determines the final class assignment."
    },
    {
      claim: "If a feature is missing from a class in training data, the model will just treat its likelihood as very low.",
      correction: "Without smoothing, a zero-frequency count results in a likelihood of exactly 0. Because probabilities are multiplied together, a single zero likelihood will zero out the entire posterior probability, regardless of other evidence."
    }
  ],
  references: [
    {
      title: "Speech and Language Processing (3rd ed. draft)",
      authors: "Dan Jurafsky and James H. Martin",
      url: "https://web.stanford.edu/~jurafsky/slp3/",
      type: "textbook"
    },
    {
      title: "Machine Learning: A Probabilistic Perspective",
      authors: "Kevin P. Murphy",
      url: "https://probml.github.io/pml-book/book1.html",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: "High Feature Correlation",
      description: "When features are highly correlated (e.g. duplicate columns), Naive Bayes double-counts the evidence, causing class probabilities to polarize incorrectly toward 0 or 1.",
      mitigation: "Remove redundant or highly collinear features during feature selection."
    }
  ],
  pros: [
    "Extremely fast to train and predict; requires only a single pass through the dataset.",
    "Performs remarkably well on high-dimensional text classification (e.g. spam detection, sentiment analysis).",
    "Requires relatively small amounts of training data to estimate parameters."
  ],
  cons: [
    "Known to be a poor estimator; the output class probabilities are often poorly calibrated.",
    "The conditional independence assumption is fundamentally unrealistic for most natural datasets."
  ],
  intuition: "Imagine you're trying to guess if an email is spam based on the words it contains: 'win', 'lottery', and 'money'. Calculating the exact probability of these words appearing together in a specific sequence is difficult. So, you make a simplifying, 'naive' assumption: you pretend that words appear completely independently of each other. You look up how likely 'win' is in spam, how likely 'lottery' is, and how likely 'money' is, and simply multiply those probabilities together. Even though this independence assumption is technically wrong, the resulting guess is usually correct!",
  mathematics: "### Bayes' Theorem for Classification\n\nGiven a class variable $C$ and a feature vector $\\mathbf{x} = (x_1, \\dots, x_d)$, the posterior probability is:\n$$P(C | \\mathbf{x}) = \\frac{P(\\mathbf{x} | C) P(C)}{P(\\mathbf{x})}$$\n\nSince the denominator $P(\\mathbf{x})$ is constant for all classes, we focus on the numerator:\n$$P(C | \\mathbf{x}) \\propto P(\\mathbf{x} | C) P(C)$$\n\n### The Independence Assumption\n\nThe joint probability $P(\\mathbf{x} | C)$ is factored as the product of individual conditional probabilities:\n$$P(\\mathbf{x} | C) = P(x_1, \\dots, x_d | C) = \\prod_{j=1}^{d} P(x_j | C)$$\n\nThis yields the classification rule:\n$$\\hat{y} = \\arg\\max_{c} P(C=c) \\prod_{j=1}^{d} P(x_j | C=c)$$\n\n### Computation in Log-Space\n\nMultiplying many small probabilities can lead to numerical underflow. To prevent this, we calculate in log-space:\n$$\\hat{y} = \\arg\\max_{c} \\left( \\log P(C=c) + \\sum_{j=1}^{d} \\log P(x_j | C=c) \\right)$$\n\n### Laplace Smoothing (Additive Smoothing)\n\nFor categorical features, the conditional probability is smoothed by adding $\\alpha > 0$ (typically $\\alpha=1$):\n$$\\hat{P}(x_j = v | C=c) = \\frac{\\text{count}(x_j=v, C=c) + \\alpha}{\\text{count}(C=c) + \\alpha K_j}$$\nwhere $K_j$ is the number of unique values feature $j$ can take.",
  fullDescription: "Naive Bayes classifiers are a collection of classification algorithms based on Bayes' Theorem. It is not a single algorithm but a family of algorithms where all of them share a common principle: every pair of features being classified is independent of each other. Despite their simplistic assumptions, Naive Bayes classifiers work extremely well in many complex real-world situations, particularly in document classification and spam filtering.",
  codeSnippet: `/**
 * Simple Multinomial Naive Bayes Classifier for text tokens
 */
export class MultinomialNaiveBayes {
  private classPriors: Record<string, number> = {};
  private wordCounts: Record<string, Record<string, number>> = {};
  private totalWordCounts: Record<string, number> = {};
  private vocab: Set<string> = new Set();
  private classes: string[] = [];

  constructor(private alpha: number = 1.0) {}

  fit(docs: string[][], labels: string[]) {
    const numDocs = docs.length;
    const classCounts: Record<string, number> = {};

    // Count instances
    for (let i = 0; i < numDocs; i++) {
      const label = labels[i];
      const doc = docs[i];

      classCounts[label] = (classCounts[label] || 0) + 1;
      if (!this.wordCounts[label]) {
        this.wordCounts[label] = {};
        this.totalWordCounts[label] = 0;
      }

      doc.forEach(word => {
        this.vocab.add(word);
        this.wordCounts[label][word] = (this.wordCounts[label][word] || 0) + 1;
        this.totalWordCounts[label]++;
      });
    }

    this.classes = Object.keys(classCounts);
    this.classes.forEach(c => {
      this.classPriors[c] = classCounts[c] / numDocs;
    });
  }

  predict(doc: string[]): string {
    let bestClass = this.classes[0];
    let bestScore = -Infinity;
    const vocabSize = this.vocab.size;

    this.classes.forEach(c => {
      // Start score with prior probability in log-space
      let score = Math.log(this.classPriors[c]);
      const totalWords = this.totalWordCounts[c];

      doc.forEach(word => {
        // Only count words that were seen in the training vocabulary
        if (this.vocab.has(word)) {
          const count = this.wordCounts[c][word] || 0;
          // Apply Laplace smoothing
          const prob = (count + this.alpha) / (totalWords + this.alpha * vocabSize);
          score += Math.log(prob);
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestClass = c;
      }
    });

    return bestClass;
  }
}`,
  relatedModules: ["probability-theory", "bayesian-inference", "nlp"]
};
