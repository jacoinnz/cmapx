import Link from "next/link";

export interface BridgeCopy {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
}

/**
 * Adaptive copy for the business → IT "graduation" bridge. Owners who have the
 * basics well in hand (Managed/Strong, level ≥ 4) get a direct nudge; everyone
 * else sees the technical check framed as a later step.
 */
export function itBridgeCopy(level: number): BridgeCopy {
  if (level >= 4) {
    return {
      eyebrow: "Ready for more",
      title: "You've got the basics well covered",
      body:
        "If you have IT support, the technical check assesses your controls in depth against NZ standards — NZISM, the Essential Eight, ISO 27001 and HISF.",
      cta: "Try the technical check →",
    };
  }
  return {
    eyebrow: "When you're ready",
    title: "There's a deeper, technical version",
    body:
      "Once the basics here are in hand — or if you have IT support — the technical check maps your controls to NZ standards like NZISM and the Essential Eight.",
    cta: "See the technical check →",
  };
}

export default function PathBridge({ level }: { level: number }) {
  const c = itBridgeCopy(level);
  return (
    <Link href="/it" className="card bridge-card">
      <div className="cat-eyebrow">{c.eyebrow}</div>
      <h3 className="section-title">{c.title}</h3>
      <p className="bridge-body">{c.body}</p>
      <span className="choice-cta">{c.cta}</span>
    </Link>
  );
}
