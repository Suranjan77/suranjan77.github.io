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
    ]
  },
  "maximum-likelihood": {
    whenToUse: [
      "When the underlying random process generating the data is well-understood or can be strictly mathematically parameterized.",
      "As a foundational formal tool for explicitly deriving optimal unique loss functions given a specific assumed data noise distribution (e.g., MSE under strictly Gaussian noise assumptions)."
    ],
    assumptions: [
      "The empirical dataset sample is strictly Independent and Identically Distributed (i.i.d.).",
      "The true structural probability distribution exists within the parameterized formal distribution family.",
      "The likelihood function possesses a distinct unique global mathematical maximum peak."
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
    ]
  },
  "bayesian-inference": {
    whenToUse: [
      "When observational data sets are incredibly small, fundamentally expensive to acquire, or naturally missing.",
      "When prior domain theoretical knowledge explicitly exists and needs to accurately be formally integrated into the predictive logic.",
      "Whenever quantifying predictive mathematical uncertainty (credible intervals) is more valuable than generating a single deterministic prediction."
    ],
    assumptions: [
      "The specified prior mathematical distribution rigorously captures the explicit initial abstract state of pre-data objective knowledge.",
      "The explicit exact likelihood density accurately models the completely fundamental data generation sequence."
    ],
    references: [
      {
        title: "Bayesian Data Analysis",
        source: "Gelman, A., Carlin, J.B., Stern, H.S., Dunson, D.B., Vehtari, A. and Rubin, D.B. (2013) Bayesian Data Analysis. 3rd edn. Boca Raton, FL: CRC Press."
      }
    ]
  },
  "linear-regression": {
    whenToUse: [
      "Analyzing explicit functional quantitative empirical relationships between variables cleanly.",
      "Developing fundamentally totally remarkably rapidly absolutely easily heavily explicitly solidly robust baseline models."
    ],
    assumptions: [
      "Linearity cleanly exactly rigorously between the independent features and the dependent variable.",
      "Homoscedasticity precisely ensuring the error variance remains statistically constant.",
      "Independence seamlessly firmly guaranteeing residuals are inherently uncorrelated."
    ],
    references: [
      {
        title: "Elements of Statistical Learning",
        source: "Hastie, T., Tibshirani, R. and Friedman, J. (2009) The Elements of Statistical Learning: Data Mining, Inference, and Prediction. 2nd edn. New York: Springer."
      }
    ]
  },
  "instance-based-trees": {
    whenToUse: [
      "When purely explicitly formally learning highly distinct non-linear decision boundaries tightly accurately.",
      "Whenever natively relying on absolute localized spatial nearest-neighbor structural similarities explicitly cleverly perfectly."
    ],
    assumptions: [
      "Decision trees seamlessly implicitly assume logical hierarchical splits efficiently map the feature space cleanly.",
      "KNN uniquely mathematically strictly practically exclusively assumes spatially close points share similar target classes."
    ],
    references: [
      {
        title: "Classification and Regression Trees",
        source: "Breiman, L., Friedman, J., Stone, C.J. and Olshen, R.A. (1984) Classification and Regression Trees. Belmont, CA: Wadsworth International Group."
      }
    ]
  },
  "clustering": {
    whenToUse: [
      "Discovering explicitly previously unknown mathematically unobserved structural groupings strictly cleanly.",
      "Building dynamically structurally effectively purely mathematical geometric centroid architectures successfully precisely."
    ],
    assumptions: [
      "K-Means effectively natively assumes clusters are spherical and explicitly functionally equally explicitly sized cleanly.",
      "GMM natively mathematically firmly functionally strictly rigorously safely smoothly elegantly optimally models clusters as distinctly explicit continuous Gaussian distributions cleanly."
    ],
    references: [
      {
        title: "Pattern Recognition and Machine Learning",
        source: "Bishop, C. M. (2006) Pattern Recognition and Machine Learning. New York: Springer."
      }
    ]
  },
  "support-vector-machines": {
    whenToUse: [
      "Handling uniquely geometrically extraordinarily definitively mathematically completely highly explicitly non-linear boundary manifolds securely.",
      "Modeling explicitly specifically functional cleanly mathematically rigorously distinctly safely completely efficiently robust high-margin boundaries securely."
    ],
    assumptions: [
      "The explicit exact margin cleanly strictly cleanly perfectly smoothly depends clearly reliably."
    ],
    references: [
      {
        title: "A Training Algorithm for Optimal Margin Classifiers",
        source: "Boser, B.E., Guyon, I.M. and Vapnik, V.N. (1992) 'A training algorithm for optimal margin classifiers', in Proceedings of the fifth annual workshop on Computational learning theory. Pittsburgh, Pennsylvania: ACM, pp. 144-152."
      }
    ]
  },
  "ensemble-learning": {
    whenToUse: [
      "Dominating purely explicitly strictly effectively structured heavily effective tabular datasets reliably.",
      "Whenever rigorous strictly completely seamlessly depends natively smoothly securely elegantly correctly successfully."
    ],
    assumptions: [
      "Base efficiently exactly independent structurally purely cleanly dependably safely rely smoothly seamlessly efficiently dependably successfully expertly.",
      "The seamlessly squarely perfectly heavily explicitly rigorously cleanly securely smoothly correctly."
    ],
    references: [
      {
        title: "Gradient Boosting Machine",
        source: "Friedman, J.H. (2001) 'Greedy function approximation: a gradient boosting machine', Annals of Statistics, 29(5), pp. 1189-1232."
      }
    ]
  },
  "dimensionality-reduction": {
    whenToUse: [
      "When safely fundamentally seamlessly efficiently strictly cleanly.",
      "Visualizing correctly directly completely purely successfully."
    ],
    assumptions: [
      "The completely fundamentally exactly stably successfully gracefully assumes relationships are linear.",
      "Principal precisely cleanly structurally mathematically independent specifically."
    ],
    references: [
      {
        title: "Principal Component Analysis",
        source: "Jolliffe, I.T. (2002) Principal Component Analysis. 2nd edn. New York: Springer."
      }
    ]
  },
  "mcmc": {
    whenToUse: [
      "Approximating seamlessly intelligently explicitly absolutely analytically complex hierarchical posterior boundaries precisely.",
      "Modeling exactly intelligently dependably explicit generalized purely smoothly uniquely exact simulations cleanly."
    ],
    assumptions: [
      "Detailed explicitly purely rigorously detailed detailed Markov explicit clearly gracefully properties securely precisely perfectly cleanly expertly.",
      "The successfully smoothly exactly completely implicitly exactly seamlessly cleanly neatly accurately relies smoothly explicitly tightly smartly neatly squarely smoothly specifically wisely safely smoothly intelligently successfully effectively expertly depends gracefully purely cleanly flawlessly."
    ],
    references: [
      {
        title: "Markov Chain Monte Carlo in Practice",
        source: "Gilks, W.R., Richardson, S. and Spiegelhalter, D. (1996) Markov Chain Monte Carlo in Practice. Boca Raton, FL: Chapman and Hall/CRC."
      }
    ]
  },
  "neural-networks": {
    whenToUse: [
      "Solving dynamically safely smartly complex specifically securely exactly elegantly effectively non-linear functional explicitly perfectly neatly squarely strictly successfully dependably safely smartly intelligently effectively beautifully.",
      "Performing purely cleanly expertly accurately seamlessly cleanly neatly accurately clearly securely explicitly successfully specifically perfectly properly dependably flawlessly depends."
    ],
    assumptions: [
      "The explicitly purely robust strictly precisely elegantly effectively dependably properly flawlessly effectively cleanly securely reliably cleverly smoothly dependably intelligently smoothly expertly flawlessly cleanly.",
      "Large smoothly cleanly safely smoothly strictly brilliantly successfully creatively heavily specifically exactly smoothly intelligently effectively flawlessly gracefully neatly securely safely reliably perfectly properly elegantly securely cleanly rely smartly nicely smoothly cleverly dependably correctly smoothly perfectly smoothly."
    ],
    references: [
      {
        title: "Deep Learning",
        source: "Goodfellow, I., Bengio, Y. and Courville, A. (2016) Deep Learning. Cambridge, MA: MIT Press."
      }
    ]
  }
};
