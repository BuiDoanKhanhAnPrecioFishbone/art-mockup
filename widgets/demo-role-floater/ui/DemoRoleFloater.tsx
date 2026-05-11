"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, Eye } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { SystemRole } from "@/entities/system-role";
import { useViewingRole } from "@/shared/lib/viewing-role";

/** Bottom-right floating "view as" pill for chrome-less surfaces
 *  (the candidate test flow at `/take`). The Candidate role hides
 *  the sidebar entirely, so without this floater the demo user has
 *  no way to flip back to an HR role. Hidden in production by
 *  rendering nothing until /api/system-roles resolves. */
export function DemoRoleFloater() {
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/system-roles")
      .then((r) => r.json())
      .then((d) => setRoles(d.roles ?? []))
      .catch(() => setRoles([]));
  }, []);

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

  const { roleId, role, setRoleId } = useViewingRole(roles);
  if (roles.length === 0 || !role) return null;

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-4 right-4 z-50 w-64"
    >
      {open && (
        <div className="mb-2 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
          {roles.map((r) => {
            const active = r.id === roleId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRoleId(r.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full flex-col items-start px-3 py-2 text-left transition-colors",
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "hover:bg-gray-50"
                )}
              >
                <span className="text-sm font-semibold text-gray-900">
                  {r.name}
                </span>
                {r.description && (
                  <span className="mt-0.5 text-[11px] leading-snug text-gray-500">
                    {r.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-md hover:border-violet-300 hover:bg-violet-50"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700">
          {role.name
            .split(/\s+/)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .slice(0, 2)
            .join("")}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            <Eye size={9} className="mr-1 inline align-text-bottom" />
            Demo · Viewing as
          </span>
          <span className="block truncate text-xs font-semibold text-gray-900">
            {role.name}
          </span>
        </span>
        <ChevronUp
          size={13}
          className={cn(
            "shrink-0 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
    </div>
  );
}
