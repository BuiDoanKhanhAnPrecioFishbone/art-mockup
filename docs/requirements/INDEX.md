# Business Requirements — Index

**Source:** Precio Fishbone Recruitment & Assessment Platform — Full System Requirements Summary v1.0 (May 2026).

**How to use this folder.** Read this index first. Each row points at one
focused doc covering a single domain or screen. Open the doc whose
domain matches the work in front of you; cross-references inside each
doc point at related docs. Do this BEFORE building / changing a flow so
the mockup matches the real business rules.

---

## Read first

| Topic | Doc | When to consult |
| --- | --- | --- |
| Platform modules + sidebar navigation | [01-system-overview.md](./01-system-overview.md) | Adding a new top-level page or sidebar entry. |
| End-to-end recruitment lifecycle | [11-end-to-end-flow.md](./11-end-to-end-flow.md) | Sanity-check that a new screen fits into the larger HR → Candidate flow. |

## Recruitment & Programs

| Topic | Doc | When to consult |
| --- | --- | --- |
| Program / Stage / Step hierarchy, step types, candidate entry routes, **auto-assignment algorithm**, promotion / status transitions | [02-recruitment-program.md](./02-recruitment-program.md) | Building or editing anything inside a Program — pipeline, candidate cards, step actions. |
| Program creation tabs: Program Info, Candidate Profile, Public Form, Workflow | [03-program-setup.md](./03-program-setup.md) | Touching the Program Settings tabs. |

## Email

| Topic | Doc | When to consult |
| --- | --- | --- |
| Single / bulk send, validation, tracking, reply statuses, email log | [04-email-system.md](./04-email-system.md) | Composer, log table, reply UX, unified email log detail. |

## Assessment (Questions / Tests / Sessions)

| Topic | Doc | When to consult |
| --- | --- | --- |
| Question fields, types, code test cases, AI generation | [05-question-bank.md](./05-question-bank.md) | Question Bank screens, AI Magic Draft for questions. |
| Test settings, static vs dynamic composition, assignment rules, scoring | [06-test-management.md](./06-test-management.md) | Test list, test detail, "add to step" wiring. |
| Session types, status machine, timing, candidate management, integrity monitoring | [07-sessions.md](./07-sessions.md) | Submission / Session screens, candidate test-taking flow. |

## Template Library

| Topic | Doc | When to consult |
| --- | --- | --- |
| Section, Criteria / Scorecard, Job, Recruitment-Flow templates | [08-templates.md](./08-templates.md) | Any of the Template Library pages. |

## Surfaces / Audit

| Topic | Doc | When to consult |
| --- | --- | --- |
| Test list, Submission list, Session create / edit, Reviewer + Candidate views | [09-ui-screens.md](./09-ui-screens.md) | Need exact column / field set for an Assessment screen. |
| Audit, soft-delete, scheduler / cron rules | [10-data-integrity.md](./10-data-integrity.md) | Touching destructive actions, status transitions, or anything that should leave a trail. |
| Viewing-role / "view as" pattern | [12-viewing-role-pattern.md](./12-viewing-role-pattern.md) | Building any new page or surface — explains how to gate sidebar entries + page actions against the active role. |

---

## Universal mockup rules (always apply)

- **Whole-site mockup, not isolated flows.** Pages link to each other naturally; state persists across the session via the mock stores.
- **Business rules belong in the API layer too**, not just the UI — keeps cross-screen behaviour consistent.
- **Filter pattern**: every filter button anywhere in the app opens the shared `shared/ui/filter.tsx` modal. Never build a one-off filter UI. (Project-wide rule from CLAUDE.md.)
- **Soft-delete only** for records with historical submissions, candidates, or programs. Use `excluded=true + reason` rather than removal.
- **Every status change** is logged with actor, timestamp, previous status, new status, and reason — surface as a status history in detail panes when relevant.
