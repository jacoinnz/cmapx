import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";

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

// ---- Auth.js (Drizzle adapter) tables ----

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (a) => ({ pk: primaryKey({ columns: [a.provider, a.providerAccountId] }) })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({ pk: primaryKey({ columns: [vt.identifier, vt.token] }) })
);

// ---- Cloud-synced results (one row per saved check, keyed to a user) ----

export const results = pgTable(
  "results",
  {
    id: serial("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    takenAt: timestamp("taken_at", { mode: "string" }).notNull(),
    overallPct: integer("overall_pct").notNull(),
    level: integer("level").notNull(),
    levelLabel: text("level_label").notNull(),
    categories: jsonb("categories").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ userIdx: index("results_user_idx").on(t.userId) })
);

export type ResultRow = typeof results.$inferSelect;

// ---- Anonymous behavioural analytics (NO identity, NO IP, NO user-agent) ----

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    /** Random, anonymous per-session id — not linked to any person. */
    sessionId: text("session_id").notNull(),
    /** session_start | assessment_start | section_complete | assessment_complete | click */
    type: text("type").notNull(),
    /** e.g. a button label or category id. */
    label: text("label"),
    /** 'business' | 'it' | null. */
    path: text("path"),
    /** Wizard section index, when relevant. */
    step: integer("step"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    typeIdx: index("events_type_idx").on(t.type),
    createdIdx: index("events_created_idx").on(t.createdAt),
  })
);

export type EventRecord = typeof events.$inferSelect;
