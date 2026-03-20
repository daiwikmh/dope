import { NextRequest, NextResponse } from "next/server";
import { getProjectById, getEvaluationsByProject } from "@/src/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const evals = await getEvaluationsByProject(id);

    return NextResponse.json({ ...project, evaluations: evals });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 }
    );
  }
}
