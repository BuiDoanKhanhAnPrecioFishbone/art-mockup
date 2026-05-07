import { NextResponse } from "next/server";
import { addTest, listTests } from "@/entities/test/api/fixtures";
import type { Test } from "@/entities/test";

export function GET() {
  return NextResponse.json({ tests: listTests() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Test>;
  if (!body.title?.trim()) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }
  const id = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const test: Test = {
    id,
    title: body.title.trim(),
    type: body.type ?? "Assesment",
    status: body.status ?? "Draft",
    durationMinutes: body.durationMinutes ?? 60,
    tags: body.tags ?? [],
    description: body.description ?? "",
    passRatioPercent: body.passRatioPercent ?? 70,
    canSkipQuestion: body.canSkipQuestion ?? true,
    compositionMode: body.compositionMode ?? "static",
    staticQuestions: body.staticQuestions ?? [],
    dynamicConditions: body.dynamicConditions ?? [],
    shuffleQuestions: body.shuffleQuestions ?? false,
    createdAtISO: now,
    updatedAtISO: now,
  };
  addTest(test);
  return NextResponse.json({ test }, { status: 201 });
}
