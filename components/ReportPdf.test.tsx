/**
 * @jest-environment node
 */
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "./ReportPdf";
import { scoreAssessment } from "@/lib/scoring";
import { questions, categories } from "@/lib/questions";
import { AnswerMap } from "@/lib/types";

it("renders a non-empty PDF for a complete answer set", async () => {
  const answers: AnswerMap = {};
  questions.forEach((q) => (answers[q.id] = "yes"));
  const result = scoreAssessment(answers, questions, categories);

  const buffer = await renderToBuffer(<ReportDocument result={result} />);
  // A real PDF is far larger than this; we just prove generation didn't throw.
  expect(buffer.length).toBeGreaterThan(1000);
}, 20000);
