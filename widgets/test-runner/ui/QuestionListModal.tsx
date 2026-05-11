"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Question } from "@/entities/question";

/** Question Listing modal — wireframe nodes 3379:189915 (Grid) and
 *  3379:191306 (Listing). Anchored to the top-left, semi-transparent
 *  overlay over the test runner. Two view tabs share the same data:
 *  jump to the chosen question on click. */
export function QuestionListModal({
  questions,
  activeIdx,
  isAnswered,
  flagged,
  onJump,
  onClose,
}: {
  questions: Question[];
  activeIdx: number;
  isAnswered: (q: Question) => boolean;
  flagged: Record<string, boolean>;
  onJump: (i: number) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"grid" | "list">("grid");

  return (
    <div className="fixed inset-0 z-40 bg-black/40">
      <aside
        className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs + close */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 pt-3">
          <div className="flex gap-4 text-xs">
            <Tab
              active={tab === "grid"}
              onClick={() => setTab("grid")}
              label="Grid"
            />
            <Tab
              active={tab === "list"}
              onClick={() => setTab("list")}
              label="List"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {tab === "grid" ? (
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, i) => (
                <Pill
                  key={q.id}
                  index={i + 1}
                  active={i === activeIdx}
                  answered={isAnswered(q)}
                  flagged={!!flagged[q.id]}
                  onClick={() => onJump(i)}
                />
              ))}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {questions.map((q, i) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => onJump(i)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md border p-2 text-left transition-colors",
                      i === activeIdx
                        ? "border-violet-300 bg-violet-50"
                        : "border-transparent hover:bg-gray-50"
                    )}
                  >
                    <Pill
                      index={i + 1}
                      active={i === activeIdx}
                      answered={isAnswered(q)}
                      flagged={!!flagged[q.id]}
                    />
                    <span className="line-clamp-2 text-xs text-gray-700">
                      {i + 1}. {q.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination footer (decorative — list isn't actually paged
         *  in the demo). Mirrors the wireframe. */}
        <div className="flex justify-end gap-1 border-t border-gray-100 px-4 py-2">
          <button className="rounded p-1 text-gray-400" disabled>
            ‹
          </button>
          <button className="rounded p-1 text-gray-400" disabled>
            ›
          </button>
        </div>
      </aside>
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative pb-3 font-medium",
        active ? "text-violet-700" : "text-gray-500 hover:text-gray-700"
      )}
    >
      {label}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />
      )}
    </button>
  );
}

function Pill({
  index,
  active,
  answered,
  flagged,
  onClick,
}: {
  index: number;
  active: boolean;
  answered: boolean;
  flagged: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] font-semibold transition-colors",
        active
          ? "bg-violet-600 text-white"
          : answered
            ? "bg-green-500 text-white"
            : flagged
              ? "bg-amber-400 text-white"
              : "border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
      )}
    >
      {index}
    </button>
  );
}
