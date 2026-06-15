import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { events } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES = new Set([
  "session_start",
  "section_view",
  "assessment_complete",
  "click",
]);
const PATHS = new Set(["business", "it", "home", "account", "signin", "shared", "results"]);

interface InEvent {
  sessionId?: string;
  type?: string;
  label?: string;
  path?: string;
  step?: number;
}

/**
 * Anonymous behavioural event ingest. Stores ONLY {sessionId, type, label,
 * path, step}. We deliberately never read or store the IP, user-agent, or any
 * identity. No-ops cleanly without a database.
 */
export async function POST(req: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, reason: "no-db" });

  let body: { events?: InEvent[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const incoming = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
  const rows = incoming
    .filter((e) => e.sessionId && e.type && TYPES.has(e.type))
    .map((e) => ({
      sessionId: String(e.sessionId).slice(0, 64),
      type: e.type as string,
      label: e.label ? String(e.label).slice(0, 80) : null,
      path: e.path && PATHS.has(e.path) ? e.path : null,
      step: Number.isFinite(e.step) ? Math.trunc(e.step as number) : null,
    }));

  if (rows.length === 0) return NextResponse.json({ ok: true, stored: 0 });

  try {
    await db.insert(events).values(rows);
    return NextResponse.json({ ok: true, stored: rows.length });
  } catch {
    return NextResponse.json({ ok: false, stored: 0 }, { status: 500 });
  }
}
