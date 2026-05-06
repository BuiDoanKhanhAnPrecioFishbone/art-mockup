import type { JobTemplate } from "../model/types";

const templates: JobTemplate[] = [
  {
    id: "tpl-backend-dev",
    name: "Backend Developer (Standard)",
    position: "Backend Developer",
    level: "Fresher",
    description:
      "We are hiring a backend developer to design, build and maintain server-side APIs and services. The role works closely with frontend, infra and product teams to ship reliable, performant features.",
    skills: [
      { id: "node", name: "Node.js" },
      { id: "ts", name: "TypeScript" },
      { id: "sql", name: "SQL" },
      { id: "rest", name: "REST APIs" },
      { id: "git", name: "Git" },
    ],
    labels: ["Engineering", "Backend"],
  },
  {
    id: "tpl-fullstack-dev",
    name: "Fullstack Developer (Standard)",
    position: "Fullstack Developer",
    level: "Fresher",
    description:
      "Join our product squad to build and own features end-to-end across the React frontend and Node backend. You'll work on UX, API design, and shipping iteratively.",
    skills: [
      { id: "react", name: "React" },
      { id: "ts", name: "TypeScript" },
      { id: "node", name: "Node.js" },
      { id: "sql", name: "SQL" },
      { id: "tailwind", name: "Tailwind CSS" },
    ],
    labels: ["Engineering", "Fullstack"],
  },
  {
    id: "tpl-marketing-intern",
    name: "Marketing Intern (Standard)",
    position: "Marketing",
    level: "Intern",
    description:
      "Support the marketing team with content production, social campaigns, event coordination and reporting. A great way to learn modern B2B marketing hands-on.",
    skills: [
      { id: "writing", name: "Copywriting" },
      { id: "social", name: "Social Media" },
      { id: "design", name: "Basic Design" },
      { id: "analytics", name: "Analytics" },
    ],
    labels: ["Marketing", "Intern"],
  },
  {
    id: "tpl-software-engineer",
    name: "Software Engineer (Standard)",
    position: "Software Engineer",
    level: "Fresher",
    description:
      "General-purpose software engineering role on the platform team — write production code, review peers, contribute to architecture decisions.",
    skills: [
      { id: "ts", name: "TypeScript" },
      { id: "system-design", name: "System Design" },
      { id: "testing", name: "Testing" },
    ],
    labels: ["Engineering"],
  },
];

export function listJobTemplates(): JobTemplate[] {
  return [...templates];
}

export function getJobTemplate(id: string): JobTemplate | undefined {
  return templates.find((t) => t.id === id);
}
