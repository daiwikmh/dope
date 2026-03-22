import { NextResponse } from "next/server";
import { parseSkillMd } from "@/src/lib/agents/skillmd-parser";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, text } = body as { url?: string; text?: string };

    if (!url && !text) {
      return NextResponse.json(
        { error: "Provide either url or text" },
        { status: 400 }
      );
    }

    let content = text ?? "";

    if (url) {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${res.status}` },
          { status: 400 }
        );
      }
      content = await res.text();
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Empty content" },
        { status: 400 }
      );
    }

    const fields = await parseSkillMd(content);
    return NextResponse.json(fields);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Parse failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
