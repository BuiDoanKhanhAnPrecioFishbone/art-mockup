export type FieldType =
  | "short-text"
  | "paragraph"
  | "number"
  | "dropdown"
  | "checkbox"
  | "file-upload";

export interface CustomField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface ApplicationFormConfig {
  jobId: string;
  jobTitle: string;
  department: string;
  status: "active" | "inactive" | "draft";
  startDate: string;
  endDate: string;
  publicUrl: string;
  embedCode: string;
  phoneRequired: boolean;
  sourceVisible: boolean;
  customFields: CustomField[];
}

export const applicationFormFixture: ApplicationFormConfig = {
  jobId: "req-12345",
  jobTitle: "Q1 Marketing Hiring",
  department: "Marketing",
  status: "active",
  startDate: "2026-03-24",
  endDate: "2026-04-30",
  publicUrl:
    "https://careers.preciofishbone.com/jobs/req-12345/apply",
  embedCode:
    '<iframe src="https://careers.preciofishbone.com/jobs/req-12345/apply?embed=true" width="100%" height="800px" frameborder="0"></iframe>',
  phoneRequired: false,
  sourceVisible: true,
  customFields: [],
};

export const SYSTEM_CORE_FIELDS = [
  { id: "full-name", label: "Full Name", locked: true },
  { id: "email", label: "Email Address", locked: true },
  { id: "phone", label: "Phone Number", locked: false, toggleKey: "phoneRequired" as const },
  { id: "source", label: "Source (How did you hear about us?)", locked: false, toggleKey: "sourceVisible" as const },
  { id: "resume", label: "Resume / CV (PDF, DOCX < 5 MB)", locked: true },
  { id: "privacy", label: "I agree to the Data Privacy Policy", locked: true },
] as const;

export const FIELD_TYPE_META: Record<
  FieldType,
  { label: string; icon: string; description: string }
> = {
  "short-text": {
    label: "Short Text",
    icon: "T",
    description: "Single-line answer",
  },
  paragraph: {
    label: "Paragraph",
    icon: "¶",
    description: "Multi-line answer",
  },
  number: {
    label: "Number",
    icon: "#",
    description: "Numeric answer",
  },
  dropdown: {
    label: "Dropdown",
    icon: "▾",
    description: "Pick one option",
  },
  checkbox: {
    label: "Checkbox",
    icon: "☑",
    description: "Multiple choice",
  },
  "file-upload": {
    label: "File Upload",
    icon: "↑",
    description: "Attachment upload",
  },
};
