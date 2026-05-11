import type { StepTemplate } from "../model/types";

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

const SEED: StepTemplate[] = [
  {
    id: "step-cv-review",
    name: "CV Review",
    type: "default",
    timelineDays: 2,
    instruction:
      "Recruiter reviews the résumé against the role profile. Move strong CVs to Screening within 2 days.",
    tags: ["Screening", "Recruiter"],
    createdAtISO: new Date(NOW - 60 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 7 * DAY).toISOString(),
  },
  {
    id: "step-screening-call",
    name: "Screening Call",
    type: "default",
    timelineDays: 3,
    instruction:
      "30-min phone screen — culture fit + role expectations + salary alignment.",
    emailTemplateId: "et-screening-invite",
    tags: ["Screening", "Recruiter"],
    createdAtISO: new Date(NOW - 60 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 5 * DAY).toISOString(),
  },
  {
    id: "step-coding-test",
    name: "Coding Test",
    type: "test",
    timelineDays: 5,
    instruction:
      "Take-home assessment via the platform's test runner. 5-day window with a day-3 reminder.",
    emailTemplateId: "et-test-invite",
    testIds: ["test-coding-basics"],
    tags: ["Tech", "Test"],
    createdAtISO: new Date(NOW - 45 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 3 * DAY).toISOString(),
  },
  {
    id: "step-onsite-tech-interview",
    name: "Technical Interview",
    type: "interview",
    timelineDays: 5,
    instruction:
      "1-hour live coding + system design walkthrough. Two reviewers — auto-allocate disabled.",
    scorecardTemplateId: "scorecard-tech-interview",
    tags: ["Tech", "Interview"],
    createdAtISO: new Date(NOW - 30 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 2 * DAY).toISOString(),
  },
  {
    id: "step-hiring-manager",
    name: "Hiring Manager Interview",
    type: "interview",
    timelineDays: 3,
    instruction: "30-min culture fit + final compensation alignment.",
    scorecardTemplateId: "scorecard-cultural-fit",
    tags: ["Culture", "Interview"],
    createdAtISO: new Date(NOW - 30 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 1 * DAY).toISOString(),
  },
  {
    id: "step-portfolio-review",
    name: "Portfolio Review",
    type: "interview",
    timelineDays: 4,
    instruction:
      "Walk through 2 past projects end-to-end. Designer / Marketing roles.",
    scorecardTemplateId: "scorecard-marketing-portfolio",
    tags: ["Marketing", "Design", "Interview"],
    createdAtISO: new Date(NOW - 21 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 6 * DAY).toISOString(),
  },
  {
    id: "step-reference-check",
    name: "Reference Check",
    type: "default",
    timelineDays: 5,
    instruction: "Two professional references.",
    tags: ["Recruiter"],
    createdAtISO: new Date(NOW - 60 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 12 * DAY).toISOString(),
  },
  {
    id: "step-offer-sent",
    name: "Offer Sent",
    type: "default",
    timelineDays: 2,
    instruction: "Send offer letter and onboarding pack.",
    emailTemplateId: "et-offer",
    tags: ["Offer"],
    createdAtISO: new Date(NOW - 90 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 14 * DAY).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockStepTemplatesStore: StepTemplate[] | undefined;
}

function store(): StepTemplate[] {
  if (!globalThis.__artMockStepTemplatesStore) {
    globalThis.__artMockStepTemplatesStore = [...SEED];
  }
  return globalThis.__artMockStepTemplatesStore;
}

export function listStepTemplates(): StepTemplate[] {
  return [...store()].sort(
    (a, b) => Date.parse(b.updatedAtISO) - Date.parse(a.updatedAtISO)
  );
}

export function getStepTemplate(id: string): StepTemplate | undefined {
  return store().find((t) => t.id === id);
}

export function addStepTemplate(t: StepTemplate): StepTemplate {
  store().push(t);
  return t;
}

export function updateStepTemplate(
  id: string,
  patch: Partial<StepTemplate>
): StepTemplate | undefined {
  const all = store();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch, updatedAtISO: new Date().toISOString() };
  return all[idx];
}

export function deleteStepTemplate(id: string): boolean {
  const all = store();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}
