import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import D3Visualization from "./D3Visualization";

function controlRegion(label: RegExp | string) {
  const labelNode = screen.getByText(label);
  const region = labelNode.closest("div");
  if (!region) throw new Error(`Control region not found for ${String(label)}`);
  return within(region);
}

function renderVisualization(algorithmId: string) {
  return render(<D3Visualization algorithmId={algorithmId} />);
}

describe("algorithm visualization interaction contracts", () => {
  it("keeps Bayesian update stepper ordered and gates feed-to-prior until the posterior step", () => {
    renderVisualization("bayesian-inference");

    const feedButton = screen.getByRole("button", { name: /feed to prior/i });
    expect(screen.getByText("STEP 1 / 5")).toBeInTheDocument();
    expect(feedButton).toBeDisabled();

    for (let i = 0; i < 4; i += 1) {
      fireEvent.click(screen.getByTitle("Step Forward"));
    }

    expect(screen.getByText("STEP 5 / 5")).toBeInTheDocument();
    expect(screen.getByText(/MAP:/)).toBeInTheDocument();
    expect(feedButton).not.toBeDisabled();

    fireEvent.click(feedButton);
    expect(screen.getByText("STEP 1 / 5")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset all/i }));
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("updates Bayesian batch controls while preserving k <= n", () => {
    renderVisualization("bayesian-inference");

    expect(screen.getByText("6 / 12 successes (50%)")).toBeInTheDocument();
    fireEvent.click(controlRegion(/Successes k:/).getByRole("button", { name: "+" }));
    expect(screen.getByText("7 / 12 successes (58%)")).toBeInTheDocument();

    fireEvent.click(controlRegion(/Trials n:/).getByRole("button", { name: "-" }));
    expect(screen.getByText("7 / 11 successes (64%)")).toBeInTheDocument();
  });

  it("keeps neural network stepper, target toggle, and feature controls coherent", () => {
    renderVisualization("neural-networks");

    expect(screen.getByText("STEP 1 / 4")).toBeInTheDocument();
    fireEvent.click(controlRegion(/x1 value:/).getByRole("button", { name: "+" }));
    expect(screen.getByText("1.0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /class \+1.0/i }));
    expect(screen.getByRole("button", { name: /class -1.0/i })).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText("STEP 2 / 4")).toBeInTheDocument();
    expect(screen.getByText(/Forward pass computes hidden node activations/i)).toBeInTheDocument();
  });

  it("keeps CNN kernel selection and scan controls synchronized", () => {
    renderVisualization("cnn");

    expect(screen.getByText("STEP 1 / 16")).toBeInTheDocument();
    expect(screen.getByText("Vertical Edge")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /horizontal edge/i }));
    expect(screen.getByText("STEP 1 / 16")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText("STEP 2 / 16")).toBeInTheDocument();
    expect(screen.getByText(/CONVOLUTION DETAILED SUM/i)).toBeInTheDocument();
  });

  it("keeps K-means narrative controls bounded and resettable", () => {
    renderVisualization("clustering");

    expect(screen.getByText("STEP 1 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText("STEP 2 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText("STEP 3 / 3")).toBeInTheDocument();
    expect(screen.getByTitle("Step Forward")).toBeDisabled();

    fireEvent.click(screen.getByTitle("Reset"));
    expect(screen.getByText("STEP 1 / 3")).toBeInTheDocument();
  });

  it("updates KNN k in odd increments and toggles the decision boundary", () => {
    renderVisualization("knn");

    expect(screen.getByText("k = 3")).toBeInTheDocument();
    fireEvent.click(controlRegion(/Neighbor Count/).getByRole("button", { name: "-" }));
    expect(screen.getByText("k = 1")).toBeInTheDocument();
    expect(controlRegion(/Neighbor Count/).getByRole("button", { name: "-" })).toBeDisabled();

    fireEvent.click(controlRegion(/Neighbor Count/).getByRole("button", { name: "+" }));
    fireEvent.click(controlRegion(/Neighbor Count/).getByRole("button", { name: "+" }));
    expect(screen.getByText("k = 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show decision boundary/i }));
    expect(screen.getByRole("button", { name: /hide decision boundary/i })).toBeInTheDocument();
  });

  it("runs linear regression fit controls and exposes SSE/formula readouts", () => {
    renderVisualization("linear-regression");

    expect(screen.getByText("SUM OF SQUARES (SSE)")).toBeInTheDocument();
    expect(screen.getByText("FITTED LINE FORMULA")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /snap to ols fit/i }));
    expect(screen.getByText("FITTED LINE FORMULA")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /run gradient descent/i }));
    expect(screen.getByRole("button", { name: /pause gradient descent/i })).toBeInTheDocument();
  });

  it("keeps SVM soft-margin slider and metrics visible", () => {
    renderVisualization("support-vector-machines");

    expect(screen.getByText("MARGIN WIDTH (2/||w||)")).toBeInTheDocument();
    expect(screen.getByText("SUPPORT VECTORS")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "0.5" } });
    expect(screen.getByRole("slider")).toHaveValue("0.5");
    expect(screen.getByText("SOFT PENALTY (C)")).toBeInTheDocument();
  });

  it("keeps logistic regression accuracy and sigmoid threshold panels visible", () => {
    renderVisualization("logistic-regression");

    expect(screen.getByText("FEATURE SPACE")).toBeInTheDocument();
    expect(screen.getByText("SIGMOID LINK")).toBeInTheDocument();
    expect(screen.getByText("CLASSIFICATION ACCURACY")).toBeInTheDocument();
  });

  it("increments ensemble learners only within the supported stump range", () => {
    renderVisualization("ensemble-learning");

    expect(screen.getByText("1 Stumps")).toBeInTheDocument();
    expect(controlRegion("Weak Learners (Stumps):").getByRole("button", { name: "-" })).toBeDisabled();

    for (let i = 0; i < 4; i += 1) {
      fireEvent.click(controlRegion("Weak Learners (Stumps):").getByRole("button", { name: "+" }));
    }

    expect(screen.getByText("5 Stumps")).toBeInTheDocument();
    expect(controlRegion("Weak Learners (Stumps):").getByRole("button", { name: "+" })).toBeDisabled();
  });

  it("toggles PCA projection without losing the variance readout", () => {
    renderVisualization("dimensionality-reduction");

    expect(screen.getByText(/Variance Captured/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /collapse points onto axis/i }));
    expect(screen.getByRole("button", { name: /restore 2d coordinates/i })).toBeInTheDocument();
  });

  it("stages MCMC proposals, resolves them, and resets collected samples", () => {
    vi.useFakeTimers();
    renderVisualization("mcmc");

    fireEvent.click(screen.getByRole("button", { name: /mcmc step/i }));
    expect(screen.getByRole("button", { name: /mcmc step/i })).toBeDisabled();
    expect(screen.getByText("Acceptance Ratio (α):")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(950);
    });

    expect(screen.getByRole("button", { name: /reset sampler/i })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /reset sampler/i }));
    expect(screen.getByRole("button", { name: /reset sampler/i })).toBeDisabled();
    vi.useRealTimers();
  });

  it("toggles MCMC trace and speed controls", () => {
    renderVisualization("mcmc");

    expect(screen.getByRole("button", { name: "ON" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ON" }));
    expect(screen.getByRole("button", { name: "OFF" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /fast/i }));
    expect(screen.getByRole("button", { name: /fast/i })).toBeInTheDocument();
  });

  it("updates computer vision presets, threshold, and isolation mode", () => {
    renderVisualization("computer-vision");

    expect(screen.getByText("PAINT CANVAS")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CLEAR" }));
    expect(screen.getByText("Active: 1.5")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("slider"), { target: { value: "3.5" } });
    expect(screen.getByText("Active: 3.5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /all cells/i }));
    expect(screen.getByRole("button", { name: /isolate/i })).toBeInTheDocument();
  });

  it("walks NLP analogy state through king - man + woman", () => {
    renderVisualization("nlp");

    fireEvent.click(screen.getByRole("button", { name: /run analogy step/i }));
    expect(screen.getByText("Vector(king)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /subtract man/i }));
    expect(screen.getByText("Vector(king) - Vector(man)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add woman/i }));
    expect(screen.getByText("Vector(king) - Vector(man) + Vector(woman)")).toBeInTheDocument();
    expect(screen.getByText(/NEAREST WORD:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear arrows/i }));
    expect(screen.getByRole("button", { name: /clear arrows/i })).toBeDisabled();
  });

  it("toggles transformer single-head and multi-head attention modes", () => {
    renderVisualization("transformers");

    expect(screen.getByRole("button", { name: /single-head attention/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /single-head attention/i }));
    expect(screen.getByRole("button", { name: /multi-head attention/i })).toBeInTheDocument();
    expect(screen.getByText("ATTENTION HEATMAP")).toBeInTheDocument();
  });

  it("updates LLM temperature and sampling mode UI without corrupting context", () => {
    renderVisualization("llms");

    expect(screen.getByText(/Machine learning models generate/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "2.0" } });
    expect(screen.getByText("T = 2.00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /random sample/i }));
    fireEvent.click(screen.getByRole("button", { name: /reset sentence/i }));
    expect(screen.getByText(/Machine learning models generate/)).toBeInTheDocument();
  });

  it("toggles autoencoder bottleneck width readouts via pointer drag", () => {
    renderVisualization("autoencoders");
    const image = screen.getByRole("img", { name: /autoencoder bottleneck/i });

    expect(screen.getByText("COMPRESSION RATIO")).toBeInTheDocument();
    fireEvent.pointerDown(image, { pointerId: 1, clientX: 320, clientY: 220 });
    fireEvent.pointerMove(image, { pointerId: 1, clientX: 410, clientY: 220 });
    fireEvent.pointerUp(image, { pointerId: 1 });
    expect(screen.getByText("RECONSTRUCTION ERROR")).toBeInTheDocument();
  });

  it("toggles regularization geometry and keeps sparse weight readouts visible", () => {
    renderVisualization("regularization");

    expect(screen.getByRole("button", { name: /l1 lasso/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /l2 ridge/i }));
    expect(screen.getByText("REGULARIZED WEIGHTS")).toBeInTheDocument();
    expect(screen.getByText(/L2 Ridge/i)).toBeInTheDocument();
  });

  it("updates evaluation threshold metrics from the slider", () => {
    renderVisualization("evaluation-metrics");

    expect(screen.getByText(/CONFUSION MATRIX/)).toBeInTheDocument();
    expect(screen.getAllByText(/Precision/i).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "7" } });
    expect(screen.getByText("T = 7.0")).toBeInTheDocument();
  });

  it("moves reinforcement-learning policy controls and resets Q-table", () => {
    renderVisualization("reinforcement-learning");

    expect(screen.getByText("SIMULATION STATUS")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "RIGHT" }));
    expect(screen.getByText("ACCUMULATED REWARD:")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /auto explore/i }));
    expect(screen.getByRole("button", { name: /pause auto run/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reset q-table/i }));
    expect(screen.getByRole("button", { name: /auto explore/i })).toBeInTheDocument();
  });

  it("updates generative latent coordinates and interpolation mode", () => {
    renderVisualization("generative-models");

    expect(screen.getByText("(5.00, 5.00)")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("img", { name: /latent space walk/i }), {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });
    expect(screen.queryByText("(5.00, 5.00)")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /interpolation/i }));
    expect(screen.getByRole("button", { name: /run interpolation walker/i })).toBeInTheDocument();
  });

  it("keeps bias-variance complexity slider tied to underfit/overfit labels", () => {
    renderVisualization("bias-variance");

    expect(screen.getByText(/OPTIMAL BALANCE/i)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
    expect(screen.getByText(/UNDERFITTING/i)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "7" } });
    expect(screen.getByText(/OVERFITTING/i)).toBeInTheDocument();
  });
});
