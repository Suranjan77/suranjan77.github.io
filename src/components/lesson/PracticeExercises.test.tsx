import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PracticeExercises from "./PracticeExercises";
import type { PracticeExercise } from "@/data/algorithms_content/learningModuleTypes";

const exercises: PracticeExercise[] = [
  {
    prompt: "Second problem statement",
    difficulty: "challenge",
    solution: "Challenge solution text",
  },
  {
    prompt: "First problem statement",
    difficulty: "warm-up",
    hints: ["A gentle nudge"],
    solution: "Warm-up solution text",
  },
];

describe("PracticeExercises", () => {
  it("renders nothing when there are no exercises", () => {
    const { container } = render(<PracticeExercises exercises={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("orders exercises warm-up before challenge", () => {
    render(<PracticeExercises exercises={exercises} />);
    fireEvent.click(screen.getByRole("button", { name: /Show exercises/i }));
    const warmUpChip = screen.getByText("Warm-up");
    const challengeChip = screen.getByText("Challenge");
    // Warm-up exercise should appear before the challenge one in the DOM.
    expect(
      warmUpChip.compareDocumentPosition(challengeChip) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps solutions hidden until revealed", () => {
    render(<PracticeExercises exercises={exercises} />);
    fireEvent.click(screen.getByRole("button", { name: /Show exercises/i }));
    expect(screen.queryByText("Warm-up solution text")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Reveal Solution" })[0]);
    expect(screen.getByText("Warm-up solution text")).toBeInTheDocument();
  });

  it("reveals a hint only when one exists and is toggled", () => {
    render(<PracticeExercises exercises={exercises} />);
    fireEvent.click(screen.getByRole("button", { name: /Show exercises/i }));
    expect(screen.queryByText("A gentle nudge")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show Hint" }));
    expect(screen.getByText("A gentle nudge")).toBeInTheDocument();
  });
});
