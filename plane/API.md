# API Reference

All routes are under `/api/`. The existing `/api/analyze` endpoint is preserved for backwards compatibility.

---

## Projects

### `POST /api/projects`
Create a new project.

**Body:**
```json
{
  "projectName": "NexusNet",
  "githubUrl": "https://github.com/nexusnet/nexusnet-core",
  "tokenAddress": "0x1234...abcd",
  "chain": "ethereum",
  "twitterHandle": "@NexusNetDePIN",
  "governanceSpace": "nexusnet.eth"
}
```
Only `projectName` is required. Returns `201` with the created project.

### `GET /api/projects`
List all projects (newest first).

**Query params:** `?limit=20&offset=0`

Returns an array of project objects.

### `GET /api/projects/[id]`
Get a single project with all its evaluations.

Returns the project object with an `evaluations` array attached.

---

## Evaluations

### `POST /api/projects/[id]/evaluate`
Run the full integrity evaluation pipeline on a project.

**Body (optional):**
```json
{ "demo": true }
```
Pass `demo: true` to use sample data instead of live fetching.

**What happens:**
1. Loads project from DB
2. Fetches data from GitHub, on-chain, social, governance (parallel)
3. Runs 4 analysis agents with tool-calling (parallel)
4. Synthesis agent produces final IntegrityReport
5. Persists evaluation to DB
6. Extracts and persists activity events
7. Returns `{ evaluation, report }`

---

## Activity

### `GET /api/projects/[id]/activity`
Get activity data for heatmap or list view.

**Query params:**
| Param | Default | Description |
|-------|---------|-------------|
| `view` | `heatmap` | `heatmap` or `list` |
| `year` | current year | Year for heatmap aggregation |
| `source` | all | Filter: `github`, `onchain`, `social`, `governance` |
| `from` | - | Start date (YYYY-MM-DD) for list view |
| `to` | - | End date (YYYY-MM-DD) for list view |

**Heatmap response:** `[{ date: "2026-01-15", count: 3, sources: ["github", "onchain"] }]`

**List response:** Full event objects with metadata.

---

## Comparisons

### `POST /api/projects/[id]/compare`
Pairwise comparison between two evaluated projects.

**Body:**
```json
{
  "opponentId": "uuid-of-other-project",
  "scenario": "market_dip_resilience"
}
```
Both projects must have at least one evaluation.

Returns `{ comparison, result }` with winner, reasoning, scores, and per-dimension breakdown.

---

## Legacy

### `POST /api/analyze`
Original stateless evaluation endpoint. Still works — accepts `ProjectInput` body, runs the pipeline, returns the report without persisting anything.
