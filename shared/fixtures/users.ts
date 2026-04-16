// ── Types ─────────────────────────────────────────────────────────────────────

export type UserStatus = "active" | "pending" | "deactivated";

export type PermAction = "view" | "create" | "edit" | "delete";

export interface ModulePermission {
  module: string;           // e.g. "Questions"
  parent?: string;          // e.g. "Assessment Management" — if this is a sub-row
  actions: Partial<Record<PermAction, boolean>>;
  dataScope?: string;       // e.g. "All Company Data"
}

export interface Role {
  id: string;
  name: string;
  description: string;
  usersAssigned: number;
  lastUpdated: string;      // "HH:mm, DD/MM/YYYY"
  permissions: ModulePermission[];
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: UserStatus;
  lastActive: string;       // human-readable relative string
  avatarInitials: string;
  avatarColor: string;      // Tailwind bg class
}

// ── Roles ─────────────────────────────────────────────────────────────────────

const DEFAULT_PERMISSIONS: ModulePermission[] = [
  // Assessment Management
  { module: "Assessment Management", actions: {} },
  { module: "Questions",  parent: "Assessment Management", actions: { view: false, create: false, edit: false, delete: false }, dataScope: "All Company Data" },
  { module: "Test",       parent: "Assessment Management", actions: { view: false, create: false, edit: false, delete: false }, dataScope: "All Company Data" },
  { module: "Submission", parent: "Assessment Management", actions: { view: false, create: false, edit: false, delete: false }, dataScope: "All Company Data" },
  // Recruitment & Program
  { module: "Recruitment & Program", actions: {} },
  { module: "Program",    parent: "Recruitment & Program", actions: { view: false, create: false, edit: false, delete: false }, dataScope: "Owned & Assigned Campaigns" },
  { module: "Candidates", parent: "Recruitment & Program", actions: { view: false, create: false, edit: false, delete: false }, dataScope: "Owned & Assigned Campaigns" },
  { module: "Report",     parent: "Recruitment & Program", actions: { view: false, create: false, edit: false, delete: false }, dataScope: "Owned & Assigned Campaigns" },
  // Template Library
  { module: "Template Library", actions: {} },
  { module: "Skill Template", parent: "Template Library", actions: { view: false, create: false, edit: false, delete: false }, dataScope: "All Company Data" },
];

function makePerms(overrides: Partial<Record<string, Partial<Record<PermAction, boolean>> & { dataScope?: string }>>): ModulePermission[] {
  return DEFAULT_PERMISSIONS.map((p) => {
    const ov = overrides[p.module];
    if (!ov) return { ...p, actions: { ...p.actions } };
    const { dataScope, ...actionOv } = ov;
    return {
      ...p,
      actions: { ...p.actions, ...actionOv },
      dataScope: dataScope ?? p.dataScope,
    };
  });
}

export const roles: Role[] = [
  {
    id: "role-admin",
    name: "System Admin",
    description: "Full access to all system features and settings.",
    usersAssigned: 5,
    lastUpdated: "03:20 PM, 01/4/2026",
    permissions: makePerms({
      Questions:      { view: true, create: true, edit: true, delete: true, dataScope: "All Company Data" },
      Test:           { view: true, create: true, edit: true, delete: true, dataScope: "All Company Data" },
      Submission:     { view: true, create: true, edit: true, delete: true, dataScope: "All Company Data" },
      Program:        { view: true, create: true, edit: true, delete: true, dataScope: "All Company Data" },
      Candidates:     { view: true, create: true, edit: true, delete: true, dataScope: "All Company Data" },
      Report:         { view: true, create: true, edit: true, delete: true, dataScope: "All Company Data" },
      "Skill Template": { view: true, create: true, edit: true, delete: true, dataScope: "All Company Data" },
    }),
  },
  {
    id: "role-manager",
    name: "Manager",
    description: "",
    usersAssigned: 2,
    lastUpdated: "03:20 PM, 01/4/2026",
    permissions: makePerms({
      Questions:      { view: true, create: false, edit: false, delete: false, dataScope: "All Company Data" },
      Test:           { view: true, create: true,  edit: true,  delete: false, dataScope: "All Company Data" },
      Submission:     { view: true, create: false, edit: true,  delete: false, dataScope: "All Company Data" },
      Program:        { view: true, create: true,  edit: true,  delete: false, dataScope: "All Company Data" },
      Candidates:     { view: true, create: true,  edit: true,  delete: false, dataScope: "Owned & Assigned Campaigns" },
      Report:         { view: true, create: false, edit: false, delete: false, dataScope: "All Company Data" },
      "Skill Template": { view: true, create: false, edit: false, delete: false, dataScope: "All Company Data" },
    }),
  },
  {
    id: "role-recruiter",
    name: "Recruiter",
    description: "Can manage all job programs and candidates.",
    usersAssigned: 10,
    lastUpdated: "03:20 PM, 01/4/2026",
    permissions: makePerms({
      Questions:      { view: true,  create: false, edit: false, delete: false, dataScope: "All Company Data" },
      Test:           { view: true,  create: false, edit: false, delete: false, dataScope: "All Company Data" },
      Submission:     { view: true,  create: false, edit: true,  delete: false, dataScope: "Owned & Assigned Campaigns" },
      Program:        { view: true,  create: true,  edit: true,  delete: false, dataScope: "Owned & Assigned Campaigns" },
      Candidates:     { view: true,  create: true,  edit: true,  delete: true,  dataScope: "Owned & Assigned Campaigns" },
      Report:         { view: true,  create: false, edit: false, delete: false, dataScope: "Owned & Assigned Campaigns" },
      "Skill Template": { view: true, create: false, edit: false, delete: false, dataScope: "All Company Data" },
    }),
  },
  {
    id: "role-reviewer",
    name: "Reviewer",
    description: "",
    usersAssigned: 22,
    lastUpdated: "03:20 PM, 01/4/2026",
    permissions: makePerms({
      Questions:      { view: true,  create: false, edit: false, delete: false, dataScope: "All Company Data" },
      Test:           { view: true,  create: false, edit: false, delete: false, dataScope: "All Company Data" },
      Submission:     { view: false, create: false, edit: true,  delete: false, dataScope: "Owned & Assigned Campaigns" },
      Program:        { view: true,  create: false, edit: false, delete: false, dataScope: "Owned & Assigned Campaigns" },
      Candidates:     { view: true,  create: false, edit: true,  delete: false, dataScope: "Owned & Assigned Campaigns" },
      Report:         { view: true,  create: false, edit: false, delete: false, dataScope: "Owned & Assigned Campaigns" },
      "Skill Template": { view: true, create: false, edit: false, delete: false, dataScope: "All Company Data" },
    }),
  },
  {
    id: "role-candidate",
    name: "Candidate",
    description: "",
    usersAssigned: 153,
    lastUpdated: "03:20 PM, 01/4/2026",
    permissions: makePerms({}),
  },
];

// ── Users ─────────────────────────────────────────────────────────────────────

export const systemUsers: SystemUser[] = [
  { id: "usr-1", name: "Alice Johnson",  email: "alice@company.com",  roleId: "role-reviewer",  status: "active",      lastActive: "Just now",    avatarInitials: "AJ", avatarColor: "bg-pink-500" },
  { id: "usr-2", name: "Bob Smith",      email: "bob@company.com",    roleId: "role-candidate", status: "active",      lastActive: "2 hours ago", avatarInitials: "BS", avatarColor: "bg-blue-500" },
  { id: "usr-3", name: "Charlie Davis",  email: "charlie@agency.com", roleId: "role-candidate", status: "active",      lastActive: "1 month ago", avatarInitials: "CD", avatarColor: "bg-green-500" },
  { id: "usr-4", name: "Diana Prince",   email: "diana@company.com",  roleId: "role-manager",   status: "pending",     lastActive: "2 weeks ago", avatarInitials: "DP", avatarColor: "bg-purple-500" },
  { id: "usr-5", name: "Evan Wright",    email: "evan@partner.com",   roleId: "role-candidate", status: "deactivated", lastActive: "12/12/2000",  avatarInitials: "EW", avatarColor: "bg-orange-500" },
  { id: "usr-6", name: "Admin",          email: "admin@art.com",      roleId: "role-admin",     status: "active",      lastActive: "Just now",    avatarInitials: "AD", avatarColor: "bg-gray-700" },
];

// ── Data scope options ────────────────────────────────────────────────────────

export const DATA_SCOPE_OPTIONS = [
  "All Company Data",
  "Business Unit / Branch",
  "Department Only",
  "Owned & Assigned Campaigns",
  "Assigned Steps Only",
  "No Access",
];
