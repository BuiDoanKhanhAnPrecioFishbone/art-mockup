# 06 — Test Management

> Index → [INDEX.md](./INDEX.md). Question types referenced here → [05-question-bank.md](./05-question-bank.md). Sessions that run a test → [07-sessions.md](./07-sessions.md).

## 6.1 Test settings

| Setting | Type / constraints | Notes |
| --- | --- | --- |
| Title | String, required | Test name. |
| Type | `Assessment` \| `Recruitment` | Recruitment type can be linked to a program step. |
| Status | `Draft` \| `Published` | **Published required** before assigning to a step. |
| Duration | Integer minutes, > 0 | Total time candidate has to complete the test. |
| Skill | Reference | Primary skill measured. |
| Pass Ratio | Integer 0–100 | Min score (%) to pass. |
| Allow Skip | Boolean, default false | Whether candidates can skip and return. |
| Composition Mode | `Static` \| `Dynamic` | **Set once; immutable** once any session has been created. |

## 6.2 Static selection

HR browses the question bank, filters by type / difficulty / tags / skill,
and picks specific questions. Every candidate gets the same set. Use
when consistency is required (compliance tests, standardised
assessments).

## 6.3 Dynamic selection

HR configures conditions; the system draws a random set per candidate
at test time.

| Step | What HR configures | Example |
| --- | --- | --- |
| 1. Pick a pool | Choose a list of questions to draw from. | All Python questions tagged Intern. |
| 2. Define conditions | Filters: type, difficulty, skill, tags. | Hard + Programming + Python. |
| 3. Set quantity | How many to pull per condition. | 3 questions. |
| 4. Add more conditions | Repeat for other categories. | 2 Easy Multiple Choice. |
| 5. Review total | System shows total = sum of all condition quantities. | 5 questions total. |

> Each candidate gets a **fresh random draw**. Quantity per condition
> cannot exceed the number of matching questions in the pool.

## 6.4 Test assignment rules

| Rule | Detail |
| --- | --- |
| **Only Published tests** | Draft tests cannot be assigned to a step. |
| **Step type must be Test** | Assigning to Default / Interview is a validation error. |
| **One test per step** | Each step holds at most one `test_id`; cannot change once any session has started. |
| **Shared across programs** | `test_id` isn't scoped to a single program — multiple programs can share one test. |

## 6.5 Scoring & pass/fail

| Question type | Who grades | How points are awarded |
| --- | --- | --- |
| **Code** | System (auto) | All private test cases must pass for full points. Partial credit: `(passed/total) × max_points × difficulty_multiplier`. |
| **Multiple Choice** | System (auto) | All correct selected AND no incorrect selected = full points; any mismatch = 0. |
| **Essay** | Human reviewer | Reviewer enters score 0–max_points; key ideas shown as guide. |
| **Rubric** | Human reviewer | Reviewer enters score 0–max_points using the rubric. |

> **Test preview**: Before publishing, HR can open the Preview tab to
> see exactly what a candidate will see. **Once any candidate has
> started, the test content is locked.**
