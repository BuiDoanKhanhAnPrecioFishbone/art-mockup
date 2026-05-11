# 08 — Template Library

> Index → [INDEX.md](./INDEX.md). Where templates plug in: program setup → [03-program-setup.md](./03-program-setup.md). Email templates as used by the email system → [04-email-system.md](./04-email-system.md).

## 8.1 Section Templates

Reusable profile building blocks used when configuring the candidate
profile in a program. Two **system sections** are protected:

| System Section | Default fields | Edit rules |
| --- | --- | --- |
| **General Information** | Full name, Email, Resume file, Data privacy consent | Can add Source, Phone, DOB; default fields cannot be edited or deleted. |
| **Skills** | Auto-extracted from resume | Read-only — no edits allowed. |

Component toolbox — fields are added by **dragging components** into
the section canvas:

| Component | Input rendered | Supports options list |
| --- | --- | --- |
| `short_answer` | Single-line text input | No |
| `paragraph` | Multi-line textarea | No |
| `radio` | Radio button group | Yes — min 2 options |
| `checkbox` | Checkbox group | Yes — min 2 options |
| `dropdown` | Select dropdown | Yes — min 2 options |
| `file_upload` | File upload input | No |
| `date` | Date picker | No |
| `time` | Time picker | No |

> Field **name** is auto-generated on creation and **immutable**
> (snake_case, unique within section template). Field **title** is
> required and editable.

## 8.2 Criteria & Scorecard Templates

Used for **Interview** step evaluation. Reviewers use scorecards to
give structured, consistent feedback.

### Criterion Template fields

| Field | Required | Notes |
| --- | --- | --- |
| Name | Yes | Min 3 chars — short label (e.g. "Problem Solving"). |
| Description | Yes | Explains what this criterion measures. |
| Tags | No | Keywords for filtering / grouping. |
| Behavioral guideline | Yes | 5 bands covering scores 1–10 (defaults customisable; AI generation available). |
| Status | — | `Active` or `Archived`; Archived cannot be added to new scorecards. |

### Behavioural guideline bands

| Band | Score range | Default meaning |
| --- | --- | --- |
| Band 1 | 1 – 2 | Well below expectations. |
| Band 2 | 3 – 4 | Below expectations. |
| Band 3 | 5 – 6 | Meets expectations. |
| Band 4 | 7 – 8 | Exceeds expectations. |
| Band 5 | 9 – 10 | Exceptional performance. |

> **Scorecard Templates** group multiple criteria into a reusable
> evaluation package. Once a scorecard is referenced by at least one
> active step, its criteria list **cannot be modified**.

> Mockup-specific: the scorecard editor's "+ Add Criteria" is an
> **inline expanding combobox** (search + filter) — never a separate
> popup. Same pattern as the workflow's interview-step criteria
> picker. The criterion editor uses an "AI Auto-fill" button to
> populate the 5 guideline bands from a generic starter set when blank.

## 8.3 Job Templates

Define the standard configuration for a role. Required fields:
`job_title` and `job_level` (their combination is the unique selectable
label in program setup).

| Field | Required | Notes |
| --- | --- | --- |
| Job title | Yes | Min 2 chars — e.g. "Software Engineer". |
| Job level | Yes | e.g. Intern, Junior, Senior, Manager. |
| Description | No | Full job description. |
| Department | No | Org unit. |
| Location | No | Office or remote. |
| CV template | No | Document template to pre-format exported candidate CVs. |
| Employment type | No | Full-time, Part-time, Contract… |
| Status | — | `Draft` \| `Published` \| `Archived` — only Published appears in program setup. |

Skills are organised into three tiers:

| Tier | Meaning |
| --- | --- |
| **Must-have** | Non-negotiable — candidates without these are typically screened out. |
| **Nice-to-have** | Preferred but not blocking — higher ranking. |
| **Bonus** | Exceptional extras — rare skills that add significant value. |

> A skill **cannot appear in more than one tier** within the same job
> template (returns `409 Conflict` if duplicate detected). New skills
> typed by HR are created with `status=Pending` and must be approved by
> an admin before becoming official.

## 8.4 Recruitment Flow Templates

Define default stages and steps for a program's workflow. When
selected, stages and steps are **copied as a snapshot** — subsequent
template changes do not affect the program.
