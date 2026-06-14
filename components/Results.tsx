"use client";

import dynamic from "next/dynamic";
import { AssessmentResult, StandardsSummary } from "@/lib/types";
import SwotGrid from "./SwotGrid";
import InsurancePanel from "./InsurancePanel";
import ExportButton from "./ExportButton";

// Recharts touches the DOM, so load it client-only.
const MaturityRadar = dynamic(() => import("./MaturityRadar"), {
  ssr: false,
  loading: () => <div style={{ height: 320 }} />,
});

function StandardsMatrix({ standards }: { standards: StandardsSummary[] }) {
  return (
    <div className="std-matrix">
      {standards.map((s) => (
        <div className="std-row" key={s.standard}>
          <span className="std-name">{s.standard}</span>
          <span className="std-bar" aria-hidden>
            <span style={{ width: `${s.scorePct}%` }} />
          </span>
          <span className="std-pct">{s.scorePct}%</span>
        </div>
      ))}
    </div>
  );
}

export default function Results({
  result,
  onRestart,
  eyebrow = "Your cyber maturity",
  reportTitle,
  standards,
}: {
  result: AssessmentResult;
  onRestart: () => void;
  eyebrow?: string;
  reportTitle?: string;
  standards?: StandardsSummary[];
}) {
  const { maturity, swot, insurance, nextSteps } = result;

  return (
    <div>
      <div className="card">
        <div className="maturity-headline">
          <div className="cat-eyebrow">{eyebrow}</div>
          <div className="maturity-level">{maturity.levelLabel}</div>
          <p className="maturity-sub">
            Level {maturity.level} of 5 · {maturity.overallPct}% across{" "}
            {maturity.categoryScores.length} areas
          </p>
          <div className="level-track" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="level-pip" data-on={n <= maturity.level} />
            ))}
          </div>
        </div>
        <MaturityRadar scores={maturity.categoryScores} />
      </div>

      <div className="card">
        <h3 className="section-title">Your strengths, weaknesses & where to focus</h3>
        <SwotGrid swot={swot} />
      </div>

      {standards && standards.length > 0 && (
        <div className="card">
          <h3 className="section-title">How you map to NZ standards</h3>
          <StandardsMatrix standards={standards} />
        </div>
      )}

      <div className="card">
        <h3 className="section-title">Your priority next steps</h3>
        {nextSteps.length ? (
          <ol className="steps-list">
            {nextSteps.map((st, i) => (
              <li key={i}>
                <span className="step-num" />
                <span>{st.text}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-note">
            No urgent steps stand out — keep doing what you&apos;re doing and re-check periodically.
          </p>
        )}
      </div>

      {insurance && (
        <div className="card">
          <h3 className="section-title">Do you need cyber liability insurance?</h3>
          <InsurancePanel insurance={insurance} />
        </div>
      )}

      <div className="card">
        <ExportButton result={result} reportTitle={reportTitle} standards={standards} />
      </div>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <button className="btn btn-ghost" onClick={onRestart}>
          ↻ Start a new check
        </button>
      </div>
    </div>
  );
}
