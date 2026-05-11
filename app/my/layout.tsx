"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { TakeBrand } from "@/widgets/take-shell";
import { DemoRoleFloater } from "@/widgets/demo-role-floater";

/** Candidate self-service shell — chrome-less surface used by the
 *  Candidate role. Top brand bar with two tabs (`Applications` and
 *  `Profile`), no HR sidebar. The role floater stays so the demo
 *  viewer can flip back to an HR role. */
export default function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tabs = [
    { id: "applications", label: "My Applications", href: "/my/applications" },
    { id: "profile", label: "My Profile", href: "/my/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/my/applications" className="flex items-center gap-3">
            <TakeBrand />
            <span className="hidden text-xs text-gray-400 sm:inline">
              Candidate portal
            </span>
          </Link>

          {/* Tabs */}
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.id}
                  href={t.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-violet-700"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <User size={12} /> Tran Gia Bao
            </span>
            <Link
              href="/take"
              title="Switch to test-taking flow"
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-50"
            >
              <LogOut size={12} /> Sign out
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <DemoRoleFloater />
    </div>
  );
}
