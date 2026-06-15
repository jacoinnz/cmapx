import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { submissions } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ONE-TIME maintenance endpoint: truncates the anonymous benchmark `submissions`
 * table only. Gated by the MAINT_TOKEN env var. Removed immediately after use.
 */
export async function POST(req: Request) {
  const expected = process.env.MAINT_TOKEN;
  if (!expected || req.headers.get("x-maint-token") !== expected) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "no-db" }, { status: 503 });

  const before = await db.select({ n: sql<number>`count(*)::int` }).from(submissions);
  await db.execute(sql`truncate table submissions`);
  const after = await db.select({ n: sql<number>`count(*)::int` }).from(submissions);

  return NextResponse.json({ ok: true, before: before[0].n, after: after[0].n });
}
