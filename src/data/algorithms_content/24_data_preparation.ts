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
  relatedModules: ["linear-regression", "knn", "support-vector-machines"]
};
