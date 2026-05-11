# 02 — Recruitment Module

> Index → [INDEX.md](./INDEX.md). Program setup tabs → [03-program-setup.md](./03-program-setup.md). Email validation that gates promotion → [04-email-system.md](./04-email-system.md).

## Program hierarchy

Every recruitment round is a 3-level hierarchy:

| Level | What it is | Example |
| --- | --- | --- |
| **Program** | The entire hiring round — master blueprint. | Q1 Software Engineer Hiring 2026 |
| **Stage** | A major phase. | Screening · Interview · Offer |
| **Step** | One task inside a stage. | Review CV · Technical Test · HR Call |

## Step types

| Type | What HR does | Candidate experience |
| --- | --- | --- |
| **Default (Review)** | Reviewer reads profile and decides pass / fail. | Nothing visible — internal only. |
| **Test** | HR creates and schedules a test session; candidates get a link. | Take an online test inside a time window. |
| **Interview** | HR sends an invitation email. | Receives email; accepts, declines, or requests reschedule. |

> Step type is **immutable** after creation if any candidate has entered
> or passed through that step.

## Candidate entry routes

All entry routes place the candidate at the **first step of the first
stage** automatically (server-enforced).

| Method | Trigger | Notes |
| --- | --- | --- |
| **Manual entry** | HR adds via UI | Immediate, no async job. |
| **SharePoint (WebJob)** | Background poll of a SharePoint folder | Handles dedup; failed rows logged with reason. |
| **Public form** | Candidate fills a form (public link or iframe embed) | Validates required fields; returns `422` with field errors on failure. |

## Auto-assignment algorithm (every step entry)

Whenever a candidate is placed in any step (entry or promotion):

1. Fetch all `reviewer_ids` for the target step.
2. Count active candidates (status ≠ Rejected/Withdrawn) per reviewer in that step.
3. Assign to the reviewer with the **fewest** active candidates.
4. On tie: select the lower `reviewer_id` (stable sort).
5. Log assignment with timestamp and trigger source.

**Edge cases:**
- No reviewers assigned → block promotion, surface error to HR.
- Reviewer deactivated mid-flow → exclude from count, re-assign their candidates.
- Single reviewer → always assigned regardless of count.

## Promotion & status transitions

| Action | Who | Result |
| --- | --- | --- |
| **Pass** | Reviewer | Move to next step; auto-assignment runs. |
| **Reject** | Reviewer | `status = Rejected`; excluded from step counts; no further movement. |
| **Withdraw** | Candidate / HR | `status = Withdrawn`; same effect as Reject for workload counts. |
| **Undo Reject** | HR only | Re-activates and re-runs auto-assignment. |

Terminal states at end of program:

| Outcome | `candidate.status` |
| --- | --- |
| Passed all steps | `Completed` |
| Rejected at any point | `Rejected` |
| Withdrew | `Withdrawn` |
