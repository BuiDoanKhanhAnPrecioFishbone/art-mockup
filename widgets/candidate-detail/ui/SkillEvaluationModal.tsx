"use client";

import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { CandidateSkill } from "@/entities/candidate";

/** Skill Evaluation modal — wireframe `3228:222451`. Search field on
 *  top, then a scrollable list of `<skill name>     [1][2][3][4][5]`
 *  rows. The currently-selected score is filled violet; hovering over
 *  a number reveals a tooltip with the band label. */
export function SkillEvaluationModal({
  skills,
  onSave,
  onClose,
}: {
  skills: CandidateSkill[];
  onSave: (next: CandidateSkill[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CandidateSkill[]>(() =>
    skills.map((s) => ({ ...s }))
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return draft;
    return draft.filter((s) => s.name.toLowerCase().includes(q));
  }, [draft, query]);

  function setScore(skillId: string, score: number) {
    setDraft((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, score } : s))
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-violet-50 text-violet-600">
              📋
            </span>
            <h2 className="text-lg font-semibold text-gray-900">
              Skill Evaluation
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by skill name…"
              className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Skill rows */}
        <ul className="flex-1 overflow-y-auto px-6 py-3">
          {filtered.length === 0 ? (
            <li className="py-8 text-center text-sm text-gray-400">
              No skills match your search.
            </li>
          ) : (
            filtered.map((skill) => (
              <li
                key={skill.id}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <span className="text-sm text-gray-800">{skill.name}</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = skill.score === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setScore(skill.id, active ? 0 : n)}
                        title={SCORE_LABEL[n]}
                        className={cn(
                          "h-7 w-7 rounded border text-xs font-semibold transition-colors",
                          active
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50"
                        )}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/** Hover tooltip labels for the 1-5 scale (matches wireframe's
 *  "High Competence" hint on score 3+). */
const SCORE_LABEL: Record<number, string> = {
  1: "Beginner",
  2: "Working knowledge",
  3: "High Competence",
  4: "Strong proficiency",
  5: "Expert",
};
