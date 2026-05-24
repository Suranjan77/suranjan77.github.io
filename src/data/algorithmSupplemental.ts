export interface AlgorithmSupplemental {
  whenToUse: string[];
  assumptions: string[];
  references: {
    title: string;
    url?: string;
    source: string;
  }[];
}

export const algorithmSupplemental: Record<string, AlgorithmSupplemental> = {
  "calculus": {
    whenToUse: [
      "When training models using Gradient Descent or backpropagation.",
      "To rigorously define optimization goals and verify convergence behavior analytically."
    ],
    assumptions: [
      "The loss function is continuous and differentiable over the parameter space.",
      "The learning rate is chosen appropriately to avoid overshooting the minimum."
    ],
    references: [
      {
        title: "Calculus",
        source: "Spivak, M. (2008) Calculus. 4th edn. Houston, TX: Publish or Perish."
      }
,
      {
        title: "Mathematics for Machine Learning",
        source: "Deisenroth, M. P., Faisal, A. A. and Ong, C. S. (2020) Mathematics for Machine Learning. Cambridge: Cambridge University Press."
      }
    ]
  },
  "linear-algebra": {
    whenToUse: [
      "When representing and processing highly-dimensional datasets.",
      "To optimize operations efficiently using vectorized implementations targeting GPUs."
    ],
    assumptions: [
      "Data operations can be cleanly represented as rigid linear combinations.",
      "Features are structured in uniform, evenly bounded matrix dimensions."
    ],
    references: [
      {
        title: "Introduction to Linear Algebra",
        source: "Strang, G. (2016) Introduction to Linear Algebra. 5th edn. Wellesley, MA: Wellesley-Cambridge Press."
      }
,
      {
        title: "Linear Algebra and Learning from Data",
        source: "Strang, G. (2019) Linear Algebra and Learning from Data. Wellesley, MA: Wellesley-Cambridge Press."
      }
    ]
  },
  "probability-theory": {
    whenToUse: [
      "To quantify uncertainty fundamentally in probabilistic predictions.",
      "To rigorously model noise boundaries implicitly present in the dataset."
    ],
    assumptions: [
      "Data generation follows specific abstract distributions perfectly.",
      "Events have quantifiable chances that rely on prior cleanly specified bounds."
    ],
    references: [
      {
        title: "Probability and Computing",
        source: "Mitzenmacher, M. and Upfal, E. (2017) Probability and Computing: Randomization and Probabilistic Techniques in Algorithms and Data Analysis. 2nd edn. Cambridge: Cambridge University Press."
      }
,
      {
        title: "Probabilistic Machine Learning: An Introduction",
        source: "Murphy, K. P. (2022) Probabilistic Machine Learning: An Introduction. Cambridge, MA: MIT Press."
      }
    ]
  },
  "maximum-likelihood": {
    whenToUse: [
      "When you can describe the data-generating process with a parameterized probability model.",
      "To derive losses from distributional assumptions, such as squared error from Gaussian noise."
    ],
    assumptions: [
      "The samples are independent and identically distributed, or the dependence structure is modeled explicitly.",
      "The chosen probability family is a reasonable approximation to the true process.",
      "The likelihood surface can be optimized reliably enough for the application."
    ],
    references: [
      {
        title: "Pattern Recognition and Machine Learning",
        source: "Bishop, C. M. (2006) Pattern Recognition and Machine Learning. New York: Springer."
      },
      {
        title: "On the Mathematical Foundations of Theoretical Statistics",
        source: "Fisher, R. A. (1922) 'On the mathematical foundations of theoretical statistics', Philosophical Transactions of the Royal Society of London. Series A, 222(594-604), pp. 309-368."
      }
,
      {
        title: "Computer Age Statistical Inference",
        source: "Efron, B. and Hastie, T. (2016) Computer Age Statistical Inference. Cambridge: Cambridge University Press."
      }
    ]
  },
  "bayesian-inference": {
    whenToUse: [
      "When data is scarce, expensive, or noisy and prior knowledge should be included.",
      "When uncertainty estimates such as posterior intervals matter more than a single point estimate.",
      "When decisions must be updated as evidence arrives."
    ],
    assumptions: [
      "The prior represents defensible domain knowledge or a transparent modeling choice.",
      "The likelihood captures the relevant noise and sampling process."
    ],
    references: [
      {
        title: "Bayesian Data Analysis",
        source: "Gelman, A., Carlin, J.B., Stern, H.S., Dunson, D.B., Vehtari, A. and Rubin, D.B. (2013) Bayesian Data Analysis. 3rd edn. Boca Raton, FL: CRC Press."
      }
,
      {
        title: "Statistical Rethinking",
        source: "McElreath, R. (2020) Statistical Rethinking: A Bayesian Course with Examples in R and Stan. 2nd edn. Boca Raton, FL: CRC Press."
      }
    ]
  },
  "linear-regression": {
    whenToUse: [
      "Analyzing quantitative relationships between features and a continuous target.",
      "Building a fast, interpretable baseline before trying more complex models."
    ],
    assumptions: [
      "The conditional mean of the target is approximately linear in the features.",
      "Residual variance is roughly constant across the prediction range.",
      "Residuals are not strongly correlated after accounting for the features."
    ],
    references: [
      {
        title: "Elements of Statistical Learning",
        source: "Hastie, T., Tibshirani, R. and Friedman, J. (2009) The Elements of Statistical Learning: Data Mining, Inference, and Prediction. 2nd edn. New York: Springer."
      }
,
      {
        title: "An Introduction to Statistical Learning",
        source: "James, G., Witten, D., Hastie, T. and Tibshirani, R. (2021) An Introduction to Statistical Learning: with Applications in R. 2nd edn. New York: Springer."
      }
    ]
  },
  "instance-based-trees": {
    whenToUse: [
      "When nonlinear boundaries or feature interactions are important.",
      "When local similarity, rule-based explanations, or tabular decision paths are useful."
    ],
    assumptions: [
      "Decision trees assume useful partitions can be built from feature thresholds.",
      "KNN assumes nearby points under the chosen distance metric tend to share labels or targets."
    ],
    references: [
      {
        title: "Classification and Regression Trees",
        source: "Breiman, L., Friedman, J., Stone, C.J. and Olshen, R.A. (1984) Classification and Regression Trees. Belmont, CA: Wadsworth International Group."
      }
,
      {
        title: "Machine Learning with Random Forests and Decision Trees",
        source: "Scott, S. (2021) Machine Learning with Random Forests and Decision Trees: A Visual Guide for Beginners. Independently published."
      }
    ]
  },
  "clustering": {
    whenToUse: [
      "Discovering unknown groups or segments in unlabeled data.",
      "Summarizing large datasets with centroids, mixture components, or anomaly scores."
    ],
    assumptions: [
      "K-Means works best when clusters are compact and roughly spherical.",
      "GMMs assume clusters can be approximated by a mixture of Gaussian distributions."
    ],
    references: [
      {
        title: "Pattern Recognition and Machine Learning",
        source: "Bishop, C. M. (2006) Pattern Recognition and Machine Learning. New York: Springer."
      }
,
      {
        title: "Data Clustering: Algorithms and Applications",
        source: "Aggarwal, C. C. and Reddy, C. K. (2013) Data Clustering: Algorithms and Applications. Boca Raton, FL: CRC Press."
      }
    ]
  },
  "support-vector-machines": {
    whenToUse: [
      "Training high-margin classifiers on small to medium-sized datasets.",
      "Using kernels when pairwise similarities capture useful nonlinear structure."
    ],
    assumptions: [
      "Features are scaled so distances and dot products are meaningful.",
      "The selected kernel and regularization parameter match the data geometry."
    ],
    references: [
      {
        title: "A Training Algorithm for Optimal Margin Classifiers",
        source: "Boser, B.E., Guyon, I.M. and Vapnik, V.N. (1992) 'A training algorithm for optimal margin classifiers', in Proceedings of the fifth annual workshop on Computational learning theory. Pittsburgh, Pennsylvania: ACM, pp. 144-152."
      }
,
      {
        title: "Understanding Machine Learning: From Theory to Algorithms",
        source: "Shalev-Shwartz, S. and Ben-David, S. (2014) Understanding Machine Learning: From Theory to Algorithms. Cambridge: Cambridge University Press."
      }
    ]
  },
  "ensemble-learning": {
    whenToUse: [
      "Improving predictive performance on structured or tabular data.",
      "Reducing variance by averaging models or reducing bias with boosting."
    ],
    assumptions: [
      "Base learners make errors that are not perfectly identical.",
      "Validation data is representative enough to tune ensemble size and complexity."
    ],
    references: [
      {
        title: "Gradient Boosting Machine",
        source: "Friedman, J.H. (2001) 'Greedy function approximation: a gradient boosting machine', Annals of Statistics, 29(5), pp. 1189-1232."
      }
,
      {
        title: "Ensemble Methods: Foundations and Algorithms",
        source: "Zhou, Z.-H. (2012) Ensemble Methods: Foundations and Algorithms. Boca Raton, FL: CRC Press."
      }
    ]
  },
  "dimensionality-reduction": {
    whenToUse: [
      "Compressing high-dimensional features for visualization, denoising, or faster modeling.",
      "Finding lower-dimensional structure before clustering or downstream prediction."
    ],
    assumptions: [
      "For PCA, the most useful structure is captured by directions of high variance.",
      "Features are scaled appropriately before variance-based projection."
    ],
    references: [
      {
        title: "Principal Component Analysis",
        source: "Jolliffe, I.T. (2002) Principal Component Analysis. 2nd edn. New York: Springer."
      }
,
      {
        title: "UMAP: Uniform Manifold Approximation and Projection",
        source: "McInnes, L., Healy, J. and Melville, J. (2018) 'UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction', arXiv preprint arXiv:1802.03426."
      }
    ]
  },
  "mcmc": {
    whenToUse: [
      "Approximating posterior distributions that cannot be integrated analytically.",
      "Estimating expectations under complex probabilistic models."
    ],
    assumptions: [
      "The Markov chain has the intended stationary distribution.",
      "The chain mixes well enough that collected samples represent the target distribution."
    ],
    references: [
      {
        title: "Markov Chain Monte Carlo in Practice",
        source: "Gilks, W.R., Richardson, S. and Spiegelhalter, D. (1996) Markov Chain Monte Carlo in Practice. Boca Raton, FL: Chapman and Hall/CRC."
      }
,
      {
        title: "Handbook of Markov Chain Monte Carlo",
        source: "Brooks, S., Gelman, A., Jones, G. L. and Meng, X.-L. (eds) (2011) Handbook of Markov Chain Monte Carlo. Boca Raton, FL: CRC Press."
      }
    ]
  },
  "neural-networks": {
    whenToUse: [
      "Solving complex non-linear classification and regression tasks.",
      "Building highly parameterized representation learning models on raw data."
    ],
    assumptions: [
      "A sufficiently large, representative training dataset is available to avoid overfitting.",
      "Optimization via gradient descent converges to a satisfactory local minimum."
    ],
    references: [
      {
        title: "Deep Learning",
        source: "Goodfellow, I., Bengio, Y. and Courville, A. (2016) Deep Learning. Cambridge, MA: MIT Press."
      }
,
      {
        title: "Dive into Deep Learning",
        source: "Zhang, A., Lipton, Z. C., Li, M. and Smola, A. J. (2023) Dive into Deep Learning. Cambridge: Cambridge University Press."
      }
    ]
  },
  "cnn": {
    whenToUse: [
      "Processing spatial grid data like images, medical scans, or video frames.",
      "Detecting local spatial patterns and features regardless of location."
    ],
    assumptions: [
      "The input dataset has local spatial relationships (neighboring pixels are related).",
      "Features are translation invariant across the grid space."
    ],
    references: [
      {
        title: "Gradient-Based Learning Applied to Document Recognition",
        source: "LeCun, Y., Bottou, L., Bengio, Y. and Haffner, P. (1998) 'Gradient-based learning applied to document recognition', Proceedings of the IEEE, 86(11), pp. 2278-2324."
      }
,
      {
        title: "Deep Learning for Vision Systems",
        source: "Elgendy, M. (2020) Deep Learning for Vision Systems. Shelter Island, NY: Manning Publications."
      }
    ]
  },
  "computer-vision": {
    whenToUse: [
      "Detecting, locating, and drawing bounding boxes around objects in images.",
      "Segmenting visual scenes down to individual pixel labels."
    ],
    assumptions: [
      "Camera resolutions and inputs remain within training domain distributions.",
      "Bounding box labels accurately bound semantic targets."
    ],
    references: [
      {
        title: "You Only Look Once: Unified, Real-Time Object Detection",
        source: "Redmon, J., Divvala, S., Girshick, R. and Farhadi, A. (2016) 'You only look once: Unified, real-time object detection', in IEEE Conference on Computer Vision and Pattern Recognition (CVPR)."
      }
,
      {
        title: "Computer Vision: Algorithms and Applications",
        source: "Szeliski, R. (2022) Computer Vision: Algorithms and Applications. 2nd edn. New York: Springer."
      }
    ]
  },
  "nlp": {
    whenToUse: [
      "Analyzing semantic similarity or sentiment of texts, comments, or documents.",
      "Translating, summarizing, or parsing natural language passages."
    ],
    assumptions: [
      "Text can be tokenized into discrete lexical units.",
      "Semantic similarity correlates with proximity in a continuous vector space."
    ],
    references: [
      {
        title: "Speech and Language Processing",
        source: "Jurafsky, D. and Martin, J. H. (2023) Speech and Language Processing. 3rd edn. Draft available online."
      }
,
      {
        title: "Natural Language Processing with Transformers",
        source: "Tunstall, L., von Werra, L. and Wolf, T. (2022) Natural Language Processing with Transformers. Sebastopol, CA: O'Reilly Media."
      }
    ]
  },
  "autoencoders": {
    whenToUse: [
      "Compressing complex data vectors into compact representations.",
      "Denoising signals or detecting anomalies in data."
    ],
    assumptions: [
      "The input data resides on a lower-dimensional manifold in high-dimensional space.",
      "A bottleneck capacity restricts the network from copying inputs."
    ],
    references: [
      {
        title: "Reducing the Dimensionality of Data with Neural Networks",
        source: "Hinton, G. E. and Salakhutdinov, R. R. (2006) 'Reducing the dimensionality of data with neural networks', Science, 313(5786), pp. 504-507."
      }
,
      {
        title: "Representation Learning: A Review and New Perspectives",
        source: "Bengio, Y., Courville, A. and Vincent, P. (2013) 'Representation learning: a review and new perspectives', IEEE Transactions on Pattern Analysis and Machine Intelligence, 35(8), pp. 1798-1828."
      }
    ]
  },
  "transformers": {
    whenToUse: [
      "Processing long sequences with dynamic, context-dependent relationships.",
      "Training large language models or sequence encoders in parallel."
    ],
    assumptions: [
      "Contextual relationships can be represented as scaled dot-product attention weights.",
      "Sequence token order is encoded via positional variables."
    ],
    references: [
      {
        title: "Attention Is All You Need",
        source: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A.N., Kaiser, L. and Polosukhin, I. (2017) 'Attention is all you need', in Advances in Neural Information Processing Systems (NeurIPS), pp. 5998-6008."
      }
,
      {
        title: "Formal Algorithms for Transformers",
        source: "Phuong, M. and Kraus, D. (2022) 'Formal Algorithms for Transformers', arXiv preprint arXiv:2207.09238."
      }
    ]
  },
  "llms": {
    whenToUse: [
      "Generating fluent human-like text, explanations, or code fragments.",
      "Few-shot or zero-shot solving of complex language problems."
    ],
    assumptions: [
      "Autoregressive next-token prediction simulates coherent thinking trajectories.",
      "Temperature settings properly scale token logits to prevent repetitive loops."
    ],
    references: [
      {
        title: "Language Models are Few-Shot Learners",
        source: "Brown, T. B. et al. (2020) 'Language models are few-shot learners', in Advances in Neural Information Processing Systems (NeurIPS)."
      }
,
      {
        title: "Sparks of Artificial General Intelligence: Early experiments with GPT-4",
        source: "Bubeck, S. et al. (2023) 'Sparks of Artificial General Intelligence: Early experiments with GPT-4', arXiv preprint arXiv:2303.12712."
      }
    ]
  },
  "reinforcement-learning": {
    whenToUse: [
      "When an agent must learn optimal sequences of actions in dynamic environments without labeled training datasets.",
      "In navigation, control theory, robotics, and game-playing applications."
    ],
    assumptions: [
      "The environment states satisfy the Markov property (the next state depends only on the current state and action).",
      "Rewards are defined appropriately to incentivize the target final behavior without encouraging exploit loops."
    ],
    references: [
      {
        title: "Reinforcement Learning: An Introduction",
        source: "Sutton, R. S. and Barto, A. G. (2018) Reinforcement Learning: An Introduction. 2nd edn. Cambridge, MA: MIT Press."
      }
,
      {
        title: "Deep Reinforcement Learning Hands-On",
        source: "Lapan, M. (2020) Deep Reinforcement Learning Hands-On. 2nd edn. Birmingham: Packt Publishing."
      }
    ]
  },
  "bias-variance": {
    whenToUse: [
      "When debugging model prediction performance (diagnosing high train error vs high validation error).",
      "Selecting the appropriate feature dimensions or model capacity for a dataset."
    ],
    assumptions: [
      "The training and test sets are sampled from the identical underlying probability distribution.",
      "The irreducible noise floor is stationary and independent of model parameters."
    ],
    references: [
      {
        title: "The Elements of Statistical Learning",
        source: "Hastie, T., Tibshirani, R. and Friedman, J. (2009) The Elements of Statistical Learning. 2nd edn. New York: Springer."
      }
,
      {
        title: "Machine Learning Yearning",
        source: "Ng, A. (2018) Machine Learning Yearning. Draft available online."
      }
    ]
  },
  "generative-models": {
    whenToUse: [
      "When you need to generate high-fidelity synthetic images, audio, or textures.",
      "In data augmentation, super-resolution translation, and style transfer applications."
    ],
    assumptions: [
      "The training dataset contains sufficient samples to represent the underlying manifold geometry.",
      "Training dynamics can be stabilized enough that the generator improves instead of collapsing to a few modes."
    ],
    references: [
      {
        title: "Generative Adversarial Nets",
        source: "Goodfellow, I. et al. (2014) 'Generative adversarial nets', in Advances in Neural Information Processing Systems (NeurIPS), pp. 2672-2680."
      }
,
      {
        title: "Generative Deep Learning",
        source: "Foster, D. (2023) Generative Deep Learning: Teaching Machines to Paint, Write, Compose, and Play. 2nd edn. Sebastopol, CA: O'Reilly Media."
      }
    ]
  },
  "regularization": {
    whenToUse: [
      "When training models on high-dimensional data where the number of features exceeds the sample size.",
      "To improve generalization bounds and reduce variance in regression/classification."
    ],
    assumptions: [
      "Features are normalized or scaled before fitting to ensure regularizers penalize parameters equally.",
      "In L1 Lasso, the underlying true model is sparse (most weights are zero)."
    ],
    references: [
      {
        title: "Regression Shrinkage and Selection via the Lasso",
        source: "Tibshirani, R. (1996) 'Regression shrinkage and selection via the lasso', Journal of the Royal Statistical Society: Series B (Methodological), 58(1), pp. 267-288."
      }
,
      {
        title: "Statistical Learning with Sparsity",
        source: "Hastie, T., Tibshirani, R. and Wainwright, M. (2015) Statistical Learning with Sparsity: The Lasso and Generalizations. Boca Raton, FL: CRC Press."
      }
    ]
  },
  "evaluation-metrics": {
    whenToUse: [
      "When assessing binary classification models on heavily imbalanced datasets.",
      "When comparing the performance of classifiers independently of specific decision thresholds."
    ],
    assumptions: [
      "Validation samples are representative of the population where the model will be used.",
      "The decision threshold is chosen from the costs of false positives and false negatives."
    ],
    references: [
      {
        title: "Introduction to ROC Analysis",
        source: "Fawcett, T. (2006) 'An introduction to ROC analysis', Pattern Recognition Letters, 27(8), pp. 861-874."
      }
,
      {
        title: "Evaluating Machine Learning Models",
        source: "Zheng, A. (2015) Evaluating Machine Learning Models. Sebastopol, CA: O'Reilly Media."
      }
    ]
  }
};
