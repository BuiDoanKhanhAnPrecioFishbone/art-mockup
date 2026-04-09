import type { RecruitmentFlow } from "@/shared/types/recruitment-flow";

export const recruitmentFlows: RecruitmentFlow[] = [
  {
    id: "flow-1",
    name: "Default Tech Flow (Full-time)",
    description:
      "Standard multi-stage technical recruitment process for full-time engineering roles.",
    status: "active",
    stages: [
      {
        id: "stage-1",
        name: "CV Review",
        description: "Initial screening of submitted resumes and cover letters.",
        emailTemplateId: "tpl-3",
        emailTemplateName: "Application Received",
        emailSubject: "We received your application — {JobTitle}",
        order: 0,
      },
      {
        id: "stage-2",
        name: "Preliminary Test",
        description:
          "Online aptitude or technical screening test sent to shortlisted candidates.",
        order: 1,
      },
      {
        id: "stage-3",
        name: "On-site Testing",
        description:
          "In-person or video technical interview with the engineering team.",
        emailTemplateId: "tpl-1",
        emailTemplateName: "Interview Invitation",
        emailSubject: "Interview Invitation — {JobTitle} at {CompanyName}",
        order: 2,
      },
      {
        id: "stage-4",
        name: "Final Decisions",
        description: "Leadership panel review and final candidate selection.",
        order: 3,
      },
      {
        id: "stage-hired",
        name: "Hired",
        order: 4,
        isOutcome: true,
        emailTemplateId: "tpl-4",
        emailTemplateName: "Offer Letter Notification",
        emailSubject: "Offer Letter — {JobTitle} at {CompanyName}",
      },
      {
        id: "stage-rejected",
        name: "Rejected",
        order: 5,
        isOutcome: true,
      },
    ],
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-03-15T10:30:00Z",
  },
  {
    id: "flow-2",
    name: "Junior Designer Flow",
    description:
      "Streamlined hiring pipeline for junior UI/UX designer positions.",
    status: "draft",
    stages: [
      {
        id: "stage-d1",
        name: "Portfolio Review",
        description:
          "Review of the candidate's design portfolio and case studies.",
        emailTemplateId: "tpl-3",
        emailTemplateName: "Application Received",
        emailSubject: "We received your application — {JobTitle}",
        order: 0,
      },
      {
        id: "stage-d2",
        name: "Design Challenge",
        description: "Take-home design task to assess practical UI/UX skills.",
        order: 1,
      },
      {
        id: "stage-d3",
        name: "Culture Fit",
        description:
          "Team meeting to evaluate communication and cultural alignment.",
        emailTemplateId: "tpl-1",
        emailTemplateName: "Interview Invitation",
        emailSubject: "Interview Invitation — {JobTitle} at {CompanyName}",
        order: 2,
      },
      {
        id: "stage-d-hired",
        name: "Hired",
        order: 3,
        isOutcome: true,
        emailTemplateId: "tpl-2",
        emailTemplateName: "Welcome Onboarding",
        emailSubject: "Welcome to {CompanyName}, {CandidateName}!",
      },
      {
        id: "stage-d-rejected",
        name: "Rejected",
        order: 4,
        isOutcome: true,
      },
    ],
    createdAt: "2025-02-20T09:00:00Z",
    updatedAt: "2025-02-20T09:00:00Z",
  },
];
