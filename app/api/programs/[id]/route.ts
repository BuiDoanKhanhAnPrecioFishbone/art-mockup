import { NextResponse } from "next/server";
import {
  deleteProgram,
  getProgram,
  updateProgram,
} from "@/entities/program/api/fixtures";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ program });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patch = await req.json();
  const updated = updateProgram(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ program: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Business rule: cannot delete a program currently open for recruitment.
  if (program.status === "active") {
    return NextResponse.json(
      {
        error:
          "Cannot delete because it is currently open for recruitment.",
      },
      { status: 409 }
    );
  }
  deleteProgram(id);
  return NextResponse.json({ ok: true });
}
