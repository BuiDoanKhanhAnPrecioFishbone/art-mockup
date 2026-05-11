# 11 — End-to-End Flow

> Index → [INDEX.md](./INDEX.md). Use this as a sanity check that any new screen fits into the larger lifecycle.

| # | Stage | Who acts | What happens |
| --- | --- | --- | --- |
| 1 | Job template setup | HR | Define role title, level, description, skills (must / nice / bonus). [→ Templates](./08-templates.md) |
| 2 | Section templates | HR Admin | Configure reusable candidate profile sections + field components. [→ Templates](./08-templates.md) |
| 3 | Criteria & scorecards | HR Admin | Build evaluation criteria with behavioural guidelines; group into scorecards. [→ Templates](./08-templates.md) |
| 4 | Program creation | HR | Add new or clone existing program; select job template (auto-fills role details). [→ Program Setup](./03-program-setup.md) |
| 5 | Candidate profile config | HR | Choose / configure sections from the template library. [→ Program Setup](./03-program-setup.md) |
| 6 | Public form config | HR | Show / hide sections + fields; generate public link or embed. [→ Program Setup](./03-program-setup.md) |
| 7 | Workflow config | HR | Select flow template; edit stages, steps, reviewers, step settings. [→ Program Setup](./03-program-setup.md) |
| 8 | Candidate entry | System / HR / Candidate | Candidate submits via public form, SharePoint import, or manual entry — placed at step 1. [→ Recruitment](./02-recruitment-program.md) |
| 9 | Review CV | Reviewer (auto-assigned) | CV reviewed; qualified candidates promoted; rejected closed out. [→ Recruitment](./02-recruitment-program.md) |
| 10 | Test step | HR + Candidate | HR creates session; sends invitations; candidates take the test online. [→ Sessions](./07-sessions.md) · [→ Tests](./06-test-management.md) |
| 11 | Interview step | HR + Reviewer + Candidate | HR sends invitation email; reviewer scores using scorecard criteria. [→ Email](./04-email-system.md) · [→ Templates](./08-templates.md) |
| 12 | Final decision | HR | Offer or Reject; candidate moved or closed out. |

## Key invariants

> **Candidate assignment is always automatic** and always goes to the
> reviewer with the **fewest active candidates** at every step. HR can
> override manually, but the default keeps workload balanced. Implement
> this rule in the API layer (not just the UI) so cross-screen
> behaviour stays consistent.

> Step type is **immutable** once any candidate has entered or passed
> through that step.

> Test composition mode (`Static` / `Dynamic`) is **set once and
> immutable** after the first session is created.

> **Soft-delete only** for any record with historical submissions — use
> `excluded=true + reason`.
