import { NextResponse } from "next/server";
import { deleteCVRecords } from "@/entities/cv-record/api/fixtures";

export async function POST(req: Request) {
  const body = (await req.json()) as { ids?: string[] };
  if (!body.ids || body.ids.length === 0) {
    return NextResponse.json(
      { error: "ids[] required" },
      { status: 400 }
    );
  }
  const removed = deleteCVRecords(body.ids);
  return NextResponse.json({ removed });
}
