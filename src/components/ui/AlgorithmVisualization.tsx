"use client";

import React, { useCallback } from "react";
import {
  COLORS,
  PlotFrame,
  VisualizationShell,
  NativeCanvasPlot,
  drawHelper,
} from "./visualizationPrimitives";

// Import modular visualization components
import CalculusVisualization from "./visualizations/Calculus";
import LinearAlgebraVisualization from "./visualizations/LinearAlgebra";
import ProbabilityTheoryVisualization from "./visualizations/ProbabilityTheory";
import MaximumLikelihoodVisualization from "./visualizations/MaximumLikelihood";
import BayesianInferenceVisualization from "./visualizations/BayesianInference";
import LinearRegressionVisualization from "./visualizations/LinearRegression";
import LogisticRegressionVisualization from "./visualizations/LogisticRegression";
import KnnVisualization from "./visualizations/Knn";
import DecisionTreeVisualization from "./visualizations/DecisionTree";
import SvmVisualization from "./visualizations/Svm";
import KMeansVisualization from "./visualizations/KMeans";
import EnsembleLearningVisualization from "./visualizations/EnsembleLearning";
import DimensionalityReductionVisualization from "./visualizations/DimensionalityReduction";
import McmcVisualization from "./visualizations/Mcmc";
import NeuralNetworksVisualization from "./visualizations/NeuralNetworks";
import CnnVisualization from "./visualizations/Cnn";
import ComputerVisionVisualization from "./visualizations/ComputerVision";
import NlpVisualization from "./visualizations/Nlp";
import AutoencodersVisualization from "./visualizations/Autoencoders";
import TransformersVisualization from "./visualizations/Transformers";
import LlmsVisualization from "./visualizations/Llms";

interface Props {
  algorithmId: string;
}

function DefaultVisualization() {
  const onDraw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawHelper.axes(ctx, 320, 220);
    drawHelper.text(ctx, "ML Concept Plot", 160, 110, COLORS.pink, "12px var(--font-mono)", "center");
  }, []);

  return (
    <VisualizationShell
      title="Theoretical Algorithm Model"
      subtitle="Concept plot model visualization placeholder."
      insight="Mathematical models are visualised to build geometric intuition."
    >
      <PlotFrame className="min-h-[360px]">
        <NativeCanvasPlot onDraw={onDraw} className="h-full w-full" />
      </PlotFrame>
    </VisualizationShell>
  );
}

export default function AlgorithmVisualization({ algorithmId }: Props) {
  switch (algorithmId) {
    case "calculus":
      return <CalculusVisualization />;
    case "linear-algebra":
      return <LinearAlgebraVisualization />;
    case "probability-theory":
      return <ProbabilityTheoryVisualization />;
    case "maximum-likelihood":
      return <MaximumLikelihoodVisualization />;
    case "bayesian-inference":
      return <BayesianInferenceVisualization />;
    case "linear-regression":
      return <LinearRegressionVisualization />;
    case "logistic-regression":
      return <LogisticRegressionVisualization />;
    case "knn":
      return <KnnVisualization />;
    case "instance-based-trees":
      return <DecisionTreeVisualization />;
    case "support-vector-machines":
      return <SvmVisualization />;
    case "clustering":
      return <KMeansVisualization />;
    case "ensemble-learning":
      return <EnsembleLearningVisualization />;
    case "dimensionality-reduction":
      return <DimensionalityReductionVisualization />;
    case "mcmc":
      return <McmcVisualization />;
    case "neural-networks":
      return <NeuralNetworksVisualization />;
    case "cnn":
      return <CnnVisualization />;
    case "computer-vision":
      return <ComputerVisionVisualization />;
    case "nlp":
      return <NlpVisualization />;
    case "autoencoders":
      return <AutoencodersVisualization />;
    case "transformers":
      return <TransformersVisualization />;
    case "llms":
      return <LlmsVisualization />;
    default:
      return <DefaultVisualization />;
  }
}
