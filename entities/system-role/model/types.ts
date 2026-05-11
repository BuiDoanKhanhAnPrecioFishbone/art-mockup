/** Permission action — the same five-letter alphabet used in the
 *  wireframe's role × module legend (L=List, V=View, A=Add, U=Update,
 *  D=Delete). */
export type PermissionAction = "list" | "view" | "add" | "update" | "delete";

export const PERMISSION_ACTIONS: PermissionAction[] = [
  "list",
  "view",
  "add",
  "update",
  "delete",
];

export const PERMISSION_ACTION_SHORT: Record<PermissionAction, string> = {
  list: "L",
  view: "V",
  add: "A",
  update: "U",
  delete: "D",
};

export const PERMISSION_ACTION_LABEL: Record<PermissionAction, string> = {
  list: "List",
  view: "View",
  add: "Add",
  update: "Update",
  delete: "Delete",
};

/** Stable IDs for every module the permission matrix covers. */
export type ModuleId =
  | "questions"
  | "test"
  | "submission"
  | "program"
  | "candidates"
  | "report"
  | "email-template"
  | "skill-template"
  | "recruitment-flow-template"
  | "job-template"
  | "interview-criteria-template"
  | "user"
  | "manage-metadata"
  | "system-setting";

export interface ModuleDef {
  id: ModuleId;
  label: string;
  /** When set, the role detail panel surfaces a "Data Scope" dropdown
   *  for this module (e.g. "All Company Data" vs "Owned & Assigned
   *  Campaigns"). Modules without a scope only need the action
   *  checkboxes. */
  scopeable?: boolean;
}

export interface ModuleGroupDef {
  id: string;
  label: string;
  /** Tailwind ring/label colour token used by the role header strip.
   *  Kept abstract so the UI layer maps to actual Tailwind classes. */
  tone: "violet" | "emerald" | "amber" | "rose";
  modules: ModuleDef[];
}

/** Canonical module groups + their modules — drives both the legend
 *  and the Edit Role modal's table. */
export const MODULE_GROUPS: ModuleGroupDef[] = [
  {
    id: "assessment",
    label: "Assessment Management",
    tone: "violet",
    modules: [
      { id: "questions", label: "Questions", scopeable: true },
      { id: "test", label: "Test", scopeable: true },
      { id: "submission", label: "Submission", scopeable: true },
    ],
  },
  {
    id: "recruitment",
    label: "Recruitment & Program",
    tone: "emerald",
    modules: [
      { id: "program", label: "Program", scopeable: true },
      { id: "candidates", label: "Candidates", scopeable: true },
      { id: "report", label: "Report", scopeable: true },
    ],
  },
  {
    id: "templates",
    label: "Template Library",
    tone: "amber",
    modules: [
      { id: "email-template", label: "Email Template" },
      { id: "skill-template", label: "Skill Template" },
      {
        id: "recruitment-flow-template",
        label: "Recruitment Flow Template",
      },
      { id: "job-template", label: "Job Template" },
      {
        id: "interview-criteria-template",
        label: "Interview Criteria Template",
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    tone: "rose",
    modules: [
      { id: "user", label: "User" },
      { id: "manage-metadata", label: "Manage Metadata" },
      { id: "system-setting", label: "System Setting" },
    ],
  },
];

/** Role-level permissions as a sparse map: module ID → list of actions.
 *  Missing modules / empty lists mean "no access." */
export type RolePermissions = Partial<Record<ModuleId, PermissionAction[]>>;

/** Per-module data-scope override. Only modules with `scopeable: true`
 *  ever have an entry here. */
export type RoleDataScope = Partial<Record<ModuleId, string>>;

/** A "special note" displayed under a permission row when the row's
 *  behaviour deviates from the bare action set — e.g. Reviewer's
 *  Submission permission is "Assigned only", Candidate's Test is "Do
 *  test" (a single capability, not L/V/A/U/D). */
export type RoleSpecialNote = Partial<Record<ModuleId, string>>;

export interface SystemRole {
  id: string;
  name: string;
  description: string;
  /** System-built-in roles cannot be deleted (only edited). */
  isSystem: boolean;
  permissions: RolePermissions;
  dataScope: RoleDataScope;
  /** Free-text overrides shown beneath the action chips on the
   *  permission matrix view ("Assigned only", "Own profile only"). */
  notes: RoleSpecialNote;
  /** Mock counter — derived from the users list at render time, but
   *  also stored here so the Roles & Permissions table doesn't have to
   *  cross-reference. */
  usersAssigned: number;
  updatedAtISO: string;
}

export const ROLE_OPTIONS_FOR_USERS: { id: string; label: string }[] = [
  { id: "role-admin", label: "Admin" },
  { id: "role-manager", label: "Manager" },
  { id: "role-recruiter", label: "Recruiter" },
  { id: "role-standard-user", label: "Standard User" },
  { id: "role-reviewer", label: "Reviewer" },
  { id: "role-candidate", label: "Candidate" },
];
