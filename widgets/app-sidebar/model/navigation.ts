import type { LucideIcon } from "lucide-react";
import {
  HelpCircle,
  ListChecks,
  Shield,
  Users,
  Briefcase,
  Workflow,
  Settings,
  Layers,
  ClipboardCheck,
} from "lucide-react";
import type { ModuleId } from "@/entities/system-role";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Maps the nav entry to a module in the role permission matrix.
   *  When set, the sidebar hides this entry for roles that have no
   *  view permission on the module. Items without a `moduleId` are
   *  visible to every role (e.g. Section Template, which is internal
   *  tooling and not in the permission matrix). */
  moduleId?: ModuleId;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "assessment",
    label: "Assessment Management",
    items: [
      {
        id: "questions",
        label: "Question",
        href: "/questions",
        icon: HelpCircle,
        moduleId: "questions",
      },
      {
        id: "tests",
        label: "Test",
        href: "/tests",
        icon: ListChecks,
        moduleId: "test",
      },
    ],
  },
  {
    id: "recruitment",
    label: "Recruitment & Program",
    items: [
      {
        id: "programs",
        label: "Programs",
        href: "/programs",
        icon: Shield,
        moduleId: "program",
      },
    ],
  },
  {
    id: "templates",
    label: "Template Library",
    items: [
      {
        id: "email-template",
        label: "Email Template",
        href: "/templates/email",
        icon: Users,
        moduleId: "email-template",
      },
      {
        id: "skill-template",
        label: "Skill Template",
        href: "/templates/skills",
        icon: Briefcase,
        moduleId: "skill-template",
      },
      {
        id: "section-template",
        label: "Section Template",
        href: "/templates/sections",
        icon: Layers,
        // No moduleId — internal tooling, visible to every role.
      },
      {
        id: "recruitment-flow-template",
        label: "Recruitment Flow Template",
        href: "/templates/recruitment-flow",
        icon: Workflow,
        moduleId: "recruitment-flow-template",
      },
      {
        id: "job-template",
        label: "Job Template",
        href: "/templates/job",
        icon: Briefcase,
        moduleId: "job-template",
      },
      {
        id: "interview-criteria-template",
        label: "Interview Criteria Template",
        href: "/templates/interview-criteria",
        icon: ClipboardCheck,
        moduleId: "interview-criteria-template",
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        id: "manage-users",
        label: "Manage Users",
        href: "/admin/users",
        icon: Settings,
        moduleId: "user",
      },
    ],
  },
];
