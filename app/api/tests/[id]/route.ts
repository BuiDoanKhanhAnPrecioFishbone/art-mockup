import { NextResponse } from "next/server";
import {
  deleteTest,
  getTest,
  updateTest,
} from "@/entities/test/api/fixtures";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const test = getTest(id);
  if (!test)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ test });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patch = await req.json();
  const updated = updateTest(id, patch);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ test: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = deleteTest(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
