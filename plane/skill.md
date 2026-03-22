# Dope Doe

AI-powered integrity scoring platform for DePIN and public goods projects.

## Description

Dope Doe evaluates project health across four layers (on-chain, development, social, governance) using a 3-wave agentic pipeline. It fetches real data from Etherscan, GitHub, Dune Analytics, Twitter, and Snapshot, then runs LLM-powered evaluation agents to produce an IntegrityReport with a 0-100 score, impact vectors, and actionable signals.

## Features

- **4-Layer Analysis**: On-chain token distribution, GitHub development health, social sentiment, governance decentralization
- **3-Wave Pipeline**: Data fetchers (parallel) > Eval agents (parallel) > Synthesis agent
- **Integrity Scoring**: Divergence-based scoring comparing claimed performance vs observed reality
- **Skill.md Import**: Paste a skill.md URL or text to auto-extract project fields via LLM
- **Idea Validation**: Describe a concept and compare it against all evaluated projects for viability assessment
- **Pairwise Comparison**: Head-to-head project evaluation across dimensions
- **CLI API**: Programmatic project submission via API key authentication
- **TEE Support**: Optional EigenCompute deployment for verifiable execution
- **Blog Publishing**: Publish integrity reports as shareable blog posts
- **Multi-Contract**: Projects with multiple contract addresses are merged and analyzed together

## Tech Stack

- Next.js 16, Tailwind 4, Framer Motion
- Bun runtime, TypeScript
- Neon Postgres with Drizzle ORM
- OpenRouter (Nemotron 3 Super 120B)
- Etherscan V2, GitHub API, Dune Analytics, Snapshot GraphQL

## API

### Web Dashboard
Submit projects at `/dashboard` in the Analysis tab. Fill fields manually or switch to SKILL.MD mode to paste a project document.

### CLI Endpoint
```
POST /api/cli/analyze
Header: X-API-Key: dd_your_key
Content-Type: application/json
```

#### Request body
```json
{
  "name": "ProjectName",
  "githubUrl": "https://github.com/org/repo",
  "twitterHandle": "handle",
  "contracts": [{ "label": "Token", "address": "0x...", "chain": "ethereum" }],
  "governanceSpace": "project.eth"
}
```

Or provide raw skill.md content:
```json
{
  "skillmd": "# ProjectName\n\n## Links\n- GitHub: https://github.com/org/repo\n..."
}
```

#### Response
Returns an IntegrityReport:
```json
{
  "report": {
    "projectName": "...",
    "integrityScore": 62,
    "verdict": "strong",
    "executiveSummary": "...",
    "impactVectors": [...],
    "layerScores": { "onchain": 71, "development": 55, "social": 68, "governance": 54 },
    "recommendations": [...]
  },
  "projectId": "uuid",
  "dataOutputs": { ... },
  "evalOutputs": [ ... ]
}
```

### Idea Validation
```
POST /api/validate-idea
Content-Type: application/json

{ "ideaDescription": "A decentralized compute marketplace that..." }
```

Returns viability score, similar projects, gaps, opportunities, and risks.

## Agents

| Agent | Layer | Data Source |
|-------|-------|-------------|
| data-onchain | On-chain | Etherscan V2 API |
| data-github | Development | GitHub REST API |
| data-social | Social | Dune Analytics, Twitter |
| data-governance | Governance | Snapshot GraphQL |
| eval-onchain | On-chain scoring | LLM evaluation |
| eval-development | Dev scoring | LLM evaluation |
| eval-social | Social scoring | LLM evaluation |
| eval-governance | Gov scoring | LLM evaluation |
| synth-integrity | Synthesis | LLM synthesis |
| comparison-agent | Pairwise | LLM comparison |
| skillmd-parser | Input parsing | LLM extraction |
| idea-validator | Idea validation | LLM analysis |

## Project Structure

```
src/
  app/
    api/
      analyze/          # Web analysis endpoint
      cli/analyze/      # CLI analysis endpoint (API key auth)
      keys/             # API key management
      parse-skillmd/    # Skill.md parsing
      validate-idea/    # Idea validation
      projects/         # CRUD + evaluate + compare
    dashboard/          # Main dashboard UI
    docs/               # CLI documentation
  components/
    dashboard/          # Dashboard components (form, report, compare, validate, settings)
    landing/            # Landing page components
  lib/
    agents/             # All pipeline agents
    fetchers/           # External data fetchers
    db/                 # Drizzle schema, queries, connection
    ai.ts               # OpenRouter LLM integration
    schemas.ts          # Zod schemas for all data types
```

## Environment Variables

```
OPENROUTER_API_KEY      # LLM calls
ETHERSCAN_API_KEY       # On-chain data
ALCHEMY_RPC_URL         # RPC fallback
GITHUB_TOKEN            # GitHub API
DUNE_API_KEY            # Social/on-chain queries
DATABASE_URL            # Neon Postgres
```
