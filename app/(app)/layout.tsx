"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { AppSidebar } from "@/widgets/app-sidebar";
import type { SystemRole } from "@/entities/system-role";
import { useViewingRole } from "@/shared/lib/viewing-role";

/** App-shell layout. The Candidate role is bounced here — they only
 *  ever see the candidate test-taking flow at `/take`, never the HR
 *  back-office. The role switcher stays inline so the demo user can
 *  flip back to Admin / Manager / Recruiter / etc. */
export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [roles, setRoles] = useState<SystemRole[]>([]);

  useEffect(() => {
    fetch("/api/system-roles")
      .then((r) => r.json())
      .then((d) => setRoles(d.roles ?? []))
      .catch(() => setRoles([]));
  }, []);

  const { roleId, setRoleId } = useViewingRole(roles);

  // Until /api/system-roles resolves we don't know what role the
  // viewer is — render the shell so the page below isn't blank during
  // the first paint.
  if (roleId === "role-candidate" && roles.length > 0) {
    return (
      <CandidateGate
        roles={roles}
        currentRoleId={roleId}
        onChangeRole={setRoleId}
      />
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

/** Friendly bouncer shown when the active "view as" role is
 *  Candidate. Explains the restriction, offers a button to jump to
 *  the test-taking flow, and exposes the role switcher inline so the
 *  demo user can pick a back-office role without first navigating
 *  away. */
function CandidateGate({
  roles,
  currentRoleId,
  onChangeRole,
}: {
  roles: SystemRole[];
  currentRoleId: string;
  onChangeRole: (id: string) => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 text-violet-700">
            <Lock size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Candidate view
            </p>
            <p className="text-xs text-gray-500">
              The HR back-office is hidden for this role.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 text-sm text-gray-700">
          <p>
            Per the spec, candidates can only see their own applications,
            their own profile, and any test invites — never the HR
            back-office. Pick where to land below, or switch to an
            HR-side role to keep exploring.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link
              href="/my/applications"
              className="inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Open candidate portal →
            </Link>
            <Link
              href="/take"
              className="inline-flex items-center justify-center rounded-md border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
            >
              Take a test →
            </Link>
          </div>
        </div>

        {/* Inline role list — rendered directly (no popover) so the
         *  card's `overflow-hidden` doesn't clip it. The user can pick
         *  any back-office role without leaving this page. */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 pb-4">
          <p className="pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Switch role
          </p>
          <ul className="mt-2 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white">
            {roles.map((r) => {
              const active = r.id === currentRoleId;
              return (
                <li key={r.id} className="border-b border-gray-100 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onChangeRole(r.id)}
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
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
