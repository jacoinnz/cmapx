import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { submissions } from "@/lib/db/schema";
import { PathId } from "@/lib/history";
import {
  benchmark,
  describeBenchmark,
  percentileWithin,
  MIN_LIVE_SAMPLE,
} from "@/lib/benchmark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Live benchmark for a (path, score). Computes a percentile from real anonymous
 * submissions once there are enough of them; otherwise returns the seeded model.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path: PathId = searchParams.get("path") === "it" ? "it" : "business";
  const pct = Math.max(0, Math.min(100, Math.round(Number(searchParams.get("pct")))));

  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select({ overallPct: submissions.overallPct })
        .from(submissions)
        .where(eq(submissions.path, path));
      if (rows.length >= MIN_LIVE_SAMPLE) {
        const scores = rows.map((r) => r.overallPct);
        const result = describeBenchmark(path, percentileWithin(scores, pct), false);
        return NextResponse.json({ ...result, sample: rows.length });
      }
    } catch {
      /* fall through to seeded */
    }
  }

  return NextResponse.json({ ...benchmark(path, pct), sample: 0 });
}
