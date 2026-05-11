# 04 — Email System

> Index → [INDEX.md](./INDEX.md). Where step emails are configured → [03-program-setup.md](./03-program-setup.md). Email templates themselves → [08-templates.md](./08-templates.md).

## 4.1 Sending

| Feature | Description |
| --- | --- |
| **Single send** | Send to one candidate. |
| **Bulk send** | Pick multiple candidates and send to all (batch job; partial failures allowed). |
| **Email editor** | HR composes via a form interface. |
| **Templates** | Pick from pre-built email templates or write custom content. |
| **Validation** | Each candidate's data is checked before send (issue column shows reason — e.g. missing email). |

> Mockup-specific: the **Send New Emails** button is a dropdown with
> two options — **Send to Candidate** and **Send to Reviewer**. Each
> opens the same compose page with `initialReceiverType` pre-set; the
> recipient picker (modal) swaps between Candidate table and Reviewer
> list accordingly. Compose page is two-column: form on the left,
> persistent recipients pane on the right.

## 4.2 Validation rules before send

- Candidate must have a valid, non-null email address.
- Candidate must be **Active** (not Rejected / Withdrawn).
- On failure: `email.status = Skipped`, issue column shows reason,
  original skipped record preserved for audit, HR can fix and resend.

## 4.3 Tracking

Per email:
- Whether the candidate **opened** the email.
- Whether the candidate **clicked** any link.
- Whether the candidate **replied**.

## 4.4 Reply status options

| Status | Meaning |
| --- | --- |
| **Accept** | Candidate confirmed attendance at the test or interview. |
| **Decline** | Candidate is unavailable or withdrawing. |
| **Reschedule** | Candidate wants a different time — HR follows up. |

## 4.5 Email Log tab

| Column | What it shows |
| --- | --- |
| Candidate | Recipient + which step the email belongs to. |
| Type | Single or Bulk send. |
| Status | Sent / Failed / Skipped. |
| Metrics (if enabled) | Open rate, Click rate, Reply rate. |

> Mockup-specific: log detail page lives at `/templates/email/logs/[id]`
> and is shared by both global Email Management logs AND program-scoped
> emails (the route adapts a `ProgramEmail` to the `EmailLog` shape on
> the fly when the id isn't in the global store). The **Resolve Issues
> ("Fix & Resend")** modal shows two sections: missing template
> variables (Skipped recipients) and bounced address fixes (Failed
> recipients). Save & Resend transitions the row to `delivered` and
> rolls the funnel counts forward.
