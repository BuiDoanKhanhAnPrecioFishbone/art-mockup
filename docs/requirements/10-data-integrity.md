# 10 — Data Integrity, Audit & Scheduler

> Index → [INDEX.md](./INDEX.md). Sessions are the most affected surface → [07-sessions.md](./07-sessions.md).

## Universal rules

- **Never hard-delete** questions, tests, sessions, or candidates that
  have historical submission data.
- All rejections, removals, and cancellations require a `reason` string
  and `actor_id`.
- **Integrity events** must be stored with timestamp and raw event
  metadata, **not just aggregated counts**.
- `force_submitted` flag must be set on any submission closed by the
  system rather than the candidate.
- Step **version** must be recorded on each session at creation time
  (so historic sessions don't break when the program's workflow is
  edited later).
- Store `actual_end_time` separately from scheduled `end_time` to track
  extensions and real completion.
- All manual status changes logged with actor, timestamp, previous
  status, new status, and reason.
- Candidate soft-delete uses `excluded=true + exclude_reason` —
  historical data always preserved.

## 10.1 Scheduler / cron jobs

| Trigger | Action |
| --- | --- |
| **Every minute** | Check sessions where `status=Upcoming AND type IN (public, private) AND now >= start_time` → auto-activate. |
| **Every minute** | Check sessions where `status=Closing AND all candidate statuses are terminal` → auto-complete. |
| **On `end_time` (Public/Private Active)** | Force-submit all in-progress candidates → complete session. |
| **On `end_time` (Onsite Active)** | Transition session to `Closing` — **do NOT** force-submit active tests. |
| **Safety: Onsite passes `end_time` and never activated** | Auto-cancel with log reason. |
