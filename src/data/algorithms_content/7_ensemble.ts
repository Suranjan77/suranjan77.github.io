import { Algorithm } from "./types";

export const ensembleLearning: Algorithm = {
  id: "ensemble-learning",
  title: "Ensemble Learning (RFs & GBMs)",
  category: "Ensemble Learning",
  shortDescription: "Methodologies combining multiple weak structural learners into a singular robust architecture to radically mitigate variance and optimise predictive accuracy.",

  fullDescription: `
Ensemble learning formally operates upon a profound statistical premise: an aggregated multiplicity of weak analytical models systematically mitigates the structural pitfalls inherently present within isolated estimators. 

Bagging (bootstrap aggregating), exemplified by Random Forests, trains numerous independent decision trees in parallel utilising bootstrapped data subsets, capitalising thoroughly upon rigorous analytical variance reduction. Conversely, Boosting (manifested through Gradient Boosting Machines and XGBoost) trains deliberately shallow architectural trees sequentially; crucially, each subsequent iteration precisely mathematically attempts to correct the specific residual error gradient generated cumulatively by all preceding models.

### Empirical Applications
Ensemble learning methodologies explicitly dominate contemporary structural, discrete tabular data environments. They reliably power highly complex algorithmic financial trading protocols, efficiently standardise credit risk probability forecasts, and robustly model discrete categorical outcomes across immense, heterogeneous databases.
  `,

  intuition: `
Bagging operates analogously to a committee of independent, structurally diverse experts randomly evaluating varied subsets of evidence; the final consensus functionally eliminates individual idiosyncrasies and bias. Boosting operates sequentially, akin to an iterative pedagogical process wherein each subsequent reviewer solely focuses on rectifying the specific mistakes explicitly overlooked by the previous evaluators. The final aggregated prediction represents a profoundly fine-tuned and highly corrective output.
  `,

  mathematics: `
### 1. Variance Reduction in Bagging (Random Forests)
Assume the true statistical variance of a primary decision tree estimator is denoted as $\\sigma^2$, and the average mathematical correlation spanning the generated trees is $\\rho$. The total aggregated variance inherent to a complete ensemble of $B$ bagged trees is statistically defined as:

$$ \\text{Var}(\\text{ensemble}) = \\rho \\sigma^2 + \\frac{1-\\rho}{B} \\sigma^2 $$

Random Forests forcefully mathematically attenuate $\\rho$ by dictating analytical node splits explicitly upon randomly selected feature subsets, thereby precipitating a severe reduction in systemic overall variance.

### 2. Gradient Boosting Machines (GBM)
Gradient Boosting iteratively minimises a rigorously differentiable loss function $L(y, f(x))$ via stagewise additive expansion:

$$ f_m(x) = f_{m-1}(x) + \\nu \\, h_m(x) $$

Wherein $\\nu$ signifies the continuous learning rate. At algorithmic iteration $m$, the model dynamically computes the negative mathematical gradient of the loss (frequently termed the "pseudo-residuals") with precise respect to the continuous output of the prevailing ensemble:

$$ r_{im} = -\\left[\\frac{\\partial L(y_i, f(x_i))}{\\partial f(x_i)}\\right]_{f=f_{m-1}} $$

A novel weak learner $h_m(x)$ is subsequently formally trained to accurately predict $r_{im}$, explicitly directing counteracting mathematical adjustments strictly against the most prominent error vectors extant within the loss landscape.
  `,

  pros: [
    "Currently fundamentally acknowledged as the absolute state-of-the-art specifically for complex, structured discrete tabular datasets.",
    "Functions proficiently over intricate mixed statistical feature typologies, dense arrays of missing values, and immense mathematical scale disparities virtually effortlessly."
  ],

  cons: [
    "Renders the derivation of explicit, definitively traceable abstract logical paths highly obscure, specifically when compared against a singular analytical decision tree.",
    "Formulating massive, sequentially boosted ensembles mandates significantly intensive computational duration and deep operational memory requirements."
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
