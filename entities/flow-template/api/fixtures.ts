import type { FlowTemplate } from "../model/types";

const templates: FlowTemplate[] = [
  {
    id: "flow-engineering-standard",
    name: "Engineering — Standard pipeline",
    description:
      "CV review → screening call → take-home test → onsite interviews → offer. A balanced 5-day-per-stage flow that fits most engineering roles out of the box.",
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
              "60-min deep-dive on the candidate's strongest area. Use the scorecard to capture signal on problem-solving, code quality and communication.",
            scorecardTemplateId: "scorecard-tech-interview",
            reviewerIds: ["u-marcus", "u-priya"],
            autoAllocate: true,
          },
          {
            name: "Hiring Manager",
            type: "interview",
            timelineDays: 3,
            instruction:
              "Hiring manager checks for team fit, ownership, and how the candidate handles ambiguity. 45-min slot.",
            scorecardTemplateId: "scorecard-cultural-fit",
            reviewerIds: ["u-marcus"],
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
            instruction:
              "Two professional references. Ask about strengths, areas to grow, and rehirability.",
            reviewerIds: ["u-amelia"],
          },
          {
            name: "Offer Sent",
            type: "default",
            timelineDays: 2,
            instruction:
              "Generate the offer letter, send via DocuSign, and book a follow-up call to walk through it.",
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
