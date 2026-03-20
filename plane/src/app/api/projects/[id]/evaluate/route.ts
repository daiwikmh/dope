import { NextRequest, NextResponse } from "next/server";
import { getProjectById, createEvaluation } from "@/src/lib/db/queries";
import { insertActivityEvents } from "@/src/lib/db/queries";
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
import { extractActivityEvents } from "@/src/lib/activity/extract";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const isDemo = body.demo || !process.env.OPENROUTER_API_KEY;

    // Step 1: Fetch data
    let onchainData, githubData, socialData, governanceData;
    let rawCommits: { sha: string; message: string; date: string }[] = [];

    if (isDemo) {
      onchainData = sampleOnchainData;
      githubData = sampleGithubData;
      socialData = sampleSocialData;
      governanceData = sampleGovernanceData;
    } else {
      const results = await Promise.allSettled([
        project.tokenAddress
          ? fetchOnchainData(project.tokenAddress, project.chain ?? "ethereum")
          : Promise.resolve(sampleOnchainData),
        project.githubUrl
          ? fetchGithubData(project.githubUrl)
          : Promise.resolve({ data: sampleGithubData, commits: [] }),
        project.twitterHandle
          ? fetchSocialData(project.twitterHandle)
          : Promise.resolve(sampleSocialData),
        project.governanceSpace
          ? fetchGovernanceData(project.governanceSpace)
          : Promise.resolve(sampleGovernanceData),
      ]);

      onchainData =
        results[0].status === "fulfilled"
          ? results[0].value
          : sampleOnchainData;

      if (results[1].status === "fulfilled") {
        const ghResult = results[1].value;
        if ("data" in ghResult && "commits" in ghResult) {
          githubData = ghResult.data;
          rawCommits = ghResult.commits;
        } else {
          githubData = ghResult as typeof sampleGithubData;
        }
      } else {
        githubData = sampleGithubData;
      }

      socialData =
        results[2].status === "fulfilled"
          ? results[2].value
          : sampleSocialData;
      governanceData =
        results[3].status === "fulfilled"
          ? results[3].value
          : sampleGovernanceData;
    }

    // If no API key, use demo report path
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 503 });
    }

    // Step 2: Run 4 analysis agents in parallel
    const [onchainAnalysis, devAnalysis, socialAnalysis, govAnalysis] =
      await Promise.all([
        analyzeOnchain(onchainData),
        analyzeDevelopment(githubData),
        analyzeSocial(socialData),
        analyzeGovernance(governanceData),
      ]);

    // Step 3: Synthesis
    const report = await synthesize(project.name, [
      onchainAnalysis,
      devAnalysis,
      socialAnalysis,
      govAnalysis,
    ]);

    // Step 4: Persist evaluation
    const evaluation = await createEvaluation(id, report);

    // Step 5: Extract and persist activity events
    const events = extractActivityEvents({
      projectId: id,
      evaluationId: evaluation.id,
      commits: rawCommits,
      governanceData,
    });

    if (events.length > 0) {
      await insertActivityEvents(events);
    }

    return NextResponse.json({ evaluation, report });
  } catch (error) {
    console.error("Evaluate error:", error);
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 }
    );
  }
}
