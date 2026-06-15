import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { AssessmentResult, StandardsSummary } from "@/lib/types";

const c = {
  ink: "#0b1220",
  soft: "#44516a",
  brand: "#2563eb",
  line: "#e3e8f0",
  good: "#16a34a",
  warn: "#d97706",
  bad: "#dc2626",
};

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: c.ink, lineHeight: 1.5 },
  h1: { fontSize: 20, marginBottom: 2, color: c.ink },
  sub: { fontSize: 10, color: c.soft, marginBottom: 16 },
  level: { fontSize: 16, color: c.brand, marginBottom: 4 },
  section: { marginTop: 16, marginBottom: 4, fontSize: 13, color: c.brand },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: c.line },
  swotRow: { flexDirection: "row", marginTop: 6 },
  swotCell: { width: "50%", padding: 6 },
  swotTitle: { fontSize: 11, marginBottom: 4 },
  item: { fontSize: 10, color: c.soft, marginBottom: 3 },
  ratingTitle: { fontSize: 13, marginBottom: 4 },
  disclaimer: { fontSize: 9, color: c.soft, marginTop: 10, padding: 8, backgroundColor: "#f1f5fb" },
  foot: { position: "absolute", bottom: 28, left: 40, right: 40, fontSize: 8, color: c.soft, textAlign: "center" },
});

const ratingColor: Record<string, string> = { strong: c.bad, consider: c.warn, lower: c.good };

export function ReportDocument({
  result,
  reportTitle = "Your Cybersecurity Maturity Report",
  standards,
}: {
  result: AssessmentResult;
  reportTitle?: string;
  standards?: StandardsSummary[];
}) {
  const { maturity, insurance, swot, nextSteps } = result;
  return (
    <Document title={reportTitle}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{reportTitle}</Text>
        <Text style={s.sub}>
          A private self-check for your business. CMAP stores nothing — this report is the only copy.
        </Text>

        <Text style={s.level}>
          {maturity.levelLabel} — Level {maturity.level} of 5 ({maturity.overallPct}%)
        </Text>

        <Text style={s.section}>How you scored, area by area</Text>
        {maturity.categoryScores.map((cs) => (
          <View style={s.row} key={cs.categoryId}>
            <Text>{cs.ownerLabel}</Text>
            <Text>
              {cs.scorePct}% · {cs.level}
            </Text>
          </View>
        ))}

        <Text style={s.section}>SWOT snapshot</Text>
        <View style={s.swotRow}>
          <View style={s.swotCell}>
            <Text style={s.swotTitle}>Strengths</Text>
            {(swot.strengths.length ? swot.strengths : ["—"]).map((x, i) => (
              <Text style={s.item} key={i}>• {x}</Text>
            ))}
          </View>
          <View style={s.swotCell}>
            <Text style={s.swotTitle}>Weaknesses</Text>
            {(swot.weaknesses.length ? swot.weaknesses : ["—"]).map((x, i) => (
              <Text style={s.item} key={i}>• {x}</Text>
            ))}
          </View>
        </View>
        <View style={s.swotRow}>
          <View style={s.swotCell}>
            <Text style={s.swotTitle}>Opportunities</Text>
            {(swot.opportunities.length ? swot.opportunities : ["—"]).map((x, i) => (
              <Text style={s.item} key={i}>• {x}</Text>
            ))}
          </View>
          <View style={s.swotCell}>
            <Text style={s.swotTitle}>Threats</Text>
            {(swot.threats.length ? swot.threats : ["—"]).map((x, i) => (
              <Text style={s.item} key={i}>• {x}</Text>
            ))}
          </View>
        </View>

        <Text style={s.section}>Your priority next steps</Text>
        {nextSteps.length ? (
          nextSteps.map((st, i) => (
            <Text style={s.item} key={i}>
              {i + 1}. {st.text}
            </Text>
          ))
        ) : (
          <Text style={s.item}>No urgent steps — keep doing what you're doing.</Text>
        )}

        {standards && standards.length > 0 && (
          <>
            <Text style={s.section}>How you map to NZ standards</Text>
            {standards.map((st) => (
              <View style={s.row} key={st.standard}>
                <Text>{st.standard}</Text>
                <Text>{st.scorePct}%</Text>
              </View>
            ))}
          </>
        )}

        {insurance && (
          <>
            <Text style={s.section}>Cyber liability insurance</Text>
            <Text style={[s.ratingTitle, { color: ratingColor[insurance.rating] }]}>
              {insurance.ratingLabel}
            </Text>
            {insurance.reasons.map((r, i) => (
              <Text style={s.item} key={i}>• {r}</Text>
            ))}
            <Text style={s.disclaimer}>
              This is general information only, not financial or insurance advice. This tool does not
              sell insurance and has no stake in your decision. To decide what cover (if any) is right
              for you, talk to a licensed insurance broker or adviser.
            </Text>
          </>
        )}

        <Text style={s.foot} fixed>
          Generated by the Cybersecurity Maturity Health Check. Your data stays on your device — nothing is uploaded.
        </Text>
      </Page>
    </Document>
  );
}
