import { NextResponse } from "next/server";
import { recruitmentFlows } from "@/shared/fixtures/recruitment-flows";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const flow = recruitmentFlows.find((f) => f.id === id);
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }
  return NextResponse.json(flow);
}
