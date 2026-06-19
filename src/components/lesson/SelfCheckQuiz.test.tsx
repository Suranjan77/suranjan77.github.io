import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SelfCheckQuiz from "./SelfCheckQuiz";
import type { QuizQuestion } from "@/data/algorithms_content/learningModuleTypes";

const questions: QuizQuestion[] = [
  {
    question: "What is 2 + 2?",
    options: [
      { text: "Three", correct: false },
      { text: "Four", correct: true },
      { text: "Five", correct: false },
    ],
    explanation: "Two plus two equals four.",
  },
];

describe("SelfCheckQuiz", () => {
  it("renders nothing when there are no questions", () => {
    const { container } = render(<SelfCheckQuiz questions={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("hides the explanation until an option is chosen", () => {
    render(<SelfCheckQuiz questions={questions} />);
    fireEvent.click(screen.getByRole("button", { name: /Show quiz/i }));
    expect(
      screen.queryByText("Two plus two equals four."),
    ).not.toBeInTheDocument();
  });

  it("marks the chosen wrong answer and the correct one after answering", () => {
    render(<SelfCheckQuiz questions={questions} />);
    fireEvent.click(screen.getByRole("button", { name: /Show quiz/i }));
    fireEvent.click(screen.getByRole("radio", { name: /Three/ }));

    expect(screen.getByText("Your pick")).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("Two plus two equals four.")).toBeInTheDocument();
  });

  it("locks options after answering and resets via Try again", () => {
    render(<SelfCheckQuiz questions={questions} />);
    fireEvent.click(screen.getByRole("button", { name: /Show quiz/i }));
    fireEvent.click(screen.getByRole("radio", { name: /Four/ }));

    // Options are disabled once answered.
    expect(screen.getByRole("radio", { name: /Three/ })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      screen.queryByText("Two plus two equals four."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Three/ })).not.toBeDisabled();
  });
});
