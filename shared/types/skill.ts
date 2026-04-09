export type SkillCategory = "Techniques" | "Products" | "Frameworks" | "Tools" | "Soft Skills" | "Uncategorized";

export type SkillPriority = "must-have" | "nice-to-have" | "bonus";

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Techniques",
  "Products",
  "Frameworks",
  "Tools",
  "Soft Skills",
  "Uncategorized",
];

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  synonyms: string[];
  description: string;
  status: "active" | "pending" | "rejected";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface PendingApproval {
  id: string;
  skill: Skill;
  status: "pending" | "approved" | "rejected" | "merged";
  submittedBy: string;
  submittedAt: string;
  rejectionReason?: string;
  mergedIntoSkillId?: string;
}

export interface MergeCandidate {
  id: string;
  name: string;
  similarity: number;
  category: SkillCategory;
  reason: string;
}

export interface SkillTag {
  skillId: string;
  name: string;
  category: SkillCategory;
  source: "manual" | "library" | "ai-extracted" | "duplicate";
  priority: SkillPriority;
  order: number;
}
