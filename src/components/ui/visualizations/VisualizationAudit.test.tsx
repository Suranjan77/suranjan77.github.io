import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { algorithmsList } from "@/data/algorithms_content";
import D3Visualization, { visualizationRegistry } from "./D3Visualization";

afterEach(cleanup);

function hasAccessibleName(element: HTMLElement) {
  const id = element.getAttribute("id");
  const labelledBy = element.getAttribute("aria-labelledby");

  return Boolean(
    element.getAttribute("aria-label") ||
      labelledBy ||
      element.getAttribute("title") ||
      element.textContent?.trim() ||
      (id && document.querySelector(`label[for="${id}"]`)),
  );
}

describe("visualization audit contract", () => {
  it.each(algorithmsList)(
    "$id has a named visual, finite output, and named controls",
    (module) => {
      const entry = visualizationRegistry[module.id];
      const { container } = render(
        <D3Visualization algorithmId={module.id} />,
      );

      expect(
        screen.getByRole("img", { name: entry.accessibleLabel }),
      ).toBeInTheDocument();
      expect(container.textContent).not.toMatch(/\b(?:NaN|Infinity)\b/);

      const controls = container.querySelectorAll<HTMLElement>(
        "button, input, select, textarea",
      );
      for (const control of controls) {
        expect(
          hasAccessibleName(control),
          `${module.id} contains an unnamed ${control.tagName.toLowerCase()} control`,
        ).toBe(true);
      }
    },
  );
});
