import type { FlowTemplate } from "../model/types";

const templates: FlowTemplate[] = [
  {
    id: "flow-engineering-standard",
    name: "Engineering — Standard pipeline",
    description: "CV review → screening call → take-home test → onsite interviews → offer.",
    stages: [
      {
        name: "Inbox",
        steps: [
          { name: "CV Review", type: "default", timelineDays: 2, instruction: "Recruiter reviews the resume against the role profile." },
        ],
      },
      {
        name: "Screening",
        steps: [
          { name: "Screening Call", type: "default", timelineDays: 3 },
          { name: "Coding Test", type: "test", timelineDays: 5, testIds: ["test-coding-basics"] },
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
          },
          {
            name: "Hiring Manager",
            type: "interview",
            timelineDays: 3,
            scorecardTemplateId: "scorecard-cultural-fit",
          },
        ],
      },
      {
        name: "Offer",
        steps: [
          { name: "Reference Check", type: "default", timelineDays: 5 },
          { name: "Offer Sent", type: "default", timelineDays: 2 },
        ],
      },
    ],
  },
  {
    id: "flow-marketing-intern",
    name: "Marketing — Intern pipeline",
    description: "Lightweight 3-stage pipeline tailored for interns.",
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

export function listFlowTemplates(): FlowTemplate[] {
  return templates;
}

export function getFlowTemplate(id: string): FlowTemplate | undefined {
  return templates.find((t) => t.id === id);
}
