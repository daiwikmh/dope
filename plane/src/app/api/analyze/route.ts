import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;
import type { ProjectInput } from "@/src/lib/sample-data";
import { runPipeline } from "@/src/lib/agents/orchestrator";
import { createProject, createEvaluation } from "@/src/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body: ProjectInput & { demo?: boolean } = await request.json();

    const isDemoMode = !process.env.OPENROUTER_API_KEY;
    const runnerUrl = process.env.EIGENCOMPUTE_RUNNER_URL;
    let report;
    let dataOutputs: Record<string, unknown> = {};
    let evalOutputs: unknown[] = [];

    if (isDemoMode) {
      const demo = getDemoResult(body.projectName);
      report = demo.report;
      dataOutputs = demo.dataOutputs;
      evalOutputs = demo.evalOutputs;
    } else if (runnerUrl) {
      const res = await fetch(`${runnerUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: {
            name: body.projectName,
            tokenAddress: body.tokenAddress,
            chain: body.chain,
            contracts: body.contracts,
            githubUrl: body.githubUrl,
            twitterHandle: body.twitterHandle,
            governanceSpace: body.governanceSpace,
          },
          isDemo: !!body.demo,
        }),
      });
      if (!res.ok) throw new Error(`Runner returned ${res.status}`);
      const result = await res.json();
      report = result.report;
      dataOutputs = result.dataOutputs ?? {};
      evalOutputs = result.evalOutputs ?? [];
    } else {
      const result = await runPipeline(
        {
          name: body.projectName,
          tokenAddress: body.tokenAddress,
          chain: body.chain,
          contracts: body.contracts,
          githubUrl: body.githubUrl,
          twitterHandle: body.twitterHandle,
          governanceSpace: body.governanceSpace,
        },
        !!body.demo
      );
      report = result.report;
      dataOutputs = result.dataOutputs;
      evalOutputs = result.evalOutputs;
    }

    // persist to DB for comparison support
    let projectId: string | undefined;
    try {
      const project = await createProject({
        name: body.projectName,
        githubUrl: body.githubUrl,
        tokenAddress: body.tokenAddress,
        chain: body.chain,
        twitterHandle: body.twitterHandle,
        governanceSpace: body.governanceSpace,
        description: body.description,
        websiteUrl: body.websiteUrl,
        videoUrl: body.videoUrl,
        logoUrl: body.logoUrl,
      });
      await createEvaluation(project.id, report);
      projectId = project.id;
    } catch (e) {
      console.error("DB persist skipped:", e);
    }

    return NextResponse.json({ ...report, projectId, dataOutputs, evalOutputs });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Check API keys and try again." },
      { status: 500 }
    );
  }
}

function getDemoResult(projectName: string) {
  const report = {
    projectName: projectName || "NexusNet (Demo)",
    integrityScore: 34,
    verdict: "critical" as const,
    executiveSummary:
      "NexusNet presents a significant divergence between marketing claims and observable reality. Development activity has stalled, governance is captured by whale wallets, and community sentiment is overwhelmingly negative.",
    impactVectors: [
      {
        theme: "Development Sustainability Crisis",
        summary: "Classic zombie repo pattern -- high stars but near-zero recent commits.",
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
      "Development activity shows zombie repo pattern -- 9 commits in 90 days from a single contributor despite 142 open issues.",
      "Governance is effectively captured by 5 whale wallets controlling 91.3% of votes with near-zero community turnout.",
      "Token distribution is highly concentrated (84.7% top 10 wallets) with low velocity -- consistent with insider holding patterns.",
      "Community sentiment is strongly negative (0.35/1.0) with unaddressed complaints about performance and censorship.",
    ],
  };

  const dataOutputs: Record<string, unknown> = {
    "data-onchain": { tokenHolders: [{ address: "0x1a2b..3c4d", percentage: 42.1 }, { address: "0x5e6f..7g8h", percentage: 22.3 }], top10HoldersPercent: 84.7, uptimePercent: 99.9, dailyTransactions: 34, tokenVelocity: 0.12, contractAge: 412, totalSupply: "1,000,000,000" },
    "data-github": { repoName: "nexusnet-core", stars: 2840, forks: 312, commitsLast90Days: 9, contributors: 3, topContributorPercent: 78, openIssues: 142, avgIssueResponseHours: 720, lastCommitDaysAgo: 21 },
    "data-social": { twitterFollowers: 12400, avgEngagementRate: 1.2, sentimentScore: 0.35, botLikelihoodPercent: 22, recentMentions: [{ text: "API latency way worse than docs claim", sentiment: "negative" }], communityComplaints: ["Latency issues", "Token dumping"] },
    "data-governance": { totalProposals: 24, proposalPassRate: 95.8, avgVoterTurnout: 3.2, top5VotersPercent: 91.3, avgTimeToQuorumHours: 2.1, recentProposals: [{ title: "Increase team allocation 5%", passed: true, turnout: 2.8 }] },
  };

  const evalOutputs = [
    { layer: "onchain", score: 42, summary: "Token concentration is extreme with 84.7% held by top 10 wallets. Transaction velocity is low.", signals: [{ text: "Top 10 holders control 84.7% of supply", severity: "critical", source: "Etherscan", confidence: 0.97 }] },
    { layer: "development", score: 18, summary: "Zombie repo pattern with only 9 commits in 90 days from a single contributor.", signals: [{ text: "9 commits in 90 days", severity: "critical", source: "GitHub", confidence: 0.95 }, { text: "142 open issues, 30d avg response", severity: "high", source: "GitHub", confidence: 0.88 }] },
    { layer: "social", score: 28, summary: "Sentiment 0.35/1.0 with 22% estimated bot followers.", signals: [{ text: "22% bot likelihood", severity: "medium", source: "Social analysis", confidence: 0.7 }] },
    { layer: "governance", score: 15, summary: "Top 5 voters control 91.3% with 95.8% pass rate at 3.2% turnout.", signals: [{ text: "91.3% whale capture", severity: "critical", source: "Snapshot", confidence: 0.96 }] },
  ];

  return { report, dataOutputs, evalOutputs };
}
