"use client";

import { Sparkles, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { CV_STATUS_LABEL, type CVStatus } from "@/entities/cv-record";

/* Status badge — colour-coded per the wireframe. */
export function CVStatusBadge({
  status,
  compact,
}: {
  status: CVStatus;
  compact?: boolean;
}) {
  const cls =
    status === "done"
      ? "bg-green-100 text-green-700"
      : status === "extracting"
        ? "bg-violet-100 text-violet-700"
        : status === "needs-review"
          ? "bg-amber-100 text-amber-700"
          : status === "duplicate"
            ? "bg-orange-100 text-orange-700"
            : "bg-red-100 text-red-700";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        cls
      )}
    >
      {status === "extracting" && <Sparkles size={11} />}
      {CV_STATUS_LABEL[status]}
    </span>
  );
}

/* Skill chip with the three-state colouring from the wireframe sticky:
 *   - in program skill set         → green
 *   - in master library, not in set → purple
 *   - not in master library         → grey/danger */
export interface SkillChipProps {
  name: string;
  inProgramSkillSet: boolean;
  inLibrary: boolean;
  onRemove?: () => void;
  count?: string;
}
export function SkillChip({
  name,
  inProgramSkillSet,
  inLibrary,
  onRemove,
  count,
}: SkillChipProps) {
  const cls = inProgramSkillSet
    ? "border-green-300 bg-green-50 text-green-700"
    : inLibrary
      ? "border-violet-300 bg-violet-50 text-violet-700"
      : "border-gray-300 bg-gray-50 text-gray-600";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        cls
      )}
    >
      {name}
      {count && (
        <span
          className={cn(
            "rounded-full px-1.5 text-[10px] font-semibold",
            inProgramSkillSet
              ? "bg-green-200 text-green-900"
              : inLibrary
                ? "bg-violet-200 text-violet-900"
                : "bg-gray-200 text-gray-700"
          )}
        >
          {count}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="rounded-full p-0.5 opacity-60 hover:bg-black/5 hover:opacity-100"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

/* Modal scaffolding. */
export function ModalShell({
  title,
  subtitle,
  onClose,
  footer,
  children,
  width = "max-w-3xl",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer: React.ReactNode;
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
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3">
          {footer}
        </div>
      </div>
    </div>
  );
}

/* Format an ISO timestamp the way the wireframe shows it: "8:20 AM, 12/2/2025". */
export function formatAdded(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const time = d
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .toUpperCase();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${time}, ${dd}/${mm}/${yyyy}`;
}
