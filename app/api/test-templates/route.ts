import { NextResponse } from "next/server";
import { listTestTemplates } from "@/entities/test-template/api/fixtures";

export function GET() {
  return NextResponse.json({ items: listTestTemplates() });
}
