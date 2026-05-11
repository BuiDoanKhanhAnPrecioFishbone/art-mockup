"use client";

import { useEffect, useRef } from "react";
import type { Question } from "@/entities/question";

/** Plain-textarea code editor with a dark theme + line-number gutter.
 *  This is a wireframe-fidelity stand-in for a real Monaco / CodeMirror
 *  editor — good enough to demonstrate UX, layout, and state flow. */
export function CodeAnswer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Seed with the starter code if the candidate hasn't typed anything
   *  yet. (We intentionally don't overwrite a non-empty value.) */
  useEffect(() => {
    if (!value && question.code?.starter) {
      onChange(question.code.starter);
    }
  }, [question.id, value, onChange, question.code]);

  const lines = (value || "").split("\n");

  return (
    <div className="overflow-hidden rounded-md bg-[#1e1e1e] text-sm">
      <div className="flex max-h-[480px] overflow-auto">
        <div className="select-none border-r border-gray-700 bg-[#181818] py-3 text-right font-mono text-[12px] leading-5 text-gray-500">
          {lines.map((_, i) => (
            <div key={i} className="px-3">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 resize-none bg-[#1e1e1e] px-3 py-3 font-mono text-[12px] leading-5 text-gray-100 outline-none"
          rows={Math.max(20, lines.length + 2)}
        />
      </div>
    </div>
  );
}
