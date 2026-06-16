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
      (module) => module.id === "linear-algebra",
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
    ).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByText("Module 2 of 7")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Intuition" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: "Diagram" })).toHaveAttribute(
      "href",
      "#visualization",
    );
    expect(
      screen.getAllByRole("link", { name: /Previous module: Calculus/i }),
    ).toSatisfy((links: HTMLElement[]) =>
      links.every(
        (link) => link.getAttribute("href") === "/algorithms/calculus",
      ),
    );
    expect(
      screen.getAllByRole("link", { name: /Next module: Probability/i }),
    ).toSatisfy((links: HTMLElement[]) =>
      links.every(
        (link) =>
          link.getAttribute("href") === "/algorithms/probability-theory",
      ),
    );
  });

  it("initializes scroll tracking for lesson sections", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const mockObserver = vi.fn();
    mockObserver.mockImplementation(function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).observe = observe;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).disconnect = disconnect;
    });

    const originalIntersectionObserver = window.IntersectionObserver;
    document.body.innerHTML =
      '<div id="intuition"></div><div id="visualization"></div><div id="mathematics"></div>';

    // @ts-expect-error mocking global/window IntersectionObserver
    window.IntersectionObserver = mockObserver as any;
    // @ts-expect-error mocking global/window IntersectionObserver
    global.IntersectionObserver = mockObserver as any;

    const currentModule = algorithmsList.find(
      (module) => module.id === "linear-algebra",
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
      // @ts-expect-error cleanup
      delete (window as any).IntersectionObserver;
      // @ts-expect-error cleanup
      delete (global as any).IntersectionObserver;
    } else {
      window.IntersectionObserver = originalIntersectionObserver;
      // @ts-expect-error mocking global/window IntersectionObserver
      global.IntersectionObserver = originalIntersectionObserver;
    }
  });

  it("navigates when a different track module is selected", () => {
    const currentModule = algorithmsList.find(
      (module) => module.id === "calculus",
    );

    render(
      <LessonNavigator
        currentModule={currentModule!}
        allModules={algorithmsList}
      />,
    );

    fireEvent.change(
      screen.getByRole("combobox", { name: "Choose a module in this track" }),
      { target: { value: "linear-algebra" } },
    );

    expect(push).toHaveBeenCalledWith("/algorithms/linear-algebra");
  });
});
