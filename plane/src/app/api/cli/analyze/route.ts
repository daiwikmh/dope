import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { validateApiKey, createProject, createEvaluation } from "@/src/lib/db/queries";
import { runPipeline } from "@/src/lib/agents/orchestrator";

export const maxDuration = 300;

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function POST(req: NextRequest) {
  // auth
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing X-API-Key header" },
      { status: 401 }
    );
  }

  const keyRecord = await validateApiKey(hashKey(apiKey)).catch(() => null);
  if (!keyRecord) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      name,
      githubUrl,
      tokenAddress,
      chain,
      contracts,
      twitterHandle,
      governanceSpace,
      description,
      websiteUrl,
      videoUrl,
      logoUrl,
      skillmd,
    } = body as {
      name?: string;
      githubUrl?: string;
      tokenAddress?: string;
      chain?: string;
      contracts?: { label: string; address: string; chain?: string }[];
      twitterHandle?: string;
      governanceSpace?: string;
      description?: string;
      websiteUrl?: string;
      videoUrl?: string;
      logoUrl?: string;
      skillmd?: string;
    };

    // if skillmd provided, parse it first
    let projectFields = {
      name: name ?? "",
      githubUrl,
      tokenAddress,
      chain: chain ?? "ethereum",
      contracts,
      twitterHandle,
      governanceSpace,
    };

    if (skillmd) {
      const { parseSkillMd } = await import("@/src/lib/agents/skillmd-parser");
      const parsed = await parseSkillMd(skillmd);
      projectFields = {
        name: parsed.name || projectFields.name,
        githubUrl: parsed.githubUrl || projectFields.githubUrl,
        tokenAddress: parsed.tokenAddress || projectFields.tokenAddress,
        chain: parsed.chain || projectFields.chain || "ethereum",
        contracts: parsed.contracts?.length ? parsed.contracts : projectFields.contracts,
        twitterHandle: parsed.twitterHandle || projectFields.twitterHandle,
        governanceSpace: parsed.governanceSpace || projectFields.governanceSpace,
      };
    }

    if (!projectFields.name) {
      return NextResponse.json(
        { error: "Project name is required (provide name or skillmd)" },
        { status: 400 }
      );
    }

    const runnerUrl = process.env.EIGENCOMPUTE_RUNNER_URL;
    let report;
    let dataOutputs: Record<string, unknown> = {};
    let evalOutputs: unknown[] = [];

    if (runnerUrl) {
      const res = await fetch(`${runnerUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectFields, isDemo: false }),
      });
      if (!res.ok) throw new Error(`Runner returned ${res.status}`);
      const result = await res.json();
      report = result.report;
      dataOutputs = result.dataOutputs ?? {};
      evalOutputs = result.evalOutputs ?? [];
    } else {
      const result = await runPipeline(projectFields, false);
      report = result.report;
      dataOutputs = result.dataOutputs;
      evalOutputs = result.evalOutputs;
    }

    // persist
    let projectId: string | undefined;
    try {
      const project = await createProject({
        name: projectFields.name,
        githubUrl: projectFields.githubUrl,
        tokenAddress: projectFields.tokenAddress,
        chain: projectFields.chain,
        twitterHandle: projectFields.twitterHandle,
        governanceSpace: projectFields.governanceSpace,
        description,
        websiteUrl,
        videoUrl,
        logoUrl,
      });
      await createEvaluation(project.id, report);
      projectId = project.id;
    } catch (e) {
      console.error("DB persist skipped:", e);
    }

    return NextResponse.json({
      report,
      projectId,
      dataOutputs,
      evalOutputs,
    });
  } catch (err) {
    console.error("CLI analysis error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
