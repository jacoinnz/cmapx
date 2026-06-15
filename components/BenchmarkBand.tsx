"use client";

import { useEffect, useState } from "react";
import { PathId } from "@/lib/history";
import { Benchmark, benchmark as seededBenchmark } from "@/lib/benchmark";

export default function BenchmarkBand({
  path,
  overallPct,
}: {
  path: PathId;
  overallPct: number;
}) {
  const [b, setB] = useState<Benchmark>(() => seededBenchmark(path, overallPct));
  const [sample, setSample] = useState(0);
  const [state, setState] = useState<"idle" | "sharing" | "shared" | "unavailable">("idle");

  useEffect(() => {
    let alive = true;
    fetch(`/api/benchmark?path=${path}&pct=${overallPct}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive || typeof d?.percentile !== "number") return;
        setB({ percentile: d.percentile, blurb: d.blurb, indicative: d.indicative });
        setSample(d.sample || 0);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [path, overallPct]);

  const contribute = async () => {
    setState("sharing");
    try {
      const r = await fetch("/api/aggregate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, overallPct }),
      });
      const d = await r.json();
      setState(d?.stored ? "shared" : "unavailable");
    } catch {
      setState("unavailable");
    }
  };

  return (
    <div className="card benchmark-card">
      <div className="cat-eyebrow">How you compare</div>
      <p className="benchmark-lead">{b.blurb}</p>
      <div className="benchmark-bar" aria-hidden="true">
        <span style={{ width: `${b.percentile}%` }} />
      </div>
      <p className="benchmark-note">
        {b.indicative
          ? "Indicative benchmark from a modelled NZ distribution — it becomes live as more people contribute."
          : `Live benchmark from ${sample.toLocaleString()} anonymous NZ checks.`}
      </p>

      {state === "shared" ? (
        <p className="benchmark-note">✓ Thanks — your anonymous score is helping build the NZ benchmark.</p>
      ) : state === "unavailable" ? (
        <p className="benchmark-note">Benchmark contributions aren&apos;t live just yet — check back soon.</p>
      ) : (
        <div className="contrib">
          <button type="button" className="btn btn-ghost" onClick={contribute} disabled={state === "sharing"}>
            {state === "sharing" ? "Sharing…" : "＋ Add my score to NZ benchmarks"}
          </button>
          <span className="share-note">
            Optional — shares only your overall %, anonymously. No answers, nothing identifying.
          </span>
        </div>
      )}
    </div>
  );
}
