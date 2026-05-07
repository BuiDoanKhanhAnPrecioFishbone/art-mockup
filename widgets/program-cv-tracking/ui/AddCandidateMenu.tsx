"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileUp, Plus, User } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * Wireframe-faithful "+ Add New Candidate" button. Click opens a small
 * dropdown that lets the user pick between adding a single candidate
 * (single-CV upload + parse modal) or a bulk CV upload. Used from both
 * the CV Tracking tab and the Pipelines tab so the two flows feel the
 * same.
 */
export function AddCandidateMenu({
  onSingle,
  onBulk,
  disabled,
  title,
}: {
  onSingle: () => void;
  onBulk: () => void;
  disabled?: boolean;
  /** Tooltip when the button is disabled. */
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickAway(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        title={disabled ? title : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-violet-700",
          open && !disabled && "bg-violet-700"
        )}
      >
        <Plus size={16} />
        Add New Candidate
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && !disabled && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <MenuItem
            icon={<User size={14} />}
            onClick={() => {
              setOpen(false);
              onSingle();
            }}
          >
            Add Single Candidate
          </MenuItem>
          <MenuItem
            icon={<FileUp size={14} />}
            onClick={() => {
              setOpen(false);
              onBulk();
            }}
          >
            Bulk Upload CVs
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
    >
      <span className="text-gray-500">{icon}</span>
      {children}
    </button>
  );
}
