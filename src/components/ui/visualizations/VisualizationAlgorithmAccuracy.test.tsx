import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CNNViz from "./CNNViz";
import ComputerVisionViz from "./ComputerVisionViz";
import EvaluationMetricsViz from "./EvaluationMetricsViz";
import LinearRegressionViz from "./LinearRegressionViz";
import LogisticRegressionViz from "./LogisticRegressionViz";
import { pcaVarianceCapturedPercent } from "./PCAViz";

function cvOutputGrid() {
  return Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) =>
      Number(screen.getByTestId(`cv-output-${row}-${col}`).textContent),
    ),
  );
}

describe("visualization algorithm accuracy", () => {
  it("drops multivariable regression error toward zero as the model trains", () => {
    render(<LinearRegressionViz />);

    // Untrained (progress 0): predictions are all the mean, so error is high
    // and R^2 is 0.
    const sse0 = Number(screen.getByTestId("linear-regression-sse").textContent);
    expect(sse0).toBeGreaterThan(0);
    expect(screen.getByTestId("linear-regression-r2")).toHaveTextContent("0.00");

    // Scrub training to fully fitted: error collapses and R^2 approaches 1.
    fireEvent.change(screen.getByRole("slider", { name: /training progress/i }), {
      target: { value: "1" },
    });
    const sse1 = Number(screen.getByTestId("linear-regression-sse").textContent);
    expect(sse1).toBeLessThan(sse0);
    expect(Number(screen.getByTestId("linear-regression-r2").textContent)).toBeGreaterThan(0.95);
  });

  it("scores logistic-regression accuracy and shifts it with the threshold", () => {
    render(<LogisticRegressionViz />);

    // Default 50% threshold: two honest outliers are misclassified -> 80%.
    expect(screen.getByTestId("logistic-accuracy")).toHaveTextContent("80% (8/10)");

    // A very strict threshold predicts almost everyone "fail", so it catches the
    // failures but misses passes — accuracy changes.
    fireEvent.change(screen.getByRole("slider", { name: /decision threshold/i }), {
      target: { value: "0.95" },
    });
    expect(screen.getByTestId("logistic-accuracy")).not.toHaveTextContent("80% (8/10)");
  });

  it("computes the computer-vision Sobel convolution output grid exactly", () => {
    render(<ComputerVisionViz />);

    expect(cvOutputGrid()).toEqual([
      [3, 2, -2, -3],
      [1, -2, 2, -1],
      [1, -2, 2, -1],
      [3, 2, -2, -3],
    ]);

    fireEvent.click(screen.getByRole("button", { name: "CLEAR" }));
    expect(cvOutputGrid()).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  });

  it("keeps CNN convolution sums consistent with the selected kernel", () => {
    render(<CNNViz />);

    expect(screen.getByTestId("cnn-current-sum")).toHaveTextContent(/= 4$/);

    fireEvent.click(screen.getByRole("button", { name: /horizontal edge/i }));
    expect(screen.getByTestId("cnn-current-sum")).toHaveTextContent(/= 0$/);
  });

  it("derives confusion-matrix and precision-recall metrics from the threshold", () => {
    const { container } = render(<EvaluationMetricsViz />);

    expect(screen.getByTestId("metrics-tp")).toHaveTextContent("84");
    expect(screen.getByTestId("metrics-fp")).toHaveTextContent("16");
    expect(screen.getByTestId("metrics-fn")).toHaveTextContent("16");
    expect(screen.getByTestId("metrics-tn")).toHaveTextContent("84");
    expect(screen.getByTestId("metrics-precision")).toHaveTextContent("84.0%");
    expect(screen.getByTestId("metrics-recall")).toHaveTextContent("84.0%");
    expect(screen.getByTestId("metrics-f1")).toHaveTextContent("84.0%");
    expect(screen.getByText("left").tagName).toBe("STRONG");
    expect(screen.getByText("right").tagName).toBe("STRONG");
    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
    expect(container).not.toHaveTextContent("**");

    fireEvent.change(screen.getByRole("slider"), { target: { value: "9.0" } });

    expect(screen.getByTestId("metrics-tp")).toHaveTextContent("4");
    expect(screen.getByTestId("metrics-fp")).toHaveTextContent("0");
    expect(screen.getByTestId("metrics-fn")).toHaveTextContent("96");
    expect(screen.getByTestId("metrics-tn")).toHaveTextContent("100");
    expect(screen.getByTestId("metrics-precision")).toHaveTextContent("100.0%");
    expect(screen.getByTestId("metrics-recall")).toHaveTextContent("4.4%");
    expect(screen.getByTestId("metrics-f1")).toHaveTextContent("8.4%");
  });

  it("captures monotonically more variance as PCA keeps more components", () => {
    // Variance captured is a non-decreasing function of k, starts above zero
    // (the first component already carries real structure) and approaches 100%.
    const v1 = pcaVarianceCapturedPercent(1);
    const v10 = pcaVarianceCapturedPercent(10);
    const v40 = pcaVarianceCapturedPercent(40);

    expect(v1).toBeGreaterThan(0);
    expect(v10).toBeGreaterThan(v1);
    expect(v40).toBeGreaterThanOrEqual(v10);
    expect(v40).toBeLessThanOrEqual(100);
    expect(v40).toBeGreaterThan(90);
    // A small fraction of components should already dominate the variance.
    expect(v10).toBeGreaterThan(70);
  });
});
