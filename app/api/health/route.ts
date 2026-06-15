import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only connectivity check — runs `SELECT 1`, returns no data. */
export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ db: false, reason: "no-db" });
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ db: true });
  } catch {
    return NextResponse.json({ db: false, reason: "error" }, { status: 503 });
  }
}
