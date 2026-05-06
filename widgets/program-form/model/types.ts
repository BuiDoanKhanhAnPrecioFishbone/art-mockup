import type {
  CandidateProfile,
  Program,
  ProgramLabel,
  ProgramLevel,
  ProgramSkill,
  ProgramStatus,
  ProgramWorkflow,
  PublicFormSettings,
} from "@/entities/program";
import {
  defaultCandidateProfile,
  defaultPublicFormSettings,
  defaultWorkflow,
} from "@/entities/program";

/**
 * In-progress program form state. All fields optional so the user can save a
 * partial draft. On "Save & Publish" we validate the required fields and bump
 * status to active.
 */
export interface ProgramDraft {
  title: string;
  status: ProgramStatus;
  headcount: number;
  startDate: string;
  endDate: string;
  folderLink: string;
  jobTemplateId?: string;
  position: string;
  level: ProgramLevel;
  description: string;
  skills: ProgramSkill[];
  labels: ProgramLabel[];
  /** Advanced settings — collapsed by default. */
  department: string;
  location: string;
  employmentType: string;
  cvTemplate: string;
  candidateProfile: CandidateProfile;
  publicForm: PublicFormSettings;
  workflow: ProgramWorkflow;
}

export const DEFAULT_DRAFT: ProgramDraft = {
  title: "",
  status: "draft",
  headcount: 1,
  startDate: "",
  endDate: "",
  folderLink: "",
  position: "",
  level: "Fresher",
  description: "",
  skills: [],
  // Default categorization labels — match the wireframe's three priority
  // labels. Users can rename, reorder, or delete them per program.
  labels: [
    { id: "lbl-priority-high", name: "High-priority", order: 1 },
    { id: "lbl-priority-medium", name: "Medium-priority", order: 2 },
    { id: "lbl-priority-low", name: "Low-priority", order: 3 },
  ],
  department: "",
  location: "",
  employmentType: "",
  cvTemplate: "",
  candidateProfile: defaultCandidateProfile(),
  publicForm: defaultPublicFormSettings(),
  workflow: defaultWorkflow(),
};

/**
 * A full, demo-ready draft used by the "Filled data" toggle in the program
 * form header. The shape is identical to the real draft — just populated
 * with realistic sample values so customers can see what the form looks
 * like once a recruiter has filled it in.
 */
export function getSampleDraft(): ProgramDraft {
  return {
    title: "Q1 Marketing Hiring — Sample",
    status: "active",
    headcount: 3,
    startDate: "2026-04-01",
    endDate: "2026-05-15",
    folderLink: "https://company.sharepoint.com/sites/HR/Q1MarketingHiring",
    jobTemplateId: "tpl-marketing-intern",
    position: "Marketing Manager",
    level: "Mid",
    description:
      "We're hiring a Marketing Manager to lead end-to-end campaigns across digital, content and events. You'll partner with sales and product to shape positioning and grow our pipeline.",
    skills: [
      {
        skillId: "tag-content",
        name: "Content strategy",
        category: "Techniques",
        source: "library",
        priority: "must-have",
        order: 0,
      },
      {
        skillId: "tag-seo",
        name: "SEO / SEM",
        category: "Tools",
        source: "library",
        priority: "must-have",
        order: 1,
      },
      {
        skillId: "tag-hubspot",
        name: "HubSpot",
        category: "Tools",
        source: "library",
        priority: "nice-to-have",
        order: 2,
      },
      {
        skillId: "tag-analytics",
        name: "Analytics",
        category: "Techniques",
        source: "library",
        priority: "nice-to-have",
        order: 3,
      },
      {
        skillId: "tag-design-sense",
        name: "Design sense",
        category: "Soft Skills",
        source: "library",
        priority: "bonus",
        order: 4,
      },
    ],
    labels: [
      { id: "lbl-priority-high", name: "High-priority", order: 1 },
      { id: "lbl-priority-medium", name: "Medium-priority", order: 2 },
      { id: "lbl-priority-low", name: "Low-priority", order: 3 },
    ],
    department: "Marketing",
    location: "hybrid",
    employmentType: "full-time",
    cvTemplate: "Standard CV v2",
    candidateProfile: {
      sections: [
        {
          id: "general",
          name: "General Information",
          kind: "general",
          fields: [
            { id: "full-name", label: "Full Name", type: "text", required: true, system: true },
            { id: "email", label: "Email Address", type: "email", required: true, system: true },
            {
              id: "resume",
              label: "Resume / CV",
              type: "file",
              required: true,
              system: true,
              allowedFileTypes: ["pdf", "docx"],
              maxFiles: 1,
              maxFileSizeMB: 10,
            },
            { id: "smp-phone", label: "Phone Number", type: "phone", required: false },
            { id: "smp-source", label: "Source", type: "radio", required: false, options: ["LinkedIn", "ITViec", "Facebook"] },
            { id: "smp-dob", label: "Date of Birth", type: "date", required: false },
          ],
          layout: [
            ["full-name", "email"],
            ["resume"],
            ["smp-source", "smp-phone", "smp-dob"],
          ],
        },
        { id: "skills", name: "Skills", kind: "skills", fields: [] },
        {
          id: "smp-edu",
          name: "Education",
          kind: "custom",
          repeatable: true,
          fields: [
            { id: "smp-edu-school", label: "School / Institution", type: "text", required: true },
            { id: "smp-edu-degree", label: "Degree / Level", type: "text", required: false },
            { id: "smp-edu-major", label: "Major", type: "text", required: false },
            { id: "smp-edu-duration", label: "Duration", type: "text", required: false },
          ],
          layout: [
            ["smp-edu-school"],
            ["smp-edu-degree", "smp-edu-major"],
            ["smp-edu-duration"],
          ],
        },
        {
          id: "smp-exp",
          name: "Experiences",
          kind: "custom",
          repeatable: true,
          fields: [
            { id: "smp-exp-co", label: "Company", type: "text", required: true },
            { id: "smp-exp-pos", label: "Position", type: "text", required: true },
            { id: "smp-exp-start", label: "Start Date", type: "date", required: false },
            { id: "smp-exp-end", label: "End Date", type: "date", required: false },
            { id: "smp-exp-desc", label: "Description", type: "textarea", required: false },
          ],
          layout: [
            ["smp-exp-co", "smp-exp-pos"],
            ["smp-exp-start", "smp-exp-end"],
            ["smp-exp-desc"],
          ],
        },
      ],
    },
    publicForm: {
      enabled: true,
      startDate: "2026-04-01",
      endDate: "2026-05-15",
      hiddenSectionIds: [],
      hiddenFieldIds: ["smp-dob"],
      slug: "q1-marketing-manager",
    },
    workflow: {
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
              instruction: "Recruiter reviews the resume against the role profile.",
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
              instruction: "30-min phone screen — culture fit + role expectations.",
              reviewerId: "u-amelia",
              emailTemplateId: "et-screening-invite",
            },
            {
              id: "smp-step-test",
              name: "Marketing Quiz",
              type: "test",
              timelineDays: 5,
              instruction: "Take-home marketing fundamentals quiz.",
              emailTemplateId: "et-test-invite",
              testIds: ["test-marketing-quiz"],
            },
          ],
        },
        {
          id: "smp-stage-onsite",
          name: "Onsite",
          steps: [
            {
              id: "smp-step-portfolio",
              name: "Portfolio Review",
              type: "interview",
              timelineDays: 5,
              instruction: "Walk through 2 past campaigns end-to-end.",
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
          // Terminal stage shown distinctly in the canvas (Hired / Rejected).
          id: "smp-stage-final",
          name: "Final Decisions",
          steps: [
            { id: "smp-step-hired", name: "Hired", type: "default", timelineDays: 0, instruction: "" },
            { id: "smp-step-rejected", name: "Rejected", type: "default", timelineDays: 0, instruction: "" },
          ],
        },
      ],
    },
  };
}

export function programToDraft(p: Program): ProgramDraft {
  return {
    title: p.title,
    status: p.status,
    headcount: p.headcount,
    startDate: p.startDate,
    endDate: p.endDate,
    folderLink: p.folderLink ?? "",
    jobTemplateId: p.jobTemplateId,
    position: p.position,
    level: p.level,
    description: p.description ?? "",
    skills: p.skills ?? [],
    labels: p.labels ?? [],
    department: p.department ?? "",
    location: p.location ?? "",
    employmentType: p.employmentType ?? "",
    cvTemplate: p.cvTemplate ?? "",
    candidateProfile: p.candidateProfile ?? defaultCandidateProfile(),
    publicForm: p.publicForm ?? defaultPublicFormSettings(),
    workflow: p.workflow ?? defaultWorkflow(),
  };
}

/** Outer page-level tabs on a program. Only "settings" is implemented in
 *  this build; the others are placeholders shown for existing programs. */
export type ProgramTab = "pipelines" | "emails" | "reports" | "settings";

export const PROGRAM_TABS: { id: ProgramTab; label: string }[] = [
  { id: "pipelines", label: "Pipelines" },
  { id: "emails", label: "Emails" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

/** Inner tabs shown as a vertical rail inside the Settings tab. */
export type SettingsTab =
  | "program-info"
  | "candidate-profile"
  | "public-form"
  | "workflow";

export const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: "program-info", label: "Program Info" },
  { id: "candidate-profile", label: "Candidate Profile" },
  { id: "public-form", label: "Public Form" },
  { id: "workflow", label: "Workflow" },
];

/** Validation: what's required to publish (vs. save as draft, which only needs title). */
export interface ValidationIssue {
  field: keyof ProgramDraft;
  message: string;
}

export function validateForPublish(d: ProgramDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!d.title.trim()) issues.push({ field: "title", message: "Program name is required." });
  if (!d.position.trim()) issues.push({ field: "position", message: "Position is required." });
  if (d.headcount < 1) issues.push({ field: "headcount", message: "Headcount must be at least 1." });
  if (!d.startDate || !d.endDate)
    issues.push({ field: "startDate", message: "Recruitment period is required." });
  return issues;
}

export function validateForDraft(d: ProgramDraft): ValidationIssue[] {
  if (!d.title.trim())
    return [{ field: "title", message: "Program name is required, even for drafts." }];
  return [];
}
