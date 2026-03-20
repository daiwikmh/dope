# Agent Architecture

## Overview

The platform uses 6 AI agents powered by Llama 3.1 Nemotron 70B via OpenRouter. Four domain-specific agents analyze different data layers, a synthesis agent combines their outputs, and a comparison agent handles head-to-head evaluations.

## Two-Phase Tool-Calling Pattern

Each domain agent now follows a two-phase approach:

### Phase 1: Exploration (`generateText` + tools)
The LLM decides which tools to call to gather data. It can make multiple tool calls across up to 5 steps, building a research narrative.

### Phase 2: Structured Output (`generateObject` + schema)
Using the research notes from Phase 1, the LLM produces a typed `LayerAnalysis` object with score, summary, and micro-signals.

This is more robust than single-shot `generateObject` because the LLM can reason about what data to request and how to interpret it before committing to a structured output.

## Agents

### On-Chain Agent (`src/lib/agents/onchain-agent.ts`)
**Tools:** `getTransactionHistory`, `checkTokenConcentration`, `checkProtocolHealth`, `computeEntropy`

Evaluates token distribution, protocol uptime, transaction velocity, and holder decentralization via Shannon entropy.

### Development Agent (`src/lib/agents/dev-agent.ts`)
**Tools:** `getRepoStats`, `getRecentCommits`, `getContributorActivity`

Detects zombie repos, bus factor risk, and issue responsiveness. High stars + low recent activity is a key red flag.

### Social Agent (`src/lib/agents/social-agent.ts`)
**Tools:** `getFollowerStats`, `searchMentions`, `getCommunityComplaints`, `detectBots`

Captures qualitative sentiment data. Produces the most micro-signals (4-8) since it covers community perception, bot risk, and complaint clustering.

### Governance Agent (`src/lib/agents/governance-agent.ts`)
**Tools:** `getProposals`, `getVoterDistribution`, `checkDecentralizationTheater`

Detects governance capture via whale dominance, rubber-stamping patterns, and the "decentralization theater" composite score.

### Synthesis Agent (`src/lib/agents/synthesis-agent.ts`)
No tools — operates on the 4 layer analyses. Performs recursive summarization:
1. Groups micro-signals into 3-6 thematic Impact Vectors
2. Computes divergence scores (claimed vs. observed)
3. Produces final IntegrityReport with overall score and verdict

### Comparison Agent (`src/lib/agents/comparison-agent.ts`)
Takes two IntegrityReports + a scenario, produces a structured comparison with per-dimension scores and a winner determination.

## Schemas

All agent outputs conform to Zod schemas defined in `src/lib/schemas.ts`:

- **MicroSignal** — text, severity, source, confidence
- **ImpactVector** — theme, summary, weight, claimed vs. observed performance, grouped signals
- **LayerAnalysis** — layer name, score (0-100), summary, signals array
- **IntegrityReport** — full report with integrity score, verdict, executive summary, impact vectors, layer scores, recommendations
- **ComparisonResult** — winner, reasoning, per-project scores, dimensional breakdown

## Tool Files

Tool definitions live in `src/lib/agents/tools/`:
- `onchain-tools.ts` — 4 tools for on-chain analysis
- `dev-tools.ts` — 3 tools for development analysis
- `social-tools.ts` — 4 tools for social analysis
- `governance-tools.ts` — 3 tools for governance analysis

Each tool file exports a `create*Tools(data)` factory that closes over the fetched data, making the tools self-contained and testable.
