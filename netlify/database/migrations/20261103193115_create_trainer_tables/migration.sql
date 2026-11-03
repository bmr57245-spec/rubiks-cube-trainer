CREATE TABLE "alg_stats" (
	"id" serial PRIMARY KEY,
	"client_id" text NOT NULL,
	"alg_id" text NOT NULL,
	"box" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"successes" integer DEFAULT 0 NOT NULL,
	"best_ms" integer,
	"last_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alg_stats_uq" UNIQUE("client_id","alg_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" serial PRIMARY KEY,
	"client_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_uq" UNIQUE("client_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "solves" (
	"id" serial PRIMARY KEY,
	"client_id" text NOT NULL,
	"time_ms" integer NOT NULL,
	"penalty" text DEFAULT 'none' NOT NULL,
	"scramble" text DEFAULT '' NOT NULL,
	"mode" text DEFAULT 'free' NOT NULL,
	"round_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "solves_client_idx" ON "solves" ("client_id");