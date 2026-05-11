import type { StepType } from "@/entities/program/model/workflow";

/** Reusable stage blueprint — saved into the master library via
 *  `Save Stage to Library` from a workflow canvas. Picking one in
 *  the program / flow editor snapshots the stage AND each child
 *  step's config into the consumer (Doc 08.4: snapshot-on-apply,
 *  no retroactive sync). */
export interface StageTemplate {
  id: string;
  name: string;
  /** Free-form filter chips. */
  tags: string[];
  /** Optional description shown in the library + "Currently used in"
   *  callouts. */
  description?: string;
  /** Step blueprints embedded directly — independent of the step
   *  master library. When the user re-saves a step that came from
   *  the step library, they're modifying THIS embedded copy only,
   *  not the original. */
  steps: StageTemplateStep[];
  createdAtISO: string;
  updatedAtISO: string;
}

export interface StageTemplateStep {
  /** ID of the saved Step Template this slot was cloned from, when
   *  the stage was assembled by picking from the Step library. Lets
   *  us surface "Cloned from <library entry>" hints in the editor. */
  fromStepTemplateId?: string;
  name: string;
  type: StepType;
  timelineDays: number;
  instruction?: string;
  emailTemplateId?: string;
  scorecardTemplateId?: string;
  testIds?: string[];
  reviewerIds?: string[];
}
