import { classifyEffort, buildRoadmap } from "./roadmap";
import { NextStep } from "./types";

describe("classifyEffort", () => {
  it("treats settings/toggles as quick wins", () => {
    expect(classifyEffort("Turn on two-step login for email, banking and key systems.")).toBe("quick");
    expect(classifyEffort("Set up a password manager so strong passwords are easy.")).toBe("quick");
  });

  it("treats planning/process work as projects", () => {
    expect(classifyEffort("Write a one-page plan for handling a cyber incident.")).toBe("project");
    expect(classifyEffort("Segment networks into zones and isolate management interfaces.")).toBe("project");
  });
});

describe("buildRoadmap", () => {
  it("splits next steps into quick wins and projects, preserving order", () => {
    const steps: NextStep[] = [
      { categoryId: "access", text: "Turn on two-step login.", priority: 0 },
      { categoryId: "response", text: "Write a one-page incident plan.", priority: 10 },
      { categoryId: "backups", text: "Set up automatic backups.", priority: 20 },
    ];
    const r = buildRoadmap(steps);
    expect(r.quickWins.map((i) => i.text)).toEqual([
      "Turn on two-step login.",
      "Set up automatic backups.",
    ]);
    expect(r.projects.map((i) => i.text)).toEqual(["Write a one-page incident plan."]);
  });
});
