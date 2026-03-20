# Database Layer

## Overview

The Integrity Score platform uses **Neon Postgres** with **Drizzle ORM** for persistence. All project data, evaluations, activity events, and pairwise comparisons are stored and queryable.

## Setup

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Add your connection string to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Push the schema:
   ```bash
   bun run db:push
   ```

## Schema (4 tables)

### `projects`
Stores submitted project metadata (name, GitHub URL, token address, chain, Twitter handle, governance space). Each project gets a UUID primary key.

### `evaluations`
Stores full integrity reports linked to a project. Contains the integrity score (0-100), verdict (strong/moderate/weak/critical), executive summary, full JSONB report, and per-layer scores. Cascades on project delete.

### `activity_events`
Tracks granular activity for the heatmap visualization. Each event has a type (commit/transaction/tweet/proposal), source (github/onchain/social/governance), date for heatmap grouping, and flexible JSONB metadata. Indexed on project_id, event_date, and source.

### `pairwise_comparisons`
Records head-to-head project comparisons with scenario context, winner, reasoning, and scores for both projects.

## Query Layer (`src/lib/db/queries.ts`)

All database operations are abstracted into reusable functions:

| Function | Description |
|----------|-------------|
| `createProject(input)` | Insert a new project |
| `getProjectById(id)` | Fetch single project |
| `listProjects({ limit, offset })` | Paginated project list |
| `updateProject(id, patch)` | Partial update |
| `createEvaluation(projectId, report)` | Persist an IntegrityReport |
| `getEvaluationsByProject(projectId)` | All evaluations for a project |
| `getLatestEvaluation(projectId)` | Most recent evaluation |
| `insertActivityEvents(events[])` | Bulk insert activity events |
| `getActivityHeatmap(projectId, year)` | Aggregated `{ date, count, sources }[]` |
| `getActivityByProject(projectId, filters)` | Filtered event list |
| `createComparison(input)` | Store pairwise comparison |
| `getComparisonsByProject(projectId)` | All comparisons involving a project |

## Drizzle Commands

```bash
bun run db:push      # Push schema to Neon (no migrations)
bun run db:generate   # Generate migration files
bun run db:studio     # Open Drizzle Studio GUI
```
