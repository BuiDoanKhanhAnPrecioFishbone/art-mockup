"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { NAV_SECTIONS, type NavItem } from "../model/navigation";

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

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-6">
            {NAV_SECTIONS.map((section) => (
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
          </ul>
        </nav>
      </div>
    </aside>
  );
}
