import type { LucideIcon } from "lucide-react";
import {
  HelpCircle,
  ListChecks,
  IdCard,
  Shield,
  Network,
  BarChart3,
  Users,
  Briefcase,
  Workflow,
  Settings,
  Layers,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
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
      { id: "questions", label: "Question", href: "/questions", icon: HelpCircle },
      { id: "tests", label: "Test", href: "/tests", icon: ListChecks },
      { id: "submissions", label: "Submission", href: "/submissions", icon: IdCard },
    ],
  },
  {
    id: "recruitment",
    label: "Recruitment & Program",
    items: [
      { id: "programs", label: "Programs", href: "/programs", icon: Shield },
      { id: "candidates", label: "Candidates", href: "/candidates", icon: Network },
      { id: "reports", label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    id: "templates",
    label: "Template Library",
    items: [
      { id: "email-template", label: "Email Template", href: "/templates/email", icon: Users },
      { id: "skill-template", label: "Skill Template", href: "/templates/skills", icon: Briefcase },
      {
        id: "section-template",
        label: "Section Template",
        href: "/templates/sections",
        icon: Layers,
      },
      {
        id: "recruitment-flow-template",
        label: "Recruitment Flow Template",
        href: "/templates/recruitment-flow",
        icon: Workflow,
      },
      { id: "job-template", label: "Job Template", href: "/templates/job", icon: Briefcase },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { id: "manage-users", label: "Manage Users", href: "/admin/users", icon: Settings },
      { id: "manage-metadata", label: "Manage Metadata", href: "/admin/metadata", icon: Settings },
    ],
  },
];
