import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CurriculumExplorer from "./CurriculumExplorer";
import { algorithms } from "@/data/algorithms";

function setColumns(columns: 1 | 2 | 3) {
  const matches = (query: string) => {
    if (query.includes("1024px")) return columns === 3;
    if (query.includes("640px")) return columns >= 2;
    return false;
  };

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("CurriculumExplorer", () => {
  it("opens the first algorithm by default with preview and full-study CTA", () => {
    setColumns(3);
    render(<CurriculumExplorer algorithms={algorithms.slice(0, 6)} />);

    expect(screen.getByRole("button", { name: /Applied ML Workflow/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: /open full study/i })).toHaveAttribute(
      "href",
      "/algorithms/applied-ml-workflow",
    );
    expect(screen.getByText("Key Equation")).toBeInTheDocument();
  });

  it("toggles cards closed and opens another card with scrolling", () => {
    vi.useFakeTimers();
    setColumns(2);
    render(<CurriculumExplorer algorithms={algorithms.slice(0, 6)} />);

    fireEvent.click(screen.getByRole("button", { name: /Applied ML Workflow/i }));
    expect(screen.queryByRole("link", { name: /open full study/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /K-Nearest Neighbors/i }));
    expect(screen.getByRole("button", { name: /K-Nearest Neighbors/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    vi.advanceTimersByTime(150);
    expect(window.scrollTo).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("preserves expanded panel behavior under a single-column layout", () => {
    setColumns(1);
    render(<CurriculumExplorer algorithms={algorithms.slice(0, 3)} />);

    fireEvent.click(screen.getByRole("button", { name: /Logistic Regression/i }));
    expect(screen.getByRole("button", { name: /Logistic Regression/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: /open full study/i })).toHaveAttribute(
      "href",
      "/algorithms/logistic-regression",
    );
  });
});
