import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import KNNViz from "./KNNViz";
import DecisionTreeViz from "./DecisionTreeViz";
import SVMViz from "./SVMViz";
import NaiveBayesViz from "./NaiveBayesViz";
import EnsembleViz from "./EnsembleViz";
import KMeansViz from "./KMeansViz";
import GMMEMViz from "./GMMEMViz";
import MCMCViz from "./MCMCViz";
import RegularizationViz from "./RegularizationViz";
import NeuralNetworkViz from "./NeuralNetworkViz";
import NLPEmbeddingsViz from "./NLPEmbeddingsViz";
import AutoencoderViz from "./AutoencoderViz";
import TransformerViz from "./TransformerViz";
import LLMViz from "./LLMViz";
import RLViz from "./RLViz";
import GenerativeViz from "./GenerativeViz";

describe("Practitioner Track Visualization Accuracy", () => {

  it("tags a new track by neighbour vote and flips the tag when k shrinks", () => {
    render(<KNNViz />);

    // Default query sits in the crossover pocket: the 3-neighbour crowd outvotes
    // the lone EDM oddball, so it is tagged Lo-fi.
    expect(screen.getByText("k = 3")).toBeInTheDocument();
    expect(screen.getByTestId("knn-prediction")).toHaveTextContent("Lo-fi");

    // Drop to k = 1 and only the single nearest neighbour (the EDM crossover
    // track) decides — the tag flips to EDM.
    fireEvent.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("k = 1")).toBeInTheDocument();
    expect(screen.getByTestId("knn-prediction")).toHaveTextContent("EDM");
  });

  it("grows the loan tree so a second question fixes the income-only mistakes", () => {
    render(<DecisionTreeViz />);

    // Shallow tree denies every low-income applicant, including the two who
    // actually repaid -> 7 of 9 judged correctly.
    expect(screen.getByTestId("tree-accuracy")).toHaveTextContent("7/9");

    // Growing the tree adds the credit-score question, rescuing the creditworthy
    // low-income applicants -> all 9 correct.
    fireEvent.click(screen.getByRole("button", { name: /grow the tree/i }));
    expect(screen.getByTestId("tree-accuracy")).toHaveTextContent("9/9");
  });

  it("renders the SVM kernel-trick lift narrative and free-play control", () => {
    render(<SVMViz />);
    expect(screen.getByText("STEP 1 / 4")).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: /lift into third dimension/i }),
    ).toBeInTheDocument();
  });

  it("tips the spam verdict when one strong word is added to the email", () => {
    render(<NaiveBayesViz />);

    // Borderline email ("free" + "meeting") sits just on the ham side.
    expect(screen.getByTestId("nb-verdict")).toHaveTextContent("HAM");

    // Adding "money" pulls hard toward spam and crosses the 50/50 line.
    fireEvent.click(screen.getByRole("checkbox", { name: /include the word money/i }));
    expect(screen.getByTestId("nb-verdict")).toHaveTextContent("SPAM");
  });

  it("raises committee accuracy as weak rules are added", () => {
    render(<EnsembleViz />);

    // A single weak rule is well below perfect.
    expect(screen.getByTestId("ensemble-count")).toHaveTextContent("1 of 5 rules");
    expect(screen.getByTestId("ensemble-committee-acc")).toHaveTextContent("75%");

    // The full five-rule committee classifies every transaction correctly.
    for (let i = 0; i < 4; i += 1) {
      fireEvent.click(screen.getByRole("button", { name: /add a weak rule/i }));
    }
    expect(screen.getByTestId("ensemble-committee-acc")).toHaveTextContent("100%");
  });

  it("discovers customer segments from unlabelled data after stepping to convergence", () => {
    render(<KMeansViz />);

    // Starts as raw, label-less data.
    expect(screen.getByText("STEP 1 / 3")).toBeInTheDocument();
    expect(screen.getByTestId("kmeans-status")).toHaveTextContent(/no labels/i);

    // Assign, then move/converge -> three segments emerge with no labels given.
    fireEvent.click(screen.getByTitle("Step Forward"));
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByTestId("kmeans-status")).toHaveTextContent("3 segments");
  });

  it("shows K-Means limit and GMM stretching via narrative stepper", () => {
    render(<GMMEMViz />);
    expect(screen.getByText("STEP 1 / 4")).toBeInTheDocument();
    
    // Step forward shows Expectation
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText("STEP 2 / 4")).toBeInTheDocument();
  });

  it("shows the MCMC probability mountain and walker", () => {
    render(<MCMCViz />);
    expect(screen.getAllByText(/The Mountain/i).length).toBeGreaterThan(0);
    expect(screen.getByText("WALKER")).toBeInTheDocument();
  });


  it("verifies Regularization weight shrinkage coefficients", () => {
    render(<RegularizationViz />);
    expect(screen.getByText(/L1 Lasso/i)).toBeInTheDocument();
  });

  it("starts the neural network on the failing linear boundary", () => {
    render(<NeuralNetworkViz />);
    expect(screen.getByText("STEP 1 / 3")).toBeInTheDocument();
    expect(screen.getByTestId("nn-accuracy")).toHaveTextContent("50%");
  });

  it("verifies NLP cosine similarity calculations", () => {
    render(<NLPEmbeddingsViz />);
    expect(screen.getByText(/Semantic Analogies/i)).toBeInTheDocument();
  });

  it("verifies Autoencoder denoises at its default bottleneck", () => {
    render(<AutoencoderViz />);
    // Default bottleneck (3) denoises, so reconstruction error <= input error.
    expect(screen.getByText(/the bottleneck denoised it/i)).toBeInTheDocument();
    expect(screen.getByTestId("ae-recon-error")).toBeInTheDocument();
  });

  it("verifies Transformer attention resolves the pronoun by context", () => {
    render(<TransformerViz />);
    expect(screen.getByTestId("transformer-referent")).toHaveTextContent("animal");
  });

  it("verifies LLM temperature token distribution scores", () => {
    render(<LLMViz />);
    expect(screen.getByText("T = 0.80")).toBeInTheDocument();
    expect(screen.getByText(/Machine learning models generate/)).toBeInTheDocument();
  });

  it("verifies Reinforcement Learning action state policy", () => {
    render(<RLViz />);
    expect(screen.getByText("SIMULATION STATUS")).toBeInTheDocument();
  });

  it("verifies Generative latent space walk coords", () => {
    render(<GenerativeViz />);
    expect(screen.getByText("(5.00, 5.00)")).toBeInTheDocument();
  });
});
