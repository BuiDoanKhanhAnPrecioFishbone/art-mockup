import { NextResponse } from "next/server";
import { aiExtractedSkills } from "@/shared/fixtures/skills";

export async function POST() {
  // Simulate AI processing delay
  return NextResponse.json({
    skills: aiExtractedSkills,
    message: "AI extraction completed successfully",
  });
}
