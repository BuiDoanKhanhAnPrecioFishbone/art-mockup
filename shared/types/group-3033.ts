export type VariableStatus = "empty" | "invalid" | "resolved";

export interface TemplateVariable {
  key: string;          // e.g. "first_name"
  label: string;        // display label, e.g. "First Name"
  value: string;        // current user-entered value
  expectedPattern?: string; // optional validation hint shown to user
  status: VariableStatus;
}

export interface TemplateSection {
  id: string;
  type: "text" | "variable";
  content: string;      // raw text or variable key (without braces)
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyParts: TemplateSection[];
  variables: TemplateVariable[];
}
