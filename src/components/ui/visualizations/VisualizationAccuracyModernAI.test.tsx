import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BackpropagationViz from "./BackpropagationViz";
import SequenceModelsViz from "./SequenceModelsViz";
import EmbeddingsTokenizationViz from "./EmbeddingsTokenizationViz";
import RAGViz from "./RAGViz";
import FineTuningViz from "./FineTuningViz";
import LLMEvalSafetyViz from "./LLMEvalSafetyViz";
import AIInferenceViz from "./AIInferenceViz";

describe("Modern AI Track Visualization Accuracy", () => {
  it("verifies Backpropagation lowers the loss after a gradient step", () => {
    render(<BackpropagationViz />);
    expect(screen.getByText(/Calculated Gradients/i)).toBeInTheDocument();
    const lossBefore = Number(screen.getByTestId("bp-loss").textContent);
    fireEvent.click(screen.getByRole("button", { name: /take a gradient step/i }));
    const lossAfter = Number(screen.getByTestId("bp-loss").textContent);
    expect(lossAfter).toBeLessThan(lossBefore);
  });

  it("verifies Sequence Models gradient regimes shift with the recurrent factor", () => {
    render(<SequenceModelsViz />);
    expect(screen.getByText(/Gradient Modes/i)).toBeInTheDocument();
    // Default factor 0.7 vanishes; pushing it above 1 makes it explode.
    expect(screen.getByTestId("seq-regime")).toHaveTextContent(/vanishing/i);
    fireEvent.change(screen.getByRole("slider", { name: /recurrent factor/i }), {
      target: { value: "1.4" },
    });
    expect(screen.getByTestId("seq-regime")).toHaveTextContent(/exploding/i);
  });

  it("verifies subword tokenization splits a long word into more tokens than words", () => {
    render(<EmbeddingsTokenizationViz />);
    // Default text "Tokenization shatters into subwords" splits into subwords,
    // so there are strictly more tokens than words.
    const words = Number(screen.getByTestId("tok-words").textContent);
    const toks = Number(screen.getByTestId("tok-count").textContent);
    expect(toks).toBeGreaterThan(words);
  });

  it("verifies RAG grounds the answer only when retrieval is on", () => {
    render(<RAGViz />);
    // Retrieval starts off: the model hallucinates the wrong number.
    expect(screen.getByTestId("rag-answer")).toHaveTextContent(/30-day/i);
    fireEvent.click(screen.getByRole("button", { name: /toggle retrieval/i }));
    // Retrieval on: grounded, correct answer with a citation.
    expect(screen.getByTestId("rag-answer")).toHaveTextContent(/45-day/i);
  });

  it("verifies Fine Tuning parameter weight adapter sizes", () => {
    render(<FineTuningViz />);
    expect(screen.getByText(/Low-Rank Adaptation/i)).toBeInTheDocument();
  });

  it("verifies LLM Evaluation multi-objective radar parameters", () => {
    render(<LLMEvalSafetyViz />);
    expect(screen.getByText(/Dimension Weights/i)).toBeInTheDocument();
  });

  it("verifies AI Inference memory and hardware bandwidth bounds", () => {
    render(<AIInferenceViz />);
    expect(screen.getByText(/Serving Throughput/i)).toBeInTheDocument();
  });
});
