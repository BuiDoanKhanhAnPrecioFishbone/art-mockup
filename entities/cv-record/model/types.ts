/**
 * A CV record is a parsed (or being-parsed) candidate file in the program's
 * intake / staging area. Once a CV record is verified ("Done") and approved
 * by a recruiter, it is promoted into a real {@link Candidate} on the
 * pipeline. Until then it lives only in the CVs Tracking tab.
 */

export type CVStatus =
  | "extracting" /** AI is parsing the file */
  | "done" /** Parsed cleanly, name + email present */
  | "needs-review" /** Parsed but some required field missing */
  | "duplicate" /** Email already exists in this program */
  | "error"; /** Parsing failed */

export type CVType = "auto-sync" | "manual";

export type CVSource =
  | "LinkedIn"
  | "Facebook"
  | "Tiktok"
  | "Gmail"
  | "Other";

export const CV_SOURCES: CVSource[] = [
  "LinkedIn",
  "Facebook",
  "Tiktok",
  "Gmail",
  "Other",
];

export interface CVParsedSkill {
  /** Display name from the CV. */
  name: string;
  /** Resolved master-library skillId, when found. */
  skillId?: string;
  /** Whether this skill matches the program's required skill set. */
  inProgramSkillSet: boolean;
}

export interface CVRecord {
  id: string;
  programId: string;
  fileName: string;
  fileSizeKB?: number;
  type: CVType;
  source: CVSource;
  /** ISO timestamp the CV entered the system. */
  addedAtISO: string;
  status: CVStatus;
  /** Parsed name — may be empty for AI-Extracting / Error rows. */
  parsedName?: string;
  parsedEmail?: string;
  parsedPhone?: string;
  /** Skills detected from the file. Length is shown in the table. */
  skills: CVParsedSkill[];
  /** When status === "duplicate", the candidate id already on file. */
  duplicateOfCandidateId?: string;
  /** When status === "error", a short reason. */
  errorReason?: string;
}

export const CV_STATUS_LABEL: Record<CVStatus, string> = {
  extracting: "AI Extracting...",
  done: "Done",
  "needs-review": "Needs Review",
  duplicate: "Duplicate",
  error: "Error",
};

/** Treat a CV as "new" (highlight in the Name column) when it was added in
 *  the last 24 hours. */
export function isCVNew(cv: CVRecord, nowMs = Date.now()): boolean {
  const t = Date.parse(cv.addedAtISO);
  if (Number.isNaN(t)) return false;
  return nowMs - t < 24 * 60 * 60 * 1000;
}
