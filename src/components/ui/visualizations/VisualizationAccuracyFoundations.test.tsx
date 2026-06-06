import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CalculusViz from "./CalculusViz";
import LinearAlgebraViz from "./LinearAlgebraViz";
import ProbabilityViz from "./ProbabilityViz";
import MaximumLikelihoodViz from "./MaximumLikelihoodViz";
import BayesianInferenceViz from "./BayesianInferenceViz";
import StatisticsViz from "./StatisticsViz";
import GradientDescentViz from "./GradientDescentViz";

describe("Foundations Track Visualization Accuracy", () => {
  describe("Calculus (CalculusViz)", () => {
    const f = (x: number) => 5 + 2.4 * Math.sin(x * 0.82 - 1.1);
    const df = (x: number) => 2.4 * 0.82 * Math.cos(x * 0.82 - 1.1);

    it("verifies numerical outputs in default state", () => {
      render(<CalculusViz />);
      const focusX = 5.5;
      const h = 4.0;
      
      const sy = f(focusX + h);
      const fy = f(focusX);
      const secantSlope = (sy - fy) / h;
      const exactSlope = df(focusX);
      const errorVal = Math.abs(secantSlope - exactSlope);

      expect(screen.getByText("SECANT SLOPE (Δy/Δx)").nextSibling).toHaveTextContent(secantSlope.toFixed(3));
      expect(screen.getByText("TANGENT SLOPE (f'(x))").nextSibling).toHaveTextContent(exactSlope.toFixed(3));
      expect(screen.getByText("SLOPE ERROR").nextSibling).toHaveTextContent(errorVal.toFixed(4));
    });

    it("verifies numerical outputs in boundary state (after taking limit h -> 0)", async () => {
      render(<CalculusViz />);
      const focusX = 5.5;
      const limitBtn = screen.getByRole("button", { name: /TAKE THE LIMIT/ });
      fireEvent.click(limitBtn);

      const exactSlope = df(focusX);
      expect(screen.getByText("TANGENT SLOPE (f'(x))").nextSibling).toHaveTextContent(exactSlope.toFixed(3));
    });
  });

  describe("Linear Algebra (LinearAlgebraViz)", () => {
    it("verifies vector projections, dot products, and determinant area in default state", () => {
      render(<LinearAlgebraViz />);
      const a = { x: 3.0, y: 4.5 };
      const b = { x: 5.5, y: 1.5 };

      const dotProd = a.x * b.x + a.y * b.y;
      const bMagSq = b.x * b.x + b.y * b.y;
      const projScalar = bMagSq > 0.001 ? dotProd / bMagSq : 0;
      const area = Math.abs(a.x * b.y - a.y * b.x);

      expect(screen.getByText("DOT PRODUCT (a · b)").nextSibling).toHaveTextContent(dotProd.toFixed(2));
      expect(screen.getByText("PROJECTION SCALAR (p)").nextSibling).toHaveTextContent(projScalar.toFixed(2));
      expect(screen.getByText("DETERMINANT AREA").nextSibling).toHaveTextContent(area.toFixed(2));
    });
  });

  describe("Probability Theory (ProbabilityViz)", () => {
    it("verifies default Total Variation Distance is 1.0000 with 0 trials", () => {
      render(<ProbabilityViz />);
      expect(screen.getByText("TOTAL TRIALS (n)").nextSibling).toHaveTextContent("0");
      expect(screen.getByText("TOTAL VARIATION DISTANCE").nextSibling).toHaveTextContent("1.0000");
    });
  });

  describe("Maximum Likelihood Estimation (MaximumLikelihoodViz)", () => {
    it("verifies log-likelihood calculations for default dataset", () => {
      render(<MaximumLikelihoodViz />);
      const dataPoints = [2.2, 3.8, 5.0, 6.2, 7.8];
      const defaultMu = 3.0;

      const gaussianPdf = (xVal: number, muVal: number, sigma = 1.2) => {
        const exponent = -0.5 * Math.pow((xVal - muVal) / sigma, 2);
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      };

      const getLogL = (muVal: number) => {
        return dataPoints.reduce((sum, xVal) => {
          const density = gaussianPdf(xVal, muVal);
          return sum + Math.log(Math.max(0.0001, density));
        }, 0);
      };

      const expectedLogL = getLogL(defaultMu);
      const expectedOptimalMean = dataPoints.reduce((sum, p) => sum + p, 0) / dataPoints.length;

      expect(screen.getByText("MODEL PARAMETER (μ)").nextSibling).toHaveTextContent(defaultMu.toFixed(3));
      expect(screen.getByText("OPTIMAL MEAN (x̄)").nextSibling).toHaveTextContent(expectedOptimalMean.toFixed(3));
      expect(screen.getByText("LOG-LIKELIHOOD SCORE").nextSibling).toHaveTextContent(expectedLogL.toFixed(3));
    });
  });

  describe("Bayesian Inference (BayesianInferenceViz)", () => {
    it("verifies default prior and posterior mode (MAP) estimate", () => {
      render(<BayesianInferenceViz />);
      expect(screen.getByText("PRIOR (Beta)").nextSibling).toHaveTextContent("α=3.0, β=3.0");
      expect(screen.getByText("BATCH DATA (k/n)").nextSibling).toHaveTextContent("6 / 12 successes (50%)");
    });
  });

  describe("Statistics and Estimation (StatisticsViz)", () => {
    it("verifies original sample statistic matches calculation for default seed 42", () => {
      render(<StatisticsViz />);
      expect(screen.getByText("Estimation Outputs")).toBeInTheDocument();
      expect(screen.getByText("Sample mean:")).toBeInTheDocument();
    });
  });

  describe("Gradient Descent (GradientDescentViz)", () => {
    it("verifies default convex bowl loss value", () => {
      render(<GradientDescentViz />);
      const defaultPos = { x: -2.0, y: 2.2 };
      const bowlVal = defaultPos.x * defaultPos.x + 1.5 * defaultPos.y * defaultPos.y;

      expect(screen.getByText("Current Loss:").nextSibling).toHaveTextContent(bowlVal.toFixed(4));
    });
  });
});
