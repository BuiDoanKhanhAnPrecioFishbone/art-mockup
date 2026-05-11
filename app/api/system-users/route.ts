import { NextResponse } from "next/server";
import {
  createSystemUser,
  listSystemUsers,
} from "@/entities/system-user/api/fixtures";

export function GET() {
  return NextResponse.json({ users: listSystemUsers() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (typeof body.email !== "string" || !body.email.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  const fresh = createSystemUser({
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone,
    roleId: body.roleId ?? "role-standard-user",
    status: body.status ?? "pending",
    lastActiveISO: body.lastActiveISO,
  });
  return NextResponse.json({ user: fresh }, { status: 201 });
}
