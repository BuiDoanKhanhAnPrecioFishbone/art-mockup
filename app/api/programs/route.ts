import { NextResponse } from "next/server";
import {
  createProgram,
  listPrograms,
  nextProgramId,
} from "@/entities/program/api/fixtures";
import type { Program } from "@/entities/program";

export function GET() {
  return NextResponse.json({ programs: listPrograms() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Program>;
  if (!body.title || body.title.trim() === "") {
    return NextResponse.json(
      { error: "Program name is required." },
      { status: 400 }
    );
  }
  const id = nextProgramId(body.title);
  const program: Program = {
    id,
    title: body.title.trim(),
    position: body.position ?? "",
    level: body.level ?? "Fresher",
    startDate: body.startDate ?? "",
    endDate: body.endDate ?? "",
    headcount: body.headcount ?? 1,
    applicantCount: 0,
    status: body.status ?? "draft",
    createdAt: new Date().toISOString(),
    description: body.description,
    skills: body.skills,
    labels: body.labels,
    folderLink: body.folderLink,
    jobTemplateId: body.jobTemplateId,
    candidateProfile: body.candidateProfile,
    publicForm: body.publicForm,
    workflow: body.workflow,
    department: body.department,
    location: body.location,
    employmentType: body.employmentType,
    cvTemplate: body.cvTemplate,
  };
  createProgram(program);
  return NextResponse.json({ program }, { status: 201 });
}
