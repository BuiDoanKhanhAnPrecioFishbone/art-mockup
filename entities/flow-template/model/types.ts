import type { StepType } from "@/entities/program/model/workflow";

/** A flow template defines a starter set of stages and steps a program can
 *  begin from. The user is free to edit anything afterwards.
 *
 *  Per Doc 08.4: when applied to a program, stages and steps are
 *  **copied as a snapshot** — subsequent template changes do not
 *  affect the program. The library is therefore safe to evolve
 *  without retroactive risk. */
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

/** Status badge surfaced in the master library. `Default` flows are
 *  system-provided and cannot be deleted; `Active` flows can be
 *  applied to programs; `Archived` flows are hidden from the program
 *  setup picker but kept for historical reference. */
export type FlowTemplateStatus = "Default" | "Active" | "Archived";

export const FLOW_TEMPLATE_STATUSES: FlowTemplateStatus[] = [
  "Default",
  "Active",
  "Archived",
];

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  /** Coloured badge in the list. Newly-created flows default to
   *  `Active` (only one `Default` per platform). */
  status: FlowTemplateStatus;
  /** Free-form filter chips on the master library. */
  tags: string[];
  /** ISO timestamp the flow was first created. */
  createdAtISO: string;
  /** ISO timestamp of the most recent edit. */
  updatedAtISO: string;
  stages: FlowStageTemplate[];
}
