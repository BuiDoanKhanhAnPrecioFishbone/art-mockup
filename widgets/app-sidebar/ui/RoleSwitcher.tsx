"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Eye } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { SystemRole } from "@/entities/system-role";

/** "View as: <Role>" dropdown shown in the sidebar. Hover-style
 *  styling on the trigger, a small popover with role name + one-line
 *  description per option. Switching a role flips the global
 *  viewing-role state (in localStorage) which the rest of the app
 *  reacts to. */
export function RoleSwitcher({
  roles,
  currentRoleId,
  onChange,
}: {
  roles: SystemRole[];
  currentRoleId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!wrapperRef.current || !target) return;
      if (wrapperRef.current.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = roles.find((r) => r.id === currentRoleId) ?? roles[0];
  const initials = (current?.name ?? "?")
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <div ref={wrapperRef} className="relative px-4 pb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
          open
            ? "border-violet-300 bg-violet-50"
            : "border-gray-200 bg-white hover:border-violet-200 hover:bg-gray-50"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            <Eye size={9} className="mr-1 inline align-text-bottom" />
            Viewing as
          </span>
          <span className="block truncate text-sm font-semibold text-gray-900">
            {current?.name ?? "—"}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-4 right-4 top-full z-30 mt-1.5 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {roles.map((r) => {
            const active = r.id === currentRoleId;
            return (
              <button
                key={r.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(r.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left transition-colors",
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "hover:bg-gray-50"
                )}
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-violet-600">
                  {active ? <Check size={13} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-900">
                    {r.name}
                  </span>
                  {r.description && (
                    <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">
                      {r.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
