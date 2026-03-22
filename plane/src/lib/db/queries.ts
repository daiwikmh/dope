import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { db } from "./index";
import {
  projects,
  evaluations,
  activityEvents,
  pairwiseComparisons,
  blogPosts,
  apiKeys,
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
  description?: string;
  websiteUrl?: string;
  videoUrl?: string;
  logoUrl?: string;
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
    description: string;
    websiteUrl: string;
    videoUrl: string;
    logoUrl: string;
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

// ── Projects with Scores (for Explore cross-ref) ─────────

export async function listProjectsWithScores() {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      tokenAddress: projects.tokenAddress,
      contracts: projects.contracts,
      integrityScore: evaluations.integrityScore,
      verdict: evaluations.verdict,
    })
    .from(projects)
    .innerJoin(evaluations, eq(evaluations.projectId, projects.id))
    .orderBy(desc(evaluations.createdAt));

  // dedupe to latest evaluation per project
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── Projects with Reports (for idea validation) ─────────

export async function listProjectsWithReports() {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      integrityScore: evaluations.integrityScore,
      verdict: evaluations.verdict,
      executiveSummary: evaluations.executiveSummary,
      layerScores: evaluations.layerScores,
      createdAt: evaluations.createdAt,
    })
    .from(projects)
    .innerJoin(evaluations, eq(evaluations.projectId, projects.id))
    .orderBy(desc(evaluations.createdAt));

  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
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

// ── Blog Posts ───────────────────────────────────────────

export async function listBlogPosts(limit = 50) {
  return db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function createBlogPost(input: {
  projectName: string;
  integrityScore: number;
  verdict: string;
  summary: string;
  report: IntegrityReport;
}) {
  const [post] = await db.insert(blogPosts).values(input).returning();
  return post;
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

// ── API Keys ─────────────────────────────────────────────

export async function createApiKey(input: {
  name: string;
  keyHash: string;
  prefix: string;
}) {
  const [key] = await db.insert(apiKeys).values(input).returning();
  return key;
}

export async function validateApiKey(keyHash: string) {
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);
  if (!key) return null;
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id));
  return key;
}

export async function listApiKeys() {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .orderBy(desc(apiKeys.createdAt));
}

export async function deleteApiKey(id: string) {
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
}
