"use client";

import * as d3 from "d3";
import React, { useState } from "react";
import {
  COLORS,
  ControlPanel,
  PlotFrame,
  VisualizationShell,
} from "../visualizationPrimitives";

type AlgorithmKind =
  | "calculus"
  | "linear-algebra"
  | "probability"
  | "mle"
  | "bayes"
  | "linear-regression"
  | "logistic-regression"
  | "knn"
  | "tree"
  | "svm"
  | "kmeans"
  | "ensemble"
  | "dimensionality"
  | "mcmc"
  | "neural-network"
  | "cnn"
  | "vision"
  | "nlp"
  | "autoencoder"
  | "transformer"
  | "llm"
  | "rl"
  | "bias-variance"
  | "generative"
  | "regularization"
  | "metrics";

interface SceneConfig {
  kind: AlgorithmKind;
  title: string;
  subtitle: string;
  insight: string;
  legend: Array<{ label: string; color: string }>;
  control: {
    label: string;
    low: string;
    high: string;
    value: (control: number) => string;
  };
}

const percentControl = (label: string, low: string, high: string) => ({
  label,
  low,
  high,
  value: (control: number) => `${control}%`,
});

const configs: Record<string, SceneConfig> = {
  "calculus": {
    kind: "calculus",
    title: "Derivative as Local Linear Motion",
    subtitle: "Drag the focus control to move a tangent from secant approximation to instantaneous slope.",
    insight: "A derivative is the limiting slope of nearby secants; the tangent is the local linear model.",
    legend: [
      { label: "Function", color: COLORS.cyan },
      { label: "Tangent", color: COLORS.pink },
      { label: "Secant", color: COLORS.yellow },
    ],
    control: percentControl("Limit Distance (h → 0)", "large h", "h ≈ 0"),
  },
  "linear-algebra": {
    kind: "linear-algebra",
    title: "Vectors, Projection, and Basis Change",
    subtitle: "Move the vector control to rotate a vector through a basis, projection, and transformed coordinate frame.",
    insight: "Linear algebra becomes geometric when dot products, projections, and matrices are shown as movement in space.",
    legend: [
      { label: "Vector a", color: COLORS.pink },
      { label: "Basis b", color: COLORS.cyan },
      { label: "Projection", color: COLORS.yellow },
    ],
    control: percentControl("Vector Angle", "acute", "wide"),
  },
  "probability-theory": {
    kind: "probability",
    title: "Probability as Long-Run Frequency",
    subtitle: "Increase samples to watch empirical bars converge toward the theoretical distribution.",
    insight: "Probability describes expected mass; samples reveal it noisily and converge with more trials.",
    legend: [
      { label: "Theory", color: COLORS.pink },
      { label: "Empirical", color: COLORS.cyan },
    ],
    control: {
      label: "Sample Count",
      low: "n = 20",
      high: "n = 2,000",
      value: (control) => `n=${Math.round(20 + control * 19.8)}`,
    },
  },
  "maximum-likelihood": {
    kind: "mle",
    title: "Likelihood Pulls the Model Toward Observations",
    subtitle: "The model mean moves under the observations while likelihood stems show each point's density.",
    insight: "Maximum likelihood chooses parameters that make the observed data collectively least surprising.",
    legend: [
      { label: "Model density", color: COLORS.pink },
      { label: "Observations", color: COLORS.cyan },
      { label: "Likelihood stems", color: COLORS.yellow },
    ],
    control: {
      label: "Mean Parameter",
      low: "mu = 3.5",
      high: "mu = 6.5",
      value: (control) => `mu=${(3.5 + (control / 100) * 3).toFixed(2)}`,
    },
  },
  "bayesian-inference": {
    kind: "bayes",
    title: "Bayesian Updating as Distribution Reweighting",
    subtitle: "Observed successes reshape the prior through a likelihood into a posterior belief curve.",
    insight: "Bayes' rule is a belief update: posterior mass appears where prior belief and data likelihood agree.",
    legend: [
      { label: "Prior", color: COLORS.cyan },
      { label: "Likelihood", color: COLORS.yellow },
      { label: "Posterior", color: COLORS.pink },
    ],
    control: {
      label: "Observed Successes",
      low: "2 / 12",
      high: "10 / 12",
      value: (control) => `${Math.round(2 + (control / 100) * 8)} / 12`,
    },
  },
  "linear-regression": {
    kind: "linear-regression",
    title: "Least Squares as Residual Geometry",
    subtitle: "Residual bars and squares expose why the fitted line moves toward the cloud's center of mass.",
    insight: "The least-squares solution minimizes the total area of the residual squares.",
    legend: [
      { label: "Fit", color: COLORS.pink },
      { label: "Residuals", color: COLORS.yellow },
      { label: "Data", color: COLORS.cyan },
    ],
    control: {
      label: "Slope Trial",
      low: "shallow",
      high: "steep",
      value: (control) => `m=${(0.45 + (control / 100) * 0.9).toFixed(2)}`,
    },
  },
  "logistic-regression": {
    kind: "logistic-regression",
    title: "A Linear Boundary Feeding a Sigmoid",
    subtitle: "The left plot classifies feature space; the right plot shows the same score mapped to probability.",
    insight: "Logistic regression is a linear score made probabilistic through the sigmoid link function.",
    legend: [
      { label: "Class 0", color: COLORS.cyan },
      { label: "Class 1", color: COLORS.pink },
      { label: "p=0.5", color: COLORS.yellow },
    ],
    control: percentControl("Decision Threshold", "left", "right"),
  },
  "knn": {
    kind: "knn",
    title: "KNN as a Local Voting Radius",
    subtitle: "Adjust k to see the query neighborhood expand and the vote balance change.",
    insight: "KNN predicts from local evidence; changing k changes how local the neighborhood is.",
    legend: [
      { label: "Neighbors", color: COLORS.yellow },
      { label: "Class A", color: COLORS.cyan },
      { label: "Class B", color: COLORS.pink },
    ],
    control: {
      label: "Neighbor Count",
      low: "k = 1",
      high: "k = 7",
      value: (control) => `k=${Math.round(1 + (control / 100) * 6)}`,
    },
  },
  "instance-based-trees": {
    kind: "tree",
    title: "Decision Trees Partition Space",
    subtitle: "Synchronized regions and tree nodes show how a point follows split tests to a leaf.",
    insight: "A tree is a sequence of axis-aligned questions that carve feature space into simple regions.",
    legend: [
      { label: "Split path", color: COLORS.yellow },
      { label: "Leaf A", color: COLORS.cyan },
      { label: "Leaf B", color: COLORS.pink },
    ],
    control: percentControl("Active Data Point", "point 1", "point N"),
  },
  "support-vector-machines": {
    kind: "svm",
    title: "SVM Maximizes the Separating Margin",
    subtitle: "The margin band makes support vectors visible as the examples that hold the boundary in place.",
    insight: "SVMs focus on the points closest to the boundary; those support vectors define the classifier.",
    legend: [
      { label: "Boundary", color: COLORS.pink },
      { label: "Margin", color: COLORS.yellow },
      { label: "Support vectors", color: COLORS.cyan },
    ],
    control: {
      label: "Soft-Margin C",
      low: "soft",
      high: "strict",
      value: (control) => `C=${(0.2 + (control / 100) * 4.8).toFixed(1)}`,
    },
  },
  "clustering": {
    kind: "kmeans",
    title: "K-Means Alternates Assignment and Movement",
    subtitle: "Cluster regions, centroid trails, and assignment spokes show the two-step optimization loop.",
    insight: "K-means repeatedly assigns points to nearest centroids, then moves each centroid to its assigned mean.",
    legend: [
      { label: "Centroids", color: COLORS.pink },
      { label: "Assignments", color: COLORS.yellow },
      { label: "Samples", color: COLORS.cyan },
    ],
    control: {
      label: "Iteration Step",
      low: "initial",
      high: "converged",
      value: (control) => `step ${Math.round((control / 100) * 6)}`,
    },
  },
  "ensemble-learning": {
    kind: "ensemble",
    title: "Weak Learners Add Into a Strong Surface",
    subtitle: "Stumps contribute simple cuts; the aggregate surface becomes a more expressive classifier.",
    insight: "Ensembles work by combining many biased partial views into a lower-error consensus.",
    legend: [
      { label: "Weak cuts", color: COLORS.yellow },
      { label: "Aggregate A", color: COLORS.cyan },
      { label: "Aggregate B", color: COLORS.pink },
    ],
    control: {
      label: "Learners Included",
      low: "1 stump",
      high: "5 stumps",
      value: (control) => `${Math.round(1 + (control / 100) * 4)} stumps`,
    },
  },
  "dimensionality-reduction": {
    kind: "dimensionality",
    title: "Projection Trades Detail for Variance",
    subtitle: "A projection axis captures major variation while reconstruction lines reveal lost information.",
    insight: "Dimensionality reduction preserves dominant structure and makes the discarded variation visible as error.",
    legend: [
      { label: "Data", color: COLORS.cyan },
      { label: "Projection", color: COLORS.pink },
      { label: "Error", color: COLORS.yellow },
    ],
    control: percentControl("Projection Angle", "low variance", "high variance"),
  },
  "mcmc": {
    kind: "mcmc",
    title: "MCMC Explores a Target Distribution by Walking",
    subtitle: "Accepted and rejected proposals show how a local random walk builds samples from a global density.",
    insight: "MCMC turns a hard distribution into a sequence of dependent samples with the right long-run density.",
    legend: [
      { label: "Target", color: COLORS.pink },
      { label: "Accepted", color: COLORS.cyan },
      { label: "Rejected", color: COLORS.yellow },
    ],
    control: {
      label: "Chain Length",
      low: "few draws",
      high: "many draws",
      value: (control) => `${Math.round(10 + control * 0.9)} draws`,
    },
  },
  "neural-networks": {
    kind: "neural-network",
    title: "Neural Networks Learn by Passing Error Backward",
    subtitle: "Step through one training example: features become hidden activations, a prediction creates loss, then gradients update weights.",
    insight: "Deep learning is not just connected nodes: each layer transforms features forward, while backprop assigns credit for the error backward.",
    legend: [
      { label: "Forward signal", color: COLORS.cyan },
      { label: "Error gradient", color: COLORS.pink },
      { label: "Active unit", color: COLORS.yellow },
    ],
    control: percentControl("Training Pass", "features", "weight update"),
  },
  "cnn": {
    kind: "cnn",
    title: "CNN Kernels Scan Local Patterns",
    subtitle: "A moving kernel window links an input patch to a feature-map activation.",
    insight: "Convolutions reuse a small local filter across space, detecting the same feature wherever it appears.",
    legend: [
      { label: "Kernel", color: COLORS.yellow },
      { label: "Input", color: COLORS.cyan },
      { label: "Feature map", color: COLORS.pink },
    ],
    control: percentControl("Kernel Position", "top-left", "bottom-right"),
  },
  "computer-vision": {
    kind: "vision",
    title: "Computer Vision Builds Features From Pixels",
    subtitle: "Raw pixels become filter responses, then thresholded evidence for a visible edge.",
    insight: "Vision systems transform local pixel contrast into increasingly semantic feature responses.",
    legend: [
      { label: "Pixels", color: COLORS.cyan },
      { label: "Filter response", color: COLORS.pink },
      { label: "Gradient", color: COLORS.yellow },
    ],
    control: {
      label: "Edge Threshold",
      low: "sensitive",
      high: "selective",
      value: (control) => `t=${Math.round(10 + control * 0.9)}`,
    },
  },
  "nlp": {
    kind: "nlp",
    title: "Embeddings Turn Words Into Geometry",
    subtitle: "Token neighborhoods and analogy arrows show semantic relationships as vector directions.",
    insight: "Embedding spaces make linguistic similarity measurable with distance and direction.",
    legend: [
      { label: "Tokens", color: COLORS.cyan },
      { label: "Selected", color: COLORS.pink },
      { label: "Analogy", color: COLORS.yellow },
    ],
    control: percentControl("Neighborhood Focus", "local", "analogy"),
  },
  "autoencoders": {
    kind: "autoencoder",
    title: "Autoencoders Compress Through a Bottleneck",
    subtitle: "The encoder squeezes input structure into a latent code, then reconstructs what it can preserve.",
    insight: "A tight bottleneck forces the model to learn the most reusable structure in the input.",
    legend: [
      { label: "Input", color: COLORS.cyan },
      { label: "Latent code", color: COLORS.yellow },
      { label: "Reconstruction", color: COLORS.pink },
    ],
    control: {
      label: "Bottleneck Width",
      low: "narrow",
      high: "wide",
      value: (control) => `${Math.round(1 + (control / 100) * 7)} dims`,
    },
  },
  "transformers": {
    kind: "transformer",
    title: "Transformers Route Information With Attention",
    subtitle: "The selected query token attends across context through a matrix and matching arc diagram.",
    insight: "Attention lets each token choose which other tokens should influence its representation.",
    legend: [
      { label: "Query", color: COLORS.pink },
      { label: "Strong attention", color: COLORS.yellow },
      { label: "Context", color: COLORS.cyan },
    ],
    control: {
      label: "Query Token",
      low: "first",
      high: "last",
      value: (control) => `token ${Math.round(1 + (control / 100) * 4)}`,
    },
  },
  "llms": {
    kind: "llm",
    title: "LLMs Sample the Next Token From a Distribution",
    subtitle: "Temperature reshapes token probabilities before one continuation is selected.",
    insight: "Generation is repeated probability sampling conditioned on the current context window.",
    legend: [
      { label: "Context", color: COLORS.cyan },
      { label: "Top token", color: COLORS.pink },
      { label: "Alternatives", color: COLORS.yellow },
    ],
    control: {
      label: "Temperature",
      low: "focused",
      high: "diverse",
      value: (control) => `T=${(0.3 + (control / 100) * 1.7).toFixed(1)}`,
    },
  },
  "reinforcement-learning": {
    kind: "rl",
    title: "Reinforcement Learning Improves a Policy by Rollout",
    subtitle: "Grid values, policy arrows, and an agent path connect reward to action choice.",
    insight: "RL learns action preferences from delayed outcomes rather than labeled examples.",
    legend: [
      { label: "Policy", color: COLORS.yellow },
      { label: "Reward", color: COLORS.cyan },
      { label: "Penalty", color: COLORS.pink },
    ],
    control: {
      label: "Rollout Step",
      low: "start",
      high: "goal",
      value: (control) => `step ${Math.round((control / 100) * 6)}`,
    },
  },
  "bias-variance": {
    kind: "bias-variance",
    title: "Bias-Variance Is a Complexity Tradeoff",
    subtitle: "Model complexity bends the fit curve while train and validation errors diverge.",
    insight: "Underfit models have high bias; overfit models have high variance and poor validation behavior.",
    legend: [
      { label: "Fit", color: COLORS.pink },
      { label: "Train error", color: COLORS.cyan },
      { label: "Validation error", color: COLORS.yellow },
    ],
    control: {
      label: "Model Complexity",
      low: "bias",
      high: "variance",
      value: (control) => `degree ${Math.round(1 + (control / 100) * 9)}`,
    },
  },
  "generative-models": {
    kind: "generative",
    title: "Generative Models Sample From Latent Space",
    subtitle: "A latent interpolation path morphs generated samples across learned regions.",
    insight: "Generative models learn a map from compact latent coordinates to realistic data-like outputs.",
    legend: [
      { label: "Latent path", color: COLORS.yellow },
      { label: "Generated A", color: COLORS.cyan },
      { label: "Generated B", color: COLORS.pink },
    ],
    control: percentControl("Latent Interpolation", "source A", "source B"),
  },
  "regularization": {
    kind: "regularization",
    title: "Regularization Constrains the Optimum",
    subtitle: "Loss contours meet L1 or L2 geometry, shifting the solution toward simpler weights.",
    insight: "Regularization changes the feasible geometry, making simpler parameter values cheaper.",
    legend: [
      { label: "Loss contours", color: COLORS.pink },
      { label: "Constraint", color: COLORS.cyan },
      { label: "Regularized solution", color: COLORS.yellow },
    ],
    control: percentControl("Penalty Geometry", "L1", "L2"),
  },
  "evaluation-metrics": {
    kind: "metrics",
    title: "Metrics Depend on the Decision Threshold",
    subtitle: "A threshold moves through score distributions while confusion counts and ROC position update.",
    insight: "Evaluation metrics summarize threshold choices; no single number captures all deployment costs.",
    legend: [
      { label: "Negatives", color: COLORS.pink },
      { label: "Positives", color: COLORS.cyan },
      { label: "Threshold", color: COLORS.yellow },
    ],
    control: {
      label: "Classification Threshold",
      low: "recall",
      high: "precision",
      value: (control) => `t=${(control / 100).toFixed(2)}`,
    },
  },
};

const W = 640;
const H = 420;
const plot = { left: 64, top: 44, right: 406, bottom: 338 };
const x = d3.scaleLinear().domain([0, 10]).range([plot.left, plot.right]);
const y = d3.scaleLinear().domain([0, 10]).range([plot.bottom, plot.top]);

const basePoints = [
  { x: 1.2, y: 2.1, label: 0 },
  { x: 2.1, y: 3.4, label: 0 },
  { x: 3.5, y: 5.3, label: 0 },
  { x: 4.3, y: 4.5, label: 0 },
  { x: 5.8, y: 6.2, label: 1 },
  { x: 6.6, y: 5.7, label: 1 },
  { x: 7.7, y: 7.2, label: 1 },
  { x: 8.8, y: 8.1, label: 1 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Axis({ labelX = "x", labelY = "y" }: { labelX?: string; labelY?: string }) {
  const ticks = [0, 2.5, 5, 7.5, 10];
  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={plot.top} y2={plot.bottom} stroke={COLORS.grid} strokeWidth={1} />
          <line x1={plot.left} x2={plot.right} y1={y(tick)} y2={y(tick)} stroke={COLORS.grid} strokeWidth={1} />
        </g>
      ))}
      <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} stroke={COLORS.border} strokeWidth={2} />
      <text x={plot.right + 16} y={plot.bottom + 4} fill={COLORS.muted} fontSize={14} fontWeight={700}>{labelX}</text>
      <text x={plot.left - 20} y={plot.top - 8} fill={COLORS.muted} fontSize={14} fontWeight={700}>{labelY}</text>
    </g>
  );
}

function PointMark({ px, py, color, r = 6, label }: { px: number; py: number; color: string; r?: number; label?: string }) {
  return (
    <g>
      <circle cx={px} cy={py} r={r + 4} fill="none" stroke={color} strokeOpacity={0.25} />
      <circle cx={px} cy={py} r={r} fill={color} stroke={COLORS.bg} strokeWidth={2} />
      {label && <text x={px + 10} y={py - 8} fill={color} fontSize={12} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{label}</text>}
    </g>
  );
}

function Vector({ x1, y1, x2, y2, color, label }: { x1: number; y1: number; x2: number; y2: number; color: string; label?: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 10;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path
        d={`M${x2},${y2} L${x2 - head * Math.cos(angle - 0.45)},${y2 - head * Math.sin(angle - 0.45)} L${x2 - head * Math.cos(angle + 0.45)},${y2 - head * Math.sin(angle + 0.45)} Z`}
        fill={color}
      />
      {label && <text x={x2 + 10} y={y2} fill={color} fontSize={13} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{label}</text>}
    </g>
  );
}

function MiniStat({ x0, y0, label, value }: { x0: number; y0: number; label: string; value: string }) {
  return (
    <g>
      <rect x={x0} y={y0} width={166} height={54} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} />
      <text x={x0 + 14} y={y0 + 21} fill={COLORS.muted} fontSize={11} fontWeight={700}>{label}</text>
      <text x={x0 + 14} y={y0 + 41} fill={COLORS.pink} fontSize={17} fontWeight={800}>{value}</text>
    </g>
  );
}

function StageIndicator({ stages, currentStage, startX = 70, y = 372, width = 112 }: { stages: string[]; currentStage: number; startX?: number; y?: number; width?: number }) {
  const totalWidth = stages.length * width + (stages.length - 1) * 16;
  const centeredStartX = 320 - totalWidth / 2; // Center horizontally at W/2 = 320
  const actualStartX = startX !== 70 ? startX : centeredStartX;

  return (
    <g>
      {stages.map((name, i) => (
        <g key={name}>
          <rect x={actualStartX + i * (width + 16)} y={y} width={width} height={26} fill={i === currentStage ? COLORS.yellow : "transparent"} fillOpacity={i === currentStage ? 0.2 : 0} stroke={i === currentStage ? COLORS.yellow : COLORS.border} />
          <text x={actualStartX + i * (width + 16) + width / 2} y={y + 17} textAnchor="middle" fill={i === currentStage ? COLORS.yellow : COLORS.muted} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={2} paintOrder="stroke">{name}</text>
        </g>
      ))}
    </g>
  );
}

function Scene({ kind, control }: { kind: AlgorithmKind; control: number }) {
  const line = d3.line<{ x: number; y: number }>().x((d) => d.x).y((d) => d.y).curve(d3.curveMonotoneX);
  const t = control / 100;
  const curve = d3.range(0, 10.05, 0.16).map((v) => ({ x: x(v), y: y(5 + 2.4 * Math.sin(v * 0.82 - 1.1)) }));
  const density = d3.range(0, 10.05, 0.12).map((v) => ({ x: x(v), y: y(8.5 * Math.exp(-0.5 * ((v - (3.5 + 3 * t)) / 1.2) ** 2)) }));

  if (kind === "calculus") {
    const focus = 5.5; // Fixed focus point
    const h = 4.2 * (1 - t) + 0.001; // Avoid divide by zero
    const sec = focus + h;
    const fy = 5 + 2.4 * Math.sin(focus * 0.82 - 1.1);
    const sy = 5 + 2.4 * Math.sin(sec * 0.82 - 1.1);
    const exactSlope = 2.4 * 0.82 * Math.cos(focus * 0.82 - 1.1);
    const secantSlope = (sy - fy) / h;
    return (
      <>
        <Axis labelY="f(x)" />
        <path d={line(curve) ?? ""} fill="none" stroke={COLORS.cyan} strokeWidth={4} />
        <line x1={x(focus - 2)} y1={y(fy - exactSlope * 2)} x2={x(focus + 2)} y2={y(fy + exactSlope * 2)} stroke={COLORS.pink} strokeWidth={3} />
        <line x1={x(focus - 2)} y1={y(fy - secantSlope * 2)} x2={x(sec + 2)} y2={y(sy + secantSlope * (sec + 2 - focus))} stroke={COLORS.yellow} strokeWidth={3} strokeDasharray="7 6" />
        <PointMark px={x(focus)} py={y(fy)} color={COLORS.pink} />
        <PointMark px={x(sec)} py={y(sy)} color={COLORS.yellow} r={4} />
        <MiniStat x0={440} y0={84} label="secant slope" value={secantSlope.toFixed(2)} />
        <MiniStat x0={440} y0={152} label="tangent slope" value={exactSlope.toFixed(2)} />
      </>
    );
  }

  if (kind === "linear-algebra") {
    const origin = { x: 220, y: 210 };
    const ax = origin.x + 116 * Math.cos(0.8 + t * 1.4);
    const ay = origin.y - 116 * Math.sin(0.8 + t * 1.4);
    const bx = origin.x + 134;
    const by = origin.y - 52;
    const bSquared = (bx - origin.x) ** 2 + (by - origin.y) ** 2;
    const exactDot = ((ax - origin.x) * (bx - origin.x) + (ay - origin.y) * (by - origin.y));
    const proj = exactDot / bSquared;
    return (
      <>
        <Axis labelX="basis 1" labelY="basis 2" />
        <Vector x1={origin.x} y1={origin.y} x2={bx} y2={by} color={COLORS.cyan} label="b" />
        <Vector x1={origin.x} y1={origin.y} x2={ax} y2={ay} color={COLORS.pink} label="a" />
        <line x1={ax} y1={ay} x2={origin.x + (bx - origin.x) * proj} y2={origin.y + (by - origin.y) * proj} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="5 5" />
        <Vector x1={origin.x} y1={origin.y} x2={origin.x + (bx - origin.x) * proj} y2={origin.y + (by - origin.y) * proj} color={COLORS.yellow} />
        <MiniStat x0={440} y0={84} label="dot product (a·b)" value={(exactDot / 100).toFixed(0)} />
        <MiniStat x0={440} y0={152} label="projection scalar" value={proj.toFixed(2)} />
      </>
    );
  }

  if (["probability", "bayes", "mle"].includes(kind)) {
    const bars = [0.1, 0.19, 0.26, 0.21, 0.15, 0.09];
    // Generate pseudo-random deterministic variance based on n
    const n = 20 + t * 1980;
    const varianceScale = 1 / Math.sqrt(Math.max(1, n));
    const samples = bars.map((b, i) => clamp(b + Math.sin((i + 1) * 7.3 * (t + 1) * 11) * 0.8 * varianceScale, 0.03, 0.42));
    
    // MLE logic
    const mlePoints = [2.1, 3.2, 4.3, 5.2, 7.6];
    let logLikelihood = 0;
    if (kind === "mle") {
      mlePoints.forEach((v) => {
        const likelihood = Math.exp(-0.5 * ((v - (3.5 + 3 * t)) / 1.2) ** 2) / (1.2 * Math.sqrt(2 * Math.PI));
        logLikelihood += Math.log(Math.max(0.0001, likelihood));
      });
    }

    return (
      <>
        <Axis labelX={kind === "bayes" ? "theta" : "value"} labelY="mass" />
        {kind === "probability" && bars.map((b, i) => (
          <g key={i}>
            <rect x={x(1 + i * 1.35)} y={y(b * 22)} width={28} height={plot.bottom - y(b * 22)} fill={COLORS.pink} opacity={0.28} />
            <rect x={x(1 + i * 1.35) + 34} y={y(samples[i] * 22)} width={28} height={plot.bottom - y(samples[i] * 22)} fill={COLORS.cyan} opacity={0.75} />
          </g>
        ))}
        
        {kind === "mle" && <path d={line(density) ?? ""} fill="none" stroke={COLORS.pink} strokeWidth={4} />}
        {kind === "mle" && mlePoints.map((v) => {
          const yy = 8.5 * Math.exp(-0.5 * ((v - (3.5 + 3 * t)) / 1.2) ** 2);
          return <g key={v}><line x1={x(v)} x2={x(v)} y1={plot.bottom} y2={y(yy)} stroke={COLORS.yellow} strokeDasharray="4 4" /><PointMark px={x(v)} py={plot.bottom} color={COLORS.cyan} r={5} /></g>;
        })}
        {kind === "mle" && <MiniStat x0={440} y0={84} label="Total Log-Likelihood" value={logLikelihood.toFixed(1)} />}

        {kind === "bayes" && [0, 1, 2].map((idx) => {
          const color = [COLORS.cyan, COLORS.yellow, COLORS.pink][idx];
          // Prior is static (shift=0), Likelihood shifts with t, Posterior is between
          const priorShift = 0;
          const likelihoodShift = -2 + t * 4;
          const shift = idx === 0 ? priorShift : idx === 1 ? likelihoodShift : (priorShift * 1.6 + likelihoodShift * (0.8 + t)) / (2.4 + t);
          const pts = d3.range(0, 10.05, 0.1).map((v) => ({ x: x(v), y: y(7 * Math.exp(-0.5 * ((v - (4.5 + shift)) / (1.6 - idx * 0.25)) ** 2)) }));
          return <path key={idx} d={line(pts) ?? ""} fill="none" stroke={color} strokeWidth={idx === 2 ? 4 : 2.5} strokeDasharray={idx === 0 ? "7 5" : undefined} />;
        })}
        {kind === "bayes" && <MiniStat x0={440} y0={84} label="Observations" value={`${Math.round(2 + t * 8)} successes`} />}
      </>
    );
  }

  if (["linear-regression", "logistic-regression", "knn", "tree", "svm", "ensemble"].includes(kind)) {
    let boundary = 4.5 + t * 2;
    if (kind === "tree") boundary = 5.0;
    const thresholdOffset = (t - 0.5) * 6;
    if (kind === "logistic-regression") boundary = 5 + thresholdOffset * 0.7;

    const query = kind === "knn" ? { x: 5.5, y: 4.5 } : { x: 4.5 + t * 2.4, y: 5.2 - t };
    const k = Math.round(1 + t * 6);
    const nearest = [...basePoints].sort((a, b) => Math.hypot(a.x - query.x, a.y - query.y) - Math.hypot(b.x - query.x, b.y - query.y)).slice(0, k);
    const supportRadius = 5 + (1 - t) * 7;
    const activeExample = basePoints[Math.min(basePoints.length - 1, Math.round(t * (basePoints.length - 1)))];
    
    let sse = 0;
    if (kind === "linear-regression") {
      basePoints.forEach((p) => {
        const predY = 1.2 + t * 2 + (0.62 + t * 0.08) * p.x;
        sse += (p.y - predY) ** 2;
      });
    }

    const class1Count = nearest.filter(p => p.label === 1).length;
    const predClass = class1Count > k / 2 ? "1 (Pink)" : "0 (Cyan)";
    const stumps = [
      { dim: "x", value: 3.2, dir: 1 },
      { dim: "y", value: 5.4, dir: -1 },
      { dim: "x", value: 6.8, dir: 1 },
      { dim: "y", value: 7.2, dir: -1 },
      { dim: "x", value: 4.9, dir: -1 },
    ] as const;
    const stumpCount = Math.round(1 + t * 4);
    return (
      <>
        <Axis labelX="feature 1" labelY="feature 2" />
        {kind === "tree" && <><rect x={plot.left} y={plot.top} width={x(boundary) - plot.left} height={plot.bottom - plot.top} fill={COLORS.cyan} opacity={0.09} /><rect x={x(boundary)} y={plot.top} width={plot.right - x(boundary)} height={plot.bottom - plot.top} fill={COLORS.pink} opacity={0.09} /><line x1={x(boundary)} y1={plot.top} x2={x(boundary)} y2={plot.bottom} stroke={COLORS.yellow} strokeWidth={3} /></>}
        {kind === "svm" && <><path d={`M${x(2)},${y(8)} L${x(8.6)},${y(1.6)}`} stroke={COLORS.pink} strokeWidth={3} /><path d={`M${x(1.4 + t * 0.8)},${y(7.2 + t * 0.8)} L${x(8 + t * 0.8)},${y(0.8 + t * 0.8)} M${x(2.8 - t * 0.8)},${y(9 - t * 0.8)} L${x(9.4 - t * 0.8)},${y(2.6 - t * 0.8)}`} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="7 5" /></>}
        {kind === "ensemble" && <g>
          {d3.range(plot.left, plot.right, 14).map((px) => d3.range(plot.top, plot.bottom, 14).map((py) => {
            const dx = x.invert(px);
            const dy = y.invert(py);
            const vote = stumps.slice(0, stumpCount).reduce((sum, stump) => {
              const feature = stump.dim === "x" ? dx : dy;
              const pred = stump.dir === 1 ? feature > stump.value : feature < stump.value;
              return sum + (pred ? 1 : -1);
            }, 0);
            return <rect key={`${px}-${py}`} x={px} y={py} width={14} height={14} fill={vote >= 0 ? COLORS.pink : COLORS.cyan} opacity={0.08 + Math.abs(vote) * 0.035} />;
          }))}
          {stumps.slice(0, stumpCount).map((stump, i) => <line key={i} x1={stump.dim === "y" ? plot.left : x(stump.value)} x2={stump.dim === "y" ? plot.right : x(stump.value)} y1={stump.dim === "y" ? y(stump.value) : plot.top} y2={stump.dim === "y" ? y(stump.value) : plot.bottom} stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="5 5" />)}
        </g>}
        {kind === "logistic-regression" && d3.range(0, 10, 0.5).map((v) => <line key={v} x1={x(v)} x2={x(v)} y1={plot.top} y2={plot.bottom} stroke={v > boundary ? COLORS.pink : COLORS.cyan} strokeOpacity={0.12} />)}
        {kind === "linear-regression" && <path d={`M${x(0.6)},${y(1.2 + t * 2)} L${x(9.5)},${y(7.4 + t)}`} stroke={COLORS.pink} strokeWidth={4} />}
        {kind === "knn" && <circle cx={x(query.x)} cy={y(query.y)} r={46 + t * 48} fill="none" stroke={COLORS.yellow} strokeWidth={3} strokeDasharray="7 5" />}
        {basePoints.map((p) => {
          const predY = 1.2 + t * 2 + (0.62 + t * 0.08) * p.x;
          const isNear = nearest.includes(p);
          const isSupport = Math.abs((p.y + p.x) - 10) < supportRadius / 2.4;
          const res = p.y - predY;
          const size = Math.abs(y(p.y) - y(predY));
          return (
            <g key={`${p.x}-${p.y}`}>
              {kind === "linear-regression" && (
                <g>
                  <rect x={res > 0 ? x(p.x) - size : x(p.x)} y={res > 0 ? y(p.y) : y(predY)} width={size} height={size} fill={COLORS.yellow} opacity={0.2} stroke={COLORS.yellow} />
                  <line x1={x(p.x)} y1={y(p.y)} x2={x(p.x)} y2={y(predY)} stroke={COLORS.yellow} strokeWidth={2} />
                </g>
              )}
              {kind === "knn" && isNear && <line x1={x(query.x)} y1={y(query.y)} x2={x(p.x)} y2={y(p.y)} stroke={COLORS.yellow} strokeWidth={1.5} />}
              <PointMark px={x(p.x)} py={y(p.y)} color={p.label ? COLORS.pink : COLORS.cyan} r={isNear || isSupport ? 8 : 6} />
              {kind === "svm" && isSupport && <circle cx={x(p.x)} cy={y(p.y)} r={13} fill="none" stroke={COLORS.yellow} strokeWidth={2} />}
            </g>
          );
        })}
        {kind === "linear-regression" && <MiniStat x0={440} y0={84} label="Sum of Squared Errors" value={sse.toFixed(1)} />}
        {kind === "knn" && <PointMark px={x(query.x)} py={y(query.y)} color={COLORS.yellow} r={9} />}
        {kind === "knn" && <MiniStat x0={440} y0={84} label="k neighbors" value={k.toString()} />}
        {kind === "knn" && <MiniStat x0={440} y0={152} label="predicted class" value={predClass} />}
        {kind === "logistic-regression" && <path d={line(d3.range(-5, 5.05, 0.12).map((v) => ({ x: 452 + (v + 5) * 15, y: 326 - 240 / (1 + Math.exp(-(v - thresholdOffset) * 1.5)) }))) ?? ""} fill="none" stroke={COLORS.yellow} strokeWidth={4} />}
        {kind === "tree" && <><PointMark px={x(activeExample.x)} py={y(activeExample.y)} color={COLORS.yellow} r={9} /><g transform="translate(452 70)"><TreeDiagram activeRight={activeExample.x > boundary} /></g></>}
      </>
    );
  }

  if (["kmeans", "dimensionality", "mcmc", "generative"].includes(kind)) {
    const c1 = { x: 3 + t, y: 7 - t };
    const c2 = { x: 7 - t, y: 3 + t };
    const cloud = basePoints.concat([{ x: 2.4, y: 6.8, label: 0 }, { x: 8.1, y: 3.6, label: 1 }]);
    const angle = -0.7 + t * 1.8;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const chainLength = Math.round(10 + t * 90);
    return (
      <>
        <Axis labelX={kind === "dimensionality" ? "component 1" : "latent x"} labelY={kind === "dimensionality" ? "component 2" : "latent y"} />
        {kind === "mcmc" && <path d={line(density) ?? ""} fill="none" stroke={COLORS.pink} strokeWidth={4} />}
        {kind === "generative" && <><path d={`M${x(2)},${y(2)} C${x(4)},${y(8)} ${x(6)},${y(1)} ${x(8.5)},${y(7.5)}`} fill="none" stroke={COLORS.yellow} strokeWidth={4} /><PointMark px={x(2 + t * 6.5)} py={y(2 + Math.sin(t * Math.PI) * 4.7 + t * 5.5)} color={COLORS.yellow} label="z" /></>}
        {kind === "dimensionality" && <line x1={x(5 - ux * 4.2)} y1={y(5 - uy * 4.2)} x2={x(5 + ux * 4.2)} y2={y(5 + uy * 4.2)} stroke={COLORS.pink} strokeWidth={4} />}
        {cloud.map((p) => {
          const centeredX = p.x - 5;
          const centeredY = p.y - 5;
          const projection = centeredX * ux + centeredY * uy;
          const onAxisX = kind === "dimensionality" ? 5 + projection * ux : p.x;
          const onAxisY = kind === "dimensionality" ? 5 + projection * uy : p.y;
          return (
            <g key={`${p.x}-${p.y}`}>
              {kind === "kmeans" && <line x1={x(p.x)} y1={y(p.y)} x2={x(p.label ? c2.x : c1.x)} y2={y(p.label ? c2.y : c1.y)} stroke={COLORS.yellow} strokeOpacity={0.5} />}
              {kind === "dimensionality" && <line x1={x(p.x)} y1={y(p.y)} x2={x(onAxisX)} y2={y(onAxisY)} stroke={COLORS.yellow} strokeDasharray="4 4" />}
              <PointMark px={x(p.x)} py={y(p.y)} color={p.label ? COLORS.pink : COLORS.cyan} r={5} />
              {kind === "generative" && <circle cx={x(2 + p.label * 5 + Math.sin(p.x + t * 4) * 0.6)} cy={y(2 + p.label * 5 + Math.cos(p.y + t * 4) * 0.6)} r={5} fill={p.label ? COLORS.pink : COLORS.cyan} opacity={0.45} />}
            </g>
          );
        })}
        {kind === "kmeans" && <><PointMark px={x(c1.x)} py={y(c1.y)} color={COLORS.cyan} r={10} label="C1" /><PointMark px={x(c2.x)} py={y(c2.y)} color={COLORS.pink} r={10} label="C2" /></>}
        {kind === "mcmc" && d3.range(0, chainLength).map((i) => <PointMark key={i} px={x(2 + i * 0.065 + Math.sin(i) * 0.35)} py={y(1.3 + Math.abs(Math.sin(i * 0.7)) * 6)} color={i % 5 === 0 ? COLORS.yellow : COLORS.cyan} r={i % 5 === 0 ? 4 : 5} />)}
        {kind === "dimensionality" && <MiniStat x0={440} y0={80} label="variance captured" value={`${Math.round(42 + Math.abs(Math.cos(angle - 0.65)) * 53)}%`} />}
      </>
    );
  }

  if (["neural-network", "cnn", "vision", "nlp", "autoencoder", "transformer", "llm", "rl"].includes(kind)) {
    return <NeuralScene kind={kind} t={t} />;
  }

  if (kind === "bias-variance") {
    const fit = d3.range(0, 10.05, 0.18).map((v) => ({ x: x(v), y: y(5 + Math.sin(v * (0.7 + t * 2.3)) * (1 + t * 2.1)) }));
    return (
      <>
        <Axis labelX="x" labelY="y" />
        {basePoints.map((p) => <PointMark key={p.x} px={x(p.x)} py={y(5 + Math.sin(p.x) * 2)} color={COLORS.cyan} r={5} />)}
        <path d={line(fit) ?? ""} fill="none" stroke={COLORS.pink} strokeWidth={4} />
        <path d={`M452,304 C500,${286 - t * 100} 552,${256 - t * 86} 606,${228 - t * 70}`} fill="none" stroke={COLORS.cyan} strokeWidth={3} />
        <path d={`M452,250 C500,${214 - t * 80} 552,${154 + t * 20} 606,${120 + t * 110}`} fill="none" stroke={COLORS.yellow} strokeWidth={3} />
        <MiniStat x0={444} y0={58} label="complexity" value={(1 + t * 9).toFixed(1)} />
      </>
    );
  }

  if (kind === "metrics") {
    const threshold = t * 10;
    const negMu = 3.7;
    const posMu = 6.3;
    const sigma = 1.25;
    const pdf = (v: number, mu: number) => Math.exp(-0.5 * ((v - mu) / sigma) ** 2) * 8;
    const neg = d3.range(0, 10.05, 0.1).map((v) => ({ x: x(v), y: y(pdf(v, negMu)) }));
    const pos = d3.range(0, 10.05, 0.1).map((v) => ({ x: x(v), y: y(pdf(v, posMu)) }));
    const tpr = 1 / (1 + Math.exp((threshold - posMu) / 0.8));
    const fpr = 1 / (1 + Math.exp((threshold - negMu) / 0.8));
    const precision = tpr / Math.max(0.01, tpr + fpr);
    const recall = tpr;
    const f1 = (2 * precision * recall) / Math.max(0.01, precision + recall);
    return (
      <>
        <Axis labelX="score" labelY="density" />
        <path d={`${line(neg) ?? ""} L${plot.right},${plot.bottom} L${plot.left},${plot.bottom} Z`} fill={COLORS.pink} opacity={0.12} stroke={COLORS.pink} strokeWidth={3} />
        <path d={`${line(pos) ?? ""} L${plot.right},${plot.bottom} L${plot.left},${plot.bottom} Z`} fill={COLORS.cyan} opacity={0.12} stroke={COLORS.cyan} strokeWidth={3} />
        <line x1={x(threshold)} x2={x(threshold)} y1={plot.top} y2={plot.bottom} stroke={COLORS.yellow} strokeWidth={4} />
        <rect x={462} y={68} width={118} height={118} fill="none" stroke={COLORS.border} />
        <path d={`M462,186 C498,${176 - fpr * 92} 536,${176 - tpr * 100} 580,${186 - tpr * 118}`} fill="none" stroke={COLORS.cyan} strokeWidth={3} />
        <PointMark px={462 + fpr * 118} py={186 - tpr * 118} color={COLORS.yellow} r={6} />
        <MiniStat x0={440} y0={220} label="precision / recall" value={`${precision.toFixed(2)} / ${recall.toFixed(2)}`} />
        <MiniStat x0={440} y0={288} label="F1 score" value={f1.toFixed(2)} />
      </>
    );
  }

  const mode = t < 0.5 ? "L1" : "L2";
  return (
    <>
      <Axis labelX="w1" labelY="w2" />
      {[1, 2, 3, 4].map((r) => <ellipse key={r} cx={x(6.6)} cy={y(6.8)} rx={r * 32} ry={r * 22} fill="none" stroke={COLORS.pink} strokeOpacity={0.24} strokeWidth={2} />)}
      {mode === "L1" ? <path d={`M${x(5)},${y(8.6)} L${x(8.4)},${y(5)} L${x(5)},${y(1.4)} L${x(1.6)},${y(5)} Z`} fill={COLORS.cyan} opacity={0.14} stroke={COLORS.cyan} strokeWidth={3} /> : <circle cx={x(5)} cy={y(5)} r={92} fill={COLORS.cyan} opacity={0.14} stroke={COLORS.cyan} strokeWidth={3} />}
      <PointMark px={x(mode === "L1" ? 5 : 5.7)} py={y(mode === "L1" ? 8.6 : 7.2)} color={COLORS.yellow} label={`${mode} optimum`} />
    </>
  );
}

function TreeDiagram({ activeRight }: { activeRight: boolean }) {
  return (
    <g>
      <rect x={0} y={0} width={140} height={48} fill="rgba(250,248,242,0.9)" stroke={COLORS.border} />
      <rect x={-34} y={86} width={88} height={42} fill="rgba(85,107,74,0.12)" stroke={activeRight ? COLORS.border : COLORS.cyan} strokeWidth={activeRight ? 1 : 3} />
      <rect x={90} y={86} width={88} height={42} fill="rgba(141,81,73,0.12)" stroke={activeRight ? COLORS.pink : COLORS.border} strokeWidth={activeRight ? 3 : 1} />
      <line x1={50} y1={48} x2={10} y2={86} stroke={activeRight ? COLORS.border : COLORS.yellow} strokeWidth={activeRight ? 2 : 4} />
      <line x1={90} y1={48} x2={130} y2={86} stroke={activeRight ? COLORS.yellow : COLORS.border} strokeWidth={activeRight ? 4 : 2} />
      <text x={18} y={28} fill={COLORS.muted} fontSize={12} fontWeight={800} stroke="rgba(250,248,242,0.9)" strokeWidth={3} paintOrder="stroke">x &lt; split?</text>
      <text x={-12} y={112} fill={COLORS.cyan} fontSize={12} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">leaf A</text>
      <text x={112} y={112} fill={COLORS.pink} fontSize={12} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">leaf B</text>
    </g>
  );
}

function NeuralScene({ kind, t }: { kind: AlgorithmKind; t: number }) {
  if (kind === "neural-network") {
    const stageIndex = t < 0.25 ? 0 : t < 0.52 ? 1 : t < 0.76 ? 2 : 3;
    const stageNames = ["1. input features", "2. hidden activations", "3. prediction loss", "4. backprop update"];
    const sample = [
      { label: "x1", value: 0.82 },
      { label: "x2", value: 0.34 },
      { label: "bias", value: 1 },
    ];
    const hidden = [
      { y: 112, z: 0.92, a: 0.72, label: "h1" },
      { y: 188, z: -0.38, a: 0.41, label: "h2" },
      { y: 264, z: 0.21, a: 0.55, label: "h3" },
    ];
    const inputY = [112, 188, 264];
    const output = 0.68 + Math.sin(t * Math.PI * 1.15) * 0.08;
    const target = 1;
    const loss = (target - output) ** 2;
    const layerX = { input: 108, hidden: 286, output: 474 };
    const active = (index: number) => stageIndex >= index;
    const forwardOpacity = active(1) ? 0.72 : 0.18;
    const gradientOpacity = active(3) ? 0.75 : 0.12;
    const nodeFill = (on: boolean, color: string) => (on ? color : COLORS.bg);
    const nodeOpacity = (on: boolean) => (on ? 0.9 : 0.22);
    const weight = (i: number, h: number) => 0.8 + ((i + h) % 3) * 0.45;

    return (
      <g>
        <rect x={54} y={54} width={532} height={302} fill="rgba(250,248,242,0.68)" stroke={COLORS.border} />
        <StageIndicator stages={stageNames} currentStage={stageIndex} />

        <text x={layerX.input} y={82} textAnchor="middle" fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">features</text>
        <text x={layerX.hidden} y={82} textAnchor="middle" fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">weighted sum + ReLU</text>
        <text x={layerX.output} y={82} textAnchor="middle" fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">prediction</text>

        {inputY.map((iy, i) => hidden.map((h, hIndex) => (
          <line
            key={`forward-${i}-${h.label}`}
            x1={layerX.input + 18}
            y1={iy}
            x2={layerX.hidden - 20}
            y2={h.y}
            stroke={COLORS.cyan}
            strokeWidth={weight(i, hIndex)}
            strokeOpacity={forwardOpacity}
          />
        )))}
        {hidden.map((h) => (
          <line
            key={`hidden-out-${h.label}`}
            x1={layerX.hidden + 20}
            y1={h.y}
            x2={layerX.output - 22}
            y2={188}
            stroke={COLORS.cyan}
            strokeWidth={1.8 + h.a * 2.6}
            strokeOpacity={active(2) ? 0.78 : 0.2}
          />
        ))}
        {hidden.map((h) => (
          <line
            key={`grad-${h.label}`}
            x1={layerX.output - 26}
            y1={188}
            x2={layerX.hidden + 24}
            y2={h.y}
            stroke={COLORS.pink}
            strokeWidth={2.4}
            strokeOpacity={gradientOpacity}
            strokeDasharray="7 5"
          />
        ))}

        {sample.map((feature, i) => (
          <g key={feature.label}>
            <circle
              cx={layerX.input}
              cy={inputY[i]}
              r={18}
              fill={nodeFill(active(0), COLORS.cyan)}
              fillOpacity={nodeOpacity(active(0))}
              stroke={active(0) ? COLORS.cyan : COLORS.border}
              strokeWidth={2}
            />
            <text x={layerX.input} y={inputY[i] + 4} textAnchor="middle" fill={active(0) ? COLORS.bg : COLORS.muted} fontSize={12} fontWeight={900}>
              {feature.label}
            </text>
            <rect x={layerX.input - 40} y={inputY[i] + 26} width={80} height={8} fill={COLORS.bg} stroke={COLORS.border} />
            <rect x={layerX.input - 40} y={inputY[i] + 26} width={80 * feature.value} height={8} fill={COLORS.cyan} fillOpacity={0.55} />
            <text x={layerX.input} y={inputY[i] + 45} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{feature.value.toFixed(2)}</text>
          </g>
        ))}

        {hidden.map((unit) => (
          <g key={unit.label}>
            <circle
              cx={layerX.hidden}
              cy={unit.y}
              r={22}
              fill={nodeFill(active(1), unit.a > 0.58 ? COLORS.yellow : COLORS.pink)}
              fillOpacity={nodeOpacity(active(1))}
              stroke={active(1) ? COLORS.yellow : COLORS.border}
              strokeWidth={2.5}
            />
            <text x={layerX.hidden} y={unit.y + 4} textAnchor="middle" fill={active(1) ? COLORS.bg : COLORS.muted} fontSize={12} fontWeight={900}>
              {unit.label}
            </text>
            <text x={layerX.hidden} y={unit.y + 45} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={700} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
              z={unit.z.toFixed(2)}
            </text>
            <rect x={layerX.hidden - 39} y={unit.y + 26} width={78} height={8} fill={COLORS.bg} stroke={COLORS.border} />
            <rect x={layerX.hidden - 39} y={unit.y + 26} width={78 * unit.a} height={8} fill={COLORS.yellow} fillOpacity={0.65} />
          </g>
        ))}

        <g>
          <circle
            cx={layerX.output}
            cy={188}
            r={29}
            fill={nodeFill(active(2), COLORS.yellow)}
            fillOpacity={nodeOpacity(active(2))}
            stroke={active(2) ? COLORS.yellow : COLORS.border}
            strokeWidth={3}
          />
          <text x={layerX.output} y={184} textAnchor="middle" fill={active(2) ? COLORS.bg : COLORS.muted} fontSize={12} fontWeight={900}>yhat</text>
          <text x={layerX.output} y={200} textAnchor="middle" fill={active(2) ? COLORS.bg : COLORS.muted} fontSize={11} fontWeight={800}>{output.toFixed(2)}</text>
          <line x1={layerX.output} x2={layerX.output + 70} y1={188} y2={188} stroke={COLORS.yellow} strokeWidth={3} strokeOpacity={active(2) ? 0.7 : 0.2} />
          <rect x={layerX.output + 80} y={142} width={74} height={92} fill="rgba(141,81,73,0.08)" stroke={COLORS.border} />
          <text x={layerX.output + 117} y={164} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>target</text>
          <text x={layerX.output + 117} y={190} textAnchor="middle" fill={COLORS.pink} fontSize={24} fontWeight={900}>{target}</text>
          <text x={layerX.output + 117} y={216} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800}>loss {loss.toFixed(2)}</text>
        </g>

        <g opacity={active(3) ? 1 : 0.28}>
          <path d="M470 268 C400 320 270 320 166 286" fill="none" stroke={COLORS.pink} strokeWidth={3} strokeDasharray="8 6" />
          <path d="M166 286 L181 284 L173 298 Z" fill={COLORS.pink} />
          <text x={326} y={334} textAnchor="middle" fill={COLORS.pink} fontSize={12} fontWeight={900} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
            gradient tells each weight how to change
          </text>
        </g>
      </g>
    );
  }

  if (kind === "cnn" || kind === "vision") {
    const n = kind === "cnn" ? 6 : 8;
    const size = 24;
    const start = { x: 80, y: 92 };
    const kx = start.x + Math.floor(t * (n - 3)) * size;
    const ky = start.y + Math.floor((1 - t) * (n - 3)) * size;
    const kernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const calcValue = (Math.sin(t * 10) * 4 + 2).toFixed(1);
    
    return (
      <g>
        {d3.range(n).map((r) => d3.range(n).map((c) => <rect key={`${r}-${c}`} x={start.x + c * size} y={start.y + r * size} width={size} height={size} fill={(r + c + (kind === "vision" ? 2 : 0)) % 3 === 0 ? COLORS.cyan : COLORS.bg} fillOpacity={(r + c) % 3 === 0 ? 0.55 : 1} stroke={COLORS.border} strokeWidth={0.8} />))}
        <rect x={kx} y={ky} width={size * 3} height={size * 3} fill="none" stroke={COLORS.yellow} strokeWidth={4} />
        
        {/* Kernel Overlay */}
        <g transform={`translate(${kx}, ${ky})`}>
          {d3.range(3).map((r) => d3.range(3).map((c) => (
            <text key={`k-${r}-${c}`} x={c * size + size / 2} y={r * size + size / 2 + 4} textAnchor="middle" fill={COLORS.yellow} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
              {kernel[r][c]}
            </text>
          )))}
        </g>

        <Vector x1={kx + size * 1.5} y1={ky + size * 1.5} x2={410} y2={178} color={COLORS.yellow} />
        
        <text x={(kx + size * 1.5 + 410) / 2} y={ky + size * 1.5 - 10} textAnchor="middle" fill={COLORS.muted} fontSize={11} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
          Σ(px × w) = {calcValue}
        </text>

        {d3.range(4).map((r) => d3.range(4).map((c) => <rect key={`${r}-${c}`} x={430 + c * 30} y={122 + r * 30} width={30} height={30} fill={(r + c + Math.round(t * 4)) % 2 ? COLORS.pink : COLORS.bg} fillOpacity={0.5} stroke={COLORS.border} />))}
        <text x={112} y={72} fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{kind === "cnn" ? "input grid" : "raw pixels"}</text>
        <text x={430} y={104} fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{kind === "cnn" ? "feature map" : "edge response"}</text>

        <MiniStat x0={430} y0={265} label="active filter" value="vertical edge" />
      </g>
    );
  }

  if (kind === "nlp") {
    const tokens = [{ w: "king", a: 2, b: 8 }, { w: "queen", a: 7, b: 8 }, { w: "man", a: 2.3, b: 3 }, { w: "woman", a: 7.2, b: 3.2 }, { w: "city", a: 8.3, b: 1.5 }, { w: "royal", a: 4.5, b: 7.2 }];
    const radius = 35 + t * 92;
    
    const target = tokens.find(t => t.w === "royal")!;
    const simTokens = [...tokens].filter(tok => tok.w !== "royal").sort((a, b) => {
      const distA = Math.sqrt((a.a - target.a)**2 + (a.b - target.b)**2);
      const distB = Math.sqrt((b.a - target.a)**2 + (b.b - target.b)**2);
      return distA - distB;
    }).slice(0, 3);

    return (
      <g>
        <Axis labelX="semantic x" labelY="semantic y" />
        <circle cx={x(4.5)} cy={y(7.2)} r={radius} fill="none" stroke={COLORS.yellow} strokeWidth={2} strokeDasharray="6 5" />
        {tokens.map((p) => <PointMark key={p.w} px={x(p.a)} py={y(p.b)} color={p.w === "royal" || p.w === "queen" ? COLORS.pink : COLORS.cyan} label={p.w} />)}
        <Vector x1={x(2.3)} y1={y(3)} x2={x(2)} y2={y(8)} color={COLORS.yellow} />
        <Vector x1={x(7.2)} y1={y(3.2)} x2={x(7)} y2={y(8)} color={COLORS.yellow} />
        
        {/* Similarity Score Table */}
        <rect x={420} y={140} width={180} height={130} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} />
        <text x={434} y={166} fill={COLORS.muted} fontSize={11} fontWeight={800} letterSpacing="0.05em">Cosine Similarity</text>
        <text x={434} y={180} fill={COLORS.cyan} fontSize={10} fontWeight={700}>query: "royal"</text>
        
        {simTokens.map((st, i) => {
          const dist = Math.sqrt((st.a - target.a)**2 + (st.b - target.b)**2);
          const sim = Math.max(0, 1 - dist / 10);
          return (
            <g key={st.w}>
              <text x={434} y={210 + i * 22} fill={COLORS.muted} fontSize={12} fontWeight={700}>"{st.w}"</text>
              <rect x={490} y={202 + i * 22} width={60} height={6} fill={COLORS.bg} stroke={COLORS.border} />
              <rect x={490} y={202 + i * 22} width={60 * sim} height={6} fill={COLORS.pink} />
              <text x={586} y={210 + i * 22} textAnchor="end" fill={COLORS.muted} fontSize={11} fontWeight={700}>{sim.toFixed(2)}</text>
            </g>
          );
        })}

        <MiniStat x0={420} y0={60} label="search radius" value={`${radius.toFixed(1)}`} />
      </g>
    );
  }

  if (kind === "transformer") {
    const toks = ["the", "model", "attends", "to", "context"];
    const q = Math.min(toks.length - 1, Math.floor(t * toks.length));
    
    // Generate soft-max weights for current query token
    const rawWeights = toks.map((_, i) => Math.exp(-Math.abs(q - i) * 1.5));
    const sum = d3.sum(rawWeights);
    const weights = rawWeights.map(w => w / sum);

    return (
      <g>
        {toks.map((tok, i) => <text key={tok} x={86 + i * 98} y={84} fill={i === q ? COLORS.pink : COLORS.muted} fontSize={16} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{tok}</text>)}
        {toks.map((_, i) => {
          const midX = 100 + (q + i) * 49;
          const midY = 180 - Math.abs(q - i) * 14;
          return (
            <g key={`path-${i}`}>
              <path d={`M${100 + q * 98},105 Q${midX},${midY} ${100 + i * 98},105`} fill="none" stroke={i === q ? COLORS.pink : COLORS.yellow} strokeWidth={2 + (i === q ? 3 : 1)} strokeOpacity={0.35 + (i === q ? 0.4 : 0)} />
              <text x={midX} y={midY - 8} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">
                {weights[i].toFixed(2)}
              </text>
            </g>
          );
        })}
        {toks.map((_, r) => toks.map((__, c) => <rect key={`${r}-${c}`} x={110 + c * 34} y={214 + r * 34} width={31} height={31} fill={c === q ? COLORS.yellow : COLORS.cyan} opacity={c === q ? 0.75 : 0.12 + ((r + c) % 3) * 0.14} />))}
        
        {/* Softmax Distribution Box */}
        <rect x={110 + toks.length * 34 + 60} y={214} width={140} height={154} fill="rgba(250,248,242,0.86)" stroke={COLORS.border} />
        <text x={124 + toks.length * 34 + 60} y={236} fill={COLORS.muted} fontSize={11} fontWeight={800}>Softmax(Q × K)</text>
        {toks.map((tok, i) => (
          <g key={`dist-${tok}`}>
            <text x={124 + toks.length * 34 + 60} y={264 + i * 22} fill={i === q ? COLORS.pink : COLORS.muted} fontSize={11} fontWeight={700}>{tok}</text>
            <rect x={178 + toks.length * 34 + 60} y={256 + i * 22} width={50} height={6} fill={COLORS.bg} stroke={COLORS.border} />
            <rect x={178 + toks.length * 34 + 60} y={256 + i * 22} width={50 * weights[i]} height={6} fill={i === q ? COLORS.pink : COLORS.yellow} />
          </g>
        ))}
      </g>
    );
  }

  if (kind === "llm") {
    // Show temperature effect on logits
    const temp = 0.5 + t * 2.0; // Temperature ranges from 0.5 to 2.5
    const logits = [4.2, 3.1, 2.5, 1.2, 0.8]; // Raw logits
    const words = ["learning", "models", "data", "reasoning", "systems"];
    
    const expLogits = logits.map(l => Math.exp(l / temp));
    const totalExp = d3.sum(expLogits) ?? 1;
    const probs = expLogits.map(e => e / totalExp);

    return (
      <g>
        <text x={84} y={88} fill={COLORS.cyan} fontSize={18} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">context: machine learning improves</text>
        
        <text x={140} y={126} fill={COLORS.muted} fontSize={10} fontWeight={800} letterSpacing="0.05em">RAW LOGITS</text>
        <text x={260} y={126} fill={COLORS.muted} fontSize={10} fontWeight={800} letterSpacing="0.05em">SOFTMAX PROBABILITIES</text>

        {words.map((w, i) => (
          <g key={w}>
            <text x={118} y={150 + i * 42} textAnchor="end" fill={COLORS.muted} fontSize={13} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{w}</text>
            
            {/* Logits */}
            <text x={140} y={150 + i * 42} fill={COLORS.cyan} fontSize={12} fontWeight={700}>{logits[i].toFixed(1)}</text>
            
            {/* Arrow */}
            <Vector x1={174} y1={146 + i * 42} x2={240} y2={146 + i * 42} color={COLORS.yellow} />
            <text x={207} y={142 + i * 42} textAnchor="middle" fill={COLORS.muted} fontSize={9} fontWeight={700}>÷ {temp.toFixed(1)}</text>
            
            {/* Probability Bar */}
            <rect x={260} y={134 + i * 42} width={probs[i] * 240} height={24} fill={i === 0 ? COLORS.pink : COLORS.yellow} opacity={i === 0 ? 0.85 : 0.45} />
            <text x={260 + probs[i] * 240 + 8} y={151 + i * 42} fill={COLORS.muted} fontSize={12} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">{(probs[i] * 100).toFixed(1)}%</text>
          </g>
        ))}

        <MiniStat x0={500} y0={60} label="temperature" value={temp.toFixed(2)} />
      </g>
    );
  }

  if (kind === "rl") {
    const s = 52;
    const path = [[0, 4], [1, 4], [2, 3], [3, 2], [4, 1], [4, 0]];
    const step = Math.min(path.length - 1, Math.round(t * (path.length - 1)));
    const [agentC, agentR] = path[step];
    const pathD = path.slice(0, step + 1).map(([c, r], i) => `${i === 0 ? "M" : "L"}${110 + c * s},${94 + r * s}`).join(" ");
    
    // Fake Q-values for cells
    const getQ = (r: number, c: number) => {
      const distToGoal = Math.abs(r - 0) + Math.abs(c - 4);
      return Math.max(0, 10 - distToGoal * 1.5).toFixed(1);
    };

    return (
      <g>
        {d3.range(5).map((r) => d3.range(5).map((c) => (
          <g key={`${r}-${c}`}>
            <rect x={86 + c * s} y={70 + r * s} width={s} height={s} fill={r === 0 && c === 4 ? COLORS.cyan : r === 3 && c === 2 ? COLORS.pink : COLORS.bg} fillOpacity={r === 0 && c === 4 || r === 3 && c === 2 ? 0.35 : 1} stroke={COLORS.border} />
            <text x={86 + c * s + s / 2} y={70 + r * s + s / 2 + 4} textAnchor="middle" fill={COLORS.muted} fontSize={10} fontWeight={800} opacity={0.6}>{getQ(r, c)}</text>
          </g>
        )))}
        
        <path d={pathD} fill="none" stroke={COLORS.yellow} strokeWidth={4} strokeDasharray="8 5" />
        
        <PointMark px={110 + agentC * s} py={94 + agentR * s} color={COLORS.yellow} label="agent" />
        
        {/* Reward Counter */}
        <MiniStat x0={400} y0={100} label="cumulative reward" value={(step * 1.5).toFixed(1)} />
        <MiniStat x0={400} y0={170} label="current q-value" value={getQ(agentR, agentC)} />
      </g>
    );
  }

  const latentWidth = 16 + t * 72;
  const reconError = Math.round((1 - t) * 74 + 8);
  
  // Reconstructed grid logic to show quality loss
  // Add noise or blur as the bottleneck shrinks
  const opacityOffset = (1 - t) * 0.6; // More bottleneck -> more noise
  
  return (
    <g>
      <Vector x1={110} y1={210} x2={250} y2={210} color={COLORS.cyan} label="encode" />
      <rect x={320 - latentWidth / 2} y={176} width={latentWidth} height={68} fill={COLORS.yellow} opacity={0.24} stroke={COLORS.yellow} strokeWidth={3} />
      <Vector x1={354} y1={210} x2={500} y2={210} color={COLORS.pink} label="decode" />
      
      <text x={90} y={170} fill={COLORS.cyan} fontSize={16} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">input (high res)</text>
      <text x={284} y={216} fill={COLORS.yellow} fontSize={14} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">latent (z)</text>
      <text x={488} y={170} fill={COLORS.pink} fontSize={16} fontWeight={800} stroke={COLORS.bg} strokeWidth={3} paintOrder="stroke">reconstruction</text>

      {/* Input Grid (Perfect) */}
      <g transform="translate(60, 220)">
        {d3.range(4).map(r => d3.range(4).map(c => (
          <rect key={`in-${r}-${c}`} x={c*16} y={r*16} width={14} height={14} fill={(r+c)%2===0 ? COLORS.cyan : COLORS.bg} stroke={COLORS.border} />
        )))}
      </g>
      
      {/* Reconstruction Grid (Degraded based on t) */}
      <g transform="translate(456, 220)">
        {d3.range(4).map(r => d3.range(4).map(c => {
          const isTarget = (r+c)%2===0;
          // Randomly invert colors based on error rate
          const corrupted = Math.sin(r * 13 + c * 7) * 0.5 + 0.5 < opacityOffset;
          const fill = isTarget !== corrupted ? COLORS.pink : COLORS.bg;
          return <rect key={`out-${r}-${c}`} x={c*16} y={r*16} width={14} height={14} fill={fill} opacity={1 - opacityOffset * 0.5} stroke={COLORS.border} />;
        }))}
      </g>

      <MiniStat x0={440} y0={60} label="compression" value={`${(t * 100).toFixed(0)}% info`} />
      <MiniStat x0={440} y0={290} label="reconstruction error" value={`${reconError}%`} />
    </g>
  );
}

export default function D3Visualization({ algorithmId }: { algorithmId: string }) {
  const config = configs[algorithmId] ?? configs["linear-regression"];
  const [control, setControl] = useState(56);

  return (
    <VisualizationShell
      title={config.title}
      subtitle={config.subtitle}
      insight={config.insight}
      legend={config.legend}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <PlotFrame className="min-h-[360px]">
          <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={config.title}>
            <title>{config.title}</title>
            <rect width={W} height={H} fill={COLORS.bg} />
            <Scene kind={config.kind} control={control} />
          </svg>
        </PlotFrame>
        <ControlPanel className="flex flex-col gap-3">
          <div className="rounded border border-outline bg-surface p-4 font-mono text-[11px] text-on-surface">
            <div className="mb-3 flex items-center justify-between gap-4 font-bold uppercase tracking-wide">
              <span>{config.control.label}</span>
              <span className="text-primary">{config.control.value(control)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={control}
              onChange={(event) => setControl(Number(event.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wide text-on-surface-variant">
              <span>{config.control.low}</span>
              <span>{config.control.high}</span>
            </div>
          </div>
          <div className="rounded border border-outline bg-surface p-4 text-sm leading-6 text-on-surface-variant">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-primary">Mental model</span>
            <p className="mt-2">{config.subtitle}</p>
          </div>
        </ControlPanel>
      </div>
    </VisualizationShell>
  );
}
