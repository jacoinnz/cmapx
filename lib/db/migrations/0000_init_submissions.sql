CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"overall_pct" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "submissions_path_idx" ON "submissions" USING btree ("path");