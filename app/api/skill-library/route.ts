import { NextResponse } from "next/server";
import { masterSkills } from "@/shared/fixtures/skills";

export async function GET() {
  return NextResponse.json(masterSkills);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newSkill = {
    id: `sk-${Date.now()}`,
    name: body.name,
    category: body.category || "Uncategorized",
    synonyms: body.synonyms || [],
    description: body.description || "",
    status: "active" as const,
    createdBy: "Current User",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };
  return NextResponse.json(newSkill, { status: 201 });
}
