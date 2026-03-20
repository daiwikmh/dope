import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // allow up to 5 min on Vercel
import type { ProjectInput } from "@/src/lib/sample-data";
import {
  sampleOnchainData,
  sampleGithubData,
  sampleSocialData,
  sampleGovernanceData,
} from "@/src/lib/sample-data";
import { fetchGithubData } from "@/src/lib/fetchers/github";
import { fetchOnchainData } from "@/src/lib/fetchers/onchain";
import { fetchSocialData } from "@/src/lib/fetchers/social";
import { fetchGovernanceData } from "@/src/lib/fetchers/governance";
import { analyzeOnchain } from "@/src/lib/agents/onchain-agent";
import { analyzeDevelopment } from "@/src/lib/agents/dev-agent";
import { analyzeSocial } from "@/src/lib/agents/social-agent";
import { analyzeGovernance } from "@/src/lib/agents/governance-agent";
import { synthesize } from "@/src/lib/agents/synthesis-agent";
import type { LayerAnalysis } from "@/src/lib/schemas";

// Empty layer result for fields not provided
function emptyLayer(layer: LayerAnalysis["layer"]): LayerAnalysis {
  return {
    layer,
    score: 0,
    summary: `No ${layer} data provided — layer scored at 0.`,
    signals: [
      {
        text: `No ${layer} data was submitted for analysis`,
        severity: "critical",
        source: "system",
        confidence: 1,
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ProjectInput & { demo?: boolean } = await request.json();
    const isDemo = body.demo;

    // If no API key, return pre-built demo report
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(getDemoReport(body.projectName));
    }

    // Demo mode uses sample data for ALL layers
    if (isDemo) {
      console.log("[PIPELINE] Demo mode — using sample data for all layers");
      const [onchainAnalysis, devAnalysis, socialAnalysis, govAnalysis] =
        await Promise.all([
          analyzeOnchain(sampleOnchainData),
          analyzeDevelopment(sampleGithubData),
          analyzeSocial(sampleSocialData),
          analyzeGovernance(sampleGovernanceData),
        ]);

      const report = await synthesize(body.projectName, [
        onchainAnalysis,
        devAnalysis,
        socialAnalysis,
        govAnalysis,
      ]);

      return NextResponse.json(report);
    }

    // Live mode — only fetch + analyze layers that have input
    const hasOnchain = !!body.tokenAddress;
    const hasGithub = !!body.githubUrl;
    const hasSocial = !!body.twitterHandle;
    const hasGovernance = !!body.governanceSpace;

    const providedCount = [hasOnchain, hasGithub, hasSocial, hasGovernance].filter(Boolean).length;
    console.log(`[PIPELINE] Live mode — ${providedCount}/4 layers provided`);

    // Fetch data only for provided fields
    const fetchPromises = await Promise.allSettled([
      hasOnchain
        ? fetchOnchainData(body.tokenAddress!, body.chain)
        : Promise.resolve(null),
      hasGithub
        ? fetchGithubData(body.githubUrl!).then((r) => r.data)
        : Promise.resolve(null),
      hasSocial
        ? fetchSocialData(body.twitterHandle!)
        : Promise.resolve(null),
      hasGovernance
        ? fetchGovernanceData(body.governanceSpace!)
        : Promise.resolve(null),
    ]);

    const onchainData = fetchPromises[0].status === "fulfilled" ? fetchPromises[0].value : null;
    const githubData = fetchPromises[1].status === "fulfilled" ? fetchPromises[1].value : null;
    const socialData = fetchPromises[2].status === "fulfilled" ? fetchPromises[2].value : null;
    const governanceData = fetchPromises[3].status === "fulfilled" ? fetchPromises[3].value : null;

    // Run agents only for layers with data, empty for the rest
    const agentPromises: Promise<LayerAnalysis>[] = [
      onchainData
        ? (console.log("[AGENT] onchain → running"), analyzeOnchain(onchainData))
        : (console.log("[AGENT] onchain → skipped (no data)"), Promise.resolve(emptyLayer("onchain"))),
      githubData
        ? (console.log("[AGENT] development → running"), analyzeDevelopment(githubData))
        : (console.log("[AGENT] development → skipped (no data)"), Promise.resolve(emptyLayer("development"))),
      socialData
        ? (console.log("[AGENT] social → running"), analyzeSocial(socialData))
        : (console.log("[AGENT] social → skipped (no data)"), Promise.resolve(emptyLayer("social"))),
      governanceData
        ? (console.log("[AGENT] governance → running"), analyzeGovernance(governanceData))
        : (console.log("[AGENT] governance → skipped (no data)"), Promise.resolve(emptyLayer("governance"))),
    ];

    const [onchainAnalysis, devAnalysis, socialAnalysis, govAnalysis] =
      await Promise.all(agentPromises);

    console.log("[PIPELINE] Agents done → synthesis");

    const report = await synthesize(body.projectName, [
      onchainAnalysis,
      devAnalysis,
      socialAnalysis,
      govAnalysis,
    ]);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Check API keys and try again." },
      { status: 500 }
    );
  }
}

function getDemoReport(projectName: string) {
  return {
    projectName: projectName || "NexusNet (Demo)",
    integrityScore: 34,
    verdict: "critical" as const,
    executiveSummary:
      "NexusNet presents a significant divergence between marketing claims and observable reality. Development activity has stalled, governance is captured by whale wallets, and community sentiment is overwhelmingly negative.",
    impactVectors: [
      {
        theme: "Development Sustainability Crisis",
        summary: "Classic zombie repo pattern — high stars but near-zero recent commits.",
        weight: 0.25,
        claimedPerformance: 0.85,
        observedReality: 0.15,
        signals: [
          { text: "Only 9 commits in 90 days from single contributor", severity: "critical" as const, source: "GitHub API", confidence: 0.95 },
          { text: "142 open issues with 30-day avg response time", severity: "high" as const, source: "GitHub API", confidence: 0.88 },
        ],
      },
      {
        theme: "Governance Capture",
        summary: "Top 5 voters control 91.3% of votes with 95.8% pass rate at 3.2% turnout.",
        weight: 0.25,
        claimedPerformance: 0.9,
        observedReality: 0.1,
        signals: [
          { text: "Top 5 voters control 91.3% of governance votes", severity: "critical" as const, source: "Snapshot", confidence: 0.96 },
          { text: "Community council proposal was only one to fail", severity: "critical" as const, source: "Snapshot", confidence: 0.93 },
        ],
      },
      {
        theme: "Community Trust Erosion",
        summary: "Sentiment 0.35/1.0 with complaints about latency, token dumping, and censorship.",
        weight: 0.3,
        claimedPerformance: 0.8,
        observedReality: 0.2,
        signals: [
          { text: "API latency 4x worse than claimed", severity: "high" as const, source: "Community", confidence: 0.82 },
          { text: "22% estimated bot followers", severity: "medium" as const, source: "Social analysis", confidence: 0.7 },
        ],
      },
      {
        theme: "Token Concentration Risk",
        summary: "84.7% of supply held by top 10 wallets with low velocity.",
        weight: 0.2,
        claimedPerformance: 0.75,
        observedReality: 0.25,
        signals: [
          { text: "Top 10 holders control 84.7% of token supply", severity: "critical" as const, source: "On-chain", confidence: 0.97 },
        ],
      },
    ],
    layerScores: { onchain: 42, development: 18, social: 28, governance: 15 },
    recommendations: [
      "Development activity shows zombie repo pattern — 9 commits in 90 days from a single contributor despite 142 open issues.",
      "Governance is effectively captured by 5 whale wallets controlling 91.3% of votes with near-zero community turnout.",
      "Token distribution is highly concentrated (84.7% top 10 wallets) with low velocity — consistent with insider holding patterns.",
      "Community sentiment is strongly negative (0.35/1.0) with unaddressed complaints about performance and censorship.",
    ],
  };
}
