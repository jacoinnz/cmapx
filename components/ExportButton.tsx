"use client";

import { useState } from "react";
import { AssessmentResult } from "@/lib/types";

export default function ExportButton({ result }: { result: AssessmentResult }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const download = async () => {
    setBusy(true);
    setFailed(false);
    try {
      // Loaded on demand so the heavy PDF library stays out of the initial bundle
      // and never runs during the static build.
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ReportPdf"),
      ]);
      const blob = await pdf(<ReportDocument result={result} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-cyber-maturity-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF export failed", e);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="export-row">
      <button className="btn btn-export" onClick={download} disabled={busy}>
        {busy ? "Preparing your PDF…" : "⬇ Download my report (PDF)"}
      </button>
      <span style={{ fontSize: ".82rem", color: "var(--ink-soft)" }}>
        Your report is created in your browser — nothing is uploaded.
      </span>
      {failed && (
        <span className="export-fail">
          Sorry, the PDF didn&apos;t generate. Please try again — your results are still here.
        </span>
      )}
    </div>
  );
}
