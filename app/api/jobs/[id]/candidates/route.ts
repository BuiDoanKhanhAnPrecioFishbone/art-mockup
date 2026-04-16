import { NextResponse } from "next/server";
import { candidates } from "@/shared/fixtures/candidates";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(candidates.filter((c) => c.programId === id));
}
