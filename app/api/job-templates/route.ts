import { NextResponse } from "next/server";
import {
  listJobTemplates,
  listPublishedJobTemplates,
} from "@/entities/job-template/api/fixtures";

/** GET /api/job-templates
 *
 *  By default returns only Published templates — that's what the
 *  Program Info picker needs (Doc 03 §3.1). Admin / management surfaces
 *  can opt into the full list with `?status=all`.
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("status") === "all";
  const templates = all ? listJobTemplates() : listPublishedJobTemplates();
  return NextResponse.json({ templates });
}
