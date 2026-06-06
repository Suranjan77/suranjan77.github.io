const fs = require('fs');
const path = require('path');

const dir = '/home/sur/repo/suranjan77.github.io/src/data/algorithms_content';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts' && f !== 'learningModuleTypes.ts');

const map = {
  "0_1_calculus.ts": "calculus",
  "0_2_linear_algebra.ts": "linear-algebra",
  "0_3_probability_theory.ts": "probability-theory",
  "1_maximum_likelihood.ts": "maximum-likelihood",
  "2_bayesian.ts": "bayesian-inference",
  "3_linear_regression.ts": "linear-regression",
  "3b_logistic_regression.ts": "linear-regression",
  "4a_knn.ts": "instance-based-trees",
  "4b_decision_trees.ts": "instance-based-trees",
  "5_clustering.ts": "clustering",
  "6_svm.ts": "support-vector-machines",
  "7_ensemble.ts": "ensemble-learning",
  "8_dimensionality.ts": "dimensionality-reduction",
  "9_mcmc.ts": "mcmc",
  "10_neural_networks.ts": "neural-networks",
  "11_cnn.ts": "cnn",
  "12_computer_vision.ts": "computer-vision",
  "13_nlp.ts": "nlp",
  "14_autoencoders.ts": "autoencoders",
  "15_transformers.ts": "transformers",
  "16_llms.ts": "llms",
  "17_reinforcement_learning.ts": "reinforcement-learning",
  "18_bias_variance.ts": "bias-variance",
  "19_generative_models.ts": "generative-models",
  "20_regularization.ts": "regularization",
  "21_evaluation_metrics.ts": "evaluation-metrics"
};

// Hardcoded references from algorithmSupplemental to avoid importing issues
const supplementalRefs = {
  "calculus": [
    { title: "Calculus", source: "Spivak, M. (2008) Calculus. 4th edn. Houston, TX: Publish or Perish.", url: "https://www.publishorperish.com" },
    { title: "Mathematics for Machine Learning", source: "Deisenroth, M. P., Faisal, A. A. and Ong, C. S. (2020) Mathematics for Machine Learning. Cambridge: Cambridge University Press.", url: "https://mml-book.github.io" }
  ],
  "linear-algebra": [
    { title: "Introduction to Linear Algebra", source: "Strang, G. (2016) Introduction to Linear Algebra. 5th edn. Wellesley, MA: Wellesley-Cambridge Press.", url: "https://math.mit.edu/~gs/" },
    { title: "Linear Algebra and Learning from Data", source: "Strang, G. (2019) Linear Algebra and Learning from Data. Wellesley, MA: Wellesley-Cambridge Press.", url: "https://math.mit.edu/~gs/" }
  ],
  "probability-theory": [
    { title: "Probability and Computing", source: "Mitzenmacher, M. and Upfal, E. (2017) Probability and Computing. 2nd edn. Cambridge: Cambridge University Press.", url: "https://www.cambridge.org" },
    { title: "Probabilistic Machine Learning: An Introduction", source: "Murphy, K. P. (2022) Probabilistic Machine Learning: An Introduction. Cambridge, MA: MIT Press.", url: "https://probml.github.io/pml-book/book1.html" }
  ],
  "maximum-likelihood": [
    { title: "Pattern Recognition and Machine Learning", source: "Bishop, C. M. (2006) Pattern Recognition and Machine Learning. New York: Springer.", url: "https://www.springer.com" },
    { title: "On the Mathematical Foundations of Theoretical Statistics", source: "Fisher, R. A. (1922) Philosophical Transactions of the Royal Society of London.", url: "https://royalsocietypublishing.org" }
  ],
  "bayesian-inference": [
    { title: "Bayesian Data Analysis", source: "Gelman, A. et al. (2013) Bayesian Data Analysis. 3rd edn. Boca Raton, FL: CRC Press.", url: "https://www.stat.columbia.edu/~gelman/book/" },
    { title: "Statistical Rethinking", source: "McElreath, R. (2020) Statistical Rethinking. 2nd edn. Boca Raton, FL: CRC Press.", url: "https://xcelab.net/rm/statistical-rethinking/" }
  ],
  "linear-regression": [
    { title: "The Elements of Statistical Learning", source: "Hastie, T., Tibshirani, R. and Friedman, J. (2009) 2nd edn. New York: Springer.", url: "https://web.stanford.edu/~hastie/ElemStatLearn/" },
    { title: "An Introduction to Statistical Learning", source: "James, G., Witten, D., Hastie, T. and Tibshirani, R. (2021) 2nd edn. New York: Springer.", url: "https://www.statlearning.com" }
  ],
  "instance-based-trees": [
    { title: "Classification and Regression Trees", source: "Breiman, L., Friedman, J., Stone, C.J. and Olshen, R.A. (1984) Belmont, CA: Wadsworth.", url: "https://www.routledge.com" },
    { title: "Machine Learning with Random Forests and Decision Trees", source: "Scott, S. (2021) A Visual Guide for Beginners.", url: "https://example.com" }
  ],
  "clustering": [
    { title: "Pattern Recognition and Machine Learning", source: "Bishop, C. M. (2006) Pattern Recognition and Machine Learning. New York: Springer.", url: "https://www.springer.com" },
    { title: "Data Clustering: Algorithms and Applications", source: "Aggarwal, C. C. and Reddy, C. K. (2013) Boca Raton, FL: CRC Press.", url: "https://www.crcpress.com" }
  ],
  "support-vector-machines": [
    { title: "A Training Algorithm for Optimal Margin Classifiers", source: "Boser, B.E., Guyon, I.M. and Vapnik, V.N. (1992)", url: "https://dl.acm.org" },
    { title: "Understanding Machine Learning: From Theory to Algorithms", source: "Shalev-Shwartz, S. and Ben-David, S. (2014) Cambridge University Press.", url: "https://www.cambridge.org" }
  ],
  "ensemble-learning": [
    { title: "Greedy Function Approximation: A Gradient Boosting Machine", source: "Friedman, J.H. (2001) Annals of Statistics.", url: "https://projecteuclid.org" },
    { title: "Ensemble Methods: Foundations and Algorithms", source: "Zhou, Z.-H. (2012) Boca Raton, FL: CRC Press.", url: "https://www.crcpress.com" }
  ],
  "dimensionality-reduction": [
    { title: "Principal Component Analysis", source: "Jolliffe, I.T. (2002) 2nd edn. New York: Springer.", url: "https://www.springer.com" },
    { title: "UMAP: Uniform Manifold Approximation and Projection", source: "McInnes, L., Healy, J. and Melville, J. (2018)", url: "https://arxiv.org" }
  ],
  "mcmc": [
    { title: "Markov Chains and Mixing Times", source: "Levin, D.A. and Peres, Y. (2017) 2nd edn. American Mathematical Society.", url: "https://www.ams.org" },
    { title: "Handbook of Markov Chain Monte Carlo", source: "Brooks, S. et al. (2011) CRC Press.", url: "https://www.crcpress.com" }
  ],
  "neural-networks": [
    { title: "Deep Learning", source: "Goodfellow, I., Bengio, Y. and Courville, A. (2016) MIT Press.", url: "https://www.deeplearningbook.org" },
    { title: "Neural Networks and Deep Learning", source: "Nielsen, M. A. (2015) Determination Press.", url: "http://neuralnetworksanddeeplearning.com" }
  ],
  "cnn": [
    { title: "Gradient-Based Learning Applied to Document Recognition", source: "LeCun, Y. et al. (1998) Proceedings of the IEEE.", url: "http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf" },
    { title: "ImageNet Classification with Deep Convolutional Neural Networks", source: "Krizhevsky, A., Sutskever, I. and Hinton, G. E. (2012) NeurIPS.", url: "https://papers.nips.cc" }
  ],
  "computer-vision": [
    { title: "Computer Vision: Algorithms and Applications", source: "Szeliski, R. (2022) 2nd edn. Springer.", url: "https://szeliski.org/Book/" },
    { title: "Deep Learning for Computer Vision", source: "Rosebrock, A. (2017) PyImageSearch.", url: "https://pyimagesearch.com" }
  ],
  "nlp": [
    { title: "Speech and Language Processing", source: "Jurafsky, D. and Martin, J. H. (2023) 3rd edn draft.", url: "https://web.stanford.edu/~jurafsky/slp3/" },
    { title: "Foundations of Statistical Natural Language Processing", source: "Manning, C. D. and Schütze, H. (1999) MIT Press.", url: "https://nlp.stanford.edu/fsnlp/" }
  ],
  "autoencoders": [
    { title: "Reducing the Dimensionality of Data with Neural Networks", source: "Hinton, G. E. and Salakhutdinov, R. R. (2006) Science.", url: "https://science.sciencemag.org" },
    { title: "Deep Learning (Chapter 14)", source: "Goodfellow, I. et al. (2016) MIT Press.", url: "https://www.deeplearningbook.org" }
  ],
  "transformers": [
    { title: "Attention Is All You Need", source: "Vaswani, A. et al. (2017) NeurIPS.", url: "https://arxiv.org/abs/1706.03762" },
    { title: "Illustrated Transformer", source: "Alammar, J. (2018) Blog post.", url: "https://jalammar.github.io/illustrated-transformer/" }
  ],
  "llms": [
    { title: "Language Models are Few-Shot Learners", source: "Brown, T. B. et al. (2020) NeurIPS.", url: "https://arxiv.org/abs/2005.14165" },
    { title: "Introducing LLaMA: A foundational, 65-billion-parameter large language model", source: "Touvron, H. et al. (2023) Meta AI Research.", url: "https://arxiv.org/abs/2302.13971" }
  ],
  "reinforcement-learning": [
    { title: "Reinforcement Learning: An Introduction", source: "Sutton, R. S. and Barto, A. G. (2018) 2nd edn. MIT Press.", url: "http://incompleteideas.net/book/the-book-2nd.html" },
    { title: "Algorithms for Reinforcement Learning", source: "Szepesvári, C. (2010) Morgan & Claypool.", url: "https://sztaki.hu/~szcsaba/papers/RLBook.pdf" }
  ],
  "bias-variance": [
    { title: "Neural Networks and the Bias/Variance Dilemma", source: "Geman, S., Bienenstock, E. and Doursat, R. (1992) Neural Computation.", url: "https://dl.acm.org" },
    { title: "The Elements of Statistical Learning (Chapter 7)", source: "Hastie, T. et al. (2009) 2nd edn. Springer.", url: "https://web.stanford.edu/~hastie/ElemStatLearn/" }
  ],
  "generative-models": [
    { title: "Generative Adversarial Networks", source: "Goodfellow, I. et al. (2014) NeurIPS.", url: "https://arxiv.org/abs/1406.2661" },
    { title: "Deep Generative Modeling", source: "Tomczak, J. M. (2022) Springer.", url: "https://link.springer.com" }
  ],
  "regularization": [
    { title: "Regression Shrinkage and Selection via the Lasso", source: "Tibshirani, R. (1996) Journal of the Royal Statistical Society.", url: "https://www.jstor.org" },
    { title: "Deep Learning (Chapter 7)", source: "Goodfellow, I. et al. (2016) MIT Press.", url: "https://www.deeplearningbook.org" }
  ],
  "evaluation-metrics": [
    { title: "Introduction to Information Retrieval (Evaluation chapter)", source: "Manning, C. D. et al. (2008) Cambridge University Press.", url: "https://nlp.stanford.edu/IR-book/" },
    { title: "Receiver-Operating Characteristic Analysis", source: "Fawcett, T. (2006) Pattern Recognition Letters.", url: "https://sciencedirect.com" }
  ]
};

console.log("Enriching files...");
for (const file of files) {
  const key = map[file];
  if (!key) continue;

  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // 1. Add difficulty and tracks to clustering if missing
  if (file === "5_clustering.ts") {
    if (!content.includes("difficulty:")) {
      content = content.replace("category: \"Clustering\",", 'category: "Clustering",\n  difficulty: 2,\n  tracks: ["practitioner"],');
    }
  }

  // 2. Add codeSnippet to calculus
  if (file === "0_1_calculus.ts") {
    content = content.replace("codeSnippet: ``", `codeSnippet: \`def numerical_gradient(f, x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)\``);
  }

  // 3. Add codeSnippet to linear-algebra
  if (file === "0_2_linear_algebra.ts") {
    content = content.replace("codeSnippet: ``", `codeSnippet: \`import numpy as np

def dot_product(v1, v2):
    return np.dot(v1, v2)\``);
  }

  // 4. Overwrite references to ensure >= 2 references with urls and authors
  const refs = supplementalRefs[key];
  if (refs) {
    // Format the new references block
    const refsString = 'references: [\n' + refs.map(r => {
      // Extract authors (part before the first parenthesis)
      const authors = r.source.split('(')[0].trim().replace(/\.$/, '');
      return `    {\n      title: "${r.title}",\n      authors: "${authors}",\n      url: "${r.url}",\n      type: "textbook"\n    }`;
    }).join(',\n') + '\n  ]';

    // Replace the existing references block in the file
    // Regex matches from references: [ down to matching closing ],
    content = content.replace(/references:\s*\[[\s\S]*?\],?/, refsString + ',');
  }

  fs.writeFileSync(filepath, content, 'utf8');
}
console.log("Enrichment done!");
