import { buildRoadmap } from "@/lib/roadmap";
import { NextStep } from "@/lib/types";

function Group({
  badge,
  badgeClass,
  heading,
  items,
}: {
  badge: string;
  badgeClass: string;
  heading: string;
  items: { text: string }[];
}) {
  if (!items.length) return null;
  return (
    <div className="roadmap-group">
      <h4 className="roadmap-head">
        <span className={`effort-badge ${badgeClass}`}>{badge}</span> {heading}
      </h4>
      <ol className="steps-list">
        {items.map((i, k) => (
          <li key={k}>
            <span className="step-num" />
            <span>{i.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Roadmap({ nextSteps }: { nextSteps: NextStep[] }) {
  const { quickWins, projects } = buildRoadmap(nextSteps);
  if (!quickWins.length && !projects.length) {
    return (
      <p className="empty-note">
        No urgent steps stand out — keep doing what you&apos;re doing and re-check periodically.
      </p>
    );
  }
  return (
    <>
      <Group badge="Quick wins" badgeClass="quick" heading="Start here" items={quickWins} />
      <Group badge="Bigger projects" badgeClass="project" heading="Plan these next" items={projects} />
    </>
  );
}
