import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { submissions } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only connectivity check — returns no row data, just an aggregate count. */
export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ db: false, reason: "no-db" });
  try {
    const rows = await db.select({ n: sql<number>`count(*)::int` }).from(submissions);
    return NextResponse.json({ db: true, submissions: rows[0]?.n ?? 0 });
  } catch {
    return NextResponse.json({ db: false, reason: "error" }, { status: 503 });
  }
}
