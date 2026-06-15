"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { decodeShare, SharePayload } from "@/lib/share";

const LEVEL_LABELS = ["Exposed", "Basic", "Developing", "Managed", "Strong"];

export default function SharedPage() {
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = window.location.hash.replace(/^#/, "");
    setPayload(decodeShare(token));
    setReady(true);
  }, []);

  const pathLabel = payload?.path === "it" ? "technical" : "business";

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand brand-link" aria-label="Return to start">
            <span className="logo-badge" aria-hidden />
            <strong>Cybersecurity Health Check</strong>
          </Link>
          <h1>Shared result</h1>
          <p>A read-only snapshot of someone&apos;s cybersecurity maturity check.</p>
        </div>
      </header>

      <main className="container">
        {!ready ? (
          <div className="card" style={{ minHeight: 120 }} />
        ) : payload ? (
          <>
            <div className="card summary-card">
              <div className="cat-eyebrow">Shared {pathLabel} result</div>
              <p className="summary-lead">
                Cybersecurity maturity: <strong>{payload.label}</strong> — Level {payload.level} of 5
                ({payload.pct}%).
              </p>
            </div>

            <div className="card">
              <h3 className="section-title">Score by area</h3>
              <ul className="trend-list">
                {payload.cats.map((c, i) => (
                  <li className="trend-row" key={i}>
                    <span className="trend-date">{c.label}</span>
                    <span className="trend-bar" aria-hidden="true">
                      <span style={{ width: `${c.pct}%` }} />
                    </span>
                    <span className="trend-pct">{c.pct}%</span>
                    <span className="trend-delta" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ textAlign: "center" }}>
              <p style={{ marginTop: 0 }}>Want to check your own business?</p>
              <Link href="/" className="btn btn-primary" style={{ display: "inline-block" }}>
                Take the free check →
              </Link>
            </div>
          </>
        ) : (
          <div className="card">
            <h3 className="section-title">This link couldn&apos;t be read</h3>
            <p className="empty-note">
              The shared result is missing or invalid. You can run your own check instead.
            </p>
            <Link href="/" className="home-link">
              → Start the Cybersecurity Health Check
            </Link>
          </div>
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
