import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import D3Visualization from "./D3Visualization";

const routedVisualizations = [
  ["calculus", "Derivative as Local Linear Motion", "Derivative Limit Visualizer"],
  ["linear-algebra", "Vectors, Projection, and Basis Change", "Linear Algebra Projection & Basis"],
  ["probability-theory", "Probability as Long-Run Frequency", "Probability Sampling Convergence"],
  ["maximum-likelihood", "Likelihood Pulls the Model Toward Observations", "Maximum Likelihood Optimization"],
  ["bayesian-inference", "Bayesian Updating as Distribution Reweighting", "Bayesian updating stepper"],
  ["linear-regression", "Least Squares as Residual Geometry", "Linear Regression Residuals"],
  ["logistic-regression", "A Linear Boundary Feeding a Sigmoid", "Logistic Regression thresholding"],
  ["knn", "KNN as a Local Voting Radius", "K-Nearest Neighbors Neighborhood"],
  ["instance-based-trees", "Decision Trees Partition Space", "Decision Tree Space Partition"],
  ["support-vector-machines", "SVM Maximizes the Separating Margin", "SVM Maximum Margin Hyperplane"],
  ["clustering", "K-Means Alternates Assignment and Movement", "K-Means Clustering Iterations"],
  ["ensemble-learning", "Weak Learners Add Into a Strong Surface", "Ensemble Voting Boosting Surface"],
  ["dimensionality-reduction", "Projection Trades Detail for Variance", "Principal Component Analysis Projection"],
  ["mcmc", "MCMC Explores a Target Distribution by Walking", "MCMC Metropolis-Hastings Walker"],
  ["neural-networks", "Neural Networks Learn by Passing Error Backward", "Backpropagation Neural Network"],
  ["cnn", "CNN Kernels Scan Local Patterns", "Convolutional Neural Network Scanner"],
  ["computer-vision", "Computer Vision Builds Features From Pixels", "Computer Vision Sandbox"],
  ["nlp", "Embeddings Turn Words Into Geometry", "NLP Embeddings Analogy Grid"],
  ["autoencoders", "Autoencoders Compress Through a Bottleneck", "Autoencoder Bottleneck Compression"],
  ["transformers", "Transformers Route Information With Attention", "Transformer Self-Attention Layer"],
  ["llms", "LLMs Sample the Next Token From a Distribution", "LLM Temperature Logits Scaling"],
  ["reinforcement-learning", "Reinforcement Learning Improves a Policy by Rollout", "Q-Learning Reinforcement Learning Gridworld"],
  ["generative-models", "Generative Models Sample From Latent Space", "Generative Models Latent Space Walk"],
  ["bias-variance", "Bias-Variance Is a Complexity Tradeoff", "Bias-Variance Tradeoff Curves"],
  ["regularization", "Regularization Constrains the Optimum", "Regularization Loss Contours"],
  ["evaluation-metrics", "Metrics Depend on the Decision Threshold", "Evaluation Metrics Overlapping Distributions"],
] as const;

describe("D3Visualization router", () => {
  it.each(routedVisualizations)(
    "renders %s with its routed title and accessible SVG",
    (algorithmId, title, imageLabel) => {
      render(<D3Visualization algorithmId={algorithmId} />);

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText("Interactive Diagram")).toBeInTheDocument();
      expect(screen.getByText("Key Insight")).toBeInTheDocument();
      expect(screen.getByRole("img", { name: imageLabel })).toBeInTheDocument();
    },
  );

  it("falls back to the legacy linear-regression slider for unknown algorithm ids", () => {
    render(<D3Visualization algorithmId="missing-module" />);

    expect(screen.getAllByText("Least Squares as Residual Geometry").length).toBeGreaterThan(0);
    expect(screen.getByText("Slope Trial")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("56");

    fireEvent.change(screen.getByRole("slider"), { target: { value: "90" } });
    expect(screen.getByRole("slider")).toHaveValue("90");
    expect(screen.getByText("m=1.26")).toBeInTheDocument();
  });

  it("supports direct calculus and probability controls", () => {
    const { rerender } = render(<D3Visualization algorithmId="calculus" />);

    fireEvent.click(screen.getByRole("button", { name: /take the limit/i }));
    expect(screen.getByRole("button", { name: /limit in progress/i })).toBeDisabled();

    rerender(<D3Visualization algorithmId="probability-theory" />);
    fireEvent.click(screen.getByRole("button", { name: /drop 1 sample/i }));
    expect(screen.getByText(/TOTAL TRIALS/)).toBeInTheDocument();
    expect(screen.getByText(/TOTAL VARIATION DISTANCE/)).toBeInTheDocument();
  });

  it("supports narrative and direct-manipulation controls across representative visualizations", () => {
    const { rerender } = render(<D3Visualization algorithmId="clustering" />);
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText(/ASSIGN/)).toBeInTheDocument();

    rerender(<D3Visualization algorithmId="knn" />);
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("k = 5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /show decision boundary/i }));
    expect(screen.getByRole("button", { name: /hide decision boundary/i })).toBeInTheDocument();

    rerender(<D3Visualization algorithmId="llms" />);
    fireEvent.click(screen.getByRole("button", { name: /random sample/i }));
    fireEvent.click(screen.getByRole("button", { name: /sample next word/i }));
    expect(screen.getByRole("button", { name: /sample next word/i })).toBeDisabled();

    const llmImage = screen.getByRole("img", { name: "LLM Temperature Logits Scaling" });
    expect(within(llmImage).getByText("PROBABILITY WHEEL")).toBeInTheDocument();
  });
});
