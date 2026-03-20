import { NextRequest, NextResponse } from "next/server";
import {
  getProjectById,
  getLatestEvaluation,
  createComparison,
} from "@/src/lib/db/queries";
import { compareProjects } from "@/src/lib/agents/comparison-agent";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { opponentId, scenario } = body;

    if (!opponentId) {
      return NextResponse.json(
        { error: "opponentId is required" },
        { status: 400 }
      );
    }

    const [projectA, projectB] = await Promise.all([
      getProjectById(id),
      getProjectById(opponentId),
    ]);

    if (!projectA || !projectB) {
      return NextResponse.json(
        { error: "One or both projects not found" },
        { status: 404 }
      );
    }

    const [evalA, evalB] = await Promise.all([
      getLatestEvaluation(id),
      getLatestEvaluation(opponentId),
    ]);

    if (!evalA?.report || !evalB?.report) {
      return NextResponse.json(
        { error: "Both projects must have at least one evaluation" },
        { status: 400 }
      );
    }

    const result = await compareProjects({
      projectA: { name: projectA.name, report: evalA.report },
      projectB: { name: projectB.name, report: evalB.report },
      scenario: scenario ?? "general_integrity",
    });

    const comparison = await createComparison({
      projectAId: id,
      projectBId: opponentId,
      scenario: scenario ?? "general_integrity",
      winnerId: result.winnerId ?? undefined,
      reasoning: result.reasoning,
      scores: { projectA: result.scoreA, projectB: result.scoreB },
    });

    return NextResponse.json({ comparison, result });
  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json(
      { error: "Comparison failed" },
      { status: 500 }
    );
  }
}
