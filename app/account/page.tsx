"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import HistoryTrend from "@/components/HistoryTrend";
import { Snapshot } from "@/lib/history";

interface ResultRow {
  path: string;
  takenAt: string;
  overallPct: number;
  level: number;
  levelLabel: string;
  categories: { id: string; label: string; pct: number }[];
}

const toSnapshot = (r: ResultRow): Snapshot => ({
  path: r.path === "it" ? "it" : "business",
  takenAt: r.takenAt,
  overallPct: r.overallPct,
  level: r.level,
  levelLabel: r.levelLabel,
  categories: r.categories ?? [],
});

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/results")
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d.results) ? d.results : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [status]);

  const business = rows.filter((r) => r.path === "business").map(toSnapshot);
  const it = rows.filter((r) => r.path === "it").map(toSnapshot);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand brand-link" aria-label="Return to start">
            <span className="logo-badge" aria-hidden />
            <strong>Cybersecurity Health Check</strong>
          </Link>
          <h1>Your account</h1>
          <p>
            {status === "authenticated"
              ? `Signed in as ${session?.user?.email}. Your saved results, synced across devices.`
              : "Sign in to see your saved results."}
          </p>
        </div>
      </header>

      <main className="container">
        {status !== "authenticated" ? (
          <div className="card">
            <h3 className="section-title">Not signed in</h3>
            <p className="cat-desc">Sign in with a magic link to view and sync your saved results.</p>
            <Link href="/signin" className="btn btn-primary" style={{ display: "inline-block" }}>
              Sign in →
            </Link>
          </div>
        ) : (
          <>
            {business.length > 0 && (
              <div className="card">
                <h3 className="section-title">Business checks</h3>
                <HistoryTrend history={business} />
              </div>
            )}
            {it.length > 0 && (
              <div className="card">
                <h3 className="section-title">Technical checks</h3>
                <HistoryTrend history={it} />
              </div>
            )}
            {loaded && rows.length === 0 && (
              <div className="card">
                <p className="empty-note">
                  No saved results yet. Run a check and choose &ldquo;Save to my account&rdquo;.
                </p>
                <Link href="/" className="home-link">
                  → Start a check
                </Link>
              </div>
            )}
            <div className="card" style={{ textAlign: "center" }}>
              <button type="button" className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            </div>
          </>
        )}

        <p className="footer">
          <Link href="/" className="home-link">
            ← Back to start
          </Link>
        </p>
      </main>
    </>
  );
}
