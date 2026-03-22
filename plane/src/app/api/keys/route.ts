import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { createApiKey, listApiKeys, deleteApiKey } from "@/src/lib/db/queries";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function GET() {
  try {
    const keys = await listApiKeys();
    return NextResponse.json({ keys });
  } catch (err) {
    return NextResponse.json({ error: "Failed to list keys" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = (await req.json()) as { name?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const raw = `dd_${randomBytes(24).toString("hex")}`;
    const prefix = raw.slice(0, 7);
    const keyHash = hashKey(raw);

    await createApiKey({ name: name.trim(), keyHash, prefix });

    // return the raw key only once
    return NextResponse.json({ key: raw, prefix });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteApiKey(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete key" }, { status: 500 });
  }
}
