import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Anonymous, non-identifying score submissions that power live benchmarking.
 * No user id, no answers — just a path and an overall percentage.
 */
export const submissions = pgTable(
  "submissions",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(), // 'business' | 'it'
    overallPct: integer("overall_pct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ pathIdx: index("submissions_path_idx").on(t.path) })
);

export type Submission = typeof submissions.$inferSelect;
