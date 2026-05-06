"use client";

import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  QUESTION_TYPE_LABEL,
  TEST_RESULT_LABEL,
  type Difficulty,
  type QuestionStatus,
  type QuestionType,
  type TestCaseResult,
} from "@/entities/question";

export function TypePill({ type }: { type: QuestionType }) {
  return (
    <span className="inline-flex items-center rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-700">
      {QUESTION_TYPE_LABEL[type]}
    </span>
  );
}

export function DifficultyPill({ value }: { value: Difficulty }) {
  const cls =
    value === "Easy"
      ? "bg-green-50 text-green-700 border-green-200"
      : value === "Medium"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium",
        cls
      )}
    >
      {value}
    </span>
  );
}

export function StatusPill({ value }: { value: QuestionStatus }) {
  const cls =
    value === "Published"
      ? "bg-green-100 text-green-700"
      : value === "Draft"
        ? "bg-gray-100 text-gray-700"
        : "bg-amber-100 text-amber-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        cls
      )}
    >
      {value}
    </span>
  );
}

export function TagChips({
  tags,
  onRemove,
}: {
  tags: string[];
  onRemove?: (t: string) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-700"
        >
          {t}
          {onRemove && (
            <button
              onClick={() => onRemove(t)}
              className="text-gray-400 hover:text-red-600"
              aria-label={`Remove ${t}`}
            >
              <X size={9} />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

export function ResultPill({ result }: { result: TestCaseResult }) {
  const cls =
    result === "passed"
      ? "bg-green-100 text-green-700"
      : result === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold",
        cls
      )}
    >
      {TEST_RESULT_LABEL[result]}
    </span>
  );
}

/** Generic modal scaffolding. */
export function ModalShell({
  title,
  subtitle,
  onClose,
  footer,
  children,
  width = "max-w-xl",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={cn(
          "mx-4 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl",
          width
        )}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Simple monospace code box used by the (mock) editor and viewer. */
export function CodeBox({
  value,
  onChange,
  language,
  rows = 14,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  language?: string;
  rows?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-[#1e1e2e]">
      {language && (
        <div className="flex items-center justify-between border-b border-gray-700 bg-[#26263a] px-3 py-1.5 text-[11px] font-medium text-gray-300">
          <span>{language}</span>
          <span className="text-gray-500">
            {value.split("\n").length} lines
          </span>
        </div>
      )}
      <textarea
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        spellCheck={false}
        className={cn(
          "block w-full resize-none border-0 bg-[#1e1e2e] px-3 py-2 font-mono text-[12px] leading-5 text-gray-100 focus:outline-none",
          readOnly && "cursor-default"
        )}
      />
    </div>
  );
}
