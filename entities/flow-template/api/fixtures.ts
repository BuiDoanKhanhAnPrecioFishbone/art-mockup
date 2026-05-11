import type { FlowTemplate, FlowTemplateStatus } from "../model/types";

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

const SEED: FlowTemplate[] = [
  {
    id: "flow-default-tech",
    name: "Default Tech Flow (Full-time)",
    description:
      "Platform-default tech hiring pipeline. Shipped with the system; cannot be deleted, but you can clone it as a starting point for custom variants.",
    status: "Default",
    tags: ["Tech", "Engineering", "Default"],
    createdAtISO: new Date(NOW - 90 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 14 * DAY).toISOString(),
    stages: [
      {
        name: "Inbox",
        steps: [
          {
            name: "CV Review",
            type: "default",
            timelineDays: 2,
            instruction:
              "Recruiter reviews the résumé against the role profile, looking for relevant experience, technical match and red flags. Move strong CVs to Screening within 2 days.",
            reviewerIds: ["u-amelia"],
          },
        ],
      },
      {
        name: "Screening",
        steps: [
          {
            name: "Screening Call",
            type: "default",
            timelineDays: 3,
            instruction:
              "30-min phone or Google Meet. Confirm CV details, current status, salary expectations, notice period and motivation.",
            reviewerIds: ["u-amelia"],
          },
          {
            name: "Coding Test",
            type: "test",
            timelineDays: 5,
            instruction:
              "Send the take-home assessment. Candidate has 5 days; we send a reminder at day 3.",
            testIds: ["test-coding-basics"],
            reviewerIds: ["u-marcus", "u-priya"],
            autoAllocate: true,
          },
        ],
      },
      {
        name: "Onsite",
        steps: [
          {
            name: "Technical Interview",
            type: "interview",
            timelineDays: 5,
            instruction:
              "1-hour live coding + system design walkthrough with two engineers.",
            scorecardTemplateId: "scorecard-tech-interview",
            reviewerIds: ["u-marcus", "u-priya"],
          },
          {
            name: "Hiring Manager",
            type: "interview",
            timelineDays: 3,
            instruction:
              "30-min culture fit + role expectations conversation with the hiring manager.",
            scorecardTemplateId: "scorecard-cultural-fit",
            reviewerIds: ["u-jonas"],
          },
        ],
      },
      {
        name: "Offer",
        steps: [
          {
            name: "Reference Check",
            type: "default",
            timelineDays: 5,
            instruction: "Request and review two professional references.",
            reviewerIds: ["u-amelia"],
          },
          {
            name: "Offer Sent",
            type: "default",
            timelineDays: 2,
            instruction: "Send the offer letter and onboarding pack.",
            emailTemplateId: "et-offer",
            reviewerIds: ["u-amelia"],
          },
        ],
      },
    ],
  },
  {
    id: "flow-engineering-standard",
    name: "Engineering — Standard pipeline",
    description:
      "CV review → screening call → take-home test → onsite interviews → offer. A balanced 5-day-per-stage flow that fits most engineering roles out of the box.",
    status: "Active",
    tags: ["Tech", "Engineering"],
    createdAtISO: new Date(NOW - 30 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 7 * DAY).toISOString(),
    stages: [
      {
        name: "Inbox",
        steps: [
          {
            name: "CV Review",
            type: "default",
            timelineDays: 2,
            instruction:
              "Recruiter reviews the résumé against the role profile, looking for relevant experience, technical match and red flags. Move strong CVs to Screening within 2 days.",
            reviewerIds: ["u-amelia"],
          },
        ],
      },
      {
        name: "Screening",
        steps: [
          {
            name: "Screening Call",
            type: "default",
            timelineDays: 3,
            reviewerIds: ["u-amelia"],
          },
          {
            name: "Coding Test",
            type: "test",
            timelineDays: 5,
            testIds: ["test-coding-basics"],
            reviewerIds: ["u-marcus", "u-priya"],
            autoAllocate: true,
          },
        ],
      },
      {
        name: "Onsite",
        steps: [
          {
            name: "Technical Interview",
            type: "interview",
            timelineDays: 5,
            scorecardTemplateId: "scorecard-tech-interview",
            reviewerIds: ["u-marcus", "u-priya"],
          },
          {
            name: "Hiring Manager",
            type: "interview",
            timelineDays: 3,
            scorecardTemplateId: "scorecard-cultural-fit",
            reviewerIds: ["u-jonas"],
          },
        ],
      },
      {
        name: "Offer",
        steps: [
          {
            name: "Reference Check",
            type: "default",
            timelineDays: 5,
            reviewerIds: ["u-amelia"],
          },
          {
            name: "Offer Sent",
            type: "default",
            timelineDays: 2,
            emailTemplateId: "et-offer",
            reviewerIds: ["u-amelia"],
          },
        ],
      },
    ],
  },
  {
    id: "flow-marketing-intern",
    name: "Marketing — Intern pipeline",
    description: "Lightweight 3-stage pipeline tailored for interns.",
    status: "Active",
    tags: ["Marketing", "Intern"],
    createdAtISO: new Date(NOW - 14 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 3 * DAY).toISOString(),
    stages: [
      {
        name: "Inbox",
        steps: [{ name: "Application Review", type: "default", timelineDays: 2 }],
      },
      {
        name: "Interview",
        steps: [
          {
            name: "Portfolio Review",
            type: "interview",
            timelineDays: 4,
            scorecardTemplateId: "scorecard-cultural-fit",
          },
        ],
      },
      {
        name: "Offer",
        steps: [{ name: "Offer Sent", type: "default", timelineDays: 2 }],
      },
    ],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockFlowTemplatesStore: FlowTemplate[] | undefined;
}

function store(): FlowTemplate[] {
  if (!globalThis.__artMockFlowTemplatesStore) {
    globalThis.__artMockFlowTemplatesStore = [...SEED];
  }
  return globalThis.__artMockFlowTemplatesStore;
}

export function listFlowTemplates(): FlowTemplate[] {
  return [...store()].sort(
    (a, b) => Date.parse(b.updatedAtISO) - Date.parse(a.updatedAtISO)
  );
}

export function getFlowTemplate(id: string): FlowTemplate | undefined {
  return store().find((t) => t.id === id);
}

export function addFlowTemplate(t: FlowTemplate): FlowTemplate {
  store().push(t);
  return t;
}

export function updateFlowTemplate(
  id: string,
  patch: Partial<FlowTemplate>
): FlowTemplate | undefined {
  const all = store();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch, updatedAtISO: new Date().toISOString() };
  return all[idx];
}

export function deleteFlowTemplate(id: string): boolean {
  const all = store();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}

/** Demo helper: create a fresh flow template id. */
export function newFlowId(): string {
  return `flow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Build an empty template object — used by the Create flow. */
export function emptyFlowTemplate(name = "New Flow"): FlowTemplate {
  return {
    id: newFlowId(),
    name,
    description: "",
    status: "Active" as FlowTemplateStatus,
    tags: [],
    createdAtISO: new Date().toISOString(),
    updatedAtISO: new Date().toISOString(),
    stages: [],
  };
}
