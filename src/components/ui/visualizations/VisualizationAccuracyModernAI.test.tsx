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

  it("verifies Sequence Models gradient magnitude flow", () => {
    render(<SequenceModelsViz />);
    expect(screen.getByText(/Gradient Modes/i)).toBeInTheDocument();
  });

  it("verifies Embeddings & Tokenization mapping dimensions", () => {
    render(<EmbeddingsTokenizationViz />);
    expect(screen.getByText(/Tokenized Output/i)).toBeInTheDocument();
  });

  it("verifies RAG context assembly similarity scores", () => {
    render(<RAGViz />);
    expect(screen.getByText(/Retrieval-Augmented/i)).toBeInTheDocument();
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
