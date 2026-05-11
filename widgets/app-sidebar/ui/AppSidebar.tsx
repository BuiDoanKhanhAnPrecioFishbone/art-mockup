"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import type { SystemRole } from "@/entities/system-role";
import { useViewingRole } from "@/shared/lib/viewing-role";
import { NAV_SECTIONS, type NavItem } from "../model/navigation";
import { RoleSwitcher } from "./RoleSwitcher";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-sm"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <Icon
        size={18}
        className={cn(active ? "text-white" : "text-gray-500")}
        strokeWidth={active ? 2.25 : 2}
      />
      <span className="leading-tight">{item.label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [roles, setRoles] = useState<SystemRole[]>([]);

  useEffect(() => {
    fetch("/api/system-roles")
      .then((r) => r.json())
      .then((d) => setRoles(d.roles ?? []))
      .catch(() => setRoles([]));
  }, []);

  const { roleId, setRoleId, canSeeModule } = useViewingRole(roles);

  // Filter nav items: a section is hidden when every item in it is
  // gated out by the current role. Items without a `moduleId` (e.g.
  // Section Template) stay visible to everyone.
  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.moduleId ? canSeeModule(item.moduleId) : true
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="w-72 shrink-0 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        <Link
          href="/"
          className="flex h-16 items-center gap-2 border-b border-gray-100 px-6"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-bold text-white">
            A
          </div>
          <span className="font-semibold text-gray-900">ART</span>
        </Link>

        {/* Role switcher — only renders once /api/system-roles has
         *  loaded. Demo helper that flips the global "viewing as"
         *  state and re-filters the sidebar in real time. */}
        {roles.length > 0 ? (
          <div className="mt-4">
            <RoleSwitcher
              roles={roles}
              currentRoleId={roleId}
              onChange={setRoleId}
            />
          </div>
        ) : (
          <div className="px-4 pt-4 pb-2 text-[11px] text-gray-400">
            Loading roles…
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-4 py-3">
          <ul className="space-y-6">
            {visibleSections.map((section) => (
              <li key={section.id}>
                <p className="mb-2 px-3 text-sm font-semibold text-violet-600">
                  {section.label}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <SidebarLink
                        item={item}
                        active={isActive(pathname, item.href)}
                      />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {visibleSections.length === 0 && roles.length > 0 && (
              <li className="px-3 text-xs text-gray-400">
                The selected role has no module access. Switch role above
                to see something.
              </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
