"use client";

import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  SESSION_STATUS_TONE,
  TEST_STATUS_TONE,
  type SessionStatus,
  type TestStatus,
  type TestType,
} from "@/entities/test";

export function StatusPill({ status }: { status: TestStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        TEST_STATUS_TONE[status]
      )}
    >
      {status}
    </span>
  );
}

export function TypePill({ type }: { type: TestType }) {
  return (
    <span className="inline-flex items-center rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-700">
      {type}
    </span>
  );
}

export function SessionStatusPill({ status }: { status: SessionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        SESSION_STATUS_TONE[status]
      )}
    >
      {status}
    </span>
  );
}

export function TagChips({ tags }: { tags: string[] }) {
  if (tags.length === 0) return <span className="text-xs text-gray-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-700"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export function ModalShell({
  title,
  onClose,
  footer,
  children,
  width = "max-w-3xl",
  headerTone = "default",
}: {
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  headerTone?: "default" | "violet";
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={cn(
          "mx-4 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl",
          width
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between border-b px-5 py-3",
            headerTone === "violet"
              ? "border-violet-700 bg-violet-600 text-white"
              : "border-gray-100 text-gray-900"
          )}
        >
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className={cn(
              "rounded p-0.5",
              headerTone === "violet"
                ? "text-white/80 hover:bg-white/10 hover:text-white"
                : "text-gray-400 hover:text-gray-700"
            )}
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
