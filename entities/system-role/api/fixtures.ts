import type { SystemRole } from "../model/types";

const NOW = "2026-04-01T15:20:00Z";

const ALL_ACTIONS = ["list", "view", "add", "update", "delete"] as const;
const LV = ["list", "view"] as const;
const LVAU = ["list", "view", "add", "update"] as const;

const SEED: SystemRole[] = [
  {
    id: "role-admin",
    name: "System Admin",
    description: "Full access to all system features and settings.",
    isSystem: true,
    permissions: {
      questions: [...ALL_ACTIONS],
      test: [...ALL_ACTIONS],
      submission: [...ALL_ACTIONS],
      program: [...ALL_ACTIONS],
      candidates: [...ALL_ACTIONS],
      report: [...ALL_ACTIONS],
      "email-template": [...ALL_ACTIONS],
      "skill-template": [...ALL_ACTIONS],
      "recruitment-flow-template": [...ALL_ACTIONS],
      "job-template": [...ALL_ACTIONS],
      "interview-criteria-template": [...ALL_ACTIONS],
      user: [...ALL_ACTIONS],
      "manage-metadata": [...ALL_ACTIONS],
      "system-setting": [...ALL_ACTIONS],
    },
    dataScope: {
      questions: "All Company Data",
      test: "All Company Data",
      submission: "All Company Data",
      program: "All Company Data",
      candidates: "Global (Full History)",
      report: "All Company Data",
    },
    notes: {},
    usersAssigned: 5,
    updatedAtISO: NOW,
  },
  {
    id: "role-manager",
    name: "Manager",
    description:
      "Manages programs, hiring teams, and most administrative settings.",
    isSystem: true,
    permissions: {
      questions: [...LVAU],
      test: [...LVAU],
      submission: [...LVAU],
      program: [...LVAU],
      candidates: [...LVAU],
      report: [...LVAU],
      "email-template": [...LVAU],
      "skill-template": [...LVAU],
      "recruitment-flow-template": [...LVAU],
      "job-template": [...LVAU],
      "interview-criteria-template": [...LVAU],
      user: [...LV],
      "manage-metadata": [...LV],
    },
    dataScope: {
      questions: "Business Unit",
      test: "Business Unit",
      submission: "Business Unit",
      program: "Business Unit",
      candidates: "Global (Public Profile Only)",
      report: "Business Unit",
    },
    notes: {},
    usersAssigned: 2,
    updatedAtISO: NOW,
  },
  {
    id: "role-recruiter",
    name: "Recruiter",
    description: "Can manage all job programs and candidates.",
    isSystem: true,
    permissions: {
      questions: [...LVAU],
      test: [...LVAU],
      submission: [...LV],
      program: [...LVAU],
      candidates: [...LVAU],
      report: [...LV],
      "email-template": [...LVAU],
      "skill-template": [...LVAU],
      "recruitment-flow-template": [...LV],
      "job-template": [...LV],
      "interview-criteria-template": [...LVAU],
    },
    dataScope: {
      questions: "Owned & Assigned Campaigns",
      test: "Owned & Assigned Campaigns",
      submission: "Owned & Assigned Campaigns",
      program: "Owned & Assigned Campaigns",
      candidates: "Owned & Assigned Campaigns",
      report: "Owned & Assigned Campaigns",
    },
    notes: {},
    usersAssigned: 10,
    updatedAtISO: NOW,
  },
  {
    id: "role-standard-user",
    name: "Standard User",
    description:
      "Read-only collaborator — can browse most modules but not change them.",
    isSystem: true,
    permissions: {
      questions: [...LV],
      test: [...LV],
      submission: [...LV],
      program: [...LV],
      candidates: [...LV],
      report: [...LV],
      "skill-template": [...LV],
      "job-template": [...LV],
    },
    dataScope: {
      questions: "Department Only",
      test: "Department Only",
      submission: "Department Only",
      program: "Department Only",
      candidates: "Restricted (Assigned Campaigns Only)",
      report: "Department Only",
    },
    notes: {},
    usersAssigned: 8,
    updatedAtISO: NOW,
  },
  {
    id: "role-reviewer",
    name: "Reviewer",
    description:
      "Specific role — only sees programs, candidates, and submissions assigned to them.",
    isSystem: true,
    permissions: {
      submission: ["list", "view", "update"],
      program: [...LV],
      candidates: ["list", "view", "update"],
    },
    dataScope: {
      submission: "Assigned Steps Only (Interviewer Mode)",
      program: "Assigned Steps Only (Interviewer Mode)",
      candidates: "Assigned Steps Only (Interviewer Mode)",
    },
    notes: {
      submission: "Assigned only",
      program: "Assigned only",
      candidates: "Assigned only",
    },
    usersAssigned: 22,
    updatedAtISO: NOW,
  },
  {
    id: "role-candidate",
    name: "Candidate",
    description:
      "External applicant — can submit a test and view their own profile only.",
    isSystem: true,
    permissions: {
      test: [],
      program: [...LV],
      candidates: [...LV],
    },
    dataScope: {
      program: "Restricted (Assigned Campaigns Only)",
      candidates: "Restricted (Assigned Campaigns Only)",
    },
    notes: {
      test: "Do test",
      program: "Open / Published",
      candidates: "Own profile only",
    },
    usersAssigned: 153,
    updatedAtISO: NOW,
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockSystemRolesStore: SystemRole[] | undefined;
}

function store(): SystemRole[] {
  if (!globalThis.__artMockSystemRolesStore) {
    globalThis.__artMockSystemRolesStore = [...SEED];
  }
  return globalThis.__artMockSystemRolesStore;
}

export function listSystemRoles(): SystemRole[] {
  return [...store()];
}
export function getSystemRole(id: string): SystemRole | undefined {
  return store().find((r) => r.id === id);
}
export function updateSystemRole(
  id: string,
  patch: Partial<SystemRole>
): SystemRole | undefined {
  const all = store();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch, updatedAtISO: new Date().toISOString() };
  return all[idx];
}
export function resetSystemRolesStore(): SystemRole[] {
  globalThis.__artMockSystemRolesStore = [...SEED];
  return globalThis.__artMockSystemRolesStore;
}
