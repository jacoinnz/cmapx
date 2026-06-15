import { Snapshot } from "@/lib/history";

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** A compact trend of past checks (newest first) with per-check deltas. */
export default function HistoryTrend({ history }: { history: Snapshot[] }) {
  const items = history.slice(0, 6);
  return (
    <div className="card">
      <h3 className="section-title">Your progress over time</h3>
      <ul className="trend-list">
        {items.map((s, i) => {
          const older = items[i + 1];
          const delta = older ? s.overallPct - older.overallPct : null;
          return (
            <li className="trend-row" key={s.takenAt}>
              <span className="trend-date">{fmt(s.takenAt)}</span>
              <span className="trend-bar" aria-hidden="true">
                <span style={{ width: `${s.overallPct}%` }} />
              </span>
              <span className="trend-pct">{s.overallPct}%</span>
              <span className="trend-delta">
                {delta === null ? (
                  ""
                ) : delta > 0 ? (
                  <span className="delta-up">▲{delta}</span>
                ) : delta < 0 ? (
                  <span className="delta-down">▼{Math.abs(delta)}</span>
                ) : (
                  <span className="delta-flat">—</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
