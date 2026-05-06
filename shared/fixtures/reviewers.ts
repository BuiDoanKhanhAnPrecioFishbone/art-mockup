export interface Reviewer {
  id: string;
  name: string;
  role: string;
}

export const REVIEWERS: Reviewer[] = [
  { id: "u-amelia", name: "Amelia Tran", role: "Recruiter" },
  { id: "u-marcus", name: "Marcus Lee", role: "Engineering Manager" },
  { id: "u-priya", name: "Priya Mehta", role: "Engineering Lead" },
  { id: "u-jonas", name: "Jonas Berg", role: "Product Manager" },
  { id: "u-sofia", name: "Sofia Andersson", role: "Marketing Lead" },
];
