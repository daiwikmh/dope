import { NextRequest, NextResponse } from "next/server";
import { getProjectById, getActivityHeatmap, getActivityByProject } from "@/src/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "heatmap";
    const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString(), 10);
    const source = searchParams.get("source") ?? undefined;

    if (view === "heatmap") {
      const data = await getActivityHeatmap(id, year);
      return NextResponse.json(data);
    }

    // List view
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const events = await getActivityByProject(id, { from, to, source });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
