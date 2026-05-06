"use client";

import {
  CalendarDays,
  CheckSquare,
  CircleDot,
  ChevronDown,
  Clock,
  CloudUpload,
  FileText,
  Hash,
  Lock,
  Mail,
  Phone,
  Type,
  AlignLeft,
  Link2,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ProfileFieldType } from "@/entities/section-template";

/** Lucide icon for each field type — used in the toolbox + per-field type
 *  selector. */
export function fieldTypeIcon(t: ProfileFieldType): React.ReactNode {
  switch (t) {
    case "text":
      return <Type size={14} />;
    case "textarea":
      return <AlignLeft size={14} />;
    case "email":
      return <Mail size={14} />;
    case "phone":
      return <Phone size={14} />;
    case "date":
      return <CalendarDays size={14} />;
    case "url":
      return <Link2 size={14} />;
    case "number":
      return <Hash size={14} />;
    case "select":
      return <ChevronDown size={14} />;
    case "file":
      return <CloudUpload size={14} />;
    case "radio":
      return <CircleDot size={14} />;
    case "checkbox":
      return <CheckSquare size={14} />;
    case "time":
      return <Clock size={14} />;
  }
}

/** Coloured tag pill — Pre-screening / Assessment etc. */
export function TagPill({ label }: { label: string }) {
  const lower = label.toLowerCase();
  const cls =
    lower === "pre-screening"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : lower === "assessment"
        ? "bg-violet-50 text-violet-700 border-violet-200"
        : "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium",
        cls
      )}
    >
      {label}
    </span>
  );
}

export function TypePill({ type }: { type: "system" | "custom" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        type === "system"
          ? "bg-blue-50 text-blue-700"
          : "bg-emerald-50 text-emerald-700"
      )}
    >
      {type === "system" ? (
        <>
          <Lock size={10} className="mr-1" /> System
        </>
      ) : (
        "Custom"
      )}
    </span>
  );
}

/** Render a non-editable preview of a field, used in the read-only
 *  detail view (and as the in-canvas preview row inside the editor). */
export function FieldPreview({
  label,
  type,
  required,
  options,
  locked,
  fileTypes,
  maxFiles,
  maxFileSizeMB,
}: {
  label: string;
  type: ProfileFieldType;
  required?: boolean;
  options?: string[];
  locked?: boolean;
  fileTypes?: string[];
  maxFiles?: number;
  maxFileSizeMB?: number;
}) {
  const labelEl = (
    <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
      {locked && <Lock size={11} className="ml-0.5 text-gray-400" />}
      <span className="ml-1 inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-gray-500">
        {fieldTypeIcon(type)}
      </span>
    </label>
  );

  const baseInput =
    "w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700";

  let control: React.ReactNode;
  switch (type) {
    case "textarea":
      control = (
        <textarea
          disabled
          rows={3}
          className={cn(baseInput, "resize-none")}
          placeholder="Long-form answer…"
        />
      );
      break;
    case "radio":
    case "checkbox":
      control = (
        <div className="space-y-1">
          {(options ?? []).slice(0, 5).map((o) => (
            <label
              key={o}
              className="flex items-center gap-1.5 text-xs text-gray-700"
            >
              <input
                type={type === "radio" ? "radio" : "checkbox"}
                disabled
                className="accent-violet-600"
              />
              {o}
            </label>
          ))}
          {(options?.length ?? 0) === 0 && (
            <p className="text-[11px] italic text-gray-400">No options yet</p>
          )}
        </div>
      );
      break;
    case "select":
      control = (
        <select disabled className={baseInput}>
          {(options ?? []).map((o) => (
            <option key={o}>{o}</option>
          ))}
          {(options?.length ?? 0) === 0 && (
            <option>(no options)</option>
          )}
        </select>
      );
      break;
    case "date":
      control = <input type="date" disabled className={baseInput} />;
      break;
    case "time":
      control = <input type="time" disabled className={baseInput} />;
      break;
    case "number":
      control = (
        <input type="number" disabled className={baseInput} placeholder="0" />
      );
      break;
    case "file":
      control = (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center text-[11px] text-gray-500">
          <FileText size={14} className="mx-auto mb-1 text-gray-400" />
          {fileTypes && fileTypes.length > 0
            ? `Allowed: ${fileTypes.join(", ").toUpperCase()}`
            : "Any file type"}
          {maxFileSizeMB ? ` · max ${maxFileSizeMB} MB` : ""}
          {maxFiles ? ` · up to ${maxFiles}` : ""}
        </div>
      );
      break;
    default:
      control = (
        <input
          type={
            type === "email" ? "email" : type === "phone" ? "tel" : "text"
          }
          disabled
          className={baseInput}
          placeholder={
            type === "email"
              ? "name@example.com"
              : type === "phone"
                ? "+1 555 …"
                : type === "url"
                  ? "https://…"
                  : "Short answer…"
          }
        />
      );
  }
  return (
    <div>
      {labelEl}
      {control}
    </div>
  );
}

