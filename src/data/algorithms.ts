export type AlgorithmCategory = 'Supervised' | 'Unsupervised' | 'Deep Learning';

export interface Algorithm {
  id: string;
  title: string;
  category: AlgorithmCategory;
  shortDescription: string;
  fullDescription: string;
  intuition: string;
  mathematics: string;
  pros: string[];
  cons: string[];
  codeSnippet: string;
}

export const algorithms: Algorithm[] = [
  {
    id: 'linear-regression',
    title: 'Linear Regression',
    category: 'Supervised',
    shortDescription: 'Predicts a continuous output variable based on one or more input variables.',
    fullDescription: 'Linear regression is a linear approach for modelling the relationship between a scalar response and one or more explanatory variables. It is one of the most well-known and well-understood algorithms in statistics and machine learning.',
    intuition: 'Imagine you want to predict the price of a house based on its size. You plot past data on a graph (size on the x-axis, price on the y-axis). Linear regression finds the "line of best fit" through this data, allowing you to estimate the price for any given size.',
    mathematics: `The core equation representing the linear fit is:

$$ y = mx + b $$

Where:
- $y$ = predicted value
- $x$ = input feature
- $m$ = slope (weight)
- $b$ = y-intercept (bias)

Optimization is typically done using **Ordinary Least Squares (OLS)**, which minimizes the sum of squared residuals:
$$ RSS = \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2 $$`,
    pros: [
      'Simple to implement and interpret.',
      'Fast to train and predict.',
      'Less prone to overfitting with regularization (Lasso/Ridge).',
      'Serves as an excellent baseline model.'
    ],
    cons: [
      'Assumes a linear relationship between features and target.',
      'Sensitive to outliers which can skew the best-fit line.',
      'Prone to underfitting on complex, non-linear datasets.',
      'Assumes independence between features (no multicollinearity).'
    ],
    codeSnippet: `from sklearn.linear_model import LinearRegression
import numpy as np

# Training data: [Size in sqft]
X = np.array([[1000], [1500], [2000], [2500]])
# Target: [Price in thousands]
y = np.array([300, 450, 590, 710])

# Create and train the model
model = LinearRegression()
model.fit(X, y)

# Predict price for 1800 sqft
prediction = model.predict([[1800]])
print(f"Predicted Price: $\{prediction[0]:.2f\}k")`
  },
  {
    id: 'logistic-regression',
    title: 'Logistic Regression',
    category: 'Supervised',
    shortDescription: 'Predicts the probability of a categorical target variable (binary classification).',
    fullDescription: 'Despite its name, logistic regression is a classification algorithm. It models the probability that a given input point belongs to a specific category using the logistic sigmoid function.',
    intuition: 'If you want to classify emails as "Spam" or "Not Spam", logistic regression calculates a score based on keywords. It then passes this score through a "S-shaped" curve (Sigmoid) to get a probability between 0 and 1. If it\'s over 0.5, it\'s Spam!',
    mathematics: `The algorithm maps input features to a probability using the Sigmoid function:

$$ P(y=1|x) = \\sigma(w^T x + b) = \\frac{1}{1 + e^{-(w^T x + b)}} $$

The model is trained using **Maximum Likelihood Estimation (MLE)** to minimize the **Cross-Entropy Loss**:
$$ L(w) = -\\frac{1}{n} \\sum_{i=1}^{n} [y_i \\log(\\hat{y}_i) + (1-y_i) \\log(1-\\hat{y}_i)] $$`,
    pros: [
      'Outputs well-calibrated probabilities.',
      'Highly efficient and requires low computational resources.',
      'Easy to regularize to prevent overfitting.',
      'Coefficients provide insight into feature importance.'
    ],
    cons: [
      'Cannot solve non-linear problems without feature engineering.',
      'Vulnerable to multicollinearity and outliers.',
      'Assumes a linear relationship between independent variables and log-odds.'
    ],
    codeSnippet: `from sklearn.linear_model import LogisticRegression
import numpy as np

# Features: [Hours Studied]
X = np.array([[1], [2], [3], [4], [5], [6]])
# Labels: [Pass (1) or Fail (0)]
y = np.array([0, 0, 0, 1, 1, 1])

model = LogisticRegression()
model.fit(X, y)

# Predict probability of passing for 3.5 hours study
prob = model.predict_proba([[3.5]])
print(f"Probability of Passing: {prob[0][1]:.2%}")`
  },
  {
    id: 'k-nearest-neighbors',
    title: 'K-Nearest Neighbors',
    category: 'Supervised',
    shortDescription: 'Classifies data points based on the labels of their nearest neighbors.',
    fullDescription: 'K-Nearest Neighbors (KNN) is a non-parametric, lazy learning algorithm. It doesn\'t learn a discriminative function from the training data but "memorizes" the dataset instead. Classification is performed by a majority vote of its neighbors.',
    intuition: '"Tell me who your neighbors are, and I\'ll tell you who you are." To classify a new point, KNN looks at the $K$ closest points in the training set. If most of them are "Red", the new point is classified as "Red".',
    mathematics: `Distance between points is usually calculated using **Euclidean Distance**:

$$ d(p, q) = \\sqrt{\\sum_{i=1}^{n} (p_i - q_i)^2} $$

The prediction $\\hat{y}$ for a point $x$ is:
$$ \\hat{y} = \\text{mode}(\\{y_i : i \\in N_k(x)\\}) $$
Where $N_k(x)$ is the set of $k$ points closest to $x$.`,
    pros: [
      'Extremely simple to understand and implement.',
      'No training phase required (lazy learner).',
      'Naturally handles multi-class classification.',
      'Effective if the decision boundary is very irregular.'
    ],
    cons: [
      'Computationally expensive during prediction (must scan all data).',
      'High memory usage as it stores the entire dataset.',
      'Sensitive to the choice of $K$ and the distance metric.',
      'Sensitive to irrelevant features and data scaling.'
    ],
    codeSnippet: `from sklearn.neighbors import KNeighborsClassifier
import numpy as np

# Features: [Sweetness, Crunchiness]
X = np.array([[7, 7], [3, 2], [2, 1], [8, 5]])
# Labels: [Fruit (0) or Protein (1)]
y = np.array([0, 1, 1, 0])

knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X, y)

# Classify a new food: [6, 4]
result = knn.predict([[6, 4]])
print(f"Classification: {'Fruit' if result[0]==0 else 'Protein'}")`
  },
  {
    id: 'support-vector-machines',
    title: 'Support Vector Machines',
    category: 'Supervised',
    shortDescription: 'Finds the optimal hyperplane that maximizes the margin between different classes.',
    fullDescription: 'Support Vector Machines (SVM) is a powerful classifier that seeks the unique hyperplane that separates classes with the maximum margin. Points closest to the boundary are called "Support Vectors".',
    intuition: 'Imagine trying to separate two groups of points with a wide "no-man\'s land" (the margin). SVM tries to find the widest possible path that separates the groups without touching any points.',
    mathematics: `The objective is to maximize the margin $M = \\frac{2}{||w||}$ subject to:

$$ y_i (w^T x_i + b) \\ge 1 $$

For non-linear data, SVM uses the **Kernel Trick** to project data into higher dimensions:
$$ K(x_i, x_j) = \\phi(x_i)^T \\phi(x_j) $$
Common kernels include Polynomial and **RBF (Gaussian)**.`,
    pros: [
      'Effective in high-dimensional spaces.',
      'Robust against overfitting, especially in high-dimensional space.',
      'Memory efficient because it only uses a subset of training points (support vectors).',
      'Versatile through the use of different Kernel functions.'
    ],
    cons: [
      'Long training time for large datasets.',
      'Does not provide probability estimates directly.',
      'Sensitive to the choice of Kernel and regularization parameters.',
      'Difficult to interpret the final model weights.'
    ],
    codeSnippet: `from sklearn import svm
import numpy as np

# Training data
X = np.array([[1, 2], [5, 8], [1.5, 1.8], [8, 8]])
y = np.array([0, 1, 0, 1])

# Create SVM with RBF kernel
clf = svm.SVC(kernel='rbf', C=1.0)
clf.fit(X, y)

print(f"Prediction: {clf.predict([[0.5, 0.8]])}")`
  },
  {
    id: 'decision-trees',
    title: 'Decision Trees',
    category: 'Supervised',
    shortDescription: 'A flowchart-like tree structure used for both classification and regression.',
    fullDescription: 'Decision Trees recursively split the data into subsets based on feature values. The goal is to create "leaves" that are as pure as possible (containing points from mostly one class).',
    intuition: 'Think of a game of "20 Questions". You ask: "Is the animal a mammal?", "Does it fly?", "Is it a bat?". Each question narrows down the possibilities until you reach a final answer.',
    mathematics: `The best split is chosen by minimizing **Gini Impurity** or **Entropy (Information Gain)**.

$$ Gini(D) = 1 - \\sum_{i=1}^{c} p_i^2 $$
$$ Entropy(D) = -\\sum_{i=1}^{c} p_i \\log_2(p_i) $$

Where $p_i$ is the probability of a point in dataset $D$ belonging to class $i$.`,
    pros: [
      'Highly interpretable (White Box model).',
      'Requires very little data preparation (no need for scaling).',
      'Handles both numerical and categorical data.',
      'Can model complex non-linear relationships.'
    ],
    cons: [
      'Extremely prone to overfitting (creating overly complex trees).',
      'Unstable: small changes in data can lead to a completely different tree.',
      'Greedy algorithms might not find the globally optimal tree.'
    ],
    codeSnippet: `from sklearn.tree import DecisionTreeClassifier
from sklearn import tree

# Features: [Age, Income]
X = np.array([[25, 50000], [45, 80000], [20, 20000], [35, 120000]])
# Target: [Bought Product? (1/0)]
y = np.array([0, 1, 0, 1])

clf = DecisionTreeClassifier(max_depth=3)
clf.fit(X, y)

# Predict for Age 30, Income 60k
print(f"Will buy: {'Yes' if clf.predict([[30, 60000]])[0]==1 else 'No'}")`
  },
  {
    id: 'random-forests',
    title: 'Random Forests',
    category: 'Supervised',
    shortDescription: 'An ensemble of many decision trees to improve accuracy and robustness.',
    fullDescription: 'Random Forest is an ensemble learning method that constructs a multitude of decision trees at training time. For classification, it outputs the mode of the classes; for regression, the mean prediction.',
    intuition: 'Instead of asking one expert, you ask a thousand. Each expert (Tree) is trained on a random subset of data and a random subset of features. The "Wisdom of the Crowd" usually outperforms any single expert.',
    mathematics: `Uses **Bagging (Bootstrap Aggregating)** and **Feature Randomness**:
1. Draw $B$ bootstrap samples from data.
2. For each sample, grow a tree $T_b$.
3. At each split in the tree, select $m < p$ random features as candidates.
4. Aggregate predictions:
$$ \\hat{f} = \\frac{1}{B} \\sum_{b=1}^{B} T_b(x) $$`,
    pros: [
      'One of the most accurate and general-purpose algorithms.',
      'Handles large datasets with high dimensionality very well.',
      'Provides a reliable measure of feature importance.',
      'Highly resistant to overfitting compared to single trees.'
    ],
    cons: [
      'Can be slow to predict if the ensemble is very large.',
      'Complex and harder to interpret than a single tree.',
      'High memory usage to store many trees.',
      'Less effective on very sparse data (like text).'
    ],
    codeSnippet: `from sklearn.ensemble import RandomForestClassifier

# Training a forest with 100 trees
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Importance of each feature
importances = rf.feature_importances_
print(f"Top Feature Importance: {importances.max():.4f}")`
  },
  {
    id: 'gradient-boosting-machines',
    title: 'Gradient Boosting (GBM)',
    category: 'Supervised',
    shortDescription: 'Builds trees sequentially, with each new tree correcting errors made by previous ones.',
    fullDescription: 'Gradient Boosting is an ensemble technique where models are added sequentially. Each new model attempts to correct the residual errors of the existing ensemble using Gradient Descent.',
    intuition: 'Imagine an archer. The first arrow hits near the bullseye but is slightly off to the left. The second arrow is aimed specifically to correct that "left-leaning" error. The third arrow corrects what remains. Together, they zero in on the target.',
    mathematics: `GBM minimizes a loss function $L(y, f(x))$ by adding weak learners $h(x)$ iteratively:

$$ f_{m}(x) = f_{m-1}(x) + \\nu \\cdot h_m(x) $$

Where $\\nu$ is the **Learning Rate**. Each $h_m(x)$ is trained to predict the negative gradient (residuals) of the loss function:
$$ r_{im} = -\\left[ \\frac{\\partial L(y_i, f(x_i))}{\\partial f(x_i)} \\right]_{f=f_{m-1}} $$`,
    pros: [
      'Often provides state-of-the-art accuracy on tabular data.',
      'Highly flexible: can optimize various loss functions.',
      'Handles missing data and outliers internally (in some implementations).',
      'Powerful feature importance insights.'
    ],
    cons: [
      'Prone to overfitting if not carefully tuned (learning rate, depth).',
      'Slow to train since trees are built sequentially (cannot be parallelized).',
      'Sensitive to noise in the data.',
      'Requires extensive hyperparameter tuning.'
    ],
    codeSnippet: `from sklearn.ensemble import GradientBoostingClassifier

# XGBoost or LightGBM are popular alternatives to this
gbm = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1)
gbm.fit(X_train, y_train)

# Performance is usually superior to Random Forest on structured data
accuracy = gbm.score(X_test, y_test)`
  },
  {
    id: 'naive-bayes',
    title: 'Naive Bayes',
    category: 'Supervised',
    shortDescription: 'Probabilistic classifier based on Bayes\' Theorem with an assumption of independence.',
    fullDescription: 'Naive Bayes is a probabilistic machine learning model used for classification tasks. It is based on Bayes\' Theorem with the "naive" assumption that every pair of features is independent.',
    intuition: 'If you see an animal that is large, has a trunk, and is grey, Naive Bayes calculates the probability of it being an Elephant by multiplying the probabilities of each trait independently. It\'s fast and remarkably effective for text spam filtering!',
    mathematics: `Based on **Bayes' Theorem**:

$$ P(C|X) = \\frac{P(X|C) P(C)}{P(X)} $$

The "Naive" assumption is:
$$ P(X|C) = P(x_1|C) \\cdot P(x_2|C) \\cdot ... \\cdot P(x_n|C) $$
We choose the class $C$ that maximizes $P(C|X)$.`,
    pros: [
      'Extremely fast for both training and prediction.',
      'Performs well even with a small amount of training data.',
      'Handles high-dimensional data efficiently.',
      'Standard baseline for text classification and spam detection.'
    ],
    cons: [
      'The independence assumption is almost never true in real life.',
      'Probability estimates are often unreliable (though classification is often correct).',
      'Zero Frequency problem: if a category doesn\'t appear in training, it gets 0 probability.'
    ],
    codeSnippet: `from sklearn.naive_bayes import GaussianNB

# Good for continuous features
model = GaussianNB()
model.fit(X_train, y_train)

# For text, MultinomialNB is usually preferred
from sklearn.naive_bayes import MultinomialNB`
  },
  {
    id: 'k-means',
    title: 'K-Means Clustering',
    category: 'Unsupervised',
    shortDescription: 'Partitions data into K distinct clusters based on feature similarity.',
    fullDescription: 'K-Means is an iterative algorithm that partitions a dataset into $K$ pre-defined non-overlapping subgroups (clusters). It assigns points to clusters such that the sum of squared distances to the cluster centroid is minimized.',
    intuition: 'Imagine you have a crowd of people. You pick 3 random people to be "leaders". Everyone else joins the leader closest to them. Then, the leaders move to the center of their new group. Repeat until the groups stop changing!',
    mathematics: `The algorithm minimizes the **Within-Cluster Sum of Squares (WCSS)**:

$$ J = \\sum_{j=1}^{k} \\sum_{i \\in C_j} ||x_i - \\mu_j||^2 $$

Where $\\mu_j$ is the centroid of cluster $C_j$.
1. Assign points to nearest centroid.
2. Update centroids to be the mean of assigned points.`,
    pros: [
      'Scales to very large datasets.',
      'Simple to understand and implement.',
      'Guarantees convergence to a local optimum.',
      'Very efficient computationally.'
    ],
    cons: [
      'Must specify the number of clusters $K$ manually.',
      'Sensitive to the initial placement of centroids (initialization).',
      'Struggles with clusters of varying sizes, densities, or non-spherical shapes.',
      'Outliers can significantly shift the centroids.'
    ],
    codeSnippet: `from sklearn.cluster import KMeans

# Looking for 3 clusters
kmeans = KMeans(n_clusters=3, init='k-means++', random_state=42)
kmeans.fit(X)

# Labels assigned to each point
labels = kmeans.labels_
# Coordinates of the 3 centroids
centroids = kmeans.cluster_centers_`
  },
  {
    id: 'dbscan',
    title: 'DBSCAN',
    category: 'Unsupervised',
    shortDescription: 'Density-based clustering that can find clusters of arbitrary shape and identify noise.',
    fullDescription: 'DBSCAN (Density-Based Spatial Clustering of Applications with Noise) groups together points that are close to each other based on a distance measurement and a minimum number of points.',
    intuition: 'Imagine finding dense "islands" of points in a sea of data. If a point has enough neighbors, it\'s part of a cluster. If a point is in a lonely area, it\'s labeled as "Noise" (outlier). It doesn\'t force every point into a cluster!',
    mathematics: `Defined by two parameters: **Epsilon ($\\epsilon$)** and **MinPoints**.
- **Core Point**: Has $\\ge$ MinPoints within distance $\\epsilon$.
- **Border Point**: Has $<$ MinPoints within $\\epsilon$, but is in the neighborhood of a core point.
- **Noise Point**: Neither core nor border.

Two core points are in the same cluster if they are reachable via a chain of core points.`,
    pros: [
      'Does not require specifying the number of clusters in advance.',
      'Can find clusters of arbitrary shapes (e.g., crescents).',
      'Robust to outliers and identifies them as noise.',
      'Only needs two parameters.'
    ],
    cons: [
      'Struggles with datasets of varying densities.',
      'Sensitive to the choice of $\\epsilon$ and MinPoints.',
      'Distance metric choice is crucial and can be difficult for high-dimensional data.',
      'Not entirely deterministic for border points.'
    ],
    codeSnippet: `from sklearn.cluster import DBSCAN

# eps is the max distance, min_samples is the density threshold
dbscan = DBSCAN(eps=0.5, min_samples=5)
clusters = dbscan.fit_predict(X)

# -1 indicates a noise point (outlier)
n_noise = list(clusters).count(-1)`
  },
  {
    id: 'principal-component-analysis',
    title: 'PCA',
    category: 'Unsupervised',
    shortDescription: 'Reduces the dimensionality of data while preserving as much variance as possible.',
    fullDescription: 'Principal Component Analysis (PCA) is a statistical procedure that uses an orthogonal transformation to convert a set of observations of possibly correlated variables into a set of values of linearly uncorrelated variables called principal components.',
    intuition: 'Imagine taking a 3D shadow of a complex object. You want to rotate the object so the shadow captures as much detail and "spread" as possible. PCA finds the best angles to look at your high-dimensional data.',
    mathematics: `PCA finds the eigenvectors of the data's **Covariance Matrix** $\\Sigma$:

$$ \\Sigma = \\frac{1}{n-1} X^T X $$

The principal components are the eigenvectors corresponding to the largest eigenvalues.
1. Center the data (subtract the mean).
2. Calculate Covariance Matrix.
3. Compute Eigenvalues and Eigenvectors.
4. Project data onto the top $k$ eigenvectors.`,
    pros: [
      'Reduces noise and improves model performance.',
      'Saves computational time and memory.',
      'Allows for visualization of high-dimensional data (e.g., in 2D or 3D).',
      'Removes multicollinearity between features.'
    ],
    cons: [
      'Principal components are linear combinations of features, making them hard to interpret.',
      'May lose important information if the data is non-linearly related.',
      'Highly sensitive to the scaling of the data (must normalize first).'
    ],
    codeSnippet: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# 1. Scale data first!
X_scaled = StandardScaler().fit_transform(X)

# 2. Reduce to 2 dimensions
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print(f"Explained Variance Ratio: {pca.explained_variance_ratio_}")`
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks (MLP)',
    category: 'Deep Learning',
    shortDescription: 'Computational models inspired by the brain, capable of learning complex patterns.',
    fullDescription: 'Multilayer Perceptrons (MLP) consist of an input layer, one or more hidden layers, and an output layer. They use backpropagation and gradient descent to learn weights that minimize error.',
    intuition: 'Information flows through "neurons" that fire if they receive enough signal. By adjusting the "strength" (weights) of connections between neurons based on mistakes, the network learns to recognize complex patterns.',
    mathematics: `A single neuron performs:
$$ z = \\sum w_i x_i + b $$
$$ a = f(z) $$
Where $f$ is an **Activation Function** (e.g., ReLU, Sigmoid).
The network is optimized using **Backpropagation**:
$$ \\Delta w = -\\eta \\frac{\\partial L}{\\partial w} $$
Where $\\eta$ is the learning rate and $L$ is the loss function.`,
    pros: [
      'Universal approximators: can learn any continuous function.',
      'Highly flexible and scalable to massive datasets.',
      'Foundation for state-of-the-art vision, speech, and NLP models.',
      'Learns hierarchical feature representations automatically.'
    ],
    cons: [
      'Requires a massive amount of data to perform well.',
      'Computationally expensive and often requires GPUs.',
      'Hyperparameters (layers, nodes, learning rate) are difficult to tune.',
      'Hard to interpret (The "Black Box" problem).'
    ],
    codeSnippet: `from sklearn.neural_network import MLPClassifier

# Simple MLP with one hidden layer of 100 neurons
mlp = MLPClassifier(hidden_layer_sizes=(100,), max_iter=500)
mlp.fit(X_train, y_train)

# In practice, Deep Learning uses PyTorch or TensorFlow
print(f"Final Loss: {mlp.loss_}")`
  },
  {
    id: 'convolutional-neural-networks',
    title: 'CNNs',
    category: 'Deep Learning',
    shortDescription: 'Neural networks specialized for processing structured grid data like images.',
    fullDescription: 'Convolutional Neural Networks (CNNs) use "convolutional" layers that apply filters to local regions of the input. This allows the network to learn spatial hierarchies of features.',
    intuition: 'Imagine scanning a photo with a small magnifying glass, looking for edges, then shapes, then objects. CNNs do this automatically, learning to see "lines" in the first layers and "faces" in the deep layers.',
    mathematics: `The key operation is the **Convolution**:

$$ (I * K)(i, j) = \\sum_m \\sum_n I(i+m, j+n) K(m, n) $$

Where $I$ is the input image and $K$ is the kernel (filter).
Following convolution, **Pooling** layers (e.g., Max Pooling) reduce dimensionality:
$$ y_{i,j} = \\max(\\text{local neighborhood}) $$`,
    pros: [
      'Achieves state-of-the-art performance in Image Recognition.',
      'Parameter sharing: fewer weights than a fully connected network.',
      'Translation Invariance: recognizes objects regardless of their position.',
      'Automatically learns spatial hierarchies.'
    ],
    cons: [
      'Extremely data and compute hungry.',
      'Requires careful architecture design (depth, stride, padding).',
      'Inefficient for non-grid data (like graphs).',
      'Still largely a "black box".'
    ],
    codeSnippet: `# Typically implemented in PyTorch/TensorFlow
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(3, 16, kernel_size=3)
        self.pool = nn.MaxPoo2d(2, 2)
        self.fc = nn.Linear(16 * 13 * 13, 10) # 10 classes`
  },
  {
    id: 'recurrent-neural-networks',
    title: 'RNNs',
    category: 'Deep Learning',
    shortDescription: 'Neural networks designed for sequential data like text, time-series, or speech.',
    fullDescription: 'Recurrent Neural Networks (RNNs) have connections that form loops, allowing information to persist. They process inputs one by one, maintaining a "hidden state" that acts as memory.',
    intuition: 'Regular networks treat every input as new. RNNs are like reading a book: they remember the previous words to understand the current one. This makes them perfect for translation or predicting stock prices.',
    mathematics: `The hidden state $h_t$ is updated at each step $t$:

$$ h_t = \\tanh(W_h h_{t-1} + W_x x_t + b) $$

The output $y_t$ is then:
$$ y_t = W_y h_t + b_y $$
Longer-term dependencies are often handled by **LSTMs** or **GRUs**, which use "gates" to control information flow.`,
    pros: [
      'Can process inputs of any length.',
      'Models temporal/sequential dependencies effectively.',
      'Memory allows context to influence current predictions.',
      'Standard for NLP and time-series analysis.'
    ],
    cons: [
      'Suffers from Vanishing/Exploding Gradient problems.',
      'Computation is slow because it cannot be parallelized (sequential).',
      'Difficult to capture very long-term dependencies (without LSTM/GRU).',
      'Hard to train and tune.'
    ],
    codeSnippet: `# Example logic for an RNN cell
class SimpleRNNCell(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.xh = nn.Linear(input_size, hidden_size)
        self.hh = nn.Linear(hidden_size, hidden_size)

    def forward(self, x, h_prev):
        h_next = torch.tanh(self.xh(x) + self.hh(h_prev))
        return h_next`
  }
];
