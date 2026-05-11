import type { StageTemplate } from "../model/types";

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

const SEED: StageTemplate[] = [
  {
    id: "stage-tpl-screening",
    name: "Screening",
    description:
      "Standard recruiter-led screening — phone call + take-home test.",
    tags: ["Recruiter", "Standard"],
    createdAtISO: new Date(NOW - 60 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 6 * DAY).toISOString(),
    steps: [
      {
        fromStepTemplateId: "step-screening-call",
        name: "Screening Call",
        type: "default",
        timelineDays: 3,
        instruction:
          "30-min phone screen — culture fit + role expectations + salary alignment.",
        emailTemplateId: "et-screening-invite",
      },
      {
        fromStepTemplateId: "step-coding-test",
        name: "Coding Test",
        type: "test",
        timelineDays: 5,
        instruction:
          "Take-home assessment via the platform's test runner. 5-day window with a day-3 reminder.",
        emailTemplateId: "et-test-invite",
        testIds: ["test-coding-basics"],
      },
    ],
  },
  {
    id: "stage-tpl-onsite-tech",
    name: "Onsite — Technical",
    description: "Two-interview onsite loop for engineering hires.",
    tags: ["Tech", "Onsite", "Interview"],
    createdAtISO: new Date(NOW - 45 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 4 * DAY).toISOString(),
    steps: [
      {
        fromStepTemplateId: "step-onsite-tech-interview",
        name: "Technical Interview",
        type: "interview",
        timelineDays: 5,
        instruction:
          "1-hour live coding + system design walkthrough with two engineers.",
        scorecardTemplateId: "scorecard-tech-interview",
      },
      {
        fromStepTemplateId: "step-hiring-manager",
        name: "Hiring Manager Interview",
        type: "interview",
        timelineDays: 3,
        instruction: "30-min culture fit + final compensation alignment.",
        scorecardTemplateId: "scorecard-cultural-fit",
      },
    ],
  },
  {
    id: "stage-tpl-offer",
    name: "Offer",
    description: "Reference check + offer pack.",
    tags: ["Offer"],
    createdAtISO: new Date(NOW - 30 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 8 * DAY).toISOString(),
    steps: [
      {
        fromStepTemplateId: "step-reference-check",
        name: "Reference Check",
        type: "default",
        timelineDays: 5,
        instruction: "Two professional references.",
      },
      {
        fromStepTemplateId: "step-offer-sent",
        name: "Offer Sent",
        type: "default",
        timelineDays: 2,
        instruction: "Send offer letter and onboarding pack.",
        emailTemplateId: "et-offer",
      },
    ],
  },
  {
    id: "stage-tpl-marketing-portfolio",
    name: "Portfolio Review",
    description: "Single-stage portfolio walkthrough for design / marketing.",
    tags: ["Marketing", "Design"],
    createdAtISO: new Date(NOW - 21 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 5 * DAY).toISOString(),
    steps: [
      {
        fromStepTemplateId: "step-portfolio-review",
        name: "Portfolio Review",
        type: "interview",
        timelineDays: 4,
        instruction: "Walk through 2 past projects end-to-end.",
        scorecardTemplateId: "scorecard-marketing-portfolio",
      },
    ],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockStageTemplatesStore: StageTemplate[] | undefined;
}

function store(): StageTemplate[] {
  if (!globalThis.__artMockStageTemplatesStore) {
    globalThis.__artMockStageTemplatesStore = [...SEED];
  }
  return globalThis.__artMockStageTemplatesStore;
}

export function listStageTemplates(): StageTemplate[] {
  return [...store()].sort(
    (a, b) => Date.parse(b.updatedAtISO) - Date.parse(a.updatedAtISO)
  );
}

export function getStageTemplate(id: string): StageTemplate | undefined {
  return store().find((t) => t.id === id);
}

export function addStageTemplate(t: StageTemplate): StageTemplate {
  store().push(t);
  return t;
}

export function updateStageTemplate(
  id: string,
  patch: Partial<StageTemplate>
): StageTemplate | undefined {
  const all = store();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch, updatedAtISO: new Date().toISOString() };
  return all[idx];
}

export function deleteStageTemplate(id: string): boolean {
  const all = store();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}
