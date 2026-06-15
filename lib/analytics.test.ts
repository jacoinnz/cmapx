import {
  completionByPath,
  funnelByPath,
  dropOff,
  biggestDropStep,
  clicksPerButton,
  clicksPerSession,
  EventRow,
} from "./analytics";

// 3 sessions on the business path (6 sections, steps 0..5):
//  s1: views 0,1,2 then stops  (drops after section 3 / step 2)
//  s2: views 0 then stops      (first-click-then-leaves)
//  s3: views 0..5 then completes
const events: EventRow[] = [
  // s1
  { sessionId: "s1", type: "section_view", path: "business", step: 0 },
  { sessionId: "s1", type: "click", path: "business", label: "Yes" },
  { sessionId: "s1", type: "section_view", path: "business", step: 1 },
  { sessionId: "s1", type: "click", path: "business", label: "Next →" },
  { sessionId: "s1", type: "section_view", path: "business", step: 2 },
  // s2 — bails immediately
  { sessionId: "s2", type: "section_view", path: "business", step: 0 },
  { sessionId: "s2", type: "click", path: "business", label: "No" },
  // s3 — completes
  ...[0, 1, 2, 3, 4, 5].map((step) => ({ sessionId: "s3", type: "section_view", path: "business", step } as EventRow)),
  { sessionId: "s3", type: "assessment_complete", path: "business" },
  { sessionId: "s3", type: "click", path: "business", label: "Yes" },
];

describe("completionByPath", () => {
  it("counts started vs completed sessions and the rate", () => {
    const c = completionByPath(events).business;
    expect(c.started).toBe(3); // all three viewed at least section 0
    expect(c.completed).toBe(1); // only s3
    expect(c.rate).toBe(33);
  });
});

describe("funnelByPath / dropOff", () => {
  it("reports how many sessions reached each section", () => {
    const f = funnelByPath(events, "business");
    // reached >= step k: step0=3, step1=2 (s1,s3), step2=2, step3=1, step4=1, step5=1
    expect(f.find((x) => x.step === 0)!.reached).toBe(3);
    expect(f.find((x) => x.step === 1)!.reached).toBe(2);
    expect(f.find((x) => x.step === 2)!.reached).toBe(2);
    expect(f.find((x) => x.step === 3)!.reached).toBe(1);
  });

  it("identifies the biggest single drop-off step (the 'standard' bail point)", () => {
    // drop after step 0 = 3-2 = 1; after step 2 = 2-1 = 1 (tie -> earliest)
    expect(biggestDropStep(events, "business")).toBe(0);
  });

  it("counts the drop between consecutive sections", () => {
    const d = dropOff(events, "business");
    expect(d.find((x) => x.step === 0)!.dropped).toBe(1); // s2 left after section 0
  });
});

describe("clicks", () => {
  it("tallies clicks per button label, busiest first", () => {
    const byBtn = clicksPerButton(events);
    expect(byBtn[0].label).toBe("Yes");
    expect(byBtn.find((b) => b.label === "Yes")!.count).toBe(2);
  });

  it("averages clicks per session", () => {
    const c = clicksPerSession(events);
    expect(c.sessions).toBe(3);
    expect(c.totalClicks).toBe(4);
  });
});
