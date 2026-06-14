import { SwotResult } from "@/lib/types";

function Cell({
  cls,
  title,
  items,
  emptyNote,
}: {
  cls: string;
  title: string;
  items: string[];
  emptyNote: string;
}) {
  return (
    <div className={`swot-cell ${cls}`}>
      <h4>{title}</h4>
      {items.length ? (
        <ul>
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-note">{emptyNote}</p>
      )}
    </div>
  );
}

export default function SwotGrid({ swot }: { swot: SwotResult }) {
  return (
    <div className="swot-grid">
      <Cell
        cls="s"
        title="💪 Strengths"
        items={swot.strengths}
        emptyNote="No clear strengths yet — that's what the next steps are for."
      />
      <Cell
        cls="w"
        title="⚠️ Weaknesses"
        items={swot.weaknesses}
        emptyNote="No major weak areas — nice work."
      />
      <Cell
        cls="o"
        title="🚀 Opportunities (next steps)"
        items={swot.opportunities}
        emptyNote="You're in good shape; keep it up."
      />
      <Cell
        cls="t"
        title="🛑 Threats (what gaps expose you to)"
        items={swot.threats}
        emptyNote="Low exposure from the gaps you have."
      />
    </div>
  );
}
