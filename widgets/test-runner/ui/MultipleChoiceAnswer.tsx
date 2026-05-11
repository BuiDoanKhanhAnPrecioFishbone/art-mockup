"use client";

import { cn } from "@/shared/lib/cn";
import type { Question } from "@/entities/question";

/** Multi-choice answer panel — wireframe node 2435:75777. Vertical
 *  list of letter-prefixed options; the selected option is outlined in
 *  green. Honours the question's `multiSelect` flag. */
export function MultipleChoiceAnswer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const opts = question.multipleChoice?.options ?? [];
  const multi = !!question.multipleChoice?.multiSelect;

  function toggle(id: string) {
    if (multi) {
      onChange(
        value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
      );
    } else {
      onChange([id]);
    }
  }

  return (
    <ul className="space-y-2">
      {opts.map((opt, i) => {
        const selected = value.includes(opt.id);
        const letter = String.fromCharCode(97 + i);
        return (
          <li key={opt.id}>
            <button
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                "block w-full rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                selected
                  ? "border-emerald-400 bg-emerald-50 text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              )}
            >
              <span className="text-gray-500">{letter}.</span> {opt.text}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
