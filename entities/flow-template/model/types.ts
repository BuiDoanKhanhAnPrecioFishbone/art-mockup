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
