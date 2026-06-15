"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { AssessmentResult } from "@/lib/types";
import { PathId } from "@/lib/history";

export default function AccountPanel({
  result,
  path,
}: {
  result: AssessmentResult;
  path: PathId;
}) {
  const { status } = useSession();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const save = async () => {
    setState("saving");
    try {
      const r = await fetch("/api/results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path,
          takenAt: new Date().toISOString(),
          overallPct: result.maturity.overallPct,
          level: result.maturity.level,
          levelLabel: result.maturity.levelLabel,
          categories: result.maturity.categoryScores.map((c) => ({
            id: c.categoryId,
            label: c.ownerLabel,
            pct: c.scorePct,
          })),
        }),
      });
      setState(r.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="account-panel">
      {status === "authenticated" ? (
        state === "saved" ? (
          <p className="benchmark-note">
            ✓ Saved to your account. <Link href="/account" className="home-link">View your history →</Link>
          </p>
        ) : (
          <div className="contrib">
            <button type="button" className="btn btn-primary" onClick={save} disabled={state === "saving"}>
              {state === "saving" ? "Saving…" : "☁ Save this result to my account"}
            </button>
            <span className="share-note">Syncs across your devices. {state === "error" && "Couldn't save — try again."}</span>
          </div>
        )
      ) : (
        <div className="contrib">
          <Link href="/signin" className="btn btn-ghost">
            ☁ Sign in to save &amp; track progress
          </Link>
          <span className="share-note">Optional — keep a private history across devices, no password.</span>
        </div>
      )}
    </div>
  );
}
