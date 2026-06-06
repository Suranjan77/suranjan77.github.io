import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  useDraggable,
  useNarrativeStepper,
  useSimulation,
  useSpringValue,
} from "./useAnimationEngine";

function StepperHarness() {
  const stepper = useNarrativeStepper(3, 50);
  return (
    <div>
      <p>step:{stepper.currentStep}</p>
      <p>playing:{String(stepper.isPlaying)}</p>
      <button onClick={stepper.stepForward}>forward</button>
      <button onClick={stepper.stepBackward}>back</button>
      <button onClick={stepper.play}>play</button>
      <button onClick={stepper.pause}>pause</button>
      <button onClick={stepper.reset}>reset</button>
    </div>
  );
}

function DragHarness() {
  const draggable = useDraggable({ x: 5, y: 5 }, undefined, {
    minX: 0,
    maxX: 10,
    minY: 0,
    maxY: 10,
  });
  return (
    <svg role="img" aria-label="Interactive use Animation Engine.test.tsx visualization diagram">
            <title>use Animation Engine.test.tsx Diagram</title>
      <circle
        data-testid="handle"
        cx={draggable.position.x}
        cy={draggable.position.y}
        r="4"
        {...draggable.dragProps}
      />
      <text>dragging:{String(draggable.isDragging)}</text>
      <text>
        pos:{draggable.position.x},{draggable.position.y}
      </text>
    </svg>
  );
}

function SimulationHarness({ tick }: { tick: () => void }) {
  const simulation = useSimulation(tick, 60);
  return (
    <div>
      <p>running:{String(simulation.isRunning)}</p>
      <button onClick={simulation.start}>start</button>
      <button onClick={simulation.stop}>stop</button>
      <button onClick={simulation.step}>step</button>
    </div>
  );
}

function SpringHarness({ value }: { value: number }) {
  const spring = useSpringValue(value);
  return <p>spring:{String(typeof spring.get === "function")}</p>;
}

describe("animation engine hooks", () => {
  it("steps forward, backward, resets, and auto-pauses at the last narrative step", () => {
    vi.useFakeTimers();
    render(<StepperHarness />);

    fireEvent.click(screen.getByText("forward"));
    expect(screen.getByText("step:1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("back"));
    expect(screen.getByText("step:0")).toBeInTheDocument();

    fireEvent.click(screen.getByText("play"));
    act(() => vi.advanceTimersByTime(150));

    expect(screen.getByText("step:2")).toBeInTheDocument();
    expect(screen.getByText("playing:false")).toBeInTheDocument();

    fireEvent.click(screen.getByText("reset"));
    expect(screen.getByText("step:0")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("updates draggable SVG position and clamps to bounds", () => {
    render(<DragHarness />);
    const handle = screen.getByTestId("handle");

    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 5, clientY: 5 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 40, clientY: 40 });
    fireEvent.pointerUp(handle, { pointerId: 1 });

    expect(screen.getByText("pos:10,10")).toBeInTheDocument();
    expect(screen.getByText("dragging:false")).toBeInTheDocument();
  });

  it("runs manual simulation steps and exposes running state", () => {
    const tick = vi.fn();
    render(<SimulationHarness tick={tick} />);

    fireEvent.click(screen.getByText("step"));
    expect(tick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("start"));
    expect(screen.getByText("running:true")).toBeInTheDocument();

    fireEvent.click(screen.getByText("stop"));
    expect(screen.getByText("running:false")).toBeInTheDocument();
  });

  it("returns a framer motion spring value", () => {
    const { rerender } = render(<SpringHarness value={1} />);
    expect(screen.getByText("spring:true")).toBeInTheDocument();

    rerender(<SpringHarness value={2} />);
    expect(screen.getByText("spring:true")).toBeInTheDocument();
  });
});
