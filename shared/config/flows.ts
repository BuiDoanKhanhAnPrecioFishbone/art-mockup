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
    status: "planned",
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
    id: "create-manage-jobs",
    title: "Create & Manage Jobs",
    description:
      "Recruitment program management with card grid, job template library, program detail with skills configuration, and Save as Template workflow.",
    screens: 7,
    status: "ready",
    path: "/flows/create-manage-jobs",
  },
  {
    id: "application-form",
    title: "Application Form (Original Wireframe)",
    description:
      "HR manages a public application form for a job vacancy: set status/duration, copy share links, and build custom screening fields — faithful to the Figma wireframe.",
    screens: 3,
    status: "ready",
    path: "/flows/job-vacancy/application-form",
  },
  {
    id: "user-role-management",
    title: "User & Role Management",
    description:
      "Admin panel for managing system users and access control: user list with status, role assignment, view/edit slide panels, and a full permission matrix editor per role.",
    screens: 6,
    status: "wip",
    path: "/flows/user-role-management",
  },
  {
    id: "application-form-v2",
    title: "Application Form — UX Redesign (V2)",
    description:
      "Improved form builder: step wizard (Configure → Build → Share), persistent live preview panel with mobile/desktop toggle, icon-based field palette, modal field editor, and dedicated Share step with QR code.",
    screens: 5,
    status: "planned",
    path: "/flows/job-vacancy/application-form-v2",
  },
];
