import { InsuranceResult } from "@/lib/types";

const BLURB: Record<string, string> = {
  strong:
    "Based on your answers, your business carries enough risk that cyber liability insurance is worth taking seriously.",
  consider:
    "Your business carries some risk. Cyber liability insurance is worth weighing up against the cost.",
  lower:
    "Your exposure looks lower for now. Insurance may be less of a priority — revisit this as your business grows.",
};

export default function InsurancePanel({ insurance }: { insurance: InsuranceResult }) {
  return (
    <div className={`rating-${insurance.rating}`}>
      <div className="traffic">
        <span className="traffic-dot" />
        <span className="rating-title">{insurance.ratingLabel}</span>
      </div>
      <p style={{ marginTop: 0 }}>{BLURB[insurance.rating]}</p>

      {insurance.reasons.length > 0 && (
        <>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Why we're saying this:</p>
          <ul style={{ marginTop: 0, color: "var(--ink-soft)" }}>
            {insurance.reasons.map((r, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {r}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="disclaimer">
        <strong>This is general information only, not financial or insurance advice.</strong> CMAP
        does not sell insurance and has no stake in your decision. To decide what cover (if any) is
        right for you, talk to a licensed insurance broker or adviser.
      </p>
    </div>
  );
}
