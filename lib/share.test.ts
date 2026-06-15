import { buildSharePayload, encodeShare, decodeShare } from "./share";
import { AssessmentResult } from "./types";

const result: AssessmentResult = {
  maturity: {
    overallPct: 72,
    level: 4,
    levelLabel: "Managed",
    categoryScores: [
      { categoryId: "access", ownerLabel: "Who can get in", scorePct: 80, level: "strength" },
      { categoryId: "net", ownerLabel: "Network & Boundary Security", scorePct: 50, level: "developing" },
    ],
  },
  insurance: null,
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  nextSteps: [],
};

describe("share codec", () => {
  it("builds a payload of scores only — no answers or PII", () => {
    const p = buildSharePayload("business", result);
    expect(p).toEqual({
      path: "business",
      pct: 72,
      level: 4,
      label: "Managed",
      cats: [
        { label: "Who can get in", pct: 80 },
        { label: "Network & Boundary Security", pct: 50 },
      ],
    });
  });

  it("round-trips through encode/decode (incl. unicode-safe labels)", () => {
    const p = buildSharePayload("it", result);
    const decoded = decodeShare(encodeShare(p));
    expect(decoded).toEqual(p);
  });

  it("produces a URL-safe token (no +, / or =)", () => {
    const token = encodeShare(buildSharePayload("business", result));
    expect(token).not.toMatch(/[+/=]/);
  });

  it("returns null for malformed input rather than throwing", () => {
    expect(decodeShare("not-valid-base64!!")).toBeNull();
    expect(decodeShare("")).toBeNull();
  });
});
