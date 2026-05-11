import type { ScorecardTemplate } from "../model/types";

const NOW = "2026-05-08T00:00:00Z";

const SEED: ScorecardTemplate[] = [
  {
    id: "scorecard-hr-phone",
    name: "HR Phone Screening",
    description: "Motivation, Communication, Salary & Notice Period Match.",
    updatedAtISO: NOW,
    criteria: [
      {
        id: "ct-communication",
        name: "Communication",
        weight: 4,
        categories: ["Soft"],
      },
      {
        id: "ct-values-alignment",
        name: "Motivation & Alignment with Values",
        weight: 4,
        categories: ["Behavioral"],
      },
      {
        id: "ct-customer-focus",
        name: "Salary & Notice Period Match",
        weight: 3,
        categories: ["Behavioral"],
      },
    ],
  },
  {
    id: "scorecard-culture-fit",
    name: "Culture Fit & Behavioral",
    description:
      "Core Values Alignment, Teamwork & Collaboration, Agility & Learning.",
    criteria: [
      {
        id: "ct-values-alignment",
        name: "Core Values Alignment",
        weight: 4,
        categories: ["Behavioral"],
      },
      {
        id: "ct-collaboration",
        name: "Teamwork & Collaboration",
        weight: 4,
        categories: ["Soft"],
      },
      {
        id: "ct-growth-mindset",
        name: "Agility & Learning",
        weight: 3,
        categories: ["Behavioral"],
      },
      {
        id: "ct-ownership",
        name: "Ownership",
        weight: 4,
        categories: ["Behavioral"],
      },
    ],
  },
  {
    id: "scorecard-tech-interview",
    name: "Technical Interview",
    description:
      "Problem Solving, System Architecture, Clean Code, Framework knowledge.",
    criteria: [
      {
        id: "ct-problem-solving",
        name: "Problem Solving",
        weight: 5,
        description: "Decomposes problems and reasons about edge cases.",
        categories: ["Cognitive"],
      },
      {
        id: "ct-system-architecture",
        name: "System Architecture",
        weight: 4,
        categories: ["Tech"],
      },
      {
        id: "ct-code-quality",
        name: "Clean Code",
        weight: 4,
        categories: ["Tech"],
      },
      {
        id: "ct-react-ecosystem",
        name: "Framework Mastery",
        weight: 3,
        categories: ["Tech", "Frontend"],
      },
    ],
  },
  {
    id: "scorecard-case-study",
    name: "Case-study / Assignment",
    description:
      "Solution structure, depth of analysis, presentation, and clarity.",
    criteria: [
      {
        id: "ct-analytical-thinking",
        name: "Analytical Thinking",
        weight: 4,
        categories: ["Cognitive"],
      },
      {
        id: "ct-presentation",
        name: "Presentation Skills",
        weight: 3,
        categories: ["Soft"],
      },
      {
        id: "ct-creativity",
        name: "Creativity",
        weight: 4,
        categories: ["Cognitive", "Product"],
      },
    ],
  },
  {
    id: "scorecard-leadership",
    name: "Leadership & Management",
    description: "Strategic Thinking, Conflict Resolution & Decision Making.",
    criteria: [
      {
        id: "ct-leadership",
        name: "Strategic Thinking",
        weight: 5,
        categories: ["Soft", "Behavioral"],
      },
      {
        id: "ct-leadership",
        name: "Conflict Resolution & Decision Making",
        weight: 4,
        categories: ["Soft"],
      },
    ],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockScorecardTemplatesStore: ScorecardTemplate[] | undefined;
}

function store(): ScorecardTemplate[] {
  if (!globalThis.__artMockScorecardTemplatesStore) {
    globalThis.__artMockScorecardTemplatesStore = [...SEED];
  }
  return globalThis.__artMockScorecardTemplatesStore;
}

export function listScorecardTemplates(): ScorecardTemplate[] {
  return [...store()];
}

export function getScorecardTemplate(id: string): ScorecardTemplate | undefined {
  return store().find((t) => t.id === id);
}

export function createScorecardTemplate(
  input: Omit<ScorecardTemplate, "id" | "updatedAtISO"> & { id?: string }
): ScorecardTemplate {
  const id =
    input.id ??
    `scorecard-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const fresh: ScorecardTemplate = {
    ...input,
    id,
    updatedAtISO: new Date().toISOString(),
  };
  store().unshift(fresh);
  return fresh;
}

export function updateScorecardTemplate(
  id: string,
  patch: Partial<ScorecardTemplate>
): ScorecardTemplate | undefined {
  const all = store();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch, updatedAtISO: new Date().toISOString() };
  return all[idx];
}

export function deleteScorecardTemplate(id: string): boolean {
  const all = store();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}

export function resetScorecardTemplatesStore(): ScorecardTemplate[] {
  globalThis.__artMockScorecardTemplatesStore = [...SEED];
  return globalThis.__artMockScorecardTemplatesStore;
}
