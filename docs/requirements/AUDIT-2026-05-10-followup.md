# Audit Follow-up — Gap Closures

> Closed against `AUDIT-2026-05-10.md`. All 10 prioritised gaps landed in this pass.

## Gap closures

### ✅ Gap 1 — Session status machine
- `SessionStatus` rewritten to `Upcoming | Active | Closing | Completed | Cancelled` (`entities/test/model/types.ts`).
- New `canTransitionSession(type, from, to)` + `nextSessionStatuses()` helpers enforce the spec's per-type transition matrix (Doc 07 §7.3).
- New session POST defaults to `Upcoming`. Tone map updated. Eight seed sessions span every status / type combination so the new Submission List has data to render.

### ✅ Gap 2 — Submission flow scaffolding
- `/submissions` is now a real Submission List page (was a placeholder) — sessions across the platform with search, filter, status pills, access codes, window, submission counts.
- New per-session page at `/submissions/[sessionId]` — Submission Candidates view with score bars, status badges, integrity status, force-submitted markers.
- New per-candidate page at `/submissions/[sessionId]/[submissionId]` — Submission Detail with Test Result Overview, Skill Performance bars, Integrity Summary, Question Submission table, Final Review picker, AI Review panel, Timing block.
- New API routes `GET /api/submissions` + `GET /api/submissions/[sessionId]`. Sidebar Submission entry restored.

### ✅ Gap 3 — Auto-assignment algorithm
- New `entities/candidate/api/auto-assign.ts` — `autoAssignNewEntry(program, candidates)` and `pickReviewer(step, stage, candidates)`. Implements "fewest active candidates, tie-break by lower id" (Doc 02 §2.4).
- Wired into `POST /api/candidates`, `POST /api/cvs/[id]/promote`, and `PATCH /api/candidates/[id]` (when `currentStepId/currentStageId` changes).
- Server-enforced first-step-of-first-stage invariant on every entry route.
- 409 returned when a target step has no reviewers configured.

### ✅ Gap 4 — Candidate statuses + Undo Reject
- `CandidateStatus` extended with `withdrawn` and `completed` (`entities/candidate/model/types.ts`).
- New `INACTIVE_CANDIDATE_STATUSES` constant — auto-assign now excludes all three (rejected/withdrawn/completed) from the workload count.
- `ChangeStatusModal` surfaces all five statuses with descriptions; reason is required for Reject + Withdraw.
- `CandidateDetailPanel` shows an `↺ Undo Reject` button only when status is `rejected`; PATCH triggers the auto-assign hook.
- `StatusBadge` colours updated for the new statuses.

### ✅ Gap 5 — Integrity monitoring
- `Submission.integrity` typed with the five spec counters (leavingTabCount / copyPasteCount / devtoolsOpenCount / multiInstanceCount / multiMonitorFlag), plus `forceSubmitted`, `excludeReason`, `finalReview`, `skillBreakdown`, `questionResults`, `aiReviewerNotes`.
- New `deriveIntegrityStatus()` helper returns `Undetected | Cheating` based on per-counter thresholds.
- Seeded 10 submissions with realistic integrity payloads (clean / multi-event / DevTools-opened / multi-monitor) so the Submission Detail screens render full integrity summaries.

### ✅ Gap 6 — Job template Status + skill tiers
- `JobTemplate.status: "Draft" | "Published" | "Archived"` added; each `Skill` now carries a `tier: "must-have" | "nice-to-have" | "bonus"`.
- New `listPublishedJobTemplates()` + `findSkillTierConflict()` helpers.
- `GET /api/job-templates` returns Published-only by default (Program Info picker rule, Doc 03 §3.1); `?status=all` opt-out for admin surfaces.
- `validateForPublish` now checks: title min-3-chars, `endDate >= startDate`, `jobTemplateId` required.
- `ProgramInfoTab.applyTemplate` copies the template's per-skill tier into the program's skills bucket instead of defaulting all to `must-have`.
- Five seed templates spanning every status (Draft / Published / Archived).
- Demo-reset wired to re-seed the job-templates store.

### ✅ Gap 7 — Immutability checks
- `PATCH /api/tests/[id]` rejects changes to `compositionMode` once any session exists (409, Doc 06 §6.1).
- `PATCH /api/questions/[id]` rejects changes to `type` once a Published test references the question (409, Doc 05 §5.1).
- `PATCH /api/programs/[id]` rejects changes to a step's `type` while any candidate currently sits in that step (409, Doc 02 §2.2).

### ✅ Gap 8 — Reply statuses + send-time email validation
- `CandidateEmailReply.status: "Accept" | "Decline" | "Reschedule"` added; tooltip in the pipeline now renders a coloured pill per reply.
- Existing seeded replies tagged (Bao = Accept, Anh = Reschedule, Olivia ×2 = Accept).
- `ProgramEmailRecipient` extended with `deliveryStatus + issueReason` (and the matching `ProgramEmailDeliveryStatus` type).
- `POST /api/program-emails` runs `classifyRecipients()` at send time — flags missing/invalid email and inactive candidates as `skipped` with a real reason; mock failure rate marks 2% as `failed` with a bounce reason.
- Email log detail page now prefers per-recipient `deliveryStatus + issueReason` and only falls back to count-bucketing for legacy seeded rows.

### ✅ Gap 9 — Audit trail + soft-delete
- New shared `StatusEvent<TStatus>` + `ExclusionMarker` types at `shared/types/audit.ts`, plus a `newStatusEvent()` factory.
- `Candidate.statusHistory: StatusEvent<CandidateStatus>[]` and `Candidate.excluded?: ExclusionMarker` added.
- Candidate PATCH appends a status event whenever `status` changes (actor, timestamp, prev → new, reason from `stepResult`).
- `CandidateDetailPanel` renders a Status History list (most-recent first) with reason and actor.

### ✅ Gap 10 — Section template min-2-options + immutable name
- `ProfileField.name?: string` added — auto-generated `snake_case` slug of the initial label.
- New `slugifyFieldName(label)` and `validateProfileField(field)` helpers.
- `newCustomField(type)` pre-seeds 2 options for radio/checkbox/select (so they pass validation immediately).
- Section editor (`SectionEditor.tsx`) blocks Save when any field's options are < 2 — surfaces the offending field's label.
- `POST /api/section-templates` and `PATCH /api/section-templates/[id]` enforce both rules server-side; PATCH preserves each field's existing `name` so the immutability rule survives client-side edits.

---

## Build status
- `npm run type-check`: clean.
- `npm run build`: clean.
