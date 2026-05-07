import type { CandidateProfile } from "./profile";
import type { PublicFormSettings } from "./public-form";
import type { ProgramWorkflow } from "./workflow";
import type { CategorizationLabel, SkillTag } from "@/shared/types/skill";

export type ProgramStatus = "active" | "closed" | "draft";

export type ProgramLevel = "Intern" | "Fresher" | "Junior" | "Mid" | "Senior";

/** A skill attached to a program — uses the shared SkillTag shape so the
 *  same widget (SkillsLabelsSection) renders skills here and on the legacy
 *  job-vacancy page. */
export type ProgramSkill = SkillTag;

/** A categorization label attached to a program. Order is significant. */
export type ProgramLabel = CategorizationLabel;

export interface Program {
  id: string;
  title: string;
  position: string;
  level: ProgramLevel;
  startDate: string;
  endDate: string;
  headcount: number;
  applicantCount: number;
  /** Derived on the API side from the candidates store — number of
   *  applicants added within `NEW_APPLICANT_WINDOW_DAYS`. Surfaced as a
   *  badge on the program card. Optional on write paths. */
  newApplicantCount?: number;
  status: ProgramStatus;
  createdAt: string;
  /** Free-text role description, usually pre-filled from a job template. */
  description?: string;
  /** Required skills, usually pre-filled from a job template (editable).
   *  Stored as SkillTag with priority (must-have / nice-to-have / bonus). */
  skills?: ProgramSkill[];
  /** Categorization labels (e.g. "Frontend Development"). Order matters. */
  labels?: ProgramLabel[];
  /** Cloud-storage URL where collected CVs land. */
  folderLink?: string;
  /** ID of the job template this program was created from, if any. */
  jobTemplateId?: string;
  /** Advanced settings, optional. */
  department?: string;
  location?: string;
  employmentType?: string;
  cvTemplate?: string;
  /** Per-program candidate profile config — what data is collected per
   *  applicant. Falls back to defaultCandidateProfile() when absent. */
  candidateProfile?: CandidateProfile;
  /** Public application-form settings. Falls back to
   *  defaultPublicFormSettings() when absent. */
  publicForm?: PublicFormSettings;
  /** Recruitment workflow — stages and steps. Falls back to
   *  defaultWorkflow() when absent. */
  workflow?: ProgramWorkflow;
}

export const PROGRAM_STATUS_LABEL: Record<ProgramStatus, string> = {
  active: "Active",
  closed: "Closed",
  draft: "Draft",
};
