export type SystemUserStatus = "active" | "deactivated" | "pending";

export const SYSTEM_USER_STATUS_LABEL: Record<SystemUserStatus, string> = {
  active: "Active",
  deactivated: "Deactivated",
  pending: "Pending",
};

/** Internal user account in the system (operator, recruiter, reviewer
 *  or candidate-with-portal-access). Distinct from `Candidate` — the
 *  candidate entity is for the recruitment pipeline; this entity backs
 *  the Manage Users admin page. */
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  /** ID into the SystemRole store. */
  roleId: string;
  status: SystemUserStatus;
  /** ISO timestamp the user was last active (for the "Last Active"
   *  column). */
  lastActiveISO?: string;
  /** Optional avatar URL — when missing the page falls back to
   *  initials. */
  avatarUrl?: string;
}
