# 09 — Key UI Screens & Candidate-Facing Experience

> Index → [INDEX.md](./INDEX.md). Underlying data model: tests → [06-test-management.md](./06-test-management.md), sessions → [07-sessions.md](./07-sessions.md).

## 9.1 Test List

Columns: **Title**, **Status** (Draft/Published), **Type**
(Assessment/Recruitment), **Duration** (date range), **Tags**.

Actions: Create New Test, Edit Test, Delete Test, **Create New Test
Session** (only on Published tests).

## 9.2 Submission List (HR view)

Columns: **Session name**, **Test**, **Type** (Public/Private),
**Access Code**, **Duration** (date range).

Filters: by test, status, type. Actions: Clone session, Delete session,
Create New Session.

## 9.3 Session Detail — create / edit (HR view)

| Field | Required | Notes |
| --- | --- | --- |
| Title | Yes | Session name. |
| Test Template | Yes | Links the session to a test. |
| Status | Yes | `Inactive` / `Active`. |
| Type | Yes | Public or Private toggle. |
| Refresh Access Code time | Yes | Minutes between code refreshes (`0` = no refresh). |
| Program | Yes | Links to a recruitment program. |
| Program Step | Private only | The specific step this session serves. |
| Candidates Selection | Private only | Pick candidates to invite. |
| Description | No | Free-text session description. |
| Session Start Date/Time | Yes | 24h format. |
| Session End Date/Time | Yes | 24h format; must be after start; ≥ test duration for Public/Private. |
| Send Invitations toggle | — | When enabled: choose invitation email template, sending mode (Send now / Schedule), send date/time. |

## 9.4 Submission Candidates view (Reviewer / HR)

For one session: **Candidate email**, **Total Score** (bar + points),
**Question Breakdown by difficulty** (Easy / Medium / Hard), **Status**
(Passed / Pending / Under Review / Failed), **Integrity** (Undetected /
Cheating).

Filters: by status and integrity.

## 9.5 Individual Submission Detail

- **Test Result Overview** — test name, pass ratio, submitted at,
  duration, total score, questions breakdown by difficulty.
- **Skill Performance** — per-skill score breakdown with percentage bars.
- **Integrity Summary** — detailed count of each integrity event
  (leaving tab, copy/paste, DevTools, multi-instance, multi-monitor).
- **Question Submission** table — per-question result, max points, type, tags.
- **Final Review Result** — HR / Reviewer can set: `Passed` / `Failed` /
  `Under Review` / `Pending`.
- **AI Review for Candidate** panel — AI-generated reviewer notes with
  `Rewrite with AI` and `Save` actions.
- **Review full submission** button — opens detailed question-by-
  question view.

## 9.6 Candidate Test-Taking Experience

| Screen | Key elements |
| --- | --- |
| **Test Access (Public)** | Deadline shown; Name, Email, Private Code fields; Continue button. |
| **Test Access (Private)** | Deadline shown; Email, Private Code fields; Continue button. |
| **Test Overview / Inactive** | Duration & deadline; assessment rules listed; name + email confirmed; "Inactive Test" status if session not yet active. |
| **Test Overview / Ready** | Same as above but Start Test button enabled. |
| **Test In Progress** | Countdown timer; question navigator (numbered pills); question content; answer area (code editor / options / essay); Flag question; Question List sidebar; Run Test Case; Submit Answer; Finish Test button. |
| **Test Case Results** | Run output inline; error messages; pass/fail indicators. |

Assessment rules displayed to candidates before starting:

- May skip questions and return to them later (if `allow_skip = true`).
- May update answers before final submission.
- Final submission allowed **only once**.
- Leaving the tab, copying / pasting, opening DevTools, multiple
  windows or monitors **may be flagged**.
