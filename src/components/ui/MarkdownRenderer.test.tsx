import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InlineMarkdown from "./InlineMarkdown";
import LogicContent from "./LogicContent";
import MarkdownRenderer from "./MarkdownRenderer";

describe("Markdown rendering", () => {
  it("renders GitHub-flavored Markdown tables", () => {
    const content = [
      "| Metric | Value |",
      "| --- | ---: |",
      "| **Precision** | 0.95 |",
    ].join("\n");

    const { container } = render(<LogicContent content={content} />);

    expect(container.querySelector("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Metric" })).toBeInTheDocument();
    expect(screen.getByText("Precision").tagName).toBe("STRONG");
  });

  it("enables GFM tables in the general Markdown renderer", () => {
    const { container } = render(
      <MarkdownRenderer content={"| A | B |\n| --- | --- |\n| 1 | 2 |"} />,
    );

    expect(container.querySelector("table")).toBeInTheDocument();
  });

  it("renders inline emphasis without adding a paragraph", () => {
    const { container } = render(
      <p>
        <InlineMarkdown content="Uses **Mode Collapse** checks." />
      </p>,
    );

    expect(screen.getByText("Mode Collapse").tagName).toBe("STRONG");
    expect(container.querySelector("p p")).not.toBeInTheDocument();
  });
});
