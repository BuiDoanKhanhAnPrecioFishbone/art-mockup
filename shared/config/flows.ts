export interface FlowMeta {
  id: string;
  title: string;
  description: string;
  screens: number;
  status: "ready" | "wip" | "planned";
  path: string;
}

/** Register new wireframe flows here. */
export const FLOWS: FlowMeta[] = [
  {
    id: "email-management",
    title: "Email Template & Setting Management",
    description:
      "Email account integration, template library, AI magic draft, and delivery log reporting.",
    screens: 10,
    status: "ready",
    path: "/flows/email-management",
  },
  {
    id: "recruitment-flow-management",
    title: "Recruitment Flow Management",
    description:
      "Build and manage multi-stage recruitment pipelines with email automation per stage.",
    screens: 6,
    status: "ready",
    path: "/flows/recruitment-flow-management",
  },
  {
    id: "skill-library",
    title: "Skill Library Management",
    description:
      "Master keyword/skill library with CRUD operations, pending approval workflows including merge, approve, and reject actions.",
    screens: 5,
    status: "ready",
    path: "/flows/skill-library",
  },
  {
    id: "job-vacancy",
    title: "Job Vacancy — Skills & Labels",
    description:
      "Job vacancy creation with AI-powered skill extraction, library browsing, drag-and-drop skill tags, and inline skill creation.",
    screens: 4,
    status: "ready",
    path: "/flows/job-vacancy/new",
  },
  {
    id: "group-3489",
    title: "Bulk Email Send",
    description:
      "Select candidates from the jobs pipeline and compose a bulk email with template selection, email settings, tracking options, and per-recipient issue detection before sending.",
    screens: 3,
    status: "ready",
    path: "/flows/group-3489",
  },
  {
    id: "group-3033",
    title: "Template Variable Filler",
    description:
      "Fill in highlighted template variables inline before sending an email — unfilled variables show as yellow tags and automatically turn green once a valid value is entered.",
    screens: 2,
    status: "ready",
    path: "/flows/group-3033",
  },
];
