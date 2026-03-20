import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { db } from "./index";
import {
  projects,
  evaluations,
  activityEvents,
  pairwiseComparisons,
} from "./schema";
import type { IntegrityReport } from "../schemas";

// ── Projects ──────────────────────────────────────────────

export async function createProject(input: {
  name: string;
  githubUrl?: string;
  tokenAddress?: string;
  chain?: string;
  twitterHandle?: string;
  governanceSpace?: string;
}) {
  const [project] = await db.insert(projects).values(input).returning();
  return project;
}

export async function getProjectById(id: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return project ?? null;
}

export async function listProjects({
  limit = 20,
  offset = 0,
}: { limit?: number; offset?: number } = {}) {
  return db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateProject(
  id: string,
  patch: Partial<{
    name: string;
    githubUrl: string;
    tokenAddress: string;
    chain: string;
    twitterHandle: string;
    governanceSpace: string;
  }>
) {
  const [updated] = await db
    .update(projects)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return updated ?? null;
}

// ── Evaluations ───────────────────────────────────────────

export async function createEvaluation(
  projectId: string,
  report: IntegrityReport
) {
  const [evaluation] = await db
    .insert(evaluations)
    .values({
      projectId,
      integrityScore: report.integrityScore,
      verdict: report.verdict,
      executiveSummary: report.executiveSummary,
      report,
      layerScores: report.layerScores,
    })
    .returning();
  return evaluation;
}

export async function getEvaluationsByProject(projectId: string) {
  return db
    .select()
    .from(evaluations)
    .where(eq(evaluations.projectId, projectId))
    .orderBy(desc(evaluations.createdAt));
}

export async function getLatestEvaluation(projectId: string) {
  const [evaluation] = await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.projectId, projectId))
    .orderBy(desc(evaluations.createdAt))
    .limit(1);
  return evaluation ?? null;
}

// ── Activity Events ───────────────────────────────────────

export async function insertActivityEvents(
  events: {
    projectId: string;
    evaluationId?: string;
    eventType: string;
    source: string;
    title?: string;
    metadata?: Record<string, unknown>;
    eventDate: string;
    eventTimestamp?: Date;
  }[]
) {
  if (events.length === 0) return;
  await db.insert(activityEvents).values(events);
}

export async function getActivityHeatmap(projectId: string, year: number) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const rows = await db
    .select({
      date: activityEvents.eventDate,
      count: sql<number>`count(*)::int`,
      sources: sql<string[]>`array_agg(distinct ${activityEvents.source})`,
    })
    .from(activityEvents)
    .where(
      and(
        eq(activityEvents.projectId, projectId),
        gte(activityEvents.eventDate, startDate),
        lte(activityEvents.eventDate, endDate)
      )
    )
    .groupBy(activityEvents.eventDate)
    .orderBy(activityEvents.eventDate);

  return rows;
}

export async function getActivityByProject(
  projectId: string,
  filters: { from?: string; to?: string; source?: string } = {}
) {
  const conditions = [eq(activityEvents.projectId, projectId)];
  if (filters.from) conditions.push(gte(activityEvents.eventDate, filters.from));
  if (filters.to) conditions.push(lte(activityEvents.eventDate, filters.to));
  if (filters.source)
    conditions.push(eq(activityEvents.source, filters.source));

  return db
    .select()
    .from(activityEvents)
    .where(and(...conditions))
    .orderBy(desc(activityEvents.eventTimestamp));
}

// ── Pairwise Comparisons ─────────────────────────────────

export async function createComparison(input: {
  projectAId: string;
  projectBId: string;
  scenario?: string;
  winnerId?: string;
  reasoning?: string;
  scores?: { projectA: number; projectB: number };
}) {
  const [comparison] = await db
    .insert(pairwiseComparisons)
    .values(input)
    .returning();
  return comparison;
}

export async function getComparisonsByProject(projectId: string) {
  return db
    .select()
    .from(pairwiseComparisons)
    .where(
      sql`${pairwiseComparisons.projectAId} = ${projectId} OR ${pairwiseComparisons.projectBId} = ${projectId}`
    )
    .orderBy(desc(pairwiseComparisons.createdAt));
}
