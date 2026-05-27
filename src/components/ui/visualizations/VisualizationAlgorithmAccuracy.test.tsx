import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CNNViz from "./CNNViz";
import ComputerVisionViz from "./ComputerVisionViz";
import EvaluationMetricsViz from "./EvaluationMetricsViz";
import LinearRegressionViz from "./LinearRegressionViz";
import LogisticRegressionViz from "./LogisticRegressionViz";
import {
  isPcaAxisAlignedWithPc1,
  pcaVariancePercentForAngle,
} from "./PCAViz";

function cvOutputGrid() {
  return Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) =>
      Number(screen.getByTestId(`cv-output-${row}-${col}`).textContent),
    ),
  );
}

describe("visualization algorithm accuracy", () => {
  it("computes the linear regression SSE and displayed line formula from the current fit", () => {
    render(<LinearRegressionViz />);

    expect(screen.getByTestId("linear-regression-sse")).toHaveTextContent("26.910");
    expect(screen.getByTestId("linear-regression-formula")).toHaveTextContent(
      /y = 0\.00\s*·\s*x \+ 5\.30/,
    );
  });

  it("classifies the default logistic regression points with the displayed boundary", () => {
    render(<LogisticRegressionViz />);

    expect(screen.getByTestId("logistic-accuracy")).toHaveTextContent("100% (8/8)");
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
    render(<EvaluationMetricsViz />);

    expect(screen.getByTestId("metrics-tp")).toHaveTextContent("84");
    expect(screen.getByTestId("metrics-fp")).toHaveTextContent("16");
    expect(screen.getByTestId("metrics-fn")).toHaveTextContent("16");
    expect(screen.getByTestId("metrics-tn")).toHaveTextContent("84");
    expect(screen.getByTestId("metrics-precision")).toHaveTextContent("84.0%");
    expect(screen.getByTestId("metrics-recall")).toHaveTextContent("84.0%");
    expect(screen.getByTestId("metrics-f1")).toHaveTextContent("84.0%");

    fireEvent.change(screen.getByRole("slider"), { target: { value: "9.0" } });

    expect(screen.getByTestId("metrics-tp")).toHaveTextContent("4");
    expect(screen.getByTestId("metrics-fp")).toHaveTextContent("0");
    expect(screen.getByTestId("metrics-fn")).toHaveTextContent("96");
    expect(screen.getByTestId("metrics-tn")).toHaveTextContent("100");
    expect(screen.getByTestId("metrics-precision")).toHaveTextContent("100.0%");
    expect(screen.getByTestId("metrics-recall")).toHaveTextContent("4.4%");
    expect(screen.getByTestId("metrics-f1")).toHaveTextContent("8.4%");
  });

  it("only labels the true PCA max-variance axis as PC1", () => {
    const pc1Angle = 0.654;
    const mirroredLowVarianceAngle = Math.PI - pc1Angle;

    expect(pcaVariancePercentForAngle(pc1Angle)).toBeCloseTo(98.2, 1);
    expect(pcaVariancePercentForAngle(0.2)).toBeCloseTo(81.9, 1);
    expect(pcaVariancePercentForAngle(mirroredLowVarianceAngle)).toBeCloseTo(9.7, 1);

    expect(isPcaAxisAlignedWithPc1(pc1Angle)).toBe(true);
    expect(isPcaAxisAlignedWithPc1(pc1Angle + Math.PI)).toBe(true);
    expect(isPcaAxisAlignedWithPc1(mirroredLowVarianceAngle)).toBe(false);
  });
});
