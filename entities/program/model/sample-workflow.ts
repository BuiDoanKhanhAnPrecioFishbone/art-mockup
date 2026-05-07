import type { ProgramWorkflow } from "./workflow";

/**
 * The canonical demo workflow used across the mockup. Every seeded program
 * is stamped with this so the Pipeline / Emails / CV-tracking tabs render
 * stages out of the box, and the candidate fixtures (which reference
 * `smp-stage-*` / `smp-step-*` ids) line up with whatever program you
 * open. Identical in shape to the workflow inside `getSampleDraft()`.
 */
export function sampleWorkflow(): ProgramWorkflow {
  return {
    flowTemplateId: "flow-engineering-standard",
    stages: [
      {
        id: "smp-stage-inbox",
        name: "Inbox",
        steps: [
          {
            id: "smp-step-cv",
            name: "CV Review",
            type: "default",
            timelineDays: 2,
            instruction:
              "Recruiter reviews the resume against the role profile.",
            reviewerId: "u-amelia",
            emailTemplateId: "et-application-received",
          },
        ],
      },
      {
        id: "smp-stage-screen",
        name: "Screening",
        steps: [
          {
            id: "smp-step-call",
            name: "Screening Call",
            type: "default",
            timelineDays: 3,
            instruction:
              "30-min phone screen — culture fit + role expectations.",
            reviewerId: "u-amelia",
            emailTemplateId: "et-screening-invite",
          },
          {
            id: "smp-step-test",
            name: "Coding / Marketing Test",
            type: "test",
            timelineDays: 5,
            instruction: "Take-home assessment.",
            emailTemplateId: "et-test-invite",
            testIds: ["test-coding-basics", "test-marketing-quiz"],
          },
        ],
      },
      {
        id: "smp-stage-onsite",
        name: "Onsite",
        steps: [
          {
            id: "smp-step-portfolio",
            name: "Portfolio / Tech Review",
            type: "interview",
            timelineDays: 5,
            instruction: "Walk through 2 past projects end-to-end.",
            reviewerId: "u-sofia",
            emailTemplateId: "et-interview-invite",
            scorecard: {
              templateId: "scorecard-marketing-portfolio",
              criteria: [
                { id: "smp-c-creativity", name: "Creativity", weight: 5, templateId: "c-creativity" },
                { id: "smp-c-brand", name: "Brand sense", weight: 4, templateId: "c-brand" },
                { id: "smp-c-results", name: "Results delivered", weight: 4, templateId: "c-results" },
              ],
            },
          },
          {
            id: "smp-step-hm",
            name: "Hiring Manager",
            type: "interview",
            timelineDays: 3,
            instruction: "Final culture-fit and compensation alignment.",
            reviewerId: "u-jonas",
            emailTemplateId: "et-interview-invite",
            scorecard: {
              templateId: "scorecard-cultural-fit",
              criteria: [
                { id: "smp-c-values", name: "Alignment with values", weight: 4, templateId: "c-values" },
                { id: "smp-c-collab", name: "Collaboration", weight: 4, templateId: "c-collab" },
                { id: "smp-c-growth", name: "Growth mindset", weight: 3, templateId: "c-growth" },
              ],
            },
          },
        ],
      },
      {
        id: "smp-stage-offer",
        name: "Offer",
        steps: [
          {
            id: "smp-step-ref",
            name: "Reference Check",
            type: "default",
            timelineDays: 5,
            instruction: "Two professional references.",
            reviewerId: "u-amelia",
          },
          {
            id: "smp-step-offer",
            name: "Offer Sent",
            type: "default",
            timelineDays: 2,
            instruction: "Send offer letter and onboarding pack.",
            reviewerId: "u-amelia",
            emailTemplateId: "et-offer",
          },
        ],
      },
      {
        // Terminal stage — Hired / Rejected. Pipeline shows it distinct
        // from the in-flight stages.
        id: "smp-stage-final",
        name: "Final Decisions",
        steps: [
          { id: "smp-step-hired", name: "Hired", type: "default", timelineDays: 0, instruction: "" },
          { id: "smp-step-rejected", name: "Rejected", type: "default", timelineDays: 0, instruction: "" },
        ],
      },
    ],
  };
}
