import { NextRequest, NextResponse } from "next/server";
import { ProjectInputSchema } from "@/src/lib/schemas";
import { createProject, listProjects } from "@/src/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProjectInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { projectName, githubUrl, tokenAddress, chain, twitterHandle, governanceSpace } = parsed.data;

    const project = await createProject({
      name: projectName,
      githubUrl,
      tokenAddress,
      chain,
      twitterHandle,
      governanceSpace,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const projectList = await listProjects({ limit, offset });

    return NextResponse.json(projectList);
  } catch (error) {
    console.error("List projects error:", error);
    return NextResponse.json(
      { error: "Failed to list projects" },
      { status: 500 }
    );
  }
}
