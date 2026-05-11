/** Doc 10 — every manual status change is logged with actor,
 *  timestamp, previous status, new status, and reason. This shape is
 *  shared across Candidate / Session / Program so the UI can render a
 *  unified Status History list anywhere it needs to. */
export interface StatusEvent<TStatus extends string = string> {
  /** Stable id within the host entity's status history. */
  id: string;
  /** ISO timestamp the change happened. */
  atISO: string;
  /** Identifier of the actor who made the change. Free-text in the
   *  mock — could be a user id, "system", or "scheduler". */
  by: string;
  /** Status the entity was in before the change. */
  from: TStatus;
  /** Status the entity moved to. */
  to: TStatus;
  /** Free-text reason. Required for Reject / Withdraw / Cancel; HR
   *  may leave it empty for Hired / Completed. */
  reason?: string;
}

/** Soft-delete marker on records that must remain queryable for audit
 *  even after they're "removed" from active lists (Doc 10). */
export interface ExclusionMarker {
  /** ISO timestamp the record was excluded. */
  atISO: string;
  /** Actor identifier. */
  by: string;
  /** Reason — required. */
  reason: string;
}

export function newStatusEvent<TStatus extends string>(
  from: TStatus,
  to: TStatus,
  by = "hr-current-user",
  reason?: string
): StatusEvent<TStatus> {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    atISO: new Date().toISOString(),
    by,
    from,
    to,
    reason,
  };
}
