import { LearningModule } from "./types";

export const dataPreparation: LearningModule = {
  id: "data-preparation",
  title: "Data Preparation and Feature Engineering",
  category: "Data Preparation and Feature Engineering",
  prerequisites: [],
  tracks: ["practitioner"],
  difficulty: 1,
  estimatedMinutes: 30,
  shortDescription: "The essential preprocessing pipeline that cleans raw datasets, scales features, encodes categories, and prevents data leakage.",
  learningObjectives: [
    "Identify different data types and select appropriate preprocessing treatments for numerical and categorical features.",
    "Formulate and implement scaling methods including Standardization, Min-Max, and Robust Scaling.",
    "Perform one-hot encoding and ordinal encoding for categorical features without introducing multi-collinearity.",
    "Explain the concept of data leakage and outline strategies to prevent it during train-test splitting.",
    "Design robust preprocessing pipelines that handle missing data using imputation techniques."
  ],
  keyTerms: [
    {
      term: "Standardization",
      definition: "Centering features by subtracting the mean and scaling to unit variance."
    },
    {
      term: "One-Hot Encoding",
      definition: "Converting categorical variables into a series of binary indicator columns."
    },
    {
      term: "Data Leakage",
      definition: "An error where information from outside the training dataset (such as test set characteristics) is used to train the model."
    },
    {
      term: "Imputation",
      definition: "The process of replacing missing data values with substituted values, such as the mean, median, or most frequent value."
    }
  ],
  workedExamples: [
    {
      title: "Min-Max and Standardization Scaling",
      problem: "Given a feature column with values $X = [10, 20, 30]$, calculate both the Min-Max scaled values (to range $[0, 1]$) and Standardized values for each element.",
      solution: "For **Min-Max Scaling**:\n$$X_{\\text{min}} = 10, \\quad X_{\\text{max}} = 30$$\n$$X'_i = \\frac{X_i - 10}{30 - 10} = \\frac{X_i - 10}{20}$$\n- For $10$: $X'_1 = \\frac{10-10}{20} = 0.0$\n- For $20$: $X'_2 = \\frac{20-10}{20} = 0.5$\n- For $30$: $X'_3 = \\frac{30-10}{20} = 1.0$\nResult: $X_{\\text{minmax}} = [0.0, 0.5, 1.0]$.\n\nFor **Standardization**:\n$$\\mu = \\frac{10+20+30}{3} = 20$$\n$$s = \\sqrt{\\frac{(10-20)^2 + (20-20)^2 + (30-20)^2}{3-1}} = \\sqrt{\\frac{100 + 0 + 100}{2}} = \\sqrt{100} = 10$$\n$$Z_i = \\frac{X_i - \\mu}{s} = \\frac{X_i - 20}{10}$$\n- For $10$: $Z_1 = \\frac{10-20}{10} = -1.0$\n- For $20$: $Z_2 = \\frac{20-20}{10} = 0.0$\n- For $30$: $Z_3 = \\frac{30-20}{10} = 1.0$\nResult: $Z = [-1.0, 0.0, 1.0]$."
    }
  ],
  misconceptions: [
    {
      claim: "You should scale all columns of your entire dataset before splitting it into training and testing sets.",
      correction: "Doing this causes severe data leakage because the global mean and variance calculations would include information from the test set. You must split the dataset first, fit the scaler on the training set only, and then apply (transform) it to both the training and test sets."
    },
    {
      claim: "Standardization forces your data to have a normal (Gaussian) distribution.",
      correction: "Standardization only shifts and scales the values so they have a mean of 0 and standard deviation of 1. The shape of the distribution remains exactly the same; if it was skewed, it will remain skewed."
    }
  ],
  references: [
    {
      title: "Feature Engineering and Selection: A Practical Approach for Predictive Models",
      authors: "Max Kuhn and Kjell Johnson",
      url: "https://www.routledge.com/Feature-Engineering-and-Selection-A-Practical-Approach-for-Predictive/Kuhn-Johnson/p/book/9781138079229",
      type: "textbook"
    },
    {
      title: "Scikit-Learn Preprocessing Documentation",
      url: "https://scikit-learn.org/stable/modules/preprocessing.html",
      type: "documentation"
    }
  ],
  failureModes: [
    {
      name: "Outlier Distortions in Min-Max Scaling",
      description: "Since Min-Max scaling depends on the absolute minimum and maximum values, a single extreme outlier will compress the remaining inlier values into a tiny, indistinguishable range.",
      mitigation: "Use Robust Scaling instead (which uses median and IQR), or clip outliers before scaling."
    }
  ],
  pros: [
    "Significantly speeds up gradient descent convergence in linear models and neural networks.",
    "Ensures distance-based algorithms (like KNN and SVM) treat all features equally.",
    "Allows algorithms to handle messy, incomplete real-world datasets."
  ],
  cons: [
    "Adds complexity and extra hyperparameters to the machine learning pipeline.",
    "Improper implementation can easily introduce data leakage and yield overly optimistic validation scores."
  ],
  intuition: "Imagine you're comparing houses. House A has 3 bedrooms and costs 400,000 dollars. House B has 4 bedrooms and costs 450,050 dollars. If a distance-based AI compares these, the bedroom difference (1) is completely dwarfed by the price difference (50,000 dollars). The AI will effectively ignore bedrooms. Data preparation is about leveling the playing field (scaling) so that all features can contribute appropriately to the model's predictions.",
  mathematics: "### Scaling Methods\n\nLet $X$ represent a feature vector of length $n$.\n\n#### 1. Min-Max Scaling (Normalization)\nMaps values to a bounded range, typically $[0, 1]$:\n$$X_{\\text{norm}} = \\frac{X - X_{\\text{min}}}{X_{\\text{max}} - X_{\\text{min}}}$$\n\n#### 2. Standardization (Z-score Normalization)\nTransforms data to have zero mean and unit variance:\n$$X_{\\text{std}} = \\frac{X - \\mu}{\\sigma}$$\nwhere $\\mu = \\frac{1}{n} \\sum_{i=1}^n X_i$ is the mean, and $\\sigma = \\sqrt{\\frac{1}{n} \\sum_{i=1}^n (X_i - \\mu)^2}$ is the standard deviation.\n\n#### 3. Robust Scaling\nScales features using the median and Interquartile Range (IQR) to reduce outlier sensitivity:\n$$X_{\\text{robust}} = \\frac{X - Q_2(X)}{Q_3(X) - Q_1(X)}$$\nwhere $Q_1, Q_2, Q_3$ represent the 25th, 50th (median), and 75th percentiles of $X$.\n\n### Categorical Encoding\n\n#### One-Hot Encoding\nFor a categorical feature with $K$ unique categories, one-hot encoding creates $K$ binary indicator features. To prevent multi-collinearity (known as the *dummy variable trap*), we typically drop one category, yielding $K - 1$ features:\n$$x_{\\text{encoded}} \\in \\{0, 1\\}^{K-1}$$",
  fullDescription: "Data preparation is the foundation of any successful machine learning project. Real-world datasets are rarely ready for model training: they contain missing values, mixed data types, outliers, and highly unequal scales. Preprocessing pipelines clean and transform this raw data, making it suitable for models to digest. Feature engineering creates new representation columns from existing ones to help models capture patterns more easily.\n\nThis module covers standard scaling techniques, categorical variable representation, missing data handling, and essential pipeline hygiene practices to prevent data leakage.",
  codeSnippet: `/**
 * Performs Min-Max Scaling on a numeric array
 */
export function minMaxScale(data: number[]): number[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  if (range === 0) {
    return data.map(() => 0);
  }
  
  return data.map(x => (x - min) / range);
}

/**
 * Encodes categorical data into one-hot binary arrays.
 * Returns the unique categories and the encoded vectors.
 */
export function oneHotEncode(data: string[]): {
  categories: string[];
  encoded: number[][];
} {
  const categories = Array.from(new Set(data)).sort();
  
  const encoded = data.map(value => {
    const row = new Array(categories.length).fill(0);
    const idx = categories.indexOf(value);
    if (idx !== -1) {
      row[idx] = 1;
    }
    return row;
  });
  
  return { categories, encoded };
}`,
  relatedModules: ["linear-regression", "knn", "support-vector-machines"],
  tldr: [
    'Always **fit preprocessing on the training fold only**, then transform train, validation, and test sets with those fitted parameters — never fit on the full dataset before splitting.',
    'Standardization ($z = \\frac{x - \\mu}{\\sigma}$) puts features on comparable scales so distance-based and gradient-based methods do not get dominated by whichever feature happens to have the largest numeric range.',
    'Min-Max scaling bounds values to $[0,1]$ but is highly sensitive to outliers; Robust Scaling (median/IQR) tolerates outliers much better.',
    'One-hot encode nominal categories (drop one level to avoid the dummy-variable trap); use ordinal encoding only when categories have a true order.',
    'Impute missing values using statistics learned from the training set, never from the combined train+test data.',
    'Data leakage silently inflates validation metrics — if test performance is much worse in production than in your evaluation, leakage is a prime suspect.',
  ],
  additionalSections: [
    {
      heading: 'Why Unscaled Features Break Distance- and Gradient-Based Methods',
      content: `
Many algorithms implicitly assume that all features live on comparable numeric scales. Two big families that break without standardization are **distance-based** methods (KNN, K-Means, SVM with RBF kernel) and **gradient-based** methods (linear/logistic regression trained with gradient descent, neural networks).

#### Distance-based example

Suppose we describe houses with two raw features: number of bedrooms $x_1 \\in \\{2, 3, 4\\}$ and price in dollars $x_2 \\in \\{380000, 400000, 420000\\}$. Compare House A $(3, 400000)$ to House B $(4, 420000)$ using Euclidean distance:

$$ d(A,B) = \\sqrt{(4-3)^2 + (420000-400000)^2} = \\sqrt{1 + 4\\times10^{8}} \\approx 20000.00002 $$

The bedroom difference of $1$ contributes a term of magnitude $1$, while the price difference of $20{,}000$ contributes a term of magnitude $4 \\times 10^{8}$. The bedroom feature is mathematically invisible — the distance is, for all practical purposes, just the price difference. A KNN or K-Means model trained on these raw features would effectively ignore bedrooms entirely, regardless of how predictive that feature actually is.

After z-score standardizing both features (using $z = \\frac{x-\\mu}{\\sigma}$ computed from a larger sample, say $\\mu_1=3, \\sigma_1=1$ for bedrooms and $\\mu_2=400000, \\sigma_2=20000$ for price), House A becomes $(0, 0)$ and House B becomes $(1, 1)$, so:

$$ d(A,B) = \\sqrt{1^2 + 1^2} = \\sqrt{2} \\approx 1.41 $$

Now both features contribute equally to the distance, and the model can actually learn from the bedroom count.

#### Gradient-descent example

The same imbalance corrupts gradient descent. For linear regression $\\hat{y} = w_1 x_1 + w_2 x_2$ trained with MSE loss, the gradient with respect to each weight is:

$$ \\frac{\\partial \\mathcal{L}}{\\partial w_j} = -\\frac{2}{n}\\sum_i x_{ij}(y_i - \\hat{y}_i) $$

Because $x_2$ (price, $\\sim 400{,}000$) is roughly five orders of magnitude larger than $x_1$ (bedrooms, $\\sim 3$), the gradient component for $w_2$ is also roughly five orders of magnitude larger than for $w_1$. A single learning rate $\\eta$ that is small enough to keep the $w_2$ update stable will make the $w_1$ update virtually zero, so $w_1$ barely moves and convergence stalls or requires drastically more iterations. Standardizing both features to mean $0$, variance $1$ puts the gradient magnitudes for $w_1$ and $w_2$ on the same order, letting a single learning rate make balanced progress on both weights — which is why standardization is described as "reshaping" the loss surface from a long, narrow elliptical bowl into something closer to a circular bowl that gradient descent can descend quickly and directly.
      `,
    },
    {
      heading: 'Why Fitting Scalers Before the Train/Test Split Causes Data Leakage',
      content: `
Data leakage occurs whenever information from outside the training fold influences how the model (or its preprocessing) is fit. A subtle but extremely common source is fitting a scaler, encoder, or imputer on the **entire** dataset — including rows that will later become the test set — before splitting.

#### Why this is leakage

Standardization needs an estimate of $\\mu$ and $\\sigma$:

$$ \\hat{\\mu} = \\frac{1}{n}\\sum_{i=1}^n x_i, \\qquad \\hat{\\sigma} = \\sqrt{\\frac{1}{n}\\sum_{i=1}^n (x_i - \\hat\\mu)^2} $$

If $\\hat\\mu$ and $\\hat\\sigma$ are computed over all $n$ rows (train **and** test), then every transformed training value $z_i = (x_i - \\hat\\mu)/\\hat\\sigma$ has implicitly "seen" the test rows through $\\hat\\mu$ and $\\hat\\sigma$. The test set is supposed to simulate unseen future data, but its statistics have already leaked into the numbers the model trains on.

#### Worked numeric example

Consider a tiny feature column of $8$ values, where the last $2$ rows will be held out as the test set:

Train rows: $x = [10, 12, 11, 13, 12]$ (mean $\\bar{x}_{\\text{train}} = 11.6$, std $s_{\\text{train}} \\approx 1.02$)

Test rows: $x = [40, 42]$ — these are outliers relative to training (perhaps a data-entry shift, or a genuinely different regime that the model needs to be evaluated against).

**Correct (fit on train only):** $\\hat\\mu = 11.6$, $\\hat\\sigma \\approx 1.02$, computed strictly from the $5$ training rows. The test rows are *transformed*, not used to compute statistics: $z = \\frac{40 - 11.6}{1.02} \\approx 27.8$ and $z = \\frac{42-11.6}{1.02}\\approx 29.8$. These extreme standardized values correctly signal to any downstream evaluation that the test points are far outside the training distribution — exactly the warning sign you want a held-out set to surface.

**Leaky (fit on all 8 rows):** $\\hat\\mu_{\\text{all}} = \\frac{10+12+11+13+12+40+42}{7}$... ($n=7$ here for illustration) $\\approx 18.6$, and $\\hat\\sigma_{\\text{all}}$ is inflated to roughly $12.3$ by the two outliers. Now the *training* rows get standardized against statistics that were pulled toward the test outliers: $z = \\frac{10-18.6}{12.3} \\approx -0.70$ instead of the leak-free $z = \\frac{10-11.6}{1.02}\\approx -1.57$. The training data looks artificially "tamer" (smaller magnitude z-scores, less variance to explain) than it really is, and — more importantly — the test set's distribution has directly shaped the scale used to train the model.

In practice this kind of leakage tends to make **validation/test metrics look better than they should**, because the preprocessing step has already absorbed information about the test set's distribution. When the model is deployed on truly new data (which cannot leak into preprocessing), performance drops relative to what was reported — a classic train/serve skew. The fix is mechanical: always do \`X_train, X_test = split(X)\` **first**, then \`scaler.fit(X_train)\` followed by \`scaler.transform(X_train)\` and \`scaler.transform(X_test)\` — the test set only ever gets *transformed*, never *fit*. The same rule applies to one-hot encoders (categories should be learned from train only) and imputers (the imputation mean/median must come from train only).
      `,
    },
  ],
  practiceExercises: [
    {
      prompt: 'A feature column has values $X = [5, 15, 25]$. Compute the Min-Max scaled values to the range $[0,1]$.',
      difficulty: 'warm-up',
      hint: 'Use $X’_i = \\frac{X_i - X_{\\min}}{X_{\\max} - X_{\\min}}$.',
      solution: '$X_{\\min}=5$, $X_{\\max}=25$, range $=20$. $X’_1 = \\frac{5-5}{20}=0.0$, $X’_2=\\frac{15-5}{20}=0.5$, $X’_3=\\frac{25-5}{20}=1.0$. Result: $[0.0, 0.5, 1.0]$.',
      tags: ['scaling', 'computation'],
    },
    {
      prompt: 'A categorical column "color" has values $[\\text{red}, \\text{blue}, \\text{green}, \\text{blue}]$. Write out the full one-hot encoding (without dropping a column), then show the reduced encoding that avoids the dummy-variable trap.',
      difficulty: 'core',
      hint: 'Sort categories alphabetically first: blue, green, red. Dropping one column removes redundancy because the dropped category is implied when all remaining indicators are 0.',
      solution: 'Sorted categories: $[\\text{blue}, \\text{green}, \\text{red}]$. Full one-hot (3 columns): red $\\to [0,0,1]$, blue $\\to [1,0,0]$, green $\\to [0,1,0]$, blue $\\to [1,0,0]$. To avoid the dummy-variable trap, drop one column, e.g. "blue": now only [green, red] remain. red $\\to [0,1]$, blue $\\to [0,0]$ (implied blue when both are 0), green $\\to [1,0]$, blue $\\to [0,0]$. This $K-1 = 2$ column encoding carries the same information as the 3-column version without introducing perfect multicollinearity (the 3 one-hot columns of the full encoding always sum to 1, which is a linear dependency).',
      tags: ['encoding', 'conceptual'],
    },
    {
      prompt: 'Find the bug: ```python\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)  # X is the full dataset\nX_train, X_test = train_test_split(X_scaled)\nmodel.fit(X_train, y_train)\n```',
      difficulty: 'core',
      hint: 'Look at the order of fit_transform versus train_test_split.',
      solution: 'The scaler is fit on the **entire** dataset $X$ before the train/test split, so $\\hat\\mu$ and $\\hat\\sigma$ include information from rows that end up in the test set. This is data leakage: the test set’s distribution has influenced the transformation applied to the training data, which can inflate validation performance relative to true generalization. Fix: split first, then `scaler.fit(X_train)` and use that fitted scaler to `.transform()` both `X_train` and `X_test` — i.e. `X_train, X_test = train_test_split(X); scaler.fit(X_train); X_train_scaled = scaler.transform(X_train); X_test_scaled = scaler.transform(X_test)`.',
      tags: ['data-leakage', 'debugging'],
    },
    {
      prompt: 'A training fold has the feature values $X_{\\text{train}} = [2, 4, 4, 6]$. Using **only** these training statistics, standardize the training values and also standardize a new test point $x=10$ that was not part of the training fold.',
      difficulty: 'challenge',
      hint: 'Compute $\\mu$ and the (population or sample) standard deviation from the training values only, then apply the same formula to the test point — do not recompute statistics including the test point.',
      solution: 'Training mean $\\mu = \\frac{2+4+4+6}{4} = 4$. Using the population standard deviation, variance $= \\frac{(2-4)^2+(4-4)^2+(4-4)^2+(6-4)^2}{4} = \\frac{4+0+0+4}{4}=2$, so $\\sigma=\\sqrt{2}\\approx1.41$. Standardized training values: $z=\\frac{2-4}{1.41}\\approx-1.41$, $\\frac{4-4}{1.41}=0$, $\\frac{4-4}{1.41}=0$, $\\frac{6-4}{1.41}\\approx1.41$. For the **test** point $x=10$, reuse the same training-derived $\\mu=4,\\sigma=1.41$ (do not recompute with the test point included): $z_{\\text{test}}=\\frac{10-4}{1.41}\\approx4.25$. This large z-score correctly flags that the test point lies far outside the training distribution — information that would be hidden if the statistics were recomputed including the test point.',
      tags: ['scaling', 'data-leakage', 'derivation'],
    },
  ],
  comparisons: [
    {
      title: 'Standardization vs Min-Max vs Robust Scaling',
      methods: ['Standardization (Z-score)', 'Min-Max Scaling', 'Robust Scaling'],
      rows: [
        {
          dimension: 'Formula',
          values: ['$z = \\frac{x-\\mu}{\\sigma}$', '$x’ = \\frac{x - x_{\\min}}{x_{\\max}-x_{\\min}}$', '$x’ = \\frac{x - Q_2}{Q_3 - Q_1}$'],
        },
        {
          dimension: 'Output range',
          values: ['Unbounded, typically roughly $[-3, 3]$', 'Strictly bounded to $[0, 1]$', 'Unbounded; centered near $0$'],
        },
        {
          dimension: 'Sensitivity to outliers',
          values: ['Moderate — outliers inflate $\\sigma$', 'High — a single extreme value compresses all other points', 'Low — median/IQR are robust statistics'],
        },
        {
          dimension: 'Assumes a distribution shape?',
          values: ['No, but works best when roughly symmetric', 'No', 'No — explicitly designed for skewed/outlier-heavy data'],
        },
        {
          dimension: 'Typical use case',
          values: ['Linear/logistic regression, PCA, neural networks, SVM', 'Neural network inputs (e.g. images), algorithms needing a fixed bounded range', 'Features with heavy-tailed distributions or known outliers'],
        },
      ],
      takeaway: 'Default to Standardization for most gradient-based and distance-based models; use Min-Max when you need a strictly bounded range (e.g. pixel intensities); switch to Robust Scaling whenever outliers are present and you cannot simply remove them.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You are about to feed features into a **distance-based** algorithm (KNN, K-Means, SVM) or a **gradient-based** algorithm (linear/logistic regression, neural networks) where raw feature scales would otherwise dominate the result.',
      'Your dataset mixes features with **very different units or magnitudes** (e.g. age in years vs. income in dollars).',
      'You are building a **production pipeline** and need a reproducible, leakage-free way to transform new incoming data using statistics learned once from training data.',
    ],
    avoidWhen: [
      'You are using a **tree-based** model (decision trees, random forests, gradient boosting) — these are invariant to monotonic feature scaling, so scaling adds complexity without benefit.',
      'A feature is already meaningfully bounded and interpretable in its raw units (e.g. a probability already in $[0,1]$, or a one-hot indicator).',
      'You only have a **single combined dataset with no train/test separation yet** — fit nothing until after the split, to avoid leakage.',
    ],
    rulesOfThumb: [
      'Always call `.fit()` on training data only, and `.transform()` (never `.fit_transform()`) on validation/test data.',
      'Wrap scaling, encoding, and imputation inside a single `Pipeline`/`ColumnTransformer` so cross-validation automatically refits preprocessing per fold.',
      'Prefer Robust Scaling over Standardization or Min-Max whenever you see extreme outliers in exploratory analysis.',
      'For one-hot encoding, always drop exactly one category per feature to avoid the dummy-variable trap in linear models (tree-based models do not require this).',
    ],
  },
  caseStudies: [
    {
      title: 'Kaggle competition leaderboard collapse from leaked target-mean encoding',
      domain: 'Competitive machine learning / tabular data',
      scenario: 'In numerous Kaggle tabular competitions (a well-documented pattern discussed in Kaggle’s own competition write-ups and the broader Kaggle community), competitors encode high-cardinality categorical features using **target-mean encoding** — replacing each category with the average target value for that category — computed over the **entire** training file before doing cross-validation splits.',
      approach: 'Because the encoding for each row used target statistics computed from a sample that included that very row (and its cross-validation fold), the encoded feature implicitly leaked the label into itself. Competitors saw cross-validation AUC/accuracy scores that were unrealistically high (often several points better than any model should achieve on that data) and assumed they had found a winning approach.',
      outcome: 'When the same target-encoding was correctly redone **per fold** — fitting the category-to-target mapping only on the training portion of each fold and applying it to the held-out portion — cross-validation scores dropped substantially (commonly by 2-5+ percentage points of AUC in shared writeups), and the leaderboard rank of leaky submissions fell sharply on the private test set. The widely repeated lesson in the Kaggle community is: any encoding or scaling step that uses the target variable, or that is fit before splitting, must be re-fit inside each cross-validation fold — otherwise validation scores are not trustworthy estimates of generalization.',
      source: {
        title: 'Feature Engineering and Selection: A Practical Approach for Predictive Models',
        authors: 'Max Kuhn and Kjell Johnson',
        url: 'https://www.routledge.com/Feature-Engineering-and-Selection-A-Practical-Approach-for-Predictive/Kuhn-Johnson/p/book/9781138079229',
        type: 'textbook',
      },
    },
  ],
  quiz: [
    {
      question: 'Why does standardization typically speed up gradient descent convergence on multi-feature datasets?',
      options: [
        { text: 'It puts the gradient magnitudes for different weights on a comparable scale, avoiding a long, narrow loss surface that forces a tiny learning rate.', correct: true },
        { text: 'It makes every feature follow a normal distribution, which gradient descent requires.', correct: false },
        { text: 'It removes the need for a learning rate entirely.', correct: false },
        { text: 'It guarantees the loss function becomes convex.', correct: false },
      ],
      explanation: 'When features have wildly different scales, the corresponding weight gradients differ by orders of magnitude, so a learning rate that is stable for the large-scale feature makes almost no progress on the small-scale one. Standardization equalizes gradient magnitudes, letting one learning rate move all weights at a similar pace. It does not impose normality, eliminate the learning rate, or affect convexity (that is determined by the model/loss family).',
    },
    {
      question: 'You fit a `StandardScaler` on your entire dataset and then call `train_test_split`. What is the main problem with this order of operations?',
      options: [
        { text: 'The scaler’s mean and standard deviation are computed using test-set rows, leaking test-set information into the training transformation.', correct: true },
        { text: 'StandardScaler cannot be used before train_test_split for technical reasons.', correct: false },
        { text: 'The resulting scaled values will be outside the range $[0, 1]$.', correct: false },
        { text: 'It will throw a runtime error in scikit-learn.', correct: false },
      ],
      explanation: 'Fitting on the full dataset means $\\hat\\mu$ and $\\hat\\sigma$ are influenced by the rows that later become the test set, so the "unseen" test set has already shaped the training data’s transformation. This typically makes validation metrics overly optimistic. StandardScaler is not bounded to $[0,1]$ (that is Min-Max scaling) and the code runs without error — the problem is purely methodological leakage.',
    },
    {
      question: 'Which scaling method is most appropriate when your feature contains several extreme outliers that you do not want to discard?',
      options: [
        { text: 'Robust Scaling, since it uses the median and IQR which are resistant to outliers.', correct: true },
        { text: 'Min-Max Scaling, since it bounds everything to $[0,1]$ regardless of outliers.', correct: false },
        { text: 'Standardization, since the mean is unaffected by outliers.', correct: false },
        { text: 'One-hot encoding, since it removes the need for scaling.', correct: false },
      ],
      explanation: 'Robust Scaling subtracts the median and divides by the IQR ($Q_3 - Q_1$), both of which are far less sensitive to extreme values than the mean/std used in standardization or the min/max used in Min-Max scaling. Min-Max scaling is actually *worse* with outliers, since a single extreme value stretches the range and compresses all other points together. One-hot encoding is for categorical variables, not a substitute for scaling numeric outliers.',
    },
    {
      question: 'When one-hot encoding a categorical feature with $K$ categories for use in a linear regression model with an intercept term, why do practitioners typically keep only $K-1$ indicator columns?',
      options: [
        { text: 'Keeping all $K$ columns creates a perfect linear dependency with the intercept (the dummy-variable trap), making the design matrix singular.', correct: true },
        { text: 'Tree-based models require exactly $K-1$ columns to split correctly.', correct: false },
        { text: 'scikit-learn raises an error if you provide $K$ one-hot columns.', correct: false },
        { text: 'It reduces the categorical feature to a single ordinal number.', correct: false },
        { text: 'Dropping a column always improves predictive accuracy.', correct: false },
      ],
      explanation: 'All $K$ one-hot columns always sum to exactly 1 for every row, which is identical to the intercept column (also all 1s) up to scaling — this perfect collinearity makes $X^T X$ singular for linear models with an intercept. Dropping one category removes the redundancy without losing information, since the dropped category is implied when all remaining indicators are 0. Tree-based models do not need this and scikit-learn does not error on full one-hot encoding; it is a modeling concern, not a software constraint, and dropping a column is about numerical stability, not a guaranteed accuracy boost.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
