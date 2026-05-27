import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AlgorithmSimulator from "./AlgorithmSimulator";

function metricValue(label: string) {
  const labels = screen.getAllByText(label);
  const card = labels[labels.length - 1].closest("div")?.parentElement;
  if (!card) throw new Error(`Metric card not found for ${label}`);
  return within(card).getByText(/\d+/);
}

describe("AlgorithmSimulator", () => {
  it("loads presets and updates dataset summaries", () => {
    render(<AlgorithmSimulator />);

    fireEvent.click(screen.getByRole("button", { name: /load xor dataset/i }));
    expect(screen.getByText(/Current Map:/i).parentElement).toHaveTextContent("XOR");
    expect(metricValue("Total Samples")).toHaveTextContent("12");
    expect(metricValue("Class A")).toHaveTextContent("6");
    expect(metricValue("Class B")).toHaveTextContent("6");

    fireEvent.click(screen.getByRole("button", { name: /load rings dataset/i }));
    expect(screen.getByText(/Current Map:/i).parentElement).toHaveTextContent("Rings");
    expect(metricValue("Total Samples")).toHaveTextContent("16");
  });

  it("clears the canvas and blocks training until both classes exist", () => {
    render(<AlgorithmSimulator />);

    fireEvent.click(screen.getByRole("button", { name: /clear canvas/i }));
    expect(metricValue("Total Samples")).toHaveTextContent("0");

    fireEvent.click(screen.getByRole("button", { name: /start training/i }));
    expect(screen.getByText(/Status:/i)).toHaveTextContent("Missing classes");
    expect(screen.getByRole("button", { name: /start training/i })).toBeInTheDocument();
  });

  it("adds custom samples from both classes and toggles training", () => {
    render(<AlgorithmSimulator />);
    fireEvent.click(screen.getByRole("button", { name: /clear canvas/i }));

    const plot = screen.getByText(/Neural Playground: Click to add data points/i).parentElement;
    if (!plot) throw new Error("plot not found");

    fireEvent.click(screen.getByRole("button", { name: /draw class a/i }));
    fireEvent.click(plot, { clientX: 120, clientY: 180 });
    fireEvent.click(screen.getByRole("button", { name: /draw class b/i }));
    fireEvent.click(plot, { clientX: 360, clientY: 220 });

    expect(metricValue("Total Samples")).toHaveTextContent("2");
    expect(metricValue("Class A")).toHaveTextContent("1");
    expect(metricValue("Class B")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: /start training/i }));
    expect(screen.getByRole("button", { name: /pause training/i })).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toHaveTextContent("Training started");

    fireEvent.click(screen.getByRole("button", { name: /pause training/i }));
    expect(screen.getByRole("button", { name: /start training/i })).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toHaveTextContent("Training paused");
  });

  it("removes the nearest point and halts training when a class disappears mid-run", () => {
    vi.useFakeTimers();
    render(<AlgorithmSimulator />);
    fireEvent.click(screen.getByRole("button", { name: /clear canvas/i }));

    const plot = screen.getByText(/Neural Playground: Click to add data points/i).parentElement;
    if (!plot) throw new Error("plot not found");

    fireEvent.click(screen.getByRole("button", { name: /draw class a/i }));
    fireEvent.click(plot, { clientX: 128, clientY: 168 });
    fireEvent.click(screen.getByRole("button", { name: /draw class b/i }));
    fireEvent.click(plot, { clientX: 512, clientY: 252 });
    fireEvent.click(screen.getByRole("button", { name: /start training/i }));

    fireEvent.contextMenu(plot, { clientX: 512, clientY: 252 });
    expect(metricValue("Total Samples")).toHaveTextContent("1");
    expect(metricValue("Class B")).toHaveTextContent("0");

    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(screen.getByRole("button", { name: /start training/i })).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toHaveTextContent("Training paused");
    vi.useRealTimers();
  });

  it("resets train state when architecture and activation change", () => {
    render(<AlgorithmSimulator />);

    fireEvent.change(screen.getByDisplayValue("Tanh (Smooth)"), {
      target: { value: "relu" },
    });
    expect(screen.getByText(/Status:/i)).toHaveTextContent("Activation function changed");

    const capacitySlider = screen.getAllByRole("slider")[0];
    fireEvent.change(capacitySlider, { target: { value: "10" } });
    expect(screen.getByText(/Status:/i)).toHaveTextContent("Architecture changed");
    expect(screen.getByText(/Topology:/i)).toHaveTextContent("2 → 10 → 1");
  });
});
