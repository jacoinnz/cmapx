import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { results } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** List the signed-in user's saved results, newest first. */
export async function GET() {
  const session = await auth();
  const db = getDb();
  if (!session?.user?.id || !db) {
    return NextResponse.json({ results: [] }, { status: session ? 200 : 401 });
  }
  const rows = await db
    .select()
    .from(results)
    .where(eq(results.userId, session.user.id))
    .orderBy(desc(results.takenAt));
  return NextResponse.json({ results: rows });
}

/** Save a result snapshot to the signed-in user's account. */
export async function POST(req: Request) {
  const session = await auth();
  const db = getDb();
  if (!session?.user?.id || !db) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: {
    path?: string;
    takenAt?: string;
    overallPct?: number;
    level?: number;
    levelLabel?: string;
    categories?: { id: string; label: string; pct: number }[];
  };
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

  await db.insert(results).values({
    userId: session.user.id,
    path,
    takenAt: body.takenAt ?? new Date().toISOString(),
    overallPct: pct,
    level: Math.round(Number(body.level)) || 1,
    levelLabel: String(body.levelLabel ?? ""),
    categories: body.categories ?? [],
  });

  return NextResponse.json({ ok: true });
}
