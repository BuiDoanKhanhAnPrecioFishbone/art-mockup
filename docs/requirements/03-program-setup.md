# 03 — Program Setup

> Index → [INDEX.md](./INDEX.md). Hierarchy + step types → [02-recruitment-program.md](./02-recruitment-program.md). Templates referenced here → [08-templates.md](./08-templates.md).

Programs are created from scratch or **cloned** from an existing
program. Cloning copies Program Info, Candidate Profile, Public Form
visibility, and Workflow structure — every piece is freely editable
afterwards.

## 3.1 Program Info tab

| Field | Required | Notes |
| --- | --- | --- |
| Program name | Yes | Display name; min 3 chars; unique within tenant. |
| Status | Yes | `Draft` or `Active` — Draft blocks candidate entry. |
| Headcount | Yes | Number of positions (≥ 1). |
| Period (start/end) | Yes | `end >= start`. |
| Folder link | No | Optional SharePoint / cloud URL. |
| Job template | Yes | Must reference a **Published** job template; triggers auto-fill. |

When a job template is selected, **a snapshot** is auto-copied: job
level, job description, skills set (must / nice / bonus), labels.
Edits to the program **do not write back to the template**.

## 3.2 Candidate Profile tab

Defines the data structure for each candidate in this program. Two
**system sections always present, cannot be deleted**:

| System Section | Default fields | Edit rules |
| --- | --- | --- |
| **General Information** | Full name, Email, Resume file, Data privacy consent | Can add Source / Phone / DOB; default fields cannot be edited or removed. |
| **Skills** | Auto-extracted from resume | Read-only — no edits allowed. |

HR can add custom sections (Education, Work Experience, Certificates,
Custom) using **Section Templates**. Section ordering:

- General Information always first (index 0).
- Skills always second (index 1).
- Custom sections freely reorderable from index 2+.

## 3.3 Public Form tab

| Feature | Description |
| --- | --- |
| **Show / hide sections** | Toggle entire sections from the candidate profile on/off in the public form. |
| **Show / hide fields** | Toggle individual fields within a visible section. |
| **Public link** | Shareable URL (job boards, social, email). |
| **Embed code (iframe)** | HTML snippet to embed on company website / internal job board. |

The public form **always mirrors** the candidate profile structure —
it cannot add fields not present in the profile. Hiding a field in the
public form does not remove it from the internal profile.

> Mockup-specific: General Information section is **mandatory** (cannot
> be hidden); other sections have an iOS-style toggle. Public Form's
> `Status` is **derived from Duration** (Active inside the date range,
> Scheduled before, Closed after) — there is no manual Draft / Active
> dropdown. Duration **defaults to inheriting** from the program's
> Hiring Period; user can override with an earlier end date.

## 3.4 Workflow tab

The workflow defines the pipeline candidates move through. Built from a
Flow Template (stages and steps copied as a snapshot — template changes
don't affect the program).

Each step has:

| Setting | Description |
| --- | --- |
| Step type | `Default (review)`, `Test`, or `Interview`. |
| Timeline | Deadline / SLA for completing this step. |
| Instruction | Guidance text shown to the reviewer. |
| Reviewer | Person(s) responsible for this step. |
| Email | Email template to send when the candidate enters this step. |

For **Interview** steps: HR can attach a Scorecard (criteria auto-loaded
from template) or add individual criteria. **Changing a scorecard clears
and replaces all existing criteria** — requires HR confirmation.

**Validation:** `reviewer_ids` on a step cannot be empty when the
program is Active. At least one stage and one step per stage required.

> Mockup-specific: Workflow has its own per-step Edit / Save model.
> Patches always go through (the per-tab Edit gate is bypassed for
> Workflow). Drag-drop is gated by tab-level Edit; clicking "Edit" on
> a step panel always enters step edit mode.
