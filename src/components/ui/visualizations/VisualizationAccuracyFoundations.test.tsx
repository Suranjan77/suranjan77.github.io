import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    it("starts on the wide-secant beat with the average-rate caption", () => {
      render(<CalculusViz />);
      expect(
        screen.getByRole("img", { name: /derivative limit visualizer/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/average rate of change/i)).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: /gap distance h/i }),
      ).toBeInTheDocument();
    });

    it("collapses the secant to the tangent when taking the limit", () => {
      render(<CalculusViz />);
      const limitBtn = screen.getByRole("button", { name: /TAKE THE LIMIT/i });
      fireEvent.click(limitBtn);
      // While animating, the button reports progress and is disabled.
      expect(
        screen.getByRole("button", { name: /limit in progress/i }),
      ).toBeDisabled();
    });

    it("scrubs the gap slider toward the tangent beat", () => {
      render(<CalculusViz />);
      const slider = screen.getByRole("slider", { name: /gap distance h/i });
      fireEvent.change(slider, { target: { value: "0.02" } });
      expect(slider).toHaveValue("0.02");
      expect(screen.getByText(/has become the tangent/i)).toBeInTheDocument();
    });
  });

  describe("Linear Algebra (LinearAlgebraViz)", () => {
    it("ranks embedding items by cosine similarity to the query", () => {
      render(<LinearAlgebraViz />);
      expect(
        screen.getByRole("img", { name: /embedding similarity search/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/ranked by cosine similarity/i)).toBeInTheDocument();
      // Default query points toward the "dog/puppy" cluster, so the top match
      // is one of those (named in the caption).
      expect(screen.getByText(/top match/i)).toBeInTheDocument();
    });
  });

  describe("Probability Theory (ProbabilityViz)", () => {
    it("starts at zero trials and accumulates one on a single drop", async () => {
      render(<ProbabilityViz />);
      expect(screen.getByTestId("probability-total-trials")).toHaveTextContent("0");
      expect(screen.getByText(/Drop samples and watch the solid bars climb/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /drop 1 sample/i }));
      await waitFor(() => {
        expect(screen.getByTestId("probability-total-trials")).toHaveTextContent("1");
      });
    });
  });

  describe("Maximum Likelihood Estimation (MaximumLikelihoodViz)", () => {
    it("starts with the bell off the data and exposes the slide/snap controls", () => {
      render(<MaximumLikelihoodViz />);
      // Default mu=3.0 sits left of the data mean (5.0).
      expect(screen.getByText(/sits off to the side/i)).toBeInTheDocument();
      expect(
        screen.getByRole("slider", { name: /model mean mu/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /snap the bell to the mle/i }),
      ).toBeInTheDocument();
    });

    it("reaches the peak caption when the bell slides onto the data mean", () => {
      render(<MaximumLikelihoodViz />);
      const slider = screen.getByRole("slider", { name: /model mean mu/i });
      fireEvent.change(slider, { target: { value: "5" } });
      expect(slider).toHaveValue("5");
      expect(screen.getByText(/maximum-likelihood estimate/i)).toBeInTheDocument();
    });
  });

  describe("Bayesian Inference (BayesianInferenceViz)", () => {
    it("starts the A/B test undecided with flat beliefs", () => {
      render(<BayesianInferenceViz />);
      expect(
        screen.getByRole("img", { name: /bayesian a\/b test belief update/i }),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/P\(B beats A\)/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/keep testing — too close/i)).toBeInTheDocument();
    });
  });

  describe("Statistics and Estimation (StatisticsViz)", () => {
    it("bootstraps the test set into a confidence interval on accuracy", () => {
      render(<StatisticsViz />);
      expect(
        screen.getByRole("img", { name: /bootstrap confidence on model accuracy/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Confidence readout")).toBeInTheDocument();
      expect(screen.getByText("95% CI:")).toBeInTheDocument();

      // Before resampling there is no interval yet.
      expect(screen.getByText(/run resamples/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /run 500 resamples/i }));
      // After resampling, the CI verdict against model B resolves.
      expect(screen.getByText(/can't tell — noise|yes, real gap/i)).toBeInTheDocument();
    });
  });

  describe("Gradient Descent (GradientDescentViz)", () => {
    it("races SGD, momentum, and Adam down the same landscape", () => {
      render(<GradientDescentViz />);
      expect(
        screen.getByRole("img", { name: /gradient descent optimizer race/i }),
      ).toBeInTheDocument();
      // all three optimizers are listed in the race
      expect(screen.getAllByText("SGD").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Momentum").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Adam").length).toBeGreaterThan(0);

      const run = screen.getByRole("button", { name: /run the optimizer race/i });
      fireEvent.click(run);
      expect(
        screen.getByRole("button", { name: /pause the optimizer race/i }),
      ).toBeInTheDocument();
    });
  });
});
