export interface ScorecardCriterionTemplate {
  id: string;
  name: string;
  weight: number;
  description?: string;
}

export interface ScorecardTemplate {
  id: string;
  name: string;
  description: string;
  criteria: ScorecardCriterionTemplate[];
}
