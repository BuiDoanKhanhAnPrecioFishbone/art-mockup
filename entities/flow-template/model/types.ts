import type { StepType } from "@/entities/program/model/workflow";

/** A flow template defines a starter set of stages and steps a program can
 *  begin from. The user is free to edit anything afterwards. */
export interface FlowStepTemplate {
  name: string;
  type: StepType;
  timelineDays: number;
  instruction?: string;
  /** For type === 'interview': pre-attach this scorecard template id. */
  scorecardTemplateId?: string;
  /** For type === 'test': pre-attach this set of test template ids. */
  testIds?: string[];
  /** Pre-assign reviewer ids on the resulting workflow step. */
  reviewerIds?: string[];
  /** Auto-allocate candidates round-robin between assigned reviewers. */
  autoAllocate?: boolean;
  /** Pre-attach an email template id for kick-off / reminder etc. */
  emailTemplateId?: string;
}

export interface FlowStageTemplate {
  name: string;
  steps: FlowStepTemplate[];
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  stages: FlowStageTemplate[];
}
