export type ProgramStatus = "open" | "draft" | "closed";

export interface Skill {
  id: string;
  name: string;
  category: "must-have" | "nice-to-have" | "bonus";
}

export interface JobProgram {
  id: string;
  name: string;
  jobTitle: string;
  jobLevel: string;
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  headcount: number;
  newApplications?: number;
  department?: string;
  location?: string;
  employmentType?: string;
  cvTemplate?: string;
  description: string;
  programUrl?: string;
  skills: Skill[];
}

export interface JobTemplate {
  id: string;
  jobTitle: string;
  level: string;
  skillsConfigured: number;
  lastUpdated: string;
  description: string;
  skills: Skill[];
}

export const jobPrograms: JobProgram[] = [
  {
    id: "prog-001",
    name: "Q1 Marketing Hiring",
    jobTitle: "Marketing",
    jobLevel: "Intern",
    status: "open",
    startDate: "2026-03-24",
    endDate: "2026-04-23",
    headcount: 2,
    newApplications: 12,
    department: "Marketing",
    location: "Remote",
    employmentType: "Full-time",
    description: "We are looking for a Marketing Intern to join our team and help drive our Q1 campaigns.\n\nResponsibilities:\n- Assist with social media campaigns\n- Create marketing content\n\nRequirements:\n- Strong communication skills\n- Basic knowledge of digital marketing",
    skills: [
      { id: "s1", name: "Content Marketing", category: "must-have" },
      { id: "s2", name: "Social Media", category: "must-have" },
      { id: "s3", name: "SEO", category: "nice-to-have" },
      { id: "s4", name: "Google Analytics", category: "bonus" },
    ],
  },
  {
    id: "prog-002",
    name: "Recruitment for Backend Developer Round 1 - 2026",
    jobTitle: "Backend Developer",
    jobLevel: "Fresher",
    status: "open",
    startDate: "2026-03-24",
    endDate: "2026-04-30",
    headcount: 5,
    department: "Engineering",
    location: "Ho Chi Minh City",
    employmentType: "Full-time",
    description: "We are looking for a Backend Developer to join our engineering team.\n\nResponsibilities:\n- Build scalable web applications\n- Write clean, maintainable code\n- Collaborate with the frontend team\n\nRequirements:\n- Proficiency in Node.js or Python\n- Experience with RESTful APIs\n- Basic knowledge of databases",
    programUrl: "https://yourcompany.sharepoint.com/sites/TalentAcquisition/Shared%20Documents/Campaigns/2026_Q1_Backend",
    skills: [
      { id: "s5", name: "Node.js", category: "must-have" },
      { id: "s6", name: "PostgreSQL", category: "must-have" },
      { id: "s7", name: "REST APIs", category: "must-have" },
      { id: "s8", name: "Docker", category: "nice-to-have" },
      { id: "s9", name: "Redis", category: "nice-to-have" },
    ],
  },
  {
    id: "prog-003",
    name: "Precio Seed Q3 - 2026",
    jobTitle: "Fullstack Developer",
    jobLevel: "Fresher",
    status: "draft",
    startDate: "2026-10-09",
    endDate: "2026-10-30",
    headcount: 12,
    department: "Engineering",
    location: "Hybrid",
    employmentType: "Full-time",
    description: "Fullstack developer program for Q3 2026 batch hiring.",
    skills: [
      { id: "s10", name: "React", category: "must-have" },
      { id: "s11", name: "TypeScript", category: "must-have" },
    ],
  },
  {
    id: "prog-004",
    name: "Precio Seed Q3 - 2026 (Copy)",
    jobTitle: "Fullstack Developer",
    jobLevel: "Fresher",
    status: "draft",
    startDate: "2026-10-09",
    endDate: "2026-10-30",
    headcount: 12,
    description: "Duplicate of Precio Seed Q3 - 2026.",
    skills: [],
  },
  {
    id: "prog-005",
    name: "Software Engineer - SummerCamp 2023",
    jobTitle: "Software Engineer",
    jobLevel: "Fresher",
    status: "closed",
    startDate: "2023-03-01",
    endDate: "2023-04-30",
    headcount: 6,
    department: "Engineering",
    employmentType: "Internship",
    description: "Summer camp 2023 for software engineering students.",
    skills: [],
  },
];

export const jobTemplates: JobTemplate[] = [
  {
    id: "tpl-001",
    jobTitle: "Frontend Developer",
    level: "Fresher",
    skillsConfigured: 20,
    lastUpdated: "2026-03-24T15:12:00",
    description: "We are looking for a Frontend Developer to build modern user interfaces.\n\nResponsibilities:\n- Build responsive web applications\n- Collaborate with designers\n- Mentor junior developers\n\nRequirements:\n- 5+ years of experience with React\n- Strong TypeScript skills",
    skills: [
      { id: "t1", name: "React", category: "must-have" },
      { id: "t2", name: "TypeScript", category: "must-have" },
      { id: "t3", name: "CSS", category: "must-have" },
      { id: "t4", name: "Vue.js", category: "nice-to-have" },
      { id: "t5", name: "GraphQL", category: "bonus" },
    ],
  },
  {
    id: "tpl-002",
    jobTitle: "Backend Developer",
    level: "Fresher",
    skillsConfigured: 15,
    lastUpdated: "2025-04-15T10:45:00",
    description: "We are looking for a Backend Developer to build scalable server-side applications.\n\nResponsibilities:\n- Build scalable web applications\n- Design RESTful APIs\n- Optimize database queries\n\nRequirements:\n- 3+ years of experience with Node.js\n- Strong SQL skills",
    skills: [
      { id: "t6", name: "Node.js", category: "must-have" },
      { id: "t7", name: "PostgreSQL", category: "must-have" },
      { id: "t8", name: "REST APIs", category: "must-have" },
      { id: "t9", name: "Docker", category: "nice-to-have" },
      { id: "t10", name: "Redis", category: "nice-to-have" },
      { id: "t11", name: "Kubernetes", category: "bonus" },
    ],
  },
  {
    id: "tpl-003",
    jobTitle: "Accountant",
    level: "Fresher",
    skillsConfigured: 7,
    lastUpdated: "2025-06-22T14:15:00",
    description: "Looking for an Accountant to manage financial records and reporting.",
    skills: [
      { id: "t12", name: "Excel", category: "must-have" },
      { id: "t13", name: "QuickBooks", category: "nice-to-have" },
    ],
  },
  {
    id: "tpl-004",
    jobTitle: "Marketing",
    level: "Fresher",
    skillsConfigured: 8,
    lastUpdated: "2025-07-30T11:00:00",
    description: "Marketing specialist to drive brand awareness and lead generation.",
    skills: [
      { id: "t14", name: "Social Media", category: "must-have" },
      { id: "t15", name: "Content Marketing", category: "must-have" },
      { id: "t16", name: "Google Ads", category: "nice-to-have" },
    ],
  },
  {
    id: "tpl-005",
    jobTitle: "UI/UX Designer",
    level: "Fresher",
    skillsConfigured: 10,
    lastUpdated: "2025-05-10T20:30:00",
    description: "Creative UI/UX Designer to craft beautiful and intuitive interfaces.",
    skills: [
      { id: "t17", name: "Figma", category: "must-have" },
      { id: "t18", name: "User Research", category: "must-have" },
      { id: "t19", name: "Prototyping", category: "nice-to-have" },
    ],
  },
];
