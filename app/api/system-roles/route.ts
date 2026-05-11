import { NextResponse } from "next/server";
import { listSystemRoles } from "@/entities/system-role/api/fixtures";

export function GET() {
  return NextResponse.json({ roles: listSystemRoles() });
}
