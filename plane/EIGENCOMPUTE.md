# EigenCompute TEE Deployment

This guide deploys the Dope Doe analysis pipeline inside an EigenLayer Trusted Execution Environment (TEE) via EigenCompute. The pipeline runs with cryptographic integrity guarantees -- the system that evaluates project integrity is itself verifiably honest.

## Architecture

```
User browser
     |
     v
Next.js (Vercel)  --EIGENCOMPUTE_RUNNER_URL-->  EigenCompute TEE
src/app/api/analyze/route.ts                    src/server.ts (Hono)
                                                     |
                                                runPipeline()
                                                4-layer agent system
```

The Next.js frontend proxies analysis requests to the TEE runner. If `EIGENCOMPUTE_RUNNER_URL` is not set, the pipeline runs locally inside the Next.js function (fallback mode).

## Files

| File | Purpose |
|------|---------|
| `src/server.ts` | Hono HTTP server, `POST /analyze` + `GET /health`, port 3001 |
| `Dockerfile` | TEE image, `linux/amd64`, runs `tsx src/server.ts` |
| `.dockerignore` | Excludes `.next`, `node_modules`, `.env*` from image |
| `.env.example` | All required env vars |
| `src/app/api/analyze/route.ts` | 3-way branch: demo / TEE proxy / local fallback |

## Prerequisites

1. Install the EigenCompute CLI:

```bash
npm install -g @eigencompute/cli
# or
brew install eigencompute/tap/ecloud
```

2. Authenticate:

```bash
ecloud auth login
```

3. Subscribe to billing (required before first deploy):

```bash
ecloud billing subscribe
```

## Environment Variables

Copy `.env.example` to `.env` and fill in all values before building:

```bash
cp .env.example .env
```

Required for the TEE runner:

```
OPENROUTER_API_KEY=        # LLM calls (eval agents + synthesis)
ETHERSCAN_API_KEY=         # On-chain data (token holders, transactions)
ALCHEMY_RPC_URL=           # RPC fallback
GITHUB_TOKEN=              # GitHub API (development layer)
DUNE_API_KEY=              # Social/on-chain Dune queries
DATABASE_URL=              # Neon Postgres (persist evaluations)
PORT=3001                  # runner port (default 3001)
NETWORK_PUBLIC=mainnet     # Visible to users in TEE attestation
```

Optional:
```
TWITTER_BEARER_TOKEN=      # Twitter social data
OPENROUTER_API_KEY_2=      # Secondary LLM key for fallback
```

## Deploy

### 1. Build and push the Docker image

```bash
# From the plane/ directory
docker build --platform linux/amd64 -t dope-runner .
```

### 2. Deploy to EigenCompute

```bash
ecloud compute app deploy \
  --name dope-runner \
  --image dope-runner \
  --port 3001 \
  --env-file .env
```

### 3. Get the runner URL

After deploy, EigenCompute will output a public URL for the app, e.g.:

```
https://dope-runner.eigencompute.app
```

Verify it is live:

```bash
curl https://dope-runner.eigencompute.app/health
# {"ok":true}
```

### 4. Wire up the frontend

Set the runner URL in your Vercel project environment variables:

```
EIGENCOMPUTE_RUNNER_URL=https://dope-runner.eigencompute.app
```

Redeploy the frontend -- all analysis requests will now proxy through the TEE.

## Local Test (before deploy)

Run the runner locally on port 3001:

```bash
bun run runner
# or
npx tsx src/server.ts
```

Then in a separate terminal, hit it directly:

```bash
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "project": {
      "name": "Test Project",
      "githubUrl": "https://github.com/aave/aave-v3-core",
      "twitterHandle": "aave"
    },
    "isDemo": false
  }'
```

Or proxy through Next.js by setting:

```
EIGENCOMPUTE_RUNNER_URL=http://localhost:3001
```

## Execution Branches

The API route (`src/app/api/analyze/route.ts`) selects one of three paths at runtime:

| Condition | Path |
|-----------|------|
| `OPENROUTER_API_KEY` not set | Demo mode -- returns hardcoded NexusNet data |
| `EIGENCOMPUTE_RUNNER_URL` set | TEE proxy -- forwards to Hono runner in TEE |
| Neither | Local -- runs `runPipeline()` inside Next.js function |

## Verifying TEE Attestation

Once deployed, EigenCompute provides an attestation report proving the exact code running in the enclave. Users can verify:

```bash
ecloud compute app attest dope-runner
```

This is the core value proposition: the integrity scoring system itself has verifiable integrity.

## Troubleshooting

**Runner returns 500 on `/analyze`**
- Check all env vars are set: `ecloud compute app env list dope-runner`
- Check logs: `ecloud compute app logs dope-runner`

**`EIGENCOMPUTE_RUNNER_URL` set but frontend still runs locally**
- The env var must be set in Vercel (not just `.env.local`) and the deployment restarted

**Docker build fails on non-amd64 machine**
- The `--platform linux/amd64` flag is required for EigenCompute TEE compatibility
- On Apple Silicon: `docker buildx build --platform linux/amd64 -t dope-runner .`

**`ecloud billing subscribe` error**
- EigenCompute requires a credit card on file before deploying
- $100 free credit is available for competition/hackathon submissions
