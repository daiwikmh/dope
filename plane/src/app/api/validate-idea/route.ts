import { NextResponse } from "next/server";
import { validateIdea } from "@/src/lib/agents/idea-validator";
import { listProjectsWithReports } from "@/src/lib/db/queries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ideaDescription } = body as { ideaDescription?: string };

    if (!ideaDescription?.trim()) {
      return NextResponse.json(
        { error: "ideaDescription is required" },
        { status: 400 }
      );
    }

    const projects = await listProjectsWithReports();

    const existingProjects = projects.map((p) => ({
      name: p.name,
      integrityScore: p.integrityScore,
      verdict: p.verdict,
      executiveSummary: p.executiveSummary ?? "",
      layerScores: (p.layerScores ?? {}) as Record<string, number>,
    }));

    const result = await validateIdea({ ideaDescription, existingProjects });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Validation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
