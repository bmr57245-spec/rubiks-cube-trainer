import { integer, pgTable, serial, text, timestamp, unique, index } from "drizzle-orm/pg-core";

export const solves = pgTable(
  "solves",
  {
    id: serial("id").primaryKey(),
    clientId: text("client_id").notNull(),
    timeMs: integer("time_ms").notNull(),
    penalty: text("penalty").notNull().default("none"), // none | plus2 | dnf
    scramble: text("scramble").notNull().default(""),
    mode: text("mode").notNull().default("free"), // free | comp
    roundId: text("round_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("solves_client_idx").on(t.clientId)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    clientId: text("client_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
  },
  (t) => [unique("lesson_progress_uq").on(t.clientId, t.lessonId)],
);

export const algStats = pgTable(
  "alg_stats",
  {
    id: serial("id").primaryKey(),
    clientId: text("client_id").notNull(),
    algId: text("alg_id").notNull(),
    box: integer("box").notNull().default(0), // 0 جديد .. 5 متقن
    attempts: integer("attempts").notNull().default(0),
    successes: integer("successes").notNull().default(0),
    bestMs: integer("best_ms"),
    lastAt: timestamp("last_at").notNull().defaultNow(),
  },
  (t) => [unique("alg_stats_uq").on(t.clientId, t.algId)],
);
