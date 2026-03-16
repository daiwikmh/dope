import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const body: ProjectInput & { demo?: boolean } = await request.json();
    const isDemo = body.demo || !process.env.OPENROUTER_API_KEY;

    // Step 1: Fetch data (parallel)
    let onchainData, githubData, socialData, governanceData;

    if (isDemo) {
      onchainData = sampleOnchainData;
      githubData = sampleGithubData;
      socialData = sampleSocialData;
      governanceData = sampleGovernanceData;
    } else {
      const results = await Promise.allSettled([
        body.tokenAddress
          ? fetchOnchainData(body.tokenAddress, body.chain)
          : Promise.resolve(sampleOnchainData),
        body.githubUrl
          ? fetchGithubData(body.githubUrl).then((r) => r.data)
          : Promise.resolve(sampleGithubData),
        body.twitterHandle
          ? fetchSocialData(body.twitterHandle)
          : Promise.resolve(sampleSocialData),
        body.governanceSpace
          ? fetchGovernanceData(body.governanceSpace)
          : Promise.resolve(sampleGovernanceData),
      ]);

      onchainData =
        results[0].status === "fulfilled"
          ? results[0].value
          : sampleOnchainData;
      githubData =
        results[1].status === "fulfilled"
          ? results[1].value
          : sampleGithubData;
      socialData =
        results[2].status === "fulfilled"
          ? results[2].value
          : sampleSocialData;
      governanceData =
        results[3].status === "fulfilled"
          ? results[3].value
          : sampleGovernanceData;
    }

    // If no API key, return pre-built demo report
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(getDemoReport(body.projectName));
    }

    // Step 2: Run 4 analysis agents in parallel
    const [onchainAnalysis, devAnalysis, socialAnalysis, govAnalysis] =
      await Promise.all([
        analyzeOnchain(onchainData),
        analyzeDevelopment(githubData),
        analyzeSocial(socialData),
        analyzeGovernance(governanceData),
      ]);

    // Step 3: Synthesis (recursive summarization)
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
      "NexusNet presents a significant divergence between marketing claims and observable reality. While uptime metrics appear strong (99.9%), development activity has effectively stalled (9 commits in 90 days from a single active contributor), governance is captured by 2 whale wallets controlling 91% of votes, and community sentiment is overwhelmingly negative with unresolved complaints about latency, token dumping, and censored feedback.",
    impactVectors: [
      {
        theme: "Development Sustainability Crisis",
        summary:
          "Despite 2,840 GitHub stars suggesting historical interest, the project shows classic 'zombie repo' patterns. Only 9 commits in 90 days, 87% from a single contributor, 142 open issues with an average response time of 30 days. This creates existential risk for the project's technical roadmap.",
        weight: 0.25,
        claimedPerformance: 0.85,
        observedReality: 0.15,
        signals: [
          {
            text: "Zombie repo pattern: high stars (2,840) but only 9 commits in 90 days",
            severity: "critical" as const,
            source: "GitHub API",
            confidence: 0.95,
          },
          {
            text: "Bus factor of 1: single contributor responsible for 87% of commits",
            severity: "high" as const,
            source: "GitHub API",
            confidence: 0.92,
          },
          {
            text: "142 open issues with 30-day average response time indicates abandonment",
            severity: "high" as const,
            source: "GitHub API",
            confidence: 0.88,
          },
        ],
      },
      {
        theme: "Governance Capture & Decentralization Theater",
        summary:
          "Governance appears democratic on paper but analysis reveals severe whale capture. Top 5 voters control 91.3% of all votes, proposals pass at 95.8% rate with only 3.2% average turnout. The single proposal that failed — adding a community council seat — had the highest turnout (8.7%), suggesting community attempts to gain representation are systematically blocked.",
        weight: 0.25,
        claimedPerformance: 0.9,
        observedReality: 0.1,
        signals: [
          {
            text: "Top 5 voters control 91.3% of all governance votes",
            severity: "critical" as const,
            source: "Snapshot/Governance API",
            confidence: 0.96,
          },
          {
            text: "95.8% proposal pass rate with 3.2% turnout suggests rubber-stamping",
            severity: "high" as const,
            source: "Snapshot/Governance API",
            confidence: 0.9,
          },
          {
            text: "Community representation proposal was the ONLY one to fail — at highest turnout",
            severity: "critical" as const,
            source: "Snapshot/Governance API",
            confidence: 0.93,
          },
          {
            text: "Time-to-quorum of 2.1 hours suggests coordinated whale voting",
            severity: "medium" as const,
            source: "Snapshot/Governance API",
            confidence: 0.75,
          },
        ],
      },
      {
        theme: "Community Trust Erosion",
        summary:
          "Social signals reveal a widening gap between official messaging and community experience. Sentiment score of 0.35/1.0, with dominant complaints about API latency (200ms+ vs claimed 50ms), unannounced token vesting unlocks causing 15% price drops, and Discord moderators deleting critical posts. 22% estimated bot followers inflate perceived support.",
        weight: 0.3,
        claimedPerformance: 0.8,
        observedReality: 0.2,
        signals: [
          {
            text: "API latency 4x worse than claimed (200ms+ vs 50ms)",
            severity: "high" as const,
            source: "Community reports/Twitter",
            confidence: 0.82,
          },
          {
            text: "Token vesting unlock caused 15% price drop with zero prior communication",
            severity: "critical" as const,
            source: "Community reports/Etherscan",
            confidence: 0.88,
          },
          {
            text: "Node operator rewards cut 40% without governance vote",
            severity: "critical" as const,
            source: "Community reports/Discord",
            confidence: 0.85,
          },
          {
            text: "Discord moderators deleting critical posts — censorship pattern",
            severity: "high" as const,
            source: "Community reports",
            confidence: 0.78,
          },
          {
            text: "22% estimated bot followers suggest artificial social proof",
            severity: "medium" as const,
            source: "Social analysis",
            confidence: 0.7,
          },
          {
            text: "Overall sentiment score 0.35/1.0 — community is frustrated",
            severity: "high" as const,
            source: "Sentiment analysis",
            confidence: 0.86,
          },
        ],
      },
      {
        theme: "Token Concentration & Economic Risk",
        summary:
          "On-chain data shows 84.7% of token supply held by top 10 wallets, creating severe centralization risk despite DePIN decentralization narrative. Low token velocity (0.34) combined with team wallet selling patterns reported by community members suggests limited organic economic activity.",
        weight: 0.2,
        claimedPerformance: 0.75,
        observedReality: 0.25,
        signals: [
          {
            text: "Top 10 holders control 84.7% of token supply — extreme concentration",
            severity: "critical" as const,
            source: "On-chain data",
            confidence: 0.97,
          },
          {
            text: "Low token velocity (0.34) suggests limited organic usage",
            severity: "medium" as const,
            source: "On-chain data",
            confidence: 0.8,
          },
          {
            text: "Community reports of team wallet dumping align with price action",
            severity: "high" as const,
            source: "On-chain + Social cross-reference",
            confidence: 0.72,
          },
        ],
      },
    ],
    layerScores: {
      onchain: 42,
      development: 18,
      social: 28,
      governance: 15,
    },
    recommendations: [
      "HALT FUNDING: Project shows multiple critical integrity failures across all 4 data layers. Do not allocate resources until fundamental issues are addressed.",
      "Require verifiable development roadmap with milestone-based funding and independent contributor onboarding before considering any future allocation.",
      "Mandate governance reform: implement quadratic voting or delegate-based system to break whale capture before any new proposals are recognized.",
      "Request transparent token vesting schedule with on-chain enforcement and community notification requirements.",
      "Conduct independent technical audit to verify claimed uptime and latency metrics against actual user-reported performance data.",
    ],
  };
}
