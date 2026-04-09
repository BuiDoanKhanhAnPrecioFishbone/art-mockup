import { NextResponse } from "next/server";

const drafts: Record<string, { subject: string; body: string }> = {
  interview: {
    subject: "Interview Invitation — {JobTitle} at {CompanyName}",
    body: `Dear {CandidateName},

I hope this message finds you well. After reviewing your profile and your impressive {Department} background, we would love to invite you to a technical interview for the {JobTitle} role at {CompanyName}.

📅 Interview Date: {InterviewDate}
🕐 Time: {InterviewTime}
📍 Format: {InterviewLocation}
⏱ Duration: {InterviewDuration}

Please confirm your availability by replying to this email. We can also accommodate a reschedule if needed.

Looking forward to a great conversation!

Best regards,
{SenderName}
{SenderTitle} · {CompanyName}`,
  },
  welcome: {
    subject: "Welcome to the Team, {CandidateName}! 🎉",
    body: `Dear {CandidateName},

On behalf of everyone at {CompanyName}, welcome to the team! We are absolutely thrilled to have you joining us as our new {JobTitle} in the {Department} team starting next Monday.

Here's a quick overview of your first day:
• 9:00 AM — Welcome breakfast & introductions
• 10:30 AM — IT setup & system access
• 12:00 PM — Lunch with your team
• 2:00 PM — Onboarding briefing with your manager

Please don't hesitate to reach out if you have any questions before your start date. We are here to make your transition as smooth as possible.

See you soon!

{SenderName}
{SenderTitle} · {CompanyName}
{CompanyWebsite}`,
  },
  default: {
    subject: "Regarding Your Application for {JobTitle}",
    body: `Dear {CandidateName},

Thank you for your interest in the {JobTitle} position at {CompanyName}. We appreciate the time you took to apply and are excited to share an update with you.

Our team has carefully reviewed your application and would like to move forward with the next steps in our selection process.

We will be in touch shortly with more details. In the meantime, feel free to visit {CompanyWebsite} to learn more about our culture and the team you'll be joining.

Best regards,
{SenderName}
{SenderTitle}
{CompanyName}`,
  },
};

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // Simulate AI "thinking" — pick a draft based on keywords in the prompt
  const lower = (prompt ?? "").toLowerCase();
  let draft = drafts.default;
  if (lower.includes("interview") || lower.includes("technical")) draft = drafts.interview;
  if (lower.includes("welcome") || lower.includes("onboard") || lower.includes("joining")) draft = drafts.welcome;

  return NextResponse.json(draft);
}
