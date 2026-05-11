# 07 — Session System (Submissions)

> Index → [INDEX.md](./INDEX.md). Test that backs the session → [06-test-management.md](./06-test-management.md). HR + candidate screens → [09-ui-screens.md](./09-ui-screens.md). Audit / scheduler hooks → [10-data-integrity.md](./10-data-integrity.md).

A test session is a **time-bounded event** where one or more candidates
take a test assigned to a step. Entity hierarchy:

```
Program → Stage → Step → Test (owns duration) → Session
```

## 7.1 Session types

|   | **Public** | **Private** | **Private Onsite** |
| --- | --- | --- | --- |
| **How candidates join** | Anyone with the shared session code. | Each candidate gets a unique code. | Email only — no code needed. |
| **Intended for** | Open-call, large pools. | Shortlisted candidates in pipeline. | In-person / supervised testing. |
| **Start time** | Hard gate — no entry before. | Hard gate — no entry before. | Soft — scheduling hint only; HR controls actual start. |
| **End time** | Hard cutoff — auto-submit. | Hard cutoff — auto-submit. | Safety limit — active tests continue past it. |
| **Who starts session** | System auto-starts at start time. | System auto-starts at start time. | HR manually clicks Start. |
| **Candidate timer** | `min(test duration, time remaining before end)` | `min(test duration, personal end time)` | Always full test duration — independent of session window. |

## 7.2 Session statuses

| Status | Meaning | HR can do | Candidates can do |
| --- | --- | --- | --- |
| **Upcoming** | Scheduled but not started. | Add/remove candidates, edit times, start early, cancel. | Cannot access the test. |
| **Active** | Open; candidates can take. | Add candidates (with warning), extend time, cancel, close hall (Onsite). | Join and begin. |
| **Closing** | *Onsite only* — hall closed, some still testing. | Monitor remaining; force-complete if needed. | Already-testing finish; no new joins. |
| **Completed** | All submitted. Session locked. | View results only. | Cannot access. |
| **Cancelled** | Stopped early. All answers saved. | View history only. | Cannot access. |

## 7.3 Status transition rules

| From | Can transition to | Applies to | Requirement |
| --- | --- | --- | --- |
| Upcoming | Active | All types | None — early start or standard Onsite start. |
| Upcoming | Cancelled | All types | `cancel_reason` required; all invites revoked; candidates notified. |
| Active | Closing | Onsite only | HR manually closes the hall; active tests continue. |
| Active | Cancelled | All types | Force-submit all in-progress answers first; reason required; notify candidates. |
| Closing | Completed | Onsite only | HR force-close; remaining tests force-submitted and flagged. |
| Completed | — (locked) | All | Permanently immutable. |
| Cancelled | — (locked) | All | Permanently immutable — create a new session to retest. |

> Every manual status change is **logged** with actor, timestamp,
> previous status, new status, and reason. The status field in the UI
> renders as a constrained dropdown — only valid forward transitions
> are shown.

## 7.4 Timing rules

| Scenario | Public / Private | Private Onsite |
| --- | --- | --- |
| **Session end time arrives** | All active tests auto-submitted; session → `Completed` immediately. | Hall closes (no new joins); active tests continue; session → `Closing` → `Completed` when all done. |
| **Candidate joins late** | Receives remaining time before end; warning shown. | HR controls start; late-to-hall managed in real time. |
| **HR extends past session end** | Allowed with warning — session waits for that candidate before closing. | Always allowed — candidate timers already independent of session end. |
| **Session window < test duration** | **Blocked** at creation — hard validation error. | **Warning** shown (not blocked) — HR manages manually. |

## 7.5 Candidate management within sessions

| Action | Upcoming | Active | Completed / Cancelled |
| --- | --- | --- | --- |
| Add candidate | Allowed — invitation sent. | Allowed with HR confirmation — late join, reduced time, result flagged. | Not allowed — create a new session. |
| Remove candidate | Allowed — invite revoked, candidate notified. | Access revoked immediately; partial answers saved; reason logged. | Soft-delete only (`excluded=true + reason`); data preserved for audit. |
| Extend individual time | N/A — test not started. | Allowed at any time for that candidate only. | Not allowed. |

> Candidates are **never hard-deleted** from a historical session.
> Exclusions are recorded with a reason and kept for audit.

## 7.6 Editing rules by session state

| What HR wants to edit | Before session starts | While session active | After session ends |
| --- | --- | --- | --- |
| Session start time | Allowed; all candidates notified. | Not allowed. | Not allowed. |
| Session end time | Allowed; notified. | **Extend only** — shortening is blocked. | Not allowed. |
| Program name/description | Always allowed. | Always allowed. | Always allowed. |
| Program structure (stages/steps) | Allowed with warning if sessions exist. | Blocked while any session is active. | Soft-delete only; historical data preserved. |
| Test content or settings | Allowed with warning if sessions exist. | **Blocked** — test locked while live session running. | **Blocked** — create a new test version instead. |

## 7.7 Integrity monitoring

Per candidate submission:

| Event | Flag stored | Detection method |
| --- | --- | --- |
| Leaving the test tab | `leaving_tab_count` | Browser blur / `visibilitychange` events. |
| Copy / Paste | `copy_paste_count` | Clipboard events intercepted in editor. |
| Opening DevTools | `devtools_open_count` | Window resize heuristic + DevTools detection script. |
| Multiple browser instances | `multi_instance_count` | Session token used concurrently from different fingerprints. |
| Multiple monitors | `multi_monitor_flag` | Screen count > 1 detected at session start. |

> Integrity statuses shown in the Submission list: `Undetected` /
> `Cheating`. Reviewers see the full breakdown in the candidate's
> submission detail view.
