import { AssessmentResult, StandardsSummary } from "@/lib/types";
import { buildResultsSummary } from "@/lib/scoring";
import { Snapshot, overallDelta } from "@/lib/history";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="summary-stat">
      <span className="summary-stat-value">{value}</span>
      <span className="summary-stat-label">{label}</span>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="delta delta-flat">no change</span>;
  const up = delta > 0;
  return (
    <span className={`delta ${up ? "delta-up" : "delta-down"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta)} pts
    </span>
  );
}

export default function ResultsSummary({
  result,
  standards,
  label = "cybersecurity",
  previous,
}: {
  result: AssessmentResult;
  standards?: StandardsSummary[];
  label?: string;
  previous?: Snapshot | null;
}) {
  const s = buildResultsSummary(result, standards);
  const delta = previous ? overallDelta(s.overallPct, previous.overallPct) : null;

  return (
    <div className="card summary-card">
      <div className="cat-eyebrow">At a glance</div>
      <p className="summary-lead">
        Your {label} maturity is <strong>{s.levelLabel}</strong> — Level {s.level} of 5 (
        {s.overallPct}%).
        {delta !== null && (
          <>
            {" "}
            <DeltaBadge delta={delta} /> since your last check ({previous!.overallPct}%).
          </>
        )}
      </p>

      <div className="summary-stats">
        <Stat value={`${s.level}/5`} label={s.levelLabel} />
        <Stat value={`${s.strengthCount}`} label={s.strengthCount === 1 ? "strength" : "strengths"} />
        <Stat value={`${s.improveCount}`} label="to improve" />
        <Stat value={`${s.actionCount}`} label={s.actionCount === 1 ? "priority action" : "priority actions"} />
      </div>

      <ul className="summary-points">
        {s.strongest && (
          <li>
            <strong>Strongest area:</strong> {s.strongest.label} ({s.strongest.pct}%)
          </li>
        )}
        {s.weakest && s.weakest.pct < 100 && (
          <li>
            <strong>Most to gain:</strong> {s.weakest.label} ({s.weakest.pct}%)
          </li>
        )}
        {result.insurance && (
          <li>
            <strong>Insurance:</strong> {result.insurance.ratingLabel}
          </li>
        )}
        {s.lowestStandard && (
          <li>
            <strong>Lowest standard coverage:</strong> {s.lowestStandard.standard} (
            {s.lowestStandard.pct}%)
          </li>
        )}
      </ul>
    </div>
  );
}
