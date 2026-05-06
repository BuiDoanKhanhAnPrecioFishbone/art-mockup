import type { CriterionTemplate } from "../model/types";

const items: CriterionTemplate[] = [
  { id: "ct-leadership", name: "Leadership", weight: 4, category: "General" },
  { id: "ct-ownership", name: "Ownership", weight: 4, category: "General" },
  { id: "ct-customer-focus", name: "Customer focus", weight: 4, category: "General" },
  { id: "ct-attention-detail", name: "Attention to detail", weight: 3, category: "General" },
  { id: "ct-presentation", name: "Presentation skills", weight: 3, category: "Soft skills" },
  { id: "ct-domain-knowledge", name: "Domain knowledge", weight: 4, category: "Role-specific" },
  { id: "ct-data-skills", name: "Data analysis skills", weight: 4, category: "Role-specific" },
  { id: "ct-product-sense", name: "Product sense", weight: 4, category: "Role-specific" },
];

export function listCriterionTemplates(): CriterionTemplate[] {
  return items;
}
