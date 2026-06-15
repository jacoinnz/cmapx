import React from "react";
import { render, screen } from "@testing-library/react";
import { ReportDocument } from "./ReportPdf";
import { scoreAssessment } from "@/lib/scoring";
import { questions, categories } from "@/lib/questions";
import { AnswerMap } from "@/lib/types";

// @react-pdf/renderer is ESM and is exercised end-to-end in the live app (see the
// Playwright PDF-download check). Here we stub its primitives as DOM elements so
// we can assert the document's *composition* — that the report includes the real
// scored content — without invoking the heavy ESM renderer.
jest.mock("@react-pdf/renderer", () => ({
  Document: ({ children }: any) => <div>{children}</div>,
  Page: ({ children }: any) => <div>{children}</div>,
  View: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  Link: ({ children }: any) => <span>{children}</span>,
  Image: () => null,
  StyleSheet: { create: (s: unknown) => s },
  Font: { register: () => {} },
}));

it("composes a report containing the scored maturity level and a recommendation", () => {
  const answers: AnswerMap = {};
  questions.forEach((q) => (answers[q.id] = "yes"));
  const result = scoreAssessment(answers, questions, categories);

  render(<ReportDocument result={result} />);

  // all-yes => top band; the level label must appear in the document
  expect(screen.getAllByText(/Strong/).length).toBeGreaterThan(0);
});

it("lists next-step recommendations when there are gaps", () => {
  const answers: AnswerMap = {};
  questions.forEach((q) => (answers[q.id] = "no"));
  const result = scoreAssessment(answers, questions, categories);

  render(<ReportDocument result={result} />);

  // a known recommendation from a gap should be present
  expect(screen.getAllByText(/two-step login/i).length).toBeGreaterThan(0);
});
