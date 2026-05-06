import type { TestTemplate } from "../model/types";

const items: TestTemplate[] = [
  { id: "test-coding-basics", name: "Coding Basics — JS/TS", durationMinutes: 45, questionCount: 10, category: "Engineering" },
  { id: "test-coding-algorithms", name: "Algorithms & Data Structures", durationMinutes: 60, questionCount: 6, category: "Engineering" },
  { id: "test-system-design", name: "System Design Take-home", durationMinutes: 120, questionCount: 1, category: "Engineering" },
  { id: "test-marketing-quiz", name: "Marketing Fundamentals", durationMinutes: 30, questionCount: 20, category: "Marketing" },
  { id: "test-aptitude", name: "General Aptitude", durationMinutes: 40, questionCount: 30, category: "General" },
  { id: "test-english-comprehension", name: "English Comprehension", durationMinutes: 25, questionCount: 25, category: "General" },
];

export function listTestTemplates(): TestTemplate[] {
  return items;
}
