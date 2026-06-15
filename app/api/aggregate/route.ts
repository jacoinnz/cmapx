import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { submissions } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Anonymous score ingest for live benchmarking. Stores only { path, overallPct }
 * — no user, no answers, nothing identifying. No-ops cleanly when no DB is set.
 */
export async function POST(req: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, stored: false, reason: "no-db" });

  let body: { path?: string; overallPct?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const path = body.path === "it" ? "it" : body.path === "business" ? "business" : null;
  const pct = Math.round(Number(body.overallPct));
  if (!path || !Number.isFinite(pct) || pct < 0 || pct > 100) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  try {
    await db.insert(submissions).values({ path, overallPct: pct });
    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ ok: false, stored: false }, { status: 500 });
  }
}
