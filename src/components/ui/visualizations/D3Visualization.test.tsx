import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { algorithmsList } from "@/data/algorithms_content";
import D3Visualization, { visualizationRegistry } from "./D3Visualization";

describe("D3Visualization router", () => {
  it("registers every module exactly once and no unknown modules", () => {
    const modulesWithViz = algorithmsList.filter((m) => m.hasVisualization !== false);
    const moduleIds = modulesWithViz.map((module) => module.id).sort();
    const registryIds = Object.keys(visualizationRegistry).sort();

    expect(new Set(moduleIds).size).toBe(modulesWithViz.length);
    expect(registryIds).toEqual(moduleIds);
    expect(
      registryIds.every(
        (id) =>
          visualizationRegistry[id].component &&
          visualizationRegistry[id].title &&
          visualizationRegistry[id].accessibleLabel,
      ),
    ).toBe(true);
  });

  it.each(algorithmsList.filter((m) => m.hasVisualization !== false))(
    "renders $id with its registered title and accessible visual",
    (module) => {
      const entry = visualizationRegistry[module.id];
      render(<D3Visualization algorithmId={module.id} />);

      expect(screen.getByText(entry.title)).toBeInTheDocument();
      expect(screen.getByText("Interactive Diagram")).toBeInTheDocument();
      expect(screen.getByText("Key Insight")).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: entry.accessibleLabel }),
      ).toBeInTheDocument();
    },
  );

  it("renders an explicit error for unknown algorithm ids", () => {
    render(<D3Visualization algorithmId="missing-module" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No interactive diagram is registered for module missing-module",
    );
    expect(screen.queryByText("Least Squares as Residual Geometry")).not.toBeInTheDocument();
  });

  it("supports direct calculus and probability controls", async () => {
    const { rerender } = render(<D3Visualization algorithmId="calculus" />);

    fireEvent.click(screen.getByRole("button", { name: /take the limit/i }));
    expect(screen.getByRole("button", { name: /limit in progress/i })).toBeDisabled();

    rerender(<D3Visualization algorithmId="probability-theory" />);
    fireEvent.click(screen.getByRole("button", { name: /drop 1 sample/i }));
    expect(screen.getByText(/Trials n/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("probability-total-trials")).toHaveTextContent("1");
    });
  });

  it("supports narrative and direct-manipulation controls across representative visualizations", () => {
    const { rerender } = render(<D3Visualization algorithmId="clustering" />);
    fireEvent.click(screen.getByTitle("Step Forward"));
    expect(screen.getByText(/ASSIGN/)).toBeInTheDocument();

    rerender(<D3Visualization algorithmId="knn" />);
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("k = 5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /show the genre map/i }));
    expect(screen.getByRole("button", { name: /hide the genre map/i })).toBeInTheDocument();

    rerender(<D3Visualization algorithmId="llms" />);
    fireEvent.click(screen.getByRole("button", { name: /random sample/i }));
    fireEvent.click(screen.getByRole("button", { name: /sample next word/i }));
    expect(screen.getByRole("button", { name: /sample next word/i })).toBeDisabled();

    const llmImage = screen.getByRole("img", { name: "LLM Temperature Logits Scaling" });
    expect(within(llmImage).getByText("PROBABILITY WHEEL")).toBeInTheDocument();
  });
});
