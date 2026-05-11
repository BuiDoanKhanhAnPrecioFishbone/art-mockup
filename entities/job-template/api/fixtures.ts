import type { JobTemplate, SkillTier } from "../model/types";

const SEED: JobTemplate[] = [
  {
    id: "tpl-backend-dev",
    name: "Backend Developer (Standard)",
    position: "Backend Developer",
    level: "Fresher",
    status: "Published",
    description:
      "We are hiring a backend developer to design, build and maintain server-side APIs and services. The role works closely with frontend, infra and product teams to ship reliable, performant features.",
    skills: [
      { id: "node", name: "Node.js", tier: "must-have" },
      { id: "ts", name: "TypeScript", tier: "must-have" },
      { id: "sql", name: "SQL", tier: "must-have" },
      { id: "rest", name: "REST APIs", tier: "nice-to-have" },
      { id: "git", name: "Git", tier: "nice-to-have" },
    ],
    labels: ["Engineering", "Backend"],
  },
  {
    id: "tpl-fullstack-dev",
    name: "Fullstack Developer (Standard)",
    position: "Fullstack Developer",
    level: "Fresher",
    status: "Published",
    description:
      "Join our product squad to build and own features end-to-end across the React frontend and Node backend. You'll work on UX, API design, and shipping iteratively.",
    skills: [
      { id: "react", name: "React", tier: "must-have" },
      { id: "ts", name: "TypeScript", tier: "must-have" },
      { id: "node", name: "Node.js", tier: "must-have" },
      { id: "sql", name: "SQL", tier: "nice-to-have" },
      { id: "tailwind", name: "Tailwind CSS", tier: "bonus" },
    ],
    labels: ["Engineering", "Fullstack"],
  },
  {
    id: "tpl-marketing-intern",
    name: "Marketing Intern (Standard)",
    position: "Marketing",
    level: "Intern",
    status: "Published",
    description:
      "Support the marketing team with content production, social campaigns, event coordination and reporting. A great way to learn modern B2B marketing hands-on.",
    skills: [
      { id: "writing", name: "Copywriting", tier: "must-have" },
      { id: "social", name: "Social Media", tier: "must-have" },
      { id: "design", name: "Basic Design", tier: "nice-to-have" },
      { id: "analytics", name: "Analytics", tier: "bonus" },
    ],
    labels: ["Marketing", "Intern"],
  },
  {
    id: "tpl-software-engineer",
    name: "Software Engineer (Standard)",
    position: "Software Engineer",
    level: "Fresher",
    // Demo: a Draft template never appears in the Program Info job picker.
    status: "Draft",
    description:
      "General-purpose software engineering role on the platform team — write production code, review peers, contribute to architecture decisions.",
    skills: [
      { id: "ts", name: "TypeScript", tier: "must-have" },
      { id: "system-design", name: "System Design", tier: "nice-to-have" },
      { id: "testing", name: "Testing", tier: "bonus" },
    ],
    labels: ["Engineering"],
  },
  {
    id: "tpl-qa-archived",
    name: "QA Engineer (Legacy 2024)",
    position: "QA Engineer",
    level: "Mid",
    // Demo: an Archived template — readable from existing programs but
    // hidden from new ones.
    status: "Archived",
    description:
      "Legacy template kept for reference — superseded by Software Engineer (Standard).",
    skills: [
      { id: "selenium", name: "Selenium", tier: "must-have" },
      { id: "cypress", name: "Cypress", tier: "nice-to-have" },
    ],
    labels: ["Engineering", "QA"],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockJobTemplatesStore: JobTemplate[] | undefined;
}

function store(): JobTemplate[] {
  if (!globalThis.__artMockJobTemplatesStore) {
    globalThis.__artMockJobTemplatesStore = [...SEED];
  }
  return globalThis.__artMockJobTemplatesStore;
}

export function listJobTemplates(): JobTemplate[] {
  return [...store()];
}

/** Variant used by the Program Info job picker. Only Published
 *  templates are eligible per Doc 03 §3.1. */
export function listPublishedJobTemplates(): JobTemplate[] {
  return store().filter((t) => t.status === "Published");
}

export function getJobTemplate(id: string): JobTemplate | undefined {
  return store().find((t) => t.id === id);
}

/** Validate that no skill name appears in two tiers. Returns the
 *  duplicate name if found, or null when the template is clean.
 *  Doc 08 §8.3 — server returns 409 when violated. */
export function findSkillTierConflict(skills: JobTemplate["skills"]): {
  name: string;
  tiers: SkillTier[];
} | null {
  const byName = new Map<string, Set<SkillTier>>();
  for (const s of skills) {
    const tier = s.tier ?? "must-have";
    const key = s.name.toLowerCase();
    const set = byName.get(key) ?? new Set<SkillTier>();
    set.add(tier);
    byName.set(key, set);
  }
  for (const [, tiers] of byName) {
    if (tiers.size > 1) {
      const original = skills.find(
        (s) => s.name.toLowerCase() === [...byName.keys()].find((k) => byName.get(k) === tiers)
      );
      return {
        name: original?.name ?? "",
        tiers: [...tiers],
      };
    }
  }
  return null;
}

export function resetJobTemplatesStore(): JobTemplate[] {
  globalThis.__artMockJobTemplatesStore = [...SEED];
  return globalThis.__artMockJobTemplatesStore;
}
