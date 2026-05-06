import { NextResponse } from "next/server";
import { updateProgram } from "@/entities/program/api/fixtures";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updated = updateProgram(id, { status: "closed" });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ program: updated });
}
