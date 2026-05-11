import type { StepType } from "@/entities/program/model/workflow";

/** Re-usable step blueprint — saved into the master library via
 *  `Save Step to Library` from a workflow canvas. Picking one in the
 *  search-then-create combobox snapshots its config into the
 *  consumer (program workflow / flow template). */
export interface StepTemplate {
  id: string;
  name: string;
  type: StepType;
  timelineDays: number;
  instruction?: string;
  reviewerIds?: string[];
  emailTemplateId?: string;
  scorecardTemplateId?: string;
  testIds?: string[];
  /** Free-form filter chips. */
  tags: string[];
  createdAtISO: string;
  updatedAtISO: string;
}

/** Where a step template is currently used — surfaced on the master
 *  library page + the delete confirm. */
export interface StepTemplateUsage {
  flowTemplateIds: string[];
  programIds: string[];
}
