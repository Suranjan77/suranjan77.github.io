import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AnimatedPath,
  AnimatedPointMark,
  COLORS,
  FlowingEdge,
  MiniStat,
  NarrativeControls,
  PlotFrame,
  PulseRing,
  StepIndicator,
  SVGFilters,
  Vector,
  VisualizationInstruction,
  VisualizationShell,
} from "./visualizationPrimitives";

describe("visualization primitives", () => {
  it("renders a complete visualization shell with legend and insight", () => {
    render(
      <VisualizationShell
        title="Projection Lab"
        subtitle="Move vectors and watch projection update."
        insight="Projection separates parallel and orthogonal components."
        legend={[{ label: "Vector", color: COLORS.cyan }]}
      >
        <div>diagram body</div>
      </VisualizationShell>,
    );

    expect(screen.getByText("Projection Lab")).toBeInTheDocument();
    expect(screen.getByText("Interactive Diagram")).toBeInTheDocument();
    expect(screen.getByText("Vector")).toBeInTheDocument();
    expect(screen.getByText("Key Insight")).toBeInTheDocument();
    expect(screen.getByText("diagram body")).toBeInTheDocument();
  });

  it("wires narrative controls and disabled edge states", () => {
    const onPlayToggle = vi.fn();
    const onStepForward = vi.fn();
    const onStepBackward = vi.fn();
    const onReset = vi.fn();

    render(
      <NarrativeControls
        isPlaying={false}
        onPlayToggle={onPlayToggle}
        onStepForward={onStepForward}
        onStepBackward={onStepBackward}
        onReset={onReset}
        currentStep={0}
        totalSteps={3}
      />,
    );

    fireEvent.click(screen.getByTitle("Play"));
    fireEvent.click(screen.getByTitle("Step Forward"));
    fireEvent.click(screen.getByTitle("Reset"));

    expect(onPlayToggle).toHaveBeenCalledTimes(1);
    expect(onStepForward).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByTitle("Step Backward")).toBeDisabled();
    expect(screen.getByText("STEP 1 / 3")).toBeInTheDocument();
  });

  it("renders SVG primitives without relying on a browser SVG engine", () => {
    render(
      <svg>
        <SVGFilters />
        <AnimatedPointMark px={10} py={20} color={COLORS.pink} label="p" />
        <AnimatedPath d="M0 0 L10 10" color={COLORS.cyan} dashed />
        <FlowingEdge d="M0 0 L20 0" color={COLORS.yellow} />
        <PulseRing px={30} py={40} color={COLORS.green} />
        <Vector x1={0} y1={0} x2={20} y2={20} color={COLORS.cyan} label="v" />
        <MiniStat x0={0} y0={0} label="loss" value="0.12" />
      </svg>,
    );

    expect(screen.getByText("p")).toBeInTheDocument();
    expect(screen.getByText("v")).toBeInTheDocument();
    expect(screen.getByText("loss")).toBeInTheDocument();
    expect(screen.getByText("0.12")).toBeInTheDocument();
  });

  it("renders plot frames and step indicators", () => {
    render(
      <PlotFrame>
        <StepIndicator steps={["Prior", "Data", "Posterior"]} currentStep={1} />
      </PlotFrame>,
    );

    expect(screen.getByText("Prior")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Posterior")).toBeInTheDocument();
  });

  it("renders Markdown in visualization instructions", () => {
    const { container } = render(
      <VisualizationInstruction
        title="Interactivity tradeoff:"
        content={"- Move **left** for recall.\n- Move **right** for precision."}
      />,
    );

    expect(screen.getByText("left").tagName).toBe("STRONG");
    expect(screen.getByText("right").tagName).toBe("STRONG");
    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
    expect(container).not.toHaveTextContent("**");
  });
});
