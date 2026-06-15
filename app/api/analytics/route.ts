import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import {
  completionByPath,
  funnelByPath,
  dropOff,
  biggestDropStep,
  clicksPerButton,
  clicksPerSession,
  EventRow,
} from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Aggregate anonymous analytics — admin-only (the data is anonymous; the view is private). */
export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const admins = adminEmails();
  if (admins.length === 0 || !email || !admins.includes(email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "no-db" }, { status: 503 });

  const rows = await db.select().from(events).orderBy(desc(events.createdAt)).limit(50000);
  const ev: EventRow[] = rows.map((r) => ({
    sessionId: r.sessionId,
    type: r.type,
    label: r.label,
    path: r.path,
    step: r.step,
  }));

  const funnels = Object.fromEntries(
    ["business", "it"].map((p) => [
      p,
      { funnel: funnelByPath(ev, p), drop: dropOff(ev, p), biggestDrop: biggestDropStep(ev, p) },
    ])
  );

  return NextResponse.json({
    totalEvents: rows.length,
    completion: completionByPath(ev),
    clicksPerSession: clicksPerSession(ev),
    topButtons: clicksPerButton(ev).slice(0, 25),
    funnels,
  });
}
