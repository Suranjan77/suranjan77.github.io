import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { algorithmsList } from "@/data/algorithms_content";
import LessonNavigator from "./LessonNavigator";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LessonNavigator", () => {
  it("exposes track movement and section shortcuts", () => {
    const currentModule = algorithmsList.find(
      (module) => module.id === "logistic-regression",
    );
    expect(currentModule).toBeDefined();

    render(
      <LessonNavigator
        currentModule={currentModule!}
        allModules={algorithmsList}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Sections in this lesson" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Track progress" }),
    ).toHaveAttribute("aria-valuenow", "3");
    expect(screen.getByText(/Module 3 of \d+/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Intuition" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: "Diagram" })).toHaveAttribute(
      "href",
      "#visualization",
    );
    expect(
      screen.getAllByRole("link", { name: /Previous module: Linear Regression/i }),
    ).toSatisfy((links: HTMLElement[]) =>
      links.every(
        (link) => link.getAttribute("href") === "/algorithms/linear-regression",
      ),
    );
    expect(
      screen.getAllByRole("link", { name: /Next module: L1 & L2 Regularization/i }),
    ).toSatisfy((links: HTMLElement[]) =>
      links.every(
        (link) =>
          link.getAttribute("href") === "/algorithms/regularization",
      ),
    );
  });

  it("initializes scroll tracking for lesson sections", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const mockObserver = vi.fn();
    mockObserver.mockImplementation(function (this: Record<string, unknown>) {
      this.observe = observe;
      this.disconnect = disconnect;
    });

    const originalIntersectionObserver = window.IntersectionObserver;
    document.body.innerHTML =
      '<div id="intuition"></div><div id="visualization"></div><div id="mathematics"></div>';

    window.IntersectionObserver = mockObserver as unknown as typeof IntersectionObserver;
    global.IntersectionObserver = mockObserver as unknown as typeof IntersectionObserver;

    const currentModule = algorithmsList.find(
      (module) => module.id === "logistic-regression",
    );
    expect(currentModule).toBeDefined();

    render(
      <LessonNavigator
        currentModule={currentModule!}
        allModules={algorithmsList}
      />,
    );

    expect(mockObserver).toHaveBeenCalled();
    expect(observe).toHaveBeenCalled();
    expect(disconnect).not.toHaveBeenCalled();

    // Restore the original IntersectionObserver after the test.
    if (originalIntersectionObserver === undefined) {
      delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
      delete (global as { IntersectionObserver?: unknown }).IntersectionObserver;
    } else {
      window.IntersectionObserver = originalIntersectionObserver;
      global.IntersectionObserver = originalIntersectionObserver;
    }
  });

  it("navigates when a different track module is selected", () => {
    const currentModule = algorithmsList.find(
      (module) => module.id === "linear-regression",
    );

    render(
      <LessonNavigator
        currentModule={currentModule!}
        allModules={algorithmsList}
      />,
    );

    fireEvent.change(
      screen.getByRole("combobox", { name: "Choose a module in this track" }),
      { target: { value: "logistic-regression" } },
    );

    expect(push).toHaveBeenCalledWith("/algorithms/logistic-regression");
  });
});
