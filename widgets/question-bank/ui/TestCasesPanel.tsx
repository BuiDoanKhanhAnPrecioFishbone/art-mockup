"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  HelpCircle,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  emptyTestCase,
  type CodePayload,
  type CodeTestCase,
  type Question,
} from "@/entities/question";
import { CodeBox, ModalShell, ResultPill } from "./pieces";

/**
 * Code test cases panel — multi-tab list of cases plus a result modal.
 * Wireframe: 3.1 / 3.2 / 3.3 / 3.4
 */
export function TestCasesPanel({
  question,
  onChange,
  readOnly,
}: {
  question: Question;
  onChange: (patch: Partial<Question>) => void;
  readOnly?: boolean;
}) {
  const code = question.code;
  const { showToast } = useToast();
  const [editing, setEditing] = useState<CodeTestCase | null>(null);
  const [creating, setCreating] = useState(false);
  const [resultOf, setResultOf] = useState<CodeTestCase | null>(null);

  if (!code) {
    return (
      <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
        Test cases are only available for code questions.
      </p>
    );
  }

  function patchCode(p: Partial<CodePayload>) {
    onChange({ code: { ...code!, ...p } });
  }

  function patchTestCase(id: string, patch: Partial<CodeTestCase>) {
    patchCode({
      testCases: code!.testCases.map((tc) =>
        tc.id === id ? { ...tc, ...patch } : tc
      ),
    });
  }

  function addTestCase(tc: CodeTestCase) {
    patchCode({ testCases: [...code!.testCases, tc] });
  }

  function deleteTestCase(id: string) {
    patchCode({ testCases: code!.testCases.filter((tc) => tc.id !== id) });
  }

  /** Mock "run" — pretend to execute and flip a random pass/fail. */
  async function runOne(tc: CodeTestCase): Promise<CodeTestCase> {
    patchTestCase(tc.id, { result: "not-run", resultMessage: undefined });
    await new Promise((r) => setTimeout(r, 350 + Math.random() * 300));
    const passed = Math.random() > 0.25;
    const next: CodeTestCase = {
      ...tc,
      result: passed ? "passed" : "failed",
      resultMessage: passed
        ? undefined
        : "Output did not match expected — check the assertion details.",
    };
    patchTestCase(tc.id, {
      result: next.result,
      resultMessage: next.resultMessage,
    });
    return next;
  }

  async function runAll() {
    showToast("success", `Running ${code!.testCases.length} test cases…`);
    for (const tc of code!.testCases) {
      // eslint-disable-next-line no-await-in-loop
      await runOne(tc);
    }
    const passed = code!.testCases.filter((t) => t.result === "passed").length;
    showToast("success", `${passed} / ${code!.testCases.length} passed.`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setCreating(true)}
          disabled={readOnly}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Plus size={13} />
          Add new testcase
        </button>
        <button
          onClick={runAll}
          disabled={code.testCases.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          <Play size={13} fill="currentColor" />
          Run all
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="p-3">Title</th>
              <th className="w-32 p-3">Result</th>
              <th className="w-32 p-3">Visible in Test</th>
              <th className="w-32 p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {code.testCases.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-12 text-center text-sm text-gray-400"
                >
                  No test cases yet — add one above.
                </td>
              </tr>
            ) : (
              code.testCases.map((tc) => (
                <tr
                  key={tc.id}
                  className="border-t border-gray-100 hover:bg-gray-50/60"
                >
                  <td className="p-3">
                    <p className="font-medium text-gray-900">{tc.title}</p>
                    {tc.description && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                        {tc.description}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setResultOf(tc)}
                      className="inline-flex items-center gap-1 hover:opacity-80"
                      title="View result detail"
                    >
                      <ResultPill result={tc.result} />
                      <HelpCircle size={11} className="text-gray-400" />
                    </button>
                  </td>
                  <td className="p-3">
                    <ToggleSwitch
                      on={tc.visibleInTest}
                      disabled={readOnly}
                      onChange={(v) =>
                        patchTestCase(tc.id, { visibleInTest: v })
                      }
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => void runOne(tc)}
                        disabled={readOnly}
                        className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                        title="Run this case"
                        aria-label={`Run ${tc.title}`}
                      >
                        <Play size={13} fill="currentColor" />
                      </button>
                      <button
                        onClick={() => setEditing(tc)}
                        disabled={readOnly}
                        className="rounded p-1.5 text-gray-500 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40"
                        title="Edit"
                        aria-label={`Edit ${tc.title}`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete test case "${tc.title}"?`))
                            deleteTestCase(tc.id);
                        }}
                        disabled={readOnly}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-40"
                        title="Delete"
                        aria-label={`Delete ${tc.title}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <TestCaseFormModal
          initial={editing ?? emptyTestCase()}
          isCreate={creating}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(tc) => {
            if (creating) addTestCase(tc);
            else patchTestCase(tc.id, tc);
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
      {resultOf && (
        <TestCaseResultModal
          tc={resultOf}
          onClose={() => setResultOf(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
 * Add / Edit test case modal
 * ============================================================ */

function TestCaseFormModal({
  initial,
  isCreate,
  onClose,
  onSave,
}: {
  initial: CodeTestCase;
  isCreate: boolean;
  onClose: () => void;
  onSave: (tc: CodeTestCase) => void;
}) {
  const [draft, setDraft] = useState<CodeTestCase>(initial);
  const valid =
    draft.title.trim().length > 0 && draft.executionLimitMs > 0;

  return (
    <ModalShell
      title={isCreate ? "Add new Test Case" : "Edit Test Case"}
      onClose={onClose}
      width="max-w-2xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={!valid}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        <Field label="Title" required>
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Short, descriptive title"
            className="input"
          />
        </Field>
        <Field label="Description" required>
          <textarea
            value={draft.description ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
            rows={3}
            placeholder="What does this test cover?"
            className="input resize-none"
          />
        </Field>
        <Field label="Execution limitation (ms)" required>
          <input
            type="number"
            min={1}
            value={draft.executionLimitMs}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                executionLimitMs: Math.max(1, Number(e.target.value) || 0),
              }))
            }
            className="input"
          />
        </Field>
        <Field
          label="Code here"
          hint="Setup or assertion code that is run against the candidate's solution."
        >
          <CodeBox
            value={draft.code}
            language="Test setup"
            rows={10}
            onChange={(v) => setDraft((d) => ({ ...d, code: v }))}
          />
        </Field>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
          <ToggleSwitch
            on={draft.visibleInTest}
            onChange={(v) => setDraft((d) => ({ ...d, visibleInTest: v }))}
          />
          Visible to candidate
          <span className="text-[11px] text-gray-500">
            (when off, the candidate sees the result but not the case
            itself)
          </span>
        </label>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(209 213 219);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
        }
        :global(.input:focus) {
          border-color: rgb(139 92 246);
          outline: none;
        }
      `}</style>
    </ModalShell>
  );
}

/* ============================================================
 * Result detail modal — Console / Message / Errors accordions
 * ============================================================ */

function TestCaseResultModal({
  tc,
  onClose,
}: {
  tc: CodeTestCase;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title="Test case Result"
      subtitle={tc.title}
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            Confirm
          </button>
        </>
      }
    >
      <div className="space-y-2 p-5">
        <div className="mb-3 flex items-center justify-between">
          <ResultPill result={tc.result} />
          <span className="text-[11px] text-gray-500">
            Limit: {tc.executionLimitMs}ms
          </span>
        </div>
        <Accordion label="Console" defaultOpen>
          <pre className="min-h-[120px] whitespace-pre-wrap rounded-md bg-gray-50 p-3 font-mono text-[11px] text-gray-700">
            {tc.result === "not-run"
              ? "(test has not been run)"
              : `> running test "${tc.title}"\n> finished in ${Math.round(
                  Math.random() * tc.executionLimitMs
                )}ms`}
          </pre>
        </Accordion>
        <Accordion label="Message">
          <p className="px-2 py-2 text-xs text-gray-700">
            {tc.resultMessage ?? "(no message)"}
          </p>
        </Accordion>
        <Accordion label="Errors">
          <p className="px-2 py-2 text-xs text-gray-700">
            {tc.result === "failed"
              ? tc.resultMessage ?? "(no error detail)"
              : "No errors."}
          </p>
        </Accordion>
      </div>
    </ModalShell>
  );
}

/* ============================================================
 * Small bits
 * ============================================================ */

function Accordion({
  label,
  children,
  defaultOpen,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="overflow-hidden rounded-md border border-gray-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold transition-colors",
          open ? "bg-violet-50 text-violet-700" : "bg-white text-gray-700 hover:bg-gray-50"
        )}
      >
        {label}
        <span className="text-gray-400">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="border-t border-gray-100 bg-white">{children}</div>}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {hint && (
          <span title={hint} className="cursor-help text-gray-400">
            <HelpCircle size={11} />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        on ? "bg-violet-600" : "bg-gray-300",
        disabled && "opacity-50"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
          on ? "translate-x-4" : "translate-x-0.5"
        )}
      />
      <span className="sr-only">{on ? "Visible" : "Hidden"}</span>
      {on ? (
        <Eye
          size={9}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-white"
          aria-hidden
        />
      ) : (
        <EyeOff
          size={9}
          className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500"
          aria-hidden
        />
      )}
    </button>
  );
}
