import type { EmailTemplate } from "@/shared/types/email";

export const emailTemplates: EmailTemplate[] = [
  {
    id: "tpl-1",
    name: "Interview Invitation",
    subject: "Interview Invitation — {JobTitle} at {CompanyName}",
    body: `Dear {CandidateName},

We are pleased to invite you for an interview for the {JobTitle} position at {CompanyName}.

📅 Date: {InterviewDate}
🕐 Time: {InterviewTime}
📍 Location: {InterviewLocation}
⏱ Duration: {InterviewDuration}

Please confirm your availability by replying to this email. If the proposed time doesn't work for you, let us know and we'll find an alternative.

We look forward to speaking with you and learning more about your experience.

Best regards,
{SenderName}
{SenderTitle}
{CompanyName}`,
    status: "active",
    usedInWorkflow: "Technical Interview — Round 1",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-03-10T11:30:00Z",
  },
  {
    id: "tpl-2",
    name: "Welcome Onboarding",
    subject: "Welcome to {CompanyName}, {CandidateName}!",
    body: `Dear {CandidateName},

Welcome aboard! We are thrilled to have you joining the {Department} team as a {JobTitle}.

Here's what to expect on your first day:
- 9:00 AM — Office orientation & team introductions
- 10:30 AM — IT setup & tools walkthrough
- 12:00 PM — Team lunch 🎉
- 2:00 PM — Role briefing with your manager

Please bring a valid ID for HR documentation. If you have any questions before your start date, don't hesitate to reach out.

See you soon!

{SenderName}
{SenderTitle}
{CompanyName}`,
    status: "active",
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-02-28T15:00:00Z",
  },
  {
    id: "tpl-3",
    name: "Application Received",
    subject: "We received your application — {JobTitle}",
    body: `Dear {CandidateName},

Thank you for applying for the {JobTitle} position at {CompanyName}.

We have received your application and our team is currently reviewing all submissions. We will be in touch within 5–7 business days with an update on the next steps.

In the meantime, feel free to learn more about us at {CompanyWebsite}.

Thank you for your interest in joining our team.

Best regards,
{SenderName}
{CompanyName}`,
    status: "draft",
    createdAt: "2025-02-05T08:00:00Z",
    updatedAt: "2025-02-05T08:00:00Z",
  },
  {
    id: "tpl-4",
    name: "Offer Letter Notification",
    subject: "Offer Letter — {JobTitle} at {CompanyName}",
    body: `Dear {CandidateName},

We are excited to extend an offer for the {JobTitle} role at {CompanyName}. Please find the official offer letter attached to this email.

Kindly review the details and sign the document by the deadline indicated. Should you have questions, do not hesitate to contact us at {SenderEmail}.

We look forward to welcoming you to the team!

Warm regards,
{SenderName}
{SenderTitle}`,
    status: "draft",
    createdAt: "2025-03-01T12:00:00Z",
    updatedAt: "2025-03-15T09:45:00Z",
  },
];
