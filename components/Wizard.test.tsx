import { render, screen, fireEvent } from "@testing-library/react";
import Wizard from "./Wizard";
import { AnswerOption, Category, Question } from "@/lib/types";

const scale: AnswerOption[] = [
  { value: "yes", label: "Yes", credit: 1 },
  { value: "no", label: "No", credit: 0 },
  { value: "unsure", label: "Not sure", credit: 0 },
];

const categories: Category[] = [
  { id: "access", ownerLabel: "Who can get in", description: "d1", threat: "t1" },
  { id: "backups", ownerLabel: "Your safety net", description: "d2", threat: "t2" },
];

const questions: Question[] = [
  { id: "acc1", text: "Access question one?", weight: 1, kind: "maturity", categoryId: "access" },
  { id: "bak1", text: "Backup question one?", weight: 1, kind: "maturity", categoryId: "backups" },
];

function setup() {
  const answers: Record<string, "yes" | "no" | "unsure"> = {};
  const onComplete = jest.fn();
  const onAnswer = jest.fn((id, a) => {
    answers[id] = a;
  });
  const utils = render(
    <Wizard
      categories={categories}
      questions={questions}
      answers={answers}
      answerScale={scale}
      onAnswer={onAnswer}
      onComplete={onComplete}
    />
  );
  return { ...utils, onComplete, onAnswer };
}

describe("Wizard", () => {
  it("shows the first category and disables Next until answered", () => {
    setup();
    expect(screen.getByText("Who can get in")).toBeInTheDocument();
    expect(screen.getByText("Access question one?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/ })).toBeDisabled();
  });

  it("records an answer when an option is clicked", () => {
    const { onAnswer } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(onAnswer).toHaveBeenCalledWith("acc1", "yes");
  });

  it("does not complete from the first section", () => {
    const { onComplete } = setup();
    // even if we could click Next, the first section is not the last
    expect(screen.queryByRole("button", { name: /See my results/ })).not.toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
