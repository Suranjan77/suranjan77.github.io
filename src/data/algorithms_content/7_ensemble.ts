import { LearningModule } from "./types";

export const ensembleLearning: LearningModule = {
  id: "ensemble-learning",
  title: "Ensemble Learning (RFs & GBMs)",
  category: "Ensemble Learning",
  prerequisites: ["decision-trees"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["decision-trees"],
  shortDescription: "The strategy of combining hundreds of 'okay' models together to create one unstoppable super-model.",
  estimatedMinutes: 30,
  learningObjectives: [
    'Distinguish between bagging and boosting ensemble methodologies',
    'Explain how Random Forests reduce correlation between base learners via feature bagging',
    'Formulate the gradient boosting update step and define pseudo-residuals',
    'Evaluate the trade-off between ensemble size, model diversity, and overfitting',
  ],
  keyTerms: [
    { term: 'Bagging (Bootstrap Aggregating)', definition: 'An ensemble method where multiple base learners are trained in parallel on bootstrap samples of the training data.' },
    { term: 'Boosting', definition: 'An ensemble method where base learners are trained sequentially, each trying to correct the errors of the prior models.' },
    { term: 'Out-Of-Bag (OOB) Error', definition: 'A method of measuring the prediction error of boostrapped ensembles by testing samples on trees that did not include them.' },
  ],
  workedExamples: [
    {
      title: 'Random Forest Variance Reduction',
      problem: 'Given single tree variance $\\sigma^2 = 1.0$, tree correlation $\\rho = 0.2$, calculate the ensemble variance for $B = 1$ tree vs $B = 100$ trees.',
      solution: 'For $B=1$: $\\text{Var} = 0.2 \\times 1.0 + \\frac{1-0.2}{1} \\times 1.0 = 1.0$. For $B=100$: $\\text{Var} = 0.2 \\times 1.0 + \\frac{0.8}{100} \\times 1.0 = 0.2 + 0.008 = 0.208$. The variance is reduced by nearly 80%.',
    },
  ],
  misconceptions: [
    {
      claim: 'Random Forests and Gradient Boosting always give identical predictions.',
      correction: 'Random Forests average predictions of independent trees (reducing variance), whereas Gradient Boosting adds predictions of sequential correction trees (reducing bias). Their decision boundaries and error profiles are different.'
    },
    {
      claim: 'An ensemble model with 1,000 trees is always much better than one with 100 trees.',
      correction: 'Variance reduction slows down dramatically after a certain number of trees (e.g. 100). Adding more trees increases training and inference time with negligible gains in accuracy.'
    }
  ],
  references: [
    {
      title: "Greedy Function Approximation: A Gradient Boosting Machine",
      authors: "Friedman, J.H",
      url: "https://projecteuclid.org",
      type: "textbook"
    },
    {
      title: "Ensemble Methods: Foundations and Algorithms",
      authors: "Zhou, Z.-H",
      url: "https://www.crcpress.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Boosting Overfitting via Learning Rate',
      description: 'If the boosting learning rate $\\nu$ is too high or the number of trees is too large, the model will fit noise in pseudo-residuals, causing overfitting.',
      mitigation: 'Shrink the learning rate (e.g. $\\nu = 0.01$) and use early stopping based on validation loss.'
    }
  ],

  fullDescription: `
Ensemble learning is based on a very simple idea: the wisdom of the crowd. Instead of trying to build one massive, incredibly complex algorithm that gets everything right, you build hundreds of simple, slightly flawed algorithms and have them vote on the final answer. 

There are two main ways to do this:
1. **Bagging (like Random Forests)**: You build hundreds of independent Decision Trees at the same time, but you give each tree a slightly different, randomized version of the data. When it's time to make a prediction, all the trees vote, and the majority wins.
2. **Boosting (like XGBoost or Gradient Boosting)**: You build trees one at a time. The first tree makes a prediction and inevitably gets some things wrong. The second tree is built specifically to fix the mistakes of the first tree. The third tree fixes the mistakes of the second, and so on.

### Where is it used?
If you have structured data in a spreadsheet (rows and columns), Ensemble Learning is almost certainly the best tool for the job. It absolutely dominates machine learning competitions like Kaggle. It is used heavily in algorithmic stock trading, credit risk scoring, and predicting customer behavior.
  `,

  intuition: `
**Bagging (Random Forests)**: Imagine you want to guess the exact number of jellybeans in a jar. If you ask one person, they might be way off. But if you ask 1,000 random people and average their guesses, the final answer is usually incredibly close to the truth. The errors of the individuals cancel each other out.

**Boosting (Gradient Boosting)**: Imagine you are taking a difficult math test. You take it once and get a 60%. A tutor looks at your test, ignores the questions you got right, and forces you to study *only* the specific types of questions you got wrong. You take the test again and get an 80%. A second tutor looks at your new mistakes and focuses only on those. By the end, you are getting a 100%.
  `,

  mathematics: `
### 1. Variance Reduction in Bagging
If a single decision tree has a variance (error rate) of $\\sigma^2$, and the trees in your forest have a correlation of $\\rho$ (meaning they make similar mistakes), the total error of a forest with $B$ trees is:

$$ \\text{Var}(\\text{ensemble}) = \\rho \\sigma^2 + \\frac{1-\\rho}{B} \\sigma^2 $$

Random Forests use a clever trick to force $\\rho$ to be as close to zero as possible: every time a tree wants to ask a question, it is only allowed to look at a random subset of the features. This forces the trees to be diverse, which mathematically guarantees a massive drop in the overall error rate.

### 2. Gradient Boosting Machines (GBM)
Gradient Boosting builds a model step-by-step. The final prediction $f_m(x)$ is just the prediction from the previous step $f_{m-1}(x)$, plus a tiny adjustment from a new, weak tree $h_m(x)$, scaled by a learning rate $\\nu$:

$$ f_m(x) = f_{m-1}(x) + \\nu \\, h_m(x) $$

How does it know what the new tree $h_m(x)$ should learn? It calculates the "pseudo-residuals"—which is just the calculus gradient of the loss function. It literally calculates exactly how wrong the current model is for every single data point:

$$ r_{im} = -\\left[\\frac{\\partial L(y_i, f(x_i))}{\\partial f(x_i)}\\right]_{f=f_{m-1}} $$

The new tree is then trained to predict those exact errors, perfectly counteracting the mistakes of the previous trees.
  `,

  pros: [
    "It is widely considered the absolute best approach for standard, tabular data (like Excel spreadsheets or SQL databases).",
    "Random Forests require almost no tuning. You can usually just run them with default settings and get an excellent result.",
    "They naturally handle missing data, weird outliers, and a mix of numbers and categories without breaking a sweat."
  ],

  cons: [
    "They are 'black boxes'. Because the final answer is a combination of hundreds of trees, it is very difficult to explain exactly *why* the model made a specific prediction.",
    "Boosting models (like XGBoost) are very sensitive to their settings. If you set the learning rate wrong, they will overfit and memorize the training data.",
    "They are large and slow to train compared to simple models like Linear Regression."
  ],

  codeSnippet: `import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

X = np.random.rand(100, 5)
y = (X[:, 0] + X[:, 1] > 1.0).astype(int)

# Random Forest implementation
rf = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
rf.fit(X, y)
print(f"Random Forest Accuracy: {rf.score(X, y):.2f}")

# Gradient Boosting implementation
gbm = GradientBoostingClassifier(n_estimators=50, learning_rate=0.1, max_depth=3)
gbm.fit(X, y)
print(f"Gradient Boosting Accuracy: {gbm.score(X, y):.2f}")`
};
