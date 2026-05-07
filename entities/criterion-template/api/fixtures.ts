import type { CriterionTemplate } from "../model/types";

const items: CriterionTemplate[] = [
  // ---- Tech ----
  { id: "ct-system-architecture", name: "System Architecture", weight: 5, categories: ["Tech"] },
  { id: "ct-react-ecosystem", name: "React Ecosystem", weight: 4, categories: ["Tech"] },
  { id: "ct-database-design", name: "Database Design", weight: 4, categories: ["Tech", "Product"] },
  { id: "ct-api-design", name: "API Design", weight: 4, categories: ["Tech", "Product"] },
  { id: "ct-coding-ability", name: "Coding Ability", weight: 5, categories: ["Tech"] },
  { id: "ct-code-review", name: "Code Review", weight: 3, categories: ["Tech", "Soft"] },
  { id: "ct-data-modeling", name: "Data Modeling", weight: 4, categories: ["Tech", "Cognitive"] },
  { id: "ct-testing-discipline", name: "Testing Discipline", weight: 3, categories: ["Tech"] },

  // ---- Cognitive ----
  { id: "ct-problem-solving", name: "Problem Solving", weight: 5, categories: ["Cognitive"] },
  { id: "ct-analytical-thinking", name: "Analytical Thinking", weight: 4, categories: ["Cognitive"] },
  { id: "ct-creativity", name: "Creativity", weight: 4, categories: ["Cognitive", "Product"] },

  // ---- Soft ----
  { id: "ct-communication", name: "Communication", weight: 4, categories: ["Soft"] },
  { id: "ct-collaboration", name: "Collaboration", weight: 4, categories: ["Soft"] },
  { id: "ct-presentation", name: "Presentation Skills", weight: 3, categories: ["Soft"] },
  { id: "ct-leadership", name: "Leadership", weight: 4, categories: ["Soft", "Behavioral"] },

  // ---- Behavioral ----
  { id: "ct-ownership", name: "Ownership", weight: 4, categories: ["Behavioral"] },
  { id: "ct-growth-mindset", name: "Growth Mindset", weight: 3, categories: ["Behavioral"] },
  { id: "ct-values-alignment", name: "Alignment with Values", weight: 4, categories: ["Behavioral"] },

  // ---- Product ----
  { id: "ct-customer-focus", name: "Customer Focus", weight: 4, categories: ["Product", "Soft"] },
  { id: "ct-product-sense", name: "Product Sense", weight: 4, categories: ["Product"] },
  { id: "ct-brand-sense", name: "Brand Sense", weight: 3, categories: ["Product"] },
  { id: "ct-domain-knowledge", name: "Domain Knowledge", weight: 4, categories: ["Product"] },
  { id: "ct-results-delivered", name: "Results Delivered", weight: 4, categories: ["Product"] },
];

export function listCriterionTemplates(): CriterionTemplate[] {
  return items;
}

export function getCriterionTemplate(id: string): CriterionTemplate | undefined {
  return items.find((c) => c.id === id);
}
