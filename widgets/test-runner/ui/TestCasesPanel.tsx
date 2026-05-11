"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Question } from "@/entities/question";

/** Bottom Test-Cases panel — wireframe nodes 2435:76737 collapsed and
 *  2435:76482 expanded. Lives under the code editor and mirrors the
 *  Test Cases tab from the question editor. Cases marked
 *  `visibleInTest: false` are hidden from the candidate. */
export function TestCasesPanel({
  question,
  expanded,
  onToggle,
}: {
  question: Question;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cases = (question.code?.testCases ?? []).filter(
    (c) => c.visibleInTest
  );
  const [tab, setTab] = useState<"test-code" | "output">("test-code");
  const [running, setRunning] = useState(false);
  const [openCase, setOpenCase] = useState<string | null>(
    cases[0]?.id ?? null
  );

  // Demo "run" — flips a transient running state then keeps the seeded
  // results.
  function run() {
    setRunning(true);
    setTab("output");
    window.setTimeout(() => setRunning(false), 700);
  }

  const failed = cases.filter((c) => c.result === "failed").length;
  const total = cases.length;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Test Cases</h3>
          {failed > 0 && (
            <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
              Failed {failed} of {total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-60"
          >
            <Play size={12} />
            {running ? "Running…" : expanded ? "Run again" : "Run Test Case"}
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="rounded p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-3">
          {/* Tabs */}
          <div className="mb-3 flex gap-4 border-b border-gray-100 text-xs">
            <TabButton
              active={tab === "test-code"}
              onClick={() => setTab("test-code")}
              label="Test Code"
            />
            <TabButton
              active={tab === "output"}
              onClick={() => setTab("output")}
              label="Output"
            />
          </div>

          {tab === "test-code" ? (
            <pre className="max-h-72 overflow-auto rounded-md bg-[#1e1e1e] p-3 font-mono text-[11px] leading-5 text-gray-100">
              {cases
                .map((c, i) => `// ${i + 1}. ${c.title}\n${c.code}`)
                .join("\n\n") || "// No visible test cases."}
            </pre>
          ) : (
            <ul className="space-y-2">
              {cases.map((c) => {
                const open = openCase === c.id;
                return (
                  <li
                    key={c.id}
                    className="overflow-hidden rounded-md border border-gray-200"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenCase(open ? null : c.id)}
                      className={cn(
                        "flex w-full items-center justify-between border-l-4 px-3 py-2 text-left text-xs",
                        c.result === "failed"
                          ? "border-red-500 bg-red-50/40"
                          : c.result === "passed"
                            ? "border-emerald-500 bg-emerald-50/40"
                            : "border-violet-400"
                      )}
                    >
                      <span className="font-medium text-gray-800">
                        {c.title}
                      </span>
                      {open ? (
                        <ChevronDown size={14} className="text-gray-400" />
                      ) : (
                        <ChevronUp size={14} className="text-gray-400" />
                      )}
                    </button>
                    {open && (
                      <div className="border-t border-gray-100 bg-white px-3 py-3 text-[11px] text-gray-700">
                        <div className="space-y-2">
                          <ResultRow
                            label="Result"
                            value={c.result}
                            tone={
                              c.result === "failed"
                                ? "red"
                                : c.result === "passed"
                                  ? "green"
                                  : "gray"
                            }
                          />
                          {c.resultMessage && (
                            <ResultRow label="Errors" value={c.resultMessage} />
                          )}
                          {c.description && (
                            <ResultRow label="Message" value={c.description} />
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
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
        "relative pb-2 font-medium",
        active ? "text-violet-700" : "text-gray-500 hover:text-gray-700"
      )}
    >
      {label}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-violet-600" />
      )}
    </button>
  );
}

function ResultRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "red" | "green" | "gray";
}) {
  return (
    <div>
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wide",
          tone === "red"
            ? "text-red-600"
            : tone === "green"
              ? "text-emerald-600"
              : "text-gray-400"
        )}
      >
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-line font-mono text-[11px] text-gray-800">
        {value}
      </p>
    </div>
  );
}
