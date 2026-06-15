import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="brand">
            <span className="logo-badge" aria-hidden />
            <strong>Cybersecurity Health Check</strong>
          </div>
          <p>
            A free, private check of how well your organisation is protected against cyber threats.
            Choose the version that fits you — answer a few questions and see where you stand.
          </p>
          <span className="privacy-note">
            🔒 Private by design. Your answers and results are saved only on your own device — never
            uploaded.
          </span>
        </div>
      </header>

      <main className="container">
        <div className="choice-grid">
          <Link href="/business" className="choice-card">
            <div className="choice-icon" aria-hidden>
              🏢
            </div>
            <h2>Cybersecurity for business owners</h2>
            <p>
              Plain-English questions about how you run your business. No technical knowledge needed.
              Get your maturity, a SWOT, practical next steps, and whether to consider cyber insurance.
            </p>
            <span className="choice-cta">Start the business check →</span>
          </Link>

          <Link href="/it" className="choice-card">
            <div className="choice-icon" aria-hidden>
              🛡️
            </div>
            <h2>Cybersecurity for IT people</h2>
            <p>
              A technical control assessment mapped to NZ standards (NZISM, PSR, Essential Eight,
              ISO 27001, HISF). Rate your maturity and get a SWOT, standards coverage and remediation
              priorities.
            </p>
            <span className="choice-cta">Start the technical check →</span>
          </Link>
        </div>

        <p className="footer">
          This is an informational tool only. It is not affiliated with any insurer and does not sell
          insurance. For decisions about cover, speak to a licensed adviser.
        </p>
      </main>
    </>
  );
}
