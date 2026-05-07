import { NextResponse } from "next/server";
import {
  createProgram,
  listPrograms,
  nextProgramId,
} from "@/entities/program/api/fixtures";
import { listAllCandidates } from "@/entities/candidate/api/fixtures";
import type { Program } from "@/entities/program";

export function GET() {
  // Derive applicantCount + the per-program candidate metadata from the
  // candidate store. The "+N NEW" badge on the card and the pipeline
  // highlights are both derived client-side from the user's local
  // reviewed set against this list, so the two numbers always agree.
  const candidates = listAllCandidates();
  const byProgram = new Map<
    string,
    {
      total: number;
      candidates: { id: string; addedAtISO?: string }[];
    }
  >();
  for (const c of candidates) {
    const prev =
      byProgram.get(c.programId) ?? { total: 0, candidates: [] };
    prev.total += 1;
    prev.candidates.push({ id: c.id, addedAtISO: c.addedAtISO });
    byProgram.set(c.programId, prev);
  }
  const programs = listPrograms().map((p) => {
    const stats = byProgram.get(p.id);
    return {
      ...p,
      applicantCount: stats?.total ?? 0,
      candidates: stats?.candidates ?? [],
    };
  });
  return NextResponse.json({ programs });
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
