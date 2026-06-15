import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/** True when a database is configured (env present). Cloud features gate on this. */
export const dbEnabled = Boolean(process.env.DATABASE_URL);

/**
 * Lazily-created Drizzle client over Neon's HTTP driver. Returns null when no
 * DATABASE_URL is set, so callers can fall back to local/seeded behaviour.
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return drizzle(neon(url), { schema });
}
