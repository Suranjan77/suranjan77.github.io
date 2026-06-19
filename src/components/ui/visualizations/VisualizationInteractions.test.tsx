import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  it("collects A/B evidence and leaves the no-data state", () => {
    renderVisualization("bayesian-inference");

    // No data yet: beliefs are flat and the decision is undecided.
    expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
    expect(screen.getByText(/keep testing — too close/i)).toBeInTheDocument();
    expect(screen.getAllByText("Variant A").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /collect 200 visitors/i }));
    expect(screen.queryByText(/no data yet/i)).not.toBeInTheDocument();
  });

  it("resets the A/B experiment and exposes the true-gap slider", () => {
    renderVisualization("bayesian-inference");

    fireEvent.click(screen.getByRole("button", { name: /collect 50 visitors/i }));
    fireEvent.click(screen.getByRole("button", { name: /reset the experiment/i }));
    expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: /variant b true rate/i }),
    ).toBeInTheDocument();
  });

  it("bends the neural-network boundary as hidden neurons are added", () => {
    renderVisualization("neural-networks");

    // Step 1: a single line cannot separate XOR — accuracy is stuck at 50%.
    expect(screen.getByText("STEP 1 / 3")).toBeInTheDocument();
    expect(screen.getByTestId("nn-accuracy")).toHaveTextContent("50%");

    // Adding two hidden neurons (two folds) wraps every cluster -> 100%.
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText("STEP 2 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText("STEP 3 / 3")).toBeInTheDocument();
    expect(screen.getByTestId("nn-accuracy")).toHaveTextContent("100%");
    expect(screen.getByTitle("Step Forward")).toBeDisabled();
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

  it("updates KNN k in odd increments and toggles the genre map", () => {
    renderVisualization("knn");

    expect(screen.getByText("k = 3")).toBeInTheDocument();
    fireEvent.click(controlRegion(/Neighbor Count/).getByRole("button", { name: "-" }));
    expect(screen.getByText("k = 1")).toBeInTheDocument();
    expect(controlRegion(/Neighbor Count/).getByRole("button", { name: "-" })).toBeDisabled();

    fireEvent.click(controlRegion(/Neighbor Count/).getByRole("button", { name: "+" }));
    fireEvent.click(controlRegion(/Neighbor Count/).getByRole("button", { name: "+" }));
    expect(screen.getByText("k = 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show the genre map/i }));
    expect(screen.getByRole("button", { name: /hide the genre map/i })).toBeInTheDocument();
  });

  it("fits multivariable regression so error drops and R^2 rises", () => {
    renderVisualization("linear-regression");

    const sseEl = screen.getByTestId("linear-regression-sse");
    const sse0 = Number(sseEl.textContent);
    expect(screen.getByTestId("linear-regression-r2")).toHaveTextContent("0.00");

    // Scrub the training slider to fully fitted.
    const slider = screen.getByRole("slider", { name: /training progress/i });
    fireEvent.change(slider, { target: { value: "1" } });
    expect(Number(screen.getByTestId("linear-regression-sse").textContent)).toBeLessThan(sse0);
    expect(Number(screen.getByTestId("linear-regression-r2").textContent)).toBeGreaterThan(0.95);

    // Scrubbing back returns to the untrained state.
    fireEvent.change(slider, { target: { value: "0" } });
    expect(screen.getByTestId("linear-regression-r2")).toHaveTextContent("0.00");
    expect(screen.getByRole("button", { name: /fit the weights/i })).toBeInTheDocument();
  });

  it("advances the SVM kernel-trick narrative and scrubs the lift control", () => {
    renderVisualization("support-vector-machines");

    // Guided narrative starts on the flat 2D tangle beat.
    expect(screen.getByText("STEP 1 / 4")).toBeInTheDocument();
    expect(screen.getByText(/trapped inside/i)).toBeInTheDocument();

    // The free-play lift slider scrubs the 2D->3D morph and overrides the beat.
    const slider = screen.getByRole("slider", { name: /lift into third dimension/i });
    fireEvent.change(slider, { target: { value: "1" } });
    expect(slider).toHaveValue("1");
    expect(screen.getByText(/flat plane now sits cleanly/i)).toBeInTheDocument();

    // Using the narrative controls resumes guided mode at the next beat.
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText("STEP 2 / 4")).toBeInTheDocument();
    expect(screen.getByText(/outer ring floats up/i)).toBeInTheDocument();
  });

  it("moves the logistic-regression threshold and trades misses for false alarms", () => {
    renderVisualization("logistic-regression");

    expect(screen.getByTestId("logistic-accuracy")).toHaveTextContent("80% (8/10)");
    const slider = screen.getByRole("slider", { name: /decision threshold/i });
    fireEvent.change(slider, { target: { value: "0.9" } });
    expect(slider).toHaveValue("0.9");
    // raising the bar should change how many real passes get missed
    expect(screen.getByText(/missed passes/i)).toBeInTheDocument();
  });

  it("grows the weak-rule committee within range and raises committee accuracy", () => {
    renderVisualization("ensemble-learning");

    // One weak rule alone is mediocre.
    expect(screen.getByTestId("ensemble-count")).toHaveTextContent("1 of 5 rules");
    expect(screen.getByRole("button", { name: /remove a weak rule/i })).toBeDisabled();
    const singleAcc = Number(screen.getByTestId("ensemble-committee-acc").textContent!.replace("%", ""));

    for (let i = 0; i < 4; i += 1) {
      fireEvent.click(screen.getByRole("button", { name: /add a weak rule/i }));
    }

    // Full committee is bounded and strictly better than the single rule.
    expect(screen.getByTestId("ensemble-count")).toHaveTextContent("5 of 5 rules");
    expect(screen.getByRole("button", { name: /add a weak rule/i })).toBeDisabled();
    expect(screen.getByTestId("ensemble-committee-acc")).toHaveTextContent("100%");
    expect(singleAcc).toBeLessThan(100);
  });

  it("keeps more variance as the PCA component slider increases", () => {
    renderVisualization("dimensionality-reduction");

    const slider = screen.getByRole("slider", { name: /number of components k/i });
    fireEvent.change(slider, { target: { value: "1" } });
    expect(screen.getByText(/of variance kept/i)).toBeInTheDocument();
    expect(screen.getByText(/barely there|average tone/i)).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: "40" } });
    expect(slider).toHaveValue("40");
    expect(
      screen.getAllByText(/compression win of dimensionality reduction/i).length,
    ).toBeGreaterThan(0);
  });

  it("advances MCMC narrative steps through rules and run", () => {
    renderVisualization("mcmc");

    expect(screen.getByText("Start")).toBeInTheDocument();

    const forwardBtn = screen.getByRole("button", { name: /step forward/i });
    
    fireEvent.click(forwardBtn);
    expect(screen.getByText("Greedy Trap")).toBeInTheDocument();

    fireEvent.click(forwardBtn);
    expect(screen.getByText("Downhill Rule")).toBeInTheDocument();

    fireEvent.click(forwardBtn);
    expect(screen.getByText("Cross Valley")).toBeInTheDocument();

    fireEvent.click(forwardBtn);
    expect(screen.getByText("Long Run")).toBeInTheDocument();
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

  it("resolves the pronoun referent and flips it with the sentence ending", () => {
    renderVisualization("transformers");

    // Default query is "it"; with "...too tired" it binds to the animal.
    expect(screen.getByTestId("transformer-referent")).toHaveTextContent("animal");

    // Flip the ending to "wide" and the referent flips to the road.
    fireEvent.click(screen.getByRole("button", { name: /ending too wide/i }));
    expect(screen.getByTestId("transformer-referent")).toHaveTextContent("road");
  });

  it("updates LLM temperature and sampling mode UI without corrupting context", () => {
    renderVisualization("llms");

    expect(screen.getByText(/Machine learning models generate/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider", { name: /temperature/i }), {
      target: { value: "2.0" },
    });
    expect(screen.getByText("T = 2.00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /sample next word/i }));
    fireEvent.click(screen.getByRole("button", { name: /reset sentence/i }));
    expect(screen.getByText(/Machine learning models generate/)).toBeInTheDocument();
  });

  it("denoises through the autoencoder bottleneck and over-squeezes when too tight", () => {
    renderVisualization("autoencoders");
    const image = screen.getByRole("img", { name: /autoencoder bottleneck/i });

    // Pointer drag is wired (CTM is null in jsdom, so it must not throw).
    fireEvent.pointerDown(image, { pointerId: 1, clientX: 320, clientY: 220 });
    fireEvent.pointerMove(image, { pointerId: 1, clientX: 410, clientY: 220 });
    fireEvent.pointerUp(image, { pointerId: 1 });

    // A roomy bottleneck (6) passes the noise straight through.
    const slider = screen.getByRole("slider", { name: /bottleneck size/i });
    fireEvent.change(slider, { target: { value: "6" } });
    expect(screen.getByText(/no cleaner than the input/i)).toBeInTheDocument();

    // A mid bottleneck (3) denoises: reconstruction is cleaner than the input.
    fireEvent.change(slider, { target: { value: "3" } });
    expect(screen.getByText(/the bottleneck denoised it/i)).toBeInTheDocument();
  });

  it("toggles regularization geometry and narrates L1 sparsity vs L2 shrinkage", () => {
    renderVisualization("regularization");

    // L1 default snaps a weight to exactly zero (sparsity).
    expect(screen.getByRole("button", { name: /l1 lasso/i })).toBeInTheDocument();
    expect(screen.getByText(/Regularized weights/i)).toBeInTheDocument();
    expect(screen.getByText(/0 — dropped/i)).toBeInTheDocument();

    // Switching to L2 slides smoothly — no weight is zeroed out.
    fireEvent.click(screen.getByRole("button", { name: /l2 ridge/i }));
    expect(screen.getByText(/shrinks; it does not select/i)).toBeInTheDocument();
    expect(screen.queryByText(/0 — dropped/i)).not.toBeInTheDocument();
  });



  it("runs reinforcement-learning exploration and resets the Q-table", () => {
    renderVisualization("reinforcement-learning");

    expect(screen.getByTestId("rl-status")).toBeInTheDocument();

    // A manual step backs up value; the policy starts forming.
    fireEvent.click(screen.getByRole("button", { name: /take one step/i }));

    // Auto-explore toggles to a pause control, and reset returns to it.
    fireEvent.click(screen.getByRole("button", { name: /auto explore/i }));
    expect(screen.getByRole("button", { name: /pause auto run/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /pause auto run/i }));
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

});
