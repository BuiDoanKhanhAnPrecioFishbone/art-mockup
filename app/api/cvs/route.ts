import { NextResponse } from "next/server";
import {
  addCVRecord,
  listCVRecords,
} from "@/entities/cv-record/api/fixtures";
import type { CVRecord } from "@/entities/cv-record";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");
  if (!programId) {
    return NextResponse.json(
      { error: "programId query param is required" },
      { status: 400 }
    );
  }
  return NextResponse.json({ cvs: listCVRecords(programId) });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CVRecord>;
  if (!body.programId || !body.fileName || !body.source) {
    return NextResponse.json(
      { error: "programId, fileName and source are required." },
      { status: 400 }
    );
  }
  const id = `cv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const cv: CVRecord = {
    id,
    programId: body.programId,
    fileName: body.fileName,
    fileSizeKB: body.fileSizeKB,
    type: body.type ?? "manual",
    source: body.source,
    addedAtISO: body.addedAtISO ?? new Date().toISOString(),
    status: body.status ?? "extracting",
    parsedName: body.parsedName,
    parsedEmail: body.parsedEmail,
    parsedPhone: body.parsedPhone,
    skills: body.skills ?? [],
    duplicateOfCandidateId: body.duplicateOfCandidateId,
    errorReason: body.errorReason,
  };
  addCVRecord(cv);
  return NextResponse.json({ cv }, { status: 201 });
}
