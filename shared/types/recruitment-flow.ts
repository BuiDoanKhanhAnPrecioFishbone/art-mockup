export type FlowStatus = "active" | "draft" | "archived";

export interface RecruitmentStage {
  id: string;
  name: string;
  description?: string;
  emailTemplateId?: string;
  emailTemplateName?: string;
  emailSubject?: string;
  emailBody?: string;
  order: number;
  isOutcome?: boolean; // true for Hired / Rejected (pinned, not draggable)
}

export interface RecruitmentFlow {
  id: string;
  name: string;
  description?: string;
  status: FlowStatus;
  stages: RecruitmentStage[];
  createdAt: string;
  updatedAt: string;
}
