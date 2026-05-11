import type { ProgramLevel } from "@/entities/program";

export type JobTemplateStatus = "Draft" | "Published" | "Archived";

export const JOB_TEMPLATE_STATUSES: JobTemplateStatus[] = [
  "Draft",
  "Published",
  "Archived",
];

export type SkillTier = "must-have" | "nice-to-have" | "bonus";
export const SKILL_TIERS: SkillTier[] = [
  "must-have",
  "nice-to-have",
  "bonus",
];
export const SKILL_TIER_LABEL: Record<SkillTier, string> = {
  "must-have": "Must-have",
  "nice-to-have": "Nice-to-have",
  bonus: "Bonus",
};

export interface Skill {
  id: string;
  name: string;
  /** Doc 08 §8.3: a skill belongs to exactly one tier inside a job
   *  template. Default `must-have` for skills that pre-date this
   *  field. */
  tier?: SkillTier;
}

/**
 * Doc 08 §8.3: the standard configuration for a role.
 *  - `status`: only `Published` job templates appear in the Program
 *    Info job picker; `Archived` is hidden from new programs but kept
 *    referenceable for historical programs.
 *  - `skills`: each carries a `tier`. The same skill name cannot appear
 *    in two tiers within the same template (server returns 409).
 */
export interface JobTemplate {
  id: string;
  name: string;
  position: string;
  level: ProgramLevel;
  description: string;
  status: JobTemplateStatus;
  skills: Skill[];
  labels: string[];
}
