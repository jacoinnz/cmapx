"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const res = await signIn("resend", { email, redirect: false, callbackUrl: "/account" });
      if (res?.error) setError(true);
      else setSent(true);
    } catch {
      setError(true);
    }
    setBusy(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand brand-link" aria-label="Return to start">
            <span className="logo-badge" aria-hidden />
            <strong>Cybersecurity Health Check</strong>
          </Link>
          <h1>Sign in</h1>
          <p>Save your results and track your progress across devices. We only use your email to sign you in.</p>
        </div>
      </header>

      <main className="container">
        <div className="card" style={{ maxWidth: 480 }}>
          {sent ? (
            <>
              <h3 className="section-title">Check your email</h3>
              <p>
                We&apos;ve sent a sign-in link to <strong>{email}</strong>. Click it to finish signing
                in — you can close this tab.
              </p>
            </>
          ) : (
            <form onSubmit={submit}>
              <h3 className="section-title">Sign in with a magic link</h3>
              <p className="cat-desc">No password — we email you a one-time sign-in link.</p>
              <label htmlFor="email" className="summary-stat-label" style={{ display: "block", marginBottom: 6 }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.co.nz"
                className="share-link"
                style={{ marginBottom: 14 }}
              />
              <button type="submit" className="btn btn-primary" disabled={busy || !email}>
                {busy ? "Sending…" : "Email me a sign-in link"}
              </button>
              {error && (
                <p className="export-fail" style={{ marginTop: 12 }}>
                  Couldn&apos;t send the link just now. Please try again.
                </p>
              )}
            </form>
          )}
        </div>

        <p className="footer">
          <Link href="/" className="home-link">
            ← Back to start
          </Link>
        </p>
      </main>
    </>
  );
}
