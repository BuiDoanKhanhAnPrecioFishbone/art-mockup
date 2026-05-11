# 05 — Question Bank

> Index → [INDEX.md](./INDEX.md). How questions get into a test → [06-test-management.md](./06-test-management.md).

The question bank is a **reusable library**. Questions can be shared
across multiple tests and programs.

## 5.1 Question fields

| Field | Type / constraints | Purpose |
| --- | --- | --- |
| Title | String, min 3 chars, required | Short name shown in search and lists. |
| Type | `Code` \| `MultipleChoice` \| `Essay` \| `Rubric` | Determines answer format; **immutable after first use in a Published test**. |
| Difficulty | `Easy` \| `Medium` \| `Hard` | Affects points weighting. |
| Tags | `string[]`, optional | Keywords for filtering when building tests. |
| Status | `Draft` \| `Published` | Draft = not usable in tests. |
| AI Generated | Boolean | Flags whether AI-created. |
| Content | Type-specific | Question text, options, test cases, or rubric. |

## 5.2 Question types

| Type | How it works | Best for |
| --- | --- | --- |
| **Code** | Candidate writes code in an editor. HR provides template + public/private test cases. System runs code to validate. | Technical / programming roles. |
| **Multiple Choice** | Candidate picks from options. HR marks correct answers (multiple correct supported). | Fast screening, knowledge checks. |
| **Essay** | Candidate writes free-text. HR provides key ideas as a grading guide. | Soft-skill / opinion. |
| **Rubric** | HR defines a scoring rubric. Reviewer grades using it. | Structured evaluation. |

## 5.3 Code question — test cases

- **Public test cases** — visible to the candidate while coding.
- **Private test cases** — hidden; used only for scoring.
- **AI-generated test cases** — system can auto-suggest; flagged
  `ai_generated_cases = true` until HR manually verifies each one.

## 5.4 AI-Assisted question creation

| Step | What HR does |
| --- | --- |
| 1. Set parameters | Type, Difficulty, Tags, short description of what to test. |
| 2. Generate | Click Generate — AI returns a complete question with answer options or test cases. |
| 3. Review & edit | HR reviews the output and edits any part before saving. |
| 4. Save | Question added to the bank like any manually created question. |

> AI generation is a **starting point**, not the final word. HR always
> reviews and approves before saving. The generated question is **not**
> saved automatically.
