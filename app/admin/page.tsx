"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { categories } from "@/lib/questions";
import { itCategories } from "@/lib/itQuestions";

interface Drop {
  step: number;
  reached: number;
  dropped: number;
  dropPct: number;
}
interface Data {
  totalEvents: number;
  completion: Record<string, { started: number; completed: number; rate: number }>;
  clicksPerSession: { sessions: number; totalClicks: number; avg: number };
  topButtons: { label: string; count: number }[];
  funnels: Record<string, { drop: Drop[]; biggestDrop: number | null }>;
}

const sectionName = (path: string, step: number) =>
  (path === "it" ? itCategories : categories)[step]?.ownerLabel ?? `Section ${step + 1}`;

function Funnel({ path, drop, biggest }: { path: string; drop: Drop[]; biggest: number | null }) {
  const top = drop[0]?.reached ?? 0;
  return (
    <div className="card">
      <h3 className="section-title">{path === "it" ? "IT path" : "Business path"} — where people drop off</h3>
      {top === 0 ? (
        <p className="empty-note">No sessions yet.</p>
      ) : (
        <ul className="trend-list">
          {drop.map((d) => (
            <li className="trend-row" key={d.step} style={{ gridTemplateColumns: "1fr 90px 90px" }}>
              <span className="trend-date" style={{ fontWeight: d.step === biggest ? 800 : 600 }}>
                {sectionName(path, d.step)}
                {d.step === biggest && <span className="effort-badge project" style={{ marginLeft: 8 }}>biggest drop</span>}
              </span>
              <span className="trend-bar" aria-hidden="true">
                <span style={{ width: `${Math.round((d.reached / top) * 100)}%` }} />
              </span>
              <span className="trend-pct">
                {d.reached} {d.dropped > 0 && <em style={{ color: "#b3261e", fontStyle: "normal" }}>−{d.dropped}</em>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { status } = useSession();
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "forbidden">("loading");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/analytics")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        setData(d);
        setState("ok");
      })
      .catch(() => setState("forbidden"));
  }, [status]);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand brand-link" aria-label="Return to start">
            <span className="logo-badge" aria-hidden />
            <strong>Cybersecurity Health Check</strong>
          </Link>
          <h1>Analytics</h1>
          <p>Anonymous usage — no identity, no IP. Sessions are random ids only.</p>
        </div>
      </header>

      <main className="container">
        {status !== "authenticated" ? (
          <div className="card">
            <p className="cat-desc">Sign in with an admin account to view analytics.</p>
            <Link href="/signin" className="btn btn-primary" style={{ display: "inline-block" }}>
              Sign in →
            </Link>
          </div>
        ) : state === "forbidden" ? (
          <div className="card">
            <h3 className="section-title">Not authorised</h3>
            <p className="empty-note">
              This account isn&apos;t on the admin list. Add it to the <code>ADMIN_EMAILS</code> env var.
            </p>
          </div>
        ) : !data ? (
          <div className="card" style={{ minHeight: 120 }} />
        ) : (
          <>
            <div className="card summary-card">
              <div className="cat-eyebrow">At a glance</div>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="summary-stat-value">{data.clicksPerSession.sessions}</span>
                  <span className="summary-stat-label">sessions</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-stat-value">{data.clicksPerSession.avg}</span>
                  <span className="summary-stat-label">clicks / session</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-stat-value">{data.completion.business?.rate ?? 0}%</span>
                  <span className="summary-stat-label">business completion</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-stat-value">{data.completion.it?.rate ?? 0}%</span>
                  <span className="summary-stat-label">IT completion</span>
                </div>
              </div>
              <ul className="summary-points">
                {Object.entries(data.completion).map(([p, c]) => (
                  <li key={p}>
                    <strong>{p === "it" ? "IT" : "Business"}:</strong> {c.started} started → {c.completed} completed
                  </li>
                ))}
              </ul>
            </div>

            <Funnel path="business" drop={data.funnels.business?.drop ?? []} biggest={data.funnels.business?.biggestDrop ?? null} />
            <Funnel path="it" drop={data.funnels.it?.drop ?? []} biggest={data.funnels.it?.biggestDrop ?? null} />

            <div className="card">
              <h3 className="section-title">Clicks per button</h3>
              {data.topButtons.length === 0 ? (
                <p className="empty-note">No clicks yet.</p>
              ) : (
                <ul className="trend-list">
                  {data.topButtons.map((b) => (
                    <li className="trend-row" key={b.label} style={{ gridTemplateColumns: "1fr 60px" }}>
                      <span className="trend-date">{b.label}</span>
                      <span className="trend-pct">{b.count}</span>
                    </li>
                  ))}
                </ul>
              )}
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
