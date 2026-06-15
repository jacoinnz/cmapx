import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/lib/db/client";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

/** True when accounts are fully configured (DB + Resend + secret). */
export const authEnabled = Boolean(
  process.env.DATABASE_URL && process.env.RESEND_API_KEY && process.env.AUTH_SECRET
);

// Lazy config (evaluated per request) so env + DB are read at runtime, not build.
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const db = getDb();
  return {
    trustHost: true,
    adapter: db
      ? DrizzleAdapter(db, {
          usersTable: users,
          accountsTable: accounts,
          sessionsTable: sessions,
          verificationTokensTable: verificationTokens,
        })
      : undefined,
    session: { strategy: "database" },
    providers: [
      Resend({
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.AUTH_EMAIL_FROM ?? "onboarding@resend.dev",
      }),
    ],
    pages: { signIn: "/signin" },
  };
});
