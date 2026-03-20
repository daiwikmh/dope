import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  date,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import type { IntegrityReport } from "../schemas";

// ── Projects ──────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  githubUrl: text("github_url"),
  tokenAddress: varchar("token_address", { length: 255 }),
  chain: varchar("chain", { length: 50 }).default("ethereum"),
  twitterHandle: varchar("twitter_handle", { length: 100 }),
  governanceSpace: varchar("governance_space", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Evaluations ───────────────────────────────────────────
export const evaluations = pgTable(
  "evaluations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    integrityScore: integer("integrity_score").notNull(),
    verdict: varchar("verdict", { length: 20 }).notNull(),
    executiveSummary: text("executive_summary"),
    report: jsonb("report").$type<IntegrityReport>(),
    layerScores: jsonb("layer_scores").$type<{
      onchain: number;
      development: number;
      social: number;
      governance: number;
    }>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("eval_project_idx").on(t.projectId),
    index("eval_score_idx").on(t.integrityScore),
  ]
);

// ── Activity Events ───────────────────────────────────────
export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    evaluationId: uuid("evaluation_id").references(() => evaluations.id, {
      onDelete: "set null",
    }),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    source: varchar("source", { length: 30 }).notNull(),
    title: text("title"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    eventDate: date("event_date").notNull(),
    eventTimestamp: timestamp("event_timestamp", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("activity_project_idx").on(t.projectId),
    index("activity_date_idx").on(t.eventDate),
    index("activity_source_idx").on(t.source),
  ]
);

// ── Pairwise Comparisons ─────────────────────────────────
export const pairwiseComparisons = pgTable(
  "pairwise_comparisons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectAId: uuid("project_a_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    projectBId: uuid("project_b_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    scenario: varchar("scenario", { length: 255 }),
    winnerId: uuid("winner_id").references(() => projects.id),
    reasoning: text("reasoning"),
    scores: jsonb("scores").$type<{ projectA: number; projectB: number }>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("comp_a_idx").on(t.projectAId),
    index("comp_b_idx").on(t.projectBId),
  ]
);
