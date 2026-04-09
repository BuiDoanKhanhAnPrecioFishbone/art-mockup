import type { TemplateVariable } from "@/shared/types/email";

export const templateVariables: TemplateVariable[] = [
  // Candidate
  { key: "{CandidateName}", label: "Candidate Name", example: "Nguyen Van A", category: "candidate" },
  { key: "{CandidateEmail}", label: "Candidate Email", example: "candidate@email.com", category: "candidate" },
  { key: "{CandidatePhone}", label: "Candidate Phone", example: "+84 901 234 567", category: "candidate" },
  // Job
  { key: "{JobTitle}", label: "Job Title", example: "Senior Product Designer", category: "job" },
  { key: "{Department}", label: "Department", example: "Product & Design", category: "job" },
  // Interview
  { key: "{InterviewDate}", label: "Interview Date", example: "Monday, April 7, 2025", category: "interview" },
  { key: "{InterviewTime}", label: "Interview Time", example: "10:00 AM (GMT+7)", category: "interview" },
  { key: "{InterviewLocation}", label: "Interview Location", example: "Google Meet — link will be shared", category: "interview" },
  { key: "{InterviewDuration}", label: "Interview Duration", example: "30 minutes", category: "interview" },
  // Company
  { key: "{CompanyName}", label: "Company Name", example: "Precio Fishbone VN", category: "company" },
  { key: "{CompanyWebsite}", label: "Company Website", example: "www.preciofishbone.com", category: "company" },
  // Sender
  { key: "{SenderName}", label: "Sender Name", example: "Tran Thi B", category: "sender" },
  { key: "{SenderTitle}", label: "Sender Title", example: "HR Manager", category: "sender" },
  { key: "{SenderEmail}", label: "Sender Email", example: "hr@preciofishbone.com", category: "sender" },
];
