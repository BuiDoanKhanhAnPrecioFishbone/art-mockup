import { NextResponse } from "next/server";
import { duplicateProgram } from "@/entities/program/api/fixtures";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const copy = duplicateProgram(id);
  if (!copy) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ program: copy });
}
