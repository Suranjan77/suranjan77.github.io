import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GradForgeLab from "./GradForgeLab";

describe("GradForgeLab", () => {
  it("switches lessons and resets the visible timeline", () => {
    render(<GradForgeLab />);

    expect(screen.getByText(/Guided Lessons/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Step forward/i }));
    expect(screen.getByRole("slider", { name: /Execution timeline/i })).not.toHaveValue("0");

    fireEvent.click(screen.getByRole("button", { name: /Module 02/i }));
    expect(screen.getByText("Loaded preset lesson.")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /Execution timeline/i })).toHaveValue("0");
  });

  it("runs valid editor code through the custom autograd parser", () => {
    render(<GradForgeLab />);

    fireEvent.change(screen.getByRole("textbox", { name: /python editor/i }), {
      target: {
        value: [
          "x = Value(2.0, label='x')",
          "y = Value(3.0, label='y')",
          "z = x * y",
          "z.backward()",
        ].join("\n"),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));

    expect(screen.getByText(/Trace complete/i)).toBeInTheDocument();
  });

  it("surfaces parser errors for unsupported and unknown code", () => {
    render(<GradForgeLab />);
    const editor = screen.getByRole("textbox", { name: /python editor/i });

    fireEvent.change(editor, { target: { value: "x = 1" } });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));
    expect(screen.getByText(/Unsupported line: x = 1/i)).toBeInTheDocument();

    fireEvent.change(editor, { target: { value: "z = x * y" } });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));
    expect(screen.getByText(/Unknown value 'x'/i)).toBeInTheDocument();

    fireEvent.change(editor, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));
    expect(screen.getByText(/Add at least one Value/i)).toBeInTheDocument();
  });

  it("accepts Python-style numeric literals instead of rejecting valid user input", () => {
    render(<GradForgeLab />);

    fireEvent.change(screen.getByRole("textbox", { name: /python editor/i }), {
      target: {
        value: [
          "x = Value(1e-3, label='x')",
          "y = Value(.5, label='y')",
          "z = x / y",
          "z.backward()",
        ].join("\n"),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));

    expect(screen.getByText(/Trace complete/i)).toBeInTheDocument();
    expect(screen.queryByText(/Unsupported line/i)).not.toBeInTheDocument();
  });

  it("stops custom autoplay when switching lessons or resetting the editor", () => {
    vi.useFakeTimers();
    render(<GradForgeLab />);

    fireEvent.change(screen.getByRole("textbox", { name: /python editor/i }), {
      target: {
        value: [
          "x = Value(2.0, label='x')",
          "y = Value(3.0, label='y')",
          "z = x * y",
          "z.backward()",
        ].join("\n"),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));
    fireEvent.click(screen.getByRole("button", { name: /Module 02/i }));

    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(screen.getByRole("slider", { name: /Execution timeline/i })).toHaveValue("0");

    fireEvent.change(screen.getByRole("textbox", { name: /python editor/i }), {
      target: {
        value: [
          "x = Value(2.0, label='x')",
          "y = Value(3.0, label='y')",
          "z = x * y",
          "z.backward()",
        ].join("\n"),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));
    fireEvent.click(screen.getByRole("button", { name: /^reset$/i }));

    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(screen.getByRole("slider", { name: /Execution timeline/i })).toHaveValue("0");
    vi.useRealTimers();
  });

  it("keeps finite-difference output renderable for zero divisors", () => {
    render(<GradForgeLab />);

    fireEvent.change(screen.getByRole("textbox", { name: /python editor/i }), {
      target: {
        value: [
          "x = Value(1.0, label='x')",
          "y = Value(0.0, label='y')",
          "z = x / y",
          "z.backward()",
        ].join("\n"),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));

    expect(screen.getByText(/Trace complete/i)).toBeInTheDocument();
    expect(screen.queryByText(/Infinity|NaN/i)).not.toBeInTheDocument();
  });

  it("selects graph nodes by keyboard and changes implementation tabs", () => {
    render(<GradForgeLab />);

    const graphNodes = screen.getAllByRole("button").filter((button) =>
      button.textContent?.includes("x"),
    );
    fireEvent.click(graphNodes[0]);
    expect(screen.getByText(/Python Engine Notes/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rules" }));
    expect(
      screen.getAllByText((_content, element) =>
        Boolean(element?.textContent?.includes("def _backward")),
      ).length,
    ).toBeGreaterThan(0);
  });

  it("advances autoplay with fake timers", () => {
    vi.useFakeTimers();
    render(<GradForgeLab />);

    const slider = screen.getByRole("slider", { name: /Execution timeline/i });
    expect(slider).toHaveValue("0");

    fireEvent.change(screen.getByRole("textbox", { name: /python editor/i }), {
      target: {
        value: [
          "x = Value(2.0, label='x')",
          "y = Value(3.0, label='y')",
          "z = x * y",
          "z.backward()",
        ].join("\n"),
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /run trace/i }));
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(screen.getByRole("slider", { name: /Execution timeline/i })).not.toHaveValue("0");
    vi.useRealTimers();
  });
});
