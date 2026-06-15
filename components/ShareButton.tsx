"use client";

import { useState } from "react";
import { AssessmentResult } from "@/lib/types";
import { PathId } from "@/lib/history";
import { buildSharePayload, encodeShare } from "@/lib/share";

export default function ShareButton({
  result,
  path,
}: {
  result: AssessmentResult;
  path: PathId;
}) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const makeLink = async () => {
    const token = encodeShare(buildSharePayload(path, result));
    const url =
      (typeof window !== "undefined" ? window.location.origin : "") + "/shared#" + token;
    setLink(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false); // clipboard blocked — the link is shown for manual copy
    }
  };

  return (
    <div className="share-row">
      <button type="button" className="btn btn-ghost" onClick={makeLink}>
        🔗 {copied ? "Link copied!" : "Copy a shareable link"}
      </button>
      <span className="share-note">
        Shares only your scores (no answers) — the data rides in the link itself, never our servers.
      </span>
      {link && (
        <input
          className="share-link"
          readOnly
          value={link}
          aria-label="Shareable result link"
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
    </div>
  );
}
