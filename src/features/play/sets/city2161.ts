import type { CourseSection, QuestionSet } from "../types";
import { figuresFrom } from "./figures";

/**
 * CITY2161 Data Modelling and Machine Learning for Cyber Security (FHEQ
 * Level 5), City College Plymouth / University of Plymouth. A general
 * knowledge check of the machine learning topics, 4 to 10, written from the
 * module's Lecture Companions in academic-materials
 * (modules/data-modelling-and-machine-learning) and in their terms, with
 * their examples: phishing websites, spambase, card fraud, KDD Cup 1999 and
 * phishing hosts.
 *
 * Level 5 plays in the plain style: every question once, speed points and the
 * leaderboard. The questions run in topic order here; the game shuffles them.
 *
 * Pictures are rendered from scripts/play-figures/city2161.html. Their
 * numbers are invented, round enough to work out in the time.
 */

const figure = figuresFrom("city2161");

export const mlCheck: QuestionSet = {
  id: "city2161-ml-check",
  course: "CITY2161 · Data modelling and machine learning",
  title: "Machine learning · knowledge check",
  spec: "LO2–LO4 · Topics 4–10",
  seconds: 30,
  questions: [
    // Topic 4 · Paradigms
    {
      id: "paradigm-supervised",
      prompt: "A phishing detector is trained on 11,000 websites, each marked phishing or legitimate by a person. What kind of learning is this?",
      choices: [{ text: "Supervised" }, { text: "Unsupervised" }, { text: "Semi-supervised" }, { text: "Reinforcement" }],
      answer: 0,
      explanation: "Every training example carries a label, the answer a person recorded, and the model learns to predict it. Unsupervised learning has no labels; semi-supervised has a few labels and many unlabelled examples.",
    },
    {
      id: "tree-read",
      prompt: "Which site does this tree call legitimate?",
      image: figure("phishing-tree", "A decision tree. The root asks: does the URL contain @? Yes leads to Phishing. No leads to: domain under 6 months old? No leads to Legitimate. Yes leads to: does it use HTTPS? Yes leads to Legitimate, No leads to Phishing."),
      choices: [
        { text: "No @, domain 3 years old, no HTTPS" },
        { text: "Has @, domain 3 years old, uses HTTPS" },
        { text: "No @, domain 2 months old, no HTTPS" },
      ],
      answer: 0,
      explanation: "A tree asks one question about one feature at each node and follows the answer to a leaf. No @ and an old domain reach Legitimate after two questions: HTTPS is only asked of young domains.",
    },
    {
      id: "twins-in-test",
      prompt: "Many websites in a dataset have an exact copy. After a random split, copies sit in both the training and the test set. What happens to the test score?",
      choices: [
        { text: "It rises: the model is tested on sites it has already seen" },
        { text: "It falls: the copies confuse the model" },
        { text: "Nothing: a random split is always fair" },
        { text: "It becomes impossible to compute" },
      ],
      answer: 0,
      explanation: "A held-out test set must hold examples the model has not seen. A twin in training lets a flexible model, such as an unlimited tree, recall the answer instead of generalising. Remove duplicates before splitting.",
    },
    {
      id: "label-noise",
      prompt: "One training label in ten is flipped at random. Which model loses the most test accuracy?",
      choices: [{ text: "A decision tree with no depth limit" }, { text: "Logistic regression" }, { text: "A decision tree limited to depth 3" }],
      answer: 0,
      explanation: "An unlimited tree keeps splitting until it fits every training example, wrong labels included, so it learns the noise as if it were real. Simpler models cannot bend that far and average the noise away.",
    },
    {
      id: "self-training",
      prompt: "In self-training, which unlabelled examples does the model label and add to its training data first?",
      choices: [
        { text: "The ones it is surest about" },
        { text: "The ones it is least sure about" },
        { text: "A random sample" },
        { text: "The ones nearest the decision boundary" },
      ],
      answer: 0,
      explanation: "The loop labels what it is most confident about and refits. Those are examples it already gets right, so they teach it little: one reason self-training often gains less than hoped.",
    },

    // Topic 5 · Supervised learning I
    {
      id: "sigmoid",
      prompt: "A logistic regression spam filter gives an email a weighted sum of 1.5. About what probability of spam does the sigmoid turn that into?",
      choices: [{ text: "0.82" }, { text: "0.50" }, { text: "0.18" }, { text: "1.5" }],
      answer: 0,
      seconds: 40,
      explanation: "The sigmoid is 1 ÷ (1 + e^(−z)). With z = 1.5, e^(−1.5) ≈ 0.22, so 1 ÷ 1.22 ≈ 0.82. A sum of 0 would give exactly 0.5, and negative sums give less than a half.",
    },
    {
      id: "george",
      prompt: "In the spambase data, the word 'george' carries one of the strongest 'not spam' weights. Why?",
      choices: [
        { text: "The genuine emails came from one person's inbox: George's" },
        { text: "Spammers avoid common first names" },
        { text: "Emails that name a person are always genuine" },
        { text: "The filter was told to trust that word" },
      ],
      answer: 0,
      explanation: "Spambase's genuine mail was collected from George Forman's own inbox at HP, so his name marks it. The weight is real in this data and useless anywhere else: a model learns how the data was gathered as readily as the task.",
    },
    {
      id: "scaling",
      prompt: "You scale every column to mean 0 and spread 1. Which model's predictions change?",
      choices: [{ text: "k nearest neighbours" }, { text: "A decision tree" }, { text: "A random forest" }],
      answer: 0,
      explanation: "Nearest neighbours compares distances, and an unscaled column with large values dominates them. A tree only asks whether a value is above a threshold, and scaling keeps the order of values, so its splits, and forests of them, are unchanged.",
    },
    {
      id: "boosting",
      prompt: "Gradient boosting adds small trees one at a time. What is each new tree fitted to?",
      choices: [
        { text: "The errors of the trees before it" },
        { text: "A fresh random resample of the data" },
        { text: "A random choice of columns, then a vote" },
        { text: "The examples the first tree got right" },
      ],
      answer: 0,
      explanation: "Each tree corrects what the ensemble so far gets wrong, so boosting builds its trees in sequence. Resamples, random columns and a vote describe a random forest, whose trees are grown independently.",
    },
    {
      id: "threshold",
      prompt: "A spam filter's threshold is raised from 0.5 to 0.95. What happens?",
      choices: [
        { text: "Fewer real emails are lost, and more spam gets through" },
        { text: "More spam is caught, and more real emails are lost" },
        { text: "The model's weights are refitted" },
        { text: "Nothing: the probabilities stay the same" },
      ],
      answer: 0,
      explanation: "The threshold does not change the model, only where it draws the line. A higher threshold calls fewer emails spam: fewer false alarms, more misses. Where to set it depends on what each mistake costs.",
    },

    // Topic 6 · Evaluation
    {
      id: "accuracy-never",
      prompt: "0.17% of card payments are fraud. How accurate is a detector that never flags anything?",
      choices: [{ text: "99.83%" }, { text: "0.17%" }, { text: "50%" }, { text: "0%" }],
      answer: 0,
      explanation: "It is right about every genuine payment, 99.83% of them, and catches no fraud at all. On rare classes accuracy mostly measures the majority, which is why precision and recall are reported instead.",
    },
    {
      id: "precision",
      prompt: "What is this fraud detector's precision?",
      image: figure("confusion-matrix", "A confusion matrix for a fraud detector on 100,000 test payments. Really fraud: 80 flagged, 20 not flagged. Really genuine: 320 flagged, 99,580 not flagged."),
      choices: [{ text: "20%" }, { text: "80%" }, { text: "25%" }, { text: "99.7%" }],
      answer: 0,
      seconds: 40,
      explanation: "Precision is the share of flagged payments that really were fraud: 80 ÷ (80 + 320) = 20%. Recall, the share of frauds caught, is 80 ÷ 100 = 80%, and accuracy is 99.7%, which hides that four alerts in five are false.",
    },
    {
      id: "recall",
      prompt: "A detector raised 240 alerts and caught 60 of the 100 frauds in the test set. What is its recall?",
      choices: [{ text: "60%" }, { text: "25%" }, { text: "40%" }, { text: "24%" }],
      answer: 0,
      seconds: 40,
      explanation: "Recall is the share of real positives that were flagged: 60 ÷ 100 = 60%. Its precision is 60 ÷ 240 = 25%. Recall answers 'what did we miss?', precision 'how many alerts were worth checking?'.",
    },
    {
      id: "ap-floor",
      prompt: "A model gives every payment a random score. What average precision does it get?",
      choices: [{ text: "The base rate, the share of fraud" }, { text: "0.5" }, { text: "0" }, { text: "1" }],
      answer: 0,
      explanation: "With random scores, frauds are spread evenly down the ranking, so precision everywhere is the share of fraud. 0.5 is the floor for ROC AUC, not for average precision: read each score against its own floor.",
    },
    {
      id: "stratify",
      prompt: "Why use stratified folds for cross-validation on fraud data?",
      choices: [
        { text: "So every fold holds the same share of fraud" },
        { text: "So every fold holds the same number of rows" },
        { text: "So the folds are sorted by date" },
        { text: "So no fold holds any fraud" },
      ],
      answer: 0,
      explanation: "With only a few hundred frauds, plain random folds can hold very different numbers of them, and the fold scores then differ by construction, not just by luck. Stratification keeps each class's share the same in every fold.",
    },
    {
      id: "choose-on-test",
      prompt: "You try three settings of gradient boosting, score each on the test set, and report the best. What is wrong?",
      choices: [
        { text: "The reported score is too optimistic" },
        { text: "Nothing, as long as the test set is large" },
        { text: "The reported score is too pessimistic" },
        { text: "Hyperparameters cannot be compared" },
      ],
      answer: 0,
      explanation: "The best of several noisy scores is the luckiest one, so it overstates how the chosen model will do on new data. Choose settings by cross-validation on the training data, and use the test set once, at the end.",
    },
    {
      id: "calibration",
      prompt: "Fitting with class_weight=\"balanced\" counts each fraud hundreds of times. What does that do to the model's probabilities?",
      choices: [
        { text: "They overstate how likely fraud is" },
        { text: "They become perfectly calibrated" },
        { text: "They understate how likely fraud is" },
        { text: "Nothing: weights only change the ranking" },
      ],
      answer: 0,
      explanation: "The model is fitted as though fraud were common, and says so: its probabilities run far above the real share of fraud. The ranking can stay just as good, so the review queue is fine while a '0.7' no longer means seven in ten.",
    },

    // Topic 7 · Unsupervised learning and anomaly detection
    {
      id: "one-hot",
      prompt: "A column holds the protocol: tcp, udp or icmp. How should it go into k-means?",
      choices: [
        { text: "As three 0/1 columns, one for each protocol" },
        { text: "As one column: tcp = 1, udp = 2, icmp = 3" },
        { text: "Left as text" },
        { text: "Dropped: k-means cannot use categories" },
      ],
      answer: 0,
      explanation: "Coding them 1, 2, 3 tells a distance-based method that icmp is twice as far from tcp as udp is, which means nothing. One-hot encoding puts every protocol the same distance from the others.",
    },
    {
      id: "novelty",
      prompt: "You fit an anomaly detector only on traffic known to be clean, then score new traffic against it. What is this called?",
      choices: [{ text: "Novelty detection" }, { text: "Outlier detection" }, { text: "Clustering" }, { text: "Self-training" }],
      answer: 0,
      explanation: "Novelty detection learns what normal looks like from clean data and flags what departs from it. Outlier detection fits and scores the same data, anomalies included, so attacks in it can be learned as normal.",
    },
    {
      id: "isolation-forest",
      prompt: "How does Isolation Forest decide that a connection is anomalous?",
      choices: [
        { text: "It is isolated after only a few random cuts" },
        { text: "It is far from the nearest cluster centre" },
        { text: "Its label says it is an attack" },
        { text: "It has more neighbours than usual" },
      ],
      answer: 0,
      explanation: "Isolation Forest cuts random columns at random values. A point unlike the rest ends up on its own after few cuts; a point in a dense crowd takes many. Short average path, high anomaly score.",
    },
    {
      id: "flood",
      prompt: "A flood attack sends thousands of near-identical connections. Why can an anomaly detector miss it?",
      choices: [
        { text: "It is dense, not rare: it looks like a large normal group" },
        { text: "Its connections are too short to measure" },
        { text: "Anomaly detectors ignore network traffic" },
        { text: "It has no features to score" },
      ],
      answer: 0,
      explanation: "Anomaly detectors flag what is rare or sparse. Thousands of identical connections form one of the densest regions in the data, so a flood can look more normal than a rare but harmless connection.",
    },

    // Topic 8 · Neural networks
    {
      id: "one-neuron",
      prompt: "A single artificial neuron with a sigmoid activation is the same model as…",
      choices: [{ text: "Logistic regression" }, { text: "Linear regression" }, { text: "A decision tree" }, { text: "k-means" }],
      answer: 0,
      explanation: "A neuron takes a weighted sum of its inputs plus a bias and passes it through an activation. With the sigmoid, that is exactly logistic regression. Networks gain their power from hidden layers of such neurons with non-linear activations.",
    },
    {
      id: "relu",
      prompt: "What does the ReLU activation do to a neuron's weighted sum of −3?",
      choices: [{ text: "Turns it into 0" }, { text: "Leaves it as −3" }, { text: "Turns it into 3" }, { text: "Squashes it to about 0.05" }],
      answer: 0,
      explanation: "ReLU passes a positive sum through unchanged and turns a negative one into 0. Squashing to about 0.05 is what the sigmoid would do. Without a non-linear activation, stacked layers collapse into one weighted sum.",
    },
    {
      id: "early-stopping",
      prompt: "With early stopping, which epoch's weights should be kept?",
      image: figure("loss-curves", "A line chart of loss against epoch, 1 to 20. Training loss falls steadily from about 0.65 to about 0.06. Validation loss falls to a lowest point of about 0.25 at epoch 6, then rises to about 0.5 by epoch 20."),
      choices: [{ text: "Epoch 6" }, { text: "Epoch 20" }, { text: "Epoch 2" }, { text: "Epoch 12" }],
      answer: 0,
      explanation: "Validation loss is lowest at epoch 6. After that the training loss keeps falling while the validation loss rises: the network is learning its training hosts rather than the pattern, which is overfitting.",
    },
    {
      id: "validation-not-test",
      prompt: "Why choose the stopping epoch on validation hosts, and not on the test hosts?",
      choices: [
        { text: "Otherwise the test score is no longer an honest estimate" },
        { text: "The test hosts are too few to compute a loss" },
        { text: "Validation hosts train the network faster" },
        { text: "The test hosts have no labels" },
      ],
      answer: 0,
      explanation: "Anything chosen by looking at the test set has been fitted to it, a little. The test set must answer one question, once, at the end; the validation set is the one used for choices along the way.",
    },

    // Topic 9 · ML for cyber security
    {
      id: "never-seen-family",
      prompt: "An intrusion detector scores 99% on a random split of KDD Cup 1999. Why does that overstate how well it catches new attacks?",
      choices: [
        { text: "Every attack family in the test set also appears in training" },
        { text: "The test set is too small" },
        { text: "Random splits remove the attacks" },
        { text: "KDD Cup 1999 has no normal traffic" },
      ],
      answer: 0,
      explanation: "A random split tests the closed-world assumption: tomorrow's attacks look like today's. To measure the detection of new attacks, hold a whole attack family out of training and test on it.",
    },
    {
      id: "alert-budget",
      prompt: "A team can investigate 300 alerts a day on 2 million normal connections. What false-alarm rate can it afford, at most?",
      choices: [{ text: "0.015%" }, { text: "0.15%" }, { text: "1.5%" }, { text: "15%" }],
      answer: 0,
      seconds: 40,
      explanation: "300 ÷ 2,000,000 = 0.00015, or 0.015%. A detector with a 1% false-alarm rate, which sounds good, would raise 20,000 alerts a day. Set the limit from the alert budget, not from the rate.",
    },

    // Topic 10 · Critical evaluation
    {
      id: "shortcut",
      prompt: "A phishing model scores 99.9%. With its three most important features removed, it still scores over 99%. What is the most likely explanation?",
      choices: [
        { text: "The two classes were collected differently, and it learned that" },
        { text: "Phishing is easy to detect" },
        { text: "The features it lost were noise" },
        { text: "The model is too simple" },
      ],
      answer: 0,
      explanation: "When almost any feature separates the classes, the model is probably reading how the data was gathered, such as the shape of the URLs from each source, not phishing itself. That is shortcut learning, and it fails on new data.",
    },
    {
      id: "baseline",
      prompt: "Before claiming a new detector works, what should you compare it with first?",
      choices: [
        { text: "A simple baseline, such as a one-line rule" },
        { text: "The best result in a published paper" },
        { text: "A larger neural network" },
        { text: "Its own training accuracy" },
      ],
      answer: 0,
      explanation: "If a single split or a few rules catch most attacks with as few false alarms, the model adds little. A published result on different data is an inappropriate baseline, and training accuracy measures nothing about new data.",
    },
    {
      id: "good-word",
      prompt: "Spammers start adding words common in genuine mail, such as 'meeting', to their emails. What is this?",
      choices: [{ text: "An evasion attack" }, { text: "Label noise" }, { text: "A poisoning attack" }, { text: "Overfitting" }],
      answer: 0,
      explanation: "This is a good-word attack, a kind of evasion: the input is changed at test time so that the detector misclassifies it. Poisoning changes the training data instead. A filter that weighs words can be steered by anyone who knows its weights.",
    },
  ],
};

export const sections: CourseSection[] = [{ title: "Topics 4–10 · Machine learning", sets: [mlCheck] }];
